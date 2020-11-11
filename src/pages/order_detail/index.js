/* eslint-disable react/no-unused-state */
import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image, Block } from '@tarojs/components'
import { AtButton, AtModal } from 'taro-ui'
import Header from '@/components/header/header'
import api from '@/api/api'
import { get, toast } from '@/global_data'
import { splitThousand, imgUrl } from '@/utils/util'
import QQMapWX from '@/assets/js/qqmap-wx-jssdk.min'
import './index.scss'


let qqmapsdk = new QQMapWX({
  key: 'L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX'
})

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      title: '购买详情',
      navType: 'backHome',
      num: 'order_detail',
      cur: '',
      datas: {
        parkingModel: {
          Img: null,
          ParkingCode: '',
          EffectiveTime: ''
        },
        buyBackModel: {
          Usufruct: 6
        },
        buildingModel: {},
        ParkingId: 'ccvcvv'
      },
      clickBtn: true,
      OrderCode: '',
      IfPayBond: ''
    }
  }

  // 跳转到更多车位
  morePark (type, id) {
    Taro.navigateTo({
      url: `../${type}/index?id=${id}`
    })
  }
  // 跳转到更多订单信息
  moreOrder (type, datas) {
    this.$preload({
      datas
    })
    Taro.navigateTo({
      url: `../${type}/index`
    })
  }

  // 订单类型
  type (type) {
    let text
    if (type == 1) {
      text = '购买'
    }else if (type == 2) {
      text = '转让'
    }else if (type == 3) {
      text = '回购'
    }
    return text
  }
  way (way) {
    switch (way) {
      case 1:
        return '月结'
      case 2:
        return '季结'
      case 3:
        return '半年结'
      case 4:
        return '年结'
      default:
        return '暂无'
    }
  }
  Usufruct (val) {
    switch (val) {
      case 1:
        return '只有使用权'
      case 2:
        return '拥有产权'
      case 0:
        return '无使用权'
      default:
        return '暂无'
    }
  }
  renderStatus (val) {
    if (val == 1) {
      return <View className='lock'>上架审批中</View>
    }else if (val == 2) {
      return <View className='lock'>挂牌中</View>
    }else if (val == 3) {
      return <View className='lock'>已下架</View>
    }else if (val == 4) {
      return <View className='lock'>支付锁定中</View>
    }else if (val == 5) {
      return <View className='hold'>正常持有</View>
    }
  }

  cancelBtn (OrderCode, IfPayBond, e) {
    e.stopPropagation()
    this.setState({
      isOpened: true,
      OrderCode,
      IfPayBond
    })
  }
  text (IfPayBond) {
    if (IfPayBond !== -1) {
      return `您已支付定金，如取消，则定金不予以退还。 \n 确定要取消吗？`
    } else {
      return `确定执行此操作吗?`
    }
  }

  // 取消
  handleConfirm = () => {
    this.setState({
      isOpened: false
    },() => {
      api.cancelOrder({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          OrderCode: this.state.OrderCode,
          Description: '不想要了'
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',2000).then(()=> {
            this.getData()
          })
        }else{
          toast(res.data.info,'none',2000)
        }
      })
    })

  }

  getDatas() {
    api.orderDetail({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      orderId: this.$router.preload.orderId
    }).then(res => {
      if (res.data.code === 200) {
        const datas = res.data.data
        this.setState({
          datas,
          cur: this.$router.preload.current
        })
      }
    })
  }

  // 获取数据
  getData () {
    this.getDatas()
  }
  // 点击支付首付
  goFirstPay () {
    this.$preload({
      datas: this.state.datas,
    })
    Taro.navigateTo({
      url: '../first_pay/index'
    })
  }
  // 审核不通过，点击全额购买
  goFullPay = () => {
    const { datas } = this.state
    //生成订单
    api.createOrder({
      LoginMark: Taro.getStorageSync('uuid') ? Taro.getStorageSync('uuid') : '',
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      // data: JSON.stringify({
      //   OrderCode: datas.OrderCode,
      // })
      data: JSON.stringify({
        ParkingId: datas.parkingModel.ParkingId,
        PayType: 1   //1表示全额付款,2表示贷款付款
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.$preload({
          datas: res.data.data,
          Price: res.data.data.SalePrice,
          type: 'full_buy'
        })
        Taro.navigateTo({
          url: `../full_buy/index`
        })
      }else{
        toast(res.data.info,'none',3000)
      }
    })
  }

  //支付
  // goPay (OrderCode,PayType,num,e) {
  //   e.stopPropagation()
  //   if (this.state.clickBtn) {
  //     this.setState({
  //       clickBtn: false
  //     },() => {
  //       api.OrderDetail({
  //         LoginMark: Taro.getStorageSync('uuid'),
  //         Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
  //         data: JSON.stringify({
  //           OrderCode
  //         })
  //       }).then(res => {
  //         if (res.data.code === 200) {
  //           this.$preload({
  //             datas: res.data.data,
  //             payType: num,      //1代表全额支付,3为支付尾款
  //             pages1: PayType, //用来区分是全额购买还是贷款购买
  //             pages: 'order'
  //           })
  //           Taro.navigateTo({
  //             url: '../pay/index'
  //           }).then(() => {
  //             this.setState({
  //               clickBtn: true
  //             })
  //           })
  //         } else {
  //           this.setState({
  //             clickBtn: true
  //           })
  //         }
  //       })
  //     })
  //   }

  // }

  parkCode (data) {
    let code
    if (data.buyBackModel.Usufruct == 0) {
      code = `${data.parkingModel.ParkingCode.slice(0,1)} ***** ${data.parkingModel.ParkingCode.slice(-1)}`
    } else {
      code = data.parkingModel.ParkingCode  
    }
    return code
  }

  goNavigation (city) {
    qqmapsdk.geocoder({
      address: city,
      success: function(res) {
        let latitude = res.result.location.lat
        let longitude = res.result.location.lng
        Taro.openLocation({
          latitude,
          longitude,
          name:city,
          scale: 18
        })
      }
    })
  }

  componentWillMount () {
    this.getData()
  }


  render () {
    const { datas, navType, num, title, isOpened, IfPayBond, cur } = this.state
    const titleHeight = get('titleHeight')

    return (
      <View className='containers'>

        {
          datas && Object.keys(datas).length > 10 && 
          <View>
            <Header onCur={cur} onNum={num} onTitle={title} onNavType={navType} />

            <View
              className='order_detail'
              style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
            >
              {/* <View className='line'></View> */}

              <View className='order_tetle'>
                {/*
                  支付 : OrderState: 4
                  待支付: OrderState: 2,7,8
                        type:2 OrderState: 0
                */}
                {
                  (datas.PayType===1&&datas.OrderState === 4) && (
                    <View className='one'>
                      <View><Image src={`${imgUrl}finish.png`} /></View>
                      <View>交易完成</View>
                    </View>
                  )
                }
                {
                  (datas.OrderState === -1 || datas.OrderState === -2) && (
                    <View className='one_1'>
                      <View className='one1'>
                        <View><Image src={`${imgUrl}info.png`} /></View>
                        <View>交易取消</View>
                      </View>
                      <View className='one2'>{ datas.Description ? datas.Description : '' }</View>
                    </View>
                  )
                }
                {
                  datas.PayType===1&&((datas.OrderState == 0 && datas.Type == 2)||datas.OrderState==2||datas.OrderState==7||datas.OrderState==8)&&(
                    <View className='one'>
                      <View><Image src={`${imgUrl}time.png`} /></View>
                      <View style={{color: '#F67149'}}>待支付</View>
                    </View>
                  )
                }
                {/* 贷款，等待审核 */}
                {
                  datas.PayType===2&&((datas.OrderState == 2&&(datas.Process == 3||datas.Process == 4))||(datas.OrderState == 7&&datas.Process == 3))&&(
                    <View className='one_1'>
                      <View className='one1'>
                        <View><Image src={`${imgUrl}time.png`} /></View>
                        <View style={{color: '#F67149'}}>贷款申请中</View>
                      </View>
                      <View className='one2'>
                        个人征信及贷款额度正在审核中，请耐心等待。
                      </View>
                    </View>
                  )
                }
                {/* 贷款，交易完成 */}
                {
                  (datas.PayType===2&&datas.OrderState === 4&&datas.Process == 4) && (
                    <View className='one'>
                      <View><Image src={`${imgUrl}finish.png`} /></View>
                      <View>交易完成</View>
                    </View>
                  )
                }
                {/* 贷款，审核不通过 */}
                {
                  datas.PayType===2&&(datas.OrderState == 2&&datas.Process == -4)&&(
                    <View className='one_1'>
                      <View className='one1'>
                        <View><Image src={`${imgUrl}icon_se.png`} /></View>
                        <View style={{color: '#F67149'}}>审核不通过</View>
                      </View>
                      <View className='one2'>
                        XXXX很抱歉，您的征信审核不通过，无法进行贷款购买，请进行全额购买XXXX
                      </View>
                    </View>
                  )
                }
                {
                  datas.PayType===2&&(datas.OrderState == 7&&datas.Process == -4)&&(
                    <View className='one_1'>
                      <View className='one1'>
                        <View><Image src={`${imgUrl}info.png`} /></View>
                        <View style={{color: '#F67149'}}>审核不通过</View>
                      </View>
                      <View className='one2'>
                        很抱歉，您的征信审核不通过，无法进行贷款购买，交易取消。
                      </View>
                      <View className='one3'>
                        您可以选择 <Text onClick={this.goFullPay} style={{color: '#5584FF'}}>全额购买</Text>
                      </View>
                    </View>
                  )
                }
                {/* 贷款，审核通过 */}
                {
                  datas.PayType===2&&((datas.OrderState == 2&&datas.Process == 4)||(datas.OrderState == 7&&datas.Process == 4))&&(
                    <View className='one_1'>
                      <View className='one1'>
                        {/* <View><Image src={`${imgUrl}icon_se.png`} /></View> */}
                        {/* <View style={{color: '#F67149'}}>审核通过</View> */}
                        <View><Image src={`${imgUrl}time.png`} /></View>
                        <View style={{color: '#F67149'}}>待支付首付款</View>
                      </View>
                      <View className='one2'>
                        {/* 您的征信审核已通过，请选择贷款模式，完成首付支付 */}
                        请在24小时内支付首付款，完成交易。如超时，将自动取消该订单
                      </View>
                    </View>
                  )
                }
                {/* 贷款，银行放贷中 */}
                {
                  datas.PayType===2&&(datas.OrderState == 8)&&(datas.Process == 4)&& (
                    <View className='one'>
                      <View><Image src={`${imgUrl}info.png`} /></View>
                      <View>银行放贷中，请耐心等待</View>
                    </View>
                  )
                }

                <View className='two'>
                  <View>
                    <Text>销售编号：</Text>
                    <Text style={{fontSize: '26rpx'}}>{ datas.OrderCode }</Text>
                  </View>
                  <View>
                    <Text>资产类型：</Text>
                    <Text>{ datas.buyBackModel.Usufruct == 0 ? '车位通凭证' : '车位通权证' }</Text>
                  </View>
                  {
                    (datas.OrderState != 7 && (datas.Process != 4 || datas.Process != 3 )) &&
                    <View>
                      <Text>支付金额（元）：</Text>
                      <Text>{ datas.Price ? splitThousand(datas.Price) : '' }</Text>
                    </View>
                  }

                  {
                    datas.PayType === 2 && (datas.OrderState == 7 && (datas.Process == 4 || datas.Process == 3)) &&
                    <View>
                      <Text>销售金额 (元)：</Text>
                      <Text>{ splitThousand(datas.parkingModel.SalePrice) }</Text>
                    </View>
                  }
                  {
                    datas.PayType === 2 && datas.OrderState === 4 && datas.IfPayDownPayMent != -1 && 
                    <Block>
                      <View>
                        <Text>销售金额 (元)：</Text>
                        <Text>{ splitThousand(datas.parkingModel.SalePrice) }</Text>
                      </View>
                      <View>
                        <Text>首付金额 (元)：</Text>
                        <Text>{ splitThousand(datas.IfPayDownPayMent ? datas.IfPayDownPayMent : 0) }</Text>
                      </View>
                    </Block>
                  }

                  <View>
                    <Text>购买方式：</Text>
                    <Text>{ datas.PayType == 1 ? '一次性支付' : '申请贷款支付' }</Text>
                  </View>
                  <View>
                    <Text>创建时间：</Text>
                    <Text>{ datas.CreateDate }</Text>
                  </View>

                </View>

              </View>

              {/* 车位信息 */}

              {/* 车位通信息(回购模式) */}
              {
                datas.buyBackModel.Usufruct == 0 ? (
                  <View className='buy_back'>
                    <View>
                      <View>
                        <Image src={`${imgUrl}icon_pz.png`} />
                        <Text>区块链车位通凭证信息</Text>
                      </View>

                    </View>
                    <View>
                      <View>
                        <Text className='col1'>编号：</Text>
                        <Text className='col2' style={{fontSize: '26rpx'}}>{ datas.ParkingId.toUpperCase() }</Text>
                      </View>
                    </View>
                    <View>
                      <View className='left'>
                        <View>
                          <Text className='col1'>面额：</Text>
                          <Text className='col2'>{ splitThousand(datas&&((datas.Price)/10000).toFixed(2)) }<Text style={{fontSize:'28rpx'}}>万元</Text></Text>
                        </View>
                        <View>
                          <Text className='col1'>年化收益率：</Text>
                          <Text className='col2'>{ datas&&datas.buyBackModel.FixedRate }%</Text>
                        </View>

                      </View>
                      <View className='right'>
                        <View>
                          <Text className='col1'>期限：</Text>
                          <Text className='col2'>{ datas&&datas.buyBackModel.RepoTerm }个月</Text>
                        </View>
                        <View>
                          <Text className='col1'>凭证到期日:</Text>
                          <Text className='col2'>{ datas&&datas.buyBackModel.dueTime }</Text>
                        </View>
                      </View>
                    </View>
                    <View>
                      <Text className='col1'>限制转让期 : </Text>
                      <Text className='col2'>三个月</Text>
                    </View>
                  </View>
                ) : (
                  <View className='buy_back'>
                    <View>
                      <View>
                        <Image src={`${imgUrl}icon_qz.png`} />
                        <Text>区块链车位通权证信息</Text>
                      </View>
                    </View>
                    <View>
                      <Text className='col1'>编号：</Text>
                      <Text className='col2' style={{fontSize: '26rpx'}}>{ datas.ParkingId.toUpperCase() }</Text>
                    </View>
                    <View>
                      <Text className='col1'>权属性质： </Text>
                      <Text className='col2'> { this.Usufruct(datas.buyBackModel.Usufruct) }</Text>
                    </View>
                  </View>
                )
              }

              <View className='bottom'>
                <View style={{fontSize:'36rpx',color:'#3E3E3E'}}>车位信息</View>

                <View>
                  <Text>
                    <Text className='col1'>车位号：</Text>
                    <Text className='col2'>{ this.parkCode(datas) }</Text>
                  </Text>
                  <Text>
                    <Text className='col1'>类型：</Text>
                    <Text className='col2'>{ datas.parkingModel.ParkingType }</Text>
                  </Text>
                </View>
                <View>
                  <View>
                    <Text className='col1'>面积：</Text>
                    <Text className='col2'>{ datas.parkingModel.Acreage }㎡</Text>
                  </View>
                </View>
                <View>
                  <View>
                    <Text className='col1'>使用（产权）期限：</Text>
                    <Text className='col2'>{ datas.parkingModel.EffectiveTime.split(' ')[0] }</Text>
                  </View>
                </View>
                <View>
                  <View>
                    <Text className='col1'>所属商圈：</Text>
                    <Text className='col2'>{ datas.parkingModel.CircleName }</Text>
                  </View>
                </View>
                <View>
                  <View>
                    <Text className='col1'>所在小区：</Text>
                    <Text className='col2'>{ datas.buildingModel.BuildingName }</Text>
                  </View>
                </View>
                <View>
                  <View style={{display: 'flex'}}>
                    <Text className='col1'>地址：</Text>
                    <View className='col2 address'>
                      <Text decode>
                        { datas.buildingModel.Province }&nbsp;
                        { datas.buildingModel.City }&nbsp;
                        { datas.buildingModel.District }&nbsp;
                        { datas.buildingModel.Address }&nbsp;
                      </Text>
                      <View>
                        <Image 
                          onClick={this.goNavigation.bind(this,(datas.buildingModel.Province+datas.buildingModel.City+datas.buildingModel.District+datas.buildingModel.Address))}
                          src={`${imgUrl}icon_map_l.png`} 
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{marginBottom: '20rpx'}}>
                  <View>
                    <Text className='col1'>物业管理方：</Text>
                    <Text className='col2'>{ datas.buildingModel.Property }</Text>
                  </View>
                </View>

              </View>

            </View>
          </View>
        }



          {/* {
            datas.PayType===1&&(datas.IfOperate == 1 && datas.OrderState == 2 )&& (
              <View className='footer_1'>
                <View>
                  <Text>尾款金额</Text>
                  <Text>¥&nbsp;{ splitThousand(datas.IfPayRest) }</Text>
                </View>
                <View onClick={this.goPay.bind(this,datas.OrderCode,datas.PayType,'3')}>
                  <AtButton type='secondary' size='small'>支付尾款</AtButton>
                </View>
              </View>
            )
          } */}
          {/* {
            datas.PayType===1&&((datas.IfOperate == 1 && datas.OrderState == 7)||(datas.IfOperate == 1 && datas.Type==2 && datas.OrderState == 0)) && (
              <View className='footer_1'>
                <View>
                  <Text>全款金额</Text>
                  <Text>¥&nbsp;{ splitThousand(datas.Price) }</Text>
                </View>
                <View onClick={this.goPay.bind(this,datas.OrderCode,datas.PayType,'4')}>
                  <AtButton type='secondary' size='small'>支付全额</AtButton>
                </View>
              </View>
            )
          } */}
          {/* 贷款，征信不通过 */}
          {/* {
            datas.PayType===2&&(datas.OrderState == 2&&datas.Process == -4) && (
              <View className='footer_1'>
                <View>
                  <Text>尾款金额</Text>
                  <Text>¥&nbsp;{ splitThousand(datas.IfPayRest) }</Text>
                </View>
                <View onClick={this.goPay.bind(this,datas.OrderCode,datas.PayType,'3')}>
                  <AtButton type='secondary' size='small'>支付尾款</AtButton>
                </View>
              </View>
            )
          } */}

          {/* 贷款，审核通过 */}
          {
            datas.PayType===2&&((datas.OrderState == 2&&datas.Process == 4)||(datas.OrderState == 7&&datas.Process == 4)) && (
              <View className='footer_1' style={{justifyContent:'flex-end'}}>
                {/* <View style={{marginRight:'18rpx'}} onClick={this.goPay.bind(this,datas.OrderCode,datas.PayType,'4')}>
                  <AtButton type='secondary' size='small'>支付全额</AtButton>
                </View> */}
                <View
                  onClick={this.cancelBtn.bind(this,datas.OrderCode,datas.IfPayBond)}
                  style={{marginRight: '18rpx'}}
                >
                  <AtButton size='small'>取消</AtButton>
                </View>
                {
                  datas.IfBtn && 
                  <View style={{marginRight:'18rpx'}} onClick={this.goFirstPay.bind(this)}>
                    <AtButton type='secondary' size='small'>支付首付</AtButton>
                  </View>
                }


              </View>
            )
          }
          {/* 贷款，审核中 */}
          {
            datas.PayType===2&&((datas.OrderState == 2&&datas.Process == 3)||(datas.OrderState == 7&&datas.Process == 3)) && (
              <View className='footer_1' style={{justifyContent:'flex-end'}}>
                {/* <View style={{marginRight:'18rpx'}} onClick={this.goPay.bind(this,datas.OrderCode,datas.PayType,'4')}>
                  <AtButton type='secondary' size='small'>支付全额</AtButton>
                </View> */}
                <View
                  onClick={this.cancelBtn.bind(this,datas.OrderCode,datas.IfPayBond)}
                  style={{marginRight: '18rpx'}}
                >
                  <AtButton size='small'>取消</AtButton>
                </View>
              </View>
            )
          }


          {/* <View onClick={this.goFirstPay.bind(this)}>
            跳转到首付页面
          </View> */}
          <AtModal
            isOpened={isOpened}
            cancelText='取消'
            confirmText='确认'
            onCancel={() => this.setState({isOpened: false})}
            onClose={() => this.setState({isOpened: false})}
            onConfirm={this.handleConfirm}
            content={this.text(IfPayBond)}
          />

      </View>

    )
  }
}
