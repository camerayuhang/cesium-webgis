<template>
  <q-item tag="label" v-ripple>
    <q-item-section>
      <q-checkbox v-model="show" label="倾斜摄影" @update:model-value="onCheckboxchanged" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVueCesium } from 'vue-cesium';

const show = ref(false);
const vcViewer = useVueCesium();
const viewer = vcViewer.viewer;
const scene = viewer.scene;

const onCheckboxchanged = async (v: boolean, e: Event) => {
  if (v) {
    // 倾斜摄影
    const tileset = await Cesium.Cesium3DTileset.fromIonAssetId(354759, { show: true });
    scene.primitives.add(tileset);
    viewer.flyTo(tileset);
  } else {
    // 清除倾斜摄影
    scene.primitives.removeAll();
  }
};
</script>
