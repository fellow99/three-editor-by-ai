# 002-Assets 资源管理模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07  
**最后更新**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

资源管理模块负责 3D 模型、纹理、材质等资源的加载、缓存、浏览和管理，提供统一的资源访问接口。

### 1.2 模块职责

- **资源加载**: 支持多种 3D 格式和纹理格式
- **资源缓存**: 避免重复加载，提升性能
- **资源浏览**: 提供资源浏览器 UI 组件
- **拖拽上传**: 支持拖拽上传资源
- **分类管理**: 资源分类和标签管理

### 1.3 核心价值

- 统一的资源加载 API
- 智能缓存机制，减少内存占用
- 直观的资源浏览界面
- 便捷的拖拽上传体验

---

## 2. useAssetsManager 组合式函数

### 2.1 组件概述

**函数名**: `useAssetsManager`  
**文件**: `src/composables/useAssetsManager.js`  
**大小**: 634 行  
**职责**: 资源加载和管理的响应式状态和操作方法

### 2.2 单例模式

**设计目的**: 确保所有组件共享同一个资源库

**实现方式**:
```javascript
let _assetsInstance = null;

export function useAssetsManager() {
  if (_assetsInstance) return _assetsInstance;
  // ... 初始化代码
  _assetsInstance = { ... };
  return _assetsInstance;
}
```

---

### 2.3 核心状态

#### 2.3.1 资源库状态

```javascript
const assetLibrary = reactive({
  models: new Map(),      // 模型资源
  textures: new Map(),    // 纹理资源
  materials: new Map(),   // 材质资源
  favorites: new Set(),   // 收藏资源
  categories: new Map()   // 分类信息
});
```

#### 2.3.2 加载状态

```javascript
const loadState = reactive({
  isLoading: false,       // 是否正在加载
  loadProgress: 0,        // 加载进度 (0-100)
  loadQueue: [],          // 加载队列
  failedLoads: []         // 失败记录
});
```

#### 2.3.3 拖拽状态

```javascript
const dragState = reactive({
  isDragOver: false,      // 是否拖拽中
  draggedFiles: []        // 拖拽的文件
});
```

---

### 2.4 核心功能

#### 2.4.1 模型加载

**加载方法**:
```javascript
async function loadModel(url, options = {}) {
  // 1. 检查缓存
  const cached = assetLibrary.models.get(url);
  if (cached && cached.size === getFileSize(url)) {
    return cached;
  }
  
  // 2. 加载新资源
  loadState.isLoading = true;
  const model = await assetLoader.loadGLTF(url, (progress) => {
    loadState.loadProgress = progress;
  });
  
  // 3. 缓存资源
  assetLibrary.models.set(url, {
    ...model,
    loadedAt: new Date().toISOString(),
    size: getFileSize(url)
  });
  
  loadState.isLoading = false;
  return model;
}
```

**缓存机制**:
- 检查同名资源
- 比较文件大小
- 相同则返回缓存
- 不同则重新加载

---

#### 2.4.2 纹理加载

```javascript
async function loadTexture(url) {
  // 类似模型加载，包含缓存检查
  const texture = await assetLoader.loadTexture(url);
  assetLibrary.textures.set(url, texture);
  return texture;
}
```

---

#### 2.4.3 资源过滤与搜索

**搜索功能**:
```javascript
const searchQuery = ref('');

const filteredModels = computed(() => {
  let models = Array.from(assetLibrary.models.values());
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    models = models.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.filename.toLowerCase().includes(query) ||
      (model.tags && model.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  return models;
});
```

**分类过滤**:
```javascript
const selectedCategory = ref('all');

// 只选择特定分类
if (selectedCategory.value !== 'all') {
  models = models.filter(model => 
    model.category === selectedCategory.value
  );
}
```

**排序功能**:
```javascript
const sortBy = ref('name'); // 'name', 'date', 'size', 'type'
const sortOrder = ref('asc'); // 'asc', 'desc'

models.sort((a, b) => {
  let aValue, bValue;
  switch (sortBy.value) {
    case 'name':
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
      break;
    case 'date':
      aValue = new Date(a.loadedAt);
      bValue = new Date(b.loadedAt);
      break;
    // ...
  }
  return sortOrder.value === 'asc' 
    ? aValue.localeCompare(bValue)
    : bValue - aValue;
});
```

