# 004-Material 材质系统模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

材质系统模块负责 Three.js 材质的编辑、预览和持久化，是编辑器属性编辑功能的核心组成部分。

### 1.2 技术约束

- 必须使用 Three.js r182+ 材质 API
- 必须支持 Vue 3 Composition API
- 必须与 useThreeViewer 和 useObjectSelection 集成
- 必须支持撤销/重做系统集成
- 必须与 VFS 虚拟文件系统对接

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 状态管理 | 单例 Composable | 全局唯一材质状态，避免多实例冲突 |
| 颜色处理 | THREE.Color 统一 | 与 Three.js 原生 API 一致 |
| 纹理加载 | 异步加载 + 缓存 | 避免重复加载，提升性能 |
| 预览渲染 | 独立小型场景 | 不影响主场景性能 |
| UI 组件 | Element Plus | 项目统一 UI 库 |

---

## 2. useMaterial 技术设计

### 2.1 单例模式实现

```javascript
import { ref, reactive, watch, computed } from 'vue';
import { useThreeViewer } from './useThreeViewer';
import { useObjectSelection } from './useObjectSelection';

let instance = null;

export function useMaterial() {
  if (instance) return instance;
  
  const threeViewer = useThreeViewer();
  const { selectedObjects } = useObjectSelection();
  
  // 状态
  const currentMaterial = ref(null);
  const originalMaterialBackup = ref(null);
  const properties = reactive({});
  const textures = reactive({});
  const backupStack = [];
  
  instance = {
    currentMaterial,
    originalMaterialBackup,
    properties,
    textures,
    backupStack,
    // 方法...
  };
  
  return instance;
}
```

### 2.2 材质属性绑定流程

```
1. 监听 selectedObjects 变化
   ↓
2. 获取选中对象的 material 属性
   ↓
3. 判断材质类型，提取对应属性
   ↓
4. 填充 properties 响应式对象
   ↓
5. 提取纹理引用到 textures 对象
   ↓
6. 备份原始材质数据到 originalMaterialBackup
   ↓
7. 触发属性面板更新
```

### 2.3 材质属性提取实现

```javascript
function extractMaterialProperties(material) {
  if (!material) return {};
  
  const props = {
    type: material.type,
    uuid: material.uuid,
    name: material.name,
    color: material.color?.clone(),
    emissive: material.emissive?.clone(),
    emissiveIntensity: material.emissiveIntensity,
    roughness: material.roughness,
    metalness: material.metalness,
    opacity: material.opacity,
    transparent: material.transparent,
    wireframe: material.wireframe,
    side: material.side,
    flatShading: material.flatShading,
    vertexColors: material.vertexColors,
    fog: material.fog,
    toneMapped: material.toneMapped,
  };
  
  // 物理材质专属属性
  if (material.type === 'MeshPhysicalMaterial') {
    props.clearcoat = material.clearcoat;
    props.clearcoatRoughness = material.clearcoatRoughness;
    props.ior = material.ior;
    props.transmission = material.transmission;
    props.thickness = material.thickness;
  }
  
  return props;
}
```

### 2.4 材质属性更新实现

```javascript
function updateMaterialProperty(key, value) {
  const material = currentMaterial.value;
  if (!material) return;
  
  // 记录备份（用于撤销）
  backupMaterial();
  
  // 颜色属性特殊处理
  if (['color', 'emissive'].includes(key)) {
    const normalizedColor = normalizeColor(value);
    material[key].copy(normalizedColor);
    properties[key] = normalizedColor.clone();
  }
  // 纹理属性
  else if (key.endsWith('Map') || key === 'map') {
    setTexture(key, value);
    return;
  }
  // 普通属性
  else {
    material[key] = value;
    properties[key] = value;
  }
  
  // 标记材质需要更新
  material.needsUpdate = true;
  
  // 触发预览更新
  updatePreview();
}
```

### 2.5 颜色归一化实现

