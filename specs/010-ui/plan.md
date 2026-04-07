# 010-UI 编辑器 UI 组件模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

UI 组件模块提供编辑器的所有用户界面组件。

### 1.2 技术约束

- 必须使用 Vue 3 Composition API
- 必须使用 Element Plus 组件库
- 必须支持响应式布局

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| UI 框架 | Element Plus | Vue 3 生态完善 |
| 样式方案 | SCSS + scoped | 组件隔离 |
| 状态管理 | Composables | 轻量灵活 |

---

## 2. Toolbar 组件

### 2.1 组件结构

```vue
<template>
  <div class="toolbar">
    <!-- 变换工具 -->
    <div class="toolbar-group">
      <el-button
        :type="transformMode === 'translate' ? 'primary' : ''"
        @click="setTransformMode('translate')"
      >
        <el-icon><Move /></el-icon>
        移动
      </el-button>
      <el-button
        :type="transformMode === 'rotate' ? 'primary' : ''"
        @click="setTransformMode('rotate')"
      >
        <el-icon><Refresh /></el-icon>
        旋转
      </el-button>
      <el-button
        :type="transformMode === 'scale' ? 'primary' : ''"
        @click="setTransformMode('scale')"
      >
        <el-icon><FullScreen /></el-icon>
        缩放
      </el-button>
    </div>
    
    <!-- 控制器切换 -->
    <div class="toolbar-group">
      <el-select v-model="controlsType" @change="setControls">
        <el-option label="轨道" value="orbit" />
        <el-option label="地图" value="map" />
        <el-option label="飞行" value="fly" />
      </el-select>
    </div>
    
    <!-- 操作按钮 -->
    <div class="toolbar-group">
      <el-button @click="undo" :disabled="!canUndo">
        <el-icon><RefreshLeft /></el-icon>
      </el-button>
      <el-button @click="redo" :disabled="!canRedo">
        <el-icon><RefreshRight /></el-icon>
      </el-button>
      <el-button @click="saveScene">
        <el-icon><Download /></el-icon>
        保存
      </el-button>
      <el-button @click="openConfig">
        <el-icon><Setting /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useTransform } from '../../composables/useTransform.js';
import { useControls } from '../../composables/useControls.js';

const { transformMode, setTransformMode, undo, redo, canUndo, canRedo } = useTransform();
const { controlsType, setControls } = useControls();
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  
  .toolbar-group {
    display: flex;
    gap: 4px;
    padding-right: 8px;
    border-right: 1px solid #e4e7ed;
    
    &:last-child {
      border-right: none;
    }
  }
}
</style>
```

---

## 3. PropertyPanel 组件

### 3.1 组件结构

```vue
<template>
  <div class="property-panel">
    <el-collapse v-model="activePanels">
      <!-- 基础属性 -->
      <el-collapse-item name="base">
        <template #title>
          <span>基础属性</span>
        </template>
        <TransformPropertyPane 
          v-if="selectedObject" 
          :object="selectedObject" 
        />
      </el-collapse-item>
      
      <!-- 材质属性 -->
      <el-collapse-item name="material">
        <template #title>
          <span>材质属性</span>
        </template>
        <MaterialPropertyPane 
          v-if="selectedObject" 
          :material="selectedObject.material" 
        />
      </el-collapse-item>
      
      <!-- 动画属性 -->
      <el-collapse-item name="animation">
        <template #title>
          <span>动画属性</span>
        </template>
        <AnimationPropertyPane 
          v-if="selectedObject?.animations?.length" 
          :object="selectedObject" 
        />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';

const { selectedObjects } = useObjectSelection();
const selectedObject = computed(() => selectedObjects.value[0]);
const activePanels = ref(['base']);
</script>
```

---

## 4. 对话框组件

### 4.1 EditorConfigDialog

