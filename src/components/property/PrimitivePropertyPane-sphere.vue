<!--
  Sphere专属属性面板
  用于配置Sphere几何体的专属属性（半径、宽度分段、高度分段），支持实时同步到选中对象的geometry参数。
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

/** sphere半径 */
const radius = ref(1)
/** sphere宽度分段 */
const widthSegments = ref(8)
/** sphere高度分段 */
const heightSegments = ref(6)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshSphereProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    radius.value = obj.geometry.parameters.radius ?? 1
    widthSegments.value = obj.geometry.parameters.widthSegments ?? 8
    heightSegments.value = obj.geometry.parameters.heightSegments ?? 6
  }
}
watch(selectedObject, refreshSphereProps, { immediate: true })

/**
 * 更新sphere几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateSphereGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持SphereGeometry
  if (obj.geometry.type !== 'SphereGeometry') return
  // 重新设置geometry
  const params = {
    radius: key === 'radius' ? value : radius.value,
    widthSegments: key === 'widthSegments' ? value : widthSegments.value,
    heightSegments: key === 'heightSegments' ? value : heightSegments.value
  }
  // 替换geometry
  const newGeometry = new THREE.SphereGeometry(
    params.radius,
    params.widthSegments,
    params.heightSegments
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  // 刷新属性
  refreshSphereProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'SphereGeometry'" class="sphere-property-pane">
    <div class="property-section">
      <h4>Sphere属性</h4>
      <el-form label-width="90px" class="property-form">
        <el-form-item label="半径">
          <el-input-number
            v-model="radius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateSphereGeometry('radius', val)"
          />
        </el-form-item>
        <el-form-item label="宽度分段">
          <el-input-number
            v-model="widthSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateSphereGeometry('widthSegments', val)"
          />
        </el-form-item>
        <el-form-item label="高度分段">
          <el-input-number
            v-model="heightSegments"
            :min="2"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateSphereGeometry('heightSegments', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-sphere-selection">
    <span style="color:#999;">未选中Sphere对象</span>
  </div>
</template>

<style lang="scss" scoped>
.sphere-property-pane {
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
.no-sphere-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
