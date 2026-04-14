# 010-UI UI组件模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

UI组件模块是编辑器的用户界面层，基于 Vue 3 Composition API 构建，使用 Element Plus 作为基础UI组件库。所有状态管理通过 Vue 响应式系统和组合式函数实现，不依赖 Pinia 或 Vuex。

### 1.2 技术约束

- 必须使用 Vue 3.5+ Composition API (`<script setup>`)
- 必须使用 Element Plus 2.10+ 作为基础UI组件库
- 必须使用 Sass 作为样式预处理器
- 必须使用 `three-viewport-gizmo` 实现视角立方体
- 必须使用 `stats-gl` 实现性能监控
- 面板状态通过 `appState` 响应式对象管理
- 编辑器配置通过 `useEditorConfig` 组合式函数持久化到 localStorage

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| UI框架 | Vue 3 + `<script setup>` | 简洁的组合式API，类型推断友好 |
| 组件库 | Element Plus | 成熟的Vue 3组件库，深色主题支持好 |
| 状态管理 | Vue reactive() + provide/inject | 轻量级，无需额外依赖 |
| 样式方案 | Sass + scoped | 组件级样式隔离，嵌套语法清晰 |
| 视角指示器 | three-viewport-gizmo | 专为Three.js设计的视角控件 |
| 性能监控 | stats-gl | 支持GPU监控，API简洁 |

---

## 2. 主编辑器技术设计

### 2.1 文件位置

`src/Editor.vue`

### 2.2 组件结构

```vue
<script setup>
import { ref, reactive, provide, onMounted, onUnmounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

// 导入组合式函数
import { useObjectSelection } from './composables/useObjectSelection.js';
import { useTransform } from './composables/useTransform.js';
import { useAssetsManager } from './composables/useAssetsManager.js';
import { useThreeViewer } from './composables/useThreeViewer.js';

// 导入UI组件
import Toolbar from './components/editor/Toolbar.vue';
import ResourcePanel from './components/editor/ResourcePanel.vue';
import SceneViewer from './components/scene/SceneViewer.vue';
import PropertyPanel from './components/editor/PropertyPanel.vue';
import MultiSelectPanel from './components/editor/MultiSelectPanel.vue';
import EditorFooter from './components/editor/EditorFooter.vue';
import ViewportControls from './components/scene/ViewportControls.vue';
import CubeViewportControls from './components/scene/CubeViewportControls.vue';
import InteractionHints from './components/scene/InteractionHints.vue';
import StatHints from './components/scene/StatHints.vue';

// 应用状态
const appState = reactive({
  isLoading: true,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  bottomPanelCollapsed: true,
  activeLeftTab: 'primitives',
  panels: {
    leftWidth: 300,
    rightWidth: 300,
    bottomHeight: 200
  }
});

// 组合式函数实例
const threeViewer = useThreeViewer();
const objectSelection = useObjectSelection();
const transform = useTransform();
const assets = useAssetsManager();

// 多选面板判断
const showMultiSelectPanel = computed(() => 
  objectSelection.selectedIdsRef.value.length > 1
);

// 依赖注入
provide('objectSelection', objectSelection);
provide('transform', transform);
provide('assets', assets);
provide('appState', appState);
</script>
```

### 2.3 布局CSS实现

```scss
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  color: #fff;
}

.main-toolbar {
  border-bottom: 1px solid #444;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.editor-viewport {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #1a1a1a;
  z-index: 1;
}

.editor-sidebar {
  background: #2a2a2a;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.left-panel {
  left: 0;
  border-right: 1px solid #444;
}

.right-panel {
  right: 0;
  border-left: 1px solid #444;
}

/* 面板切换按钮 */
.sidebar-toggle {
  position: absolute;
  top: 50%;
  z-index: 20;
  background: #007acc;
  width: 10px;
  height: 50px;
}

.sidebar-toggle.left {
  left: 0;
  border-radius: 0 10px 10px 0;
}

.sidebar-toggle.right {
  right: 0;
  border-radius: 10px 0 0 10px;
}

.sidebar-toggle.left.active {
  left: 300px;
}

.sidebar-toggle.right.active {
  right: 300px;
}
```

### 2.4 面板折叠实现

```javascript
function toggleLeftPanel() {
  appState.leftPanelCollapsed = !appState.leftPanelCollapsed;
}

function toggleRightPanel() {
  appState.rightPanelCollapsed = !appState.rightPanelCollapsed;
}

function setActiveLeftTab(tab) {
  appState.activeLeftTab = tab;
  if (appState.leftPanelCollapsed) {
    appState.leftPanelCollapsed = false;
  }
}
```

### 2.5 覆盖层自适应定位

```scss
.viewport-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 200;
  transition: right 0.2s;
}

.viewport-controls.with-right {
  right: 316px; /* 300px面板 + 16px间距 */
}

.cube-controls-bottomright {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 300;
  transition: right 0.2s;
}

.cube-controls-bottomright.with-right {
  right: 316px;
}

.interaction-hints {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 200;
  transition: left 0.2s;
}

.interaction-hints.with-left {
  left: 316px;
}

.stat-hints {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 210;
  transition: left 0.2s;
}

.stat-hints.with-left {
  left: 316px;
}
```

### 2.6 键盘快捷键处理

```javascript
function handleKeyboard(event) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.code) {
      case 'KeyS':
        event.preventDefault();
        // 保存场景
        break;
      case 'KeyZ':
        event.preventDefault();
        if (event.shiftKey) {
          transform.redo?.();
        } else {
          transform.undo?.();
        }
        break;
      case 'KeyD':
        event.preventDefault();
        // 复制对象
        break;
    }
  }
  
  switch (event.code) {
    case 'Delete':
      if (objectSelection.hasSelection.value) {
        ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
          selectedIds.forEach(id => {
            scene.removeObjectFromScene(id);
          });
          objectSelection.clearSelection();
        }).catch(() => {});
      }
      break;
    case 'Escape':
      objectSelection?.clearSelection?.();
      break;
  }
}
```

---

## 3. 工具栏技术设计

### 3.1 文件位置

`src/components/editor/Toolbar.vue` (609行)

### 3.2 Ribbon布局实现

```vue
<template>
  <div class="ribbon-toolbar dark">
    <div class="ribbon-content">
      <!-- 文件操作组 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">文件</div>
        <div class="ribbon-group-buttons">
          <button @click="newScene" class="ribbon-btn" title="新建场景">
            <span class="icon">📄</span>
            <div>新建</div>
          </button>
          <!-- 更多按钮... -->
        </div>
      </div>
      <!-- 编辑组、变换组、视图组、配置组... -->
    </div>
  </div>
</template>
```

### 3.3 Ribbon样式

```scss
.ribbon-toolbar.dark {
  background: #23272e;
  color: #f3f3f3;
  border-bottom: 1.5px solid #2d323a;
  padding: 0 12px;
  box-shadow: 0 2px 8px #0006;
}

.ribbon-content {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: flex-end;
  padding: 4px;
  flex-wrap: wrap;
}

.ribbon-group {
  background: #282c34;
  border-radius: 8px 8px 0 0;
  border: 1.5px solid #353a42;
  padding: 4px;
  margin-right: 8px;
  min-width: 120px;
  height: 80px;
}

.ribbon-group-title {
  font-size: 13px;
  font-weight: bold;
  color: #7ecfff;
  text-align: center;
}

.ribbon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 7px;
  background: #23272e;
  border: 1px solid #353a42;
  border-radius: 5px;
  color: #f3f3f3;
  font-size: 11px;
  cursor: pointer;
  min-width: 48px;
  transition: background 0.2s, border 0.2s;
}

.ribbon-btn:hover:not(:disabled) {
  background: #2d323a;
  border-color: #7ecfff;
}

.ribbon-btn.active {
  background: #007acc;
  border-color: #0088dd;
}

.ribbon-btn.danger {
  background: #d73a49;
  border-color: #e85662;
}

.ribbon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3.4 场景导入实现

```javascript
async function importScene() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();
      const sceneData = JSON.parse(text);
      ElMessageBox.confirm('确定要导入这个场景吗？这将替换当前场景。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (appState) appState.isLoading = true;
        try {
          objectSelection.clearSelection();
          transform.clearHistory();
          await loadScene(sceneData);
          ElMessage.success('场景导入成功');
        } catch (e) {
          ElMessage.error('导入场景失败，请检查文件格式。');
        } finally {
          if (appState) appState.isLoading = false;
        }
      }).catch(() => {});
    }
  };
  input.click();
}
```

### 3.5 Y轴锁定实现

```javascript
function toggleLockYAxis() {
  let controlsRef = useControls();
  let controls = controlsRef.value;

  if (axesLockState.locked) {
    axesLockState.locked = false;
  } else {
    let y = 0;
    const selectedObjects = objectSelection.getSelectedObjects();
    if (selectedObjects.length > 0 && selectedObjects[0]?.position) {
      y = selectedObjects[0].position.y;
    } else if (controls && controls.target) {
      y = controls.target.y;
    }
    axesLockState.yValue = y;
    axesLockState.locked = true;
  }
}
```

### 3.6 对话框集成

```vue
<!-- 编辑器配置对话框 -->
<EditorConfigDialog v-if="showEditorConfig" v-model="showEditorConfig" />
<!-- 文件选择对话框 -->
<VfsFileChooserDialog v-if="showFileChooser" v-model="showFileChooser" @select="handleFileSelect" />
<!-- 文件保存对话框 -->
<VfsFileSaverDialog
  v-if="showFileSaver"
  v-model="showFileSaver"
  :text="sceneJsonText"
  ext="json"
  @saved="handleFileSaved"
