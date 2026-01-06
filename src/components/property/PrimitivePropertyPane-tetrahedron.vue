<!--
  Tetrahedron专属属性面板
  用于配置Tetrahedron几何体的专属属性（半径、分段数），支持实时同步到选中对象的geometry参数。
  新语法：<script setup>，ref变量注释，函数注释
-->

<script setup>
import { ref, shallowRef, watch } from 'vue'
import * as THREE from 'three'
import { useObjectSelection } from '../../composables/useObjectSelection.js'

const { selectedIdsRef, getSelectedObjects } = useObjectSelection();
// 是否有选中对象
const hasSelection = ref(false);
// 当前选中对象（仅支持单选）
const selectedObject = shallowRef(null);
// 监听选中对象变化，更新activeTab和hasSelection
watch(selectedIdsRef, (ids) => {
  if (ids && ids.length > 0) {
    hasSelection.value = true;
    let objects = getSelectedObjects();
    let object = objects ? objects[0] : null;
    selectedObject.value = object;
  } else {
    hasSelection.value = false;
    selectedObject.value = null;
  }
}, { immediate: true });

/** tetrahedron半径 */
const radius = ref(1)
/** tetrahedron分段数 */
const detail = ref(0)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshTetrahedronProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    radius.value = obj.geometry.parameters.radius ?? 1
    detail.value = obj.geometry.parameters.detail ?? 0
  }
}
watch(selectedObject, refreshTetrahedronProps, { immediate: true })

/**
 * 更新Tetrahedron几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateTetrahedronGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持TetrahedronGeometry
  if (obj.geometry.type !== 'TetrahedronGeometry') return
  // 重新设置geometry
  const params = {
    radius: key === 'radius' ? value : radius.value,
    detail: key === 'detail' ? value : detail.value
  }
  const newGeometry = new THREE.TetrahedronGeometry(
    params.radius,
    params.detail
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  refreshTetrahedronProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'TetrahedronGeometry'" class="property-pane">
    <div class="property-section">
      <h4>Tetrahedron属性</h4>
      <el-form label-width="70px" class="property-form">
        <el-form-item label="半径">
          <el-input-number
            v-model="radius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateTetrahedronGeometry('radius', val)"
          />
        </el-form-item>
        <el-form-item label="分段数">
          <el-input-number
            v-model="detail"
            :min="0"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateTetrahedronGeometry('detail', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-selection">
    <span style="color:#999;">未选中对象</span>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
