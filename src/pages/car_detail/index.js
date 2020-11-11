import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { AtActionSheet, AtActionSheetItem, AtButton, AtModal } from "taro-ui"
import Header from '../../components/header/header'
import { imgUrl } from '../../utils/util'
import { set, get, toast } from '../../global_data'
import api from '../../api/api'
import CarInfo from '../../components/car_detail/index'
import './index.scss'


// 车位详情,包括未购买、已购买、挂牌详情,集一个里面

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      page: '', //用来判断是从哪个页面跳转进来的
      datas: {},
      title: '详情',
      num: 1,
      navType: 'backHome',
      id: '',
      isOpened: false,
      isOpened1: false,
    }
  }

  //页面跳转
  goPage (type) {
    //生成订单
    api.createOrder({
      LoginMark: Taro.getStorageSync('uuid')?Taro.getStorageSync('uuid'):'',
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      data: JSON.stringify({
        ParkingId: this.$router.preload.id,
        PayType: type === 'loan_buy' ? 2 : 1   //1表示全额付款,2表示贷款付款
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.$preload({
          datas: res.data.data,
          Price: res.data.data.SalePrice,
          type
        })
        // 用来知道购买的是权证车位还是凭证车位，在购买成功页面需要用到
        set('usufruct', res.data.data.BuyBackModel.Usufruct == 0 ? '凭证' : '权证')

        Taro.navigateTo({
          url: `../full_buy/index`
        })
      }
    })

  }

  getData () {
    api.parkingDetail({
      LoginMark: Taro.getStorageSync('uuid') ? Taro.getStorageSync('uuid') : '',
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      ParkingId: this.$router.preload.id
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data,
          page: this.$router.preload.page,
          id: this.$router.preload.id
        })
      }
    })
  }

  // 加入或移除购物车
  shpoppingCar(val) {

    // 判断用户对否登陆
    if (!Taro.getStorageSync('userInfo')) {
      Taro.redirectTo({
        url: `../login_hint/index?param=myCarport`
      })
    } else {
      api.collectionEvent({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        ParkingId: this.state.datas.ParkingId,
        EventCode: val
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info, 'success', 1500)

          setTimeout(() => {
            this.getData()
          }, 1500)
        }
      })
    }


  }

  componentWillMount () {

    this.getData()
  }
  
  render () {
    const { page, title, datas, id, navType, num, isOpened, isOpened1 } = this.state
    const titleHeight = get('titleHeight')

    return (
      <View className='containers'>
        <View>
          <Header onNum={num} onTitle={title} onNavType={navType} />
          <View className='aw_car_detail'
            style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
          >
            <CarInfo
              onDatas={datas}
              onPage={page}
              onId={id}
            />
          </View>
        </View>

        {
          (page === 'aw') && datas.IfBtn && (
            <View className='footer2'>
              <View onClick={this.shpoppingCar.bind(this, datas.IsCollection)}>
                <View><Image src={`${imgUrl}icon_shopping.png`} /></View>
                {
                  datas.IsCollection == 0 ? <View>加入购物车</View> : <View>移除购物车</View>
                }
              </View>

              <View>
                <AtButton
                  type='primary'
                  onClick={() => this.setState({isOpened1: true})}
                >立即购买</AtButton>
              </View>

            </View>
          )
        }

        <AtActionSheet 
          cancelText='取消' 
          isOpened={isOpened1}
          onClose={() => this.setState({isOpened1: false})}
        >
          <AtActionSheetItem onClick={this.goPage.bind(this,'loan_buy')}>
            申请贷款支付
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.goPage.bind(this,'full_buy')}>
            一次性支付
          </AtActionSheetItem>
        </AtActionSheet>

        <AtModal
          isOpened={isOpened}
          confirmText='确定'
          onConfirm={() => this.setState({isOpened: false})}
          onClose={() => this.setState({isOpened: false})}
          content='很抱歉，您的征信审核不通过，无法进行贷款购买，请全额购买'
        />

      </View>

    )
  }
}
