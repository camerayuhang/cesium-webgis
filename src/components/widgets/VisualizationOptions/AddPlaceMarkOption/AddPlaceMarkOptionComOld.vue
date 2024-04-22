<template>
  <q-item>
    <q-btn square color="primary" icon="edit_location" label="Add Placemark" @click="addPlaceMark" />
  </q-item>
</template>
<script setup lang="ts">
import { useVueCesium } from 'vue-cesium';
import { usePlacemarkStore } from 'src/stores/PlacemarkStore';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Placemark } from 'src/types/PlacemarkService/Placemark';

// interface RequiredPointGraphicsOptions extends Cesium.Entity.ConstructorOptions {
//   point: Cesium.PointGraphics | Cesium.PointGraphics.ConstructorOptions;
// }

// class Placemark extends Cesium.Entity {
//   point: Cesium.PointGraphics; // already exist on base class

//   constructor(options: RequiredPointGraphicsOptions) {
//     super(options);
//     this.point = options.point as Cesium.PointGraphics;
//   }

//   setDefaultStyle() {
//     this.point.color = new Cesium.ConstantProperty(Cesium.Color.BLUE);
//     this.point.pixelSize = new Cesium.ConstantProperty(10);
//   }

//   setHighlightStyle() {
//     this.point.color = new Cesium.ConstantProperty(Cesium.Color.RED);
//     this.point.pixelSize = new Cesium.ConstantProperty(20);
//   }
// }

const placemarkStore = usePlacemarkStore();

const vcViewer = useVueCesium();
const viewer = vcViewer.viewer;
const canvas = viewer.canvas;
const scene = viewer.scene;

const handler = new Cesium.ScreenSpaceEventHandler(canvas);
let selectedEntity: Cesium.Entity | null = null;

const hightlightStyle = (entity: Cesium.Entity) => {
  (entity.point as Cesium.PointGraphics).color = new Cesium.ConstantProperty(Cesium.Color.RED);
  (entity.point as Cesium.PointGraphics).pixelSize = new Cesium.ConstantProperty(20);
};

const defaultStyle = (entity: Cesium.Entity) => {
  (entity.point as Cesium.PointGraphics).color = new Cesium.ConstantProperty(Cesium.Color.BLUE);
  (entity.point as Cesium.PointGraphics).pixelSize = new Cesium.ConstantProperty(10);
};

const cancleHightlight = (entity: Cesium.Entity | null) => {
  if (entity) {
    defaultStyle(entity);
    placemarkStore.visible = false;
  }
};

const createPlaceMark = () => {
  const entity = new Cesium.Entity({
    point: {
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  });
  defaultStyle(entity);

  return entity;
};

const movingPlaceMark = createPlaceMark();
const a = viewer.entities.add(movingPlaceMark);
console.log(movingPlaceMark === a);
console.log(movingPlaceMark);
console.log(a);

const addPlaceMark = () => {
  cancleHightlight(selectedEntity);

  removeScreenSpaceEvent();

  // entity that moves with mouse
  handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
    const cartesian = viewer.camera.pickEllipsoid(event.endPosition, viewer.scene.globe.ellipsoid);

    if (cartesian) {
      movingPlaceMark.position = cartesian as unknown as Cesium.PositionProperty;
    } else {
      movingPlaceMark.position = undefined;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // eneity that is fixed to a location when mouse clicks
  handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);

    if (cartesian) {
      const fixedPlaceMark = createPlaceMark();
      viewer.entities.add(fixedPlaceMark);
      fixedPlaceMark.position = cartesian as unknown as Cesium.PositionProperty;

      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
      const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);

      placemarkStore.placemarkArray.push({
        id: fixedPlaceMark.id,
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        canvasPositionX: 0,
        canvasPositionY: 0,
      });
      showPlacemarkPanel(cartesian);
      placemarkStore.setCurrentPlacemarkById(fixedPlaceMark.id);

      movingPlaceMark.position = undefined;
      removeScreenSpaceEvent();
    } else {
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const { visible } = storeToRefs(placemarkStore);

watch(visible, () => {
  if (!visible.value) {
    enableSelectPlacemark();
    if (selectedEntity) {
      defaultStyle(selectedEntity);
    }
  }
});

const enableSelectPlacemark = () => {
  handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const pickedObject = scene.pick(event.position);
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      cancleHightlight(selectedEntity);
      selectedEntity = pickedObject.id as Cesium.Entity;
      const position = selectedEntity.position?.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3;
      placemarkStore.setCurrentPlacemarkById(selectedEntity.id);
      hightlightStyle(selectedEntity);
      showPlacemarkPanel(position);
    } else {
      cancleHightlight(selectedEntity);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // turn mouse to hand
  handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
    const pickedObject = scene.pick(event.endPosition);
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      (viewer.container as HTMLDivElement).style.cursor = 'pointer';
    } else {
      (viewer.container as HTMLDivElement).style.cursor = 'default';
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
};

const removeScreenSpaceEvent = () => {
  handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const showPlacemarkPanel = (position: Cesium.Cartesian3) => {
  const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position);
  if (canvasPosition) {
    placemarkStore.panelPosition.left = canvasPosition.x + 180;
    placemarkStore.panelPosition.top = canvasPosition.y - 60;
  }
  placemarkStore.visible = true;
};
</script>
