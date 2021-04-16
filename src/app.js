import Taro from '@tarojs/taro'
import qs from 'qs'
import getBaseUrl from '@/service/baseUrl'
import { set } from './global_data'
import Index from './pages/index'
// import api from './api/api'

import './app.scss'

class App extends Taro.PureComponent {

  componentWillMount () {
    // 判断是否登录过
    if (Taro.getStorageSync('Account')) {

      const params = {
        LoginMark: Taro.getStorageSync('uuid'),
        data: JSON.stringify({
          Account: Taro.getStorageSync('Account'),
          Password: Taro.getStorageSync('Password')
        })
      }
      Taro.request({
        url: `${getBaseUrl()}Modules/UserInfo/UserLogin?${qs.stringify(params)}`,
        method: 'POST',
        success: (res) => {
          if (res && res.data.Success) {
            let userInfo = {
              userName: res.data.data.RealName,     // 用户名
              headIcon: res.data.data.SvHeadIcon,   // 用户头像
              token: res.data.data.Token            // token
            }
            Taro.setStorageSync('userInfo',JSON.stringify(userInfo))
          }
        },
        fail: () => {
          Taro.reLaunch({
            url: './pages/no_serve/index'
          })
        }
      })
      // api.userLogin({
      //   LoginMark: Taro.getStorageSync('uuid'),
      //   data: JSON.stringify({
      //     Account: Taro.getStorageSync('Account'),
      //     Password: Taro.getStorageSync('Password')
      //   })
      // }).then(res => {
      //   if (res) {  // 服务器部署时，容错判断
      //     if(res.data.code === 200) {
      //       let userInfo = {
      //         userName: res.data.data.RealName,     // 用户名
      //         headIcon: res.data.data.SvHeadIcon,   // 用户头像
      //         token: res.data.data.Token            // token
      //       }
      //       Taro.setStorageSync('userInfo',JSON.stringify(userInfo))
      //     }
      //   }

      // })

    }

    // 获取设备信息
    let sysinfo = Taro.getSystemInfoSync()
    let statusHeight = sysinfo.statusBarHeight
    let isiOS = sysinfo.system.indexOf('iOS') > -1

    let navHeight
    if (!isiOS) {
        navHeight = 48;
    } else {
        navHeight = 44;
    }
    set('statusHeight',statusHeight)
    set('navHeight',navHeight)
    set('titleHeight',`${navHeight+statusHeight}px`)
    set('titleHeight1',navHeight+statusHeight)

  }

  
  config = {
    "pages": [
      "pages/home/index",               // 首页
      "pages/LoanDetails/index",        // 贷款详情
      "pages/myProfit/index",           // 累计收益
      "pages/myCarports/index",         // 我的总资产
      "pages/myCarport/index",          // 我的资产
      "pages/myLoan/index",             // 我的贷款
      "pages/shoppingCar/index",        // 我的购物车
      "pages/videoFiveS/index",         // 录像随机码验证
      "pages/myOrder/index",            // 我的订单
      "pages/no_serve/index",           // 无服务
      // "pages/camera/index",          // 人证核实
      "pages/identityVerify/index",     // 身份验证
      "pages/pdf/index",                // pdf
      // "pages/repay_plan/index",         // 还款计划
      // "pages/repay_info/index",         // 还款信息
      "pages/openSet/index",            // 设置页面
      "pages/user_authorize/index",    // 用户授权
      "pages/parkingIndex/index",       // 车位页面
      "pages/protocol/index",           // 注册协议
      "pages/first_pay/index",          // 首付
      "pages/bindBankCard/index",       // 商圈，绑定浙商银行卡
      "pages/openAccount/index",        // 开户浙商银行卡
      "pages/history_bill/index",       // 历史账单
      // "pages/earn_detail/index",        // 收益明细
      // "pages/trans_record/index",       // 交易记录
      "pages/bank_card/index",          // 银行卡
      "pages/bank_card_add/index",      // 银行卡添加
      // "pages/total_account/index",      // 总账户
      "pages/buy_back/index",           // 回购
      "pages/carport_pay/index",        // 车位支付、转让
      "pages/bank_bind_update/index",   // 银行卡绑定修改
      "pages/withdraw/index",           // 提现
      "pages/invite_join/index",        // 邀请会员加入、车位搜索付款对象
      "pages/busArea/index",            // 我的商圈
      "pages/circle/index",             // 商圈
      "pages/community/index",          // 小区
      "pages/pay_success/index",        // 支付成功
      "pages/pay_fail/index",           // 支付失败
      "pages/pay/index",                // 支付
      "pages/full_buy/index",           // 订单确认
      "pages/c_detail/index",           // 小区详情
      "pages/comm_derail/index",        // 楼盘详情
      "pages/login/index",              // 登录
      "pages/first_login/index",        // 第一次登录
      // "pages/Listing/index",         // 挂牌
      "pages/car_detail/index",         // 车位详情->未购买
      "pages/myCarport_detail/index",   // 我的车位详情->已购买
      "pages/pwd_update/index",         // 修改登录密码
      "pages/reset_pwd/index",          // 重置登录密码
      "pages/phone_update/index",       // 修改手机号
      "pages/perInfo/index",            // 个人信息
      "pages/userId_update/index",      // 证件上传    
      "pages/order_detail/index",       // 订单详情
      // "pages/oreder_record/index",   // 订单记录
      "pages/perCenter/index",          // 个人中心
      "pages/bank_card_untie/index",    // 银行卡解绑
      "pages/set_dealPwd/index",        // 设置交易密码
      "pages/dealPwd_update2/index",    // 交易密码修改
      "pages/dealPwd_update1/index",    // 交易密码修改
      "pages/more/index",               // 个人中心->更多
      "pages/register/index",           // 注册
      "pages/login_hint/index",         // 登录提示
      "pages/aw_bus_detail/index",      // 商圈详情->为加入商圈
      "pages/al_bus_detail/index",      // 商圈详情->已加入商圈
      "pages/web_h5/index"              // h5准一开户
    ],
    "window": {
      "backgroundTextStyle": "dark",
      "navigationBarBackgroundColor": "#fff",
      "navigationBarTextStyle": "black",
      "backgroundColor": "#F5F6FA",
      "disableScroll": true,
      "enablePullDownRefresh": false
    },
    "subPackages": [
      {
        "root": "pages/issue/",   // “发布”包
        "pages": [
          "pages/home/index",       // 首页
          "pages/release/index",    // 发布
          "pages/myRelease/index",  // 我的发布
          "pages/detail/index",     // 详情
          "pages/add/index",        // 新增
          "pages/edit/index",       // 编辑
          "pages/showImg/index",    // 展示图片
        ]
      },
      {
        "root": "pages/map/",       //“地图”包
        "pages": [
          "pages/home/index",       //首页
        ]
      }
    ],
    "sitemapLocation": "sitemap.json",
    "networkTimeout": {
      "request": 30000
    },
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于小程序位置接口的效果展示"
      }
    },
    "debug": false,
    "tabBar": {
      "color": "#8a8a8a",
      "selectedColor": "#2c2c2c",
      "borderStyle": "white",
      "backgroundColor": "#fff",
      "borderStyle": "black",
      "list": [
        {
          "pagePath": "pages/home/index",
          "iconPath": "assets/images/tabBar/home.png",
          "selectedIconPath": "assets/images/tabBar/home-active.png",
          "text": "首页"
        },
        {
          "pagePath": "pages/busArea/index",
          "iconPath": "assets/images/tabBar/bus.png",
          "selectedIconPath": "assets/images/tabBar/bus-active.png",
          "text": "我的商圈"
        },
        {
          "pagePath": "pages/myCarports/index",
          "iconPath": "assets/images/tabBar/park.png",
          "selectedIconPath": "assets/images/tabBar/park-active.png",
          "text": "我的总资产"
        },
        {
          "pagePath": "pages/perCenter/index",
          "iconPath": "assets/images/tabBar/my.png",
          "selectedIconPath": "assets/images/tabBar/my-active.png",
          "text": "个人中心"
        }
      ]
    }
  }


  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
