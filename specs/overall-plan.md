# Three Editor by AI - 整体技术方案

**生成日期**: 2026-04-07  
**项目版本**: 0.1.0

---

## 1. 技术上下文

### 1.1 项目背景

Three Editor by AI 是一个基于 Web 的 3D 场景编辑器，目标是提供零安装的 3D 内容创作工具。

### 1.2 技术约束

- 必须在浏览器中运行
- 支持主流现代浏览器
- 性能要求：60 FPS（简单场景），30+ FPS（复杂场景）
- 内存使用稳定，无泄漏

### 1.3 技术决策

已完成的重大技术决策：

| 决策 | 选择 | 理由 |
|------|------|------|
| 前端框架 | Vue 3 | Composition API、生态完善 |
| 3D 引擎 | Three.js | 最流行的 Web 3D 库 |
| 构建工具 | Vite | 极速开发体验 |
| 状态管理 | Composables + mitt | 轻量级，适合项目规模 |
| 样式方案 | Sass | 成熟稳定 |

---

## 2. 架构设计

### 2.1 分层架构

```
┌─────────────────────────────────────┐
│         UI Layer (Vue)              │
├─────────────────────────────────────┤
│      Logic Layer (Composables)      │
├─────────────────────────────────────┤
│      Engine Layer (Core)            │
├─────────────────────────────────────┤
│      Service Layer (APIs)           │
├─────────────────────────────────────┤
│      Utilities Layer                │
└─────────────────────────────────────┘
```

详见：[ARCHITECTURE.md](./ARCHITECTURE.md)

### 2.2 模块划分

| 模块 | 职责 | 关键文件 |
|------|------|----------|
| 场景管理 | Three.js 场景、渲染 | ThreeViewer.js, useThreeViewer.js |
| 对象管理 | 对象创建、变换、删除 | ObjectManager.js, useObjectSelection.js |
| 资源管理 | 资源加载、缓存 | AssetLoader.js, useAssetsManager.js |
| 材质系统 | 材质创建、编辑 | useMaterial.js |
| 相机控制 | 相机切换、预设视角 | useControls.js, useCameraPosState.js |
| VFS | 虚拟文件系统 | vfs-server-api.js, static-drive-api.js |

---

## 3. 数据设计

### 3.1 核心实体

- **Scene**: 场景容器
- **SceneObject**: 场景对象
- **Material**: 材质
- **Texture**: 纹理
- **Light**: 灯光
- **Camera**: 相机
- **Animation**: 动画

详见：[overall-data-model.md](./overall-data-model.md)

### 3.2 序列化策略

**原则**:
- userData 完整序列化
- 运行时对象不序列化
- 动画状态可恢复

**格式**: JSON

---

## 4. 接口设计

### 4.1 内部接口

**Core Managers**:
- ThreeViewer: 场景管理 API
- ObjectManager: 对象管理 API
- AssetLoader: 资源加载 API
- InputManager: 输入处理 API

**事件总线**:
- 使用 mitt 实现
- 事件命名：`entity-action`
- 监听器及时清理

### 4.2 外部接口

**虚拟文件系统 API**:
- `/api/list/:drive` - 获取目录
- `/file/:drive/*` - 获取文件
- `/save/:drive/*` - 保存文件
- `/exists/:drive/*` - 检查存在

详见：[API.md](./API.md)

---

## 5. 关键技术实现

### 5.1 场景渲染

**实现**:
```javascript
// ThreeViewer.js
class ThreeViewer {
  init(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(...);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    container.appendChild(this.renderer.domElement);
    this.animate();
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}
```

**优化**:
- 按需渲染（静态场景）
- 抗锯齿开启
- 自动调整渲染尺寸

---

### 5.2 对象变换

**实现**:
```javascript
// useObjectSelection.js
const transformControls = new TransformControls(
  threeViewer.camera,
  threeViewer.renderer.domElement
);

transformControls.addEventListener('dragging-changed', (event) => {
  orbitControls.enabled = !event.value;
});

transformControls.addEventListener('change', () => {
  // 记录撤销点
  useTransform.startTransform();
});
```

**特性**:
- 支持移动/旋转/缩放
- Y 轴锁定
- 撤销/重做
- 拖拽时禁用轨道控制

---

### 5.3 资源加载缓存

**实现**:
```javascript
// useAssetsManager.js
const assetLibrary = reactive({});

async function loadModel(url) {
  // 检查缓存
  const cached = assetLibrary[url];
  if (cached && cached.size === getFileSize(url)) {
    return cached;
  }
  
  // 加载新资源
  const model = await loader.load(url);
  assetLibrary[url] = model;
  return model;
}
```

**优化**:
- 同名同大小资源复用
- 避免重复加载
- 内存管理

---

### 5.4 场景序列化

**实现**:
```javascript
// ThreeViewer.js
exportScene() {
  const objects = [];
  this.scene.traverse((obj) => {
    if (obj.type === 'Mesh') {
      objects.push({
        uuid: obj.uuid,
        geometry: obj.geometry.toJSON(),
        material: obj.material.toJSON(),
        transform: {
          position: obj.position,
          rotation: obj.rotation,
          scale: obj.scale
        },
        userData: obj.userData
      });
    }
  });
  return JSON.stringify({ objects });
}
```

