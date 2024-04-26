<template>
  <q-item tag="label" v-ripple>
    <q-item-section>
      <q-checkbox v-model="isShow" label="全景地图（福大）" />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ref, watch, getCurrentInstance, ComponentInternalInstance } from 'vue';

// 控制panel的显示和隐藏
const isShow = ref(false);
// 获取全局事件监听对象
const { $emitter } = (getCurrentInstance() as ComponentInternalInstance).appContext.config.globalProperties;
// 监听isShow的变化
watch(isShow, (newValue) => {
  // 触发事件
  $emitter.emit('panoramicMapPanelIsShow', newValue as boolean);
});
</script>

<style scoped lang="scss"></style>
