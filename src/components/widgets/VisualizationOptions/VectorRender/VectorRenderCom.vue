<template>
  <q-item tag="label" v-ripple>
    <q-item-section>
      <q-checkbox v-model="isShow" label="海洋流场矢量图" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { VectorRender } from 'src/types/visualizationClasses/VectorRender';
import { useVueCesium } from 'vue-cesium';
import { ClickToTriggerPropertyPanel } from 'src/types/visualizationClasses/ClickToTriggerPanelShow';
// 控制可视化效果的显示和隐藏
const isShow = ref(false);
const viewer = useVueCesium().viewer;
const userInput = {
  particlesTextureSize: Math.ceil(Math.sqrt(5000)),
  maxParticles: Math.pow(Math.ceil(Math.sqrt(5000)), 2),
  particleHeight: 500,
  fadeOpacity: 0.98,
  dropRate: 0.006,
  dropRateBump: 0.01,
  speedFactor: 10.0,
  lineWidth: 5.0,
};
const url = './data/ubar_vbar_20160102.json';
//海洋流场可视化对象
const vectorRenderObject = new VectorRender(viewer, userInput, url);

// 点击将会触发属性面板显示
const clickToTriggerPropertyPanel = new ClickToTriggerPropertyPanel(vectorRenderObject, viewer);

// 监听isShow的变化，控制效果显隐藏

watch(isShow, (newValue) => {
  if (!newValue) {
    // 清除事件
    clickToTriggerPropertyPanel.removeEventListening();
    // 销毁粒子系统
    vectorRenderObject.removePrimitives();
    // 关闭动画（不显示动画控件）
    viewer.clock.shouldAnimate = false;
  } else {
    // 开启事件监听
    clickToTriggerPropertyPanel.addEventListening();
    //创建粒子系统
    vectorRenderObject.createParticleSystem();
    // 开启动画（不显示动画控件）
    viewer.clock.shouldAnimate = true;
  }
});
</script>

<style lang="scss" scoped></style>
