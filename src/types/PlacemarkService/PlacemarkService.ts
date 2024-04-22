import { Placemark } from './Placemark';
import { PlacemarkInfo } from './PlacemarkInfo';
import mitt, { Emitter } from 'mitt';

type Event = {
  'add-placemark': PlacemarkInfo;
  'placemark-panel-visibility': {
    visible: boolean;
    id?: string;
  };
};

class PlacemarkService {
  viewer: Cesium.Viewer;
  scene: Cesium.Scene;
  canvas: HTMLCanvasElement;
  handler: Cesium.ScreenSpaceEventHandler;
  selectedPlacemark: Placemark | null;
  movingPlacemark: Placemark;
  placemarkInfoArray: PlacemarkInfo[];
  emitter: Emitter<Event>;
  // store:Store

  constructor(viewer: Cesium.Viewer, placemarkInfoArray: PlacemarkInfo[]) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.canvas = this.scene.canvas;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
    this.selectedPlacemark = null;
    this.movingPlacemark = this.createPlaceMark();
    this.viewer.entities.add(this.movingPlacemark);
    this.placemarkInfoArray = placemarkInfoArray;
    this.emitter = mitt<Event>();
    // this.store = usePlacemarkStore()
  }

  setPlacemarkMovingAction() {
    // entity that moves with mouse
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const cartesian = this.viewer.camera.pickEllipsoid(event.endPosition, this.scene.globe.ellipsoid);

      if (cartesian) {
        this.movingPlacemark.position = new Cesium.ConstantPositionProperty(cartesian);
      } else {
        this.movingPlacemark.position = undefined;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  setPlacemarkAddedAction() {
    // entity that is fixed to a location when mouse clicks
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = this.viewer.camera.pickEllipsoid(event.position, this.scene.globe.ellipsoid);
      if (cartesian) {
        const fixedPlaceMark = this.createPlaceMark();

        fixedPlaceMark.setPosition(new Cesium.ConstantPositionProperty(cartesian));

        this.viewer.entities.add(fixedPlaceMark);

        this.placemarkInfoArray.push(fixedPlaceMark.info);
        this.showNewPlacemarkPanel(fixedPlaceMark, false);
        this.movingPlacemark.position = undefined;

        this.removeScreenSpaceEvent();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  setPlacemarkSelectedAction() {
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const pickedObject = this.scene.pick(event.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        this.hideNewPlacemarkPanel();
        this.selectedPlacemark = pickedObject.id as Placemark;

        this.showNewPlacemarkPanel(this.selectedPlacemark);
      } else {
        this.hideNewPlacemarkPanel();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  setCursorPointerAction() {
    // turn mouse to hand
    this.handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      const pickedObject = this.scene.pick(event.endPosition);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        (this.viewer.container as HTMLDivElement).style.cursor = 'pointer';
      } else {
        (this.viewer.container as HTMLDivElement).style.cursor = 'default';
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  createPlaceMark() {
    const placemark = new Placemark({
      point: {
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: {
        show: true,
        // text: 'New Placemark',
        font: '14px Microsoft Yahei',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        // verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(0, 20),
      },
      billboard: {
        show: true,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
      },
    });
    placemark.setDefaultStyle();

    return placemark;
  }

  removeScreenSpaceEvent() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  hideNewPlacemarkPanel() {
    if (this.selectedPlacemark) {
      this.selectedPlacemark.setDefaultStyle();
      this.emitter.emit('placemark-panel-visibility', { visible: false });
    }
  }

  showNewPlacemarkPanel(placemark: Placemark, isHighlighted = true) {
    const position = placemark.position?.getValue(this.viewer.clock.currentTime) as Cesium.Cartesian3;
    const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.scene, position);

    placemark.info.canvasPositionX = canvasPosition.x;
    placemark.info.canvasPositionY = canvasPosition.y;
    if (isHighlighted) {
      placemark.setHighlightStyle();
    }

    this.emitter.emit('placemark-panel-visibility', {
      visible: true,
      id: placemark.id,
    });
  }

  getLonLat(entity: Cesium.Entity) {
    if (entity.position) {
      const cartesian = entity.position.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitude = Cesium.Math.toDegrees(cartographic.longitude);
      const latitude = Cesium.Math.toDegrees(cartographic.latitude);

      return { longitude, latitude };
    } else {
      throw new Error('Entity position not defined');
    }
  }
}

export { PlacemarkService };
