const getBaseUrl = () => {
  let BASE_URL = '';
  if (process.env.NODE_ENV === 'development') {
    BASE_URL = 'https://api.yiyatong.net.cn/'
    // BASE_URL = 'https://cs.yiyatong.net.cn/'
  } else {
    // BASE_URL = 'https://cs.yiyatong.net.cn/'
    BASE_URL = 'https://api.yiyatong.net.cn/'       
  }
  return BASE_URL
}

export default getBaseUrl;