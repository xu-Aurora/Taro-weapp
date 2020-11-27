import Taro, { Component } from "@tarojs/taro";
import { View, Picker, Text } from "@tarojs/components";
import { AtSearchBar, AtIcon } from "taro-ui";
import { get, set } from "@/global_data";
import PropTypes from "prop-types";
import api from '@/api/api'
import "./index.scss";


export default class Search extends Component {
  constructor () {
    this.state = {
      value: '',
      iconCity: 'chevron-down',
      city: [],       //  市
      cityCode: '',
      province: [],   // 省
      cityVal: '',    // 选择数据展示的值
      selCity: [],
      multiIndex:[0, 0],
      flag: false,    // 用来判断是否用滑动选择省市
      classfyData: [],
      ParkingTraitType: '',
    };

  }

  // 获取省市数据
  getAreaZone () {
    api.areaZone().then(res => {
      if (res.data.code === 200) {
        let province = []
        let city = []
        res.data.data.forEach(ele => {
          province.push(ele.AreaName)
          city.push(ele.SubsetList)
        })
        this.setState({
          province: [province,['北京']],
          city
        })
      }
    })
  }

  getClassfy() {
    api.wineClassfy().then(res => {
      if (res.data.code === 200) {
        let province = []
        let city = []
        // let sub = []
        res.data.data.forEach(ele => {
          province.push(ele.text)
          city.push(ele.ChildNodes)
        })
        city.map(ele => {
          ele.unshift({text: '全部', id: ''})
        })
        // city[0].forEach(ele => {
        //   sub.push(ele.text)
        // })
        city.unshift([{text: "全部", id: ""}])
        province.unshift('全部')
        this.setState({
          province: [province, ['全部']],
          city,
          cityVal: city[0][0].text,
          cityCode: city[0][0].id,
          classfyData: res.data.data
        })
      }
    })
  }

  componentWillMount() {
    let citys = Taro.getStorageSync('city') && JSON.parse(Taro.getStorageSync('city'))
    if (this.props.datas) {
      this.getClassfy()

    } else {
      this.getAreaZone()

      this.setState({
        cityVal: get('City') ? get('City') : (citys ? citys.citys : ''),
        cityCode: get('CityCode') ? get('CityCode') : (citys ? citys.cityCode : ''),
      })
    }


  }

  columnchange = (e) => {
    const { city, province, multiIndex } = this.state

    if (this.props.datas) {
      switch (e.detail.column){
        case 0:
          let citys = []
          city[e.detail.value].forEach(ele => {
            citys.push(ele.text)
          })
          let data = province
          let arr = multiIndex
          data[1] = citys
          arr[0] = e.detail.value
          arr[1] = 0

          this.setState({
            province: data,
            multiIndex: arr,
            flag: true,
            selCity: city[e.detail.value]
          })
      }
    } else {
      switch (e.detail.column){
        case 0:
          let citys = []
          city[e.detail.value].forEach(ele => {
            citys.push(ele.AreaName)
          })
          let data = province
          let arr = multiIndex
          data[1] = citys
          arr[0] = e.detail.value
          arr[1] = 0
          this.setState({
            province: data,
            multiIndex: arr,
            flag: true,
            selCity: city[e.detail.value]
          })
      }
    }

  }

  componentDidUpdate(props) {
    this.setState({
      value: props.value
    })
  }

  /**
   * 改变了地址，全局都要改变定位地址
   *  set('City')   在全局保存城市
   *  set('CityCode')   在全局保存城市的code
   */
  // 省市选择
  picker = (e) => {
    const { multiIndex, province, flag, selCity, classfyData } = this.state
    let arr = multiIndex
    arr[1] = e.detail.value[1]
    arr[0] = e.detail.value[0]
    if (this.props.datas) {
      let ParkingTraitType = '', ParkingTypeId

      classfyData.forEach(ele => {
        if (ele.text === province[0][arr[0]]) {
          ParkingTraitType = ele.id
        }
      })
      selCity.forEach(ele => {
        if (ele.text === province[1][arr[1]]) {
          this.setState({
            cityCode: ele.id,
            value: ''
          })
          ParkingTypeId = ele.id
        }
      })
      this.setState({
        cityVal: province[1][arr[1]] == '全部' ? `${province[0][arr[0]]}` : `${province[0][arr[0]]}-${province[1][arr[1]]}`,
        iconCity: 'chevron-down',
        ParkingTraitType,
      })
      this.props.changeCity(ParkingTraitType, ParkingTypeId)

    } else {
      set('City', province[1][arr[1]])
      this.setState({
        cityVal: province[1][arr[1]],
        iconCity: 'chevron-down'
      })
      if (flag) {
        selCity.forEach(ele => {
          if (ele.AreaName === province[1][arr[1]]) {
            this.setState({
              cityCode: ele.AreaCode,
              value: ''
            })
            set('CityCode', ele.AreaCode)
            this.props.changeCity(ele.AreaCode)
          }
        })
        
      } else {
        this.setState({
          cityCode: '110100',
          value: ''
        })
        this.props.changeCity('110100')
      }
    }


    
  }

  // 触发搜索按钮事件
  onActionClick = () => {
    const { cityCode, value, ParkingTraitType } = this.state
    this.props.onActionClick(value, cityCode, ParkingTraitType)
  }

  onChange = (value) => {
    this.setState({
      value
    })

    this.props.getValue(value)
  }

  render() {
    const { value, multiIndex, province, cityVal, iconCity } = this.state;

    return (
      <View className='search_'>
        <View>
          <Picker 
            mode='multiSelector'
            onCancel={() => this.setState({iconCity: 'chevron-down'})}
            value={multiIndex} 
            range={province} 
            oncolumnchange={this.columnchange}
            onChange={this.picker}
            onClick={() => this.setState({iconCity: 'chevron-up'})}
          >
            <View class='city_x'>
              <Text>{ cityVal }</Text>
              <AtIcon value={iconCity} size='18' color='#AEAEAE'></AtIcon>
            </View>
          </Picker>
        </View>
        <View>
          <AtSearchBar
            // showActionButton
            onActionClick={this.onActionClick}
            onConfirm={this.onActionClick}
            value={value}
            onChange={this.onChange}
            onFocus={this.props.onFocus}
          />
        </View>

      </View>
    );
  }
}
// Search.propTypes = {
//   isFocus: PropTypes.bool, //是否自动获取焦点
//   theme: PropTypes.string, //选择块级显示还是圆形显示
//   showWant: PropTypes.bool, //是否展示推荐菜单
//   hotList: PropTypes.array, //推荐列表数据
//   isImageSearch: PropTypes.bool, //是否有上传图片搜索
//   params: PropTypes.any
// };
// Search.defaultProps = {
//   isFocus: true,
//   theme: "block",
//   showWant: false,
//   hotList: [],
//   isImageSearch: false,
//   params: {
//     selVal: "",
//     selId: "",
//     searchText: ""
//   }
// };
