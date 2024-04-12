<template>
  <q-list dense>
    <q-item-label header>Overlay</q-item-label>
    <!-- 风场图功能 -->
    <wind-map-option-com></wind-map-option-com>
    <q-item-label header>Tools</q-item-label>
    <add-place-mark-option-com></add-place-mark-option-com>
  </q-list>
</template>

<script setup lang="ts">
import AddPlaceMarkOptionCom from './AddPlaceMarkOption/AddPlaceMarkOptionCom.vue';
import WindMapOptionCom from './WindMapOption/WindMapOptionCom.vue';
</script>
