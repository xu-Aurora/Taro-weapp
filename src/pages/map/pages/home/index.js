import Taro, { PureComponent } from '@tarojs/taro'
import { View, Map, Picker, Text } from '@tarojs/components'
import { AtSearchBar, AtIcon, AtButton } from 'taro-ui'
import { splitThousand } from '../../../../utils/util'
import QQMapWX from '../../../../assets/js/qqmap-wx-jssdk.min'
import { toast, get, set } from '../../../../global_data'
import './index.scss'
import api from '../../../../api/api'


let qqmapsdk = new QQMapWX({
  key: 'L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX'
})
let MapContext

let sysinfo = Taro.getSystemInfoSync()
let isiOS = sysinfo.system.indexOf('iOS') > -1

export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '地图'
  }

  constructor () {
    super(...arguments)
    this.state = {
      latitude: '',
      longitude: '',
      markers: [],
      scale: 12,
      iconCity: 'chevron-down',
      city: [],       
      cityCode: '',
      province: [],   
      cityVal: '',    
      selCity: [],
      // buildingNames: [],
      multiIndex:[0,0],
      seatchVal: '',
      flag: false,
      btn: false,
      map: false
    }
  }

  //省市选择
  picker (e) {
    let arr = this.state.multiIndex
    arr[0] = e.detail.value[0]
    arr[1] = e.detail.value[1]
    set('City',this.state.province[1][arr[1]])
    this.setState({
      cityVal: this.state.province[1][arr[1]],
      iconCity: 'chevron-down'
    })
    if (this.state.flag) {
      this.state.selCity.forEach(ele => {
        if (ele.AreaName === this.state.province[1][arr[1]]) {
          this.geocoder(this.state.province[1][arr[1]])
          this.setState({
            cityCode: ele.AreaCode,
            seatchVal: ''
          })
          set('CityCode',ele.AreaCode)
          this.areaCount(ele.AreaCode)
        }
      })
    }else{
      this.geocoder(this.state.province[1][arr[1]])
      set('CityCode','110100')
      this.setState({
        cityCode: '110100'
      })
      this.areaCount('110100')
    }
  }
  columnchange (e) {
    switch (e.detail.column){
      case 0:
        let city = []
        this.state.city[e.detail.value].forEach(ele => {
          city.push(ele.AreaName)
        })
        let data = this.state.province
        let arr = this.state.multiIndex
        data[1] = city
        arr[0] = e.detail.value
        arr[1] = 0
        this.setState({
          province: data,
          multiIndex: arr,
          flag: true,
          selCity: this.state.city[e.detail.value]
        })
    }
  }
  //search的change事件
  searchChange (value) {
    this.setState({
      seatchVal: value,
    })
  }
  //点击搜索
  onActionClick () {
    if (this.state.seatchVal === '') {
      
    }else{
      let params = {
        LoginMark: this.state.uuid ? this.state.uuid : '',
        Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token : '',
        CityCode: this.state.cityCode,
        KeyWord: this.state.seatchVal
      }
      this.getBuildings(params,13)
    }
  }
  //获取省市数据
  getAreaZone () {
    api.areaZone().then(res => {
      if (res.data.code === 200) {
        let province = []
        let city = []
        res.data.data.forEach(ele => {
          province.push(ele.AreaName)
          city.push(ele.SubsetList)
        })
        this.setState({
          province: [province,['北京']],
          city
        })
      }
    })
  }


  cityCodes (cityCode) {
    let code
    if (cityCode) {
      if (cityCode == '110100') {
        code = '110000'
      }else if (cityCode == '310100') {
        code = '310000'
      }else if (cityCode == '120100') {
        code = '120000'
      }else if (cityCode == '500100') {
        code = '500000'
      }else{
        code = cityCode
      }
    }else{
      code = get('CityCode') ? get('CityCode') : JSON.parse(this.state.citys).cityCode
    }
    return code
  }

  //获取市下面所有的区与车位数量
  areaCount (cityCode) {
    let t = this
    // Taro.showLoading({ title: 'loading...', mask: true })
    api.areaCount({
      LoginMark: this.state.uuid ? this.state.uuid : '',
      Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token : '',
      // CityCode: get('CityCode') ? get('CityCode') : JSON.parse(this.state.citys).cityCode
      CityCode: cityCode
    }).then(res => {
      if (res.data.code === 200) {
        // Taro.hideLoading()
        let data = res.data.data
        //获取腾讯地图的区
        qqmapsdk.getDistrictByCityId({
          id: t.cityCodes(cityCode),
          success: function(res1) {
            data.forEach(ele => {
              res1.result[0].forEach(item => {
                if (ele.AreaCode === item.id) {
                  item.count = ele.Count
                }
              })
            })
            let markers = []
            res1.result[0].forEach(ele => {
              markers.push({
                id: ele.id,
                latitude: ele.location.lat,
                longitude: ele.location.lng,
                alpha: isiOS ? 0 : 1,
                callout: {
                  // content: `${ele.fullname} \n ${ele.count}个车位`,
                  content: `${ele.fullname.substr(0, ele.fullname.length - 1)} \n ${ele.count}个`,
                  padding: 10,
                  display: 'ALWAYS',
                  bgColor: '#5584ff',
                  color: '#ffffff',
                  textAlign: 'center',
                  borderRadius: 4
                }
              })
            })
            t.setState({
              markers,
              areaMarkers: markers,
              scale: 12
            })
          },
          fail: function(error) {
            console.error(error);
          },
        })
      }
    })
  }
  // 微信获得经纬度
  getLocation () {
    let t = this;
    if (get('City')) {    // 在小区中切换了城市地址
      this.geocoder(get('City'))
    } else {             // 未切换地址
      Taro.getLocation({
        type: 'wgs84',
        success: function (res) {
          var latitude = res.latitude
          var longitude = res.longitude
          t.setState({
            latitude,
            longitude
          })
          t.getLocal(latitude, longitude)
        },
        fail: function (res) {
          console.log('fail' + JSON.stringify(res))
        }
      })
    }

  }
  //经纬度获取城市code
  getLocal (latitude, longitude) {
    let t = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        let citys = res.result.ad_info.city
        t.setState({
          cityVal: citys
        })
        api.areaZone({
          CityName: res.result.ad_info.city,
          ProvinceName: res.result.ad_info.province,
        }).then(res1 => {
          if (res1.data.code === 200) {
            let city = {
              citys,
              cityCode: res1.data.data[0].AreaCode
            }
            t.setState({
              cityCode: res1.data.data[0].AreaCode
            })
            Taro.setStorageSync('city', JSON.stringify(city))
            t.areaCount(res1.data.data[0].AreaCode)
          }
        })
      }
    })
  }
  // 点击marker
  markerTap (e) {

    if (e.markerId.length > 7) {
      Taro.navigateTo({
        url: `../../../comm_derail/index?param=${e.markerId}`
      })
    } else {
      let params = {
        LoginMark: this.state.uuid ? this.state.uuid : '',
        Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token : '',
        CityCode: get('CityCode') ? get('CityCode') : JSON.parse(this.state.citys).cityCode,
        DistrictCode: e.markerId
      }
      this.getBuildings(params,13, e.markerId)
    }

  }
  //获取楼盘
  getBuildings (params, scale, tap) {
    Taro.showLoading({ title: 'loading...', mask: true })
    api.buildings(params).then(res => {
      if (res.data.code === 200) {
        Taro.hideLoading()
        let markers = []
        if (res.data.data.rows !== null) {
          res.data.data.rows.forEach(ele => {
            markers.push({
              id: ele.BuildingId,
              latitude: ele.Location.lat,
              longitude: ele.Location.lng,
              alpha: isiOS ? 0 : 1,
              callout: {
                content: `${ele.BuildingName} 车位：${ele.ForSaleCount} 均价：${splitThousand(ele.AveragePrice)}`,
                padding: 5,
                display: 'ALWAYS',
                bgColor: '#5584ff',
                color: '#ffffff',
                textAlign: 'center',
                borderRadius: 4
              }
            })
          })
          if (tap) {
            JSON.parse
            this.setState({
              markers,
              scale,
              longitude: JSON.parse(res.data.data.rows[0].Coordinate).lng,
              latitude: JSON.parse(res.data.data.rows[0].Coordinate).lat
            })
          } else {
            this.setState({
              markers,
              scale
            })
          }

        }else{
          toast('暂无数据！','none',1500)
        }
      }
    })
  }
  //视野发生变化时触发
  regionChange (e) {
    let t = this
    const { uuid, userInfo,citys, areaMarkers } = this.state

    if (e.causedBy === 'scale') {
      MapContext.getScale({
        success: function(res) {
          if (res.scale > 13) {
            if (res.scale <= 15) {
              let params = {
                LoginMark: uuid ? uuid : '',
                Token: userInfo ? JSON.parse(userInfo).token : '',
                CityCode: get('CityCode') ? get('CityCode') : JSON.parse(citys).cityCode
              }
              t.getBuildings(params,res.scale)
            }
          }else{
            t.setState({
              markers: areaMarkers
            })
          }
        }
      })
    }

  }

  //地址转经纬度
  geocoder (city) {
    let t = this
    qqmapsdk.geocoder({
      address: city == '北京' ? '北京市' : city,
      success: function(res) {
        let latitude = res.result.location.lat
        let longitude = res.result.location.lng
        t.setState({
          latitude,
          longitude
        }, () => {
          t.getLocal(latitude, longitude)
        })
      }
    })
  }


  // 从车位数据进来，地址转经纬度
  getAddress(address, BuildingName) {
    qqmapsdk.geocoder({
      address,
      success: (r) => {
        let latitude = r.result.location.lat
        let longitude = r.result.location.lng

        this.setState({
          latitude,
          longitude,
          scale: 13,
          markers: [{
            latitude,
            longitude,
            alpha: isiOS ? 0 : 1,
            callout: {
              content: BuildingName,
              padding: 5,
              display: 'ALWAYS',
              bgColor: '#5584ff',
              color: '#ffffff',
              textAlign: 'center',
              borderRadius: 4
            }
          }]
        })
      }
    })
  }


  componentDidShow() { 
      
    Taro.getSetting({
      success: (r) => {
        if (!r.authSetting['scope.userLocation']) {
          Taro.authorize({
            scope: 'scope.userLocation',
            success: (r1) => {
              if (r1.errMsg == 'authorize:ok') {
                this.setState({
                  map: true
                })
              }
            },
            fail: (r1) => {
              //第一次进来拒绝授权
              if (r1.errMsg == 'authorize:fail auth deny') {
                Taro.showModal({
                  title: '提示！',
                  confirmText: '去设置',
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      this.setState({
                        btn: true
                      })
                    }
                  }
                })
              }
            }
          })
        } else {
          this.setState({
            map: true,
            btn: false
          })

          let citys = Taro.getStorageSync('city')
          let uuid = Taro.getStorageSync('uuid')
          let userInfo = Taro.getStorageSync('userInfo')
      
          //创建 map 上下文 MapContext 对象
          MapContext = Taro.createMapContext('map',this)
      
          this.setState({
            cityVal: get('City') ? get('City') : JSON.parse(citys).citys,
            cityCode: get('CityCode') ? get('CityCode') : JSON.parse(citys).cityCode,
            uuid,
            userInfo,
            citys
          },() => {
            this.getLocation()
            this.getAreaZone()
          })

        }
      }
    })

  }
  // 未授权获取位置，打开设置
  openSet () {
    Taro.openSetting()
  }


  render () {
    const { btn, map, latitude, longitude, markers, scale, seatchVal, cityVal, iconCity, province, multiIndex } = this.state

    return (
      <View className='map'>
        {
          map && 
          <View>
            <View className='top_search'>
              <AtSearchBar
                placeholder='请输入楼盘名称'
                onActionClick={this.onActionClick.bind(this)}
                value={seatchVal}
                onChange={this.searchChange.bind(this)} 
              />
              <View 
                onClick={() => this.setState({iconCity: 'chevron-up'})}
                className='area_select'
              >
                <Picker 
                  mode='multiSelector'
                  onCancel={() => this.setState({iconCity: 'chevron-down'})}
                  value={multiIndex} 
                  range={province} 
                  oncolumnchange={this.columnchange.bind(this)}
                  onChange={this.picker.bind(this)}
                >
                  <View class='city'>
                    <Text>{ cityVal }</Text>
                    <AtIcon value={iconCity} size='21' color='#AEAEAE'></AtIcon>
                    <Text className='line'></Text>
                  </View>
                </Picker>
              </View> 
            </View>
            
            <Map 
              id='map'
              scale={scale}
              showCompass
              enable3D
              showScale
              enableOverlooking
              onRegionChange={this.regionChange.bind(this)}
              onCalloutTap={this.markerTap.bind(this)}
              markers={markers}
              longitude={longitude}
              latitude={latitude}
              style={{height:'100vh',width:'100vw'}}
            />
          </View>
        }

        {
          btn && <AtButton type='primary' onClick={this.openSet.bind(this)}>打开权限设置</AtButton>
        }
      </View>
    )
  }
}
