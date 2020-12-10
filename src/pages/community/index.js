import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text, Picker, Image } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import ListView from "taro-listview";
import Search from "@/components/Search";
import { get, toast } from "../../global_data";
import { imgUrl } from "../../utils/util";
import api from "../../api/api";
import "./index.scss";

export default class Index extends PureComponent {
  config = {
    navigationBarTitleText: "仓储"
  };

  constructor() {
    super(...arguments);
    this.state = {
      // iconCity: 'chevron-down',
      iconArea: "chevron-down",
      iconPrice: "chevron-down",
      iconBus: "chevron-down",
      iconType: "chevron-down",
      selArea: [], //区
      areaCode: [], //区的code数据
      areaCode1: "", //用来储存选中的区code
      selAreaVal: "区域",
      selBus: [], //商圈
      susCode: [], //商圈code数据
      susCode1: [], //用来储存选中的商圈的code
      selBusVal: "商圈",
      selPrice: ["价格", "1万以下", "1-5万", "5-20万", "20-50万", "50万以上"],
      priceCode: [
        "0",
        "-10000",
        "10000-50000",
        "50000-200000",
        "200000-500000",
        "500000-"
      ],
      priceCode1: "",
      selPriceVal: "价格",
      selType: [], //楼盘类型
      typeCode: [], //楼盘code数据
      typeCode1: "", //用来储存选中的楼盘类型的code
      selTypeVal: "楼盘类型",
      city: [], //市
      cityCode: "",
      province: [], //省
      cityVal: "", //选择数据展示的值
      selCity: [],
      multiIndex: [0, 0],
      buildingsData: [], //仓储列表
      display: "none",
      circleLength: "",
      hList: Taro.getStorageSync("search_cache")
        ? Taro.getStorageSync("search_cache")
        : [],

      searchText: "",
      flag: false, // 用来判断展示列表还是搜索记录
      hotList: [],

      hasMore: true,
      page: 1,
      rows: 10
    };
  }

  /**
   *
   * @param {*} value 搜索框的值
   * @param {*} cityCode 城市code
   */
  onActionClick = (value, cityCode) => {
    const { priceCode1, susCode1, tareaCode1, typeCode1 } = this.state;

    this.setState({
      flag: false
    });
    this.getDatas({
      CityCode: cityCode, // 市code
      BuildTraitTypes: typeCode1, // 楼盘类型code
      DistrictCode: tareaCode1, // 区code
      CircleIds: susCode1, // 商圈id
      Price: priceCode1, // 资产价格值
      KeyWord: value
    });
    this.setStorage();
  };

  initGetDatas(cityCode) {
    this.setState({
      selBusVal: "商圈",
      selAreaVal: "区域",
      selPriceVal: "价格",
      selTypeVal: "楼盘类型",
      areaCode1: "",
      susCode1: "",
      priceCode1: "",
      typeCode1: "",
      cityCode,
      flag: false
    });

    this.getDatas({
      CityCode: cityCode,
      CircleIds: "",
      DistrictCode: "", // 区code
      BuildTraitTypes: "", // 商圈类型code
      Price: "", // 资产价格值
      KeyWord: this.state.searchText
    });

    this.getArea({
      CityCode: cityCode
    });
  }

  delhistory = () => {
    //  清空历史记录
    this.setState({
      hList: []
    });
    Taro.setStorage({
      key: "search_cache",
      data: []
    });
  };

  setStorage() {
    const { searchText } = this.state;
    Taro.getStorage({
      key: "search_cache",
      success: res => {
        let list = res.data;
        if (list.length > 5) {
          for (let item of list) {
            if (item == searchText) {
              return;
            }
          }
          list.pop();
          list.unshift(searchText);
        } else {
          for (let item of list) {
            if (item == searchText) {
              return;
            }
          }
          list.unshift(searchText);
        }
        this.setState({
          hList: list
        });
        // hList = list
        Taro.setStorage({
          key: "search_cache",
          data: list
        });
      },
      fail: err => {
        this.setState({
          hList: [searchText]
        });
        // hList = []
        // hList.push(searchText);
        Taro.setStorage({
          key: "search_cache",
          data: [searchText]
        });
      }
    });
  }

  keywordsClick = item => {
    // 关键词搜索与历史搜索
    this.setState(
      {
        searchText: item,
        flag: false
      },
      () => {
        this.setStorage();
      }
    );
    const {
      cityCode,
      typeCode1,
      tareaCode1,
      susCode1,
      priceCode1
    } = this.state;
    this.getDatas({
      CityCode: cityCode, // 市code
      BuildTraitTypes: typeCode1, // 楼盘类型code
      DistrictCode: tareaCode1, // 区code
      CircleIds: susCode1, // 商圈id
      Price: priceCode1, // 资产价格值
      KeyWord: item
    });
  };

