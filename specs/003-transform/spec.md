# 003-Transform 对象变换模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 模块概述

### 1.1 模块定位

对象变换模块负责 Three.js 场景中 3D 对象的移动、旋转、缩放操作，提供完整的撤销/重做历史记录、吸附对齐、轴约束等高级变换功能。

### 1.2 模块职责

- **变换操作**: 对象的位置、旋转、缩放变换
- **撤销/重做**: 完整的 undo/redo 历史栈管理
- **吸附对齐**: 网格吸附、旋转吸附、缩放吸附
- **轴约束**: X/Y/Z 轴独立锁定
- **坐标空间**: 世界坐标与局部坐标切换
- **多选支持**: 批量变换多个选中对象
- **选择集成**: TransformControls 生命周期管理

### 1.3 核心价值

- 精确可控的对象变换操作
- 完整的操作历史追溯能力
- 灵活的吸附与约束机制
- 与选择系统无缝集成

---

## 2. useTransform 变换操作规格

### 2.1 组件概述

**文件名**: `useTransform.js`  
**路径**: `src/composables/useTransform.js`  
**大小**: 559 行  
**职责**: 对象变换操作的核心逻辑，包含撤销/重做、吸附、轴约束等功能

### 2.2 核心功能

#### 2.2.1 撤销/重做系统

**功能描述**: 维护变换操作的历史记录，支持撤销和重做

**历史栈配置**:
- `undoStack`: 撤销栈，存储可撤销的操作
- `redoStack`: 重做栈，存储可重做的操作
- `maxHistory`: 最大历史记录数，默认 50

**操作流程**:

**撤销 (undo)**:
1. 检查 undoStack 是否为空
2. 弹出栈顶操作记录
3. 恢复对象到操作前状态
4. 将操作记录推入 redoStack
5. 触发更新事件

**重做 (redo)**:
1. 检查 redoStack 是否为空
2. 弹出栈顶操作记录
3. 恢复对象到操作后状态
4. 将操作记录推入 undoStack
5. 触发更新事件

**变换开始 (startTransform)**:
1. 捕获当前所有选中对象的状态快照
2. 记录位置、旋转、缩放值
3. 存储为变换前状态

**变换结束 (endTransform)**:
1. 捕获变换后所有选中对象的状态
2. 与变换前状态对比
3. 若有变化，生成操作记录推入 undoStack
4. 清空 redoStack（新操作使重做历史失效）

**操作记录结构**:
```
{
  objects: [
    {
      uuid: string,
      before: { position, rotation, scale },
      after: { position, rotation, scale }
    }
  ],
  timestamp: number
}
```

---

#### 2.2.2 吸附对齐

**网格吸附 (Snap-to-Grid)**:
- 可配置网格大小（如 0.5、1.0、2.0 单位）
- 位置值自动对齐到最近的网格点
- 计算公式: `snapped = Math.round(value / gridSize) * gridSize`

**旋转吸附 (Snap-to-Rotation)**:
- 可配置角度步长（如 15°、30°、45°）
- 旋转值自动对齐到最近的角度步长
- 计算公式: `snapped = Math.round(value / angleStep) * angleStep`

**缩放吸附 (Snap-to-Scale)**:
- 可配置缩放步长（如 0.1、0.25、0.5）
- 缩放值自动对齐到最近的步长值
- 计算公式: `snapped = Math.round(value / scaleStep) * scaleStep`

**吸附开关**:
- 各吸附功能可独立启用/禁用
- 吸附参数可动态调整

---

#### 2.2.3 轴约束

**功能描述**: 限制变换操作仅在指定轴向上生效

**支持的约束**:
- X 轴锁定: 仅允许 X 方向变换
- Y 轴锁定: 仅允许 Y 方向变换
- Z 轴锁定: 仅允许 Z 方向变换

**约束行为**:
- 位置变换: 锁定轴的值保持不变
- 旋转变换: 锁定轴的旋转角度保持不变
- 缩放变换: 锁定轴的缩放比例保持不变

**Y 轴专用锁定**:
- 通过 `useAxesLockState` 提供独立的 Y 轴锁定状态
- 状态包含: `{ locked: boolean, yValue: number }`
- 锁定后 Y 位置固定为锁定时的值

---

#### 2.2.4 坐标空间

**世界坐标 (World Space)**:
- 变换基于全局坐标系
- 所有对象使用统一的方向参考

