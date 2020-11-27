/* eslint-disable react/no-unused-state */
import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtModal, AtButton, AtActivityIndicator, AtLoadMore } from 'taro-ui'
import Header from '@/components/header/header'
import { set, get, toast } from '@/global_data'
import { imgUrl, throttle, splitThousand } from '@/utils/util'
import api from '@/api/api'
import './index.scss'

let timeout = null

export default class Index extends PureComponent {



  constructor () {
    super(...arguments)
    this.state = {
      title: '我的资产',
      navType: 'backHome',
      num: 'myCarport',
      datas: null,
      isOpened: false,
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
      creState: {
        clientX: '',
        clientY: ''
      },
      pullState: 0,
      status: 'noMore',
      page: 2,
      rows: 20
    }

    this.cancel = throttle(this.cancel1)
    this.backBuy = throttle(this.backBuy1)
  }
  componentWillMount () { 
    let param = this.$router.preload.ParkingType

    this.setState({
      current: param == 2 ? 0 : 1
    })
    this.getData(param)
  }
  config = {
    navigationStyle: 'custom'
  }

  // 跳转到资产详情
  goPage (id,status) {
    this.$preload({
      id,
      page: 'al',
      status
    })
    Taro.navigateTo({
      url: '../myCarport_detail/index'
    })
  }


  renderStatus (val) {
    switch (val) {
      case 0: { return <View className='tag_bisque'>草稿</View> }
      case 1:
        { return <View className='tag_bisque'>上架审批中</View> }
      case 2:
        {return <View className='tag_bisque'>挂牌中</View> }
      case 3:
        {return <View className='tag_bisque'>已下架</View> }
      case 4:
        { return <View className='tag_bisque'>支付锁定中</View> }
      case 5:
        { return <View className='tag_blue'>正常持有</View> }
      case 6:
        { return <View className='tag_bisque'>回购审批中</View> }
      case 7:
        { return <View className='tag_bisque'>已回购</View> }
      case 8:
        { return <View className='tag_bisque'>已注销</View> }
    }
  }

  // tab切换
  handleClick (value) {
    this.setState({
      current: value,
    }, () => {
      this.getData(value == 0 ? 2 : 3)
    })
  }

  //资产操作
  handle (type,id,CircleId,way,e) {
    e.stopPropagation()
    //用来判断是点击的支付还是转让,把状态存到全局变量中
    set('type',way)
    this.$preload({
      id,
      CircleId,
    })
    Taro.navigateTo({
      url: `../${type}/index`
    })
  }
  // 申请回购
  backBuy1 = (datas) => {

    // 获取视频验证随机数
    api.videoRandom({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      FaceType: 3,
      OrderCode: datas.ParkingId,
    }).then(res => {
      if (res.data.code === 200) {
        const data = res.data.data
        this.$preload({
          datas,
          // Warrant,
          payType: 'buy_back',
          code: data.Code,  // 随机数
          FaceCompareType: data.FaceCompareType
        })

        Taro.navigateTo({
          url: `../identityVerify/index`
        })
      }
    })

  }

  // 取消回购
  cancel1 = (ParkingId) => {

    api.cancelBackBuy({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      ParkingId
    }).then(res => {
      if (res.data.code === 200) {

        toast(res.data.info, 'success', 1500)

        setTimeout(() => {
          this.getData(this.state.current == 0 ? 2 : 3)
        }, 1500)

      }

    })

  }