/>
```

---

## 4. 资源面板技术设计

### 4.1 文件位置

`src/components/editor/ResourcePanel.vue` (136行)

### 4.2 标签页切换实现

```vue
<script setup>
import { defineProps } from 'vue';
import AssetBrowser from './AssetBrowser.vue';
import Inspector from './Inspector.vue';
import VfsFileBrowser from './VfsFileBrowser.vue';
import PrimitiveBrowser from './PrimitiveBrowser.vue';

const props = defineProps({
  activeLeftTab: String,
  setActiveLeftTab: Function
});
</script>

<template>
  <div class="resource-panel">
    <div class="panel-tabs">
      <button 
        @click="props.setActiveLeftTab('primitives')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'primitives' }]"
      >几何体</button>
      <button 
        @click="props.setActiveLeftTab('files')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'files' }]"
      >文件</button>
      <button 
        @click="props.setActiveLeftTab('assets')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'assets' }]"
      >资源</button>
      <button 
        @click="props.setActiveLeftTab('inspector')" 
        :class="['tab-btn', { active: props.activeLeftTab === 'inspector' }]"
      >层级</button>
    </div>
    <div class="panel-content">
      <VfsFileBrowser v-if="props.activeLeftTab === 'files'" />
      <PrimitiveBrowser v-if="props.activeLeftTab === 'primitives'" />
      <AssetBrowser v-if="props.activeLeftTab === 'assets'" />
      <Inspector v-if="props.activeLeftTab === 'inspector'" />
    </div>
  </div>
</template>
```

### 4.3 标签页样式

```scss
.resource-panel {
  width: 300px;
  height: 100%;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.panel-tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #444;
  color: #fff;
}

.tab-btn.active {
  background: #2a2a2a;
  border-bottom-color: #007acc;
  color: #fff;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

---

## 5. 属性面板技术设计

### 5.1 文件位置

`src/components/editor/PropertyPanel.vue` (201行)

### 5.2 动态面板切换实现

```vue
<script setup>
import { ref, watch, shallowRef } from 'vue';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import { useMaterialSelection } from '@/composables/useMaterial.js';

// 导入所有属性面板组件
import ScenePropertyPane from '../property/ScenePropertyPane.vue';
import BasePropertyPane from '../property/BasePropertyPane.vue';
import TransformPropertyPane from '../property/TransformPropertyPane.vue';
import MaterialPropertyPane from '../property/MaterialPropertyPane.vue';
import AnimationPropertyPane from '../property/AnimationPropertyPane.vue';
import UserDataPropertyPane from '../property/UserDataPropertyPane.vue';
// ... 更多面板导入

const activeTab = ref('场景');
const isMaterialPropertyPaneAdv = ref(false);

const { selectedIdsRef, getSelectedObjects } = useObjectSelection();
const { selectedMaterialNameRef, getSelectedMaterial } = useMaterialSelection();

const selectedObject = shallowRef(null);
const selectedMaterial = shallowRef(null);

// 监听选中状态变化
watch([selectedIdsRef, selectedMaterialNameRef], () => {
  let ids = selectedIdsRef.value;
  let materialName = selectedMaterialNameRef.value;
  selectedObject.value = null;
  selectedMaterial.value = null;
  
  if (ids && ids.length > 0) {
    activeTab.value = '对象';
    let objects = getSelectedObjects();
    selectedObject.value = objects ? objects[0] : null;
  } else if (materialName) {
    activeTab.value = '材质';
    selectedMaterial.value = getSelectedMaterial();
  } else {
    activeTab.value = '场景';
  }
});
</script>
```

### 5.3 条件渲染逻辑

```vue
<template>
  <div class="property-panel">
    <div class="property-content">
      <!-- Tab按钮 -->
      <div class="tabs">
        <button v-if="!selectedObject && !selectedMaterial"
          :class="{ active: activeTab === '场景' }"
          @click="activeTab = '场景'">场景</button>
        <button v-if="selectedObject"
          :class="{ active: activeTab === '对象' }"
          @click="activeTab = '对象'">对象</button>
        <button v-if="selectedMaterial"
          :class="{ active: activeTab === '材质' && !isMaterialPropertyPaneAdv }"
          @click="isMaterialPropertyPaneAdv=false; activeTab = '材质'">材质</button>
        <button v-if="selectedMaterial"
          :class="{ active: activeTab === '材质' && isMaterialPropertyPaneAdv }"
          @click="isMaterialPropertyPaneAdv=true; activeTab = '材质'">材质专家模式</button>
        <button v-if="!selectedMaterial"
          :class="{ active: activeTab === 'userData' }"
          @click="activeTab = 'userData'">userData</button>
      </div>
      
      <!-- 场景属性 -->
      <ScenePropertyPane v-if="activeTab === '场景' && !selectedObject && !selectedMaterial" />
      
      <!-- 对象属性 -->
      <div v-if="activeTab === '对象'">
        <BasePropertyPane />
        <TransformPropertyPane v-if="selectedObject" :selectedObject="selectedObject" />
        <AnimationPropertyPane v-if="selectedObject" />
        
        <!-- 灯光参数面板（按类型条件渲染） -->
        <LightPropertyPaneDirectionalLight 
          v-if="selectedObject && selectedObject.type === 'DirectionalLight'" />
        <LightPropertyPanePointLight 
          v-else-if="selectedObject && selectedObject.type === 'PointLight'" />
        <LightPropertyPaneSpotLight 
          v-else-if="selectedObject && selectedObject.type === 'SpotLight'" />
        <LightPropertyPaneAmbientLight 
          v-else-if="selectedObject && selectedObject.type === 'AmbientLight'" />
        <LightPropertyPaneRectAreaLight 
          v-else-if="selectedObject && selectedObject.type === 'RectAreaLight'" />
        <LightPropertyPaneHemisphereLight 
          v-else-if="selectedObject && selectedObject.type === 'HemisphereLight'" />
        
        <!-- 几何体参数面板（按几何体类型条件渲染） -->
        <PrimitivePropertyPaneBox 
          v-else-if="selectedObject?.geometry?.type === 'BoxGeometry'" />
        <PrimitivePropertyPaneSphere 
          v-else-if="selectedObject?.geometry?.type === 'SphereGeometry'" />
        <!-- ... 更多几何体面板 -->
      </div>
      
      <!-- 材质属性 -->
      <MaterialPropertyPane 
        v-if="activeTab === '材质' && !isMaterialPropertyPaneAdv && selectedMaterial" 
        :material="selectedMaterial" />
      
      <!-- userData -->
      <div v-if="activeTab === 'userData'">
        <SceneUserDataPropertyPane v-if="!selectedObject && !selectedMaterial" />
        <UserDataPropertyPane v-if="selectedObject" :object="selectedObject" />
      </div>
    </div>
  </div>
</template>
```

### 5.4 面板样式

```scss
.property-panel {
  width: 300px;
  height: 100%;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #2a2a2a;
  border-bottom-color: #007acc;
  color: #fff;
}

.property-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

---

## 6. 多选面板技术设计

### 6.1 文件位置

`src/components/editor/MultiSelectPanel.vue` (188行)

### 6.2 批量操作实现

```vue
<script setup>
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import TransformPropertyPane from '../property/TransformPropertyPane.vue';

const objectSelection = useObjectSelection();
const multiSelectBoxRef = useObjectSelection().multiSelectBoxRef;

/** 位置对齐 */
function alignPosition(axis, type) {
  let selectedObjects = objectSelection.getSelectedObjects();
  const positions = selectedObjects.map(obj => obj.position[axis]);
  let target;
  if (type === 'left') target = Math.min(...positions);
  else if (type === 'right') target = Math.max(...positions);
  else if (type === 'center') target = (Math.min(...positions) + Math.max(...positions)) / 2;
  
  selectedObjects.forEach(obj => {
    obj.position[axis] = target;
    obj.updateMatrixWorld?.();
  });
  objectSelection.updateSelectedHelpers();
}

/** 平均分布 */
function distributeEvenly(axis) {
  let selectedObjects = objectSelection.getSelectedObjects();
  const sorted = [...selectedObjects].sort((a, b) => a.position[axis] - b.position[axis]);
  const min = sorted[0].position[axis];
  const max = sorted[sorted.length - 1].position[axis];
  if (sorted.length <= 2 || min === max) return;
  
  const step = (max - min) / (sorted.length - 1);
  sorted.forEach((obj, i) => {
    obj.position[axis] = min + i * step;
    obj.updateMatrixWorld?.();
  });
  objectSelection.updateSelectedHelpers();
}

/** 旋转一致 */
function unifyRotation(axis) {
  let selectedObjects = objectSelection.getSelectedObjects();
  const target = selectedObjects[0].rotation[axis];
  selectedObjects.forEach(obj => {
    obj.rotation[axis] = target;
    obj.updateMatrixWorld?.();
  });
  objectSelection.updateSelectedHelpers();
}

/** 等比例缩放 */
function scaleUniform(mode) {
  let selectedObjects = objectSelection.getSelectedObjects();
  ['x', 'y', 'z'].forEach(axis => {
    const values = selectedObjects.map(obj => obj.scale[axis]);
    let target = mode === 'min' ? Math.min(...values) : Math.max(...values);
    selectedObjects.forEach(obj => {
      obj.scale[axis] = target;
      obj.updateMatrixWorld?.();
    });
  });
  objectSelection.updateSelectedHelpers();
}
</script>
```

### 6.3 模板结构

```vue
<template>
  <div class="multi-select-panel">
    <h3>多对象批量操作</h3>
    
    <div class="section">
      <div class="section-title">多选变换</div>
      <el-button v-if="!multiSelectBoxRef" type="primary" size="small" 
        @click="createSelectBox">创建多选盒</el-button>
      <TransformPropertyPane v-else :selectedObject="multiSelectBoxRef" />
    </div>
    
    <div class="section">
      <div class="section-title">位置对齐</div>
      <div class="align-row">
        <span>X轴：</span>
        <el-button size="small" @click="alignPosition('x','left')">对齐最小</el-button>
        <el-button size="small" @click="alignPosition('x','center')">居中</el-button>
        <el-button size="small" @click="alignPosition('x','right')">对齐最大</el-button>
      </div>
      <!-- Y轴、Z轴同理 -->
    </div>
    
    <div class="section">
      <div class="section-title">平均分布</div>
      <div class="align-row">
        <el-button size="small" @click="distributeEvenly('x')">X轴平均</el-button>
        <el-button size="small" @click="distributeEvenly('y')">Y轴平均</el-button>
        <el-button size="small" @click="distributeEvenly('z')">Z轴平均</el-button>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">旋转一致</div>
      <div class="align-row">
        <el-button size="small" @click="unifyRotation('x')">X轴一致</el-button>
        <el-button size="small" @click="unifyRotation('y')">Y轴一致</el-button>
        <el-button size="small" @click="unifyRotation('z')">Z轴一致</el-button>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">等比例缩放</div>
      <div class="align-row">
        <el-button size="small" @click="scaleUniform('min')">按最小等比例</el-button>
        <el-button size="small" @click="scaleUniform('max')">按最大等比例</el-button>
      </div>
    </div>
  </div>
</template>
```

---

## 7. 场景层级树技术设计

### 7.1 文件位置

`src/components/editor/Inspector.vue` (482行)

### 7.2 搜索与过滤实现

```vue
<script setup>
import { ref, reactive, computed } from 'vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../composables/useObjectManager.js';
import ObjectItem from './ObjectItem.vue';

const objectSelection = useObjectSelection();
const objectManager = useObjectManager();

const searchQuery = ref('');
const showOnlyVisible = ref(false);
const showOnlySelected = ref(false);
const expandedIds = reactive(new Set());
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  object: null
});

