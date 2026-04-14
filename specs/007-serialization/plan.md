# 007-Serialization 场景序列化模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

场景序列化模块是 Three Editor by AI 的数据持久化层，基于 ThreeViewer 和 ObjectManager 实现场景与对象级别的序列化能力。

### 1.2 技术约束

- 必须使用 Three.js r182+ 的对象克隆和材质 API
- 必须支持 Vue 3 响应式状态（reactive）
- 必须使用 mitt 事件机制进行模块间通信
- 必须与 VFS 服务集成实现模型文件加载
- 必须与 AssetManager 集成实现模型缓存复用

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 序列化格式 | JSON | 通用、可读、易于调试和版本控制 |
| ID 生成 | uuid v7 | 时间有序、冲突概率极低 |
| 对象克隆 | THREE.Object3D.clone(true) | Three.js 原生深克隆，保留层级结构 |
| 事件通信 | mitt | 轻量级、与现有架构一致 |
| 材质修复 | 运行时类型检查 + 默认材质兜底 | 避免克隆后材质类型不一致 |

---

## 2. ThreeViewer 序列化技术设计

### 2.1 exportScene() 实现

**文件**: `src/core/ThreeViewer.js`  
**行号**: 734-767

```javascript
exportScene() {
  const sceneData = {
    objects: [],
    lights: [],
    camera: {
      position: this.camera.position.toArray(),
      rotation: this.camera.rotation.toArray(),
      fov: this.camera.fov,
      near: this.camera.near,
      far: this.camera.far
    },
    background: this.scene.background instanceof THREE.Color ? 
      this.scene.background.getHex() : null
  };
  this.scene.children.forEach(child => {
    if (child instanceof THREE.Light) {
      sceneData.lights.push({
        type: child.type,
        position: child.position.toArray(),
        color: child.color.getHex(),
        intensity: child.intensity
      });
    } else if (!(child instanceof THREE.Camera)) {
      sceneData.objects.push({
        name: child.name,
        type: child.type,
        position: child.position.toArray(),
        rotation: child.rotation.toArray(),
        scale: child.scale.toArray()
      });
    }
  });
  return sceneData;
}
```

**技术要点**:

1. 使用 `THREE.Vector3.toArray()` 将向量转换为数组格式
2. 使用 `instanceof THREE.Light` 区分灯光对象
3. 使用 `instanceof THREE.Camera` 排除相机对象
4. 背景颜色使用 `THREE.Color.getHex()` 转换为数值
5. 不递归导出子对象（当前实现仅导出顶层对象）

### 2.2 loadScene() 实现

**文件**: `src/core/ThreeViewer.js`  
**行号**: 191-300

