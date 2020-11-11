import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtList, AtListItem } from "taro-ui"
import api from '../../api/api'
import { throttle } from '../../utils/util'
import baseURL from '../../service/baseUrl'
import { toast } from '../../global_data'
import './index.scss'

export default class Index extends PureComponent {

  constructor () {
    super(...arguments)
    this.state = {
      headIcon: ''
    }
    
    this.exit = throttle(this.exit1)
  }

  config = {
    navigationBarTitleText: '个人信息'
  }
  //点击上传图片
  handleClick() {
    let t = this
    Taro.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        if (res.tempFiles[0].size >= 500000) {
          toast('图片不能大于5M','none',1500)
          return false
        } else {
          Taro.uploadFile({
            url: `${baseURL()}Modules/UserInfo/SvHeadIcon`,
            filePath: res.tempFilePaths[0],
            formData: {
              LoginMark: Taro.getStorageSync('uuid'),
              Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
              data: JSON.stringify({
                HeadIcon: Taro.getFileSystemManager().readFileSync(res.tempFilePaths[0], "base64"),
                type: 'png'
              })
            },
            name: 'file',
            success (r) {
              if (JSON.parse(r.data).code === 200) {
                toast(JSON.parse(r.data).info,'success',2000)
                Taro.eventCenter.trigger('getUserInfo')
                t.setState({
                  headIcon: res.tempFilePaths[0]
                })
              } else {
                toast(JSON.parse(r.data).info,'none',3000)
              }
            }
          })
        }
      }
    })
  }

  //页面跳转
  goPage (type) {
    Taro.navigateTo({ 
      url: `../${type}/index` 
    });
  }
  //退出
  exit1 = () => {

    api.loginOut({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',2000).then(() => {
          Taro.reLaunch({
            url: '../login/index'
          })
        })
        Taro.removeStorageSync('userInfo')
        Taro.removeStorageSync('userInfoData')
        Taro.removeStorageSync('Account')
        Taro.removeStorageSync('Password')
      }
    })

  }

  componentWillMount () {
    this.setState({
      headIcon: Taro.getStorageSync('userInfoData')&&JSON.parse(Taro.getStorageSync('userInfoData')).HeadIcon
    })
  }

  render () {
    const userInfoData = Taro.getStorageSync('userInfoData')&&JSON.parse(Taro.getStorageSync('userInfoData'))
    const Mobile = userInfoData&&`${userInfoData.Mobile.slice(0,3)} ${userInfoData.Mobile.slice(3,7)} ${userInfoData.Mobile.slice(-4)}`
    const ifUpload = userInfoData.IdCardFront!==null&&userInfoData.IdCardReverse!==null?'已上传':'未上传'
    const Account = userInfoData&&`${userInfoData.Account.slice(0,6)} ${userInfoData.Account.slice(6,10)} ${userInfoData.Account.slice(10,14)} ${userInfoData.Account.slice(-4)}`
    return (
      <View className='perInfo'>
        <View>
          <AtList>
            <AtListItem title='头像' 
              className='bot_line'
              onClick={this.handleClick.bind(this)}
              thumb={this.state.headIcon}
              arrow='right'
            />
            <AtListItem className='bot_line' title='姓名' extraText={userInfoData.RealName} />
            <AtListItem className='bot_line' title='证件类型' extraText='身份证' />
            <AtListItem className='bot_line' title='证件号' extraText={Account} />
            <AtListItem title='证件上传' 
              className='bot_line'
              onClick={this.goPage.bind(this, 'userId_update')} 
              extraText={ifUpload} arrow='right'
            />
            <AtListItem title='手机号' 
              className='bot_line'
              onClick={this.goPage.bind(this, 'phone_update')} 
              extraText={Mobile} arrow='right'
            />
            <AtListItem title='更多' onClick={this.goPage.bind(this, 'more')} arrow='right' />
          </AtList>
        </View>

        <View>
          <AtList>
            <AtListItem title='登录密码'  
              className='bot_line'
              onClick={this.goPage.bind(this, 'pwd_update')} 
              arrow='right'
            />
            <AtListItem title='交易密码' 
              onClick={this.goPage.bind(this, 'dealPwd_update1')} 
              arrow='right'
            />
          </AtList>
        </View>

        <View className='btn'>
          <View onClick={this.exit}>退出登录</View>
        </View>
      </View>
    )
  }
}
