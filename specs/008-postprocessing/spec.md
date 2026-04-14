# 008-Postprocessing 后处理模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 模块概述

### 1.1 模块定位

后处理模块是 Three Editor by AI 的渲染增强层，负责在基础渲染之上叠加各种视觉效果。通过可配置的 Pass 链路，实现辉光、抗锯齿等后处理效果，提升场景的视觉表现力。

### 1.2 模块职责

- **EffectComposer 管理**: 后处理合成器的创建、配置和生命周期管理
- **Pass 链路管理**: 渲染 Pass 链的动态构建、排序和更新
- **效果参数控制**: 各后处理效果的参数调节和实时更新
- **分辨率同步**: 窗口尺寸变化时自动更新所有 Pass 的分辨率
- **UI 集成**: 与工具栏和配置对话框的交互接口

### 1.3 核心价值

- 可插拔的 Pass 架构，按需启用/禁用效果
- 统一的 API 管理所有后处理 Pass
- 编辑器级别的配置，不影响场景数据
- 高性能渲染，最小化后处理开销

---

## 2. 核心架构规格

### 2.1 组件概述

**模块名称**: Postprocessing  
**职责**: 后处理合成器与 Pass 链路的统一管理  
**集成点**: 视图管理器初始化阶段

### 2.2 架构设计

#### 2.2.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                  渲染管线                          │
│                                                   │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐   │
│  │ RenderPass │───│ 可选 Pass │───│  FXAA Pass │   │
│  │  (必须)    │    │ (Bloom等) │    │  (可选)    │   │
│  └──────────┘    └──────────┘    └──────────┘   │
│         │              │              │          │
│         ▼              ▼              ▼          │
│  ┌──────────────────────────────────────────┐   │
│  │          EffectComposer                   │   │
│  │     (后处理合成器，统一管理)                 │   │
│  └──────────────────────────────────────────┘   │
│                      │                           │
│                      ▼                           │
│              屏幕输出                              │
└─────────────────────────────────────────────────┘
```

#### 2.2.2 Pass 链路规则

1. **RenderPass 必须存在且始终位于链路首位**
   - 负责将场景和相机渲染到内部缓冲区
   - 是所有后续 Pass 的数据源
   - 不可移除、不可禁用

2. **FXAA Pass 必须位于链路末位（如果启用）**
   - 作为最终抗锯齿处理
   - 必须在所有其他效果之后执行
   - 可启用/禁用，但位置固定

3. **中间 Pass 可动态插入**
   - 如 Bloom、色调映射等效果
   - 位于 RenderPass 之后、FXAA Pass 之前
   - 支持运行时添加和移除

---

## 3. 视图管理器集成规格

### 3.1 组件概述

**类名**: ThreeViewer  
**职责**: 后处理合成器作为渲染管线的核心组件  
**集成方式**: 在视图管理器初始化时创建合成器，渲染循环中使用合成器替代直接渲染

### 3.2 核心功能

#### 3.2.1 合成器初始化

**功能描述**: 在视图管理器初始化阶段创建后处理合成器，并添加基础渲染 Pass

**触发时机**: 视图管理器 init() 方法执行期间

**输入**:
- 渲染器实例
- 场景实例
- 相机实例

**输出**:
- 初始化的 EffectComposer 实例
- 包含 RenderPass 的基础 Pass 链路

**处理流程**:
1. 创建 EffectComposer 实例，绑定渲染器
2. 创建 RenderPass 实例，绑定场景和相机
3. 将 RenderPass 添加到合成器
4. 初始化 Pass 管理数组
5. 设置合成器尺寸与渲染器一致

**代码示例**:
```javascript
const viewer = new ThreeViewer(options);
// init() 内部自动调用 initComposer()
// composer 已创建，RenderPass 已添加
```

---

#### 3.2.2 渲染循环集成

**功能描述**: 渲染循环中使用合成器渲染替代直接渲染

**机制**:
- 当合成器存在时，调用 composer.render()
- 当合成器不存在时，回退到 renderer.render(scene, camera)
- 每帧执行，与动画更新同步

**渲染优先级**:
```javascript
// 渲染循环中的逻辑
if (composer 存在) {
  composer.render();     // 使用后处理渲染
} else {
  renderer.render(scene, camera);  // 使用基础渲染
}
```

---

#### 3.2.3 Pass 动态管理

**功能描述**: 运行时动态添加、移除、配置后处理 Pass

**添加 Pass**:
```javascript
// 添加 Pass 到链路末尾
viewer.addPass(bloomPass);

