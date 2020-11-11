import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import api from '../../api/api'
import { throttle } from '../../utils/util'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '开通浙商银行卡'
  }

  constructor () {
    super(...arguments)
    this.state = {
    }

    this.handleClick = throttle(this.handleClick1)
  }


  handleClick1 = () => {

    api.videoRandom({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      FaceType: 2,   // 开准一类户
    }).then(res => {
      if (res.data.code === 200) {
        const data = res.data.data
        this.$preload({
          payType: 'web_h5',
          datas: {
            OrderCode: '',
          },
          code: data.Code,
          FaceCompareType: 1    // 视频认证
        })
        Taro.navigateTo({
          url: `../identityVerify/index`
        })
      }
    })

  }


  render () {
    return (
      <View className='boxs'>

        <View>加入商圈必须绑定浙商银行卡，若无浙商卡，请点击开通</View>
        
        <View>  
          <AtButton 
            onClick={this.handleClick} 
            type='primary'
          >开通浙商银行卡</AtButton>
        </View>

      </View>
    )
  }
}

