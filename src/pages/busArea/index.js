import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtIcon } from 'taro-ui'
import api from '../../api/api'
import { imgUrl } from '../../utils/util'
import { get } from '../../global_data'
import './index.scss'

export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '我的商圈'
  }

  constructor () {
    super(...arguments)
    this.state = {
      current: 0,
      al_data: null,    // 已加入商圈数据
      aw_data: null,    // 未加入商圈数据
      display1: 'none',
      display2: 'none'
    }
  }
  handleClick(value) {
    this.setState({
      current: value
    })
  }

  // 跳转到详情
  goDetail(type, CircleId) {
    this.$preload({
      CircleId
    })
    if (type === 'al') {
      Taro.navigateTo({
        url: '../circle/index'
      })
    } else {
      Taro.navigateTo({
        url: '../aw_bus_detail/index'
      })
    }
  }

  getDatas = () => {
    api.circle({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
    }).then(res => {
      if (res.data.code === 200) {
        let al_data = []
        let aw_data = []
        res.data.data.forEach(ele => {
          if (ele.IfInsert >= 1) {
            al_data.push(ele)
          } else {
            aw_data.push(ele)
          }
        })

        this.setState({
          al_data,
          aw_data
        })
      }
    })
  }


  componentDidShow () {
    if (!Taro.getStorageSync('userInfo')) {
      Taro.reLaunch({
        url: `../login_hint/index?param=busArea`
      })
    } else {
      Taro.eventCenter.trigger('getUserInfo')

      //获取商圈列表
      this.getDatas()

      this.setState({
        current: 0
      })
    }
  }

  render () {
    const tabList = [{ title: '已加入' }, { title: '未加入' }]
    const { al_data, aw_data, display1, display2, current } = this.state
    const surHeight = get('titleHeight1') + 40

    return (
      <View className='busArea'>
        <AtTabs current={current} tabList={tabList} onClick={this.handleClick.bind(this)}>
          <AtTabsPane current={current} index={0}>
            <ScrollView
              className='scrollview'
              scrollY
              scrollWithAnimation
              scrollTop={0}
              style={{height: `calc(100vh - ${surHeight}rpx)`}}
              lowerThreshold={50}
              onScrollToLower={() => this.setState({display1: 'flex'})}
            >
              <View className='aw_list' >
                {
                  al_data && al_data.map(ele => {
                    return (
                      <View className='list_item2' key={ele.CircleId}>
                        <View className='left'>
                          <Image src={`${imgUrl}circle.png`} />
                        </View>
                        <View className='right' onClick={this.goDetail.bind(this,'al',ele.CircleId)}>
                          <View>
                            <View style={{marginBottom:'15rpx',fontSize:'36rpx',color: '#3e3e3e'}}>
                              { ele.CircleName }
                            </View>
                            <View style={{fontSize:'26rpx',color: '#808080'}}>
                              <Text decode>账号&nbsp;:&nbsp;&nbsp;{ ele.AccountNo }</Text>
                            </View>
                          </View>
                          <View><AtIcon value='chevron-right' color='#C7C7CC'></AtIcon></View>
                        </View>
                      </View>
                    )
                  })
                }
                <View className='footer1' style={{display: display1}}>
                  <View>
                    <View className='line'></View>
                    <View className='text'>已经到底啦</View>
                    <View className='line'></View>
                  </View>
                </View>
              </View>
              {
                JSON.stringify(al_data) == '[]' && (
                  <View className='nodata'>
                    <View>
                      <Image src={`${imgUrl}circle_nodata.png`} />
                      <View>暂无已加入商圈</View>
                    </View> 
                  </View>
                )
              }
            </ScrollView>
          </AtTabsPane>
          <AtTabsPane current={current} index={1}>
            <ScrollView
              className='scrollview'
              scrollY
              scrollWithAnimation
              scrollTop={0}
              style={{height: `calc(100vh - ${surHeight}rpx)`}}
              lowerThreshold={50}
              onScrollToLower={() => this.setState({display2: 'flex'})}
            >
              <View className='aw_list'>
                {
                  aw_data && aw_data.map(ele => {
                    return (
                      <View className='list_item2' key={ele.CircleId}>
                        <View className='left'>
                          <Image src={`${imgUrl}circle.png`} />
                        </View>
                        <View className='right' onClick={this.goDetail.bind(this,'aw',ele.CircleId)}>
                          <View>
                            <View style={{marginBottom:'15rpx',fontSize:'36rpx',color: '#3e3e3e'}}>
                              { ele.CircleName }
                            </View>
                            <View style={{ fontSize: '26rpx', color: '#808080' }} >
                              所属{ ele.CompanyName },在售车位{ ele.OnSaleCount }
                            </View>
                          </View>
                          <View><AtIcon value='chevron-right' color='#C7C7CC'></AtIcon></View>
                        </View>
                      </View>
                    )
                  })
                }
                <View className='footer1' style={{display: display2}} >
                  <View>
                    <View className='line'></View>
                    <View className='text'>已经到底啦</View>
                    <View className='line'></View>
                  </View>
                </View>
              </View>
              {
                JSON.stringify(aw_data) == '[]' && (
                  <View className='nodata'>
                    <View>
                      <Image src={`${imgUrl}circle_nodata.png`} />
                      <View>暂无未加入商圈</View>
                    </View> 
                  </View>
                )
              }
            </ScrollView>
          </AtTabsPane>
        </AtTabs>
      </View>
    )

  }
}
