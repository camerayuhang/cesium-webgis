<template>
  <q-item tag="label" v-ripple>
    <q-item-section>
      <q-checkbox v-model="isShow" label="污染扩散模拟图" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { PollutionDiffusion } from 'src/types/visualizationClasses/PollutionDiffusion';
import { useVueCesium } from 'vue-cesium';
// 控制可视化效果的显示和隐藏
const isShow = ref(false);
const viewer = useVueCesium().viewer;
// 污染源扩散可视化对象
const pollutionDiffusionObject = new PollutionDiffusion(viewer);
// 监听isShow的变化，控制效果显隐藏

watch(isShow, (newValue) => {
  if (!newValue) {
    // 销毁粒子系统
    pollutionDiffusionObject.removeParticleSystem();
    // 关闭动画（不显示动画控件）
    viewer.clock.shouldAnimate = false;
  } else {
    setTimeout(() => {
      //创建粒子系统
      pollutionDiffusionObject.createParticleSystem();
      // 开启动画（不显示动画控件）
      viewer.clock.shouldAnimate = true;
    }, 500);
  }
});
</script>

<style lang="scss" scoped></style>
src/types/visualizationClasses/PollutionDiffusion
