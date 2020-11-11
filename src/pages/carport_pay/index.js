import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtIcon, AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5';
import { imgUrl } from '../../utils/util'
import Header from '../../components/header/header'
import './index.scss'
import { get, toast } from '../../global_data'
import api from '../../api/api'

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      num: 1,
      navType: 'back',
      code: '',       //验证码
      password: '',  //交易密码
      price: '',     //回购价格
      codeBtn: '获取动态码',
      btn: false, //用来控制发送验证码按钮多次点击
      userName: '', //用户名
      idNo: '',     //身份证号
      userId: '',    //用户id
      disabled: true,   //判断用户是否输入框全部输入,控制按钮点击
      btnLoading: false,
      title: '',
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
        Type: 6
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

  //input框双向绑定
  handleChange (type, e) {
    this.setState({
      [type]: e
    },() => {
      if (get('type') === 'zr') {
        if ((this.state.code !== '') && (this.state.password !== '') && (this.state.price !== '') && (this.state.userId !== '')) {
          this.setState({
            disabled: false
          })
        }else{
          this.setState({
            disabled: true
          })
        }
      }else{
        if ((this.state.code !== '') && (this.state.password !== '') && (this.state.userId !== '')) {
          this.setState({
            disabled: false
          })
        }else{
          this.setState({
            disabled: true
          })
        }
      }
    })
  }

  //选择支付对象,跳转
  goPage () {
    let datas = {
      CircleId: this.$router.preload.CircleId
    }
    this.$preload({
      datas,
      id: this.$router.preload.id,
      page: 'carport_detail'
    })
    Taro.navigateTo({
      url: '../invite_join/index'
    })
  }

  //  支付/转让
  pay () {
    if (get('type') === 'zr') {
      if (this.state.price <= 0) {
        toast('转让金额必须大于0','none',2000)
        return 
      }
    }
    this.setState({
      disabled: true,
      btnLoading: true
    },() => {
      api.attornPay({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          Amt: get('type') === 'zr' ? this.state.price : 0,
          userId: this.state.userId,
          VerificationCode: this.state.code,
          PayPassword: md5(this.state.password),
          ParkingId: this.$router.preload.id
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',1500)
  
          setTimeout(() => {
            Taro.switchTab({
              url: '../myCarport/index'
            }).then(() => {
              this.setState({
                disabled: false,
                btnLoading: false
              })
            })
          }, 1500);
        } else {
          toast(res.data.info,'none',3000)
          this.setState({
            disabled: false,
            btnLoading: false
          })
        }
      })
    })

  }
  //返回
  goBack () {
    Taro.navigateBack({ 
      delta: 1
    })
  }

  componentWillMount () { 
    this.setState({
      userName: this.$router.preload.UserName,
      idNo: this.$router.preload.IdNo,
      userId: this.$router.preload.UserId ? this.$router.preload.UserId : this.state.userId,
      title: get('type') === 'zr'?'转让':'支付',
    })
  }


  render () {
    const titleHeight = get('titleHeight')
    const { title, disabled, btnLoading, code, idNo, codeBtn, password, price, userName, num, navType } = this.state
    let phone = Taro.getStorageSync('userInfoData')&&JSON.parse(Taro.getStorageSync('userInfoData')).Mobile
    return (
      <View className='boxs'>
        <Header onNum={num}  onTitle={title} onNavType={navType} />
        <View className='carport_pay' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View>请选择{ title }对象</View>
          <View onClick={this.goPage.bind(this)}>
            <View>{ title }对象</View>
            <View>
              <View>{ userName }</View>
              <View>{ idNo && `身份证号 : ${this.state.idNo}` }</View>
            </View>
            <View>
              <AtIcon value='chevron-right' color='#C7C7CC'></AtIcon>
            </View>
          </View>
            
          <View>
            {
              get('type') === 'zr' && (
                <AtInput title='转让价格'
                  type='digit'
                  placeholder='请输入价格'
                  value={price}
                  onChange={this.handleChange.bind(this,'price')}
                />
              )
            }
          </View>


          <View>
            <Text>手机号码</Text>
            <Text>{ `${phone.slice(0,3)} **** ${phone.slice(-4)}` }</Text>
          </View>
          <View>
            <AtInput clear title='验证码' type='number'
              maxLength='6'
              className='bot_line'
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
            <AtButton disabled={disabled} type='primary' onClick={this.pay.bind(this)}>
              { title }
            </AtButton>
          </View>
          <View className='tips'>
            <View>
              <Image mode='widthFix' src={`${imgUrl}remind.png`} />
            </View>
            <View>
              { `${title}对象需要在同一商圈内方可完成${title}。` }
            </View>
          </View>
        </View>
      </View>

    )
  }
}
