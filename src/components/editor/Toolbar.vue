<!--
  主工具栏组件
  提供场景文件、编辑、对象变换等操作入口
  文件按钮区包含：新建、导出、导入、暂存、加载、保存
  其中“导出”/“导入”使用新命名及新图标，“暂存”保存到localStorage
  “加载”“保存”按钮为预留，暂未实现
  新增功能：视图分组增加“锁定相机”按钮，控制ThreeViewer的controlsLocked状态，锁定时controls.enabled=false。
-->
<template>
  <div class="ribbon-toolbar dark">
    <div class="ribbon-content">
      <!-- 文件 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">文件</div>
        <div class="ribbon-group-buttons">
          <button @click="newScene" class="ribbon-btn" title="新建场景">
            <span class="icon">📄</span>
            <div>新建</div>
          </button>
          <button @click="saveLocal" class="ribbon-btn" title="暂存到本地">
            <span class="icon">🗄️</span>
            <div>暂存</div>
          </button>
          <button @click="saveScene" class="ribbon-btn" title="保存场景">
            <span class="icon">💾</span>
            <div>保存</div>
          </button>
          <button @click="handleLoad" class="ribbon-btn" title="加载场景">
            <span class="icon">📂</span>
            <div>加载</div>
          </button>
          <button @click="handleExport" class="ribbon-btn" title="导出场景">
            <span class="icon">📤</span>
            <div>导出</div>
          </button>
          <button @click="importScene" class="ribbon-btn" title="导入场景">
            <span class="icon">📥</span>
            <div>导入</div>
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
          <!-- 锁定Y轴按钮 -->
          <button
            @click="toggleLockYAxis"
            :class="['ribbon-btn', { active: axesLockState.locked }]"
            title="锁定/解锁Y轴"
          >
            <span
              class="icon"
              :style="{ color: axesLockState.locked ? '#e53935' : '#1976d2', fontWeight: 'bold' }"
            >Y</span>
            <div>锁定Y轴</div>
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
  </div>
</template>

<script setup>
/**
 * 主工具栏组件
 * 提供场景文件、编辑、对象变换等操作入口
 * 新增：集成车站布点对话框
 */
import { ref, computed, inject, watch, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useThreeViewer, loadScene, exportScene } from '@/composables/useThreeViewer.js';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import useTransform from '@/composables/useTransform.js';
import { exportJSON } from '@/utils/fileUtils.js';
import { useAxesLockState } from '@/composables/useAxesLockState.js';
import { useControls, setControlsLocked, getControlsLocked } from '@/composables/useControls.js';
import { setInitialPos } from '@/composables/useCameraPosState.js';
import { handleFocus, handleLock, handleVisible, handleDelete, handleDuplicate } from '@/composables/useInspectorHandler.js';

import EditorConfigDialog from '../dialog/EditorConfigDialog.vue';
import VfsFileChooserDialog from '../dialog/VfsFileChooserDialog.vue';
import VfsFileSaverDialog from '../dialog/VfsFileSaverDialog.vue';
import vfsService from '../../services/vfs-service.js';

const axesLockState = useAxesLockState();

const emit = defineEmits(['resetView']);

// 注入全局appState
const appState = inject('appState');

/** 编辑器配置对话框显示状态 */
const showEditorConfig = ref(false);

const objectSelection = useObjectSelection();
const transform = useTransform();
const controlsLocked = ref(getControlsLocked());

function toggleLockCamera() {
  const next = !controlsLocked.value;
  setControlsLocked(next);
  controlsLocked.value = next;
}

const transformMode = computed(() => transform.transformMode.value);
const hasSelection = computed(() => objectSelection.selectedIdsRef.value.length);
const canUndo = computed(() => transform.transformHistory.undoStack.length > 0);
const canRedo = computed(() => transform.transformHistory.redoStack.length > 0);

watch(hasSelection, () => {
  setControlsLocked(controlsLocked.value);
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
 * 导出当前场景为JSON文件
 */
function handleExport() {
  try {
    const sceneData = exportScene();
    const filename = `scene_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.json`;
    exportJSON(sceneData, filename);
    ElMessage.success('场景已导出');
  } catch (error) {
    console.error('导出场景失败:', error);
    ElMessage.error('导出场景失败，请检查控制台错误信息。');
  }
}

/**
 * 导入场景文件
 * 选择JSON文件并调用ThreeViewer.loadScene(json)
 */
async function importScene() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
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
            console.error('导入场景失败:', e);
            ElMessage.error('导入场景失败，请检查文件格式。');
          } finally {
            if (appState) appState.isLoading = false;
          }
        }).catch(() => {});
      } catch (error) {
        console.error('导入场景失败:', error);
        ElMessage.error('导入场景失败，请检查文件格式。');
      }
    }
  };
  input.click();
}

