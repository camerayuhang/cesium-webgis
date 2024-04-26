import kriging from 'js-kriging';
import axios from 'axios';
import { ScalarDataStruct, ScalarInterface } from './Scalar';
import mitt, { Emitter, EventType } from 'mitt';
import { SupportClickToCalculateInterpolation } from './ClickToTriggerPanelShow';
import { Properties } from '../Properties';
// 标量渲染类（用于海洋温度、盐度等等标量的渲染）
class ScalarRender implements SupportClickToCalculateInterpolation {
  private _emitter: Emitter<Record<EventType, unknown>>;
  private _url: string;
  private _data!: ScalarDataStruct | null;
  private viewer: Cesium.Viewer;
  private scalarField!: Cesium.ImageryLayer;
  private rectangle!: Cesium.Rectangle;
  private canvas!: HTMLCanvasElement | null;
  public constructor(viewer: Cesium.Viewer, url: string) {
    this._url = url;
    this.viewer = viewer;
    this._emitter = mitt();
  }
  //请求数据
  private async loadData(): Promise<ScalarDataStruct | null> {
    const result = await axios.get(this._url);
    this._data = result.data;
    return this._data;
  }
  // 添加图层
  private addScalarField(): void {
    const viewer = this.viewer;
    // 添加
    this.scalarField = viewer.imageryLayers.addImageryProvider(
      new Cesium.SingleTileImageryProvider({
        url: (this.canvas as HTMLCanvasElement).toDataURL('image/png'),
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
  // 获取事件监听对象
  public getEmitter() {
    return this._emitter;
  }
  // 创建标量场
  public async createScalarField(): Promise<void> {
    this._emitter.emit('isLoading', true);
    // 判断是否canvas是有效的
    if (this.canvas !== undefined && this.canvas !== null) {
      this.addScalarField();
      this._emitter.emit('isLoading', false);
      return;
    }
    // 创建canvas标签
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'scalarRender';
    const Data = await this.loadData(); //获取数据
    // 如果没数据
    if (Data == null) {
      return;
    }
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
      kriging.plot(
        this.canvas as HTMLCanvasElement,
        grid,
        [bounds[0][0], bounds[2][0]],
        [bounds[0][1], bounds[1][1]],
        colors
      );
      // 矩形范围
      this.rectangle = new Cesium.Rectangle(
        Cesium.Math.toRadians(bounds[0][0]),
        Cesium.Math.toRadians(bounds[0][1]),
        Cesium.Math.toRadians(bounds[2][0]),
        Cesium.Math.toRadians(bounds[1][1])
      );
      this.addScalarField();
      this._emitter.emit('isLoading', false);
    });
  }
  //设置数据源的url
  public updateDataUrl(url: string) {
    this._url = url;
    this.canvas = null;
  }
  // 删除图层
  public removeScalarField(): void {
    const viewer = this.viewer;
    viewer.imageryLayers.remove(this.scalarField);
  }
  //通过插值计算某一个经纬度位置的值
  public calculateValByInterpolation(lon: number, lat: number): Properties | null {
    // 判断是否有数据
    if (this._data != null) {
      const bounds = this._data['bounds'];
      // 判断经纬度是否在合理范围内
      if (bounds[0][0] < lon && lon < bounds[2][0] && bounds[0][1] < lat && lat < bounds[1][1]) {
        // 获取数据维度的大小
        const lonLength = this._data['dimensions']['lon'];
        const latLength = this._data['dimensions']['lat'];
        // 获取数据
        const data = this._data['data'];
        // 定义一个长度为4的数组，存储一个方格的四个顶点坐标
        const fourCornersData: ScalarInterface[] = [];
        // 首先按经度进行遍历
        for (let i = 1; i < lonLength; i++) {
          // 找到经度边界
          if (lon < data[i]['lon']) {
            // 按纬度进行遍历
            for (let j = 1; j < latLength; j++) {
              // 找到纬度边界
              if (lat < data[i + lonLength * j]['lat']) {
                // 记录方格的四个顶点坐标
                fourCornersData[0] = data[i - 1 + lonLength * (j - 1)];
                fourCornersData[1] = data[i + lonLength * (j - 1)];
                fourCornersData[2] = data[i + lonLength * j];
                fourCornersData[3] = data[i - 1 + lonLength * j];
                break;
              }
            }
            break;
          }
        }
        // 使用双线性内插进行计算
        // 首先按经度插值出两个值
        const interpolation1 =
          fourCornersData[0]['temp'] +
          (fourCornersData[1]['temp'] - fourCornersData[0]['temp']) *
            ((lon - fourCornersData[0]['lon']) / (fourCornersData[1]['lon'] - fourCornersData[0]['lon']));
        const interpolation2 =
          fourCornersData[3]['temp'] +
          (fourCornersData[2]['temp'] - fourCornersData[3]['temp']) *
            ((lon - fourCornersData[3]['lon']) / (fourCornersData[2]['lon'] - fourCornersData[3]['lon']));
        // 按纬度进行插值，得到最终结果
        const result =
          interpolation1 +
          (interpolation2 - interpolation1) *
            ((lat - fourCornersData[0]['lat']) / (fourCornersData[3]['lat'] - fourCornersData[0]['lat']));
        return { lon: lon, lat: lat, temp: result.toFixed(6) };
      }
    }
    return null;
  }
}
export { ScalarRender };
