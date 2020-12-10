import Taro, { PureComponent } from "@tarojs/taro";
import { View, Text, Image } from "@tarojs/components";
import { AtList, AtListItem } from "taro-ui";
import { imgUrl, splitThousand } from "../../utils/util";
import QQMapWX from "../../assets/js/qqmap-wx-jssdk.min";
import "./index.scss";

let qqmapsdk = new QQMapWX({
  key: "L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX"
});

export default class CarInfo extends PureComponent {
  constructor() {
    super(...arguments);
    this.state = {};
  }

  Usufruct(val) {
    switch (val) {
      case 1:
        return "只有使用权";
      case 2:
        return "拥有产权";
      case 0:
        return "无使用权";
      default:
        return "暂无";
    }
  }
  renderStatus(val) {
    switch (val) {
      case "0": {
        return <View className="tag_bisque">草稿</View>;
      }
      case "1": {
        return <View className="tag_bisque">上架审批中</View>;
      }
      case "2": {
        return <View className="tag_bisque">挂牌中</View>;
      }
      case "3": {
        return <View className="tag_bisque">已下架</View>;
      }
      case "4": {
        return <View className="tag_bisque">支付锁定中</View>;
      }
      case "5": {
        return <View className="tag_blue">正常持有</View>;
      }
      case "6": {
        return <View className="tag_bisque">回购审批中</View>;
      }
      case "7": {
        return <View className="tag_bisque">已回购</View>;
      }
      case "8": {
        return <View className="tag_bisque">已注销</View>;
      }
    }
  }

  // parkCode (data) {
  //   let code = null
  //   if (data!==undefined&&JSON.stringify(data)!=='{}') {
  //     if (data.BuyBackModel.Usufruct == 0) {
  //       code = `${data.ParkingCode.slice(0,1)} ***** ${data.ParkingCode.slice(-1)}`
  //     } else {
  //       code = data.ParkingCode
  //     }
  //   }
  //   return code
  // }

  type(val) {
    const { ParkingTraitTypes } = this.props;
    let t;
    ParkingTraitTypes.forEach(ele => {
      if (ele.F_ItemValue == val) {
        t = ele.F_ItemName;
      }
    });
    return t;
  }

  // 是否进口
  unit(val) {
    const { Units } = this.props;
    let a;
    Units.forEach(ele => {
      if (ele.F_ItemValue == val) {
        a = ele.F_ItemName;
      }
    });
    return a;
  }
  // 产地
  origin(datas) {
    const { ImportOrigins, DomesticOrigins } = this.props;
    let a;
    if (datas.IsImport == 1) {
      ImportOrigins.forEach(ele => {
        if (ele.F_ItemValue == datas.Origin) {
          a = ele.F_ItemName;
        }
      });
    } else if (datas.IsImport == 0) {
      DomesticOrigins.forEach(ele => {
        if (ele.F_ItemValue == datas.Origin) {
          a = ele.F_ItemName;
        }
      });
    }
    return a;
  }

