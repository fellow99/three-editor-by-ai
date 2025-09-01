<!--
  SpotLight专属属性面板
  用于配置SpotLight（聚光灯）的专属属性（颜色、强度、距离、衰减、角度、聚光指数、目标点），支持实时同步到选中对象的light参数。
  新语法：使用<script setup>组合式API，ref变量注释，函数注释。
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

/** 灯光颜色 */
const color = ref('#ffffff') // 用于设置灯光颜色
/** 灯光强度 */
const intensity = ref(1) // 用于设置灯光强度
/** 灯光距离 */
const distance = ref(0) // 用于设置聚光灯照射距离
/** 灯光衰减 */
const decay = ref(1) // 用于设置聚光灯衰减
/** 灯光角度 */
const angle = ref(Math.PI / 3) // 用于设置聚光灯角度
/** 灯光聚光指数 */
const penumbra = ref(0) // 用于设置聚光灯聚光指数
/** 灯光目标点 */
const targetX = ref(0) // 用于设置灯光目标点X
const targetY = ref(0) // 用于设置灯光目标点Y
const targetZ = ref(0) // 用于设置灯光目标点Z

/**
 * 刷新属性显示
 * 从选中对象的light参数同步
 */
function refreshLightProps() {
  const obj = selectedObject.value
  if (obj && obj.type === 'SpotLight') {
    color.value = '#' + obj.color.getHexString()
    intensity.value = obj.intensity ?? 1
    distance.value = obj.distance ?? 0
    decay.value = obj.decay ?? 1
    angle.value = obj.angle ?? Math.PI / 3
    penumbra.value = obj.penumbra ?? 0
    if (obj.target && obj.target.position) {
      targetX.value = obj.target.position.x ?? 0
      targetY.value = obj.target.position.y ?? 0
      targetZ.value = obj.target.position.z ?? 0
    }
  }
}
watch(selectedObject, refreshLightProps, { immediate: true })

/**
 * 更新灯光属性
 * @param {string} key - 属性名
 * @param {any} value - 新值
 */
function updateLightProperty(key, value) {
  const obj = selectedObject.value
  if (!obj || obj.type !== 'SpotLight') return
  if (key === 'color') {
    obj.color = new THREE.Color(value)
  } else if (key === 'intensity') {
    obj.intensity = value
  } else if (key === 'distance') {
    obj.distance = value
  } else if (key === 'decay') {
    obj.decay = value
  } else if (key === 'angle') {
    obj.angle = value
  } else if (key === 'penumbra') {
    obj.penumbra = value
  }
}

/**
 * 更新灯光目标点
 */
function updateLightTarget() {
  const obj = selectedObject.value
  if (!obj || obj.type !== 'SpotLight' || !obj.target) return
  obj.target.position.set(targetX.value, targetY.value, targetZ.value)
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.type === 'SpotLight'" class="light-property-pane">
    <div class="property-section">
      <h4>聚光灯属性</h4>
      <el-form label-width="80px" class="property-form">
        <el-form-item label="颜色">
          <el-color-picker
            v-model="color"
            @change="val => updateLightProperty('color', val)"
            size="small"
          />
        </el-form-item>
        <el-form-item label="强度">
          <el-input-number
            v-model="intensity"
            :min="0"
            :step="0.1"
            :precision="2"
            size="small"
            @change="val => updateLightProperty('intensity', val)"
          />
        </el-form-item>
        <el-form-item label="距离">
          <el-input-number
            v-model="distance"
            :min="0"
            :step="0.1"
            :precision="2"
            size="small"
            @change="val => updateLightProperty('distance', val)"
          />
        </el-form-item>
        <el-form-item label="衰减">
          <el-input-number
            v-model="decay"
            :min="0"
            :step="0.1"
            :precision="2"
            size="small"
            @change="val => updateLightProperty('decay', val)"
          />
        </el-form-item>
        <el-form-item label="角度">
          <el-input-number
            v-model="angle"
            :min="0"
            :max="Math.PI"
            :step="0.01"
            :precision="3"
            size="small"
            @change="val => updateLightProperty('angle', val)"
          />
        </el-form-item>
        <el-form-item label="聚光指数">
          <el-input-number
            v-model="penumbra"
            :min="0"
            :max="1"
            :step="0.01"
            :precision="2"
            size="small"
            @change="val => updateLightProperty('penumbra', val)"
          />
        </el-form-item>
        <el-form-item label="目标点X">
          <el-input-number
            v-model="targetX"
            :step="0.1"
            :precision="2"
            size="small"
            @change="updateLightTarget"
          />
        </el-form-item>
        <el-form-item label="目标点Y">
          <el-input-number
            v-model="targetY"
            :step="0.1"
            :precision="2"
            size="small"
            @change="updateLightTarget"
          />
        </el-form-item>
        <el-form-item label="目标点Z">
          <el-input-number
            v-model="targetZ"
            :step="0.1"
            :precision="2"
            size="small"
            @change="updateLightTarget"
          />
        </el-form-item>
      </el-form>
    </div>
  </div>
  <div v-else class="no-light-selection">
    <span style="color:#999;">未选中聚光灯对象</span>
  </div>
</template>

<style lang="scss" scoped>
.light-property-pane {
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
.no-light-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