---

#### 2.4.4 拖拽上传

**拖拽处理**:
```javascript
async function handleDragOver(event) {
  event.preventDefault();
  dragState.isDragOver = true;
}

async function handleDrop(event) {
  event.preventDefault();
  dragState.isDragOver = false;
  
  const files = Array.from(event.dataTransfer.files);
  await processFiles(files);
}
```

**文件处理**:
```javascript
async function processFiles(files) {
  for (const file of files) {
    if (isSupported3DFormat(file.name)) {
      await loadModelFromFile(file);
    } else if (isTextureFormat(file.name)) {
      await loadTextureFromFile(file);
    }
  }
}
```

---

#### 2.4.5 资源管理

**添加资源到库**:
```javascript
function addToLibrary(resource) {
  if (resource.type === 'model') {
    assetLibrary.models.set(resource.url, resource);
  } else if (resource.type === 'texture') {
    assetLibrary.textures.set(resource.url, resource);
  }
}
```

**移除资源**:
```javascript
function removeFromLibrary(url, type) {
  if (type === 'model') {
    assetLibrary.models.delete(url);
  } else if (type === 'texture') {
    assetLibrary.textures.delete(url);
  }
}
```

**收藏资源**:
```javascript
function toggleFavorite(url) {
  if (assetLibrary.favorites.has(url)) {
    assetLibrary.favorites.delete(url);
  } else {
    assetLibrary.favorites.add(url);
  }
}
```

**分类管理**:
```javascript
function addCategory(name, resources) {
  assetLibrary.categories.set(name, resources);
}

function getResourcesByCategory(name) {
  return assetLibrary.categories.get(name) || [];
}
```

---

### 2.5 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `loadModel(url, options)` | url: string, options: Object | Promise<Model> | 加载模型 |
| `loadTexture(url)` | url: string | Promise<Texture> | 加载纹理 |
| `loadModelFromFile(file)` | file: File | Promise<Model> | 从文件加载模型 |
| `loadTextureFromFile(file)` | file: File | Promise<Texture> | 从文件加载纹理 |
| `clearCache()` | - | void | 清空缓存 |
| `getAssetByUrl(url)` | url: string | Asset | 根据 URL 获取资源 |
| `getAllModels()` | - | Model[] | 获取所有模型 |
| `getAllTextures()` | - | Texture[] | 获取所有纹理 |
| `toggleFavorite(url)` | url: string | void | 切换收藏状态 |
| `addToLibrary(resource)` | resource: Asset | void | 添加到资源库 |
| `removeFromLibrary(url, type)` | url: string, type: string | void | 移除资源 |
| `handleDragOver(event)` | event: DragEvent | void | 处理拖拽进入 |
| `handleDrop(event)` | event: DragEvent | void | 处理拖拽放下 |

---

### 2.6 计算属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `isLoading` | Computed<boolean> | 是否正在加载 |
| `loadingProgress` | Computed<number> | 加载进度 |
| `filteredModels` | Computed<Model[]> | 过滤后的模型列表 |
| `filteredTextures` | Computed<Texture[]> | 过滤后的纹理列表 |
| `favoriteModels` | Computed<Model[]> | 收藏的模型 |
| `recentModels` | Computed<Model[]> | 最近加载的模型 |

---

### 2.7 文件格式支持

#### 3D 模型格式

| 格式 | 扩展名 | 支持度 | 备注 |
|------|--------|--------|------|
| GLTF | .gltf | ✅ 完全支持 | 推荐格式 |
| GLB | .glb | ✅ 完全支持 | 二进制 GLTF |
| OBJ | .obj | ✅ 支持 | 需配合 MTL |
| FBX | .fbx | ⚠️ 部分支持 | 功能有限 |
| 3D Tiles | .tileset | ✅ 支持 | 基于 3d-tiles-renderer |

#### 纹理格式

| 格式 | 扩展名 | 支持度 | 备注 |
|------|--------|--------|------|
| JPEG | .jpg, .jpeg | ✅ 完全支持 | 常用格式 |
| PNG | .png | ✅ 完全支持 | 支持透明 |
| KTX2 | .ktx2 | ✅ 支持 | 压缩纹理 |
| HDR | .hdr | ⚠️ 未来支持 | 环境贴图 |

