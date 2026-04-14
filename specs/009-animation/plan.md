# 009-Animation 动画系统模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

动画系统模块基于 Three.js 的 AnimationMixer 机制，实现模型动画的自动检测、播放控制和序列化持久化。它与资源加载器、场景查看器和属性面板紧密协作。

### 1.2 技术约束

- 必须使用 Three.js r182+ 的 AnimationMixer API
- 必须支持 GLTF/GLB 格式的动画提取
- 必须与现有场景序列化机制兼容
- 必须在 Vue 3 Composition API 环境下工作
- 运行时对象不得污染 userData 序列化区域

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 动画数据存储 | 直接挂载到 Object3D | 避免序列化污染，访问效率高 |
| 动画驱动方式 | 渲染循环中遍历更新 | 统一管理，帧率独立 |
| 动画选择状态 | userData.animationIndex | 可序列化，加载后可恢复 |
| UI 组件 | Vue 3 独立面板组件 | 响应式绑定，按需显示 |

---

## 2. 动画自动检测技术实现

### 2.1 资源加载器集成

在 `src/core/AssetLoader.js` 中，GLTF 加载完成后自动提取动画:

```javascript
async loadGLTF(url, onProgress) {
  const loader = new GLTFLoader();
  
  // 配置 Draco、KTX2、Meshopt 解码器
  this.setupDecoders(loader);
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        // 自动检测并挂载动画
        if (gltf.animations && gltf.animations.length > 0) {
          this.attachAnimations(gltf.scene, gltf.animations);
        }
        resolve(gltf);
      },
      onProgress,
      reject
    );
  });
}

attachAnimations(object, clips) {
  // 存储动画片段到对象
  object._clips = clips;
  
  // 创建动画混合器
  object._mixer = new THREE.AnimationMixer(object);
  
  // 触发检测事件
  this.emitter.emit('animation-clips-detected', {
    object,
    clipCount: clips.length,
    clipNames: clips.map(c => c.name)
  });
}
```

### 2.2 动画数据结构

加载后对象上的运行时数据结构:

```javascript
// Object3D 实例上的属性
object._clips = [
  AnimationClip { name: "Walk", duration: 2.5, tracks: [...] },
  AnimationClip { name: "Run", duration: 1.8, tracks: [...] },
  AnimationClip { name: "Idle", duration: 3.0, tracks: [...] }
];

object._mixer = AnimationMixer { ... };

object._activeAction = AnimationAction { ... };

// userData 中的可序列化状态
object.userData = {
  type: "model",
  animationIndex: 0,  // 当前选中的动画索引
  // ... 其他用户数据
};
```

---

## 3. 动画播放控制技术实现

### 3.1 场景级动画驱动

在 `src/core/ThreeViewer.js` 的渲染循环中统一更新所有混合器:

```javascript
animate() {
  const currentTime = performance.now();
  const deltaTime = (currentTime - this.lastTime) / 1000;
  this.lastTime = currentTime;
  
  // 更新 FPS 统计
  this.updateFPS(currentTime);
  
  // 更新所有动画混合器
  this.updateAllMixers(deltaTime);
  
  // 更新控制器
  if (this.controls) {
    this.controls.update();
  }
  
  // 渲染场景
  this.renderFrame();
  
  // 继续循环
  if (this.state.isRendering) {
    this.renderLoopObj = requestAnimationFrame(() => this.animate());
  }
}

updateAllMixers(delta) {
  this.scene.traverse((obj) => {
    if (obj._mixer) {
      obj._mixer.update(delta);
    }
  });
}
```

### 3.2 动画选择与切换

在 `src/core/ThreeViewer.js` 中实现动画播放控制:

```javascript
playAnimation(object, clipIndex) {
  // 验证对象是否有动画
  if (!object._clips || object._clips.length === 0) {
    console.warn('对象没有动画片段');
    return;
  }
  
  // 验证索引有效性
  if (clipIndex < 0 || clipIndex >= object._clips.length) {
    console.warn(`动画索引 ${clipIndex} 超出范围`);
    return;
  }
  
  // 停止当前动画
  if (object._activeAction) {
    object._activeAction.stop();
    object._activeAction = null;
  }
  
  // 获取目标动画片段
  const clip = object._clips[clipIndex];
  
  // 创建并播放新动作
  object._activeAction = object._mixer.clipAction(clip);
  object._activeAction.play();
  
  // 更新 userData 中的索引
  object.userData.animationIndex = clipIndex;
  
  // 触发事件
  this.emitter.emit('animation-played', {
    object,
    clipIndex,
    clipName: clip.name
  });
}

stopAnimation(object) {
  if (object._activeAction) {
    object._activeAction.stop();
    object._activeAction = null;
    
    this.emitter.emit('animation-stopped', {
      object,
      clipIndex: object.userData.animationIndex
    });
  }
}

hasAnimations(object) {
  return object._clips && object._clips.length > 0;
}

getAnimationClips(object) {
  return object._clips || [];
}
```

