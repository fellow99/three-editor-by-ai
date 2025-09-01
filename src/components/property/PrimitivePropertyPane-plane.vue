<!--
  Plane专属属性面板
  用于配置Plane几何体的专属属性（宽度、高度、宽度分段、高度分段），支持实时同步到选中对象的geometry参数。
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

/** plane宽度 */
const width = ref(1)
/** plane高度 */
const height = ref(1)
/** plane宽度分段 */
const widthSegments = ref(1)
/** plane高度分段 */
const heightSegments = ref(1)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshPlaneProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    width.value = obj.geometry.parameters.width ?? 1
    height.value = obj.geometry.parameters.height ?? 1
    widthSegments.value = obj.geometry.parameters.widthSegments ?? 1
    heightSegments.value = obj.geometry.parameters.heightSegments ?? 1
  }
}
watch(selectedObject, refreshPlaneProps, { immediate: true })

/**
 * 更新Plane几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updatePlaneGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持PlaneGeometry
  if (obj.geometry.type !== 'PlaneGeometry') return
  // 重新设置geometry
  const params = {
    width: key === 'width' ? value : width.value,
    height: key === 'height' ? value : height.value,
    widthSegments: key === 'widthSegments' ? value : widthSegments.value,
    heightSegments: key === 'heightSegments' ? value : heightSegments.value
  }
  // 替换geometry
  const newGeometry = new THREE.PlaneGeometry(
    params.width,
    params.height,
    params.widthSegments,
    params.heightSegments
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  // 刷新属性
  refreshPlaneProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'PlaneGeometry'" class="plane-property-pane">
    <div class="property-section">
      <h4>Plane属性</h4>
      <el-form label-width="90px" class="property-form">
        <el-form-item label="宽度">
          <el-input-number
            v-model="width"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updatePlaneGeometry('width', val)"
          />
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number
            v-model="height"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updatePlaneGeometry('height', val)"
          />
        </el-form-item>
        <el-form-item label="宽度分段">
          <el-input-number
            v-model="widthSegments"
            :min="1"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updatePlaneGeometry('widthSegments', val)"
          />
        </el-form-item>
        <el-form-item label="高度分段">
          <el-input-number
            v-model="heightSegments"
            :min="1"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updatePlaneGeometry('heightSegments', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-plane-selection">
    <span style="color:#999;">未选中Plane对象</span>
  </div>
</template>

<style lang="scss" scoped>
.plane-property-pane {
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
.no-plane-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
