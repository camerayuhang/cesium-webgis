<template>
  <q-item tag="label" v-ripple>
    <q-item-section>
      <q-checkbox v-model="isShow" label="海洋温度标量图" v-show="!isLoading" :disable="isLoading" />
      <q-inner-loading :showing="isLoading" label="Please wait..." />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ScalarRender } from 'src/types/visualizationClasses/ScalarRender';
import { useVueCesium } from 'vue-cesium';
import { ClickToTriggerPropertyPanel } from 'src/types/visualizationClasses/ClickToTriggerPanelShow';
// 控制可视化效果的显示和隐藏
const isShow = ref(false);
// Cesium中的viewer对象
const viewer = useVueCesium().viewer;
// 判断是否正在加载
const isLoading = ref(false);
// 指定url
const url = './data/temp0_20160102_30*30.json';
// 温度标量图可视化对象
const scalarRenderObject = new ScalarRender(viewer, url);
// 点击将会触发属性面板显示
const clickToTriggerPropertyPanel = new ClickToTriggerPropertyPanel(scalarRenderObject, viewer);

// 标量图显示事件监听
scalarRenderObject.getEmitter().on('isLoading', (value) => {
  // 更新loading的状态
  isLoading.value = value as boolean;
  if (!value) {
    // 事件监听
    clickToTriggerPropertyPanel.addEventListening();
  }
});

// 监听isShow的变化，控制效果显隐藏
watch(isShow, (newValue) => {
  if (!newValue) {
    // 销毁图层
    scalarRenderObject.removeScalarField();
    // 事件清除
    clickToTriggerPropertyPanel.removeEventListening();
  } else {
    //创建图层（异步）
    scalarRenderObject.createScalarField();
  }
});
</script>

<style lang="scss" scoped></style>
