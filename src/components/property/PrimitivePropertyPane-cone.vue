<!--
  Cone专属属性面板
  用于配置Cone几何体的专属属性（底半径、高度、径向分段、高度分段），支持实时同步到选中对象的geometry参数。
-->

<script setup>
import { ref, computed, watch } from 'vue'
import * as THREE from 'three'
import { useObjectSelection } from '../../composables/useObjectSelection.js'

/** 对象选择管理器 */
const objectSelection = useObjectSelection()
/** 当前选中对象 */
const selectedObject = computed(() => {
  const objects = objectSelection.selectedObjects.value
  return objects.length === 1 ? objects[0] : null
})

/** cone底半径 */
const radius = ref(1)
/** cone高度 */
const height = ref(1)
/** cone径向分段 */
const radialSegments = ref(8)
/** cone高度分段 */
const heightSegments = ref(1)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshConeProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    radius.value = obj.geometry.parameters.radius ?? 1
    height.value = obj.geometry.parameters.height ?? 1
    radialSegments.value = obj.geometry.parameters.radialSegments ?? 8
    heightSegments.value = obj.geometry.parameters.heightSegments ?? 1
  }
}
watch(selectedObject, refreshConeProps, { immediate: true })

/**
 * 更新Cone几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateConeGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持ConeGeometry
  if (obj.geometry.type !== 'ConeGeometry') return
  // 重新设置geometry
  const params = {
    radius: key === 'radius' ? value : radius.value,
    height: key === 'height' ? value : height.value,
    radialSegments: key === 'radialSegments' ? value : radialSegments.value,
    heightSegments: key === 'heightSegments' ? value : heightSegments.value
  }
  // 替换geometry
  const newGeometry = new THREE.ConeGeometry(
    params.radius,
    params.height,
    params.radialSegments,
    params.heightSegments
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  // 刷新属性
  refreshConeProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'ConeGeometry'" class="cone-property-pane">
    <div class="property-section">
      <h4>Cone属性</h4>
      <el-form label-width="90px" class="property-form">
        <el-form-item label="底半径">
          <el-input-number
            v-model="radius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateConeGeometry('radius', val)"
          />
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number
            v-model="height"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateConeGeometry('height', val)"
          />
        </el-form-item>
        <el-form-item label="径向分段">
          <el-input-number
            v-model="radialSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateConeGeometry('radialSegments', val)"
          />
        </el-form-item>
        <el-form-item label="高度分段">
          <el-input-number
            v-model="heightSegments"
            :min="1"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateConeGeometry('heightSegments', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-cone-selection">
    <span style="color:#999;">未选中Cone对象</span>
  </div>
</template>

<style lang="scss" scoped>
.cone-property-pane {
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
.no-cone-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