**局部坐标 (Local Space)**:
- 变换基于对象自身的坐标系
- 考虑对象的父级变换和旋转

**切换机制**:
- 通过配置项切换坐标空间模式
- 切换时 TransformControls 自动更新显示

---

#### 2.2.5 多选变换

**功能描述**: 同时对多个选中对象执行变换操作

**行为规则**:
- 所有选中对象同步应用相同的变换增量
- 每个对象保持自身的相对位置关系
- 撤销/重做时批量恢复所有对象状态

**处理流程**:
1. 获取当前所有选中对象列表
2. 变换开始时捕获所有对象状态
3. 变换过程中同步更新所有对象
4. 变换结束时记录所有对象的变化

---

### 2.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `startTransform()` | - | void | 开始变换，捕获对象当前状态 |
| `endTransform()` | - | void | 结束变换，记录操作到历史栈 |
| `undo()` | - | boolean | 撤销上一步操作，成功返回 true |
| `redo()` | - | boolean | 重做上一步撤销，成功返回 true |
| `canUndo()` | - | boolean | 检查是否可以撤销 |
| `canRedo()` | - | boolean | 检查是否可以重做 |
| `clearHistory()` | - | void | 清空所有历史记录 |
| `setSnapGrid(size)` | size: number | void | 设置网格吸附大小 |
| `setSnapRotation(angle)` | angle: number | void | 设置旋转吸附角度 |
| `setSnapScale(step)` | step: number | void | 设置缩放吸附步长 |
| `setAxisLock(axis, locked)` | axis: string, locked: boolean | void | 设置轴约束 |
| `setCoordinateSpace(space)` | space: 'world' \| 'local' | void | 设置坐标空间模式 |

---

### 2.4 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `transform-start` | 变换开始 | `{ objects: Object3D[] }` |
| `transform-end` | 变换结束 | `{ objects: Object3D[] }` |
| `transform-undo` | 撤销操作 | `{ record: TransformRecord }` |
| `transform-redo` | 重做操作 | `{ record: TransformRecord }` |
| `history-cleared` | 历史清空 | - |

#### 监听的事件

| 事件名 | 来源 | 响应动作 |
|--------|------|----------|
| `object-selected` | useObjectSelection | 更新变换目标对象 |
| `object-deselected` | useObjectSelection | 更新变换目标对象 |
| `axes-lock-changed` | useAxesLockState | 更新轴约束状态 |

---

## 3. useObjectSelection 选择与变换控制规格

### 3.1 组件概述

**文件名**: `useObjectSelection.js`  
**路径**: `src/composables/useObjectSelection.js`  
**大小**: 605 行  
**职责**: 对象选择管理、TransformControls 生命周期管理、选中状态维护

### 3.2 核心功能

#### 3.2.1 TransformControls 生命周期

**创建**:
- 初始化 TransformControls 实例
- 绑定到 Three.js 渲染器 DOM 元素
- 配置变换模式（移动/旋转/缩放）

**附加对象**:
- 将 TransformControls 附加到选中对象
- 自动处理多选时的主控对象

**分离对象**:
- 从当前对象分离 TransformControls
- 清理辅助显示对象

**销毁**:
- 释放 TransformControls 资源
- 移除所有事件监听器

---

#### 3.2.2 拖拽交互

**拖拽开始**:
1. 自动禁用 OrbitControls（防止镜头跟随）
2. 调用 `useTransform.startTransform()` 捕获状态
3. 触发 `transform-start` 事件

**拖拽进行中**:
- TransformControls 实时更新对象变换
- 应用吸附对齐规则
- 应用轴约束限制

**拖拽结束**:
1. 调用 `useTransform.endTransform()` 记录历史
2. 重新启用 OrbitControls
3. 触发 `transform-end` 事件

---

#### 3.2.3 类型专属辅助显示

**灯光对象 (Light)**:
- 显示灯光辅助几何体
- 可视化灯光方向和范围

**相机对象 (Camera)**:
- 显示相机辅助线框
- 可视化视锥体范围

**普通对象**:
- 使用 BoxHelper 显示包围盒
- 高亮选中状态

---

#### 3.2.4 多选管理

**选择存储**:
- `selectedObjects`: Set 类型，存储当前选中对象
- `currentHelpers`: Map 类型，存储每个对象的辅助显示

**选择规则**:
- 锁定对象（`userData.locked=true`）不可选中
- 单选时清除之前的选择
- 多选时累加选择集合

