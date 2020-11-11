import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtActivityIndicator, AtLoadMore } from 'taro-ui'
import Header from '../../../../components/header/header'
import { imgUrl } from '../../../../utils/util'
import { get, toast } from '../../../../global_data'
import './index.scss'
import api from '../../../../api/api'

let timeout = null

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      back: 'myRelease',
      title: '我的发布',      //标题
      navType: 'backHome',
      sub: true,      //用来区分主包还是子包
      current: 0,
      datas: null,
      display1: 'none',
      display2: 'none',

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

  handleClick (value) {
    this.setState({
      current: value,
    },() => {
      if (value == 0) {
        this.getData(1)  //已发布
      }else if(value == 1){
        this.getData(0) //草稿
      }
    })
  }
  //跳转详情
  goDetail (PostId) {
    this.$preload({
      PostId
    })
    Taro.navigateTo({
      url: '../detail/index'
    })
  }
  //跳转编辑
  goEdit (PostId) {
    this.$preload({
      PostId
    })
    Taro.navigateTo({
      url: '../edit/index'
    })
  }
  //获取列表数据
  getData (PostState, downPullText = '下拉刷新', toast1) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.myPostList({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      Page: 1,
      Rows: 10,
      PostState
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

  getData1 (PostState, status) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.myPostList({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      Page: this.state.page + 1,
      Rows: this.state.rows + 10,
      PostState
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
    this.getData(1)
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
            if (this.state.current == 0) {
              this.getData(1, 'loading', 'toast1')  //已发布
            }else if(this.state.current  == 1){
              this.getData(0, 'loading', 'toast1') //草稿
            }
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
  onReachBottom (num) {
    this.getMoreRecList(num);
  }
  // 获取更多推荐列表
  getMoreRecList = (num) => {
    let that = this;
    if (num.currentTarget.dataset.eScrolltolowerAA === 1) {
      that.setState({
        status: 'loading',
        display1: 'block'
      })
    } else if (num.currentTarget.dataset.eScrolltolowerAA === 2) {
      that.setState({
        status: 'loading',
        display2: 'block'
      })
    }

    setTimeout(() => {
      if (this.state.current == 0) {
        this.getData1(1, 'noMore')  //已发布
      }else if(this.state.current  == 1){
        this.getData1(0, 'noMore') //草稿
      }

    }, 500)
  }

  render () {
    const { back, sub, title, navType, datas, current, display1, display2,
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      status } = this.state
    const tabList = [{ title: '已发布' }, { title: '草稿' }]
    const titleHeight = get('titleHeight')
    const surHeight = get('titleHeight1') + 190
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`
    return (
      <View className='myRelease'>
        <Header onNum={back} onSub={sub} onTitle={title} onNavType={navType} />
        <View className='contents' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          
          <AtTabs current={this.state.current} 
            tabList={tabList} onClick={this.handleClick.bind(this)}
          >
            <AtTabsPane current={current} index={0}>
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
                  onScrollToLower={this.onReachBottom.bind(this, 1)}
                  scrollWithAnimation
                >
                  <View className='list'>
                    { 
                      JSON.stringify(datas) !== '[]' && datas!==null && datas.map(ele => {
                        return (
                          <View className='item' key={ele.PostId} >
                            <View className='left' onClick={this.goDetail.bind(this,ele.PostId)}>
                              <View>{ ele.Title }</View>
                              <View>
                                <Text>{ ele.toTime }小</Text>
                                <Text>浏览{ ele.ViewCount }</Text>
                              </View>
                            </View>
                            <View className='right' onClick={this.goEdit.bind(this,ele.PostId)}>
                              <View>编辑</View>
                            </View>
                          </View>
                        )
                      })
                    }
                  </View>
                  {
                    JSON.stringify(datas) == '[]' && (
                      <View className='nodata' style={{height: `calc(100vh - ${surHeight}rpx)`,marginRight:'20rpx'}}>
                        <View>
                          <Image src={`${imgUrl}order_nodata.png`} />
                          <View>暂无发布</View>
                        </View>
                      </View>
                    )
                  }
                  
                  <View className='upDragBox' style={{display: display1}}>
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
            </AtTabsPane>
            <AtTabsPane current={current} index={1}>
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
                  onScrollToLower={this.onReachBottom.bind(this, 2)}
                  scrollWithAnimation
                >
                  <View className='list'>
                    {
                      JSON.stringify(datas) !== '[]' && datas!==null &&  datas.map(ele => {
                        return (
                          <View className='item' key={ele.PostId} onClick={this.goEdit.bind(this,ele.PostId)}>
                            <View className='left'>
                              <View>{ ele.Title }</View>
                              <View>
                                <Text>{ ele.toTime }</Text>
                              </View>
                            </View>
                            {/* <View className='right' onClick={ this.goEdit.bind(this,ele.PostId) }>
                              <View style={{borderLeft: '0rpx'}}>编辑</View>
                            </View> */}
                          </View>
                        )
                      }) 
                    }
                  </View>
                  {
                    JSON.stringify(datas) == '[]' && (
                      <View className='nodata' style={{height: `calc(100vh - ${surHeight}rpx)`,marginRight:'20rpx'}}>
                        <View>
                          <Image src={`${imgUrl}order_nodata.png`} />
                          <View>暂无发布</View>
                        </View>
                      </View>
                    )
                  }
                  
                  <View className='upDragBox' style={{display: display2}}>
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
            </AtTabsPane>
          </AtTabs>

        </View>
      </View>
    )
  }
}
