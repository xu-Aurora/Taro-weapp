/* eslint-disable react/no-unused-state */
import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text, Image, Block } from "@tarojs/components";
import { AtTabs, AtTabsPane, AtButton, AtModal } from "taro-ui";
import ListView from "taro-listview";
import { splitThousand, imgUrl } from "@/utils/util";
import Header from "@/components/header/header";
import { get, toast } from "@/global_data";
import api from "@/api/api";
import "./index.scss";

export default class Index extends PureComponent {
  constructor() {
    this.state = {
      current: 0,
      datas: [],
      isOpened: false,
      OrderCode: "",
      clickBtn: true,
      navType: "back",
      title: "我的购买申请",
      num: "myOrder",
      IfPayBond: "",
      display1: "none",
      display2: "none",

      hasMore: true,
      page: 1,
      rows: 10
    };
  }

  componentWillMount() {
    if (this.$router.preload) {
      this.setState({
        current: +this.$router.preload.current
      });

      if (+this.$router.preload.current == 0) {
        this.getData("2,7,8");
      } else if (+this.$router.preload.current == 1) {
        this.getData("1,2,3,4,-1,-2,7,8");
      }
    } else {
      this.getData("2,7,8");
    }
  }
  config = {
    navigationStyle: "custom"
  };

  handleClick(value) {
    if (value == 0) {
      this.getData("2,7,8"); //待处理
    } else if (value == 1) {
      this.getData("1,2,3,4,-1,-2,7,8"); //全部
    }
    this.setState({
      current: value,
      page: 1,
      rows: 10
    });
  }

  //跳转到订单详情
  goPage(id, toUser) {
    this.$preload({
      orderId: id,
      toUser,
      current: this.state.current
    });
    Taro.navigateTo({
      url: "../order_detail/index"
    });
  }
  //点击，跳转到支付首付
  goFirstPay(datas, e) {
    e.stopPropagation();
    this.$preload({
      datas
    });
    Taro.navigateTo({
      url: "../first_pay/index"
    });
  }