```javascript
async loadScene(json) {
  let { objectManager, assetsManager } = this;
  await this.clearScene();

  // 1. 恢复相机状态
  if (json.camera && this.camera) {
    if (json.camera.position && typeof json.camera.position.x === 'number') {
      this.camera.position.set(
        json.camera.position.x,
        json.camera.position.y,
        json.camera.position.z
      );
    }
    if (json.camera.target && this.controls && this.controls.target) {
      this.controls.target.set(
        json.camera.target.x,
        json.camera.target.y,
        json.camera.target.z
      );
      this.controls.update && this.controls.update();
    }
    if (typeof json.camera.fov === 'number') this.camera.fov = json.camera.fov;
    if (typeof json.camera.near === 'number') this.camera.near = json.camera.near;
    if (typeof json.camera.far === 'number') this.camera.far = json.camera.far;
    this.camera.updateProjectionMatrix();
  }

  // 2. 恢复背景颜色
  if (json.background && this.scene) {
    if (typeof json.background === 'number') {
      this.scene.background = new THREE.Color(json.background);
    }
  }

  // 3. 重建灯光
  if (Array.isArray(json.lights)) {
    json.lights.forEach(lightData => {
      const lightObj = objectManager.createPrimitive?.(lightData.type, {
        color: lightData.color,
        intensity: lightData.intensity,
        position: lightData.position
      });
      if (lightObj && lightData.userData) {
        lightObj.userData = { ...lightData.userData };
      }
      if (lightObj) {
        this.addObject(lightObj);
      }
    });
  }

  // 4. 重建对象
  if (Array.isArray(json.objects)) {
    for (const objData of json.objects) {
      if (objData.userData && objData.userData.fileInfo) {
        // 模型文件加载
        try {
          const fileInfo = objData.userData.fileInfo;
          const cached = assetsManager.getCachedModel(fileInfo.name);
          let modelInfo;
          if (cached) {
            modelInfo = cached;
          } else {
            if(!fileInfo.url) {
              const vfs = vfsService.getVfs(fileInfo.drive);
              let url = vfs.url(fileInfo.path + '/' + fileInfo.name);
              fileInfo.url = url;
            }
            modelInfo = await assetsManager.loadModel(fileInfo);
          }
          const addOptions = {
            name: objData.name,
            position: objData.position,
            rotation: objData.rotation,
            scale: objData.scale,
            userData: objData.userData,
            material: objData.material
          };
          let model = await assetsManager.getModelClone(modelInfo.id, addOptions);
          this.scene.add(model);
        } catch (e) {
          console.error('加载模型文件失败', e);
        }
      } else if (objData.type === 'primitive' && objData.primitiveType) {
        // 原始几何体加载
        const obj = objectManager.createPrimitive?.(objData.primitiveType, {
          name: objData.name,
          position: objData.position,
          rotation: objData.rotation,
          scale: objData.scale,
          userData: objData.userData,
          material: objData.material
        });
        if (obj) {
          this.addObject(obj);
        }
      } else {
        // 通用对象加载
        const obj = objectManager.createPrimitive?.(objData.type, {
          name: objData.name,
          position: objData.position,
          rotation: objData.rotation,
          scale: objData.scale,
          userData: objData.userData,
          material: objData.material
        });
        if (obj) {
          this.addObject(obj);
        }
      }
    }
  }
}
```

**技术要点**:

1. 使用 `await this.clearScene()` 异步清空场景
2. 相机状态恢复后调用 `updateProjectionMatrix()` 更新投影矩阵
3. 灯光通过 `objectManager.createPrimitive()` 创建
4. 模型文件优先使用缓存，缓存未命中时通过 VFS 加载
5. userData 完整传递到创建参数中
6. 材质配置通过 `material` 参数传递

### 2.3 clearScene() 实现

**文件**: `src/core/ThreeViewer.js`  
**行号**: 695-717

```javascript
clearScene() {
  const { objectManager } = this;
  
  const reservedNames = ['grid_helper', 'axes_helper'];
  for (let i = this.scene.children.length - 1; i >= 0; i--) {
    const child = this.scene.children[i];
    if (!reservedNames.includes(child.name)) {
      this.scene.remove(child);
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  }
  this.setupGrid();
  objectManager.clear();
}
```

**技术要点**:

1. 倒序遍历避免删除时索引变化问题
2. 保留 `grid_helper` 和 `axes_helper` 辅助对象
3. 正确释放几何体和材质资源防止内存泄漏
4. 清空后重新设置网格和坐标轴辅助线
5. 调用 `objectManager.clear()` 清空对象管理器

---

## 3. ObjectManager 序列化技术设计

### 3.1 exportObjects() 实现

**文件**: `src/core/ObjectManager.js`  
**行号**: 693-749

