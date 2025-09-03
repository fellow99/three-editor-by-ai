<!--
VfsFileSaverDialog.vue
功能：虚拟文件系统文件保存对话框，支持选择驱动、浏览目录、填写文件名并保存内容到指定路径，显示当前目录下文件列表，支持覆盖提示。
参考VfsFileChooserDialog.vue文件系统和文件列表加载流程。
新语法：Vue3 <script setup>、ref、shallowRef、onMounted、watch、async/await
-->
<script setup>
import { ref, shallowRef, onMounted, watch } from 'vue'
import { ElDialog, ElInput, ElButton, ElSelect, ElOption, ElMessage } from 'element-plus'
import vfsService from '../../services/vfs-service.js'

/**
 * props:
 * - modelValue: 控制弹窗显示
 * - text: 待保存的内容（如场景JSON）
 * - ext: 文件扩展名（如json）
 */
const props = defineProps({
  modelValue: Boolean,
  text: String,
  ext: {
    type: String,
    default: 'json'
  }
})
const emit = defineEmits(['update:modelValue', 'saved'])

/** 当前选中的驱动（如 'local'） */
const selectedDrive = ref('')
/** 驱动列表 */
const driveList = shallowRef([])
/** 当前vfs实例 */
const currentVfs = shallowRef(null)
/** 当前路径（文件夹） */
const currentPath = ref('/')
/** 当前目录下的文件/文件夹列表 */
const files = shallowRef([])
/** 文件名输入框 */
const fileName = ref('')
/** 是否正在保存 */
const saving = ref(false)
/** 是否覆盖已有文件 */
const overwrite = ref(false)
/** 加载状态 */
const loading = ref(false)

/** 加载虚拟文件系统列表 */
async function loadDrives() {
  driveList.value = vfsService.listVfs()
  if (driveList.value.length > 0 && !selectedDrive.value) {
    selectedDrive.value = driveList.value[0].id || driveList.value[0]._drive
  }
}

/** 切换驱动 */
watch(selectedDrive, async (val) => {
  currentVfs.value = null
  currentPath.value = '/'
  if (val) {
    // 兼容不同vfsService实现
    currentVfs.value = (driveList.value.find(d => d.id === val) || driveList.value.find(d => d._drive === val)) || null
    await loadFiles()
  }
})

/** 加载当前目录内容 */
async function loadFiles() {
  if (!currentVfs.value) return
  loading.value = true
  try {
    // 兼容不同vfsService实现
    let res = typeof currentVfs.value.list === 'function'
      ? await currentVfs.value.list(currentPath.value)
      : await vfsService.list(currentPath.value, selectedDrive.value)
    files.value = (res && res.data && res.data.files) ? res.data.files : []
  } catch (e) {
    files.value = []
  }
  loading.value = false
}

/** 切换目录 */
function onItemClick(item) {
  if (item.type === 'FOLDER') {
    currentPath.value = item.path + '/' + item.name
  } else if (item.type === 'FILE') {
    fileName.value = item.name.replace(/\.[^/.]+$/, '')
  }
}

/** 返回上一级目录 */
function goParent() {
  currentPath.value = vfsService.getParentPath(currentPath.value)
}

/** 检查是否覆盖已有文件 */
watch([fileName, files], () => {
  overwrite.value = files.value.some(f => f.type === 'FILE' && f.name === fileName.value + '.' + props.ext)
})

/** 保存文件 */
async function handleSave() {
  if (!fileName.value) {
    ElMessage.error('请输入文件名')
    return
  }
  saving.value = true
  try {
    const vfs = await vfsService.getVfs(selectedDrive.value)
    const path = currentPath.value + '/' + fileName.value + '.' + props.ext
    await vfs.save(path, props.text)
    ElMessage.success(overwrite.value ? '覆盖保存成功' : '保存成功')
    emit('saved', path)
    emit('update:modelValue', false)
  } catch (e) {
    ElMessage.error('保存失败：' + e.message)
  }
  saving.value = false
}

/** 关闭弹窗 */
function handleClose() {
  emit('update:modelValue', false)
}

onMounted(() => {
  loadDrives()
})

watch(() => props.modelValue, (val) => {
  if (val) {
    loadDrives()
  }
})

watch([currentVfs, currentPath], () => {
  loadFiles()
})
</script>

<template>
  <ElDialog :model-value="modelValue" title="保存文件" width="600px" @close="handleClose">
    <div style="margin-bottom: 12px;">
      <ElSelect v-model="selectedDrive" placeholder="选择驱动" style="width: 180px;">
        <ElOption v-for="drive in driveList" :key="drive.id || drive._drive" :label="drive.name || drive._drive" :value="drive.id || drive._drive" />
      </ElSelect>
      <span style="margin-left:16px;">当前路径：{{ currentPath }}</span>
    </div>
    <div class="vfs-listview horizontal" style="margin-bottom: 12px;">
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
      >
        <div class="file-icon">
          <span v-if="item.type === 'FOLDER'">📁</span>
          <span v-else>📄</span>
        </div>
        <div class="file-name">{{ item.title || item.name }}</div>
      </div>
      <div v-if="files.length === 0" class="vfs-empty">该目录为空</div>
    </div>
    <div style="margin-bottom: 12px;">
      <ElInput v-model="fileName" placeholder="请输入文件名" style="width: 200px" />
      <span style="margin-left: 8px;">.{{ props.ext }}</span>
      <span v-if="overwrite" style="color: #d73a49; margin-left: 12px;">将覆盖已有文件</span>
    </div>
    <div style="text-align: right;">
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
    </div>
  </ElDialog>
</template>

<style scoped>
.vfs-listview.horizontal {
  border-top: 1px solid #444;
  padding: 12px 8px 0 8px;
  min-height: 80px;
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
