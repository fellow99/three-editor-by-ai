# 005-Camera 相机控制模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

相机控制模块负责 Three.js 相机的控制方式切换、预设视角管理和相机位置记录。

### 1.2 技术约束

- 必须支持 3 种控制器
- 必须实现 7 个预设视角
- 必须支持相机位置保存/恢复

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 控制器切换 | 销毁重建 | 确保状态干净 |
| 预设视角 | 配置对象 | 简洁灵活 |
| 位置存储 | localStorage | 持久化 |

---

## 2. 控制器实现

### 2.1 控制器工厂

```javascript
function createControls(type, camera, renderer) {
  let controls;
  
  switch (type) {
    case 'orbit':
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.enableRotate = true;
      break;
      
    case 'map':
      controls = new MapControls(camera, renderer.domElement);
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.enableRotate = true;
      break;
      
    case 'fly':
      controls = new FlyControls(camera, renderer.domElement);
      controls.movementSpeed = 10;
      controls.rollSpeed = Math.PI / 24;
      controls.autoForward = false;
      break;
      
    default:
      throw new Error(`不支持的控制器类型：${type}`);
  }
  
  // 通用配置
  if (type !== 'fly') {
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.1;
    controls.maxDistance = 1000;
  }
  
  return controls;
}
```

### 2.2 控制器切换

```javascript
function setControls(type) {
  // 1. 销毁旧控制器
  if (controls.value) {
    controls.value.dispose();
    controls.value = null;
  }
  
  // 2. 创建新控制器
  controls.value = createControls(
    type,
    camera.value,
    renderer.value
  );
  
  // 3. 更新状态
  currentControls.value = type;
  
  // 4. 触发事件
  emitter.emit('controls-changed', { type });
}
```

---

## 3. 预设视角实现

### 3.1 预设配置

```javascript
const presetViews = {
  top: {
    name: '顶视图',
    position: { x: 0, y: 10, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 0, z: -1 }
  },
  bottom: {
    name: '底视图',
    position: { x: 0, y: -10, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 0, z: 1 }
  },
  front: {
    name: '前视图',
    position: { x: 0, y: 0, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 }
  },
  back: {
    name: '后视图',
    position: { x: 0, y: 0, z: -10 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 }
  },
  left: {
    name: '左视图',
    position: { x: -10, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 }
  },
  right: {
    name: '右视图',
    position: { x: 10, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 }
  },
  isometric: {
    name: '等轴测',
    position: { x: 10, y: 10, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 }
  }
};
```

### 3.2 视角切换

