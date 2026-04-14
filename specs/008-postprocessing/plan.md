# 008-Postprocessing 后处理模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

后处理模块是 Three Editor by AI 的渲染增强层，基于 Three.js 的 EffectComposer 体系实现。通过可配置的 Pass 链路，在基础渲染之上叠加辉光、抗锯齿等视觉效果。

### 1.2 技术约束

- 必须使用 Three.js r182+ 的 postprocessing 模块
- 必须与 ThreeViewer.js 的渲染循环集成
- 必须支持运行时动态添加/移除 Pass
- 必须在窗口 resize 时自动更新分辨率
- 后处理配置不随场景数据序列化

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 合成器 | EffectComposer | Three.js 官方后处理框架 |
| 辉光效果 | UnrealBloomPass | 高质量 HDR 辉光，参数丰富 |
| 抗锯齿 | FXAAShaderPass + ShaderPass | 快速近似抗锯齿，性能好 |
| Pass 管理 | 数组 + composer.passes 双管理 | 统一 API 与底层兼容 |
| 配置存储 | useEditorConfig + localStorage | 与现有配置体系一致 |

---

## 2. ThreeViewer 后处理技术设计

### 2.1 类结构扩展

ThreeViewer.js 中后处理相关的属性和方法:

```javascript
class ThreeViewer {
  // 后处理属性
  composer: EffectComposer | null        // 后处理合成器
  passes: Pass[]                          // Pass 管理数组
  
  // 后处理方法
  initComposer(): void                    // 初始化合成器
  addPass(pass: Pass, index?: number): void  // 添加 Pass
  removePass(pass: Pass): void            // 移除 Pass
  setPassParams(pass: Pass, params: Object): void  // 设置 Pass 参数
  
  // 已有方法扩展
  handleResize(): void                    // 扩展: 更新合成器尺寸
  renderLoop(): void                      // 扩展: 使用 composer.render()
  dispose(): void                         // 扩展: 清理后处理资源
}
```

### 2.2 初始化流程

```
ThreeViewer.init()
    ↓
createScene()          // 创建场景
    ↓
createRenderer()       // 创建渲染器
    ↓
createCamera()         // 创建相机
    ↓
setupLights()          // 设置灯光
    ↓
setupGrid()            // 设置辅助线
    ↓
initComposer()         // 初始化后处理合成器
    ↓
startRender()          // 启动渲染循环
```

### 2.3 initComposer() 实现

```javascript
// src/core/ThreeViewer.js

initComposer() {
  if (this.renderer && this.scene && this.camera) {
    // 创建 EffectComposer
    this.composer = new EffectComposer(this.renderer);
    
    // 创建并添加 RenderPass（必须，始终首位）
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    // 初始化 Pass 管理数组
    this.passes = [renderPass];
  }
}
```

**关键点**:
- 仅在 renderer、scene、camera 都存在时初始化
- RenderPass 始终作为第一个 Pass 添加
- passes 数组初始包含 RenderPass

---

### 2.4 渲染循环集成

```javascript
// src/core/ThreeViewer.js - renderLoop()

renderLoop() {
  this.renderLoopObj = requestAnimationFrame(() => this.renderLoop());
  
  // ... FPS 计算、动画更新、控制器更新 ...
  
  this.emit('before-render', { delta, now });
  
  // 渲染场景: 优先使用合成器
  if (this.composer) {
    this.composer.render();
  } else if (this.renderer && this.scene && this.camera) {
    this.renderer.render(this.scene, this.camera);
  }
  
  this.state.frameCount++;
}
```

**关键点**:
- composer 存在时使用 composer.render()
- composer 不存在时回退到 renderer.render()
- 无需修改渲染循环结构

---

### 2.5 Pass 管理实现

#### 2.5.1 addPass() 方法

