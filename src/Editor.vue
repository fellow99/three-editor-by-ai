<!--
  3D场景编辑器主应用组件
  - 编辑器主界面，集成场景视图、工具栏、属性面板等
  - 部分UI组件采用element-plus
-->
<template>
  <div id="app" class="editor-container">
    <!-- 加载遮罩 -->
    <div v-if="appState.isLoading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="spin"><Loading /></el-icon>
        <!-- <h2>3D 场景编辑器</h2> -->
        <p>正在加载，请稍候...</p>
      </div>
    </div>

    <!-- 顶部工具栏 -->
    <!-- 主工具栏 -->
    <div class="main-toolbar">
      <Toolbar @delete-selected="handleDeleteSelected" @duplicate-selected="handleDuplicateSelected" />
    </div>
    
    <!-- 主编辑区域 -->
    <main class="editor-main">
      <!-- 主场景视口 -->
      <div class="editor-viewport">
        <!-- 浮动面板：右上 -->
        <ViewportControls
          :showWireframe="showWireframe"
          :showGrid="showGrid"
          :resetView="resetView"
          :fitToScreen="fitToScreen"
          :toggleWireframe="toggleWireframe"
          :toggleGrid="toggleGrid"
          :class="[
            'viewport-controls',
            { 'with-right': !appState.rightPanelCollapsed }
          ]"
        />
        <!-- 浮动面板：右下 -->
        <CubeViewportControls
          v-if="threeViewer && threeViewer.controls"
          :class="[
            'cube-controls-bottomright',
            { 'with-right': !appState.rightPanelCollapsed }
          ]"
          :camera="threeViewer?.camera"
          :renderer="threeViewer?.renderer"
          :controls="threeViewer?.controls"
          :cameraQuaternion="cameraQuaternion"
          @viewChange="setViewAngle"
        />
        <!-- 浮动面板：左上 性能监控 -->
        <StatHints
          :class="[
            'stat-hints',
            { 'with-left': !appState.leftPanelCollapsed }
          ]"
        />
        <!-- 浮动面板：左下 -->
        <InteractionHints
          :class="[
            'interaction-hints',
            { 'with-left': !appState.leftPanelCollapsed }
          ]"
        />
        <SceneViewer
          @delete-selected="handleDeleteSelected"
          :showWireframe="showWireframe"
          :showGrid="showGrid"
        />
      </div>
      
      <!-- 左侧资源面板 -->
      <div 
        v-show="!appState.leftPanelCollapsed" 
        class="editor-sidebar left-panel"
        :style="{ width: appState.panels.leftWidth + 'px' }"
      >
        <ResourcePanel
          :activeLeftTab="appState.activeLeftTab"
          :setActiveLeftTab="setActiveLeftTab"
        />
      </div>
      <!-- 浮动切换按钮（左侧） -->
      <div 
        @click="toggleLeftPanel" 
        class="sidebar-toggle left"
        :class="{ active: !appState.leftPanelCollapsed }"
      >
      </div>
      
      <!-- 右侧属性面板 -->
      <div 
        v-show="!appState.rightPanelCollapsed" 
        class="editor-sidebar right-panel"
        :style="{ width: appState.panels.rightWidth + 'px' }"
      >
        <MultiSelectPanel v-if="showMultiSelectPanel" />
        <PropertyPanel v-else />
      </div>
      <!-- 浮动切换按钮（右侧） -->
      <div
        @click="toggleRightPanel" 
        class="sidebar-toggle right"
        :class="{ active: !appState.rightPanelCollapsed }"
      >
      </div>
    </main>

    <!-- 状态栏 -->
    <EditorFooter />
  </div>
</template>

<script setup>
 // 3D场景编辑器主应用组件
