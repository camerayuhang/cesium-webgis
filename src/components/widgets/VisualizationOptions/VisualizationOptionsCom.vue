<template>
  <q-list dense>
    <q-item-label header class="text-h6">Overlay</q-item-label>
    <!-- 风场图功能 -->
    <wind-map-option-com></wind-map-option-com>
    <q-separator></q-separator>

    <photogrammetry-tile-com></photogrammetry-tile-com>

    <q-item-label header class="text-h6">Tools</q-item-label>
    <add-place-mark-option-com></add-place-mark-option-com>
  </q-list>
</template>

<script setup lang="ts">
import AddPlaceMarkOptionCom from './AddPlaceMarkOption/AddPlaceMarkOptionCom.vue';
import PhotogrammetryTileCom from './Photogrammetry/PhotogrammetryTileCom.vue';
import WindMapOptionCom from './WindMapOption/WindMapOptionCom.vue';
</script>