// 添加 Pass 到指定位置
viewer.addPass(fxaaPass, index);
```

**移除 Pass**:
```javascript
// 从链路中移除指定 Pass
viewer.removePass(pass);
```

**配置 Pass 参数**:
```javascript
// 批量设置 Pass 参数
viewer.setPassParams(bloomPass, {
  strength: 1.5,
  radius: 0.4,
  threshold: 0.85
});
```

**启用/禁用 Pass**:
```javascript
// 通过 Pass 的 enabled 属性控制
bloomPass.enabled = true;   // 启用
bloomPass.enabled = false;  // 禁用
```

---

#### 3.2.4 分辨率同步

**功能描述**: 窗口尺寸变化时自动更新合成器和所有 Pass 的分辨率

**触发时机**: window resize 事件

**处理流程**:
1. 更新相机宽高比
2. 更新渲染器尺寸
3. 更新合成器尺寸（调用 composer.setSize()）
4. 更新各 Pass 的分辨率 uniform（如 FXAA 的 resolution）

**代码示例**:
```javascript
// 窗口 resize 时自动处理
window.addEventListener('resize', () => {
  viewer.handleResize();
  // 内部会调用 composer.setSize(width, height)
  // 并更新各 Pass 的分辨率参数
});
```

---

### 3.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `initComposer()` | - | void | 初始化后处理合成器 |
| `addPass(pass, index?)` | pass: Pass, index?: number | void | 添加 Pass 到链路 |
| `removePass(pass)` | pass: Pass | void | 从链路移除 Pass |
| `setPassParams(pass, params)` | pass: Pass, params: Object | void | 设置 Pass 参数 |
| `handleResize()` | - | void | 处理窗口尺寸变化 |

#### 内部属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `composer` | EffectComposer | 后处理合成器实例 |
| `passes` | Pass[] | Pass 管理数组 |

---

### 3.4 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `postprocessing-initialized` | 后处理合成器初始化完成 | `{ composer: EffectComposer }` |
| `pass-added` | Pass 添加到链路 | `{ pass: Pass, index: number }` |
| `pass-removed` | Pass 从链路移除 | `{ pass: Pass }` |
| `pass-config-changed` | Pass 参数变更 | `{ pass: Pass, params: Object }` |

#### 监听的事件

| 事件名 | 来源 | 响应动作 |
|--------|------|----------|
| `before-render` | 渲染循环 | 可在渲染前更新 Pass 参数 |
| `config-changed` | 编辑器配置 | 根据配置更新后处理效果 |

---

## 4. 可用 Pass 规格

### 4.1 RenderPass（基础渲染 Pass）

#### 4.1.1 功能描述

基础渲染 Pass，负责将场景和相机渲染到内部缓冲区。是所有后处理效果的数据源。

#### 4.1.2 特性

- **必须存在**: 链路中始终包含此 Pass
- **始终首位**: 位于 Pass 链路的第一个位置
- **不可移除**: 不允许从链路中移除此 Pass
- **不可禁用**: 始终处于启用状态

#### 4.1.3 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| scene | Scene | 要渲染的场景 |
| camera | Camera | 使用的相机 |
| overrideMaterial | Material? | 可选的覆盖材质 |
| clearColor | Color? | 可选的清除颜色 |
| clear | boolean | 是否清除缓冲区 |

#### 4.1.4 使用方式

```javascript
// 由视图管理器自动创建和管理
// 用户无需手动操作此 Pass
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
```

---

### 4.2 UnrealBloomPass（辉光 Pass）

#### 4.2.1 功能描述

HDR 辉光效果 Pass。对场景中亮度超过阈值的区域产生发光效果，营造光晕和泛光效果。

#### 4.2.2 特性

- **可选启用**: 默认禁用，按需开启
- **位置灵活**: 位于 RenderPass 之后、FXAA Pass 之前
- **参数可调**: 支持运行时调整强度、半径、阈值

#### 4.2.3 参数

| 参数 | 类型 | 默认值 | 范围 | 说明 |
|------|------|--------|------|------|
| resolution | Vector2 | 渲染器尺寸 | - | 渲染分辨率 |
| strength | float | 1.0 | 0.0 ~ 3.0 | 辉光强度，值越大光晕越强 |
| radius | float | 0.4 | 0.0 ~ 1.0 | 辉光扩散半径，值越大光晕越扩散 |
| threshold | float | 0.85 | 0.0 ~ 1.0 | 亮度阈值，超过此值才产生辉光 |

#### 4.2.4 参数说明

**strength（强度）**:
- 控制辉光的整体亮度
- 0.0 表示无辉光
- 1.0 表示标准辉光
- 3.0 表示极强辉光

**radius（半径）**:
- 控制辉光的扩散范围
- 0.0 表示无扩散
- 0.4 表示标准扩散
- 1.0 表示最大扩散

**threshold（阈值）**:
- 控制触发辉光的亮度级别
- 0.0 表示所有像素都产生辉光
- 0.85 表示只有较亮像素产生辉光
- 1.0 表示只有最亮像素产生辉光

#### 4.2.5 使用方式

```javascript
// 创建辉光 Pass
const bloomPass = new UnrealBloomPass(
  new Vector2(width, height),
  1.5,   // strength
  0.4,   // radius
  0.85   // threshold
);
bloomPass.enabled = false;  // 默认禁用

