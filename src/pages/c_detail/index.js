import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { splitThousand } from '../../utils/util'
import Header from '../../components/header/header'
import { get } from '../../global_data'
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
      num: 1,
      navType: 'backHome',
      title: '仓储详情',
    }
  }


  way (way) {
    switch (way) {
      case 1:
        return '月结'
      case 2:
        return '季结'
      case 3:
        return '半年结'
      case 4:
        return '年结'
      default:
        return '暂无'
    }
  }

  getData() {
    api.buildingDetail({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      BuildingId: this.$router.params.param,
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data
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
        <Header onNum={num} onTitle={title} onNavType={navType} />

        {
          datas && 
          <View className='c_detail' 
            style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
          >
            <View>
              <View className='left'>
                <View className='left'>资产通凭证:</View>
                <View className='left'>待出售凭证:</View>
                <View className='left'>资产通权证:</View>
                <View className='left'>待出售权证:</View>
                {/* <View className='left'>车位类型:</View> */}
              </View>
              <View className='right'>
                <View>{ datas.SaleProof }个</View>
                <View>{ datas.ForSaleProof }个</View>
                <View>{ datas.ForSaleProof }个</View>
                <View>{ datas.ForSaleWarrant }个</View>
                {/* <View className='overflow'>{ datas.ParkingType }</View> */}
              </View>
            </View>
            <View>
              <View className='left'>
                <View className='left'>所在地址:</View>
                {/* <View className='left'>开发商:</View> */}
                <View className='left'>监管公司:</View>
                {/* <View className='left'>车位管理费:</View> */}
                {/* <View className='left'>管理费结算方式:</View> */}
              </View>
              <View className='right'>
                <View className='overflow'>{ datas.City } { datas.District } { datas.Address }</View>
                {/* <View className='overflow'>{ datas.CompanyName ? datas.CompanyName : '暂无' }</View> */}
                <View className='overflow'>{ datas.Property ? datas.Property : '暂无' }</View>
                {/* <View>{ splitThousand(datas.ParkingManageFee) } 元/月</View> */}
                {/* <View>{ this.way(datas.SettlementType) }</View> */}
              </View>
            </View>
            <View>
              楼盘描述: { datas.Instruction ? datas.Instruction : '暂无描述' }
            </View>
          </View>
        }

      </View>

    )
  }
}
