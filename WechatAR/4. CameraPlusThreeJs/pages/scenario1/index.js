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
      this.initWebGLScene();
    });
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

    //创建渲染器,指定渲染器背景透明
    var renderer = new THREE.WebGLRenderer({
      canvas: this._webGLCanvas,
      alpha:true
    });
    //设置渲染器大小
    this._renderer = renderer;
    this._renderer.setSize(this._webGLCanvas.width, this._webGLCanvas.height);
    //记录当前时间
    var lastTime = Date.now();
    this._lastTime = lastTime;
    //开始渲染
    this.renderWebGL(cube);
  },
  /**
   * 渲染函数
   */
  renderWebGL: function (cube) {
    //获取当前一帧的时间
    var now = Date.now();
    //计算时间间隔,由于Date对象返回的时间是毫秒，所以除以1000得到单位为秒的时间间隔
    var duration = (now - this._lastTime) / 1000;
    //打印帧率
    console.log(1 / duration + 'FPS');
    //重新赋值上一帧时间
    this._lastTime = now;
    //旋转Cube对象，这里希望每秒钟Cube对象沿着Y轴旋转180度（Three.js中用弧度标是，所以是Math.PI）
    cube.rotation.y += duration * Math.PI;

    //渲染执行场景，指定摄像头看到的画面
    this._renderer.render(this._scene, this._camera);
    //设置帧回调函数，并且每一帧调用自定义的渲染函数
    this._webGLCanvas.requestAnimationFrame(() => {
      this.renderWebGL(cube);
    });
  }
})
