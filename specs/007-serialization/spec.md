# 007-Serialization 场景序列化模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 模块概述

### 1.1 模块定位

场景序列化模块是 Three Editor by AI 的数据持久化核心，负责三维场景的导出、导入、对象级序列化与反序列化，以及场景数据的完整往返恢复。

### 1.2 模块职责

- **场景导出**: 将当前三维场景完整序列化为结构化 JSON 数据
- **场景导入**: 将 JSON 数据反序列化为可交互的三维场景
- **对象导出**: 支持单个或部分对象的序列化，用于复制粘贴等场景
- **数据格式定义**: 定义场景 JSON 的标准结构，确保跨版本兼容
- **运行时隔离**: 严格区分可持久化数据与运行时临时数据

### 1.3 核心价值

- 完整的场景往返能力：导出后导入可恢复完全一致的场景状态
- 用户自定义数据完整保留：userData 中的业务属性、动画索引、锁定状态等不丢失
- 运行时对象零污染：动画混合器、活动动作等运行时对象绝不进入序列化数据
- 材质与纹理引用可恢复：材质参数规范化导出，纹理 URL 可正确映射
- 层级结构完整保留：Group 父子关系、对象变换、灯光配置全部恢复

---

## 2. 场景序列化规格

### 2.1 组件概述

**类名**: `ThreeViewer`  
**文件**: `src/core/ThreeViewer.js`  
**相关方法**: `exportScene()`, `loadScene(json)`  
**职责**: 场景级别的完整序列化与反序列化

### 2.2 场景导出规格

#### 2.2.1 功能描述

将当前三维场景中的所有对象、灯光、相机状态、场景配置序列化为结构化 JSON 对象。

#### 2.2.2 输入

无参数。方法读取当前场景的实时状态。

#### 2.2.3 输出

返回完整的场景 JSON 对象，包含以下顶层结构：

```
{
  objects: [...],       // 场景对象数组
  lights: [...],        // 灯光数组
  camera: {...},        // 相机状态
  background: number    // 背景颜色十六进制值
}
```

#### 2.2.4 处理流程

1. 创建场景数据根对象
2. 序列化相机状态（位置、旋转、视场角、近远裁剪面）
3. 序列化场景背景颜色
4. 遍历场景子对象，分类处理：
   - 灯光对象：提取类型、位置、颜色、强度等参数
   - 普通对象：提取名称、类型、变换数据
5. 返回完整的场景数据对象

#### 2.2.5 序列化内容

**相机数据**:
- 位置（三维向量）
- 旋转（四元数或欧拉角数组）
- 视场角（FOV）
- 近裁剪面距离
- 远裁剪面距离

**场景配置**:
- 背景颜色（十六进制数值）

**灯光数据**（每个灯光对象）:
- 类型（DirectionalLight、PointLight、SpotLight、AmbientLight、HemisphereLight）
- 位置（三维向量）
- 颜色（十六进制数值）
- 强度

**对象数据**（每个场景对象）:
- 名称
- 类型（primitive、group 等）
- 位置（三维向量数组）
- 旋转（欧拉角数组）
- 缩放（三维向量数组）

#### 2.2.6 排除规则

以下内容不参与序列化：

- 运行时对象：`_mixer`、`_activeAction`、`_clips` 等动画运行时状态
- 辅助对象：`grid_helper`、`axes_helper` 等编辑器辅助元素
- 相机对象本身：场景中的相机实例不导出（仅导出相机状态）
- 以 `_` 开头的 userData 属性

---

### 2.3 场景导入规格

#### 2.3.1 功能描述

将序列化的 JSON 数据反序列化为可交互的三维场景，恢复所有对象、灯光、相机状态和用户数据。

#### 2.3.2 输入

- `json`: Object - 场景数据对象

#### 2.3.3 输出

无返回值。场景加载完成后触发 `scene-loaded` 事件。

#### 2.3.4 处理流程

1. 清空当前场景（保留辅助对象）
2. 恢复相机状态（位置、目标点、视场角、裁剪面）
3. 恢复场景背景颜色
4. 重建灯光对象：
   - 根据类型创建对应灯光
   - 恢复颜色、强度、位置等参数
   - 恢复 userData
   - 添加到场景
