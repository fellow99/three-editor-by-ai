# 002-Assets 资源管理模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

资源管理模块是 Three Editor by AI 的资源入口层，负责将外部 3D 模型和纹理资源加载到编辑器中，并提供可视化的浏览和拖拽添加能力。

### 1.2 技术约束

- 必须使用 Vue 3 Composition API
- 必须使用 Three.js r182+ 进行预览渲染
- 必须依赖 AssetLoader（core 层）执行实际加载
- 必须支持 GLTF/OBJ/FBX 模型和 JPG/PNG/KTX2 纹理
- 必须支持 DRACO/KTX2/Meshopt 解压缩

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 状态管理 | Vue 3 ref/reactive | 响应式、与组件天然集成 |
| 缓存策略 | Map + 文件名_大小键 | 简单高效、O(1) 查找 |
| 预览渲染 | OffscreenCanvas + WebGLRenderer | 离屏渲染、不影响主场景 |
| 加载队列 | 顺序处理 | 避免并发拥塞、可控进度 |
| 拖拽实现 | HTML5 Drag and Drop API | 原生支持、无需额外依赖 |

---

## 2. useAssetsManager 技术设计

### 2.1 模块结构

```javascript
// src/composables/useAssetsManager.js

import { ref, computed } from 'vue'
import AssetLoader from '../core/AssetLoader.js'

// 单例状态
let instance = null
const assetLibrary = ref([])
const loadingQueue = ref([])
const isLoading = ref(false)
const previewCache = new Map()
const assetCache = new Map()  // 缓存键 -> 资源对象

export function useAssetsManager() {
  if (instance) return instance

  const assetLoader = new AssetLoader()

  instance = {
    assetLibrary,
    loadingQueue,
    isLoading,
    loadModel,
    loadTexture,
    getPreview,
    clearCache,
    // 内部方法
    _generatePreview,
    _processQueue,
    _addToCache,
    _checkCache
  }

  return instance
}
```

### 2.2 缓存机制实现

```javascript
// 生成缓存键
function _generateCacheKey(name, size) {
  return `${name}_${size}`
}

// 检查缓存
function _checkCache(name, size) {
  const key = _generateCacheKey(name, size)
  return assetCache.get(key) || null
}

// 写入缓存
function _addToCache(name, size, object, url) {
  const key = _generateCacheKey(name, size)
  const assetInfo = {
    id: crypto.randomUUID(),
    name,
    type: object.isTexture ? 'texture' : 'model',
    size,
    url,
    object,
    preview: null,
    loadedAt: new Date()
  }
  assetCache.set(key, assetInfo)
  assetLibrary.value.push(assetInfo)
  return assetInfo
}
```

### 2.3 模型加载实现

```javascript
async function loadModel(url, onProgress) {
  // 1. 提取文件名和大小
  const name = url.split('/').pop()
  const size = await getFileSize(url)

  // 2. 检查缓存
  const cached = _checkCache(name, size)
  if (cached) {
    return cached.object
  }

  // 3. 加入队列
  const task = { type: 'model', url, name, size, onProgress }
  loadingQueue.value.push(task)

  // 4. 触发队列处理
  if (!isLoading.value) {
    _processQueue()
  }

  // 5. 等待任务完成
  return new Promise((resolve, reject) => {
    task.promise = { resolve, reject }
  })
}
```

### 2.4 队列处理实现

```javascript
async function _processQueue() {
  while (loadingQueue.value.length > 0) {
    isLoading.value = true
    const task = loadingQueue.value.shift()

    try {
      let object
      if (task.type === 'model') {
        object = await assetLoader.loadModel(task.url, task.onProgress)
        // 自动缩放和居中
        autoScaleAndCenter(object)
      } else if (task.type === 'texture') {
        object = await assetLoader.loadTexture(task.url)
      }

      // 写入缓存
      const assetInfo = _addToCache(task.name, task.size, object, task.url)

      // 异步生成预览（仅模型）
      if (task.type === 'model') {
        _generatePreview(assetInfo)
      }

      task.promise.resolve(object)
    } catch (error) {
      task.promise.reject(error)
    }
  }

  isLoading.value = false
}
```

