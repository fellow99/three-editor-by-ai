<!--
  Sphere专属属性面板
  用于配置Sphere几何体的专属属性（半径、宽度分段、高度分段），支持实时同步到选中对象的geometry参数。
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
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'SphereGeometry'" class="property-pane">
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
  <div v-else class="no-selection">
    <span style="color:#999;">未选中对象</span>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
