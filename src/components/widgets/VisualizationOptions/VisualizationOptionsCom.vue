<template>
  <q-list dense>
    <q-item-label header>Overlay</q-item-label>
    <q-item tag="label" v-ripple>
      <q-item-section>
        <q-checkbox v-model="visualizationOptionsStore.overlayWindMap" label="风场图" />
      </q-item-section>
    </q-item>
    <q-item>
      <q-item-section>
        <q-expansion-item v-model="expanded" label="风场控制" dense-toggle>
          <q-badge color="secondary">maxParticles</q-badge>
          <q-slider v-model="particleSystemOptions.maxParticles" :min="1" :max="65536" :step="1"></q-slider>
          <q-badge color="secondary">particleHeight</q-badge>
          <q-slider v-model="particleSystemOptions.particleHeight" :min="1" :max="10000" :step="1"></q-slider>
          <q-badge color="secondary">fadeOpacity</q-badge>
          <q-slider v-model="particleSystemOptions.fadeOpacity" :min="0.9" :max="0.999" :step="0.001"></q-slider>
          <q-badge color="secondary">dropRate</q-badge>
          <q-slider v-model="particleSystemOptions.dropRate" :min="0.0" :max="0.1" :step="0.001"></q-slider>
          <q-badge color="secondary">dropRateBump</q-badge>
          <q-slider v-model="particleSystemOptions.dropRateBump" :min="0.0" :max="0.2" :step="0.001"></q-slider>
          <q-badge color="secondary">speedFactor</q-badge>
          <q-slider v-model="particleSystemOptions.speedFactor" :min="0.5" :max="8" :step="0.1"></q-slider>
          <q-badge color="secondary">lineWidth</q-badge>
          <q-slider v-model="particleSystemOptions.lineWidth" :min="0.01" :max="16" :step="0.01"></q-slider>
        </q-expansion-item>
      </q-item-section>
    </q-item>
    <!-- 污染源扩散模拟 -->
    <pollution-diffusion-com></pollution-diffusion-com>
    <!-- 海洋温度标量场可视化 -->
    <scalar-render-com></scalar-render-com>
    <!-- 海洋流速矢量场可视化 -->
    <vector-render-com></vector-render-com>
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVisualizationOptionsStore } from 'src/stores/VisualizationOptionsStore';
import ScalarRenderCom from 'src/components/widgets/VisualizationOptions/ScalarRenderCom.vue';
import PollutionDiffusionCom from 'src/components/widgets/VisualizationOptions/PollutionDiffusionCom.vue';
import VectorRenderCom from 'src/components/widgets/VisualizationOptions/VectorRenderCom.vue';

const visualizationOptionsStore = useVisualizationOptionsStore();
const particleSystemOptions = visualizationOptionsStore.particleSystemOptions;
const expanded = ref(false);
</script>
