import { boot } from 'quasar/wrappers';
import mitt, { Emitter, EventType } from 'mitt';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $emitter: Emitter<Record<EventType, unknown>>;
  }
}
const GlobalEmitter = mitt();
export default boot(({ app }) => {
  // 全局的emitter对象
  app.config.globalProperties.$emitter = GlobalEmitter;
});
