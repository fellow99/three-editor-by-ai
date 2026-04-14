# 005-Camera 相机控制模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 模块概述

### 1.1 模块定位

相机控制模块负责 Three Editor by AI 中所有与相机相关的功能，包括控制器管理、相机状态捕获与恢复、预设视角、漫游路径以及飞行控制。

### 1.2 模块职责

- **控制器热切换**: OrbitControls、MapControls、FlyControls 之间的动态切换
- **相机状态管理**: 位置、旋转、四元数、球面坐标、目标点的捕获与恢复
- **预设视角**: 顶部、前部、侧面等标准视角的快速切换
- **飞行控制**: 基于键盘和鼠标的三维飞行操作
- **漫游路径**: 命名视点快照的保存与恢复
- **UI 组件**: 视角控制面板、立方体 gizmo、操作提示

### 1.3 核心价值

- 流畅的相机切换体验，无闪烁、无状态丢失
- 直观的预设视角和自定义视点管理
- 沉浸式的三维飞行浏览能力
- 清晰的键盘操作提示，降低学习成本

---

## 2. 控制器管理规格

### 2.1 组件概述

**文件**: `src/composables/useControls.js`  
**大小**: 125 行  
**职责**: 控制器热切换、锁定状态管理、配置驱动实例化

### 2.2 支持的控制器类型

| 类型 | 标识符 | 说明 | 适用场景 |
|------|--------|------|----------|
| OrbitControls | `orbit` | 环绕观察控制器 | 通用 3D 浏览 |
| MapControls | `map` | 地图平移 + 缩放控制器 | 俯视地图浏览 |
| FlyControls | `fly` | 第一人称飞行控制器 | 沉浸式三维漫游 |

### 2.3 控制器热切换

**功能描述**: 在运行时动态切换控制器类型，保持相机状态一致。

**切换流程**:
1. 销毁当前控制器实例
2. 创建新控制器实例
3. 同步相机当前位置和目标
4. 强制同步状态（setTimeout 延迟确保渲染帧完成）
5. 触发控制器变更事件

**锁定状态**:
- 切换过程中控制器进入锁定状态，防止用户操作干扰
- 锁定解除后恢复正常的用户交互

**配置驱动**:
- 从 `editorConfig` 读取默认控制器类型
- 支持通过配置预设控制器参数

**代码示例**:
```javascript
const { switchControls, currentControlType } = useControls();

// 切换到飞行控制器
switchControls('fly');

// 当前控制器类型
console.log(currentControlType.value); // 'fly'
```

### 2.4 API 接口

| 方法/属性 | 类型 | 说明 |
|-----------|------|------|
| `switchControls(type)` | 方法 | 切换控制器类型 |
| `currentControlType` | ref | 当前控制器类型标识符 |
| `isLocked` | ref | 控制器是否处于锁定状态 |

---

## 3. 相机状态管理规格

### 3.1 组件概述

**文件**: `src/composables/useCameraPosState.js`  
**大小**: 151 行  
**职责**: 相机状态捕获、位置跳转、平滑过渡、预设位置管理

### 3.2 状态捕获

**捕获内容**:
- `position`: 相机世界坐标位置 (THREE.Vector3)
- `rotation`: 相机欧拉角旋转 (THREE.Euler)
- `quaternion`: 相机四元数 (THREE.Quaternion)
- `sphericalCoords`: 球面坐标 (半径、方位角、极角)
- `target`: 控制器目标点 (THREE.Vector3)

**捕获方法**:
```javascript
const { captureCameraState } = useCameraPosState();

const state = captureCameraState();
// state = {
//   position: { x, y, z },
//   rotation: { x, y, z },
//   quaternion: { x, y, z, w },
//   sphericalCoords: { radius, phi, theta },
//   target: { x, y, z }
// }
```

### 3.3 位置跳转

#### 3.3.1 瞬时跳转 (zoomToPos)

**功能描述**: 立即将相机移动到指定位置和目标点，无动画过渡。

**输入**:
- `position`: 目标位置 `{ x, y, z }`
- `target`: 目标观察点 `{ x, y, z }`

**处理流程**:
1. 设置相机位置
2. 更新控制器目标点
3. 强制控制器更新

**代码示例**:
```javascript
const { zoomToPos } = useCameraPosState();

zoomToPos(
  { x: 10, y: 10, z: 10 },
  { x: 0, y: 0, z: 0 }
);
```

#### 3.3.2 平滑过渡 (flyToPos)

**功能描述**: 使用动画将相机平滑移动到指定位置和目标点。

**输入**:
- `position`: 目标位置 `{ x, y, z }`
- `target`: 目标观察点 `{ x, y, z }`

**动画特性**:
- 使用缓动函数实现平滑加减速
- 过渡过程中保持相机朝向正确
- 支持中断当前动画