  getDatas(params, downPullText, toast1) {
    api.parking({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      queryJson: JSON.stringify({
        ParkingType: params,
        state: '1,3,4,5,2,6'
      }),
      data: JSON.stringify({
        Page: 1,
        Rows: 10
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data.rows,
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

  // 获取列表数据
  getData (params, downPullText = '下拉刷新', toast1) {
    this.getDatas(params, downPullText, toast1)
  }

  getData1 (params, status) {
    Taro.showLoading({ title: 'loading...', mask: true })
    api.parking({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      queryJson: JSON.stringify({
        ParkingType: params,
        state: '1,3,4,5,2,6'
      }),
      data: JSON.stringify({
        Page: this.state.page + 1,
        Rows: this.state.rows + 10
      })
    }).then(res => {
      if (res.data.code === 200) {
        Taro.hideLoading()
        this.setState({
          datas: this.state.datas.concat(res.data.data.rows),
          status,
          page: this.state.page + 1,
          rows: this.state.rows + 10
        })
      }
    })
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
            this.getData(
              this.state.current == 0 ? 2 : 3,
              'loading','toast1'
            )
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
      this.getData1(
        this.state.current,
        'noMore'
      )
    }, 500)
  }


  render () {
    const { current, datas, isOpened, num, title, navType, display1, display2,
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      status } = this.state
    const tabList = [{ title: '区块链资产通凭证' }, { title: '区块链资产通权证' }]
    const titleHeight = get('titleHeight')
    const surHeight = get('titleHeight1') + 190
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`

    return (
      <View className='myCarport'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}>
          <AtTabs current={current} tabList={tabList} onClick={this.handleClick.bind(this)}>
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
                  {
                    JSON.stringify(datas) !== '[]' && datas!==null && datas.map(ele => {
                      return (
                        <View  
                          onClick={this.goPage.bind(this, ele.ParkingId, ele.State)} 
                          className='car_list' key={ele.CircleId}
                        >
                          <View className='item'>
                            <View>
                              <View className='itemTitle_wrap'>
                                <Image src={`${imgUrl}icon_pz.png`} className='itemImg' />
                                <Text className='itemTitle'>区块链资产通凭证信息</Text>
                                <View className='itemTag'>
                                  { this.renderStatus(ele.State) }
                                </View>
                              </View>
                              <View className='clear conTopMargin'>
                                <View className='itemContLeft'>
                                  <View className='textButton12'>
                                    <Text>面额<Text style={{fontSize: '18rpx'}}> (元)</Text>：</Text>
                                    <Text>{ splitThousand(ele.Price) }</Text>
                                  </View>
                                  <View className='textButton12'>
                                    <Text>年化收益率：</Text>
                                    <Text>{ele.FixedRate}%</Text>
                                  </View>
                                  <View>
                                    <Text>限制转让期：</Text>
                                    <Text>3个月</Text>
                                  </View>
                                </View>
                                <View className='itemContRight'>
                                  <View className='textButton12'>
                                    <Text>期限：</Text>
                                    <Text>{ ele.RepoTerm }个月</Text>
                                  </View>
                                  <View>
                                    <Text>凭证到期日：</Text>
                                    <Text>{ ele.BuyBackDate }</Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                          <View className='btn1'>
                            <View>
                              购买时间：{ ele.PayDate.split(' ')[0] }
                            </View>
                            <View>
                              <View>
                                {/* <AtButton type='secondary' size='small'>详情</AtButton> */}
                              </View>
                              {
                                ele.State != 6 && ele.Ifbuyback && ele.IfBtn && 
                                <View onClick={
                                    (e) => {
                                      e.stopPropagation()
                                      this.backBuy(ele, 0)
                                    }
                                  }
                                >
                                  <AtButton type='primary' size='small'>申请回购</AtButton>
                                </View>
                              }
                              {/* {
                                ele.State != 6 && ele.Usufruct == 0 && ele.IfBtn &&
                                <View onClick={
                                    (e) => {
                                      e.stopPropagation()
                                      this.backBuy(ele, 1)
                                    }
                                  }
                                >
                                  <AtButton type='primary' size='small'>回购换开权证</AtButton>
                                </View>
                              } */}
                              {
                                ele.State == 6 && ele.Warrant == 0 &&
                                <View onClick={
                                    (e) => {
                                      e.stopPropagation()
                                      this.cancel(ele.ParkingId)
                                    }
                                  }
                                >
                                  <AtButton type='primary' size='small'>取消回购</AtButton>
                                </View>
                              }
                            </View>
                          </View>

                        </View>
                      )
                    })  
                  }

                  {
                    JSON.stringify(datas) === '[]' && (
                      <View className='nodata'>
                        <View>
                          <Image src={`${imgUrl}park_default.png`} />
                          <View>暂无资产</View>
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
                  {
                    JSON.stringify(datas) !== '[]' && datas!==null && datas.map(ele => {
                      return (
                        <View  
                          onClick={this.goPage.bind(this,ele.ParkingId,ele.State)} 
                          className='car_list' key={ele.CircleId}
                        >
                          <View className='item'>
                            <View>
                              <View className='itemTitle_wrap'>
                                <Image src={`${imgUrl}icon_qz.png`} className='itemImg' />
                                <Text className='itemTitle'>区块链资产通权证信息</Text>
                                <View className='itemTag'>
                                  { this.renderStatus(ele.State) }
                                </View>
                              </View>
                              <View className='clear conTopMargin'>
                                <View className='itemContLeft'>
                                  <View className='textButton12'>
                                    <Text>资产号：</Text>
                                    <Text>{ele.ParkingCode}</Text>
                                  </View>
                                  <View className='textButton12'>
                                    <Text>面积：</Text>
                                    <Text>{ele.Acreage}㎡</Text>
                                  </View>
                                  <View>
                                    <Text>挂牌价<Text style={{fontSize: '18rpx'}}> (元)</Text>：</Text>
                                    <Text>{splitThousand(ele.SalePrice)}</Text>
                                  </View>
                                </View>
                                <View className='itemContRight' style={{marginTop:'42rpx'}}>
                                  <View className='textButton12'>
                                    <Text>所属商圈：</Text>
                                    <Text>{ele.CircleName }</Text>
                                  </View>
                                  <View>
                                    <Text>所属仓储：</Text>
                                    <Text>{ele.BuildingName}</Text>
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                          <View className='btn1'>
                            <View>
                              购买时间：{ ele.PayDate.split(' ')[0] }
                            </View>
                            <View>
                              <View>
                                {/* <AtButton type='secondary' size='small'>详情</AtButton> */}
                              </View>
                            </View>
                          </View>
                        </View>
                      )
                    })  
                  }

                  {
                    JSON.stringify(datas) == '[]' && (
                      <View className='nodata'>
                        <View>
                          <Image src={`${imgUrl}park_default.png`} />
                          <View>暂无资产</View>
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


        <AtModal
          isOpened={isOpened}
          title='摘牌'
          cancelText='取消'
          confirmText='确认'
          onCancel={() => this.setState({isOpened: false})}
          onConfirm={this.handleConfirm}
          content='确定执行此操作?'
        />

      </View>
    )
  }
}
