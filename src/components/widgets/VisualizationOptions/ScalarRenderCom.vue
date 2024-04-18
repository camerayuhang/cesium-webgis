<template>
  <q-item tag="label" v-ripple>
    <q-item-section>
      <q-checkbox
        v-model="isShow"
        label="海洋温度标量图"
        v-show="!visualizationOptionsStore.scalarFieldIsLoading"
        :disable="visualizationOptionsStore.scalarFieldIsLoading"
      />
      <q-inner-loading :showing="visualizationOptionsStore.scalarFieldIsLoading" label="Please wait..." />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ScalarRender } from 'src/types/visualizationClasses/ScalarRender';
import { useVueCesium } from 'vue-cesium';
import { useVisualizationOptionsStore } from 'src/stores/VisualizationOptionsStore';
// 从pinia获取对象
const visualizationOptionsStore = useVisualizationOptionsStore();
// 控制可视化效果的显示和隐藏
const isShow = ref(false);
const viewer = useVueCesium().viewer;
// 指定url
const url = '/static/data/temp0_20160102.json';
// 温度标量图可视化对象
const scalarRenderObject = new ScalarRender(viewer, url);
// 监听isShow的变化，控制效果显隐藏
watch(isShow, (newValue) => {
  if (!newValue) {
    // 销毁图层
    scalarRenderObject.removeScalarField();
  } else {
    //创建图层
    scalarRenderObject.createScalarField();
  }
});
</script>

<style lang="scss" scoped></style>
