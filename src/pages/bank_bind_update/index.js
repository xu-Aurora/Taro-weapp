import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtList, AtListItem, AtButton, AtActionSheet, AtRadio } from "taro-ui"
import { get, toast } from '../../global_data'
import { throttle } from '../../utils/util'
import Header from '../../components/header/header'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      isOpened: false,
      num: 1,
      navType: 'backHome',
      title: '银行卡绑定修改',
      radio: '',  //选中的银行卡
      accNo: '',  //商圈绑定的银行卡
      CardList: [],   //用户所有的银行卡
    }

    this.handleConfirm = throttle(this.handleConfirm1)
  }
  //选择银行卡
  handleChange (radio) {
    this.setState({
      radio
    })
  }

  joinCircle() {

    api.insertCircle({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CircleId: this.$router.preload.CircleId,
        CardNo: this.state.accNo
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info, 'success', 2000).then(() => {
          setTimeout(() => {
            Taro.switchTab({
              url: '../busArea/index'
            })
          }, 1500)
        })
      } else {
        toast(res.data.info,'none', 3000)
      }
    })
  }


  //修改银行卡
  handleConfirm1 = () => {
    const { title, accNo } = this.state
    if (title === '银行卡绑定') {
      this.joinCircle()   // 加入商圈
    } else {
      api.updateBankCard({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
        data: JSON.stringify({
          CircleId: this.$router.preload.datas.CircleId,
          CardNo: accNo
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info, 'success', 1500)
          setTimeout(() => {
            Taro.switchTab({
              url: '../busArea/index'
            })
          }, 1500)
        } else {
          toast(res.data.info, 'none', 3000)
        }
      })
    }
  }

  options1 = () => {
    let options = []
    this.state.CardList.forEach(ele => {
      options.push({
        label: `${ele.OpeningbankAddress} ${ele.CardNo}`,
        value: ele.CardNo
      })
    })
    return options
  }

  componentWillMount () {
    this.setState({
      accNo: this.$router.preload.datas.accNo,
      CardList: Taro.getStorageSync('userInfoData') ? JSON.parse(Taro.getStorageSync('userInfoData')).CardList : '',
      title: this.$router.preload.page === 'aw_bus_detail' ? '银行卡绑定' : '银行卡绑定修改'
    })
  }

  render () {
    const { accNo, radio, num, title, isOpened, navType } = this.state
    const titleHeight = get('titleHeight')
    return (
      <View className='boxs'>
        <Header onNum={num}  onTitle={title} onNavType={navType} />
        <View className='bank_bind_update' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View>
            请选择银行卡绑定
          </View>
          <View>
            <AtList>
              <AtListItem 
                onClick={() => this.setState({isOpened: true})} 
                title='银行卡' extraText={accNo} arrow='right' 
              />
            </AtList>
          </View>
          <View>
            <AtButton 
              type='primary' 
              onClick={this.handleConfirm}
            >确定</AtButton>
          </View>

          <AtActionSheet 
            onCancel={() => this.setState({accNo: radio, isOpened: false})} 
            onClose={() => this.setState({isOpened: false})} 
            isOpened={isOpened} cancelText='确定'
          >
            <AtRadio
              options={this.options1()}
              value={radio}
              onClick={this.handleChange.bind(this)}
            />
          </AtActionSheet>

        </View>
      </View>

    )
  }
}