### 3.3 动画状态导出与导入

在 `src/core/ThreeViewer.js` 中实现序列化集成:

```javascript
exportAnimationState(object) {
  // 仅导出可序列化的动画索引
  return {
    animationIndex: object.userData.animationIndex
  };
}

importAnimationState(object, state) {
  // 验证对象是否有动画
  if (!this.hasAnimations(object)) {
    return;
  }
  
  // 验证索引有效性
  if (state.animationIndex === undefined || state.animationIndex === null) {
    return;
  }
  
  const clipIndex = state.animationIndex;
  if (clipIndex < 0 || clipIndex >= object._clips.length) {
    console.warn(`恢复动画失败: 索引 ${clipIndex} 超出范围`);
    return;
  }
  
  // 自动播放恢复的动画
  this.playAnimation(object, clipIndex);
}
```

---

## 4. 对象管理器集成技术实现

### 4.1 对象导出过滤

在 `src/core/ObjectManager.js` 中，导出对象时过滤运行时动画对象:

```javascript
exportObject(object) {
  const objData = {
    uuid: object.uuid,
    type: object.type,
    name: object.name,
    
    // 几何体数据
    geometry: object.geometry ? {
      type: object.geometry.type,
      parameters: object.geometry.parameters
    } : null,
    
    // 材质数据
    material: object.material ? this.exportMaterial(object.material) : null,
    
    // 变换数据
    transform: {
      position: { x: object.position.x, y: object.position.y, z: object.position.z },
      rotation: { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
      scale: { x: object.scale.x, y: object.scale.y, z: object.scale.z }
    },
    
    // userData（包含 animationIndex，不含运行时对象）
    userData: this.filterUserData(object.userData)
  };
  
  return objData;
}

filterUserData(userData) {
  const filtered = {};
  
  for (const key in userData) {
    // 排除运行时对象（以 _ 开头的属性）
    if (key.startsWith('_')) {
      continue;
    }
    
    // 排除函数和对象引用
    if (typeof userData[key] === 'function') {
      continue;
    }
    
    if (userData[key] instanceof THREE.Object3D) {
      continue;
    }
    
    filtered[key] = userData[key];
  }
  
  return filtered;
}
```

### 4.2 对象导入恢复

在 `src/core/ObjectManager.js` 中，导入对象时恢复动画状态:

```javascript
async importObject(objData, viewer) {
  let object;
  
  // 根据类型创建对象
  if (objData.type === 'Mesh') {
    const geometry = this.createGeometry(objData.geometry);
    const material = await this.loadMaterial(objData.material);
    object = new THREE.Mesh(geometry, material);
  } else if (objData.type === 'Group') {
    object = new THREE.Group();
  }
  
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
  
  // 恢复 userData（包含 animationIndex）
  object.userData = { ...objData.userData };
  
  // 恢复动画状态（如果对象有动画且存在动画索引）
  if (viewer && objData.userData.animationIndex !== undefined) {
    viewer.importAnimationState(object, {
      animationIndex: objData.userData.animationIndex
    });
  }
  
  return object;
}
```

### 4.3 对象移除清理

在 `src/core/ObjectManager.js` 中，移除对象时清理动画资源:

```javascript
remove(object) {
  // 清理动画混合器
  if (object._mixer) {
    // 停止所有动作
    if (object._activeAction) {
      object._activeAction.stop();
      object._activeAction = null;
    }
    
    // 清除混合器引用
    object._mixer = null;
    object._clips = null;
  }
  
  // 从场景移除
  if (object.parent) {
    object.parent.remove(object);
  }
  
  // 触发事件
  this.emitter.emit('object-removed', { object });
}
```

---

## 5. UI 组件技术实现

### 5.1 组件结构

文件: `src/components/property/AnimationPropertyPane.vue`

