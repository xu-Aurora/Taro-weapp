import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Picker } from '@tarojs/components'
import { AtInput, AtIcon, AtButton, AtCheckbox, AtToast } from 'taro-ui'
import md5 from 'js-md5';
import api from '../../api/api'
import { toast } from '../../global_data'
import { phoneReg, idCardReg } from '../../utils/util'
import './index.scss'

let valData1 = []

export default class Index extends PureComponent {

  constructor () {
    super(...arguments)
    this.state = {
      infoText: '',
      toastShow: false,
      userName: '',   //姓名
      idcard: '',     //身份证
      dateSel: '请选择日期',
      sex: '请选择性别',
      col1: '#808080',
      col2: '#808080',
      nationality: '',  //国籍
      phone: '',        //手机号码
      profession: '',    //职业
      address: '',       //居住地址
      password: '',       //密码
      passwords: '',       //确认密码
      code: '',           //验证码
      selector: ['男','女'],
      flag: false,    //用来判断在当前页面还是下一步页面
      codeBtn: '获取动态码',
      btn: false,
      protocol: [],
      btnDisabled: true,
      btnDisabled2: true,
      btnLoading1: false,
      btnLoading2: false,
    }
    this.checkboxOption = [{
        value: 'list1',
        label: '我已阅读并同意',
    }]
  }