/**
 * 暂存场景到localStorage
 */
function saveLocal() {
  try {
    const sceneData = scene.exportScene();
    localStorage.setItem('three-editor-scene', JSON.stringify(sceneData));
    ElMessage.success('场景已暂存到本地');
  } catch (error) {
    console.error('暂存失败:', error);
    ElMessage.error('暂存失败，请检查控制台错误信息。');
  }
}

/**
 * 加载场景：弹出文件选择对话框，选中文件后加载内容并调用loadScene
 */
const showFileChooser = ref(false);
async function handleLoad() {
  showFileChooser.value = true;
}
/**
 * 文件选择回调
 * @param {Object} fileInfo 选中的文件信息
 */
async function handleFileSelect(fileInfo) {
  showFileChooser.value = false;
  if (!fileInfo || !fileInfo.path) return;
  try {
    if (appState) appState.isLoading = true;
    // 获取文件内容（修正：通过 vfsService.getVfs 获取 vfs，再调用 vfs.content）
    const vfs = vfsService.getVfs(fileInfo.drive);
    if (!vfs || typeof vfs.content !== 'function') {
      ElMessage.error('未找到指定虚拟文件系统或接口不支持');
      return;
    }
    const contentRes = await vfs.content(fileInfo.path + fileInfo.name);
    if (!contentRes) {
      ElMessage.error('文件内容获取失败');
      return;
    }
    // 加载场景
    const threeViewer = useThreeViewer();
    objectSelection.clearSelection();
    transform.clearHistory();
    const sceneData = JSON.parse(contentRes);
    await threeViewer.loadScene(sceneData);
    ElMessage.success('场景加载成功');
  } catch (e) {
    console.error('加载场景失败:', e);
    ElMessage.error('加载场景失败，请检查文件内容或格式。');
  } finally {
    if (appState) appState.isLoading = false;
  }
}

/**
 * 保存场景：弹出保存对话框，填写文件名后保存到虚拟文件系统
 */
const showFileSaver = ref(false);
const sceneJsonText = ref('');
function saveScene() {
  try {
    const sceneData = scene.exportScene();
    sceneJsonText.value = JSON.stringify(sceneData, null, 2);
    showFileSaver.value = true;
  } catch (error) {
    ElMessage.error('场景序列化失败');
  }
}
function handleFileSaved(path) {
  showFileSaver.value = false;
  ElMessage.success('场景已保存到虚拟文件系统');
}

function handleInitialPos() {
  ElMessageBox.confirm('确定将当前位置设为场景初始位置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    setInitialPos();
    ElMessage.success('已将当前位置设为场景初始位置');
  });
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
  let selected = objectSelection.getSelectedObjects();
  handleDuplicate(selected);
}

function deleteSelected() {
  let selected = objectSelection.getSelectedObjects();
  handleDelete(selected);
}

function lockSelected() {
  let selected = objectSelection.getSelectedObjects();
  handleLock(selected);
}

function visibleSelected() {
  let selected = objectSelection.getSelectedObjects();
  handleVisible(selected);
}

function focusSelected() {
  let selected = objectSelection.getSelectedObjects();
  handleFocus(selected[0]);
}

function resetView() {
  emit('resetView');
}

/**
 * 锁定/解锁Y轴
 * - 若未锁定，则获取当前选中对象的position.y，否则取controls.target.y，设置axesLockState
 * - 再次点击则解锁
 */
function toggleLockYAxis() {
  let controlsRef = useControls();
  let controls = controlsRef.value;

  if (axesLockState.locked) {
    axesLockState.locked = false;
  } else {
    let y = 0;
    // 优先取选中对象
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


onMounted(async () => {
  let search = window.location.search;
  let params = new URLSearchParams(search);
  let url = params.get('url');
  if(url) {
    let resp = await fetch(url);
    let json = await resp.json();
    await loadScene(json);
  }
});
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
