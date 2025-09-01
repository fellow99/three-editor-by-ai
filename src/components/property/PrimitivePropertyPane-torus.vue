<!--
  Torus专属属性面板
  用于配置Torus几何体的专属属性（主半径、管道半径、径向分段、管道分段），支持实时同步到选中对象的geometry参数。
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

/** torus主半径 */
const radius = ref(1)
/** torus管道半径 */
const tube = ref(0.4)
/** torus径向分段 */
const radialSegments = ref(8)
/** torus管道分段 */
const tubularSegments = ref(6)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshTorusProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    radius.value = obj.geometry.parameters.radius ?? 1
    tube.value = obj.geometry.parameters.tube ?? 0.4
    radialSegments.value = obj.geometry.parameters.radialSegments ?? 8
    tubularSegments.value = obj.geometry.parameters.tubularSegments ?? 6
  }
}
watch(selectedObject, refreshTorusProps, { immediate: true })

/**
 * 更新Torus几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateTorusGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持TorusGeometry
  if (obj.geometry.type !== 'TorusGeometry') return
  // 重新设置geometry
  const params = {
    radius: key === 'radius' ? value : radius.value,
    tube: key === 'tube' ? value : tube.value,
    radialSegments: key === 'radialSegments' ? value : radialSegments.value,
    tubularSegments: key === 'tubularSegments' ? value : tubularSegments.value
  }
  // 替换geometry
  const newGeometry = new THREE.TorusGeometry(
    params.radius,
    params.tube,
    params.radialSegments,
    params.tubularSegments
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  // 刷新属性
  refreshTorusProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'TorusGeometry'" class="torus-property-pane">
    <div class="property-section">
      <h4>Torus属性</h4>
      <el-form label-width="90px" class="property-form">
        <el-form-item label="主半径">
          <el-input-number
            v-model="radius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateTorusGeometry('radius', val)"
          />
        </el-form-item>
        <el-form-item label="管道半径">
          <el-input-number
            v-model="tube"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateTorusGeometry('tube', val)"
          />
        </el-form-item>
        <el-form-item label="径向分段">
          <el-input-number
            v-model="radialSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateTorusGeometry('radialSegments', val)"
          />
        </el-form-item>
        <el-form-item label="管道分段">
          <el-input-number
            v-model="tubularSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateTorusGeometry('tubularSegments', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-torus-selection">
    <span style="color:#999;">未选中Torus对象</span>
  </div>
</template>

<style lang="scss" scoped>
.torus-property-pane {
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
.no-torus-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