```vue
<template>
  <div class="animation-property-pane" v-if="showPane">
    <div class="pane-header">
      <span class="pane-title">动画</span>
      <span class="clip-count">{{ clipCount }} 个动画</span>
    </div>
    
    <div class="pane-content">
      <!-- 动画选择下拉框 -->
      <div class="form-item">
        <label>动画片段</label>
        <el-select
          v-model="selectedClipIndex"
          @change="onClipChange"
          placeholder="选择动画"
          size="small"
        >
          <el-option
            v-for="(clip, index) in clips"
            :key="index"
            :label="clip.name"
            :value="index"
          />
        </el-select>
      </div>
      
      <!-- 播放控制按钮 -->
      <div class="form-item">
        <el-button
          :type="isPlaying ? 'danger' : 'success'"
          size="small"
          @click="togglePlay"
        >
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
      </div>
      
      <!-- 当前播放状态 -->
      <div class="form-item status-info" v-if="currentClipName">
        <span>当前: {{ currentClipName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useThreeViewer } from '@/composables/useThreeViewer';
import { useObjectSelection } from '@/composables/useObjectSelection';
import { useEventBus } from '@/composables/useEventBus';

const { viewer } = useThreeViewer();
const { selectedObjects } = useObjectSelection();
const { eventBus } = useEventBus();

const selectedClipIndex = ref(0);
const isPlaying = ref(false);
const currentClipName = ref('');

// 计算属性
const showPane = computed(() => {
  if (selectedObjects.length !== 1) return false;
  const obj = selectedObjects[0];
  return obj._clips && obj._clips.length > 0;
});

const clips = computed(() => {
  if (selectedObjects.length !== 1) return [];
  return selectedObjects[0]._clips || [];
});

const clipCount = computed(() => clips.value.length);

// 监听选中对象变化
watch(selectedObjects, (newObjects) => {
  if (newObjects.length === 1 && newObjects[0]._clips) {
    const obj = newObjects[0];
    selectedClipIndex.value = obj.userData.animationIndex || 0;
    currentClipName.value = obj._clips[selectedClipIndex.value]?.name || '';
    isPlaying.value = !!obj._activeAction;
  }
}, { immediate: true });

// 动画选择变化
function onClipChange(index) {
  if (selectedObjects.length !== 1) return;
  
  const obj = selectedObjects[0];
  viewer.playAnimation(obj, index);
  
  selectedClipIndex.value = index;
  currentClipName.value = obj._clips[index]?.name || '';
  isPlaying.value = true;
}

// 播放/暂停切换
function togglePlay() {
  if (selectedObjects.length !== 1) return;
  
  const obj = selectedObjects[0];
  
  if (isPlaying.value) {
    viewer.stopAnimation(obj);
    isPlaying.value = false;
  } else {
    viewer.playAnimation(obj, selectedClipIndex.value);
    isPlaying.value = true;
  }
}

// 监听动画事件
function onAnimationPlayed({ object, clipIndex, clipName }) {
  if (selectedObjects.length === 1 && selectedObjects[0] === object) {
    selectedClipIndex.value = clipIndex;
    currentClipName.value = clipName;
    isPlaying.value = true;
  }
}

function onAnimationStopped({ object }) {
  if (selectedObjects.length === 1 && selectedObjects[0] === object) {
    isPlaying.value = false;
  }
}

onMounted(() => {
  eventBus.on('animation-played', onAnimationPlayed);
  eventBus.on('animation-stopped', onAnimationStopped);
});

onUnmounted(() => {
  eventBus.off('animation-played', onAnimationPlayed);
  eventBus.off('animation-stopped', onAnimationStopped);
});
</script>

<style scoped lang="scss">
.animation-property-pane {
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .pane-title {
      font-weight: 600;
      font-size: 14px;
      color: #303133;
    }
    
    .clip-count {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .pane-content {
    .form-item {
      margin-bottom: 12px;
      
      label {
        display: block;
        font-size: 12px;
        color: #606266;
        margin-bottom: 4px;
      }
      
      .el-select {
        width: 100%;
      }
      
      &.status-info {
        font-size: 12px;
        color: #67c23a;
      }
    }
  }
}
</style>
```

### 5.2 组件集成

在 `src/components/property/PropertyPanel.vue` 中集成动画面板:

```vue
<template>
  <div class="property-panel">
    <!-- 其他属性面板... -->
    
    <!-- 动画属性面板（条件显示） -->
    <AnimationPropertyPane v-if="hasSelectedObject" />
    
    <!-- 其他属性面板... -->
  </div>
</template>

<script setup>
import AnimationPropertyPane from './AnimationPropertyPane.vue';
// ... 其他导入

const hasSelectedObject = computed(() => {
  return selectedObjects.value.length > 0;
});
</script>
```