---

### 2.8 性能优化

#### 缓存策略

**缓存检查流程**:
```
1. 请求资源 URL
   ↓
2. 检查 assetLibrary 是否存在
   ↓ 是
3. 比较文件大小是否一致
   ↓ 是
4. 返回缓存资源
   ↓ 否
5. 重新加载并更新缓存
```

**缓存清理**:
```javascript
function clearCache() {
  assetLibrary.models.clear();
  assetLibrary.textures.clear();
  assetLibrary.materials.clear();
}
```

#### 内存管理

**资源释放**:
```javascript
function disposeAsset(asset) {
  if (asset.geometry) {
    asset.geometry.dispose();
  }
  if (asset.material) {
    if (Array.isArray(asset.material)) {
      asset.material.forEach(m => m.dispose());
    } else {
      asset.material.dispose();
    }
  }
  if (asset.texture) {
    asset.texture.dispose();
  }
}
```

---

## 3. AssetBrowser 组件

### 3.1 组件概述

**组件名**: `AssetBrowser`  
**文件**: `src/components/editor/AssetBrowser.vue`  
**职责**: 资源浏览和管理 UI

### 3.2 功能特性

- 资源缩略图预览
- 搜索和过滤
- 分类浏览
- 拖拽上传
- 收藏管理
- 最近使用

### 3.3 UI 布局

```
┌─────────────────────────────────────┐
│  🔍 搜索框          [分类下拉] [排序]│
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 📦  │ │ 📦  │ │ 📦  │ │ 📦  │   │
│ │模型 │ │模型 │ │模型 │ │模型 │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 📦  │ │ 📦  │ │ 📦  │ │ 📦  │   │
│ │模型 │ │模型 │ │模型 │ │模型 │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│ 拖拽文件到此处上传                    │
└─────────────────────────────────────┘
```

---

## 4. 依赖关系

### 4.1 内部依赖

```
useAssetsManager → AssetLoader
useAssetsManager → fileUtils
AssetBrowser → useAssetsManager
```

### 4.2 外部依赖

| 依赖 | 用途 |
|------|------|
| three | 3D 资源类型 |
| uuid | 资源 ID 生成 |

---

## 5. 使用示例

### 5.1 基本使用

```javascript
import { useAssetsManager } from './composables/useAssetsManager.js';

const { 
  loadModel, 
  loadTexture, 
  filteredModels,
  isLoading,
  loadingProgress 
} = useAssetsManager();

// 加载模型
const model = await loadModel('/vfs/models/Horse.glb');

// 加载纹理
const texture = await loadTexture('/vfs/textures/brick.jpg');

// 访问过滤后的模型列表
console.log(filteredModels.value);
```

### 5.2 拖拽上传

```vue
<template>
  <div 
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="{ 'drag-over': dragState.isDragOver }"
  >
    <AssetBrowser />
  </div>
</template>

<script setup>
import { useAssetsManager } from './composables/useAssetsManager.js';

const { handleDragOver, handleDrop, dragState } = useAssetsManager();
</script>
```

### 5.3 搜索和过滤

```javascript
const { 
  searchQuery, 
  selectedCategory, 
  sortBy, 
  sortOrder,
  filteredModels 
} = useAssetsManager();

// 设置搜索关键词
searchQuery.value = 'horse';

// 选择分类
selectedCategory.value = 'animals';

// 设置排序
sortBy.value = 'date';
sortOrder.value = 'desc';
```

---

## 6. 测试要点

### 6.1 单元测试

- [ ] 资源加载功能
- [ ] 缓存机制
- [ ] 搜索过滤
- [ ] 排序功能
- [ ] 拖拽处理
- [ ] 收藏管理

### 6.2 集成测试

- [ ] 完整上传流程
- [ ] 资源浏览 UI
- [ ] 缓存命中场景

### 6.3 性能测试

- [ ] 大量资源加载
- [ ] 缓存命中率
- [ ] 内存使用稳定性

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [核心引擎模块](../001-core/spec.md)
- [API 清单](../API.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始模块规格文档 |
