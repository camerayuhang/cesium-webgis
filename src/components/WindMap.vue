<template>
  <vc-overlay-windmap ref="wind" v-if="windData !== null" :data="windData" :options="particleSystemOptions">
  </vc-overlay-windmap>
</template>

<script lang="ts" setup>
import { NetCDFData } from 'src/types/NetCDFData';

interface Prop {
  windData?: NetCDFData;
}
defineProps<Prop>();

const particleSystemOptions = {
  maxParticles: 64 * 64,
  particleHeight: 100.0,
  fadeOpacity: 0.996,
  dropRate: 0.003,
  dropRateBump: 0.01,
  speedFactor: 1.0,
  lineWidth: 4.0,
};
const viewerParameters = {
  latRange: [0, 70],
  lonRange: [74, 140],
};
</script>

<style lang="scss"></style>
