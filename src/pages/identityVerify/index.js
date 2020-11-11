import Taro, { PureComponent } from '@tarojs/taro'
import { View, Image, Block } from '@tarojs/components'
import { AtButton } from "taro-ui"
import Header from '../../components/header/header'
import { get } from '../../global_data'
import { imgUrl, throttle } from '../../utils/util'
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
      leadPrompt: '本次交易需录制现场环境影像，本小程序承诺，录制的影像只用于司法纠纷进行举证，如果有发现影像被泄露或用于其他用途可依法追究法律责任。',
      leadBtn: '确认',
      navType: 'backHome',
      num: 1,
      FaceMsg: ''
    }

    this.goPage = throttle(this.goPages)
  }
  // 跳转人证核实页面
  goPages = () => {
    if (this.$router.preload.payType === 5) {                   // 从首付跳转过来
      this.$preload({
        datas: this.$router.preload.datas,
        payType: 5,
        pages1: 'first_pay',
        DownPayMent: this.$router.preload.DownPayMent,
        loanData: this.$router.preload.loanData,
        code: this.$router.preload.code,  // 随机数
        FaceType: 2,
        FaceType_c: 1,
        FaceMsg: this.state.FaceMsg
      })
    } else if (this.$router.preload.payType === 'buy_back') {   // 从申请回购跳转过来
      this.$preload({
        datas: this.$router.preload.datas,
        // Warrant: this.$router.preload.Warrant,
        payType: 'buy_back',
        code: this.$router.preload.code,  // 随机数
        FaceType: 3,
        FaceType_c: 3,
        FaceMsg: this.state.FaceMsg
      })
    } else if (this.$router.preload.payType === 'web_h5') {     // 从加入商圈跳转过来，未开通浙商账户
      this.$preload({
        code: this.$router.preload.code,
        FaceType: 4,
        FaceType_c: 2,
        payType: 'web_h5',
        FaceMsg: this.state.FaceMsg
      })
    } else if (this.$router.preload.payType === 'tx') {         // 从我的商圈提现跳转过来
      this.$preload({
        code: this.$router.preload.code,
        FaceType: 4,
        FaceType_c: 2,
        payType: 'tx'
      })
    } else {                                                    // 从车位购买跳转过来
      this.$preload({
        datas: this.$router.preload.datas,
        payType: this.$router.preload.payType,
        type: this.$router.preload.type,
        pages1: this.$router.preload.pages1,
        code: this.$router.preload.code,  // 随机数
        FaceType: this.$router.preload.pages1 === 'loan_all' ? 2 : 1,
        FaceType_c: 1,
        FaceMsg: this.state.FaceMsg
      })
    }

    if (this.$router.preload.FaceCompareType == 0) {           // 照片
      Taro.navigateTo({
        url: '../camera/index',
      })
    } else if (this.$router.preload.FaceCompareType == 1) {    // 视频
      Taro.navigateTo({
        url: `../videoFiveS/index`
      })
    }


  }


  componentWillMount() {
    
    api.faceMsg().then(res => {
      if (res.data.code === 200) {   // 有
        const { leadTitle, leadPrompt, leadBtn } =  res.data.data
        this.setState({
          title: leadTitle,
          leadPrompt,
          leadBtn,
          FaceMsg: res.data.data
        })
      } 
    })
  }
  

  render () {
    const { num, title, navType, leadPrompt, leadBtn } = this.state
    const titleHeight = get('titleHeight')
    return (
      <View className='identityVerify'>
        <Header onNum={num}  onTitle={title} onNavType={navType} />

        {/* {
          FaceMsg &&  */}
          <View style={{marginTop: titleHeight}}>
            <View className='img'>
              {
                leadBtn === '确认' ? 
                <Image mode='widthFix' src={`${imgUrl}pic_photo1.png`} /> : 
                <Image mode='widthFix' src={`${imgUrl}pic_photo.png`} />
              }
            </View>

            <View className='text'>
              {
                leadBtn === '确认' ? 
                <View>{ leadPrompt }</View> : 
                <Block>
                  <View>{ leadPrompt.split('-')[0] }</View>
                  <View>{ leadPrompt.split('-')[1] }</View>
                </Block>
                
              }

            </View>

            <View className='fot_btn'>
              <AtButton
                type='primary'
                onClick={this.goPage}
              >{ leadBtn }</AtButton>
            </View>

          </View>
        {/* } */}


      </View>
    )
  }
}
