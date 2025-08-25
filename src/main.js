/**
 * 应用入口文件
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.scss'
import App from './App.vue'
import pkg from '../package.json'

import { registerVfsFromURL } from './main-func'; // 应用入口文件相关的功能函数

// 注册虚拟文件系统
await registerVfsFromURL(`/${pkg.name}/vfs.json`);

// 创建Vue应用
const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
