<template>
  <q-card
    class="properties-panel absolute z-top"
    :style="{
      top: position.y + 'px',
      left: position.x + 20 + 'px',
    }"
  >
    <q-card-section>
      <div class="text-subtitle1 text-weight-bold">属性面板</div>
    </q-card-section>
    <q-separator inset />
    <q-card-section>
      <q-list dense>
        <q-item v-for="(value, key) in properties" :key="key" :clickable="false" class="justify-between">
          <q-item-section class="text-subtitle1 bg-primary text-grey-1 text-weight-bold" style="border-radius: 10%">
            <span style="margin: auto">{{ key }}</span>
          </q-item-section>
          <q-item-section class="text-subtitle2">
            <span style="margin: auto">{{ value }}</span></q-item-section
          >
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import type { PropType } from 'vue';
import { Properties } from 'src/types/Properties';
interface Position {
  x: number;
  y: number;
}
const props = defineProps({
  position: {
    type: Object as PropType<Position>,
    require: true,
    default: () => {
      return { x: 0, y: 0 };
    },
  },
  properties: {
    type: Object as PropType<Properties>,
    require: true,
    default: () => {
      return { lon: null, lat: null, value: null };
    },
  },
});
const position = computed(() => {
  return props.position;
});
const properties = computed(() => {
  return props.properties;
});
</script>

<style scoped lang="scss">
.properties-panel {
  height: 27vh;
  overflow: auto;
}
</style>