```javascript
// src/core/ThreeViewer.js

/**
 * 添加 Pass 到后处理链路
 * @param {Pass} pass - 要添加的 Pass 实例
 * @param {number} [index] - 插入位置（可选）
 */
addPass(pass, index) {
  if (!this.composer) return;
  
  if (typeof index === 'number' && index >= 0 && index < this.composer.passes.length) {
    // 插入到指定位置
    this.composer.passes.splice(index, 0, pass);
    this.composer.addPass(pass);
    this.passes.splice(index, 0, pass);
  } else {
    // 添加到末尾
    this.composer.addPass(pass);
    this.passes.push(pass);
  }
}
```

#### 2.5.2 removePass() 方法

```javascript
// src/core/ThreeViewer.js

/**
 * 从后处理链路移除 Pass
 * @param {Pass} pass - 要移除的 Pass 实例
 */
removePass(pass) {
  if (!this.composer) return;
  
  const idx = this.composer.passes.indexOf(pass);
  if (idx > -1) {
    this.composer.passes.splice(idx, 1);
    this.passes.splice(idx, 1);
  }
}
```

#### 2.5.3 setPassParams() 方法

```javascript
// src/core/ThreeViewer.js

/**
 * 设置 Pass 参数
 * @param {Pass} pass - Pass 实例
 * @param {Object} params - 参数键值对
 */
setPassParams(pass, params) {
  if (!pass || !params) return;
  
  Object.entries(params).forEach(([key, value]) => {
    if (key in pass) {
      pass[key] = value;
    }
  });
}
```

---

### 2.6 handleResize() 扩展

```javascript
// src/core/ThreeViewer.js

handleResize() {
  if (!this.container || !this.renderer || !this.camera) return;
  
  const width = this.container.clientWidth;
  const height = this.container.clientHeight;
  
  // 更新相机
  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();
  
  // 更新渲染器
  this.renderer.setSize(width, height);
  
  // 更新合成器
  if (this.composer) {
    this.composer.setSize(width, height);
  }
  
  // 更新 FXAA Pass 分辨率（如果存在）
  this.updateFXAAResolution(width, height);
}

/**
 * 更新 FXAA Pass 的分辨率 uniform
 * @param {number} width - 渲染宽度
 * @param {number} height - 渲染高度
 */
updateFXAAResolution(width, height) {
  if (!this.composer) return;
  
  for (const pass of this.composer.passes) {
    // 检测是否为 FXAA Pass
    if (pass.material && 
        pass.material.uniforms && 
        pass.material.uniforms['resolution']) {
      pass.material.uniforms['resolution'].value.set(
        1.0 / width,
        1.0 / height
      );
    }
  }
}
```

---

## 3. UnrealBloomPass 技术实现

### 3.1 导入语句

```javascript
// src/core/ThreeViewer.js

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
```

### 3.2 Bloom Pass 创建

```javascript
/**
 * 创建辉光 Pass
 * @param {number} width - 渲染宽度
 * @param {number} height - 渲染高度
 * @param {Object} [options] - 可选参数
 * @returns {UnrealBloomPass}
 */
createBloomPass(width, height, options = {}) {
  const {
    strength = 1.0,
    radius = 0.4,
    threshold = 0.85
  } = options;
  
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    strength,
    radius,
    threshold
  );
  
  // 默认禁用
  bloomPass.enabled = false;
  
  return bloomPass;
}
```

### 3.3 Bloom 参数动态更新

```javascript
/**
 * 更新辉光参数
 * @param {Object} params - 参数对象
 */
setBloomParams(params) {
  const bloomPass = this.getBloomPass();
  if (!bloomPass) return;
  
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

/**
 * 获取 Bloom Pass 实例
 * @returns {UnrealBloomPass|null}
 */
getBloomPass() {
  if (!this.composer) return null;
  
  for (const pass of this.composer.passes) {
    if (pass instanceof UnrealBloomPass) {
      return pass;
    }
  }
  return null;
}
```

### 3.4 Bloom 启用/禁用

