<!--
  主工具栏组件
  提供场景文件、编辑、对象变换等操作入口
  文件按钮区包含：新建、导出、导入、暂存、加载、保存
  其中“导出”/“导入”使用新命名及新图标，“暂存”保存到localStorage
  “加载”“保存”按钮为预留，暂未实现
  新增功能：视图分组增加“锁定相机”按钮，控制SceneManager的controlsLocked状态，锁定时controls.enabled=false。
-->
<template>
  <div class="ribbon-toolbar dark">
    <div class="ribbon-content">
      <!-- 文件 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">文件</div>
        <div class="ribbon-group-buttons">
          <button @click="stationToScene" class="ribbon-btn" title="从车站导入布点">
            <span class="icon">🗂️</span>
            <div>车站布点</div>
          </button>
          <button @click="newScene" class="ribbon-btn" title="清空场景">
            <span class="icon">📄</span>
            <div>清空场景</div>
          </button>
        </div>
      </div>
      <!-- 编辑 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">编辑</div>
        <div class="ribbon-group-buttons">
          <button @click="undo" :disabled="!canUndo" class="ribbon-btn" title="撤销 (Ctrl+Z)">
            <span class="icon">↶</span>
            <div>撤销</div>
          </button>
          <button @click="redo" :disabled="!canRedo" class="ribbon-btn" title="重做 (Ctrl+Y)">
            <span class="icon">↷</span>
            <div>重做</div>
          </button>
          <button @click="duplicateSelected" :disabled="!hasSelection" class="ribbon-btn" title="复制 (Ctrl+D)">
            <span class="icon">📋</span>
            <div>复制</div>
          </button>
          <button @click="deleteSelected" :disabled="!hasSelection" class="ribbon-btn danger" title="删除 (Delete)">
            <span class="icon">🗑️</span>
            <div>删除</div>
          </button>
        </div>
      </div>
      <!-- 对象变换 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">对象变换</div>
        <div class="ribbon-group-buttons">
          <button
            @click="setTransformMode('translate')"
            :class="['ribbon-btn', { active: transformMode === 'translate' }]"
            :disabled="!hasSelection"
            title="移动工具 (G)"
          >
            <span class="icon">↔️</span>
            <div>移动</div>
          </button>
          <button
            @click="setTransformMode('rotate')"
            :class="['ribbon-btn', { active: transformMode === 'rotate' }]"
            :disabled="!hasSelection"
            title="旋转工具 (R)"
          >
            <span class="icon">🔄</span>
            <div>旋转</div>
          </button>
          <button
            @click="setTransformMode('scale')"
            :class="['ribbon-btn', { active: transformMode === 'scale' }]"
            :disabled="!hasSelection"
            title="缩放工具 (S)"
          >
            <span class="icon">📏</span>
            <div>缩放</div>
          </button>
        </div>
      </div>
      <!-- 视图 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">视图</div>
        <div class="ribbon-group-buttons">
          <button
            @click="focusSelected"
            :disabled="!hasSelection"
            class="ribbon-btn"
            title="聚焦到选中对象 (F)"
          >
            <span class="icon">🎯</span>
            <div>聚焦</div>
          </button>
          <button
            @click="resetCamera"
            class="ribbon-btn"
            title="重置相机"
          >
            <span class="icon">📷</span>
            <div>重置相机</div>
          </button>
          <button
            @click="toggleLockCamera"
            class="ribbon-btn"
            :class="{ active: controlsLocked }"
            title="锁定/解锁相机"
          >
            <span class="icon">{{ controlsLocked ? '🔒' : '🔓' }}</span>
            <div>锁定相机</div>
          </button>
        </div>
      </div>
      <!-- 配置 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">配置</div>
        <div class="ribbon-group-buttons">
          <button @click="showEditorConfig = true" class="ribbon-btn" title="编辑器配置">
            <span class="icon">⚙️</span>
            <div>编辑器</div>
          </button>
        </div>
      </div>
    </div>
    <!-- 编辑器配置对话框 -->
    <EditorConfigDialog v-if="showEditorConfig" v-model="showEditorConfig" />
    <!-- 车站布点对话框 -->
    <StationToSceneDialog v-if="showStationDialog" v-model="showStationDialog" />
  </div>
</template>

<script setup>
/**
 * 主工具栏组件
 * 提供场景文件、编辑、对象变换等操作入口
 * 新增：集成车站布点对话框
 */
import { ref, computed, inject, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useScene } from '@/composables/useScene.js';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import useTransform from '@/composables/useTransform.js';
import { useObjectManager } from '@/core/ObjectManager.js';
import { useSceneManager } from '@/core/SceneManager.js';
import EditorConfigDialog from '@/components/dialog/EditorConfigDialog.vue';
import StationToSceneDialog from './StationToSceneDialog.vue';

