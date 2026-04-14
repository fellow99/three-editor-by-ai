# Three Editor by AI 宪法原则

**版本**: 1.0.0  
**生效日期**: 2026-04-14  
**最后修订**: 2026-04-14

---

## 前言

本宪法定义了 Three Editor by AI 项目的核心原则、设计哲学和开发规范。所有代码、文档和决策必须符合本宪法规定的原则。

---

## 核心原则

### I. 用户至上 (User First)

**所有功能以用户体验为核心**

- 所有功能以用户体验为核心
- 拖拽操作统一化，所有资源、几何体、模型均通过拖拽添加
- 交互直观、一致、可预测
- 错误提示友好清晰
- 性能优化优先保障用户感知性能（首屏加载、交互响应）

**违反示例**:
- 添加不需要的复杂功能
- 交互不一致
- 无反馈的长时间操作

---

### II. 模块化与职责分离 (Modularity & Separation of Concerns)

**5层架构：UI → Logic(Composables) → Engine(Core) → Service → Utils**

- UI 层：仅负责界面展示和用户交互
- 逻辑层（Composables）：封装业务逻辑和状态管理
- 引擎层（Core）：封装 Three.js 核心逻辑
- 服务层：封装外部 API 和数据访问
- 工具层：提供通用工具函数

**模块通信规则**:
- 上层可调用下层，下层不可依赖上层
- 跨模块通信使用事件总线（mitt）
- 禁止循环依赖

**违反示例**:
- Vue 组件直接操作 Three.js 对象
- Core 层依赖 UI 组件
- 模块间直接访问内部状态而非通过事件

---

### III. Composition API 优先 (Composition API First)

**所有逻辑用 use*.js composables，Singleton 模式复用**

- 所有逻辑使用 `use*.js` composables
- Singleton 模式复用（如 `useThreeViewer`、`useObjectManager` 等）
- 响应式状态用 `ref`/`reactive`/`computed`
- 命名规范：`useXxx` 格式

**违反示例**:
- 使用 Options API 的 `data()`/`methods`/`mounted`

---

### IV. 事件驱动解耦 (Event-Driven Decoupling)

**ThreeViewer、ObjectManager、InputManager、AssetLoader 必须集成 mitt**

- ThreeViewer、ObjectManager、InputManager、AssetLoader 必须集成 mitt
- 状态变更触发相应事件
- 组件间通过事件通信而非直接调用

**违反示例**:
- 组件直接修改 Core 层内部状态

---

### V. 序列化完整性 (Serialization Integrity)

**userData 仅存可序列化数据，运行时对象直接挂在 Object3D 上**

- userData 仅存可序列化数据（如 animationIndex、locked 等）
- 运行时对象（`_mixer`、`_activeAction`、`_clips`）直接挂在 Object3D 上，不在 userData 中
- 导出时自动过滤运行时属性
- 加载时完整恢复所有持久化状态

**违反示例**:
- 将运行时临时对象存入 userData 导致序列化污染

---

### VI. 性能优先 (Performance First)

**目标：60FPS（简单场景）、30+FPS（复杂场景）**

- 资源缓存（filename-based in useAssetsManager）
- URL-keyed 缓存（AssetLoader）
- 按需加载、懒初始化
- 避免每帧重新创建对象

**违反示例**:
- 每帧重新创建对象
- 不使用缓存重复加载资源

---

### VII. 渐进增强 (Progressive Enhancement)

**可选后端 VFS，静态模式也能正常工作**

- 可选后端 VFS，静态模式也能正常工作
- Static Drive API 提供只读基础功能
- VFS Server 提供完整读写功能

**违反示例**:
- 强制要求后端服务才能启动编辑器

---

### VIII. 文档驱动 (Documentation Driven)

**代码变更必须伴随文档更新**

- 新增功能必须更新 README.md
- API 变更必须更新 API 文档
- 架构调整必须更新架构文档
- 复杂逻辑必须添加代码注释

**注释规范**:
- JSDoc 格式注释公共 API
- 复杂算法必须添加实现思路注释
- 魔法数字必须添加注释说明

**违反示例**:
- 新增 API 不更新文档
- 复杂逻辑无任何注释
- 文档与实际代码不一致

---

### IX. 代码质量 (Code Quality)

**ES6+ 语法，JSDoc 注释，清晰描述性命名**

- ES6+ 语法
- JSDoc 注释
- 清晰描述性命名
- 组件命名 PascalCase，文件命名 camelCase
- Git 提交格式：`feat: 功能描述`

**违反示例**:
- 使用 `var`
- 无注释的复杂逻辑

---

### X. 向后兼容 (Backward Compatibility)

**场景序列化格式版本化**

- 场景序列化格式版本化
- 加载旧版本场景时自动兼容

**违反示例**:
- 修改序列化格式不考虑旧数据

---

## 附加约束

### 安全要求

- 无认证系统（当前）
- VFS 限制在配置的 drive roots 内

### 可访问性

- 键盘快捷键支持（WASD 飞行等）

### 国际化

- 暂无，UI 文字为中文

---

## 开发工作流

### 代码提交

- 提交信息格式：`<type>: <description>`
- Type 包括：feat、fix、docs、style、refactor、test、chore
- 示例：`feat: 添加材质缓存机制`

### 代码审查

- 所有代码必须经过审查
- 审查人必须检查宪法合规性
- 违反宪法的代码不得合并

### 测试要求

- 核心功能必须有手动测试清单
- 破坏性变更必须有回归测试
- 性能优化必须有前后对比数据

---

## 宪法修订

### 修订流程

1. 提出修订建议（Issue 或 PR）
2. 讨论修订影响
3. 团队达成共识
4. 更新宪法文档
5. 更新版本号

### 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-14 | 初始版本 |

---

## 合规性检查

### 自查清单

开发过程中定期对照以下问题：

- [ ] 我的代码是否符合模块化原则？
- [ ] 是否使用了 Composition API 和 composables？
- [ ] 模块间是否通过事件解耦？
- [ ] 序列化是否正确处理了运行时对象？
- [ ] 是否考虑了性能影响？
- [ ] 是否更新了相关文档？
- [ ] 代码是否清晰可维护？
- [ ] 是否保持了向后兼容？

### 审查清单

代码审查时必须检查：

- [ ] 宪法原则合规性
- [ ] 代码质量
- [ ] 文档完整性
- [ ] 测试覆盖
- [ ] 性能影响

---

## 相关文档

- [技术选型](./TECH.md)
- [架构设计](./ARCHITECTURE.md)
- [整体规格](./overall-spec.md)

---

**本宪法自生效之日起所有新代码必须符合本宪法要求。现有代码应逐步重构以符合宪法。**
