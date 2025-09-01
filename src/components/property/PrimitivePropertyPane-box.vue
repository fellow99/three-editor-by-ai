<!--
  Box专属属性面板
  用于配置Box几何体的专属属性（宽度、高度、深度），支持实时同步到选中对象的geometry参数。
  新语法：使用<script setup>与ref变量，所有ref/shallowRef变量均有用途注释。
-->

<script setup>
import { ref, computed, watch } from 'vue'
import * as THREE from 'three'
import { ElMessage } from 'element-plus'
import { useObjectSelection } from '../../composables/useObjectSelection.js'

/** 对象选择管理器 */
const objectSelection = useObjectSelection()
/** 当前选中对象 */
const selectedObject = computed(() => {
  const objects = objectSelection.selectedObjects.value
  return objects.length === 1 ? objects[0] : null
})

/** box宽度 */
const width = ref(1)
/** box高度 */
const height = ref(1)
/** box深度 */
const depth = ref(1)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshBoxProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    width.value = obj.geometry.parameters.width ?? 1
    height.value = obj.geometry.parameters.height ?? 1
    depth.value = obj.geometry.parameters.depth ?? 1
  }
}
watch(selectedObject, refreshBoxProps, { immediate: true })

/**
 * 更新box几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateBoxGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持BoxGeometry
  if (obj.geometry.type !== 'BoxGeometry') return
  // 重新设置geometry
  const params = {
    width: key === 'width' ? value : width.value,
    height: key === 'height' ? value : height.value,
    depth: key === 'depth' ? value : depth.value
  }
  // 保持分段参数不变
  params.widthSegments = obj.geometry.parameters.widthSegments ?? 1
  params.heightSegments = obj.geometry.parameters.heightSegments ?? 1
  params.depthSegments = obj.geometry.parameters.depthSegments ?? 1
  // 替换geometry
  const newGeometry = new THREE.BoxGeometry(
    params.width,
    params.height,
    params.depth,
    params.widthSegments,
    params.heightSegments,
    params.depthSegments
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  // 刷新属性
  refreshBoxProps()
  ElMessage.success('Box属性已更新')
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'BoxGeometry'" class="box-property-pane">
    <div class="property-section">
      <h4>Box属性</h4>
      <el-form label-width="60px" class="property-form">
        <el-form-item label="宽度">
          <el-input-number
            v-model="width"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateBoxGeometry('width', val)"
          />
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number
            v-model="height"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateBoxGeometry('height', val)"
          />
        </el-form-item>
        <el-form-item label="深度">
          <el-input-number
            v-model="depth"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateBoxGeometry('depth', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-box-selection">
    <span style="color:#999;">未选中Box对象</span>
  </div>
</template>

<style lang="scss" scoped>
.box-property-pane {
  width: 100%;
  padding: 8px;
  color: #fff;
}
.property-section {
  margin-bottom: 12px;
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
.no-box-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
