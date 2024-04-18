<template>
  <vc-overlay-windmap
    ref="wind"
    v-if="windData !== null"
    :data="windData"
    :options="visualizationOptionsStore.particleSystemOptions"
  >
  </vc-overlay-windmap>
</template>

<script lang="ts" setup>
import { NetCDFData } from 'src/types/NetCDFData';
import { useVisualizationOptionsStore } from 'src/stores/VisualizationOptionsStore';
const visualizationOptionsStore = useVisualizationOptionsStore();
interface Prop {
  windData?: NetCDFData;
}
withDefaults(defineProps<Prop>(), {
  windData: () => {
    return {
      dimensions: {
        lon: 1,
        lat: 1,
        lev: 1,
      },
      lon: {
        array: new Float32Array(),
        min: 1,
        max: 1,
        delta: 1,
      },
      lat: {
        array: new Float32Array(),
        min: 1,
        max: 1,
        delta: 1,
      },
      lev: {
        array: new Float32Array(),
        min: 1,
        max: 1,
      },
      U: {
        array: new Float32Array(),
        min: 1,
        max: 1,
      },
      V: {
        array: new Float32Array(),
        min: 1,
        max: 1,
      },
    };
  },
});

const viewerParameters = {
  latRange: [0, 70],
  lonRange: [74, 140],
};
</script>

<style lang="scss"></style>