// 添加到链路
viewer.addPass(bloomPass);

// 运行时调整参数
viewer.setPassParams(bloomPass, {
  strength: 2.0,
  radius: 0.6,
  threshold: 0.5
});

// 启用/禁用
bloomPass.enabled = true;
```

---

### 4.3 FXAAShaderPass（快速近似抗锯齿 Pass）

#### 4.3.1 功能描述

快速近似抗锯齿 Pass。通过着色器算法平滑场景中的锯齿边缘，提升视觉质量。

#### 4.3.2 特性

- **可选启用**: 默认禁用，按需开启
- **始终末位**: 如果启用，必须位于 Pass 链路的最后一个位置
- **分辨率敏感**: 分辨率 uniform 必须在每次窗口尺寸变化时更新

#### 4.3.3 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| resolution | Vector2 uniform | 抗锯齿分辨率，值为 (1/width, 1/height) |

#### 4.3.4 分辨率更新规则

FXAA Pass 的分辨率 uniform 必须在以下时机更新:
1. 初始化时设置初始值
2. 每次窗口 resize 时重新计算并设置
3. 渲染器尺寸变化时同步更新

**计算公式**:
```
resolution.x = 1.0 / width
resolution.y = 1.0 / height
```

#### 4.3.5 使用方式

```javascript
// 创建 FXAA Pass
const fxaaPass = new FXAAShaderPass();
fxaaPass.material.uniforms['resolution'].value.set(
  1.0 / width,
  1.0 / height
);
fxaaPass.enabled = false;  // 默认禁用

// 添加到链路（始终在末尾）
viewer.addPass(fxaaPass);

// 窗口 resize 时更新分辨率
function onResize(width, height) {
  fxaaPass.material.uniforms['resolution'].value.set(
    1.0 / width,
    1.0 / height
  );
}

// 启用/禁用
fxaaPass.enabled = true;
```

---

## 5. Pass 链路管理规格

### 5.1 Pass 排序规则

#### 5.1.1 固定位置 Pass

| Pass 类型 | 位置 | 可变性 |
|-----------|------|--------|
| RenderPass | 第 0 位（首位） | 不可变 |
| FXAA Pass | 最后一位 | 不可变（如果存在） |

#### 5.1.2 动态位置 Pass

| Pass 类型 | 位置范围 | 说明 |
|-----------|----------|------|
| Bloom Pass | 1 ~ N-1 | 位于 RenderPass 之后、FXAA Pass 之前 |
| 其他 Pass | 1 ~ N-1 | 同上 |

#### 5.1.3 排序算法

```
1. RenderPass 始终在索引 0
2. 如果存在 FXAA Pass，它始终在最后一个索引
3. 其他 Pass 按添加顺序插入中间位置
4. 添加 Pass 时:
   - 如果指定 index，插入到该位置
   - 如果未指定 index，添加到 FXAA Pass 之前（或末尾）
5. 移除 Pass 时:
   - 从链路中移除并更新索引
   - 不允许移除 RenderPass
