import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useFloodAnalysisStore = defineStore('FloodAnalysisStore', () => {
  const overlayWindMap = ref(false);

  const particleSystemOptions = ref({
    maxParticles: 64 * 64,
    particleHeight: 100.0,
    fadeOpacity: 0.996,
    dropRate: 0.003,
    dropRateBump: 0.01,
    speedFactor: 1.0,
    lineWidth: 4.0,
  });

  return {};
});
