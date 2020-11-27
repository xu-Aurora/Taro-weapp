import Taro, { PureComponent } from '@tarojs/taro'
import { View, ScrollView, Picker, Text  } from '@tarojs/components'
import { AtInput, AtTextarea, AtTag, AtList, AtListItem, AtButton, AtImagePicker, AtModal } from 'taro-ui'
import { phoneReg, trim } from '../../../../utils/util'
import baseURL from '../../../../service/baseUrl'
import Header from '../../../../components/header/header'
import { get, toast } from '../../../../global_data'
import api from '../../../../api/api'
import '../add/index.scss'


let userInfoData = Taro.getStorageSync('userInfoData')

export default class Index extends PureComponent {

  config = {
    navigationStyle: 'custom'
  }

  constructor () {
    super(...arguments)
    this.state = {
      back: 1,
      sub: true,
      navType: 'coverView',
      title: '',      //标题
      community: '',  //仓储
      describe: '',   //描述
      type: '',       //用来判断是求购、求租、出租
      area: ['北京市', '北京市', '东城区'],
      parkData: [],   //车位类型数据
      selType: '',    //选中的车位类型
      MinAmt: '',     //最低价格
      MaxAmt: '',     //最高价格
      Tel: JSON.parse(userInfoData).Mobile,        //手机号码
      Contact: JSON.parse(userInfoData).RealName,    //联系人
      Gender: '男',    //性别
      selector: ['男','女'],
      clickBtn: false,  //控制按钮点击
      clickBtn1: false,  //控制按钮点击
      files: [],       //图片数据 
      imgs: [],        //上传的图片
      Province: '110000',    //省code
      City: '110100',        //市code
      County: '110101',      //区code
      isOpened: false,  //控制模态框展示与隐藏
      num: '',
      type: '',
    }
  }

