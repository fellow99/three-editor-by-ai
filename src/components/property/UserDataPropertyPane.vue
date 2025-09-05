<!--
  userData属性面板
  用于展示和编辑选中对象的userData属性（JSON格式）。
  新语法：Vue 3 <script setup>，Composition API，Element Plus。
-->

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useObjectSelection } from '../../composables/useObjectSelection.js'

/** 对象选择管理器 */
const objectSelection = useObjectSelection()
/** 当前选中对象 */
const selectedObject = computed(() => {
  const objects = objectSelection.selectedObjects.value
  return objects.length === 1 ? objects[0] : null
})
/** 是否有选中对象 */
const hasSelection = computed(() => objectSelection.hasSelection.value)

/** userData编辑区文本
  用于展示和编辑选中对象的userData属性（JSON字符串）
*/
const userDataText = ref('')

/** userData属性表格数据
  用于以key-value表格方式展示userData
*/
const userDataEntries = computed(() => {
  if (!selectedObject.value || !selectedObject.value.userData) return []
  const entries = []
  for (const [key, value] of Object.entries(selectedObject.value.userData)) {
    if(key === 'id') {
      entries.unshift({ key, value: value })
    } else if (key === 'fileInfo' && value && typeof value === 'object') {
      // fileInfo特殊格式
      const { drive, path, name } = value
      entries.push({
        key,
        value,
        str: `${drive}:${path}/${name}`
      })
    } else if (value && typeof value === 'object') {
      // 其他对象序列化
      entries.push({
        key,
        value,
        str: JSON.stringify(value, null, 2)
      })
    } else {
      entries.push({ key, value: value })
    }
  }
  return entries
})

/** userData校验错误信息
  用于提示userData输入的JSON格式错误
*/
const userDataError = ref('')

/**
 * 刷新userData显示
 * 仅在选中对象变化时触发
 */
function refreshUserData() {
  const newObject = selectedObject.value
  if (newObject) {
    userDataText.value = JSON.stringify(newObject.userData ?? {}, null, 2)
    userDataError.value = ''
  }
}
watch(selectedObject, refreshUserData, { immediate: true })

/**
 * userData编辑失焦时校验并应用
 * 校验JSON格式，应用到选中对象
 */
function onUserDataBlur() {
  if (!selectedObject.value) return
  try {
    const json = JSON.parse(userDataText.value)
    selectedObject.value.userData = json
    userDataError.value = ''
    ElMessage.success('userData已更新')
  } catch (e) {
    userDataError.value = 'JSON格式错误，请检查输入'
  }
}
</script>

<template>
  <div v-if="hasSelection" class="property-section">
    <h4>userData</h4>
    <!-- userData key-value 表格展示 -->
    <el-table
      v-if="userDataEntries.length"
      :data="userDataEntries"
      border
      size="small"
      style="margin-bottom: 12px;"
      :show-header="true"
    >
      <el-table-column prop="key" label="Key" width="80" />
      <el-table-column prop="value" label="Value">
        <template #default="scope">
          <pre v-if="scope.row.value && typeof scope.row.value === 'string' && scope.row.value.startsWith('{')" style="white-space: pre-wrap; margin: 0;">{{ scope.row.str }}</pre>
          <span v-else-if="scope.row.str">{{ scope.row.str }}</span>
          <span v-else>{{ scope.row.value }}</span>
        </template>
      </el-table-column>
    </el-table>
    <el-form label-width="60px" class="property-form">
        <el-input
          class="user-data-input"
          type="textarea"
          v-model="userDataText"
          :rows="4"
          placeholder="请输入合法的JSON"
          @blur="onUserDataBlur"
          size="small"
        />
        <div v-if="userDataError" style="color: #f56c6c; font-size: 12px; margin-top: 4px;">
          {{ userDataError }}
        </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.property-section {
  padding: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 48px - 32px);
}
.property-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  border-bottom: 1px solid #444;
  padding-bottom: 4px;
}
.property-form {
  margin-top: 8px;
}
.user-data-input {
  width: 100%;
  height: 20em;
  &:deep(.el-textarea__inner) {
    height: 100%;
  }
}
</style>
