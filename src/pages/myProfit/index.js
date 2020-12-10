import Taro, { PureComponent } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import ListView from "taro-listview";
import { imgUrl, splitThousand } from "../../utils/util";
import api from "../../api/api";
import "./index.scss";

export default class Index extends PureComponent {
  config = {
    navigationBarTitleText: "累计收益"
  };

  constructor() {
    this.state = {
      datas: [],
      hasMore: true,
      page: 1,
      rows: 10
    };
  }

  getData(Page = 1, Rows = 10) {
    api
      .myProfit({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        data: JSON.stringify({
          Page,
          Rows,
          CircleId: this.$router.preload ? this.$router.preload.CircleId : ""
        })
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

  goPage(id) {
    this.$preload({
      id,
      page: "al"
    });

    Taro.navigateTo({
      url: "../car_detail/index"
    });
  }

  componentDidShow() {
    this.getData();
  }

  // 上拉
  onPullDownRefresh = () => {
    const { page, rows } = this.state;
    this.getData(page, rows);
  };

  // 下拉
  onScrollToLower = () => {
    const { page, rows } = this.state;
    this.getData(page + 1, rows + 10);
  };

  render() {
    const { datas, hasMore } = this.state;

    return (
      <View className="busArea">
        <ListView
          hasMore={hasMore}
          isEmpty={datas.length > 0 ? false : true}
          emptyText="暂无数据"
          distanceToRefresh={50}
          damping={80}
          footerLoadedText="加载中..."
          footerLoadedText="没有更多了"
          style={{ height: "100vh" }}
          onScrollToLower={this.onScrollToLower} // 下拉
          onPullDownRefresh={this.onPullDownRefresh} // 上拉
        >
          <View className="aw_list">
            {datas.length > 0 &&
              datas.map(ele => {
                return (
                  <View
                    className="list_item2"
                    key={ele.ParkingId}
                    onClick={this.goPage.bind(this, ele.ParkingId)}
                  >
                    <View className="clear list_top">
                      <View className="list_top_title">区块链资产通凭证</View>
                      <View className="list_top_Price">
                        +{splitThousand(ele.ProfitRate)}
                        <Text style={{ fontSize: "24rpx" }}> (元)</Text>
                      </View>
                    </View>
                    <View className="list_center clear">
                      <View className="list_center_title">
                        编号：{ele.ParkingId == null ? "暂无" : ele.ParkingId}
                      </View>
                      <Image
                        className="list_center_img"
                        src={`${imgUrl}arrow_s@2x.png`}
                      />
                    </View>
                    <View className="list_time">
                      <View>{ele.ProfitTime}</View>
                    </View>
                  </View>
                );
              })}
          </View>
        </ListView>
      </View>
    );
  }
}
