import qs from 'qs'
import request from '../service/http'

export default {
  // 登录
  userLogin(params){
    return request.post(`Modules/UserInfo/UserLogin?${qs.stringify(params)}`)
  },
  // 退出
  loginOut(params){
    return request.post(`Modules/UserInfo/UserLoginOut?${qs.stringify(params)}`)
  },
  // 注册
  register(params){
    return request.post(`Modules/UserInfo/Register?${qs.stringify(params)}`)
  },
  // 获取用户信息
  userInfo(params){
    return request.post(`Modules/UserInfo/UserInfo?${qs.stringify(params)}`)
  },
  // 用户信息修改
  updateUser(params){
    return request.post(`Modules/UserInfo/UpdateUser?${qs.stringify(params)}`)
  },
  // 修改登录密码
  updatePAW(params){
    return request.post(`Modules/UserInfo/ChangePassword?${qs.stringify(params)}`)
  },
  // 重置登录密码
  resetPassword(params){
    return request.post(`Modules/UserInfo/ResetPassword?${qs.stringify(params)}`)
  },
  // 修改交易密码
  updateDealPwd(params){
    return request.post(`Modules/UserInfo/ResetPayPassword?${qs.stringify(params)}`)
  },
  // 设置支付密码
  setPayPassword(params){
    return request.post(`Modules/UserInfo/SetPayPassword?${qs.stringify(params)}`)
  },
  // 获取手机验证码
  gainCode(params){
    return request.post(`Modules/UserInfo/GainCode?${qs.stringify(params)}`)
  },
  // 绑定银行卡
  bindCard(params){
    return request.post(`Modules/UserInfo/BindCard?${qs.stringify(params)}`)
  },
  // 银行卡解绑
  untyingCard(params){
    return request.post(`Modules/UserInfo/UntyingCard?${qs.stringify(params)}`)
  },
  // 获取省市数据
  areaZone(params){
    return request.post(`Modules/SourceInfo/AreaZone?${qs.stringify(params)}`)
  },
  // 行政区域车位数量统计
  areaCount(params){
    return request.post(`Modules/SourceInfo/AreaCount?${qs.stringify(params)}`)
  },
  // 新上架车位(首页,用户未登录也能看到的车位数据)
  newParking(params){
    return request.post(`Modules/SourceInfo/NewParking?${qs.stringify(params)}`)
  },
  // 我的车位
  parking(params){
    return request.post(`Modules/ParkingInfo/Parking?${qs.stringify(params)}`)
  },
  //  我的总资产
  myaAssetst(params){
    return request.post(`Modules/ParkingInfo/MyaAssetst?${qs.stringify(params)}`)
  },
  // 投资车位
  investParking(params){
    return request.post(`Modules/SourceInfo/InvestParking?${qs.stringify(params)}`)
  },
  // 未购买的车位详情
  parkingDetail(params){
    return request.post(`Modules/SourceInfo/ParkingDetail?${qs.stringify(params)}`)
  },
  // 我的的车位详情
  myParkingDetail(params){
    return request.post(`Modules/ParkingInfo/MyParkingDetail?${qs.stringify(params)}`)
  },
  // 楼盘详情
  buildingDetail(params){
    return request.post(`Modules/SourceInfo/BuildingDetail?${qs.stringify(params)}`)
  },
  // 商圈详情
  circleDetail(params){
    return request.post(`Modules/SourceInfo/CircleDetail?${qs.stringify(params)}`)
  },
  // 商圈列表(首页未登录的话,不需要传token,已登录的话传token)
  circle(params){
    return request.post(`Modules/SourceInfo/Circle?${qs.stringify(params)}`)
  },
  // 退出商圈
  quitCircle(params){
    return request.post(`Modules/SourceInfo/QuitCircle?${qs.stringify(params)}`)
  },
  // 加入商圈
  insertCircle(params){
    return request.post(`Modules/SourceInfo/InsertCircle?${qs.stringify(params)}`)
  },
  // 邀请加入商圈
  inviteUsers(params){
    return request.post(`Modules/UserInfo/InviteUsers?${qs.stringify(params)}`)
  },
  // 查找用户
  searchUser(params){
    return request.post(`Modules/UserInfo/SearchUser?${qs.stringify(params)}`)
  },
  // 换绑银行卡
  updateBankCard(params){
    return request.post(`Modules/SourceInfo/UpdateCircle?${qs.stringify(params)}`)
  },
  // 开户行列表
  bankList(params){
    return request.post(`Modules/SourceInfo/BankList?${qs.stringify(params)}`)
  },
  // 提现
  withDraw(params){
    return request.post(`Modules/UserInfo/WithDraw?${qs.stringify(params)}`)
  },
  // 账户信息
  accountAmt(params){
    return request.post(`Modules/UserInfo/AccountAmt?${qs.stringify(params)}`)
  },
  // 商圈收益
  circleProfit(params){
    return request.post(`Modules/UserInfo/CircleProfit?${qs.stringify(params)}`)
  },
  // 首页统计
  statistics(params){
    return request.post(`Modules/Echart/Statistics?${qs.stringify(params)}`)
  },
  // 小区->楼盘类型,车位类型
  buildTraitType(params){
    return request.get(`learun/adms/dataitem/details?${qs.stringify(params)}`)
  },
  // 小区列表
  buildings(params){
    return request.post(`Modules/SourceInfo/Buildings?${qs.stringify(params)}`)
  },
  // 订单列表
  orderList(params){
    return request.post(`Modules/OrderInfo/Order?${qs.stringify(params)}`)
  },
  // 订单详情
  orderDetail(params){
    return request.post(`Modules/OrderInfo/OrderDetails?${qs.stringify(params)}`)
  },
  // 本地订单详情,订单去支付时需要的订单数据
  OrderDetail(params){
    return request.post(`Modules/Trade/OrderDetail?${qs.stringify(params)}`)
  },
  // 全额购买、贷款购买,生成订单
  createOrder(params){
    return request.post(`Modules/Trade/CreateOrder?${qs.stringify(params)}`)
  },
  // 提交订单->用于支付定金
  orderSubmit(params){
    return request.post(`Modules/Trade/OrderSubmit?${qs.stringify(params)}`)
  },
  // 订单支付->用于支付尾款和全额支付
  payNow(params){
    return request.post(`Modules/Trade/PayNow?${qs.stringify(params)}`)
  },
  // 取消
  cancelOrder(params){
    return request.post(`Modules/Trade/CancelOrder?${qs.stringify(params)}`)
  },
  // 车位->挂牌
  attorn(params){
    return request.post(`Modules/Trade/AttornParking?${qs.stringify(params)}`)
  },
  // 车位->摘牌
  cancelAttorn(params){
    return request.post(`Modules/Trade/CancelAttorn?${qs.stringify(params)}`)
  },
  // 车位->支付和转让
  attornPay(params){
    return request.post(`Modules/Trade/AttornPay?${qs.stringify(params)}`)
  },
  // 车位->申请回购
  backBuy(params){
    return request.post(`Modules/Trade/Repurchase?${qs.stringify(params)}`)
  },
  // 车位->取消申请回购
  cancelBackBuy(params){
    return request.post(`Modules/Trade/CancelRepurchase?${qs.stringify(params)}`)
  },
  // 车位->交易记录
  tradeList(params){
    return request.post(`Modules/SourceInfo/TradeList?${qs.stringify(params)}`)
  },
  // 车位->协议详情
  protocol(params){
    return request.post(`Modules/SourceInfo/ProtocolDetail?${qs.stringify(params)}`)
  },
  // 车位->历史账单
  historyBill(params){
    return request.post(`Modules/UserInfo/MyTradeDetail?${qs.stringify(params)}`)
  },
  // 车位->收益明细
  myProfit(params){
    return request.post(`Modules/UserInfo/MyProfit?${qs.stringify(params)}`)
  },
  // 发布->列表
  postList(params){
    return request.post(`Modules/SourceInfo/PostList?${qs.stringify(params)}`)
  },
  // 我的发布列表
  myPostList(params){
    return request.post(`Modules/UserInfo/MyPostList?${qs.stringify(params)}`)
  },
  // 发布->详情
  postDetail(params){
    return request.post(`Modules/SourceInfo/PostDetail?${qs.stringify(params)}`)
  },
  // 发布->新增
  postAdd(params){
    return request.post(`Modules/SourceInfo/AddPost`,params)
  },
  // 发布->删除
  postDel(params){
    return request.post(`Modules/SourceInfo/DeletePost?${qs.stringify(params)}`)
  },
  // 发布->编辑
  postEdit(params){
    return request.post(`Modules/SourceInfo/EditPost`,params)
  },
  // 发布->浏览量
  viewPost(params){
    return request.post(`Modules/SourceInfo/ViewPost?${qs.stringify(params)}`)
  },
  // 贷款购买时，签署授信
  signAgreeMent(params){
    return request.post(`Modules/Trade/SignAgreeMent`,params)
  },
  // ‘我的订单’支付时，签署协议
  signProveMark(params){
    return request.post(`Modules/Trade/SignProveMark`,params)
  },
  // ‘我的订单详情’授信方案获取
  loanScheme(params){
    return request.post(`Modules/Trade/LoanScheme`,params)
  },
  // 申请回购，提示语
  repurchaseMsg(params){
    return request.post(`Modules/Trade/RepurchaseMsg?${qs.stringify(params)}`)
  },
  // 我的车位详情，车位权属证明
  verifyParking(params){
    return request.get(`Modules/ParkingInfo/VerifyParking`,params)
  },
  // 支付首付,获取借款合同
  loanContract(params){
    return request.post(`Modules/Trade/LoanContract`,params)
  },
  // 个人贷款查询
  personalLoan(params){
    return request.post(`Modules/Trade/PersonalLoan?${qs.stringify(params)}`)
  },
  // 还款计划查询
  loanPlan(params){
    return request.post(`Modules/Trade/LoanPlan?${qs.stringify(params)}`)
  },
  // 还贷
  repayLoan(params){
    return request.post(`Modules/Trade/RepayLoan?${qs.stringify(params)}`)
  },
  // 视频人脸认证
  faceVideoCompare(params){
    return request.post(`Modules/UserInfo/FaceVideoCompare?${qs.stringify(params)}`)
  },
  // 获取视频验证随机数
  videoRandom(params){
    return request.post(`Modules/UserInfo/VideoRandom?${qs.stringify(params)}`)
  },
  // 我的购物车
  myCollection(params){
    return request.post(`Modules/SourceInfo/MyCollection?${qs.stringify(params)}`)
  },
  // 加入、移除购物车
  collectionEvent(params){
    return request.post(`Modules/SourceInfo/CollectionEvent?${qs.stringify(params)}`)
  },
  // 判断是否已开通准一类户
  hasOpenAccount(params){
    return request.post(`Modules/UserInfo/IfZSaccount?${qs.stringify(params)}`)
  },
  // 获取准一类户开户H5地址
  h5AddressOfopenAccount(params){
    return request.post(`Modules/UserInfo/OpenZSaccount?${qs.stringify(params)}`)
  },
  // 是否在浙商开户
  ifZSaccount(params){
    return request.post(`Modules/UserInfo/IfZSaccount?${qs.stringify(params)}`)
  },
  faceMsg(){
    return request.post(`Modules/SourceInfo/FaceMsg`)
  },
  // 小区详情模糊搜索
  searchWord(params){
    return request.post(`Modules/SourceInfo/SearchWord?${qs.stringify(params)}`)
  },
}
