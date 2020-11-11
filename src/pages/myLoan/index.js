import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtButton } from 'taro-ui'
import { get } from '../../global_data'
import Header from '../../components/header/header'
import { imgUrl, splitThousand } from '../../utils/util'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      title: '我的贷款',
      navType: 'backHome',
      num: 'myLoan',
      display1: 'none',
      display2: 'none',
      current: 0,
      financeDataList: null,   // 未还款
      Paylist: null,           // 已还款   
    }
  }

  //跳转到车位详情
  goPage (datas) {
    this.$preload({
      datas
    })
    Taro.navigateTo({
      url: '../LoanDetails/index'
    })
  }

  tenThousand(val){
    val = (val / 10000).toFixed(2)
    return val
  }

  // tab切换
  handleClick (value) {
    this.setState({
      current: value,
    })
  }

  getDatas(params) {
    api.personalLoan({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      CircleId: params
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          financeDataList: res.data.data.financeDataList,
          Paylist: res.data.data.Paylist,
          num: this.$router.preload.pages === 'circle' ? 'circle' : 'myLoan',
        })
      }else {
        this.setState({
          num: this.$router.preload.pages === 'circle' ? 'circle' : 'myLoan',
        })
      }
    })
  }
  

  // 获取列表数据
  getData (params = '') {
    this.getDatas(params)
  }

  componentWillMount () { 

    if (this.$router.preload) {
      if (this.$router.preload.current === undefined) {
        this.getData(this.$router.preload.CircleId)
      } else {
        this.setState({
          current: this.$router.preload.current
        })
        this.getData()
      }
    } else {
      this.getData()
    }
    
  }

  render () {
    const { current, financeDataList, Paylist, display1, display2, num, title, navType } = this.state
    const tabList = [{ title: '未还款' }, { title: '已还款' }]
    const surHeight = get('titleHeight1') + 190
    const titleHeight = get('titleHeight')

    return (
      <View className='myLoan'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}>
          <AtTabs current={current} tabList={tabList} onClick={this.handleClick.bind(this)}>
            <AtTabsPane current={current} index={0}>
              <ScrollView
                className='scrollview'
                scrollY
                scrollWithAnimation
                scrollTop={0}
                style={{height: `calc(100vh - ${surHeight}rpx)`}}
                lowerThreshold={50}
                onScrollToLower={() => this.setState({display1: 'flex'})}
              >
                {
                  (JSON.stringify(financeDataList) !== '[]') && financeDataList !== null &&  financeDataList.map(ele => {
                    return (
                      <View className='car_list' key={ele.iouId}>
                        <View className='item'>
                          <View>贷款编号：{ ele.iouId }</View>
                          <View>
                            <Text>未还本金<Text style={{fontSize: '20rpx'}}> (元)</Text>：</Text>
                            <Text style={{color: '#F6724A'}}>{ splitThousand(ele.leaveLoanAmt ? ele.leaveLoanAmt : 0) }</Text>
                          </View>
                          <View>贷款金额<Text style={{fontSize: '20rpx'}}> (元)</Text>：{ splitThousand(ele.loanAmt ? ele.loanAmt : 0) }</View>
                          <View>首付款金额<Text style={{fontSize: '20rpx'}}> (元)</Text>：{ splitThousand(ele.DownPayMent ? ele.DownPayMent : 0) }</View>
                          <View>
                            <View>贷款利率<Text style={{fontSize: '20rpx'}}> (%)</Text>：{ (+ele.loanRate).toFixed(2) }</View>
                            <View>首付款比例<Text style={{fontSize: '20rpx'}}> (%)</Text>：{ (+ele.firstRate).toFixed(2) }</View>
                          </View>
                          <View>贷款到期日：{ ele.loanDateEnd ? ele.loanDateEnd : '暂无' }</View>
                        </View>
                        <View className='btn1'>
                          <View>
                            <AtButton onClick={this.goPage.bind(this, ele)} type='primary' size='small'>立即还款</AtButton>
                          </View>
                        </View>
                      </View>
                    )
                  })  
                }
                {
                  (JSON.stringify(financeDataList) == '[]') && (
                    <View className='nodata'>
                      <View>
                        <Image src={`${imgUrl}order_nodata.png`} />
                        <View>暂无数据</View>
                      </View>
                    </View>
                  )
                }

                <View className='footer1' style={{display: display1}}>
                  <View>
                    <View className='line'></View>
                    <View className='text'>已经到底啦</View>
                    <View className='line'></View>
                  </View>
                </View>
              </ScrollView>


            </AtTabsPane>
            <AtTabsPane current={current} index={1}>
              <ScrollView
                className='scrollview'
                scrollY
                scrollWithAnimation
                scrollTop={0}
                style={{height: `calc(100vh - ${surHeight}rpx)`}}
                lowerThreshold={50}
                onScrollToLower={() => this.setState({display2: 'flex'})}
              >
              {
                  (JSON.stringify(Paylist) !== '[]') && Paylist !== null && Paylist.map(ele => {
                    return (
                      <View className='car_list' key={ele.iouId}>
                        <View className='item'>
                          <View>贷款编号：{ ele.iouId }</View>
                          <View>
                            <Text>未还本金<Text style={{fontSize: '20rpx'}}> (元)</Text>：</Text>
                            <Text style={{color: '#F6724A'}}>{ splitThousand(ele.leaveLoanAmt ? ele.leaveLoanAmt : 0) }</Text>
                          </View>
                          <View>贷款金额<Text style={{fontSize: '20rpx'}}> (元)</Text>：{ splitThousand(ele.loanAmt ? ele.loanAmt : 0) }</View>
                          <View>首付款金额<Text style={{fontSize: '20rpx'}}> (元)</Text>：{ splitThousand(ele.DownPayMent ? ele.DownPayMent : 0) }</View>
                          <View>
                            <View>贷款利率<Text style={{fontSize: '20rpx'}}> (%)</Text>：{ ele.loanRate }</View>
                            <View>首付款比例<Text style={{fontSize: '20rpx'}}> (%)</Text>：{ ele.firstRate }</View>
                          </View>
                          <View>贷款到期日：{ ele.loanDateEnd }</View>
                        </View>
                      </View>
                    )
                  })  
                }

                {
                  (JSON.stringify(Paylist) == '[]') && (
                    <View className='nodata'>
                      <View>
                        <Image src={`${imgUrl}order_nodata.png`} />
                        <View>暂无数据</View>
                      </View>
                    </View>
                  )
                }
                <View className='footer1' style={{display: display2}}>
                  <View>
                    <View className='line'></View>
                    <View className='text'>已经到底啦</View>
                    <View className='line'></View>
                  </View>
                </View>

              </ScrollView>


            </AtTabsPane>
          </AtTabs>
        </View>

      </View>
    )
  }
}