### 2.5 预览渲染管线

```javascript
async function _generatePreview(assetInfo) {
  const { object } = assetInfo

  // 1. 创建离屏渲染器
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power'
  })
  renderer.setSize(256, 256)
  renderer.setClearColor(0x000000, 0)

  // 2. 创建临时场景
  const scene = new THREE.Scene()
  scene.add(object.clone())

  // 3. 创建相机
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = 45
  const distance = maxDim / (2 * Math.tan((fov * Math.PI) / 360))

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, distance * 10)
  camera.position.set(distance, distance * 0.6, distance)
  camera.lookAt(center)

  // 4. 添加灯光
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  const directional = new THREE.DirectionalLight(0xffffff, 0.8)
  directional.position.set(5, 5, 5)
  scene.add(ambient, directional)

  // 5. 渲染
  renderer.render(scene, camera)

  // 6. 导出为 Base64
  const dataUrl = renderer.domElement.toDataURL('image/png')
  assetInfo.preview = dataUrl
  previewCache.set(assetInfo.id, dataUrl)

  // 7. 清理
  renderer.dispose()
}
```

### 2.6 模型自动缩放与居中

```javascript
function autoScaleAndCenter(object) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())

  // 居中到原点
  object.position.sub(center)

  // 缩放到目标尺寸（目标最大维度为 5 单位）
  const maxDim = Math.max(size.x, size.y, size.z)
  const targetSize = 5
  if (maxDim > 0) {
    const scale = targetSize / maxDim
    object.scale.multiplyScalar(scale)
  }
}
```

### 2.7 获取预览图

```javascript
function getPreview(assetId) {
  return previewCache.get(assetId) || null
}
```

### 2.8 清空缓存

```javascript
function clearCache() {
  const count = assetCache.size

  // 释放 Three.js 资源
  assetCache.forEach((assetInfo) => {
    const { object } = assetInfo
    if (object.isTexture) {
      object.dispose()
    } else if (object.isObject3D) {
      object.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
  })

  assetCache.clear()
  previewCache.clear()
  assetLibrary.value = []
}
```

---

## 3. AssetBrowser 技术设计

### 3.1 组件结构

```vue
<!-- src/components/editor/AssetBrowser.vue -->

<template>
  <div v-if="visible" class="asset-browser">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索资源..."
        clearable
      />
      <el-select v-model="filterType" size="small">
        <el-option label="全部" value="all" />
        <el-option label="模型" value="model" />
        <el-option label="纹理" value="texture" />
      </el-select>
    </div>

    <!-- 资源网格 -->
    <div class="asset-grid">
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="asset-card"
        draggable="true"
        @dragstart="onDragStart($event, asset)"
      >
        <!-- 预览图 -->
        <div class="asset-preview">
          <img
            v-if="asset.preview"
            :src="asset.preview"
            :alt="asset.name"
          />
          <div v-else-if="asset.type === 'texture'" class="texture-preview">
            <img :src="asset.url" :alt="asset.name" />
          </div>
          <div v-else class="no-preview">
            <el-icon><Loading /></el-icon>
          </div>
        </div>

        <!-- 信息 -->
        <div class="asset-info">
          <span class="asset-name" :title="asset.name">{{ asset.name }}</span>
          <span class="asset-type">{{ asset.type === 'model' ? '模型' : '纹理' }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredAssets.length === 0" class="empty-state">
      暂无资源，拖拽文件到场景即可加载
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAssetsManager } from '../../composables/useAssetsManager.js'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const { assetLibrary } = useAssetsManager()
const searchQuery = ref('')
const filterType = ref('all')

const filteredAssets = computed(() => {
  let assets = assetLibrary.value

  // 类型过滤
  if (filterType.value !== 'all') {
    assets = assets.filter(a => a.type === filterType.value)
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    assets = assets.filter(a => a.name.toLowerCase().includes(query))
  }

  return assets
})

function onDragStart(event, asset) {
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: 'asset',
    assetId: asset.id,
    name: asset.name
  }))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>
```

