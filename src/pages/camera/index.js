// import Taro, { PureComponent } from '@tarojs/taro'
// import { View, Camera, CoverView, CoverImage } from '@tarojs/components'
// import { AtButton } from 'taro-ui'
// import { toast } from '../../global_data'
// import { imgUrl } from '../../utils/util'
// import baseURL from '../../service/baseUrl'
// import './index.scss'

// let time
// let num = 0

// export default class Index extends Taro.PureComponent {

//   config = {
//     navigationBarTitleText: '人证核实'
//   }

//   constructor () {
//     super(...arguments)

//     this.state = {
//       flag: false,
//       dis: false,
//       second: 5,
//       display: 'visible',
//       height: '100%'
//     }
//   }

//   componentDidShow() {
//     let sysinfo = Taro.getSystemInfoSync()
//     if (sysinfo.model == 'iPhone 6' || sysinfo.model == 'iPhone 7' || sysinfo.model == 'iPhone 8' || sysinfo.model == 'iPhone 6/7/8') {
//       this.setState({
//         height: '113%'
//       })
//     } else {
//       this.setState({
//         height: '100%'
//       })
//     }
//     let s = 5, t = this, ctx = Taro.createCameraContext();
//     t.setState({
//       display: 'visible'
//     })
//     Taro.getSetting({
//       success: (r) => {
//         if (!r.authSetting['scope.camera']) {
//           let timer = setInterval(() => {
//             s--;
//             t.setState({
//               second: s
//             })
//             if(s === 0){
//               clearTimeout(timer);
//               t.setState({
//                 display: 'hidden'
//               })
//             }
//           }, 1000)

//           Taro.authorize({
//             scope: 'scope.camera',
//             success (r2) {
//               if (r2.errMsg == 'authorize:ok') {
//                 t.setState({
//                   flag: true
//                 }, () => {
//                   time = setInterval(() => {
//                     if (num < 5) {
//                       ctx.takePhoto({
//                         quality: 'high',
//                         success: (res) => {
//                           Taro.showLoading({title: '人证核实中...'})
//                           Taro.uploadFile({
//                             url: `${baseURL()}Modules/UserInfo/FaceCompare`,
//                             filePath: res.tempImagePath,
//                             name: 'file',
//                             formData: {
//                               LoginMark: Taro.getStorageSync('uuid'),
//                               Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
//                               OrderCode: t.$router.preload.datas.OrderCode
//                             },
//                             success (res1){
//                               num += 1
//                               if (JSON.parse(res1.data).code === 200) {
//                                 Taro.hideLoading()
//                                 toast('核实成功','success',2000).then(() => {
//                                   setTimeout(() => {
//                                     if (t.$router.preload.payType === 5) {                    // 从首付
//                                       t.$preload({
//                                         datas: t.$router.preload.datas,
//                                         payType: 5,
//                                         pages1: 'first_pay',
//                                         DownPayMent: t.$router.preload.DownPayMent,
//                                         loanData: t.$router.preload.loanData
//                                       })
//                                       Taro.navigateTo({
//                                         url: '../pay/index'
//                                       })
//                                     } else if (t.$router.preload.payType === 'buy_back') {    // 申请回购
//                                       this.$preload({
//                                         datas: this.$router.preload.datas
//                                       })
//                                       Taro.navigateTo({
//                                         url: '../buy_back/index'
//                                       })
//                                     } else {                                                  // 资产购买
//                                       t.$preload({
//                                         inPage: t.$router.preload.pages1,
//                                         payType: t.$router.preload.payType,
//                                         datas: t.$router.preload.datas,
//                                         type: t.$router.preload.type,
//                                         pages1: t.$router.preload.pages1
//                                       })
//                                       Taro.navigateTo({
//                                         url: '../pay/index'
//                                       })
//                                     }

