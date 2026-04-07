# 008-Postprocessing 后处理模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

后处理模块集成 Three.js EffectComposer，提供 Bloom、FXAA 等多种后处理效果。

### 1.2 技术约束

- 必须使用 EffectComposer
- 必须支持多 Pass 管理
- 必须支持动态启用/禁用

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 合成器 | EffectComposer | Three.js 标准 |
| Pass 管理 | 数组存储 | 简单直观 |
| 分辨率 | 自适应 | 匹配渲染器 |

---

## 2. EffectComposer 实现

### 2.1 初始化

```javascript
initPostProcessing() {
  const { width, height } = this.renderer.getSize(new THREE.Vector2());
  
  // 创建合成器
  this.composer = new EffectComposer(this.renderer);
  
  // 1. 渲染 Pass（必须）
  const renderPass = new RenderPass(this.scene, this.camera);
  this.composer.addPass(renderPass);
  
  // 2. Bloom Pass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.5,  // strength
    0.4,  // radius
    0.85  // threshold
  );
  bloomPass.enabled = false;
  this.composer.addPass(bloomPass);
  this.passes.push({
    name: 'bloom',
    pass: bloomPass,
    enabled: false,
    params: {
      strength: 1.5,
      radius: 0.4,
      threshold: 0.85
    }
  });
  
  // 3. FXAA Pass
  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.set(
    1 / width,
    1 / height
  );
  fxaaPass.enabled = false;
  this.composer.addPass(fxaaPass);
  this.passes.push({
    name: 'fxaa',
    pass: fxaaPass,
    enabled: false
  });
}
```

### 2.2 渲染循环

```javascript
animate() {
  requestAnimationFrame(() => this.animate());
  
  const delta = clock.getDelta();
  
  // 更新动画
  this.driveAnimations();
  
  // 更新控制器
  if (this.controls) {
    this.controls.update();
  }
  
  // 后处理渲染
  if (this.composer) {
    this.composer.render();
  } else {
    this.renderer.render(this.scene, this.camera);
  }
  
  // 更新 FPS
  this.updateFps();
}
```

---

## 3. Pass 管理

### 3.1 添加 Pass

```javascript
addPass(name, pass, params = {}) {
  // 检查是否已存在
  const existing = this.passes.find(p => p.name === name);
  if (existing) {
    console.warn(`Pass '${name}' already exists`);
    return;
  }
  
  // 添加到合成器
  this.composer.addPass(pass);
  
  // 记录 Pass
  this.passes.push({
    name,
    pass,
    enabled: pass.enabled !== false,
    params
  });
  
  // 触发事件
  this.emitter.emit('pass-added', { name, pass });
}
```

### 3.2 启用/禁用 Pass

```javascript
setPassEnabled(name, enabled) {
  const passData = this.passes.find(p => p.name === name);
  if (!passData) {
    console.warn(`Pass '${name}' not found`);
    return false;
  }
  
  passData.pass.enabled = enabled;
  passData.enabled = enabled;
  
  // 触发事件
  this.emitter.emit('pass-toggled', { name, enabled });
  
  return true;
}

togglePass(name) {
  const passData = this.passes.find(p => p.name === name);
  if (passData) {
    return this.setPassEnabled(name, !passData.enabled);
  }
  return false;
}
```

### 3.3 移除 Pass

```javascript
removePass(name) {
  const index = this.passes.findIndex(p => p.name === name);
  if (index < 0) {
    console.warn(`Pass '${name}' not found`);
    return false;
  }
  
  const passData = this.passes[index];
  this.composer.removePass(passData.pass);
  this.passes.splice(index, 1);
  
  // 触发事件
  this.emitter.emit('pass-removed', { name });
  
  return true;
}
```

---

## 4. Bloom 效果

### 4.1 参数设置

```javascript
setBloomParams(params) {
  const bloomData = this.passes.find(p => p.name === 'bloom');
  if (!bloomData || !(bloomData.pass instanceof UnrealBloomPass)) {
    console.warn('Bloom pass not found');
    return;
  }
  
  const bloomPass = bloomData.pass;
  
  if (params.strength !== undefined) {
    bloomPass.strength = params.strength;
    bloomData.params.strength = params.strength;
  }
  if (params.radius !== undefined) {
    bloomPass.radius = params.radius;
    bloomData.params.radius = params.radius;
  }
  if (params.threshold !== undefined) {
    bloomPass.threshold = params.threshold;
    bloomData.params.threshold = params.threshold;
  }
  
  // 触发事件
  this.emitter.emit('bloom-params-changed', { params });
}

getBloomParams() {
  const bloomData = this.passes.find(p => p.name === 'bloom');
  return bloomData?.params || {
    strength: 1.5,
    radius: 0.4,
    threshold: 0.85
  };
}
```

### 4.2 预设效果

```javascript
const bloomPresets = {
  subtle: { strength: 0.5, radius: 0.4, threshold: 0.9 },
  normal: { strength: 1.5, radius: 0.4, threshold: 0.85 },
  strong: { strength: 2.5, radius: 0.5, threshold: 0.7 },
  extreme: { strength: 4.0, radius: 0.6, threshold: 0.5 }
};

function applyBloomPreset(preset) {
  const params = bloomPresets[preset];
  if (!params) {
    console.warn('Unknown bloom preset:', preset);
    return;
  }
  setBloomParams(params);
}
```

---

## 5. FXAA 抗锯齿

### 5.1 分辨率更新

```javascript
updateFXAAResolution() {
  const { width, height } = this.renderer.getSize(new THREE.Vector2());
  
  const fxaaData = this.passes.find(p => p.name === 'fxaa');
  if (fxaaData) {
    fxaaData.pass.material.uniforms['resolution'].value.set(
      1 / width,
      1 / height
    );
  }
}

// 窗口大小改变时调用
window.addEventListener('resize', () => {
  // ... 更新相机和渲染器
  
  // 更新后处理
  this.composer.setSize(window.innerWidth, window.innerHeight);
  updateFXAAResolution();
});
```

---

## 6. 性能优化

### 6.1 按需启用

```javascript
// 仅在需要时启用后处理
function setPostProcessingEnabled(enabled) {
  if (enabled) {
    // 启用指定的 Pass
    this.passes.forEach(passData => {
      if (passData.params?.autoEnable) {
        passData.pass.enabled = true;
      }
    });
  } else {
    // 禁用所有 Pass
    this.passes.forEach(passData => {
      passData.pass.enabled = false;
    });
  }
}

// 性能模式
function setPerformanceMode(enabled) {
  if (enabled) {
    // 禁用所有后处理
    setPostProcessingEnabled(false);
    // 降低渲染质量
    this.renderer.setPixelRatio(0.5);
  } else {
    // 恢复后处理
    setPostProcessingEnabled(true);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
}
```

---

**版本**: 1.0 | **日期**: 2026-04-07
