import { createPlaceMarkInfo, getAllPlacemarks } from 'src/api/placemark_api';
import { Placemark } from './Placemark';
import { PlacemarkInfo, PlacemarkInfoToSend } from './PlacemarkInfo';
import mitt, { Emitter } from 'mitt';
import { getSpatialInfo } from 'src/tools/utils';
import { PlacemarkNode } from './PlacemarkNode';
import { Ref } from 'vue';

import { QTreeNode } from 'quasar/dist/types/api/qtree';

type Event = {
  'add-placemark': PlacemarkInfo;
  'placemark-panel-visibility': {
    visible: boolean;
    placemarkInfo?: PlacemarkInfo;
    canvasPosition?: { x: number; y: number };
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
  placemarkNodes: QTreeNode[];
  removeCallback?: Cesium.Event.RemoveCallback;

  constructor(viewer: Cesium.Viewer, placemarkNodes: QTreeNode[]) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.canvas = this.scene.canvas;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
    this.selectedPlacemark = null;
    this.movingPlacemark = this.createPlaceMark();
    this.viewer.entities.add(this.movingPlacemark);
    this.emitter = mitt<Event>();
    this.placemarkNodes = placemarkNodes;
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
      console.log(pickedObject);

      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id instanceof Placemark) {
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
      if (Cesium.defined(pickedObject) && pickedObject.id instanceof Placemark) {
        (this.viewer.container as HTMLDivElement).style.cursor = 'pointer';
      } else {
        (this.viewer.container as HTMLDivElement).style.cursor = 'default';
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  async createAllPlacemarks() {
    const placemarkInfoArray = await getAllPlacemarks();
    this.placemarkNodes.push({
      id: 'root',
      label: 'Placemarks',
      header: 'root',
      children: [] as QTreeNode[],
      icon: 'public',
    });

    placemarkInfoArray.forEach(async (placemarkInfo) => {
      const placemark = this.createPlaceMark(placemarkInfo);
      this.viewer.entities.add(placemark);
      await placemark.updateCesiumInfoFromPanel();
      (this.placemarkNodes[0].children as QTreeNode[]).push(this.createPlacemarkNode(placemark));
    });
  }

  async removeAllPlacemarks() {
    const entitieArray = Array.from(this.viewer.entities.values);

    entitieArray.forEach((entity) => {
      if (entity instanceof Placemark) {
        this.viewer.entities.remove(entity);
      }
    });
    this.placemarkNodes.splice(0, 1);
    // clean events
    this.removeScreenSpaceEvent();
  }

  async createAndSavePlaceMark(cartesian: Cesium.Cartesian3) {
    const info = getSpatialInfo(cartesian);
    const placemarkInfo = await createPlaceMarkInfo(info);

    const placemark = this.createPlaceMark(placemarkInfo);

    return placemark;
  }

  setEntityCollectionChangedAction() {
    this.viewer.entities.collectionChanged.removeEventListener;
    const callback: Cesium.EntityCollection.CollectionChangedEventCallback = (collection, added, removed, changed) => {
      removed.forEach((entity) => {
        if (entity instanceof Placemark) {
          const id = entity.id;
          (this.placemarkNodes[0].children as QTreeNode[]).splice(
            (this.placemarkNodes[0].children as QTreeNode[]).findIndex((placemarkNode) => placemarkNode.id === id),
            1
          );
        }
      });
      added.forEach((entity) => {
        if (entity instanceof Placemark) {
          (this.placemarkNodes[0].children as QTreeNode[]).push(this.createPlacemarkNode(entity));
        }
      });
    };
    this.removeCallback = this.viewer.entities.collectionChanged.addEventListener(callback);
  }
  // initplacemarkNodes(placemarkNodes: PlacemarkNode[]) {
  //   this.viewer.entities.values.forEach((entity) => {
  //     if (entity instanceof Placemark && entity.id !== '-1') {
  //       const placemarkNode: PlacemarkNode = {
  //         id: entity.id,
  //         label: entity.info.name as string,
  //         labelVisibility: (entity.label as Cesium.LabelGraphics).show?.getValue(new Cesium.JulianDate()),
  //         billboardVisibility: (entity.billboard as Cesium.BillboardGraphics).show?.getValue(new Cesium.JulianDate()),
  //       };
  //       placemarkNodes.push(placemarkNode);
  //     }
  //   });
  // }

  createPlaceMark(
    placemarkInfo: PlacemarkInfo = {
      id: '-1',
      name: 'Untitled Placemark',
      description: '',
      longitude: 0,
      latitude: 0,
      height: 0,
      cartesian_x: 0,
      cartesian_y: 0,
      cartesian_z: 0,
      placemark_point: {
        default_pixel_size: 10,
        default_color: '#0000FF',
        default_outline_color: '#FFFFFF',
        default_outline_width: 2,
        highlight_pixel_size: 20,
        highlight_color: '#FF0000',
        highlight_outline_color: '#FFFFFF',
        highlight_outline_width: 2,
      },
    }
  ) {
    const placemark = new Placemark(
      {
        id: placemarkInfo.id,
        point: {
          outlineColor: Cesium.Color.fromCssColorString(placemarkInfo.placemark_point.default_outline_color),
          outlineWidth: placemarkInfo.placemark_point.default_outline_width,
          pixelSize: placemarkInfo.placemark_point.default_pixel_size,
          color: Cesium.Color.fromCssColorString(placemarkInfo.placemark_point.default_color),
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

  createPlacemarkNode(Placemark: Placemark) {
    const node: QTreeNode = {
      id: Placemark.id,
      label: Placemark.info.name as string,
      icon: 'push_pin',
      header: 'placemark',
      entityVisibility: Placemark.show,
      children: [
        {
          parentId: Placemark.id,
          body: 'content',
          labelVisibility: (Placemark.label as Cesium.LabelGraphics).show?.getValue(new Cesium.JulianDate()),
          billboardVisibility: (Placemark.billboard as Cesium.BillboardGraphics).show?.getValue(
            new Cesium.JulianDate()
          ),
        },
      ],
    };
    return node;
  }

  removeScreenSpaceEvent() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  hideNewPlacemarkPanel() {
    if (this.selectedPlacemark) {
      this.selectedPlacemark.hidePanel();
      this.emitter.emit('placemark-panel-visibility', { visible: Placemark.panelVisibility });
    }
  }

  showNewPlacemarkPanel(placemark: Placemark, isHighlighted = true) {
    placemark.showPanel(this.scene, isHighlighted);

    this.emitter.emit('placemark-panel-visibility', {
      visible: Placemark.panelVisibility,
      canvasPosition: Placemark.canvasPosition,
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
