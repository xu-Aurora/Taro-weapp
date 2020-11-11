import Taro, { PureComponent } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import {  AtList, AtListItem } from 'taro-ui'
import { imgUrl } from '../../utils/util'
import QQMapWX from '../../assets/js/qqmap-wx-jssdk.min'
import './index.scss'


let qqmapsdk = new QQMapWX({
  key: 'L72BZ-CKOAQ-JQL5X-GA4RA-XJ755-CPBYX'
})

export default class CarInfo extends PureComponent {

  constructor () {
    super(...arguments)
    this.state = {

    }
  }

  Usufruct (val) {
    switch (val) {
      case 1:
        return '只有使用权'
      case 2:
        return '拥有产权'
      case 0:
        return '无使用权'
      default:
        return '暂无'
    }
  }
  renderStatus (val) {
    switch (val) {
      case '0': { return <View className='tag_bisque'>草稿</View> }
      case '1':
        { return <View className='tag_bisque'>上架审批中</View> }
      case '2':
        {return <View className='tag_bisque'>挂牌中</View> }
      case '3':
        {return <View className='tag_bisque'>已下架</View> }
      case '4':
        { return <View className='tag_bisque'>支付锁定中</View> }
      case '5':
        { return <View className='tag_blue'>正常持有</View> }
      case '6':
        { return <View className='tag_bisque'>回购审批中</View> }
      case '7':
        { return <View className='tag_bisque'>已回购</View> }
      case '8':
        { return <View className='tag_bisque'>已注销</View> }
    }
  }

  parkCode (data) {
    let code = null
    if (data!==undefined&&JSON.stringify(data)!=='{}') {
      if (data.BuyBackModel.Usufruct == 0) {
        code = `${data.ParkingCode.slice(0,1)} ***** ${data.ParkingCode.slice(-1)}`
      } else {
        code = data.ParkingCode  
      }
    }
    return code
  }

  openPDF(PDF) {
    let sysinfo = Taro.getSystemInfoSync()
    let isiOS = sysinfo.system.indexOf('iOS') > -1

    let isHUAWEI = sysinfo.brand.toUpperCase().indexOf('HUAWEI') > -1
    let isXIAOMI = sysinfo.brand.toLowerCase().indexOf('xiaomi') > -1

    if (isiOS) {    //ios
      this.$preload({ url: PDF })
      Taro.navigateTo({
        url: '../pdf/index'
      })
    } else if (isHUAWEI || isXIAOMI) {
      Taro.setClipboardData({
        data: PDF,
        success: function () {
          Taro.showModal({
            title: '提示',
            content: '复制成功,请使用浏览器下载浏览',
            showCancel: false
          })
        }
      })
    } else {        //Android
      Taro.downloadFile({
        url: PDF,
        success: function(res1) {
          let Path = res1.tempFilePath
          Taro.openDocument({
            filePath: Path,
            fileType:'pdf',
            success: function() {
              console.log('打开文档成功')
            }
          })
        }
      })
    }
  }
  goNavigation (city) {
    qqmapsdk.geocoder({
      address: city,
      success: function(res) {
        let latitude = res.result.location.lat
        let longitude = res.result.location.lng
        Taro.openLocation({
          latitude,
          longitude,
          name:city,
          scale: 18
        })
      }
    })
  }

