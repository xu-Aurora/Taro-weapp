import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, ScrollView, Text } from '@tarojs/components'
import { AtActivityIndicator, AtLoadMore } from 'taro-ui'
import { imgUrl, splitThousand } from '../../utils/util'
import { toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'

let timeout = null

export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '累计收益'
  }

  constructor () {
    super(...arguments)
    this.state = {
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

  getDatas(downPullText, toast1) {
    api.myProfit({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        Page: 1,
        Rows: 10,
        CircleId: this.$router.preload ? this.$router.preload.CircleId : ''
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data.rows,
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

  getData (downPullText = '下拉刷新', toast1) {
    this.getDatas(downPullText, toast1)

  }
  getData1 (status) {
    Taro.showLoading({ title: 'loading...', mask: true })
    api.myProfit({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        Page: this.state.page + 1,
        Rows: this.state.rows + 10,
        CircleId: this.$router.preload ? this.$router.preload.CircleId : ''
      })
    }).then(res => {
      Taro.hideLoading()
      if (res.data.code === 200) {
        this.setState({
          datas: this.state.datas.concat(res.data.data.rows),
          status,
          page: this.state.page + 1,
          rows: this.state.rows + 10
        })
      }
    })
  }

  goPage(id) {
    this.$preload({
      id,
      page: 'al'
    })

    Taro.navigateTo({
      url: '../car_detail/index'
    })
  }


  componentDidShow () {
    this.getData()
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
            that.getData('loading', 'toast1')
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
      that.getData1('noMore', 'toast1')
    }, 500)
  }


  render () {
    const { datas, isActive, scrollY, dragStyle, downPullStyle, downPullText, status, display } = this.state
    dragStyle.height = `100vh`
    
    return (
      <View className='busArea'>
        <View className='dragUpdatePage' style={{height: '100vh'}}>
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
            <View className='aw_list'>
              {
                JSON.stringify(datas) !== '[]' && datas!==null  && datas.map(ele => {
                  return (
                    <View 
                      className='list_item2' 
                      key={ele.ParkingId}
                      onClick={this.goPage.bind(this, ele.ParkingId)}
                    >
                      <View className='clear list_top'>
                        <View className='list_top_title'>区块链资产通凭证</View>
                        <View className='list_top_Price'>
                          +{splitThousand(ele.ProfitRate)}
                          <Text style={{fontSize: '24rpx'}}> (元)</Text>
                        </View>
                      </View>
                      <View className='list_center clear'>
                        <View className='list_center_title'>编号：{ ele.ParkingId == null ? '暂无' : ele.ParkingId }</View>
                        <Image className='list_center_img' src={`${imgUrl}arrow_s@2x.png`} />
                      </View>
                      <View className='list_time'>
                        <View>{ele.ProfitTime}</View>
                      </View>
                    </View>
                  )
                })
              }
            </View>
            {
              JSON.stringify(datas) == '[]' && (
                <View className='nodata' style={{height: 'calc(100% - 20rpx)'}}>
                  <View>
                    <Image src={`${imgUrl}order_nodata.png`} />
                    <View>未查询到数据</View>
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
    )
  }
}