```javascript
/**
 * 设置辉光启用状态
 * @param {boolean} enabled - 是否启用
 */
setBloomEnabled(enabled) {
  const bloomPass = this.getBloomPass();
  if (bloomPass) {
    bloomPass.enabled = enabled;
  }
}

/**
 * 获取辉光启用状态
 * @returns {boolean}
 */
getBloomEnabled() {
  const bloomPass = this.getBloomPass();
  return bloomPass ? bloomPass.enabled : false;
}
```

---

## 4. FXAAShaderPass 技术实现

### 4.1 FXAA Pass 创建

```javascript
/**
 * 创建 FXAA 抗锯齿 Pass
 * @param {number} width - 渲染宽度
 * @param {number} height - 渲染高度
 * @returns {ShaderPass}
 */
createFXAAPass(width, height) {
  const fxaaPass = new ShaderPass(FXAAShader);
  
  // 设置分辨率 uniform
  fxaaPass.material.uniforms['resolution'].value.set(
    1.0 / width,
    1.0 / height
  );
  
  // 默认禁用
  fxaaPass.enabled = false;
  
  return fxaaPass;
}
```

### 4.2 FXAA 分辨率更新

```javascript
/**
 * 更新 FXAA Pass 的分辨率
 * @param {number} width - 渲染宽度
 * @param {number} height - 渲染高度
 */
updateFXAAResolution(width, height) {
  const fxaaPass = this.getFXAAPass();
  if (!fxaaPass) return;
  
  fxaaPass.material.uniforms['resolution'].value.set(
    1.0 / width,
    1.0 / height
  );
}

/**
 * 获取 FXAA Pass 实例
 * @returns {ShaderPass|null}
 */
getFXAAPass() {
  if (!this.composer) return null;
  
  for (const pass of this.composer.passes) {
    if (pass.material && 
        pass.material.uniforms && 
        pass.material.uniforms['resolution']) {
      return pass;
    }
  }
  return null;
}
```

### 4.3 FXAA 启用/禁用

```javascript
/**
 * 设置 FXAA 启用状态
 * @param {boolean} enabled - 是否启用
 */
setFXAAEnabled(enabled) {
  const fxaaPass = this.getFXAAPass();
  if (fxaaPass) {
    fxaaPass.enabled = enabled;
  }
}

/**
 * 获取 FXAA 启用状态
 * @returns {boolean}
 */
getFXAAEnabled() {
  const fxaaPass = this.getFXAAPass();
  return fxaaPass ? fxaaPass.enabled : false;
}
```

---

## 5. useEditorConfig 扩展

### 5.1 配置项定义

在 `src/composables/useEditorConfig.js` 中添加后处理配置:

```javascript
// src/composables/useEditorConfig.js

const defaultConfig = {
  // ... 现有配置 ...
  
  // 后处理配置
  bloomEnabled: false,
  bloomStrength: 1.0,
  bloomRadius: 0.4,
  bloomThreshold: 0.85,
  fxaaEnabled: false
};
```

### 5.2 配置操作方法

```javascript
// src/composables/useEditorConfig.js

/**
 * 设置后处理配置
 * @param {Object} params - 后处理参数
 */
function setPostProcessingConfig(params) {
  if (typeof params.bloomEnabled === 'boolean') {
    editorConfig.bloomEnabled = params.bloomEnabled;
  }
  if (typeof params.bloomStrength === 'number') {
    editorConfig.bloomStrength = params.bloomStrength;
  }
  if (typeof params.bloomRadius === 'number') {
    editorConfig.bloomRadius = params.bloomRadius;
  }
  if (typeof params.bloomThreshold === 'number') {
    editorConfig.bloomThreshold = params.bloomThreshold;
  }
  if (typeof params.fxaaEnabled === 'boolean') {
    editorConfig.fxaaEnabled = params.fxaaEnabled;
  }
  saveConfigToLocalStorage();
}

export function useEditorConfig() {
  return {
    // ... 现有导出 ...
    setPostProcessingConfig
  };
}
```

### 5.3 ThreeViewer 监听配置变化

在 ThreeViewer 构造函数中，扩展 watch 监听:

```javascript
// src/core/ThreeViewer.js

constructor(options) {
  // ... 现有初始化 ...
  
  const { editorConfig } = useEditorConfig();
  watch(
    editorConfig,
    (cfg) => {
      // ... 现有逻辑 ...
      
      // 后处理配置变更
      this.applyPostProcessingConfig(cfg);
    },
    { deep: true }
  );
}

/**
 * 应用后处理配置
 * @param {Object} config - 编辑器配置
 */
applyPostProcessingConfig(config) {
  if (!this.composer) return;
  
  // 辉光配置
  const bloomPass = this.getBloomPass();
  if (bloomPass) {
    bloomPass.enabled = config.bloomEnabled;
    this.setPassParams(bloomPass, {
      strength: config.bloomStrength,
      radius: config.bloomRadius,
      threshold: config.bloomThreshold
    });
  }
  
  // FXAA 配置
  const fxaaPass = this.getFXAAPass();
  if (fxaaPass) {
    fxaaPass.enabled = config.fxaaEnabled;
  }
}
```

---

## 6. UI 组件集成

### 6.1 Toolbar.vue 视图菜单

在 `src/components/editor/Toolbar.vue` 中添加后处理切换:

```vue
<!-- src/components/editor/Toolbar.vue -->

<template>
  <el-dropdown-menu>
    <!-- 现有菜单项 -->
    
    <el-dropdown-item divided>
      <el-checkbox v-model="bloomEnabled" @change="toggleBloom">
        启用辉光
      </el-checkbox>
    </el-dropdown-item>
    
    <el-dropdown-item>
      <el-checkbox v-model="fxaaEnabled" @change="toggleFXAA">
        启用抗锯齿
      </el-checkbox>
    </el-dropdown-item>
  </el-dropdown-menu>
</template>

<script setup>
import { computed } from 'vue';
import { useEditorConfig } from '../../composables/useEditorConfig.js';
import { useThreeViewer } from '../../composables/useThreeViewer.js';

const { editorConfig, setPostProcessingConfig } = useEditorConfig();
const { threeViewer } = useThreeViewer();

const bloomEnabled = computed({
  get: () => editorConfig.bloomEnabled,
  set: (val) => setPostProcessingConfig({ bloomEnabled: val })
});

const fxaaEnabled = computed({
  get: () => editorConfig.fxaaEnabled,
  set: (val) => setPostProcessingConfig({ fxaaEnabled: val })
});

function toggleBloom(enabled) {
  setPostProcessingConfig({ bloomEnabled: enabled });
}

function toggleFXAA(enabled) {
  setPostProcessingConfig({ fxaaEnabled: enabled });
}
</script>
```

### 6.2 EditorConfigDialog.vue 后处理参数

在 `src/components/dialog/EditorConfigDialog.vue` 中添加后处理参数调节:

```vue
<!-- src/components/dialog/EditorConfigDialog.vue -->

<template>
  <el-dialog title="编辑器配置">
    <el-tabs>
      <!-- 现有标签页 -->
      
      <el-tab-pane label="后处理">
        <el-form label-width="100px">
          <el-form-item label="启用辉光">
            <el-switch v-model="bloomEnabled" />
          </el-form-item>
          
          <el-form-item label="辉光强度">
            <el-slider
              v-model="bloomStrength"
              :min="0"
              :max="3"
              :step="0.1"
              :disabled="!bloomEnabled"
            />
          </el-form-item>
          
          <el-form-item label="辉光半径">
            <el-slider
              v-model="bloomRadius"
              :min="0"
              :max="1"
              :step="0.05"
              :disabled="!bloomEnabled"
            />
          </el-form-item>
          
          <el-form-item label="辉光阈值">
            <el-slider
              v-model="bloomThreshold"
              :min="0"
              :max="1"
              :step="0.05"
              :disabled="!bloomEnabled"
            />
          </el-form-item>
          
          <el-divider />
          
          <el-form-item label="启用抗锯齿">
            <el-switch v-model="fxaaEnabled" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue';
import { useEditorConfig } from '../../composables/useEditorConfig.js';

const { editorConfig, setPostProcessingConfig } = useEditorConfig();

const bloomEnabled = computed({
  get: () => editorConfig.bloomEnabled,
  set: (val) => setPostProcessingConfig({ bloomEnabled: val })
});

const bloomStrength = computed({
  get: () => editorConfig.bloomStrength,
  set: (val) => setPostProcessingConfig({ bloomStrength: val })
});

const bloomRadius = computed({
  get: () => editorConfig.bloomRadius,
  set: (val) => setPostProcessingConfig({ bloomRadius: val })
});

const bloomThreshold = computed({
  get: () => editorConfig.bloomThreshold,
  set: (val) => setPostProcessingConfig({ bloomThreshold: val })
});

const fxaaEnabled = computed({
  get: () => editorConfig.fxaaEnabled,
  set: (val) => setPostProcessingConfig({ fxaaEnabled: val })
});
</script>
```