---

## 6. 序列化技术实现

### 6.1 场景导出

在 `src/core/ThreeViewer.js` 的 `exportScene()` 方法中:

```javascript
exportScene() {
  const objects = [];
  
  this.scene.traverse((obj) => {
    if (obj.type === 'Mesh' || obj.type === 'Group' || obj.type === 'Light') {
      const objData = this.objectManager.exportObject(obj);
      
      // 动画状态已通过 userData.animationIndex 保存
      // 无需额外处理
      
      objects.push(objData);
    }
  });
  
  return {
    version: '1.0',
    metadata: {
      createdAt: new Date().toISOString(),
      objectCount: objects.length
    },
    scene: {
      background: this.scene.background?.getHex() || null
    },
    objects
  };
}
```

### 6.2 场景加载

在 `src/core/ThreeViewer.js` 的 `loadScene()` 方法中:

```javascript
async loadScene(jsonData) {
  try {
    const data = typeof jsonData === 'string' 
      ? JSON.parse(jsonData) 
      : jsonData;
    
    // 验证数据格式
    if (!data.objects || !Array.isArray(data.objects)) {
      throw new Error('Invalid scene format: missing objects array');
    }
    
    // 清空当前场景
    this.clearScene();
    
    // 恢复背景
    if (data.scene?.background) {
      this.scene.background = new THREE.Color(data.scene.background);
    }
    
    // 恢复对象
    for (const objData of data.objects) {
      const obj = await this.objectManager.importObject(objData, this);
      if (obj) {
        this.scene.add(obj);
      }
    }
    
    // 触发加载完成事件
    this.emitter.emit('scene-loaded', { scene: this.scene });
    
  } catch (error) {
    console.error('场景加载失败:', error);
    this.emitter.emit('scene-load-error', { error });
    throw error;
  }
}
```

### 6.3 序列化数据示例

保存后的 JSON 数据结构:

```json
{
  "version": "1.0",
  "metadata": {
    "createdAt": "2026-04-14T10:30:00.000Z",
    "objectCount": 3
  },
  "scene": {
    "background": 16777215
  },
  "objects": [
    {
      "uuid": "abc-123-def",
      "type": "Group",
      "name": "AnimatedModel",
      "transform": {
        "position": { "x": 0, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 1, "y": 1, "z": 1 }
      },
      "userData": {
        "type": "model",
        "animationIndex": 1,
        "sourceUrl": "/models/character.glb"
      }
    }
  ]
}
```

注意: `_clips`、`_mixer`、`_activeAction` 等运行时对象不会出现在序列化数据中。

---

## 7. 事件系统集成

### 7.1 事件定义

在 `src/composables/useEventBus.js` 中注册动画相关事件:

```javascript
// 动画系统事件
const ANIMATION_EVENTS = {
  'animation-selected': '用户选择新动画',
  'animation-played': '动画开始播放',
  'animation-stopped': '动画停止播放',
  'animation-clips-detected': '检测到模型动画'
};

export function useEventBus() {
  const eventBus = mitt();
  
  // ... 其他事件注册
  
  return { eventBus, ANIMATION_EVENTS };
}
```

### 7.2 事件监听

在 `src/core/ThreeViewer.js` 中监听对象生命周期事件:

```javascript
initEventListeners() {
  // 监听对象添加
  this.objectManager.on('object-added', ({ object }) => {
    // 检查新对象是否包含动画
    if (this.hasAnimations(object)) {
      console.log(`检测到动画对象: ${object.name || object.uuid}`);
    }
  });
  
  // 监听对象移除
  this.objectManager.on('object-removed', ({ object }) => {
    // 清理动画资源（已在 ObjectManager.remove 中处理）
  });
  
  // 监听场景加载完成
  this.on('scene-loaded', () => {
    console.log('场景加载完成，动画状态已恢复');
  });
}
```

---

## 8. 性能优化技术实现

### 8.1 动画更新优化

```javascript
// ThreeViewer.js - 优化的动画更新
updateAllMixers(delta) {
  // 限制 delta 范围，避免时间跳跃
  const clampedDelta = Math.min(delta, 0.1);
  
  this.scene.traverse((obj) => {
    if (obj._mixer && obj._activeAction) {
      obj._mixer.update(clampedDelta);
    }
  });
}
```

