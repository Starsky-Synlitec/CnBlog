//index.js

//导入three.js库
import * as THREE from '../../libs/three.js'

//获取应用实例
const app = getApp();

Page({
  data: {
    canvasWidth: 0,
    canvasHeight: 0
  },

  /**
   * 页面加载回调函数
   */
  onLoad: function () {
    //初始化Camera
    this.initCamera();
    //初始化Canvas对象
    this.initWebGLCanvas();
  },
  /**
   * 初始化Canvas对象
   */
  initWebGLCanvas: function () {
    //获取页面上的标签id为webgl的对象，从而获取到canvas对象
    var query = wx.createSelectorQuery();
    query.select('#webgl').node().exec((res) => {
      var canvas = res[0].node;
      this._webGLCanvas = canvas;
      //获取系统信息，包括屏幕分辨率，显示区域大小，像素比等
      var info = wx.getSystemInfoSync();
      this._sysInfo = info;
      //设置canvas的大小，这里需要用到窗口大小与像素比乘积来定义
      this._webGLCanvas.width = this._sysInfo.windowWidth * this._sysInfo.pixelRatio;
      this._webGLCanvas.height = this._sysInfo.windowHeight * this._sysInfo.pixelRatio;
      //设置canvas的样式
      this._webGLCanvas.style = {};
      this._webGLCanvas.style.width = this._webGLCanvas.width.width;
      this._webGLCanvas.style.height = this._webGLCanvas.width.height;
      //设置显示层canvas绑定的样式style数据，页面层则直接用窗口大小来定义
      this.setData({
        canvasWidth: this._sysInfo.windowWidth,
        canvasHeight: this._sysInfo.windowHeight
      });
      //初始化场景
      this.initWebGLScene();
    });
  },
  /**
   * 初始化摄像头
   */
  initCamera:function()
  {
    //获取Camera Coontext对象
    const cContex = wx.createCameraContext();
    //添加帧回调事件监听器
    const listener = cContex.onCameraFrame((frame) => {
      //在回调事件中，拿到每一帧的数据
      var data = new Uint8Array(frame.data);
      //通过RGBA的数据格式生成贴图
      var tex = new THREE.DataTexture(data, frame.width, frame.height, THREE.RGBAFormat);
      tex.needsUpdate = true;//纹理更新
      //清理次摄像头数据的贴图
      if(this._tex != null)
      {
        this._tex.dispose();
      }
      //保留最新帧的贴图
      this._tex = tex;
    });
    //启动监听
    listener.start();
  },
  /**
   * 初始化WebGL场景
   */
  initWebGLScene: function () {
    //创建摄像头
    var camera = new THREE.PerspectiveCamera(60, this._webGLCanvas.width / this._webGLCanvas.height, 1, 1000);
    this._camera = camera;
    //创建场景
    var scene = new THREE.Scene();
    this._scene = scene;

    //创建Cube几何体
    var cubeGeo = new THREE.CubeGeometry(30, 30, 30);
    //创建材质，设置材质为基本材质（不会反射光线，设置材质颜色为绿色）
    var mat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    //创建Cube的Mesh对象
    var cube = new THREE.Mesh(cubeGeo, mat);
    //设置Cube对象的位置
    cube.position.set(0, 0, -100);
    //将Cube加入到场景中
    this._scene.add(cube);

    //创建平面几何
    var planeGeo = new THREE.PlaneGeometry(100,100);
    //创建平面的MEsh
    var plane = new THREE.Mesh(planeGeo,new THREE.MeshBasicMaterial());
    //设置平面的位置，为了不让平面挡住前面的Cube，所以将平面设置的更远了。
    plane.position.set(0,0,-200);
    //旋转平面的方向，正确的显示摄像头画面
    plane.rotation.z = Math.PI;
    plane.rotation.y = Math.PI;
    //将平面加入到场景中
    this._scene.add(plane);

    //创建渲染器,指定渲染器背景透明
    var renderer = new THREE.WebGLRenderer({
      canvas: this._webGLCanvas,
    });
    //设置渲染器大小
    this._renderer = renderer;
    this._renderer.setSize(this._webGLCanvas.width, this._webGLCanvas.height);
    //记录当前时间
    var lastTime = Date.now();
    this._lastTime = lastTime;
    //开始渲染
    this.renderWebGL(cube,plane);
  },
  /**
   * 渲染函数
   */
  renderWebGL: function (cube,plane) {
    //获取当前一帧的时间
    var now = Date.now();
    //计算时间间隔,由于Date对象返回的时间是毫秒，所以除以1000得到单位为秒的时间间隔
    var duration = (now - this._lastTime) / 1000;
    //打印帧率
    //console.log(1 / duration + 'FPS');
    //重新赋值上一帧时间
    this._lastTime = now;
    //旋转Cube对象，这里希望每秒钟Cube对象沿着Y轴旋转180度（Three.js中用弧度标是，所以是Math.PI）
    cube.rotation.y += duration * Math.PI;
    //设置plane的贴图
    if(this._tex != null)
    {
      //当前摄像头贴图存在的时候
      if(plane.material != null)
      {
        //清理上次帧的材质
        plane.material.dispose();
      }
      //用新的贴图生成新的材质赋值给平面对象，并设置为双面材质
      plane.material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, map: this._tex, side:THREE.DoubleSide});
    }
    //渲染执行场景，指定摄像头看到的画面
    this._renderer.render(this._scene, this._camera);
    //设置帧回调函数，并且每一帧调用自定义的渲染函数
    this._webGLCanvas.requestAnimationFrame(() => {
      //启动下一帧渲染
      this.renderWebGL(cube,plane);
    });
  }
})
