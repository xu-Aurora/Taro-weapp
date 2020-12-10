import Taro, { PureComponent } from "@tarojs/taro";
import { View, Image, Text, Button } from "@tarojs/components";
import {
  AtButton,
  AtActionSheet,
  AtActionSheetItem,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtTabs,
  AtTabsPane
} from "taro-ui";
import Header from "../../components/header/header";
import { set, get } from "../../global_data";
import { splitThousand, imgUrl } from "../../utils/util";
import api from "../../api/api";
import "./index.scss";

export default class Index extends PureComponent {
  config = {
    navigationStyle: "custom"
  };

  constructor() {
    super(...arguments);
    this.state = {
      num: "busArea",
      navType: "back",
      title: "商圈详情",
      disabled: false,
      disabled1: false,
      disabled2: false,
      isOpened: false,
      isOpened2: false,
      accountDatas: {}, // 账户信息数据
      // parkingDatas: [], // 资产列表数据
      pzParkArr: null,
      qzParkArr: null,
      thisAmt: "", // 还款金额
      ParkingTraitType: [],
      // repayRecords: [],
      current: 0,
      isZS: false
    };
  }

  getVideoRandom() {
    api
      .videoRandom({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        FaceType: 2 // 开准一类户
      })
      .then(res => {
        if (res.data.code === 200) {
          const data = res.data.data;
          this.$preload({
            payType: "tx",
            datas: {
              OrderCode: ""
            },
            code: data.Code,
            // FaceCompareType: data.FaceCompareType
            FaceCompareType: 1
          });
          this.setState({
            disabled2: false
          });
          Taro.navigateTo({
            url: `../identityVerify/index`
          });
        }
      });
  }

  goPage(type) {
    if (type === "h5_ide") {
      // 获取随机数
      this.setState(
        {
          disabled2: true
        },
        () => {
          this.getVideoRandom(type);
        }
      );
    } else if (type === "weapp_ide") {
      this.$preload({
        datas: this.state.accountDatas
      });
      Taro.navigateTo({
        url: `../withdraw/index`
      });
    } else {
      this.$preload({
        datas: this.state.accountDatas,
        page: "circle"
      });
      Taro.navigateTo({
        url: `../${type}/index`
      });
    }
  }

  handleClick(value) {
    this.setState({
      current: value,
      isOpened: false
    });
  }
  // 账单跳转
  goBill(type, CircleId) {
    this.$preload({
      CircleId
    });
    Taro.navigateTo({
      url: `../${type}/index`
    });
  }

  renderStatus(val) {
    switch (val) {
      // case 0: { return <View className='tag_blue'>草稿</View> }
      // case 1:
      //   { return <View className='tag_blue'>上街审批中</View> }
      // case 2:
      //   {return <View className='tag_blue'>已上架</View> }
      // case 3:
      //   {return <View className='tag_blue'>已下架</View> }
      // case 4:
      //   { return <View className='tag_blue'>支付锁定中</View> }
      case 5: {
        return <View className="tag_blue">正常持有</View>;
      }
      case 6: {
        return <View className="tag_blue">回购审批中</View>;
      }
      // case 7:
      //   { return <View className='tag_blue'>已回购</View> }
      // case 8:
      //   { return <View className='tag_blue'>已注销</View> }
    }
  }

