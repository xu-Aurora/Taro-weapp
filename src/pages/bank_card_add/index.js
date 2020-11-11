import Taro, { PureComponent } from '@tarojs/taro'
import { View, ScrollView, Image  } from '@tarojs/components'
import { AtInput, AtButton, AtActionSheet, AtActionSheetItem } from 'taro-ui'
import { throttle , imgUrl } from '../../utils/util'
import { toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '绑定新银行卡'
  }

  constructor () {
    super(...arguments)
    this.state = {
      idcard: '',
      bankName: '',
      bankList: [],
      isOpened: false,
      bankCode: '',  //选中的银行
    }

    this.confirm = throttle(this.confirm1)
    this.sure = throttle(this.sure1)
  }

  handleChange1(e) {
    this.setState({
      idcard: e,
      isOpened: false
    })
    return e
  }

  handleChange2(e) {
    this.setState({
      bankName: e,
      isOpened: false
    })
    return e
  }

  //查询银行列表
  sure1 = () => {
    api.bankList({
      Keyword: this.state.bankName
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          bankList: res.data.data,
        },() => {
          this.setState({
            isOpened: true
          })
        })
      }
    })
  }

  //绑定
  confirm1 = () => {

    api.bindCard({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CardNo: this.state.idcard,
        OpeningbankNo: this.state.bankCode,
        OpeningbankName: this.state.bankName,
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',1500).then(() => {
          api.userInfo({
            LoginMark: Taro.getStorageSync('uuid'),
            Token: JSON.parse(Taro.getStorageSync('userInfo')).token
          }).then(res1 => {
            if (res1.data.code === 200) {
              let datas = res1.data.data
              Taro.setStorageSync('userInfoData',JSON.stringify(datas))
              if (this.$router.preload.page === 'first_login') {
                setTimeout(() => {
                  if (datas.IsSetPayPwd == 1 && datas.CardList.length > 0) {
                    this.$preload({
                      firstLogin: true
                    })
                    Taro.switchTab({
                      url: '../home/index'
                    })
                  }else{
                    Taro.redirectTo({
                      url: '../first_login/index'
                    })
                  }
                }, 1000);
              }else{
                Taro.switchTab({
                  url: '../perCenter/index'
                })
              }
            }
          })
        })
      }
    })
  }
    

  
  //选择银行
  selBank (val,code) {
    this.setState({
      isOpened: false,
      bankCode: code,
      bankName: val
    }) 
  }


  render () {
    const { idcard, bankName, bankList, isOpened } = this.state
    return (
      <View className='bank_card_add'>

        <View>请绑定持卡人为本人的银行卡</View>

        <View>
          <AtInput title='银行卡号' name='idcard'
            className='bot_line'
            type='number'
            placeholder='请输入银行卡号'
            value={idcard}
            onChange={this.handleChange1.bind(this)}
          />
          <AtInput
            title='开户行' name='bankName'
            placeholder='请输入开户行'
            value={bankName}
            onChange={this.handleChange2.bind(this)}
          >
            <View style={{color: '#5584FF'}} onClick={this.sure}>搜索</View>
          </AtInput>
        </View>

        <View>  
          <AtButton 
            onClick={this.confirm} 
            type='primary'
          >绑定</AtButton>
        </View>

        <AtActionSheet isOpened={isOpened}>
          {
            JSON.stringify(bankList) == '[]' ? (
              <View className='nodata'>
                <View>
                  <Image src={`${imgUrl}bank_default.png`} />
                  <View>未搜索到开户行</View>
                </View>
              </View>
            ):(
              <ScrollView
                scrollY
                scrollWithAnimation
                scrollTop={0}
                style={{height: '600rpx'}}
                lowerThreshold={50}
              >
                {
                  bankList && bankList.map(ele => {
                    return (
                      <AtActionSheetItem key={ele.code} onClick={this.selBank.bind(this,ele.value,ele.code)}>
                        { ele.value }
                      </AtActionSheetItem>
                    )
                  })
                }

              </ScrollView>
            )
          }

        </AtActionSheet>
      </View>
    )
  }
}