---

## 7. 完整初始化流程

### 7.1 启动序列

```
应用启动
    ↓
useEditorConfig() 加载 localStorage 配置
    ↓
ThreeViewer 构造函数执行
    ↓
ThreeViewer.init()
    ├── createScene()
    ├── createRenderer()
    ├── createCamera()
    ├── setupLights()
    ├── setupGrid()
    └── initComposer()
         ├── new EffectComposer(renderer)
         ├── new RenderPass(scene, camera)
         └── composer.addPass(renderPass)
    ↓
ThreeViewer.setContainer(container)
    ├── container.appendChild(renderer.domElement)
    ├── setupControls()
    └── handleResize()
    ↓
ThreeViewer.startRender()
    └── renderLoop() 启动
         └── composer.render() 每帧执行
```

### 7.2 Pass 添加序列

```
用户启用辉光
    ↓
Toolbar.vue toggleBloom(true)
    ↓
setPostProcessingConfig({ bloomEnabled: true })
    ↓
localStorage 保存配置
    ↓
useEditorConfig watch 触发
    ↓
ThreeViewer.applyPostProcessingConfig()
    ├── 检查是否存在 Bloom Pass
    │    ├── 存在: 设置 enabled = true
    │    └── 不存在: 创建并添加 Bloom Pass
    └── 应用参数 (strength, radius, threshold)
```

---

## 8. dispose() 清理实现

```javascript
// src/core/ThreeViewer.js

dispose() {
  this.stopRender();
  
  if (this.container && this.resizeHandler) {
    window.removeEventListener('resize', this.resizeHandler);
  }
  
  if (this.controls) {
    this.controls.dispose();
    this.controls = null;
  }
  
  this.clearScene();
  
  // 清理后处理资源
  if (this.composer) {
    // 清理所有 Pass
    for (const pass of this.composer.passes) {
      if (pass.dispose) {
        pass.dispose();
      }
    }
    
    this.composer.dispose();
    this.composer = null;
    this.passes = [];
  }
  
  if (this.renderer) {
    this.renderer.dispose();
  }
}
```

---

## 9. 错误处理

### 9.1 初始化错误处理

```javascript
// src/core/ThreeViewer.js

initComposer() {
  if (!this.renderer) {
    console.warn('ThreeViewer: 渲染器未初始化，跳过后处理初始化');
    return;
  }
  if (!this.scene) {
    console.warn('ThreeViewer: 场景未创建，跳过后处理初始化');
    return;
  }
  if (!this.camera) {
    console.warn('ThreeViewer: 相机未创建，跳过后处理初始化');
    return;
  }
  
  try {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.passes = [renderPass];
  } catch (error) {
    console.error('ThreeViewer: 后处理初始化失败', error);
    this.composer = null;
    this.passes = [];
  }
}
```

### 9.2 渲染错误处理

```javascript
// src/core/ThreeViewer.js - renderLoop()

renderLoop() {
  this.renderLoopObj = requestAnimationFrame(() => this.renderLoop());
  
  // ... 更新逻辑 ...
  
  try {
    if (this.composer) {
      this.composer.render();
    } else if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  } catch (error) {
    console.error('ThreeViewer: 渲染失败', error);
    // 降级到基础渲染
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
```