  // 资产操作
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
  backBuy(datas, e) {
    e.stopPropagation();
    if (!this.state.disabled) {
      this.setState(
        {
          disabled: true
        },
        () => {
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
                  payType: "buy_back",
                  code: data.Code, // 随机数
                  FaceCompareType: data.FaceCompareType
                });

                Taro.navigateTo({
                  url: `../identityVerify/index`
                });
              }
              this.setState({
                disabled: false
              });
            });
        }
      );
    }
  }
  // 取消回购
  cancel(ParkingId, e) {
    e.stopPropagation();

    if (!this.state.disabled1) {
      this.setState(
        {
          disabled1: true
        },
        () => {
          api
            .cancelBackBuy({
              LoginMark: Taro.getStorageSync("uuid"),
              Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
              ParkingId
            })
            .then(res => {
              if (res.data.code === 200) {
                this.getParking();
              }
              this.setState({
                disabled1: false
              });
            });
        }
      );
    }
  }

  // 累计收益跳转
  goIncome(CircleId) {
    this.$preload({
      CircleId
    });
    Taro.navigateTo({
      url: "../myProfit/index"
    });
  }

  //账户信息数据
  accountAmt() {
    api
      .accountAmt({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        data: JSON.stringify({
          CircleId: this.$router.preload.CircleId
        })
      })
      .then(res => {
        if (res.data.code === 200) {
          this.setState(
            {
              accountDatas: res.data.data
            },
            () => {
              api
                .personalLoan({
                  LoginMark: Taro.getStorageSync("uuid"),
                  Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
                  CircleId: this.$router.preload.CircleId
                })
                .then(r => {
                  if (r.data.code === 200) {
                    this.setState({
                      thisAmt: r.data.data.totalAmt
                    });
                  }
                });
            }
          );
        }
      });
  }

  getDatas() {
    api
      .parking({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token,
        queryJson: JSON.stringify({
          CircleId: this.$router.preload.CircleId,
          state: "1,3,4,5,2,6"
        }),
        data: JSON.stringify({
          page: 1,
          rows: 1000
        }),
        existLoading: true
      })
      .then(res => {
        if (res.data.code === 200) {
          let pzParkArr = [];
          let qzParkArr = [];
          res.data.data.rows.forEach(ele => {
            if (ele.Usufruct == 0) {
              pzParkArr.push(ele);
            } else {
              qzParkArr.push(ele);
            }
          });

          this.setState({
            pzParkArr,
            qzParkArr
          });
        }
      });
  }

  // 跳转到贷款列表
  goRepay = () => {
    this.$preload({
      // repayRecords: this.state.repayRecords
      CircleId: this.$router.preload.CircleId,
      pages: "circle"
    });
    set("CircleId", this.$router.preload.CircleId);
    Taro.navigateTo({
      url: "../myLoan/index"
    });
  };

  //跳转到资产详情
  goDetail(id, status) {
    this.$preload({
      id,
      page: "al",
      status
    });
    Taro.navigateTo({
      url: "../myCarport_detail/index"
    });
  }

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

  getType() {
    api.getClassfy({ data: "wineTpye" }).then(res => {
      if (res.data.code === 200) {
        this.setState({
          ParkingTraitType: res.data.data
        });
      }
    });
  }

  //WARNING! To be deprecated in React v17. Use componentDidMount instead.
  componentWillMount() {
    const asyncHttp = async () => {
      await this.getType();
      await this.accountAmt();
      await this.getDatas();
    };
    asyncHttp();

    // 用户是否绑定浙商银行卡
    api
      .ifZSaccount({
        LoginMark: Taro.getStorageSync("uuid"),
        Token: JSON.parse(Taro.getStorageSync("userInfo")).token
      })
      .then(res => {
        if (res.data.code === 305) {
          // 未开户，仍可以使用其他卡
          this.setState({
            isZS: true
          });
        }
      });
  }

  render() {
    const {
      isZS,
      num,
      navType,
      title,
      accountDatas,
      thisAmt,
      current,
      pzParkArr,
      qzParkArr,
      isOpened,
      disabled,
      disabled1,
      disabled2
    } = this.state;
    const tabList = [
      { title: "区块链资产通凭证" },
      { title: "区块链资产通权证" }
    ];
    const titleHeight = get("titleHeight");
    const bgImg = {
      background: `url(${imgUrl}circle_card.png)`,
      backgroundSize: "100% 100%"
    };
    return (
      <View className="circle">
        <Header onNum={num} onNavType={navType} onTitle={title} />
        {qzParkArr && (
          <View
            style={{
              marginTop: titleHeight,
              minHeight: `calc(100vh - ${titleHeight})`
            }}
          >
            <View className="top">
              <View className="card" style={bgImg}>
                <View>
                  <View>{accountDatas.CircleName}</View>
                  <Image
                    onClick={() => this.setState({ isOpened: true })}
                    src={`${imgUrl}more.png`}
                  />
                </View>
                <View>账号 : {accountDatas.CircleAccountNo}</View>
                <View>绑定银行卡 : {accountDatas.accNo}</View>
              </View>
              <View className="balance">
                <View className="left">
                  <View>
                    {splitThousand(accountDatas.Amt ? accountDatas.Amt : 0)}
                  </View>
                  <View>
                    账户余额<Text style={{ fontSize: "20rpx" }}> (元)</Text>
                  </View>
                </View>
                {accountDatas.isCzbankAcc == 0 ? (
                  <View className="right">
                    <AtButton
                      onClick={() => this.setState({ isOpened2: true })}
                      className="cz"
                      size="small"
                      type="secondary"
                    >
                      充值
                    </AtButton>
                    <AtButton // 跳转小程序提现页面
                      onClick={this.goPage.bind(this, "weapp_ide")}
                      size="small"
                      loading={disabled2}
                      type="secondary"
                    >
                      提现
                    </AtButton>
                  </View>
                ) : (
                  ""
                )}
                {accountDatas.isCzbankAcc == 2 && ( // 跳转准一类户h5页面提现
                  <View className="right">
                    <AtButton
                      onClick={this.goPage.bind(this, "h5_ide")}
                      size="small"
                      loading={disabled2}
                      type="secondary"
                    >
                      提现
                    </AtButton>
                  </View>
                )}
              </View>
              <View className="earnings">
                {/* <View className='left common' onClick={this.goBill.bind(this, 'earn_detail', accountDatas.CircleId)}> */}
                <View
                  className="left common"
                  onClick={this.goIncome.bind(this, accountDatas.CircleId)}
                >
                  <Image src={`${imgUrl}income.png`} />
                  <View>
                    <View>
                      +
                      {accountDatas.SumProfit == 0
                        ? "0.00"
                        : accountDatas.SumProfit}
                    </View>
                    <View>
                      累计收益<Text style={{ fontSize: "20rpx" }}> (元)</Text>
                    </View>
                  </View>
                </View>
                <View className="right common" onClick={this.goRepay}>
                  <Image src={`${imgUrl}repayment.png`} />
                  <View>
                    {/* 只有贷款付款的才有还款金额,目前只写死0 */}
                    <View>{splitThousand(thisAmt ? thisAmt : "0.00")}</View>
                    <View>
                      贷款金额<Text style={{ fontSize: "20rpx" }}> (元)</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <AtTabs
              current={current}
              tabList={tabList}
              onClick={this.handleClick.bind(this)}
            >
              <AtTabsPane current={current} index={0}>
                {JSON.stringify(pzParkArr) !== "[]" &&
                  pzParkArr !== null &&
                  pzParkArr.map(ele => {
                    return (
                      <View
                        className="car_list"
                        key={ele.ParkingId}
                        onClick={this.goDetail.bind(
                          this,
                          ele.ParkingId,
                          ele.State
                        )}
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
                              <AtButton type="secondary" size="small">
                                详情
                              </AtButton>
                            </View>
                            {ele.State != 6 && ele.Ifbuyback && ele.IfBtn && (
                              <View onClick={this.backBuy.bind(this, ele)}>
                                <AtButton
                                  type="primary"
                                  loading={disabled}
                                  size="small"
                                >
                                  申请回购
                                </AtButton>
                              </View>
                            )}
                            {ele.State == 6 && (
                              <View
                                onClick={this.cancel.bind(this, ele.ParkingId)}
                              >
                                <AtButton
                                  loading={disabled1}
                                  type="primary"
                                  size="small"
                                >
                                  取消回购
                                </AtButton>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                {JSON.stringify(pzParkArr) === "[]" && (
                  <View className="nodata" style={{ minHeight: "320rpx" }}>
                    <View>
                      <Image src={`${imgUrl}no_card.png`} />
                      <View>暂无区块链资产通凭证</View>
                    </View>
                  </View>
                )}

                <View
                  className="footer1"
                  style={{
                    display:
                      JSON.stringify(pzParkArr) !== "[]" && pzParkArr !== null
                        ? "flex"
                        : "none"
                  }}
                >
                  <View>
                    <View className="line"></View>
                    <View className="text">已经到底啦</View>
                    <View className="line"></View>
                  </View>
                </View>
              </AtTabsPane>
              <AtTabsPane current={current} index={1}>
                {JSON.stringify(qzParkArr) !== "[]" &&
                  qzParkArr !== null &&
                  qzParkArr.map(ele => {
                    return (
                      <View
                        onClick={this.goDetail.bind(
                          this,
                          ele.ParkingId,
                          ele.State
                        )}
                        className="car_list"
                        key={ele.OwnnerId}
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
                                  <Text>
                                    {ele.SalePrice &&
                                      splitThousand(ele.SalePrice)}
                                  </Text>
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
                              <AtButton type="secondary" size="small">
                                详情
                              </AtButton>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                {JSON.stringify(qzParkArr) === "[]" && (
                  <View className="nodata" style={{ minHeight: "320rpx" }}>
                    <View>
                      <Image src={`${imgUrl}no_card.png`} />
                      <View>暂无区块链资产通凭证</View>
                    </View>
                  </View>
                )}

                <View
                  className="footer1"
                  style={{
                    display:
                      JSON.stringify(qzParkArr) !== "[]" && pzParkArr !== null
                        ? "flex"
                        : "none"
                  }}
                >
                  <View>
                    <View className="line"></View>
                    <View className="text">已经到底啦</View>
                    <View className="line"></View>
                  </View>
                </View>
              </AtTabsPane>
            </AtTabs>

            <AtActionSheet
              cancelText="取消"
              isOpened={isOpened}
              onClose={() => this.setState({ isOpened: false })}
            >
              {isZS && (
                <AtActionSheetItem
                  onClick={this.goPage.bind(this, "bank_bind_update")}
                >
                  修改绑定银行卡
                </AtActionSheetItem>
              )}

              <AtActionSheetItem
                onClick={this.goPage.bind(this, "invite_join")}
              >
                邀请会员加入
              </AtActionSheetItem>
              <AtActionSheetItem
                onClick={this.goPage.bind(this, "al_bus_detail")}
              >
                查看商圈详情
              </AtActionSheetItem>
            </AtActionSheet>

            {/* 充值modal */}
            <View className="c_modal">
              <AtModal
                isOpened={this.state.isOpened2}
                onClose={() => this.setState({ isOpened2: false })}
              >
                <View className="modal_header">
                  <AtModalHeader>
                    您可以通过手机银行、网上银行、银行柜台等渠道进行充值。
                  </AtModalHeader>
                </View>
                <AtModalContent>
                  <View className="modal1">
                    <View className="mar_bot">
                      请通过该商圈所绑定的银行卡：
                    </View>
                    <View className="mar_bot">
                      {JSON.stringify(accountDatas) !== "{}" &&
                        accountDatas.accNo &&
                        `${accountDatas.accNo.slice(
                          0,
                          4
                        )} **** **** ${accountDatas.accNo.slice(-4)}`}
                    </View>
                    <View className="mar_bot">向该商圈账号进行转账汇款</View>
                    <View className="col">
                      户名：
                      {Taro.getStorageSync("userInfo") &&
                        JSON.parse(Taro.getStorageSync("userInfo")).userName}
                    </View>
                    <View className="col">
                      签约账号：{accountDatas.CircleAccountNo}
                    </View>
                    <View className="col">开户行：{`浙商银行`}</View>
                  </View>
                </AtModalContent>
                <AtModalAction>
                  <Button onClick={() => this.setState({ isOpened2: false })}>
                    确定
                  </Button>
                </AtModalAction>
              </AtModal>
            </View>
          </View>
        )}
      </View>
    );
  }
}
