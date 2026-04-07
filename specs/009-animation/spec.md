# 009-Animation 动画系统模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

动画系统模块负责 GLTF 等模型的动画加载、播放控制、动画状态管理和序列化恢复。

### 1.2 模块职责

- **动画加载**: GLTF 模型自动加载动画
- **动画播放**: 选择、播放、暂停、速度控制
- **动画状态**: 状态记录与序列化
- **AnimationMixer 管理**: 统一驱动所有动画

---

## 2. 动画加载

### 2.1 GLTF 自动加载

```javascript
// AssetLoader.js
loadGLTF(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      // 自动挂载 animations
      const scene = gltf.scene;
      scene.animations = gltf.animations;
      resolve(gltf);
    });
  });
}
```

### 2.2 动画列表

```javascript
// 获取模型的所有动画
function getAnimations(object) {
  return object.animations || [];
}

// 获取动画名称
function getAnimationName(index) {
  const animations = getAnimations(currentObject);
  return animations[index]?.name || `Animation ${index}`;
}
```

---

## 3. 动画播放控制

### 3.1 AnimationMixer 管理

**ThreeViewer 统一驱动**:
```javascript
// ThreeViewer.js
driveAnimations() {
  this.scene.traverse((obj) => {
    if (obj._mixer) {
      obj._mixer.update(deltaTime);
    }
  });
}
```

### 3.2 动画选择与播放

```javascript
function playAnimation(object, index) {
  // 停止当前动画
  if (object._activeAction) {
    object._activeAction.stop();
  }
  
  // 获取 animations
  const animations = object.animations || [];
  if (index >= animations.length) return;
  
  // 创建 AnimationMixer
  const mixer = new THREE.AnimationMixer(object);
  const action = mixer.clipAction(animations[index]);
  
  // 播放
  action.play();
  
  // 挂载运行时对象
  object._mixer = mixer;
  object._activeAction = action;
  
  // 记录动画索引到 userData
  object.userData.animationIndex = index;
}
```

### 3.3 播放控制

| 方法 | 说明 |
|------|------|
| `play()` | 播放动画 |
| `pause()` | 暂停动画 |
| `stop()` | 停止动画 |
| `setSpeed(speed)` | 设置播放速度 |
| `setLoop(loop)` | 设置循环模式 |

---

## 4. 动画状态序列化

### 4.1 保存动画索引

```javascript
// 导出时
userData: {
  animationIndex: 0  // 当前选择的动画
}
```

### 4.2 恢复动画

```javascript
// 加载时
if (obj.userData.animationIndex !== undefined) {
  playAnimation(obj, obj.userData.animationIndex);
}
```

---

## 5. AnimationPropertyPane 组件

### 5.1 功能

- 动画下拉选择
- 播放/暂停按钮
- 速度滑块
- 循环模式选择

### 5.2 UI 布局

```
┌─────────────────────────────┐
│ 动画：[Parrot Animation ▼] │
│                             │
│ [◄◄] [▶/⏸] [►►]           │
│                             │
│ 速度：[━━━━━●━━━━━] 1.0x  │
│                             │
│ 循环：[● 一次 ○ 循环 ○ 往返]│
└─────────────────────────────┘
```

---

## 6. API 接口

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `playAnimation(object, index)` | object: Object3D, index: number | void | 播放动画 |
| `pauseAnimation(object)` | object: Object3D | void | 暂停动画 |
| `stopAnimation(object)` | object: Object3D | void | 停止动画 |
| `setAnimationSpeed(object, speed)` | object: Object3D, speed: number | void | 设置速度 |
| `setAnimationLoop(object, loop)` | object: Object3D, loop: string | void | 设置循环 |
| `getAnimationList(object)` | object: Object3D | string[] | 获取动画列表 |

---

## 7. 使用示例

```javascript
// 加载模型
const gltf = await loadModel('/models/Parrot.glb');
scene.add(gltf.scene);

// 播放第一个动画
playAnimation(gltf.scene, 0);

// 设置速度
setAnimationSpeed(gltf.scene, 1.5);

// 设置循环为循环播放
setAnimationLoop(gltf.scene, 'loop');
```

---

**版本**: 1.0 | **日期**: 2026-04-07
