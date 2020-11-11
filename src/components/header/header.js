import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, CoverView, CoverImage } from '@tarojs/components'
import { get } from '../../global_data'
import { imgUrl } from '../../utils/util'
import './index.scss'

export default class Header extends PureComponent {

  goBack = () => {
    const { onNum } = this.props
    if (onNum === 1) {
      Taro.navigateBack({ delta: onNum})
    }else if(onNum === 'busArea'){
      Taro.switchTab({ 
        url: '../busArea/index'
      })
    }else if(onNum === 'myOrder'){
      Taro.switchTab({ 
        url: '../perCenter/index'
      })
    }else if (onNum === 'release') {
      Taro.redirectTo({ 
        url: '../home/index'
      })
    }else if(onNum === 'myRelease'){
      Taro.switchTab({ 
        url: '../../../perCenter/index'
      })
    }else if(onNum === 'issue_home'){
      Taro.switchTab({ 
        url: '../../../home/index'
      })
    }else if(onNum === 'order_detail'){
      this.$preload({
        current: +this.props.onCur
      })
      this.$preload({
        params: this.props.onCur
      })
      Taro.redirectTo({ 
        url: `../myOrder/index`
      })
    }else if(onNum === 'myCarport' || onNum === 'myLoan'){
      Taro.switchTab({ 
        url: '../myCarports/index'
      })
    }else if(onNum === 'circle'){
      this.$preload({
        CircleId: get('CircleId')
      })
      Taro.navigateTo({ 
        url: '../circle/index'
      })
    }
  }
  goHome = () => {
    if (this.props.onSub) {   //子包
      Taro.switchTab({
        url: '../../../home/index'
      })  
    }else{                    //主包
      Taro.switchTab({
        url: '../home/index'
      })
    }
  }


  render () {
    const { onTitle, onNavType } = this.props
    const status = get('statusHeight')
    const navHeight = get('navHeight')
    return (
      <View className='nav_box'>
        {/* back home */}
        { onNavType === 'backHome' && (
          <View className='nav' style={{height: `calc(${status}px + ${navHeight}px)`}}>
            <View className='status' style={{height: `${status}px`}}></View>
            <View className='navbar' style={{height: `${navHeight}px`}}>
              <View className='btn_box'>
                <View className='back-icon' onClick={this.goBack}>
                  <Image className='img' src={`${imgUrl}left.png`} />
                </View>
                <View className='home-icon' onClick={this.goHome}>
                  <Image className='img' src={`${imgUrl}head_home.png`} />
                </View>
              </View> 
              <View className='nav-title'>
                { onTitle && onTitle }
              </View>
            </View>
          </View>
        ) }

        { onNavType === 'coverView' && (
          <CoverView className='nav' style={{height: `calc(${status}px + ${navHeight}px)`}}>
            <CoverView className='status' style={{height: `${status}px`}}></CoverView>
            <CoverView className='navbar' style={{height: `${navHeight}px`}}>
              <CoverView className='btn_box'>
                <CoverView className='back-icon' onClick={this.goBack}>
                  <CoverImage className='img' src={`${imgUrl}left.png`} />
                </CoverView>
                <CoverView className='home-icon' onClick={this.goHome}>
                  <CoverImage className='img' src={`${imgUrl}head_home.png`} />
                </CoverView>
              </CoverView> 
              <CoverView className='nav-title'>
                { onTitle && onTitle }
              </CoverView>
            </CoverView>
          </CoverView>
        ) }

        {/* back */}
        { onNavType === 'back' && (
          <View className='nav' style={{height: `calc(${status}px + ${navHeight}px)`}}>
            <View className='status' style={{height: `${status}px`}}></View>
            <View className='navbar' style={{height: `${navHeight}px`}}>
              <View className='nav_back'>
                <View className='back-icon' onClick={this.goBack}>
                  <Image className='img' src={`${imgUrl}left.png`} />
                </View>
              </View> 
              <View className='nav-title'>
                { onTitle && onTitle }
              </View>
            </View>
          </View>
        ) }
        {/* home */}
        { onNavType === 'home' && (
          <View className='nav' style={{height: `calc(${status}px + ${navHeight}px)`}}>
            <View className='status' style={{height: `${status}px`}}></View>
            <View className='navbar' style={{height: `${navHeight}px`}}>
              <View className='nav_back'>
                <View className='back-icon' onClick={this.goHome}>
                  <Image className='img' src={`${imgUrl}head_home.png`} />
                </View>
              </View> 
              <View className='nav-title'>
                { onTitle && onTitle }
              </View>
            </View>
          </View>
        ) }

      </View>
    )
  }
}
