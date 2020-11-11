import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Header from '../../components/header/header'
import { imgUrl } from '../../utils/util'
import { get } from '../../global_data'
// import api from '../../api/api'
import './index.scss'

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      inPage: '',
      navType: 'home',
      msg: ''
    }
  }

  goPage (type) {
    if (type === 'myCarports') {
      Taro.switchTab({
        url: '../myCarports/index'
      })
    } else if (type === 'myOrder') {
      Taro.reLaunch({
        url: '../myOrder/index'
      })
    } else if (type === 'order_detail') {
      this.$preload({
        orderId: this.$router.preload.orderId
      })
      Taro.reLaunch({
        url: '../order_detail/index'
      })
    } else if (type === 'myLoan') {
      this.$preload({
        pages: 'circle',
        current: this.state.msg.includes('还清') ? 1 : 0
      })
      Taro.navigateTo({
        url: '../myLoan/index'
      })
    }else if (type === 'myCarport') {
      this.$preload({
        ParkingType: 2
      })
      Taro.reLaunch({
        url: '../myCarport/index'
      })
    }
  }


  componentWillMount () { 
    this.setState({
      inPage: this.$router.preload.inPage,
      msg: this.$router.preload.msg
    })
  }


  render () {
    const { inPage, navType, msg } = this.state
    const titleHeight = get('titleHeight')
    return (
      <View className='boxs'>
        <Header onNavType={navType} />

        <View className='pay_success' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View>
            <Image src={`${imgUrl}complete.png`} />
          </View>
          {/* 全额支付支付成功,跳回我的车位 */}
          {
            inPage === 'myCarport' && (
              <View>
                <View>购买成功</View>
                <View>您已成功购买区块链车位通{get('usufruct')}，可前往“我的资产”中查看。</View>
                <View>
                  <AtButton 
                    onClick={this.goPage.bind(this,'myCarports')}
                    type='secondary'
                  >我的总资产</AtButton>
                </View>
              </View>
            )
          }


          {/* 定金支付支付成功,调回到我的订单 */}
          {
            inPage === 'myOrder' && (
              <View>
                <View>定金支付成功</View>
                <View>车位已锁定，请尽快完成尾款支付，超过订单时间7日后，订单将过期失效，已付定金不予退还。</View>
                <View>
                  <AtButton 
                    onClick={this.goPage.bind(this,'myOrder')}
                    type='secondary'
                  >我的购买申请</AtButton>
                </View>
              </View>
            )
          }

          {/* 贷款付款，预付定金 */}
          {
            inPage === 'loan_bond' && (
              <View>
                <View>定金支付成功</View>
                <View style={{fontSize:'30rpx',color:'#808080'}}>
                  车位已锁定，个人征信及贷款额度正在审核中，请耐心等待。点击 
                  <Text style={{color:'#5584FF'}} onClick={this.goPage.bind(this,'order_detail')}>订单详情</Text> 可查看审核结果。
                </View>
              </View>
            )
          }
          {/* 贷款付款，不付定金 */}
          {/* <View>
            <View>订单提交成功</View>
            <View style={{fontSize:'30rpx',color:'#808080'}}>个人征信及贷款额度正在审核中，请耐心等待。点击 <Text style={{color:'#5584FF'}} onClick={this.goPage.bind(this,'order_detail')}>订单详情</Text> 可查看审核结果。</View> 
          </View> */}
          {
            inPage === 'loan_all' && (
              <View>
                <View>贷款申请已提交</View>
                <View>您的贷款申请正在审批中，审批时间约为30分钟，审批结果将以短信形式通知，可前往“购买中资产”完成后续操作。</View> 
                <View>
                  <AtButton 
                    onClick={this.goPage.bind(this,'myOrder')}
                    type='secondary'
                  >我的购买申请</AtButton>
                </View>
                <View className='lc'>
                  <Image src={`${imgUrl}pic_flow@2x.png`} />
                </View>
              </View>
            )
          }
          {/* 贷款付款，首付 */}
          {
            inPage === 'first_pay' && (
              <View>
                <View>支付成功</View>
                <View style={{textAlign: 'center'}}>首付款支付成功，请等待银行放款</View> 
                <View>
                  <AtButton 
                    onClick={this.goPage.bind(this,'myOrder')}
                    type='secondary'
                  >我的购买申请</AtButton>
                </View>
              </View>
            )
          }

          {/* 申请回购 */}
          {
            inPage === 'buy_back' && (
              <View>
                <View>回购申请已提交</View>
                <View>{ msg }</View>
                <View>
                  <AtButton 
                    onClick={this.goPage.bind(this,'myCarport')}
                    type='secondary'
                  >我的资产</AtButton>
                </View>
              </View>
            )
          }

          {/* 还款 */}
          {
            inPage === 'myLoan' && (
              <View>
                <View>{ msg }</View>
                <View style={{textAlign: 'center'}}>
                  {
                    msg.includes('还清') ? '您可前往“我的贷款-已还款”中查看' : '您可前往“我的贷款-未还款”中查看'
                  }
                </View>
                <View>
                  <AtButton 
                    onClick={this.goPage.bind(this,'myLoan')}
                    type='secondary'
                  >我的贷款</AtButton>
                </View>
              </View>
            )
          }

        </View>
      </View>
    )
  }
}
