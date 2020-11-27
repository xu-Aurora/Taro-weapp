import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtInput } from 'taro-ui'
import './index.scss'

export default class Index extends PureComponent {

  // config = {
  //   navigationBarTitleText: '资产详情'
  // }

  constructor () {
    super(...arguments)
    this.state = {
      dealPwd: '',  //交易密码
    }
  }


  handleChange (e) {
    this.setState({
      dealPwd: e
    })
  }

  componentWillMount () { }

  render () {
    return (
      <View className='bank_card_untie'>
        <View>解除绑定银行卡</View>
        <View>
          <AtInput
            type='password'
            name='password'
            placeholder='请输入交易密码，验证身份'
            value={this.state.dealPwd}
            onChange={this.handleChange.bind(this)}
          />
        </View>
      </View>
    )
  }
}
