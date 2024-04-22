import { PlacemarkInfo } from './PlacemarkInfo';

interface RequiredPointGraphicsOptions extends Cesium.Entity.ConstructorOptions {
  point: Cesium.PointGraphics | Cesium.PointGraphics.ConstructorOptions;
}

class Placemark extends Cesium.Entity {
  info: PlacemarkInfo;

  constructor(options: RequiredPointGraphicsOptions) {
    super(options);
    this.info = {
      id: this.id,
      longitude: this.getLonLat()?.longitude,
      latitude: this.getLonLat()?.latitude,
    };
  }

  setPosition(position: Cesium.PositionProperty) {
    this.position = position;
    const { longitude, latitude } = this.getLonLat();
    this.info.latitude = latitude;
    this.info.longitude = longitude;
  }

  setDefaultStyle() {
    (this.point as Cesium.PointGraphics).color = new Cesium.ConstantProperty(Cesium.Color.BLUE);
    (this.point as Cesium.PointGraphics).pixelSize = new Cesium.ConstantProperty(10);
  }

  setHighlightStyle() {
    (this.point as Cesium.PointGraphics).color = new Cesium.ConstantProperty(Cesium.Color.RED);
    (this.point as Cesium.PointGraphics).pixelSize = new Cesium.ConstantProperty(20);
  }

  getLonLat() {
    if (this.position) {
      const cartesian = this.position.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);

      return { longitude, latitude };
    } else {
      return { longitude: undefined, latitude: undefined };
    }
  }
}

export { Placemark };
