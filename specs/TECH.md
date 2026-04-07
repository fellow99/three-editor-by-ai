# Three Editor by AI - 技术选型

**生成日期**: 2026-04-07  
**项目版本**: 0.1.0

---

## 概述

本项目是一个基于现代 Web 技术栈的 3D 场景编辑器，采用组件化架构和响应式设计。

---

## 核心技术栈

### 前端框架

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Vue** | 3.5.17 | 应用框架 | 组合式 API、响应式系统、生态完善 |
| **Vite** | 7.0.4 | 构建工具 | 极速启动、热更新、现代化构建 |
| **@vitejs/plugin-vue** | 6.0.0 | Vue 集成 | 官方插件，支持 Vue 3 特性 |

**选型说明**:
- Vue 3 Composition API 提供更好的逻辑复用和代码组织
- Vite 相比 Webpack 有显著的性能优势，开发体验更好
- 团队熟悉 Vue 生态，学习成本低

---

### 3D 引擎

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Three.js** | 0.182.0 | 3D 渲染引擎 | 最流行的 Web 3D 库、文档完善、生态丰富 |

**关键扩展**:
- `3d-tiles-renderer` (0.4.16) - 3D Tiles 加载支持
- `three-viewport-gizmo` (2.2.0) - 立方体视角控件

**选型说明**:
- Three.js 是 Web 3D 的事实标准
- 社区活跃，示例和教程丰富
- 支持 WebGL 1/2，兼容性好

---

### UI 组件库

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Element Plus** | 2.10.5 | UI 组件库 | 主流 Vue 3 组件库、组件丰富、文档完善 |

**主要使用组件**:
- Dialog - 对话框
- Select - 下拉选择器
- Input - 输入框
- Slider - 滑块
- Button - 按钮
- Collapse - 折叠面板
- Table - 表格
- Tree - 树形控件

**选型说明**:
- 专为 Vue 3 设计，支持 Composition API
- 组件覆盖全面，满足编辑器 UI 需求
- 主题定制能力强

---

### 样式方案

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Sass** | 1.90.0 | CSS 预处理器 | 成熟稳定、功能强大、生态完善 |

**使用方式**:
- 全局样式：`src/style.scss`
- 组件样式：各 `.vue` 文件的 `<style lang="scss">`
- 组件样式隔离：使用 `scoped`

**选型说明**:
- Sass 是最成熟的 CSS 预处理器
- 变量、混入、嵌套等特性提升样式开发效率
- 与 Vite 集成良好

---

## 工具库

### 状态管理

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Vue Reactivity** | 内置 | 响应式状态 | Vue 3 内置响应式系统 |
| **mitt** | 3.0.1 | 事件总线 | 轻量级、简洁 API、模块解耦 |

**使用说明**:
- 使用 Vue 3 的 `reactive`、`ref`、`computed` 管理状态
- 核心管理器（ThreeViewer、ObjectManager 等）使用 mitt 实现事件解耦
- 未使用 Pinia/Vuex，采用轻量级组合式函数管理状态

**选型说明**:
- 项目规模适中，无需重型状态管理
- Composition API 提供足够的状态组织能力
- mitt 用于跨模块事件通信，保持松耦合

---

### 工具函数

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Lodash** | 4.17.21 | 工具函数库 | 功能全面、性能优化、广泛使用 |

**主要使用**:
- `cloneDeep` - 深度克隆
- `debounce` - 防抖
- `throttle` - 节流
- `merge` - 对象合并
- `isArray`, `isObject` - 类型判断

**选型说明**:
- Lodash 是最全面的工具函数库
- 经过充分测试，可靠性高
- 按需引入减少打包体积

---

### 日期时间

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Day.js** | 1.11.13 | 日期时间库 | 轻量级、API 友好、不可变数据 |

**主要使用**:
- 文件时间戳格式化
- 场景保存时间记录

**选型说明**:
- Day.js 仅 2KB，远轻于 Moment.js
- API 与 Moment.js 兼容，学习成本低
- 不可变数据避免副作用

---

### 唯一 ID 生成

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **uuid** | 13.0.0 | 唯一标识符 | 标准实现、多版本支持 |

**主要使用**:
- 对象 ID 生成
- 场景元素唯一标识

**选型说明**:
- UUID 是行业标准
- 碰撞概率极低
- 版本 4 (随机) 满足需求

---

### MIME 类型处理

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **mime** | 4.0.7 | MIME 类型判断 | 准确识别文件类型 |

**主要使用**:
- 文件上传时的类型判断
- 资源加载时的类型识别

---

## 开发工具

### 代码质量