const allObjects = computed(() => objectManager.getAllObjects());
const selectedObjectIds = computed(() => objectSelection.selectedIdsRef.value);

const filteredObjects = computed(() => {
  let objects = allObjects.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    objects = objects.filter(obj => 
      obj.name.toLowerCase().includes(query) ||
      (obj.userData.type && obj.userData.type.toLowerCase().includes(query))
    );
  }
  
  if (showOnlyVisible.value) {
    objects = objects.filter(obj => obj.visible);
  }
  
  if (showOnlySelected.value) {
    objects = objects.filter(obj => 
      selectedObjectIds.value.includes(obj.userData.id)
    );
  }
  
  return objects;
});
</script>
```

### 7.3 右键菜单实现

```vue
<template>
  <div class="inspector">
    <!-- 搜索框 -->
    <div class="search-section">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="搜索对象..." class="search-input">
        <span class="search-icon">🔍</span>
      </div>
      <div class="toolbar-row">
        <button @click="refreshHierarchy" class="toolbar-btn" title="刷新层级">🔄</button>
        <button @click="expandAll" class="toolbar-btn" title="展开所有">📂</button>
        <button @click="collapseAll" class="toolbar-btn" title="折叠所有">📁</button>
        <button @click="showOnlyVisible = !showOnlyVisible" 
          :class="['toolbar-btn', { active: showOnlyVisible }]" title="仅显示可见">👁️</button>
        <button @click="showOnlySelected = !showOnlySelected" 
          :class="['toolbar-btn', { active: showOnlySelected }]" title="仅显示选中">✅</button>
      </div>
    </div>

    <!-- 层级树 -->
    <div class="hierarchy-tree">
      <div v-if="filteredObjects.length === 0" class="empty-hierarchy">
        <p>场景中没有对象</p>
      </div>
      <div v-else class="object-list">
        <ObjectItem
          v-for="object in filteredObjects"
          :key="object.userData.id || object.uuid"
          :object="object"
          :level="0"
          :selected-ids="selectedObjectIds"
          :expanded-ids="expandedIds"
          :search-query="searchQuery"
          @select="handleObjectSelect"
          @toggle-expand="handleToggleExpand"
          @toggle-visibility="handleToggleVisibility"
          @toggle-lock="handleToggleLock"
          @context-menu="handleContextMenu"
        />
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenu.visible" class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop>
      <div class="context-item" @click="duplicateObject(contextMenu.object)">
        <span class="context-icon">📋</span> 复制对象
      </div>
      <div class="context-item" @click="deleteObject(contextMenu.object)">
        <span class="context-icon">🗑️</span> 删除对象
      </div>
      <div class="context-divider"></div>
      <div class="context-item" @click="isolateObject(contextMenu.object)">
        <span class="context-icon">👁️</span> 隔离显示
      </div>
      <div class="context-item" @click="focusObject(contextMenu.object)">
        <span class="context-icon">🎯</span> 聚焦对象
      </div>
      <div class="context-divider"></div>
      <div class="context-item" @click="renameObject(contextMenu.object)">
        <span class="context-icon">✏️</span> 重命名
      </div>
    </div>

    <!-- 背景遮罩 -->
    <div v-if="contextMenu.visible" class="context-overlay" @click="hideContextMenu"></div>
  </div>
</template>
```

### 7.4 右键菜单样式

```scss
.context-menu {
  position: fixed;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 150px;
  padding: 4px 0;
}

.context-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.context-item:hover {
  background: #444;
}

.context-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}
```

---

## 8. 场景视口技术设计

### 8.1 文件位置

`src/components/scene/SceneViewer.vue` (368行)

### 8.2 场景初始化

```vue
<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch, inject } from 'vue';
import { useThreeViewer, add3DTiles, addLight, add3DModel, addPrimitive } 
  from '@/composables/useThreeViewer.js';
