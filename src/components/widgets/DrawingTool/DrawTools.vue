<template>
  <vc-drawings
    ref="drawingsRef"
    :main-fab-opts="mainFabOpts"
    :offset="[10, 65]"
    :editable="editable"
    :clamp-to-ground="clampToGround"
    @draw-evt="drawEvt"
    @active-evt="activeEvt"
    @editor-evt="editorEvt"
    @mouse-evt="mouseEvt"
    @clear-evt="clearEvt"
    @ready="drawingsReadyDefault"
    :pin-drawing-opts="pinDrawingOpts"
    :point-drawing-opts="pointDrawingOpts"
    :polygon-drawing-opts="polygonDrawingOpts"
    :polyline-drawing-opts="polylineDrawingOpts"
    :regular-drawing-opts="regularDrawingOpts"
  ></vc-drawings>
</template>

<script setup lang="ts">
import { VcActionTooltipProps, VcCompassEvt, VcReadyObject, VcZoomEvt } from 'vue-cesium/es/utils/types';

import { VcFabProps } from 'vue-cesium';
import {
  VcDrawingActiveEvt,
  VcDrawingDrawEvt,
  VcDrawingEditorEvt,
  VcDrawingMouseEvt,
  VcDrawingOpts,
} from 'vue-cesium/es/utils/drawing-types';
import { ref } from 'vue';
import { FloodAnalysis } from 'src/types/FloodAnalysis/FloodAnalysis';
const addTerrain = ref(false);
const editable = ref(false);
const clampToGround = ref(true);
const mainFabOpts = ref<VcActionTooltipProps & VcFabProps>({
  direction: 'down',
  color: '#303336',
});
const polylineDrawingOpts = ref<VcDrawingOpts>({
  // loop: true,
  // onClick(e: any) {
  //   console.log(e);
  // },
});
const rectangleDrawingOpts = ref({
  regular: false,
});
const pinDrawingOpts = ref<VcDrawingOpts>({
  billboardOpts: {
    image: 'https://zouyaoji.top/vue-cesium/images/grepin.png',
    onClick(e: any) {
      console.log(e);
    },
  },
  labelOpts: {
    text: '图标点',
    pixelOffset: [0, -60],
    onClick(e: any) {
      console.log(e);
    },
  },
});
const pointDrawingOpts = ref<VcDrawingOpts>({
  // preRenderDatas: [
  //   [108.96018, 34.21948, 50],
  //   [108.9602, 34.21895, 100],
  // ],
  pointOpts: {
    color: 'red',
    onClick(e: any) {
      console.log(e);
    },
  },
});
const polygonDrawingOpts = ref<VcDrawingOpts>({
  polygonOpts: {},
  // preRenderDatas: [
  //   [
  //     [108.95808, 34.21955, 30],
  //     [108.95948, 34.22039, 20],
  //     [108.9595, 34.21914, 25],
  //   ],
  //   [
  //     [108.955, 34.21857],
  //     [108.95573, 34.21856],
  //     [108.95573, 34.21761],
  //     [108.95499, 34.21761],
  //   ],
  // ],
});
const regularDrawingOpts = ref<VcDrawingOpts>({
  // preRenderDatas: [
  //   [
  //     [108.95474, 34.22204],
  //     [108.95564, 34.22166],
  //   ],
  // ],
  // onClick(e: any) {
  //   console.log(e);
  // },
});
let drawing = false;
let restoreCursorMove = 'auto';
const drawingsReadyDefault = ({ Cesium, viewer, cesiumObject }: VcReadyObject) => {
  console.log('绘制选项参数：', cesiumObject);
};

const selectAreaAction = (viewer: Cesium.Viewer) => {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const pickedObject = viewer.scene.pick(event.position);
    console.log(pickedObject);

    if (Cesium.defined(pickedObject)) {
      if (pickedObject.collection) {
        const pointPrimitiveCollection = pickedObject.collection as Cesium.PointPrimitiveCollection;
        const len = pointPrimitiveCollection.length;
        const cartesian3Array = new Array<Cesium.Cartesian3>();
        for (let i = 0; i < len; i++) {
          const pointPrimitive = pointPrimitiveCollection.get(i);
          cartesian3Array.push(pointPrimitive.position);
        }
        new FloodAnalysis(viewer, cartesian3Array, 180, 400);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};

const drawEvt = (e: VcDrawingDrawEvt, viewer: Cesium.Viewer) => {
  const restoreCursor = getComputedStyle(viewer.canvas).cursor;
  if (e.finished) {
    if (e.type === 'move') {
      viewer.canvas.setAttribute('style', `cursor: ${restoreCursorMove}`);
    }
    drawing = false;
    console.log('完成了');
    selectAreaAction(viewer);
  } else {
    drawing = true;
    if (e.type === 'move') {
      viewer.canvas.setAttribute('style', 'cursor: move');
    }
    if (e.type === 'new') {
      viewer.canvas.setAttribute('style', 'cursor: crosshair');
    }
  }
};
const activeEvt = (e: VcDrawingActiveEvt, viewer: Cesium.Viewer) => {
  console.log(e);
  viewer.canvas.setAttribute('style', `cursor: ${e.isActive ? 'crosshair' : 'auto'}`);
  if (!e.isActive) {
    drawing = false;
    restoreCursorMove = 'auto';
  }
};
const editorEvt = (e: VcDrawingEditorEvt, viewer: Cesium.Viewer) => {
  if (e.type === 'move') {
    viewer.canvas.setAttribute('style', 'cursor: move');
    drawing = true;
  } else {
    viewer.canvas.setAttribute('style', 'cursor: auto');
  }
};
const mouseEvt = (e: VcDrawingMouseEvt, viewer: Cesium.Viewer) => {
  const restoreCursor = getComputedStyle(viewer.canvas).cursor;
  if (!drawing) {
    console.log(e);
    if (e.type === 'onmouseover') {
      restoreCursorMove = restoreCursor;
      viewer.canvas.setAttribute('style', 'cursor: pointer');
    } else {
      viewer.canvas.setAttribute('style', `cursor: ${restoreCursorMove || 'auto'}`);
    }
  }
};
const clearEvt = (e: object, viewer: Cesium.Viewer) => {
  console.log(e);
};
</script>

<style scoped lang="scss">
:deep(.vc-drawings-container) {
  position: relative;
  margin-left: 8px !important;
  .vc-fab {
    background: none !important;
    > .vc-btn {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
      padding: 0;
      border-radius: 14%;
      background: #303336;
      border: 1px solid #444;
      color: #edffff;
      fill: #edffff;
      vertical-align: middle;
      margin: 2px 3px;
      &:hover {
        color: #fff;
        fill: #fff;
        background: #48b;
        border-color: #aef;
        box-shadow: 0 0 8px #fff;
      }
    }
  }
}
</style>
