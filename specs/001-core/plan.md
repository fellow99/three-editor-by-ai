# 001-Core 核心引擎模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07  
**最后更新**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

核心引擎模块是 Three Editor by AI 的基础，负责 Three.js 场景的创建、管理、渲染和对象生命周期管理。

### 1.2 技术约束

- 必须使用 Three.js r182+
- 必须支持 Vue 3 Composition API
- 必须实现事件驱动架构（mitt）
- 必须支持场景序列化/反序列化

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 事件总线 | mitt | 轻量级（200 字节）、简洁 API |
| ID 生成 | uuid v7 | 最新标准、时间有序 |
| 几何体创建 | 工具函数封装 | 代码复用、统一参数 |

---

## 2. ThreeViewer 技术设计

### 2.1 类结构

```javascript
class ThreeViewer {
  // 核心属性
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  controls: OrbitControls | MapControls | FlyControls
  composer: EffectComposer
  
  // 状态
  state: {
    isInitialized: boolean
    isRendering: boolean
    frameCount: number
    fps: number
  }
  
  // 事件
  emitter: mitt.Emitter
  
  // 动画
  mixers: AnimationMixer[]
  
  // 后处理
  passes: Array<{name: string, pass: Pass, enabled: boolean}>
}
```

### 2.2 初始化流程

```
1. 创建 THREE.Scene
   ↓
2. 创建 THREE.PerspectiveCamera
   - FOV: 75
   - Aspect: container.width / container.height
   - Near: 0.1, Far: 1000
   ↓
3. 创建 THREE.WebGLRenderer
   - Antialias: true
   - Alpha: true
   - PixelRatio: window.devicePixelRatio
   ↓
4. 创建 OrbitControls（默认）
   ↓
5. 创建 EffectComposer
   - 添加 RenderPass
   - 添加 UnrealBloomPass（可选）
   - 添加 FXAAShaderPass（可选）
   ↓
6. 启动渲染循环
   - requestAnimationFrame
   - 更新 FPS 统计
   - 驱动动画更新
```

### 2.3 渲染循环实现

```javascript
animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - this.lastTime) / 1000;
  this.lastTime = currentTime;
  
  // 更新 FPS
  this.frameCount++;
  if (currentTime - this.lastFpsTime >= 1000) {
    this.state.fps = this.frameCount;
    this.frameCount = 0;
    this.lastFpsTime = currentTime;
  }
  
  // 更新所有 AnimationMixer
  this.scene.traverse((obj) => {
    if (obj._mixer) {
      obj._mixer.update(deltaTime);
    }
  });
  
  // 渲染
  if (this.composer) {
    this.composer.render();
  } else {
    this.renderer.render(this.scene, this.camera);
  }
  
  // 继续循环
  if (this.state.isRendering) {
    this.renderLoopObj = requestAnimationFrame(() => this.animate());
  }
}
```

### 2.4 控制器切换实现

```javascript
setControls(type) {
  // 1. 移除旧控制器
  if (this.controls) {
    this.controls.dispose();
    this.controls = null;
  }
  
  // 2. 创建新控制器
  switch (type) {
    case 'orbit':
      this.controls = new OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      break;
    case 'map':
      this.controls = new MapControls(
        this.camera,
        this.renderer.domElement
      );
      break;
    case 'fly':
      this.controls = new FlyControls(
        this.camera,
        this.renderer.domElement
      );
      break;
  }
  
  // 3. 配置控制器
  this.controls.enableDamping = true;
  this.controls.dampingFactor = 0.05;
  
  // 4. 触发事件
  this.emitter.emit('controls-changed', { type });
}
```

---

## 3. ObjectManager 技术设计

### 3.1 类结构

```javascript
class ObjectManager {
  // 状态
  state: {
    objects: Map<string, THREE.Object3D>
    selectedObjects: Set<THREE.Object3D>
    clipboard: THREE.Object3D | null
  }
  
  // 缓存
  materialCache: Map<string, THREE.Material>
  defaultMaterial: THREE.MeshStandardMaterial
  
  // 事件
  emitter: mitt.Emitter
}
```

### 3.2 几何体创建工厂

```javascript
createPrimitive(type, options = {}) {
  let geometry;
  
  // 使用工具函数创建几何体
  switch (type) {
    case 'box':
      geometry = createBoxGeometry(
        options.width || 1,
        options.height || 1,
        options.depth || 1
      );
      break;
    case 'sphere':
      geometry = createSphereGeometry(
        options.radius || 0.5,
        options.widthSegments || 32,
        options.heightSegments || 16
      );
      break;
    // ... 其他类型
  }
  
  // 创建 Mesh
  const material = options.material || this.defaultMaterial;
  const mesh = new THREE.Mesh(geometry, material);
  
  // 设置 userData
  mesh.userData = {
    type: 'primitive',
    primitiveType: type,
    ...options.userData
  };
  
  return mesh;
}
```

