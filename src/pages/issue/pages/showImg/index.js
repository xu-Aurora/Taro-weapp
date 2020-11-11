import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem } from '@tarojs/components'
import './index.scss'

export default class Index extends PureComponent {

  constructor () {
    super(...arguments)
    this.state = {
      imgUrls: [],
      currentSwiper: ''
    }
  }

  componentWillMount() {
    this.setState({
      imgUrls: this.$router.preload.imgUrls,
      currentSwiper: this.$router.preload.index
    })
  }

  swiperChange = (e) => {
    this.setState({
      currentSwiper: e.detail.current
    })
  }
  

  render () {
    const { imgUrls } = this.state
    return (
      <View className='imgs'>
        <Swiper currentSwiper={this.state.currentSwiper} onChange={this.swiperChange}>
          {
            imgUrls.map((ele) => {
              return (
                <SwiperItem key={ele} >
                  <Image src={ele} />
                </SwiperItem>
              )
            })
          }
        </Swiper>
      </View>
    )
  }
}