---

## 10. 性能优化

### 10.1 按需创建 Pass

```javascript
// 延迟创建 Pass，仅在首次启用时创建
getOrCreateBloomPass() {
  let bloomPass = this.getBloomPass();
  
  if (!bloomPass) {
    const { editorConfig } = useEditorConfig();
    const width = this.renderer.domElement.width;
    const height = this.renderer.domElement.height;
    
    bloomPass = this.createBloomPass(width, height, {
      strength: editorConfig.bloomStrength,
      radius: editorConfig.bloomRadius,
      threshold: editorConfig.bloomThreshold
    });
    
    // 插入到 RenderPass 之后、FXAA 之前
    const fxaaIndex = this.getFXAAPassIndex();
    this.addPass(bloomPass, fxaaIndex > -1 ? fxaaIndex : this.passes.length);
  }
  
  return bloomPass;
}

getFXAAPassIndex() {
  if (!this.composer) return -1;
  
  for (let i = 0; i < this.composer.passes.length; i++) {
    const pass = this.composer.passes[i];
    if (pass.material && 
        pass.material.uniforms && 
        pass.material.uniforms['resolution']) {
      return i;
    }
  }
  return -1;
}
```

### 10.2 Resize 防抖

```javascript
// src/core/ThreeViewer.js

constructor(options) {
  // ...
  this.resizeTimer = null;
  this.resizeHandler = this.handleResize.bind(this);
}

handleResize() {
  if (!this.container || !this.renderer || !this.camera) return;
  
  // 防抖处理
  if (this.resizeTimer) {
    clearTimeout(this.resizeTimer);
  }
  
  this.resizeTimer = setTimeout(() => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    
    this.updateFXAAResolution(width, height);
    this.updateBloomResolution(width, height);
    
    this.resizeTimer = null;
  }, 100);
}
```

---

## 11. 依赖关系

### 11.1 NPM 依赖

```json
{
  "dependencies": {
    "three": "^0.182.0"
  }
}
```

后处理模块使用 Three.js 内置的 examples/jsm 模块，无需额外依赖。

### 11.2 内部依赖

```
ThreeViewer.js
├── EffectComposer (three/examples/jsm/postprocessing/)
├── RenderPass (three/examples/jsm/postprocessing/)
├── UnrealBloomPass (three/examples/jsm/postprocessing/)
├── ShaderPass (three/examples/jsm/postprocessing/)
├── FXAAShader (three/examples/jsm/shaders/)
├── useEditorConfig.js (后处理配置)
├── Toolbar.vue (快速切换)
└── EditorConfigDialog.vue (参数调节)
```

### 11.3 文件清单

| 文件 | 职责 | 状态 |
|------|------|------|
| `src/core/ThreeViewer.js` | 后处理核心实现 | 已有基础，需扩展 |
| `src/composables/useEditorConfig.js` | 后处理配置管理 | 需扩展 |
| `src/components/editor/Toolbar.vue` | 后处理快速切换 | 需新增 |
| `src/components/dialog/EditorConfigDialog.vue` | 后处理参数调节 | 需扩展 |

---

## 12. 测试策略

### 12.1 单元测试