### 8.2 内存管理

```javascript
// ObjectManager.js - 对象移除时的完整清理
remove(object) {
  // 清理动画资源
  if (object._mixer) {
    // 停止并清理所有动作
    if (object._activeAction) {
      object._activeAction.stop();
      object._activeAction.reset();
      object._activeAction = null;
    }
    
    // 清理混合器
    object._mixer.stopAllAction();
    object._mixer = null;
    
    // 清理片段引用
    object._clips = null;
  }
  
  // 清理几何体和材质
  this.disposeObject(object);
  
  // 从场景移除
  if (object.parent) {
    object.parent.remove(object);
  }
  
  this.emitter.emit('object-removed', { object });
}
```

### 8.3 时间增量处理

```javascript
// ThreeViewer.js - 安全的时间计算
animate() {
  const currentTime = performance.now();
  let deltaTime = (currentTime - this.lastTime) / 1000;
  this.lastTime = currentTime;
  
  // 处理首次帧
  if (deltaTime > 1) {
    deltaTime = 1 / 60;
  }
  
  // 更新动画
  this.updateAllMixers(deltaTime);
  
  // ... 渲染逻辑
}
```

---

## 9. 错误处理技术实现

### 9.1 动画播放错误

```javascript
playAnimation(object, clipIndex) {
  try {
    if (!object._clips || object._clips.length === 0) {
      console.warn(`[Animation] 对象 ${object.uuid} 没有动画片段`);
      return;
    }
    
    if (clipIndex < 0 || clipIndex >= object._clips.length) {
      console.warn(
        `[Animation] 索引 ${clipIndex} 超出范围 [0, ${object._clips.length - 1}]`
      );
      return;
    }
    
    // 停止当前动画
    if (object._activeAction) {
      object._activeAction.fadeOut(0.2);
      object._activeAction = null;
    }
    
    // 播放新动画
    const clip = object._clips[clipIndex];
    object._activeAction = object._mixer.clipAction(clip);
    object._activeAction.fadeIn(0.2);
    object._activeAction.play();
    
    object.userData.animationIndex = clipIndex;
    
    this.emitter.emit('animation-played', {
      object,
      clipIndex,
      clipName: clip.name
    });
    
  } catch (error) {
    console.error(`[Animation] 播放动画失败:`, error);
    this.emitter.emit('animation-error', { object, clipIndex, error });
  }
}
```

### 9.2 序列化恢复错误

```javascript
importAnimationState(object, state) {
  try {
    if (!this.hasAnimations(object)) {
      return;
    }
    
    if (state.animationIndex === undefined || state.animationIndex === null) {
      console.warn('[Animation] 序列化数据中缺少 animationIndex');
      return;
    }
    
    const clipIndex = state.animationIndex;
    
    if (clipIndex < 0 || clipIndex >= object._clips.length) {
      console.warn(
        `[Animation] 恢复失败: 索引 ${clipIndex} 超出范围，可用片段数: ${object._clips.length}`
      );
      return;
    }
    
    this.playAnimation(object, clipIndex);
    
  } catch (error) {
    console.error('[Animation] 恢复动画状态失败:', error);
  }
}
```

---

## 10. 依赖关系

### 10.1 NPM 依赖

```json
{
  "dependencies": {
    "three": "^0.182.0",
    "vue": "^3.5.17",
    "element-plus": "^2.10.5",
    "mitt": "^3.0.1"
  }
}
```

### 10.2 内部依赖

```
AnimationPropertyPane.vue → useThreeViewer.js
AnimationPropertyPane.vue → useObjectSelection.js
AnimationPropertyPane.vue → useEventBus.js
ThreeViewer.js → ObjectManager.js
ThreeViewer.js → AssetLoader.js
ObjectManager.js → ThreeViewer.js (动画恢复)
```

### 10.3 文件清单

| 文件 | 职责 |
|------|------|
| `src/core/AssetLoader.js` | 动画自动检测和挂载 |
| `src/core/ThreeViewer.js` | 动画驱动、播放控制、序列化 |
| `src/core/ObjectManager.js` | 对象导出过滤、导入恢复、清理 |
| `src/components/property/AnimationPropertyPane.vue` | 动画 UI 面板 |
| `src/components/property/PropertyPanel.vue` | 面板集成入口 |
| `src/composables/useEventBus.js` | 事件总线注册 |

---

## 11. 测试策略

