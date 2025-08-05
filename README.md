# 3D 场景编辑器 (Three Editor by AI)

一个基于 Vue 3 + Three.js 的现代化3D场景编辑器，支持三维模型的拖放、调整和属性配置。

## ✅ 功能体系
- 3D场景渲染和管理
- 多种基础几何体创建
- 完整的对象变换系统（移动、旋转、缩放）
- 单选（多选、框选功能已移除，仅支持单选）
- 撤销重做历史记录
- 3D模型和纹理加载（GLTF、OBJ、FBX等格式）
- 拖拽上传和资源管理
- 相机控制和预设视角
- 材质编辑和属性调整
- 场景序列化和导入导出

## 🚀 技术栈

- **前端框架**: Vue 3 + Vite
- **3D引擎**: Three.js
- **构建工具**: Vite
- **网络请求**: Fetch API
- **工具库**: 
  - Lodash - 实用工具函数库
  - Day.js - 轻量级日期时间库

## 📁 项目结构

> 2025-08-05：Toolbar.vue 已移除“设置”分组及“网格吸附、线框模式”相关功能。

```
three-editor-by-ai/
├── public/                     # 静态资源
│   └── vite.svg
├── src/
│   ├── assets/                 # 静态资源 (3D模型、纹理等)
│   │   └── vue.svg
│   ├── components/             # Vue 组件
│   │   ├── editor/            # 编辑器 UI 组件
│   │   │   ├── PropertyPanel.vue    # 属性面板
│   │   │   ├── Toolbar.vue          # 工具栏
│   │   │   ├── AssetBrowser.vue     # 资源浏览器
│   │   │   └── Inspector.vue        # 对象检查器
│   │   ├── scene/             # 3D 场景组件
│   │   │   ├── SceneViewer.vue      # 主场景视图
│   │   │   ├── InteractionHints.vue     # 操作提示组件
│   │   │   ├── ViewportControls.vue     # 视图控制面板组件
│   │   │   ├── CubeViewportControls.vue # 立方体视角控件
│   │   │   ├── ObjectGizmo.vue      # 对象操作控制器
│   │   │   └── Camera.vue           # 相机控制
│   ├── composables/           # Vue Composition API 可组合函数
│   │   ├── useScene.js        # 场景管理
│   │   ├── useObjectSelection.js  # 对象选择
│   │   ├── useTransform.js    # 变换操作
│   │   └── useAssets.js       # 资源管理
│   ├── core/                  # 核心 Three.js 逻辑
│   │   ├── SceneManager.js    # 场景管理器
│   │   ├── ObjectManager.js   # 对象管理器
│   │   ├── InputManager.js    # 输入处理
│   │   └── AssetLoader.js     # 资源加载器
│   ├── api/                  # API 接口
│   │   ├── *.api.js            # 各种模块API接口
│   ├── utils/                 # 工具函数
│   │   ├── mathUtils.js      # 数学工具
│   │   ├── geometryUtils.js  # 几何工具
│   │   └── fileUtils.js      # 文件处理工具
│   ├── App.vue               # 根组件（仅负责引入Editor.vue）
│   ├── Editor.vue            # 主编辑器组件（包含全部业务与UI）
│   ├── main.js               # 应用入口
│   └── style.css             # 全局样式
├── .gitignore                # Git 忽略文件
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── package-lock.json         # 依赖锁定
├── vite.config.js            # Vite 配置
└── README.md                 # 项目说明
```

## 🎯 主要功能

- **3D场景渲染**: 基于 Three.js 的高性能 3D 渲染
- **几何体创建**: 支持多种基础和扩展几何体创建
  - 基础几何体: 立方体、球体、圆柱体、平面、圆锥体、圆环体
  - 扩展几何体: 十二面体、二十面体、八面体、四面体、环形、管道
  - 灯光对象: 方向光、点光源、聚光灯、环境光、半球光
  - 其他对象: 相机、空对象、文本、精灵
- **模型管理**: 支持多种 3D 模型格式的导入和管理
- **交互操作**: 
  - 资源浏览器中直接添加几何体
  - 实时变换操作 (位移、旋转、缩放)
  - 单对象选择和编辑（多选、框选功能已移除，仅支持单选）
- **属性编辑**: 实时修改模型的材质、几何体等属性
- **场景管理**: 完整的场景层级管理和序列化
- **资源浏览**: 内置资源管理器，支持模型预览和几何体创建

## 🏗️ 架构设计

### 组件层次

1. **UI 层** (`components/editor/`): 负责用户界面和交互
2. **主编辑器组件** (`Editor.vue`): 负责所有业务逻辑和UI的集成
3. **3D 渲染层** (`components/scene/`): 处理 3D 场景渲染和显示
4. **逻辑层** (`composables/`, `core/`): 业务逻辑和状态管理
5. **API层** (`api/`): 数据请求和外部接口
6. **工具层** (`utils/`): 通用工具函数

### 技术特点

- **响应式状态**: 使用 Vue 3 Composition API 管理应用状态
- **模块化设计**: 清晰的代码组织和职责分离
- **类型安全**: 良好的代码结构支持 TypeScript 迁移
- **性能优化**: 合理的组件懒加载和渲染优化

## 📋 开发规范

- 遵循 Vue 3 组合式 API 最佳实践
- 使用 ES6+ 语法特性
- 组件命名采用 PascalCase
- 文件和目录命名采用 camelCase
- Git 提交信息格式: `feat: 功能描述`