```javascript
// tests/unit/postprocessing.test.js

import { describe, test, expect, beforeEach } from 'vitest';
import ThreeViewer from '../../src/core/ThreeViewer.js';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

describe('ThreeViewer Postprocessing', () => {
  let viewer;
  let container;
  
  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);
    
    viewer = new ThreeViewer({});
    viewer.setContainer(container);
  });
  
  test('合成器初始化', () => {
    expect(viewer.composer).toBeDefined();
    expect(viewer.passes).toHaveLength(1);
    expect(viewer.passes[0].type).toBe('RenderPass');
  });
  
  test('添加 Pass', () => {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(800, 600),
      1.0, 0.4, 0.85
    );
    
    viewer.addPass(bloomPass);
    expect(viewer.passes).toHaveLength(2);
    expect(viewer.composer.passes).toHaveLength(2);
  });
  
  test('移除 Pass', () => {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(800, 600),
      1.0, 0.4, 0.85
    );
    
    viewer.addPass(bloomPass);
    viewer.removePass(bloomPass);
    expect(viewer.passes).toHaveLength(1);
  });
  
  test('设置 Pass 参数', () => {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(800, 600),
      1.0, 0.4, 0.85
    );
    
    viewer.addPass(bloomPass);
    viewer.setPassParams(bloomPass, {
      strength: 2.0,
      radius: 0.6,
      threshold: 0.5
    });
    
    expect(bloomPass.strength).toBe(2.0);
    expect(bloomPass.radius).toBe(0.6);
    expect(bloomPass.threshold).toBe(0.5);
  });
  
  test('窗口 resize 更新合成器尺寸', () => {
    container.style.width = '1024px';
    container.style.height = '768px';
    viewer.handleResize();
    
    expect(viewer.composer.width).toBe(1024);
    expect(viewer.composer.height).toBe(768);
  });
});
```

### 12.2 集成测试

```javascript
// tests/integration/postprocessing.test.js

import { describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('Postprocessing Integration', () => {
  test('完整后处理链路渲染', async () => {
    // 1. 初始化 ThreeViewer
    // 2. 添加 Bloom Pass
    // 3. 添加 FXAA Pass
    // 4. 启用所有 Pass
    // 5. 渲染一帧
    // 6. 验证无错误
  });
  
  test('配置变更实时更新', async () => {
    // 1. 初始化 ThreeViewer
    // 2. 修改 editorConfig.bloomStrength
    // 3. 验证 Bloom Pass strength 已更新
  });
  
  test('场景导入导出不影响后处理', async () => {
    // 1. 初始化 ThreeViewer
    // 2. 启用 Bloom
    // 3. 导出场景
    // 4. 清空场景
    // 5. 导入场景
    // 6. 验证 Bloom 仍然启用
  });
});
```

---

## 13. 实施计划

### 13.1 阶段一: 基础架构（已完成）

- [x] ThreeViewer.js 中 initComposer() 实现
- [x] ThreeViewer.js 中 addPass() / removePass() 实现
- [x] ThreeViewer.js 中 setPassParams() 实现
- [x] renderLoop() 中 composer.render() 集成
- [x] handleResize() 中 composer.setSize() 集成

### 13.2 阶段二: Pass 实现（待实施）

- [ ] ThreeViewer.js 中添加 UnrealBloomPass 导入
- [ ] ThreeViewer.js 中添加 FXAAShaderPass 导入
- [ ] 实现 createBloomPass() 方法
- [ ] 实现 createFXAAPass() 方法
- [ ] 实现 getBloomPass() / getFXAAPass() 方法
- [ ] 实现 setBloomEnabled() / setFXAAEnabled() 方法
- [ ] 实现 updateFXAAResolution() 方法

### 13.3 阶段三: 配置集成（待实施）

- [ ] useEditorConfig.js 添加后处理配置项
- [ ] useEditorConfig.js 添加 setPostProcessingConfig() 方法
- [ ] ThreeViewer.js watch 中扩展后处理配置监听
- [ ] 实现 applyPostProcessingConfig() 方法

### 13.4 阶段四: UI 集成（待实施）

- [ ] Toolbar.vue 添加后处理切换菜单项
- [ ] EditorConfigDialog.vue 添加后处理参数标签页
- [ ] 辉光强度/半径/阈值滑块组件
- [ ] 抗锯齿启用/禁用开关

### 13.5 阶段五: 优化与测试（待实施）

- [ ] Resize 防抖处理
- [ ] Pass 延迟创建优化
- [ ] dispose() 资源清理完善
- [ ] 错误处理完善
- [ ] 单元测试编写
- [ ] 集成测试编写

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
