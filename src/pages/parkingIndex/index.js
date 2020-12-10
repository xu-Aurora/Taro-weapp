import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text, Picker, Image } from "@tarojs/components";
import { AtIcon, AtActionSheet, AtActionSheetItem } from "taro-ui";
import ListView from "taro-listview";
import Header from "@/components/header/header";
import Search from "@/components/Search";
import { get, toast } from "@/global_data";
import { imgUrl, splitThousand, changeNum } from "@/utils/util";
import api from "@/api/api";
import QQMapWX from "@/assets/js/qqmap-wx-jssdk.min";
import "./index.scss";

let qqmapsdk = new QQMapWX({
  key: "L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX"
});

export default class Index extends PureComponent {
  config = {
    navigationStyle: "custom"
  };

  constructor() {
    this.state = {
      num: 1,
      navType: "back",
      title: "",
      sord: "",
      isOpened: false,
      iconCity: "chevron-down",
      iconPrice: "chevron-down",
      iconBus: "chevron-down",
      iconType: "chevron-down",
      selType: ["类别", "凭证", "权证"], // 类别
      typeCode: ["-1", "0", "1"],
      selTypeVal: "类别",
      selBus: [], // 商圈
      susCode: [], // 商圈code数据
      susCode1: [], //用来储存选中的商圈的code
      selBusVal: "商圈",
      selPrice: ["面额", "1万以下", "1-5万", "5-20万", "20-50万", "50万以上"],
      priceCode: [
        "0",
        "-10000",
        "10000-50000",
        "50000-200000",
        "200000-500000",
        "500000-"
      ],
      priceCode1: "",
      selPriceVal: "面额",
      city: [], //市
      cityCode: "",
      province: [], //省
      cityVal: "", //选择数据展示的值
      selCity: [],
      multiIndex: [0, 0],
      parkingData: [], //资产列表
      ParkingLot: "",
      display: "none",
      prePage: "aw",
      ParkingTraitTypes: [],
      ParkingTypeId: "",
      ParkingTraitType: "",
      hasMore: true,

      hList: Taro.getStorageSync("search_cache")
        ? Taro.getStorageSync("search_cache")
        : [],

      searchText: "",
      flag: false, // 用来判断展示列表还是搜索记录
      hotList: [],

      page: 1,
      rows: 10
    };
  }

  // 点击搜索
  onActionClick = value => {
    const { susCode1, ParkingLot, priceCode1, sord } = this.state;
    this.setState({
      flag: false
    });
    this.getDatas({
      ParkingLot: ParkingLot,
      CircleId: susCode1,
      Price: priceCode1, //资产面额值
      KeyWord: value,
      sord: sord
    });
    this.setStorage();
  };

  initGetDatas(ParkingTraitType, ParkingTypeId) {
    let al = {
      selBusVal: "商圈",
      selPriceVal: "面额",
      selTypeVal: "类别",
      iconBus: "chevron-up",
      iconPrice: "chevron-up",
      iconType: "chevron-up",
      priceCode1: "",
      ParkingTypeId,
      ParkingTraitType,
      flag: false
    };
    const req = () => {
      this.getDatas({
        CircleId: "",
        Price: "",
        sord: "",
        KeyWord: this.state.searchText
      });
    };

    if (this.state.prePage == "al") {
      al.ParkingLot = "";
      this.setState(al, req);
    } else if (this.state.prePage == "aw") {
      this.setState(al, req);
    }
  }

