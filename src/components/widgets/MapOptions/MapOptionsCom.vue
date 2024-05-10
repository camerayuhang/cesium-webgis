<template>
  <q-list dense ref="MapOptinDivContentRef" class="sc-widget">
    <q-item-label header>视窗选项</q-item-label>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="mapOptions.viewerShadows" label="阴影效果" />
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item-label header>地球选项</q-item-label>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="mapOptions.globeEnableLighting" label="阳光效果" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="mapOptions.globeShowGroundAtmosphere" label="地表大气" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="mapOptions.globeTranslucencyEnabled" label="地表透明" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="mapOptions.globeShow" label="显示地球" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="mapOptions.globeDepthTestAgainstTerrain" label="深度检测" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="check1" label="地形线框" />
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item-label header>场景选项</q-item-label>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="check1" label="天空大气" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="check1" label="显示雾气" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="check1" label="主动渲染" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="check1" label="对数深度" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="check1" label="码率帧数" />
      </q-item-section>
    </q-item>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="check1" label="显示视锥" />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { useVueCesium } from 'vue-cesium';
import type { VcViewerProvider, VcReadyObject } from 'vue-cesium/es/utils/types';

const check1 = ref(true);
const vcViewer = useVueCesium();

const viewer = vcViewer.viewer;
const globe = viewer.scene.globe;

const mapOptions = reactive({
  viewerShadows: viewer.shadows,
  globeEnableLighting: globe.enableLighting,
  globeShowGroundAtmosphere: globe.showGroundAtmosphere,
  globeTranslucencyEnabled: globe.translucency.enabled,
  globeShow: globe.show,
  globeDepthTestAgainstTerrain: globe.depthTestAgainstTerrain,
});
// const viewerShadows = ref(viewer.shadows);
// const globeEnableLighting = ref(globe.enableLighting);
// const globeShowGroundAtmosphere = ref(globe.showGroundAtmosphere);
// const globeTranslucencyEnabled = ref(globe.translucency.enabled);
// const globeShow = ref(globe.show);
// const globeDepthTestAgainstTerrain = ref(globe.depthTestAgainstTerrain);

watch(mapOptions, (newValue) => {
  viewer.shadows = newValue.viewerShadows;
  globe.enableLighting = newValue.globeEnableLighting;
  globe.showGroundAtmosphere = newValue.globeShowGroundAtmosphere;
  globe.translucency.enabled = newValue.globeTranslucencyEnabled;
  globe.show = newValue.globeShow;
  globe.depthTestAgainstTerrain = newValue.globeDepthTestAgainstTerrain;
});
</script>

<style lang="scss" scoped></style>