```javascript
function normalizeColor(color) {
  if (color instanceof THREE.Color) {
    return color.clone();
  }
  
  if (typeof color === 'string') {
    return new THREE.Color(color);
  }
  
  if (typeof color === 'number') {
    return new THREE.Color(color);
  }
  
  if (typeof color === 'object' && color !== null) {
    return new THREE.Color(color.r, color.g, color.b);
  }
  
  return new THREE.Color(0x888888);
}
```

---

## 3. 纹理加载管线

### 3.1 纹理加载流程

```
1. 接收纹理槽位名称和 VFS 路径
   ↓
2. 检查纹理缓存
   ↓ (命中)
   返回缓存纹理
   ↓ (未命中)
3. 从 VFS 获取文件 URL
   ↓
4. 使用 THREE.TextureLoader 加载
   ↓
5. 配置纹理属性（wrapS, wrapT, filter 等）
   ↓
6. 存入缓存
   ↓
7. 赋值到材质对应槽位
   ↓
8. 标记 material.needsUpdate = true
```

### 3.2 纹理加载实现

```javascript
const textureCache = new Map();

async function setTexture(slot, vfsPath) {
  const material = currentMaterial.value;
  if (!material) return;
  
  // 检查缓存
  if (textureCache.has(vfsPath)) {
    material[slot] = textureCache.get(vfsPath);
    material.needsUpdate = true;
    return;
  }
  
  // 从 VFS 获取 URL
  const fileUrl = await vfsService.getFileUrl(vfsPath);
  
  // 加载纹理
  const loader = new THREE.TextureLoader();
  const texture = await new Promise((resolve, reject) => {
    loader.load(fileUrl, resolve, undefined, reject);
  });
  
  // 配置默认属性
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = threeViewer.renderer.capabilities.getMaxAnisotropy();
  
  // 缓存
  textureCache.set(vfsPath, texture);
  
  // 赋值到材质
  material[slot] = texture;
  textures[slot] = texture;
  material.needsUpdate = true;
  
  updatePreview();
}
```

### 3.3 纹理移除实现

```javascript
function removeTexture(slot) {
  const material = currentMaterial.value;
  if (!material) return;
  
  const texture = material[slot];
  if (texture) {
    // 从缓存中移除
    for (const [path, cachedTexture] of textureCache.entries()) {
      if (cachedTexture === texture) {
        textureCache.delete(path);
        break;
      }
    }
    
    // 释放纹理资源
    texture.dispose();
    
    // 清空材质槽位
    material[slot] = null;
    textures[slot] = null;
    material.needsUpdate = true;
    
    updatePreview();
  }
}
```

### 3.4 纹理变换实现

```javascript
function updateTextureTransform(slot, transform) {
  const material = currentMaterial.value;
  const texture = material?.[slot];
  if (!texture) return;
  
  if (transform.offset) {
    texture.offset.set(transform.offset.x, transform.offset.y);
  }
  if (transform.repeat) {
    texture.repeat.set(transform.repeat.x, transform.repeat.y);
  }
  if (transform.rotation !== undefined) {
    texture.rotation = transform.rotation;
  }
  if (transform.center) {
    texture.center.set(transform.center.x, transform.center.y);
  }
  
  material.needsUpdate = true;
  updatePreview();
}
```

---

## 4. 材质类型切换

### 4.1 切换流程

```
1. 接收目标材质类型
   ↓
2. 备份当前材质数据
   ↓
3. 创建新材质实例
   ↓
4. 迁移可兼容属性（color, opacity 等）
   ↓
5. 替换对象材质
   ↓
6. 更新 currentMaterial 引用
   ↓
7. 重新提取属性到 properties
   ↓
8. 触发面板刷新
```

### 4.2 切换实现