### 11.1 单元测试

```javascript
describe('Animation System', () => {
  let viewer;
  let objectManager;
  
  beforeEach(() => {
    viewer = new ThreeViewer();
    objectManager = new ObjectManager();
    viewer.init(container);
  });
  
  test('自动检测动画片段', () => {
    const mockClips = [
      new THREE.AnimationClip('Walk', 2.5, []),
      new THREE.AnimationClip('Run', 1.8, [])
    ];
    
    const object = new THREE.Group();
    viewer.attachAnimations(object, mockClips);
    
    expect(object._clips).toHaveLength(2);
    expect(object._mixer).toBeDefined();
    expect(viewer.hasAnimations(object)).toBe(true);
  });
  
  test('播放指定动画', () => {
    const object = createAnimatedObject();
    viewer.playAnimation(object, 0);
    
    expect(object._activeAction).toBeDefined();
    expect(object.userData.animationIndex).toBe(0);
  });
  
  test('切换动画', () => {
    const object = createAnimatedObject();
    viewer.playAnimation(object, 0);
    viewer.playAnimation(object, 1);
    
    expect(object.userData.animationIndex).toBe(1);
  });
  
  test('无效索引处理', () => {
    const object = createAnimatedObject();
    const consoleSpy = jest.spyOn(console, 'warn');
    
    viewer.playAnimation(object, 999);
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(object.userData.animationIndex).toBeUndefined();
  });
  
  test('无动画对象处理', () => {
    const object = new THREE.Mesh();
    
    expect(viewer.hasAnimations(object)).toBe(false);
    expect(viewer.getAnimationClips(object)).toHaveLength(0);
  });
});
```

### 11.2 集成测试

```javascript
describe('Animation Integration', () => {
  test('完整动画流程', async () => {
    const viewer = setupViewer();
    
    // 加载带动画的模型
    const gltf = await viewer.assetLoader.loadGLTF('/models/test.glb');
    viewer.objectManager.add(gltf.scene);
    
    // 验证动画检测
    expect(viewer.hasAnimations(gltf.scene)).toBe(true);
    
    // 播放动画
    viewer.playAnimation(gltf.scene, 0);
    expect(gltf.scene.userData.animationIndex).toBe(0);
    
    // 导出场景
    const sceneData = viewer.exportScene();
    expect(sceneData.objects[0].userData.animationIndex).toBe(0);
    
    // 加载场景
    await viewer.loadScene(sceneData);
    
    // 验证动画恢复
    const restoredObject = viewer.getObjects()[0];
    expect(restoredObject.userData.animationIndex).toBe(0);
    expect(restoredObject._activeAction).toBeDefined();
  });
});
```

### 11.3 性能测试

```javascript
describe('Animation Performance', () => {
  test('多对象动画更新性能', () => {
    const viewer = setupViewer();
    const objects = createAnimatedObjects(10);
    
    objects.forEach(obj => viewer.objectManager.add(obj));
    
    const start = performance.now();
    
    for (let i = 0; i < 60; i++) {
      viewer.updateAllMixers(1 / 60);
    }
    
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100); // 60 帧更新 < 100ms
  });
});
```

---

## 12. 使用示例

### 12.1 加载并播放动画

```javascript
import ThreeViewer from './core/ThreeViewer.js';
import ObjectManager from './core/ObjectManager.js';
import AssetLoader from './core/AssetLoader.js';

const objectManager = new ObjectManager();
const assetLoader = new AssetLoader();

const viewer = new ThreeViewer({
  objectManager,
  assetLoader
});

viewer.init(document.getElementById('container'));

// 加载模型（自动检测动画）
const gltf = await assetLoader.loadGLTF('/models/character.glb');
objectManager.add(gltf.scene);

// 播放第一个动画
viewer.playAnimation(gltf.scene, 0);

// 切换到第二个动画
viewer.playAnimation(gltf.scene, 1);

// 停止动画
viewer.stopAnimation(gltf.scene);
```

### 12.2 保存和加载场景

```javascript
// 保存场景（动画索引自动保存）
const sceneData = viewer.exportScene();
saveToFile(sceneData, 'scene.json');

// 加载场景（动画自动恢复）
const loadedData = loadFromFile('scene.json');
await viewer.loadScene(loadedData);

// 加载后，之前选中的动画会自动播放
```

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [001-Core 核心引擎模块](../001-core/plan.md)
- [007-Serialization 序列化模块](../007-serialization/plan.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
