import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker, ScrollView, Image } from '@tarojs/components'
import { AtSearchBar, AtIcon, AtActivityIndicator, AtLoadMore, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import Header from '../../components/header/header'
import { get, set, toast } from '../../global_data'
import { imgUrl } from '../../utils/util'
import api from '../../api/api'
import QQMapWX from '../../assets/js/qqmap-wx-jssdk.min'
import './index.scss'


let qqmapsdk = new QQMapWX({
  key: 'L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX'
})
let timeout = null

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      num: 1,
      navType: 'back',
      title: '',
      seatchVal: '',
      sord: '',
      isOpened: false,
      iconCity: 'chevron-down',
      iconPrice: 'chevron-down',
      iconBus: 'chevron-down',
      selBus: [],     //商圈
      susCode: [],    //商圈code数据
      susCode1: [],    //用来储存选中的商圈的code
      selBusVal: '商圈',
      selPrice: ['面额','1万以下','1-5万', '5-20万', '20-50万', '50万以上'],
      priceCode: ['0','-10000','10000-50000','50000-200000','200000-500000','500000-'],
      priceCode1: '',
      selPriceVal: '面额',
      city: [],       //市
      cityCode: '',
      province: [],   //省
      cityVal: '',    //选择数据展示的值
      selCity: [],
      multiIndex:[0,0],
      parkingData: null,  //车位列表
      flag: false,    //用来判断是否用滑动选择省市
      ParkingLot: '',
      display: 'none',
      circleLength: '',
      scrollY: true,
      // 拖动上下滚动
      dragStyle: {
        top: 0 + 'px'
      },
      //下拉样式
      downPullStyle: {
        height: 0 + 'px'
      },
      downPullText: '下拉刷新',
      status: 'noMore',
      page: 2,
      rows: 20
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
      this.getParkingNum({
        LoginMark: this.state.uuid ? this.state.uuid : '',
        Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token : '',
        CityCode: this.state.cityCode,
        ParkingLot: this.state.ParkingLot,
        CircleId: this.state.susCode1,
        Price: this.state.priceCode1,   //车位面额值
        sord: this.state.sord
      })

    }else{
      this.getParkingNum({
        LoginMark: this.state.uuid ? this.state.uuid:'',
        Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token:'',
        CityCode: this.state.cityCode,
        ParkingLot: this.state.ParkingLot,
        CircleId: this.state.susCode1,
        Price: this.state.priceCode1,   //车位面额值
        KeyWord: this.state.seatchVal,
        sord: this.state.sord
      })
    }
  }


  changeIcon (type) {
    if (type === 'city') {
      this.setState({
        iconCity: 'chevron-up'
      })
    }else if (type === 'bus') {
      this.setState({
        iconBus: 'chevron-up'
      })
    }else {
      this.setState({
        iconPrice: 'chevron-up'
      })
    }

  }

  /**
   * 改变了地址，全局都要改变定位地址
   *  set('City')   在全局保存城市
   *  set('CityCode')   在全局保存城市的code
   */
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
          this.setState({
            cityCode: ele.AreaCode,
            susCode1: '',
            priceCode1: '',
            seatchVal: '',
            display: 'none'
          })
          set('CityCode',ele.AreaCode)
          this.getParkingNum({
            LoginMark: this.state.uuid ? this.state.uuid:'',
            Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token:'',
            CityCode: ele.AreaCode,
            ParkingLot: this.state.ParkingLot,
            CircleId: this.state.susCode1,
            Price: this.state.priceCode1,   //车位面额值
            KeyWord: this.state.seatchVal,
            sord: this.state.sord
          })
        }
      })
    }else{
      this.setState({
        cityCode: '110100',
        susCode1: '',
        priceCode1: '',
        seatchVal: '',
        display: 'none'
      })
      set('CityCode','110100')
      this.getParkingNum({
        CityCode: '110100',
        ParkingLot: this.state.ParkingLot,
      })
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
  cancel (type) {
    if (type === 'city') {
      this.setState({
        iconCity: 'chevron-down'
      })
    }else if (type === 'bus') {
      this.setState({
        iconBus: 'chevron-down'
      })
    }else {
      this.setState({
        iconPrice: 'chevron-down'
      })
    }

  }

  // 价格排序
  sort(type) {
    const { ParkingLot, cityCode, seatchVal, priceCode1, susCode1 } = this.state
    this.setState({
      isOpened: false,
      sord: type
    })
    this.getParkingNum({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      ParkingLot: ParkingLot,
      CityCode: cityCode,  //市code
      CircleId: susCode1,
      KeyWord: seatchVal,
      Price: priceCode1,
      sord: type
    })

  }

  //nav选择
  navChange (type,e) {
    const { cityCode, sord, susCode1, priceCode1, priceCode, selBus, susCode, selPrice, seatchVal } = this.state
    if (type === 'bus') {
      this.setState({
        selBusVal: selBus[e.detail.value].slice(0,4),
        iconBus: 'chevron-down',
        susCode1: susCode[e.detail.value] == 0 ? '' : susCode[e.detail.value]
      })
      this.getParkingNum({
        CityCode: cityCode,    //市code
        CircleId: susCode[e.detail.value] == 0 ? '' : susCode[e.detail.value], //商圈id 
        Price: priceCode1,   //车位面额值
        KeyWord: seatchVal,
        sord: sord
      })
    } else if (type === 'price') {
      this.setState({
        selPriceVal: selPrice[e.detail.value],
        iconPrice: 'chevron-down',
        priceCode1: priceCode[e.detail.value] == 0 ? '' : priceCode[e.detail.value]
      })
      this.getParkingNum({
        CityCode: cityCode,    //市code
        Price: priceCode[e.detail.value] == 0 ? '' : priceCode[e.detail.value],  //车位面额值
        CircleId: susCode1,   //商圈id 
        KeyWord: seatchVal,
        sord: sord
      })
    }

  }
  //跳转到详情
  goDetail (id) {
    this.$preload({
      id,
      page: 'aw'
    })
    Taro.navigateTo({
      url: `../car_detail/index`
    })
  }


  //获取商圈列表
  getCircle () {
    api.circle({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
        Taro.hideLoading()
        let datas = ['商圈']
        let code = ['0']
        res.data.data.forEach(ele => {
          if (Taro.getStorageSync('userInfo')) {
            if (ele.IfInsert >= 1) {
              datas.push(ele.CircleName)
              code.push(ele.CircleId)
            }
          } else {
            datas.push(ele.CircleName)
            code.push(ele.CircleId)
          }

        })
        this.setState({
          selBus: datas,
          susCode: code,
          circleLength: res.data.data.length
        },() => {
          this.setState({
            selBusVal: this.$router.preload.CircleName&&this.$router.preload.CircleName.slice(0,4)
          })
        })
      }
    })
  }

  getDatas(params, downPullText, toast1) {
    api.newParking({
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      LoginMark: Taro.getStorageSync('uuid'),
      Page: 1,
      Rows: 10,
      ParkingLot: this.$router.preload.ParkingLot,
      CityCode: params.CityCode,  //市code
      CircleId: params.CircleId,
      KeyWord: params.KeyWord,
      Price: params.Price,
      sord: params.sord,
      existLoading: params.existLoading
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          parkingData: res.data.data.rows,
          downPullText,
          page: 1,
          rows: 10,
        })
        if (toast1) {
          toast('刷新成功','success',1500)
        }
      }
    })
  }

  getParkingNum(params, downPullText = '下拉刷新', toast1) {
    this.getDatas(params, downPullText, toast1)

  }
  getParkingNum1(params, status) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.newParking({
      Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token : '',
      LoginMark: this.state.uuid ? this.state.uuid : '',
      Page: this.state.page + 1,
      Rows: this.state.rows + 10,
      ParkingLot: this.state.ParkingLot,
      CityCode: params.CityCode,  //市code
      CircleId: params.CircleId,
      sord: params.sord,
      Price: params.Price
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          parkingData: this.state.parkingData.concat(res.data.data.rows),
          status,
          page: this.state.page + 1,
          rows: this.state.rows + 10
        }, () => {
          Taro.hideLoading()
        })
      }
    })
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

  //返回
  goBack () {
    Taro.navigateBack({ 
      delta: 1
    })
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

  componentWillMount () {
    let citys = Taro.getStorageSync('city') && JSON.parse(Taro.getStorageSync('city'))
    let uuid = Taro.getStorageSync('uuid')
    let userInfo = Taro.getStorageSync('userInfo')

    
    this.setState({
      cityVal: get('City') ? get('City') : (citys ? citys.citys : ''),
      cityCode: get('CityCode') ? get('CityCode') : (citys ? citys.cityCode : ''),
      uuid,
      userInfo,
      ParkingLot: this.$router.preload.ParkingLot,
      title: this.$router.preload.ParkingLot === 0 ? '在售车位通凭证' : '在售车位通权证'
    })
    let params = {
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      CityCode: get('CityCode') ? get('CityCode') : (citys ? citys.cityCode : ''),
      CircleId: this.state.CircleId,
      Price: this.state.Price,
      KeyWord: this.state.seatchVal,
      sord: this.state.sord,
      existLoading: true
    }

    const asyncHttp = async () => {
      await this.getAreaZone()
      await this.getCircle()
      await this.getParkingNum(params)
    }
    asyncHttp()

  }

  // 鼠标点击移动开始触发事件
  touchStart = e => {
    let that = this;
    that.setState({
      creState: e.touches[0]
    })
  }
  // 移动往上触发顶部回弹实现
  touchRecMove = e => {
    clearTimeout(timeout)
    e.stopPropagation();

    let that = this;
    let move = e.touches[0]; //移动时的位置
    let deviationX = 0.3; //左右偏移量(超过这个偏移量不执行下拉操作)
    let deviationY = 70; //拉动长度（低于这个值的时候不执行）
    let maxY = 70; //拉动的最大高度

    let start_x = that.state.creState ? that.state.creState ? that.state.creState.clientX : 0 : 0;
    let start_y = that.state.creState ? that.state.creState ? that.state.creState.clientY : 0 : 0;
    let move_x = move.clientX;
    let move_y = move.clientY;

    //得到偏移数值
    let dev = Math.abs(move_x - start_x) / Math.abs(move_y - start_y);
    //当偏移数值大于设置的偏移数值时则不执行操作
    if (dev < deviationX) {
      //拖动倍率
      let dragY = Math.abs(move_y - start_y) / 3.5;
      //下拉操作
      if (move_y - start_y > 0) {
        if (dragY >= deviationY) {
          timeout = setTimeout(() => {
            let params = {
              sord: this.state.sord,
              CityCode: that.state.cityCode,
              KeyWord: this.state.seatchVal,
              CircleId: that.state.susCode1,   //商圈id 
              Price: that.state.priceCode1   //车位面额值
            }
            that.getParkingNum(params, 'loading', 'toast1')
          },500)

        } else {
          that.setState({
            pullState: 0,
            downPullText: '下拉刷新'
          });
        }
        if (dragY >= maxY) {
          dragY = maxY;
        }
        that.setState({
          dragStyle: {
            top: dragY + 'px'
          },
          downPullStyle: {
            height: dragY + 'px'
          },
          scrollY: false
        });
      }
    }
  }
  // 鼠标离开且未移动会触发事件
  touchEnd = () => {
    let that = this;
    that.reduction();
  }
  // 还原初始设置
  reduction = () => {
    let time = 0.5;
    let that = this;
    that.setState({
      dragStyle: {
        top: 0 + 'px',
        transition: `all ${time}s`
      },
      downPullStyle: {
        height: 0 + 'px',
        transition: `all ${time}s`
      },
      pullState: 0,
      scrollY: true
    });
    // eslint-disable-next-line no-undef
    setTimeout(() => {
      that.setState({
        dragStyle: {
          top: 0 + 'px'
        },
        downPullStyle: {
          height: 0 + 'px'
        },
        downPullText: '下拉刷新',
        upPullText: '上拉加载更多'
      });
    }, time * 1000);
  }
  //页面上拉触底事件的处理函数
  onReachBottom = () => {
    this.getMoreRecList();
  }
  // 获取更多推荐列表
  getMoreRecList = () => {
    let that = this;
    that.setState({
      status: 'loading',
      display: 'block'
    })
    setTimeout(() => {
      let params = {
        sord: that.state.sord,
        CityCode: that.state.cityCode,
        CircleId: that.state.susCode1,   //商圈id 
        Price: that.state.priceCode1   //车位面额值
      }
      that.getParkingNum1(params, 'noMore')
    }, 500)
  }


  render () {
    const { num, navType, title, parkingData, seatchVal, multiIndex, province, display, circleLength,
      selPrice, selPriceVal, iconPrice, cityVal, iconCity, selBus, selBusVal, iconBus, isOpened, cityCode,
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      status } = this.state
    const house_nodata = `${imgUrl}house_nodata.png`
    const surHeight = get('titleHeight1') + 310
    const titleHeight = get('titleHeight')
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`

    return (
      <View className='container'>

        <Header onNum={num}  onTitle={title} onNavType={navType} />

        <View className='community'
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          {/* 顶部搜索及select */}
          <View className='top_search'>
            <AtSearchBar
              placeholder='请输入商圈、小区名称'
              onActionClick={this.onActionClick.bind(this)}
              value={seatchVal}
              onChange={this.searchChange.bind(this)} 
            />
            <View 
              onClick={this.changeIcon.bind(this,'city')}
              className='area_select'
            >
              <Picker 
                mode='multiSelector'
                onCancel={this.cancel.bind(this,'city')}
                value={multiIndex} 
                range={province} 
                oncolumnchange={this.columnchange.bind(this)}
                onChange={this.picker.bind(this)}
              >
                <View class='city'>
                  <Text>{ cityVal }</Text>
                  <AtIcon value={iconCity} size='18' color='#AEAEAE'></AtIcon>
                  <Text className='line'></Text>
                </View>
              </Picker>

            </View> 

            <View className='nav_select'>
              <View onClick={this.changeIcon.bind(this,'bus')}>
                <Picker 
                  mode='selector' 
                  onCancel={this.cancel.bind(this,'bus')}
                  range={selBus} 
                  onChange={this.navChange.bind(this,'bus')}
                >
                  <View className='picker'>
                    <Text decode>{ selBusVal }&nbsp;</Text>
                    <AtIcon value={iconBus} size='18' color='#AEAEAE'></AtIcon>
                  </View>
                </Picker>
              </View>
              <View onClick={this.changeIcon.bind(this,'price')}>
                <Picker mode='selector' range={selPrice} 
                  onCancel={this.cancel.bind(this,'price')}
                  onChange={this.navChange.bind(this,'price')}
                >
                  <View className='picker'>
                    <Text decode>{ selPriceVal }&nbsp;</Text>
                    <AtIcon value={iconPrice} size='18' color='#AEAEAE'></AtIcon>
                  </View>
                </Picker>
              </View>
              <View onClick={() => this.setState({isOpened: true})} className='sort'>
                <Text>价格</Text>
                <View><Image src={`${imgUrl}rank.png`} /></View>
              </View>
            </View>

          </View>
          
          <View className='dragUpdatePage' style={{height: `calc(100vh - ${surHeight}rpx)`}}>
            <View className='downDragBox' style={downPullStyle}>
              <AtActivityIndicator content={downPullText} />
            </View>

            {/* list数据 */}
            <ScrollView
              style={dragStyle}
              scrollY={scrollY}
              className={'tab-container ' + (isActive == 1 ? 'show' : 'hide')}
              upperThreshold={50}
              lowerThreshold={50}
              onTouchStart={this.touchStart}
              onTouchMove={this.touchRecMove}
              onTouchEnd={this.touchEnd}
              onScrollToLower={this.onReachBottom}
              scrollWithAnimation
            >
              {
                JSON.stringify(parkingData) !== '[]' && parkingData!==null && parkingData.map(ele => {
                  return (
                    <View className='list' key={ele.BuildingId}>
                      <View className='item' key={ele.BuildingId} onClick={this.goDetail.bind(this,ele.ParkingId)}>
                      <View class='left'>
                          {
                            ele && ele.BuyBack.Usufruct == 0 ? 
                            <View style={{color: '#FC7946'}}>
                              <View>
                                <Text>{ ele.BuyBack.FixedRate&&ele.BuyBack.FixedRate.toFixed(2) }</Text>
                                <Text>%</Text>
                              </View>
                              <View>年化收益率</View>
                            </View> : 
                            <View style={{color: '#5584FF'}}>
                              <View>
                                <Text>{ ele&&((ele.SalePrice)/10000).toFixed(2) }</Text>
                                <Text>万</Text>
                              </View>
                              <View>挂牌价 (元)</View>
                            </View>
                          }
                        </View>
                      {
                        ele && ele.BuyBack.Usufruct == 0 ? 
                        <View class='right'>
                          <View className='overflow1'>
                            <Text>{ `凭证编号${ele.ParkingId.toUpperCase()}` }</Text>
                          </View>
                          <View>所属商圈：{ ele.CircleName }</View>
                          <View>所属小区：{ ele.BuildingName }</View>
                          <View className='address'>
                            <View className='overflow1'>地址：{ ele.Address }</View>
                            <View>
                              <Image onClick={this.goNavigation.bind(this,ele.Address)} src={`${imgUrl}icon_map_l.png`} />
                            </View>
                          </View>
                          <View>凭证到期日：{ ele.LimitDate }</View>
                          <View>
                            面额：{ ele&&((ele.Price)/10000).toFixed(2) }
                            <Text style={{fontSize: '18rpx'}}> (万元)</Text>
                          </View>
                        </View> : 
                        <View class='right'>
                          <View>
                            <Text>车位号{ ele.ParkingCode }</Text>
                          </View>
                          <View>所属商圈：{ ele.CircleName }</View>
                          <View>所属小区：{ ele.BuildingName }</View>
                          <View className='address'>
                            <View className='overflow1'>地址：{ ele.Address }</View>
                            <View>
                              <Image onClick={this.goNavigation.bind(this,ele.Address)} src={`${imgUrl}icon_map_l.png`} />
                            </View>
                          </View>
                          <View>车位类型：{ ele.ParkingTypeName }</View>
                        </View>
                      }

                      </View>
                    </View>
                  )
                }) 
              }
              {
                JSON.stringify(parkingData) == '[]' && (
                  <View className='nodata'>
                    <View>
                      <Image src={house_nodata} />
                      {
                        circleLength > 0 ? 
                        <View>当前城市无数据，请尝试切换城市查看</View> : 
                        <View>您还未加入任何一个商圈，请前往“我的商圈”，在“未加入”列表进行选择并加入。</View>
                      }
                      
                    </View> 
                  </View>
                )
              }
              <View className='upDragBox' style={{display: display}}>
                <AtLoadMore
                  status={status}
                  // moreText='查看数据'
                  loadingText='数据加载中...'
                  noMoreText='---已经到底啦---'
                  noMoreTextStyle={{ border: 'none' }}
                  moreBtnStyle={{ border: 'none' }}
                />
              </View>
            </ScrollView>

          </View>

        </View>

        {/* 点击排序 */}
        <AtActionSheet 
          isOpened={isOpened} 
          onClose={() => this.setState({isOpened: false})}
        >
          <AtActionSheetItem onClick={this.sort.bind(this, 'asc')}>价格由低到高</AtActionSheetItem>
          <AtActionSheetItem onClick={this.sort.bind(this, 'desc')}>价格由高到低</AtActionSheetItem>
        </AtActionSheet>

      </View>

    )
  }
}
