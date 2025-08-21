<!--
  虚拟文件系统面板组件
  支持多文件系统切换、目录浏览、文件/目录点击、返回上级、预留文件点击和拖拽接口。
-->
<template>
  <div class="vfs-file-panel">
    <!-- 文件系统选择 -->
    <div class="vfs-header">
      <div class="vfs-row">
        <label>文件系统：</label>
        <select v-model="selectedDrive" @change="onDriveChange">
          <option v-for="vfs in vfsList" :key="vfs._drive" :value="vfs._drive">
            {{ vfs._drive }}
          </option>
        </select>
      </div>
      <div class="vfs-row">
        <span class="vfs-path">当前路径：{{ currentPath }}</span>
      </div>
      
    </div>
    <!-- 目录/文件列表 -->
    <div class="vfs-listview">
      <div v-if="currentPath !== '/'" class="vfs-item vfs-back" @click="goParent">
        <span>⬅️</span>
        返回上一级
      </div>
      <div
        v-for="item in files"
        :key="item.path + '/' + item.name"
        class="vfs-item"
        :class="{ folder: item.type === 'FOLDER', file: item.type === 'FILE' }"
        @click="onItemClick(item)"
        @dragstart="onItemDrag(item, $event)"
        draggable="true"
      >
        <span v-if="item.type === 'FOLDER'">📁</span>
        <span v-else>📄</span>
        {{ item.name }}
      </div>
      <div v-if="files.length === 0" class="vfs-empty">该目录为空</div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, watch } from 'vue';
import vfsService from '../../services/vfs-service.js';

// 文件系统列表
const vfsList = shallowRef([]); // 所有已注册虚拟文件系统实例
// 当前选中的文件系统drive名
const selectedDrive = ref('');
// 当前vfs实例
const currentVfs = shallowRef(null); // 当前虚拟文件系统实例
// 当前路径
const currentPath = ref('/');
// 当前目录下的文件/文件夹列表
const files = shallowRef([]);

/** 加载所有虚拟文件系统 */
async function loadVfsList() {
  vfsList.value = vfsService.listVfs();
  if (vfsList.value.length > 0 && !selectedDrive.value) {
    selectedDrive.value = vfsList.value[0]._drive;
    currentVfs.value = vfsList.value[0];
  }
}

/** 加载当前目录内容 */
async function loadFiles() {
  if (!currentVfs.value) return;
  try {
    const res = await currentVfs.value.list(currentPath.value);
    files.value = (res && res.data && res.data.files) ? res.data.files : [];
  } catch (e) {
    files.value = [];
  }
}

/** 切换文件系统 */
function onDriveChange() {
  currentVfs.value = vfsList.value.find(v => v._drive === selectedDrive.value) || null;
  currentPath.value = '/';
}

/** 点击目录/文件 */
function onItemClick(item) {
  if (item.type === 'FOLDER') {
    currentPath.value = item.path + '/' + item.name;
  } else if (item.type === 'FILE') {
    // 预留文件点击接口
    onFileClick(item);
  }
}

/** 返回上一级目录 */
function goParent() {
  currentPath.value = vfsService.getParentPath(currentPath.value);
}

/** 文件点击事件（预留） */
function onFileClick(file) {
  // TODO: 实现文件点击逻辑
  // console.log('文件点击', file);
}

/**
 * 文件拖拽事件
 * 仅支持3D模型文件，拖拽时将文件信息写入dataTransfer
 */
function onItemDrag(file, event) {
  // 判断是否为支持的3D模型文件
  const modelExts = ['.glb', '.gltf', '.fbx', '.obj'];
  if (file.type !== 'FILE') return;
  const ext = file.name ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
  if (!modelExts.includes(ext)) return;
  // 设置拖拽数据，类型统一为application/x-model，便于SceneViewer统一处理
  event.dataTransfer.setData('application/x-model', JSON.stringify({
    drive: currentVfs.value?._drive,
    path: file.path,
    name: file.name,
    type: file.type
  }));
}

onMounted(() => {
  loadVfsList();
});

watch([currentVfs, currentPath], () => {
  loadFiles();
});
</script>

<style scoped>
.vfs-file-panel {
  width: 100%;
  height: 100%;
  background: #2a2a2a;
  color: #fff;
  font-size: 14px;
  display: flex;
  flex-direction: column;
}

.vfs-header {
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 8px;
  border-bottom: 1px solid #444;
  background: #232323;
}
.vfs-row {
  display: flex;
  align-items: center;
  min-height: 32px;
  gap: 8px;
  margin-bottom: 2px;
}

.vfs-header label {
  color: #aaa;
  font-size: 13px;
}

.vfs-header select {
  background: #333;
  color: #fff;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
}

.vfs-header button {
  background: #444;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 13px;
  margin-left: 4px;
  transition: background 0.2s;
}
.vfs-header button:hover {
  background: #007acc;
}

.vfs-path {
  margin-left: 16px;
  color: #888;
  font-size: 12px;
}

.vfs-listview {
  flex: 1;
  border-top: 1px solid #444;
  padding: 12px 8px 0 8px;
  min-height: 120px;
  background: #232323;
  overflow-y: auto;
}

.vfs-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s, color 0.2s;
}

.vfs-item.folder {
  font-weight: bold;
  color: #2d7be5;
}

.vfs-item.file {
  color: #fff;
}

.vfs-item:hover {
  background: #333;
  color: #fff;
}

.vfs-empty {
  color: #aaa;
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
}
</style>
