import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker, Image, ScrollView } from '@tarojs/components'
import { AtIcon, AtActivityIndicator, AtLoadMore } from 'taro-ui'
import { splitThousand, imgUrl } from '../../utils/util'
import Header from '../../components/header/header'
import { get, toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'


let timeout = null

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      num: 1,
      navType: 'backHome',
      title: '历史账单',
      // iconType: 'chevron-down',
      iconDate: 'chevron-down',
      // selType: ['全部','购买','转让','回购','提现','还款','充值'],
      // selKey: ['','1','2','3','4','5','6'],
      // selVal: '全部',
      // typeVal: '',
      startDate: '开始日期',  //开始日期
      startTime: '',            //开始日期,时间戳
      endtDate: '结束日期',   //结束日期
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

  changeIcon (type) {
    if (type === 'type') {
      // this.setState({
      //   iconType: 'chevron-up'
      // })
    }else if (type === 'date') {
      this.setState({
        iconDate: 'chevron-up'
      })
    }
  }
  cancel (type) {
    if (type === 'type') {
      // this.setState({
      //   iconType: 'chevron-down'
      // })
    }else if (type === 'date') {
      this.setState({
        iconDate: 'chevron-down'
      })
    }

  }

  navChange (type,e) {
    if (type === 'type') {
      // this.setState({
      //   selVal: this.state.selType[e.detail.value],
      //   iconType: 'chevron-down',
      //   typeVal: this.state.selKey[e.detail.value]
      // })
      // this.getData({
      //   CircleId: this.$router.preload.CircleId,
      //   Type: this.state.selKey[e.detail.value],
      //   startDate: this.state.startDate,
      //   endtDate: this.state.endtDate
      // })
    }else if (type === 'startDate') {
      this.setState({
        startDate: e.detail.value,
        startTime: new Date(e.detail.value).getTime(),
        iconDate: 'chevron-down'
      })
      this.getData({
        CircleId: this.$router.preload ? this.$router.preload.CircleId : '',
        StartTime: e.detail.value,
        EndTime: this.state.endtDate === '结束日期' ? '' : this.state.endtDate
      })
    }else if (type === 'endtDate') {
      if (this.state.startTime > new Date(e.detail.value).getTime()) {
        toast('开始日期不能大于结束日期','none',3000)
        return
      }
      this.setState({
        endtDate: e.detail.value,
        iconDate: 'chevron-down',
      })

      this.getData({
        CircleId: this.$router.preload ? this.$router.preload.CircleId : '',
        StartTime: this.state.startDate === '开始日期' ? '' : this.state.startDate,
        EndTime: e.detail.value
      })
    }
  }
  //获取当前的年月日
  date1 () {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth()+1
    let day = date.getDate()
    let dates = `${year}-${month}-${day}`
    return dates
  }

  getDatas(params, downPullText, toast1) {
    api.historyBill({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        Page: 1,
        Rows: 10,
        StartTime: params.StartTime,
        EndTime: params.EndTime,
        CircleId: params.CircleId
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data.rows,
          downPullText,
          page: 1,
          rows: 10,
        },() => {
          if (toast1) {
            toast('刷新成功','success',1500)
          }
        })
      }
    })
  }

  getData (params, downPullText = '下拉刷新', toast1) {
    this.getDatas(params, downPullText, toast1)

  }

  getData1 (params, status) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.historyBill({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        Page: this.state.page + 1,
        Rows: this.state.rows + 10,
        StartTime: params.StartTime,
        EndTime: params.EndTime,
        CircleId: params.CircleId
      })
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

  type (val) {
    let text
    if (val == 1) {
      text = '购买'
    }else if (val == 2) {
      text = '转让'
    }else if (val == 3) {
      text = '回购'
    }else if (val == 4) {
      text = '提现'
    }else if (val == 5) {
      text = '还款'
    }else if (val == 6) {
      text = '充值'
    }
    return text
  }


  componentWillMount () {
    let params = {
      StartTime: this.state.startDate === '开始日期' ? '' : this.state.startDate,
      EndTime: this.state.endDate === '结束日期' ? '' : this.state.endDate,
      CircleId: this.$router.preload ? this.$router.preload.CircleId : ''
    }
    this.getData(params)
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
              StartTime: that.state.startDate === '开始日期' ? '' : this.state.startDate,
              EndTime: that.state.endDate === '结束日期' ? '' : this.state.endDate
            }
            that.getData(params, 'loading', 'toast1')
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
        StartTime: this.state.startDate === '开始日期' ? '' : this.state.startDate,
        EndTime: this.state.endDate === '结束日期' ? '' : this.state.endDate,
        CircleId: this.$router.preload ? this.$router.preload.CircleId : ''
      }
      that.getData1(params, 'noMore')
    }, 500)
  }


  render () {
    const { num, title, datas, navType, startDate, endtDate, iconDate, display,
      isActive,
      scrollY,
      dragStyle,
      downPullStyle,
      downPullText,
      status } = this.state
    const titleHeight = get('titleHeight')
    const surHeight = get('titleHeight1') + 190
    dragStyle.height = `calc(100vh - ${surHeight}rpx)`
    
    let params = {
      StartTime: this.state.startDate === '开始日期' ? '' : this.state.startDate,
      EndTime: this.state.endDate === '结束日期' ? '' : this.state.endDate,
      CircleId: this.$router.preload ? this.$router.preload.CircleId : ''
    }
    return (
      <View className='boxs' >
        <Header onNum={num}  onTitle={title} onNavType={navType} />
        
        <View className='history_bill'
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View className='title'>
            <View onClick={this.changeIcon.bind(this,'type')}>
              {/* <Picker 
                mode='selector' 
                onCancel={this.cancel.bind(this,'type')}
                range={this.state.selType} 
                onChange={this.navChange.bind(this,'type')}
              >
                <View className='picker'>
                  <Text decode>{this.state.selVal}&nbsp;</Text>
                  <AtIcon value={this.state.iconType} size='21' color='#AEAEAE'></AtIcon>
                </View>
              </Picker> */}
            </View>
            <View onClick={this.changeIcon.bind(this,'date')}>
              <Picker 
                mode='date'
                end={this.date1()}
                onCancel={this.cancel.bind(this,'date')}
                onChange={this.navChange.bind(this,'startDate')}
              >
                <View className='picker'>
                  <Text decode>{startDate}&nbsp;</Text>
                  {/* <AtIcon value={ this.state.iconDate } size='21' color='#AEAEAE'></AtIcon> */}
                </View>
              </Picker>
              <Text decode>至&nbsp;</Text>
              <Picker 
                mode='date' 
                onCancel={this.cancel.bind(this,'date')}
                onChange={this.navChange.bind(this,'endtDate')}
              >
                <View className='picker'>
                  <Text decode>{endtDate}&nbsp;</Text>
                  <AtIcon value={iconDate} size='21' color='#AEAEAE'></AtIcon>
                </View>
              </Picker>
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
              <View className='list'>
                {
                  JSON.stringify(datas) !== '[]' && datas!==null && datas.map(ele => {
                    return (
                      <View className='item' key={ele.OrderCode}>
                        <View>
                          <View>{ this.type(ele.Type) }</View>
                          <View style={{color: ele.Description==='支出'?'':'#F6724A'}}>{ ele.Description==='支出'?'-':'+' }{ splitThousand(ele.Amt) }</View>
                        </View>
                        <View>{ ele.Date }</View>
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
                      <View>未搜索到账单</View>
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
    )
  }
}
