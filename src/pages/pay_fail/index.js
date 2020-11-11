import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { imgUrl } from '../../utils/util'
import './index.scss'

export default class Index extends PureComponent {

  // config = {
  //   navigationStyle: 'custom',
  // }

  constructor () {
    super(...arguments)
    this.state = {
      // num: 1,
      info: ''
    }
  }


  componentWillMount () {
    this.setState({
      info: this.$router.preload.info
    })
  }


  render () {
    return (
      <View>
        <View className='pay_fail'>
          <View>
            <Image src={`${imgUrl}warning.png`} />
          </View>
          <View>支付失败</View>
          <View>{ this.state.info }</View>
          <View>
            {/* 请尽快完成支付，全额购买，未付定金，下单后没有及时支付，提示内容xxxxxx */}
          </View>
        </View>
      </View>
    )
  }
}
