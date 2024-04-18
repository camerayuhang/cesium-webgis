import kriging from 'js-kriging';
import axios from 'axios';
import { ScalarDataStruct } from './Scalar';
import { useVisualizationOptionsStore } from 'src/stores/VisualizationOptionsStore';
// 标量渲染类（用于海洋温度、盐度等等标量的渲染）
class ScalarRender {
  private _url: string;
  private viewer: Cesium.Viewer;
  private scalarField!: Cesium.ImageryLayer;
  private rectangle!: Cesium.Rectangle;
  private canvas!: HTMLCanvasElement | null;

  public constructor(viewer: Cesium.Viewer, url: string) {
    this._url = url;
    this.viewer = viewer;
  }

  //请求数据
  private async loadData(): Promise<ScalarDataStruct> {
    const data = await axios.get(this._url);
    return data.data;
  }
  //设置数据源的url
  public updateDataUrl(url: string) {
    this._url = url;
    this.canvas = null;
  }

  public async createScalarField(): Promise<void> {
    const visualizationOptionsStore = useVisualizationOptionsStore();
    visualizationOptionsStore.scalarFieldIsLoading = true;
    // 判断是否canvas是有效的
    if (this.canvas !== undefined && this.canvas !== null) {
      this.addScalarField();
      visualizationOptionsStore.scalarFieldIsLoading = false;
      return;
    }
    // 创建canvas标签
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'scalarRender';
    const Data = await this.loadData(); //获取数据
    const bounds: number[][] = Data.bounds;
    const myBound = [bounds]; //获取范围
    myBound[0].push(bounds[0]);
    // 创建一个webworker
    const worker = new Worker('src/webWorker/ScalarRenderWorker.ts', { type: 'module' });
    // 传递数据
    worker.postMessage({ dataList: Data.data, myBound: myBound });
    // 监听处理结果
    worker.addEventListener('message', (event) => {
      const grid = event.data;
      const colors = [
        'rgba(0,0,0,0)',
        'rgba(0,0,0,0)',
        'rgba(0,0,0,0)',
        'rgba(0,0,0,0)',
        '#d9ef8b',
        '#ffffbf',
        '#fee08b',
        '#fdae61',
        '#f46d43',
        '#d73027',
        '#a50026',
      ]; //红渐变黄的颜色
      // 绘制插值结果
      kriging.plot(this.canvas, grid, [bounds[0][0], bounds[2][0]], [bounds[0][1], bounds[1][1]], colors);
      // 矩形范围
      this.rectangle = new Cesium.Rectangle(
        Cesium.Math.toRadians(bounds[0][0]),
        Cesium.Math.toRadians(bounds[0][1]),
        Cesium.Math.toRadians(bounds[2][0]),
        Cesium.Math.toRadians(bounds[1][1])
      );
      this.addScalarField();
      visualizationOptionsStore.scalarFieldIsLoading = false;
    });
  }

  // 添加图层
  private addScalarField(): void {
    const viewer = this.viewer;
    // 添加
    this.scalarField = viewer.imageryLayers.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        url: this.canvas.toDataURL('image/png'),
        // 范围
        rectangle: this.rectangle,
        tileWidth: 256,
        tileHeight: 256,
      })
    );
    // 调整相机视角，使其飞至并聚焦于矩形区域
    viewer.flyTo(this.scalarField, {
      duration: 1.0, // 可选，飞行持续时间（秒）
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(0), // 航向，这里设为正北（0度），也可以选择其他角度或保留默认值
        Cesium.Math.toRadians(-90), // 俯仰角设为-90度，即垂直向下
        200000
      ),
    });
  }

  // 删除图层
  public removeScalarField(): void {
    const viewer = this.viewer;
    viewer.imageryLayers.remove(this.scalarField);
  }
}

export { ScalarRender };
