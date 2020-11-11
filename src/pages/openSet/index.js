import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'


export default function Index() {

  const openSet = () => {
    Taro.openSetting()
  }

  return (
    <View className='index'>
      <AtButton 
        type='primary' 
        onClick={openSet}
      >打开权限设置</AtButton>
    </View>
  )
}
