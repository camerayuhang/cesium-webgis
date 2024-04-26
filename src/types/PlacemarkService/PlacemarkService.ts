import { createPlaceMarkInfo, getAllPlacemarks } from 'src/api/placemark_api';
import { Placemark } from './Placemark';
import { PlacemarkInfo, PlacemarkInfoToSend } from './PlacemarkInfo';
import mitt, { Emitter } from 'mitt';
import { getImageDimensions, getSpatialInfo } from 'src/tools/utils';

type Event = {
  'add-placemark': PlacemarkInfo;
  'placemark-panel-visibility': {
    visible: boolean;
    placemarkInfo?: PlacemarkInfo;
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
  emitter: Emitter<Event>;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.canvas = this.scene.canvas;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
    this.selectedPlacemark = null;
    this.movingPlacemark = this.createPlaceMark();
    this.viewer.entities.add(this.movingPlacemark);

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
    this.handler.setInputAction(async (event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = this.viewer.camera.pickEllipsoid(event.position, this.scene.globe.ellipsoid);
      if (cartesian) {
        const fixedPlaceMark = await this.createAndSavePlaceMark(cartesian);

        // fixedPlaceMark.setPosition(new Cesium.ConstantPositionProperty(cartesian));

        // await this.savePlacemarkInfoForm(fixedPlaceMark.info);
        this.viewer.entities.add(fixedPlaceMark);

        // this.placemarkInfoArray.push(fixedPlaceMark.info as PlacemarkInfo);
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

  async createAllPlacemarks() {
    const placemarkInfoArray = await getAllPlacemarks();

    placemarkInfoArray.forEach(async (placemarkInfo) => {
      const placemark = this.createPlaceMark(placemarkInfo);
      await placemark.updateInfoInCesium();
      this.viewer.entities.add(placemark);
    });
  }

  async removeAllPlacemarks() {
    const entitieArray = Array.from(this.viewer.entities.values);

    entitieArray.forEach((entity) => {
      if (entity instanceof Placemark) {
        this.viewer.entities.remove(entity);
      }
    });
    // clean events
    this.removeScreenSpaceEvent();
  }

  async createAndSavePlaceMark(cartesian: Cesium.Cartesian3) {
    // let placemarkInfo: PlacemarkInfo = {
    //   id: '',
    //   name: '',
    //   description: '',
    //   longitude: 0,
    //   latitude: 0,
    //   height: 0,
    //   cartesian_x: 0,
    //   cartesian_y: 0,
    //   cartesian_z: 0,
    // };

    const placemarkInfoForm: PlacemarkInfoToSend = getSpatialInfo(cartesian);
    const placemarkInfo = await createPlaceMarkInfo(placemarkInfoForm);

    const placemark = this.createPlaceMark(placemarkInfo);

    return placemark;
  }

  createPlaceMark(
    placemarkInfo: PlacemarkInfo = {
      id: '-1',
      name: '',
      description: '',
      longitude: 0,
      latitude: 0,
      height: 0,
      cartesian_x: 0,
      cartesian_y: 0,
      cartesian_z: 0,
    }
  ) {
    const placemark = new Placemark(
      {
        id: placemarkInfo.id,
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
          text: placemarkInfo.name,
        },
        billboard: {
          show: true,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -10),
        },
        position: new Cesium.Cartesian3(
          placemarkInfo.cartesian_x,
          placemarkInfo.cartesian_y,
          placemarkInfo.cartesian_z
        ),
      },
      placemarkInfo
    );

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

    (placemark.info as PlacemarkInfo).canvasPositionX = canvasPosition.x;
    (placemark.info as PlacemarkInfo).canvasPositionY = canvasPosition.y;
    if (isHighlighted) {
      placemark.setHighlightStyle();
    }

    this.emitter.emit('placemark-panel-visibility', {
      visible: true,
      placemarkInfo: placemark.info,
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
