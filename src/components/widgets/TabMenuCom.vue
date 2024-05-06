<template>
  <div class="sc-widget-container" style="max-width: 30vh">
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

      <q-tab-panels v-model="tab" animated class="content" :keep-alive="true">
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
  // background: rgba($color: #16073e, $alpha: 0.5);
  position: absolute;
  left: 5vh;
  top: 2vh;
  .content {
    height: 60vh;
    // overflow: scroll;
    .q-panel {
      overflow: hidden;
    }
    .q-tab-panel {
      overflow-y: scroll;
      overflow-x: hidden;
    }
  }
}
</style>