### 3.2 文件系统拖拽支持

```javascript
// 在 SceneViewer.vue 中处理文件拖入
function onDrop(event) {
  event.preventDefault()

  const files = event.dataTransfer.files
  if (files && files.length > 0) {
    // 处理文件系统拖入
    for (const file of files) {
      handleFileDrop(file)
    }
    return
  }

  // 处理资源库拖入
  const data = event.dataTransfer.getData('application/json')
  if (data) {
    const payload = JSON.parse(data)
    handleAssetDrop(payload)
  }
}

async function handleFileDrop(file) {
  const url = URL.createObjectURL(file)
  const { loadModel, loadTexture } = useAssetsManager()

  if (isModelFile(file.name)) {
    await loadModel(url, file.name, file.size)
  } else if (isTextureFile(file.name)) {
    await loadTexture(url, file.name, file.size)
  }

  URL.revokeObjectURL(url)
}

function handleAssetDrop(payload) {
  const { assetLibrary } = useAssetsManager()
  const asset = assetLibrary.value.find(a => a.id === payload.assetId)
  if (asset) {
    // 将资源对象添加到场景
    addObjectToScene(asset.object)
  }
}
```

---

## 4. PrimitiveBrowser 技术设计

### 4.1 组件结构

```vue
<!-- src/components/editor/PrimitiveBrowser.vue -->

<template>
  <div class="primitive-browser">
    <!-- 几何体分类 -->
    <div class="category">
      <h4>几何体</h4>
      <div class="primitive-grid">
        <div
          v-for="item in geometries"
          :key="item.type"
          class="primitive-item"
          draggable="true"
          @dragstart="onDragStart($event, item, 'geometry')"
        >
          <span class="primitive-icon">{{ item.icon }}</span>
          <span class="primitive-name">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 灯光分类 -->
    <div class="category">
      <h4>灯光</h4>
      <div class="primitive-grid">
        <div
          v-for="item in lights"
          :key="item.type"
          class="primitive-item"
          draggable="true"
          @dragstart="onDragStart($event, item, 'light')"
        >
          <span class="primitive-icon">{{ item.icon }}</span>
          <span class="primitive-name">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PRIMITIVES from '../../constants/PRIMITIVES.json'

const geometries = PRIMITIVES.filter(p => p.category === 'geometry')
const lights = PRIMITIVES.filter(p => p.category === 'light')

function onDragStart(event, item, category) {
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: 'primitive',
    primitiveType: item.type,
    category,
    name: item.name
  }))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>
```

### 4.2 数据源结构

```json
// src/constants/PRIMITIVES.json

[
  { "type": "box", "name": "立方体", "category": "geometry", "icon": "📦" },
  { "type": "sphere", "name": "球体", "category": "geometry", "icon": "🔵" },
  { "type": "cylinder", "name": "圆柱体", "category": "geometry", "icon": "🛢️" },
  { "type": "cone", "name": "圆锥体", "category": "geometry", "icon": "🔺" },
  { "type": "plane", "name": "平面", "category": "geometry", "icon": "⬜" },
  { "type": "torus", "name": "圆环", "category": "geometry", "icon": "🍩" },
  { "type": "torusKnot", "name": "圆环结", "category": "geometry", "icon": "🪢" },
  { "type": "dodecahedron", "name": "十二面体", "category": "geometry", "icon": "💎" },
  { "type": "icosahedron", "name": "二十面体", "category": "geometry", "icon": "⚽" },
  { "type": "octahedron", "name": "八面体", "category": "geometry", "icon": "💠" },
  { "type": "tetrahedron", "name": "四面体", "category": "geometry", "icon": "🔷" },
  { "type": "ring", "name": "圆环面", "category": "geometry", "icon": "⭕" },
  { "type": "tube", "name": "管状体", "category": "geometry", "icon": "🔧" },
  { "type": "circle", "name": "圆形", "category": "geometry", "icon": "🟢" },
  { "type": "directionalLight", "name": "平行光", "category": "light", "icon": "☀️" },
  { "type": "pointLight", "name": "点光源", "category": "light", "icon": "💡" },
  { "type": "spotLight", "name": "聚光灯", "category": "light", "icon": "🔦" },
  { "type": "ambientLight", "name": "环境光", "category": "light", "icon": "🌤️" },
  { "type": "hemisphereLight", "name": "半球光", "category": "light", "icon": "🌗" }
]
```

