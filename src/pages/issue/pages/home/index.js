import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker, ScrollView, Image } from '@tarojs/components'
import { AtIcon, AtActionSheet, AtActionSheetItem, AtModal, AtActivityIndicator, AtLoadMore } from 'taro-ui'
import Header from '../../../../components/header/header'
import { imgUrl } from '../../../../utils/util'
import List from '../../components/list/index'
import { get, set, toast } from '../../../../global_data'
import api from '../../../../api/api'
import './index.scss'

let timeout = null
let citys = Taro.getStorageSync('city')

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      navType: 'back',
      title: '发布',
      num: 'issue_home',
      iconCity: 'chevron-down',
      iconIssue: 'chevron-down',
      city: [],       //市
      province: [],   //省
      cityVal: '',    //选择数据展示的值
      selCity: [],
      multiIndex:[0,0],
      flag: false,    //用来判断是否用滑动选择省市
      isOpened: false,
      isOpened1: false,
      datas: [],
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
          set('CityCode',ele.AreaCode)
          this.getLists({
            CityName: ele.AreaCode
          })
        }
      })

    }else{
      set('CityCode','110100')
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
          city
        })
      }
    })
  }


  goPage (type,num) {
    this.$preload({
      title: type,
      num
    })
    Taro.navigateTo({
      url: '../release/index'
    })
  }

  //跳转新增页面
  handleItem (type, num) {
    this.setState({
      iconIssue: 'chevron-down',
      isOpened: false
    })
    if (!Taro.getStorageSync('userInfo')) {
      this.setState({
        isOpened1: true
      })
    }else{
      this.$preload({
        type,
        num
      })
      Taro.navigateTo({
        url: '../add/index'
      })
    }
  }

  //获取列表数据
  getLists (params, downPullText = '下拉刷新', toast1) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.postList({
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      LoginMark: Taro.getStorageSync('uuid'),
      Page: 1,
      Rows: 10,
      CityName: params.CityName
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
            toast('刷新成功', 'success', 1500)
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
      CityName: params.CityName
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
      cityVal: get('City') ? get('City') : JSON.parse(citys).citys
    })

    this.getLists({
      CityName: get('CityCode') ? get('CityCode') : JSON.parse(citys).cityCode
    })
    this.getAreaZone()
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
              CityName: that.state.cityCode,
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
      let params = {
        CityName: that.state.cityCode,
      }
      this.getLists1(params, 'noMore')
    }, 500)
  }
  


  render () {
    const { datas, display, num, title, navType, cityVal, iconCity, multiIndex, province,
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      status } = this.state
    const titleHeight = get('titleHeight')
    const surHeight = get('titleHeight1') + 465
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`

    return (
      <View className='issue_home'>
        <Header onNum={num}  onTitle={title} onNavType={navType} />
        <View className='boxs'
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View className='title'>
            <View onClick={() => this.setState({iconCity: 'chevron-up'})}>
              <Picker 
                mode='multiSelector'
                onCancel={()=>this.setState({iconCity: 'chevron-down'})}
                value={multiIndex} 
                range={province} 
                oncolumnchange={this.columnchange.bind(this)}
                onChange={this.picker.bind(this)}
              >
                <View>
                  <Text className='mar_r'>{ cityVal }</Text>
                  <AtIcon value={iconCity} size='21' color='#AEAEAE'></AtIcon>
                </View>
              </Picker>
            </View>
            <View>
              <Text className='mar_r' onClick={() => {
                this.setState({iconIssue: 'chevron-up',isOpened: true})
              }}
              >免费发布</Text>
              <AtIcon value={this.state.iconIssue} size='21' color='#AEAEAE'></AtIcon>
            </View>
          </View>

          <View className='content'>
            <View className='header'>
              <View>
                <View onClick={this.goPage.bind(this,'车位求购',1)}>
                  <View className='hor_center'><Image src={`${imgUrl}icon_buy.png`} /></View>
                  <View className='hor_center'>车位求购</View>
                </View>
                <View onClick={this.goPage.bind(this,'车位求租',2)}>
                  <View className='hor_center'><Image src={`${imgUrl}icon_demand.png`} /></View>
                  <View className='hor_center'>车位求租</View>
                </View>
                <View onClick={this.goPage.bind(this,'车位出租',3)}>
                  <View className='hor_center'><Image src={`${imgUrl}icon_rent.png`} /></View>
                  <View className='hor_center'>车位出租</View>
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
                <List onDatas={datas} />
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
        </View>

        <AtActionSheet 
          isOpened={this.state.isOpened} 
          onCancel={() => this.setState({isOpened: false})}
          onClose={() => this.setState({isOpened: false,iconIssue: 'chevron-down'})}
          cancelText='取消'
        >
          <AtActionSheetItem onClick={this.handleItem.bind(this,'车位求购',1)}>
            车位求购发布
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.handleItem.bind(this,'车位求租',2)}>
            车位求租发布
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.handleItem.bind(this,'车位出租',3)}>
            车位出租发布
          </AtActionSheetItem>
        </AtActionSheet>

        <AtModal
          isOpened={this.state.isOpened1}
          cancelText='取消'
          confirmText='去登陆'
          onCancel={() => this.setState({isOpened1: false})}
          onClose={() => this.setState({isOpened1: false})}
          onConfirm={() => {
            Taro.redirectTo({
              url: '../../../login/index'
            })
          }}
          content='您还未登录，请先登录后进行发布'
        />
      </View>
    )
  }
}