  changeIcon(type) {
    if (type === "bus") {
      this.setState({
        iconBus: "chevron-up"
      });
    } else if (type === "area") {
      this.setState({
        iconArea: "chevron-up"
      });
    } else if (type === "type") {
      this.setState({
        iconType: "chevron-up"
      });
    } else {
      this.setState({
        iconPrice: "chevron-up"
      });
    }
  }

  cancel(type) {
    if (type === "city") {
      this.setState({
        iconCity: "chevron-down"
      });
    } else if (type === "bus") {
      this.setState({
        iconBus: "chevron-down"
      });
    } else if (type === "area") {
      this.setState({
        iconArea: "chevron-down"
      });
    } else if (type === "type") {
      this.setState({
        iconType: "chevron-down"
      });
    } else {
      this.setState({
        iconPrice: "chevron-down"
      });
    }
  }

  // nav选择
  navChange(type, e) {
    this.setState({
      display: "none"
    });
    const {
      selArea,
      searchText,
      tareaCode1,
      priceCode,
      typeCode,
      selType,
      selPrice,
      areaCode,
      cityCode,
      susCode1,
      typeCode1,
      priceCode1,
      selBus,
      susCode,
      areaCode1
    } = this.state;

    if (type === "area") {
      this.setState({
        selAreaVal: selArea[e.detail.value],
        iconArea: "chevron-down",
        areaCode1: areaCode[e.detail.value] == 0 ? "" : areaCode[e.detail.value]
      });
      this.getDatas({
        CityCode: cityCode, //市code
        DistrictCode:
          areaCode[e.detail.value] == 0 ? "" : areaCode[e.detail.value], //区code
        CircleIds: susCode1, //商圈id
        BuildTraitTypes: typeCode1, //商圈类型code
        Price: priceCode1, //资产价格值
        KeyWord: searchText
      });
    } else if (type === "bus") {
      this.setState({
        selBusVal: selBus[e.detail.value].slice(0, 4),
        iconBus: "chevron-down",
        susCode1: susCode[e.detail.value] == 0 ? "" : susCode[e.detail.value]
      });
      this.getDatas({
        CityCode: cityCode, //市code
        CircleIds: susCode[e.detail.value] == 0 ? "" : susCode[e.detail.value], //商圈id
        DistrictCode: areaCode1, //区code
        BuildTraitTypes: typeCode1, //商圈类型code
        Price: priceCode1, //资产价格值
        KeyWord: searchText
      });
    } else if (type === "price") {
      this.setState({
        selPriceVal: selPrice[e.detail.value],
        iconPrice: "chevron-down",
        priceCode1:
          priceCode[e.detail.value] == 0 ? "" : priceCode[e.detail.value]
      });
      this.getDatas({
        CityCode: cityCode, //市code
        Price: priceCode[e.detail.value] == 0 ? "" : priceCode[e.detail.value], //资产价格值
        DistrictCode: areaCode1, //区code
        BuildTraitTypes: typeCode1, //商圈类型code
        CircleIds: susCode1, //商圈id
        KeyWord: searchText
      });
    } else {
      this.setState({
        selTypeVal: selType[e.detail.value],
        iconType: "chevron-down",
        typeCode1: typeCode[e.detail.value] == 0 ? "" : typeCode[e.detail.value]
      });

      this.getDatas({
        CityCode: cityCode, //市code
        BuildTraitTypes:
          typeCode[e.detail.value] == 0 ? "" : typeCode[e.detail.value], //楼盘类型code
        DistrictCode: tareaCode1, //区code
        CircleIds: susCode1, //商圈id
        Price: priceCode1, //资产价格值
        KeyWord: searchText
      });
    }
  }
  // 跳转到详情
  goDetail(BuildingId) {
    this.$preload({
      BuildingId
    });
    Taro.navigateTo({
      url: `../comm_derail/index`
    });
  }