**代码示例**:
```javascript
const { flyToPos } = useCameraPosState();

flyToPos(
  { x: 10, y: 10, z: 10 },
  { x: 0, y: 0, z: 0 }
);
```

### 3.4 预设位置

**预设来源**: `src/constants/DEFAULT_CAMERA_POS.json`

**预设视角列表**:

| 预设名称 | 说明 | 典型位置 |
|----------|------|----------|
| top | 顶部俯视 | (0, 20, 0) |
| bottom | 底部仰视 | (0, -20, 0) |
| front | 前部正视 | (0, 0, 20) |
| back | 后部正视 | (0, 0, -20) |
| left | 左侧视图 | (-20, 0, 0) |
| right | 右侧视图 | (20, 0, 0) |
| isometric | 等轴测视图 | (15, 15, 15) |

**自定义位置**:
- 支持保存当前相机位置为自定义预设
- 支持从自定义预设恢复相机位置

### 3.5 API 接口

| 方法/属性 | 类型 | 说明 |
|-----------|------|------|
| `captureCameraState()` | 方法 | 捕获当前相机状态 |
| `zoomToPos(position, target)` | 方法 | 瞬时跳转到指定位置 |
| `flyToPos(position, target)` | 方法 | 平滑过渡到指定位置 |
| `loadPresetPosition(name)` | 方法 | 加载预设视角 |
| `saveCustomPosition(name)` | 方法 | 保存自定义位置 |
| `restoreCustomPosition(name)` | 方法 | 恢复自定义位置 |

---

## 4. 漫游路径规格

### 4.1 组件概述

**文件**: `src/composables/useNavigationsState.js`  
**大小**: 57 行  
**职责**: 命名漫游路径管理、视点快照保存与恢复

### 4.2 漫游路径概念

漫游路径是一组有序的命名视点，每个视点包含相机状态的完整快照。用于创建场景浏览路线或演示路径。

### 4.3 功能规格

#### 4.3.1 保存视点

**功能描述**: 将当前相机位置保存为命名视点。

**输入**:
- `name`: 视点名称（字符串）

**存储内容**:
- 视点名称
- 相机位置
- 相机旋转
- 目标点
- 时间戳

#### 4.3.2 恢复视点

**功能描述**: 从命名视点恢复相机位置。

**输入**:
- `name`: 视点名称

**行为**:
- 使用平滑过渡动画移动到目标视点

#### 4.3.3 路径管理

- 支持创建多个漫游路径
- 每个路径包含多个有序视点
- 支持路径的增删改查

### 4.4 API 接口

| 方法/属性 | 类型 | 说明 |
|-----------|------|------|
| `saveNavigation(name)` | 方法 | 保存当前视点为命名漫游点 |
| `restoreNavigation(name)` | 方法 | 恢复到指定命名视点 |
| `navigations` | ref | 所有漫游路径列表 |

---

## 5. 飞行控制器规格

### 5.1 组件概述

**文件**: `src/controls/FlyControls.js`  
**大小**: 840 行  
**职责**: 自定义第一人称飞行控制器，支持键盘和鼠标操作

### 5.2 键盘控制

#### 5.2.1 移动控制

| 按键 | 动作 | 说明 |
|------|------|------|
| W | 向前飞行 | 沿相机朝向移动 |
| S | 向后飞行 | 沿相机反方向移动 |
| A | 向左平移 | 沿相机左方向移动 |
| D | 向右平移 | 沿相机右方向移动 |
| Q | 向下飞行 | 沿世界 Y 轴负方向 |
| E | 向上飞行 | 沿世界 Y 轴正方向 |
| Space | 向上飞行 | 与 E 键功能一致 |
| R | 向上飞行 | 与 E 键功能一致 |

#### 5.2.2 旋转控制

| 按键 | 动作 | 说明 |
|------|------|------|
| ↑ (上箭头) | 抬头 | 绕局部 X 轴旋转 |
| ↓ (下箭头) | 低头 | 绕局部 X 轴旋转 |
| ← (左箭头) | 左转 | 绕世界 Y 轴旋转 |
| → (右箭头) | 右转 | 绕世界 Y 轴旋转 |

### 5.3 鼠标控制

- **鼠标拖拽**: 控制相机朝向（环顾）
- **鼠标移动**: 实时更新观察方向

### 5.4 可配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `movementSpeed` | number | 1.0 | 移动速度 |
| `rollSpeed` | number | 0.005 | 滚动速度 |
| `dragToLook` | boolean | true | 是否拖拽环顾 |
| `autoForward` | boolean | false | 是否自动前进 |

### 5.5 集成方式

