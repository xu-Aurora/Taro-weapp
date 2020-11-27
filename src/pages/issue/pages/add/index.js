import Taro, { PureComponent } from '@tarojs/taro'
import { View, ScrollView, Picker, CoverView, CoverImage, Text } from '@tarojs/components'
import { AtInput, AtTextarea, AtTag, AtList, AtListItem, AtButton, AtImagePicker, AtModal } from 'taro-ui'
import { imgUrl, phoneReg, trim } from '../../../../utils/util'
import baseURL from '../../../../service/baseUrl'
import { get, toast } from '../../../../global_data'
import api from '../../../../api/api'
import './index.scss'


let userInfoData = Taro.getStorageSync('userInfoData')

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      title: '',      //标题
      community: '',  //仓储
      describe: '',   //描述
      type: '',       //用来判断是求购、求租、出租
      area: ['北京市', '北京市', '东城区'],
      parkData: [],   //资产类型数据
      selType: [],    //选中的资产类型
      MinAmt: '',     //最低价格
      MaxAmt: '',     //最高价格
      Tel: JSON.parse(userInfoData).Mobile,        //手机号码
      Contact: JSON.parse(userInfoData).RealName,    //联系人
      Gender: '男',    //性别
      selector: ['男','女'],
      clickBtn: true,  //控制按钮点击
      files: [],       //图片数据 
      imgs: [],        //上传的图片
      Province: '110000',    //省code
      City: '110100',        //市code
      County: '110101',      //区code
      isOpened: false,  //控制模态框展示与隐藏
      pages: ''
    }
  }

  //input双向绑定
  handleChange (types, e) {
    const { type, title, community, describe, selType, Contact, Tel, imgs } = this.state
    if (type === '资产出租') {
      if (types === 'describe') {
        this.setState({
          [types]: e.target.value
        },() => {
          if (title !== '' && trim(title).length > 0 && community !== '' && describe !== '' &&  JSON.stringify(imgs) !== '[]' &&
            JSON.stringify(selType) !== '[]' && Contact !== '' &&  Tel !=='') {
            this.setState({
              clickBtn: false
            })
          } else {
            this.setState({
              clickBtn: true
            })
          }
        })
      } else {
        this.setState({
          [types]: e
        },() => {
          if (title !== '' && trim(title).length > 0 && JSON.stringify(imgs) !== '[]' &&  community !== '[]' && 
            JSON.stringify(selType) !== '[]'&&  describe !== '' &&  Contact !== '' && Tel !== '') {
            this.setState({
              clickBtn: false
            })
          }else{
            this.setState({
              clickBtn: true
            })
          }
        })
      }
    } else {
      if (types === 'describe') {
        this.setState({
          describe: e.target.value
        },() => {
          if (title !== '' &&  trim(title).length > 0 && community !== '' &&  describe !== '' && JSON.stringify(selType) !== '[]' &&  Contact !== '' && Tel !== '') {
            this.setState({
              clickBtn: false
            })
          } else {
            this.setState({
              clickBtn: true
            })
          }
        })
      } else {
        this.setState({
          [types]: e
        },() => {
          if (title !== '' && trim(title).length > 0 && community !== '' && describe !== '' && JSON.stringify(selType) !== '[]' && Contact !== '' &&  Tel !== '') {
            this.setState({
              clickBtn: false
            })
          } else {
            this.setState({
              clickBtn: true
            })
          }
        })
      }
    }

  }
  //资产类型选择
  handleTag (e) {
    const arr = Object.assign([],this.state.parkData)
    let newArr = []
    arr.forEach(ele => {
      if (e.name === ele.F_ItemName) {
        ele.active = !ele.active
      }
    })
    arr.forEach(item => {
      if (item.active) {
        newArr.push(item.F_ItemName)
      }
    })
    this.setState({
      parkData: arr,
      selType: newArr.join('/')
    },() => {
      if (this.state.type === '资产出租') {
        if (
          this.state.title!=='' && 
          trim(this.state.title).length>0 &&
          JSON.stringify(this.state.imgs)!=='[]'&&  
          this.state.community!=='' && 
          this.state.describe!==''  && 
          JSON.stringify(newArr)!=='[]' && 
          this.state.Contact!=='' && 
          this.state.Tel!=='') {
          this.setState({
            clickBtn: false
          })
        }else{
          this.setState({
            clickBtn: true
          })
        }
      }else{
        if (
          this.state.title!=='' && 
          trim(this.state.title).length>0 &&
          this.state.community!=='' && 
          this.state.describe!=='' && 
          JSON.stringify(newArr)!=='[]' && 
          this.state.Contact!=='' && 
          this.state.Tel!=='') {
          this.setState({
            clickBtn: false
          })
        }else{
          this.setState({
            clickBtn: true
          })
        }
      }
    })
  }
  //获取省市区数据
  getAreaZone () {
    api.areaZone().then(res => {
      if (res.data.code === 200) {
        this.setState({
          AreaZone: res.data.data
        })
      }
    })
  }
  //获取资产类型
  getParkType () {
    api.buildTraitType({
      data: 'ParkingType'
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          parkData: res.data.data,
        })
      }
    })
  }
  //省市区操作
  picker (e) {
    this.setState({
      area: e.detail.value
    },() => {
      let Province
      this.state.AreaZone.forEach(ele => {
        if (e.detail.value[0] == (ele.AreaName.length==2?`${ele.AreaName}市`:ele.AreaName)) {
          Province = ele.AreaCode
        }
      })
      this.setState({
        Province
      })
      api.areaZone({ProvinceName: e.detail.value[0]}).then(res => {
        if (res.data.code === 200) {
          let City
          if (e.detail.value[0]==='北京市' ||e.detail.value[0]==='天津市' ||e.detail.value[0]==='上海市' ||e.detail.value[0]==='重庆市') {
            City = res.data.data[0].AreaCode
          }else{
            res.data.data[0].SubsetList.forEach(ele => {
              if (e.detail.value[1] == ele.AreaName) {
                City = ele.AreaCode
              }
            })
          }
          this.setState({
            City
          })
        }
      })
      api.areaZone({CityName: e.detail.value[1]}).then(res => {
        if (res.data.code === 200) {
          let County
          res.data.data[0].SubsetList.forEach(ele => {
            if (e.detail.value[2] == ele.AreaName) {
              County = ele.AreaCode
            }
          })
          this.setState({
            County
          })
        }
      })
    })
  }
  //男女选择
  selChange (e) {
    this.setState({
      Gender: this.state.selector[e.detail.value]
    })
  }
  text (type,num) {
    let text
    if (num === 1) {
      if (type === '资产求购') {
        text = '求购'
      }else if (type === '资产求租') {
        text = '求租'
      }else if (type === '资产出租') {
        text = '所在'
      }
    }else if (num === 2) {
      if (type === '资产求购') {
        text = '期望价格'
      }else if (type === '资产求租') {
        text = '期望租金'
      }else if (type === '资产出租') {
        text = '租金'
      }
    }else if (num === 3) {
      if (type === '资产求购') {
        text = '价格'
      }else if (type === '资产求租') {
        text = '租金'
      }
    }else if (num === 4) {
      if (type === '资产求购') {
        text = '万元'
      }else if (type === '资产求租') {
        text = '元/月'
      }
    }

    return text
  }

  //头部按钮操作
  goPage (type) {
    if (this.state.type === '资产出租') {
      if (
        this.state.title==='' && 
        trim(this.state.title).length===0 &&
        this.state.describe==='' && 
        JSON.stringify(this.state.imgs)==='[]'&& 
        JSON.stringify(this.state.selType)==='[]'&& 
        this.state.community==='' && 
        this.state.MinAmt==='' && 
        this.state.Contact==='' && 
        this.state.Tel==='') {
        if (type === 'back') {
          Taro.navigateBack({ 
            delta: 1
          })
        }else if(type === 'home'){
          Taro.switchTab({
            url: '../../../home/index'
          })
        }
      }else{
        this.setState({
          isOpened: true,
          pages: type
        })
      }
    }else{
      if (
        this.state.title==='' && 
        trim(this.state.title).length===0 &&
        this.state.describe==='' && 
        JSON.stringify(this.state.selType)==='[]'&& 
        this.state.community==='' && 
        this.state.MinAmt==='' && 
        this.state.MaxAmt==='' && 
        this.state.Contact==='' && 
        this.state.Tel==='') {
        if (type === 'back') {
          Taro.navigateBack({ 
            delta: 1
          })
        }else if(type === 'home'){
          Taro.switchTab({
            url: '../../../home/index'
          })
        }
      }else{
        this.setState({
          isOpened: true,
          pages: type
        })
      }
    }
  }

  //图片上传
  upload (files,type,index) {
    let t = this
    if (type === 'add') {
      if (files.length > 10) {
        toast('图片限制上传10张','none',1500)
        return false
      }
      for (let i = 0,len = files.length; i < len; i++) {
        if (files[i].file.size >= 500000) {
          toast('图片不能大于5M','none',1500)
          return false
        }
        Taro.showLoading({title: 'loading...', mask: true})
        Taro.uploadFile({
          url: `${baseURL()}Modules/SourceInfo/UploadImg`,
          filePath: files[i].url,
          name: 'file',
          success (res){
            if (JSON.parse(res.data).code === 200) {
              if (i === files.length-1) {
                Taro.hideLoading()
              }
              t.state.imgs.push(JSON.parse(res.data).data.imgId)
              t.setState({
                files,
                imgs: t.state.imgs
              })
            }
          },
          fail (res){
            toast(res,'none',2000)
          }
        })
      }
    }
    if (type === 'remove') {
      t.state.imgs.splice(index,1)
      t.setState({
        files,
        imgs: t.state.imgs
      })
    }

  }
  //点击图片
  imageClick (index) {
    let imgUrls = []
    this.state.files.forEach(ele => {
      imgUrls.push(ele.url)
    })
    this.$preload({
      imgUrls,
      index
    })
    Taro.navigateTo({
      url: '../showImg/index',
    })
  }
  onFail (mes) {
    console.log(mes)
    // toast(mes,'none',3000)
  }

  //取消保存
  cancel = () => {
    this.setState({
      isOpened: false
    },() => {
      if (this.state.pages === 'back') {
        Taro.navigateBack({ 
          delta: 1
        })
      }else if(this.state.pages === 'home'){
        Taro.switchTab({
          url: '../../../home/index'
        })
      }
    })
  }
  //保存，存为草稿
  handleConfirm  = () => {
    this.setState({
      isOpened: false
    })
    this.add()
  }

  add () {
    const { title, community, selType, describe, Contact, Gender, Tel, 
      imgs, MinAmt, MaxAmt, Province, City, County, isOpened } = this.state
    this.setState({
      clickBtn: true
    },() => {
      api.postAdd({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          Title: title,
          Type: this.$router.preload.num,
          Building: community,
          ParkingType: JSON.stringify(selType)==='[]'?'':selType,
          Province,
          City,
          County,
          Description: describe,
          Contact,
          Gender: Gender === '男' ? 1 : 2,
          Tel: +Tel,
          ImgId: imgs,
          PostState: isOpened ? 0 : 1,
          MaxAmt: `${+MaxAmt}0000`,
          MinAmt: `${+MinAmt}0000`
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',1500)
          setTimeout(() => {
            if (this.state.pages === 'back') {
              Taro.navigateBack({ 
                delta: 1
              }).then(() => {
                this.setState({
                  clickBtn: false
                })
              })
            }else if(this.state.pages === 'home'){
              Taro.switchTab({
                url: '../../../home/index'
              }).then(() => {
                this.setState({
                  clickBtn: false
                })
              })
            }else{
              this.$preload({
                title: this.$router.preload.type,
                num: this.$router.preload.num
              })
              Taro.navigateTo({
                url: '../release/index'
              }).then(() => {
                this.setState({
                  clickBtn: false
                })
              })
            }
          }, 1500);

        }else{
          toast(res.data.indo,'none',2000)
          this.setState({
            clickBtn: false
          })
        }
      })
    })
  }

  //发布
  release = () => {
    const { Tel, MinAmt, MaxAmt } = this.state

    if (MinAmt !== '' && MaxAmt !== '') {
      if (MinAmt == 0 && MaxAmt == 0) {
        
      }else{
        if (MinAmt >= MaxAmt) {
          toast('最低价格不能大于或等于最高价格','none',2000)
          return
        }
      }
    }


    if (!phoneReg.test(Tel)) {
      toast('手机号码格式不正确','none',2000)
      return
    }
    this.add()
  }

  componentWillMount () { 
    this.getParkType()
    this.getAreaZone()
    this.setState({
      type: this.$router.preload.type
    })
  }

  render () {
    const status = get('statusHeight')
    const navHeight = get('navHeight')
    const titleHeight = get('titleHeight')
    const { files, imgs, title, clickBtn, community, describe, parkData, type,
      area, MinAmt, MaxAmt, Contact, Tel, Gender, selector, isOpened } = this.state
    return (
      <View className='issueAdd'>
        <CoverView className='nav' style={{height: `calc(${status}px + ${navHeight}px)`}}>
          <CoverView className='status' style={{height: `${status}px`}}></CoverView>
          <CoverView className='navbar' style={{height: `${navHeight}px`}}>
            <CoverView className='btn_box'>
              <CoverView className='back-icon' onClick={this.goPage.bind(this,'back')}>
                <CoverImage src={`${imgUrl}left.png`} />
              </CoverView>
              <CoverView className='home-icon' onClick={this.goPage.bind(this,'home')}>
                <CoverImage src={`${imgUrl}head_home.png`} />
              </CoverView>
            </CoverView> 
          </CoverView>
        </CoverView>

        <View className='contents' 
          style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
        >
          <View className='top'>
            <View className='title'>{ type }</View>
            <AtInput
              type='text'
              className='bot_line'
              maxLength={12}
              placeholder='请填写标题，不超过12个汉字'
              value={title}
              onChange={this.handleChange.bind(this,'title')}
            />

            <AtTextarea
              value={describe}
              count={false}
              maxLength={1000}
              height={350}
              onChange={this.handleChange.bind(this,'describe')}
              placeholder='具体描述可以帮助你更快更准确完成交易。如：靠近电梯，配充电桩'
            />

            { 
              type === '资产出租' && (
                <View style={{paddingBottom: '20rpx'}}>
                  <AtImagePicker
                    multiple
                    length={5}
                    count={10}
                    showAddBtn={(imgs.length >= 10) ? false : true}
                    mode='widthFix'
                    files={files}
                    onImageClick={this.imageClick.bind(this)}
                    onChange={this.upload.bind(this)}
                    onFail={this.onFail.bind(this)}
                  />
                </View>
              )
            }
          </View>
          <View className='middle'>
            <View style={{borderBottom:'1rpx solid #E5E5E5',paddingBottom:'26rpx'}}>
              <ScrollView
                className='scrollview'
                scrollX
                scrollWithAnimation
                style={{maxWidth: '100vw',whiteSpace:'nowrap'}}
              >
                {
                  parkData.length>0 && parkData.map(ele => {
                    return (
                      <AtTag key={ele.F_ItemId}
                        name={ele.F_ItemName}
                        active={ele.active}
                        onClick={this.handleTag.bind(this)}
                      >
                        { ele.F_ItemName }
                      </AtTag>
                    )
                  })
                }
              </ScrollView>
            </View>
              
            <AtInput
              className='bot_line'
              type='text'
              title={`${this.text(type,1)}仓储`}
              placeholder='请输入仓储名称'
              value={community}
              onChange={this.handleChange.bind(this,'community')}
            />

            <Picker 
              mode='region'
              value={area} 
              onChange={this.picker.bind(this)}
            >
              <AtList>
                <AtListItem 
                  className='bot_line'
                  arrow='right' 
                  title={`${this.text(type,1)}区域`}
                  extraText={`${area[1]} ${area[2]}`}
                />
              </AtList>
            </Picker>
            
            {
              type === '资产出租' ? (
                <View className='cz'>
                  <AtInput
                    type='digit'
                    title='租金'
                    placeholder='请输入租金'
                    value={MinAmt}
                    onChange={this.handleChange.bind(this,'MinAmt')}
                  /><Text className='dw'>元/月</Text>
                  <View className='tips'>填“0”或者不填，则默认面议</View>
                </View>
              ) : (
                <View className='interval'>
                  <View>
                    <View>{ this.text(type,2) }</View>
                    <View>
                      <AtInput
                        type='digit'
                        maxLength={5}
                        placeholder={`最低${this.text(type,3)}`}
                        value={MinAmt}
                        onChange={this.handleChange.bind(this,'MinAmt')}
                      />
                    </View>
                    <View>-</View>
                    <View>
                      <AtInput
                        type='digit'
                        maxLength={5}
                        placeholder={`最高${this.text(type,3)}`}
                        value={MaxAmt}
                        onChange={this.handleChange.bind(this,'MaxAmt')}
                      />
                    </View>
                    <View>{ this.text(type,4) }</View>
                  </View>
                  <View className='tips'>填“0”或者不填，则默认面议</View>
                </View>
              )
            }

          </View>
          <View className='bottom'>
            <AtInput
              className='bot_line'
              type='text'
              title='联系人'
              placeholder='请输入联系人'
              value={Contact}
              onChange={this.handleChange.bind(this,'Contact')}
            />
            <Picker mode='selector' 
              range={selector} 
              onChange={this.selChange.bind(this)}
            >
              <AtList>
                <AtListItem 
                  className='bot_line'
                  arrow='right' 
                  title='性别'
                  extraText={Gender}
                />
              </AtList>
            </Picker>
            <AtInput
              type='digit'
              title='手机号码'
              maxLength={11}
              placeholder='请输入手机号码'
              value={Tel}
              onChange={this.handleChange.bind(this,'Tel')}
            />
          </View>
          <View className='footer'>
            <AtButton 
              disabled={clickBtn}
              onClick={this.release}
              type='primary'
            >发布</AtButton>
          </View>
        </View>

        <AtModal
          isOpened={isOpened}
          cancelText='不保存'
          confirmText='保存'
          onCancel={this.cancel}
          onClose={() => this.setState({isOpened: false})}
          onConfirm={this.handleConfirm}
          content='是否要保存为草稿，方便下次编辑'
        />
      </View>
    )
  }
}