```javascript
exportObjects(objectIds = []) {
  let objects = objectIds.length > 0 
    ? objectIds.map(id => this.getObject(id)).filter(Boolean)
    : this.getAllObjects();
  
  // 过滤掉灯光（通过对象属性判断）
  objects = objects.filter(obj => !obj.isLight);
  return {
    objects: objects.map(obj => {
      // 导出userData时，仅保留可序列化数据
      const { animationIndex, ...userDataExport } = obj.userData || {};
      // 导出时，type=primitive时增加primitiveType字段
      let type = obj.userData.type;
      let primitiveType = undefined;
      if (!type && obj.isMesh) {
        type = 'primitive';
        primitiveType = obj.geometry && obj.geometry.type 
          ? obj.geometry.type.replace('Geometry', '').toLowerCase() 
          : undefined;
      }
      if (!type && obj.isLight) {
        type = 'light';
        primitiveType = obj.type;
      }
      // 保留animationIndex字段
      if (typeof obj.userData.animationIndex !== 'undefined') {
        userDataExport.animationIndex = obj.userData.animationIndex;
      }
      // 导出材质配置
      let materialConfig = undefined;
      if (obj.material) {
        const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        materialConfig = {
          type: mat.type,
          color: mat.color && mat.color.isColor 
            ? '#' + mat.color.getHexString() 
            : undefined,
          roughness: mat.roughness,
          metalness: mat.metalness,
          opacity: mat.opacity,
          transparent: mat.transparent,
          map: mat.map && mat.map.name ? mat.map.name : undefined,
        };
      }
      return {
        id: obj.userData.id,
        name: obj.name,
        type,
        primitiveType,
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
        userData: userDataExport,
        material: materialConfig
      };
    }),
    timestamp: new Date().toISOString()
  };
}
```

**技术要点**:

1. 使用 `obj.isLight` 属性过滤灯光对象
2. 使用解构赋值分离 `animationIndex`
3. 几何体类型通过 `geometry.type.replace('Geometry', '').toLowerCase()` 转换
4. 材质颜色使用 `getHexString()` 转换为 `#rrggbb` 格式
5. 数组材质仅导出第一个元素
6. 时间戳使用 `toISOString()` 生成 ISO 8601 格式

### 3.2 deepCloneObject() 实现

**文件**: `src/core/ObjectManager.js`  
**行号**: 453-488

```javascript
deepCloneObject(source) {
  const clone = source.clone(true);
  clone.traverse((child, idx) => {
    if (child.isMesh) {
      const fixMaterial = (mat) => {
        let fixed = mat && typeof mat.clone === 'function'
          ? mat.clone()
          : this.defaultMaterial.clone();
        if (!(fixed instanceof THREE.MeshStandardMaterial)) {
          fixed = new THREE.MeshStandardMaterial({ color: 0x888888 });
        }
        if (!fixed.color || !(fixed.color instanceof THREE.Color)) {
          fixed.color = new THREE.Color(0x888888);
        }
        return fixed;
      };
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material = fixMaterial(child.material[0]);
        } else {
          child.material = fixMaterial(child.material);
        }
      }
      if (!child.material || typeof child.material !== 'object' || !('color' in child.material)) {
        child.material = this.defaultMaterial.clone();
      }
    }
  });
  
  return clone;
}
```

**技术要点**:

1. 使用 `source.clone(true)` 进行深克隆
2. 遍历所有子 Mesh 对象修复材质
3. `fixMaterial` 内部函数确保材质类型和 color 字段正确
4. 数组材质转为单一材质（避免属性面板访问数组报错）
5. 兜底逻辑：材质无效时强制赋默认材质

### 3.3 copyObjects() 和 pasteObjects() 实现

**文件**: `src/core/ObjectManager.js`  
**行号**: 494-529

```javascript
copyObjects(objectIds) {
  const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
  const objects = ids.map(id => this.state.objects.get(id)).filter(Boolean);
  this.state.clipboard = objects.map(obj => this.deepCloneObject(obj));
}

pasteObjects(position = new THREE.Vector3()) {
  if (!this.state.clipboard || this.state.clipboard.length === 0) {
    return [];
  }

  const pastedObjects = [];

  this.state.clipboard.forEach((clipboardObj, index) => {
    const clone = this.deepCloneObject(clipboardObj);
    clone.userData.id = UUID();
    clone.name = `${clone.name}_copy`;
    clone.position.copy(position);
    this.addObject(clone);
    pastedObjects.push(clone);
  });

  return pastedObjects;
}
```

**技术要点**:

1. 复制时存储深克隆对象到剪贴板
2. 粘贴时再次深克隆（避免修改剪贴板数据）
3. 使用 `UUID()` 重新生成唯一 ID
4. 名称添加 `_copy` 后缀区分副本
5. 位置设置为传入的 Vector3

---

## 4. 动画状态恢复技术实现

### 4.1 updateAllMixers() 动画驱动

**文件**: `src/core/ThreeViewer.js`  
**行号**: 613-639

```javascript
updateAllMixers(delta) {
  this.mixers = [];
  this.scene.traverse(obj => {
    if (obj.animations && Array.isArray(obj.animations) && obj.animations.length > 0) {
      if (!obj._mixer) {
        obj._mixer = new THREE.AnimationMixer(obj);
      }
      this.mixers.push(obj._mixer);
      const idx = typeof obj.userData.animationIndex === 'number' 
        ? obj.userData.animationIndex 
        : -1;
      if (idx >= 0 && obj.animations[idx]) {
        if (!obj._activeAction || obj._activeAction._clip !== obj.animations[idx]) {
          if (obj._activeAction) {
            obj._activeAction.stop();
          }
          obj._activeAction = obj._mixer.clipAction(obj.animations[idx]);
          obj._activeAction.reset().play();
        }
      } else {
        if (obj._activeAction) {
          obj._activeAction.stop();
          obj._activeAction = null;
        }
      }
    }
  });
  this.mixers.forEach(mixer => mixer.update(delta));
}
```

**技术要点**:

1. 每帧遍历场景查找带 `animations` 数组的对象
2. 懒创建 `AnimationMixer` 并挂载到 `obj._mixer`
3. 读取 `userData.animationIndex` 确定播放哪个动画
4. 动画切换时先停止旧动作，再创建新动作
5. 使用 `reset().play()` 确保动画从头播放
6. 所有 mixer 统一调用 `update(delta)` 驱动动画

### 4.2 运行时对象隔离设计

**关键设计决策**: 运行时对象直接挂载到主对象上，不放入 userData

```
obj._mixer        → AnimationMixer 实例（运行时）
obj._activeAction → AnimationAction 实例（运行时）
obj._clips        → AnimationClip 数组（运行时）

obj.userData.animationIndex → number（可序列化）
```

**优势**:
- 序列化时 userData 不会被运行时对象污染
- 导出 JSON 体积更小
- 导入后自动重建运行时对象
- 代码更清晰，职责分离

---

## 5. 材质管理技术实现

### 5.1 createMaterial() 工厂方法

**文件**: `src/core/ObjectManager.js`  
**行号**: 616-636

```javascript
createMaterial(options = {}) {
  const materialType = options.type || 'MeshStandardMaterial';
  
  switch (materialType) {
    case 'MeshBasicMaterial':
      return new THREE.MeshBasicMaterial(options);
    case 'MeshLambertMaterial':
      return new THREE.MeshLambertMaterial(options);
    case 'MeshPhongMaterial':
      return new THREE.MeshPhongMaterial(options);
    case 'MeshNormalMaterial':
      const { flatShading } = options;
      return new THREE.MeshNormalMaterial({ flatShading });
    case 'MeshPhysicalMaterial':
      return new THREE.MeshPhysicalMaterial(options);
    case 'MeshStandardMaterial':
    default:
      return new THREE.MeshStandardMaterial(options);
  }
}
```

**技术要点**:

1. 默认材质类型为 `MeshStandardMaterial`
2. `MeshNormalMaterial` 仅支持部分参数，需过滤无效参数
3. 其他材质类型直接传递 options 对象

### 5.2 setObjectMaterial() 材质更新

**文件**: `src/core/ObjectManager.js`  
**行号**: 574-609

