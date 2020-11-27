import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtInput, AtButton, AtList, AtListItem } from 'taro-ui'
import md5 from 'js-md5'
import { imgUrl, splitThousand } from '../../utils/util'
import { toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationBarTitleText: '申请回购'
  }

  constructor () {
    super(...arguments)
    this.state = {
      code: '',     //验证码
      password: '',  //交易密码
      codeBtn: '获取动态码',
      btn: false,
      btnLoading: false,
      disabled: true,   //判断用户是否输入框全部输入,控制按钮点击
      Price: ''
    }
  }

  //获取动态码
  getCode = () => {
    if(!this.state.btn){
      this.setState({
        btn: true
      })
      api.gainCode({
        Tel: Taro.getStorageSync('userInfoData')?JSON.parse(Taro.getStorageSync('userInfoData')).Mobile:'',
        Type: 7
      }).then(res => {
        if (res.data.code === 200) {
          toast('发送成功','success',1000)
        }
      })
      let s = 60;
      let time = setInterval(() => {
        s--;
        this.setState({
          codeBtn: s + 's后重试'
        })
        if(s===0){
          clearTimeout(time);
          this.setState({
            codeBtn: '获取动态码',
            btn: false
          })
        }
      }, 1000);
    }
  }

  //申请回购
  backBuy () {
    this.setState({
      disabled: true,
      btnLoading: true
    },() => {
      api.backBuy({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
        data: JSON.stringify({
          VerificationCode: this.state.code,
          PayPassword: md5(this.state.password),
          ParkingId: this.$router.preload.datas.ParkingId,
          // Warrant: this.$router.preload.Warrant,
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',1500)

          this.$preload({
            inPage: 'buy_back',
            msg: this.state.msg
          })
          Taro.navigateTo({
            url: '../pay_success/index'
          }).then(() => {
            this.setState({
              disabled: false,
              btnLoading: false
            })
          })
        }
        
      })
    })

  }

  handleChange (type, e) {
    this.setState({
      [type]: e
    },() => {
      if ((this.state.code !== '') && (this.state.password !== '')) {
        this.setState({
          disabled: false
        })
      }else{
        this.setState({
          disabled: true
        })
      }
    })
  }

  componentWillMount () { 
    api.repurchaseMsg({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      ParkingId: this.$router.preload.datas.ParkingId
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          // BuildingName: this.$router.preload.BuildingName,
          Price: this.$router.preload.datas.Price,
          msg: res.data.data.RepurchaseDate
        })
      } 
    })

  }


  render () {
    const { code, codeBtn, Price, password, disabled, btnLoading } = this.state
    let phone = Taro.getStorageSync('userInfoData')&&JSON.parse(Taro.getStorageSync('userInfoData')).Mobile
    return (
      <View className='buy_back'>
        <View>回购信息</View>
        <View>
          <AtList>
            {/* <AtListItem className='bot_line item1' title='回购企业' extraText={BuildingName} /> */}
            <AtListItem title='面额 (元)' extraText={String(splitThousand(Price))} />
          </AtList>
        </View>


        <View className='number'>
          <Text>手机号码</Text>
          <Text>{ `${phone.slice(0,3)} **** ${phone.slice(-4)}` }</Text>
        </View>


        <View className='inp'>
          <AtInput clear title='验证码' type='number'
            className='bot_line'
            maxLength='6'
            placeholder='请输入验证码'
            value={code}
            onChange={this.handleChange.bind(this,'code')}
          >
            <View className='codeBtn' onClick={this.getCode}>{ codeBtn }</View>
          </AtInput>
          <AtInput title='交易密码'
            type='password'
            placeholder='请输入交易密码'
            value={password}
            onChange={this.handleChange.bind(this,'password')}
          />
        </View>
        <View className='footer'>
          <AtButton 
            onClick={this.backBuy.bind(this)}
            disabled={disabled} 
            type='primary'
          >申请回购</AtButton>
        </View>

        <View className='tips'>
          <View>
            <View>
              <Image mode='widthFix' src={`${imgUrl}remind.png`} />
            </View>
            <View>温馨提示</View>
          </View>
          <View>
            若您申请本次回购，则按实际持有期限靠档确定收益率，并按该收益率的90%计算实际收益，需扣除已预付的收益。
          </View>
          <View>
            若该资产通凭证已向银行质押融资，应付本金及收益优先偿还您未清偿的银行贷款，剩余应付本金及收益（若有）支付至您的指定账户。
          </View>

        </View>

      </View>
    )
  }
}
