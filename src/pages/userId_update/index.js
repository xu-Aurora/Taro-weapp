import Taro, { PureComponent } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtButton, AtImagePicker } from 'taro-ui'
import Header from '../../components/header/header'
import baseURL from '../../service/baseUrl'
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
      title: '证件上传',
      navType: 'backHome',
      disabled: true,
      num: 1,
      backFiles: [],
      frontFiles: [],
      frontImg: [],
      backImg: [],
      IdCardFront:'',
      IdCardReverse:''
    }
  }


  // 保存
  save () {
    const { IdCardFront, IdCardReverse, disabled, backFiles, frontFiles } = this.state
    let params = {}
    params.IdCardFront = IdCardFront
    params.IdCardReverse = IdCardReverse

    if (JSON.stringify(backFiles) === '[]' || JSON.stringify(frontFiles) === '[]') {
      toast('请上传证件照', 'none', 2000)
      return false
    }
    
    if (!disabled) {
      this.setState({
        disabled: true
      }, () => {
        api.updateUser({
          LoginMark: Taro.getStorageSync('uuid'),
          Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
          data: JSON.stringify(params)
        }).then(res => {
          if (res.data.code === 200) {
            toast('证件保存成功','success',1500).then(() => {
                Taro.eventCenter.trigger('getUserInfo')
            }).then(() => {
              this.setState({
                disabled: false
              })
            })
            if (this.$router.preload) {
              this.$preload({
                datas: this.$router.preload.datas,
                payType: this.$router.preload.payType,
                type: this.$router.preload.type,
                pages1: this.$router.preload.pages1,
                code: this.$router.preload.code,  // 随机数
                FaceCompareType: this.$router.preload.FaceCompareType
              })
              Taro.navigateTo({
                url: `../identityVerify/index`
              })
            }
          } else {
            this.setState({
              disabled: false
            })
          }
        })
      })
    }

  }

  //图片上传
  upload (param, files,type,index) {
    let t = this
    if (type === 'add') {
      if (files[0].file.size >= 500000) {
        toast('图片不能大于5M','none',1500)
        return false
      }
      Taro.uploadFile({
        url: `${baseURL()}Modules/SourceInfo/UploadImg`,
        filePath: files[0].url,
        name: 'file',
        success(res) {
          if (JSON.parse(res.data).code === 200) {
            if (param == 'front') {
              t.state.frontImg.push(JSON.parse(res.data).data.imgId)
              t.setState({
                frontFiles: files,
                frontImg: t.state.frontImg,
                IdCardFront: JSON.parse(res.data).data.imgId,
                disabled: t.state.backFiles.length >0  ? false : true
              })
            } else {
              t.state.backImg.push(JSON.parse(res.data).data.imgId)
              t.setState({
                backFiles: files,
                backImg: t.state.backImg,
                IdCardReverse: JSON.parse(res.data).data.imgId,
                disabled: t.state.frontFiles.length >0 ? false : true
              })
            }
          }
        },
        fail (res){
          toast(res,'none',2000)
        }
      })
    }
    if (type === 'remove') {
      if (param === 'front') {
        t.state.frontImg.splice(index,1)
        t.setState({
          frontFiles: files,
          frontImg: t.state.frontImg,
          disabled: true
        })
      } else {
        t.state.backImg.splice(index,1)
        t.setState({
          backFiles: files,
          backImg: t.state.backImg,
          disabled: true
        })
      }
    }
  }


  componentWillMount () {
    const userInfoData = Taro.getStorageSync('userInfoData')?JSON.parse(Taro.getStorageSync('userInfoData')):''
    let frontFiles = [], backFiles = [];
    userInfoData.IdCardFront&&userInfoData.IdCardFront!==null&&frontFiles.push({
      url: userInfoData.IdCardFront,
      file: {
        path: userInfoData.IdCardFront,
        size: 20000
      }
    })
    userInfoData.IdCardReverse&&userInfoData.IdCardReverse!==null&&backFiles.push({
      url: userInfoData.IdCardReverse,
      file: {
        path: userInfoData.IdCardReverse,
        size: 20000
      }
    })
    
    this.setState({
      backFiles,
      frontFiles,
      disabled: (frontFiles.length === 0 && frontFiles.length === 0) ? true : false
    })
  }


  render () {
    const titleHeight = get('titleHeight')
    const { num, navType, backFiles, frontFiles, frontImg, backImg, title, disabled } = this.state
    return (
      <View className='boxs'>
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View className='userIdUpdate' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
            <View className='userCard'>
                <View>
                    <AtImagePicker
                      length={1}
                      count={1}
                      showAddBtn={(frontImg.length >= 1 || frontFiles.length >= 1) ? false : true}
                      mode='widthFix'
                      files={frontFiles}
                      onChange={this.upload.bind(this, 'front')}
                      types='front'
                    />
                    <View className='codeText'>
                      点击拍摄/上传人像面
                    </View>
                </View>
                
                <View>
                    <AtImagePicker
                      length={1}
                      count={1}
                      showAddBtn={(backImg.length >= 1 || backFiles.length >= 1) ? false : true}
                      mode='widthFix'
                      files={backFiles}
                      onChange={this.upload.bind(this, 'back')}
                      types='back'
                    />
                    <View className='codeText'>
                      点击拍摄/上传国徽面
                    </View>
                </View>
                
            </View>
            
            <View className='footer'>
                <AtButton 
                  type='primary'
                  disabled={disabled}
                  onClick={this.save.bind(this)}
                >保存</AtButton>
            </View>
        </View>
      </View>
    )
  }
}