  openPDF(PDF) {
    let sysinfo = Taro.getSystemInfoSync();
    let isiOS = sysinfo.system.indexOf("iOS") > -1;

    let isHUAWEI = sysinfo.brand.toUpperCase().indexOf("HUAWEI") > -1;
    let isXIAOMI = sysinfo.brand.toLowerCase().indexOf("xiaomi") > -1;

    this.$preload({
      url: PDF,
      display: "none_1"
    });
    Taro.navigateTo({
      url: "../pdf/index"
    });

    // if (isiOS) {    //ios
    //   this.$preload({ url: PDF })
    //   Taro.navigateTo({
    //     url: '../pdf/index'
    //   })
    // } else if (isHUAWEI || isXIAOMI) {
    //   Taro.setClipboardData({
    //     data: PDF,
    //     success: function () {
    //       Taro.showModal({
    //         title: '提示',
    //         content: '复制成功,请使用浏览器下载浏览',
    //         showCancel: false
    //       })
    //     }
    //   })
    // } else {        //Android
    //   Taro.downloadFile({
    //     url: PDF,
    //     success: function(res1) {
    //       let Path = res1.tempFilePath
    //       Taro.openDocument({
    //         filePath: Path,
    //         fileType:'pdf',
    //         success: function() {
    //           console.log('打开文档成功')
    //         }
    //       })
    //     }
    //   })
    // }
  }
  goNavigation(city) {
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

  render() {
    const { onDatas, onPage } = this.props;
    return (
      <View className="boxs">
        {onDatas && Object.keys(onDatas).length > 10 && (
          <View>
            <View className="topBG">
              {onPage === "aw" &&
                (onDatas &&
                JSON.stringify(onDatas) !== "{}" &&
                onDatas.BuyBackModel.Usufruct == 0 ? (
                  <View className="bg_pz">
                    <Image src={`${imgUrl}pic_pz_bg.png`} />
                    <View className="left">
                      <View>
                        {onDatas.BuyBackModel.FixedRate}
                        <Text style={{ fontSize: "20rpx" }}>%</Text>
                      </View>
                      <View style={{ fontSize: "24rpx" }}>年化收益率</View>
                    </View>
                    <View className="right">
                      <View>
                        {onDatas.Price ? splitThousand(onDatas.Price) : 0}
                      </View>
                      <View style={{ fontSize: "24rpx" }}>
                        面额<Text style={{ fontSize: "18rpx" }}> (元)</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="bg_qz">
                    <Image src={`${imgUrl}pic_qz_bg.png`} />
                    <View>
                      <Text style={{ fontSize: "30rpx" }}>
                        挂牌价<Text style={{ fontSize: "22rpx" }}> (元)</Text>：
                      </Text>
                      <Text style={{ fontSize: "48rpx" }}>
                        {onDatas.SalePrice
                          ? splitThousand(onDatas.SalePrice)
                          : 0}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
            <View className="car_info">
              {/* 资产通信息(回购模式) */}
              {onDatas &&
              JSON.stringify(onDatas) !== "{}" &&
              onDatas.BuyBackModel.Usufruct == 0 ? (
                <View className="buy_back">
                  <View>
                    <View>
                      <Image src={`${imgUrl}icon_pz.png`} />
                      <Text>区块链资产通凭证信息</Text>
                    </View>
                    <View>
                      {onPage === "al" && this.renderStatus(onDatas.State)}
                    </View>
                  </View>
                  <View>
                    <View>
                      <Text className="col1">编号 : </Text>
                      <Text className="col2" style={{ fontSize: "26rpx" }}>
                        {JSON.stringify(onDatas) !== "{}" &&
                          onDatas &&
                          onDatas.ParkingId.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <View className="left">
                      <View>
                        <Text className="col1">面额 : </Text>
                        <Text className="col2">
                          {onDatas.Price ? splitThousand(onDatas.Price) : 0}
                          <Text style={{ fontSize: "20rpx" }}> (元)</Text>
                        </Text>
                      </View>
                      <View>
                        <Text className="col1">年化收益率 : </Text>
                        <Text className="col2">
                          {onDatas && onDatas.BuyBackModel.FixedRate}
                          <Text style={{ fontSize: "20rpx" }}> %</Text>
                        </Text>
                      </View>
                    </View>
                    <View className="right">
                      <View>
                        <Text className="col1">期限 : </Text>
                        <Text className="col2">
                          {onDatas && onDatas.BuyBackModel.RepoTerm}个月
                        </Text>
                      </View>
                      <View>
                        <Text className="col1">凭证到期日 : </Text>
                        <Text className="col2">
                          {onDatas && onDatas.LimitDate}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View>
                    <Text className="col1">限制转让期 : </Text>
                    <Text className="col2">三个月</Text>
                  </View>
                </View>
              ) : (
                <View className="buy_back">
                  <View>
                    <View>
                      <Image src={`${imgUrl}icon_qz.png`} />
                      <Text>区块链资产通权证信息</Text>
                    </View>
                  </View>
                  <View>
                    <Text className="col1">编号 : </Text>
                    <Text className="col2" style={{ fontSize: "26rpx" }}>
                      {JSON.stringify(onDatas) !== "{}" &&
                        onDatas &&
                        onDatas.ParkingId.toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text className="col1">权属性质 : </Text>
                    <Text className="col2">
                      {" "}
                      {JSON.stringify(onDatas) !== "{}" &&
                        onDatas &&
                        this.Usufruct(onDatas.BuyBackModel.Usufruct)}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View className="bottom">
              <View style={{ fontSize: "36rpx", color: "#3E3E3E" }}>
                资产信息
              </View>

              <View>
                <View>
                  <Text decode className="col1">
                    品名 :&nbsp;
                  </Text>
                  <Text className="col2">{onDatas.ParkingCode}</Text>
                </View>
              </View>
              <View>
                <Text>
                  <Text decode className="col1">
                    数量 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {onDatas.BuyBackModel.Number}
                    {this.unit(onDatas.BuyBackModel.Unit)}
                  </Text>
                </Text>
                <Text>
                  <Text decode className="col1">
                    类别 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {this.type(onDatas.ParkingTraitType)}
                  </Text>
                </Text>
              </View>

              <View>
                <Text>
                  <Text decode className="col1">
                    酒精度 :&nbsp;
                  </Text>
                  <Text className="col2">{onDatas.BuyBackModel.Vol}</Text>
                </Text>
                <Text>
                  <Text decode className="col1">
                    净含量 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {onDatas.BuyBackModel.NetContent}
                  </Text>
                </Text>
              </View>
              <View>
                <Text>
                  <Text decode className="col1">
                    进口 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {onDatas.BuyBackModel.IsImport == 1 ? "是" : "否"}
                  </Text>
                </Text>
                <Text>
                  <Text decode className="col1">
                    产地 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {this.origin(onDatas.BuyBackModel)}
                  </Text>
                </Text>
              </View>
              <View>
                <View>
                  <Text decode className="col1">
                    原料 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {onDatas.BuyBackModel.RawMaterial}
                  </Text>
                </View>
              </View>
              {onDatas.BuyBackModel.Storage && (
                <View>
                  <View>
                    <Text decode className="col1">
                      储存 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.BuyBackModel.Storage}</Text>
                  </View>
                </View>
              )}
              {onDatas.BuyBackModel.GeneralLevel && (
                <View>
                  <View>
                    <Text decode className="col1">
                      标准/等级 :&nbsp;
                    </Text>
                    <Text className="col2">
                      {onDatas.BuyBackModel.GeneralLevel}
                    </Text>
                  </View>
                </View>
              )}
              {onDatas.BuyBackModel.License && (
                <View>
                  <View>
                    <Text decode className="col1">
                      生产许可证号 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.BuyBackModel.License}</Text>
                  </View>
                </View>
              )}
              {onDatas.BuyBackModel.Special && (
                <View>
                  <View>
                    <Text decode className="col1">
                      特色 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.BuyBackModel.Special}</Text>
                  </View>
                </View>
              )}

              {onDatas.Contact && (
                <View>
                  <View>
                    <Text decode className="col1">
                      厂名 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.Contact}</Text>
                  </View>
                </View>
              )}
              {onDatas.Location && (
                <View>
                  <View>
                    <Text decode className="col1">
                      厂址 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.Location}</Text>
                  </View>
                </View>
              )}
              {onDatas.ContactTel && (
                <View>
                  <View>
                    <Text decode className="col1">
                      联系方式 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.ContactTel}</Text>
                  </View>
                </View>
              )}
              {onDatas.Instruction && (
                <View>
                  <View>
                    <Text decode className="col1">
                      描述 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.Instruction}</Text>
                  </View>
                </View>
              )}

              <View>
                <View>
                  <Text decode className="col1">
                    品牌 :&nbsp;
                  </Text>
                  <Text className="col2">{onDatas.BuyBackModel.Brand}</Text>
                </View>
              </View>
              {onDatas.BuyBackModel.Series && (
                <View>
                  <View>
                    <Text decode className="col1">
                      系列 :&nbsp;
                    </Text>
                    <Text className="col2">{onDatas.BuyBackModel.Series}</Text>
                  </View>
                </View>
              )}
              <View>
                <View>
                  <Text decode className="col1">
                    生产日期 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {onDatas.BuyBackModel.ManufactureDate &&
                      onDatas.BuyBackModel.ManufactureDate.split(" ")[0]}
                  </Text>
                </View>
              </View>
              <View>
                <View>
                  <Text decode className="col1">
                    保质日期 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {onDatas.EffectiveTime &&
                      onDatas.EffectiveTime.split(" ")[0]}
                  </Text>
                </View>
              </View>

              <View>
                <View style={{ display: "flex" }}>
                  <Text decode className="col1">
                    地址 :&nbsp;
                  </Text>
                  <View className="col2 address">
                    <Text decode>
                      {onDatas.BuildingModel.Province}&nbsp;
                      {onDatas.BuildingModel.City}&nbsp;
                      {onDatas.BuildingModel.District}&nbsp;
                      {onDatas.BuildingModel.Address}&nbsp;
                    </Text>
                    <View>
                      <Image
                        src={`${imgUrl}icon_map_l.png`}
                        onClick={this.goNavigation.bind(
                          this,
                          onDatas.BuildingModel.Province +
                            onDatas.BuildingModel.City +
                            onDatas.BuildingModel.District +
                            onDatas.BuildingModel.Address
                        )}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ marginBottom: "20rpx" }}>
                <View>
                  <Text decode className="col1">
                    所在仓储 :&nbsp;
                  </Text>
                  <Text className="col2">
                    {onDatas.BuildingModel.BuildingName}
                  </Text>
                </View>
              </View>
            </View>

            {onPage === "al" && (
              <View>
                <View style={{ margin: "20rpx 0rpx" }}>
                  <AtList>
                    {onDatas.BuyBackModel.Usufruct == 0
                      ? onDatas.ProofSaleUrl && (
                          <AtListItem
                            title={
                              onDatas.BuyBackModel.Usufruct == 0
                                ? "区块链资产通凭证销售协议"
                                : "区块链资产通权证销售协议"
                            }
                            className="bot_line"
                            onClick={this.openPDF.bind(
                              this,
                              onDatas.BuyBackModel.Usufruct == 0
                                ? onDatas.ProofSaleUrl
                                : onDatas.WarrantSaleUrl
                            )}
                            extraText="查看"
                            arrow="right"
                          />
                        )
                      : onDatas.WarrantSaleUrl && (
                          <AtListItem
                            title={
                              onDatas.BuyBackModel.Usufruct == 0
                                ? "区块链资产通凭证销售协议"
                                : "区块链资产通权证销售协议"
                            }
                            className="bot_line"
                            onClick={this.openPDF.bind(
                              this,
                              onDatas.BuyBackModel.Usufruct == 0
                                ? onDatas.ProofSaleUrl
                                : onDatas.WarrantSaleUrl
                            )}
                            extraText="查看"
                            arrow="right"
                          />
                        )}

                    {onDatas.LoanContractUrl && (
                      <AtListItem
                        title="区块链资产通借款合同"
                        className="bot_line"
                        onClick={this.openPDF.bind(
                          this,
                          onDatas.LoanContractUrl
                        )}
                        extraText="查看"
                        arrow="right"
                      />
                    )}
                    {onDatas.CreditApplyUrl && (
                      <AtListItem
                        title="个人信用报告查询授权书"
                        className="bot_line"
                        onClick={this.openPDF.bind(
                          this,
                          onDatas.CreditApplyUrl
                        )}
                        extraText="查看"
                        arrow="right"
                      />
                    )}
                  </AtList>
                </View>
              </View>
            )}

            {onPage === "aw" && (
              <View style={{ margin: "20rpx 0rpx" }}>
                <AtList>
                  <AtListItem
                    title="销售协议"
                    className="bot_line"
                    onClick={this.openPDF.bind(this, onDatas.ContractUrl)}
                    extraText="查看"
                    arrow="right"
                  />
                </AtList>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
}
