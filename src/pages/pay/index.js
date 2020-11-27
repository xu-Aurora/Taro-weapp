import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5'
import api from '../../api/api'
import { toast } from '../../global_data'
import { throttle } from '../../utils/util'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '交易确认'
  }

  constructor () {
    super(...arguments)
    this.state = {
      code: '',     //验证码
      password: '',  //交易密码
      codeBtn: '获取动态码',
      btn: false,   //用来控制获取短信码的按钮点击
      isOpened1: false,   //充值提示
      isOpened2: false,   //退出提示
      datas: [],
      price: '',
      payType: 1,   //用来判断是全额支付、支付定金、支付尾款
      display: 'none',  //用来判断余额不足是否展示
      accountDatas: {}, //账户信息数据
      checkbox: [],
      checkbox1: [],
      inPage: '',
      flag: true,
      url1: '',
      flag: true,
      loanData: {}
    }
    this.checkboxOption = [{
      value: 'list1',
      label: '我已阅读并同意',
    }]

    this.handleClick = throttle(this.handleClick1)
  }

  handleChange (type, e) {
    if (this.state[type] !== e ) {
      this.setState({
        [type]: e
      })
    }
  }

  //获取动态码
  getCode = () => {
    if(!this.state.btn){
      this.setState({
        btn: true
      })
      api.gainCode({
        Tel: Taro.getStorageSync('userInfoData')?JSON.parse(Taro.getStorageSync('userInfoData')).Mobile:'',
        Type: 4
      }).then(res => {
        if (res.data.code === 200) {
          toast('发送成功','success',1000)
        }
      })
      let s = 60;
      let time = setInterval(() => {
        s--;
        this.setState({
          codeBtn: s + 's后重试'
        })
        if(s===0){
          clearTimeout(time);
          this.setState({
            codeBtn: '获取动态码',
            btn: false
          })
        }
      }, 1000);
    }

  }

  //打开pdf
  openDocument () {
    let sysinfo = Taro.getSystemInfoSync()
    let isiOS = sysinfo.system.indexOf('iOS') > -1
    let isHUAWEI = sysinfo.brand.toUpperCase().indexOf('HUAWEI') > -1
    let isXIAOMI = sysinfo.brand.toLowerCase().indexOf('xiaomi') > -1
    
    if (isiOS) {    //ios
      this.$preload({
        url: this.state.datas.ProveUrl
      })
      Taro.navigateTo({
        url: '../pdf/index'
      })
    }else if (isHUAWEI || isXIAOMI) {
      Taro.setClipboardData({
        data: this.state.datas.ProveUrl,
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
        url: this.state.datas.ProveUrl,
        success: function(res) {
          let Path = res.tempFilePath
          Taro.openDocument({
            filePath: Path,
            fileType:'pdf',
            success: function() {
              console.log('打开文档成功')
            }
          })
        }
      })
    }
  }
  openDocument1 () {
    let sysinfo = Taro.getSystemInfoSync()
    let isiOS = sysinfo.system.indexOf('iOS') > -1
    let isHUAWEI = sysinfo.brand.toUpperCase().indexOf('HUAWEI') > -1
    let isXIAOMI = sysinfo.brand.toLowerCase().indexOf('xiaomi') > -1

    if (isiOS) {    //ios
      this.$preload({
        url: this.$router.preload.url1
      })
      Taro.navigateTo({
        url: '../pdf/index'
      })
    }else if (isHUAWEI || isXIAOMI) {
      Taro.setClipboardData({
        data: this.$router.preload.url1,
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
        url: this.$router.preload.url1,
        success: function(res) {
          let Path = res.tempFilePath
          Taro.openDocument({
            filePath: Path,
            fileType:'pdf',
            success: function() {
              console.log('打开文档成功')
            }
          })
        }
      })
    }
  }

  payType () {
    let inPage
    if (
      (this.$router.preload.pages1 === 'all_all') ||
      (this.$router.preload.payType == 4) ||
      (this.$router.preload.payType == 3)) {    //订单支付成功页面
      inPage = 'myCarport'
    } else if (this.$router.preload.pages1 === 'all_bond') {  //全额购买，预付定金
      inPage = 'myOrder'
    }else if (this.$router.preload.pages1 === 'loan_bond') {  //贷款购买，预付定金
      inPage = 'loan_bond'
    }else if ((this.$router.preload.pages1 === 'loan_all')) {   //贷款购买，全额购买生成订单
      inPage = 'loan_all'
    }else if (this.$router.preload.pages1 === 'first_pay') {  //贷款购买，首付
      inPage = 'first_pay'
    }
    return inPage
  }

  submitOrder () {

    api.orderSubmit({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        OrderCode: this.state.datas.OrderCode,
        PayType: 1,
        PayPassword: md5(this.state.password),
        VerificationCode: this.state.code,
        IfPayBond: 1  //这里固定为1
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',1500).then( () => {
          setTimeout(() => {
            Taro.redirectTo({
              url: '../myOrder/index'
            })
          }, 1500);
        })
      }else{
        this.$preload({
          info: res.data.info
        })
        Taro.navigateTo({
          url: '../pay_fail/index'
        })
      }
    })
    
  }
  payNow (params) {

    api.payNow({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify(params)
    }).then(res => {
      if (res.data.code === 200) {
        this.$preload({
          inPage: this.payType(),
          payType: this.state.payType,
          orderId: this.state.datas.OrderId
        })
        Taro.navigateTo({
          url: '../pay_success/index'
        })
      } else if (res.data.code === 400) {
        toast(res.data.info, 'none', 1500)
      } else {
        this.$preload({
          info: res.data.info
        })
        Taro.navigateTo({
          url: '../pay_fail/index'
        })
      }
    })
      
  }

  regx() {
    const { code, password } = this.state
    if (code == '') {
      toast('请输入验证码！', 'none', 2000)
      return false
    } else if (password == '') {
      toast('请输入交易密码！', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  /**
   * 从仓储、首页跳转进来,全额购买payType=1(接口完成后跳回原来的列表),支付定金payType=2
   * 从我的订单跳转进来,全额支付payType=4,支付尾款payType=3,首付payType=5,贷款不付定金购买payType=6
   * 除了定金支付的调orderSubmit接口,其他的都调payNow接口
   */
  handleClick1 = () => {
    
    if (this.regx()) {
      if (this.state.payType === 2) {    //贷款和非贷款购买支付定金,提交订单
        this.submitOrder()
      }else if (this.state.payType === 5){    //首付->订单页面
        const { loanData, DownPayMent } = this.$router.preload
  
        this.payNow({
          OrderCode: this.state.datas.OrderCode,
          PayType: 2,                             //全额购买还是贷款购买
          PayPassword: md5(this.state.password),
          VerificationCode: this.state.code,
          DownPayMent,
          creditSchemaId: loanData.creditSchemaId,
          loanTerm: loanData.loanTerm,
          loanRate: loanData.loanRate,
          paybackPattern: loanData.paybackPattern,
          loanAmount: loanData.loanAmount,
          rateType: loanData.rateType,
          callRateType: loanData.callRateType,
          callDatumRate: loanData.callDatumRate,
          spread: loanData.spread
        })
      }else if (this.state.payType === 6) {
        this.payNow({
          OrderCode: this.state.datas.OrderCode,
          PayType: 2,
          PayPassword: md5(this.state.password),
          VerificationCode: this.state.code,
        })
      }else{                            //全额购买->资产页面,支付尾款->订单页面,全额支付->订单页面,
        this.payNow({
          OrderCode: this.state.datas.OrderCode,
          PayType: this.$router.preload.type=== 'loan_buy'?2:1,   //全额购买还是贷款购买
          PayPassword: md5(this.state.password),
          VerificationCode: this.state.code
        })
      }
    }

  }

  sureExit = () => {
    this.setState({
      isOpened2: false,
    },() => {
      Taro.switchTab({url: '../home/index'})
    })
  }
  //金额文案展示
  amountText (type) {
    let text
    if (type == 1 || type == 4) {
      text = '销售金额'
    }else if (type == 2) {
      text = '定金金额'
    }else if (type == 3) {
      text = '尾款金额'
    }else if (type == 5) {
      text = '首付金额'
    }
    return text
  }

  componentWillMount () {
    const { SalePrice, Bond, IfPayBond, Balance, PayAmt } = this.$router.preload.datas

    const payType = this.$router.preload.payType
    //账户余额小于定金时,展示余额不足提示,否则不展示
    // let SalePrice = SalePrice                   //全额价格
    let bond = (payType===1 ? Bond : IfPayBond)    //定金价格
    // let Balance = Balance                       //账户余额
    // let PayAmt = PayAmt                         //尾款金额

    let price
    if (payType == 1 || payType == 4) {
      price = SalePrice
      if (Balance < SalePrice) {
        this.setState({
          display: 'flex'
        })
      }
    }else if (payType == 2) {
      price = bond
      if (Balance < bond) {
        this.setState({
          display: 'flex'
        })
      }
    }else if (payType == 3) {
      price = PayAmt
      if (Balance < PayAmt) {
        this.setState({
          display: 'flex'
        })
      }
    }else if (payType == 5) {
      price = this.$router.preload.DownPayMent
    }
    this.setState({
      datas: this.$router.preload.datas,
      price,
      payType: payType,
      inPage: this.$router.preload.inPage && this.$router.preload.inPage,
      title: this.$router.preload.inPage === 'loan_all'?'生成订单':'支付',
      pages1: this.$router.preload.pages1
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
    // const { accountDatas, datas, code, codeBtn, password } = this.state
    const { datas, code, codeBtn, password } = this.state
    return (
      <View className='boxs'>
        <View className='pay'>
          {/* {
            inPage !== 'loan_all' &&
            <View className='box'>
              <View></View>
              <View>
                <Text decode>{ this.amountText(payType) }&nbsp;(元)</Text>
                <Text className='price'>{ splitThousand(price) }</Text>
              </View>
            </View>
          }
          {
            inPage !== 'loan_all' &&
            <View className='box'>
              <View>
                <Text>所在商圈:</Text>
                <Text>{ datas.CircleName }</Text>
              </View>
              <View>
                <Text>支付账号:</Text>
                <Text>{ datas.CircleAccountNo }</Text>
              </View>
              <View>
                <Text decode>账户余额&nbsp;(元)&nbsp;:</Text>
                <Text className='price'>{ splitThousand(datas.Balance) }</Text>
              </View>
              <View style={{display: display}}>
                <Image src={`${imgUrl}info.png`} />
                <View>账号余额不足</View>
                <View onClick={() => this.setState({isOpened1: true})}>去充值</View>
              </View>
            </View>
          } */}

          <View className='p'  style={{paddingTop: '20rpx'}}>
            <Text>手机号码</Text>
            {
              JSON.stringify(datas) !== '[]' && (
                <Text>{ `${datas.Tel.slice(0,3)} **** ${datas.Tel.slice(-4)}` }</Text>
              )
            }
          </View>
          <View className='c'>
            <AtInput title='验证码' type='number'
              className='bot_line'
              maxLength='6'
              placeholder='请输入验证码'
              value={code}
              onChange={this.handleChange.bind(this,'code')}
            >
              <View className='codeBtn' onClick={this.getCode}>{ codeBtn }</View>
            </AtInput>
            <AtInput title='交易密码'
              type='password'
              placeholder='请输入交易密码'
              value={password}
              onChange={this.handleChange.bind(this,'password')}
            />
          </View>

          <View className='footer'>
            <AtButton onClick={this.handleClick} type='primary'>确定</AtButton>
          </View>

        </View>
      </View>
    )
  }
}