import { useControls, switchControls } from '@/composables/useControls.js';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import { useInputManager } from '@/composables/useInputManager.js';
import { setupGrid, setGridVisible } from '@/composables/useHelpers.js';
import { useEditorConfig } from '@/composables/useEditorConfig.js';

const containerRef = ref(null);
const objectSelection = useObjectSelection();
const inputManager = useInputManager();
const transform = useTransform();

function initializeScene() {
  const { editorConfig } = useEditorConfig();
  const container = containerRef.value;
  if (container) {
    const viewerRef = useThreeViewer(container);
    const viewer = viewerRef.value;
    if (!viewer) return;

    viewer.setContainer(container);
    viewer.startRender();
    applyInitialPos();
    
    let { scene, camera, renderer } = viewer;
    let controls = switchControls(editorConfig.controlsType);

    // 初始化TransformControls
    objectSelection.initTransformControls({
      scene, camera, renderer, controls, transform
    });

    setupGrid();
    inputManager.setElement(container);
    setupInputHandlers();
    handleResize();

    watch(showGridRef, (val) => {
      setGridVisible(val);
    }, { immediate: true });
  }
}

function setupInputHandlers() {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  const materialSelection = useMaterialSelection();

  inputManager.on('click', (event) => {
    if (event.originalEvent.button == 0) {
      viewer.selectedObjects = undefined;
      materialSelection.selectedMaterialNameRef.value = null;
      objectSelection.handleClickSelection(event, viewer.camera);
    } else {
      objectSelection.clearSelection();
    }
  });
}

onMounted(async () => {
  await nextTick();
  initializeScene();
  
  await nextTick();
  const container = containerRef.value;
  if (container) {
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.setAttribute('tabindex', '0');
      canvas.addEventListener('click', () => canvas.focus());
    }
  }
});

window.addEventListener('resize', handleResize);
</script>

<template>
  <div class="scene-viewer" ref="containerRef" 
    @dragover="onDragOver" @drop="onDrop">
  </div>
</template>
```

### 8.3 拖拽加载实现

```javascript
async function onDrop(event) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let controlsRef = useControls();
  let controls = controlsRef.value;

  event.preventDefault();
  let options = { userData: {} };
  if (controls && controls.target) {
    const target = controls.target;
    options.position = [target.x, target.y, target.z];
  }

  try {
    // 判断拖拽类型
    const lightData = event.dataTransfer.getData('application/x-light');
    if (lightData) {
      const opt = JSON.parse(lightData);
      Object.assign(opt, options);
      addLight(opt);
      ElMessage.success('已添加灯光');
      return;
    }
    
    const primitiveData = event.dataTransfer.getData('application/x-primitive');
    if (primitiveData) {
      const opt = JSON.parse(primitiveData);
      Object.assign(opt, options);
      addPrimitive(opt);
      ElMessage.success('已添加基础对象');
      return;
    }

    const modelFile = event.dataTransfer.getData('application/x-model-file');
    if (modelFile) {
      const fileInfo = JSON.parse(modelFile);
      // 加载模型逻辑...
      await add3DModel(options);
      return;
    }
  } catch (e) {
    console.error('拖拽加载对象失败', e);
  }
}
```

---

## 9. 资源浏览器技术设计

### 9.1 文件位置

`src/components/editor/AssetBrowser.vue` (655行)

### 9.2 资源网格布局

```vue
<template>
  <div class="asset-browser">
    <!-- 拖拽加载区域 -->
    <div v-if="dragState.isDragOver" class="drag-overlay"
      @dragenter="handleDragEnter" @dragover.prevent 
      @dragleave="handleDragLeave" @drop="handleDrop">
      <div class="drag-content">
        <span class="drag-icon">📥</span>
        <p>释放文件以加载</p>
      </div>
    </div>

    <!-- 加载进度 -->
    <div v-if="loadState.isLoading" class="load-progress">
      <div class="progress-header">
        <span>加载中... {{ loadState.loadProgress.toFixed(0) }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" 
          :style="{ width: loadState.loadProgress + '%' }"></div>
      </div>
    </div>

    <!-- 资源标签页 -->
    <div class="asset-tabs">
      <button @click="activeTab = 'models'" 
        :class="['tab-btn', { active: activeTab === 'models' }]">
        3D模型 ({{ filteredModels.length }})
      </button>
      <button @click="activeTab = 'textures'" 
        :class="['tab-btn', { active: activeTab === 'textures' }]">
        纹理 ({{ filteredTextures.length }})
      </button>
    </div>

    <!-- 资源网格 -->
    <div class="asset-grid" @dragenter="handleDragEnter" @dragover.prevent
      @dragleave="handleDragLeave" @drop="handleDrop">
      <div v-if="activeTab === 'models'" class="models-grid">
        <!-- 上传按钮 -->
        <div class="asset-item model-item upload-item-fixed"
          @click="selectAndLoadFiles(['.gltf', '.glb', '.obj', '.fbx'])">
          <div class="asset-preview">
            <div class="preview-placeholder">
              <span class="placeholder-icon">⬆️</span>
            </div>
          </div>
          <div class="asset-info">
            <div class="asset-name">加载模型文件</div>
          </div>
        </div>
        
        <!-- 模型列表 -->
        <div v-for="model in filteredModels" :key="model.id"
          class="asset-item model-item"
          @click="selectModel(model)"
          :class="{ selected: selectedAssetId === model.id }"
          draggable="true"
          @dragstart="onModelDragStart($event, model)">
          <div class="asset-preview">
            <img v-if="model.preview" :src="model.preview" :alt="model.name"
              class="preview-image">
            <div v-else class="preview-placeholder">
              <span class="placeholder-icon">📦</span>
            </div>
            <button @click.stop="toggleFavorite('model', model.id)"
              class="favorite-btn" :class="{ active: model.isFavorite }">
              {{ model.isFavorite ? '⭐' : '☆' }}
            </button>
          </div>
          <div class="asset-info">
            <div class="asset-name" :title="model.name">{{ model.name }}</div>
            <div class="asset-meta">
              <span class="asset-type">{{ model.type }}</span>
              <span class="asset-size">{{ formatFileSize(model.size) }}</span>
            </div>
            <div class="asset-actions">
              <button @click.stop="deleteAsset('model', model.id)"
                class="action-btn delete-btn">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

### 9.3 拖拽数据设置

```javascript
function onModelDragStart(event, model) {
  event.dataTransfer.setData('application/x-model', JSON.stringify({
    id: model.id,
    type: model.type,
    name: model.name
  }));
  event.dataTransfer.effectAllowed = 'copy';
}
```

### 9.4 网格样式

```scss
.models-grid,
.textures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.asset-item {
  background: #333;
  border: 1px solid #555;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.asset-item:hover {
  border-color: #777;
  transform: translateY(-2px);
}

.asset-item.selected {
  border-color: #007acc;
  box-shadow: 0 0 0 1px #007acc;
}

.asset-preview {
  position: relative;
  width: 100%;
  height: 80px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## 10. 几何体浏览器技术设计

### 10.1 文件位置

`src/components/editor/PrimitiveBrowser.vue` (160行)

### 10.2 数据源与分组

```vue
<script setup>
import { computed } from 'vue';
import PRIMITIVES from '../../constants/PRIMITIVES.json';

function onDragStart(primitive) {
  event.dataTransfer.setData('application/x-primitive', JSON.stringify({
    type: primitive.type,
    name: primitive.name
  }));
  event.dataTransfer.effectAllowed = 'copy';
}

// 按category分组
const groupedPrimitives = computed(() => {
  const groups = {};
  for (const item of PRIMITIVES) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }
  const order = ['基础几何体', '扩展几何体', '灯光', '其他对象'];
  return order
    .map(category => {
      const items = Array.isArray(groups[category]) ? groups[category] : [];
      return { category, items };
    })
    .filter(group => Array.isArray(group.items) && group.items.length > 0);
});
</script>

<template>
  <div class="primitives-grid">
    <template v-for="(group, idx) in groupedPrimitives" :key="group.category">
      <div class="primitives-section" v-if="group.items && group.items.length">
        <h4 class="section-title">{{ group.category }}</h4>
        <div class="primitives-list">
          <div v-for="primitive in group.items" :key="primitive.type"
            class="primitive-item" :title="primitive.description"
            draggable="true" @dragstart="onDragStart(primitive)">
            <div class="primitive-preview">
              <span class="primitive-icon">{{ primitive.icon }}</span>
            </div>
            <div class="primitive-info">
              <div class="primitive-name">{{ primitive.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
```

### 10.3 网格样式

```scss
.primitives-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
  overflow: auto;
}

.primitives-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.primitive-item {
  background: #333;
  border: 1px solid #555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.primitive-item:hover {
  background: #444;
  border-color: #777;
}

.primitive-item:active {
  background: #007acc;
  border-color: #0088dd;
}

.primitive-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: #2a2a2a;
}

