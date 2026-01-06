<!--
  Circle专属属性面板
  用于配置Circle几何体的专属属性，支持实时同步到选中对象的geometry参数。
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

const radius = ref(2);
const segments = ref(32);
const thetaStart = ref(0);
const thetaLength = ref(6.283185307179586);

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    const params = obj.geometry.parameters
    radius.value = params.radius !== undefined ? params.radius : 2
    segments.value = params.segments !== undefined ? params.segments : 32
    thetaStart.value = params.thetaStart !== undefined ? params.thetaStart : 0
    thetaLength.value = params.thetaLength !== undefined ? params.thetaLength : 6.283185307179586
  }
}
watch(selectedObject, refreshProps, { immediate: true })

/**
 * 更新Circle几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持CircleGeometry
  if (obj.geometry.type !== 'CircleGeometry') return
  // 重新设置geometry
  const params = {
    radius: key === 'radius' ? value : radius.value,
    segments: key === 'segments' ? value : segments.value,
    thetaStart: key === 'thetaStart' ? value : thetaStart.value,
    thetaLength: key === 'thetaLength' ? value : thetaLength.value,
  }
  // 替换geometry
  const newGeometry = new THREE.CircleGeometry(
    params.radius,
    params.segments,
    params.thetaStart,
    params.thetaLength
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  // 刷新属性
  refreshProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'CircleGeometry'" class="property-pane">
    <div class="property-section">
      <h4>Circle属性</h4>
      <el-form label-width="90px" class="property-form">
        <el-form-item label="半径">
          <el-input-number
            v-model="radius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateGeometry('radius', val)"
          />
        </el-form-item>
        <el-form-item label="分段数">
          <el-input-number
            v-model="segments"
            :min="3"
            :step="1"
            size="small"
            @change="val => updateGeometry('segments', val)"
          />
        </el-form-item>
        <el-form-item label="起始角度">
          <el-input-number
            v-model="thetaStart"
            :min="0"
            :max="6.283185307179586"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateGeometry('thetaStart', val)"
          />
        </el-form-item>
        <el-form-item label="角度长度">
          <el-input-number
            v-model="thetaLength"
            :min="0.01"
            :max="6.283185307179586"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateGeometry('thetaLength', val)"
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
