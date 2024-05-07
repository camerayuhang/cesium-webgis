import { createImgSrc, getImageDimensions, getLeftTopLimitedInContainer } from 'src/tools/utils';
import { PlacemarkInfo, PlacemarkInfoToSend } from './PlacemarkInfo';
import { deletePlacemarkById, deletePlacemarkImageById, updatePlacemarkInfoById } from 'src/api/placemark_api';
import { PlacemarkPointInfo } from './PlacemarkPointInfo';

interface RequiredPointGraphicsOptions extends Cesium.Entity.ConstructorOptions {
  point: Cesium.PointGraphics | Cesium.PointGraphics.ConstructorOptions;
}

class Placemark extends Cesium.Entity {
  info: PlacemarkInfo;
  static panelInfo: PlacemarkInfoToSend;
  static panelVisibility: boolean;
  static canvasPosition: { x: number; y: number };

  constructor(options: RequiredPointGraphicsOptions, info: PlacemarkInfo) {
    super(options);
    this.info = info;
  }

  setDefaultStyle() {
    (this.point as Cesium.PointGraphics).color = new Cesium.ConstantProperty(
      Cesium.Color.fromCssColorString(this.info.placemark_point.default_color)
    );
    (this.point as Cesium.PointGraphics).pixelSize = new Cesium.ConstantProperty(
      this.info.placemark_point.default_pixel_size
    );
    (this.point as Cesium.PointGraphics).outlineColor = new Cesium.ConstantProperty(
      Cesium.Color.fromCssColorString(this.info.placemark_point.default_outline_color)
    );
    (this.point as Cesium.PointGraphics).outlineWidth = new Cesium.ConstantProperty(
      this.info.placemark_point.default_outline_width
    );
  }

  setHighlightStyle() {
    (this.point as Cesium.PointGraphics).color = new Cesium.ConstantProperty(
      Cesium.Color.fromCssColorString(this.info.placemark_point.highlight_color)
    );
    (this.point as Cesium.PointGraphics).pixelSize = new Cesium.ConstantProperty(
      this.info.placemark_point.highlight_pixel_size
    );
    (this.point as Cesium.PointGraphics).outlineColor = new Cesium.ConstantProperty(
      Cesium.Color.fromCssColorString(this.info.placemark_point.highlight_outline_color)
    );
    (this.point as Cesium.PointGraphics).outlineWidth = new Cesium.ConstantProperty(
      this.info.placemark_point.highlight_outline_width
    );
  }

  async update(propsToUpdate: Partial<PlacemarkInfo>, placemarkPointInfo: PlacemarkPointInfo) {
    await this.updateInfo(propsToUpdate, placemarkPointInfo);
    await this.updateCesiumInfoFromPanel();
  }

  // updateCesiumInfoFromNode() {
  //   (this.label as Cesium.LabelGraphics).text = new Cesium.ConstantProperty(this.nodes.label);
  //   this.show = this.nodes.entityVisibility;
  //   (this.label as Cesium.LabelGraphics).show = new Cesium.ConstantProperty(this.nodes.labelVisibility);
  //   (this.billboard as Cesium.BillboardGraphics).show = new Cesium.ConstantProperty(this.nodes.billboardVisibility);
  // }

  async updateCesiumInfoFromPanel() {
    // update
    (this.label as Cesium.LabelGraphics).text = new Cesium.ConstantProperty(this.info.name);
    const billboard = this.billboard as Cesium.BillboardGraphics;
    if (this.info.placemark_image) {
      const placemark_image = this.info.placemark_image;
      const imgSrc = createImgSrc(placemark_image.image, placemark_image.type);
      const { width, height } = await getImageDimensions(imgSrc);
      billboard.image = new Cesium.ConstantProperty(imgSrc);
      billboard.width = new Cesium.ConstantProperty((100 * width) / height);
      billboard.height = new Cesium.ConstantProperty(100);
    } else {
      billboard.image = undefined;
    }
    this.setDefaultStyle();
  }

  async clearPlacemarkImage() {
    await deletePlacemarkImageById(this.id);
    this.info.placemark_image = undefined;
    (this.billboard as Cesium.BillboardGraphics).image = undefined;
  }

  async updateInfo(propsToUpdate: Partial<PlacemarkInfo>, placemarkPointInfo: PlacemarkPointInfo) {
    const placemarkInfo = await updatePlacemarkInfoById(this.info.id, propsToUpdate, placemarkPointInfo);

    this.info = placemarkInfo;
    // this.nodes.label = this.info.name as string;
  }

  async deleteInfo() {
    await deletePlacemarkById(this.info.id);
  }

  showPanel(scene: Cesium.Scene, isHighlighted = false) {
    Placemark.panelInfo = { ...this.info };
    const position = this.position?.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3;
    const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position);
    this.adjustPanelPosition(scene.canvas, canvasPosition.x, canvasPosition.y);
    Placemark.panelVisibility = true;
    if (isHighlighted) {
      this.setHighlightStyle();
    } else {
      this.setDefaultStyle();
    }
  }

  adjustPanelPosition(canvas: HTMLCanvasElement, left: number, top: number) {
    const panel = canvas.closest('#cesiumContainer')?.querySelector('#placemark-panel') as HTMLDivElement;
    // left = left + 20;
    // top = top - panel.offsetHeight / 2;

    Placemark.canvasPosition = getLeftTopLimitedInContainer(canvas, panel, left, top);
  }

  hidePanel() {
    Placemark.panelVisibility = false;
    this.setDefaultStyle();
  }

  getLonLat() {
    if (this.position) {
      const cartesian = this.position.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);
      const height = cartographic.height;

      return {
        longitude,
        latitude,
        height,
        cartesian_x: cartesian.x,
        cartesian_y: cartesian.y,
        cartesian_z: cartesian.z,
      };
    } else {
      return {
        longitude: undefined,
        latitude: undefined,
        height: undefined,
        cartesian_x: undefined,
        cartesian_y: undefined,
        cartesian_z: undefined,
      };
    }
  }
}

export { Placemark };
