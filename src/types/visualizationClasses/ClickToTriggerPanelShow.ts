import { Properties } from 'src/types/Properties';
import { getCurrentInstance, ComponentInternalInstance } from 'vue';
// 表示是支持点击触发插值计算的接口
interface SupportClickToCalculateInterpolation {
  // 通过点击计算插值
  calculateValByInterpolation(lon: number, lat: number): Properties | null;
}

// 点击触发属性面板的显示和隐藏
class ClickToTriggerPropertyPanel {
  private someRenderField: SupportClickToCalculateInterpolation;
  private viewer: Cesium.Viewer;
  private viewerHandler: Cesium.ScreenSpaceEventHandler;
  private clickPoint = new Cesium.Entity({
    point: {
      pixelSize: 10, // 点的像素大小
      color: Cesium.Color.RED, // 点的颜色
      outlineColor: Cesium.Color.WHITE, // 可选：点的轮廓颜色
      outlineWidth: 2, // 可选：轮廓线宽度
    },
  });
  private keepPositionCloseToPoint = () => {
    // 只有点击的点要素还存在于地图上，才会执行接下来的逻辑
    if (this.clickPoint.position != undefined) {
      // 获取点在笛卡尔坐标系中的位置
      const cartesian3Position = this.clickPoint.position.getValue(this.viewer.clock.currentTime) as Cesium.Cartesian3;
      //获取屏幕坐标
      const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian3Position);
      // 触发事件，控制属性面板的状态
      this.emitter.emit('propertiesPanelStateChange', {
        screenPosition: screenPosition,
      });
    }
  };
  private emitter = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties.$emitter;

  public constructor(someRenderFiled: SupportClickToCalculateInterpolation, viewer: Cesium.Viewer) {
    this.someRenderField = someRenderFiled;
    this.viewer = viewer;
    this.viewerHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
  }
  public addEventListening(): void {
    // 将点要素加入到viewer中
    this.viewer.entities.add(this.clickPoint);
    // 进行地图点击事件监听
    this.viewerHandler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      // 获取点击位置的笛卡尔坐标
      const cartesian = this.viewer.camera.pickEllipsoid(event.position, this.viewer.scene.globe.ellipsoid);
      if (cartesian) {
        //获取屏幕坐标
        const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, cartesian);
        // 将笛卡尔坐标转换为地图经纬度坐标
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(6));
        const lat = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(6));
        // 获取插值结果
        const interpolationProperties = this.someRenderField.calculateValByInterpolation(lon, lat);
        // 只有当插值结果不为null或0
        if (interpolationProperties) {
          // 改变点的位置
          this.clickPoint.position = cartesian as unknown as Cesium.PositionProperty;
          // 触发事件，控制属性面板的状态
          this.emitter.emit('propertiesPanelStateChange', {
            isShow: true,
            properties: interpolationProperties,
            screenPosition: screenPosition,
          });
        } else {
          this.clickPoint.position = undefined;
          // 触发事件，控制属性面板的状态
          this.emitter.emit('propertiesPanelStateChange', {
            isShow: false,
          });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 监听相机移动的事件
    this.viewer.camera.moveEnd.addEventListener(this.keepPositionCloseToPoint);
  }

  public removeEventListening() {
    // 清除点的坐标位置
    this.clickPoint.position = undefined;
    // 移除点
    this.viewer.entities.remove(this.clickPoint);
    // 取消点击事件监听
    this.viewerHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // 取消相机移动事件监听
    this.viewer.camera.moveEnd.removeEventListener(this.keepPositionCloseToPoint);
    // 触发事件，控制属性面板的状态
    this.emitter.emit('propertiesPanelStateChange', {
      isShow: false,
    });
    console.log(132123123123);
  }
}

export type { SupportClickToCalculateInterpolation };
export { ClickToTriggerPropertyPanel };
