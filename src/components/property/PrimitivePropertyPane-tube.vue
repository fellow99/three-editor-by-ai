<!--
  Tube专属属性面板
  用于配置Tube几何体的专属属性（半径、分段数、径向分段、是否闭合），支持实时同步到选中对象的geometry参数。
  新语法：<script setup>，ref变量注释，函数注释
  注意：path参数暂用默认三维样条曲线
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

/** tube半径 */
const radius = ref(0.2)
/** tube分段数 */
const tubularSegments = ref(64)
/** tube径向分段 */
const radialSegments = ref(8)
/** tube是否闭合 */
const closed = ref(false)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshTubeProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    radius.value = obj.geometry.parameters.radius ?? 0.2
    tubularSegments.value = obj.geometry.parameters.tubularSegments ?? 64
    radialSegments.value = obj.geometry.parameters.radialSegments ?? 8
    closed.value = obj.geometry.parameters.closed ?? false
  }
}
watch(selectedObject, refreshTubeProps, { immediate: true })

/**
 * 更新Tube几何体参数
 * @param {string} key - 属性名
 * @param {number|boolean} value - 新值
 */
function updateTubeGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持TubeGeometry
  if (obj.geometry.type !== 'TubeGeometry') return
  // 默认path为三维样条曲线
  let path = obj.geometry.parameters.path
  if (!path) {
    path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(1, 0, 0)
    ])
  }
  // 重新设置geometry
  const params = {
    radius: key === 'radius' ? value : radius.value,
    tubularSegments: key === 'tubularSegments' ? value : tubularSegments.value,
    radialSegments: key === 'radialSegments' ? value : radialSegments.value,
    closed: key === 'closed' ? value : closed.value
  }
  const newGeometry = new THREE.TubeGeometry(
    path,
    params.tubularSegments,
    params.radius,
    params.radialSegments,
    params.closed
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  refreshTubeProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'TubeGeometry'" class="property-pane">
    <div class="property-section">
      <h4>Tube属性</h4>
      <el-form label-width="110px" class="property-form">
        <el-form-item label="半径">
          <el-input-number
            v-model="radius"
            :min="0.01"
            :step="0.01"
            :precision="3"
            size="small"
            @change="val => updateTubeGeometry('radius', val)"
          />
        </el-form-item>
        <el-form-item label="分段数">
          <el-input-number
            v-model="tubularSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateTubeGeometry('tubularSegments', val)"
          />
        </el-form-item>
        <el-form-item label="径向分段">
          <el-input-number
            v-model="radialSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateTubeGeometry('radialSegments', val)"
          />
        </el-form-item>
        <el-form-item label="是否闭合">
          <el-switch
            v-model="closed"
            @change="val => updateTubeGeometry('closed', val)"
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