  // 获取商圈列表
  getCircle() {
    api
      .circle({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: Taro.getStorageSync("userInfo")
          ? JSON.parse(Taro.getStorageSync("userInfo")).token
          : "",
        existLoading: true
      })
      .then(res => {
        if (res.data.code === 200) {
          let datas = ["商圈"];
          let code = ["0"];
          res.data.data.forEach(ele => {
            if (Taro.getStorageSync("userInfo")) {
              if (ele.IfInsert >= 1) {
                datas.push(ele.CircleName);
                code.push(ele.CircleId);
              }
            } else {
              datas.push(ele.CircleName);
              code.push(ele.CircleId);
            }
          });
          this.setState(
            {
              selBus: datas,
              susCode: code,
              circleLength: res.data.data.length
            },
            () => {
              this.setState({
                selBusVal:
                  this.$router.preload.CircleName &&
                  this.$router.preload.CircleName.slice(0, 4)
              });
            }
          );
        }
      });
  }
  // 获取楼盘类型
  getBuildType() {
    api
      .buildTraitType({
        data: "BuildTraitType",
        existLoading: true
      })
      .then(res => {
        if (res.data.code === 200) {
          let datas = ["楼盘类型"];
          let code = ["0"];
          res.data.data.forEach(ele => {
            datas.push(ele.F_ItemName.slice(0, 4));
            code.push(ele.F_ItemValue);
          });
          this.setState({
            selType: datas,
            typeCode: code
          });
        }
      });
  }

  // 获取省市数据
  getAreaZone() {
    api.areaZone().then(res => {
      if (res.data.code === 200) {
        let province = [];
        let city = [];
        res.data.data.forEach(ele => {
          province.push(ele.AreaName);
          city.push(ele.SubsetList);
        });
        this.setState({
          province: [province, ["北京"]],
          city
        });
      }
    });
  }
  // 获取区的数据
  getArea(params) {
    api.areaZone(params).then(res => {
      if (res.data.code === 200) {
        let code = ["0"];
        let arr1 = ["区域"];
        res.data.data.forEach(ele => {
          code.push(ele.AreaCode);
          arr1.push(ele.AreaName);
        });
        this.setState({
          areaCode: code,
          selArea: arr1
        });
      }
    });
  }

  getDatas(params, Page = 1, Rows = 10) {
    const { buildingsData } = this.state;
    api
      .buildings({
        Token: Taro.getStorageSync("userInfo")
          ? JSON.parse(Taro.getStorageSync("userInfo")).token
          : "",
        LoginMark: Taro.getStorageSync("uuid"),
        Page,
        Rows,
        CityCode: params.CityCode, // 市code
        DistrictCode: params.DistrictCode, // 区code
        CircleIds: params.CircleIds, // 商圈id
        BuildTraitTypes: params.BuildTraitTypes, // 商圈类型code
        Price: params.Price, // 资产价格值
        KeyWord: params.KeyWord, // 输入框
        existLoading: params.existLoading
      })
      .then(res => {
        if (res.data.code === 200) {
          const { rows } = res.data.data;
          this.setState({
            buildingsData: Page > 1 ? buildingsData.concat(rows) : rows,
            page: Page,
            rows: Rows,
            hasMore: rows.length < 10 ? false : true
          });
        }
      });
  }

  // 上拉
  onPullDownRefresh = () => {
    const {
      cityCode,
      susCode1,
      areaCode1,
      typeCode1,
      priceCode1,
      seatchVal,
      page,
      rows
    } = this.state;
    this.getDatas(
      {
        CityCode: cityCode,
        CircleIds: susCode1,
        DistrictCode: areaCode1, // 区code
        BuildTraitTypes: typeCode1, // 商圈类型code
        Price: priceCode1, // 车位价格值
        KeyWord: seatchVal // 输入框
      },
      page,
      rows
    );
  };

  // 下拉
  onScrollToLower = () => {
    const {
      cityCode,
      susCode1,
      areaCode1,
      typeCode1,
      priceCode1,
      seatchVal,
      page,
      rows
    } = this.state;
    this.getDatas(
      {
        CityCode: cityCode,
        CircleIds: susCode1,
        DistrictCode: areaCode1, // 区code
        BuildTraitTypes: typeCode1, // 商圈类型code
        Price: priceCode1, // 车位价格值
        KeyWord: seatchVal // 输入框
      },
      page + 1,
      rows + 10
    );
  };

  getHotSearch() {
    api.getHotSearch().then(res => {
      if (res.data.code === 200) {
        this.setState({
          hotList: res.data.data
        });
      }
    });
  }

  componentWillMount() {
    let citys =
      Taro.getStorageSync("city") && JSON.parse(Taro.getStorageSync("city"));
    let uuid = Taro.getStorageSync("uuid");
    let userInfo = Taro.getStorageSync("userInfo");

    this.setState({
      cityVal: get("City") ? get("City") : citys ? citys.citys : "",
      cityCode: get("CityCode") ? get("CityCode") : citys ? citys.cityCode : "",
      uuid,
      userInfo
    });
    let params = {
      CityCode: get("CityCode") ? get("CityCode") : citys ? citys.cityCode : "",
      CircleIds: this.$router.preload.CircleId
        ? this.$router.preload.CircleId
        : "",
      DistrictCode: this.state.areaCode1, // 区code
      BuildTraitTypes: this.state.typeCode1, // 商圈类型code
      Price: this.state.priceCode1, // 资产价格值
      KeyWord: this.state.searchText, // 输入框
      existLoading: true
    };
    this.getHotSearch();
    const asyncHttp = async () => {
      await this.getAreaZone();
      await this.getArea(params);
      await this.getCircle();
      await this.getBuildType();
      await this.getDatas(params);
    };
    asyncHttp();
  }

