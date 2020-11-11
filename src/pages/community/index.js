import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker, ScrollView, Image } from '@tarojs/components'
import { AtSearchBar, AtIcon, AtActivityIndicator, AtLoadMore } from 'taro-ui'
import { get, set, toast } from '../../global_data'
import { imgUrl } from '../../utils/util'
import api from '../../api/api'
import './index.scss'

let timeout = null

export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '小区'
  }

  constructor () {
    super(...arguments)
    this.state = {
      seatchVal: '',
      iconCity: 'chevron-down',
      iconArea: 'chevron-down',
      iconPrice: 'chevron-down',
      iconBus: 'chevron-down',
      iconType: 'chevron-down',
      selArea: [],    //区
      areaCode: [],   //区的code数据
      areaCode1: '',   //用来储存选中的区code
      selAreaVal: '区域',
      selBus: [],     //商圈
      susCode: [],    //商圈code数据
      susCode1: [],    //用来储存选中的商圈的code
      selBusVal: '商圈',
      selPrice: ['均格','1万以下','1-5万', '5-20万', '20-50万', '50万以上'],
      priceCode: ['0','-10000','10000-50000','50000-200000','200000-500000','500000-'],
      priceCode1: '',
      selPriceVal: '均格',
      selType: [],    //楼盘类型
      typeCode: [],    //楼盘code数据
      typeCode1: '',    //用来储存选中的楼盘类型的code
      selTypeVal: '楼盘类型',
      city: [],       //市
      cityCode: '',
      province: [],   //省
      cityVal: '',    //选择数据展示的值
      selCity: [],
      multiIndex:[0,0],
      buildingsData: null,  //小区列表
      flag: false,    //用来判断是否用滑动选择省市
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
      rows: 20,
    }
  }

  // search的change事件
  searchChange (value) {
    this.setState({
      seatchVal: value,
    })
  }

  // 点击搜索
  onActionClick () {
    if (this.state.seatchVal === '') {
      api.buildings({
        LoginMark: Taro.getStorageSync('uuid')?Taro.getStorageSync('uuid'):'',
        Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
        CityCode: this.state.cityCode,
      }).then(res => {
        if (res.data.code === 200) {
          Taro.hideLoading()
          this.setState({
            buildingsData: res.data.data.rows ? res.data.data.rows : [],
            selBusVal: '商圈',
            selAreaVal: '区域',
            selPriceVal: '价格',
            selTypeVal: '楼盘类型',
          })
        }
      })
    }else{
      api.buildings({
        LoginMark: Taro.getStorageSync('uuid')?Taro.getStorageSync('uuid'):'',
        Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
        CityCode: this.state.cityCode,
        KeyWord: this.state.seatchVal
      }).then(res => {
        if (res.data.code === 200) {
          Taro.hideLoading()
          this.setState({
            buildingsData: res.data.data.rows ? res.data.data.rows : [],
            selBusVal: '商圈',
            selAreaVal: '区域',
            selPriceVal: '价格',
            selTypeVal: '楼盘类型',
          })
        }
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
    }else if (type === 'area') {
      this.setState({
        iconArea: 'chevron-up'
      })
    }else if (type === 'type') {
      this.setState({
        iconType: 'chevron-up'
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
  // 省市选择
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
            areaCode1: '',
            typeCode1: '',
            priceCode1: '',
            seatchVal: ''
          })
          set('CityCode',ele.AreaCode)
          this.getArea({
            CityCode: ele.AreaCode,
            LoginMark: this.state.uuid ? this.state.uuid:'',
            Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token:''
          })
          this.getBuildings({
            CityCode: ele.AreaCode,
            LoginMark: this.state.uuid ? this.state.uuid:'',
            Token: this.state.userInfo ? JSON.parse(this.state.userInfo).token:''
          })
        }
      })
    }else{
      this.setState({
        cityCode: '110100',
        susCode1: '',
        areaCode1: '',
        typeCode1: '',
        priceCode1: '',
        seatchVal: ''
      })
      set('CityCode','110100')
      this.getArea({CityCode: '110100'})
      this.getBuildings({
        CityCode: '110100'
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
    }else if (type === 'area') {
      this.setState({
        iconArea: 'chevron-down'
      })
    }else if (type === 'type') {
      this.setState({
        iconType: 'chevron-down'
      })
    }else {
      this.setState({
        iconPrice: 'chevron-down'
      })
    }

  }

  // nav选择
  navChange (type,e) {
    this.setState({
      display: 'none'
    })
    const { selArea, seatchVal, tareaCode1, priceCode, typeCode, selType, selPrice, areaCode, cityCode, susCode1, typeCode1, priceCode1, selBus, susCode, areaCode1 } = this.state
    
    if (type === 'area') {
      this.setState({
        selAreaVal: selArea[e.detail.value],
        iconArea: 'chevron-down',
        areaCode1: areaCode[e.detail.value] == 0 ? '' : areaCode[e.detail.value]
      })
      this.getBuildings({
        CityCode: cityCode,  //市code
        DistrictCode: areaCode[e.detail.value] == 0 ? '' : areaCode[e.detail.value],  //区code
        CircleIds: susCode1,   //商圈id 
        BuildTraitTypes: typeCode1,  //商圈类型code
        Price: priceCode1,   //车位价格值
        KeyWord: seatchVal 
      })
    }else if (type === 'bus') {
      this.setState({
        selBusVal: selBus[e.detail.value].slice(0,4),
        iconBus: 'chevron-down',
        susCode1: susCode[e.detail.value] == 0 ? '' : susCode[e.detail.value]
      })
      this.getBuildings({
        CityCode: cityCode,    //市code
        CircleIds: susCode[e.detail.value] == 0 ? '' : susCode[e.detail.value], //商圈id 
        DistrictCode: areaCode1,   //区code
        BuildTraitTypes: typeCode1,  //商圈类型code
        Price: priceCode1,   //车位价格值
        KeyWord: seatchVal 
      })
    }else if (type === 'price') {
      this.setState({
        selPriceVal: selPrice[e.detail.value],
        iconPrice: 'chevron-down',
        priceCode1: priceCode[e.detail.value] == 0 ? '' : priceCode[e.detail.value]
      })
      this.getBuildings({
        CityCode: cityCode,    //市code
        Price: priceCode[e.detail.value] == 0 ? '' : priceCode[e.detail.value],  //车位价格值
        DistrictCode: areaCode1,   //区code
        BuildTraitTypes: typeCode1,  //商圈类型code
        CircleIds: susCode1,   //商圈id 
        KeyWord: seatchVal 
      })
    }else {
      this.setState({
        selTypeVal: selType[e.detail.value],
        iconType: 'chevron-down',
        typeCode1: typeCode[e.detail.value] == 0 ? '' : typeCode[e.detail.value]
      })

      this.getBuildings({
        CityCode: cityCode,  //市code
        BuildTraitTypes: typeCode[e.detail.value] == 0 ? '' : typeCode[e.detail.value], //楼盘类型code
        DistrictCode: tareaCode1,   //区code
        CircleIds: susCode1,   //商圈id 
        Price: priceCode1,  //车位价格值
        KeyWord: seatchVal 
      })

    }

  }
  // 跳转到详情
  goDetail (BuildingId) {
    this.$preload({
      BuildingId
    })
    Taro.navigateTo({
      url: `../comm_derail/index`
    })
  }


  // 获取商圈列表
  getCircle () {
    api.circle({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
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
        });
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
  // 获取楼盘类型
  getBuildType () {
    api.buildTraitType({
      data: 'BuildTraitType',
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
        let datas = ['楼盘类型']
        let code = ['0']
        res.data.data.forEach(ele => {
          datas.push(ele.F_ItemName.slice(0,4))
          code.push(ele.F_ItemValue)
        })
        this.setState({
          selType: datas,
          typeCode: code,
        })
      }
    })
  }

  // 获取省市数据
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
  // 获取区的数据
  getArea (params) {
    api.areaZone(params).then(res => {
      if (res.data.code === 200) {
        let code = ['0']
        let arr1 = ['区域']
        res.data.data.forEach(ele => {
          code.push(ele.AreaCode)
          arr1.push(ele.AreaName)
        })
        this.setState({
          areaCode: code,
          selArea: arr1
        })
      }
    })
  }

  getDatas(params, downPullText, toast1) {
    api.buildings({
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      LoginMark: Taro.getStorageSync('uuid'),
      Page: 1,
      Rows: 10,
      CityCode: params.CityCode,                // 市code
      DistrictCode: params.DistrictCode,        // 区code
      CircleIds: params.CircleIds,              // 商圈id 
      BuildTraitTypes: params.BuildTraitTypes,  // 商圈类型code
      Price: params.Price,                      // 车位价格值
      KeyWord: params.KeyWord,                   // 输入框
      existLoading: params.existLoading
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          buildingsData: res.data.data.rows,
          downPullText,
          page: 1,
          rows: 10
        },() => {
          if (toast1) {
            toast('刷新成功','success',1500)
          }

        })
      }
    })
  }

  // 获取小区列表数据
  getBuildings (params, downPullText = '下拉刷新', toast1) {
    this.getDatas(params, downPullText, toast1)
  }
  getBuildings1 (params, status) {
    api.buildings({
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      LoginMark: Taro.getStorageSync('uuid'),
      Page: this.state.page + 1,
      Rows: this.state.rows + 10,
      CityCode: params.CityCode,                // 市code
      DistrictCode: params.DistrictCode,        // 区code
      CircleIds: params.CircleIds,              // 商圈id 
      BuildTraitTypes: params.BuildTraitTypes,  // 商圈类型code
      Price: params.Price,                      // 车位价格值
      KeyWord: params.KeyWord                   // 输入框
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          buildingsData: this.state.buildingsData.concat(res.data.data.rows),
          status,
          page: this.state.page + 1,
          rows: this.state.rows + 10
        }, () => {
          Taro.hideLoading()
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
      userInfo
    })
    let params = {
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      CityCode: get('CityCode') ? get('CityCode') : (citys ? citys.cityCode : ''),
      CircleIds: this.$router.preload.CircleId ? this.$router.preload.CircleId : '',
      DistrictCode: this.state.areaCode1,             // 区code
      BuildTraitTypes: this.state.typeCode1,          // 商圈类型code
      Price: this.state.priceCode1,                   // 车位价格值
      KeyWord: this.state.seatchVal,                   // 输入框
      existLoading: true
    }

    const asyncHttp = async () => {
      await this.getAreaZone()
      await this.getArea(params)
      await this.getCircle()
      await this.getBuildType()
      await this.getBuildings(params)
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

    let start_x = that.state.creState ? that.state.creState.clientX : 0;
    let start_y = that.state.creState ? that.state.creState.clientY : 0;
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
              CityCode: this.state.cityCode,
              CircleIds: this.state.susCode1,
              DistrictCode: this.state.areaCode1,             // 区code
              BuildTraitTypes: this.state.typeCode1,          // 商圈类型code
              Price: this.state.priceCode1,                   // 车位价格值
              KeyWord: this.state.seatchVal                   // 输入框
            }
            that.getBuildings(params, 'loading', 'toast1')
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
        CityCode: this.state.cityCode,
        CircleIds: this.state.susCode1,
        DistrictCode: this.state.areaCode1,             // 区code
        BuildTraitTypes: this.state.typeCode1,          // 商圈类型code
        Price: this.state.priceCode1,                   // 车位价格值
        KeyWord: this.state.seatchVal                   // 输入框
      }
      this.getBuildings1(params, 'noMore')
    }, 500)
  }

  render () {
    const { buildingsData, display, seatchVal, multiIndex, province, cityVal, iconCity, selBus, selBusVal, iconBus, cityCode,
      selArea, selAreaVal, iconArea, selPrice, selPriceVal, iconPrice, selType, selTypeVal, iconType, circleLength,
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      status } = this.state
    const house_default = `${imgUrl}house_default.png`
    const house_nodata = `${imgUrl}house_nodata.png`
    const surHeight = get('titleHeight1') + 175
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`

    let params = {
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      CityCode: get('CityCode') ? get('CityCode') : cityCode
    }

    return (
      <View className='community'>
        {/* 顶部搜索及select */}
        <View className='top_search'>
          <AtSearchBar
            placeholder='请输入小区名称、商圈'
            onActionClick={this.onActionClick.bind(this)}
            onConfirm={this.onActionClick.bind(this)}
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
            <View onClick={this.changeIcon.bind(this,'area')}>
              <Picker 
                mode='selector' 
                onCancel={this.cancel.bind(this,'area')}
                range={selArea} 
                onChange={this.navChange.bind(this,'area')}
              >
                <View className='picker'>
                  <Text decode>{ selAreaVal }&nbsp;</Text>
                  <AtIcon value={iconArea} size='18' color='#AEAEAE'></AtIcon>
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
            <View onClick={this.changeIcon.bind(this,'type')}>
              <Picker 
                mode='selector' 
                onCancel={this.cancel.bind(this,'type')}
                range={selType} 
                onChange={this.navChange.bind(this,'type')}
              >
                <View className='picker'>
                  <Text decode>{ selTypeVal }&nbsp;</Text>
                  <AtIcon value={iconType} size='18' color='#AEAEAE'></AtIcon>
                </View>
              </Picker>
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
              JSON.stringify(buildingsData) !== '[]' && buildingsData!==null && buildingsData.map(ele => {
                return (
                  <View className='list' key={ele.BuildingId}>
                    <View className='item' key={ele.BuildingId} onClick={this.goDetail.bind(this,ele.BuildingId)}>
                      <View className='left'>
                        <Image src={ele.Imgs ? ele.Imgs[0] : house_default} />
                      </View>
                      <View className='right'>
                        <View>{ ele.BuildingName }</View>
                        <View>
                          <Text decode>{ ele.City }&nbsp;</Text>
                          <Text decode>{ ele.District }&nbsp;</Text>{ ele.Address }
                          </View>
                        <View>
                          <Text>{ ele.CompanyName }</Text>
                          <View>{ ((ele.AveragePrice)/10000).toFixed(2) }<Text> 万元</Text></View>
                        </View>
                        <View>
                          <View>{ ele.BuildTraitType }</View>
                          <Text decode>均价&nbsp;</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )
              }) 
            }
            {
              JSON.stringify(buildingsData) == '[]' && (
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
            <View className='upDragBox' style={{display: JSON.stringify(buildingsData) == '[]' ? 'none': display}}>
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
    )
  }
}