  render () {
    const { onDatas, onPage } = this.props
    return (
      <View className='boxs'>

        {
          onDatas && Object.keys(onDatas).length > 10 && 
          <View>
            <View className='topBG'>
              {
                onPage === 'aw' && (
                  (onDatas&&JSON.stringify(onDatas)!=='{}')&&onDatas.BuyBackModel.Usufruct == 0 ? 
                  <View className='bg_pz'>
                    <Image src={`${imgUrl}pic_pz_bg.png`} /> 
                    <View className='left'>
                      <View>{ onDatas.BuyBackModel.FixedRate.toFixed(2) }<Text style={{fontSize:'20rpx'}}>%</Text></View>
                      <View style={{fontSize: '24rpx'}}>年化收益率</View>
                    </View>
                    <View className='right'>
                      <View>{ onDatas.Price ? ((onDatas.Price)/10000).toFixed(2) : 0 }</View>
                      <View style={{fontSize: '24rpx'}}>面额<Text style={{fontSize: '18rpx'}}> (万元)</Text></View>
                    </View>
                  </View>: 
                  <View className='bg_qz'>
                    <Image src={`${imgUrl}pic_qz_bg.png`} />
                    <View>
                      <Text style={{fontSize:'30rpx'}}>挂牌价<Text style={{fontSize: '22rpx'}}> (万元)</Text>：</Text>
                      <Text style={{fontSize:'48rpx'}}>
                        { onDatas.SalePrice ? ((onDatas.SalePrice)/10000).toFixed(2) : 0 }
                      </Text>
                    </View>
                  </View>
                )
              }

            </View>
            <View className='car_info'>

              {/* 车位通信息(回购模式) */}
              {
                (onDatas&&JSON.stringify(onDatas)!=='{}')&&onDatas.BuyBackModel.Usufruct == 0 ? (
                  <View className='buy_back'>
                    <View>
                      <View>
                        <Image src={`${imgUrl}icon_pz.png`} />
                        <Text>区块链车位通凭证信息</Text>
                      </View>
                      <View>
                        {
                          onPage === 'al' && this.renderStatus(onDatas.State) 
                        }
                      </View>
                    </View>
                    <View>
                      <View>
                        <Text className='col1'>编号 : </Text>
                        <Text className='col2' style={{fontSize: '26rpx'}}>
                          { (JSON.stringify(onDatas)!=='{}'&&onDatas)&&onDatas.ParkingId.toUpperCase() }
                        </Text>
                      </View>
                    </View>
                    <View>
                      <View className='left'>
                        <View>
                          <Text className='col1'>面额 : </Text>
                          <Text className='col2'>
                            { onDatas.Price ? ((onDatas.Price)/10000).toFixed(2) : 0 }
                            <Text style={{fontSize: '20rpx'}}> (万元)</Text>
                          </Text>
                        </View>
                        <View>
                          <Text className='col1'>年化收益率 : </Text>
                          <Text className='col2'>{ onDatas&&onDatas.BuyBackModel.FixedRate }<Text style={{fontSize: '20rpx'}}> %</Text></Text>
                        </View>

                      </View>
                      <View className='right'>
                        <View>
                          <Text className='col1'>期限 : </Text>
                          <Text className='col2'>{ onDatas&&onDatas.BuyBackModel.RepoTerm }个月</Text>
                        </View>
                        <View>
                          <Text className='col1'>凭证到期日 : </Text>
                          <Text className='col2'>{ onDatas&&onDatas.LimitDate }</Text>
                        </View>
                      </View>
                    </View>
                    <View>
                      <Text className='col1'>限制转让期 : </Text>
                      <Text className='col2'>三个月</Text>
                    </View>
                  </View>
                ) : (
                  <View className='buy_back'>
                    <View>
                      <View>
                        <Image src={`${imgUrl}icon_qz.png`} />
                        <Text>区块链车位通权证信息</Text>
                      </View>
                    </View>
                    <View>
                      <Text className='col1'>编号 : </Text>
                      <Text className='col2' style={{fontSize:'26rpx'}}>
                        { (JSON.stringify(onDatas)!=='{}'&&onDatas)&&onDatas.ParkingId.toUpperCase() }
                      </Text>
                    </View>
                    <View>
                      <Text className='col1'>权属性质 : </Text>
                      <Text className='col2'> { (JSON.stringify(onDatas)!=='{}'&&onDatas) && this.Usufruct(onDatas.BuyBackModel.Usufruct) }</Text>
                    </View>

                  </View>
                )
              }
              
            </View>

            <View className='bottom'>
              <View style={{fontSize:'36rpx',color:'#3E3E3E'}}>车位信息</View>

              <View>
                <Text>
                  <Text decode className='col1'>车位号 :&nbsp;</Text>
                  <Text className='col2'>{ this.parkCode(onDatas) }</Text>
                </Text>
                <Text>
                  <Text decode className='col1'>类型 :&nbsp;</Text>
                  <Text className='col2'>{ onDatas.ParkingType }</Text>
                </Text>
              </View>
              <View>
                <View>
                  <Text decode className='col1'>面积 :&nbsp;</Text>
                  <Text className='col2'>{ onDatas.Acreage }㎡</Text>
                </View>
              </View>
              <View>
                <View>
                  <Text decode className='col1'>使用 (产权) 期限 :&nbsp;</Text>
                  {
                    onDatas!==undefined && JSON.stringify(onDatas)!=='{}' && <Text className='col2'>{ onDatas&&onDatas.EffectiveTime.split(' ')[0] }</Text>
                  }
                </View>
              </View>
              <View>
                <View>
                  <Text decode className='col1'>所属商圈 :&nbsp;</Text>
                  <Text className='col2'>{ onDatas.CircleName }</Text>
                </View>
              </View>
              <View>
                <View>
                  <Text decode className='col1'>所在小区 :&nbsp;</Text>
                  <Text className='col2'>{ onDatas.BuildingModel.BuildingName }</Text>
                </View>
              </View>
              <View>
                <View style={{display: 'flex'}}>
                  <Text decode className='col1'>地址 :&nbsp;</Text>
                  <View className='col2 address'>
                    <Text decode>
                      { onDatas.BuildingModel.Province }&nbsp;
                      { onDatas.BuildingModel.City }&nbsp;
                      { onDatas.BuildingModel.District }&nbsp;
                      { onDatas.BuildingModel.Address }&nbsp;
                    </Text>
                    <View>
                      <Image 
                        src={`${imgUrl}icon_map_l.png`} 
                        onClick={this.goNavigation.bind(this,(onDatas.BuildingModel.Province+onDatas.BuildingModel.City+onDatas.BuildingModel.District+onDatas.BuildingModel.Address))}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={{marginBottom: '20rpx'}}>
                <View>
                  <Text decode className='col1'>物业管理方 :&nbsp;</Text>
                  <Text className='col2'>{ onDatas.BuildingModel.Property }</Text>
                </View>
              </View>

            </View>

            {
              onPage === 'al' && (
                <View>
                  <View style={{margin: '20rpx 0rpx'}}>
                    <AtList>
                      {
                        onDatas.BuyBackModel.Usufruct == 0 ? (
                          onDatas.ProofSaleUrl && 
                          <AtListItem title={onDatas.BuyBackModel.Usufruct == 0 ? '区块链车位通凭证销售协议' : '区块链车位通权证销售协议'} 
                            className='bot_line'
                            onClick={this.openPDF.bind(this, onDatas.BuyBackModel.Usufruct == 0 ? onDatas.ProofSaleUrl : onDatas.WarrantSaleUrl)}
                            extraText='查看' arrow='right'
                          />
                        ) : (
                          onDatas.WarrantSaleUrl && 
                          <AtListItem title={onDatas.BuyBackModel.Usufruct == 0 ? '区块链车位通凭证销售协议' : '区块链车位通权证销售协议'} 
                            className='bot_line'
                            onClick={this.openPDF.bind(this, onDatas.BuyBackModel.Usufruct == 0 ? onDatas.ProofSaleUrl : onDatas.WarrantSaleUrl)}
                            extraText='查看' arrow='right'
                          />
                        )
                      }

                      {
                        onDatas.LoanContractUrl && 
                        <AtListItem title='区块链车位通借款合同' 
                          className='bot_line'
                          onClick={this.openPDF.bind(this, onDatas.LoanContractUrl)}
                          extraText='查看' arrow='right'
                        />
                      }
                      {
                        onDatas.CreditApplyUrl && 
                        <AtListItem title='个人信用报告查询授权书' 
                          className='bot_line'
                          onClick={this.openPDF.bind(this, onDatas.CreditApplyUrl)}
                          extraText='查看' arrow='right'
                        />
                      }
                    </AtList>
                  </View>
                </View>
              )
            }

            {
              onPage === 'aw' && (
                <View style={{margin: '20rpx 0rpx'}}>
                  <AtList>
                    <AtListItem title='销售协议' 
                      className='bot_line'
                      onClick={this.openPDF.bind(this, onDatas.ContractUrl)}
                      extraText='查看' arrow='right'
                    />
                  </AtList>
                </View>
              )
            }
          </View>
        }


      </View>

    )
  }
}
