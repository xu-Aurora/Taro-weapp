import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtModal } from 'taro-ui'
import { imgUrl } from '../../utils/util'
import api from '../../api/api'
import { toast } from '../../global_data'
import QQMapWX from '../../assets/js/qqmap-wx-jssdk.min'
import './index.scss'


let qqmapsdk = new QQMapWX({
  key: 'L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX'
})

export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '我的购物车'
  }

  constructor () {
    super(...arguments)
    this.state = {
      datas: [],
      isOpened: false,
      ParkingId: ''
    }
  }


  getDatas() {
    api.myCollection({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data.rows,
          isOpened: false
        })
      }
    })
  }


  goDetail(id) {
    this.$preload({
      id,
      page: 'aw'
    })
    Taro.navigateTo({
      url: '../car_detail/index'
    })
  }

  tips = () => {
    toast('车位已摘牌', 'none', 2000)
  }

  // 点击地址跳转到地图页面
  goNavigation (city,e) {
    e.stopPropagation()
    qqmapsdk.geocoder({
      address: city,
      success: function(res) {
        let latitude = res.result.location.lat
        let longitude = res.result.location.lng
        Taro.openLocation({
          latitude,
          longitude,
          name:city,
          scale: 18
        })
      }
    })
  }

  showModal(ParkingId) {
    this.setState({
      isOpened: true,
      ParkingId
    })
  }

  // 移除购物车
  handleConfirm = () => {
    api.collectionEvent({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      ParkingId: this.state.ParkingId,
      EventCode: 1   // 移除购物车
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',2000).then(() => {
          this.getDatas()
        })
      }else{
        toast(res.data.info,'none',2000)
      }
    })
  } 

  componentDidShow () { 

    this.getDatas()
  }

  render () {
    const { datas, isOpened } = this.state

    return (
      <View className='shoppingCar'>
        {
          datas && datas.map(ele => {
            return (
              <View 
                className='item' 
                key={ele.ParkingCode}
                onClick={ele.CollectionMark == 0 ? 
                this.showModal.bind(this, ele.ParkingId) : 
                this.goDetail.bind(this, ele.ParkingId)}
              >
                <View className='left'>
                  {
                    ele.BuyBack.Usufruct == 0 ? 
                    <View style={{color: '#FC7946'}}>
                      <View>
                        <Text>{ ele.BuyBack.FixedRate&&ele.BuyBack.FixedRate.toFixed(2) }</Text>
                        <Text>%</Text>
                      </View>
                      <View>年化收益率</View>
                      {
                        ele.CollectionMark == 0 && <View className='zp'>已摘牌</View>
                      }
                    </View> : 
                    <View style={{color: '#5584FF'}}>
                      <View>
                        <Text>{ ((ele.SalePrice)/10000).toFixed(2) }</Text>
                        <Text> 万</Text>
                      </View>
                      <View>挂牌价<Text style={{fontSize: '20rpx'}}> (元)</Text></View>
                      {
                        ele.CollectionMark == 0 && <View className='zp'>已摘牌</View>
                      }
                    </View>
                  }
                </View>
                <View className='right'>
                  <View className='overflow1'>
                  {
                    ele.BuyBack.Usufruct == 0 ? 
                    <Text>{ `凭证编号${ele.ParkingId.toUpperCase()}` }</Text> : 
                    <Text>车位号{ ele.ParkingCode }</Text>
                  }
                  </View>
                  <View>所属商圈：{ ele.CircleName }</View>
                  <View>小区：{ ele.BuildingName }</View>
                  <View className='address'>
                    <Text className='overflow2'>地址：{ ele.Address }</Text>
                    <View>
                      <Image onClick={this.goNavigation.bind(this,ele.Address)} src={`${imgUrl}icon_map_l.png`} />
                    </View>
                  </View>
                  {
                    ele.BuyBack.Usufruct == 0 ? 
                    <View>面额：{ (ele.Price/10000 ).toFixed(2) }<Text style={{fontSize: '18rpx'}}> (万元)</Text></View> :
                    <View>类型：{ ele.ParkingTypeName }</View>
                  }
                </View>
              
                {/* 遮罩层 */}
                <View className='mask' style={{display: ele.CollectionMark == 0 ? 'block' : 'none'}}></View>
              </View>
            )
          })
        }
        {
          datas === null && (
            <View className='nodata'>
              <View>
                <Image src={`${imgUrl}order_nodata.png`} />
                <View>暂无数据</View>
              </View>
            </View>
          )
        }

        <AtModal
          isOpened={isOpened}
          title='移出购物车'
          cancelText='取消'
          confirmText='移出购物车'
          onCancel={() => this.setState({isOpened: false})}
          onClose={() => this.setState({isOpened: false})}
          onConfirm={this.handleConfirm}
          content='车位已摘牌，是否移出购物车？'
        />


      </View>
    )
  }
}
