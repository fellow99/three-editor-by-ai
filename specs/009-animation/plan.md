# 009-Animation 动画系统模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

动画系统模块负责 GLTF 等模型的动画加载、播放控制和状态管理。

### 1.2 技术约束

- 必须使用 AnimationMixer
- 必须支持动画选择
- 必须支持状态序列化

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 动画驱动 | ThreeViewer 统一 | 集中管理 |
| 状态存储 | userData | 随对象序列化 |
| 运行时对象 | 前缀_ | 易于识别排除 |

---

## 2. 动画加载

### 2.1 GLTF 自动加载

```javascript
// AssetLoader.js
loadGLTF(url, onProgress) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    
    // 设置 Draco 解码器
    if (this.dracoLoader) {
      loader.setDRACOLoader(this.dracoLoader);
    }
    
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        
        // 自动挂载 animations
        if (gltf.animations && gltf.animations.length > 0) {
          scene.animations = gltf.animations;
          scene.animationNames = gltf.animations.map(anim => anim.name);
        }
        
        resolve(gltf);
      },
      (xhr) => {
        if (onProgress && xhr.lengthComputable) {
          const percent = (xhr.loaded / xhr.total) * 100;
          onProgress(percent);
        }
      },
      reject
    );
  });
}
```

---

## 3. 动画播放

### 3.1 播放控制

```javascript
function playAnimation(object, index) {
  // 停止当前动画
  if (object._activeAction) {
    object._activeAction.stop();
    object._activeAction = null;
  }
  
  // 获取 animations
  const animations = object.animations || [];
  if (animations.length === 0) {
    console.warn('对象没有动画');
    return;
  }
  
  if (index < 0 || index >= animations.length) {
    console.warn('动画索引超出范围:', index);
    return;
  }
  
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
  
  // 触发事件
  emitter.emit('animation-played', {
    object,
    animation: animations[index].name,
    index
  });
}
```

### 3.2 播放控制

```javascript
function pauseAnimation(object) {
  if (object._activeAction) {
    object._activeAction.paused = true;
  }
}

function resumeAnimation(object) {
  if (object._activeAction) {
    object._activeAction.paused = false;
  }
}

function stopAnimation(object) {
  if (object._activeAction) {
    object._activeAction.stop();
    object._activeAction = null;
  }
  if (object._mixer) {
    object._mixer.stopAllAction();
    object._mixer = null;
  }
  object.userData.animationIndex = undefined;
}
```

### 3.3 速度控制

```javascript
function setAnimationSpeed(object, speed) {
  if (object._activeAction) {
    object._activeAction.timeScale = speed;
  }
}

function getAnimationSpeed(object) {
  return object._activeAction?.timeScale || 1.0;
}
```

### 3.4 循环模式

```javascript
const LoopModes = {
  once: THREE.LoopOnce,
  loop: THREE.LoopRepeat,
  pingpong: THREE.LoopPingPong
};

function setAnimationLoop(object, mode, repetitions = Infinity) {
  if (object._activeAction) {
    object._activeAction.setLoop(
      LoopModes[mode] || THREE.LoopRepeat,
      repetitions
    );
  }
}
```

---

## 4. 动画驱动

### 4.1 ThreeViewer 统一驱动

```javascript
// ThreeViewer.js
driveAnimations() {
  const delta = clock.getDelta();
  
  this.scene.traverse((obj) => {
    if (obj._mixer) {
      obj._mixer.update(delta);
    }
  });
}

animate() {
  requestAnimationFrame(() => this.animate());
  
  // ... 其他更新
  
  // 驱动动画
  this.driveAnimations();
  
  // 渲染
  this.composer.render();
}
```

---

## 5. 动画列表

### 5.1 获取动画列表

```javascript
function getAnimationList(object) {
  const animations = object.animations || [];
  return animations.map((anim, index) => ({
    index,
    name: anim.name || `Animation ${index}`,
    duration: anim.duration,
    tracksCount: anim.tracks.length
  }));
}

function getCurrentAnimation(object) {
  const index = object.userData.animationIndex;
  const animations = object.animations || [];
  
  if (index === undefined || index >= animations.length) {
    return null;
  }
  
  const anim = animations[index];
  return {
    index,
    name: anim.name,
    duration: anim.duration,
    isPlaying: !!object._activeAction && !object._activeAction.paused,
    speed: object._activeAction?.timeScale || 1.0,
    loopMode: getLoopModeName(object._activeAction?.getLoopMode()),
    currentTime: object._activeAction?.time || 0
  };
}

function getLoopModeName(mode) {
  if (mode === THREE.LoopOnce) return 'once';
  if (mode === THREE.LoopPingPong) return 'pingpong';
  return 'loop';
}
```

---

## 6. 动画状态序列化

### 6.1 保存状态

```javascript
// 导出时自动保存
exportObject(object) {
  return {
    // ... 其他属性
    userData: {
      ...object.userData,
      animationIndex: object.userData.animationIndex
    }
  };
}
```

### 6.2 恢复状态

```javascript
// 导入时恢复
async importObject(objData) {
  const object = // ... 创建对象
  
  // 恢复动画索引
  if (objData.userData?.animationIndex !== undefined) {
    object.userData.animationIndex = objData.userData.animationIndex;
    
    // 如果有 animations，自动播放
    if (object.animations && object.animations.length > 0) {
      // 延迟播放，确保模型完全加载
      setTimeout(() => {
        playAnimation(object, object.userData.animationIndex);
      }, 100);
    }
  }
  
  return object;
}
```

---

## 7. 多动画混合

### 7.1 动画混合

```javascript
function blendAnimations(object, fromIndex, toIndex, duration) {
  const animations = object.animations || [];
  if (fromIndex >= animations.length || toIndex >= animations.length) {
    return;
  }
  
  // 创建两个 Action
  const fromAction = object._mixer.clipAction(animations[fromIndex]);
  const toAction = object._mixer.clipAction(animations[toIndex]);
  
  // 淡入淡出
  fromAction.fadeOut(duration);
  toAction.reset().fadeIn(duration).play();
  
  // 更新当前动画
  object.userData.animationIndex = toIndex;
  object._activeAction = toAction;
}
```

---

## 8. 性能优化

### 8.1 动画更新优化

```javascript
// 仅更新可见对象的动画
driveAnimations() {
  const delta = clock.getDelta();
  
  this.scene.traverse((obj) => {
    if (obj._mixer && obj.visible) {
      obj._mixer.update(delta);
    }
  });
}

// 暂停不可见对象的动画
function pauseHiddenAnimations() {
  this.scene.traverse((obj) => {
    if (obj._mixer && !obj.visible) {
      obj._mixer.removeEventListener('update', obj._mixerUpdate);
    }
  });
}
```

---

**版本**: 1.0 | **日期**: 2026-04-07
