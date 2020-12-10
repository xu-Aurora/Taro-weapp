import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text, Picker, Image } from "@tarojs/components";
import { AtIcon, AtActionSheet, AtActionSheetItem, AtModal } from "taro-ui";
import ListView from "taro-listview";
import Header from "../../../../components/header/header";
import { imgUrl } from "../../../../utils/util";
import List from "../../components/list/index";
import { get, set } from "../../../../global_data";
import api from "../../../../api/api";
import "./index.scss";

let timeout = null;
let citys = Taro.getStorageSync("city");

export default class Index extends PureComponent {
  config = {
    navigationStyle: "custom"
  };

  constructor() {
    super(...arguments);
    this.state = {
      navType: "back",
      title: "发布",
      num: "issue_home",
      iconCity: "chevron-down",
      iconIssue: "chevron-down",
      city: [], //市
      province: [], //省
      cityVal: "", //选择数据展示的值
      selCity: [],
      multiIndex: [0, 0],
      flag: false, //用来判断是否用滑动选择省市
      isOpened: false,
      isOpened1: false,
      datas: [],

      hasMore: true,
      page: 1,
      rows: 10
    };
  }

  //省市选择
  picker(e) {
    let arr = this.state.multiIndex;
    arr[0] = e.detail.value[0];
    arr[1] = e.detail.value[1];
    set("City", this.state.province[1][arr[1]]);
    this.setState({
      cityVal: this.state.province[1][arr[1]],
      iconCity: "chevron-down"
    });
    if (this.state.flag) {
      this.state.selCity.forEach(ele => {
        if (ele.AreaName === this.state.province[1][arr[1]]) {
          set("CityCode", ele.AreaCode);
          this.getLists({
            CityName: ele.AreaCode
          });
        }
      });
    } else {
      set("CityCode", "110100");
    }
  }
  columnchange(e) {
    switch (e.detail.column) {
      case 0:
        let city = [];
        this.state.city[e.detail.value].forEach(ele => {
          city.push(ele.AreaName);
        });
        let data = this.state.province;
        let arr = this.state.multiIndex;
        data[1] = city;
        arr[0] = e.detail.value;
        arr[1] = 0;
        this.setState({
          province: data,
          multiIndex: arr,
          flag: true,
          selCity: this.state.city[e.detail.value]
        });
    }
  }

