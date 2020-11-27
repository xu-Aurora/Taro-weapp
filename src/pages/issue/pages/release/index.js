import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker, ScrollView, Image } from '@tarojs/components'
import { AtSearchBar, AtIcon, AtActionSheet, AtActionSheetItem, AtActivityIndicator, AtLoadMore } from 'taro-ui'
import Header from '../../../../components/header/header'
import { get, set, toast } from '../../../../global_data'
import List from '../../components/list/index'
import { imgUrl } from '../../../../utils/util'
import api from '../../../../api/api'
import './index.scss'

let citys = Taro.getStorageSync('city')
let timeout = null

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      num: '',
      hot: '最新',
      back: 'release',
      navType: 'backHome',
      title: '',
      sub: true,    //用来区分主包还是子包
      seatchVal: '',
      iconCity: 'chevron-down',
      iconArea: 'chevron-down',
      iconPrice: 'chevron-down',
      iconType: 'chevron-down',
      selArea: [],    //区
      areaCode: [],   //区的code数据
      areaCode1: '',   //用来储存选中的区code
      selAreaVal: '区域',
      selPrice: ['资产价格','1万以下','1-5万', '5-20万', '20-50万', '50万以上'],
      priceCode: ['0','-10000','10000-50000','50000-200000','200000-500000','500000-'],
      priceCode1: '',
      selPriceVal: '资产价格',
      selType: [],    //资产类型
      typeCode1: '',    //用来储存选中的资产类型的code
      selTypeVal: '资产类型',
      city: [],       //市
      cityCode: '',
      province: [],   //省
      cityVal: '',    //选择数据展示的值
      selCity: [],
      multiIndex:[0,0],
      flag: false,    //用来判断是否用滑动选择省市
      isOpened: false,
      datas: null,
      display: 'none',

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
    api.postList({
      LoginMark: Taro.getStorageSync('uuid')?Taro.getStorageSync('uuid'):'',
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      PostType: this.$router.preload.num,
      CityName: get('CityCode') ? get('CityCode') : JSON.parse(citys).cityCode,
      KeyWord: this.state.seatchVal
    }).then(res => {
      if (res.data.code === 200) {
        Taro.hideLoading()
        this.setState({
          datas: res.data.data.rows,
          selAreaVal: '区域',
          selPriceVal: '资产价格',
          selTypeVal: '资产类型'
        })
      }
    })
  }

  changeIcon (type) {
    if (type === 'city') {
      this.setState({
        iconCity: 'chevron-up'
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
            areaCode1: '',
            typeCode1: '',
            priceCode1: '',
            seatchVal: ''
          })
          this.getArea({CityCode: ele.AreaCode})
          this.getLists({
            CityCode: ele.AreaCode,
            PostType: this.state.num
          })
        }
      })
    }else{
      this.setState({
        cityCode: '110100',
        areaCode1: '',
        typeCode1: '',
        priceCode1: '',
        seatchVal: ''
      })
      this.getArea({CityCode: '110100'})
      set('CityCode','110100')
      this.getLists({
        CityCode: '110100',
        PostType: this.state.num
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

  //nav选择
  navChange (type,e) {
    const { seatchVal, selArea, areaCode, cityCode, typeCode1, priceCode, priceCode1, Sord, selPrice, areaCode1, selType } = this.state
    if (type === 'area') {
      this.setState({
        selAreaVal: selArea[e.detail.value],
        iconArea: 'chevron-down',
        areaCode1: areaCode[e.detail.value] == 0 ? '' : areaCode[e.detail.value]
      })
      this.getLists({
        CityCode: cityCode,  //市code
        CountyName: areaCode[e.detail.value] == 0 ? '' : areaCode[e.detail.value],  //区code
        ParkingType: typeCode1,  //商圈类型code
        Price: priceCode1,   //资产价格值
        Sord: Sord,
        KeyWord: seatchVal
      })
    }else if (type === 'price') {
      this.setState({
        selPriceVal: selPrice[e.detail.value],
        iconPrice: 'chevron-down',
        priceCode1: priceCode[e.detail.value] == 0 ? '' : priceCode[e.detail.value]
      })
      this.getLists({
        CityCode: cityCode,    //市code
        Price: priceCode[e.detail.value] == 0 ? '' : priceCode[e.detail.value],  //资产价格值
        CountyName: areaCode1,   //区code
        ParkingType: typeCode1,  //商圈类型code
        Sord: this.state.Sord,
        KeyWord: seatchVal
      })
    }else if (type === 'type') {
      this.setState({
        selTypeVal: selType[e.detail.value],
        iconType: 'chevron-down',
        typeCode1: selType[e.detail.value]
      })
      this.getLists({
        CityCode: cityCode,  //市code
        ParkingType: selType[e.detail.value] == '资产类型' ? '' : selType[e.detail.value], //楼盘类型code
        CountyName: areaCode1,   //区code
        Price: priceCode1,   //资产价格值
        Sord: Sord,
        KeyWord: seatchVal
      })
    }
    this.setState({
      isOpened: false
    })
  }

  //获取省市数据
  getAreaZone () {
    api.areaZone({
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
        let province = []
        let city = []
        res.data.data.forEach(ele => {
          province.push(ele.AreaName)
          city.push(ele.SubsetList)
        })
        this.setState({
          province: [province,['北京']],
          city,
          cityVal: JSON.parse(Taro.getStorageSync('city')).citys,
          cityCode: JSON.parse(Taro.getStorageSync('city')).cityCode
        })
      }
    })
  }
  //获取区的数据
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
  //获取资产类型
  getParkType () {
    api.buildTraitType({
      data: 'ParkingType',
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
        let datas = ['资产类型']
        let code = []
        res.data.data.forEach(ele => {
          datas.push(ele.F_ItemName.slice(0,4))
          code.push(ele.F_ItemValue)
        })
        this.setState({
          selType: datas,
        })
      }
    })
  }

  //排序
  sort (type) {
    this.setState({
      isOpened: false,
      Sord: type,
      hot: type === 'ModifyDate' ? '最新' : '最热'
    },() => {
      Taro.showLoading({ title: 'loading...', mask: true })
      this.getLists({
        Sord: type,
        CityName: this.state.cityCode,
        ParkingType: this.state.typeCode1,
        CountyName: this.state.areaCode1,
        Price: this.state.priceCode1,
        PostType: this.state.num 
      })
    })
  }

  //获取列表数据
  getLists (params, downPullText = '下拉刷新', toast1) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.postList({
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      LoginMark: Taro.getStorageSync('uuid'),
      Page: 1,
      Rows: 10,
      PostType: this.$router.preload.num,
      CityName: params.CityName,
      KeyWord: params.KeyWord,
      ParkingType: params.ParkingType,  //商圈类型code
      Price: params.Price,   //资产价格值
      Sord: params.Sord,
      CountyName: params.CountyName
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data.rows,
          downPullText,
          page: 1,
          rows: 10
        },() => {
          Taro.hideLoading()
          if (toast1) {
            toast('刷新成功','success',1500)
          }
        })
      }
    })
  }
  getLists1 (params, status) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.postList({
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      LoginMark: Taro.getStorageSync('uuid'),
      Page: this.state.page + 1,
      Rows: this.state.rows + 1,
      PostType: this.$router.preload.num,
      CityName: params.CityName,
      KeyWord: params.KeyWord,
      ParkingType: params.ParkingType,  //商圈类型code
      Price: params.Price,   //资产价格值
      Sord: params.Sord,
      CountyName: params.CountyName
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: this.state.datas.concat(res.data.data.rows),
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
    
    this.setState({
      cityVal: get('City') ? get('City') : JSON.parse(citys).citys,
      cityCode: get('CityCode') ? get('CityCode') : JSON.parse(citys).cityCode,
      title: this.$router.preload.title,
      num: this.$router.preload.num
    })
    const { seatchVal, typeCode1, Sord, priceCode1, areaCode1 } = this.state
    this.getLists({
      CityName: get('CityCode') ? get('CityCode') : JSON.parse(citys).cityCode,
      KeyWord: seatchVal,
      ParkingType: typeCode1,  
      Price: priceCode1,   
      Sord: Sord,
      CountyName: areaCode1
    })
    this.getAreaZone()
    this.getArea({
      CityCode: get('CityCode') ? get('CityCode') : JSON.parse(citys).cityCode,
      existLoading: true
    })
    this.getParkType()
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
            const { cityCode, seatchVal, typeCode1, Sord, priceCode1, areaCode1 } = that.state
            let params = {
              CityName: cityCode,
              KeyWord: seatchVal,
              ParkingType: typeCode1,  
              Price: priceCode1,   
              Sord: Sord,
              CountyName: areaCode1
            }
            that.getLists(params, 'loading', 'toast1')
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
      const { cityCode, seatchVal, typeCode1, Sord, priceCode1, areaCode1 } = that.state
      let params = {
        CityName: cityCode,
        KeyWord: seatchVal,
        ParkingType: typeCode1,  
        Price: priceCode1,   
        Sord: Sord,
        CountyName: areaCode1
      }
      this.getLists1(params, 'noMore')
    }, 500)
  }

  render () {
    const { back, hot, title, sub, datas, display, navType, seatchVal, cityVal, iconCity, province, multiIndex, isOpened,
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      status } = this.state
    const titleHeight = get('titleHeight')
    const surHeight = get('titleHeight1') + 300
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`

    return (
      <View className='release'>
        <Header onNum={back}  onTitle={title} onSub={sub} onNavType={navType} />
        
        <View className='contents' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          {/* 顶部搜索及select */}
          <View className='top_search' style={{marginBottom: '20rpx'}}>
            <AtSearchBar
              placeholder='请输入仓储名称'
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
                  <AtIcon value={iconCity} size='21' color='#AEAEAE'></AtIcon>
                  <Text className='line'></Text>
                </View>
              </Picker>

            </View> 

            <View className='nav_select'>
              <View onClick={this.changeIcon.bind(this,'area')}>
                <Picker 
                  mode='selector' 
                  onCancel={this.cancel.bind(this,'area')}
                  range={this.state.selArea} 
                  onChange={this.navChange.bind(this,'area')}
                >
                  <View className='picker'>
                    <Text decode>{this.state.selAreaVal}&nbsp;</Text>
                    <AtIcon value={this.state.iconArea} size='21' color='#AEAEAE'></AtIcon>
                  </View>
                </Picker>
              </View>
              <View onClick={this.changeIcon.bind(this,'price')}>
                <Picker 
                  mode='selector' 
                  onCancel={this.cancel.bind(this,'price')}
                  range={this.state.selPrice} 
                  onChange={this.navChange.bind(this,'price')}
                >
                  <View className='picker'>
                    <Text decode>{this.state.selPriceVal}&nbsp;</Text>
                    <AtIcon value={this.state.iconPrice} size='21' color='#AEAEAE'></AtIcon>
                  </View>
                </Picker>
              </View>
              <View onClick={this.changeIcon.bind(this,'type')}>
                <Picker 
                  mode='selector' 
                  onCancel={this.cancel.bind(this,'type')}
                  range={this.state.selType} 
                  onChange={this.navChange.bind(this,'type')}
                >
                  <View className='picker'>
                    <Text decode>{this.state.selTypeVal}&nbsp;</Text>
                    <AtIcon value={this.state.iconType} size='21' color='#AEAEAE'></AtIcon>
                  </View>
                </Picker>
              </View>
              <View onClick={() => this.setState({isOpened: true})} className='sort'>
                <Text>{ hot }发布</Text>
                <View><Image src={`${imgUrl}rank.png`} /></View>
              </View>
            </View>
          </View>
          <View className='dragUpdatePage' style={{height: `calc(100vh - ${surHeight}rpx)`}}>
            <View className='downDragBox' style={downPullStyle}>
              <AtActivityIndicator content={downPullText} />
            </View>
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
              <List onDatas={datas} onHot={hot} />
              {
                JSON.stringify(datas) == '[]' && (
                  <View className='nodata'>
                    <View>
                      <Image src={`${imgUrl}order_nodata.png`} />
                      <View>暂无数据</View>
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
          <AtActionSheetItem onClick={this.sort.bind(this,'ModifyDate')}>最新发布</AtActionSheetItem>
          <AtActionSheetItem onClick={this.sort.bind(this,'ViewCount')}>最热发布</AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}
