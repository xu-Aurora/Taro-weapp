import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
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
      title: '手机号修改',
      navType: 'backHome',
      code: '',     //验证码
      phone: '',    //手机号码
      codeBtn: '获取动态码',
      btn: false,
      num: 1
    }

    this.save = throttle(this.save1)
  }


  //获取动态码
  getCode = () => {
    if (this.state.phone.length !== 11) {
      toast('请输入正确手机号','none',3000)
      return
    }
    if(!this.state.btn){
      this.setState({
        btn: true
      })
      api.gainCode({
        Tel: this.state.phone,
        Type: 2
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
    const { phone, code } = this.state
    if (phone == '') {
      toast('请输入新手机号码！', 'none', 2000)
      return false
    } else if (code == '') {
      toast('请输入验证码！', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  save1 = () => {
    
    if (this.regx()) {
      api.updateUser({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          Mobile: this.state.phone,
          VerificationCode: this.state.code
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',1500).then(() => {
            Taro.eventCenter.trigger('getUserInfo')
          })
          setTimeout(() => {
            Taro.switchTab({
              url: '../perCenter/index'
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

  componentWillMount () { }


  render () {
    const titleHeight = get('titleHeight')
    const { num, title, phone, code, codeBtn, navType } = this.state
    return (
      <View className='boxs'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View className='phone_update' 
          style={{marginTop: titleHeight}}
        >
          <View>
            <AtInput title='新手机号码' type='phone'
              className='bot_line'
              placeholder='请输入新手机号码'
              value={phone}
              onChange={this.handleChange.bind(this,'phone')}
            />
            <AtInput title='验证码' type='number'
              maxLength='6'
              placeholder='请输入验证码'
              value={code}
              onChange={this.handleChange.bind(this,'code')}
            >
              <View className='codeBtn' onClick={this.getCode}>{ codeBtn }</View>
            </AtInput>
          </View>
          {/* <View>
            <AtInput title='交易密码' type='phone'
              placeholder='请输入交易密码'
              value={this.state.password}
              onChange={this.handleChange.bind(this,'password')}
            />
          </View> */}

          <View className='footer'>
            <AtButton
              type='primary' 
              onClick={this.save}
            >保存</AtButton>
          </View>
        </View>
      </View>

    )
  }
}