  setStorage() {
    const { searchText } = this.state;
    if (searchText !== "") {
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
    const { susCode1, priceCode1, sord } = this.state;
    this.getDatas({
      CircleId: susCode1,
      Price: priceCode1, //资产面额值
      KeyWord: item,
      sord: sord
    });
  };

  changeIcon(type) {
    if (type === "city") {
      this.setState({
        iconCity: "chevron-up"
      });
    } else if (type === "bus") {
      this.setState({
        iconBus: "chevron-up"
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

  // 价格排序
  sort(type) {
    const { searchText, priceCode1, susCode1 } = this.state;
    this.setState({
      isOpened: false,
      sord: type
    });
    this.getDatas({
      CircleId: susCode1,
      KeyWord: searchText,
      Price: priceCode1,
      sord: type
    });
  }

  //nav选择
  navChange(type, e) {
    const {
      sord,
      susCode1,
      priceCode1,
      priceCode,
      selBus,
      susCode,
      selPrice,
      searchText,
      typeCode,
      selType
    } = this.state;
    if (type === "bus") {
      this.setState({
        selBusVal: selBus[e.detail.value].slice(0, 4),
        iconBus: "chevron-down",
        susCode1: susCode[e.detail.value] == 0 ? "" : susCode[e.detail.value]
      });
      this.getDatas({
        CircleId: susCode[e.detail.value] == 0 ? "" : susCode[e.detail.value], //商圈id
        Price: priceCode1, //资产面额值
        KeyWord: searchText,
        sord: sord
      });
    } else if (type === "price") {
      this.setState({
        selPriceVal: selPrice[e.detail.value],
        iconPrice: "chevron-down",
        priceCode1:
          priceCode[e.detail.value] == 0 ? "" : priceCode[e.detail.value]
      });
      this.getDatas({
        Price: priceCode[e.detail.value] == 0 ? "" : priceCode[e.detail.value], //资产面额值
        CircleId: susCode1, //商圈id
        KeyWord: searchText,
        sord: sord
      });
    } else if (type === "type") {
      this.setState(
        {
          selTypeVal: selType[e.detail.value],
          iconType: "chevron-down",
          ParkingLot:
            typeCode[e.detail.value] == "-1" ? "" : typeCode[e.detail.value]
        },
        () => {
          this.getDatas({
            Price: priceCode1,
            CircleId: susCode1,
            KeyWord: searchText,
            sord: sord
          });
        }
      );
    }
  }
  //跳转到详情
  goDetail(id) {
    this.$preload({
      id,
      page: "aw"
    });
    Taro.navigateTo({
      url: `../car_detail/index`
    });
  }

  //获取商圈列表
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
          Taro.hideLoading();
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
              susCode: code
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

  getDatas(params, Page = 1, Rows = 10) {
    const {
      ParkingTypeId,
      ParkingTraitType,
      ParkingLot,
      parkingData
    } = this.state;
    api
      .newParking({
        Token: Taro.getStorageSync("userInfo")
          ? JSON.parse(Taro.getStorageSync("userInfo")).token
          : "",
        LoginMark: Taro.getStorageSync("uuid"),
        Page,
        Rows,
        ParkingLot,
        ParkingTypeId,
        ParkingTraitType,
        CircleId: params.CircleId,
        KeyWord: params.KeyWord,
        Price: params.Price,
        sord: params.sord,
        existLoading: params.existLoading
      })
      .then(res => {
        if (res.data.code === 200) {
          const { rows } = res.data.data;
          this.setState({
            parkingData: Page > 1 ? parkingData.concat(rows) : rows,
            page: Page,
            rows: Rows,
            hasMore: rows.length < 10 ? false : true
          });
        }
      });
  }

  //获取省市数据
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

  //返回
  goBack() {
    Taro.navigateBack({
      delta: 1
    });
  }

  // 点击地址跳转到地图页面
  goNavigation(city, e) {
    e.stopPropagation();
    qqmapsdk.geocoder({
      address: city,
      success: function(res) {
        let latitude = res.result.location.lat;
        let longitude = res.result.location.lng;
        Taro.openLocation({
          latitude,
          longitude,
          name: city,
          scale: 18
        });
      }
    });
  }

  getType() {
    api.getClassfy({ data: "wineTpye" }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          ParkingTraitTypes: res.data.data
        });
      }
    });
  }

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

    let params = {
      CircleId: this.state.CircleId,
      Price: this.state.Price,
      KeyWord: this.state.searchText,
      sord: this.state.sord,
      existLoading: true
    };

    const { ParkingLot, page } = this.$router.preload;

    this.getHotSearch();
    const asyncHttp = async () => {
      await this.getType();
      await this.getAreaZone();
      await this.getCircle();
      if (page === "aw") {
        await this.getDatas(params);
      }
    };

    this.setState({
      cityVal: get("City") ? get("City") : citys ? citys.citys : "",
      cityCode: get("CityCode") ? get("CityCode") : citys ? citys.cityCode : "",
      uuid,
      userInfo,
      ParkingLot: ParkingLot,
      title:
        ParkingLot == 0 || ParkingLot == 1
          ? ParkingLot === 0
            ? "在售资产通凭证"
            : "在售资产通权证"
          : "资产通",
      flag: page === "al" ? true : false,
      prePage: page
    });

    asyncHttp();
  }

