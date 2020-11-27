import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import './index.scss'
import { imgUrl, splitThousand } from '../../../../utils/util'

export default class Index extends PureComponent {


  //跳转详情
  goDedail (PostId) {
    this.$preload({
      PostId
    })
    Taro.navigateTo({
      url: '../detail/index'
    })
  }

  render () {
    const { onDatas, onHot } = this.props
    return (
      <View className='boxs'>
        <View className='lists'>
          {
            JSON.stringify(onDatas) !== '[]' && onDatas!==null &onDatas!==undefined && onDatas.map((ele,i) => {
              return (
                <View className='item' 
                  key={ele.PostId} 
                  onClick={this.goDedail.bind(this,ele.PostId)}
                >
                  <View className='top'>

                    {
                      (onHot === '最新' && i<5 ) && 
                      <Image style={{marginRight: '10rpx'}} mode='widthFix' src={`${imgUrl}icon_new@2x.png`} />
                    }
                    {
                      (onHot === '最热' && i<5 ) && 
                      <Image mode='widthFix' src={`${imgUrl}icon_hot@2x.png`} />
                    }
                    <Text>{ ele.Title }</Text>
                  </View>
                  <View className='bottom'>
                    <View className='left'>
                      <View>{ ele.ParkingType }</View>
                      <View>{ ele.City } { ele.County } { ele.Building }</View>
                      <View>
                        <Text style={{marginRight: '26rpx'}}>{ ele.toTime }</Text>
                        <Text>浏览{ ele.ViewCount }</Text>
                      </View>
                    </View>
                    {
                      ele.Type === 1 && (
                        <View className='right'>
                          {
                            ele.IfDiscuss ==1 ? <View><Text>面议</Text></View> : 
                            <View>{ splitThousand(ele.MinAmt) }-{ splitThousand(ele.MaxAmt) }<Text style={{fontSize:'24rpx'}}>元</Text></View>
                          }
                          <View style={{textAlign:'right'}}>期望价格</View>
                        </View>
                      )
                    }
                    {
                      ele.Type === 2 && (
                        <View className='right'>
                          {
                            ele.IfDiscuss ==1 ? <View><Text>面议</Text></View> : 
                            <View>{ splitThousand(ele.MinAmt) }-{ splitThousand(ele.MaxAmt) }<Text style={{fontSize:'24rpx'}}>元</Text></View>
                          }
                          
                          <View style={{textAlign:'right'}}>期望租金</View>
                        </View>
                      )
                    }
                    {
                      ele.Type === 3 && (
                        <View className='right'>
                          {
                            ele.IfDiscuss ==1 ? <View><Text>面议</Text></View> : 
                            <View>{ ele.MinAmt }<Text style={{fontSize:'24rpx'}}>元/月</Text></View>
                          }
                          <View style={{textAlign:'right'}}>租金</View>
                        </View>
                      )
                    }
                  </View>
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }
}