### 3.3 射线检测优化

```javascript
getIntersectedObjects(raycaster) {
  // 1. 获取所有未锁定对象
  const objects = this.getUnlockedObjects();
  
  // 2. 执行射线检测
  const intersects = raycaster.intersectObjects(objects, true);
  
  // 3. 过滤重复对象（只返回顶层对象）
  const uniqueObjects = [];
  const seen = new Set();
  
  for (const intersect of intersects) {
    let obj = intersect.object;
    
    // 向上查找，直到找到未锁定的顶层对象
    while (obj.parent && !seen.has(obj.parent.uuid)) {
      obj = obj.parent;
    }
    
    if (!seen.has(obj.uuid)) {
      seen.add(obj.uuid);
      uniqueObjects.push(obj);
    }
  }
  
  return uniqueObjects;
}

getUnlockedObjects() {
  const objects = [];
  this.scene.traverse((obj) => {
    if (obj.userData.locked !== true) {
      objects.push(obj);
    }
  });
  return objects;
}
```

---

## 4. 序列化技术实现

### 4.1 导出场景

```javascript
exportScene() {
  const objects = [];
  
  this.scene.traverse((obj) => {
    if (obj.type === 'Mesh' || obj.type === 'Light') {
      const objData = {
        uuid: obj.uuid,
        type: obj.type,
        name: obj.name,
        
        // 几何体
        geometry: obj.geometry ? {
          type: obj.geometry.type,
          parameters: obj.geometry.parameters
        } : null,
        
        // 材质
        material: obj.material ? this.exportMaterial(obj.material) : null,
        
        // 变换
        transform: {
          position: {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z
          },
          rotation: {
            x: obj.rotation.x,
            y: obj.rotation.y,
            z: obj.rotation.z,
            order: obj.rotation.order
          },
          scale: {
            x: obj.scale.x,
            y: obj.scale.y,
            z: obj.scale.z
          }
        },
        
        // userData（过滤运行时对象）
        userData: this.filterUserData(obj.userData)
      };
      
      objects.push(objData);
    }
  });
  
  return JSON.stringify({
    version: '1.0',
    metadata: {
      createdAt: new Date().toISOString(),
      objectCount: objects.length
    },
    scene: {
      background: this.scene.background?.getHex() || null
    },
    objects
  });
}

filterUserData(userData) {
  const filtered = {};
  for (const key in userData) {
    // 排除运行时对象
    if (key.startsWith('_') || 
        typeof userData[key] === 'function' ||
        userData[key] instanceof THREE.Object3D) {
      continue;
    }
    filtered[key] = userData[key];
  }
  return filtered;
}
```

### 4.2 加载场景

```javascript
async loadScene(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  
  // 清空场景
  this.clearScene();
  
  // 恢复背景
  if (data.scene.background) {
    this.scene.background = new THREE.Color(data.scene.background);
  }
  
  // 恢复对象
  for (const objData of data.objects) {
    const obj = await this.importObject(objData);
    if (obj) {
      this.scene.add(obj);
    }
  }
  
  // 触发事件
  this.emitter.emit('scene-loaded', { scene: this.scene });
}

async importObject(objData) {
  let object;
  
  // 根据类型创建对象
  if (objData.type === 'Mesh') {
    const geometry = this.createGeometry(objData.geometry);
    const material = await this.loadMaterial(objData.material);
    object = new THREE.Mesh(geometry, material);
  } else if (objData.type === 'DirectionalLight') {
    object = new THREE.DirectionalLight(
      objData.color,
      objData.intensity
    );
  }
  // ... 其他类型
  
  if (!object) return null;
  
  // 恢复变换
  object.position.set(
    objData.transform.position.x,
    objData.transform.position.y,
    objData.transform.position.z
  );
  object.rotation.set(
    objData.transform.rotation.x,
    objData.transform.rotation.y,
    objData.transform.rotation.z
  );
  object.scale.set(
    objData.transform.scale.x,
    objData.transform.scale.y,
    objData.transform.scale.z
  );
  
  // 恢复 userData
  object.userData = { ...objData.userData };
  
  // 恢复动画
  if (objData.animations && objData.userData.animationIndex !== undefined) {
    this.restoreAnimation(object, objData.animations);
  }
  
  return object;
}
```

---

## 5. 后处理技术实现

### 5.1 EffectComposer 配置

