# 002-Assets 资源管理模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

资源管理模块负责所有 3D 资源和纹理的加载、缓存、浏览和管理。

### 1.2 技术约束

- 必须支持 GLTF/GLB/OBJ 格式
- 必须实现资源缓存机制
- 必须支持拖拽上传
- 必须使用单例模式

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 单例模式 | 模块级单例 | 确保资源库唯一 |
| 缓存策略 | 名称 + 大小校验 | 简单有效 |
| 文件格式 | MIME 类型判断 | 准确可靠 |

---

## 2. 单例实现

### 2.1 单例模式

```javascript
let _assetsInstance = null;

export function useAssetsManager() {
  if (_assetsInstance) {
    return _assetsInstance;
  }
  
  // 初始化
  const assetLoader = new AssetLoader();
  
  // 响应式状态
  const assetLibrary = reactive({
    models: new Map(),
    textures: new Map(),
    materials: new Map(),
    favorites: new Set(),
    categories: new Map()
  });
  
  // 实例对象
  _assetsInstance = {
    assetLibrary,
    loadModel,
    loadTexture,
    clearCache,
    // ... 其他方法
  };
  
  return _assetsInstance;
}
```

---

## 3. 缓存机制

### 3.1 缓存检查流程

```javascript
async function loadModel(url, options = {}) {
  // 1. 生成缓存键
  const cacheKey = generateCacheKey(url);
  
  // 2. 检查缓存
  const cached = assetLibrary.models.get(cacheKey);
  if (cached) {
    const currentSize = await getFileSize(url);
    if (cached.size === currentSize) {
      console.log('缓存命中:', url);
      return cached.model;
    }
  }
  
  // 3. 加载新资源
  loadState.isLoading = true;
  loadState.loadProgress = 0;
  
  try {
    const model = await assetLoader.loadGLTF(url, (progress) => {
      loadState.loadProgress = progress;
    });
    
    // 4. 更新缓存
    const size = await getFileSize(url);
    assetLibrary.models.set(cacheKey, {
      model,
      url,
      filename: getFileName(url),
      size,
      loadedAt: new Date().toISOString(),
      type: getModelType(url)
    });
    
    return model;
  } finally {
    loadState.isLoading = false;
  }
}

function generateCacheKey(url) {
  // 使用 URL 作为缓存键
  // 可以添加版本号参数：url + '?v=' + version
  return url;
}

async function getFileSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return parseInt(response.headers.get('content-length') || '0');
  } catch {
    return 0;
  }
}
```

### 3.2 缓存清理

```javascript
function clearCache() {
  // 清理模型缓存
  assetLibrary.models.forEach((item) => {
    // 清理几何体
    if (item.model.geometry) {
      item.model.geometry.dispose();
    }
    // 清理材质
    if (item.model.material) {
      if (Array.isArray(item.model.material)) {
        item.model.material.forEach(m => m.dispose());
      } else {
        item.model.material.dispose();
      }
    }
  });
  
  // 清空 Map
  assetLibrary.models.clear();
  assetLibrary.textures.clear();
  assetLibrary.materials.clear();
}

// 定期清理（可选）
function cleanupOldCache(maxAge = 3600000) {
  const now = Date.now();
  assetLibrary.models.forEach((item, key) => {
    const itemTime = new Date(item.loadedAt).getTime();
    if (now - itemTime > maxAge) {
      assetLibrary.models.delete(key);
    }
  });
}
```

---

## 4. 拖拽上传实现

### 4.1 拖拽事件处理

```javascript
function setupDragAndDrop(container) {
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragState.isDragOver = true;
  });
  
  container.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragState.isDragOver = false;
  });
  
  container.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragState.isDragOver = false;
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  });
}

async function processFiles(files) {
  const supportedFiles = files.filter(file => 
    isSupported3DFormat(file.name) || isTextureFormat(file.name)
  );
  
  for (const file of supportedFiles) {
    try {
      if (isSupported3DFormat(file.name)) {
        await loadModelFromFile(file);
      } else if (isTextureFormat(file.name)) {
        await loadTextureFromFile(file);
      }
    } catch (error) {
      console.error('文件加载失败:', file.name, error);
      loadState.failedLoads.push({
        filename: file.name,
        error: error.message
      });
    }
  }
}
```

### 4.2 文件加载

```javascript
async function loadModelFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const ext = getFileExtension(file.name).toLowerCase();
        
        let model;
        if (ext === 'glb' || ext === 'gltf') {
          model = await assetLoader.loadGLTFFromArrayBuffer(arrayBuffer);
        } else if (ext === 'obj') {
          model = await assetLoader.loadOBJFromArrayBuffer(arrayBuffer);
        }
        
        // 添加到资源库
        const url = URL.createObjectURL(file);
        assetLibrary.models.set(url, {
          model,
          url,
          filename: file.name,
          size: file.size,
          loadedAt: new Date().toISOString(),
          type: ext
        });
        
        resolve(model);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
```

---

## 5. 搜索与过滤

### 5.1 搜索实现

