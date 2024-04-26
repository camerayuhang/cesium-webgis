<template>
  <q-list dense>
    <q-item-label header class="text-h6">Overlay</q-item-label>
    <!-- 污染源扩散模拟 -->
    <pollution-diffusion-com></pollution-diffusion-com>
    <!-- 海洋温度标量场可视化 -->
    <scalar-render-com></scalar-render-com>
    <!-- 海洋流速矢量场可视化 -->
    <vector-render-com></vector-render-com>
    <!-- 风场图功能 -->
    <wind-map-option-com></wind-map-option-com>
    <q-separator></q-separator>

    <photogrammetry-tile-com></photogrammetry-tile-com>
    <q-item-label header class="text-h6">Panels</q-item-label>
    <panoramic-map-com></panoramic-map-com>
    <q-item-label header class="text-h6">Tools</q-item-label>
    <add-place-mark-option-com></add-place-mark-option-com>
  </q-list>
</template>

<script setup lang="ts">
import ScalarRenderCom from 'src/components/widgets/VisualizationOptions/ScalarRender/ScalarRenderCom.vue';
import PollutionDiffusionCom from 'src/components/widgets/VisualizationOptions/PollutionDiffusion/PollutionDiffusionCom.vue';
import VectorRenderCom from 'src/components/widgets/VisualizationOptions/VectorRender/VectorRenderCom.vue';
import PanoramicMapCom from 'src/components/widgets/VisualizationOptions/PanoramicMap/PanoramicMapCom.vue';

import AddPlaceMarkOptionCom from './AddPlaceMarkOption/AddPlaceMarkOptionCom.vue';
import PhotogrammetryTileCom from './Photogrammetry/PhotogrammetryTileCom.vue';
import WindMapOptionCom from './WindMapOption/WindMapOptionCom.vue';
</script>