  type(val) {
    const { ParkingTraitTypes } = this.state;
    let t;
    ParkingTraitTypes.forEach(ele => {
      if (ele.F_ItemValue == val) {
        t = ele.F_ItemName;
      }
    });
    return t;
  }

  // 上拉
  onPullDownRefresh = () => {
    const { sord, susCode1, priceCode1, page, rows } = this.state;
    this.getDatas(
      {
        sord: sord, // 价格排序
        CircleId: susCode1, // 商圈id
        Price: priceCode1 // 资产面额
      },
      page,
      rows
    );
  };

  // 下拉
  onScrollToLower = () => {
    const { sord, susCode1, priceCode1, page, rows } = this.state;
    this.getDatas(
      {
        sord: sord, // 价格排序
        CircleId: susCode1, // 商圈id
        Price: priceCode1 // 资产面额
      },
      page + 1,
      rows + 10
    );
  };

  render() {
    const {
      num,
      navType,
      title,
      parkingData,
      flag,
      selType,
      selTypeVal,
      selPrice,
      selPriceVal,
      iconPrice,
      selBus,
      selBusVal,
      iconBus,
      isOpened,
      iconType,
      searchText,
      prePage,
      hotList,
      hList,
      hasMore
    } = this.state;

    // const house_nodata = `${imgUrl}house_nodata.png`;
    const surHeight = get("titleHeight1") + 260;
    const titleHeight = get("titleHeight");
    return (
      <View className="container">
        <Header onNum={num} onTitle={title} onNavType={navType} />

        <View
          className="community"
          style={{
            marginTop: titleHeight,
            minHeight: `calc(100vh - ${titleHeight})`
          }}
        >
          <View>
            <View className="search_x">
              <Search
                onActionClick={this.onActionClick}
                getValue={searchText => this.setState({ searchText })}
                changeCity={this.initGetDatas.bind(this)}
                value={searchText}
                onFocus={() => this.setState({ flag: true })}
                datas={"classfy"}
              />
            </View>
          </View>

          {flag ? (
            <View
              className="search_history"
              style={{ height: `calc(100vh - 110px)` }}
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
              {hotList.length > 0 ? (
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
              ) : null}
            </View>
          ) : (
            <View>
              <View className="top_search" style={{ paddingTop: "6px" }}>
                <View className="nav_select">
                  {prePage === "al" && (
                    <View onClick={this.changeIcon.bind(this, "type")}>
                      <Picker
                        mode="selector"
                        onCancel={this.cancel.bind(this, "type")}
                        range={selType}
                        onChange={this.navChange.bind(this, "type")}
                        value={selTypeVal}
                      >
                        <View className="picker">
                          <Text decode>{selTypeVal}&nbsp;</Text>
                          <AtIcon
                            value={iconType}
                            size="18"
                            color="#AEAEAE"
                          ></AtIcon>
                        </View>
                      </Picker>
                    </View>
                  )}

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
                  <View onClick={this.changeIcon.bind(this, "price")}>
                    <Picker
                      mode="selector"
                      range={selPrice}
                      onCancel={this.cancel.bind(this, "price")}
                      onChange={this.navChange.bind(this, "price")}
                      value={selPriceVal}
                    >
                      <View className="picker">
                        <Text decode>{selPriceVal}&nbsp;</Text>
                        <AtIcon
                          value={iconPrice}
                          size="18"
                          color="#AEAEAE"
                        ></AtIcon>
                      </View>
                    </Picker>
                  </View>
                  <View
                    onClick={() => this.setState({ isOpened: true })}
                    className="sort"
                  >
                    <Text>价格</Text>
                    <View>
                      <Image src={`${imgUrl}rank.png`} />
                    </View>
                  </View>
                </View>
              </View>

              <ListView
                hasMore={hasMore}
                isEmpty={parkingData.length > 0 ? false : true}
                emptyText="暂无数据"
                distanceToRefresh={50}
                damping={80}
                footerLoadedText="加载中..."
                footerLoadedText="没有更多了"
                style={{ height: `calc(100vh - ${surHeight}rpx)` }}
                onScrollToLower={this.onScrollToLower} // 下拉
                onPullDownRefresh={this.onPullDownRefresh} // 上拉
              >
                {parkingData.length > 0 &&
                  parkingData.map(ele => {
                    return (
                      <View className="list_" key={ele.BuildingId}>
                        <View
                          className="item"
                          key={ele.BuildingId}
                          onClick={this.goDetail.bind(this, ele.ParkingId)}
                        >
                          <View class="left">
                            {ele && ele.BuyBack.Usufruct == 0 ? (
                              <View style={{ color: "#FC7946" }}>
                                <View>
                                  <Text>
                                    {ele.BuyBack.FixedRate &&
                                      ele.BuyBack.FixedRate.toFixed(2)}
                                  </Text>
                                  <Text>%</Text>
                                </View>
                                <View>年化收益率</View>
                              </View>
                            ) : (
                              <View style={{ color: "#5584FF" }}>
                                <View>
                                  <Text>{ele && changeNum(ele.SalePrice)}</Text>
                                  {/* <Text>万</Text> */}
                                </View>
                                <View>
                                  挂牌价
                                  <Text style={{ fontSize: "18rpx" }}>
                                    {" "}
                                    {ele.SalePrice >= 100000
                                      ? "(万元)"
                                      : "(元)"}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>
                          {ele && ele.BuyBack.Usufruct == 0 ? (
                            <View class="right">
                              <View className="overflow1">
                                <Text>品名：{ele.ParkingCode}</Text>
                              </View>
                              <View>所属商圈：{ele.CircleName}</View>
                              {/* <View>所属仓储：{ ele.BuildingName }</View> */}
                              <View className="address">
                                <View className="overflow1">
                                  地址：{ele.Address}
                                </View>
                                <View>
                                  <Image
                                    onClick={this.goNavigation.bind(
                                      this,
                                      ele.Address
                                    )}
                                    src={`${imgUrl}icon_map_l.png`}
                                  />
                                </View>
                              </View>
                              <View>凭证到期日：{ele.LimitDate}</View>
                              <View>
                                面额：{ele && splitThousand(ele.Price)}
                                <Text style={{ fontSize: "18rpx" }}> (元)</Text>
                              </View>
                            </View>
                          ) : (
                            <View class="right">
                              <View>
                                <Text>品名：{ele.ParkingCode}</Text>
                              </View>
                              <View>所属商圈：{ele.CircleName}</View>
                              {/* <View>所属仓储：{ ele.BuildingName }</View> */}
                              <View className="address">
                                <View className="overflow1">
                                  地址：{ele.Address}
                                </View>
                                <View>
                                  <Image
                                    onClick={this.goNavigation.bind(
                                      this,
                                      ele.Address
                                    )}
                                    src={`${imgUrl}icon_map_l.png`}
                                  />
                                </View>
                              </View>
                              <View>
                                类别：{this.type(ele.ParkingTraitType)}
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </ListView>
            </View>
          )}
        </View>

        {/* 点击排序 */}
        <AtActionSheet
          isOpened={isOpened}
          onClose={() => this.setState({ isOpened: false })}
        >
          <AtActionSheetItem onClick={this.sort.bind(this, "asc")}>
            价格由低到高
          </AtActionSheetItem>
          <AtActionSheetItem onClick={this.sort.bind(this, "desc")}>
            价格由高到低
          </AtActionSheetItem>
        </AtActionSheet>
      </View>
    );
  }
}