**注意**:
- 运行时对象（_mixer）不序列化
- userData 完整序列化
- 动画索引记录

---

## 6. 性能优化

### 6.1 已实现优化

| 优化 | 效果 | 实现位置 |
|------|------|----------|
| 资源缓存 | 减少重复加载 | useAssetsManager.js |
| 事件解耦 | 减少直接依赖 | mitt 事件总线 |
| 拖拽优化 | 避免相机跟随 | useObjectSelection.js |
| 按需渲染 | 减少 GPU 负载 | ThreeViewer.js |

### 6.2 计划优化

| 优化 | 优先级 | 预计效果 |
|------|--------|----------|
| 实例化渲染 | P1 | 减少绘制调用 |
| LOD 系统 | P2 | 减少顶点数 |
| 纹理压缩 | P2 | 减少内存使用 |
| Web Worker | P3 | 避免主线程阻塞 |

---

## 7. 测试策略

### 7.1 手动测试清单

**核心功能**:
- [ ] 场景创建/加载/保存
- [ ] 几何体创建
- [ ] 模型加载
- [ ] 对象变换（移动/旋转/缩放）
- [ ] 材质编辑
- [ ] 纹理应用
- [ ] 相机控制
- [ ] 动画播放
- [ ] 撤销/重做

**边缘场景**:
- [ ] 大场景加载（1000+ 对象）
- [ ] 复杂模型加载（高面数）
- [ ] 快速连续操作
- [ ] 长时间使用（内存泄漏）

### 7.2 自动化测试（未来）

**单元测试** (Vitest):
- 工具函数测试
- Composables 逻辑测试
- 序列化/反序列化测试

**E2E 测试** (Playwright):
- 关键用户流程
- 跨浏览器测试

---

## 8. 部署方案

### 8.1 开发环境

```bash
# 1. 启动 VFS Server
cd script
node vfs-server.js 3001

# 2. 启动前端
npm run dev
```

### 8.2 生产构建

```bash
# 1. 构建前端
npm run build

# 2. 部署到 Web 服务器
# dist/three-editor-by-ai/ 目录内容部署到 Nginx/Apache

# 3. 部署 VFS Server（可选独立部署）
pm2 start script/vfs-server.js --name vfs-server
```

### 8.3 环境配置

**开发环境**:
- Vite 开发服务器：`http://localhost:5173`
- VFS Server: `http://localhost:3001`

**生产环境**:
- 前端：`https://your-domain.com/three-editor-by-ai/`
- VFS Server: `https://your-domain.com/api/vfs/`

---

## 9. 监控与日志

### 9.1 性能监控

**已实现**:
- FPS 显示（stats-gl）
- 内存使用显示

**计划**:
- 性能数据上报
- 错误追踪（Sentry）
- 用户行为分析

### 9.2 错误处理

**前端**:
```javascript
try {
  await loadModel(url);
} catch (error) {
  console.error('模型加载失败:', error);
  // 显示用户友好的错误提示
  ElMessage.error('模型加载失败：' + error.message);
}
```

**后端**:
```javascript
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 1,
    msg: '服务器内部错误'
  });
});
```

---

## 10. 安全考虑

### 10.1 前端安全

- 用户输入验证
- XSS 防护（Vue 自动转义）
- CSRF 防护（同源策略）

### 10.2 后端安全

- CORS 配置
- 文件上传限制
- 路径遍历防护
- 速率限制（未来）

### 10.3 数据安全

- 用户文件隔离
- 敏感信息不存储
- 传输加密（HTTPS）

---

## 11. 技术债务

### 当前债务

| 债务 | 影响 | 优先级 | 预计解决时间 |
|------|------|--------|--------------|
| 无 TypeScript | 中 | P1 | 2-3 周 |
| 无自动化测试 | 中 | P1 | 1-2 周 |
| 无 ESLint 配置 | 低 | P2 | 1 天 |
| 文档不完整 | 中 | P1 | 持续进行 |

### 还债计划

1. **阶段 1**: 添加 ESLint + Prettier 配置
2. **阶段 2**: 编写核心功能测试
3. **阶段 3**: 逐步迁移到 TypeScript
4. **阶段 4**: 完善文档

---

## 12. 未来规划

### 短期（1-3 个月）

- [ ] 完善现有功能
- [ ] 添加自动化测试
- [ ] 性能优化（实例化渲染、LOD）
- [ ] 文档完善

### 中期（3-6 个月）

- [ ] TypeScript 迁移
- [ ] 协作编辑功能
- [ ] 插件系统
- [ ] 移动端优化

### 长期（6-12 个月）

- [ ] VR/AR支持
- [ ] AI 辅助建模
- [ ] 云同步
- [ ] 资源市场

---

## 相关文档

- [整体规格](./overall-spec.md)
- [数据模型](./overall-data-model.md)
- [架构设计](./ARCHITECTURE.md)
- [技术选型](./TECH.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始技术方案 |