```javascript
function changeMaterialType(newType) {
  const object = selectedObjects.value[0];
  if (!object) return;
  
  // 备份
  backupMaterial();
  
  // 创建新材质
  const MaterialClass = THREE[newType];
  if (!MaterialClass) {
    console.error(`不支持的材质类型: ${newType}`);
    return;
  }
  
  const oldMaterial = object.material;
  const newMaterial = new MaterialClass();
  
  // 迁移兼容属性
  if (oldMaterial.color) {
    newMaterial.color.copy(oldMaterial.color);
  }
  newMaterial.opacity = oldMaterial.opacity;
  newMaterial.transparent = oldMaterial.transparent;
  newMaterial.side = oldMaterial.side;
  newMaterial.wireframe = oldMaterial.wireframe;
  
  // 迁移纹理
  const textureSlots = [
    'map', 'normalMap', 'roughnessMap', 'metalnessMap',
    'emissiveMap', 'aoMap', 'displacementMap', 'alphaMap'
  ];
  for (const slot of textureSlots) {
    if (oldMaterial[slot]) {
      newMaterial[slot] = oldMaterial[slot];
    }
  }
  
  // 替换材质
  object.material = newMaterial;
  currentMaterial.value = newMaterial;
  
  // 释放旧材质（不释放纹理，因为新材质可能引用）
  oldMaterial.dispose();
  
  // 重新提取属性
  Object.assign(properties, extractMaterialProperties(newMaterial));
  
  updatePreview();
}
```

---

## 5. 材质预览渲染

### 5.1 预览场景架构

```
预览容器 (div)
  ↓
独立 WebGLRenderer (小尺寸)
  ↓
Scene
  ├── 预览几何体 (SphereGeometry / BoxGeometry)
  │     └── 当前材质
  ├── 环境光 (AmbientLight, intensity: 0.5)
  ├── 方向光 (DirectionalLight, intensity: 1.0)
  └── 方向光 (DirectionalLight, intensity: 0.3, 补光)
  ↓
PerspectiveCamera (FOV: 45, 固定位置)
  ↓
渲染循环 (requestAnimationFrame)
  └── 几何体缓慢旋转
```

### 5.2 预览实现

```javascript
let previewRenderer = null;
let previewScene = null;
let previewCamera = null;
let previewMesh = null;
let previewAnimationId = null;

function initPreview(container) {
  // 创建渲染器
  previewRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  previewRenderer.setSize(200, 200);
  previewRenderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(previewRenderer.domElement);
  
  // 创建场景
  previewScene = new THREE.Scene();
  previewScene.background = new THREE.Color(0x222222);
  
  // 创建相机
  previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  previewCamera.position.set(0, 0, 3);
  previewCamera.lookAt(0, 0, 0);
  
  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  previewScene.add(ambientLight);
  
  const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight1.position.set(2, 2, 2);
  previewScene.add(dirLight1);
  
  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
  dirLight2.position.set(-2, -1, -2);
  previewScene.add(dirLight2);
  
  // 创建预览几何体
  const geometry = new THREE.SphereGeometry(0.8, 32, 32);
  previewMesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
  previewScene.add(previewMesh);
  
  // 启动渲染循环
  startPreviewLoop();
}

function startPreviewLoop() {
  function animate() {
    previewAnimationId = requestAnimationFrame(animate);
    
    // 旋转预览几何体
    if (previewMesh) {
      previewMesh.rotation.y += 0.01;
    }
    
    previewRenderer.render(previewScene, previewCamera);
  }
  animate();
}

function updatePreview() {
  if (previewMesh && currentMaterial.value) {
    previewMesh.material = currentMaterial.value;
  }
}

function disposePreview() {
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
  }
  if (previewRenderer) {
    previewRenderer.dispose();
  }
}
```

---

## 6. 撤销集成

### 6.1 备份机制

```javascript
function backupMaterial() {
  const material = currentMaterial.value;
  if (!material) return;
  
  const backup = {
    timestamp: Date.now(),
    type: material.type,
    properties: extractMaterialProperties(material),
    textures: extractTextureReferences(material),
  };
  
  backupStack.push(backup);
  
  // 限制备份栈大小
  if (backupStack.length > 50) {
    backupStack.shift();
  }
}
```

### 6.2 恢复机制