  render() {
    const {
      buildingsData,
      selBus,
      selBusVal,
      iconBus,
      selArea,
      selAreaVal,
      iconArea,
      hotList,
      searchText,
      flag,
      hList,
      hasMore
    } = this.state;
    const house_default = `${imgUrl}house_default.png`;
    const surHeight = get("titleHeight1") + 140;

    return (
      <View className="community">
        <View>
          <View className="search_x">
            <Search
              onActionClick={this.onActionClick}
              getValue={searchText => this.setState({ searchText })}
              changeCity={this.initGetDatas.bind(this)}
              value={searchText}
              onFocus={() => this.setState({ flag: true })}
              datas={""}
            />
          </View>
        </View>

        {flag ? (
          <View
            className="search_history"
            style={{ height: `calc(100vh - 44px)` }}
          >
            {hList.length > 0 ? (
              <View className={"s-circle"}>
                <View className="header">
                  历史记录
                  <Image
                    src={require("@/assets/images/delete.svg")}
                    mode="aspectFit"
                    onClick={this.delhistory}
                  ></Image>
                </View>
                <View className="list">
                  {hList.map((item, index) => {
                    return (
                      <View
                        key={index}
                        onClick={this.keywordsClick.bind(this, item)}
                      >
                        {item}
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
            <View className={"wanted-circle"}>
              <View className="header">猜你想搜的</View>
              <View className="list">
                {hotList.map((item, index) => {
                  return (
                    <View
                      key={index}
                      onClick={this.keywordsClick.bind(this, item)}
                    >
                      {item}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          <View>
            <View className="top_search" style={{ paddingTop: "6px" }}>
              <View className="nav_select">
                <View onClick={this.changeIcon.bind(this, "area")}>
                  <Picker
                    mode="selector"
                    onCancel={this.cancel.bind(this, "area")}
                    range={selArea}
                    onChange={this.navChange.bind(this, "area")}
                    value={selAreaVal}
                  >
                    <View className="picker">
                      <Text decode>{selAreaVal}&nbsp;</Text>
                      <AtIcon
                        value={iconArea}
                        size="18"
                        color="#AEAEAE"
                      ></AtIcon>
                    </View>
                  </Picker>
                </View>
                <View onClick={this.changeIcon.bind(this, "bus")}>
                  <Picker
                    mode="selector"
                    onCancel={this.cancel.bind(this, "bus")}
                    range={selBus}
                    onChange={this.navChange.bind(this, "bus")}
                    value={selBusVal}
                  >
                    <View className="picker">
                      <Text decode>{selBusVal}&nbsp;</Text>
                      <AtIcon
                        value={iconBus}
                        size="18"
                        color="#AEAEAE"
                      ></AtIcon>
                    </View>
                  </Picker>
                </View>
              </View>
            </View>

            <ListView
              hasMore={hasMore}
              isEmpty={buildingsData.length > 0 ? false : true}
              emptyText="暂无数据"
              distanceToRefresh={50}
              damping={80}
              footerLoadedText="加载中..."
              footerLoadedText="没有更多了"
              style={{ height: `calc(100vh - ${surHeight}rpx)` }}
              onScrollToLower={this.onScrollToLower} // 下拉
              onPullDownRefresh={this.onPullDownRefresh} // 上拉
            >
              {buildingsData.length > 0 &&
                buildingsData.map(ele => {
                  return (
                    <View className="list_" key={ele.BuildingId}>
                      <View
                        className="item"
                        key={ele.BuildingId}
                        onClick={this.goDetail.bind(this, ele.BuildingId)}
                      >
                        <View className="left">
                          <Image src={ele.Imgs ? ele.Imgs[0] : house_default} />
                        </View>
                        <View className="right">
                          <View>{ele.BuildingName}</View>
                          <View>
                            <Text decode>{ele.City}&nbsp;</Text>
                            <Text decode>{ele.District}&nbsp;</Text>
                            {ele.Address}
                          </View>
                          <View>
                            <Text>{ele.CompanyName}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
            </ListView>
          </View>
        )}
      </View>
    );
  }
}