```javascript
setObjectMaterial(objectId, material) {
  const object = this.getObject(objectId);
  if (!object || !object.material) return;

  if (material instanceof THREE.Material) {
    object.material = material;
  } else if (material.type) {
    object.material = this.createMaterial(material);
  } else {
    if (material.color) {
      if (typeof material.color === 'string') {
        object.material.color = new THREE.Color(material.color);
      } else if (typeof material.color === 'number') {
        object.material.color = new THREE.Color(material.color);
      } else if (material.color instanceof THREE.Color) {
        object.material.color.copy(material.color);
      }
    }
    Object.entries(material).forEach(([key, value]) => {
      if (key !== 'color') {
        if (['map', 'normalMap', 'aoMap', 'displacementMap', 
             'metalnessMap', 'roughnessMap', 'envMap', 
             'gradientMap', 'matcap'].includes(key)) {
          object.material[key] = value;
          object.material.needsUpdate = true;
        } else {
          object.material[key] = value;
        }
      }
    });
    object.material.needsUpdate = true;
  }
}
```

**技术要点**:

1. 支持三种输入：材质实例、材质参数对象、材质属性更新对象
2. 颜色值支持字符串、数值、THREE.Color 三种格式
3. 纹理贴图属性赋值后设置 `needsUpdate = true`
4. 纹理属性列表：map、normalMap、aoMap 等

---

## 6. VFS 集成技术实现

### 6.1 模型加载 URL 解析

**文件**: `src/core/ThreeViewer.js`  
**行号**: 251-258

```javascript
if(!fileInfo.url) {
  const vfs = vfsService.getVfs(fileInfo.drive);
  let url = vfs.url(fileInfo.path + '/' + fileInfo.name);
  fileInfo.url = url;
}
```

**技术要点**:

1. 通过 `vfsService.getVfs(drive)` 获取对应驱动
2. 使用 `vfs.url(path)` 方法生成可访问 URL
3. URL 缓存到 `fileInfo.url` 避免重复解析

### 6.2 缓存复用策略

**文件**: `src/core/ThreeViewer.js`  
**行号**: 247-250

```javascript
const cached = assetsManager.getCachedModel(fileInfo.name);
let modelInfo;
if (cached) {
  modelInfo = cached;
} else {
  modelInfo = await assetsManager.loadModel(fileInfo);
}
```

**技术要点**:

1. 优先检查缓存（按文件名匹配）
2. 缓存命中直接使用，避免重复加载
3. 缓存未命中时调用 `loadModel()` 加载

---

## 7. 事件系统技术实现

### 7.1 mitt 事件总线集成

**文件**: `src/core/ThreeViewer.js`  
**行号**: 98

```javascript
this.emitter = mitt();
```

**事件注册**:

```javascript
on(event, handler) {
  this.emitter.on(event, handler);
}

off(event, handler) {
  this.emitter.off(event, handler);
}

emit(event, payload) {
  this.emitter.emit(event, payload);
}
```

### 7.2 序列化相关事件

**触发事件**:

| 事件 | 代码位置 | 触发条件 |
|------|----------|----------|
| `add-object` | ThreeViewer.js:681 | 对象添加到场景后 |
| `before-add-object` | ThreeViewer.js:672 | 对象添加到场景前 |
| `before-render` | ThreeViewer.js:594 | 每帧渲染前 |

**监听事件**:

| 事件 | 监听位置 | 响应动作 |
|------|----------|----------|
| `object-transform-updated` | 渲染循环 | 标记需要重新渲染 |

---

## 8. 性能优化

### 8.1 缓存策略

**模型缓存**:
- AssetManager 内部维护 `assetLibrary` Map
- 按文件名和大小作为缓存 key
- 缓存命中时直接返回，避免网络请求和解析

**材质缓存**:

```javascript
this.materialCache = new Map();
```

### 8.2 资源释放

**clearScene() 资源清理**:

```javascript
if (child.geometry) {
  child.geometry.dispose();
}
if (child.material) {
  if (Array.isArray(child.material)) {
    child.material.forEach(material => material.dispose());
  } else {
    child.material.dispose();
  }
}
```

**disposeObject() 对象清理**:

```javascript
disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(material => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
```

---

## 9. 错误处理

### 9.1 模型加载失败

```javascript
try {
  // 加载模型逻辑
} catch (e) {
  console.error('加载模型文件失败', e);
}
```

