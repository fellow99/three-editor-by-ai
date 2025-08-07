<script setup>
// 资源面板组件
import { inject } from 'vue';
import AssetBrowser from './AssetBrowser.vue';
import Inspector from './Inspector.vue';

// 注入全局状态
const appState = inject('appState');
const objectSelection = inject('objectSelection');
const scene = inject('scene');

// 面板控制方法
function setActiveLeftTab(tab) {
  appState.activeLeftTab = tab;
  if (appState.leftPanelCollapsed) {
    appState.leftPanelCollapsed = false;
  }
}
function toggleLeftPanel() {
  appState.leftPanelCollapsed = !appState.leftPanelCollapsed;
}
function handleDeleteSelected() {
  if (objectSelection.hasSelection.value) {
    if (confirm('确定要删除选中的对象吗？')) {
      const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
      selectedIds.forEach(id => {
        scene.removeObjectFromScene(id);
      });
      objectSelection.clearSelection();
    }
  }
}
</script>

<!--
  资源面板，包含资源/层级标签页和折叠按钮
-->
<template>
  <div 
    v-show="!appState.leftPanelCollapsed" 
    class="editor-sidebar left-panel"
    :style="{ width: appState.panels.leftWidth + 'px' }"
  >
    <!-- 标签页头部 -->
    <div class="panel-tabs">
      <button 
        @click="setActiveLeftTab('assets')" 
        :class="['tab-btn', { active: appState.activeLeftTab === 'assets' }]"
      >
        📦 资源
      </button>
      <button 
        @click="setActiveLeftTab('inspector')" 
        :class="['tab-btn', { active: appState.activeLeftTab === 'inspector' }]"
      >
        🔍 层级
      </button>
    </div>
    <!-- 标签页内容 -->
    <div class="panel-content">
      <AssetBrowser v-show="appState.activeLeftTab === 'assets'" />
      <Inspector v-show="appState.activeLeftTab === 'inspector'" @delete-selected="handleDeleteSelected" />
    </div>
  </div>
  <!-- 浮动切换按钮（不在sidebar内） -->
  <button 
    v-if="!appState.leftPanelCollapsed"
    @click="toggleLeftPanel" 
    class="panel-toggle-btn sidebar-toggle left"
    :class="{ active: !appState.leftPanelCollapsed }"
    title="切换左侧面板"
  >
    ☰
  </button>
  <button 
    v-if="appState.leftPanelCollapsed" 
    @click="toggleLeftPanel" 
    class="panel-toggle-btn sidebar-toggle left collapsed"
    title="展开左侧面板"
  >
    ☰
  </button>
</template>

<style scoped>
.editor-sidebar {
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
  left: 0;
  border-right: 1px solid #444;
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
.panel-toggle-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #555;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
}
.panel-toggle-btn:hover {
  background: #444;
  border-color: #777;
  color: #fff;
}
.panel-toggle-btn.active {
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
}
.panel-toggle-btn.left.collapsed {
  left: 0;
  border-radius: 0 4px 4px 0;
  background: #222;
  border: 1px solid #555;
  z-index: 30;
}
</style>
