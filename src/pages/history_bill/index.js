import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text, Picker } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import ListView from "taro-listview";
import { splitThousand } from "../../utils/util";
import Header from "../../components/header/header";
import { get, toast } from "../../global_data";
import api from "../../api/api";
import "./index.scss";

export default class Index extends PureComponent {
  config = {
    navigationStyle: "custom"
  };

  constructor() {
    this.state = {
      num: 1,
      navType: "backHome",
      title: "历史账单",
      iconDate: "chevron-down",
      startDate: "开始日期", //开始日期
      startTime: "", //开始日期,时间戳
      endtDate: "结束日期", //结束日期
      datas: [],
      display: "none",

      hasMore: true,
      page: 1,
      rows: 10
    };
  }

  changeIcon(type) {
    if (type === "type") {
      // this.setState({
      //   iconType: 'chevron-up'
      // })
    } else if (type === "date") {
      this.setState({
        iconDate: "chevron-up"
      });
    }
  }
  cancel(type) {
    if (type === "type") {
      // this.setState({
      //   iconType: 'chevron-down'
      // })
    } else if (type === "date") {
      this.setState({
        iconDate: "chevron-down"
      });
    }
  }

  navChange(type, e) {
    if (type === "type") {
      // this.setState({
      //   selVal: this.state.selType[e.detail.value],
      //   iconType: 'chevron-down',
      //   typeVal: this.state.selKey[e.detail.value]
      // })
      // this.getData({
      //   CircleId: this.$router.preload.CircleId,
      //   Type: this.state.selKey[e.detail.value],
      //   startDate: this.state.startDate,
      //   endtDate: this.state.endtDate
      // })
    } else if (type === "startDate") {
      this.setState({
        startDate: e.detail.value,
        startTime: new Date(e.detail.value).getTime(),
        iconDate: "chevron-down"
      });
      this.getData({
        CircleId: this.$router.preload ? this.$router.preload.CircleId : "",
        StartTime: e.detail.value,
        EndTime: this.state.endtDate === "结束日期" ? "" : this.state.endtDate
      });
    } else if (type === "endtDate") {
      if (this.state.startTime > new Date(e.detail.value).getTime()) {
        toast("开始日期不能大于结束日期", "none", 3000);
        return;
      }
      this.setState({
        endtDate: e.detail.value,
        iconDate: "chevron-down"
      });

      this.getData({
        CircleId: this.$router.preload ? this.$router.preload.CircleId : "",
        StartTime:
          this.state.startDate === "开始日期" ? "" : this.state.startDate,
        EndTime: e.detail.value
      });
    }
  }
  //获取当前的年月日
  date1() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let dates = `${year}-${month}-${day}`;
    return dates;
  }

  getData(params, Page = 1, Rows = 10) {
    api
      .historyBill({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        data: JSON.stringify({
          Page,
          Rows,
          StartTime: params.StartTime,
          EndTime: params.EndTime,
          CircleId: params.CircleId
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

  type(val) {
    let text;
    if (val == 1) {
      text = "购买";
    } else if (val == 2) {
      text = "转让";
    } else if (val == 3) {
      text = "回购";
    } else if (val == 4) {
      text = "提现";
    } else if (val == 5) {
      text = "还款";
    } else if (val == 6) {
      text = "充值";
    }
    return text;
  }

  componentWillMount() {
    let params = {
      StartTime:
        this.state.startDate === "开始日期" ? "" : this.state.startDate,
      EndTime: this.state.endDate === "结束日期" ? "" : this.state.endDate,
      CircleId: this.$router.preload ? this.$router.preload.CircleId : ""
    };
    this.getData(params);
  }

  // 上拉
  onPullDownRefresh = () => {
    const { startDate, endDate, page, rows } = this.state;
    this.getData(
      {
        StartTime: startDate === "开始日期" ? "" : startDate,
        EndTime: endDate === "结束日期" ? "" : endDate,
        CircleId: this.$router.preload ? this.$router.preload.CircleId : ""
      },
      page,
      rows
    );
  };

  // 下拉
  onScrollToLower = () => {
    const { startDate, endDate, page, rows } = this.state;
    this.getData(
      {
        StartTime: startDate === "开始日期" ? "" : startDate,
        EndTime: endDate === "结束日期" ? "" : endDate,
        CircleId: this.$router.preload ? this.$router.preload.CircleId : ""
      },
      page + 1,
      rows + 10
    );
  };

  render() {
    const {
      num,
      title,
      datas,
      navType,
      startDate,
      endtDate,
      iconDate,
      hasMore
    } = this.state;
    const titleHeight = get("titleHeight");
    const surHeight = get("titleHeight1") + 190;

    return (
      <View className="boxs">
        <Header onNum={num} onTitle={title} onNavType={navType} />

        <View
          className="history_bill"
          style={{
            marginTop: titleHeight,
            minHeight: `calc(100vh - ${titleHeight})`
          }}
        >
          <View className="title">
            <View onClick={this.changeIcon.bind(this, "type")}>
              {/* <Picker 
                mode='selector' 
                onCancel={this.cancel.bind(this,'type')}
                range={this.state.selType} 
                onChange={this.navChange.bind(this,'type')}
              >
                <View className='picker'>
                  <Text decode>{this.state.selVal}&nbsp;</Text>
                  <AtIcon value={this.state.iconType} size='21' color='#AEAEAE'></AtIcon>
                </View>
              </Picker> */}
            </View>
            <View onClick={this.changeIcon.bind(this, "date")}>
              <Picker
                mode="date"
                end={this.date1()}
                onCancel={this.cancel.bind(this, "date")}
                onChange={this.navChange.bind(this, "startDate")}
              >
                <View className="picker">
                  <Text decode>{startDate}&nbsp;</Text>
                  {/* <AtIcon value={ this.state.iconDate } size='21' color='#AEAEAE'></AtIcon> */}
                </View>
              </Picker>
              <Text decode>至&nbsp;</Text>
              <Picker
                mode="date"
                onCancel={this.cancel.bind(this, "date")}
                onChange={this.navChange.bind(this, "endtDate")}
              >
                <View className="picker">
                  <Text decode>{endtDate}&nbsp;</Text>
                  <AtIcon value={iconDate} size="21" color="#AEAEAE"></AtIcon>
                </View>
              </Picker>
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
            <View className="list">
              {datas.length > 0 &&
                datas.map(ele => {
                  return (
                    <View className="item" key={ele.OrderCode}>
                      <View>
                        <View>{this.type(ele.Type)}</View>
                        <View
                          style={{
                            color: ele.Description === "支出" ? "" : "#F6724A"
                          }}
                        >
                          {ele.Description === "支出" ? "-" : "+"}
                          {splitThousand(ele.Amt)}
                        </View>
                      </View>
                      <View>{ele.Date}</View>
                    </View>
                  );
                })}
            </View>
          </ListView>
        </View>
      </View>
    );
  }
}
