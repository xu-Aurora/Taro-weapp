/* eslint-disable react/no-unused-state */
import Taro, { PureComponent } from '@tarojs/taro'
import { View, Camera } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Header from '../../components/header/header'
import { nonEmpty } from '../../utils/util'
import baseURL from '../../service/baseUrl'
import { toast, get } from '../../global_data'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      title: '场景存证',
      attestationPrompt: '录制时，请以本人为中心，-左右慢速移动，录制现场环境情况。',
      attestationBtn: '开始录像',
      loadingMsg: '正在保存中...',
      navType: 'backHome',
      back: 1,
      ctx: '',
      num: '',
      disabled: false,
      FaceType: '',
      OrderCode: '',
      flag: true,
      dis: false,
      times: false
    }
  }



  start = () => {
    const { ctx, disabled } = this.state
    if (!disabled) {
      this.setState({
        disabled: true
      }, () => {
        ctx.startRecord({
          success: () => {
            setTimeout(() => {
              this.end()
            }, 5000);
          }
        })
      })
    }
  }

  end() {
    const { ctx, FaceType, OrderCode, loadingMsg } = this.state
    const { payType, datas  } = this.$router.preload
    const t = this
    Taro.showLoading({ title: loadingMsg })
    ctx.stopRecord({
      success: (res) => {
        Taro.uploadFile({
          url: `${baseURL()}Modules/UserInfo/FaceVideoCompare`,
          filePath: res.tempVideoPath,
          name: 'file',
          formData: {
            LoginMark: Taro.getStorageSync('uuid'),
            Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
            FaceType,  
            OrderCode
          },
          success (r) {
            Taro.hideLoading()
            if (JSON.parse(r.data).code === 200) {
              toast(JSON.parse(r.data).info, 'success', 1000).then(() => {
                if (payType === 'buy_back') {   // 申请回购
                  t.$preload({
                    datas,
                    // Warrant: this.$router.preload.Warrant,
                  })
                  Taro.navigateTo({
                    url: '../buy_back/index'
                  })
                } else if (payType === 'web_h5' || payType === 'tx') {   // 加入商圈 || 提现
                  t.jumpToH5openAccount()
                } else if (payType === 5) {   // 首付
                  t.$preload({
                    datas,
                    payType: 5,
                    pages1: 'first_pay',
                    DownPayMent: t.$router.preload.DownPayMent,
                    loanData: t.$router.preload.loanData
                  })
                  Taro.navigateTo({
                    url: '../pay/index'
                  })
                } else {                      // 资产购买
                  t.parkingBuy(t)
                }
              })

            } else {
              toast(JSON.parse(r.data).info, 'none', 1500).then(() => {
                setTimeout(() => {
                  t.getRandomNum(t)
                }, 1500);
              })
            }
          },
          fail (rs){
            toast(rs, 'none', 1500)
            setTimeout(() => {
              t.getRandomNum(t)
            }, 1500);
          }
        })
      }
    })
  }

  // 重新获取随机数
  getRandomNum(t) {
    api.videoRandom({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      FaceType: t.state.FaceType_c,
      OrderCode: t.state.OrderCode
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          num: res.data.data.Code,
          disabled: false
        })
      }
    })
  }
  // 获取h5的url地址
  jumpToH5openAccount() {
    api.h5AddressOfopenAccount({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
    }).then( res => {
      if (res.data.code === 200) {
        this.$preload('h5Url', res.data.data.Url)
        Taro.navigateTo({
          url: '../web_h5/index'
        })
      } else {
        toast(res.data.info, 'none', 2000)
      }
    })
  }
  // 资产购买
  parkingBuy(t) {
    t.$preload({
      inPage: t.$router.preload.pages1,
      payType: t.$router.preload.payType,
      datas: t.$router.preload.datas,
      type: t.$router.preload.type,
      pages1: t.$router.preload.pages1
    })
    Taro.navigateTo({
      url: '../pay/index'
    }).then(() => {
      t.setState({
        disabled: false
      })
    })
  }

  componentDidShow() {
    const t = this

    Taro.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.camera']) {
          Taro.authorize({
            scope: 'scope.camera',
            success: (r) => {
              if (r.errMsg == 'authorize:ok') {
                t.setState({
                  flag: true,
                  dis: false
                })
              }
            },
            fail: (r1) => {
              //第一次进来拒绝授权
              if (r1.errMsg == 'authorize:fail auth deny') {
                Taro.navigateBack({ delta: 1})
              }else if(r1.errCode == '0') {
                //拒绝之后再进入
                t.setState({
                  dis: true,
                  flag: false
                })
              }
            }
          })
        } else {
          t.setState({
            flag: true,
            dis: false
          })
        }
      }
    })

    const { payType, datas } = this.$router.preload
    let code
    if (payType === 'buy_back') {
      code = datas.ParkingId
    } else if(payType === 'web_h5' || payType === 'tx') {
      code = ''
    } else {
      code = datas.OrderCode
    }

    if (nonEmpty(this.$router.preload.FaceMsg)) {
      const { attestationTitle, attestationPrompt, attestationBtn, loadingMsg } = this.$router.preload.FaceMsg
      this.setState({
        title: attestationTitle,
        attestationPrompt: attestationPrompt,
        attestationBtn,
        loadingMsg,
        FaceType: this.$router.preload.FaceType,      // 视频FaceType
        FaceType_c: this.$router.preload.FaceType_c,  // 随机数的FaceType
        OrderCode: code,
        ctx: Taro.createCameraContext(),
        num: this.$router.preload.code
      })
    } else {
      this.setState({
        FaceType: this.$router.preload.FaceType,      // 视频FaceType
        FaceType_c: this.$router.preload.FaceType_c,  // 随机数的FaceType
        OrderCode: code,
        ctx: Taro.createCameraContext(),
        num: this.$router.preload.code
      })
    }
  }

  openSet () {
    Taro.openSetting()
  }

  render () {
    const { back, title, navType,num, disabled, flag, dis, attestationPrompt, attestationBtn } = this.state
    const titleHeight = get('titleHeight')

    return (
      <View className='videotape'>
        <Header onNum={back}  onTitle={title} onNavType={navType} />

        <View style={{marginTop: titleHeight}}>

          { 
            flag &&  
            <View>
              <View className='cam'>
                <Camera
                  device-position='front'
                  frame-size='medium'
                  flash='off'
                  binderror='error'
                  className='camera1'
                />
              </View>

              <View className='video_bom'>
                <View className='videoInfo'>
                  <View>{ attestationPrompt.split('-')[0] }</View>
                  <View>{ attestationPrompt.split('-')[1] }</View>
                </View>
                <View className='videoNum'>{num}</View>
                <AtButton 
                  className='btn' 
                  onClick={this.start} 
                  type='primary'
                  loading={disabled}
                >{ attestationBtn }</AtButton>
              </View>

            </View>
          }
          
          {
            dis && <AtButton type='primary' onClick={this.openSet.bind(this)}>打开权限设置</AtButton>
          }
        </View>


      </View>
    )
  }
}