  //input双向绑定
  handleChange (types,e) {
    if (this.state.type === '车位出租') {
      if (types === 'describe') {
        this.setState({
          [types]: e.target.value
        },() => {
          if (this.state.title!=='' && 
              trim(this.state.title).length>0 &&
              this.state.community!=='' && 
              this.state.describe!=='' && 
              JSON.stringify(this.state.imgs)!=='[]' && 
              this.state.selType!=='' && 
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
        })
      }else{
        this.setState({
          [types]: e
        },() => {
          if (this.state.title!=='' && 
              trim(this.state.title).length>0  &&
              this.state.community!=='' && 
              this.state.describe!=='' && 
              this.state.selType!=='' && 
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
        })
      }
    }else{
      if (types === 'describe') {
        this.setState({
          [types]: e.target.value
        },() => {
          if (this.state.title!=='' && 
              trim(this.state.title).length>0  &&
              this.state.community!=='' && 
              this.state.describe!=='' && 
              this.state.selType!=='' && 
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
        })
      }else{
        this.setState({
          [types]: e
        },() => {
          if (this.state.title!=='' && 
              trim(this.state.title).length>0  &&
              this.state.community!=='' && 
              this.state.describe!=='' && 
              this.state.selType!=='' && 
              this.state.Contact!=='' 
              && this.state.Tel!=='') {
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
    }

  }
  //车位类型选择
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
      if (this.state.type === '车位出租') {
        if (
          this.state.title!=='' && 
          trim(this.state.title).length>0 &&
          this.state.community!=='' && 
          this.state.describe!=='' && 
          JSON.stringify(this.state.imgs)!=='[]' && 
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
  //获取车位类型
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
      if (type === '车位求购') {
        text = '求购'
      }else if (type === '车位求租') {
        text = '求租'
      }else if (type === '车位出租') {
        text = '所在'
      }
    }else if (num === 2) {
      if (type === '车位求购') {
        text = '期望价格'
      }else if (type === '车位求租') {
        text = '期望租金'
      }else if (type === '车位出租') {
        text = '租金'
      }
    }else if (num === 3) {
      if (type === '车位求购') {
        text = '价格'
      }else if (type === '车位求租') {
        text = '租金'
      }
    }else if (num === 4) {
      if (type === '车位求购') {
        text = '万元'
      }else if (type === '车位求租') {
        text = '元/月'
      }
    }

    return text
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
        if (files[i].url.slice(0,10) === 'http://tmp') {
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
  }

  //删除
  del = () => {
    this.setState({
      isOpened: false,
      clickBtn1: true
    },() => {
      if (this.state.clickBtn1) {
        api.postDel({
          LoginMark: Taro.getStorageSync('uuid')?Taro.getStorageSync('uuid'):'',
          Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
          data: JSON.stringify({
            PostId: this.$router.preload.PostId
          })
        }).then(res => {
          if (res.data.code === 200) {
            toast(res.data.info,'success',1500)
            setTimeout(() => {
              Taro.navigateTo({
                url: '../myRelease/index'
              }).then(() => {
                this.setState({
                  clickBtn1: false
                })
              })
            }, 1000);
          }else{
            toast(res.data.info,'none',2000)
            this.setState({
              clickBtn1: false
            })
          }
        })
      }
    })
  }

  edit () {
    const { title, community, selType, describe, Contact, Gender, Tel, 
      imgs, MinAmt, MaxAmt, Province, City, County, num } = this.state
    this.setState({
      clickBtn: true
    },() => {
      api.postEdit({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          PostId: this.$router.preload.PostId,
          Title: title,
          Type: num,
          Building: community,
          ParkingType: selType,
          Province,
          City,
          County,
          Description: describe,
          Contact,
          Gender: Gender === '男' ? 1 : 2,
          Tel: +Tel,
          ImgId: imgs,
          PostState: 1,
          MaxAmt: `${+MaxAmt}0000`,
          MinAmt: `${+MinAmt}0000`
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info,'success',1500)
          setTimeout(() => {
            this.$preload({
              title: this.state.type,
              num: this.state.num
            })
            Taro.navigateTo({
              url: '../myRelease/index'
            }).then(() => {
              this.setState({
                clickBtn: false
              })
            })
          }, 1000)
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
    const { Tel, MinAmt, MaxAmt, num } = this.state
    if (num !== 3) {
      if (MinAmt !== '' && MaxAmt !== '') {
        if (MinAmt == 0 && MaxAmt == 0) {
          
        }else{
          if (MinAmt >= MaxAmt) {
            toast('最低价格不能大于或等于最高价格','none',2000)
            return
          }
        }
      }
    }
    if (!phoneReg.test(Tel)) {
      toast('手机号码格式不正确','none',2000)
      return
    }
    this.edit()
  }
  //获取详情数据
  getData () {
    Taro.showLoading({title: 'loading...', mask: true})
    api.postDetail({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
      PostId: this.$router.preload.PostId
    }).then(res => {
      if (res.data.code === 200) {
        Taro.hideLoading()
        let data = res.data.data
        let files = []
        data.Imgs!==null&&data.Imgs.forEach(ele => {
          files.push({
            url: ele,
            file: {
              path: ele,
              size: 20000
            }
          })
        })
        let type = () => {
          let text
          if (data.Type === 1) {
            text = '车位求购'
          }else if(data.Type === 2) {
            text = '车位求租'
          }else if(data.Type === 3) {
            text = '车位出租'
          }
          return text
        }
        this.state.parkData.forEach(ele => {
          data.ParkingType.split('/').forEach(item => {
            if (ele.F_ItemName === item) {
              ele.active = true
            }
          })
        })

        this.setState({
          title: data.Title,
          describe: data.Description,
          files,
          imgs: data.ImgId,
          selType: data.ParkingType,
          community: data.Building,
          MaxAmt: data.MaxAmt,
          MinAmt: data.MinAmt,
          Contact: data.Contact,
          Tel: data.Tel,
          Gender: data.Gender === '1' ? '男' : '女',
          Province: data.ProvinceCode,
          City: data.CityCode,
          County: data.CountyCode,
          area: [data.Province,data.City,data.County],
          type: type(),
          num: data.Type
        })
      }
    })
  }

  componentWillMount () { 
    this.getParkType()
    this.getAreaZone()
    this.getData()
  }

  render () {
    const titleHeight = get('titleHeight')
    const { files, imgs, title, clickBtn, community, describe, parkData, type, back, sub, navType,
      area, MinAmt, MaxAmt, Contact, Tel, Gender, selector, isOpened } = this.state
    return (
      <View className='issueAdd'>
        <Header onNum={back} onSub={sub} onNavType={navType} />

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
              type === '车位出租' && (
                <View style={{paddingBottom: '20rpx'}}>
                  <AtImagePicker
                    multiple
                    length={5}
                    count={10}
                    showAddBtn={(imgs&&imgs.length >= 10) ? false : true}
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
                  parkData && parkData.map(ele => {
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
              type === '车位出租' ? (
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
            <View style={{marginTop: '40rpx'}}>
              <AtButton onClick={() => this.setState({isOpened: true})} 
                type='secondary' className='red_btn'
              >删除</AtButton>
            </View>
          </View>
        </View>

        <AtModal
          isOpened={isOpened}
          cancelText='取消'
          confirmText='确定'
          onCancel={() => this.setState({isOpened: false})}
          onClose={() => this.setState({isOpened: false})}
          onConfirm={this.del}
          content='删除后将取消已发布的信息，确定删除吗？'
        />
      </View>
    )
  }
}
