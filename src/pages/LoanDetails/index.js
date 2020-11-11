import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import Header from '../../components/header/header'
import { splitThousand, accAdd , throttle } from '../../utils/util'
import { toast, get } from '../../global_data'
import api from '../../api/api'
import './index.scss'

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      navType: 'backHome',
      num: 1,
      title: '贷款详情',
      account: '',    // 还款金额
      TotalAmt: '',   // 账户余额
      datas: {}
    }

    this.repay = throttle(this.repay1)
  }

  handleChange(e) {
    this.setState({
      account: e
    })
  }

  regx() {
    const { account, datas } = this.state

    if(account == '') {
      toast('请输入还款金额', 'none', 2000)
      return false
    }else if (+account <= 0) {
      toast('还款金额需大于0', 'none', 2000)
      return false
    } else if(+account > accAdd(accAdd(datas.leaveLoanAmt, datas.allInterst), datas.partInterst)) {
      toast('还款金额需小于未还本金', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  // 立即还款
  repay1 = () => {
    const { account, datas } = this.state

    if (this.regx()) {
      api.repayLoan({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        busiPltf: datas.busiPltf,
        iouId: datas.iouId,
        Principal: account
      }).then(res => {
        if (res.data.code === 200) {
          this.$preload({
            inPage: 'myLoan',
            msg: res.data.info
          })
          Taro.navigateTo({
            url: '../pay_success/index',
          })
        }
      })
    }

  }

  componentWillMount () { 
    api.accountAmt({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          TotalAmt: res.data.data.TotalAmt,
          datas: this.$router.preload.datas
        })
      }
    })
  }

  render () {
    const { navType, num, title, datas, TotalAmt, account } = this.state
    const titleHeight = get('titleHeight')
    return (
      <View className='loanDetails'>
        <Header onNum={num} onNavType={navType} onTitle={title} />

          <View 
            className='loanWrap' 
            style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
          >
            <View className='loan'>
              <View className='loanTitle'>贷款编号：{ datas.iouId }</View>
              <View className='loanPrice marginbtm30'>未还本金<Text style={{fontSize: '20rpx'}}> (元)</Text>：
                <Text className='loanRedPrice'>{ datas.leaveLoanAmt ? splitThousand(datas.leaveLoanAmt) : 0 }</Text>
              </View>
              <View className='loanPrice marginbtm30'>应还利息<Text style={{fontSize: '20rpx'}}> (元)</Text>：
                <Text className='loanRedPrice'>{ datas.allInterst ? splitThousand(datas.allInterst) : 0 }</Text>
              </View>
              <View className='loanPrice marginbtm30'>应还欠息<Text style={{fontSize: '20rpx'}}> (元)</Text>：
                <Text className='loanRedPrice'>{ datas.partInterst ? splitThousand(datas.partInterst) : 0 }</Text>
              </View>
              <View className='loanNewPrice marginbtm30'>贷款金额<Text style={{fontSize: '20rpx'}}> (元)</Text>：
                <Text className='fontcolor80'>{ datas.loanAmt ? splitThousand(datas.loanAmt) : 0 }</Text></View>
              <View className='loanNewPrice marginbtm30'>首付金额<Text style={{fontSize: '20rpx'}}> (元)</Text>：
                <Text className='fontcolor80'>{ datas.DownPayMent ? splitThousand(datas.DownPayMent) : 0 }</Text>
              </View>
              <View className='loanuserPrice marginbtm30'>账户余额<Text style={{fontSize: '20rpx'}}> (元)</Text>：
                <Text className='fontcolor80'>{ TotalAmt ? splitThousand(TotalAmt) : 0 }</Text>
              </View>
              <View className='clear'>
                <View className='loanrate left'>
                  <View className='loanrate_1 marginbtm30'>首付款比例<Text style={{fontSize: '20rpx'}}> (%)</Text>：
                    <Text className='fontcolor80'>{ JSON.stringify(datas)!=='{}'&&Number(datas.firstRate).toFixed(2) }</Text>
                  </View>
                  <View className='loandate_2'>贷款到期日：<Text className='fontcolor80'>{ datas.loanDateEnd }</Text></View>
                </View>
                <View className='loandate right'>
                  <View className='loandate_1 marginbtm30'>贷款利率<Text style={{fontSize: '20rpx'}}> (%)</Text>：
                    <Text className='fontcolor80'>{ JSON.stringify(datas)!=='{}'&&Number(datas.loanRate).toFixed(2) }</Text>
                  </View>
                  <View className='loanrate_2'>贷款期限：<Text className='fontcolor80'>{ datas.loanTerm }个月</Text></View>
                  
                </View>
              </View>
            </View>
            <View className='loanInput'>
              <AtInput title='还款金额' type='digit'
                className='bot_line'
                placeholder={`还款金额${accAdd(accAdd(datas.leaveLoanAmt, datas.allInterst), datas.partInterst)}`}
                placeholderStyle='color:#D6D6D6;'
                value={account}
                onChange={this.handleChange.bind(this)}
              />
              <View className='inputLabelRight'>（元）</View>
              <View 
                onClick={
                  () => this.setState({
                    account: accAdd(accAdd(datas.leaveLoanAmt, datas.allInterst), datas.partInterst)
                  })
                } 
                className='allBtn'
              >全部</View>
            </View>
            <View className='nowLoanFooter'>
            <AtButton 
              type='primary' 
              className='loanBtn'
              onClick={this.repay}
            >立即还款</AtButton>
            </View>
          </View>

      
      </View>
    )
  }
}
