<template>
  <q-page>
    <q-bar class="bg-black text-white">
      <div class="cursor-pointer">File</div>
      <div class="cursor-pointer">Edit</div>
      <div class="cursor-pointer gt-xs">
        View
        <q-menu class="z-top">
          <q-list dense style="min-width: 180px">
            <q-item tag="label" clickable v-close-popup>
              <q-item-section> <q-checkbox v-model="animation" /> </q-item-section>
              <q-item-section>动画</q-item-section>
            </q-item>
            <q-item tag="label" clickable v-close-popup>
              <q-item-section> <q-checkbox v-model="timeline" /> </q-item-section>
              <q-item-section>时间轴</q-item-section>
            </q-item>
            <q-item tag="label" clickable v-close-popup>
              <q-item-section> <q-checkbox v-model="baseLayerPicker" /> </q-item-section>
              <q-item-section>基础图层</q-item-section>
            </q-item>
            <q-item tag="label" clickable v-close-popup>
              <q-item-section> <q-checkbox v-model="fullscreenButton" /> </q-item-section>
              <q-item-section>全盘按钮</q-item-section>
            </q-item>
            <q-item tag="label" clickable v-close-popup>
              <q-item-section> <q-checkbox v-model="infoBox" /> </q-item-section>
              <q-item-section>信息提示框</q-item-section>
            </q-item>
            <q-item tag="label" clickable v-close-popup>
              <q-item-section> <q-checkbox v-model="showCredit" /> </q-item-section>
              <q-item-section>版权信息</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <div class="cursor-pointer gt-xs">Window</div>
      <div class="cursor-pointer">Help</div>
      <q-space />
    </q-bar>
    <vc-viewer
      class="relative-position"
      :animation="animation"
      :base-layer-picker="baseLayerPicker"
      :timeline="timeline"
      :fullscreen-button="fullscreenButton"
      :fullscreen-element="fullscreenElement"
      :info-box="infoBox"
      :skyAtmosphere="false"
      :skyBox="false"
      :scene-mode-picker="true"
      :show-credit="showCredit"
      @ready="ready"
    >
      <vc-navigation
        :offset="offset"
        @compass-evt="onNavigationEvt"
        :other-opts="otherOpts"
        @zoom-evt="onNavigationEvt"
      ></vc-navigation>

      <!-- Cesium Entity -->
      <!-- <vc-entity @click="onEntityClick" :position="position" :point="point" :label="label">
          <vc-graphics-billboard
            image="https://zouyaoji.top/vue-cesium/favicon.png"
            :scale="0.5"
          ></vc-graphics-billboard>
          <vc-graphics-rectangle :coordinates="[130, 20, 80, 25]" material="green"></vc-graphics-rectangle>
        </vc-entity> -->

      <WindMap :windData="windData" v-if="visualizationOptionsStore.overlayWindMap"></WindMap>
      <new-place-mark-panel v-if="!loading"></new-place-mark-panel>

      <!-- Cesium Imagery -->
      <vc-layer-imagery>
        <vc-imagery-provider-tianditu
          map-style="img_c"
          token="436ce7e50d27eede2f2929307e6b33c0"
        ></vc-imagery-provider-tianditu>
      </vc-layer-imagery>
      <vc-layer-imagery ref="layerText">
        <vc-imagery-provider-tianditu
          map-style="cia_c"
          token="436ce7e50d27eede2f2929307e6b33c0"
        ></vc-imagery-provider-tianditu>
      </vc-layer-imagery>

      <!-- <tool-bar></tool-bar> -->
      <tab-menu-com v-if="!loading"></tab-menu-com> </vc-viewer
  ></q-page>
</template>

<script setup lang="ts">
// import {
//   VcConfigProvider,
//   VcViewer,
//   VcNavigation,
//   VcEntity,
//   VcGraphicsBillboard,
//   VcGraphicsRectangle,
//   VcLayerImagery,
//   VcImageryProviderTianditu,
// } from 'vue-cesium';
import { VcPosition, VcCompassEvt, VcZoomEvt, VcPickEvent } from 'vue-cesium/es/utils/types';

import { ref, watch } from 'vue';
import { loadNetCDF } from 'src/tools/utils';
import { NetCDFData } from 'src/types/NetCDFData';
import WindMap from 'src/components/WindMap.vue';
import TabMenuCom from 'src/components/widgets/TabMenuCom.vue';
import { useVisualizationOptionsStore } from 'src/stores/VisualizationOptionsStore';
import NewPlaceMarkPanel from 'src/components/widgets/VisualizationOptions/AddPlaceMarkOption/NewPlaceMarkPanel.vue';

const loading = ref(true);
const animation = ref(true);
const timeline = ref(true);
const baseLayerPicker = ref(true);
const fullscreenButton = ref(false);
const infoBox = ref(false);
// const terrain = Cesium.Terrain.fromWorldTerrain();
const fullscreenElement = document.body;
const showCredit = ref(false);

const windData = ref<NetCDFData>();

const offset = ref<[number, number]>([50, 25]);

const visualizationOptionsStore = useVisualizationOptionsStore();

const otherOpts = ref({
  offset: [0, 32],
  position: 'bottom-right',
});

const point = ref({
  pixelSize: 28,
  color: 'red',
});

const position = ref({ lng: 108, lat: 32 } as VcPosition);

const label = ref({
  text: 'Hello World',
  pixelOffset: [0, 150],
});

watch(timeline, (val) => {
  otherOpts.value.offset = val ? [0, 30] : fullscreenButton.value ? [30, 5] : [0, 5];
});

watch(fullscreenButton, (val) => {
  if (!timeline.value && !val) {
    otherOpts.value.offset = [0, 5];
  } else if (!timeline.value && val) {
    otherOpts.value.offset = [30, 5];
  }
});

const onNavigationEvt = (e: VcCompassEvt | VcZoomEvt) => {
  console.log(e);
};
const onEntityClick = (e: VcPickEvent) => {
  console.log(e);
};

const ready = () => {
  // window.vm = this;

  loadNetCDF('https://zouyaoji.top/vue-cesium/SampleData/wind/demo.nc').then((data) => {
    console.log(data);
    windData.value = data;
  });
  loading.value = false;
};
</script>

<style lang="scss">
#cesiumContainer {
  height: 80vh !important;
}
</style>