  //点击下一步
  next () {
    this.setState({
      loading: false
    })
    if (!this.state.btnDisabled) {
      this.setState({
        btnDisabled: true,
        btnLoading1: true
      }, () => {
        if (!idCardReg.test(this.state.idcard)) {
          toast('身份证格式不正确','none',2000)
          return
        }
        if (!phoneReg.test(this.state.phone)) {
          toast('手机号码格式不正确','none',2000)
          return
        }
        this.setState({
          flag: true,
          btnDisabled: false,
          btnLoading1: false
        })
      })
    }


  }
  //点击上一步
  back = () => {
    this.setState({
      flag: false,
      toastShow: false
    })
  }
  //获取动态码
  getCode = () => {
    if(!this.state.btn){
      this.setState({
        btn: true
      })
      api.gainCode({
        Tel: this.state.phone,
        Type: 0
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

  register () {
    this.setState({
      loading: false
    })
    const { btnDisabled2, userName, idcard, password, phone, code, sex, date, nationality, profession, address, dateSel } = this.state
    if (!btnDisabled2) {
      this.setState({
        btnDisabled2: true,
        toastShow: false
      }, () => {
        api.register({
          F_RealName: userName,
          F_Account: idcard,
          F_Password: md5(password),
          F_Mobile: phone,
          VerificationCode: code,
          F_Gender: sex == '男' ? 1 : 2,
          F_cusCertExpDate: date,
          F_Question: nationality,
          F_AnswerQuestion: profession,
          F_OtherNo: address,
          F_cusCertExpDate: dateSel
        }).then(res => {
          if (res.data.code === 200) {
            toast('注册成功！','success',1500).then(() => {
              this.setState({
                btnDisabled2: false,
                btnLoading2: false
              })
            })
            setTimeout(() => {
              Taro.navigateTo({
                url: '../login/index'
              })
            }, 1500);
          }else{
            this.setState({
              btnDisabled2: false,
              toastShow: false,
              infoText: res.data.info
            })
            // toast(res.data.info,'none',3000)
          }
        })
      })
    }

  }

  handleChange (type,e) {

    this.setState({
      [type]: e
    },() => {
      if (this.state.flag === false) {  //第一页
        if (e.length > 0) {
          if (valData1.length > 0) {
            if (valData1.indexOf(type) == -1) {
              valData1.push(type)
            }
          }else{
            valData1.push(type)
          }
        }else{
          for (let index = 0,len = valData1.length; index < len; index++) {
            if (valData1[index] === type) {
              valData1.splice(index,1)
            }
          }
        }

        if (valData1.length === 6 && this.state.sex !== '' && this.state.dateSel !== '') {
          this.setState({
            btnDisabled: false
          })
        }else{
          this.setState({
            btnDisabled: true
          })
        }
      }else {
        if (this.state.password !== '' && this.state.passwords !== '' && this.state.code !== '' && this.state.protocol.length>0) {
          this.setState({
            btnDisabled2: false
          })
        }else{
          this.setState({
            btnDisabled2: true
          })
        }
      }
    })
  }

  //点击跳转到登录
  goLogin = () => {
    Taro.navigateTo({
      url: '../login/index'
    })
  }

  selChange (type,e) {
    if (type === 'date') {
      this.setState({
        dateSel: e.detail.value,
        col1: '#333',
      })
    }else {
      this.setState({
        sex: this.state.selector[e.detail.value],
        col2: '#333',
      })
    }
    if (valData1.length === 6 && this.state.sex !== '' && this.state.dateSel !== '') {
      this.setState({
        btnDisabled: false
      })
    }

  }
  //页面跳转
  goPage (type) {
    Taro.navigateTo({
      url: `../${type}/index`
    })
  }

  componentWillUnmount () {
    valData1 = []
  }
  componentDidHide () {
    valData1 = []
  }

  render () {
    const { toastShow, infoText, flag, sex, col2, profession, btnDisabled, address, password, passwords, phone, code, codeBtn, protocol, btnDisabled2, userName, idcard, nationality, col1, selector, dateSel } = this.state
    
    let infoTexts = `${infoText.slice(0, 18)} ${infoText.slice(18, 36)} `

    return (
      <View className='register'>
        {/* 头部 */}
        <View className='head'>
          <View>
            <Text>注册</Text>
            <View>
              <Text>已有账号, </Text>
              <Text onClick={this.goLogin}>去登录</Text>
            </View>
          </View>
          {
            flag ? <View>请设置密码</View> : <View>请填写个人信息</View>
          }

        </View>

        {
          flag ?
          <View className='next_page'>
            <View className='pwd'>
              <AtInput title='密码' type='password'
                className='bot_line'
                placeholder='6-12位字符，区分大小写'
                maxLength='12'
                value={password}
                onChange={this.handleChange.bind(this,'password')}
              />
              <AtInput title='确认密码' type='password' className='del_line'
                placeholder='请再次输入密码'
                maxLength='12'
                value={passwords}
                onChange={this.handleChange.bind(this,'passwords')}
              />
            </View>

            <View>
              <Text>手机号码</Text>
              <Text>{ phone }</Text>
            </View>
            <View>
              <AtInput title='验证码' type='number'
                className='del_line'
                maxLength='6'
                placeholder='请输入验证码'
                value={code}
                onChange={this.handleChange.bind(this,'code')}
              >
                <View className='codeBtn' onClick={this.getCode}>{ codeBtn }</View>
              </AtInput>
            </View>

            <View>
              <AtCheckbox
                options={this.checkboxOption}
                selectedList={protocol}
                onChange={this.handleChange.bind(this,'protocol')}
              />
              <Text onClick={this.goPage.bind(this,'protocol')}>《资产通平台服务条款及说明》</Text>
            </View>
            <View className='footer1'>
              <AtButton onClick={this.back} type='secondary' className='back'>上一步</AtButton>
              <AtButton disabled={btnDisabled2} type='primary' onClick={this.register.bind(this)}>注册</AtButton>
            </View>
          </View> :
          <View className='one_page'>
            <View className='reg_info'>
              <View>
                <AtInput title='真实姓名' type='text'
                  className='bot_line'
                  placeholder='请输入姓名'
                  value={userName}
                  onChange={this.handleChange.bind(this,'userName')}
                />
                <AtInput title='身份证号' type='idcard'
                  placeholder='请输入身份证号'
                  className='bot_line'
                  value={idcard}
                  onChange={this.handleChange.bind(this,'idcard')}
                />
                <View className='date_sel'>
                  <AtInput title='证件到期日' className='del_line' />
                  <View className='picker1'>
                    <Picker mode='date' start='2019-01-01' onChange={this.selChange.bind(this,'date')}>
                      <View style={{color: col1}}>{ dateSel }</View>
                    </Picker>
                    <AtIcon className='icon' value='chevron-right' color='#C7C7CC'></AtIcon>
                  </View>

                </View>
              </View>

              <View>
                <AtInput title='国籍' type='text'
                  className='bot_line'
                  placeholder='请输入国籍'
                  value={nationality}
                  onChange={this.handleChange.bind(this,'nationality')}
                />
                <View className='date_sel'>
                  <AtInput title='性别' className='del_line' />
                  <View className='picker1'>
                    <Picker mode='selector' range={selector} onChange={this.selChange.bind(this,'sex')}>
                      <View style={{color: col2}}>{ sex }</View>
                    </Picker>
                    <AtIcon className='icon' value='chevron-right' color='#C7C7CC'></AtIcon>
                  </View>
                </View>
              </View>

              <View>
                <AtInput title='手机号码' type='phone' className='del_line'
                  placeholder='请输入手机号码'
                  value={phone}
                  onChange={this.handleChange.bind(this,'phone')}
                />
              </View>

              <View>
                <AtInput title='职业' type='text'
                  className='bot_line'
                  placeholder='请输入职业'
                  value={profession}
                  onChange={this.handleChange.bind(this,'profession')}
                />
                <AtInput title='居住地址' type='text' className='del_line'
                  placeholder='请输入居住地址'
                  value={address}
                  onChange={this.handleChange.bind(this,'address')}
                />
              </View>
            </View>
            <View className='footer'>
              <AtButton 
                type='primary' 
                disabled={btnDisabled} 
                onClick={this.next.bind(this)}
              >下一步</AtButton>
            </View>
          </View>
        }

        <AtToast 
          isOpened={toastShow} 
          text={infoTexts}
          duration={3000}
          hasMask
        ></AtToast>


      </View>
    )
  }
}
