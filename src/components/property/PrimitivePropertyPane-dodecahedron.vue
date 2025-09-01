<!--
  Dodecahedron专属属性面板
  用于配置Dodecahedron几何体的专属属性（半径、分段数），支持实时同步到选中对象的geometry参数。
  新语法：<script setup>，ref变量注释，函数注释
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

/** dodecahedron半径 */
const radius = ref(1)
/** dodecahedron分段数 */
const detail = ref(0)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshDodecahedronProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    radius.value = obj.geometry.parameters.radius ?? 1
    detail.value = obj.geometry.parameters.detail ?? 0
  }
}
watch(selectedObject, refreshDodecahedronProps, { immediate: true })

/**
 * 更新Dodecahedron几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateDodecahedronGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持DodecahedronGeometry
  if (obj.geometry.type !== 'DodecahedronGeometry') return
  // 重新设置geometry
  const params = {
    radius: key === 'radius' ? value : radius.value,
    detail: key === 'detail' ? value : detail.value
  }
  const newGeometry = new THREE.DodecahedronGeometry(
    params.radius,
    params.detail
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  refreshDodecahedronProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'DodecahedronGeometry'" class="dodecahedron-property-pane">
    <div class="property-section">
      <h4>Dodecahedron属性</h4>
      <el-form label-width="70px" class="property-form">
        <el-form-item label="半径">
          <el-input-number
            v-model="radius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateDodecahedronGeometry('radius', val)"
          />
        </el-form-item>
        <el-form-item label="分段数">
          <el-input-number
            v-model="detail"
            :min="0"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateDodecahedronGeometry('detail', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-dodecahedron-selection">
    <span style="color:#999;">未选中Dodecahedron对象</span>
  </div>
</template>

<style lang="scss" scoped>
.dodecahedron-property-pane {
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
.no-dodecahedron-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