//                                     clearInterval(time)
//                                     Taro.hideLoading()
//                                   }, 1000)
//                                 })
//                               }else{
//                                 toast(JSON.parse(res1.data).info,'none',1000)
//                               }
//                             }
//                           })
//                         }
//                       })
//                     } else {
//                       toast('人证核实未通过！','none',1500)
//                     }
//                   }, 5000)
//                 })
//               }
//             },
//             fail: function(r1) {
//               //第一次进来拒绝授权
//               if (r1.errMsg == 'authorize:fail auth deny') {
//                 Taro.navigateBack({ delta: 1})
//               }else if(r1.errCode == '0') {
//                 //拒绝之后再进入
//                 t.setState({
//                   dis: true
//                 })
//               }
//             }
//           })
//         } else {
//           t.setState({
//             flag: true
//           },() => {
//             let timer = setInterval(() => {
//               s--;
//               t.setState({
//                 second: s
//               })
//               if(s === 0){
//                 clearTimeout(timer);
//                 t.setState({
//                   display: 'hidden'
//                 })
//               }
//             }, 1000)
//             time = setInterval(() => {
//               if (num < 5) {
//                 ctx.takePhoto({
//                   quality: 'high',
//                   success: (res) => {
//                     Taro.showLoading({title: '人证核实中...'})
//                     Taro.uploadFile({
//                       url: `${baseURL()}Modules/UserInfo/FaceCompare`,
//                       filePath: res.tempImagePath,
//                       name: 'file',
//                       formData: {
//                         LoginMark: Taro.getStorageSync('uuid'),
//                         Token: JSON.parse(Taro.getStorageSync('userInfo')).token,
//                         OrderCode: t.$router.preload.datas.OrderCode
//                       },
//                       success (res1){
//                         num += 1
//                         if (JSON.parse(res1.data).code === 200) {
//                           Taro.hideLoading()
//                           toast('核实成功','success',2000).then(() => {
//                             if (t.$router.preload.payType === 5) {   // 从首付跳转过来
//                               t.$preload({
//                                 datas: t.$router.preload.datas,
//                                 payType: 5,
//                                 pages1: 'first_pay',
//                                 DownPayMent: t.$router.preload.DownPayMent,
//                                 loanData: t.$router.preload.loanData
//                               })
//                               Taro.navigateTo({
//                                 url: '../pay/index'
//                               })
//                             } else if (t.$router.preload.payType === 'buy_back') {
//                               this.$preload({
//                                 datas: this.$router.preload.datas,
//                               })
//                               Taro.navigateTo({
//                                 url: '../buy_back/index'
//                               })
//                             } else {                                   // 从资产购买跳转过来
//                               t.$preload({
//                                 inPage: t.$router.preload.pages1,
//                                 payType: t.$router.preload.payType,
//                                 datas: t.$router.preload.datas,
//                                 type: t.$router.preload.type,
//                                 pages1: t.$router.preload.pages1
//                               })
//                               Taro.navigateTo({
//                                 url: '../pay/index'
//                               })
//                             }

//                             clearInterval(time)
//                             Taro.hideLoading()
//                           })
//                         }else{
//                           toast(JSON.parse(res1.data).info,'none',1000)
//                         }
//                       }
//                     })
//                   }
//                 })
//               } else {
//                 toast('人证核实未通过！','none',1500)
//               }
//             }, 5000)
//           })
//         }
//       },
//       fail: function(rr) {
//         console.log(rr)
//       }
//     })
//   }


//   componentWillUnmount() {
//     clearInterval(time)
//     Taro.hideLoading()
//     num = 0
    
//   }

//   openSet () {
//     Taro.openSetting()
//   }


//   render () {
//     const { flag, dis, second, display, height } = this.state
//     let status = null
//     if (flag) {
//       status = (
//         <View style={{width: '100%',height: '100%'}}>
//           <Camera
//             device-position='front'
//             frame-size='medium'
//             flash='off'
//             binderror='error'
//             className='camera1'
//           >
//             <CoverView className='boxs'>
//               <CoverView className='imgBox'>
//                 <CoverImage 
//                   style={{height: height}} 
//                   className='bgImg' 
//                   src={`${imgUrl}pic_photobg.png`}
//                 />
//               </CoverView>
              
//             </CoverView>
//           </Camera>
//           <CoverView className='top'>
//             <CoverView className='tips'>
//               <CoverView className='a'>请确保本人操作</CoverView>
//               <CoverView>正对手机，并确保光线充足</CoverView>
//             </CoverView>
//             <CoverView className='s' style={{display: display}}>{ second }</CoverView>
//           </CoverView>
              
//           <CoverView className='bottom'>
//             <CoverView className='item'>
//               <CoverView className='t'><CoverImage className='img' src={`${imgUrl}pic_01.png`} /></CoverView>
//               <CoverView>不能佩戴墨镜</CoverView>
//             </CoverView>
//             <CoverView className='item'>
//               <CoverView className='t'><CoverImage className='img' src={`${imgUrl}pic_02.png`} /></CoverView>
//               <CoverView>不能遮挡脸部</CoverView>
//             </CoverView>
//             <CoverView className='item'>
//               <CoverView className='t'><CoverImage className='img' src={`${imgUrl}pic_03.png`} /></CoverView>
//               <CoverView>不能仰头俯拍</CoverView>
//             </CoverView>
//           </CoverView>
//         </View>
//       )
//     } 
//     return (
//       <View class='container'>
//         {/* <View onClick={this.goPay}>支付</View> */}
//         {status}

//         {
//           dis && <AtButton type='primary' onClick={this.openSet.bind(this)}>打开权限设置</AtButton>
//         }


//       </View>
//     )
//   }
// }
