
import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5'
import { throttle } from '../../utils/util'
import Header from '../../components/header/header'
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
      title: '重置密码',
      navType: 'backHome',
      code: '',     //验证码
      phone: '',    //手机号码
      newPassword: '',
      surePassword: '',
      codeBtn: '获取动态码',
      btn: false,
      num: 1
    }

    this.confirm = throttle(this.confirm1)
  }


  //获取动态码
  getCode = () => {
    if (this.state.phone.length !== 11) {
      toast('请输入正确手机号', 'none', 2000)
      return
    }
    if(!this.state.btn){
      this.setState({
        btn: true
      })
      api.gainCode({
        Tel: this.state.phone,
        Type: 1
      }).then(res => {
        if (res.data.code === 200) {
          toast('发送成功！', 'success', 1000)
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
    const { phone, code, newPassword, surePassword } = this.state
    if (phone == '') {
      toast('请输入绑定手机号', 'none', 2000)
      return false
    } else if (code == '') {
      toast('请输入验证码', 'none', 2000)
      return false
    } else if (newPassword == '') {
      toast('请输入新密码', 'none', 2000)
      return false
    } else if (surePassword == '') {
      toast('请输入确认密码', 'none', 2000)
      return false
    } else if (newPassword !== surePassword) {
      toast('两次密码不一致', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  confirm1 = () => {
    
    if (this.regx()) {
      api.resetPassword({
        data: JSON.stringify({
          Tel: this.state.phone,
          VerificationCode: this.state.code,
          NewPassword: md5(this.state.newPassword)
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast('重置成功！', 'success', 1500)
          setTimeout(() => {
            Taro.reLaunch({
              url: '../login/index'
            })
          }, 1500);
        }
      })
    }

  }

  //input框双向绑定
  handleChange (type,e) {
    this.setState({
      [type]: e
    })
  }


  render () {
    const titleHeight = get('titleHeight')
    const { num, title, phone, code, codeBtn, navType, newPassword, surePassword } = this.state
    return (
      <View className='reset_pwd'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View className='phone_update' 
          style={{marginTop: titleHeight}}
        >
          <View>
            <AtInput title='绑定手机号' type='phone'
              className='bot_line'
              placeholder='请输入绑定的手机号'
              value={phone}
              onChange={this.handleChange.bind(this,'phone')}
            />
            <AtInput title='验证码' type='number'
              maxLength='6'
              className='bot_line'
              placeholder='请输入验证码'
              value={code}
              onChange={this.handleChange.bind(this,'code')}
            >
              <View className='codeBtn' onClick={this.getCode}>{ codeBtn }</View>
            </AtInput>
            <AtInput title='新密码' type='password'
              placeholder='请输入新密码'
              className='bot_line'
              value={newPassword} 
              onChange={this.handleChange.bind(this,'newPassword')}
            />
            <AtInput title='确认新密码' type='password'
              placeholder='请再次输入新密码'
              value={surePassword}
              onChange={this.handleChange.bind(this,'surePassword')}
            />

          </View>

          <View className='footer'>
            <AtButton 
              type='primary' 
              onClick={this.confirm}
            >确定</AtButton>
          </View>
        </View>
      </View>

    )
  }
}