```

---

### 5.2 Pass 生命周期

#### 5.2.1 创建阶段

1. 实例化 Pass 对象
2. 设置初始参数
3. 设置 enabled = false（默认禁用）
4. 通过 addPass() 添加到链路

#### 5.2.2 运行阶段

1. 渲染循环中，合成器依次执行每个启用的 Pass
2. 每个 Pass 的 enabled 属性决定是否执行
3. 参数可通过 setPassParams() 实时更新

#### 5.2.3 销毁阶段

1. 通过 removePass() 从链路移除
2. 调用 Pass 的 dispose() 方法（如果存在）
3. 释放相关资源

---

### 5.3 Pass 状态管理

#### 5.3.1 启用/禁用

```javascript
// 启用 Pass
pass.enabled = true;

// 禁用 Pass
pass.enabled = false;

// 查询状态
const isEnabled = pass.enabled;
```

#### 5.3.2 参数更新

```javascript
// 直接修改 Pass 属性
pass.strength = 2.0;

// 通过统一 API 修改
viewer.setPassParams(pass, {
  strength: 2.0,
  radius: 0.6
});
```

---

## 6. 编辑器配置规格

### 6.1 配置项定义

后处理相关的编辑器配置项，存储在编辑器配置中，不随场景数据序列化。

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| bloomEnabled | boolean | false | 是否启用辉光效果 |
| bloomStrength | float | 1.0 | 辉光强度 |
| bloomRadius | float | 0.4 | 辉光半径 |
| bloomThreshold | float | 0.85 | 辉光阈值 |
| fxaaEnabled | boolean | false | 是否启用抗锯齿 |

### 6.2 配置持久化

- 配置存储在本地存储中
- 页面刷新后自动恢复
- 不随场景数据导出/导入

### 6.3 配置变更响应

- 配置变更时实时更新对应的 Pass 参数
- 启用/禁用配置时动态添加/移除 Pass
- 无需重新创建合成器

---

## 7. UI 集成规格

### 7.1 工具栏集成

#### 7.1.1 视图菜单

工具栏的视图菜单中提供后处理效果的快速切换:

- **启用辉光**: 切换 Bloom 效果的启用状态
- **启用抗锯齿**: 切换 FXAA 效果的启用状态

#### 7.1.2 交互方式

- 菜单项为复选框类型
- 勾选表示启用，取消勾选表示禁用
- 点击后立即生效，无需刷新

---

### 7.2 配置对话框集成

#### 7.2.1 编辑器配置对话框

在编辑器配置对话框中提供后处理参数的详细调节:

**辉光参数**:
- 强度滑块: 0.0 ~ 3.0，步进 0.1
- 半径滑块: 0.0 ~ 1.0，步进 0.05
- 阈值滑块: 0.0 ~ 1.0，步进 0.05

**抗锯齿参数**:
- 启用/禁用开关

#### 7.2.2 实时更新

- 滑块拖动时实时更新效果
- 无需点击"应用"按钮
- 配置自动保存到本地存储

---

## 8. 窗口尺寸变化处理规格

### 8.1 处理流程

```
window resize 事件触发
        ↓
更新相机宽高比
        ↓
更新渲染器尺寸
        ↓
更新合成器尺寸 (composer.setSize)
        ↓
更新 FXAA Pass 分辨率 uniform
        ↓
