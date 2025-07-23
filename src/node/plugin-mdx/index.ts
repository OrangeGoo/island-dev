import { pluginMdxHMR } from './pluginMdxHmr';
import { pluginMdxRollup } from './pluginMdxRollup';
import { Plugin } from 'vite';

// Vite 热更新机制
// 1. 监听到文件变动
// 2. 定位到热更新边界模块
// 3. 执行更新逻辑

// Vue/React 组件热更新使用的方式
// react-refresh
// import.meta.hot.accept()

// import.meta.hot.accept(mod => {
//   console.log(mod);
// })

// import.meta.hot.accept(['./index.mdx'], (mod) => {
//   console.log(mod);
// })

export async function createMdxPlugins(): Promise<Plugin[]> {
  return [await pluginMdxRollup(), pluginMdxHMR()];
}