---

## 5. 拖拽集成技术实现

### 5.1 SceneViewer 拖拽处理

```javascript
// src/components/scene/SceneViewer.vue 中的拖拽处理

import { useAssetsManager } from '../../composables/useAssetsManager.js'
import { useObjectManager } from '../../composables/useObjectManager.js'
import { useCameraPosState } from '../../composables/useCameraPosState.js'

function setupDragAndDrop() {
  const container = renderer.domElement

  container.addEventListener('dragover', (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  })

  container.addEventListener('drop', async (e) => {
    e.preventDefault()
    const data = parseDropData(e)
    if (!data) return

    const cameraPos = useCameraPosState()
    const targetPosition = cameraPos.currentPosition.value.clone()

    switch (data.type) {
      case 'asset':
        await handleAssetDrop(data, targetPosition)
        break
      case 'file':
        await handleFileDrop(data, targetPosition)
        break
      case 'primitive':
        await handlePrimitiveDrop(data, targetPosition)
        break
    }
  })
}

function parseDropData(event) {
  // 优先检查文件
  if (event.dataTransfer.files.length > 0) {
    return {
      type: 'file',
      file: event.dataTransfer.files[0]
    }
  }

  // 解析 JSON 数据
  const json = event.dataTransfer.getData('application/json')
  if (json) {
    try {
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  return null
}

async function handleAssetDrop(data, position) {
  const { assetLibrary } = useAssetsManager()
  const { addObject } = useObjectManager()

  const asset = assetLibrary.value.find(a => a.id === data.assetId)
  if (!asset) return

  const cloned = asset.object.clone()
  cloned.position.copy(position)
  addObject(cloned)
}

async function handleFileDrop(data, position) {
  const { loadModel, loadTexture } = useAssetsManager()
  const { addObject } = useObjectManager()
  const file = data.file

  const url = URL.createObjectURL(file)
  let object

  try {
    if (isModelFile(file.name)) {
      object = await loadModel(url, file.name, file.size)
    } else if (isTextureFile(file.name)) {
      object = await loadTexture(url, file.name, file.size)
    }

    if (object) {
      const cloned = object.clone()
      cloned.position.copy(position)
      addObject(cloned)
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function handlePrimitiveDrop(data, position) {
  const { createPrimitive } = useObjectManager()
  const { addObject } = useObjectManager()

  const object = createPrimitive(data.primitiveType)
  if (object) {
    object.position.copy(position)
    addObject(object)
  }
}

function isModelFile(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return ['gltf', 'glb', 'obj', 'fbx'].includes(ext)
}

function isTextureFile(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'ktx2', 'webp'].includes(ext)
}
```

---

## 6. 缓存策略技术实现

### 6.1 缓存数据结构

```javascript
// 缓存 Map 结构
// Key: "filename.ext_123456" (文件名_文件大小)
// Value: { id, name, type, size, url, object, preview, loadedAt }

const assetCache = new Map()

// 示例缓存条目
{
  "Horse.glb_2048576": {
    id: "uuid-string",
    name: "Horse.glb",
    type: "model",
    size: 2048576,
    url: "blob:...",
    object: THREE.Group,
    preview: "data:image/png;base64,...",
    loadedAt: Date
  }
}
```