| 工具 | 用途 | 配置 |
|------|------|------|
| **ESLint** | 代码检查 | 未显式配置，使用 Vite 默认 |
| **Prettier** | 代码格式化 | 未显式配置 |

**建议**: 后续可添加 ESLint + Prettier 配置，统一代码风格

---

### 版本控制

| 工具 | 用途 |
|------|------|
| **Git** | 版本控制 |
| **GitHub** | 代码托管 |

**提交规范**:
- 格式：`feat: 功能描述`
- 遵循 Conventional Commits

---

## 构建与部署

### 构建配置

**Vite 配置要点**:

```javascript
// vite.config.js
export default defineConfig({
  base: `/${pkg.name}`,  // 动态读取 package.json name
  build: {
    outDir: `dist/${pkg.name}`
  },
  resolve: {
    alias: {
      '@': '/src'  // 路径别名
    }
  },
  plugins: [
    vue(),
    viteStaticCopy({
      // 复制 Three.js 依赖库到 public 目录
      targets: [
        { src: 'node_modules/three/examples/jsm/libs/draco/*', dest: 'draco' },
        { src: 'node_modules/three/examples/jsm/libs/basis/*', dest: 'basis' },
        { src: 'node_modules/three/examples/jsm/libs/meshopt_decoder.module.js', dest: 'meshopt' }
      ]
    })
  ]
})
```

**静态资源复制**:
- Draco - GLTF 模型压缩解码器
- Basis - KTX2 纹理压缩库
- Meshopt - 网格压缩解码器

---

### 开发命令

```bash
# 开发环境
npm run dev      # 启动 Vite 开发服务器

# 生产构建
npm run build    # 构建生产版本
npm run preview  # 本地预览构建结果
```

---

## 后端服务

### VFS Server

| 技术 | 用途 |
|------|------|
| **Express** | Node.js Web 框架 |
| **CORS** | 跨域支持 |
| **Multer** | 文件上传处理 |
| **fs/promises** | 文件系统异步 API |

**服务功能**:
- 虚拟文件系统 API
- 文件上传/下载
- 目录浏览
- 文件保存

**启动方式**:
```bash
cd script
node vfs-server.js 3001  # 端口可选，默认 3001
```

---

## 浏览器兼容性

### 目标浏览器

- Chrome >= 90
- Firefox >= 90
- Safari >= 15
- Edge >= 90

### 必需特性支持

- ES6 模块
- Fetch API
- WebAssembly (用于 Draco 解码)
- WebGL 2.0 (推荐) / WebGL 1.0

---

## 性能优化

### 已实现优化

1. **资源缓存机制**
   - useAssetsManager.js 实现资源加载缓存
   - 避免重复加载同名同大小资源

2. **代码分割**
   - Vite 自动代码分割
   - 按需加载组件

3. **事件解耦**
   - 核心管理器使用 mitt 事件总线
   - 减少直接依赖，提升可维护性

4. **变换优化**
   - TransformControls 拖拽时禁用 OrbitControls
   - 避免不必要的相机更新

### 建议优化

1. **懒加载**
   - 大型组件懒加载
   - 路由级别代码分割（如未来添加多页面）

2. **Web Workers**
   - 复杂计算移至 Web Worker
   - 避免阻塞主线程

3. **纹理优化**
   - 使用 KTX2 等压缩格式
   - 实现纹理 LOD

4. **实例化渲染**
   - 重复对象使用 InstancedMesh
   - 减少绘制调用

---

## 技术债务

### 当前问题

1. **TypeScript 迁移**
   - 当前为纯 JavaScript
   - 代码结构支持 TypeScript 迁移
   - 建议：逐步迁移到 TypeScript

2. **测试覆盖**
   - 当前无自动化测试
   - 建议：添加单元测试（Vitest）和 E2E 测试（Playwright）

3. **代码规范**
   - ESLint/Prettier 未显式配置
   - 建议：添加统一配置

4. **状态管理**
   - 未使用 Pinia 等正式状态管理
   - 当前规模可接受，但需关注复杂度增长

---

## 依赖版本管理

### 版本策略

- **生产依赖**: 使用精确版本（无 ^ 或 ~）
- **开发依赖**: 可使用 ~ 允许补丁更新
- **锁定文件**: package-lock.json 必须提交

### 更新流程

1. 定期运行 `npm outdated` 检查更新
2. 评估变更日志和破坏性变更
3. 在开发分支测试
4. 更新 package.json 和 package-lock.json
5. 回归测试后合并

---

## 相关文档

- [架构设计](./ARCHITECTURE.md)
- [API 清单](./API.md)
- [项目 README](../README.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始技术选型文档 |