import { ref, reactive, provide, onMounted, onUnmounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

import { useObjectSelection } from './composables/useObjectSelection.js';
import { useTransform } from './composables/useTransform.js';
import { useAssetsManager } from './composables/useAssetsManager.js';
import { useObjectManager } from './composables/useObjectManager.js';
import { useThreeViewer } from './composables/useThreeViewer.js';
import { applyInitialPos } from '@/composables/useCameraPosState.js';
import { useEventBus } from '@/composables/useEventBus.js';

// 导入组件
import Toolbar from './components/editor/Toolbar.vue';
import ResourcePanel from './components/editor/ResourcePanel.vue';
import SceneViewer from './components/scene/SceneViewer.vue';
import PropertyPanel from './components/editor/PropertyPanel.vue';
import MultiSelectPanel from './components/editor/MultiSelectPanel.vue';
import EditorFooter from './components/editor/EditorFooter.vue';

// 浮动面板组件
import ViewportControls from './components/scene/ViewportControls.vue';
import CubeViewportControls from './components/scene/CubeViewportControls.vue';
import InteractionHints from './components/scene/InteractionHints.vue';
import StatHints from './components/scene/StatHints.vue';

 // 应用状态管理
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

// 左侧面板控制方法
function toggleLeftPanel() {
  appState.leftPanelCollapsed = !appState.leftPanelCollapsed;
}

import { computed } from 'vue';

 // 使用各种 composables
const threeViewer = useThreeViewer();
const objectSelection = useObjectSelection();
const transform = useTransform();
const assets = useAssetsManager();

/** 是否显示多选面板（选中对象数大于1） */
const showMultiSelectPanel = computed(() => objectSelection.selectedIdsRef.value.length > 1);

import * as THREE from 'three';

// 提供给子组件使用
provide('objectSelection', objectSelection);
provide('transform', transform);
provide('assets', assets);
provide('appState', appState);

// ====== 以下为浮动面板迁移相关状态和方法 ======

// 线框/网格显示
const showWireframe = ref(false);
const showGrid = ref(true);

/**
 * @description 相机位置与四元数
 */
const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
const cameraQuaternion = ref({ x: 0, y: 0, z: 0, w: 1 });
/**
 * @description OrbitControls target（即视点目标点），用于底部状态栏显示
 */
const cameraTarget = reactive({ x: 0, y: 0, z: 0 });


/**
 * 处理EditorFooter相机位置变更事件
 * @param {Object} pos 新的相机位置
 */
function onCameraPositionUpdate(pos) {
  if (threeViewer?.camera) {
    threeViewer.camera.position.set(pos.x, pos.y, pos.z);
  }
}
/**
 * 处理EditorFooter目标点变更事件
 * @param {Object} target 新的controls target
 */
function onCameraTargetUpdate(target) {
  if (threeViewer?.controls && threeViewer.controls.target) {
    threeViewer.controls.target.set(target.x, target.y, target.z);
    // 同步相机朝向
    if (threeViewer.camera && typeof threeViewer.camera.lookAt === 'function') {
      threeViewer.camera.lookAt(target.x, target.y, target.z);
    }
  }
}
// 定时更新相机状态
let animationId = null;
function updateCameraState() {
  if (threeViewer?.camera) {
    const pos = threeViewer.camera.position;
    cameraPosition.x = pos.x;
    cameraPosition.y = pos.y;
    cameraPosition.z = pos.z;
    // 获取 OrbitControls target
    const controls = threeViewer.controls;
    if (controls && controls.target) {
      cameraTarget.x = controls.target.x;
      cameraTarget.y = controls.target.y;
      cameraTarget.z = controls.target.z;
    }
  }
  animationId = requestAnimationFrame(updateCameraState);
}

// 控制方法
function resetView() {
  applyInitialPos();
}

function fitToScreen() {
  const objectManager = useObjectManager();
  const objects = objectManager.getAllObjects();
  if (objects.length > 0) {
    const box = new THREE.Box3();
    objects.forEach(obj => {
      box.expandByObject(obj);
    });
    if (!box.isEmpty()) {
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxSize = Math.max(size.x, size.y, size.z);
      const distance = maxSize * 2;
      scene.updateCameraConfig({
        position: { 
          x: center.x + distance, 
          y: center.y + distance, 
          z: center.z + distance 
        },
        target: { x: center.x, y: center.y, z: center.z }
      });
    }
  }
}

function toggleWireframe() {
  showWireframe.value = !showWireframe.value;
  const objects = scene.objectManager.getAllObjects();
  objects.forEach(object => {
    object.traverse(child => {
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            mat.wireframe = showWireframe.value;
          });
        } else {
          child.material.wireframe = showWireframe.value;
        }
      }
    });
  });
}

function toggleGrid() {
  showGrid.value = !showGrid.value;
  // 由SceneViewer负责网格辅助线的添加/显示
}

function setViewAngle(angle) {
  const distance = 10;
  let position;
  switch (angle) {
    case 'front':
      position = { x: 0, y: 0, z: distance };
      break;
    case 'back':
      position = { x: 0, y: 0, z: -distance };
      break;
    case 'left':
      position = { x: -distance, y: 0, z: 0 };
      break;
    case 'right':
      position = { x: distance, y: 0, z: 0 };
      break;
    case 'top':
      position = { x: 0, y: distance, z: 0 };
      break;
    case 'bottom':
      position = { x: 0, y: -distance, z: 0 };
      break;
    default:
      return;
  }
  scene.updateCameraConfig({
    position,
    target: { x: 0, y: 0, z: 0 }
  });
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// 生命周期挂载/卸载
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard);
  setTimeout(() => {
    appState.isLoading = false;
  }, 1000);
  updateCameraState();
});
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);
  if (animationId) cancelAnimationFrame(animationId);
});

