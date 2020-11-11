import Taro from '@tarojs/taro'

/**用来全局全变量进行传值
 * set  设置值
 * get  获取值
 */
const globalData = {}

export function set (key, val) {
  globalData[key] = val
}

export function get (key) {
  return globalData[key]
}


/**
 * @param {*} info  提示信息
 * @param {*} icon  icon
 * @param {*} time  展示时间
 * @returns
 */
export function toast(info, icon, time) {
  return (
    Taro.showToast({
      title: info,
      icon,
      duration: time,
      mask: true
    })
  )
}