.primitive-icon {
  font-size: 24px;
}
```

---

## 11. 底部状态栏技术设计

### 11.1 文件位置

`src/components/editor/EditorFooter.vue` (446行)

### 11.2 场景统计实现

```vue
<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { ElTag, ElIcon, ElPopover, ElInputNumber, ElForm, ElFormItem, ElSwitch } 
  from 'element-plus';
import { Box, Camera, Position, DataAnalysis } from '@element-plus/icons-vue';
import { useThreeViewer } from '@/composables/useThreeViewer.js';
import { useEditorConfig } from '@/composables/useEditorConfig.js';
import { useCameraPosState, updateCurrentPos } from '@/composables/useCameraPosState.js';
import { useEventBus } from '@/composables/useEventBus.js';

const eventBus = useEventBus();
const { editorConfig } = useEditorConfig();
const cameraPosState = useCameraPosState();
const objectSelection = useObjectSelection();
const viewerRef = useThreeViewer();

const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
const cameraTarget = reactive({ x: 0, y: 0, z: 0 });

const sceneStats = reactive({
  objects: 0,
  vertices: 0,
  triangles: 0,
  materials: 0,
  textures: 0,
  models: 0,
  tileModels: 0,
  lights: 0,
  labels: 0,
  customMaterials: 0
});

// 监听场景事件更新统计
['scene-loaded', 'add-light', 'add-model', 'add-3dtiles', 'add-label',
  'remove-light', 'remove-model', 'remove-3dtiles', 'remove-label',
  'tile-loaded', 'visibility-changed', 'lock-changed'
].forEach(eventName => {
  eventBus.on(eventName, updateSceneStats);
});