```javascript
function restoreMaterial(backup) {
  const material = currentMaterial.value;
  const object = selectedObjects.value[0];
  if (!material || !object || !backup) return;
  
  // 如果材质类型不同，先切换类型
  if (backup.type !== material.type) {
    changeMaterialType(backup.type);
  }
  
  // 恢复属性
  const currentMaterial = object.material;
  for (const [key, value] of Object.entries(backup.properties)) {
    if (key === 'color' || key === 'emissive') {
      currentMaterial[key].copy(value);
    } else if (!key.endsWith('Map') && key !== 'map') {
      currentMaterial[key] = value;
    }
  }
  
  // 恢复纹理引用
  for (const [slot, textureRef] of Object.entries(backup.textures)) {
    if (textureRef && textureCache.has(textureRef.path)) {
      currentMaterial[slot] = textureCache.get(textureRef.path);
    }
  }
  
  currentMaterial.needsUpdate = true;
  
  // 重新提取属性到响应式状态
  Object.assign(properties, extractMaterialProperties(currentMaterial));
  
  updatePreview();
}
```

### 6.3 与撤销系统集成

```javascript
// 在 useMaterial 初始化时注册撤销回调
function initUndoIntegration(undoManager) {
  // 监听材质变更事件
  watch(() => properties, () => {
    // 自动创建撤销快照
    undoManager.registerSnapshot({
      type: 'material-change',
      backup: backupStack[backupStack.length - 1],
      restore: () => restoreMaterial(backupStack[backupStack.length - 1]),
    });
  }, { deep: true });
}
```

---

## 7. 组件技术设计

### 7.1 MaterialPropertyPane 实现

```vue
<template>
  <div class="material-property-pane">
    <!-- 材质类型选择 -->
    <el-select v-model="materialType" @change="handleTypeChange">
      <el-option
        v-for="type in materialTypes"
        :key="type.value"
        :label="type.label"
        :value="type.value"
      />
    </el-select>
    
    <!-- 材质预览 -->
    <div ref="previewContainer" class="material-preview"></div>
    
    <!-- 颜色属性 -->
    <el-form-item label="颜色">
      <el-color-picker v-model="properties.color" @change="updateColor" />
    </el-form-item>
    
    <!-- 数值属性 -->
    <el-form-item label="粗糙度">
      <el-slider v-model="properties.roughness" :min="0" :max="1" :step="0.01" />
    </el-form-item>
    
    <el-form-item label="金属度">
      <el-slider v-model="properties.metalness" :min="0" :max="1" :step="0.01" />
    </el-form-item>
    
    <!-- 纹理槽位 -->
    <TexturePropertyPane
      v-for="slot in textureSlots"
      :key="slot"
      :slot="slot"
      :texture="textures[slot]"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useMaterial } from '@/composables/useMaterial';
import TexturePropertyPane from './TexturePropertyPane.vue';

const materialManager = useMaterial();
const previewContainer = ref(null);

const materialTypes = [
  { label: '标准材质', value: 'MeshStandardMaterial' },
  { label: '基础材质', value: 'MeshBasicMaterial' },
  { label: 'Phong 材质', value: 'MeshPhongMaterial' },
  { label: 'Lambert 材质', value: 'MeshLambertMaterial' },
  { label: '物理材质', value: 'MeshPhysicalMaterial' },
  { label: '卡通材质', value: 'MeshToonMaterial' },
  { label: '法线材质', value: 'MeshNormalMaterial' },
];

const textureSlots = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap'];

onMounted(() => {
  materialManager.initPreview(previewContainer.value);
});

onUnmounted(() => {
  materialManager.disposePreview();
});
</script>
```

### 7.2 MaterialPropertyPaneAdv 实现

