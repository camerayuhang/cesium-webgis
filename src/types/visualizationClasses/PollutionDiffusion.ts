class PollutionDiffusion {
  // 污染扩散的圆心点位置
  private _lon: number;
  private _lat: number;
  private particleSystem!: Cesium.ParticleSystem;
  private viewer: Cesium.Viewer;
  public constructor(viewer: Cesium.Viewer, lon = -45, lat = 28) {
    this._lon = lon;
    this._lat = lat;
    this.viewer = viewer;
  }
  // 设置污染源中心中心
  public setCenter(lon: number, lat: number): void {
    this._lon = lon;
    this._lat = lat;
  }
  // 通过canvas绘制粒子
  private setParticleImage(canvasId: string): HTMLCanvasElement {
    // 获取指定canvasId的canvas标签
    let particleCanvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (particleCanvas == null) {
      // 没有，则创建一个新的canvas标签
      particleCanvas = document.createElement('canvas');
      particleCanvas.id = canvasId;
    }
    // 指定canvas宽高
    particleCanvas.width = 20;
    particleCanvas.height = 20;
    const context2D = particleCanvas.getContext('2d');
    if (context2D == null) {
      return particleCanvas;
    }
    // 绘制圆形
    context2D.beginPath();
    context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
    context2D.closePath();
    context2D.fillStyle = 'rgb(255, 255, 255)';
    context2D.fill();
    return particleCanvas;
  }

  // 创建粒子系统
  public createParticleSystem(): void {
    // 得到viewer对象
    const viewer = this.viewer;
    // 设置一个随机种子
    Cesium.Math.setRandomNumberSeed(2);
    // 设置一个模型转换矩阵，这用于将某个对象放置在地球的具体位置上（对象的局部坐标*转换矩阵=地球上的位置）
    const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      // 这种变换得到的笛卡尔坐标系，默认是以地球中心为原心的
      Cesium.Cartesian3.fromDegrees(this._lon, this._lat)
    );
    // 得到一个逆变换矩阵（将粒子从世界坐标系--->局部坐标系）
    const worldToParticle = Cesium.Matrix4.inverseTransformation(modelMatrix, new Cesium.Matrix4());
    // 设置粒子的像素大小
    const particlePixelSize = new Cesium.Cartesian2(15.0, 15.0);
    // 粒子渲染行为的回调函数
    const particleUpdateCallback = function (particle: any, dt: number) {
      // 将粒子在地球上的位置转换到局部位置上（逆过程）
      const position = Cesium.Matrix4.multiplyByPoint(worldToParticle, particle.position, new Cesium.Cartesian3());
      // 判断粒子在局部坐标系内，是否超出范围
      if (position.z >= 5000 || position.z <= -5000) {
        particle.life = 0;
      }
    };
    // 返回粒子系统对象
    this.particleSystem = new Cesium.ParticleSystem({
      image: this.setParticleImage('pollutionDiffusion'), //粒子渲染的模板，这里是一个圆
      startColor: Cesium.Color.RED, //粒子开始颜色
      endColor: Cesium.Color.GREEN, //粒子结束颜色
      particleLife: 50, //粒子生命周期
      speed: 10000, //粒子的初始速度
      imageSize: particlePixelSize, //粒子图像的大小
      emissionRate: 200, //每秒渲染多少粒子
      emitter: new Cesium.SphereEmitter(100), //球形发射器
      lifetime: 100, //粒子系统的总寿命
      updateCallback: particleUpdateCallback, //粒子系统更新时的回调函数
      // 矩阵的作用，就是得到particleToWorld，实现粒子从局部坐标转换到地球坐标
      modelMatrix: modelMatrix,
    });
    // 调整相机视角，使其飞至并聚焦于粒子系统
    const targetPoint = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(this._lon, this._lat),
      point: {
        // 或者 billboard、label 等其他可视化组件
        pixelSize: 1,
        color: Cesium.Color.RED,
      },
    });
    viewer.flyTo(targetPoint, {
      duration: 1.0, // 可选，飞行持续时间（秒）
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0), // 航向，这里设为正北（0度），也可以选择其他角度或保留默认值
        Cesium.Math.toRadians(-90), // 俯仰角设为-90度，即垂直向下
        500000
      ), // 观测高度，保持不变
    });
    setTimeout(() => {
      viewer.entities.remove(targetPoint);
    }, 1000);

    // 添加到地图上
    viewer.scene.primitives.add(this.particleSystem);
  }

  public removeParticleSystem(): void {
    const viewer = this.viewer;
    // 清除
    viewer.scene.primitives.remove(this.particleSystem);
  }
}
export { PollutionDiffusion };
