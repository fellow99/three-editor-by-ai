# 008-Postprocessing 后处理模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

后处理模块集成 Three.js EffectComposer，提供 Bloom、FXAA 等多种后处理效果的统一管理和动态配置。

### 1.2 模块职责

- **EffectComposer**: 后处理合成器
- **Pass 管理**: 添加、移除、启用/禁用 Pass
- **效果配置**: Bloom、FXAA 等参数调节
- **性能优化**: 按需启用后处理

---

## 2. 支持的后处理效果

### 2.1 Bloom（发光）

**用途**: 高亮区域发光效果  
**参数**:
- threshold: 发光阈值 (0-1)
- strength: 发光强度
- radius: 发光半径

### 2.2 FXAA（抗锯齿）

**用途**: 快速近似抗锯齿  
**特点**: 性能友好，适合实时渲染

### 2.3 未来支持

- SSAO - 屏幕空间环境光遮蔽
- DOF - 景深效果
- Motion Blur - 运动模糊

---

## 3. ThreeViewer 后处理集成

### 3.1 EffectComposer 初始化

```javascript
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

// 初始化
this.composer = new EffectComposer(this.renderer);

// 添加渲染 Pass
const renderPass = new RenderPass(this.scene, this.camera);
this.composer.addPass(renderPass);

// 添加 Bloom Pass
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,  // strength
  0.4,  // radius
  0.85  // threshold
);
this.composer.addPass(bloomPass);

// 添加 FXAA Pass
const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.material.uniforms['resolution'].value.set(
  1 / window.innerWidth,
  1 / window.innerHeight
);
this.composer.addPass(fxaaPass);
```

### 3.2 渲染循环

```javascript
animate() {
  requestAnimationFrame(() => this.animate());
  
  // 更新动画
  this.driveAnimations();
  
  // 后处理渲染
  this.composer.render();
}
```

### 3.3 Pass 管理

```javascript
// 添加 Pass
function addPass(name, pass) {
  this.passes.push({ name, pass });
  this.composer.addPass(pass);
}

// 启用/禁用 Pass
function setPassEnabled(name, enabled) {
  const pass = this.passes.find(p => p.name === name);
  if (pass) {
    pass.pass.enabled = enabled;
  }
}

// 移除 Pass
function removePass(name) {
  const index = this.passes.findIndex(p => p.name === name);
  if (index >= 0) {
    const pass = this.passes[index].pass;
    this.composer.removePass(pass);
    this.passes.splice(index, 1);
  }
}
```

---

## 4. API 接口

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `addPass(name, pass)` | name: string, pass: Pass | void | 添加 Pass |
| `removePass(name)` | name: string | void | 移除 Pass |
| `setPassEnabled(name, enabled)` | name: string, enabled: boolean | void | 启用/禁用 |
| `setBloomParams(params)` | params: Object | void | 设置 Bloom 参数 |
| `toggleBloom(enabled)` | enabled: boolean | void | 切换 Bloom |
| `toggleFXAA(enabled)` | enabled: boolean | void | 切换 FXAA |

---

## 5. 使用示例

```javascript
// 启用 Bloom
threeViewer.setPassEnabled('bloom', true);

// 调整 Bloom 参数
threeViewer.setBloomParams({
  strength: 2.0,
  radius: 0.5,
  threshold: 0.7
});

// 禁用 FXAA
threeViewer.toggleFXAA(false);
```

---

**版本**: 1.0 | **日期**: 2026-04-07
