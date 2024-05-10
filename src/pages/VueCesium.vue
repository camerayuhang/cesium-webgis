<template>
  <q-page :style-fn="myTweak">
    <vc-viewer
      id="cesiumContainer"
      :animation="animation"
      :base-layer-picker="baseLayerPicker"
      :timeline="timeline"
      :fullscreen-button="fullscreenButton"
      :fullscreen-element="fullscreenElement"
      :info-box="infoBox"
      :skyAtmosphere="false"
      :skyBox="false"
      :scene-mode-picker="false"
      :show-credit="showCredit"
      @ready="ready"
    >
      <vc-navigation
        :offset="offset"
        @compass-evt="onNavigationEvt"
        :other-opts="otherOpts"
        @zoom-evt="onNavigationEvt"
      ></vc-navigation>

      <q-bar class="transparent text-white absolute z-max" ref="barRef" style="height: 40px">
        <div class="cursor-pointer">
          <div id="baseMapPicker" ref="baseMapPickerRef" class="cursor-pointer"></div>
        </div>
        <div class="cursor-pointer">
          <q-icon name="widgets" size="30px" class="cesium-button cesium-toolbar-button"></q-icon>
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
        <div class="cursor-pointer">
          <div id="projectionPicker" ref="projectionPickerRef" class="cursor-pointer"></div>
        </div>
        <div class="cursor-pointer">
          <div id="sceneModePicker" ref="sceneModePickerRef" class="cursor-pointer"></div>
        </div>
        <div class="cursor-pointer">
          <q-icon name="search" size="30px" class="cesium-button cesium-toolbar-button"></q-icon>
          <search-input v-if="!loading"></search-input>
        </div>
        <draw-tools></draw-tools>
        <q-space />
      </q-bar>

      <WindMap :windData="windData" v-if="visualizationOptionsStore.overlayWindMap"></WindMap>
      <new-place-mark-panel v-if="!loading"></new-place-mark-panel>

      <!-- Cesium Imagery -->
      <!-- <vc-layer-imagery>
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
      </vc-layer-imagery> -->

      <!-- <tool-bar></tool-bar> -->
      <properties-panel
        v-if="!loading"
        v-show="propertiesPanelIsShow"
        :position="screenPosition"
        :properties="properties"
      ></properties-panel>
      <tab-menu-com v-if="!loading"></tab-menu-com>
      <panoramic-map-panel v-if="!loading" v-show="panoramicMapPanelIsShow"></panoramic-map-panel> </vc-viewer
  ></q-page>
</template>

<script setup lang="ts">
import { VcActionTooltipProps, VcCompassEvt, VcReadyObject, VcZoomEvt } from 'vue-cesium/es/utils/types';

import { ref, watch, getCurrentInstance, ComponentInternalInstance, onMounted } from 'vue';
import { loadNetCDF } from 'src/tools/utils';
import { NetCDFData } from 'src/types/NetCDFData';
import WindMap from 'src/components/WindMap.vue';
import TabMenuCom from 'src/components/widgets/TabMenuCom.vue';
import PanoramicMapPanel from 'src/components/widgets/VisualizationOptions/PanoramicMap/PanoramicMapPanel.vue';
import PropertiesPanel from 'src/components/widgets/PropertiesPanel.vue';
import SearchInput from 'src/components/widgets/SearchInput.vue';
import { useVisualizationOptionsStore } from 'src/stores/VisualizationOptionsStore';
import NewPlaceMarkPanel from 'src/components/widgets/VisualizationOptions/AddPlaceMarkOption/NewPlaceMarkPanel.vue';
import { BaseMapService } from 'src/types/BaseMapService/BaseMapService';
import { Loading } from 'quasar';
import DrawTools from 'src/components/widgets/DrawingTool/DrawTools.vue';

const barRef = ref();
const loading = ref(true);
const animation = ref(true);
const timeline = ref(true);
const baseMapPickerRef = ref<HTMLDivElement>();
const projectionPickerRef = ref<HTMLDivElement>();
const sceneModePickerRef = ref<HTMLDivElement>();
const baseLayerPicker = ref(false);
const fullscreenButton = ref(false);
const infoBox = ref(false);
// const terrain = Cesium.Terrain.fromWorldTerrain();
const fullscreenElement = document.body;
const showCredit = ref(false);

const windData = ref<NetCDFData>();

const offset = ref<[number, number]>([50, 25]);
// 全景图控件相关
const panoramicMapPanelIsShow = ref(false);
// 标量场可视化控件相关
const propertiesPanelIsShow = ref(false);
const properties = ref({});
const screenPosition = ref({ x: 0, y: 0 });

const visualizationOptionsStore = useVisualizationOptionsStore();
const otherOpts = ref({
  offset: [0, 32],
  position: 'bottom-right',
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

const ready = async (readyObj: VcReadyObject) => {
  Loading.show({
    message: 'Loading Earth...',
  });
  // window.vm = this;

  const baseMapService = new BaseMapService(readyObj.viewer, baseMapPickerRef.value as HTMLDivElement);
  await baseMapService.initBaseMap();
  new Cesium.ProjectionPicker(projectionPickerRef.value as HTMLDivElement, readyObj.viewer.scene);
  new Cesium.SceneModePicker(sceneModePickerRef.value as HTMLDivElement, readyObj.viewer.scene);

  // baseMapService.initTerrain();
  // new Cesium.BaseLayerPicker(baseMapPickerRef.value as HTMLDivElement, {
  //   globe: readyObj.viewer.scene.globe,
  //   imageryProviderViewModels: baseMapService.imageryViewModels,
  //   terrainProviderViewModels: baseMapService.viewModel.terrainProviderViewModels,
  // });
  // baseLayerPicker.value = false;

  loadNetCDF('https://zouyaoji.top/vue-cesium/SampleData/wind/demo.nc').then((data) => {
    console.log(data);
    windData.value = data;
  });
  readyObj.viewer.scene.globe.depthTestAgainstTerrain = true;
  loading.value = false;
  Loading.hide();
};

// 获取全局事件监听对象
const { $emitter } = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties;
// 控制全景地图面板的显示和隐藏
$emitter.on('panoramicMapPanelIsShow', (value: boolean | unknown) => {
  panoramicMapPanelIsShow.value = value as boolean;
});
// 控制属性面板的显示和隐藏
$emitter.on('propertiesPanelStateChange', (value: any) => {
  properties.value = value.properties != undefined ? value.properties : properties.value;
  screenPosition.value = value.screenPosition != undefined ? value.screenPosition : screenPosition.value;
  propertiesPanelIsShow.value = value.isShow != undefined ? value.isShow : propertiesPanelIsShow.value;
});

const myTweak = (offset: number) => {
  return {
    height: `calc(100vh - ${offset}px)`,
  };
};
</script>

<style lang="scss" scoped>
#cesiumContainer {
  // height: 80vh !important;
  position: relative;
}
.cesium-baseLayerPicker-dropDown {
  left: 1vh;
}

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