function updateSceneStats() {
  let viewer = useThreeViewer().value;
  if (!viewer) return;

  sceneStats.objects = 0;
  sceneStats.vertices = 0;
  sceneStats.triangles = 0;
  let materials = new Set();
  let textures = new Set();
  
  viewer.scene.traverse(child => {
    sceneStats.objects++;
    if (child.geometry) {
      const posAttr = child.geometry.getAttribute('position');
      if (posAttr) sceneStats.vertices += posAttr.count;
      const index = child.geometry.getIndex();
      if (index) sceneStats.triangles += index.count / 3;
      else if (posAttr) sceneStats.triangles += posAttr.count / 3;
    }
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => materials.add(mat));
      } else {
        materials.add(child.material);
      }
    }
  });
  
  materials.forEach(material => {
    Object.values(material).forEach(value => {
      if (value && value.isTexture) textures.add(value);
    });
  });

  sceneStats.materials = materials.size;
  sceneStats.textures = textures.size;
  sceneStats.models = viewer.models ? viewer.models.length : 0;
  sceneStats.lights = viewer.lights ? viewer.lights.length : 0;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() ?? '0';
}
</script>
```

### 11.3 相机位置编辑

```vue
<template>
  <footer class="editor-footer">
    <div class="footer-left">
      <el-tag size="small" type="info" effect="dark">
        <el-icon><Box /></el-icon>
        {{ selectedIdsRef?.value?.length ? `已选中 ${selectedIdsRef.value.length} 个对象` : '未选中对象' }}
      </el-tag>
    </div>
    
    <div class="footer-center">
      <!-- 相机位置可编辑 -->
      <el-popover placement="top" trigger="click" 
        v-model:visible="cameraPosPopoverVisible">
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;">
            <el-icon><Camera /></el-icon>
            相机: ({{ cameraPosition.x.toFixed(1) }}, {{ cameraPosition.y.toFixed(1) }}, {{ cameraPosition.z.toFixed(1) }})
          </el-tag>
        </template>
        <el-form size="small">
          <el-form-item label="X">
            <el-input-number v-model="cameraPosEdit.x" :step="1" :precision="2" 
              controls-position="right" @change="handleCameraPositionChange" />
          </el-form-item>
          <el-form-item label="Y">
            <el-input-number v-model="cameraPosEdit.y" :step="1" :precision="2" 
              controls-position="right" @change="handleCameraPositionChange" />
          </el-form-item>
          <el-form-item label="Z">
            <el-input-number v-model="cameraPosEdit.z" :step="1" :precision="2" 
              controls-position="right" @change="handleCameraPositionChange" />
          </el-form-item>
        </el-form>
      </el-popover>
      
      <!-- 目标位置可编辑 -->
      <el-popover placement="top" trigger="click" 
        v-model:visible="cameraTargetPopoverVisible">
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;">
            <el-icon><Position /></el-icon>
            目标: ({{ cameraTarget.x.toFixed(2) }}, {{ cameraTarget.y.toFixed(2) }}, {{ cameraTarget.z.toFixed(2) }})
          </el-tag>
        </template>
        <el-form size="small">
          <el-form-item label="X">
            <el-input-number v-model="cameraTargetEdit.x" :step="1" :precision="2" 
              controls-position="right" @change="handleCameraTargetChange" />
          </el-form-item>
          <!-- Y、Z同理 -->
        </el-form>
      </el-popover>
      
      <ElSwitch v-model="lockY" active-text="平视" size="small" />
    </div>
    
    <div class="footer-right">
      <!-- 场景统计弹窗 -->
      <el-popover placement="top" trigger="hover" popper-class="scene-stats-popover">
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;">
            <el-icon><DataAnalysis /></el-icon>
            场景统计
          </el-tag>
        </template>
        <div class="scene-stats">
          <div class="stat-item">
            <span class="stat-label">对象数量:</span>
            <span class="stat-value">{{ sceneStats.objects }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">三角形:</span>
            <span class="stat-value">{{ formatNumber(sceneStats.triangles) }}</span>
          </div>
          <!-- 更多统计项... -->
        </div>
      </el-popover>
    </div>
  </footer>
</template>
```

---

## 12. 场景覆盖层技术设计

### 12.1 视角控制器

**文件**: `src/components/scene/CubeViewportControls.vue` (91行)

```vue
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { ViewportGizmo } from 'three-viewport-gizmo';

const props = defineProps({
  camera: { type: Object, required: false, default: null },
  renderer: { type: Object, required: false, default: null },
  controls: { type: Object, required: false, default: null },
  cameraQuaternion: { type: Object, required: false, default: null }
});
const emit = defineEmits(['viewChange']);

const gizmoContainer = ref(null);
let gizmo;

function initGizmo() {
  if (props.camera && props.renderer && props.controls) {
    gizmo = new ViewportGizmo(props.camera, props.renderer, {
      container: gizmoContainer.value,
      type: 'sphere',
      size: 100,
      placement: 'bottom-right',
      animated: true,
      speed: 1.2
    });
    gizmo.attachControls(props.controls);
    gizmo.addEventListener('change', () => {
      emit('viewChange', 'change');
    });
  }
}

function disposeGizmo() {
  if (gizmo) {
    gizmo.dispose();
    gizmo = null;
  }
}

onMounted(() => {
  initGizmo();
  function animate() {
    if (gizmo) gizmo.render();
    animationId = requestAnimationFrame(animate);
  }
  animate();
});

onUnmounted(() => {
  disposeGizmo();
  if (animationId) cancelAnimationFrame(animationId);
});

watch(() => props.cameraQuaternion, (q) => {
  if (gizmo && q) {
    gizmo.camera.quaternion.set(q.x, q.y, q.z, q.w);
    gizmo.cameraUpdate();
  }
}, { deep: true });
</script>

<template>
  <div ref="gizmoContainer" class="cube-viewport-controls"></div>
</template>

<style scoped>
.cube-viewport-controls {
  width: 100px;
  height: 100px;
  z-index: 300;
}
</style>
```

### 12.2 操作提示

**文件**: `src/components/scene/InteractionHints.vue` (202行)

```vue
<script setup>
import { ElTag, ElIcon } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import { ref, computed } from 'vue';
import { useEditorConfig } from '../../composables/useEditorConfig.js';
import { useThreeViewer } from '../../composables/useThreeViewer.js';

const isHovered = ref(false);
const { editorConfig, setControlsType, CONTROLS_OPTIONS } = useEditorConfig();

const controlsType = computed({
  get: () => editorConfig.controlsType,
  set: (val) => {
    setControlsType(val);
  }
});
</script>

<template>
  <div class="interaction-hints" :class="{ 'is-collapsed': !isHovered }"
    @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <template v-if="isHovered">
      <template v-if="controlsType === 'FlyControls'">
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">W / S</span>
          <span class="hint-action">前进后退</span>
        </el-tag>
        <!-- 更多提示... -->
      </template>
      <template v-if="controlsType === 'OrbitControls'">
        <el-tag class="hint-item" size="small" type="info" effect="dark">
          <span class="hint-key">左键</span>
          <span class="hint-action">旋转视图</span>
        </el-tag>
        <!-- 更多提示... -->
      </template>
      <select :value="controlsType" @change="e => controlsType = e.target.value"
        style="width: 140px; margin-bottom: 10px;">
        <option v-for="item in CONTROLS_OPTIONS" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
    </template>
    <template v-else>
      <el-icon class="hint-icon"><InfoFilled /></el-icon>
      <span class="hint-mode-text">{{ controlsType }}</span>
    </template>
  </div>
</template>
```

### 12.3 性能监控

**文件**: `src/components/scene/StatHints.vue` (157行)

```vue
<script setup>
import { ref, shallowRef, onMounted, onUnmounted, nextTick } from 'vue';
import Stats from "stats-gl";
import { useThreeViewer } from '../../composables/useThreeViewer.js';

const stateRef = shallowRef(null);
const showDetail = ref(false);
const stickyDetail = ref(false);
const fps = ref(0);
const statsRef = shallowRef(null);
statsRef.value = new Stats({ trackGPU: true, horizontal: false });

function updateTimer() {
  requestAnimationFrameObj = requestAnimationFrame(() => {
    const stats = statsRef.value;
    if (stats) {
      stats.update();
      if (stats.updateCounter % 100 === 0) {
        fps.value = Math.round(stats.lastValue.FPS);
      }
    }
    updateTimer();
  });
}

function init() {
  let viewer = useThreeViewer().value;
  if (!viewer) return;
  let { renderer } = viewer;
  const stats = statsRef.value;
  if (renderer) {
    stats.dom.style.position = 'relative';
    stats.dom.style.width = '90px';
    stats.dom.style.height = '150px';
    stateRef.value.appendChild(stats.dom);
    stats.init(renderer);
    updateTimer();
  }
}

onMounted(() => {
  nextTick(() => { init(); });
});

onUnmounted(() => {
  const stats = statsRef.value;
  if (stats && stats.dom && stats.dom.parentNode) {
    stats.dom.parentNode.removeChild(stats.dom);
  }
  if (requestAnimationFrameObj) {
    cancelAnimationFrame(requestAnimationFrameObj);
  }
});
</script>

<template>
  <div class="stat-hints" @mouseenter="showDetail = true" 
    @mouseleave="!stickyDetail && (showDetail = false)" @click="stickyDetail = !stickyDetail">
    <span class="fps">{{ fps }}</span>
    <span v-show="showDetail" ref="stateRef" class="detail"></span>
  </div>
</template>
```

### 12.4 视图控制按钮

**文件**: `src/components/scene/ViewportControls.vue` (124行)

```vue
<script setup>
import { ElButton, ElIcon } from 'element-plus';
import { House, ZoomIn, Box, Grid } from '@element-plus/icons-vue';

defineProps({
  showWireframe: { type: Boolean, required: true },
  showGrid: { type: Boolean, required: true },
  resetView: { type: Function, required: true },
  fitToScreen: { type: Function, required: true },
  toggleWireframe: { type: Function, required: true },
  toggleGrid: { type: Function, required: true }
});
</script>

<template>
  <div class="viewport-controls">
    <div class="control-group">
      <el-button @click="resetView" class="control-btn" title="重置视图" circle type="primary">
        <el-icon><House /></el-icon>
      </el-button>
      <el-button @click="fitToScreen" class="control-btn" title="适应屏幕" circle type="primary">
        <el-icon><ZoomIn /></el-icon>
      </el-button>
      <el-button @click="toggleWireframe" class="control-btn" 
        :class="{ active: showWireframe }" title="线框模式" circle type="primary">
        <el-icon><Box /></el-icon>
      </el-button>
      <el-button @click="toggleGrid" class="control-btn" 
        :class="{ active: showGrid }" title="网格" circle type="primary">
        <el-icon><Grid /></el-icon>
      </el-button>
    </div>
  </div>
</template>
```

---

## 13. 对话框技术设计

### 13.1 编辑器配置对话框

**文件**: `src/components/dialog/EditorConfigDialog.vue` (219行)

```vue
<script setup>
import { ref, watch } from 'vue';
import { useEditorConfig, CONTROLS_OPTIONS } from '@/composables/useEditorConfig.js';

const props = defineProps({
  modelValue: { type: Boolean, required: true }
});
const emit = defineEmits(['update:modelValue']);

const {
  editorConfig, setControlsType, setControlsParams,
  setGridConfig, setAxesSize, resetEditorConfig
} = useEditorConfig();

const form = ref({
  controlsType: editorConfig.controlsType,
  targetDistance: editorConfig.targetDistance,
  lockY: editorConfig.lockY,
  enableKeyboard: editorConfig.enableKeyboard,
  movementSpeed: editorConfig.movementSpeed,
  rollSpeed: editorConfig.rollSpeed,
  panSpeed: editorConfig.panSpeed,
  rotateSpeed: editorConfig.rotateSpeed,
  zoomSpeed: editorConfig.zoomSpeed,
  gridSize: editorConfig.gridSize,
  gridDivisions: editorConfig.gridDivisions,
  gridColorCenterLine: editorConfig.gridColorCenterLine,
  gridColorGrid: editorConfig.gridColorGrid,
  axesSize: editorConfig.axesSize,
});

// 打开时同步配置
watch(() => props.modelValue, (val) => {
  if (val) {
    form.value.controlsType = editorConfig.controlsType;
    form.value.targetDistance = editorConfig.targetDistance;
    // ... 同步所有字段
  }
});

function handleSave() {
  setControlsType(form.value.controlsType);
  setControlsParams({
    targetDistance: form.value.targetDistance,
    lockY: form.value.lockY,
    enableKeyboard: form.value.enableKeyboard,
    movementSpeed: form.value.movementSpeed,
    rollSpeed: form.value.rollSpeed,
    panSpeed: form.value.panSpeed,
    rotateSpeed: form.value.rotateSpeed,
    zoomSpeed: form.value.zoomSpeed
  });
  setGridConfig({
    gridSize: form.value.gridSize,
    gridDivisions: form.value.gridDivisions,
    gridColorCenterLine: form.value.gridColorCenterLine,
    gridColorGrid: form.value.gridColorGrid
  });
  setAxesSize(form.value.axesSize);
  emit('update:modelValue', false);
}

function handleReset() {
  resetEditorConfig();
  form.value.controlsType = editorConfig.controlsType;
  // ... 重置所有字段
}
</script>

<template>
  <el-dialog :model-value="props.modelValue" title="编辑器配置" width="500px" @close="handleClose">
    <el-form label-width="120px" size="small">
      <el-divider content-position="left">控制器配置</el-divider>
      <el-form-item label="默认Controls">
        <el-select v-model="form.controlsType" style="width: 200px">
          <el-option v-for="item in CONTROLS_OPTIONS" :key="item.value" 
            :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <template v-if="form.controlsType === 'FlyControls'">
        <el-form-item label="目标距离">
          <el-input-number v-model="form.targetDistance" :min="0.1" :max="1000" :step="0.1" />
        </el-form-item>
        <el-form-item label="镜头锁定Y轴">
          <el-switch v-model="form.lockY" active-text="强制平视" />
        </el-form-item>
        <el-form-item label="允许键盘操作">
          <el-switch v-model="form.enableKeyboard" />
        </el-form-item>
        <el-form-item label="键盘移动速度">
          <el-input-number v-model="form.movementSpeed" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
        <!-- 更多速度参数... -->
      </template>
      <el-divider content-position="left">网格配置</el-divider>
      <el-form-item label="网格尺寸">
        <el-input-number v-model="form.gridSize" :min="1" :step="1" />
      </el-form-item>
      <el-form-item label="网格分段">
        <el-input-number v-model="form.gridDivisions" :min="1" :step="1" />
      </el-form-item>
      <el-form-item label="中心线颜色">
        <el-color-picker v-model="form.gridColorCenterLine" />
      </el-form-item>
      <el-form-item label="网格颜色">
        <el-color-picker v-model="form.gridColorGrid" />
      </el-form-item>
      <el-divider content-position="left">视点坐标轴配置</el-divider>
      <el-form-item label="坐标轴尺寸">
        <el-input-number v-model="form.axesSize" :min="1" :max="100" :step="1" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleReset" type="warning">重置默认</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button @click="handleSave" type="primary">保存</el-button>
    </template>
  </el-dialog>
</template>
```

### 13.2 UserData编辑弹窗

**文件**: `src/components/dialog/UserDataPopup.vue` (203行)

```vue
<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  object: { type: Object, required: true }
});