```javascript
function setPresetView(preset) {
  const view = presetViews[preset];
  if (!view) {
    console.warn('无效的预设视角:', preset);
    return;
  }
  
  // 平滑过渡
  const startPos = camera.value.position.clone();
  const startTarget = getControlsTarget();
  const endPos = new THREE.Vector3(...Object.values(view.position));
  const endTarget = new THREE.Vector3(...Object.values(view.target));
  
  // 动画过渡
  animateCamera(startPos, endPos, startTarget, endTarget, 500);
}

function animateCamera(startPos, endPos, startTarget, endTarget, duration) {
  const startTime = performance.now();
  
  function update() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // 缓动函数
    const eased = easeInOutCubic(progress);
    
    // 插值位置
    camera.value.position.lerpVectors(startPos, endPos, eased);
    
    // 插值目标
    const currentTarget = new THREE.Vector3().lerpVectors(
      startTarget, endTarget, eased
    );
    
    if (controls.value) {
      controls.value.target.copy(currentTarget);
      controls.value.update();
    }
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

---

## 4. 相机位置管理

### 4.1 保存位置

```javascript
function saveCameraPosition(name) {
  const position = {
    x: camera.value.position.x,
    y: camera.value.position.y,
    z: camera.value.position.z
  };
  
  const target = getControlsTarget();
  
  const saved = {
    position,
    target,
    fov: camera.value.fov,
    savedAt: new Date().toISOString()
  };
  
  // 保存到 localStorage
  const key = `camera:${name}`;
  localStorage.setItem(key, JSON.stringify(saved));
  
  // 更新列表
  savedPositions.value.set(name, saved);
  
  emitter.emit('camera-position-saved', { name, saved });
}
```

### 4.2 恢复位置

```javascript
function restoreCameraPosition(name) {
  const key = `camera:${name}`;
  const savedStr = localStorage.getItem(key);
  
  if (!savedStr) {
    console.warn('相机位置不存在:', name);
    return false;
  }
  
  try {
    const saved = JSON.parse(savedStr);
    
    // 平滑过渡到保存的位置
    animateCamera(
      camera.value.position,
      new THREE.Vector3(saved.position.x, saved.position.y, saved.position.z),
      getControlsTarget(),
      new THREE.Vector3(saved.target.x, saved.target.y, saved.target.z),
      500
    );
    
    // 恢复 FOV
    camera.value.fov = saved.fov;
    camera.value.updateProjectionMatrix();
    
    emitter.emit('camera-position-restored', { name, saved });
    return true;
  } catch (error) {
    console.error('恢复相机位置失败:', error);
    return false;
  }
}
```

### 4.3 管理保存的位置

```javascript
function getSavedPositions() {
  const positions = new Map();
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('camera:')) {
      const name = key.substring(7);
      try {
        const saved = JSON.parse(localStorage.getItem(key));
        positions.set(name, saved);
      } catch {
        // 忽略无效数据
      }
    }
  }
  
  return positions;
}

function deleteSavedPosition(name) {
  const key = `camera:${name}`;
  localStorage.removeItem(key);
  savedPositions.value.delete(name);
  
  emitter.emit('camera-position-deleted', { name });
}
```

---

## 5. FlyControls 增强

### 5.1 键盘控制

```javascript
// FlyControls.js 扩展
class FlyControlsEnhanced extends FlyControls {
  constructor(camera, domElement) {
    super(camera, domElement);
    
    this.moveSpeed = 10;
    this.rollSpeed = Math.PI / 24;
    
    // 按键状态
    this.moveState = {
      forward: false,
      back: false,
      left: false,
      right: false,
      up: false,
      down: false
    };
    
    this.bindKeys();
  }
  
  bindKeys() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }
  
  onKeyDown(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveState.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveState.back = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveState.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveState.right = true;
        break;
      case 'KeyQ':
      case 'PageDown':
        this.moveState.down = true;
        break;
      case 'KeyE':
      case 'PageUp':
      case 'Space':
      case 'KeyR':
        this.moveState.up = true;
        break;
    }
  }
  
  onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveState.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveState.back = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveState.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveState.right = false;
        break;
      case 'KeyQ':
      case 'PageDown':
        this.moveState.down = false;
        break;
      case 'KeyE':
      case 'PageUp':
      case 'Space':
      case 'KeyR':
        this.moveState.up = false;
        break;
    }
  }
  
  update(delta) {
    // 调用父类更新
    super.update(delta);
    
    // 处理键盘移动
    const actualMoveSpeed = delta * this.moveSpeed;
    
    if (this.moveState.forward) this.object.translateZ(actualMoveSpeed);
    if (this.moveState.back) this.object.translateZ(-actualMoveSpeed);
    if (this.moveState.left) this.object.translateX(-actualMoveSpeed);
    if (this.moveState.right) this.object.translateX(actualMoveSpeed);
    if (this.moveState.up) this.object.translateY(actualMoveSpeed);
    if (this.moveState.down) this.object.translateY(-actualMoveSpeed);
  }
}
```

---

## 6. 性能优化

### 6.1 控制器更新优化

```javascript
// 仅在需要时更新控制器
let needsUpdate = false;

function markControlsUpdate() {
  needsUpdate = true;
}

function updateControls(delta) {
  if (needsUpdate && controls.value) {
    controls.value.update();
    needsUpdate = false;
  }
}
```

---

**版本**: 1.0 | **日期**: 2026-04-07
