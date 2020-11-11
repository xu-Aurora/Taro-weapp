import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import api from '../../api/api'
import { get, toast } from '../../global_data'
import { throttle } from '../../utils/util'
import Header from '../../components/header/header'
import '../al_bus_detail/index.scss'

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      datas: '',
      num: 1,
      navType: 'backHome',
      title: '商圈详情',
      CardList: [],   //用户所有的银行卡
    }

    this.join = throttle(this.join1)
  }


  options = () => {
    let options = []
    this.state.CardList.forEach(ele => {
      options.push({
        label: `${ele.OpeningbankAddress} ${ele.CardNo}`,
        value: ele.CardNo
      })
    })
    return options
  }

  bindBank() {
    // 获取账户信息
    api.accountAmt({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CircleId: this.$router.preload.CircleId
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.$preload({
          datas: res.data.data,
          CircleId: this.$router.preload.CircleId,
          page: 'aw_bus_detail'
        })
        Taro.navigateTo({
          url: '../bank_bind_update/index'
        })
      }
    })
  }

  //加入商圈
  join1 = () => {

    // 用户是否绑定浙商银行卡
    api.ifZSaccount({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
    }).then(res => {
      if (res.data.code === 200) {              // 有绑定浙商银行卡
        this.$preload({ 
          datas: res.data.data,
          CircleId: this.$router.preload.CircleId
        })
        Taro.navigateTo({ 
          url: '../bindBankCard/index'
        })
      } else if (res.data.code === 305) {       // 未开户，仍可以使用其他卡
        this.bindBank()
      } else if (res.data.code === 400) {        // 未绑定需要绑定浙商银行卡
        Taro.navigateTo({
          url: '../openAccount/index'
        })
      } else {
        toast(res.data.info, 'none', 2000)
      }
    })

  }

  getData() {

    api.circleDetail({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      data: JSON.stringify({
        CircleId: this.$router.preload.CircleId
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data,
          CardList: Taro.getStorageSync('userInfoData') ? JSON.parse(Taro.getStorageSync('userInfoData')).CardList : ''
        })
      }
    })

  }

  componentWillMount () { 

    this.getData()

  }


  render () {
    const { datas, num, title, navType } = this.state
    const titleHeight = get('titleHeight')

    return (
      <View className='boxs'>
        <Header onNum={num}  onTitle={title} onNavType={navType} />

        {
          datas && 
          <View className='al_bus_detail' style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}>
            <View className='lists'>
              <View>
                <View>商圈名称 :</View>
                <View>{ datas.CircleName }</View>
              </View>
              <View>
                <View>商圈成员数 :</View>
                <View>{ datas.UserCount }个</View>
              </View>
              <View>
                <View>车位资产总数 :</View>
                <View>{ datas.TotalCount }个</View>
              </View>
              <View>
                <View>在售车位数 :</View>
                <View>{ datas.ForSaleCount }个</View>
              </View>
            </View>

            <View className='lists'>
              <View>
                <View>商圈编号 :</View>
                <View>{ datas.CircleCode }</View>
              </View>
              <View>
                <View>所属公司 :</View>
                <View>{ datas.CompanyName }</View>
              </View>
              <View>
                <View>商圈创建人 :</View>
                <View>{ datas.CreateUser }</View>
              </View>
              <View>
                <View>联系电话 :</View>
                <View>{ datas.Tel }</View>
              </View>
            </View>

            <View className='fotter_btn'>
              <AtButton 
                type='primary' 
                onClick={this.join}
              >加入商圈</AtButton>
            </View>

          </View>
        }


      </View>

    )
  }
}
