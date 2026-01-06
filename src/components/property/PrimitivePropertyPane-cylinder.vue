<!--
  Cylinder专属属性面板
  用于配置Cylinder几何体的专属属性（顶半径、底半径、高度、分段），支持实时同步到选中对象的geometry参数。
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

/** 顶半径 */
const radiusTop = ref(1)
/** 底半径 */
const radiusBottom = ref(1)
/** 高度 */
const height = ref(1)
/** 分段数 */
const radialSegments = ref(8)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshCylinderProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    radiusTop.value = obj.geometry.parameters.radiusTop ?? 1
    radiusBottom.value = obj.geometry.parameters.radiusBottom ?? 1
    height.value = obj.geometry.parameters.height ?? 1
    radialSegments.value = obj.geometry.parameters.radialSegments ?? 8
  }
}
watch(selectedObject, refreshCylinderProps, { immediate: true })

/**
 * 更新Cylinder几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateCylinderGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持CylinderGeometry
  if (obj.geometry.type !== 'CylinderGeometry') return
  // 重新设置geometry
  const params = {
    radiusTop: key === 'radiusTop' ? value : radiusTop.value,
    radiusBottom: key === 'radiusBottom' ? value : radiusBottom.value,
    height: key === 'height' ? value : height.value,
    radialSegments: key === 'radialSegments' ? value : radialSegments.value
  }
  // 替换geometry
  const newGeometry = new THREE.CylinderGeometry(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  // 刷新属性
  refreshCylinderProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'CylinderGeometry'" class="property-pane">
    <div class="property-section">
      <h4>Cylinder属性</h4>
      <el-form label-width="90px" class="property-form">
        <el-form-item label="顶半径">
          <el-input-number
            v-model="radiusTop"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateCylinderGeometry('radiusTop', val)"
          />
        </el-form-item>
        <el-form-item label="底半径">
          <el-input-number
            v-model="radiusBottom"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateCylinderGeometry('radiusBottom', val)"
          />
        </el-form-item>
        <el-form-item label="高度">
          <el-input-number
            v-model="height"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateCylinderGeometry('height', val)"
          />
        </el-form-item>
        <el-form-item label="分段数">
          <el-input-number
            v-model="radialSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateCylinderGeometry('radialSegments', val)"
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
