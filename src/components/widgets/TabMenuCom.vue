<template>
  <div class="sc-widget-container q-ma-xl absolute-left z-top" style="max-width: 300px">
    <q-card>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="MapOptions" label="地图选项" />
        <q-tab name="VisualizationOptions" label="可视化选项" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="MapOptions">
          <map-options-com />
        </q-tab-panel>

        <q-tab-panel name="VisualizationOptions">
          <visualization-options-com></visualization-options-com>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MapOptionsCom from './MapOptions/MapOptionsCom.vue';
import VisualizationOptionsCom from './VisualizationOptions/VisualizationOptionsCom.vue';

const tab = ref('MapOptions');
</script>

<style lang="scss">
.sc-widget-container {
  height: 70vh;
  overflow: scroll;
}
</style>