```vue
<template>
  <div class="material-property-pane-adv">
    <el-collapse v-model="activePanels">
      <!-- 16 个子面板 -->
      <el-collapse-item title="基础属性" name="basic">
        <BasicPropertyPanel :material="currentMaterial" />
      </el-collapse-item>
      
      <el-collapse-item title="颜色属性" name="color">
        <ColorPropertyPanel :material="currentMaterial" />
      </el-collapse-item>
      
      <el-collapse-item title="PBR 属性" name="pbr">
        <PbrPropertyPanel :material="currentMaterial" />
      </el-collapse-item>
      
      <!-- ... 其他 13 个子面板 -->
      
      <el-collapse-item
        v-if="currentMaterial?.type === 'MeshPhysicalMaterial'"
        title="物理扩展"
        name="physical"
      >
        <PhysicalPropertyPanel :material="currentMaterial" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMaterial } from '@/composables/useMaterial';
import BasicPropertyPanel from './adv/BasicPropertyPanel.vue';
import ColorPropertyPanel from './adv/ColorPropertyPanel.vue';
import PbrPropertyPanel from './adv/PbrPropertyPanel.vue';
// ... 其他子面板导入

const materialManager = useMaterial();
const activePanels = ref(['basic', 'color', 'pbr']);
</script>
```

### 7.3 TexturePropertyPane 实现

```vue
<template>
  <div class="texture-property-pane">
    <div class="texture-header">
      <span class="texture-label">{{ slotLabel }}</span>
      <el-button size="small" @click="openFileChooser">选择</el-button>
      <el-button size="small" @click="removeTexture" :disabled="!texture">移除</el-button>
    </div>
    
    <div v-if="texture" class="texture-preview">
      <img :src="textureUrl" alt="纹理预览" />
    </div>
    
    <!-- 纹理属性编辑 -->
    <div v-if="texture" class="texture-properties">
      <el-form-item label="偏移">
        <el-input-number v-model="transform.offset.x" size="small" :step="0.1" />
        <el-input-number v-model="transform.offset.y" size="small" :step="0.1" />
      </el-form-item>
      
      <el-form-item label="重复">
        <el-input-number v-model="transform.repeat.x" size="small" :step="0.1" :min="0.1" />
        <el-input-number v-model="transform.repeat.y" size="small" :step="0.1" :min="0.1" />
      </el-form-item>
      
      <el-form-item label="旋转">
        <el-slider v-model="transform.rotation" :min="0" :max="360" :step="1" />
      </el-form-item>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMaterial } from '@/composables/useMaterial';

const props = defineProps({
  slot: String,
  texture: Object,
});

const materialManager = useMaterial();
const transform = ref({
  offset: { x: 0, y: 0 },
  repeat: { x: 1, y: 1 },
  rotation: 0,
  center: { x: 0.5, y: 0.5 },
});

const slotLabel = computed(() => {
  const labels = {
    map: '漫反射',
    normalMap: '法线',
    roughnessMap: '粗糙度',
    metalnessMap: '金属度',
    emissiveMap: '自发光',
    aoMap: '环境光遮蔽',
    displacementMap: '置换',
    alphaMap: '透明度',
  };
  return labels[props.slot] || props.slot;
});

function openFileChooser() {
  // 打开 VFS 文件选择器
}

function removeTexture() {
  materialManager.removeTexture(props.slot);
}

watch(() => props.texture, (newTexture) => {
  if (newTexture) {
    transform.value.offset = { ...newTexture.offset };
    transform.value.repeat = { ...newTexture.repeat };
    transform.value.rotation = newTexture.rotation;
    transform.value.center = { ...newTexture.center };
  }
});
</script>
```

---

## 8. 性能优化

### 8.1 纹理缓存策略

```javascript
const textureCache = new Map();
const MAX_CACHE_SIZE = 100;

function cacheTexture(path, texture) {
  if (textureCache.size >= MAX_CACHE_SIZE) {
    // LRU 淘汰: 删除最早的缓存
    const firstKey = textureCache.keys().next().value;
    const oldTexture = textureCache.get(firstKey);
    oldTexture.dispose();
    textureCache.delete(firstKey);
  }
  
  textureCache.set(path, texture);
}
```

