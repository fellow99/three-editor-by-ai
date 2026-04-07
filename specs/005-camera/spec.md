# 005-Camera 相机控制模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

相机控制模块负责 Three.js 相机的控制方式切换、预设视角管理和相机位置记录。

### 1.2 模块职责

- **控制器切换**: Orbit/Map/Fly 控制器
- **预设视角**: 6 个标准视角 + 等轴测
- **相机位置**: 位置记录与恢复
- **飞行控制**: WASD 键盘飞行

---

## 2. 控制器类型

### 2.1 OrbitControls

**用途**: 环绕观察（默认）  
**操作**:
- 左键拖拽：旋转
- 右键拖拽：平移
- 滚轮：缩放

### 2.2 MapControls

**用途**: 地图控制（2.5D 视角）  
**操作**:
- 左键拖拽：平移
- 右键拖拽：旋转
- 滚轮：缩放

### 2.3 FlyControls

**用途**: 飞行控制（第一人称）  
**操作**:
- WASD：前后左右
- QE：上下
- 方向键/鼠标：旋转
- 空格/R：向上飞行

---

## 3. useControls 组合式函数

### 3.1 核心功能

```javascript
const currentControls = ref('orbit');

function setControls(type) {
  // 移除旧控制器
  if (controls.value) {
    controls.value.dispose();
  }
  
  // 创建新控制器
  switch (type) {
    case 'orbit':
      controls.value = new OrbitControls(camera, renderer.domElement);
      break;
    case 'map':
      controls.value = new MapControls(camera, renderer.domElement);
      break;
    case 'fly':
      controls.value = new FlyControls(camera, renderer.domElement);
      break;
  }
  
  currentControls.value = type;
}
```

---

### 3.2 预设视角

```javascript
const presetViews = {
  top: { position: [0, 10, 0], target: [0, 0, 0] },
  bottom: { position: [0, -10, 0], target: [0, 0, 0] },
  front: { position: [0, 0, 10], target: [0, 0, 0] },
  back: { position: [0, 0, -10], target: [0, 0, 0] },
  left: { position: [-10, 0, 0], target: [0, 0, 0] },
  right: { position: [10, 0, 0], target: [0, 0, 0] },
  isometric: { position: [10, 10, 10], target: [0, 0, 0] }
};

function setPresetView(preset) {
  const view = presetViews[preset];
  if (!view) return;
  
  camera.position.set(...view.position);
  camera.lookAt(...view.target);
}
```

---

## 4. API 接口

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setControls(type)` | type: string | void | 切换控制器 |
| `setPresetView(preset)` | preset: string | void | 设置预设视角 |
| `saveCameraPosition(name)` | name: string | void | 保存相机位置 |
| `restoreCameraPosition(name)` | name: string | boolean | 恢复相机位置 |
| `enable()` | - | void | 启用控制器 |
| `disable()` | - | void | 禁用控制器 |

---

## 5. 使用示例

```javascript
import { useControls } from './composables/useControls.js';

const { setControls, setPresetView } = useControls();

// 切换到飞行控制
setControls('fly');

// 切换到顶部视角
setPresetView('top');

// 切换到等轴测视角
setPresetView('isometric');
```

---

**版本**: 1.0 | **日期**: 2026-04-07
