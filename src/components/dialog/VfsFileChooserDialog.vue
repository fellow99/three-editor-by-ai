<!--
VfsFileChooserDialog.vue
功能：虚拟文件系统文件选择对话框，支持浏览和选择文件，供场景加载等功能调用。
实现参考：VfsFileBrowser.vue 的文件系统加载流程。
新语法：采用 <script setup> 写法，所有 ref/shallowRef 变量和函数均添加用途注释。
-->
<script setup>
import { ref, shallowRef, onMounted, watch } from 'vue'
import vfsService from '../../services/vfs-service.js'
import { ElDialog, ElButton } from 'element-plus'

/** 事件触发器 */
const emit = defineEmits(['select', 'update:modelValue'])

/** 是否显示对话框 */
const visible = ref(false)
/** 当前选中的文件系统drive名 */
const selectedDrive = ref('')
/** 文件系统列表 */
const vfsList = shallowRef([])
/** 当前vfs实例 */
const currentVfs = shallowRef(null)
/** 当前路径 */
const currentPath = ref('/')
/** 当前目录下的文件/文件夹列表 */
const files = shallowRef([])
/** 当前选中的文件对象 */
const selectedFile = shallowRef(null)
/** 加载状态 */
const loading = ref(false)

/**
 * 打开文件选择对话框
 */
function openDialog() {
  visible.value = true
}

/**
 * 关闭文件选择对话框
 */
function closeDialog() {
  visible.value = false
  emit('update:modelValue', false)
}

/**
 * 加载所有虚拟文件系统
 */
async function loadVfsList() {
  vfsList.value = vfsService.listVfs()
  if (vfsList.value.length > 0 && !selectedDrive.value) {
    selectedDrive.value = vfsList.value[0]._drive
    currentVfs.value = vfsList.value[0]
  }
}

/**
 * 加载当前目录内容
 */
async function loadFiles() {
  if (!currentVfs.value) return
  loading.value = true
  try {
    const res = await currentVfs.value.list(currentPath.value)
    files.value = (res && res.data && res.data.files) ? res.data.files : []
  } catch (e) {
    files.value = []
  }
  loading.value = false
}

/**
 * 切换文件系统
 */
function onDriveChange() {
  currentVfs.value = vfsList.value.find(v => v._drive === selectedDrive.value) || null
  currentPath.value = '/'
}

/**
 * 点击目录/文件
 * @param {Object} item 目录或文件对象
 */
function onItemClick(item) {
  if (item.type === 'FOLDER') {
    currentPath.value = item.path + '/' + item.name
  } else if (item.type === 'FILE') {
    selectedFile.value = item
  }
}

/**
 * 返回上一级目录
 */
function goParent() {
  currentPath.value = vfsService.getParentPath(currentPath.value)
}

/**
 * 确认选择文件
 */
function confirmSelect() {
  if (selectedFile.value) {
    emit('select', {
      drive: currentVfs.value?._drive,
      path: selectedFile.value.path,
      name: selectedFile.value.name,
      url: selectedFile.value.url
    })
    closeDialog()
  }
}

onMounted(() => {
  loadVfsList()
})

watch([currentVfs, currentPath], () => {
  loadFiles()
})
</script>

<template>
  <ElDialog v-model="visible" title="选择文件" width="600px" @close="closeDialog">
    <div class="vfs-header">
      <label>文件系统：</label>
      <select v-model="selectedDrive" @change="onDriveChange">
        <option v-for="vfs in vfsList" :key="vfs._drive" :value="vfs._drive">
          {{ vfs._drive }}
        </option>
      </select>
      <span style="margin-left:16px;">当前路径：{{ currentPath }}</span>
    </div>
    <div class="vfs-listview horizontal">
      <div v-if="currentPath !== '/'" class="vfs-item vfs-back" @click="goParent">
        <span>⬅️</span>
        返回上一级
      </div>
      <div
        v-for="item in files"
        :key="item.path + '/' + item.name"
        class="vfs-item"
        :class="{ folder: item.type === 'FOLDER', file: item.type === 'FILE', selected: selectedFile && selectedFile.path === item.path && selectedFile.name === item.name }"
        @click="onItemClick(item)"
      >
        <div class="file-icon">
          <span v-if="item.type === 'FOLDER'">📁</span>
          <span v-else>📄</span>
        </div>
        <div class="file-name">{{ item.title || item.name }}</div>
      </div>
      <div v-if="files.length === 0" class="vfs-empty">该目录为空</div>
    </div>
    <div style="margin-top: 16px; text-align: right;">
      <ElButton @click="closeDialog">取消</ElButton>
      <ElButton type="primary" :disabled="!selectedFile" @click="confirmSelect">确定</ElButton>
    </div>
  </ElDialog>
</template>

<style scoped>
.vfs-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  border-bottom: 1px solid #444;
  background: #232323;
}
.vfs-listview.horizontal {
  border-top: 1px solid #444;
  padding: 12px 8px 0 8px;
  min-height: 120px;
  background: #232323;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}
.vfs-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100px;
  min-width: 80px;
  max-width: 140px;
  padding: 10px 8px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s, color 0.2s;
  background: #232323;
  box-sizing: border-box;
  word-break: break-all;
}
.file-icon {
  font-size: 32px;
  margin-bottom: 6px;
}
.file-name {
  font-size: 13px;
  color: #fff;
  text-align: center;
  word-break: break-all;
  max-width: 120px;
}
.vfs-item.folder {
  font-weight: bold;
  color: #2d7be5;
}
.vfs-item.file {
  color: #fff;
}
.vfs-item.selected {
  background: #007acc;
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
