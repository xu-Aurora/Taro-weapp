import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtActionSheet, AtActionSheetItem } from "taro-ui"
import { imgUrl, throttle } from '../../utils/util'
import { toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '银行卡设置'
  }

  constructor () {
    super(...arguments)
    this.state = {
      isOpened: false,
      CardNo: '',
      cardList: [],
    }

    this.cardUntie = throttle(this.cardUntie1)
  }

  //更多
  more (CardNo) {
    this.setState({
      isOpened: true,
      CardNo
    })
  }

  //页面跳转
  goPage (type) {
    if (type === 'bank_card_add') {
      this.$preload({
        page: 'bank_card'
      })
    }
    Taro.navigateTo({ 
      url: `../${type}/index` 
    })
  }

  //银行卡
  cardNo (CardNo) {
    let text
    if (CardNo.length <= 4) {
      text = `****\xa0****\xa0****\xa0000${CardNo.slice(-1)}`
    }else{
      text = `****\xa0****\xa0****\xa0${CardNo.slice(-4)}`
    }
    text = text.split('').join(' ')
    return text
  }
  //解绑
  cardUntie1 = () => {

    api.untyingCard({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CardNo: this.state.CardNo,
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',2000).then(() => {
          api.userInfo({
            LoginMark: Taro.getStorageSync('uuid'),
            Token: JSON.parse(Taro.getStorageSync('userInfo')).token
          }).then(res1 => {
            if (res1.data.code === 200) {
              Taro.setStorageSync('userInfoData',JSON.stringify(res1.data.data))
              this.setState({
                cardList: res1.data.data.CardList,
                isOpened: false
              })
            }
          })
        })
      } else {
        toast(res.data.info,'none',3000)
      }
    })

  }
  
  componentWillMount () {
    this.setState({
      cardList: Taro.getStorageSync('userInfoData')&&JSON.parse(Taro.getStorageSync('userInfoData')).CardList
    })
  }

  render () {
    const { cardList, isOpened } = this.state
    const default_card = `${imgUrl}card_logo.png`
    const bgImg = {
      background: `url(${imgUrl}bank_card.png)`,
      backgroundSize: '100% 100%'
    }

    return (
      <View className='bank_card_set'>
        <View className='title'>
          <View>
            <Text>我的银行卡</Text>
            <Text><Text>{ cardList&&cardList.length }张</Text></Text>
          </View>
          <View onClick={this.goPage.bind(this,'bank_card_add')}>绑定新银行卡</View>
        </View>
        {
          <View className='card_list'>
            {
              cardList.length > 0 ? cardList.map(ele => {
                return (
                  <View key={ele.CardNo} style={bgImg}>
                    <View>
                      <View>
                        <View className='box_img'><Image mode='widthFix' src={ele.BankLogo ? ele.BankLogo : default_card} /></View>
                        <Text>{ ele.OpeningbankAddress }</Text>
                      </View>
                      <View onClick={this.more.bind(this,ele.CardNo)}>
                        <Image mode='widthFix' src={`${imgUrl}more.png`} />
                      </View>
                    </View>
                    <View>{ this.cardNo(ele.CardNo) }</View>
                  </View>
                )
              }) : 
              <View className='nodata'>
                <View>
                  <Image src={`${imgUrl}no_card.png`} />
                  <View>暂未绑定银行卡</View>
                </View>
              </View>
            }
          </View>
        }


        <AtActionSheet 
          isOpened={isOpened} 
          cancelText='取消' 
          onClose={() => this.setState({isOpened: false})}
          title='解除绑定银行卡后，您需要重新绑定银行卡，否则无法操作。'
        >
          <AtActionSheetItem>
            <View 
              style={{color: '#E64340'}} 
              onClick={this.cardUntie}
            >解除绑定</View>
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    )
  }
}
