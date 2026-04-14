# 004-Material 材质系统模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 模块概述

### 1.1 模块定位

材质系统模块是 Three Editor by AI 的核心编辑功能之一，负责 Three.js 材质的选择、编辑、预览和持久化管理。

### 1.2 模块职责

- **材质状态管理**: 跟踪当前选中对象的材质属性，支持撤销还原
- **材质编辑**: 提供标准模式和专家模式两种编辑界面
- **纹理管理**: 支持纹理贴图槽位的加载、替换和预览
- **材质预览**: 实时渲染材质球预览
- **材质选择**: 从虚拟文件系统选择并应用材质
- **多材质类型支持**: 覆盖 7 种以上 Three.js 内置材质

### 1.3 核心价值

- 双模式编辑体验，兼顾易用性和专业深度
- 完整的材质属性覆盖，支持所有常用参数
- 纹理与材质无缝集成，支持 VFS 文件系统
- 撤销/重做友好，材质变更可回溯

---

## 2. useMaterial 组合式函数规格

### 2.1 组件概述

**文件名**: `useMaterial.js`  
**路径**: `src/composables/useMaterial.js`  
**大小**: 459 行  
**职责**: 材质状态管理、属性跟踪、纹理 URL 映射、材质预览、材质选择子系统

### 2.2 核心功能

#### 2.2.1 材质状态跟踪

**功能描述**: 监控当前选中对象的材质属性变化，维护材质状态快照。

**输入**:
- 选中对象（来自 useObjectSelection）

**输出**:
- 响应式材质属性对象

**处理流程**:
1. 监听选中对象变化
2. 读取对象材质实例
3. 提取材质属性到响应式状态
4. 备份原始材质用于撤销

---

#### 2.2.2 原始材质备份

**功能描述**: 在修改材质前备份原始材质数据，支持撤销操作。

**备份内容**:
- 材质类型
- 所有颜色属性（color, emissive 等）
- 所有数值属性（roughness, metalness, opacity 等）
- 所有布尔属性（wireframe, transparent 等）
- 所有纹理引用（map, normalMap, roughnessMap 等）

**恢复机制**:
- 通过撤销系统调用恢复备份数据
- 支持多次撤销，每次修改独立备份

---

#### 2.2.3 纹理 URL 重映射

**功能描述**: 处理纹理贴图 URL 变更，确保纹理正确加载和显示。

**支持的纹理槽位**:
- map（漫反射贴图）
- normalMap（法线贴图）
- roughnessMap（粗糙度贴图）
- metalnessMap（金属度贴图）
- emissiveMap（自发光贴图）
- aoMap（环境光遮蔽贴图）
- displacementMap（置换贴图）
- alphaMap（透明度贴图）

**处理流程**:
1. 接收新纹理 URL
2. 从 VFS 获取纹理文件
3. 创建或更新 THREE.Texture 实例
4. 赋值到材质对应槽位
5. 标记材质需要更新（material.needsUpdate = true）

---

#### 2.2.4 颜色类型归一化

**功能描述**: 确保颜色值在不同组件间保持一致的格式。

**归一化规则**:
- 输入支持: 十六进制字符串（`#ff0000`）、十六进制数字（`0xff0000`）、RGB 对象（`{r, g, b}`）
- 输出统一: THREE.Color 实例
- 透明度通道: 单独管理，不混入颜色值

---

#### 2.2.5 材质预览渲染

**功能描述**: 在属性面板中渲染材质球预览，实时反映材质变更。

**预览特性**:
- 独立小型 Three.js 场景
- 标准光照环境（环境光 + 方向光）
- 旋转动画展示材质全貌
- 支持球体和立方体两种预览几何体

---

#### 2.2.6 材质选择子系统

**功能描述**: 从虚拟文件系统选择材质文件并应用到选中对象。

**集成组件**:
- VfsMaterialChooserDialog.vue: 材质选择对话框
- MaterialSelectPropertyItem.vue: 材质选择属性项

---

### 2.3 支持的材质类型

| 材质类型 | Three.js 类名 | 特性 | 适用场景 |
|----------|---------------|------|----------|
| 标准材质 | MeshStandardMaterial | PBR 物理渲染，roughness/metalness | 通用场景，推荐默认使用 |
| 基础材质 | MeshBasicMaterial | 不受光照影响，纯色显示 | UI 元素，线框显示 |
| Phong 材质 | MeshPhongMaterial | 高光反射，specular/shininess | 传统高光效果 |
| Lambert 材质 | MeshLambertMaterial | 漫反射，无高光 | 低性能设备，简单着色 |
| 物理材质 | MeshPhysicalMaterial | 扩展 PBR，clearcoat/ior/transmission | 玻璃、清漆等高级效果 |
| 卡通材质 | MeshToonMaterial | 卡通渲染，渐变着色 | 卡通风格，二次元渲染 |
| 法线材质 | MeshNormalMaterial | 法线可视化 | 调试，特殊效果 |

