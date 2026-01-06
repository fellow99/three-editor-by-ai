<!--
  AmbientLight专属属性面板
  用于配置AmbientLight（环境光）的专属属性（颜色、强度），支持实时同步到选中对象的light参数。
  新语法：使用<script setup>组合式API，ref变量注释，函数注释。
-->

<script setup>
import { ref, shallowRef, computed, watch } from 'vue'
import * as THREE from 'three'
import { useObjectSelection } from '@/composables/useObjectSelection.js'

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

const color = ref('#ffffff') // 用于设置灯光颜色
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
  if (!obj) return;
  if (key === 'color') {
    obj.color = new THREE.Color(value);
  } else {
    obj[key] = value;
  }
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.type === 'AmbientLight'" class="property-pane">
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
  <div v-else class="no-selection">
    <span style="color:#999;">未选中对象</span>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
