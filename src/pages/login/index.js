import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5'
import { throttle } from '../../utils/util'
import Header from '../../components/header/header'
import { get, toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      account: '',
      password: '',
      param: 'home',
      navType: 'home',
      title: '登录'
    }
    Taro.eventCenter.on('getUserInfo',this.getUserInfo.bind(this))

    this.login = throttle(this.login1)
  }

  handleChange (type,e) {
    this.setState({
      [type]: e
    })
  }

  //获取用户设备识别号
  uuid() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    Taro.setStorageSync('uuid', uuid+'_1')
  }



  //获取用户信息,判断是否第一次登录
  getUserInfo1 () {
    api.userInfo({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
        Taro.setStorageSync('userInfoData',JSON.stringify(res.data.data))
        
        // if ((res.data.data.IsSetPayPwd == 1) && (res.data.data.CardList.length> 0) ) {   //绑定银行卡和设置了交易密码,不是第一次登录
        if (res.data.data.IsSetPayPwd == 1) {  
          this.$preload({
            page: this.state.param
          })
          Taro.switchTab({
            url: `../${this.state.param}/index`
          })
        } else {    //第一次登录,跳转到第一次登录页面
          this.$preload({
            page: 'first_login'
          })
          Taro.navigateTo({
            url: '../first_login/index'
          })
        }
      }
    })
  }

  getUserInfo () {
    api.userInfo({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      existLoading: true
    }).then(res => {
      if (res.data.code === 200) {
        Taro.setStorageSync('userInfoData',JSON.stringify(res.data.data))
      }
    })
  }

  //登录
  login1 = () => {
    const { account, password } = this.state
    if (account == '') {
      toast('请输入账号！', 'none', 1500)
      return false
    } else if (password == '') {
      toast('请输入密码！', 'none', 1500)
      return false
    }

    api.userLogin({
      LoginMark: Taro.getStorageSync('uuid'),
      data: JSON.stringify({
        Account: account,
        Password: md5(password),
      })
    }).then(res => {
      if(res.data.code === 200) {
        //把用户的账户和密码存到本地
        Taro.setStorageSync('Account', this.state.account)
        Taro.setStorageSync('Password', md5(this.state.password))
        let userInfo = {
          userName: res.data.data.RealName,  //用户名
          headIcon: res.data.data.SvHeadIcon,  //用户头像
          token: res.data.data.Token,     //token
        }
        Taro.setStorageSync('userInfo',JSON.stringify(userInfo))

        //获取用户信息,判断是否第一次登录
        this.getUserInfo1()
      }

    })

  }

  // Taro.getUserInfo({
  //   success: () => {  // 授权成功
  //     Taro.login({    // 获取微信code
  //       success: (r) => {
  //         api.userLogin({
  //           LoginMark: Taro.getStorageSync('uuid'),
  //           data: JSON.stringify({
  //             Account: account,
  //             Password: md5(password),
  //             code: r.code
  //           })
  //         }).then(res => {
  //           if(res.data.code === 200) {
  //             //把用户的账户和密码存到本地
  //             Taro.setStorageSync('Account', account)
  //             Taro.setStorageSync('Password', md5(password))
      
  //             const { RealName, SvHeadIcon, Token } = res.data.data
  //             let userInfo = {
  //               userName: RealName,  //用户名
  //               headIcon: SvHeadIcon,  //用户头像
  //               token: Token     //token
  //             }
  //             Taro.setStorageSync('userInfo',JSON.stringify(userInfo))
      
  //             //获取用户信息,判断是否第一次登录
  //             t.getUserInfo1()
  //           }
      
  //         })
  //       }
  //     })
  //   },
  //   fail: () => {  // 拒绝获取授权，页面跳转
  //     Taro.navigateTo({
  //       url: '../user_authorize/index'
  //     })
  //   }
  // })

  goPage(type) {
    Taro.navigateTo({
      url: `../${type}/index`
    })
  }

  componentWillMount () { 
    this.uuid();
    if (this.$router.params.param) {
      this.setState({
        param: this.$router.params.param
      })
    }
  }


  render () {
    const { title, navType } = this.state
    const titleHeight = get('titleHeight')
    return (
      <View>
        <Header onTitle={title} onNavType={navType} />
        <View className='login' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          {/* 头部 */}
          <View className='head'>
            <View>
              <Text>登录</Text>
              <View>
                <Text>没有账号, </Text>
                <Text onClick={this.goPage.bind(this, 'register')}>去注册</Text>
              </View>
            </View>
          </View>

          <View>
            <AtInput title='账号' name='account' type='idcard'
              className='bot_line'
              placeholder='请输入身份证/手机号'
              value={this.state.account}
              onChange={this.handleChange.bind(this,'account')}
            />
            <AtInput title='密码' name='password' type='password'
              className='bot_line'
              placeholder='6-12位字符，区分大小写'
              value={this.state.password}
              onChange={this.handleChange.bind(this,'password')}
            />
          </View>

          <View>
            <AtButton 
              type='primary' 
              onClick={this.login}
            >登录</AtButton>
          </View>
          {/* <View>
            <AtButton 
              type='primary' 
              openType='getUserInfo'
              onGetUserInfo={this.login}
            >登录</AtButton>
          </View> */}
          <View onClick={this.goPage.bind(this, 'reset_pwd')}>忘记密码</View>
        </View>
      </View>

    )
  }
}
