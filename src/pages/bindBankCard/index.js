import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import api from '../../api/api'
import { throttle } from '../../utils/util'
import { toast } from '../../global_data'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '绑定银行卡'
  }

  constructor () {
    super(...arguments)
    this.state = {
      CardNo: '',
      openingBankName: ''
    }

    this.joinCircle = throttle(this.joinCircle1)
  }

  joinCircle1 = () => {

    api.insertCircle({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CircleId: this.$router.preload.CircleId,
        CardNo: this.state.CardNo,
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',2000).then(() => {
          setTimeout(() => {
            Taro.switchTab({
              url: '../busArea/index'
            })
          }, 1500)
        })
      }
    })


  }



  componentWillMount () { 
    this.setState({
      CardNo: this.$router.preload.datas.accountNo,
      openingBankName: this.$router.preload.datas.openingBankName
    })
  }


  render () {
    const { CardNo, openingBankName } = this.state
    return (
      <View className='bank_card_add'>

        <View>加入商圈必须绑定浙商银行卡，请点击绑定</View>

        <View>
          <View className='one'>
            <View>银行卡</View>
            <View>{ CardNo }</View>
          </View>
          <View className='two'>
            <View>开户行</View>
            <View>{ openingBankName }</View>
          </View>
        </View>

        
        <View>  
          <AtButton 
            onClick={this.joinCircle} 
            type='primary'
          >绑定</AtButton>
        </View>

      </View>
    )
  }
}
