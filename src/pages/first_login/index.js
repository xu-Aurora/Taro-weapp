import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
// import { AtList, AtListItem } from "taro-ui"
import { AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5';
import { imgUrl, throttle } from '../../utils/util'
import { toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'

export default class Index extends PureComponent {

  // config = {
  //   navigationBarTitleText: '首次登录'
  // }

  constructor () {
    super(...arguments)
    this.state = {
      // datas: {
      //   CardList: []
      // }
      password: '',
      surePassword: ''
    }

    this.confirm = throttle(this.confirm1)
  }

  handleChange (type, e) {
    this.setState({
      [type]: e
    })
  }

  regx() {
    const { surePassword, password } = this.state
    if (password == '') {
      toast('请输入交易密码！', 'none', 2000)
      return false
    } else if (surePassword == ''){
      toast('请输入确认密码！', 'none', 2000)
      return false
    } else if (password !== surePassword){
      toast('两次密码不一致！', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  confirm1 = () => {

    if (this.regx()) {
      api.setPayPassword({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          PayPassword: md5(this.state.password),
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',1500).then(() => {
            api.userInfo({
              LoginMark: Taro.getStorageSync('uuid'),
              Token: JSON.parse(Taro.getStorageSync('userInfo')).token
            }).then(res1 => {
              if (res1.data.code === 200) {
                let datas = res1.data.data
                Taro.setStorageSync('userInfoData', JSON.stringify(datas))
                if (this.$router.preload.page === 'first_login') {
                  setTimeout(() => {
                    // if (datas.IsSetPayPwd == 1 && datas.CardList.length > 0) {
                      this.$preload({
                        firstLogin: true
                      })
                      Taro.switchTab({
                        url: '../home/index'
                      })
                    // }else{
                    //   Taro.redirectTo({
                    //     url: '../first_login/index'
                    //   })
                    // }
                  }, 1000)
      
                } else {
                  Taro.switchTab({
                    url: '../perCenter/index'
                  })
                }
              }
            })
          })
        } else {
          toast(res.data.info, 'none', 3000)
        }
      })
    }

  }


  // goPage (type) {
  //   this.$preload({
  //     page: 'first_login'
  //   })
  //   Taro.navigateTo({
  //     url: `../${type}/index`
  //   })
  // }

  // componentWillMount () { 
  //   api.userInfo({
  //     LoginMark: Taro.getStorageSync('uuid'),
  //     Token: JSON.parse(Taro.getStorageSync('userInfo')).token
  //   }).then(res => {
  //     if (res.data.code === 200) {
  //       this.setState({
  //         datas: res.data.data
  //       })
  //     }
  //   })
  // }


  render () {
    // const { datas } = this.state
    const { password, surePassword } = this.state
    return (
      <View className='first_login'>
        <View>欢迎登录资产通平台！</View>
        {/* <View>首次登录请先绑定银行卡，并设置交易密码</View> */}
        <View>首次登录请设置交易密码</View>

        <View className='set_dealPwd'>
          <View>
            <AtInput title='交易密码'
              type='password'
              placeholder='6-12位字符，区分大小写'
              value={password}
              onChange={this.handleChange.bind(this,'password')}
            />
            <AtInput title='确认密码'
              type='password'
              placeholder='请再次输入密码'
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
          <View className='tips'>
            <View>
              <Image mode='widthFix' src={`${imgUrl}remind.png`} />
            </View>
            <View>交易密码设置用于后续交易验证</View>
          </View>
        </View>
        
        {/* <View>
          <AtList>
            {
              datas.CardList.length <= 0 && (
                <AtListItem 
                  className='bot_line'
                  onClick={this.goPage.bind(this,'bank_card_add')}
                  title='绑定银行卡' 
                  extraText='未设置' 
                  arrow='right'
                />
              )
            }
            {
              datas.IsSetPayPwd !== 1 && (
                <AtListItem 
                  onClick={this.goPage.bind(this,'set_dealPwd')}
                  title='设置交易密码' 
                  extraText='未设置' 
                  arrow='right'
                />
              )
            }
          </AtList>
        </View> */}
        

      </View>
    )
  }
}