```javascript
initPostProcessing() {
  // 创建合成器
  this.composer = new EffectComposer(this.renderer);
  
  // 1. 渲染 Pass（必须）
  const renderPass = new RenderPass(this.scene, this.camera);
  this.composer.addPass(renderPass);
  
  // 2. Bloom Pass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(
      this.renderer.domElement.width,
      this.renderer.domElement.height
    ),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  bloomPass.enabled = false; // 默认禁用
  this.composer.addPass(bloomPass);
  this.passes.push({ name: 'bloom', pass: bloomPass, enabled: false });
  
  // 3. FXAA Pass
  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.set(
    1 / this.renderer.domElement.width,
    1 / this.renderer.domElement.height
  );
  fxaaPass.enabled = false; // 默认禁用
  this.composer.addPass(fxaaPass);
  this.passes.push({ name: 'fxaa', pass: fxaaPass, enabled: false });
}

setPassEnabled(name, enabled) {
  const pass = this.passes.find(p => p.name === name);
  if (pass) {
    pass.pass.enabled = enabled;
    pass.enabled = enabled;
  }
}

setBloomParams(params) {
  const bloomPass = this.passes.find(p => p.name === 'bloom')?.pass;
  if (bloomPass instanceof UnrealBloomPass) {
    if (params.strength !== undefined) {
      bloomPass.strength = params.strength;
    }
    if (params.radius !== undefined) {
      bloomPass.radius = params.radius;
    }
    if (params.threshold !== undefined) {
      bloomPass.threshold = params.threshold;
    }
  }
}
```

---

## 6. 性能优化

### 6.1 按需渲染

```javascript
// 标记需要重新渲染
needsRender() {
  if (!this.pendingRender) {
    this.pendingRender = true;
    requestAnimationFrame(() => {
      this.pendingRender = false;
      // 执行渲染
    });
  }
}

// 静态场景优化
setStaticMode(isStatic) {
  if (isStatic) {
    // 停止自动渲染循环
    this.state.isRendering = false;
    cancelAnimationFrame(this.renderLoopObj);
  } else {
    // 恢复渲染循环
    this.state.isRendering = true;
    this.animate();
  }
}
```

### 6.2 内存管理

```javascript
clearScene() {
  // 遍历并清理所有对象
  this.scene.traverse((obj) => {
    // 清理几何体
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    
    // 清理材质
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
    
    // 清理纹理
    for (const key in obj) {
      const prop = obj[key];
      if (prop && prop.isTexture) {
        prop.dispose();
      }
    }
  });
  
  // 清空场景
  while (this.scene.children.length > 0) {
    this.scene.remove(this.scene.children[0]);
  }
}
```

---

## 7. 错误处理

### 7.1 加载错误

```javascript
async loadScene(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    // 验证数据结构
    if (!data.objects || !Array.isArray(data.objects)) {
      throw new Error('Invalid scene format: missing objects array');
    }
    
    // ... 加载逻辑
    
  } catch (error) {
    console.error('场景加载失败:', error);
    this.emitter.emit('scene-load-error', { error });
    throw error;
  }
}
```

### 7.2 序列化错误

```javascript
exportMaterial(material) {
  try {
    return {
      type: material.type,
      uuid: material.uuid,
      color: material.color?.getHex(),
      // ... 其他属性
    };
  } catch (error) {
    console.warn('材质导出失败:', material.uuid, error);
    return null;
  }
}
```

---

## 8. 测试策略

### 8.1 单元测试

```javascript
describe('ThreeViewer', () => {
  test('初始化场景', () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    expect(viewer.scene).toBeDefined();
    expect(viewer.camera).toBeDefined();
    expect(viewer.renderer).toBeDefined();
  });
  
  test('场景序列化', () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    
    // 添加对象
    const box = viewer.createPrimitive('box');
    viewer.addObject(box);
    
    // 导出
    const json = viewer.exportScene();
    const data = JSON.parse(json);
    
    expect(data.objects).toHaveLength(1);
    expect(data.objects[0].type).toBe('Mesh');
  });
});
```

### 8.2 集成测试

```javascript
describe('Core Integration', () => {
  test('完整场景流程', async () => {
    const viewer = new ThreeViewer();
    viewer.init(container);
    
    // 创建场景
    const box = viewer.createPrimitive('box');
    viewer.addObject(box);
    
    // 导出
    const exported = viewer.exportScene();
    
    // 清空
    viewer.clearScene();
    
    // 导入
    await viewer.loadScene(exported);
    
    // 验证
    expect(viewer.getObjects()).toHaveLength(1);
  });
});
```

---

## 9. 依赖关系

### 9.1 NPM 依赖

```json
{
  "dependencies": {
    "three": "^0.182.0",
    "mitt": "^3.0.1",
    "uuid": "^13.0.0",
    "3d-tiles-renderer": "^0.4.16"
  }
}
```

### 9.2 内部依赖

```
ThreeViewer → ObjectManager
ThreeViewer → AssetLoader
ThreeViewer → InputManager
ObjectManager → geometryUtils
AssetLoader → fileUtils
```

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始技术方案 |
