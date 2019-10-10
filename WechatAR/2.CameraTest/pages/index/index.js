//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  },
  onLoad: function () {
   //获取视频context
   var cameraContext = wx.createCameraContext();
   //注册帧回调函数
   var listener = cameraContext.onCameraFrame((frame)=>{
     //获取每一帧data的长度
     var data = new Uint8Array(frame.data);
     console.log(data.length);
   });
   //启动监听
   listener.start();
  },
})
