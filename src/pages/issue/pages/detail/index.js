import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem, Text } from '@tarojs/components'
import Header from '../../../../components/header/header'
import { get } from '../../../../global_data'
import { splitThousand, imgUrl } from '../../../../utils/util'
import './index.scss'
import api from '../../../../api/api'

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      back: 1,
      title: '详情',
      navType: 'backHome',
      sub: true,    //用来区分主包还是子包
      datas: {
        Img: [],
        Tel: ''
      },
      currentSwiper: 0
    }
  }
  //获取详情数据
  getData (params) {
    Taro.showLoading({title: 'loading...', mask: true})
    api.postDetail(params).then(res => {
      if (res.data.code === 200) {
        Taro.hideLoading()
        this.setState({
          datas: res.data.data
        })
      }
    })
  }
  

  //轮播图
  swiperChange = (e) => {
    this.setState({
      currentSwiper: e.detail.current
    })
  }

  type (val) {
    let text
    if (val === 1) {
      text = '求购'
    }else if (val === 2) {
      text = '求租'
    }else if (val === 3) {
      text = '出租'
    }
    return text
  }
  //打电话
  call (tel) {
    Taro.makePhoneCall({
      phoneNumber: `${tel}` 
    })
  }

  componentWillMount () { 
    let params = {
      LoginMark: Taro.getStorageSync('uuid')?Taro.getStorageSync('uuid'):'',
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      PostId: this.$router.preload.PostId
    }
    //累加浏览量
    api.viewPost({
      PostId: this.$router.preload.PostId
    }).then(res => {
      if (res.data.code === 200) {
        this.getData(params)
      }
    })
  }

  render () {
    const { back, title, sub, datas, navType } = this.state
    const titleHeight = get('titleHeight')
    const img_default = `${imgUrl}park_nodata.png`
    return (
      <View className='detail' style={{paddingBottom: datas.Type===3?'272rpx':'0rpx'}}>
        <Header onNum={back}  onTitle={title} onSub={sub} onNavType={navType} />

        <View className='contents' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View className='top'>
            <View className='title'>{ datas.Title }</View>
            <View className='visit'>
              <Text>{ datas.toTime }</Text>
              <Text>浏览{ datas.ViewCount }</Text>
            </View>

            {
              datas.Type === 3 && (
                <View className='swipers' style={{marginBottom: '48rpx'}}>
                  <Swiper
                    className='test-h'
                    circular
                    autoplay
                    currentSwiper={this.state.currentSwiper}
                    onChange={this.swiperChange}
                  >
                    {
                      datas.Imgs.length>0 ? datas.Imgs.map((ele) => {
                        return (
                          <SwiperItem key={ele}>
                            <Image src={ele} />
                          </SwiperItem>
                        )
                      }): (
                        <SwiperItem>
                          <Image src={img_default} />
                        </SwiperItem>
                      )
                    }
                  </Swiper>
                  <View className='dots'>
                    {
                      datas.Imgs.length>0 && datas.Imgs.map((ele,index) => {
                        return <View key={ele} className={index===this.state.currentSwiper?'active dot':'dot'}></View>
                      })
                    }
                  </View>
                </View>
              )
            }

            <View className='info'>
              { 
                datas.Type === 1 && (
                  <View>
                    <View>期望价格 :</View>
                    {
                      datas.IfDiscuss ==1 ? <View><Text>面议</Text></View> : 
                      <View><Text>{ splitThousand(datas.MinAmt) }-{ splitThousand(datas.MaxAmt) }</Text><Text> 元</Text></View>
                    }
                  </View>
                )
              }
              { 
                datas.Type === 2 && (
                  <View>
                    <View>期望租金 :</View>
                    {
                      datas.IfDiscuss ==1 ? <View><Text>面议</Text></View> : 
                      <View><Text>{ splitThousand(datas.MinAmt) }-{ splitThousand(datas.MaxAmt) }</Text><Text> 元</Text></View>
                    }
                  </View>
                )
              }
              { 
                datas.Type === 3 && (
                  <View>
                    <View>租金 :</View>
                    {
                      datas.IfDiscuss ==1 ? <View><Text>面议</Text></View> : 
                      <View><Text>{ splitThousand(datas.MinAmt) }</Text><Text> 元/月</Text></View>
                    }
                  </View>
                )
              }
              <View>
                <View>资产类型 :</View>
                <View>{ datas.ParkingType }</View>
              </View>
              {
                datas.Type === 3 ? (
                  <View>
                    <View>所在仓储 :</View>
                    <View>{ datas.Building }</View>
                  </View>
                ):  <View>
                      <View>{ this.type(datas.Type) }仓储 :</View>
                      <View>{ datas.Building }</View>
                    </View>
              }
              {
                datas.Type === 3 ? (
                  <View>
                    <View>所在区域 :</View>
                    <View>{ datas.City } { datas.County } { datas.Building }</View>
                  </View>
                ):  <View>
                      <View>{ this.type(datas.Type) }区域 :</View>
                      <View>{ datas.City } { datas.County } { datas.Building }</View>
                    </View>
              }
            </View>
            <View className='describe'>
              <View>具体描述</View>
              <View>{ datas.Description }</View>
            </View>
          </View>
          {
            (Taro.getStorageSync('userInfo') === '') ? (   //未登陆
              <View className='bottom'>
                <View>联系人 登录后可查看联系人信息</View>
                <View>
                  <View>
                    <Text>{ datas.Contact }</Text>
                    <Text>{ datas.Tel }</Text>
                  </View>
                </View>
              </View>
            ) : (                     //已登陆
              <View className='bottom'>
                <View>联系人</View>
                <View>
                  <View>
                    <Text>{ datas.Contact }</Text>
                    <Text>{ datas.Tel }</Text>
                  </View>
                  <View onClick={this.call.bind(this,datas.Tel)}>
                    <Image src={`${imgUrl}icon_phone.png`} />
                  </View>
                </View>
              </View>
            )
          }

        </View>
      </View>
    )
  }
}