const selectedObject = computed(() => props.object);
const userDataText = ref('');
const userDataError = ref('');

const userDataEntries = computed(() => {
  if (!props.object || !props.object.userData) return [];
  const entries = [];
  for (const [key, value] of Object.entries(props.object.userData)) {
    if (key === 'id') {
      entries.unshift({ key, value });
    } else if (value && typeof value === 'object') {
      entries.push({ key, value, str: JSON.stringify(value, null, 2) });
    } else {
      entries.push({ key, value });
    }
  }
  return entries;
});

function refreshUserData() {
  const newObject = selectedObject.value;
  if (newObject) {
    userDataText.value = JSON.stringify(newObject.userData ?? {}, null, 2);
    userDataError.value = '';
  }
}
watch(selectedObject, refreshUserData, { immediate: true });

function onUserDataBlur() {
  if (!selectedObject.value) return;
  try {
    const json = JSON.parse(userDataText.value);
    selectedObject.value.userData = json;
    userDataError.value = '';
    ElMessage.success('userData已更新');
  } catch (e) {
    userDataError.value = 'JSON格式错误，请检查输入';
  }
}
</script>

<template>
  <div v-if="object" class="user-data-popup">
    <div class="popup-header">
      <div class="popup-title">&nbsp;{{ object.name || object.uuid }}</div>
      <div class="button-close" @click="handleClose">×</div>
    </div>
    <el-tabs v-if="selectedObject && selectedObject.userData">
      <el-tab-pane label="表格视图">
        <el-table :data="userDataEntries" border size="small">
          <el-table-column prop="key" label="Key" width="80" />
          <el-table-column prop="value" label="Value">
            <template #default="scope">
              <el-popover v-if="scope.row.str && (scope.row.str.startsWith('{') || scope.row.str.startsWith('['))" 
                width="400" trigger="hover">
                <template #reference>
                  <el-link size="small">查看</el-link>
                </template>
                <pre>{{ scope.row.str }}</pre>
              </el-popover>
              <span v-else-if="scope.row.str">{{ scope.row.str }}</span>
              <span v-else>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="JSON视图">
        <el-input class="user-data-input" type="textarea" v-model="userDataText" 
          :rows="4" @blur="onUserDataBlur" size="small" />
        <div v-if="userDataError" style="color: #f56c6c; font-size: 12px;">
          {{ userDataError }}
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
```

---

## 14. 编辑器配置组合式函数

### 14.1 文件位置

`src/composables/useEditorConfig.js` (138行)

### 14.2 实现

```javascript
import { reactive, computed, watch } from 'vue';

export const CONTROLS_OPTIONS = [
  { label: 'OrbitControls', value: 'OrbitControls' },
  { label: 'MapControls', value: 'MapControls' },
  { label: 'FlyControls', value: 'FlyControls' }
];

