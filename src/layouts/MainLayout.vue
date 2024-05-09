<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="row justify-between">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Cesium Map </q-toolbar-title>
        <div>
          <span class="text-bold">Created by:</span>
          <!-- <q-item tag="a" href="https://github.com/camerayuhang" clickable target="_blank"> -->
          <q-chip clickable @click="openPage('https://github.com/camerayuhang')">
            <q-avatar class="contributor">
              <img src="	https://avatars.githubusercontent.com/u/93120000?s=48&v=4" />
            </q-avatar>
            camerayuhang
          </q-chip>
          <q-chip clickable @click="openPage('https://github.com/ThreeLeaves66')">
            <q-avatar class="contributor">
              <img src="https://avatars.githubusercontent.com/u/90537777?v=4" />
            </q-avatar>
            ThreeLeaves66
          </q-chip>
        </div>
      </q-toolbar>

      <!-- <q-tabs align="left">
        <q-route-tab
          v-for="tablink in tabLinks"
          :key="tablink.title"
          :label="tablink.title"
          :to="tablink.link"
        ></q-route-tab>
      </q-tabs> -->
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <!-- v-bind用来直接绑定对象，对象里的值就是组件里的prop -->
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/EssentialLink.vue';
import { TabLink } from 'src/types/TabLink';

const tabLinks: TabLink[] = [
  // {
  //   title: 'CesiumMap',
  //   link: 'cesiummap',
  // },
  {
    title: 'VueCesium',
    link: 'vuecesium',
  },
];

const essentialLinks: EssentialLinkProps[] = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    title: 'QuaCom',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'quacom',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

const leftDrawerOpen = ref(false);
const openPage = (link: string) => {
  window.open(link, '_blank');
};

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style scoped lang="scss">
.contributor {
  font-size: 2em;
}
</style>
