import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5'
import { toast } from '../../global_data'
import { throttle } from '../../utils/util'
import api from '../../api/api'
import './index.scss'



export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '交易密码修改'
  }

  constructor () {
    super(...arguments)
    this.state = {
      code: '',     //验证码
      newDealPwd: '',   //  新密码
      sureDealPwd: '',    //  确认密码
      codeBtn: '获取动态码',
      btn: false,
    }

    this.save = throttle(this.save1)
  }

  //获取动态码
  getCode = () => {
    if(!this.state.btn){
      this.setState({
        btn: true
      })
      api.gainCode({
        Tel: Taro.getStorageSync('userInfoData')?JSON.parse(Taro.getStorageSync('userInfoData')).Mobile:'',
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        Type: 3
      }).then(res => {
        if (res.data.code === 200) {
          toast('发送成功', 'success', 1500)
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

  //双向绑定
  handleChange (type, e) {
    this.setState({
      [type]: e
    })
  }

  regx () {
    const { newDealPwd, sureDealPwd, code } = this.state

    if (code === '') {
      toast('请输入验证码！', 'none', 2000)
      return false
    } else if(newDealPwd === '') {
      toast('请输入交易密码！', 'none', 2000)
      return false
    } else if(sureDealPwd === '') {
      toast('请输入确认密码！', 'none', 2000)
      return false
    } else if(sureDealPwd !== newDealPwd) {
      toast('两次密码不一致!', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  // 保存
  save1 = () => {

    const { code, newDealPwd } = this.state
    if (this.regx()) {
      api.updateDealPwd({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          PayPassword: md5(newDealPwd),
          VerificationCode: code
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info, 'success', 1500).then(() => {
            setTimeout(() => {
              Taro.switchTab({
                url: '../perCenter/index'
              })
              Taro.eventCenter.trigger('getAccountAmt')
            }, 1500)
          })
  
        }
      })
    }

  }

  render () {
    const { code, codeBtn, newDealPwd, sureDealPwd } = this.state
    const userInfoData = Taro.getStorageSync('userInfoData')&&JSON.parse(Taro.getStorageSync('userInfoData'))
    const Mobile = userInfoData && `${userInfoData.Mobile.slice(0,3)} **** ${userInfoData.Mobile.slice(-4)}`
    return (
      <View className='boxs'>
        {/* <Header onNum={num} onTitle={title} onNavType={navType} /> */}
        <View className='dealPwd_update1'>
          <View>
            <Text>手机号码</Text>
            <Text>{Mobile}</Text>
          </View>

          <View>
            <AtInput title='验证码' type='number' className='bot_line'
              maxLength='6'
              placeholder='请输入验证码'
              value={code}
              onChange={this.handleChange.bind(this, 'code')}
            >
              <View className='codeBtn' onClick={this.getCode}>{ codeBtn }</View>
            </AtInput>
          </View>

          <View>
            <AtInput title='新交易密码' type='password' className='bot_line'
              placeholder='请输入新密码'
              value={newDealPwd}
              onChange={this.handleChange.bind(this, 'newDealPwd')}
            />
            <AtInput title='确认新密码' type='password'
              placeholder='请输入再次新密码'
              value={sureDealPwd}
              onChange={this.handleChange.bind(this, 'sureDealPwd')}
            />
          </View>

          <View className='footer'>
            <AtButton 
              onClick={this.save}
              type='primary'
            >保存</AtButton>
          </View>

        </View>
      </View>
    )
  }
}