// 键盘快捷键处理
function handleKeyboard(event) {
  // 阻止某些默认行为
  if (event.ctrlKey || event.metaKey) {
    switch (event.code) {
      case 'KeyS':
        event.preventDefault();
        // 保存场景
        break;
      case 'KeyZ':
        event.preventDefault();
        if (event.shiftKey) {
          // 重做
          transform.redo?.();
        } else {
          // 撤销
          transform.undo?.();
        }
        break;
      case 'KeyD':
        event.preventDefault();
        // 复制对象
        if (objectSelection.hasSelection.value) {
          // TODO: 实现复制功能
        }
        break;
    }
  }
  
  // 单键快捷键
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


function toggleRightPanel() {
  appState.rightPanelCollapsed = !appState.rightPanelCollapsed;
}

function setActiveLeftTab(tab) {
  appState.activeLeftTab = tab;
  if (appState.leftPanelCollapsed) {
    appState.leftPanelCollapsed = false;
  }
}

function handleDeleteSelected() {
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
}

/**
 * 复制选中的对象
 * 由Toolbar抛出duplicate-selected事件时调用
 */
function handleDuplicateSelected() {
  // 调用useObjectSelection.js中的duplicateSelected
  objectSelection.duplicateSelected();
}

// 生命周期
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyboard);
  
  // 应用加载完成
  setTimeout(() => {
    appState.isLoading = false;
  }, 1000);
});

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('keydown', handleKeyboard);
});
</script>

<style lang="scss" scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #1a1a1a;
  color: #fff;
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(33,33,33,0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #333;
  border-top: 4px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.loading-content p {
  margin: 0;
  color: #aaa;
  font-size: 14px;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}


/* 主工具栏 */
.main-toolbar {
  border-bottom: 1px solid #444;
}

/* 主编辑区域 */
.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 侧边栏 */
.editor-sidebar {
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.left-panel {
  left: 0;
}

.right-panel {
  right: 0;
}

.left-panel {
  border-right: 1px solid #444;
}

.right-panel {
  border-left: 1px solid #444;
}

/* 浮动切换按钮样式 */
.sidebar-toggle {
  cursor: pointer;
  position: absolute;
  top: 0;
  z-index: 20;
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.sidebar-toggle.left {
  left: 0;
  top: 50%;
  width: 10px;
  height: 50px;
  border-radius: 0 10px 10px 0;
}
.sidebar-toggle.right {
  right: 0;
  top: 50%;
  width: 10px;
  height: 50px;
  border-radius: 10px 0 0 10px;
}


.sidebar-toggle.left.active {
  left: 300px; /* 300px面板宽度 */
}
.sidebar-toggle.right.active {
  right: 300px; /* 300px面板宽度 */
}

/* 面板标签页 */
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

/* 面板内容 */
.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 主视口 */
.editor-viewport {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #1a1a1a;
  overflow: hidden;
  z-index: 1;
}

/* 状态栏 */
.editor-footer {
  height: 28px;
  background: #2a2a2a;
  border-top: 1px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: #aaa;
}

.footer-left,
.footer-center,
.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  padding: 2px 8px;
  background: #333;
  border-radius: 3px;
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-sidebar {
    width: 280px !important;
  }
  
  .header-left h1 {
    font-size: 14px;
  }
  
  .panel-toggle-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    height: 44px;
    padding: 0 12px;
  }
  
  .header-left h1 {
    font-size: 12px;
  }
  
  .editor-sidebar {
    width: 260px !important;
  }
  
  .tab-btn {
    padding: 10px 12px;
    font-size: 11px;
  }
  
  .editor-footer {
    height: 24px;
    padding: 0 12px;
    font-size: 10px;
  }
  
  .footer-center {
    display: none;
  }
}

/* 深色主题优化 */
:deep(.panel),
:deep(.asset-browser),
:deep(.inspector),
:deep(.property-panel) {
  background: #2a2a2a;
  color: #fff;
}

/* 滚动条样式 */
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

/* 选择文本颜色 */
::selection {
  background: #007acc;
  color: #fff;
}

:deep(::selection) {
  background: #007acc;
  color: #fff;
}
/* 浮动面板自适应侧边栏 */
.viewport-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 200;
  transition: right 0.2s, left 0.2s;
}
.viewport-controls.with-right {
  right: 316px; /* 300px面板+16px间距 */
}
.viewport-controls.with-left {
  left: 316px;
}
.viewport-controls.with-left.with-right {
  left: 316px;
  right: 316px;
}

.cube-controls-bottomright {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 300;
  transition: right 0.2s, bottom 0.2s;
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

/* 性能监控面板定位样式 */
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
</style>
