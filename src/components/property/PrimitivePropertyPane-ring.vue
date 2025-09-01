<!--
  Ring专属属性面板
  用于配置Ring几何体的专属属性（内半径、外半径、分段数、起始角度、角度长度），支持实时同步到选中对象的geometry参数。
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

/** ring内半径 */
const innerRadius = ref(0.5)
/** ring外半径 */
const outerRadius = ref(1)
/** ring分段数 */
const thetaSegments = ref(8)
/** ring起始角度 */
const thetaStart = ref(0)
/** ring角度长度 */
const thetaLength = ref(Math.PI * 2)

/**
 * 刷新属性显示
 * 从选中对象的geometry参数同步
 */
function refreshRingProps() {
  const obj = selectedObject.value
  if (obj && obj.geometry && obj.geometry.parameters) {
    innerRadius.value = obj.geometry.parameters.innerRadius ?? 0.5
    outerRadius.value = obj.geometry.parameters.outerRadius ?? 1
    thetaSegments.value = obj.geometry.parameters.thetaSegments ?? 8
    thetaStart.value = obj.geometry.parameters.thetaStart ?? 0
    thetaLength.value = obj.geometry.parameters.thetaLength ?? Math.PI * 2
  }
}
watch(selectedObject, refreshRingProps, { immediate: true })

/**
 * 更新Ring几何体参数
 * @param {string} key - 属性名
 * @param {number} value - 新值
 */
function updateRingGeometry(key, value) {
  const obj = selectedObject.value
  if (!obj || !obj.geometry) return
  // 仅支持RingGeometry
  if (obj.geometry.type !== 'RingGeometry') return
  // 重新设置geometry
  const params = {
    innerRadius: key === 'innerRadius' ? value : innerRadius.value,
    outerRadius: key === 'outerRadius' ? value : outerRadius.value,
    thetaSegments: key === 'thetaSegments' ? value : thetaSegments.value,
    thetaStart: key === 'thetaStart' ? value : thetaStart.value,
    thetaLength: key === 'thetaLength' ? value : thetaLength.value
  }
  const newGeometry = new THREE.RingGeometry(
    params.innerRadius,
    params.outerRadius,
    params.thetaSegments,
    params.thetaStart,
    params.thetaLength
  )
  obj.geometry.dispose && obj.geometry.dispose()
  obj.geometry = newGeometry
  refreshRingProps()
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'RingGeometry'" class="ring-property-pane">
    <div class="property-section">
      <h4>Ring属性</h4>
      <el-form label-width="90px" class="property-form">
        <el-form-item label="内半径">
          <el-input-number
            v-model="innerRadius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateRingGeometry('innerRadius', val)"
          />
        </el-form-item>
        <el-form-item label="外半径">
          <el-input-number
            v-model="outerRadius"
            :min="0.01"
            :step="0.1"
            :precision="3"
            size="small"
            @change="val => updateRingGeometry('outerRadius', val)"
          />
        </el-form-item>
        <el-form-item label="分段数">
          <el-input-number
            v-model="thetaSegments"
            :min="3"
            :step="1"
            :precision="0"
            size="small"
            @change="val => updateRingGeometry('thetaSegments', val)"
          />
        </el-form-item>
        <el-form-item label="起始角度">
          <el-input-number
            v-model="thetaStart"
            :min="0"
            :step="0.01"
            :precision="3"
            size="small"
            @change="val => updateRingGeometry('thetaStart', val)"
          />
        </el-form-item>
        <el-form-item label="角度长度">
          <el-input-number
            v-model="thetaLength"
            :min="0.01"
            :step="0.01"
            :precision="3"
            size="small"
            @change="val => updateRingGeometry('thetaLength', val)"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-ring-selection">
    <span style="color:#999;">未选中Ring对象</span>
  </div>
</template>

<style lang="scss" scoped>
.ring-property-pane {
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
.no-ring-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
