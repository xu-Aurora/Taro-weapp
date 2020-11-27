import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Header from '../../components/header/header'
import { get } from '../../global_data'
import { imgUrl } from '@/utils/util'
import './index.scss'

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      navType: 'home'
    }
  }

  goPage (type) {
    Taro.navigateTo({
      url: `../${type}/index?param=${this.$router.params.param}`
    })
  }


  render () {
    const { navType } = this.state
    const titleHeight = get('titleHeight')
    return (
      <View className='boxs'>
        <Header onNavType={navType} />

        <View className='login_hint' 
          style={{marginTop: titleHeight,height: `calc(100vh - ${titleHeight})`}}
        >
          <View>
            <Image src={`${imgUrl}logo.png`} className='logo'>

            </Image>
          </View>
          <View className='tips'>您还未登录，请先登录或注册</View>
          <View>
            <AtButton onClick={this.goPage.bind(this,'login')} className='btn' type='primary'>去登录</AtButton>
            <AtButton onClick={this.goPage.bind(this,'register')} type='secondary'>去注册</AtButton>
          </View>
        </View>
      </View>

    )
  }
}
