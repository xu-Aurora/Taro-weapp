import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { AtTabs, AtTabsPane, AtActionSheet, AtActionSheetItem, AtSearchBar } from "taro-ui"
import Header from '../../components/header/header'
import { imgUrl, debounce, isEmpty } from '../../utils/util'
import api from '../../api/api'
import { get, set } from '../../global_data'
import './index.scss'

export default class Index extends PureComponent {

  constructor () {
    super(...arguments)
    this.state = {
      datas: {
        List: {
          rows: []
        }
      }, 
      searchValue: '',
      num: 1,
      title: '小区详情',
      navType: 'backHome',
      display1: 'none',
      display2: 'none',
      current: 0,
      isOpened: false,
      lists: [],
      listsDisplay: 'none',
      // eslint-disable-next-line react/no-unused-state
      Ifuse: 0,
      Sord: '',
      Sidx: '',
    }

    this.handleSearch = debounce(this.handleSearch1)
  }

  componentWillMount () {

    this.getData({
      Ifuse: 0,
      Sord: '',
      Sidx: '',
      KeyWord: ''
    })  
    
  }

  config = {
    navigationStyle: 'custom'
  }



  //页面跳转
  goPage (type,val) {
    if (type === 'car_detail') {
      if (type === 'car_detail') {  //用来标识下,车位详情是从小区跳转过去的
        set('page', 'community')
      }
      this.$preload({
        id: val,
        page: 'aw'
      })
      Taro.navigateTo({
        url: `../${type}/index`
      })
      this.setState({
        listsDisplay: 'none'
      })
    } else {
      Taro.navigateTo({
        url: `../${type}/index?param=${val}`
      })
    }
  }

  // 搜索框双向绑定
  handleSearch1 = (value) => {
    if (isEmpty(value)) {
      this.setState({
        searchValue: value,
        listsDisplay: 'none'
      })
    } else {
      // 模糊搜索
      this.SearchWord(value)
      
      this.setState({
        searchValue: value
      })
    }
    
  }

  SearchWord(KeyWord) {
    const { current, Sord } = this.state
    api.searchWord({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      KeyWord,
      BuildingId: this.$router.preload.BuildingId,
      Ifuse: current,
      Sord
    }).then(res => {
      if (res.data.code === 200) {
        let arr = []
        res.data.data.List.rows.forEach((ele, index) => {
          if (index < 5) {
            arr.push(ele)
          }
        })
        if (res.data.data.List.rows.length == 0) {
          this.setState({
            lists: arr,
            listsDisplay: 'none'
          })
        } else {
          this.setState({
            lists: arr,
            listsDisplay: 'block'
          })
        }



      }
    })
  }

  // 搜索
  onConfirm () {
    const { current, searchValue, Sord, Sidx, listsDisplay } = this.state

    if (listsDisplay === 'block') {
      this.setState({
        listsDisplay: 'none'
      }, () => {
        this.getData({
          Ifuse: current,
          Sord,
          Sidx,
          KeyWord: searchValue
        })  
      })
    } else {
      this.getData({
        Ifuse: current,
        Sord,
        Sidx,
        KeyWord: searchValue
      }) 
    }


  }

  idToData (searchValue) {
    const { current, Sord, Sidx } = this.state

      this.setState({
        searchValue,
        listsDisplay: 'none'
      })

      this.getData({
        Ifuse: current,
        Sord,
        Sidx,
        KeyWord: searchValue,
      })  

  }

  onBlur () {
    this.setState({
      listsDisplay: 'none'
    })
  }

  // 价格排序
  sort(type) {
    const { current, searchValue } = this.state
    this.setState({
      isOpened: false,
      Sord: type,
      Sidx: 'SalePrice',
    })

    if (type === 'Asc') {
      this.getData({
        Ifuse: current,
        Sord: 'Asc',
        Sidx: 'SalePrice',
        KeyWord: searchValue
      })  
    } else if (type === 'Desc') {
      this.getData({
        Ifuse: current,
        Sord: 'Desc',
        Sidx: 'SalePrice',
        KeyWord: searchValue
      })  
    }

  }

