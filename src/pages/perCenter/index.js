import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtAvatar, AtIcon, AtList, AtListItem, AtToast } from 'taro-ui'
import { imgUrl } from '../../utils/util'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {
  config = {
    navigationBarTitleText: '个人中心'
  }
  constructor () {
    super(...arguments)
    this.state = {
      accountDatas: {}, //账户信息数据
      isOpened: false,
      text: '',
      // repayTotals: '',
      userInfoData: ''
    }
    Taro.eventCenter.on('getAccountAmt',this.accountAmt.bind(this))
  }
  auxiliary (text) {
    this.setState({
      text: `"${text}"`,
      isOpened: true
    })
  }
  goPage (type) {
    Taro.navigateTo({
      url: `../${type}/index`
    });
  }
  //跳转到我的订单和待处理订单
  goMyorder (val) {
    this.$preload({
      current: val
    })
    Taro.navigateTo({
      url: `../myOrder/index`
    });
  }
  //账户信息数据
  accountAmt () {
    api.accountAmt({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          accountDatas: res.data.data
        })
      }
    })
  }


  componentDidShow () {
    this.setState({
      isOpened: false,
      userInfoData: Taro.getStorageSync('userInfoData')&&JSON.parse(Taro.getStorageSync('userInfoData'))
    })
    if (!Taro.getStorageSync('userInfo')) {
      Taro.redirectTo({
        url: `../login_hint/index?param=perCenter`
      })
    } else {
      this.accountAmt()
    }
  }
  render () {
    const { accountDatas, userInfoData } = this.state
    const head_default = `${imgUrl}head.png`

    return (
      <View className='perCenter'>
        <View className='avatar' onClick={this.goPage.bind(this,'perInfo')}>
          <View>
            <AtAvatar 
              size='small' 
              circle 
              image={userInfoData.HeadIcon ? userInfoData.HeadIcon : head_default}
            ></AtAvatar>
            <Text>{ userInfoData.RealName }</Text>
          </View>
          <AtIcon value='chevron-right' color='#B2B2B2'></AtIcon>
        </View>

        <View>
          <AtList>
            <View className='order'>
              <AtListItem title='我的购买申请'
                className='bot_line'
                onClick={this.goMyorder.bind(this, 1)} extraText='查看全部'
              />
            </View>
            <View className='deal'>
              <AtListItem title='购买中资产'
                onClick={this.goMyorder.bind(this, 0)}
                extraText={accountDatas.toDeal?String(accountDatas.toDeal):'0'} arrow='right'
              />
            </View>
          </AtList>
        </View>
        
        <AtList>
          <AtListItem
            onClick={() => {
              Taro.navigateTo({ url: '../shoppingCar/index' })
            }}
            title='我的购物车' arrow='right' className='bot_line'
          />
          {/* <AtListItem
            onClick={() => {
              Taro.navigateTo({
                url: '../issue/pages/myRelease/index'
              })
            }}
            title='我的发布'
            arrow='right'
          /> */}

        </AtList>
        
        <AtList>
          <AtListItem
            onClick={this.goPage.bind(this,'bank_card')}
            title='银行卡'
            arrow='right'
          />
        </AtList>
        
        <AtList>
          <AtListItem
            onClick={this.auxiliary.bind(this,'客服中心')}
            title='客服中心' arrow='right'
          />
          {/* <AtListItem
            className='bot_line'
            onClick={this.auxiliary.bind(this,'关于我们')}
            title='关于我们' arrow='right'
          />
          <AtListItem onClick={this.auxiliary.bind(this,'设置')} title='设置' arrow='right' /> */}
        </AtList>

        <AtToast
          isOpened={this.state.isOpened}
          text={`${this.state.text}功能暂未开通`}
          duration={1500}
        ></AtToast>
      </View>
    )
  }
}
