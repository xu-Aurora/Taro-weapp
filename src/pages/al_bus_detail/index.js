import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtButton, AtModal } from 'taro-ui'
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
      datas: '',
      accountDatas: {},
      isOpened: false,
      title: '商圈详情',
      num: 1,
      navType: 'backHome',
    }

    this.showModal = throttle(this.showModal1)
  }

  handleConfirm = () => {

    api.quitCircle({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      data: JSON.stringify({
        CircleId: this.$router.preload.datas.CircleId
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',2000)
        setTimeout(() => {
          Taro.switchTab({
            url: '../busArea/index'
          })
        }, 1500);
      } else {
        toast(res.data.info,'none',3000)

      }
    })

  }

  showModal1 = () => {
    this.setState({
      isOpened: true
    })
  }


  getData() {

    api.circleDetail({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo') ? JSON.parse(Taro.getStorageSync('userInfo')).token : '',
      data: JSON.stringify({
        CircleId: this.$router.preload.datas.CircleId
      })
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data,
          accountDatas: this.$router.preload.datas
        })
      }
    })

  }

  componentWillMount () {
    this.getData()
  }


  render () {
    const { accountDatas, datas, num, title, isOpened, navType } = this.state
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
                <View>{ accountDatas.CircleName }</View>
              </View>
              <View>
                <View>商圈账号 :</View>
                <View>{ accountDatas.CircleAccountNo }</View>
              </View>
              <View>
                <View>绑定银行卡 :</View>
                <View className='bank'>
                  <Text>{ accountDatas.accNo }</Text>
                </View>
              </View>
              <View>
                <View>开户行 :</View>
                <View className='ellipsis'>{ accountDatas.AccBankName }</View>
              </View>
            </View>

            <View className='lists'>
              <View>
                <View>商圈成员数 :</View>
                <View>{ datas.UserCount }个</View>
              </View>
              <View>
                <View>资产通资产总数 :</View>
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
              {/* <View>
                <View>商圈创建人 :</View>
                <View>{ datas.CreateUser }</View>
              </View>
              <View>
                <View>联系电话 :</View>
                <View>{ datas.Tel }</View>
              </View> */}
            </View>

            <View className='fotter_btn'>
              {/* <AtButton type='primary'>邀请会员加入</AtButton> */}
              <AtButton 
                onClick={this.showModal} 
                className='exit_btn btn_red' 
                type='primary'
              >退出商圈</AtButton>
            </View>

            <AtModal
              isOpened={isOpened}
              title='退出商圈'
              cancelText='取消'
              confirmText='确定'
              onCancel={() => this.setState({isOpened: false})}
              onClose={() => this.setState({isOpened: false})}
              onConfirm={throttle(this.handleConfirm)}
              content='退出商圈后，您将无法查看、购买商圈内的资产通资产及其车位信息'
            />
          </View>
        }

      </View>

    )
  }
}