更新其他分辨率敏感 Pass 的参数
```

### 8.2 分辨率更新规则

| Pass 类型 | 更新方式 |
|-----------|----------|
| RenderPass | 自动跟随合成器尺寸 |
| UnrealBloomPass | 通过 resolution 参数更新 |
| FXAAShaderPass | 通过 resolution uniform 更新 |

### 8.3 性能考虑

- resize 事件可能频繁触发，需防抖处理
- 合成器 setSize 操作有一定开销
- 避免在 resize 期间执行其他重操作

---

## 9. 序列化规格

### 9.1 场景导出

**后处理状态不包含在场景导出中**:

- 后处理是编辑器级别的配置
- 不是场景数据的一部分
- 导出场景时忽略所有后处理状态

**导出内容**:
- 场景对象（Mesh、Group 等）
- 灯光
- 相机状态
- 背景颜色
- 对象 userData

**不导出内容**:
- 后处理合成器状态
- Pass 启用/禁用状态
- Pass 参数值

### 9.2 场景导入

- 导入场景数据后，后处理状态保持不变
- 使用当前编辑器的后处理配置
- 不受导入数据影响

---

## 10. 性能优化规格

### 10.1 渲染性能

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 无后处理 FPS | 60 | 基础渲染性能 |
| 启用 Bloom FPS | > 50 | 辉光效果性能 |
| 启用 Bloom + FXAA FPS | > 45 | 全效果性能 |

### 10.2 内存管理

- Pass 移除时及时释放资源
- 合成器销毁时清理所有 Pass
- 避免重复创建相同类型的 Pass

### 10.3 优化策略

1. **按需启用**: 默认禁用所有可选 Pass
2. **分辨率适配**: 根据设备性能调整后处理分辨率
3. **Pass 复用**: 相同类型的 Pass 只创建一次
4. **延迟初始化**: 仅在首次启用时创建 Pass

---

## 11. 错误处理规格

### 11.1 初始化错误

| 错误场景 | 处理方式 |
|----------|----------|
| 渲染器未初始化 | 跳过合成器初始化，记录警告 |
| 场景未创建 | 跳过合成器初始化，记录警告 |
| 相机未创建 | 跳过合成器初始化，记录警告 |

### 11.2 运行时错误

| 错误场景 | 处理方式 |
|----------|----------|
| Pass 添加失败 | 记录错误，不影响其他 Pass |
| Pass 参数设置失败 | 记录警告，使用默认值 |
| 分辨率更新失败 | 记录警告，下次 resize 重试 |

### 11.3 降级策略

- 后处理初始化失败时，回退到基础渲染
- 单个 Pass 失败不影响其他 Pass
- 渲染循环中捕获异常，防止崩溃

---

## 12. 依赖关系

### 12.1 内部依赖

```
ThreeViewer → EffectComposer
ThreeViewer → RenderPass
ThreeViewer → UnrealBloomPass
ThreeViewer → FXAAShaderPass
useEditorConfig → 后处理配置项
Toolbar.vue → 后处理切换
EditorConfigDialog.vue → 后处理参数调节
```

### 12.2 外部依赖

| 依赖 | 用途 |
|------|------|
| 后处理合成器库 | EffectComposer 实现 |
| 渲染 Pass 库 | RenderPass 实现 |
| 辉光 Pass 库 | UnrealBloomPass 实现 |
| 抗锯齿 Pass 库 | FXAAShaderPass 实现 |

---

## 13. 使用示例

### 13.1 基础使用

```javascript
// 1. 创建视图管理器（自动初始化后处理）
const viewer = new ThreeViewer(options);

// 2. 创建辉光 Pass
const bloomPass = new UnrealBloomPass(
  new Vector2(800, 600),
  1.5,   // strength
  0.4,   // radius
  0.85   // threshold
);

// 3. 添加到链路
viewer.addPass(bloomPass);

// 4. 启用辉光
bloomPass.enabled = true;

// 5. 创建 FXAA Pass
const fxaaPass = new FXAAShaderPass();
fxaaPass.material.uniforms['resolution'].value.set(
  1.0 / 800,
  1.0 / 600
);

// 6. 添加到链路（自动在末尾）
viewer.addPass(fxaaPass);

// 7. 启用抗锯齿
fxaaPass.enabled = true;
```

### 13.2 动态调整

```javascript
// 调整辉光参数
viewer.setPassParams(bloomPass, {
  strength: 2.0,
  radius: 0.6,
  threshold: 0.5
});

// 禁用辉光
bloomPass.enabled = false;

// 移除辉光 Pass
viewer.removePass(bloomPass);
```

### 13.3 配置驱动

```javascript
// 从编辑器配置读取
const config = useEditorConfig();

// 应用配置
if (config.bloomEnabled) {
  bloomPass.enabled = true;
  viewer.setPassParams(bloomPass, {
    strength: config.bloomStrength,
    radius: config.bloomRadius,
    threshold: config.bloomThreshold
  });
}
```

---

## 14. 测试要点

### 14.1 单元测试

- [ ] 合成器初始化
- [ ] Pass 添加与移除
- [ ] Pass 参数设置
- [ ] Pass 启用/禁用
- [ ] 分辨率更新
- [ ] Pass 排序逻辑

### 14.2 集成测试

- [ ] 完整后处理链路渲染
- [ ] 窗口 resize 后效果正常
- [ ] 配置变更实时更新
- [ ] 场景导入导出不影响后处理

### 14.3 性能测试

- [ ] 无后处理 FPS 基准
- [ ] 启用 Bloom 性能影响
- [ ] 启用 Bloom + FXAA 性能影响
- [ ] 内存泄漏检测
- [ ] 长时间运行稳定性

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
