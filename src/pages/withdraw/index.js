import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5'
import Header from '../../components/header/header'
import { throttle } from '../../utils/util'
import api from '../../api/api'
import { get, toast } from '../../global_data'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      num: 1,
      money: '',
      code: '',
      password: '',
      codeBtn: '获取动态码',
      navType: 'backHome',
      btn: false,
      title: '提现',
    }

    this.withDraw = throttle(this.withDraw1)
  }


  //获取动态码
  getCode = () => {
    if(!this.state.btn){
      this.setState({
        btn: true
      })
      api.gainCode({
        Tel: JSON.parse(Taro.getStorageSync('userInfoData')).Mobile,
        Type: 8
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

  regx() {
    const { money, password, code } = this.state
    if (money =='') {
      toast('请输入提现金额！', 'none', 2000)
      return false
    } else if (code == ''){
      toast('请输入验证码！', 'none', 2000)
      return false
    } else if (password ==''){
      toast('请输入交易密码！', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  //提现
  withDraw1 = () => {

    if (this.regx()) {
      api.withDraw({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          CircleId: this.state.datas.CircleId,
          Amt: this.state.money,
          VerificationCode: this.state.code,
          PayPassword: md5(this.state.password)
        })
      }).then(res => {
        if (res.data.code ===200) {
          toast(res.data.info,'success',1500)
          setTimeout(() => {
            Taro.switchTab({
              url: '../busArea/index'
            })
          }, 1500);
        }else{
          toast(res.data.info,'none',3000)
        }
  
      })
    }

  }

  handleChange (type,value) {
    this.setState({
      [type]: value
    })
  }


  componentWillMount () {
    this.setState({
      datas: this.$router.preload.datas
    })
  }

  render () {
    const titleHeight = get('titleHeight')
    const { datas, code, codeBtn, password, num, title, money, navType } = this.state
    let phone = Taro.getStorageSync('userInfoData')?JSON.parse(Taro.getStorageSync('userInfoData')).Mobile:''
    let mobile = `${phone.slice(0,3)} **** ${phone.slice(-4)}`
    return (
      <View className='boxs'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View className='withdraw' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View>
            <Text decode>收款账号&nbsp;:&nbsp;&nbsp;</Text>
            <Text>{ datas.accNo }</Text>
          </View>
          <View>
            <AtInput
              title='提现金额 (元)'
              className='bot_line'
              type='digit'
              placeholder='请输入提现金额'
              value={money}
              onChange={this.handleChange.bind(this,'money')}
            />
            <View className='tx'>
              <View>可用余额{ datas.Amt }元</View>
              <View onClick={() => this.setState({money: datas.Amt})}>全部提现</View>
            </View>
          </View>
          <View>
            <Text>手机号码</Text>
            <Text>{ mobile }</Text>
          </View>
          <View>
            <AtInput 
              title='验证码' type='number'
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
            <AtButton 
              type='primary' 
              onClick={this.withDraw}
            >提现</AtButton>
          </View>
        </View>

      </View>

    )
  }
}
