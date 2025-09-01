<!--
  AmbientLight专属属性面板
  用于配置AmbientLight（环境光）的专属属性（颜色、强度），支持实时同步到选中对象的light参数。
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

/**
 * 刷新属性显示
 * 从选中对象的light参数同步
 */
function refreshLightProps() {
  const obj = selectedObject.value
  if (obj && obj.type === 'AmbientLight') {
    color.value = '#' + obj.color.getHexString()
    intensity.value = obj.intensity ?? 1
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
  if (!obj || obj.type !== 'AmbientLight') return
  if (key === 'color') {
    obj.color = new THREE.Color(value)
  } else if (key === 'intensity') {
    obj.intensity = value
  }
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.type === 'AmbientLight'" class="light-property-pane">
    <div class="property-section">
      <h4>环境光属性</h4>
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
      </el-form>
    </div>
  </div>
  <div v-else class="no-light-selection">
    <span style="color:#999;">未选中环境光对象</span>
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