function loadConfigFromLocalStorage() {
  try {
    const raw = localStorage.getItem('three-editor-config');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function saveConfigToLocalStorage() {
  try {
    localStorage.setItem('three-editor-config', JSON.stringify(editorConfig));
  } catch (e) {}
}

const defaultConfig = {
  controlsType: 'FlyControls',
  targetDistance: 10,
  lockY: false,
  enableKeyboard: true,
  movementSpeed: 10.0,
  rollSpeed: 0.05,
  panSpeed: 1.0,
  rotateSpeed: 1.0,
  zoomSpeed: 1.0,
  gridSize: 1000,
  gridDivisions: 100,
  gridColorCenterLine: '#666666',
  gridColorGrid: '#333333',
  axesSize: 5
};

const loadedConfig = loadConfigFromLocalStorage();
const editorConfig = reactive({
  ...defaultConfig,
  ...(loadedConfig || {})
});

function setControlsType(type) {
  editorConfig.controlsType = type;
  saveConfigToLocalStorage();
}

function setControlsParams(params) {
  if (typeof params.targetDistance === 'number') editorConfig.targetDistance = params.targetDistance;
  if (typeof params.lockY === 'boolean') editorConfig.lockY = params.lockY;
  if (typeof params.enableKeyboard === 'boolean') editorConfig.enableKeyboard = params.enableKeyboard;
  if (typeof params.movementSpeed === 'number') editorConfig.movementSpeed = params.movementSpeed;
  if (typeof params.rollSpeed === 'number') editorConfig.rollSpeed = params.rollSpeed;
  if (typeof params.panSpeed === 'number') editorConfig.panSpeed = params.panSpeed;
  if (typeof params.rotateSpeed === 'number') editorConfig.rotateSpeed = params.rotateSpeed;
  if (typeof params.zoomSpeed === 'number') editorConfig.zoomSpeed = params.zoomSpeed;
  saveConfigToLocalStorage();
}

function setGridConfig(params) {
  if (typeof params.gridSize === 'number') editorConfig.gridSize = params.gridSize;
  if (typeof params.gridDivisions === 'number') editorConfig.gridDivisions = params.gridDivisions;
  if (typeof params.gridColorCenterLine === 'string') editorConfig.gridColorCenterLine = params.gridColorCenterLine;
  if (typeof params.gridColorGrid === 'string') editorConfig.gridColorGrid = params.gridColorGrid;
  saveConfigToLocalStorage();
}

function setAxesSize(size) {
  editorConfig.axesSize = size;
  saveConfigToLocalStorage();
}

function resetEditorConfig() {
  Object.assign(editorConfig, defaultConfig);
  saveConfigToLocalStorage();
}

export function useEditorConfig() {
  return {
    editorConfig,
    useEditorConfigState: () => computed(() => ({ ...editorConfig })),
    setControlsType,
    setControlsParams,
    setGridConfig,
    setAxesSize,
    resetEditorConfig,
    CONTROLS_OPTIONS
  };
}
```

---

## 15. 属性面板组件清单

### 15.1 文件位置

所有属性面板位于 `src/components/property/` 目录下。

### 15.2 核心共享面板 (8个)

| 文件 | 说明 |
|------|------|
| `BasePropertyPane.vue` | 对象名称、可见性、锁定状态 |
| `TransformPropertyPane.vue` | 位置XYZ、旋转XYZ、缩放XYZ |
| `MaterialPropertyPane.vue` | 材质基础参数编辑 |
| `TexturePropertyPane.vue` | 纹理映射参数编辑 |
| `AnimationPropertyPane.vue` | 动画选择与播放控制 |
| `ScenePropertyPane.vue` | 场景级别属性 |
| `UserDataPropertyPane.vue` | 对象userData编辑 |
| `SceneUserDataPropertyPane.vue` | 场景userData编辑 |

### 15.3 材质专家模式子面板 (17个)

| 文件 | 说明 |
|------|------|
| `MaterialPropertyPaneAdv.vue` | 专家模式主面板，包含多个子Tab |
| `MaterialPropertyPaneAdv-basic.vue` | 基础参数Tab |
| `MaterialPropertyPaneAdv-color.vue` | 颜色贴图Tab |
| `MaterialPropertyPaneAdv-normal.vue` | 法线贴图Tab |
| `MaterialPropertyPaneAdv-roughness.vue` | 粗糙度贴图Tab |
| `MaterialPropertyPaneAdv-metalness.vue` | 金属度贴图Tab |
| `MaterialPropertyPaneAdv-env.vue` | 环境贴图Tab |
| `MaterialPropertyPaneAdv-emissive.vue` | 自发光Tab |
| `MaterialPropertyPaneAdv-alpha.vue` | 透明通道Tab |
| `MaterialPropertyPaneAdv-bump.vue` | 凹凸贴图Tab |
| `MaterialPropertyPaneAdv-displacement.vue` | 置换贴图Tab |
| `MaterialPropertyPaneAdv-clearcoat.vue` | 清漆层Tab |
| `MaterialPropertyPaneAdv-sheen.vue` | 光泽层Tab |
| `MaterialPropertyPaneAdv-specular.vue` | 高光Tab |
| `MaterialPropertyPaneAdv-transmission.vue` | 透光Tab |
| `MaterialPropertyPaneAdv-thickness.vue` | 厚度Tab |
| `MaterialPropertyPaneAdv-light.vue` | 光照参数Tab |
| `MaterialPropertyPaneAdv-ao.vue` | 环境光遮蔽Tab |

### 15.4 纹理辅助组件 (4个)

| 文件 | 说明 |
|------|------|
| `TexturePropertyItem.vue` | 纹理属性编辑项 |
| `MaterialSelectPropertyItem.vue` | 材质选择属性项 |
| `FileUrlPropertyItem.vue` | 文件URL属性项 |
| `TexturePropertyPane.vue` | 纹理编辑面板 |

### 15.5 几何体参数面板 (14个)

| 文件 | 对应几何体类型 |
|------|---------------|
| `PrimitivePropertyPane-box.vue` | BoxGeometry |
| `PrimitivePropertyPane-sphere.vue` | SphereGeometry |
| `PrimitivePropertyPane-cylinder.vue` | CylinderGeometry |
| `PrimitivePropertyPane-cone.vue` | ConeGeometry |
| `PrimitivePropertyPane-torus.vue` | TorusGeometry |
| `PrimitivePropertyPane-plane.vue` | PlaneGeometry |
| `PrimitivePropertyPane-circle.vue` | CircleGeometry |
| `PrimitivePropertyPane-ring.vue` | RingGeometry |
| `PrimitivePropertyPane-dodecahedron.vue` | DodecahedronGeometry |
| `PrimitivePropertyPane-icosahedron.vue` | IcosahedronGeometry |
| `PrimitivePropertyPane-octahedron.vue` | OctahedronGeometry |
| `PrimitivePropertyPane-tetrahedron.vue` | TetrahedronGeometry |
| `PrimitivePropertyPane-tube.vue` | TubeGeometry |

### 15.6 灯光参数面板 (6个)

| 文件 | 对应灯光类型 |
|------|-------------|
| `LightPropertyPane-AmbientLight.vue` | AmbientLight |
| `LightPropertyPane-DirectionalLight.vue` | DirectionalLight |
| `LightPropertyPane-PointLight.vue` | PointLight |
| `LightPropertyPane-SpotLight.vue` | SpotLight |
| `LightPropertyPane-HemisphereLight.vue` | HemisphereLight |
| `LightPropertyPane-RectAreaLight.vue` | RectAreaLight |

---

## 16. 状态管理技术实现

### 16.1 应用状态

```javascript
// Editor.vue 中定义
const appState = reactive({
  isLoading: true,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  bottomPanelCollapsed: true,
  activeLeftTab: 'primitives', // 'primitives' | 'files' | 'assets' | 'inspector'
  panels: {
    leftWidth: 300,
    rightWidth: 300,
    bottomHeight: 200
  }
});

// 通过 provide 注入
provide('appState', appState);

// 子组件通过 inject 获取
const appState = inject('appState');
```

### 16.2 编辑器配置持久化

```javascript
// useEditorConfig.js
const editorConfig = reactive({
  ...defaultConfig,
  ...(loadConfigFromLocalStorage() || {})
});

// 每次修改后自动保存
function setControlsType(type) {
  editorConfig.controlsType = type;
  saveConfigToLocalStorage();
}
```

### 16.3 状态传递架构

```
Editor.vue (provide)
  ├── 'objectSelection' → useObjectSelection() 实例
  ├── 'transform' → useTransform() 实例
  ├── 'assets' → useAssetsManager() 实例
  └── 'appState' → reactive 对象

各子组件通过 inject 获取共享状态
各功能模块通过独立 composable 获取专属状态
```

---

## 17. 深色主题实现

### 17.1 全局样式

```scss
// src/style.scss
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #333333;
  --bg-hover: #444444;
  --border-color: #444444;
  --text-primary: #ffffff;
  --text-secondary: #aaaaaa;
  --accent-color: #007acc;
  --accent-hover: #0088dd;
  --danger-color: #d73a49;
}

.editor-container {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### 17.2 滚动条样式

```scss
:deep(*::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(*::-webkit-scrollbar-track) {
  background: #333;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: #555;
  border-radius: 4px;
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: #666;
}
```

### 17.3 选择文本样式

```scss
::selection {
  background: #007acc;
  color: #fff;
}

:deep(::selection) {
  background: #007acc;
  color: #fff;
}
```

---

## 18. 响应式设计

### 18.1 移动端适配

```scss
@media (max-width: 1024px) {
  .editor-sidebar {
    width: 280px !important;
  }
}

@media (max-width: 768px) {
  .editor-footer {
    height: 24px;
    padding: 0 12px;
    font-size: 10px;
  }
  .footer-center {
    display: none;
  }
}
```

### 18.2 工具栏响应式

```scss
@media (max-width: 900px) {
  .ribbon-content {
    flex-wrap: wrap;
    gap: 12px;
  }
  .ribbon-group {
    min-width: 90px;
  }
  .ribbon-btn {
    min-width: 40px;
    font-size: 10px;
  }
}
```

---

## 19. 依赖关系

### 19.1 NPM 依赖

```json
{
  "dependencies": {
    "vue": "^3.5.17",
    "element-plus": "^2.10.5",
    "three": "^0.182.0",
    "three-viewport-gizmo": "latest",
    "stats-gl": "latest",
    "sass": "^1.90.0",
    "mitt": "^3.0.1"
  }
}
```

### 19.2 内部依赖图

```
Editor.vue
  ├── Toolbar.vue
  │   ├── EditorConfigDialog.vue
  │   ├── VfsFileChooserDialog.vue
  │   └── VfsFileSaverDialog.vue
  ├── ResourcePanel.vue
  │   ├── Inspector.vue
  │   │   └── ObjectItem.vue
  │   ├── AssetBrowser.vue
  │   ├── PrimitiveBrowser.vue
  │   └── VfsFileBrowser.vue
  ├── SceneViewer.vue
  ├── PropertyPanel.vue
  │   ├── BasePropertyPane.vue
  │   ├── TransformPropertyPane.vue
  │   ├── MaterialPropertyPane.vue
  │   ├── AnimationPropertyPane.vue
  │   ├── LightPropertyPane-*.vue (6个)
  │   ├── PrimitivePropertyPane-*.vue (14个)
  │   ├── UserDataPropertyPane.vue
  │   └── ScenePropertyPane.vue
  ├── MultiSelectPanel.vue
  ├── EditorFooter.vue
  ├── ViewportControls.vue
  ├── CubeViewportControls.vue
  ├── InteractionHints.vue
  └── StatHints.vue
```

---

## 20. 测试策略

### 20.1 组件单元测试

```javascript
describe('PropertyPanel', () => {
  test('未选中对象时显示场景属性', () => {
    const wrapper = mount(PropertyPanel, {
      global: {
        provide: {
          objectSelection: { selectedIdsRef: ref([]) }
        }
      }
    });
    expect(wrapper.text()).toContain('场景');
  });

  test('选中网格对象时显示变换和材质面板', () => {
    const mockMesh = { type: 'Mesh', geometry: { type: 'BoxGeometry' } };
    const wrapper = mount(PropertyPanel, {
      global: {
        provide: {
          objectSelection: { selectedIdsRef: ref(['id1']), getSelectedObjects: () => [mockMesh] }
        }
      }
    });
    expect(wrapper.findComponent(TransformPropertyPane).exists()).toBe(true);
  });
});
```

### 20.2 集成测试

```javascript
describe('UI Integration', () => {
  test('拖拽几何体到场景创建对象', async () => {
    const wrapper = mount(Editor);
    const sceneViewer = wrapper.findComponent(SceneViewer);
    
    // 模拟拖拽事件
    await sceneViewer.trigger('drop', {
      dataTransfer: {
        getData: (type) => type === 'application/x-primitive' 
          ? JSON.stringify({ type: 'box', name: '立方体' }) : '',
        preventDefault: () => {}
      },
      preventDefault: () => {}
    });
    
    // 验证对象已创建
    expect(objectManager.getAllObjects().length).toBeGreaterThan(0);
  });
});
```

### 20.3 视觉回归测试

- 使用 Playwright 截图对比各面板状态
- 验证深色主题一致性
- 验证响应式布局在不同断点的表现

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
