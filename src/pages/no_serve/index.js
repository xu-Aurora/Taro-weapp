import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { imgUrl } from '../../utils/util'
import './index.scss'



export default function Index() {

  return (
    <View className='no_serve'>
      <View>
        <View className='one'>
          <Image src={`${imgUrl}no_server.png`} className='img' />
        </View>

        <View className='tips'>
          系统繁忙，请稍后再试!
        </View>

      </View>


    </View>
  )
}
