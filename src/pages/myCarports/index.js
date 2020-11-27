// import Taro, { useState, useEffect } from '@tarojs/taro'
import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { splitThousand, imgUrl } from '../../utils/util'
import api from '../../api/api'
import './index.scss'

export default class Index extends PureComponent {
  config = {
    navigationBarTitleText: '我的总资产'
  }

  constructor () {
    super(...arguments)
    this.state = {
      datas: '',
      flag: true,
    }

  }
  // 跳转到我的资产
  goMyCarport(ParkingType) {
    this.$preload({
      ParkingType
    })
    Taro.navigateTo({
      url: `../myCarport/index`
    })
  }

  goPage(type) {
    if (type === 'myLoan') {
      this.$preload({
        pages: 'myLoan'
      })
    }
    Taro.navigateTo({
      url: `../${type}/index`
    })
  }

  getDatas() {
    api.myaAssetst({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : ''
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data,
        })
      }
    })
  }

  // 获取数据
  getData() {
    this.getDatas()


  }

  componentDidShow () {

    if (!Taro.getStorageSync('userInfo')) {
      Taro.redirectTo({
        url: `../login_hint/index?param=myCarports`
      })
    } else {
      this.getData()
    }
  }
  // 显示隐藏切换
  showOrHide = () => {
    this.setState({
      flag: !this.state.flag
    })
  }

  render () {
    const { datas, flag } = this.state

    return (
      <View className='container'>
        
        {
          datas && 
          <View>
            {/* 我的资产 */}
            <View className='myProperty'>
              <View className='t'>
                <View className='myProperty'>
                  <View>
                    <View>我的资产</View>
                    <View>
                      {
                        flag ? 
                        <Image onClick={this.showOrHide} src={`${imgUrl}icon_visible.png`} /> : 
                        <Image onClick={this.showOrHide} src={`${imgUrl}icon_hidden.png`} />
                      }
                    </View>
                  </View>
                  <View onClick={this.goPage.bind(this, 'history_bill')}>
                    <Image src={`${imgUrl}icon_bill@2x.png`} />
                  </View>
                </View>


                {
                  flag ? 
                  <View className='totalProperty'>
                    <View className='left'>
                      <View>总资产<Text style={{fontSize: '16rpx'}}> (元)</Text></View>
                      <View>{ splitThousand(datas.TotalAmt ? datas.TotalAmt : 0) }</View>
                    </View>
                    {
                      JSON.stringify(datas) !== '{}' && 
                      <View className='right'>
                        <View className='top'>
                          <View style={{flex: datas.AccountbalancePercent}}>{ datas.AccountbalancePercent }%</View>
                          <View style={{flex: datas.pzTotalPricePercent}}>{ datas.pzTotalPricePercent }%</View>
                          <View style={{flex: datas.qzTotalPricePercent}}>{ datas.qzTotalPricePercent }%</View>
                        </View>
                        <View className='bottom'>
                          <View style={{flex: datas.AccountbalancePercent}}></View>
                          <View style={{flex: datas.pzTotalPricePercent}}></View>
                          <View style={{flex: datas.qzTotalPricePercent}}></View>
                        </View>
                      </View>
                    }

                  </View> : 
                  <View className='totalProperty'>
                    <View className='left'>
                      <View>总资产<Text style={{fontSize: '16rpx'}}> (元)</Text></View>
                      <View>******</View>
                    </View>
                    <View className='right'>
                      <View className='top'>
                        <View style={{flex: datas.AccountbalancePercent}}>**</View>
                        <View style={{flex: datas.pzTotalPricePercent}}>**</View>
                        <View style={{flex: datas.qzTotalPricePercent}}>**</View>
                      </View>
                      <View className='bottom'>
                        <View style={{flex: datas.AccountbalancePercent}}></View>
                        <View style={{flex: datas.pzTotalPricePercent}}></View>
                        <View style={{flex: datas.qzTotalPricePercent}}></View>
                      </View>
                    </View>
                  </View>
                }

              </View>

              {/* 账户余额 */}
              <View className='b'>
                <View className='balance'>
                  <View>
                    <View></View>
                    <View>账户余额<Text style={{fontSize: '24rpx'}}> (元)</Text>：</View>
                  </View>
                  {
                    flag ? <View>{ splitThousand(datas.Accountbalance ? datas.Accountbalance : 0) }</View> :
                    <View>******</View>
                  }
                  
                </View>
                {/* 权证及凭证统计 */}
                <View className='statistics'>
                  <View onClick={this.goMyCarport.bind(this, 2)}>
                    <View className='top'>
                      <View className='l'>
                        <View style={{background: '#FC7946'}}></View>
                        <View>持有区块链资产通凭证<Text style={{fontSize: '22rpx'}}> (元)</Text></View>
                      </View>
                      <View className='r'>
                        {
                          flag ? <View>{ splitThousand(datas.pzTotalPrice ? datas.pzTotalPrice : 0) }</View> :
                          <View>******</View>
                        }
                        <View><Image src={`${imgUrl}arrow_s@2x.png`} /></View>
                      </View>
                    </View>
                    <View className='bottom'>
                      <View>持有区块链资产通凭证个数<Text style={{fontSize: '22rpx'}}> (个)</Text>：</View>
                      {
                        flag ? <View>{datas.pzTotalCount}</View> : <View>**</View>
                      }
                      
                    </View>
                  </View>
                  <View onClick={this.goMyCarport.bind(this, 3)} style={{background: '#F9F9F9'}}>
                    <View className='top'>
                      <View className='l'>
                        <View style={{background: '#5584FF'}}></View>
                        <View>持有区块链资产通权证<Text style={{fontSize: '22rpx'}}> (元)</Text></View>
                      </View>
                      <View className='r'>
                        {
                          flag ? <View>{ splitThousand(datas.qzTotalPrice ? datas.qzTotalPrice : 0) }</View> : 
                          <View>******</View>
                        }
                        
                        <View><Image src={`${imgUrl}arrow_s@2x.png`} /></View>
                      </View>
                    </View>
                    <View className='bottom'>
                      <View>持有区块链资产通权证个数<Text style={{fontSize: '22rpx'}}> (个)</Text>：</View>
                      {
                        flag ? <View>{ datas.qzTotalCount }</View> : <View>**</View>
                      }
                      
                    </View>
                  </View>
                </View>
                <View></View>
              </View>

            </View>

            {/* 我的贷款 */}
            <View className='myLoan'>
              <View>我的贷款</View>
              <View onClick={this.goPage.bind(this, 'myLoan')}>
                <View>贷款金额<Text style={{fontSize: '22rpx'}}> (元)</Text></View>
                <View>
                  {
                    flag ? <View>{ splitThousand(datas.LoanTotalAmt ? datas.LoanTotalAmt : 0) }</View> :
                    <View>******</View>
                  }
                  <View><Image src={`${imgUrl}arrow_s@2x.png`} /></View>
                </View>
              </View>
              <View>
                <View>
                  <Text>下一还款日：</Text>
                  <Text>{ datas.RepaymentDate ? datas.RepaymentDate : '暂无' }</Text>
                </View>
                <View>
                  <Text>还款金额<Text style={{fontSize: '20rpx'}}> (元)</Text>：</Text>
                  {
                    flag ? <Text>{ splitThousand(datas.RepaymentAmt ? datas.RepaymentAmt : 0) }</Text> :
                    <Text>******</Text>
                  }
                  
                </View>
              </View>
            </View>

            {/* 我的收益 */}
            <View className='income'>
              <View>我的收益</View>
              <View>
                <View onClick={this.goPage.bind(this, 'myProfit')}>
                  <View>累计收益<Text style={{fontSize: '20rpx'}}> (元)</Text>：</View>            
                  <View>
                    {
                      flag ? <View>+{ splitThousand(datas.TotalProfit ? datas.TotalProfit : 0) }</View> :
                      <View>******</View>
                    }
                    <View><Image src={`${imgUrl}arrow_s@2x.png`} /></View>
                  </View>
                </View>
                <View>{ datas.SumProfitMsg }</View>
              </View>
              <View style={{background: '#ffffff'}}>
                <View>
                  <View>当期预计收益<Text style={{fontSize: '20rpx'}}> (元)</Text>：</View>            
                  <View style={{color: '#3E3E3E'}}>
                    {
                      flag ? 
                      <View style={{marginRight: '24rpx'}}>+{ splitThousand(datas.EstimateProfit ? datas.EstimateProfit : 0) }</View> : 
                      <View style={{marginRight: '24rpx'}}>******</View>
                    }
                    <View></View>
                  </View>
                </View>
                <View>{ datas.EstimateProfitMsg }</View>
              </View>
              <View>
                <View>
                  <View>预计总收益<Text style={{fontSize: '20rpx'}}> (元)</Text>：</View>            
                  <View style={{color: '#3E3E3E'}}>
                    {
                      flag ? 
                      <View style={{marginRight: '24rpx'}}>+{ splitThousand(datas.EstimateTotalProfit ? datas.EstimateTotalProfit : 0) }</View> :
                      <View style={{marginRight: '24rpx'}}>******</View>
                    }
                    <View></View>
                  </View>
                </View>
                <View>{ datas.EstimateTotalProfitMsg }</View>
              </View>
            </View>
          </View>
        }

      </View>
    )
  }
}

