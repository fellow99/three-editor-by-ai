<!--
  ObjectPropertyPanel.vue
  对象属性面板：用于展示和编辑选中对象的基本属性，包括名称、类型、变换（位置、旋转、缩放）。
  - 使用组合式 API
  - UI组件采用 element-plus
  - 图标按 element-plus 方式
  - 标签顺序：script > template > style
-->

<script setup>
/**
 * 用于展示和编辑选中对象的基本属性，包括名称、类型、变换（位置、旋转、缩放）。
 * - 属性修改后立即生效
 * - 支持重置缩放
 */
import { ref, reactive, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useObjectSelection } from '../../composables/useObjectSelection.js'
import { useTransform } from '../../composables/useTransform.js'
import { radToDeg, degToRad } from '../../utils/mathUtils.js'

/** 对象选择管理器 */
const objectSelection = useObjectSelection()
/** 变换管理器 */
const transformManager = useTransform()
/** 场景对象（如有需要） */
const scene = inject('scene')

/** 对象名称 */
const objectName = ref('')
/** 变换属性 */
const transform = reactive({
  /** 位置 */
  position: { x: 0, y: 0, z: 0 },
  /** 旋转（角度） */
  rotation: { x: 0, y: 0, z: 0 },
  /** 缩放 */
  scale: { x: 1, y: 1, z: 1 }
})

/** 是否有选中对象 */
const hasSelection = computed(() => objectSelection.hasSelection.value)
/** 当前选中对象 */
const selectedObject = computed(() => {
  const objects = objectSelection.selectedObjects.value
  return objects.length === 1 ? objects[0] : null
})
/** 对象类型 */
const objectType = computed(() => {
  if (!selectedObject.value) return ''
  return selectedObject.value.userData.type || selectedObject.value.type || 'Object3D'
})

/**
 * 刷新属性显示
 */
function refreshTransform() {
  const newObject = selectedObject.value
  if (newObject) {
    objectName.value = newObject.name || ''
    transform.position.x = Number(newObject.position.x.toFixed(3))
    transform.position.y = Number(newObject.position.y.toFixed(3))
    transform.position.z = Number(newObject.position.z.toFixed(3))
    transform.rotation.x = Number(radToDeg(newObject.rotation.x).toFixed(1))
    transform.rotation.y = Number(radToDeg(newObject.rotation.y).toFixed(1))
    transform.rotation.z = Number(radToDeg(newObject.rotation.z).toFixed(1))
    transform.scale.x = Number(newObject.scale.x.toFixed(3))
    transform.scale.y = Number(newObject.scale.y.toFixed(3))
    transform.scale.z = Number(newObject.scale.z.toFixed(3))
  }
}
watch(selectedObject, refreshTransform, { immediate: true })

/**
 * 监听对象变换事件，刷新属性
 */
onMounted(() => {
  window.addEventListener('object-transform-updated', refreshTransform)
})
onUnmounted(() => {
  window.removeEventListener('object-transform-updated', refreshTransform)
})

/**
 * 更新对象名称
 */
function updateObjectName() {
  if (selectedObject.value) {
    selectedObject.value.name = objectName.value
    ElMessage.success('对象名称已更新')
  }
}

/**
 * 更新对象变换属性
 */
function updateTransform() {
  if (!selectedObject.value) return
  transformManager.setPosition(selectedObject.value, [
    transform.position.x,
    transform.position.y,
    transform.position.z
  ])
  transformManager.setRotation(selectedObject.value, [
    degToRad(transform.rotation.x),
    degToRad(transform.rotation.y),
    degToRad(transform.rotation.z)
  ])
  transformManager.setScale(selectedObject.value, [
    transform.scale.x,
    transform.scale.y,
    transform.scale.z
  ])
}

/**
 * 重置缩放
 */
function resetScale() {
  transform.scale.x = 1
  transform.scale.y = 1
  transform.scale.z = 1
  updateTransform()
  ElMessage.info('缩放已重置')
}
</script>

<template>
  <div v-if="hasSelection" class="object-property-panel">
    <!-- 基本信息 -->
    <div class="property-section">
      <h4>基本信息</h4>
      <el-form label-width="60px" class="property-form">
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
    <!-- 变换属性 -->
    <div class="property-section">
      <h4>变换</h4>
      <el-form label-width="60px" class="property-form">
        <!-- 位置 -->
        <el-form-item label="位置">
          <div class="vector-input">
            <el-input-number
              v-model="transform.position.x"
              @change="updateTransform"
              :step="0.1"
              :precision="3"
              size="small"
              placeholder="X"
              :controls="false"
            />
            <el-input-number
              v-model="transform.position.y"
              @change="updateTransform"
              :step="0.1"
              :precision="3"
              size="small"
              placeholder="Y"
              :controls="false"
            />
            <el-input-number
              v-model="transform.position.z"
              @change="updateTransform"
              :step="0.1"
              :precision="3"
              size="small"
              placeholder="Z"
              :controls="false"
            />
          </div>
        </el-form-item>
        <!-- 旋转 -->
        <el-form-item label="旋转">
          <div class="vector-input">
            <el-input-number
              v-model="transform.rotation.x"
              @change="updateTransform"
              :step="1"
              :precision="1"
              size="small"
              placeholder="X°"
              :controls="false"
            />
            <el-input-number
              v-model="transform.rotation.y"
              @change="updateTransform"
              :step="1"
              :precision="1"
              size="small"
              placeholder="Y°"
              :controls="false"
            />
            <el-input-number
              v-model="transform.rotation.z"
              @change="updateTransform"
              :step="1"
              :precision="1"
              size="small"
              placeholder="Z°"
              :controls="false"
            />
          </div>
        </el-form-item>
        <!-- 缩放 -->
        <el-form-item label="缩放">
          <div class="vector-input">
            <el-input-number
              v-model="transform.scale.x"
              @change="updateTransform"
              :step="0.1"
              :min="0.001"
              :precision="3"
              size="small"
              placeholder="X"
              :controls="false"
            />
            <el-input-number
              v-model="transform.scale.y"
              @change="updateTransform"
              :step="0.1"
              :min="0.001"
              :precision="3"
              size="small"
              placeholder="Y"
              :controls="false"
            />
            <el-input-number
              v-model="transform.scale.z"
              @change="updateTransform"
              :step="0.1"
              :min="0.001"
              :precision="3"
              size="small"
              placeholder="Z"
              :controls="false"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.object-property-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  min-height: 0;
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
.vector-input {
  display: flex;
  gap: 4px;
  .el-input-number {
    width: 33%;
  }
}
.reset-btn {
  margin-left: 12px;
  padding: 4px 12px;
  background: #555;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}
.reset-btn:hover {
  background: #666;
}
.no-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
