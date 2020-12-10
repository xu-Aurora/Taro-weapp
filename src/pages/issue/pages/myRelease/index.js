import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { AtTabs, AtTabsPane } from "taro-ui";
import ListView from "taro-listview";
import Header from "../../../../components/header/header";
import { get } from "../../../../global_data";
import api from "../../../../api/api";
import "./index.scss";

export default class Index extends PureComponent {
  config = {
    navigationStyle: "custom"
  };

  constructor() {
    this.state = {
      back: "myRelease",
      title: "我的发布", //标题
      navType: "backHome",
      sub: true, //用来区分主包还是子包
      current: 0,
      datas: [],

      hasMore: true,
      page: 1,
      rows: 10
    };
  }

  handleClick(value) {
    if (value == 0) {
      this.getData(1); //已发布
    } else if (value == 1) {
      this.getData(0); //草稿
    }
    this.setState({
      current: value
    });
  }
  //跳转详情
  goDetail(PostId) {
    this.$preload({
      PostId
    });
    Taro.navigateTo({
      url: "../detail/index"
    });
  }
  //跳转编辑
  goEdit(PostId) {
    this.$preload({
      PostId
    });
    Taro.navigateTo({
      url: "../edit/index"
    });
  }
  //获取列表数据
  getData(PostState, Page = 1, Rows = 10) {
    Taro.showLoading({ title: "loading...", mask: true });
    api
      .myPostList({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        Page,
        Rows,
        PostState
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
    this.getData(1);
  }

  // 获取更多推荐列表
  getMoreRecList = num => {
    let that = this;
    if (num.currentTarget.dataset.eScrolltolowerAA === 1) {
      that.setState({
        status: "loading",
        display1: "block"
      });
    } else if (num.currentTarget.dataset.eScrolltolowerAA === 2) {
      that.setState({
        status: "loading",
        display2: "block"
      });
    }

    setTimeout(() => {
      if (this.state.current == 0) {
        this.getData1(1, "noMore"); //已发布
      } else if (this.state.current == 1) {
        this.getData1(0, "noMore"); //草稿
      }
    }, 500);
  };

  // 上拉
  onPullDownRefresh = () => {
    const { current, page, rows } = this.state;
    if (current == 0) {
      this.getData(1, page, rows); //已发布
    } else if (current == 1) {
      this.getData(0, page, rows); //草稿
    }
  };

  // 下拉
  onScrollToLower = () => {
    const { current, page, rows } = this.state;
    if (current == 0) {
      this.getData(1, page + 1, rows + 10); //已发布
    } else if (current == 1) {
      this.getData(0, page + 1, rows + 10); //草稿
    }
  };

  render() {
    const { back, sub, title, navType, datas, current, hasMore } = this.state;
    const tabList = [{ title: "已发布" }, { title: "草稿" }];
    const titleHeight = get("titleHeight");
    const surHeight = get("titleHeight1") + 190;

    return (
      <View className="myRelease">
        <Header onNum={back} onSub={sub} onTitle={title} onNavType={navType} />
        <View
          className="contents"
          style={{
            marginTop: titleHeight,
            minHeight: `calc(100vh - ${titleHeight})`
          }}
        >
          <AtTabs
            current={this.state.current}
            tabList={tabList}
            onClick={this.handleClick.bind(this)}
          >
            <AtTabsPane current={current} index={0}>
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
                        <View className="item" key={ele.PostId}>
                          <View
                            className="left"
                            onClick={this.goDetail.bind(this, ele.PostId)}
                          >
                            <View>{ele.Title}</View>
                            <View>
                              <Text>{ele.toTime}小</Text>
                              <Text>浏览{ele.ViewCount}</Text>
                            </View>
                          </View>
                          <View
                            className="right"
                            onClick={this.goEdit.bind(this, ele.PostId)}
                          >
                            <View>编辑</View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              </ListView>
            </AtTabsPane>
            <AtTabsPane current={current} index={1}>
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
                        <View
                          className="item"
                          key={ele.PostId}
                          onClick={this.goEdit.bind(this, ele.PostId)}
                        >
                          <View className="left">
                            <View>{ele.Title}</View>
                            <View>
                              <Text>{ele.toTime}</Text>
                            </View>
                          </View>
                          {/* <View className='right' onClick={ this.goEdit.bind(this,ele.PostId) }>
                            <View style={{borderLeft: '0rpx'}}>编辑</View>
                          </View> */}
                        </View>
                      );
                    })}
                </View>
              </ListView>
            </AtTabsPane>
          </AtTabs>
        </View>
      </View>
    );
  }
}
