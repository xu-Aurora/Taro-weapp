import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton, AtModal } from 'taro-ui'
import Header from '@/components/header/header'
import CarInfo from '@/components/car_detail/index'
import api from '@/api/api'
import { set, get, toast } from '@/global_data'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      navType: 'backHome',
      page: '', //用来判断是从哪个页面跳转进来的
      title: '详情',
      datas: {
        BuyBackModel: {
          Usufruct: ''
        },
        ParkingCode: '4584',
        ParkingId: 'fdsf',
        EffectiveTime: '23324'
      },
      isOpened: false,  //控制模态框的展示
      num: 1,
      id: '',
      disabled: false,
      disabled1: false,
    }
  }


  // 摘牌
  handleConfirm = () => {

    api.cancelAttorn({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        ParkingId: this.$router.preload.id ? this.$router.preload.id : this.state.id,
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info, 'success', 1500)
        setTimeout(() => {
          this.getData()
        }, 1500);
      }
    })
    
  }

  // 页面跳转
  goPage (type,way) {
    //用来判断是点击的支付还是转让,把状态存到全局变量中
    set('type',way)

    this.$preload({
      id: this.state.datas.ParkingId,
      CircleId: this.state.datas.CircleId,
      ParkingId: this.state.datas.ParkingId,
      Price: this.state.datas.SalePrice,
      BuildingName: this.state.datas.CompanyName
    })
    Taro.navigateTo({
      url: `../${type}/index`
    })
  }

  // 申请回购
  backBuy (datas, e) {
    e.stopPropagation()

    if (!this.state.disabled) {
      this.setState({
        disabled: true
      }, () => {
        // 获取视频验证随机数
        api.videoRandom({
          LoginMark: Taro.getStorageSync('uuid'),
          Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
          FaceType: 3,
          OrderCode: datas.ParkingId,
        }).then(res => {
          if (res.data.code === 200) {
            const data = res.data.data
            this.$preload({
              datas,
              payType: 'buy_back',
              code: data.Code,  // 随机数
              FaceCompareType: data.FaceCompareType
            })

            Taro.navigateTo({
              url: `../identityVerify/index`
            }).then(() => {
              this.setState({
                disabled: false
              })
            })
          }
        })
      })
    }

  }

  // 取消回购
  cancel (ParkingId, e) {
    e.stopPropagation()

    if (!this.state.disabled1) {
      this.setState({
        disabled1: true
      }, () => {
        api.cancelBackBuy({
          LoginMark: Taro.getStorageSync('uuid'),
          Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
          ParkingId
        }).then(res => {
          if (res.data.code === 200) {
            this.getData()
          }
          this.setState({
            disabled1: false
          })
        })
      })
    }

  }
  
  getDatas() {
    api.myParkingDetail({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        ParkingId: this.$router.preload.id
      })
    }).then(res => {
      if (res.data.code === 200) {
        const datas = res.data.data
        this.setState({
          datas,
          page: this.$router.preload.page,
          id: this.$router.preload.id,
          PDF: datas.BuyBackModel.Usufruct == 0 ? datas.ProofSaleUrl : datas.WarrantSaleUrl
        })

      }
    })
  }

  getData () {

    this.getDatas()

  }

  verifyPaking () {
    let sysinfo = Taro.getSystemInfoSync()
    let isiOS = sysinfo.system.indexOf('iOS') > -1
    let isHUAWEI = sysinfo.brand.toUpperCase().indexOf('HUAWEI') > -1
    let isXIAOMI = sysinfo.brand.toLowerCase().indexOf('xiaomi') > -1
    const { PDF } = this.state

    if (isiOS) {    //ios
      this.$preload({ url: PDF })
      Taro.navigateTo({
        url: '../pdf/index'
      })
    }else if (isHUAWEI || isXIAOMI) {
      Taro.setClipboardData({
        data: PDF,
        success: function () {
          Taro.showModal({
            title: '提示',
            content: '复制成功,请使用浏览器下载浏览',
            showCancel: false
          })
        }
      })
    } else {        //Android
      Taro.downloadFile({
        url: PDF,
        success: function(res1) {
          let Path = res1.tempFilePath
          Taro.openDocument({
            filePath: Path,
            fileType:'pdf',
            success: function() {
              console.log('打开文档成功')
            }
          })
        }
      })
    }

  }

  parkCode (data) {
    let code = null
    if (data!==undefined&&JSON.stringify(data)!=='{}') {
      if (data.BuyBackModel.Usufruct == 0) {
        // code = `车位通凭证编号 ${data.ParkingId.toUpperCase().slice(0,2)}*****${data.ParkingId.toUpperCase().slice(-2)}`
        code = `车位通凭证`
      } else {
        // code = `车位通权证编号 ${data.ParkingId.toUpperCase().slice(0,2)}**${data.ParkingId.toUpperCase().slice(-2)}`  
        code = `车位通权证`  
      }
    }
    return code
  }


  componentWillMount () {

    this.getData()

  }

  render () {
    const { page, datas, id, navType, num, title, disabled, disabled1 } = this.state
    const titleHeight = get('titleHeight')

    return (
      <View className='containers'>
        <View>
          <Header onNum={num} onTitle={title} onNavType={navType} />

          <View className='aw_car_detail' style={{marginTop: titleHeight}}>
            <CarInfo 
              onDatas={datas} 
              onPage={page}
              onId={id}
            />
          </View>
        </View>

        {
          (datas.BuyBackModel.Usufruct == 0) && datas.Ifbuyback && datas.IfBtn && datas.State != 6 && (
            <View className='footer1'>
                <View  onClick={this.backBuy.bind(this, datas)}>
                  <AtButton 
                    type='primary' 
                    size='small'
                    loading={disabled}
                  >申请回购</AtButton>
                </View>
            </View>
          )
        }
        {
          datas.State == 6 &&
          <View className='footer1'>
            <View onClick={this.cancel.bind(this, datas.ParkingId)}>
              <AtButton loading={disabled1} type='primary' size='small'>取消回购</AtButton>
            </View>
          </View>
        }

        <AtModal
          isOpened={this.state.isOpened}
          title='摘牌'
          cancelText='取消'
          confirmText='确认'
          onCancel={() => this.setState({isOpened: false})}
          onClose={() => this.setState({isOpened: false})}
          onConfirm={this.handleConfirm}
          content='确定执行此操作?'
        />
      </View>

    )
  }
}