```vue
<template>
  <el-dialog v-model="visible" title="编辑器配置" width="500px">
    <el-form label-width="120px">
      <el-form-item label="渲染器">
        <el-select v-model="config.renderer.antialias">
          <el-option label="开启" :value="true" />
          <el-option label="关闭" :value="false" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="阴影质量">
        <el-slider 
          v-model="config.renderer.shadowMapSize" 
          :min="512" 
          :max="4096" 
          :step="512"
        />
      </el-form-item>
      
      <el-form-item label="默认控制器">
        <el-select v-model="config.defaultControls">
          <el-option label="轨道" value="orbit" />
          <el-option label="地图" value="map" />
          <el-option label="飞行" value="fly" />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="saveConfig">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useEditorConfig } from '../../composables/useEditorConfig.js';

const visible = defineModel('visible');
const { config, saveConfig } = useEditorConfig();
</script>
```

---

## 5. 响应式布局

### 5.1 布局组件

```vue
<template>
  <div class="editor-layout">
    <!-- 顶部工具栏 -->
    <header class="layout-header">
      <Toolbar />
    </header>
    
    <!-- 主体内容 -->
    <div class="layout-body">
      <!-- 左侧资源面板 -->
      <aside class="layout-left" v-if="showLeftPanel">
        <AssetBrowser />
      </aside>
      
      <!-- 中间场景视图 -->
      <main class="layout-main">
        <SceneViewer />
      </main>
      
      <!-- 右侧属性面板 -->
      <aside class="layout-right" v-if="showRightPanel">
        <PropertyPanel />
        <Inspector />
      </aside>
    </div>
    
    <!-- 底部状态栏 -->
    <footer class="layout-footer">
      <EditorFooter />
    </footer>
  </div>
</template>

<style scoped lang="scss">
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  .layout-header {
    flex-shrink: 0;
  }
  
  .layout-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    
    .layout-left,
    .layout-right {
      width: 300px;
      flex-shrink: 0;
      overflow-y: auto;
    }
    
    .layout-main {
      flex: 1;
      overflow: hidden;
    }
  }
  
  .layout-footer {
    flex-shrink: 0;
  }
}

// 响应式
@media (max-width: 768px) {
  .layout-left,
  .layout-right {
    width: 250px;
  }
}

@media (max-width: 640px) {
  .layout-left,
  .layout-right {
    position: absolute;
    z-index: 10;
  }
}
</style>
```

---

## 6. 状态管理

### 6.1 UI 状态 Composable

```javascript
// useUIState.js
import { ref, reactive } from 'vue';

export function useUIState() {
  // 面板显示状态
  const showLeftPanel = ref(true);
  const showRightPanel = ref(true);
  const showFooter = ref(true);
  
  // 对话框状态
  const dialogs = reactive({
    config: false,
    save: false,
    load: false,
    material: false
  });
  
  // 全屏状态
  const isFullscreen = ref(false);
  
  function togglePanel(side) {
    if (side === 'left') {
      showLeftPanel.value = !showLeftPanel.value;
    } else if (side === 'right') {
      showRightPanel.value = !showRightPanel.value;
    }
  }
  
  function openDialog(name) {
    if (name in dialogs) {
      dialogs[name] = true;
    }
  }
  
  function closeDialog(name) {
    if (name in dialogs) {
      dialogs[name] = false;
    }
  }
  
  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value;
    if (isFullscreen.value) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  
  return {
    showLeftPanel,
    showRightPanel,
    showFooter,
    dialogs,
    isFullscreen,
    togglePanel,
    openDialog,
    closeDialog,
    toggleFullscreen
  };
}
```

---

## 7. 主题定制

### 7.1 SCSS 变量

```scss
// variables.scss
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

$panel-bg: #ffffff;
$panel-border: #e4e7ed;
$panel-header-bg: #f5f7fa;

$toolbar-height: 50px;
$footer-height: 30px;
$panel-width: 300px;
```

### 7.2 暗色主题

```scss
// dark-theme.scss
.editor-layout.dark {
  --el-bg-color: #1d1e1f;
  --el-text-color-primary: #e5eaf3;
  --el-border-color: #4c4d4f;
  
  .toolbar {
    background: #2d2e30;
    border-color: #4c4d4f;
  }
  
  .property-panel {
    background: #1d1e1f;
    border-color: #4c4d4f;
  }
}
```

---

**版本**: 1.0 | **日期**: 2026-04-07
