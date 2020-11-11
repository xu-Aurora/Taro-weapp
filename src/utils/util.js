import Taro from '@tarojs/taro'


/** 千位逗号分割
 * @param {*} num   数字
 * @param {*} fixed   保留几位小数
 */
export function splitThousand(num, fixed) {
  if (typeof num !== "number") {
    num = parseFloat(num)
  }
  var reg = /\B(?=(\d{3})+$)/g
  num = num.toString().split(".")
  fixed = fixed == undefined ? 2 : fixed

  num[0] = num[0].replace(reg, ",")
  num[1] = num[1] ? num[1].substr(0, fixed) : "00000000000000000".substr(0, fixed)
  if (num[1].length === 1) {
    num[1] = `${num[1]}0`
  }
  return fixed ? num.join(".") : num[0]
}


//服务器图片路径
export const imgUrl = 'http://cwt.yiyatong.net.cn:8087/system/weapp-image/'


//正则校验
export const phoneReg = /^\d{11}$/
export const idCardReg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/

//祛除首尾空格
export function trim(params) {
  return params.replace(/(^\s*)|(\s*$)/g, "")
}

/** 判断数据类型
 *
 * @param {*} tgt 目标数据
 * @param {*} type 数据类型
 */
export function DataType(tgt, type) {
  const dataType = Object.prototype.toString.call(tgt).replace(/\[object /g, "").replace(/\]/g, "").toLowerCase();
  return type ? dataType === type : dataType;
}

/** 判断对象、数组非空
 * 
 * @param {*} tgt 目标数据 
 */
export function nonEmpty(tgt) {
  if (DataType(tgt, 'array')) {
    return JSON.stringify(tgt) !== '[]'
  } else if (DataType(tgt, 'object')) {
    return JSON.stringify(tgt) !== '{}'
  }
}

/** 判断一个值是否为空
 * 
 * 如果是undefined，null，''，NaN，false，0，[]，{}，空白字符串，都返回true，否则返回false
 * @param {*} v 被判断的值
 */
export const isEmpty = (v) => {
  switch (typeof v) {
    case 'undefined':
      return true;
    case 'string':
      if (v.replace(/(^[ \t\n\r]*)|([ \t\n\r]*$)/g, '').length == 0) return true;
      break;
    case 'boolean':
      if (!v) return true;
      break;
    case 'number':
      // eslint-disable-next-line no-restricted-globals
      if (0 === v || isNaN(v)) return true;
      break;
    case 'object':
      if (null === v || v.length === 0) return true;
      for (var i in v) {
        return false;
      }
      return true;
  }
  return false;
}


// 获取当前页url
export function getCurrentPageUrl() {
  let pages = Taro.getCurrentPages()
  let currentPage = pages[pages.length - 1]
  let url = currentPage.route
  return url
}



//节流，防止多次点击
export function throttle(fn, wait = 1500) {
  // 上一次执行 fn 的时间
  let previous = 0
  // 将 throttle 处理结果当作函数返回
  return function(...args) {
    // 获取当前时间，转换成时间戳，单位毫秒
    let now = +new Date()
    // 将当前时间和上一次执行函数的时间进行对比
    // 大于等待时间就把 previous 设置为当前时间并执行函数 fn
    if (now - previous > wait) {
      previous = now
      fn.apply(this, args)
    }
  }
}



//防抖函数
export function debounce(func, wait = 1000) {
  let timeout;
  return function () {
      let context = this;
      let args = arguments;

      if (timeout) clearTimeout(timeout);
      
      timeout = setTimeout(() => {
          func.apply(context, args)
      }, wait);
  }
}

//获取今天的日期
export function todayDate() {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth()+1
  let day = date.getDate()
  let dates = `${year}-${month}-${day}`
  return dates
}

//乘法
export function accMul(arg1,arg2) {
  arg1 = arg1 || ''
  arg2 = arg2 || ''
  var m=0,s1=arg1.toString(),s2=arg2.toString();
  try{m+=s1.split(".")[1].length}catch(e){}
  try{m+=s2.split(".")[1].length}catch(e){}
  return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}
//加法
export function accAdd(arg1,arg2){
  var r1,r2,m;
  try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
  try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
  m=Math.pow(10,Math.max(r1,r2))
  return (arg1*m+arg2*m)/m
}
//减法
export function Subtr(arg1,arg2) {
  var r1,r2,m,n;
  try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
  try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
  m=Math.pow(10,Math.max(r1,r2));
  n=(r1>=r2)?r1:r2;
  return ((arg1*m-arg2*m)/m).toFixed(n);
}
export function mul(a, b) {
  var c = 0,
      d = a.toString(),
      e = b.toString();
  try {
      c += d.split(".")[1].length;
  } catch (f) {}
  try {
      c += e.split(".")[1].length;
  } catch (f) {}
  return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
}
//除法
export function numDiv(a, b) {
  var c, d, e = 0,
  f = 0;
  try {
    e = a.toString().split(".")[1].length;
  } catch (g) {}
  try {
    f = b.toString().split(".")[1].length;
  } catch (g) {}
  return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
}