### 6.2 缓存命中流程

```javascript
async function loadModel(url, name, size) {
  const cacheKey = `${name}_${size}`

  // 检查缓存
  if (assetCache.has(cacheKey)) {
    const cached = assetCache.get(cacheKey)
    console.log(`缓存命中: ${cacheKey}`)
    return cached.object
  }

  // 未命中，执行加载
  console.log(`缓存未命中: ${cacheKey}，开始加载`)
  const object = await assetLoader.loadModel(url)
  autoScaleAndCenter(object)

  // 写入缓存
  const assetInfo = {
    id: crypto.randomUUID(),
    name,
    type: 'model',
    size,
    url,
    object,
    preview: null,
    loadedAt: new Date()
  }
  assetCache.set(cacheKey, assetInfo)
  assetLibrary.value.push(assetInfo)

  // 异步生成预览
  _generatePreview(assetInfo)

  return object
}
```

### 6.3 缓存清理实现

```javascript
function clearCache() {
  const count = assetCache.size

  // 遍历并释放 Three.js 资源
  for (const [, assetInfo] of assetCache) {
    disposeAssetObject(assetInfo.object)
  }

  assetCache.clear()
  previewCache.clear()
  assetLibrary.value = []

  console.log(`缓存已清空，释放 ${count} 个资源`)
}

function disposeAssetObject(object) {
  if (object.isTexture) {
    object.dispose()
    return
  }

  if (object.isObject3D) {
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
      if (child.isTexture) child.dispose()
    })
  }
}
```

---

## 7. 预览渲染管线技术实现

### 7.1 离屏渲染器管理

```javascript
// 预览渲染器单例（复用渲染器实例）
let previewRenderer = null

function getPreviewRenderer() {
  if (!previewRenderer) {
    previewRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    })
    previewRenderer.setSize(256, 256)
    previewRenderer.setClearColor(0x000000, 0)
  }
  return previewRenderer
}
```

### 7.2 预览生成完整流程

```javascript
async function _generatePreview(assetInfo) {
  const { object } = assetInfo
  if (!object || !object.isObject3D) return

  const renderer = getPreviewRenderer()
  const scene = new THREE.Scene()

  // 克隆对象避免影响原对象
  const clone = object.clone()
  scene.add(clone)

  // 计算包围盒
  const box = new THREE.Box3().setFromObject(clone)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)

  if (maxDim === 0) return

  // 相机设置
  const fov = 45
  const aspect = 1
  const distance = maxDim / (2 * Math.tan((fov * Math.PI) / 360))

  const camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, distance * 10)
  camera.position.set(distance, distance * 0.6, distance)
  camera.lookAt(center)

  // 灯光设置
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(distance, distance, distance)
  scene.add(ambient, dirLight)

  // 渲染
  renderer.render(scene, camera)

  // 导出
  const dataUrl = renderer.domElement.toDataURL('image/png')
  assetInfo.preview = dataUrl
  previewCache.set(assetInfo.id, dataUrl)
}
```

---

## 8. 性能优化

### 8.1 预览渲染优化

```javascript
// 使用 requestAnimationFrame 延迟预览生成，避免阻塞主加载流程
function _generatePreview(assetInfo) {
  requestAnimationFrame(() => {
    // 预览生成逻辑
  })
}

// 限制同时生成的预览数量
const MAX_CONCURRENT_PREVIEWS = 2
let activePreviews = 0
const previewQueue = []

function enqueuePreview(assetInfo) {
  previewQueue.push(assetInfo)
  processPreviewQueue()
}

function processPreviewQueue() {
  if (activePreviews >= MAX_CONCURRENT_PREVIEWS || previewQueue.length === 0) {
    return
  }

  activePreviews++
  const assetInfo = previewQueue.shift()

  _generatePreview(assetInfo).finally(() => {
    activePreviews--
    processPreviewQueue()
  })
}
```

