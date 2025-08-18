/**
 * 引入Element Plus并注册为全局组件库
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.scss'
import App from './App.vue'
import pkg from '../package.json'

import vfsService from './services/vfs-service';

vfsService.registerVfs({
    type: 'static',
    drive: 'static-models',
    baseURL: `/${pkg.name}`,
    root: '/vfs/models',
});
vfsService.registerVfs({
    type: 'static',
    drive: 'static-textures',
    baseURL: `/${pkg.name}`,
    root: '/vfs/textures',
});

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
