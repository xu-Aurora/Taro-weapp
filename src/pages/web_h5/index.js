import Taro, { useState, useEffect } from '@tarojs/taro'
import { WebView } from '@tarojs/components'


export default function Index() {

  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(this.$router.preload.h5Url)
  }, [])

  return (
    <WebView src={url} />
  )
}
