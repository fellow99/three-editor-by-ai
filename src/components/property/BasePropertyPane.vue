<!--
  基础属性面板
  用于展示和编辑选中对象的基本属性，包括名称、类型。
  已将userData相关逻辑抽离到UserDataPropertyPane.vue。
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
/** 对象类型 */
const objectType = computed(() => {
  if (!selectedObject.value) return ''
  return selectedObject.value.userData?.type || selectedObject.value.type || 'Object3D'
})

/** 对象ID（唯一标识，来源于THREE.Object3D.uuid） */
const objectId = computed(() => selectedObject.value?.uuid ?? '')

/** 对象名称 */
const objectName = ref('')

/**
 * 刷新属性显示
 */
function refreshBaseInfo() {
  const newObject = selectedObject.value
  if (newObject) {
    objectName.value = newObject.name || ''
  }
}
watch(selectedObject, refreshBaseInfo, { immediate: true })

/**
 * 更新对象名称
 */
function updateObjectName() {
  if (selectedObject.value) {
    selectedObject.value.name = objectName.value
    ElMessage.success('对象名称已更新')
  }
}

</script>

<template>
  <div v-if="hasSelection" class="property-pane">
    <!-- 基本信息 -->
    <div class="property-section">
      <h4>基本信息</h4>
      <el-form label-width="60px" class="property-form">
      <el-form-item label="对象ID">
        <el-input v-model="objectId" disabled size="small" />
      </el-form-item>
      <el-form-item label="名称">
        <el-input
          v-model="objectName"
          placeholder="请输入对象名称"
          @blur="updateObjectName"
          size="small"
          clearable
        />
      </el-form-item>
      <el-form-item label="类型">
        <span class="property-value">{{ objectType }}</span>
      </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.property-pane {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  color: #fff;
}
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
.property-value {
  padding: 0 6px;
  background: #333;
  border-radius: 4px;
  font-size: 12px;
  color: #ccc;
}
</style>
