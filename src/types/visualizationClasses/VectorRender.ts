import { ParticleSystem, Util } from 'src/types/visualizationClasses/createParticleSystem';
import { VectorRenderInputParams } from './VectorRenderInputParams';
import axios from 'axios';
// 矢量渲染类（用于海洋流场可视化）
class VectorRender {
  private viewer: Cesium.Viewer;
  private _url: string;
  private targetPointLocation!: [number, number];
  private userInput: VectorRenderInputParams;
  private particleSystem!: ParticleSystem | null;
  // 构造函数
  public constructor(viewer: Cesium.Viewer, userInput: VectorRenderInputParams, url: string) {
    // 从参数中获得viewer
    this.viewer = viewer;
    this._url = url;
    // 确保remove primitive之后，不销毁primitive
    this.viewer.scene.primitives.destroyPrimitives = false;
    // 粒子参数赋值
    this.userInput = userInput;
  }
  // 数据请求函数
  private async loadData() {
    const json_data = await axios.get(this._url);
    json_data.data.U.array = new Float32Array(json_data.data.U.array);
    json_data.data.V.array = new Float32Array(json_data.data.V.array);
    json_data.data.lat.array = new Float32Array(json_data.data.lat.array);
    json_data.data.lon.array = new Float32Array(json_data.data.lon.array);
    json_data.data.lev.array = new Float32Array(json_data.data.lev.array);
    return json_data.data;
  }
  public async createParticleSystem() {
    if (this.particleSystem == null) {
      //  设置事件监听
      this.setupEventListeners();
      //   请求数据
      const data = await this.loadData();
      //   创建粒子系统
      this.particleSystem = new ParticleSystem(this.viewer.scene.context, data, this.userInput, {
        // 二维坐标变量
        lonRange: new Cesium.Cartesian2(),
        latRange: new Cesium.Cartesian2(),
        // 像素大小
        pixelSize: 100.0,
      });
      this.targetPointLocation = [
        (data['lon']['max'] + data['lon']['min']) / 2,
        (data['lat']['max'] + data['lat']['min']) / 2,
      ];
    }
    //   添加进地图中
    this.addPrimitives();
    // 调整相机视角，使其飞至并聚焦于粒子系统
    const targetPoint = this.viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(this.targetPointLocation[0], this.targetPointLocation[1]),
      point: {
        // 或者 billboard、label 等其他可视化组件
        pixelSize: 1,
        color: Cesium.Color.RED,
      },
    });
    this.viewer.flyTo(targetPoint, {
      duration: 1.0, // 可选，飞行持续时间（秒）
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0), // 航向，这里设为正北（0度），也可以选择其他角度或保留默认值
        Cesium.Math.toRadians(-90), // 俯仰角设为-90度，即垂直向下
        200000
      ), // 观测高度，保持不变
    });
    setTimeout(() => {
      this.viewer.entities.remove(targetPoint);
    }, 1000);
  }
  // 添加粒子
  private addPrimitives() {
    // the order of primitives.add() should respect the dependency of primitives
    if (
      this.particleSystem.particlesComputing.primitives != null &&
      this.particleSystem.particlesRendering.primitives != null
    ) {
      this.viewer.scene.primitives.add(this.particleSystem.particlesComputing.primitives.calculateSpeed);
      this.viewer.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updatePosition);
      this.viewer.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingPosition);

      this.viewer.scene.primitives.add(this.particleSystem.particlesRendering.primitives.segments);
      this.viewer.scene.primitives.add(this.particleSystem.particlesRendering.primitives.trails);
      this.viewer.scene.primitives.add(this.particleSystem.particlesRendering.primitives.screen);
    }
  }
  // 清除粒子
  public removePrimitives() {
    // the order of primitives.remove() should respect the dependency of primitives
    if (
      this.particleSystem.particlesComputing.primitives != null &&
      this.particleSystem.particlesRendering.primitives != null
    ) {
      this.viewer.scene.primitives.remove(this.particleSystem.particlesComputing.primitives.calculateSpeed);
      this.viewer.scene.primitives.remove(this.particleSystem.particlesComputing.primitives.updatePosition);
      this.viewer.scene.primitives.remove(this.particleSystem.particlesComputing.primitives.postProcessingPosition);

      this.viewer.scene.primitives.remove(this.particleSystem.particlesRendering.primitives.segments);
      this.viewer.scene.primitives.remove(this.particleSystem.particlesRendering.primitives.trails);
      this.viewer.scene.primitives.remove(this.particleSystem.particlesRendering.primitives.screen);
    }
  }

  // 更新ViewerParameters(根据经纬度范围，更新粒子的像素大小)
  private updateViewerParameters() {
    // 获得当前相机的可见矩形范围
    const viewRectangle = this.viewer.camera.computeViewRectangle(this.viewer.scene.globe.ellipsoid);
    // 矩形范围映射至经纬度范围
    const lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle);
    const viewerParameters = {
      // 二维坐标变量
      lonRange: new Cesium.Cartesian2(lonLatRange.lon.min, lonLatRange.lon.max),
      latRange: new Cesium.Cartesian2(lonLatRange.lat.min, lonLatRange.lat.max),
      // 像素大小
      pixelSize: 100.0,
    };
    if (this.particleSystem != null) {
      this.particleSystem.applyViewerParameters(viewerParameters);
    }
  }
  public setDataUrl(url: string): void {
    this.removePrimitives();
    this.particleSystem = null;
    this._url = url;
    //   重新创建粒子系统
    this.createParticleSystem();
  }

  public setUseInpute(useInpute: VectorRenderInputParams): void {
    this.userInput = useInpute;
    if (this.particleSystem != null) {
      this.particleSystem.applyUserInput(this.userInput);
    }
  }

  // 设置监听函数
  private setupEventListeners(): void {
    // 相机开始移动时，不渲染primitives
    this.viewer.camera.moveStart.addEventListener(() => {
      this.viewer.scene.primitives.show = false;
    });
    // 相机停止移动时，更新ViewerParameters
    this.viewer.camera.moveEnd.addEventListener(() => {
      this.updateViewerParameters();
      // 渲染primitives
      this.viewer.scene.primitives.show = true;
    });
    // // 粒子系统参数改变时的事件
    // window.addEventListener('particleSystemOptionsChanged', function () {
    //     that.particleSystem.applyUserInput(this.userInput);
    // });
  }
}

export { VectorRender };
