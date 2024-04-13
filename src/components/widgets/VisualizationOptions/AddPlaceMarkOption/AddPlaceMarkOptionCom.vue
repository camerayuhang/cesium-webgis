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

const createPlaceMark = () => {
  const entity = new Cesium.Entity({
    point: {
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  });
  defaultStyle(entity);

  return entity;
  // viewer.entities.add(placeMark);
};

const movingPlaceMark = createPlaceMark();
viewer.entities.add(movingPlaceMark);

const addPlaceMark = () => {
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
        longitude: longitudeString,
        latitude: latitudeString,
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
      if (selectedEntity) {
        defaultStyle(selectedEntity);
        placemarkStore.visible = false;
      }
      selectedEntity = pickedObject.id as Cesium.Entity;
      const position = selectedEntity.position?.getValue(viewer.clock.currentTime) as Cesium.Cartesian3;
      placemarkStore.setCurrentPlacemarkById(selectedEntity.id);
      hightlightStyle(selectedEntity);
      showPlacemarkPanel(position);
    } else {
      if (selectedEntity) {
        defaultStyle(selectedEntity);
        placemarkStore.visible = false;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const removeScreenSpaceEvent = () => {
  handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const showPlacemarkPanel = (position: Cesium.Cartesian3) => {
  const canvasPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position);
  if (canvasPosition) {
    placemarkStore.position.left = canvasPosition.x + 180;
    placemarkStore.position.top = canvasPosition.y - 60;
  }
  placemarkStore.visible = true;
};

// const action = (event: Cesium.ScreenSpaceEventHandler.MotionEvent | Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
//   // get the cartesian position of the mouse when moving over the globe.ellipsoid

//   }

//   // if (cartesian) {
//   //   const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//   // }
// };
</script>
