import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { AtSearchBar } from 'taro-ui'
import QQMapWX from '../../assets/js/qqmap-wx-jssdk.min'
import { imgUrl } from '../../utils/util'
import api from '../../api/api'
import { set, get } from '../../global_data'
import './index.scss'

let qqmapsdk

export default class Index extends PureComponent {

  constructor () {
    super(...arguments)
    this.state = {
      cityVal: '',
    }
  }

  componentDidShow() { 
    //获取用户位置
    this.getUserLocation()
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX'
    })
  }

  config = {
    navigationBarTitleText: '资产通'
  }



  getUserLocation() {
    let vm = this

    Taro.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          Taro.authorize({
            scope: 'scope.userLocation',
            success: (r1) => {
              if (r1.errMsg == 'authorize:ok') {
                vm.getLocation()
              }
            },
            fail: () => {
              vm.getAreaZone()
            }
          })
        } else{
          vm.getLocation()
        }
      },
      fail: () => {
        // 服务器出现问题，跳转到无服务提示页面
        Taro.reLaunch({
          url: '../no_serve/index'
        })
        Taro.hideLoading()
      }
    })
  }

  //微信授权,获取用户位置必须要先微信授权允许
  // getUserLocation = () => {
  //   if (this.state.severErr) {
  //     this.setState({
  //       severErr: false
  //     }, () => {
  //       this.getDatas()
  //     })
  //   } else {
  //     this.getDatas()
  //   }
  // }
  // 微信获得经纬度
  getLocation () {
    let vm = this;
    Taro.getLocation({
      type: 'wgs84',
      success:  (res) => {
        var latitude = res.latitude
        var longitude = res.longitude
        vm.getLocal(latitude, longitude)
      },
      fail: function (res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  }

  //获取位置拒绝授权时，默认获取北京的地址
  getAreaZone () {
    //根据省市code获取对应城市的车位数据
    let city = {
      citys: '北京市',
      cityCode: '110100'
    }
    this.setState({
      cityVal: '北京市',
    })
    Taro.setStorageSync('city', JSON.stringify(city))

  }
  // 获取当前地理位置
  getLocal (latitude, longitude) {
    let t = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: (res) => {
        //通过省市,请求获取到省市对应的code
        let citys = res.result.ad_info.city
        if (get('City')) {
          this.setState({
            cityVal: get('City')
          })
        } else {
          t.setState({
            cityVal: citys
          })
        }

        api.areaZone({
          CityName: res.result.ad_info.city,
          ProvinceName: res.result.ad_info.province,
          existLoading: true
        }).then(res1 => {
          if (res1 && res1.data.code === 200) {
            //根据省市code获取对应城市的车位数据
            let city = {
              citys,
              cityCode: res1.data.data[0].AreaCode
            }
            Taro.setStorageSync('city', JSON.stringify(city))


          }
        })

      }
    });
  }

  goMore(type) {
    this.$preload({
      ParkingLot: type,
      page: 'aw'
    })
    Taro.navigateTo({ 
      url: `../parkingIndex/index`
    })
  }

  //页面跳转
  goPage (type,id) {
    if (type === 'car_detail') {  //用来标识下,车位详情是从首页跳转过去的
      set('page','home')
    }
    this.$preload({
      id,
      page: 'aw'
    })
    Taro.navigateTo({ 
      url: `../${type}/index`
    })
  }
  goPage1 () {
    this.$preload({
      ParkingLot: null,
      page: 'al'
    })
    Taro.navigateTo({ 
      url: `../parkingIndex/index`
    })
  }
  //跳转到分包
  goBranchPage (type) {
    Taro.navigateTo({ 
      url: `../${type}/pages/home/index`
    })
  }




  render () {

    return (
      <View class='base_font container'>

        {/* <View className='goComm' onClick={this.goPage.bind(this,'community')}> */}
        <View className='goComm' onClick={this.goPage1.bind(this)}>
          <AtSearchBar
            placeholder='搜索'
            disabled
          />

        </View>

        {/* 头部图片 */}
        <View class='title_img'>
          <Image mode='widthFix' src={`${imgUrl}banner.png`}></Image>
        </View>
        <View class='box_top'>
          
          {/* 导航栏  */}
          <View class='nav'>
            {/* <View onClick={this.goBranchPage.bind(this,'issue')}>
              <View>
                <Image mode='widthFix' src={`${imgUrl}/release.png`}></Image>
              </View>
              <View>信息发布</View>
            </View> */}
            <View onClick={this.goPage.bind(this,'community')}>
              <View>
                <Image mode='widthFix' src={`${imgUrl}house.png`}></Image>
              </View>
              <View>仓储</View>
            </View>
            <View onClick={this.goBranchPage.bind(this,'map')}>
              <View>
                <Image mode='widthFix' src={`${imgUrl}map.png`}></Image>
              </View>
              <View>地图</View>
            </View>
          </View>
        </View>
        <View className='home_bottom clear'>
          <View className='car_voucher' onClick={this.goMore.bind(this, 0)}>
            <Image mode='widthFix' src={`${imgUrl}pic_pzcard_bg.png`}></Image>
            <View className='posiHome'>
              <View className='home_btm_textT'>区块链</View>
              <View className='home_btm_textB'>资产通凭证</View>
            </View>
            
          </View>
          <View className='car_warrant' onClick={this.goMore.bind(this, 1)}>
            <Image mode='widthFix' src={`${imgUrl}pic_qzcard_bg.png`}></Image>
            <View className='posiHome'>
              <View className='home_btm_textT'>区块链</View>
              <View className='home_btm_textB'>资产通权证</View>
            </View>
            
          </View>
        </View>
            
        
      </View>
    )
  }
}