**策略**: 捕获异常但不中断加载流程，继续处理下一个对象

### 9.2 无效数据防护

```javascript
if (json.camera && this.camera) {
  if (json.camera.position && typeof json.camera.position.x === 'number') {
    // 安全访问
  }
}
```

**策略**: 逐层检查属性存在性和类型，避免空指针异常

---

## 10. 测试策略

### 10.1 单元测试

```javascript
describe('ThreeViewer Serialization', () => {
  test('exportScene returns valid structure', () => {
    const viewer = new ThreeViewer({ ... });
    const data = viewer.exportScene();
    
    expect(data).toHaveProperty('objects');
    expect(data).toHaveProperty('lights');
    expect(data).toHaveProperty('camera');
    expect(data).toHaveProperty('background');
    expect(Array.isArray(data.objects)).toBe(true);
    expect(Array.isArray(data.lights)).toBe(true);
  });

  test('exportScene excludes helper objects', () => {
    const viewer = new ThreeViewer({ ... });
    const data = viewer.exportScene();
    
    const hasHelper = data.objects.some(obj => 
      obj.name === 'grid_helper' || obj.name === 'axes_helper'
    );
    expect(hasHelper).toBe(false);
  });
});

describe('ObjectManager Serialization', () => {
  test('exportObjects excludes lights', () => {
    const manager = new ObjectManager();
    // 添加几何体和灯光
    const result = manager.exportObjects();
    
    result.objects.forEach(obj => {
      expect(obj.type).not.toBe('light');
    });
  });

  test('deepCloneObject fixes material type', () => {
    const manager = new ObjectManager();
    const source = manager.createPrimitive('box');
    const clone = manager.deepCloneObject(source);
    
    expect(clone.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(clone.material.color).toBeInstanceOf(THREE.Color);
  });
});
```

### 10.2 集成测试

```javascript
describe('Serialization Round-Trip', () => {
  test('export then load restores scene', async () => {
    const viewer = new ThreeViewer({ ... });
    
    // 添加测试对象
    const box = viewer.objectManager.createPrimitive('box', {
      name: 'TestBox',
      position: [1, 2, 3]
    });
    viewer.addObject(box);
    
    // 导出
    const exported = viewer.exportScene();
    
    // 加载
    await viewer.loadScene(exported);
    
    // 验证
    const objects = viewer.getObjects();
    expect(objects.length).toBe(1);
    expect(objects[0].name).toBe('TestBox');
    expect(objects[0].position.x).toBe(1);
    expect(objects[0].position.y).toBe(2);
    expect(objects[0].position.z).toBe(3);
  });
});
```

---

## 11. 依赖关系

### 11.1 NPM 依赖

```json
{
  "dependencies": {
    "three": "^0.182.0",
    "mitt": "^3.0.1",
    "uuid": "^13.0.0",
    "vue": "^3.5.17"
  }
}
```

### 11.2 内部依赖

```
ThreeViewer.js
  ├── ObjectManager.js (createPrimitive, addObject, clear)
  ├── useAssetsManager.js (getCachedModel, loadModel, getModelClone)
  ├── vfs-service.js (getVfs, url)
  ├── useEditorConfig.js (watch config changes)
  └── controls/FlyControls.js (camera controls)

ObjectManager.js
  ├── utils/geometryUtils.js (createBoxGeometry, etc.)
  └── uuid v7 (ID generation)
```

### 11.3 文件清单

| 文件 | 职责 | 行数 |
|------|------|------|
| `src/core/ThreeViewer.js` | 场景序列化/反序列化 | 790 |
| `src/core/ObjectManager.js` | 对象序列化/克隆 | 752 |
| `src/services/vfs-service.js` | VFS 服务，URL 解析 | - |
| `src/composables/useAssetsManager.js` | 资源缓存管理 | - |
| `src/utils/geometryUtils.js` | 几何体创建工具 | - |

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [001-Core 技术方案](../specs-v1/001-core/plan.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
