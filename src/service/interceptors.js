import Taro from "@tarojs/taro";
import HTTP_STATUS from "./http_status";
// import getBaseUrl from './baseUrl'
import { toast } from "../global_data";

const customInterceptor = chain => {
  let requestParams = chain.requestParams;

  // 用来解决一个页面多个请求，造成多个loading展示问题
  if (!requestParams.url.includes("existLoading")) {
    Taro.showLoading({ title: "loading...", mask: true });
  }

  return chain
    .proceed(requestParams)
    .then(res => {
      if (res) {
        if (res.data.code === HTTP_STATUS.NOT_LOODED) {
          // 登陆超时

          toast(res.data.info, "none", 2000).then(() => {
            setTimeout(() => {
              Taro.redirectTo({
                url: "../login/index"
              });
            }, 1500);
          });

          return res;
        } else if (res.data.code === HTTP_STATUS.SUCCESS) {
        } else if (res.data.code == 800) {
        } else {
          toast(res.data.info, "none", 2000).then(() => {
            return res && res;
          });
        }

        Taro.hideLoading();
        return res && res;
      }
    })
    .catch(() => {
      Taro.reLaunch({
        url: "../no_serve/index"
      });
      Taro.hideLoading();
    });
};

// Taro 提供了两个内置拦截器
// logInterceptor - 用于打印请求的相关信息
// timeoutInterceptor - 在请求超时时抛出错误。
const interceptors = [customInterceptor];

export default interceptors;
