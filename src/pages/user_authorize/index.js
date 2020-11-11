import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import { imgUrl } from '../../utils/util'
import './index.scss'


export default function Authorize() {

  const authorize = () => {
    Taro.getUserInfo({
      success: () => {    // 授权成功，跳转到首页
        Taro.reLaunch({
          url: '../home/index'
        })
      }
    })
  }

  return (
    <View className='boxs'>

      <View>
        <View>
          <Image src={`${imgUrl}no_server.png`} className='img' />
        </View>

        <View>您未授权本小程序，无法进行后续操作！</View>


        <View>
          <AtButton 
            type='primary' 
            openType='getUserInfo'
            onGetUserInfo={() => authorize()}
          >用户授权</AtButton>
        </View>
      </View>

    </View>

  )
}