**selectionStore**:
- 响应式对象，存储选中对象的临时材质信息
- Key 为对象 ID，Value 为原始材质引用
- 生命周期与 useObjectSelection 一致

---

### 3.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `selectObject(object)` | object: Object3D | void | 选择单个对象 |
| `deselectObject(object)` | object: Object3D | void | 取消选择对象 |
| `deselectAll()` | - | void | 取消所有选择 |
| `toggleSelect(object)` | object: Object3D | void | 切换选择状态 |
| `getSelectedObjects()` | - | Object3D[] | 获取所有选中对象 |
| `setTransformMode(mode)` | mode: 'translate' \| 'rotate' \| 'scale' | void | 设置变换模式 |
| `setCoordinateSpace(space)` | space: 'world' \| 'local' | void | 设置坐标空间 |
| `dispose()` | - | void | 销毁所有资源 |

---

## 4. useAxesLockState 轴锁定状态规格

### 4.1 组件概述

**文件名**: `useAxesLockState.js`  
**路径**: `src/composables/useAxesLockState.js`  
**大小**: 27 行  
**职责**: Y 轴锁定状态管理

### 4.2 状态结构

```
{
  locked: boolean,    // Y 轴是否锁定
  yValue: number      // 锁定时的 Y 值
}
```

### 4.3 行为规则

- 锁定时记录当前 Y 位置值
- 变换过程中强制恢复 Y 值为锁定值
- 解锁后恢复正常变换

---

## 5. TransformPropertyPane 变换属性面板规格

### 5.1 组件概述

**文件名**: `TransformPropertyPane.vue`  
**路径**: `src/components/property/TransformPropertyPane.vue`  
**职责**: 显示和编辑选中对象的变换属性

### 5.2 核心功能

#### 5.2.1 属性显示

**位置 (Position)**:
- X、Y、Z 三个数值输入框
- 实时显示当前对象位置
- 支持手动输入精确值

**旋转 (Rotation)**:
- X、Y、Z 三个数值输入框
- 支持角度/弧度显示切换
- 实时显示当前对象旋转

**缩放 (Scale)**:
- X、Y、Z 三个数值输入框
- 默认值为 1.0
- 支持等比缩放锁定

#### 5.2.2 实时更新

- 拖拽变换过程中实时更新显示值
- 多选时显示首个选中对象的值
- 手动输入后应用到对象并触发渲染

---

## 6. 依赖关系

### 6.1 内部依赖

```
useTransform → useObjectManager
useTransform → useObjectSelection
useObjectSelection → useAxesLockState
useObjectSelection → useThreeViewer
useObjectSelection → useControls
useObjectSelection → useInputManager
TransformPropertyPane → useObjectSelection
TransformPropertyPane → useTransform
```

### 6.2 外部依赖

| 依赖 | 用途 |
|------|------|
| three | Three.js 核心库 |
| three/examples/jsm/controls/TransformControls.js | 变换控制器 |
| vue | Vue 3 响应式系统 |

---

## 7. 测试要点

### 7.1 单元测试

- [ ] 撤销/重做基本功能
- [ ] 历史栈容量限制（maxHistory=50）
- [ ] 网格吸附计算准确性
- [ ] 旋转吸附计算准确性
- [ ] 缩放吸附计算准确性
- [ ] X/Y/Z 轴独立约束
- [ ] Y 轴专用锁定功能
- [ ] 世界/局部坐标空间切换
- [ ] 多选变换同步性

### 7.2 集成测试

- [ ] TransformControls 拖拽完整流程
- [ ] 拖拽时 OrbitControls 自动禁用/启用
- [ ] 撤销后重做栈正确性
- [ ] 新操作后重做栈清空
- [ ] 锁定对象不可选中
- [ ] 辅助显示对象正确创建/销毁
- [ ] selectionStore 生命周期管理

### 7.3 UI 测试

- [ ] TransformPropertyPane 实时值更新
- [ ] 手动输入值应用到对象
- [ ] 多选时面板显示正确
- [ ] 无选中对象时面板状态

### 7.4 边界测试

- [ ] 空场景变换操作
- [ ] 历史栈满后旧记录丢弃
- [ ] 连续快速撤销/重做
- [ ] 超大/超小吸附网格值
- [ ] 嵌套对象局部坐标变换

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [API 清单](../API.md)
- [001-Core 核心引擎模块](../001-core/spec.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始模块规格文档 |
