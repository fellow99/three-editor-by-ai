/**
 * Vite 配置文件
 * - base 和 build.outDir 动态读取 package.json 的 name 字段
 * - 配置 @ 别名指向 src 目录，便于简洁引用（如 import xxx from '@/utils/xxx'）
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  base: `/${pkg.name}`,
  build: {
    outDir: `dist/${pkg.name}`
  },
  server: {
    proxy: {
      '/mics-datahub/equipmentinfo': {
        target: 'http://172.25.107.202:9110',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/mics-datahub\/equipmentinfo/, '/equipmentinfo'),
      },
      '/mics-datahub/device': {
        target: 'http://172.25.107.202:8081',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/mics-datahub\/device/, '/device'),
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/three/examples/jsm/libs/draco/*',
          dest: 'draco'
        },
        {
          src: 'node_modules/three/examples/jsm/libs/basis/*',
          dest: 'basis'
        },
        {
          src: 'node_modules/three/examples/jsm/libs/meshopt_decoder.module.js',
          dest: 'meshopt'
        }
      ]
    })
  ],
})