  //获取车位数据
  getData (params) {
    api.buildingDetail({
      LoginMark: Taro.getStorageSync('uuid'),
      Token: Taro.getStorageSync('userInfo')?JSON.parse(Taro.getStorageSync('userInfo')).token:'',
      BuildingId: this.$router.preload.BuildingId,
      Ifuse: params.Ifuse,
      Sord: params.Sord,
      Sidx: params.Sidx,
      KeyWord: params.KeyWord,
    }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          datas: res.data.data
        })
      }
    })

  }

  // 切换Tab
  handleClick (value) {
    const { Sord, searchValue, Sidx } = this.state
    this.setState({
      current: value
    },() => {
      if (value == 0) {       // 权证
        this.getData({
          Ifuse: 0,
          Sord,
          Sidx,
          KeyWord: searchValue,
        })  
      }else if(value == 1){   // 凭证
        this.getData({
          Ifuse: 1,
          Sord,
          Sidx,
          KeyWord: searchValue
        }) 
      }
    })
  }

  renderParkingTraitType (data) {
    return (
      data&&(data.length>0) && (data.split(',')).map((item,i) => {
        return <Text key={item+i} className='tag_blue'>{ item }</Text>
      })
    )
  }

  parkCode (data) {
    let code
    if (data.Usufruct == 0) {
      code = `${data.ParkingCode.slice(0,1)}*****${data.ParkingCode.slice(-1)}`
    } else {
      code = data.ParkingCode 
    }
    return code
  }




  render () {
    const { num, title, navType, datas, display1, display2, current, isOpened, searchValue, listsDisplay, lists } = this.state
    const titleHeight = get('titleHeight')
    const surHeight = get('titleHeight1') + 475 + 100
    const tabList = [{ title: '车位通凭证' }, { title: '车位通权证' }]

    return (
      <View className='comm_derail'>

        <Header onNum={num} onTitle={title} onNavType={navType} />

          <View className='content'
            style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
          >

            <View className='top_title'>
              <View>
                <Text>{ datas.BuildingName }</Text>
                <Text onClick={this.goPage.bind(this,'c_detail',datas.BuildingId)}>小区详情</Text>
              </View>
              <View>
                <Text decode>{ datas.City }&nbsp;</Text>
                <Text decode>{ datas.District }&nbsp;</Text>
                <Text>{ datas.Address }</Text>
              </View>
              <View>
                <View>车位通凭证 : { datas.SaleProof }个</View>
                <View>车位通权证 : { datas.SaleWarrant }个</View>
              </View>
              <View>
                <View>待出售凭证 : { datas.ForSaleProof }个</View>
                <View>待出售权证 : { datas.ForSaleWarrant }个</View>
              </View>


            </View>

            <View className='search'>
              <AtSearchBar
                value={searchValue}
                placeholder='车位编号'
                onBlur={this.onBlur.bind(this)}
                onChange={this.handleSearch}
                onConfirm={this.onConfirm.bind(this)}
                onActionClick={this.onConfirm.bind(this)}
              />
              <View className='searchList' style={{display: listsDisplay}}>
                {
                  !isEmpty(lists) && lists.map((ele, i) => {
                    return (
                      <View 
                        className='lists' 
                        key={ele.ParkingId} 
                        onClick={this.idToData.bind(this, ele.ParkingCode)}
                      >
                        <View>{ i + 1 }</View>
                        <View>{ele.ParkingCode}</View>
                      </View>
                    )
                  })
                }
              </View>

              <View className='lists'>
                <AtTabs current={current} tabList={tabList} onClick={this.handleClick.bind(this)}>
                  <AtTabsPane current={current} index={0}>
                    {/* list数据 */}
                    <ScrollView
                      className='scrollview'
                      scrollY
                      scrollWithAnimation
                      scrollTop={0}
                      style={{height: `calc(100vh - ${surHeight}rpx)`}}
                      lowerThreshold={50}
                      onScrollToLower={() => this.setState({display1: 'flex'})}
                    >
                      <View className='list'>
                        {
                          !isEmpty(datas.List.rows) && datas.List.rows.map(ele => {
                            return (
                              <View className='item' key={ele.ParkingId} 
                                onClick={this.goPage.bind(this,'car_detail',ele.ParkingId)}
                              >
                                <View className='left'>
                                  <View style={{color: '#FC7946'}}>
                                    <View>
                                      <Text>{ ele.FixedRate.toFixed(2) }</Text>
                                      <Text>%</Text>
                                    </View>
                                    <View>年化收益率</View>
                                  </View> 
                                </View>
                                <View className='right'>
                                  <View className='overflow1'>凭证编号{ ele.ParkingId.toUpperCase() }</View>
                                  <View>所属商圈：{ ele.CircleName }</View>
                                  <View>凭证到期日：{ ele.LimitDate }</View>
                                  <View>面额<Text style={{fontSize: '18rpx'}}> (元)</Text>：{ ele.Price }</View>
                                </View>
                              </View>
                            )
                          }) 
                        }
                      </View> 

                      {
                        isEmpty(datas.List.rows) && 
                        <View className='nodata' 
                          style={{height: `calc(100vh - ${surHeight+20}rpx)`,marginRight: '32rpx',}}
                        >
                          <View>
                            <Image src={`${imgUrl}order_nodata.png`} />
                            <View>暂无车位</View>
                          </View>
                        </View>
                      }


                      <View className='footer1' style={{display: display1}}>
                        <View>
                          <View className='line'></View>
                          <View className='text'>已经到底啦</View>
                          <View className='line'></View>
                        </View>
                      </View>
                    </ScrollView>
                  </AtTabsPane>
                  <AtTabsPane current={current} index={1}>
                    {/* list数据 */}
                    <ScrollView
                      className='scrollview'
                      scrollY
                      scrollWithAnimation
                      scrollTop={0}
                      style={{height: `calc(100vh - ${surHeight}rpx)`}}
                      lowerThreshold={50}
                      onScrollToLower={() => this.setState({display2: 'flex'})}
                    >
                      <View className='list'>
                        {
                          !isEmpty(datas.List.rows) && datas.List.rows.map(ele => {
                            return (
                              <View className='item' key={ele.ParkingId} 
                                onClick={this.goPage.bind(this,'car_detail',ele.ParkingId)}
                              >
                                <View className='left'>
                                  <View style={{color: '#5584FF'}}>
                                    <View>
                                      <Text>{ ((ele.SalePrice)/10000).toFixed(2) }</Text>
                                      <Text> 万</Text>
                                    </View>
                                    <View>挂牌价<Text style={{fontSize: '18rpx'}}> (元)</Text></View>
                                  </View>
                                </View>
                                <View className='right'>
                                  <View>车位号{ this.parkCode(ele)}</View>
                                  <View>所属商圈：{ ele.CircleName }</View>
                                  <View>车位类型：{ ele.ParkingType }</View>
                                </View>
                              </View>
                            )
                          }) 
                        }
                      </View> 
                      {
                        isEmpty(datas.List.rows) && 
                        <View className='nodata' 
                          style={{height: `calc(100vh - ${surHeight+20}rpx)`,marginRight: '32rpx',}}
                        >
                          <View>
                            <Image src={`${imgUrl}order_nodata.png`} />
                            <View>暂无车位</View>
                          </View>
                        </View>
                      }
                      <View className='footer1' style={{display: display2}}>
                        <View>
                          <View className='line'></View>
                          <View className='text'>已经到底啦</View>
                          <View className='line'></View>
                        </View>
                      </View>
                    </ScrollView>
                  </AtTabsPane>
                </AtTabs>

                <View className='sort' onClick={() => this.setState({isOpened: true})}>
                  <Text>价格</Text>
                  <View><Image src={`${imgUrl}rank.png`} /></View>
                </View>
              </View>
            </View>

          </View>

        {/* 点击排序 */}
        <AtActionSheet 
          isOpened={isOpened} 
          onClose={() => this.setState({isOpened: false})}
        >
          <AtActionSheetItem onClick={this.sort.bind(this, 'Asc')}>价格由低到高</AtActionSheetItem>
          <AtActionSheetItem onClick={this.sort.bind(this, 'Desc')}>价格由高到低</AtActionSheetItem>
        </AtActionSheet>

      
      </View>
    )
  }
}