### 2.4 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getCurrentMaterial()` | - | THREE.Material | 获取当前选中对象的材质 |
| `backupMaterial()` | - | Object | 备份当前材质数据 |
| `restoreMaterial(backup)` | backup: Object | void | 从备份恢复材质 |
| `updateMaterialProperty(key, value)` | key: string, value: any | void | 更新材质属性 |
| `setTexture(slot, url)` | slot: string, url: string | Promise<void> | 设置纹理贴图 |
| `removeTexture(slot)` | slot: string | void | 移除纹理贴图 |
| `changeMaterialType(type)` | type: string | void | 切换材质类型 |
| `getPreviewScene()` | - | {scene, camera, renderer} | 获取预览场景 |
| `normalizeColor(color)` | color: any | THREE.Color | 颜色格式归一化 |
| `selectMaterialFromVfs(path)` | path: string | Promise<void> | 从 VFS 选择材质 |

---

## 3. MaterialPropertyPane 标准模式规格

### 3.1 组件概述

**文件名**: `MaterialPropertyPane.vue`  
**路径**: `src/components/property/MaterialPropertyPane.vue`  
**职责**: 标准模式下显示和编辑材质属性

### 3.2 功能规格

#### 3.2.1 材质类型选择器

**功能描述**: 下拉菜单切换材质类型。

**交互**:
1. 点击下拉菜单显示 7 种材质类型
2. 选择后弹出确认提示（材质参数会重置）
3. 确认后切换材质类型并更新预览

---

#### 3.2.2 颜色属性编辑

**支持的颜色属性**:

| 属性名 | 说明 | 默认值 |
|--------|------|--------|
| color | 基础颜色 | 0x888888 |
| emissive | 自发光颜色 | 0x000000 |
| emissiveIntensity | 自发光强度 | 1.0 |

**编辑组件**: Element Plus 颜色选择器（el-color-picker）

---

#### 3.2.3 数值属性编辑

**支持的数值属性**:

| 属性名 | 范围 | 步长 | 说明 |
|--------|------|------|------|
| roughness | 0-1 | 0.01 | 粗糙度（标准/物理材质） |
| metalness | 0-1 | 0.01 | 金属度（标准/物理材质） |
| opacity | 0-1 | 0.01 | 透明度 |
| transparent | boolean | - | 是否启用透明 |
| wireframe | boolean | - | 线框模式 |
| side | 0/1/2 | - | 渲染面（Front/Back/Double） |

**编辑组件**: Element Plus 滑块（el-slider）和开关（el-switch）

---

#### 3.2.4 纹理贴图槽位

**标准模式支持的纹理槽位**:

| 槽位 | 属性名 | 说明 |
|------|--------|------|
| 漫反射 | map | 基础颜色贴图 |
| 法线 | normalMap | 法线贴图 |
| 粗糙度 | roughnessMap | 粗糙度贴图 |
| 金属度 | metalnessMap | 金属度贴图 |
| 自发光 | emissiveMap | 自发光贴图 |

**交互**:
- 点击槽位打开 TexturePropertyPane
- 显示当前纹理缩略图
- 支持从 VFS 选择纹理文件
- 支持移除已分配的纹理

---

#### 3.2.5 材质导出

**功能描述**: 将当前材质导出为 JSON 文件。

**导出内容**:
- 材质类型
- 所有可序列化属性
- 纹理引用路径（非纹理数据本身）

**导出格式**:
```json
{
  "type": "MeshStandardMaterial",
  "uuid": "xxx-xxx-xxx",
  "color": 8888888,
  "roughness": 0.5,
  "metalness": 0.3,
  "textures": {
    "map": "/vfs/textures/wood.jpg",
    "normalMap": "/vfs/textures/wood_normal.jpg"
  }
}
```

---

## 4. MaterialPropertyPaneAdv 专家模式规格

### 4.1 组件概述

**文件名**: `MaterialPropertyPaneAdv.vue`  
**路径**: `src/components/property/MaterialPropertyPaneAdv.vue`  
**职责**: 专家模式下提供细粒度的材质参数控制

### 4.2 子面板清单

专家模式包含 16 个专用子面板，每个子面板聚焦特定参数组：