  //获取省市数据
  getAreaZone() {
    api
      .areaZone({
        existLoading: true
      })
      .then(res => {
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

  goPage(type, num) {
    this.$preload({
      title: type,
      num
    });
    Taro.navigateTo({
      url: "../release/index"
    });
  }

  //跳转新增页面
  handleItem(type, num) {
    this.setState({
      iconIssue: "chevron-down",
      isOpened: false
    });
    if (!Taro.getStorageSync("userInfo")) {
      this.setState({
        isOpened1: true
      });
    } else {
      this.$preload({
        type,
        num
      });
      Taro.navigateTo({
        url: "../add/index"
      });
    }
  }

  //获取列表数据
  getLists(params, Page = 1, Rows = 10) {
    Taro.showLoading({ title: "loading...", mask: true });
    api
      .postList({
        Token: Taro.getStorageSync("userInfo")
          ? JSON.parse(Taro.getStorageSync("userInfo")).token
          : "",
        LoginMark: Taro.getStorageSync("uuid"),
        Page,
        Rows,
        CityName: params.CityName
      })
      .then(res => {
        if (res.data.code === 200) {
          const { rows } = res.data.data;
          this.setState({
            datas: Page > 1 ? datas.concat(rows) : rows,
            page: Page,
            rows: Rows,
            hasMore:
              Page > 1
                ? rows.length > 0
                  ? true
                  : false
                : rows.length > 3
                ? true
                : false
          });
        }
      });
  }

  componentWillMount() {
    this.setState({
      cityVal: get("City") ? get("City") : JSON.parse(citys).citys
    });

    this.getLists({
      CityName: get("CityCode") ? get("CityCode") : JSON.parse(citys).cityCode
    });
    this.getAreaZone();
  }

  // 上拉
  onPullDownRefresh = () => {
    const { cityCode, page, rows } = this.state;
    this.getLists(
      {
        CityName: cityCode
      },
      page,
      rows
    );
  };

  // 下拉
  onScrollToLower = () => {
    const { cityCode, page, rows } = this.state;
    this.getLists(
      {
        CityName: cityCode
      },
      page + 1,
      rows + 10
    );
  };

  render() {
    const {
      datas,
      num,
      title,
      navType,
      cityVal,
      iconCity,
      multiIndex,
      province,
      hasMore
    } = this.state;
    const titleHeight = get("titleHeight");
    const surHeight = get("titleHeight1") + 465;
    const bgImg = {
      background: `url(${imgUrl}pic_bgfabu.png)`,
      backgroundSize: "100% 100%"
    };
    return (
      <View className="issue_home">
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View
          className="boxs"
          style={{
            marginTop: titleHeight,
            minHeight: `calc(100vh - ${titleHeight})`
          }}
        >
          <View className="title">
            <View onClick={() => this.setState({ iconCity: "chevron-up" })}>
              <Picker
                mode="multiSelector"
                onCancel={() => this.setState({ iconCity: "chevron-down" })}
                value={multiIndex}
                range={province}
                oncolumnchange={this.columnchange.bind(this)}
                onChange={this.picker.bind(this)}
              >
                <View>
                  <Text className="mar_r">{cityVal}</Text>
                  <AtIcon value={iconCity} size="21" color="#AEAEAE"></AtIcon>
                </View>
              </Picker>
            </View>
            <View>
              <Text
                className="mar_r"
                onClick={() => {
                  this.setState({ iconIssue: "chevron-up", isOpened: true });
                }}
              >
                免费发布
              </Text>
              <AtIcon
                value={this.state.iconIssue}
                size="21"
                color="#AEAEAE"
              ></AtIcon>
            </View>
          </View>

          <View className="content">
            <View className="header">
              <View style={bgImg}>
                <View onClick={this.goPage.bind(this, "资产求购", 1)}>
                  <View className="hor_center">
                    <Image src={`${imgUrl}icon_buy.png`} />
                  </View>
                  <View className="hor_center">资产求购</View>
                </View>
                <View onClick={this.goPage.bind(this, "资产求租", 2)}>
                  <View className="hor_center">
                    <Image src={`${imgUrl}icon_demand.png`} />
                  </View>
                  <View className="hor_center">资产求租</View>
                </View>
                <View onClick={this.goPage.bind(this, "资产出租", 3)}>
                  <View className="hor_center">
                    <Image src={`${imgUrl}icon_rent.png`} />
                  </View>
                  <View className="hor_center">资产出租</View>
                </View>
              </View>
            </View>

            <ListView
              hasMore={hasMore}
              isEmpty={datas.length > 0 ? false : true}
              emptyText="暂无数据"
              distanceToRefresh={50}
              damping={80}
              footerLoadedText="加载中..."
              footerLoadedText="没有更多了"
              style={{ height: `calc(100vh - ${surHeight}rpx)` }}
              onScrollToLower={this.onScrollToLower} // 下拉
              onPullDownRefresh={this.onPullDownRefresh} // 上拉
            >
              <List onDatas={datas} />
            </ListView>
          </View>
        </View>

        <AtActionSheet
          isOpened={this.state.isOpened}
          onCancel={() => this.setState({ isOpened: false })}
          onClose={() =>
            this.setState({ isOpened: false, iconIssue: "chevron-down" })
          }
          cancelText="取消"
        >
          <AtActionSheetItem
            onClick={this.handleItem.bind(this, "资产求购", 1)}
          >
            资产求购发布
          </AtActionSheetItem>
          <AtActionSheetItem
            onClick={this.handleItem.bind(this, "资产求租", 2)}
          >
            资产求租发布
          </AtActionSheetItem>
          <AtActionSheetItem
            onClick={this.handleItem.bind(this, "资产出租", 3)}
          >
            资产出租发布
          </AtActionSheetItem>
        </AtActionSheet>

        <AtModal
          isOpened={this.state.isOpened1}
          cancelText="取消"
          confirmText="去登陆"
          onCancel={() => this.setState({ isOpened1: false })}
          onClose={() => this.setState({ isOpened1: false })}
          onConfirm={() => {
            Taro.redirectTo({
              url: "../../../login/index"
            });
          }}
          content="您还未登录，请先登录后进行发布"
        />
      </View>
    );
  }
}