5. 重建场景对象：
   - 识别对象类型（模型文件、几何体、其他）
   - 模型文件：通过资源管理器加载或从缓存获取
   - 几何体：通过对象管理器创建原始几何体
   - 恢复变换（位置、旋转、缩放）
   - 恢复 userData（包括 animationIndex）
   - 恢复材质配置
   - 添加到场景
6. 触发 `scene-loaded` 事件

#### 2.3.5 模型加载策略

**缓存优先**:
- 检查资源管理器中是否已缓存同名模型
- 若缓存存在且大小一致，直接使用缓存
- 若缓存不存在，通过 VFS 服务获取 URL 后加载

**加载参数**:
- 名称
- 位置
- 旋转
- 缩放
- userData
- 材质配置

#### 2.3.6 几何体创建策略

**原始几何体**:
- 通过对象管理器的 `createPrimitive()` 方法创建
- 传入类型、名称、变换、userData、材质等参数
- 创建后通过 `addObject()` 注册到场景

**类型识别**:
- `primitive` 类型：使用 `primitiveType` 字段确定具体几何体
- 其他类型：直接使用 `type` 字段创建

---

## 3. 对象序列化规格

### 3.1 组件概述

**类名**: `ObjectManager`  
**文件**: `src/core/ObjectManager.js`  
**相关方法**: `exportObjects(objectIds)`  
**职责**: 对象级别的序列化，支持单个或部分对象导出

### 3.2 对象导出规格

#### 3.2.1 功能描述

将指定对象（或所有对象）序列化为结构化数据，用于复制粘贴、局部保存等场景。

#### 3.2.2 输入

- `objectIds`: string[] - 对象 ID 数组，为空则导出所有对象

#### 3.2.3 输出

返回对象数据对象，包含：

```
{
  objects: [...],       // 对象数据数组
  timestamp: string     // 导出时间戳
}
```

#### 3.2.4 处理流程

1. 确定要导出的对象列表
2. 过滤掉灯光对象（灯光由场景序列化单独处理）
3. 对每个对象执行序列化：
   - 提取可序列化字段
   - 处理 userData（保留 animationIndex，排除运行时对象）
   - 识别对象类型和原始类型
   - 导出材质配置
   - 提取变换数据
4. 组装返回数据

#### 3.2.5 序列化字段

**每个对象包含以下字段**:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 对象唯一标识 |
| name | string | 对象名称 |
| type | string | 对象类型（primitive、light 等） |
| primitiveType | string | 原始类型（box、sphere 等） |
| position | number[] | 位置数组 [x, y, z] |
| rotation | number[] | 旋转数组 [x, y, z] |
| scale | number[] | 缩放数组 [x, y, z] |
| userData | object | 用户自定义数据 |
| material | object | 材质配置 |

#### 3.2.6 userData 处理规则

**保留字段**:
- `animationIndex`: 动画索引，用于恢复动画播放状态
- `fileInfo`: 模型文件信息，用于重新加载模型
- `locked`: 锁定状态
- `id`: 对象唯一标识
- 其他业务自定义字段

**排除字段**:
- 以 `_` 开头的属性（运行时对象）
- 函数类型属性
- THREE.Object3D 实例属性

#### 3.2.7 材质导出规格

**材质配置包含**:

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 材质类型 |
| color | string | 颜色值（#rrggbb 格式） |
| roughness | number | 粗糙度 |
| metalness | number | 金属度 |
| opacity | number | 透明度 |
| transparent | boolean | 是否透明 |
| map | string | 纹理名称 |

---

## 4. 数据格式规格

### 4.1 场景 JSON 格式

#### 4.1.1 顶层结构

```json
{
  "objects": [],
  "lights": [],
  "camera": {
    "position": [x, y, z],
    "rotation": [x, y, z, w],
    "fov": 75,
    "near": 0.1,
    "far": 1000
  },
  "background": 2236962
}
```

#### 4.1.2 对象数据格式

**几何体对象**:

```json
{
  "name": "MyBox",
  "type": "primitive",
  "primitiveType": "box",
  "position": [0, 1, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "userData": {
    "id": "uuid-string",
    "animationIndex": 0,
    "locked": false
  },
  "material": {
    "type": "MeshStandardMaterial",
    "color": "#888888",
    "roughness": 0.4,
    "metalness": 0.1
  }
}
```

**模型文件对象**:

```json
{
  "name": "Horse",
  "type": "model",
  "position": [0, 0, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "userData": {
    "id": "uuid-string",
    "fileInfo": {
      "name": "Horse.glb",
      "path": "/models",
      "drive": "static",
      "url": "/vfs/static/models/Horse.glb"
    },
    "animationIndex": 1
  }
}
```

#### 4.1.3 灯光数据格式

**方向光**:

```json
{
  "type": "DirectionalLight",
  "position": [5, 5, 5],
  "color": 16777215,
  "intensity": 1
}
```

**点光源**:

```json
{
  "type": "PointLight",
  "position": [0, 2, 0],
  "color": 16777215,
  "intensity": 1,
  "distance": 0,
  "decay": 2
}
```

**聚光灯**:

```json
{
  "type": "SpotLight",
  "position": [0, 3, 0],
  "color": 16777215,
  "intensity": 1,
  "distance": 0,
  "angle": 1.047,
  "penumbra": 0,
  "decay": 2
}
```

**环境光**:

```json
{
  "type": "AmbientLight",
  "color": 4210752,
  "intensity": 0.5
}
```

**半球光**:

```json
{
  "type": "HemisphereLight",
  "skyColor": 16777147,
  "groundColor": 526368,
  "intensity": 1
}
```

### 4.2 对象数据格式

```json
{
  "objects": [
    {
      "id": "uuid-string",
      "name": "MyBox",
      "type": "primitive",
      "primitiveType": "box",
      "position": [0, 1, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "userData": {
        "id": "uuid-string",
        "animationIndex": 0
      },
      "material": {
        "type": "MeshStandardMaterial",
        "color": "#888888",
        "roughness": 0.4,
        "metalness": 0.1
      }
    }
  ],
  "timestamp": "2026-04-14T00:00:00.000Z"
}
```

---

## 5. 动画状态序列化规格

### 5.1 动画索引持久化

**存储位置**: `userData.animationIndex`

**数据类型**: number

**语义**:
- `-1` 或 `undefined`: 不播放动画
- `0` 到 `N-1`: 播放第 N 个动画剪辑

**导出行为**:
- 导出时保留 `animationIndex` 字段
- 不导出 `_mixer`、`_activeAction`、`_clips` 等运行时对象

**导入行为**:
- 恢复 `userData.animationIndex` 到对象
- 动画混合器由渲染循环自动创建
- 根据 `animationIndex` 自动播放对应动画

### 5.2 动画恢复流程

1. 场景加载完成后，对象带有 `animations` 数组
2. 渲染循环检测到 `animations` 数组非空
3. 自动创建 `AnimationMixer` 实例并挂载到 `obj._mixer`
4. 读取 `userData.animationIndex`
5. 若索引有效，创建并播放对应动画剪辑
6. 动画剪辑挂载到 `obj._activeAction`

---

## 6. 材质序列化规格

### 6.1 材质导出规则

**导出原则**:
- 仅导出可序列化的材质参数
- 不导出纹理实例，仅导出纹理引用名称
- 材质类型必须保留

**支持的材质类型**:
- MeshStandardMaterial
- MeshBasicMaterial
- MeshLambertMaterial
- MeshPhongMaterial
- MeshPhysicalMaterial
- MeshNormalMaterial

### 6.2 材质导入规则

**导入原则**:
- 根据 `type` 字段创建对应材质实例
- 颜色值支持 `#rrggbb` 字符串格式
- 纹理引用通过名称查找并重新加载

---

## 7. 纹理 URL 映射规格

### 7.1 导出时 URL 处理

**规则**: 绝对路径转换为相对路径

**目的**: 确保序列化数据在不同环境中可移植

**示例**:
- 导出前: `/vfs/static/models/Horse.glb`
- 导出后: 保留 `fileInfo` 结构，包含 `drive`、`path`、`name`

### 7.2 导入时 URL 处理

**规则**: 相对路径通过 VFS 服务解析为绝对路径

**流程**:
1. 读取 `fileInfo.drive` 确定文件系统驱动
2. 读取 `fileInfo.path` 和 `fileInfo.name` 构建完整路径
3. 调用 VFS 服务的 `url()` 方法获取可访问 URL
4. 使用 URL 加载模型

---

## 8. 事件系统规格