| 序号 | 子面板 | 负责参数 |
|------|--------|----------|
| 1 | 基础属性面板 | type, name, uuid, side |
| 2 | 颜色属性面板 | color, emissive, emissiveIntensity |
| 3 | PBR 属性面板 | roughness, metalness, envMap |
| 4 | 透明度面板 | opacity, transparent, alphaTest, depthWrite |
| 5 | 线框面板 | wireframe, wireframeLinewidth |
| 6 | 法线贴图面板 | normalMap, normalScale, normalMapType |
| 7 | 粗糙度贴图面板 | roughnessMap |
| 8 | 金属度贴图面板 | metalnessMap |
| 9 | 自发光贴图面板 | emissiveMap, emissive, emissiveIntensity |
| 10 | 环境光遮蔽面板 | aoMap, aoMapIntensity |
| 11 | 置换贴图面板 | displacementMap, displacementScale, displacementBias |
| 12 | 透明度贴图面板 | alphaMap |
| 13 | 光照贴图面板 | lightMap, lightMapIntensity |
| 14 | 纹理变换面板 | 所有纹理的 offset, repeat, rotation, center |
| 15 | 物理扩展面板 | clearcoat, clearcoatRoughness, ior, transmission, thickness（仅物理材质） |
| 16 | 高级渲染面板 | flatShading, vertexColors, fog, toneMapped |

### 4.3 专家模式特性

- 所有参数均可独立编辑
- 参数分组清晰，减少视觉混乱
- 支持参数重置为默认值
- 实时预览变更效果
- 物理材质专属参数仅在切换到 MeshPhysicalMaterial 时显示

---

## 5. TexturePropertyPane 纹理编辑规格

### 5.1 组件概述

**文件名**: `TexturePropertyPane.vue`  
**路径**: `src/components/property/TexturePropertyPane.vue`  
**职责**: 纹理贴图槽位管理和纹理属性编辑

### 5.2 功能规格

#### 5.2.1 纹理槽位管理

**功能描述**: 管理材质上的纹理贴图槽位。

**操作**:
- 添加纹理: 从 VFS 选择图片文件
- 替换纹理: 选择新文件替换当前纹理
- 移除纹理: 清空槽位，释放纹理资源
- 预览纹理: 查看纹理缩略图

---

#### 5.2.2 TexturePropertyItem 子组件

**文件名**: `TexturePropertyItem.vue`  
**职责**: 单个纹理槽位的编辑项

**显示内容**:
- 纹理名称
- 缩略图预览
- 文件路径
- 操作按钮（选择、移除）

---

#### 5.2.3 纹理属性编辑

**可编辑的纹理属性**:

| 属性 | 类型 | 说明 |
|------|------|------|
| offset | Vector2 | 纹理偏移 |
| repeat | Vector2 | 纹理重复次数 |
| rotation | Number | 纹理旋转角度 |
| center | Vector2 | 旋转中心 |
| wrapS | 枚举 | 水平包裹模式（Repeat/Clamp/Mirror） |
| wrapT | 枚举 | 垂直包裹模式 |
| magFilter | 枚举 | 放大过滤（Nearest/Linear） |
| minFilter | 枚举 | 缩小过滤 |
| anisotropy | Number | 各向异性过滤级别 |

---

## 6. MaterialSelectPropertyItem 材质选择规格

### 6.1 组件概述

**文件名**: `MaterialSelectPropertyItem.vue`  
**路径**: `src/components/property/MaterialSelectPropertyItem.vue`  
**职责**: 从 VFS 选择预定义材质文件并应用到对象

### 6.2 功能规格

#### 6.2.1 材质选择对话框集成

**集成组件**: VfsMaterialChooserDialog.vue

**交互流程**:
1. 点击材质选择项打开对话框
2. 浏览 VFS 中的材质文件（.json 格式）
3. 选择目标材质文件
4. 确认后加载材质并应用到选中对象
5. 属性面板刷新显示新材质参数

---

#### 6.2.2 材质文件格式

**文件扩展名**: `.json`

**文件结构**:
```json
{
  "version": "1.0",
  "name": "Wood Material",
  "type": "MeshStandardMaterial",
  "properties": {
    "color": 8947848,
    "roughness": 0.8,
    "metalness": 0.0
  },
  "textures": {
    "map": "/vfs/textures/wood_diffuse.jpg",
    "normalMap": "/vfs/textures/wood_normal.jpg",
    "roughnessMap": "/vfs/textures/wood_roughness.jpg"
  }
}
```

---

## 7. 状态管理规格

### 7.1 材质状态结构