  getData(params, Page = 1, Rows = 10) {
    api
      .orderList({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        queryJson: JSON.stringify({
          OrderState: params //待处理为2,7,8
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

  //支付
  // goPay (OrderCode,PayType,num,e) {
  //   e.stopPropagation()
  //   if (this.state.clickBtn) {
  //     this.setState({
  //       clickBtn: false
  //     },() => {
  //       api.OrderDetail({
  //         LoginMark: Taro.getStorageSync('uuid'),
  //         Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
  //         data: JSON.stringify({
  //           OrderCode
  //         })
  //       }).then(res => {
  //         if (res.data.code === 200) {
  //           this.$preload({
  //             datas: res.data.data,
  //             payType: num,      //1代表全额支付,3为支付尾款
  //             pages1: PayType, //用来区分是全额购买还是贷款购买
  //             pages: 'order'
  //           })
  //           Taro.navigateTo({
  //             url: '../pay/index'
  //           }).then(() => {
  //             this.setState({
  //               clickBtn: true
  //             })
  //           })

  //         } else {
  //           this.setState({
  //             clickBtn: true
  //           })
  //         }
  //       })
  //     })
  //   }

  // }

  //取消
  handleConfirm = () => {
    this.setState(
      {
        isOpened: false
      },
      () => {
        api
          .cancelOrder({
            LoginMark: Taro.getStorageSync("uuid"),
            Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
            data: JSON.stringify({
              OrderCode: this.state.OrderCode,
              Description: "不想要了"
            })
          })
          .then(res => {
            if (res.data.code === 200) {
              toast(res.data.info, "success", 2000).then(() => {
                setTimeout(() => {
                  if (JSON.stringify(this.$router.params) !== "{}") {
                    if (this.state.current == 1) {
                      this.getData("1,2,3,4,-1,-2,7,8");
                    } else if (this.state.current == 0) {
                      this.getData("2,7,8");
                    }
                    this.setState({
                      current: +this.$router.params.params
                    });
                  } else {
                    this.getData("1,2,3,4,-1,-2,7,8");
                  }
                }, 1000);
              });
            } else {
              toast(res.data.info, "none", 2000);
            }
          });
      }
    );
  };

  cancelBtn(OrderCode, IfPayBond, e) {
    e.stopPropagation();
    this.setState({
      isOpened: true,
      OrderCode,
      IfPayBond
    });
  }

  satus(data) {
    let text;
    if (data.Type == 2 && data.Price == 0) {
      text = "支付";
    } else if (data.Type == 1) {
      text = "购买";
    } else if (data.Type == 2) {
      text = "转让";
    } else if (data.Type == 3) {
      text = "回购";
    }
    return text;
  }

  text(IfPayBond) {
    if (IfPayBond !== -1) {
      return `您已支付定金，如取消，则定金不予以退还。 \n 确定要取消吗？`;
    } else {
      return `确定执行此操作吗?`;
    }
  }

  orderStatus(data) {
    if (data.OrderState == 0) {
      return "已创建";
    } else if (data.OrderState == 1) {
      return "待审批";
    } else if (data.OrderState == 2) {
      return "已支付订金";
    } else if (data.OrderState == 3) {
      return "已支付";
    } else if (data.OrderState == 4) {
      return "交易完成";
    } else if (data.OrderState == -1) {
      return "订单取消";
    } else if (data.OrderState == -2) {
      return "已超时";
    } else if (data.OrderState == -3) {
      return "已删除";
    } else if (data.OrderState == 5) {
      return "回购审批中";
    } else if (data.OrderState == 6) {
      return "已回购";
    } else if (data.OrderState == 7 && data.Process == 4) {
      return "审批通过待支付首付款";
    } else if (data.OrderState == 7 && data.Process == 3) {
      return "贷款申请审核中";
    } else if (data.OrderState == 8) {
      return "已支付首付";
    }
  }

  parkCode(data) {
    let code;
    if (data.Usufruct == 0) {
      code = `${data.ParkingMsg.split("/#")[1].slice(
        0,
        1
      )}*****${data.ParkingMsg.split("/#")[1].slice(-1)}`;
    } else {
      code = data.ParkingMsg.split("/#")[1];
    }
    return code;
  }

  // 上拉
  onPullDownRefresh = () => {
    const { current, page, rows } = this.state;
    if (current == 1) {
      this.getData("1,2,3,4,-1,-2,7,8", page, rows);
    } else if (current == 0) {
      this.getData("2,7,8", page, rows);
    }
  };

  // 下拉
  onScrollToLower = () => {
    const { current, page, rows } = this.state;
    if (current == 1) {
      this.getData("1,2,3,4,-1,-2,7,8", page + 1, rows + 1);
    } else if (current == 0) {
      this.getData("2,7,8", page + 1, rows + 1);
    }
  };

  renderBtn(ele) {
    let html;
    if (
      ele.PayType === 2 &&
      ((ele.OrderState == 2 && ele.Process == 4) ||
        (ele.OrderState == 7 && ele.Process == 4))
    ) {
      html = (
        <View className="btn1">
          <View></View>
          <View>
            <View
              onClick={this.cancelBtn.bind(this, ele.OrderCode, ele.IfPayBond)}
            >
              <AtButton type="secondary" size="small">
                取消
              </AtButton>
            </View>
            {ele.IfBtn && (
              <View
                style={{ marginRight: "18rpx" }}
                onClick={this.goFirstPay.bind(this, ele)}
              >
                <AtButton type="primary" size="small">
                  支付首付
                </AtButton>
              </View>
            )}
            <View>
              <AtButton type="secondary" size="small">
                详情
              </AtButton>
            </View>
          </View>
        </View>
      );
    } else if (
      ele.PayType === 2 &&
      ((ele.OrderState == 2 && ele.Process == 3) ||
        (ele.OrderState == 7 && ele.Process == 3))
    ) {
      html = (
        <View className="btn1">
          <View></View>
          <View>
            <View
              onClick={this.cancelBtn.bind(this, ele.OrderCode, ele.IfPayBond)}
            >
              <AtButton type="secondary" size="small">
                取消
              </AtButton>
            </View>
            <View>
              <AtButton type="secondary" size="small">
                详情
              </AtButton>
            </View>
          </View>
        </View>
      );
    } else {
      html = (
        <View className="btn1">
          <View></View>
          <View>
            <AtButton type="secondary" size="small">
              详情
            </AtButton>
          </View>
        </View>
      );
    }
    return html;
  }

  render() {
    const tabList = [{ title: "购买中资产" }, { title: "已购买资产" }];
    const {
      datas,
      num,
      navType,
      title,
      isOpened,
      IfPayBond,
      current,
      hasMore
    } = this.state;
    const titleHeight = get("titleHeight");
    const surHeight = get("titleHeight1") + 190;

    return (
      <View className="boxs">
        <Header onNum={num} onTitle={title} onNavType={navType} />

        <View
          className="myOrder"
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
                <View className="list">
                  {datas.length > 0 &&
                    datas.map(ele => {
                      return (
                        <View
                          className="item"
                          key={ele.OrderId}
                          onClick={this.goPage.bind(
                            this,
                            ele.OrderId,
                            ele.toUser
                          )}
                        >
                          <View className="top">
                            {/* <View><Image mode='widthFix' src={ele.Img ? ele.Img : order_default} /></View> */}
                            <View>
                              <View className="marginB20">
                                <View>
                                  <Text>销售协议编号：</Text>
                                  <Text decode className="textColor22">
                                    &nbsp;{ele.OrderCode}
                                  </Text>
                                </View>
                              </View>
                              <View className="marginB20">
                                <Text>资产类型：</Text>
                                <Text>
                                  {ele.Usufruct == 0
                                    ? "资产通凭证"
                                    : "资产通权证"}{" "}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View className="bottom">
                            <View className="l"></View>
                            <View className="c">
                              {/* 定金 */}
                              <View className="marginB20">
                                <Text>购买方式：</Text>
                                {ele.PayType === 1
                                  ? "一次性支付"
                                  : "申请贷款支付"}
                              </View>
                              {ele.PayType === 2 &&
                                ele.OrderState == 7 &&
                                (ele.Process == 4 || ele.Process == 3) && (
                                  <View className="marginB20">
                                    销售金额
                                    <Text style={{ fontSize: "22rpx" }}>
                                      {" "}
                                      (元)
                                    </Text>
                                    ：
                                    <Text>
                                      {splitThousand(
                                        ele.SalePrice ? ele.SalePrice : 0
                                      )}
                                    </Text>
                                  </View>
                                )}
                              {ele.PayType === 2 &&
                                ele.OrderState === 4 &&
                                ele.IfPayDownPayMent != -1 && (
                                  <Block>
                                    <View className="marginB20">
                                      销售金额
                                      <Text style={{ fontSize: "22rpx" }}>
                                        {" "}
                                        (元)
                                      </Text>
                                      ：
                                      <Text>
                                        {splitThousand(
                                          ele.SalePrice ? ele.SalePrice : 0
                                        )}
                                      </Text>
                                    </View>
                                    <View className="marginB20">
                                      首付金额
                                      <Text style={{ fontSize: "22rpx" }}>
                                        {" "}
                                        (元)
                                      </Text>
                                      ：
                                      <Text>
                                        {splitThousand(
                                          ele.IfPayDownPayMent
                                            ? ele.IfPayDownPayMent
                                            : 0
                                        )}
                                      </Text>
                                    </View>
                                  </Block>
                                )}
                              <View className="marginB20">
                                状态：{this.orderStatus(ele)}
                              </View>
                              <View>
                                {ele.PayType === 2 && ele.IfPayBond != -1 ? (
                                  <Text decode>
                                    已付定金&nbsp;&nbsp;(元)&nbsp;&nbsp;:
                                  </Text>
                                ) : (
                                  ""
                                )}
                              </View>
                              {/* 尾款 */}
                              <View>
                                {ele.PayType === 1 && ele.IfPayRest != -1 ? (
                                  <Text decode>
                                    已付尾款&nbsp;&nbsp;(元)&nbsp;&nbsp;:
                                  </Text>
                                ) : (
                                  ""
                                )}
                              </View>
                              {ele.PayType === 1 && ele.OrderState == 4 ? (
                                <View>交易完成</View>
                              ) : (
                                ""
                              )}
                              {ele.PayType === 1 && ele.OrderState == -2 ? (
                                <View className="overtime">
                                  <Text decode>交易超时,订单已取消</Text>
                                </View>
                              ) : (
                                ""
                              )}
                              {ele.PayType === 1 && ele.OrderState == -1 ? (
                                <View className="overtime">
                                  <Text decode>用户已取消</Text>
                                </View>
                              ) : (
                                ""
                              )}
                            </View>
                            <View className="r">
                              {/* <View>{ splitThousand(ele.Price) }</View> */}
                              {/* 定金 */}
                              {/* {
                                (ele.PayType===1&&ele.IfPayBond != -1) ? (
                                  <View>{ splitThousand(ele.IfPayBond) }</View>
                                ): ''
                              } */}
                              {/* 尾款 */}
                              {/* {
                                (ele.PayType===1&&ele.IfPayRest != -1) ? (
                                  <View>{ splitThousand(ele.IfPayRest) }</View>
                                ): ''
                              } */}
                              {/* 贷款购买：支付定金 */}
                              {/* {
                                ele.PayType===2&&((ele.OrderState == 2&&(ele.Process == 3||ele.Process == 4))||(ele.OrderState == 2&&ele.Process == -4))? (
                                  <View>{ splitThousand(ele.IfPayBond) }</View>
                                ): ''
                              } */}
                              {/* 贷款购买：征信不通过 */}
                              {/* {
                                ele.PayType===2&&((ele.OrderState == 7&&ele.Process == -4)||(ele.OrderState == 2&&ele.Process == -4))? (
                                  <View>不通过</View>
                                ): ''
                              } */}
                              {/* 贷款购买：征信通过 */}
                              {/* {
                                ele.PayType===2&&((ele.OrderState == 2&&ele.Process == 4)||(ele.OrderState == 7&&ele.Process == 4))? (
                                  <View>通过</View>
                                ): ''
                              } */}
                              {/* 贷款购买，定金支付，已付首款 */}
                              {/* {
                                ele.PayType===2&&(ele.OrderState == 8&&ele.Process == 4)? (
                                  <View>{ splitThousand(ele.IfPayDownPayMent) }</View>
                                ): ''
                              } */}
                            </View>
                          </View>

                          {this.renderBtn(ele)}

                          {ele.PayType === 1 && ele.OrderState == 2 && (
                            <View className="hint">
                              <View>
                                <Image
                                  mode="widthFix"
                                  src={`${imgUrl}info.png`}
                                />
                              </View>
                              <View>
                                请尽快完成支付，超过订单时间7日后，订单将过期失效，已付定金不予退还
                              </View>
                            </View>
                          )}
                          {/* 贷款购买，定金支付，已付首款 */}
                          {ele.PayType === 2 &&
                            ele.OrderState == 8 &&
                            ele.Process == 4 && (
                              <View className="hint">
                                <View>
                                  <Image
                                    mode="widthFix"
                                    src={`${imgUrl}info.png`}
                                  />
                                </View>
                                <View>银行放贷中，请耐心等待</View>
                              </View>
                            )}

                          {/* 贷款购买，不付支付，征信不通过*/}
                          {ele.PayType === 2 &&
                            ele.OrderState == 7 &&
                            ele.Process == -4 && (
                              <View className="hint">
                                <View>
                                  <Image
                                    mode="widthFix"
                                    src={`${imgUrl}info.png`}
                                  />
                                </View>
                                <View>征信审核不通过，订单已取消</View>
                              </View>
                            )}
                          {/* 贷款购买，征信通过*/}
                          {ele.PayType === 2 &&
                            ele.OrderState == 2 &&
                            ele.Process == 4 && (
                              <View className="hint">
                                <View>
                                  <Image
                                    mode="widthFix"
                                    src={`${imgUrl}info.png`}
                                  />
                                </View>
                                <View>
                                  请尽快完成支付，超过订单时间7日后，订单将过期失效，已付定金不予退还
                                </View>
                              </View>
                            )}
                          {/* 订单取消*/}
                          {(ele.OrderState == -1 || ele.OrderState == -2) && (
                            <View className="hint">
                              <View>
                                <Image
                                  mode="widthFix"
                                  src={`${imgUrl}info.png`}
                                />
                              </View>
                              <View>交易已取消</View>
                            </View>
                          )}
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
                          key={ele.OrderId}
                          onClick={this.goPage.bind(
                            this,
                            ele.OrderId,
                            ele.toUser
                          )}
                        >
                          <View className="top">
                            {/* <View><Image src={ele.Img ? ele.Img : order_default} /></View> */}
                            <View>
                              <View className="marginB20">
                                <View>
                                  <Text>销售协议编号：</Text>
                                  <Text decode className="textColor22">
                                    &nbsp;{ele.OrderCode}
                                  </Text>
                                </View>
                              </View>
                              <View className="marginB20">
                                <Text>资产类型：</Text>
                                <Text>
                                  {ele.Usufruct == 0
                                    ? "资产通凭证"
                                    : "资产通权证"}{" "}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View className="bottom">
                            <View className="l"></View>
                            <View className="c">
                              <View>
                                {ele.OrderState != 7 &&
                                  (ele.Process != 4 || ele.Process != 3) && (
                                    <View className="marginB20">
                                      支付金额
                                      <Text style={{ fontSize: "22rpx" }}>
                                        {" "}
                                        (元)
                                      </Text>
                                      ：{splitThousand(ele.Price)}
                                      {/* 定金 */}
                                      {ele.PayType === 1 &&
                                      ele.IfPayBond != -1 ? (
                                        <View>
                                          {splitThousand(ele.IfPayBond)}
                                        </View>
                                      ) : (
                                        ""
                                      )}
                                      {/* 尾款 */}
                                      {ele.PayType === 1 &&
                                      ele.IfPayRest != -1 ? (
                                        <View>
                                          {splitThousand(ele.IfPayRest)}
                                        </View>
                                      ) : (
                                        ""
                                      )}
                                      {/* 贷款购买：支付定金 */}
                                      {ele.PayType === 2 &&
                                      ((ele.OrderState == 2 &&
                                        (ele.Process == 3 ||
                                          ele.Process == 4)) ||
                                        (ele.OrderState == 2 &&
                                          ele.Process == -4)) ? (
                                        <View>
                                          {splitThousand(ele.IfPayBond)}
                                        </View>
                                      ) : (
                                        ""
                                      )}
                                      {/* 贷款购买：征信不通过 */}
                                      {/* {
                                      ele.PayType===2&&((ele.OrderState == 7&&ele.Process == -4)||(ele.OrderState == 2&&ele.Process == -4))? (
                                        <View>不通过</View>
                                      ): ''
                                    } */}
                                      {/* 贷款购买：征信通过 */}
                                      {/* {
                                      ele.PayType===2&&((ele.OrderState == 2&&ele.Process == 4)||(ele.OrderState == 7&&ele.Process == 4))? (
                                        <View>通过</View>
                                      ): ''
                                    } */}
                                      {/* 贷款购买，定金支付，已付首款 */}
                                      {ele.PayType === 2 &&
                                      ele.OrderState == 8 &&
                                      ele.Process == 4 ? (
                                        <View>
                                          {splitThousand(ele.IfPayDownPayMent)}
                                        </View>
                                      ) : (
                                        ""
                                      )}
                                    </View>
                                  )}
                              </View>
                              {ele.PayType === 2 &&
                                ele.OrderState == 7 &&
                                (ele.Process == 4 || ele.Process == 3) && (
                                  <View className="marginB20">
                                    销售金额
                                    <Text style={{ fontSize: "22rpx" }}>
                                      {" "}
                                      (元)
                                    </Text>
                                    ：
                                    <Text>
                                      {splitThousand(
                                        ele.SalePrice ? ele.SalePrice : 0
                                      )}
                                    </Text>
                                  </View>
                                )}
                              {ele.PayType === 2 &&
                                ele.OrderState === 4 &&
                                ele.IfPayDownPayMent != -1 && (
                                  <Block>
                                    <View className="marginB20">
                                      销售金额
                                      <Text style={{ fontSize: "22rpx" }}>
                                        {" "}
                                        (元)
                                      </Text>
                                      ：
                                      <Text>
                                        {splitThousand(
                                          ele.SalePrice ? ele.SalePrice : 0
                                        )}
                                      </Text>
                                    </View>
                                    <View className="marginB20">
                                      首付金额
                                      <Text style={{ fontSize: "22rpx" }}>
                                        {" "}
                                        (元)
                                      </Text>
                                      ：
                                      <Text>
                                        {splitThousand(
                                          ele.IfPayDownPayMent
                                            ? ele.IfPayDownPayMent
                                            : 0
                                        )}
                                      </Text>
                                    </View>
                                  </Block>
                                )}
                              <View className="marginB20">
                                <Text>购买方式：</Text>
                                {ele.PayType === 1
                                  ? "一次性支付"
                                  : "申请贷款支付"}
                              </View>
                              <View className="marginB20">
                                状态：{this.orderStatus(ele)}
                              </View>
                            </View>
                          </View>

                          {this.renderBtn(ele)}

                          {ele.PayType === 1 && ele.OrderState == 2 && (
                            <View className="hint">
                              <View>
                                <Image
                                  mode="widthFix"
                                  src={`${imgUrl}info.png`}
                                />
                              </View>
                              <View>
                                请尽快完成支付，超过订单时间7日后，订单将过期失效，已付定金不予退还
                              </View>
                            </View>
                          )}
                          {/* 贷款购买，定金支付，已付首款 */}
                          {ele.PayType === 2 &&
                            ele.OrderState == 8 &&
                            ele.Process == 4 && (
                              <View className="hint">
                                <View>
                                  <Image
                                    mode="widthFix"
                                    src={`${imgUrl}info.png`}
                                  />
                                </View>
                                <View>银行放贷中，请耐心等待</View>
                              </View>
                            )}

                          {/* 贷款购买，不付支付，征信不通过*/}
                          {ele.PayType === 2 &&
                            ele.OrderState == 7 &&
                            ele.Process == -4 && (
                              <View className="hint">
                                <View>
                                  <Image
                                    mode="widthFix"
                                    src={`${imgUrl}info.png`}
                                  />
                                </View>
                                <View>征信审核不通过，订单已取消</View>
                              </View>
                            )}
                          {/* 贷款购买，征信通过*/}
                          {ele.PayType === 2 &&
                            ele.OrderState == 2 &&
                            ele.Process == 4 && (
                              <View className="hint">
                                <View>
                                  <Image
                                    mode="widthFix"
                                    src={`${imgUrl}info.png`}
                                  />
                                </View>
                                {/* <View>请尽快完成支付，超过订单时间7日后，订单将过期失效，已付定金不予退还</View> */}
                                <View>
                                  请在24小时内支付首付款，完成交易。如超时，将自动取消该订单
                                </View>
                              </View>
                            )}
                          {/* 订单取消*/}
                          {(ele.OrderState == -1 || ele.OrderState == -2) && (
                            <View className="hint">
                              <View>
                                <Image
                                  mode="widthFix"
                                  src={`${imgUrl}info.png`}
                                />
                              </View>
                              <View>交易已取消</View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>
              </ListView>
            </AtTabsPane>
          </AtTabs>
        </View>
        <AtModal
          isOpened={isOpened}
          cancelText="取消"
          confirmText="确认"
          onCancel={() => this.setState({ isOpened: false })}
          onClose={() => this.setState({ isOpened: false })}
          onConfirm={this.handleConfirm}
          content={this.text(IfPayBond)}
        />
      </View>
    );
  }
}