```javascript
const filteredModels = computed(() => {
  let models = Array.from(assetLibrary.models.values());
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    models = models.filter(model => {
      // 名称匹配
      if (model.name.toLowerCase().includes(query)) return true;
      if (model.filename.toLowerCase().includes(query)) return true;
      
      // 标签匹配
      if (model.tags && model.tags.some(tag => 
        tag.toLowerCase().includes(query)
      )) return true;
      
      // 类型匹配
      if (model.type.toLowerCase().includes(query)) return true;
      
      return false;
    });
  }
  
  // 分类过滤
  if (selectedCategory.value !== 'all') {
    models = models.filter(model => 
      model.category === selectedCategory.value
    );
  }
  
  // 排序
  models.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.loadedAt).getTime();
        bValue = new Date(b.loadedAt).getTime();
        break;
      case 'size':
        aValue = a.size || 0;
        bValue = b.size || 0;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        return 0;
    }
    
    return sortOrder.value === 'asc'
      ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
      : (aValue > bValue ? -1 : aValue < bValue ? 1 : 0);
  });
  
  return models;
});
```

---

## 6. 资源库管理

### 6.1 添加资源

```javascript
function addToLibrary(resource) {
  const { type, url } = resource;
  
  if (type === 'model') {
    assetLibrary.models.set(url, {
      ...resource,
      loadedAt: new Date().toISOString()
    });
  } else if (type === 'texture') {
    assetLibrary.textures.set(url, {
      ...resource,
      loadedAt: new Date().toISOString()
    });
  } else if (type === 'material') {
    assetLibrary.materials.set(url, resource);
  }
}
```

### 6.2 收藏管理

```javascript
function toggleFavorite(url) {
  if (assetLibrary.favorites.has(url)) {
    assetLibrary.favorites.delete(url);
  } else {
    assetLibrary.favorites.add(url);
  }
}

const favoriteModels = computed(() => {
  const models = [];
  assetLibrary.favorites.forEach(url => {
    const model = assetLibrary.models.get(url);
    if (model) models.push(model);
  });
  return models;
});
```

### 6.3 分类管理

```javascript
function addCategory(name, resources) {
  assetLibrary.categories.set(name, {
    name,
    resources,
    createdAt: new Date().toISOString()
  });
}

function getResourcesByCategory(name) {
  const category = assetLibrary.categories.get(name);
  if (!category) return [];
  
  return category.resources.map(url => 
    assetLibrary.models.get(url) || assetLibrary.textures.get(url)
  ).filter(Boolean);
}
```

---

## 7. 性能优化

### 7.1 懒加载

```javascript
// 缩略图懒加载
function loadThumbnail(model, callback) {
  if (model.thumbnailLoaded) return;
  
  const img = new Image();
  img.onload = () => {
    model.thumbnail = img;
    model.thumbnailLoaded = true;
    callback?.(img);
  };
  img.src = model.thumbnailUrl;
}

// 列表滚动懒加载
function setupLazyLoading(container, loadMore) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadMore();
      }
    });
  }, {
    root: container,
    rootMargin: '100px',
    threshold: 0
  });
  
  const sentinel = document.createElement('div');
  container.appendChild(sentinel);
  observer.observe(sentinel);
}
```

### 7.2 内存管理

```javascript
// 资源释放
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
  
  if (asset.url && asset.url.startsWith('blob:')) {
    URL.revokeObjectURL(asset.url);
  }
}

// 低内存模式
function setLowMemoryMode(enabled) {
  if (enabled) {
    // 清理未使用的资源
    const now = Date.now();
    assetLibrary.models.forEach((item, key) => {
      const itemTime = new Date(item.loadedAt).getTime();
      if (now - itemTime > 300000) { // 5 分钟
        disposeAsset(item.model);
        assetLibrary.models.delete(key);
      }
    });
  }
}
```

---

## 8. 错误处理

### 8.1 加载错误

```javascript
async function loadModel(url) {
  try {
    // ... 加载逻辑
  } catch (error) {
    console.error('模型加载失败:', url, error);
    
    // 记录错误
    loadState.failedLoads.push({
      url,
      filename: getFileName(url),
      error: error.message,
      timestamp: Date.now()
    });
    
    // 触发事件
    emitter.emit('load-error', {
      url,
      error
    });
    
    throw error;
  }
}
```

### 8.2 格式验证

```javascript
function isSupported3DFormat(filename) {
  const ext = getFileExtension(filename).toLowerCase();
  return ['glb', 'gltf', 'obj', 'fbx'].includes(ext);
}

function isTextureFormat(filename) {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'ktx2', 'hdr'].includes(ext);
}
```

---

## 9. 测试策略

### 9.1 单元测试

```javascript
describe('useAssetsManager', () => {
  test('单例模式', () => {
    const instance1 = useAssetsManager();
    const instance2 = useAssetsManager();
    expect(instance1).toBe(instance2);
  });
  
  test('缓存机制', async () => {
    const { loadModel } = useAssetsManager();
    
    // 第一次加载
    const model1 = await loadModel('/test.glb');
    
    // 第二次加载（应命中缓存）
    const model2 = await loadModel('/test.glb');
    
    expect(model1).toBe(model2);
  });
});
```

---

## 相关文档

- [模块规格](./spec.md)
- [核心引擎模块](../001-core/plan.md)

---

**版本**: 1.0 | **日期**: 2026-04-07