```javascript
{
  // 当前材质引用
  currentMaterial: THREE.Material | null,
  
  // 材质属性快照（响应式）
  properties: {
    type: string,
    color: THREE.Color,
    emissive: THREE.Color,
    emissiveIntensity: number,
    roughness: number,
    metalness: number,
    opacity: number,
    transparent: boolean,
    wireframe: boolean,
    side: number,
    // ... 其他属性
  },
  
  // 纹理引用
  textures: {
    map: THREE.Texture | null,
    normalMap: THREE.Texture | null,
    roughnessMap: THREE.Texture | null,
    metalnessMap: THREE.Texture | null,
    emissiveMap: THREE.Texture | null,
    // ... 其他槽位
  },
  
  // 备份栈（用于撤销）
  backupStack: Array<{
    timestamp: number,
    materialData: Object
  }>
}
```

### 7.2 状态生命周期

```
对象选中 → 读取材质 → 提取属性 → 显示面板
    ↓
用户修改 → 更新材质 → 触发预览 → 记录备份
    ↓
撤销操作 → 弹出备份 → 恢复材质 → 刷新面板
    ↓
对象切换 → 清空状态 → 读取新材质
```

---

## 8. 事件系统

### 8.1 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `material-changed` | 材质属性变更 | `{ object, property, oldValue, newValue }` |
| `material-type-changed` | 材质类型切换 | `{ object, oldType, newType }` |
| `texture-added` | 纹理贴图添加 | `{ object, slot, texture }` |
| `texture-removed` | 纹理贴图移除 | `{ object, slot }` |
| `material-preview-updated` | 预览场景更新 | `{ scene, material }` |

### 8.2 监听的事件

| 事件名 | 来源 | 响应动作 |
|--------|------|----------|
| `object-selected` | useObjectSelection | 读取并显示材质属性 |
| `object-deselected` | useObjectSelection | 清空材质状态 |
| `undo-requested` | 撤销系统 | 恢复材质备份 |
| `redo-requested` | 重做系统 | 重应用材质变更 |

---

## 9. 依赖关系

### 9.1 内部依赖

```
useMaterial → useThreeViewer
useMaterial → useObjectSelection
MaterialPropertyPane → useMaterial
MaterialPropertyPaneAdv → useMaterial
TexturePropertyPane → useMaterial
MaterialSelectPropertyItem → useMaterial
VfsMaterialChooserDialog → vfs-service
```

### 9.2 外部依赖

| 依赖 | 用途 |
|------|------|
| three | Three.js 材质类和纹理类 |
| vue | Vue 3 Composition API |
| element-plus | UI 组件（颜色选择器、滑块等） |

---

## 10. 使用示例

### 10.1 标准模式编辑材质

```vue
<template>
  <MaterialPropertyPane v-if="selectedObject" />
</template>

<script setup>
import { computed } from 'vue';
import { useObjectSelection } from '@/composables/useObjectSelection';
import MaterialPropertyPane from '@/components/property/MaterialPropertyPane.vue';

const { selectedObjects } = useObjectSelection();
const selectedObject = computed(() => selectedObjects[0]);
</script>
```

### 10.2 通过 useMaterial 修改材质

```javascript
import { useMaterial } from '@/composables/useMaterial';

const materialManager = useMaterial();

// 修改颜色
materialManager.updateMaterialProperty('color', '#ff0000');

// 设置纹理
await materialManager.setTexture('map', '/vfs/textures/wood.jpg');

// 切换材质类型
materialManager.changeMaterialType('MeshPhysicalMaterial');

// 撤销上次修改
materialManager.restoreMaterial(materialManager.backupStack.pop());
```

---

## 11. 测试要点

### 11.1 单元测试

- [ ] useMaterial 初始化
- [ ] 材质属性读取
- [ ] 材质属性更新
- [ ] 材质类型切换
- [ ] 颜色归一化
- [ ] 纹理 URL 重映射
- [ ] 材质备份与恢复
- [ ] 预览场景创建

### 11.2 组件测试

- [ ] MaterialPropertyPane 渲染
- [ ] 颜色选择器交互
- [ ] 滑块参数调整
- [ ] 纹理槽位显示
- [ ] 材质类型下拉选择
- [ ] MaterialPropertyPaneAdv 子面板渲染
- [ ] TexturePropertyPane 纹理选择
- [ ] MaterialSelectPropertyItem VFS 集成

### 11.3 集成测试

- [ ] 选中对象后材质面板自动显示
- [ ] 修改材质后预览实时更新
- [ ] 纹理加载后材质正确更新
- [ ] 撤销操作恢复材质状态
- [ ] 从 VFS 选择材质并应用
- [ ] 材质导出与导入一致性

### 11.4 性能测试

- [ ] 材质预览渲染帧率
- [ ] 大纹理加载时间
- [ ] 频繁材质变更的内存占用
- [ ] 多材质对象切换响应时间

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [API 清单](../API.md)
- [006-VFS 虚拟文件系统](../006-vfs/spec.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始模块规格文档 |
