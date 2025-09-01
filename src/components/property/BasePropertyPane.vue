<!--
  对象属性面板
  用于展示和编辑选中对象的基本属性，包括名称、类型、变换（位置、旋转、缩放）、动画选择与播放。
  动画功能：支持GLTF模型动画选择与播放，选中动画索引记录到userData.animationIndex。
  新语法：引入AnimationMixer管理动画播放，动画列表通过selectedObject.value.animations获取。
-->

<script setup>
import * as THREE from 'three'
import { ref, reactive, computed, watch, inject, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useObjectSelection } from '../../composables/useObjectSelection.js'
import { useTransform } from '../../composables/useTransform.js'
import { radToDeg, degToRad } from '../../utils/mathUtils.js'

/** 对象选择管理器 */
const objectSelection = useObjectSelection()
/** 当前选中对象 */
const selectedObject = computed(() => {
  const objects = objectSelection.selectedObjects.value
  return objects.length === 1 ? objects[0] : null
})
/** 是否有选中对象 */
const hasSelection = computed(() => objectSelection.hasSelection.value)
/** 对象类型 */
const objectType = computed(() => {
  if (!selectedObject.value) return ''
  return selectedObject.value.userData.type || selectedObject.value.type || 'Object3D'
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
  // 动画对象变化时重置mixer
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

/** 切换动画 */
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

/** 动画驱动，每帧调用 */
function updateAnimation(delta) {
  if (mixer.value) {
    mixer.value.update(delta)
  }
}
/** 变换管理器 */
const transformManager = useTransform()
/** 场景对象（如有需要） */
const scene = inject('scene')

/** 对象名称 */
const objectName = ref('')
/** userData编辑区文本 */
const userDataText = ref('')
/** userData校验错误信息 */
const userDataError = ref('')
/** 变换属性 */
const transform = reactive({
  /** 位置 */
  position: { x: 0, y: 0, z: 0 },
  /** 旋转（角度） */
  rotation: { x: 0, y: 0, z: 0 },
  /** 缩放 */
  scale: { x: 1, y: 1, z: 1 }
})

/**
 * 刷新属性显示
 */
function refreshTransform() {
  const newObject = selectedObject.value
  if (newObject) {
    objectName.value = newObject.name || ''
    // userData初始化为格式化JSON字符串，排除循环引用字段
    const { _mixer, _activeAction, ...userDataExport } = newObject.userData ?? {}
    userDataText.value = JSON.stringify(userDataExport, null, 2)
    userDataError.value = ''
    transform.position.x = Number(newObject.position.x.toFixed(3))
    transform.position.y = Number(newObject.position.y.toFixed(3))
    transform.position.z = Number(newObject.position.z.toFixed(3))
    transform.rotation.x = Number(radToDeg(newObject.rotation.x).toFixed(1))
    transform.rotation.y = Number(radToDeg(newObject.rotation.y).toFixed(1))
    transform.rotation.z = Number(radToDeg(newObject.rotation.z).toFixed(1))
    transform.scale.x = Number(newObject.scale.x.toFixed(3))
    transform.scale.y = Number(newObject.scale.y.toFixed(3))
    transform.scale.z = Number(newObject.scale.z.toFixed(3))
  }
}
watch(selectedObject, refreshTransform, { immediate: true })

/**
 * 监听对象变换事件，刷新属性
 */
onMounted(() => {
  window.addEventListener('object-transform-updated', refreshTransform)
})
onUnmounted(() => {
  window.removeEventListener('object-transform-updated', refreshTransform)
})

/**
 * 更新对象名称
 */
function updateObjectName() {
  if (selectedObject.value) {
    selectedObject.value.name = objectName.value
    ElMessage.success('对象名称已更新')
  }
}

/**
 * userData编辑失焦时校验并应用
 */
function onUserDataBlur() {
  if (!selectedObject.value) return
  try {
    const json = JSON.parse(userDataText.value)
    selectedObject.value.userData = json
    userDataError.value = ''
    ElMessage.success('userData已更新')
  } catch (e) {
    userDataError.value = 'JSON格式错误，请检查输入'
  }
}

/**
 * 更新对象变换属性
 */
function updateTransform() {
  if (!selectedObject.value) return
  transformManager.setPosition(selectedObject.value, [
    transform.position.x,
    transform.position.y,
    transform.position.z
  ])
  transformManager.setRotation(selectedObject.value, [
    degToRad(transform.rotation.x),
    degToRad(transform.rotation.y),
    degToRad(transform.rotation.z)
  ])
  transformManager.setScale(selectedObject.value, [
    transform.scale.x,
    transform.scale.y,
    transform.scale.z
  ])
}

/**
 * 重置缩放
 */
function resetScale() {
  transform.scale.x = 1
  transform.scale.y = 1
  transform.scale.z = 1
  updateTransform()
  ElMessage.info('缩放已重置')
}
</script>

<template>
  <div v-if="hasSelection" class="object-property-panel">
    <!-- 基本信息 -->
    <div class="property-section">
      <h4>基本信息</h4>
      <el-form label-width="60px" class="property-form">
        <el-form-item label="名称">
          <el-input
            v-model="objectName"
            placeholder="请输入对象名称"
            @blur="updateObjectName"
            size="small"
            clearable
          />
        </el-form-item>
        <el-form-item label="类型">
          <span class="property-value">{{ objectType }}</span>
        </el-form-item>
        <el-form-item label="userData">
          <el-input
            type="textarea"
            v-model="userDataText"
            :rows="4"
            placeholder="请输入合法的JSON"
            @blur="onUserDataBlur"
            size="small"
          />
          <div v-if="userDataError" style="color: #f56c6c; font-size: 12px; margin-top: 4px;">
            {{ userDataError }}
          </div>
        </el-form-item>
      </el-form>
    </div>
    <!-- 动画属性 -->
    <div class="property-section" v-if="animationList.length > 0">
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
    <!-- 变换属性 -->
    <div class="property-section">
      <h4>变换</h4>
      <el-form label-width="60px" class="property-form">
        <!-- 位置 -->
        <el-form-item label="位置">
          <div class="vector-input">
            <el-input-number
              v-model="transform.position.x"
              @change="updateTransform"
              :step="0.1"
              :precision="3"
              size="small"
              placeholder="X"
              :controls="false"
            />
            <el-input-number
              v-model="transform.position.y"
              @change="updateTransform"
              :step="0.1"
              :precision="3"
              size="small"
              placeholder="Y"
              :controls="false"
            />
            <el-input-number
              v-model="transform.position.z"
              @change="updateTransform"
              :step="0.1"
              :precision="3"
              size="small"
              placeholder="Z"
              :controls="false"
            />
          </div>
        </el-form-item>
        <!-- 旋转 -->
        <el-form-item label="旋转">
          <div class="vector-input">
            <el-input-number
              v-model="transform.rotation.x"
              @change="updateTransform"
              :step="1"
              :precision="1"
              size="small"
              placeholder="X°"
              :controls="false"
            />
            <el-input-number
              v-model="transform.rotation.y"
              @change="updateTransform"
              :step="1"
              :precision="1"
              size="small"
              placeholder="Y°"
              :controls="false"
            />
            <el-input-number
              v-model="transform.rotation.z"
              @change="updateTransform"
              :step="1"
              :precision="1"
              size="small"
              placeholder="Z°"
              :controls="false"
            />
          </div>
        </el-form-item>
        <!-- 缩放 -->
        <el-form-item label="缩放">
          <div class="vector-input">
            <el-input-number
              v-model="transform.scale.x"
              @change="updateTransform"
              :step="0.1"
              :min="0.001"
              :precision="3"
              size="small"
              placeholder="X"
              :controls="false"
            />
            <el-input-number
              v-model="transform.scale.y"
              @change="updateTransform"
              :step="0.1"
              :min="0.001"
              :precision="3"
              size="small"
              placeholder="Y"
              :controls="false"
            />
            <el-input-number
              v-model="transform.scale.z"
              @change="updateTransform"
              :step="0.1"
              :min="0.001"
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
</template>

<style lang="scss" scoped>
.object-property-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  min-height: 0;
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
.property-value {
  padding: 0 6px;
  background: #333;
  border-radius: 4px;
  font-size: 12px;
  color: #ccc;
}
.vector-input {
  display: flex;
  gap: 4px;
  .el-input-number {
    width: 33%;
  }
}
.reset-btn {
  margin-left: 12px;
  padding: 4px 12px;
  background: #555;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}
.reset-btn:hover {
  background: #666;
}
.no-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
