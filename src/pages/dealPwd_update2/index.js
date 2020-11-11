import Taro, { useState, useEffect } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtInput, AtButton } from 'taro-ui'
import md5 from 'js-md5'
import api from '../../api/api'
import { throttle } from '../../utils/util'
import { get, toast } from '../../global_data'
import Header from '../../components/header/header'
import '../pwd_update/index.scss'


export default function Index() {
  
  Index.config = {
    navigationStyle: 'custom'
  }

  const [title] = useState('交易密码修改')
  const [num] = useState(1)
  const [navType] = useState('backHome')
  const [newDealPwd, setNewDealPwd] = useState('')
  const [sureDealPwd, setSureDealPwd] = useState('')
  const [code, setCode] = useState('')

  useEffect(() => {
    setCode(this.$router.preload.code)
  }, [])

  const handleChange = (type, e) => {
    if (type === 'newDealPwd') {
      setNewDealPwd(e)
    } else if(type === 'sureDealPwd') {
      setSureDealPwd(e)
    }
  }

  const regx = () => {
    if (newDealPwd === '') {
      toast('请输入交易密码！', 'none', 2000)
      return false
    } else if(sureDealPwd === '') {
      toast('请输入确认密码！', 'none', 2000)
      return false
    } else if(sureDealPwd !== newDealPwd) {
      toast('两次密码不一致!', 'none', 2000)
      return false
    } else {
      return true
    }
  }

  function save1() {
    
    if (regx()) {
      api.updateDealPwd({
        LoginMark: Taro.getStorageSync('uuid'),
        Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
        data: JSON.stringify({
          PayPassword: md5(newDealPwd),
          VerificationCode: code
        })
      }).then(res => {
        if (res.data.code === 200) {
          toast(res.data.info, 'success', 1500).then(() => {
            setTimeout(() => {
              Taro.switchTab({
                url: '../perCenter/index'
              })
              Taro.eventCenter.trigger('getAccountAmt')
            }, 1500)
          })
  
        }
      })
    }

  }


  const save = throttle(save1)

  const titleHeight = get('titleHeight')

  return (
    <View className='boxs'>
      <Header onNum={num} onTitle={title} onNavType={navType} />
      <View className='pwd_update' 
        style={{marginTop: titleHeight,minHeight: `calc(100vh - ${titleHeight})`}}
      >
        <View>
          <AtInput title='新交易密码' type='password'
            placeholder='请输入新密码'
            value={newDealPwd}
            onChange={handleChange.bind(this,'newDealPwd')}
          />
          <AtInput title='确认新密码' type='password'
            placeholder='请输入再次新密码'
            value={sureDealPwd}
            onChange={handleChange.bind(this,'sureDealPwd')}
          />
        </View>
        <View className='footer'>
          <AtButton 
            onClick={save}
            type='primary'
          >保存</AtButton>
        </View>
      </View>
    </View>
  )
}

