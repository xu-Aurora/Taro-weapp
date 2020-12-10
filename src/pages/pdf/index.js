import Taro, { useState, useEffect } from "@tarojs/taro";
import { WebView } from "@tarojs/components";
import { set } from "@/global_data";

export default function Index() {
  const [url, setUrl] = useState("");
  const [display, setDisplay] = useState();

  useEffect(() => {
    setUrl(this.$router.preload.url);
    setDisplay(this.$router.preload.display);
  }, []);

  const handleMessage = e => {
    const { data } = e.detail;
    console.log(data);
    if (Object.keys(data[0])[0].includes(1)) {
      set("isAgree1", data[0].btn1);
    } else if (Object.keys(data[0])[0].includes(2)) {
      set("isAgree2", data[0].btn2);
    }
  };

  return (
    <WebView
      src={`https://zctfile.yiyatong.net.cn/H5Html/demo.html?url=${url}&display=${display}`}
      // src={`https://file.yiyatong.net.cn/H5Html/demo.html?url=${url}&display=${display}`}
      onMessage={handleMessage}
    />
  );
}
