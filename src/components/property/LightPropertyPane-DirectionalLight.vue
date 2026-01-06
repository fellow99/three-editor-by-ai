<!--
  DirectionalLight专属属性面板
  用于配置DirectionalLight（方向光）的专属属性（颜色、强度、方向），支持实时同步到选中对象的light参数。
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
const castShadow = ref(false) // 用于设置灯光是否投射阴影

const targetX = ref(0) // 用于设置灯光目标点X
const targetY = ref(0) // 用于设置灯光目标点Y
const targetZ = ref(0) // 用于设置灯光目标点Z

const followCamera = ref(false) // 用于设置灯光是否跟随相机
const targetDistance = ref(100) // 用于设置灯光跟随目标距离

/**
 * 刷新属性显示
 * 从选中对象的light参数同步
 */
function refreshLightProps() {
  const obj = selectedObject.value
  if (obj && obj.type === 'DirectionalLight') {
    color.value = '#' + obj.color.getHexString()
    intensity.value = obj.intensity ?? 1
    if (obj.target && obj.target.position) {
      targetX.value = obj.target.position.x ?? 0
      targetY.value = obj.target.position.y ?? 0
      targetZ.value = obj.target.position.z ?? 0
    }
    castShadow.value = obj.castShadow ?? false
    followCamera.value = obj.followCamera ?? false
    targetDistance.value = obj.targetDistance ?? 100
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

/**
 * 更新灯光目标点
 */
function updateLightTarget() {
  const obj = selectedObject.value
  if (!obj || obj.type !== 'DirectionalLight' || !obj.target) return
  obj.target.position.set(targetX.value, targetY.value, targetZ.value)
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.type === 'DirectionalLight'" class="property-pane">
    <div class="property-section">
      <h4>方向光属性</h4>
      <el-form label-width="80px" class="property-form">
        <el-form-item label="投射阴影">
          <el-switch
            v-model="castShadow"
            @change="val => updateLightProperty('castShadow', val)"
          />
        </el-form-item>
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
        <el-form-item label="跟随相机">
          <el-switch
            v-model="followCamera"
            @change="val => updateLightProperty('followCamera', val)"
          />
        </el-form-item>
        <el-form-item v-if="followCamera" label="跟随距离">
          <el-input-number
            v-model="targetDistance"
            :step="1"
            size="small"
            @change="val => updateLightProperty('targetDistance', val)"
          />
        </el-form-item>
        <el-form-item v-else label="目标">
           <div class="vector-input">
              <el-input-number
                  v-model="targetX"
                  @change="updateLightTarget"
                  :step="0.1"
                  :precision="3"
                  size="small"
                  placeholder="X"
                  :controls="false"
              />
              <el-input-number
                  v-model="targetY"
                @change="updateLightTarget"
                  :step="0.1"
                  :precision="3"
                  size="small"
                  placeholder="Y"
                  :controls="false"
              />
              <el-input-number
                  v-model="targetZ"
                  @change="updateLightTarget"
                  :step="0.1"
                  :precision="3"
                  size="small"
                  placeholder="Z"
                  :controls="false"
              />
          </div>
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
