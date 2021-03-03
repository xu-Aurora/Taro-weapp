/* eslint-disable react/no-unused-state */
import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { AtTabs, AtTabsPane, AtModal, AtButton } from "taro-ui";
import ListView from "taro-listview";
import Header from "@/components/header/header";
import { set, get, toast } from "@/global_data";
import { imgUrl, throttle, splitThousand } from "@/utils/util";
import api from "@/api/api";
import "./index.scss";

export default class Index extends PureComponent {
  constructor() {
    this.state = {
      title: "我的资产",
      navType: "backHome",
      num: "myCarport",
      datas: [],
      isOpened: false,
      display1: "none",
      display2: "none",
      ParkingTraitType: [],
      parkingType: 2,
      hasMore: true,
      page: 1,
      rows: 10
    };

    this.cancel = throttle(this.cancel1);
    this.backBuy = throttle(this.backBuy1);
  }

  getType() {
    api.getClassfy({ data: "wineTpye" }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          ParkingTraitType: res.data.data
        });
      }
    });
  }

  async componentWillMount() {
    let param = this.$router.preload.ParkingType;
    await this.getType();
    this.setState({
      current: param == 2 ? 0 : 1,
      parkingType: param
    });
    await this.getDatas(param);
  }
  config = {
    navigationStyle: "custom"
  };

  // 跳转到资产详情
  goPage(id, status) {
    this.$preload({
      id,
      page: "al",
      status
    });
    Taro.navigateTo({
      url: "../myCarport_detail/index"
    });
  }

  renderStatus(val) {
    switch (val) {
      case 0: {
        return <View className="tag_bisque">草稿</View>;
      }
      case 1: {
        return <View className="tag_bisque">上架审批中</View>;
      }
      case 2: {
        return <View className="tag_bisque">挂牌中</View>;
      }
      case 3: {
        return <View className="tag_bisque">已下架</View>;
      }
      case 4: {
        return <View className="tag_bisque">支付锁定中</View>;
      }
      case 5: {
        return <View className="tag_blue">正常持有</View>;
      }
      case 6: {
        return <View className="tag_bisque">回购审批中</View>;
      }
      case 7: {
        return <View className="tag_bisque">已回购</View>;
      }
      case 8: {
        return <View className="tag_bisque">已注销</View>;
      }
    }
  }

  // tab切换
  handleClick(value) {
    this.setState({
      current: value,
      parkingType: value == 0 ? 2 : 3
    });
    this.getDatas(value == 0 ? 2 : 3);
  }

  //资产操作
  handle(type, id, CircleId, way, e) {
    e.stopPropagation();
    //用来判断是点击的支付还是转让,把状态存到全局变量中
    set("type", way);
    this.$preload({
      id,
      CircleId
    });
    Taro.navigateTo({
      url: `../${type}/index`
    });
  }
  // 申请回购
  backBuy1 = datas => {
    // 获取视频验证随机数
    api
      .videoRandom({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        FaceType: 3,
        OrderCode: datas.ParkingId
      })
      .then(res => {
        if (res.data.code === 200) {
          const data = res.data.data;
          this.$preload({
            datas,
            // Warrant,
            payType: "buy_back",
            code: data.Code, // 随机数
            FaceCompareType: data.FaceCompareType
          });

          Taro.navigateTo({
            url: `../identityVerify/index`
          });
        }
      });
  };

  // 取消回购
  cancel1 = ParkingId => {
    api
      .cancelBackBuy({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        ParkingId
      })
      .then(res => {
        if (res.data.code === 200) {
          toast(res.data.info, "success", 1500);
          this.getDatas(this.state.current == 0 ? 2 : 3);
        }
      });
  };

  type(val) {
    const { ParkingTraitType } = this.state;
    let t;
    ParkingTraitType.forEach(ele => {
      if (ele.F_ItemValue == val) {
        t = ele.F_ItemName;
      }
    });
    return t;
  }

  getDatas(params, Page = 1, Rows = 10) {
    const { datas } = this.state;
    api
      .parking({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        queryJson: JSON.stringify({
          ParkingType: params,
          state: "1,3,4,5,2,6"
        }),
        data: JSON.stringify({
          Page,
          Rows
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

  // 上拉
  onPullDownRefresh = () => {
    const { parkingType, page, rows } = this.state;
    this.getDatas(parkingType, page, rows);
  };

  // 下拉
  onScrollToLower = () => {
    const { parkingType, page, rows } = this.state;
    this.getDatas(parkingType, page + 1, rows + 10);
  };

  render() {
    const {
      current,
      datas,
      isOpened,
      num,
      title,
      navType,
      hasMore
    } = this.state;
    const tabList = [
      { title: "区块链资产通凭证" },
      { title: "区块链资产通权证" }
    ];
    const titleHeight = get("titleHeight");
    const surHeight = get("titleHeight1") + 190;

    return (
      <View className="myCarport">
        <Header onNum={num} onTitle={title} onNavType={navType} />
        <View
          style={{
            marginTop: titleHeight,
            minHeight: `calc(100vh - ${titleHeight})`
          }}
        >
          <AtTabs
            current={current}
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
                {datas.length > 0 &&
                  datas.map(ele => {
                    return (
                      <View
                        onClick={this.goPage.bind(
                          this,
                          ele.ParkingId,
                          ele.State
                        )}
                        className="car_list"
                        key={ele.CircleId}
                      >
                        <View className="item">
                          <View>
                            <View className="itemTitle_wrap">
                              <Image
                                src={`${imgUrl}icon_pz.png`}
                                className="itemImg"
                              />
                              <Text className="itemTitle">
                                区块链资产通凭证信息
                              </Text>
                              <View className="itemTag">
                                {this.renderStatus(ele.State)}
                              </View>
                            </View>
                            <View className="clear conTopMargin">
                              <View className="itemContLeft">
                                <View className="textButton12">
                                  <Text>
                                    面额
                                    <Text style={{ fontSize: "18rpx" }}>
                                      {" "}
                                      (元)
                                    </Text>
                                    ：
                                  </Text>
                                  <Text>{splitThousand(ele.Price)}</Text>
                                </View>
                                <View className="textButton12">
                                  <Text>年化收益率：</Text>
                                  <Text>{ele.FixedRate}%</Text>
                                </View>
                                <View>
                                  <Text>限制转让期：</Text>
                                  <Text>3个月</Text>
                                </View>
                              </View>
                              <View className="itemContRight">
                                <View className="textButton12">
                                  <Text>期限：</Text>
                                  <Text>{ele.RepoTerm}个月</Text>
                                </View>
                                <View>
                                  <Text>凭证到期日：</Text>
                                  <Text>{ele.BuyBackDate}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View className="btn1">
                          <View>购买时间：{ele.PayDate.split(" ")[0]}</View>
                          <View>
                            <View>
                              {/* <AtButton type='secondary' size='small'>详情</AtButton> */}
                            </View>
                            {ele.State != 6 && ele.Ifbuyback && ele.IfBtn && (
                              <View
                                onClick={e => {
                                  e.stopPropagation();
                                  this.backBuy(ele, 0);
                                }}
                              >
                                <AtButton type="primary" size="small">
                                  申请回购
                                </AtButton>
                              </View>
                            )}
                            {/* {
                              ele.State != 6 && ele.Usufruct == 0 && ele.IfBtn &&
                              <View onClick={
                                  (e) => {
                                    e.stopPropagation()
                                    this.backBuy(ele, 1)
                                  }
                                }
                              >
                                <AtButton type='primary' size='small'>回购换开权证</AtButton>
                              </View>
                            } */}
                            {ele.State == 6 && ele.Warrant == 0 && (
                              <View
                                onClick={e => {
                                  e.stopPropagation();
                                  this.cancel(ele.ParkingId);
                                }}
                              >
                                <AtButton type="primary" size="small">
                                  取消回购
                                </AtButton>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
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
                {datas.length > 0 &&
                  datas.map(ele => {
                    return (
                      <View
                        onClick={this.goPage.bind(
                          this,
                          ele.ParkingId,
                          ele.State
                        )}
                        className="car_list"
                        key={ele.CircleId}
                      >
                        <View className="item">
                          <View>
                            <View className="itemTitle_wrap">
                              <Image
                                src={`${imgUrl}icon_qz.png`}
                                className="itemImg"
                              />
                              <Text className="itemTitle">
                                区块链资产通权证信息
                              </Text>
                              <View className="itemTag">
                                {this.renderStatus(ele.State)}
                              </View>
                            </View>
                            <View className="clear conTopMargin">
                              <View className="itemContLeft">
                                <View className="textButton12">
                                  <Text>品名：</Text>
                                  <Text>{ele.ParkingCode}</Text>
                                </View>
                                <View className="textButton12">
                                  <Text>类别：</Text>
                                  <Text>{this.type(ele.ParkingTraitType)}</Text>
                                </View>
                                <View>
                                  <Text>
                                    挂牌价
                                    <Text style={{ fontSize: "18rpx" }}>
                                      {" "}
                                      (元)
                                    </Text>
                                    ：
                                  </Text>
                                  <Text>{splitThousand(ele.SalePrice)}</Text>
                                </View>
                              </View>
                              <View
                                className="itemContRight"
                                style={{ marginTop: "42rpx" }}
                              >
                                <View className="textButton12">
                                  <Text>所属商圈：</Text>
                                  <Text>{ele.CircleName}</Text>
                                </View>
                                <View>
                                  <Text>所属仓储：</Text>
                                  <Text>{ele.BuildingName}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View className="btn1">
                          <View>购买时间：{ele.PayDate.split(" ")[0]}</View>
                          <View>
                            <View>
                              {/* <AtButton type='secondary' size='small'>详情</AtButton> */}
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </ListView>
            </AtTabsPane>
          </AtTabs>
        </View>

        <AtModal
          isOpened={isOpened}
          title="摘牌"
          cancelText="取消"
          confirmText="确认"
          onCancel={() => this.setState({ isOpened: false })}
          onClose={() => this.setState({ isOpened: false })}
          onConfirm={this.handleConfirm}
          content="确定执行此操作?"
        />
      </View>
    );
  }
}
