import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { AtList, AtListItem, AtIcon, AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import Header from '../../components/header/header'
import { splitThousand, imgUrl } from '../../utils/util'
import { get, toast } from '../../global_data'
import api from '../../api/api'
import QQMapWX from '../../assets/js/qqmap-wx-jssdk.min'
import './index.scss'


let qqmapsdk = new QQMapWX({
  key: 'L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX'
})

//付款方式分为，全额和支付定金

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      switchIsCheck: false,
      btnLoading: false,
      title: '购买确认',
      navType: 'backHome',
      display: 'none',
      isAgree: '未同意',
      accountDatas: {}, //账户信息数据
      datas: {
        BuyBackModel: {
          Usufruct: ''
        },
        ParkingId: 'fdsf',
        ParkingCode: 'gdfgd',
        EffectiveTime: ''
      },
      price: '',
      disabled: true,
      payType: 1,   //用来区分是全额付款还是支付定金
      num: 1,
      isSwitch: true,
      checkbox: [],
      type: '',
      flag: true,     // 用来控制多次点击问题
      modal: false,
      btn: true,
      agreeCol: '#808080',
      flag1: false    // 用来判断用户是否打开了pdf
    }
    this.checkboxOption = [{
      value: 'list1',
      label: '我已阅读并同意'
    }]

  }

  handleChange = (e) => {
    if (e.currentTarget.value === false) {
      this.setState({
        display: 'none',
        price: this.state.datas.SalePrice,
        payType: 1  //全额购买
      })
    }else{
      this.setState({
        display: 'block',
        price: this.state.datas.Bond,
        payType: 2  //预付定金
      })
    }
    this.setState({
      switchIsCheck: e.currentTarget.value
    })
  }
  
  //提交订单,页面跳转
  goPage = () => {

    // 提交订单之前判断是否有上传证件
    const userInfoData = Taro.getStorageSync('userInfoData')?JSON.parse(Taro.getStorageSync('userInfoData')):''
    const { datas, payType, type, switchIsCheck } = this.state
    //type用来区分是贷款支付还是全额支付  ‘loan_buy’贷款
    //payType用来区分是否付定金  1.不付定金   2.付定金
    if (type === 'loan_buy') {  //贷款支付
      if (switchIsCheck) {      //预付定金
        this.$preload({
          datas,
          payType,
          type,
          pages1: 'loan_bond'   //贷款购买，预付定金
        })
        Taro.redirectTo({
          url: `../pay/index`
        })
      }else {                   //不需要预付定金

        // 获取视频验证随机数
        api.videoRandom({
          LoginMark: Taro.getStorageSync('uuid'),
          Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
          FaceType: 1,
          OrderCode: datas.OrderCode,
        }).then(res => {
          if (res.data.code === 200) {
            const data = res.data.data
            this.$preload({
              datas,
              payType,
              type,
              pages1: 'loan_all',
              code: data.Code,  // 随机数
              FaceCompareType: data.FaceCompareType
            })
            if (userInfoData.IdCardFront && userInfoData.IdCardReverse) {
              Taro.navigateTo({
                url: `../identityVerify/index`
              })
            } else {
              Taro.navigateTo({
                url: '../userId_update/index'
              })
            }
          }
        })


      }
    } else {   //全额购买

      // 获取视频验证随机数
      api.videoRandom({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        FaceType: 1,
        OrderCode: datas.OrderCode,
      }).then(res => {
        if (res.data.code === 200) {
          const data = res.data.data
          this.$preload({
            datas,
            payType,
            type,
            pages1: 'all_all',
            code: data.Code,  // 随机数
            FaceCompareType: data.FaceCompareType
          })
          // 判断是否有证件上传
          if (userInfoData.IdCardFront && userInfoData.IdCardReverse) {
            Taro.navigateTo({
              url: `../identityVerify/index`
            })
          } else {
            // 证件上传
            Taro.navigateTo({
              url: '../userId_update/index'
            })
          }
        }
      })


    }
  }

  parkCode (data) {
    let code = null
    if (data!==undefined&&JSON.stringify(data)!=='{}') {
      if (data.BuyBackModel.Usufruct == 0) {
        code = `${data.ParkingCode.slice(0,1)} ***** ${data.ParkingCode.slice(-1)}`
      } else {
        code = data.ParkingCode  
      }
    }
    return code
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

  handleCheck (e) {
    this.setState({
      checkbox: e
    },() => {
      if (this.state.checkbox.length > 0) {
        if (this.state.flag) {
          Taro.showLoading({ title: '加载中...' })
          api.signAgreeMent({
            LoginMark: Taro.getStorageSync('uuid'),
            Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
            data: JSON.stringify({
              OrderCode: this.state.datas.OrderCode
            })
          }).then(res => {
            if (res.data.code === 200) {
              Taro.hideLoading()
              this.setState({
                flag: false
              })
            } else {
              toast(res.data.info,'none',2000)
            }
          })
        }
      }
    })
  }
  //打开pdf
  openDocument () {
    const { type, datas } = this.state
    let sysinfo = Taro.getSystemInfoSync()
    let isiOS = sysinfo.system.indexOf('iOS') > -1
    let isHUAWEI = sysinfo.brand.toUpperCase().indexOf('HUAWEI') > -1
    let isXIAOMI = sysinfo.brand.toLowerCase().indexOf('xiaomi') > -1
    
    if (isiOS) {    //ios
      this.$preload({
        url: type === 'loan_buy' ? datas.AgreeMentUrl : datas.ProveUrl
      })
      Taro.navigateTo({
        url: '../pdf/index'
      })
    }else if (isHUAWEI || isXIAOMI) {
      Taro.setClipboardData({
        data: type === 'loan_buy' ? datas.AgreeMentUrl : datas.ProveUrl,
        success: function () {
          Taro.showModal({
            title: '提示',
            content: '复制成功,请使用浏览器下载浏览',
            showCancel: false
          })
        }
      })
    } else {        //Android
      Taro.downloadFile({
        url: type === 'loan_buy' ? datas.AgreeMentUrl : datas.ProveUrl,
        success: (res) => {
          let Path = res.tempFilePath
          Taro.openDocument({
            filePath: Path,
            fileType:'pdf',
            success: () => {
              console.log('pdf打开成功')
            }
          })
        }
      })
    }

    setTimeout(() => {
      this.setState({
        btn: false,
        flag1: true
      })
    }, 500);

  }

  // 不同意
  noAgree () {
    this.setState({
      modal: false,
      agreeCol: '#808080',
      isAgree: '未同意',
      disabled: true,
      flag1: false,
      btn: true
    })
  }

  // 阅读并同意
  agree() {
    if (this.state.type === 'loan_buy') {
      api.signAgreeMent({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          OrderCode: this.state.datas.OrderCode
        })
      }).then(res => {
        if (res.data.code === 200) {
          this.setState({
            modal: false, 
            agreeCol: '#5584FF',
            isAgree: '已阅读并同意',
            disabled: false
          })
        }
      })
    } else {
      this.setState({
        modal: false, 
        agreeCol: '#5584FF',
        isAgree: '已阅读并同意',
        disabled: false
      })
    }
  }

  // 点击地址跳转到地图页面
  goNavigation (city,e) {
    e.stopPropagation()
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
    this.setState({
      datas: this.$router.preload.datas,
      price: this.$router.preload.Price,
      isSwitch: this.$router.preload.datas.Bond > 0 ? true : false,
      type: this.$router.preload.type
    })
    //获取账户信息
    api.accountAmt({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CircleId: this.$router.preload.datas.CircleId
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          accountDatas: res.data.data
        })
      }
    })
  }


  render () {
    const { disabled, datas, price, flag1, agreeCol, num, modal, btn, title, accountDatas, navType, isSwitch, display, switchIsCheck, type, isAgree } = this.state
    const titleHeight = get('titleHeight')
    return (
      <View className='full_buy'>

        <View className='box'>
          <Header onNum={num}  onTitle={title} onNavType={navType} />

          <View style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}>
            <View className='carInfo'>
              <View className='orderInfo'>
                <View>
                  <View style={{marginBottom: '12rpx'}}>销售协议编号：</View>
                  <View style={{color: '#808080'}}>{ datas.OrderCode }</View>
                </View>

                {
                  type === 'full_buy' ?
                  <View className='pz'>
                    <View>
                      <View>销售金额（元）：</View>
                      <View>{ splitThousand(datas.SalePrice) }</View>
                    </View>
                    <View>购买方式：{ type === 'loan_buy' ? '申请贷款支付' : '一次性支付' }</View>
                  </View> : 
                  <View className='qz'>
                    <View>
                      <View>销售金额（元）：</View>
                      <View>{ splitThousand(datas.SalePrice) }</View>
                    </View>
                    <View>购买方式：{ type === 'loan_buy' ? '申请贷款支付' : '一次性支付' }</View>
                    <View>
                      <View>贷款机构：</View>
                      <View>
                        <Image src={`${imgUrl}icon_czlogo.png`} />
                        <View style={{marginLeft: '5rpx'}}>{ datas.LoanBankName }</View>
                      </View>
                    </View>
                  </View>
                }

              </View>
              
              {
                type === 'full_buy' && (
                  <View className='circleInfo'>
                    <View>
                      <View>所属商圈：</View>
                      <View>{ datas.CircleName }</View>
                    </View>
                    <View>
                      <View>支付账号：</View>
                      <View>{ accountDatas.CircleAccountNo }</View>
                    </View>
                    <View>
                      <View>账户余额（元）：</View>
                      <View>{ splitThousand(accountDatas.Amt) }</View>
                    </View>
                  </View>
                )
              }
              
              <View 
                style={{margin: '20rpx 0rpx',background:'#ffffff',padding:'25rpx 20rpx 25rpx 32rpx'}} 
                className='xy'
                onClick={() => this.setState({modal: true})}
              >
                <View style={{color: '#000000'}}>{type === 'loan_buy' ? '个人信息查询授权书' : '销售协议'}</View>
                <View>
                  <Text style={{color: agreeCol}}>{isAgree}</Text>
                  <AtIcon value='chevron-right' color='#C7C7CC'></AtIcon>
                </View>
              </View>
              

             {/* 资产通信息(回购模式) */}
              {
                (datas&&JSON.stringify(datas)!=='{}')&&datas.BuyBackModel.Usufruct == 0 ? (
                  <View className='buy_back'>
                    <View>
                      <Image src={`${imgUrl}icon_pz.png`} />
                      <Text>区块链资产通凭证信息</Text>
                    </View>
                    <View>
                      <View>
                        <Text className='col1'>编号 : </Text>
                        <Text className='col2' style={{fontSize: '26rpx'}}>{ (JSON.stringify(datas)!=='{}'&&datas)&&datas.ParkingId.toUpperCase() }</Text>
                      </View>
                    </View>
                    <View>
                      <View className='left'>
                        <View>
                          <Text className='col1'>面额 : </Text>
                          <Text className='col2'>{ splitThousand(datas.Price) }<Text style={{fontSize:'28rpx'}}>元</Text></Text>
                        </View>
                        <View>
                          <Text className='col1'>年化收益率 : </Text>
                          <Text className='col2'>{ datas&&datas.BuyBackModel.FixedRate }%</Text>
                        </View>

                        <View>
                          <Text className='col1'>限制转让期 : </Text>
                          <Text className='col2'>三个月</Text>
                        </View>

                      </View>
                      <View className='right'>
                        <View>
                          <Text className='col1'>期限 : </Text>
                          <Text className='col2'>{ datas&&datas.BuyBackModel.RepoTerm }个月</Text>
                        </View>
                        <View>
                          <Text className='col1'>凭证到期日 : </Text>
                          <Text className='col2'>{ datas&&datas.BuyBackModel.dueTime }</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className='buy_back'>
                    <View>
                      <Image src={`${imgUrl}icon_qz.png`} />
                      <Text>区块链资产通权证信息</Text>
                    </View>
                    <View>
                      <Text className='col1'>编号 : </Text>
                      <Text className='col2'>{ (JSON.stringify(datas)!=='{}'&&datas)&&datas.ParkingId.toUpperCase() }</Text>
                    </View>
                    <View>
                      <Text className='col1'>权属性质 : </Text>
                      <Text className='col2'> { (JSON.stringify(datas)!=='{}'&&datas) && this.Usufruct(datas.BuyBackModel.Usufruct) }</Text>
                    </View>
                  </View>
                )
              }

              <View className='carInfo'>
                <View style={{fontSize:'36rpx',color:'#3E3E3E'}}>车位信息</View>

                <View>
                  <Text>
                    <Text decode className='col1'>车位号 :&nbsp;</Text>
                    <Text className='col2'>{ this.parkCode(datas&&datas) }</Text>
                  </Text>
                  <Text>
                    <Text decode className='col1'>类型 :&nbsp;</Text>
                    <Text className='col2'>{ datas.ParkingType }</Text>
                  </Text>
                </View>
                <View>
                  <View>
                    <Text decode className='col1'>面积 :&nbsp;</Text>
                    <Text className='col2'>{ datas.Acreage }㎡</Text>
                  </View>
                </View>
                <View>
                  <View>
                    <Text decode className='col1'>使用（产权）期限 :&nbsp;</Text>
                    <Text className='col2'>{ datas.EffectiveTime&&datas.EffectiveTime.split(' ')[0] }</Text>
                  </View>
                </View>
                <View>
                  <View>
                    <Text decode className='col1'>所属商圈 :&nbsp;</Text>
                    <Text className='col2'>{ datas.CircleName }</Text>
                  </View>
                </View>
                <View>
                  <View>
                    <Text decode className='col1'>所在仓储 :&nbsp;</Text>
                    <Text className='col2'>{ datas.BuildingName }</Text>
                  </View>
                </View>
                <View>
                  <View style={{display: 'flex'}}>
                    <Text decode className='col1'>地址 :&nbsp;</Text>
                    <View className='col2 address'>
                      <Text>{ datas.Address}</Text>
                      <View>
                        <Image onClick={this.goNavigation.bind(this,datas.Address)} src={`${imgUrl}icon_map_l.png`} />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={{marginBottom: '20rpx'}}>
                  <View>
                    <Text decode className='col1'>物业管理方 :&nbsp;</Text>
                    <Text className='col2'>{ datas.Property }</Text>
                  </View>
                </View>

              </View>

            </View>
            {/* 预付定金 */}

            <View className='earnest' style={{display: display}}>
              <AtList>
                <AtListItem
                  title='预付定金'
                  className='bot_line'
                  isSwitch={isSwitch}           //控制是否展示
                  switchColor='#5584FF'
                  switchIsCheck={switchIsCheck}  //控制开关
                  onSwitchChange={this.handleChange}
                />
                <View>
                  <AtListItem
                    title='定金金额 (元)'
                    extraText={String(price)}
                  />
                </View>
              </AtList>
            </View>
            {/* 定金说明 */}
            <View className='explain' style={{display: display}}>
              <View>
                <Image src={`${imgUrl}remind.png`} />
              </View>
              <Text>支付定金后，车位将为您锁定。您须自订单日期起7日内支付尾款，否则订单将过期失效，车位自动解锁，过期失效订单的已付定金不予退还。若客户违约，定金不予退还。</Text>
            </View>
          </View>
        </View>


        <View className='footer2'>

          {
            type === 'loan_buy' ? 
            <AtButton
              type='primary'
              disabled={disabled}
              onClick={this.goPage}
            >提交贷款申请</AtButton> : 
            <View className='bottom'>
              <View>
                <View>支付金额</View>
                <View>
                  <Text>¥ { splitThousand(price) }</Text>
                  <Text></Text>
                </View>
              </View>
              <View>
                <AtButton
                  type='primary'
                  disabled={disabled}
                  onClick={this.goPage}
                >支付</AtButton>
              </View>
            </View>
          }

        </View>
      
      
        <AtModal isOpened={modal}>
          <AtModalHeader>请点击并阅读</AtModalHeader>
          <AtModalContent>
            <View className='xy' onClick={this.openDocument.bind(this)}>
              <View>{type === 'loan_buy' ? '个人信息查询授权书' : '销售协议'}</View>
              <View>
                <AtIcon value='chevron-right' color='#C7C7CC'></AtIcon>
              </View>
            </View>
          </AtModalContent>
          <AtModalAction> 
            <Button 
              onClick={this.noAgree.bind(this)}
            >不同意</Button> 
            <Button 
              disabled={btn} 
              style={{color: flag1 ? '#5584FF' : '#000000'}}
              onClick={this.agree.bind(this)}
            >阅读并同意</Button> 
          </AtModalAction>
        </AtModal>
      </View>
    )
  }
}
