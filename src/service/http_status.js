
const HTTP_STATUS = {
  SUCCESS: 200,           // 请求成功
  NOT_LOODED: 300,        // 登陆超时、未登录
  SERVER_ERROR: 500,      // 服务异常
  CLIENT_ERROR: 400,       // 请求失败
  NO_JSON_CIRCLE: 405      // 未加入商圈
}

export default HTTP_STATUS