### 8.1 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `scene-loaded` | 场景加载完成 | `{ scene: THREE.Scene }` |
| `add-object` | 对象添加到场景 | `THREE.Object3D` |
| `before-add-object` | 对象添加到场景前 | `THREE.Object3D` |
| `before-render` | 每帧渲染前 | `{ delta, now }` |

### 8.2 监听的事件

| 事件名 | 来源 | 响应动作 |
|--------|------|----------|
| `object-transform-updated` | ObjectManager | 标记需要重新渲染 |
| `scene-save-requested` | UI 组件 | 触发现场景导出 |

---

## 9. 复制粘贴序列化规格

### 9.1 深度克隆

**方法**: `deepCloneObject(source)`

**功能**:
- 使用 Three.js 原生 `clone(true)` 方法
- 遍历所有子对象，修复材质类型
- 确保材质为标准 MeshStandardMaterial 实例
- 确保 color 字段为 THREE.Color 实例

**材质修复逻辑**:
1. 若材质为数组，仅保留第一个并转为单一材质
2. 若材质类型不匹配，替换为默认材质
3. 若 color 字段无效，创建默认颜色

### 9.2 复制操作

**方法**: `copyObjects(objectIds)`

**流程**:
1. 根据 ID 获取源对象
2. 对每个对象执行深度克隆
3. 将克隆对象存储到剪贴板

### 9.3 粘贴操作

**方法**: `pasteObjects(position)`

**流程**:
1. 从剪贴板读取克隆对象
2. 对每个对象再次深度克隆（避免修改剪贴板）
3. 重新生成唯一 ID
4. 修改名称（添加 `_copy` 后缀）
5. 设置到指定位置
6. 添加到管理器

---

## 10. 依赖关系

### 10.1 内部依赖

```
ThreeViewer → ObjectManager (对象创建)
ThreeViewer → AssetManager (模型加载)
ThreeViewer → VFS Service (文件 URL 解析)
ObjectManager → geometryUtils (几何体创建)
```

### 10.2 外部依赖

| 依赖 | 用途 |
|------|------|
| three | Three.js 核心库，提供对象克隆、材质创建等 |
| uuid | 唯一 ID 生成，用于粘贴时重新生成 ID |
| mitt | 事件总线，用于场景加载完成通知 |

---

## 11. 使用示例

### 11.1 完整场景导出导入

```javascript
// 导出场景
const sceneData = viewer.exportScene();

// 保存数据（例如到 localStorage 或服务器）
saveToStorage(sceneData);

// 加载场景
const loadedData = loadFromStorage();
await viewer.loadScene(loadedData);
```

### 11.2 对象导出

```javascript
// 导出所有对象
const allObjects = objectManager.exportObjects();

// 导出指定对象
const selectedObjects = objectManager.exportObjects(['id1', 'id2']);
```

### 11.3 复制粘贴

```javascript
// 复制选中对象
objectManager.copyObjects(selectedIds);

// 粘贴到新位置
const pasted = objectManager.pasteObjects(new THREE.Vector3(5, 0, 0));
```

---

## 12. 测试要点

### 12.1 单元测试

- [ ] 场景导出包含所有对象
- [ ] 场景导出排除运行时对象
- [ ] 场景导出排除辅助对象
- [ ] 灯光数据正确序列化
- [ ] 相机状态正确序列化
- [ ] 背景颜色正确序列化
- [ ] 对象 userData 完整保留
- [ ] animationIndex 正确保留
- [ ] 材质配置正确导出
- [ ] 对象导出过滤灯光
- [ ] 深度克隆修复材质类型
- 复制粘贴重新生成 ID

### 12.2 集成测试

- [ ] 完整场景往返恢复
- [ ] 模型文件加载与恢复
- [ ] 缓存模型直接使用
- [ ] 动画状态恢复与播放
- [ ] 灯光参数完整恢复
- [ ] 相机状态完整恢复
- [ ] 材质参数完整恢复
- [ ] Group 层级结构恢复

### 12.3 边界测试

- [ ] 空场景导出导入
- [ ] 大量对象场景导出
- [ ] 嵌套 Group 结构
- [ ] 无效 JSON 数据加载
- [ ] 缺失字段数据加载
- [ ] 模型加载失败处理
- [ ] 缓存失效重新加载

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [API 清单](../API.md)
- [001-Core 核心引擎模块](../specs-v1/001-core/spec.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始模块规格文档 |
