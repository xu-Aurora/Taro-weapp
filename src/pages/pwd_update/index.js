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
      title: '登录密码修改',
      navType: 'backHome',
      password: '',
      newPassword: '',
      surePassword: '',
      num: 1,
    }

    this.save = throttle(this.save1)
  }

  handleChange(type, e) {
    this.setState({
      [type]: e
    })
  }

  regx() {
    const { newPassword, surePassword, password } = this.state
    if (password == '') {
      toast('请输入原登录密码！', 'none', 2000)
      return false
    } else if (newPassword == '') {
      toast('请输入新密码!', 'none', 2000)
      return false
    } else if (surePassword == '') {
      toast('请再次输入新密码!', 'none', 2000)
      return false
    } else if (surePassword !== newPassword) {
      toast('两次密码不一致!', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  save1 = () => {
    
    if (this.regx()) {
      api.updatePAW({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          Password: md5(this.state.password),
          NewPassword: md5(this.state.newPassword)
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',1500)
          setTimeout(() => {
            Taro.redirectTo({
              url: '../login/index'
            })
          }, 1500);
        } else {
          toast(res.data.info,'none',2000)
        }
      })
    }

  }

  render () {
    const titleHeight = get('titleHeight')
    const { surePassword, newPassword, password, num, title, navType } = this.state
    return (
      <View className='boxs'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View className='pwd_update' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
        <View>
          <AtInput title='原登录密码' type='password'
            placeholder='6-12位字符，区分大小写'
            className='bot_line'
            value={password}
            onChange={this.handleChange.bind(this,'password')}
          />
          <AtInput title='新登录密码' type='password'
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
            onClick={this.save}
          >保存</AtButton>
        </View>
      </View>
      </View>
    )
  }
}