/** 编辑器配置对话框显示状态 */
const showEditorConfig = ref(false);
/** 车站布点对话框显示状态 */
const showStationDialog = ref(false);

const tabs = [
  { key: 'file', label: '文件' },
  { key: 'edit', label: '编辑' },
  { key: 'tools', label: '工具' },
  { key: 'view', label: '视图' },
  { key: 'settings', label: '设置' }
];
const activeTab = ref('file');
const scene = useScene();
const objectSelection = useObjectSelection();
const transform = useTransform();
const objectManager = useObjectManager();
const sceneManager = useSceneManager();
const controlsLocked = ref(sceneManager.getControlsLocked());
function toggleLockCamera() {
  const next = !controlsLocked.value;
  sceneManager.setControlsLocked(next);
  controlsLocked.value = next;
}

const transformMode = computed(() => transform.transformMode.value);
const hasSelection = computed(() => objectSelection.hasSelection.value);
const canUndo = computed(() => transform.transformHistory.undoStack.length > 0);
const canRedo = computed(() => transform.transformHistory.redoStack.length > 0);

watch(hasSelection, () => {
  sceneManager.setControlsLocked(controlsLocked.value);
});

/**
 * 新建场景，清空所有内容
 */
function newScene() {
  ElMessageBox.confirm('确定要新建场景吗？这将清除当前所有内容。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    objectSelection.clearSelection();
    transform.clearHistory();

    scene.clearScene();
    scene.resetScene();
  }).catch(() => {});
}

/**
 * 打开车站布点对话框
 */
function stationToScene() {
  showStationDialog.value = true;
}

function setTransformMode(mode) {
  transform.transformMode.value = mode;
}

function undo() {
  transform.undo();
}

function redo() {
  transform.redo();
}

function duplicateSelected() {
  objectManager.duplicateSelected();
}

function deleteSelected() {
  // emit('delete-selected'); // <script setup>下如需emit需defineEmits
}

function focusSelected() {
  const selectedObjects = objectSelection.selectedObjects.value;
  if (selectedObjects.length > 0) {
    scene.focusOnObject(selectedObjects[0]);
  }
}

function resetCamera() {
  scene.updateCameraConfig({
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 }
  });
}
</script>

<style lang="scss" scoped>
.ribbon-toolbar.dark {
  background: #23272e;
  color: #f3f3f3;
  border-bottom: 1.5px solid #2d323a;
  padding: 0 12px;
  box-shadow: 0 2px 8px #0006;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.ribbon-content {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: flex-end;
  padding: 4px;
  width: 100%;
  flex-wrap: wrap;
}

.ribbon-group {
  background: #282c34;
  border-radius: 8px 8px 0 0;
  border: 1.5px solid #353a42;
  box-shadow: 0 2px 8px #0003;
  padding: 4px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
  height: 80px;
  position: relative;
  box-sizing: border-box;
}

.ribbon-group-title {
  font-size: 13px;
  font-weight: bold;
  color: #7ecfff;
  margin-bottom: 4px;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px #0008;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.ribbon-group-buttons {
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: flex-start;
}

.ribbon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  background: #23272e;
  border: 1px solid #353a42;
  border-radius: 5px;
  color: #f3f3f3;
  font-size: 11px;
  cursor: pointer;
  margin-bottom: 6px;
  min-width: 48px;
  transition: background 0.2s, border 0.2s, color 0.2s;
}

.ribbon-btn:hover:not(:disabled) {
  background: #2d323a;
  border-color: #7ecfff;
  color: #fff;
}

.ribbon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ribbon-btn.active {
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
}

.ribbon-btn.danger {
  background: #d73a49;
  border-color: #e85662;
  color: #fff;
}

.ribbon-btn.danger:hover:not(:disabled) {
  background: #e85662;
}

.icon {
  font-size: 18px;
  line-height: 1;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 6px;
  color: #b3cfff;
}

.toggle-text {
  user-select: none;
}

.ribbon-status {
  margin-left: auto;
  display: flex;
  gap: 18px;
  padding: 6px 0 8px 0;
}


/* 移动端响应式 */
@media (max-width: 900px) {
  .ribbon-content {
    flex-wrap: wrap;
    gap: 12px;
  }
  .ribbon-group {
    min-width: 90px;
    padding: 8px 8px 10px 8px;
  }
  .ribbon-group-title {
    font-size: 12px;
    margin-bottom: 6px;
  }
  .ribbon-btn {
    min-width: 40px;
    font-size: 10px;
    padding: 5px 6px;
  }
  .icon {
    font-size: 15px;
  }
}
</style>