### 8.2 预览渲染优化

```javascript
// 按需渲染预览，而非持续渲染
let previewNeedsRender = false;

function markPreviewDirty() {
  previewNeedsRender = true;
}

function renderPreviewIfNeeded() {
  if (previewNeedsRender) {
    previewRenderer.render(previewScene, previewCamera);
    previewNeedsRender = false;
  }
}
```

### 8.3 材质更新节流

```javascript
import { throttle } from 'lodash';

// 材质属性变更节流，避免频繁触发
const throttledUpdate = throttle((key, value) => {
  updateMaterialProperty(key, value);
}, 50);
```

---

## 9. 错误处理

### 9.1 纹理加载错误

```javascript
async function setTexture(slot, vfsPath) {
  try {
    const fileUrl = await vfsService.getFileUrl(vfsPath);
    
    const texture = await new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(fileUrl, resolve, undefined, reject);
    });
    
    // ... 成功处理
  } catch (error) {
    console.error(`纹理加载失败 [${slot}]: ${vfsPath}`, error);
    // 显示错误提示
    ElMessage.error(`纹理加载失败: ${vfsPath}`);
  }
}
```

### 9.2 材质类型切换错误

```javascript
function changeMaterialType(newType) {
  const MaterialClass = THREE[newType];
  if (!MaterialClass) {
    ElMessage.error(`不支持的材质类型: ${newType}`);
    return;
  }
  
  try {
    // ... 切换逻辑
  } catch (error) {
    console.error(`材质类型切换失败: ${newType}`, error);
    ElMessage.error('材质切换失败');
  }
}
```

---

## 10. 测试策略

### 10.1 单元测试

```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import { useMaterial } from '@/composables/useMaterial';

describe('useMaterial', () => {
  beforeEach(() => {
    // 重置单例
    // ...
  });
  
  test('颜色归一化', () => {
    const materialManager = useMaterial();
    
    // 十六进制字符串
    const color1 = materialManager.normalizeColor('#ff0000');
    expect(color1.getHexString()).toBe('ff0000');
    
    // 十六进制数字
    const color2 = materialManager.normalizeColor(0x00ff00);
    expect(color2.getHexString()).toBe('00ff00');
    
    // RGB 对象
    const color3 = materialManager.normalizeColor({ r: 0, g: 0, b: 1 });
    expect(color3.getHexString()).toBe('0000ff');
  });
  
  test('材质备份与恢复', () => {
    const materialManager = useMaterial();
    
    // 设置初始材质
    // ...
    
    // 备份
    materialManager.backupMaterial();
    
    // 修改
    materialManager.updateMaterialProperty('roughness', 0.9);
    
    // 恢复
    const backup = materialManager.backupStack.pop();
    materialManager.restoreMaterial(backup);
    
    // 验证恢复
    expect(materialManager.properties.roughness).toBe(0.4);
  });
});
```

### 10.2 组件测试

```javascript
import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import MaterialPropertyPane from '@/components/property/MaterialPropertyPane.vue';

describe('MaterialPropertyPane', () => {
  test('渲染材质类型选择器', () => {
    const wrapper = mount(MaterialPropertyPane);
    const select = wrapper.find('.el-select');
    expect(select.exists()).toBe(true);
  });
  
  test('显示材质预览', () => {
    const wrapper = mount(MaterialPropertyPane);
    const preview = wrapper.find('.material-preview');
    expect(preview.exists()).toBe(true);
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
    "vue": "^3.5.17",
    "element-plus": "^2.10.5",
    "lodash": "^4.17.21"
  }
}
```

### 11.2 内部依赖

```
useMaterial → useThreeViewer
useMaterial → useObjectSelection
MaterialPropertyPane → useMaterial
MaterialPropertyPaneAdv → useMaterial
TexturePropertyPane → useMaterial
MaterialSelectPropertyItem → useMaterial
VfsMaterialChooserDialog → vfs-service
```

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [006-VFS 虚拟文件系统](../006-vfs/plan.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
