# 010-UI 编辑器 UI 组件模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

UI 组件模块提供编辑器的所有用户界面组件，包括工具栏、属性面板、对话框等。

### 1.2 模块职责

- **编辑器面板**: 工具栏、属性面板、资源浏览器等
- **属性编辑**: 各种属性编辑组件
- **对话框**: 配置、选择、保存对话框
- **场景视图**: 3D 场景渲染组件

---

## 2. 编辑器面板组件

### 2.1 Toolbar.vue

**功能**:
- 变换工具切换（移动/旋转/缩放）
- 控制器切换（Orbit/Map/Fly）
- 撤销/重做按钮
- 保存/加载按钮
- 配置按钮

**UI 布局**:
```
┌─────────────────────────────────────────────────────────┐
│ [移动] [旋转] [缩放] | [轨道] [地图] [飞行] | [↶] [↷] [💾] [⚙]│
└─────────────────────────────────────────────────────────┘
```

### 2.2 PropertyPanel.vue

**功能**:
- 对象属性编辑
- 可折叠分类
- 搜索过滤
- 批量编辑支持

### 2.3 Inspector.vue

**功能**:
- 对象信息检查
- 层级树显示
- 快速定位

### 2.4 AssetBrowser.vue

**功能**:
- 资源浏览
- 搜索过滤
- 拖拽上传
- 收藏管理

### 2.5 VfsFileBrowser.vue

**功能**:
- VFS 文件浏览
- 目录导航
- 文件选择

---

## 3. 属性编辑组件

### 3.1 TransformPropertyPane

**编辑内容**:
- 位置 (X, Y, Z)
- 旋转 (X, Y, Z)
- 缩放 (X, Y, Z)
- Y 轴锁定开关

### 3.2 MaterialPropertyPane

**编辑内容**:
- 材质类型选择
- 颜色选择器
- 参数滑块（roughness、metalness 等）
- 纹理槽位

### 3.3 AnimationPropertyPane

**编辑内容**:
- 动画选择下拉
- 播放控制
- 速度调节
- 循环模式

### 3.4 UserDataPropertyPane

**编辑内容**:
- 自定义属性添加/编辑/删除
- 属性类型选择
- 嵌套属性支持

---

## 4. 对话框组件

### 4.1 EditorConfigDialog

**功能**: 编辑器配置
- 渲染设置
- 控制器设置
- 快捷键设置

### 4.2 VfsFileChooserDialog

**功能**: VFS 文件选择
- 目录浏览
- 文件预览
- 多选支持

### 4.3 VfsFileSaverDialog

**功能**: 文件保存
- 路径选择
- 文件名输入
- 覆盖确认

### 4.4 VfsMaterialChooserDialog

**功能**: 材质选择
- 材质库浏览
- 材质预览
- 搜索过滤

---

## 5. 场景组件

### 5.1 SceneViewer.vue

**功能**:
- 3D 场景渲染容器
- 拖拽添加对象
- 鼠标事件处理

### 5.2 ViewportControls.vue

**功能**:
- 视图控制面板
- 预设视角按钮
- 相机位置显示

### 5.3 CubeViewportControls.vue

**功能**:
- 立方体视角控件
- 点击切换视角

### 5.4 InteractionHints.vue

**功能**:
- 操作提示显示
- 控制器说明
- 快捷键提示

---

## 6. 组件依赖关系

```
Editor.vue
├── Toolbar.vue
├── PropertyPanel.vue
│   ├── TransformPropertyPane
│   ├── MaterialPropertyPane
│   ├── AnimationPropertyPane
│   └── UserDataPropertyPane
├── Inspector.vue
├── AssetBrowser.vue
├── VfsFileBrowser.vue
├── SceneViewer.vue
│   ├── ViewportControls.vue
│   ├── CubeViewportControls.vue
│   └── InteractionHints.vue
└── Dialogs
    ├── EditorConfigDialog
    ├── VfsFileChooserDialog
    ├── VfsFileSaverDialog
    └── VfsMaterialChooserDialog
```

---

## 7. 使用示例

```vue
<template>
  <div class="editor">
    <Toolbar />
    <div class="main-content">
      <SceneViewer />
      <div class="sidebar">
        <PropertyPanel />
        <Inspector />
      </div>
    </div>
    <AssetBrowser />
  </div>
</template>

<script setup>
import Toolbar from './components/editor/Toolbar.vue';
import SceneViewer from './components/scene/SceneViewer.vue';
import PropertyPanel from './components/editor/PropertyPanel.vue';
import Inspector from './components/editor/Inspector.vue';
import AssetBrowser from './components/editor/AssetBrowser.vue';
</script>
```

---

**版本**: 1.0 | **日期**: 2026-04-07