### 8.2 加载队列优化

```javascript
// 队列处理时显示进度
async function _processQueue() {
  const total = loadingQueue.value.length

  while (loadingQueue.value.length > 0) {
    isLoading.value = true
    const task = loadingQueue.value.shift()
    const current = total - loadingQueue.value.length

    // 触发进度事件
    assetLoader.emitter.emit('queue-progress', {
      current,
      total,
      task
    })

    // ... 处理任务
  }

  isLoading.value = false
}
```

### 8.3 内存管理

```javascript
// 定期清理未使用的预览缓存
function cleanupPreviewCache(maxAge = 30 * 60 * 1000) {
  const now = Date.now()
  for (const [id, preview] of previewCache) {
    const asset = assetLibrary.value.find(a => a.id === id)
    if (!asset || (now - asset.loadedAt.getTime()) > maxAge) {
      previewCache.delete(id)
    }
  }
}
```

---

## 9. 错误处理

### 9.1 加载错误处理

```javascript
async function loadModel(url, name, size) {
  try {
    const object = await assetLoader.loadModel(url)
    // ... 成功处理
  } catch (error) {
    console.error(`模型加载失败: ${name}`, error)
    assetLoader.emitter.emit('load-error', { url, error })
    throw error
  }
}
```

### 9.2 预览生成错误处理

```javascript
async function _generatePreview(assetInfo) {
  try {
    // ... 预览生成逻辑
  } catch (error) {
    console.warn(`预览生成失败: ${assetInfo.name}`, error)
    assetInfo.preview = null
  }
}
```

---

## 10. 依赖关系

### 10.1 内部依赖

```
useAssetsManager → AssetLoader (core)
useAssetsManager → useObjectManager (composables)
AssetBrowser → useAssetsManager
PrimitiveBrowser → PRIMITIVES.json (constants)
SceneViewer → useAssetsManager (拖拽处理)
SceneViewer → useObjectManager (对象添加)
SceneViewer → useCameraPosState (放置位置)
```

### 10.2 外部依赖

| 依赖 | 用途 |
|------|------|
| three | Three.js 核心库，预览渲染 |
| vue | Vue 3 响应式系统 |
| element-plus | UI 组件（输入框、选择器） |

---

## 11. 测试策略

### 11.1 单元测试

```javascript
describe('useAssetsManager', () => {
  test('缓存命中时跳过加载', async () => {
    const { loadModel, clearCache } = useAssetsManager()

    // 首次加载
    const model1 = await loadModel('/test/model.glb', 'model.glb', 1024)

    // 第二次加载相同文件
    const model2 = await loadModel('/test/model.glb', 'model.glb', 1024)

    expect(model1).toBe(model2)
    clearCache()
  })

  test('缓存键基于文件名和大小', () => {
    const { loadModel, clearCache } = useAssetsManager()

    // 同名不同大小
    loadModel('/test/model.glb', 'model.glb', 1024)
    loadModel('/test/model.glb', 'model.glb', 2048)

    // 应该产生两个缓存条目
    clearCache()
  })

  test('预览图生成成功', async () => {
    const { loadModel, getPreview, clearCache } = useAssetsManager()

    const model = await loadModel('/test/model.glb', 'model.glb', 1024)

    // 等待预览生成
    await new Promise(resolve => setTimeout(resolve, 500))

    const asset = useAssetsManager().assetLibrary.value[0]
    const preview = getPreview(asset.id)

    expect(preview).toMatch(/^data:image\/png;base64,/)
    clearCache()
  })
})
```

### 11.2 组件测试

```javascript
describe('AssetBrowser', () => {
  test('搜索过滤功能', async () => {
    // 设置测试数据
    // 输入搜索关键词
    // 验证过滤结果
  })

  test('拖拽资源设置正确数据', async () => {
    // 模拟拖拽事件
    // 验证 dataTransfer 数据
  })
})
```

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [001-Core 核心引擎模块](../001-core/plan.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
