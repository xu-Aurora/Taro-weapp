import Taro, { PureComponent } from '@tarojs/taro'
import { View, Picker } from '@tarojs/components'
import { AtInput, AtFloatLayout, AtList, AtListItem, AtButton } from 'taro-ui'
import Header from '../../components/header/header'
import { throttle } from '../../utils/util'
import { get, toast } from '../../global_data'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      title: '更多',
      navType: 'backHome',
      Gender: '请选择性别',
      selector: ['男','女'],
      cusCertExpDate: '2022-09-09',
      Question: '北京',  //国籍
      AnswerQuestion: '程序员',    //职业
      OtherNo: '杭州',       //居住地址
      isOpened: false,
      value: '',
      type: '',    //用来存点击是哪个数据
      num: 1,
      backFiles: [],
      frontFiles: [],
      frontImg: [],
      backImg: []
    }

    this.confirm = throttle(this.confirm1)
  }

  //选择日期和性别
  selChange (type, e) {
    if (type === 'date') {
      this.update({
        cusCertExpDate: e.detail.value
      })
    }else {
      this.update({
        Gender: this.state.selector[e.detail.value] == '男' ? 1 : 2
      })
    }
  }

  itemClick (type) {
    this.setState({
      isOpened: true,
      value: this.state[type],
      type
    })
  }
  //input框双向绑定
  handleChange (e) {
    this.setState({
      value: e
    })
  }

  regx() {
    const { type, value } = this.state

    if (type === 'Question') {
      if (value === '') {
        toast('请输入国籍！', 'none', 2000)
        return false
      } 
    } else if (type === 'AnswerQuestion') {
      if (value === '') {
        toast('请输入职业！', 'none', 2000)
        return false
      } 
    } else if (type === 'OtherNo') {
      if (value === '') {
        toast('请输入居住地址！', 'none', 2000)
        return false
      } 
    }

    return true
  }

  confirm1 = () => {

    if (this.regx()) {
      this.update({
        [this.state.type]: this.state.value
      })
      setTimeout(() => {
        this.setState({
          isOpened: false
        })
      }, 1500);
    }

  }

  //修改用户信息
  update (params) {
    api.updateUser({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify(params)
    }).then(res => {
      if (res.data.code === 200) {
        toast(res.data.info,'success',1500).then(() => {
          api.userInfo({
            LoginMark: Taro.getStorageSync('uuid'),
            Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
            existLoading: true
          }).then(r => {
            if (r.data.code === 200) {
              const datas = r.data.data
              Taro.setStorageSync('userInfoData',JSON.stringify(datas))

              this.setState({
                cusCertExpDate: datas.cusCertExpDate.split(' ')[0],
                Question: datas.Question,
                AnswerQuestion: datas.AnswerQuestion,
                OtherNo: datas.OtherNo,
                Gender: datas.Gender == 1 ? '男' : '女'
              })
            }
          })
        })
      }
    })
  }



  componentWillMount () {
    const userInfoData = Taro.getStorageSync('userInfoData') ? JSON.parse(Taro.getStorageSync('userInfoData')) : ''
    
    this.setState({
      cusCertExpDate: userInfoData.cusCertExpDate.split(' ')[0],
      Question: userInfoData.Question,
      AnswerQuestion: userInfoData.AnswerQuestion,
      OtherNo: userInfoData.OtherNo,
      Gender: userInfoData.Gender == 1 ? '男' : '女',
    })
  }


  render () {
    const titleHeight = get('titleHeight')
    const { num, navType, value, title, Question, AnswerQuestion, OtherNo, cusCertExpDate, Gender, selector, isOpened } = this.state
    return (
      <View className='boxs'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View className='more' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <AtList>
            <AtListItem 
              className='bot_line' 
              title='证件到期日' 
              extraText={cusCertExpDate}  arrow='right'
            />
            
            <AtListItem title='国籍' 
              className='bot_line'
              onClick={this.itemClick.bind(this,'Question')} 
              extraText={Question} arrow='right'
            />
            <AtListItem className='bot_line' title='性别' extraText={Gender} arrow='right' />
            <AtListItem title='职业' 
              className='bot_line'
              onClick={this.itemClick.bind(this,'AnswerQuestion')} 
              extraText={AnswerQuestion} arrow='right'
            />
            <AtListItem title='居住地' 
              onClick={this.itemClick.bind(this,'OtherNo')} 
              extraText={OtherNo} arrow='right'
            />
          </AtList>
          <Picker mode='date' className='picker1' onChange={this.selChange.bind(this,'date')}>
            <View className='pickVal'>0</View>
          </Picker>
          <Picker mode='selector' className='picker2' range={selector} onChange={this.selChange.bind(this,'Gender')}>
            <View className='pickVal'>1</View>
          </Picker>

          <AtFloatLayout isOpened={isOpened} >
            <AtInput
              type='text'
              value={value}
              onChange={this.handleChange.bind(this)}
            />
            <View className='btn'>
              <AtButton 
                className='cancel' 
                onClick={() => this.setState({isOpened:false})}
              >取消</AtButton>
              <AtButton 
                type='primary' 
                onClick={this.confirm}
              >确定</AtButton>
            </View>
          </AtFloatLayout>
        
        </View>
      </View>
    )
  }
}
