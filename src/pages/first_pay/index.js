import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker, Image, Button } from '@tarojs/components'
import { AtInput, AtList, AtListItem, AtIcon, AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui'
import Header from '../../components/header/header'
import { get, toast } from '../../global_data'
import { splitThousand, accAdd, Subtr, accMul, imgUrl, numDiv } from '../../utils/util'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      title: '支付首付',
      navType: 'backHome',
      num: 1,
      firstAmount: '',
      firstAmount: '',
      deadline: '12个月',
      disabled: true,     // 用来控制提交按钮的点击
      disabled1: true,    // 用来控制输入框能否输入
      display2: 'none',
      tipsStyle: 'none',
      loanData: {
        loanAmount: 1
      },
      loanDatas: [],
      selector: [],
      datas: {},
      isOpened: false,
      scale: 20,
      scale1: 20,
      accountDatas: {},
      isAgree1: '未同意',
      isAgree2: '未同意',
      agreeCol1: '#808080',
      agreeCol2: '#808080',
      modal1: false,
      modal2: false,
      btn1: true,
      btn2: true,
      flag1: false,
      flag2: false,
      LoanContractUrl: '',
      ProveUrl: '',
      scaleStyle: 'block',
      btnStyle: 'none',
      btnLoading: false
    }
  }

  // 选择贷款期限
  handlePicker = (e) => {
    const { selector, loanDatas } = this.state
    this.setState({
      deadline: selector[e.detail.value]
    }, () => {
      loanDatas.forEach(ele => {
        if (`${ele.loanTerm}个月` === selector[e.detail.value]) {
          this.setState({
            loanData: ele
          })
          return
        }
      })
    })
  }

  // 修改比例
  updateNum () {

    const { datas, disabled1, scale, scale1, flag1, flag2 } = this.state

    if (!disabled1) {
      if (scale < scale1) {
        this.setState({
          tipsStyle: 'block'
        })
        return false
      } else {
        this.setState({
          tipsStyle: 'none'
        })
      }
      if (flag1 && flag2) {
        this.setState({
          disabled: false
        })
        this.getLoanScheme(datas.OrderCode, accMul(datas.Price, scale/100), datas.Price, 'fourParams')

      } else {
        this.setState({
          disabled: true
        })
        this.getLoanScheme(datas.OrderCode, accMul(datas.Price, scale/100), datas.Price, 'fourParams')
      }
    }


  }

  // 点击支付，生成点单详情，并跳转到支付页面
  goPay (OrderCode) {
    if (!this.state.disabled) {
      this.setState({
        disabled: true,
        btnLoading: true
      },() => {
        api.OrderDetail({
          LoginMark: Taro.getStorageSync('uuid'),
          Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
          data: JSON.stringify({
            OrderCode
          })
        }).then(res => {
          if (res.data.code === 200) {
            const { firstAmount, loanData } = this.state

            // 获取视频验证随机数
            api.videoRandom({
              LoginMark: Taro.getStorageSync('uuid'),
              Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
              FaceType: 1,
              OrderCode
            }).then(r => {
              if (res.data.code === 200) {
                const data = r.data.data
                this.$preload({
                  datas: res.data.data,
                  payType: 5,
                  pages1: 'first_pay',
                  DownPayMent: firstAmount,
                  loanData,
                  code: data.Code,  // 随机数
                  FaceCompareType: 1
                })
                Taro.navigateTo({
                  url: `../identityVerify/index`
                })
              }
            })
            this.setState({
              disabled: false,
              btnLoading: false,
            })
          }else{
            toast(res.data.info,'none',3000)
            this.setState({
              disabled: false,
              btnLoading: false,
            })
          }
        })
      })
    }
  }
  // 获取借款合同
  getLoanContract() {
    const { loanData, datas } = this.state
    //合同接口
    api.loanContract({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        OrderCode: datas.OrderCode,
        loanTerm: loanData.loanTerm,
        creditSchemaId: loanData.creditSchemaId,
        loanRate: loanData.loanRate,
        paybackPattern: loanData.paybackPattern,
        loanAmount: loanData.loanAmount,
        rateType: loanData.rateType,
        callRateType: loanData.callRateType,
        callDatumRate: loanData.callDatumRate,
        spread: loanData.spread
      }),
      existLoading: true
    }).then(res1 => {
      if (res1.data.code === 200) {
        this.setState({
          LoanContractUrl: res1.data.data.LoanContractUrl,         // 销售协议
          ProveUrl: res1.data.data.ProveUrl,  // 个人征信授权书
          flag1: false,
          flag2: false,
          disabled: true,
          isAgree1: '未同意',
          isAgree2: '未同意',
          agreeCol1: '#808080',
          agreeCol2: '#808080'
        })
      } else { 
        toast('系统异常，请稍后再试','none',1500)
      }

    })
  }


  // 获取授信方案
  /**
   * @param {*} OrderCode     订单号
   * @param {*} DownPayMent   首付金额
   * @param {*} Price         资产价格
   */
  getLoanScheme (OrderCode, DownPayMent, Price, fourParams) {
    Taro.showLoading({ title: '方案获取中...' })
    api.loanScheme({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        OrderCode,
        DownPayMent
      }),
      existLoading: true
    }).then(r => {
      if (r.data.code === 200) {
        Taro.hideLoading()
        const data = r.data.data
        if (Array.isArray(data)) {
          let selector = []
          data.forEach(ele => {
            selector.push(`${ele.loanTerm}个月`)
          })
          if (fourParams) {
            this.setState({
              loanData: data[0],
              loanDatas: data,
              deadline: `${data[0].loanTerm}个月`,
              selector,
              firstAmount: Subtr(Price, data[0].loanAmount),
              disabled1: true,
              scaleStyle: 'block',
              btnStyle: 'none'
            }, () => {
              this.getLoanContract()
            })
          } else {
            this.setState({
              loanData: data[0],
              loanDatas: data,
              deadline: `${data[0].loanTerm}个月`,
              selector,
              firstAmount: Subtr(Price, data[0].loanAmount),
              scale: parseInt(numDiv(Subtr(Price, data[0].loanAmount), Price) * 100),
              scale1: parseInt(numDiv(Subtr(Price, data[0].loanAmount), Price) * 100)   // 首付比例不等低于的值
            }, () => {
              this.getLoanContract()
            })
          }
        }
      } else {
        Taro.hideLoading()
        toast(r.data.info, 'none', 2000).then(() => {
          this.setState({
            disabled1: false
          })
        })
      }
    })

  }

  showVis = () => {
    const { display2 } = this.state
    if (display2 === 'none') {
      this.setState({
        display2: 'block'
      })
    } else {
      this.setState({
        display2: 'none'
      })
    }
  }

  type (type) {
    let t
    if (type == '01') {
      t = '利随本清'
    }else if (type == '02') {
      t = '按期还款'
    } else if(type == '03') {
      t = '按季付息，到期还本付息'
    }
    return t
  }
  callRateType (num) {
    let type
    switch (num) {
      case '61001006':
        type = '不浮'
        break;
      case '61001106':
        type = '按月浮'
        break;
      case '61001206':
        type = '按季浮'
        break;
      case '61001306':
        type = '按半年浮'
        break;
      case '61001406':
        type = '按一年浮'
        break;
      case '61001012':
        type = '6-12个月不浮'
        break;
      case '61001112':
        type = '6-12个月按月浮'
        break;
      case '61001212':
        type = '6-12个月按季浮'
        break;
      case '61001312':
        type = '6-12个月按半年浮'
        break;
      case '61001412':
        type = '6-12个月按一年浮'
        break;

      case '62001036':
        type = '3年不浮'
        break;
      case '62001136':
        type = '3年按月浮'
        break;
      case '62001236':
        type = '3年按季浮'
        break;
      case '62001336':
        type = '3年按半年浮'
        break;
      case '62001436':
        type = '3年按一年浮'
        break;

      case '62001060':
        type = '3-5年不浮'
        break;
      case '62001160':
        type = '3-5年按月浮'
        break;
      case '62001260':
        type = '3-5年按季浮'
        break;
      case '62001360':
        type = '3-5年按半年浮'
        break;
      case '62001460':
        type = '3-5年按一年浮'
        break;

      case '63001070':
        type = '5年不浮'
        break;
      case '63001170':
        type = '5年按月浮'
        break;
      case '63001270':
        type = '5年按季浮'
        break;
      case '63001370':
        type = '5年按半年浮'
        break;
      case '63001470':
        type = '5年按一年浮'
        break;
      default:
        break;
    }
    return type
  }

  // 获取账户信息
  getAccountAmt() {
    api.accountAmt({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CircleId: this.$router.preload.datas.CircleId
      }),
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          accountDatas: res.data.data
        })
      }
    })
  }

  componentWillMount () {
    const datas = this.$router.preload.datas

    this.setState({
      datas
    })

    const asyncHttp = async () => {
      await this.getAccountAmt()
      await this.getLoanScheme(datas.OrderCode, accMul(datas.Price, 0.2), datas.Price)

    }
    asyncHttp()
  }

  //打开pdf
  openDocument (num) {
    const { ProveUrl, LoanContractUrl } = this.state
    let sysinfo = Taro.getSystemInfoSync()
    let isiOS = sysinfo.system.indexOf('iOS') > -1
    let isHUAWEI = sysinfo.brand.toUpperCase().indexOf('HUAWEI') > -1
    let isXIAOMI = sysinfo.brand.toLowerCase().indexOf('xiaomi') > -1

    if (isiOS) {    //ios
      this.$preload({
        url: num === 1 ? LoanContractUrl : ProveUrl
      })
      Taro.navigateTo({
        url: '../pdf/index'
      })
    } else if (isHUAWEI || isXIAOMI) {
      Taro.setClipboardData({
        data: num === 1 ? LoanContractUrl : ProveUrl,
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
        // url: num === 2 ? ProveUrl : LoanContractUrl,
        url: num === 1 ? LoanContractUrl : ProveUrl,
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
      if (num === 1) {
        this.setState({
          btn1: false,
          flag1: true
        })
      } else {
        this.setState({
          btn2: false,
          flag2: true
        })
      }
    }, 500)

  }

  // 阅读并同意
  agree(num) {
    if (num === 1) {
      this.setState({
        modal1: false, 
        agreeCol1: '#5584FF',
        isAgree1: '已阅读并同意'
      }, () => {
        if (this.state.flag1 && this.state.flag2) {
          this.setState({
            disabled: false
          })
        }
      })
    } else {
      this.setState({
        modal2: false, 
        agreeCol2: '#5584FF',
        isAgree2: '已阅读并同意'
      }, () => {
        if (this.state.flag1 && this.state.flag2) {
          this.setState({
            disabled: false
          })
        }
      })
    }
  }

  render () {
    const { datas, num, modal1, modal2, btn2, btn1, flag1, flag2, tipsStyle,  scaleStyle, btnStyle, 
      isAgree1, isAgree2, agreeCol1, agreeCol2, accountDatas, isOpened, title, navType,  
      disabled1, firstAmount, display2, loanData, selector, scale, scale1, deadline, disabled } = this.state
    const titleHeight = get('titleHeight')
    const content = `修改金额失败，首付金额不能低于资产总价的${scale1}%。`
    const rate = accAdd(accMul(loanData.callDatumRate, 100), loanData.spread/100)
    const interest = numDiv(accMul((loanData.loanAmount)*numDiv(rate, 12), loanData.loanTerm), 100).toFixed(2)
    
    return (
      <View className='first_pay'>
        <View>
          <Header onNum={num} onTitle={title} onNavType={navType} />
          <View className='content'
            style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
          >
            <View className='order_info'>
              <View>
                <View>
                  <Text>销售协议编号：</Text>
                  <Text>{ datas.OrderCode }</Text>
                </View>
                <View>
                  <Text>购买方式：</Text>
                  <Text>申请贷款支付</Text>
                </View>
              </View>
              {/* <View>
                <View>贷款机构：</View>
                  <View>
                    <Image src={`${imgUrl}icon_czlogo.png`} />
                    <View>{ datas.LoanBankName }</View>
                  </View>
              </View> */}
            </View>
            
            <View className='item'>
              <Text>首付金额 <Text style={{fontSize:'24rpx',color: '#3E3E3E'}}>(元)</Text></Text>
              <Text>{splitThousand(firstAmount)}</Text>
            </View>
            <View className='item'>
              <Text>销售金额 <Text style={{fontSize:'24rpx',color: '#3E3E3E'}}>(元)</Text></Text>
              <Text>{splitThousand(datas.Price)}</Text>
            </View>
            <View className='inp_text'>
              <AtInput
                title='首付比例 (%)'
                type='digit'
                maxLength={2}
                disabled={disabled1}
                value={scale}
                onChange={(e) => this.setState({scale: e})}
              />
              <View className='text'>
                <View 
                  style={{display: scaleStyle}}
                  onClick={() => this.setState({btnStyle: 'flex', scaleStyle: 'none', disabled1: false})}
                >修改比例</View>
                <View style={{display: btnStyle}}>
                  <AtButton 
                    className='btn_1' 
                    type='secondary' 
                    size='small'
                    onClick={() => this.setState({btnStyle: 'none', scaleStyle: 'block', disabled1: true})}
                  >取消</AtButton>
                  <AtButton 
                    type='primary' 
                    size='small'
                    onClick={this.updateNum.bind(this)}
                  >确定</AtButton>
                </View>
              </View>
              <View className='tips' style={{display: tipsStyle}}>提示：首付比例不能少于{scale1}%</View>
            </View>

            <View className='line'></View>
            <View className='item' style={{padding:'32rpx 0rpx 32rpx 32rpx'}}>
              <Text style={{color: '#3E3E3E',fontSize:'32rpx'}}>贷款金额 <Text style={{fontSize:'24rpx'}}>(元)</Text></Text>
              <Text>{splitThousand(loanData.loanAmount)}</Text>
            </View>
            <View className='sel'>
              <Picker
                mode='selector'
                range={selector}
                onChange={this.handlePicker}
              >
                <AtList>
                  <AtListItem className='m_border' title='贷款期限' extraText={deadline} arrow='right' />
                </AtList>
              </Picker>
            </View>


            {
              loanData.rateType==1 && (
                <View>
                  <View className='item'>
                    <Text>利率类型</Text>
                    <Text>{loanData.rateType===1?'固定':'浮动'}</Text>
                  </View>
                  <View className='item'>
                    <Text>利率 <Text style={{fontSize:'24rpx'}}>(%)</Text></Text>
                    <Text>{loanData.loanRate}</Text>
                  </View>
                  <View className='item' style={{paddingBottom:'23rpx'}}>
                    <Text>预估利息 <text style={{fontSize:'24rpx'}}>(元)</text></Text>
                    <Text>{splitThousand(interest)}</Text>
                  </View>
                </View>
              )
            }
            {
              loanData.rateType==2 && (
                <View>
                  <View className='item'>
                    <Text>利率类型</Text>
                    <Text>{loanData.rateType===1?'固定':'浮动'}</Text>
                  </View>
                  <View className='item item1'>
                    <Text>预估利率 <Text style={{fontSize:'24rpx'}}>(%)</Text></Text>
                    <Text>{rate}</Text>
                    <Image src={`${imgUrl}icon_info_line.png`} onClick={this.showVis} />
                  </View>
                  <View className='vis' style={{display: display2}}>
                    <View>预估利率 = 挂靠利率 + 点差</View>
                    <View>
                      <Text>挂靠利率类型</Text>
                      <Text>1年期LPR_按季浮动</Text>
                    </View>
                    <View>
                      <Text>挂靠利率 <Text style={{fontSize:'24rpx'}}>(%)</Text></Text>
                      <Text>{accMul(loanData.callDatumRate, 100)}</Text>
                    </View>
                    <View>
                      <Text>点差 <Text style={{fontSize:'24rpx'}}>(100bp=1%)</Text></Text>
                      <Text>{loanData.spread/100}</Text>
                    </View>
                  </View>
                  <View className='item'>
                    <Text>预估利息 <Text style={{fontSize:'24rpx'}}>(元)</Text></Text>
                    <Text>{splitThousand(interest)}</Text>
                  </View>
                  <View className='item' style={{paddingBottom:'23rpx'}}>
                    <Text>还款方式</Text>
                    <Text>{this.type(loanData.paybackPattern)}</Text>
                  </View>
                </View>
              )
            }
            {/* 账户信息 */}
            <View className='account_info'>
              <View>
                <View>所属商圈：</View>
                <View>{ accountDatas.CircleName }</View>
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

            {/* 协议 */}
            <View className='treaty'>
              <View 
                style={{borderBottom: '1rpx solid #E5E5E5'}}
                onClick={() => this.setState({modal1: true})}
              >
                <View>区块链资产通借款</View>
                <View>
                  <Text style={{color: agreeCol1}}>{isAgree1}</Text>
                  <AtIcon value='chevron-right' color='#C7C7CC'></AtIcon>
                </View>
              </View>
              <View onClick={() => this.setState({modal2: true})}>
                <View>销售协议</View>
                <View>
                  <Text style={{color: agreeCol2}}>{isAgree2}</Text>
                  <AtIcon value='chevron-right' color='#C7C7CC'></AtIcon>
                </View>
              </View>
            </View>
            
          </View>
        </View>
        <View className='f_box'>
          <View className='footer_1'>
            <View>
              <View>
                <Text>支付金额 <Text style={{fontSize:'24rpx'}}>(元)</Text></Text>
                {
                  datas.IfPayBond !=-1 ? 
                  <Text decode>¥&nbsp;{ splitThousand(Subtr(firstAmount-datas.IfPayBond)) }</Text> : 
                  <Text>{ firstAmount==''?0:splitThousand(firstAmount) }</Text>
                }

                {/* <AtIcon onClick={this.handleAticon} value={aticon} size='18' color='#AEAEAE'></AtIcon> */}
              </View>
              {
                (datas.IfPayBond !=-1) && <View>（实付金额为首付金额扣除已付定金）</View>
              }

            </View>
            <View onClick={this.goPay.bind(this,datas.OrderCode,'5')}>
              <AtButton
                type='primary'
                size='small'
                disabled={disabled}
              >支付</AtButton>
            </View>
          </View>
        </View>

        <AtModal
          isOpened={isOpened}
          confirmText='确认'
          onConfirm={() => this.setState({isOpened: false})}
          onClose={() => this.setState({isOpened: false})}
          content={content}
        />

        <AtModal isOpened={modal1}>
          <AtModalHeader>请点击并阅读</AtModalHeader>
          <AtModalContent>
            <View className='xy' onClick={this.openDocument.bind(this, 1)}>
              <View>区块链资产通借款</View>
              <View>
                <AtIcon value='chevron-right' color='#C7C7CC'></AtIcon>
              </View>
            </View>
          </AtModalContent>
          <AtModalAction> 
            <Button 
              onClick={() => this.setState({modal1: false})}
            >不同意</Button> 
            <Button 
              disabled={btn1} 
              style={{color: flag1 ? '#5584FF' : '#808080'}}
              onClick={this.agree.bind(this, 1)}
            >阅读并同意</Button> 
          </AtModalAction>
        </AtModal>

        <AtModal isOpened={modal2}>
          <AtModalHeader>请点击并阅读</AtModalHeader>
          <AtModalContent>
            <View className='xy' onClick={this.openDocument.bind(this, 2)}>
              <View>销售协议</View>
              <View>
                <AtIcon value='chevron-right' color='#C7C7CC'></AtIcon>
              </View>
            </View>
          </AtModalContent>
          <AtModalAction> 
            <Button 
              onClick={() => this.setState({modal2: false})}
            >不同意</Button> 
            <Button 
              disabled={btn2} 
              style={{color: flag2 ? '#5584FF' : '#808080'}}
              onClick={this.agree.bind(this, 2)}
            >阅读并同意</Button> 
          </AtModalAction>
        </AtModal>


      </View>
    )
  }
}
