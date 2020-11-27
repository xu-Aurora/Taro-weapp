import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker, ScrollView, Image } from '@tarojs/components'
import { AtIcon, AtActivityIndicator, AtLoadMore } from 'taro-ui'
import Search from '@/components/Search';
import { get, toast } from '../../global_data'
import { imgUrl } from '../../utils/util'
import api from '../../api/api'
import './index.scss'

let timeout = null
let hList = Taro.getStorageSync("search_cache")

export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '仓储'
  }

  constructor () {
    super(...arguments)
    this.state = {
      // iconCity: 'chevron-down',
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
      selPrice: ['价格','1万以下','1-5万', '5-20万', '20-50万', '50万以上'],
      priceCode: ['0','-10000','10000-50000','50000-200000','200000-500000','500000-'],
      priceCode1: '',
      selPriceVal: '价格',
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
      buildingsData: [],  //仓储列表
      display: 'none',
      circleLength: '',

      searchText: '',
      flag: false,   // 用来判断展示列表还是搜索记录     
      hotList: ['栏目1', '栏目2', '栏目3', '栏目4', '栏目5'],

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
      searchText: value,
    })
  }

  /**
   * 
   * @param {*} value 搜索框的值
   * @param {*} cityCode 城市code
   */
  onActionClick = (value, cityCode) => {
    const { priceCode1, susCode1, tareaCode1, typeCode1 } = this.state
    if (value === '') {
      toast('请输入关键字', 'none', 1500)
    } else {
      this.setState({
        flag: false
      })
      this.getBuildings({
        CityCode: cityCode,         // 市code
        BuildTraitTypes: typeCode1, // 楼盘类型code
        DistrictCode: tareaCode1,   // 区code
        CircleIds: susCode1,        // 商圈id 
        Price: priceCode1,          // 车位价格值
        KeyWord: value 
      })
    }

  }

  initGetDatas(params) {
    this.getDatas(params)
    this.setState({
      selBusVal: '商圈',
      selAreaVal: '区域' ,
      selPriceVal: '价格' ,
      selTypeVal: '楼盘类型'
    })
  }

  searchStart = () => {
    const { searchText } = this.state

    if (searchText == "") {
      toast('请输入关键字', 'none', 1500)

    } else {
      Taro.getStorage({
        key: "search_cache",
        success: (res) => {
          let list = res.data;
          if (list.length > 5) {
            for (let item of list) {
              if (item == searchText) {
                return;
              }
            }
            list.pop();
            list.unshift(searchText);
          } else {
            for (let item of list) {
              if (item == searchText) {
                return;
              }
            }
            list.unshift(searchText);
          }
          hList = list
          Taro.setStorage({
            key: "search_cache",
            data: list
          })
        },
        fail(err) {
          hList = []
          hList.push(searchText);
          Taro.setStorage({
            key: "search_cache",
            data: hList
          });
        }
      });
    }
  };

  keywordsClick = (item) => {
    // 关键词搜索与历史搜索
    this.setState({
      searchText: item
    }, () => {
      this.searchStart();
    });
  };


  changeIcon (type) { 
    if (type === 'bus') {
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
  navChange (type, e) {

    this.setState({
      display: 'none'
    })
    const { selArea, searchText, tareaCode1, priceCode, typeCode, selType, selPrice, areaCode, cityCode, susCode1, typeCode1, priceCode1, selBus, susCode, areaCode1 } = this.state

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
        KeyWord: searchText 
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
        KeyWord: searchText 
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
        KeyWord: searchText 
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
        KeyWord: searchText 
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



  // 获取仓储列表数据
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
      KeyWord: this.state.searchText,                   // 输入框
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
              KeyWord: this.state.searchText                   // 输入框
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
        KeyWord: this.state.searchText                   // 输入框
      }
      this.getBuildings1(params, 'noMore')
    }, 500)
  }

  render () {
    const { buildingsData, display, selBus, selBusVal, iconBus, iconType, circleLength,
      selArea, selAreaVal, iconArea, selPrice, selPriceVal, iconPrice, selType, selTypeVal, 
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      hotList,
      searchText,
      flag,
      status } = this.state
    const house_default = `${imgUrl}house_default.png`
    const house_nodata = `${imgUrl}house_nodata.png`
    const surHeight = get('titleHeight1') + 140
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`

    return (
      <View className='community'>

        <View>
          <View className='search_x'>
            <Search 
              onActionClick={this.onActionClick} 
              getValue={(searchText) => this.setState({searchText})} 
              changeCity={this.initGetDatas.bind(this)}
              value={searchText}
              onFocus={() => this.setState({flag: true})}
              datas={''}
            />
          </View>

        </View>

        {
          flag ? (
            <View className='search_history' style={{height: `calc(100vh - 44px)`}}>
                {hList.length > 0 ? (
                  <View className={"s-circle"}>
                    <View className="header">
                      历史记录
                      <Image
                        src={require("@/assets/images/delete.svg")}
                        mode="aspectFit"
                        onClick={this.delhistory}
                      ></Image>
                    </View>
                    <View className="list">
                      {hList.map((item, index) => {
                        return (
                          <View
                            key={index}
                            onClick={this.keywordsClick.bind(this, item)}
                          >
                            {item}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
                <View className={"wanted-circle"}>
                  <View className="header">猜你想搜的</View>
                  <View className="list">
                    {hotList.map((item, index) => {
                      return (
                        <View
                          key={index}
                          onClick={this.keywordsClick.bind(this, item)}
                        >
                          {item}
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
          ) : (
            <View>
              <View className='top_search' style={{paddingTop: '6px'}}>
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
                  {/* <View onClick={this.changeIcon.bind(this,'price')}>
                    <Picker mode='selector' range={selPrice} 
                      onCancel={this.cancel.bind(this,'price')}
                      onChange={this.navChange.bind(this,'price')}
                    >
                      <View className='picker'>
                        <Text decode>{ selPriceVal }&nbsp;</Text>
                        <AtIcon value={iconPrice} size='18' color='#AEAEAE'></AtIcon>
                      </View>
                    </Picker>
                  </View> */}
                  {/* <View onClick={this.changeIcon.bind(this,'type')}>
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
                  </View> */}
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
                    buildingsData.length> 0 ? buildingsData.map(ele => {
                      return (
                        <View className='list_' key={ele.BuildingId}>
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
                              </View>
                            </View>
                          </View>
                        </View>
                      )
                    }) :
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
                  }

                  <View className='upDragBox' style={{display: buildingsData.length<=0 ? 'none': display}}>
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


      </View>
    )
  }
}