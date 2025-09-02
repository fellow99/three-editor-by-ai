<!--
  动画属性面板
  用于展示和编辑选中对象的动画属性，包括动画列表选择与播放。
  新语法：引入AnimationMixer管理动画播放，动画列表通过selectedObject.value.animations获取。
-->

<script setup>
import * as THREE from 'three'
import { ref, computed, watch } from 'vue'
import { useObjectSelection } from '../../composables/useObjectSelection.js'

/** 对象选择管理器 */
const objectSelection = useObjectSelection()
/** 是否有选中对象 */
const { hasSelection } = objectSelection
/** 当前选中对象 */
const selectedObject = computed(() => {
  const objects = objectSelection.selectedObjects.value
  return objects.length === 1 ? objects[0] : null
})
/** 动画相关变量 */
const animationIndex = ref(-1) // 当前选中动画索引，-1为无动画
const mixer = ref(null) // AnimationMixer实例
const activeAction = ref(null) // 当前动画Action

/** 监听对象动画变化，重置动画选择 */
watch(() => selectedObject.value, (obj) => {
  if (!obj) {
    animationIndex.value = -1
    mixer.value = null
    activeAction.value = null
    return
  }
  // 读取userData.animationIndex
  animationIndex.value = obj.userData?.animationIndex ?? -1
  mixer.value = null
  activeAction.value = null
}, { immediate: true })

/** 动画列表 */
const animationList = computed(() => {
  const obj = selectedObject.value
  if (obj && Array.isArray(obj.animations) && obj.animations.length > 0) {
    return obj.animations.map((clip, idx) => ({
      label: clip.name || `动画${idx + 1}`,
      value: idx
    }))
  }
  return []
})

/**
 * 切换动画
 * @param {number} idx 动画索引
 */
function onAnimationChange(idx) {
  const obj = selectedObject.value
  if (!obj) return
  animationIndex.value = idx
  // 记录到userData
  if (!obj.userData) obj.userData = {}
  obj.userData.animationIndex = idx
  // 停止上一个动画
  if (activeAction.value) {
    activeAction.value.stop()
    activeAction.value = null
  }
  // 播放新动画
  if (idx >= 0 && obj.animations && obj.animations[idx]) {
    if (!mixer.value) {
      mixer.value = new THREE.AnimationMixer(obj)
    }
    const action = mixer.value.clipAction(obj.animations[idx])
    action.reset().play()
    activeAction.value = action
  }
}

/**
 * 动画驱动，每帧调用
 * @param {number} delta 时间增量
 */
function updateAnimation(delta) {
  if (mixer.value) {
    mixer.value.update(delta)
  }
}
</script>

<template>
  <div v-if="hasSelection" class="property-pane">
    <div v-if="animationList.length > 0" class="property-section">
        <h4>动画</h4>
        <el-form label-width="60px" class="property-form">
        <el-form-item label="动画选择">
            <el-select
            v-model="animationIndex"
            placeholder="无动画"
            @change="onAnimationChange"
            size="small"
            style="width: 100%;"
            clearable
            >
            <el-option
                v-for="item in animationList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
            </el-select>
        </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.property-pane {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  color: #fff;
}
.property-section {
  padding: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 48px - 32px);
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
</style>