- 基于 Three.js OrbitControls 和 FlyControls 示例实现
- 通过 InputManager 处理键盘事件
- 与 useControls 集成，支持热切换

---

## 6. UI 组件规格

### 6.1 视角控制面板

**文件**: `src/components/scene/ViewportControls.vue`  
**大小**: 124 行

**功能**:
- 预设视角按钮（顶部、前部、侧面等）
- 控制器模式切换器（Orbit / Map / Fly）
- 点击按钮触发相机平滑过渡

**UI 布局**:
```
┌─────────────────────────────┐
│ [顶] [前] [右] [左] [后] [底] │
│                             │
│ 控制器: [Orbit ▼]            │
└─────────────────────────────┘
```

### 6.2 立方体视角控件

**文件**: `src/components/scene/CubeViewportControls.vue`  
**大小**: 91 行

**功能**:
- 3D 立方体 gizmo 显示当前视角方向
- 点击立方体面快速切换视角
- 基于 three-viewport-gizmo 库实现

**依赖**:
- `three-viewport-gizmo` NPM 包

### 6.3 操作提示

**文件**: `src/components/scene/InteractionHints.vue`  
**大小**: 202 行

**功能**:
- 显示当前控制器模式
- 显示对应键盘快捷键提示
- 支持控制器切换时自动更新提示内容

**提示内容示例（飞行模式）**:
```
飞行控制模式
────────────
WASD - 前后左右移动
Q/E  - 下降/上升
Space/R - 上升
方向键 - 旋转视角
鼠标拖拽 - 环顾
```

---

## 7. 依赖关系

### 7.1 内部依赖

```
useControls → useThreeViewer, useEditorConfig
useCameraPosState → useThreeViewer, useControls
useNavigationsState → useCameraPosState
FlyControls → InputManager
ViewportControls → useControls, useCameraPosState
CubeViewportControls → useThreeViewer
InteractionHints → useControls
```

### 7.2 外部依赖

| 依赖 | 用途 |
|------|------|
| three | Three.js 核心库（相机、控制器） |
| three-viewport-gizmo | 立方体视角控件 |

### 7.3 数据文件

| 文件 | 说明 |
|------|------|
| `src/constants/DEFAULT_CAMERA_POS.json` | 预设相机位置数据 |

---

## 8. 事件系统

### 8.1 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `controls-changed` | 控制器切换完成 | `{ type: string }` |
| `camera-position-changed` | 相机位置变化 | `{ position, target }` |
| `navigation-saved` | 漫游视点保存 | `{ name, state }` |
| `navigation-restored` | 漫游视点恢复 | `{ name }` |

### 8.2 监听的事件

| 事件名 | 来源 | 响应动作 |
|--------|------|----------|
| `editor-config-updated` | useEditorConfig | 重新加载控制器配置 |

---

## 9. 使用示例

### 9.1 控制器切换

```javascript
import { useControls } from '@/composables/useControls.js';

const { switchControls, currentControlType } = useControls();

// 切换到飞行模式
switchControls('fly');

// 监听控制器变化
watch(currentControlType, (newType) => {
  console.log(`控制器已切换为: ${newType}`);
});
```

### 9.2 相机位置操作

```javascript
import { useCameraPosState } from '@/composables/useCameraPosState.js';

const { flyToPos, zoomToPos, loadPresetPosition } = useCameraPosState();

// 平滑飞到顶部视角
loadPresetPosition('top');

// 瞬时跳转到指定位置
zoomToPos(
  { x: 5, y: 5, z: 5 },
  { x: 0, y: 0, z: 0 }
);

// 平滑过渡
flyToPos(
  { x: -10, y: 8, z: 10 },
  { x: 0, y: 2, z: 0 }
);
```

### 9.3 漫游路径

```javascript
import { useNavigationsState } from '@/composables/useNavigationsState.js';

const { saveNavigation, restoreNavigation, navigations } = useNavigationsState();

// 保存当前视点
saveNavigation('入口视角');

// 恢复到保存的视点
restoreNavigation('入口视角');
```

---

## 10. 测试要点

### 10.1 单元测试

- [ ] 控制器切换逻辑
- [ ] 相机状态捕获准确性
- [ ] 预设位置加载
- [ ] 自定义位置保存与恢复
- [ ] 漫游路径增删改查

### 10.2 集成测试

- [ ] 控制器热切换无闪烁
- [ ] 平滑过渡动画流畅性
- [ ] 飞行控制器键盘响应
- [ ] UI 组件与控制器状态同步

### 10.3 性能测试

- [ ] 相机切换响应时间 < 100ms
- [ ] 平滑过渡帧率 > 55 FPS
- [ ] 飞行控制输入延迟 < 16ms

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [核心引擎模块](../001-core/spec.md)
- [数据模型](../overall-data-model.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始模块规格文档 |
