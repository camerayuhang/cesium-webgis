<template>
  <q-item>
    <q-btn square color="primary" icon="edit_location" label="Add Placemark" @click="addPlaceMark" />
  </q-item>
</template>
<script setup lang="ts">
import { useVueCesium } from 'vue-cesium';
const vcViewer = useVueCesium();
const viewer = vcViewer.viewer;
const canvas = viewer.canvas;

const handler = new Cesium.ScreenSpaceEventHandler(canvas);

const createPlaceMark = () => {
  return new Cesium.Entity({
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  });
  // viewer.entities.add(placeMark);
};

const movingPlaceMark = createPlaceMark();
viewer.entities.add(movingPlaceMark);

const addPlaceMark = () => {
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

      movingPlaceMark.position = undefined;
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } else {
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

// const action = (event: Cesium.ScreenSpaceEventHandler.MotionEvent | Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
//   // get the cartesian position of the mouse when moving over the globe.ellipsoid

//   }

//   // if (cartesian) {
//   //   const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
//   // }
// };

defineExpose({});
</script>
