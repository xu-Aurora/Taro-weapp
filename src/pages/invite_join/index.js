import Taro, { PureComponent } from '@tarojs/taro'
import { AtSearchBar, AtAvatar, AtModal } from 'taro-ui'
import { View, Image, Text } from '@tarojs/components'
import { get, toast } from '../../global_data'
import Header from '../../components/header/header'
import { imgUrl } from '../../utils/util'
import api from '../../api/api'
import './index.scss'


export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      KeyWord: '',
      num: 1,
      navType: 'backHome',
      userData: [],
      CircleId: '',
      isOpened: false,
      page: '',
      title: '',
    }

  }

  getData () {
    api.searchUser({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      KeyWord: this.state.KeyWord,
      CircleIds: this.$router.preload.datas.CircleId
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          userData: res.data.data,
        })
      }
    })
  }

  //搜索
  confirm () {
    this.getData()
  }

  //加入商圈
  joinCircle (UserId,e) {
    e.stopPropagation();
    api.inviteUsers({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      data: JSON.stringify({
        CircleId: this.state.CircleId,
        UserIds: UserId
      })
    }).then(res => {
      if (res.data.code === 200) {
        toast('加入成功！', 'success', 1500)

        setTimeout(() => {
          this.setState({
            isOpened: true
          })
        }, 1500)
      }
    })

  }
  //点击确定
  onConfirm = () => {
    this.setState({
      isOpened: false
    })
    this.getData()
  }

  handleChange(e) {
    this.setState({
      KeyWord: e
    })
  }

  componentWillMount () {
    this.setState({
      CircleId: this.$router.preload.datas.CircleId,
      page: this.$router.preload.page,
      title: get('type') === 'zr'?'转让':'支付',
    })
  }

  goPage (data) {
    if (this.$router.preload.page === 'carport_detail') {
      this.$preload({
        IdNo: data.IdNo,
        UserName: data.UserName,
        UserId: data.UserId,
        id: this.$router.preload.id
      })
      Taro.redirectTo({
        url: '../carport_pay/index'
      })
    }
  }

  render () {
    const { page, title, userData, isOpened, num, navType, KeyWord } = this.state
    const head_default = `${imgUrl}head.png`
    const titleHeight = get('titleHeight')

    return (
      <View className='boxs'>
        <Header onNum={num} 
          onTitle={page === 'carport_detail' ? title : '邀请会员加入'} 
          onNavType={navType}
        />
        <View className='invite_join' 
          style={{marginTop: titleHeight,height: `calc(100vh - ${titleHeight})`}}
        >
          <View className='top_search'>
            <AtSearchBar
              placeholder='请输入会员名字/身份证号'
              onActionClick={this.confirm.bind(this)}
              value={KeyWord}
              onChange={this.handleChange.bind(this)}
            />
          </View>

          {
            JSON.stringify(userData) == '[]' ? 
            <View className='tips'>
              <View>
                <Image src={`${imgUrl}remind.png`} />
              </View>
              {
                page === 'carport_detail' ? <View>{ title }对象必须为车位所属商圈成员，如不是，请邀请其加入该商圈</View> : 
                <View>邀请会员加入商圈，并经商圈主办方审批通过后，被邀请会员即可加入该商圈。在同一商圈内进行车位的购买、转让、支付等交易。</View>
              }
            </View> : 
            <View className='result'>
              <View className='h'>搜素结果</View>
              <View className='list'>
                {
                  userData == null ? 
                  <View className='nodata1'>
                    <View>搜索不到该会员</View>
                    <View>对方可能未注册车位通平台</View>
                  </View> : 
                  userData !==null && userData.map(ele => {
                    return (
                      <View className='item' key={ele.UserId} onClick={this.goPage.bind(this,ele)}>
                        <View>
                          <AtAvatar circle image={ele.HeadIcon ? ele.HeadIcon : head_default}></AtAvatar>
                        </View>
                        <View>
                          <View><Text>{ ele.UserName }</Text><Text>{ ele.IfInsert == 0 ? '未加入' : '已加入' }</Text></View>
                          <View>
                            <Text decode>身份证号&nbsp;:&nbsp;&nbsp;</Text>
                            <Text>{ ele.IdNo }</Text>
                          </View>
                        </View>
                        <View>
                          { (ele.UserState === -1 || ele.UserState === 3) && 
                            <View onClick={this.joinCircle.bind(this,ele.UserId)} style={{color: '#5584FF'}}>邀请加入</View> }
                          { ele.UserState === 0 && <View>已发送</View> }
                          { ele.UserState === 1 && <View>已邀请</View> }
                        </View>
                      </View>
                    )
                  })
                }
              </View>
            </View>
          }






          <AtModal
            isOpened={isOpened}
            confirmText='确认'
            onConfirm={this.onConfirm}
            onClose={() => this.setState({isOpened: false})}
            content='邀请已发送，请等待对方加入商圈后再进行支付操作。'
          />

        </View>
      </View>

    )
  }
}
