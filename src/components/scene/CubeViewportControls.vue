<!--
  视口方向控制器组件
  使用 three-viewport-gizmo 实现相机方向可视化与交互，支持与主相机和 OrbitControls 联动
-->
<script setup>
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits } from 'vue'
import * as THREE from 'three'
import { ViewportGizmo } from 'three-viewport-gizmo'

const props = defineProps({
  camera: { type: Object, required: false, default: null }, // 主相机实例
  renderer: { type: Object, required: false, default: null }, // 主渲染器实例
  controls: { type: Object, required: false, default: null }, // OrbitControls实例
  cameraQuaternion: { type: Object, required: false, default: null } // 兼容旧用法
})
const emit = defineEmits(['viewChange'])

const gizmoContainer = ref(null)
let gizmo

/**
 * 初始化 ViewportGizmo
 */
function initGizmo() {
  if (props.camera && props.renderer && props.controls) {
    gizmo = new ViewportGizmo(props.camera, props.renderer, {
      container: gizmoContainer.value,
      type: 'sphere',
      size: 100,
      placement: 'bottom-right',
      animated: true,
      speed: 1.2
    })
    gizmo.attachControls(props.controls)
    gizmo.addEventListener('change', () => {
      emit('viewChange', 'change')
    })
  }
}

/**
 * 销毁 ViewportGizmo
 */
function disposeGizmo() {
  if (gizmo) {
    gizmo.dispose()
    gizmo = null
  }
}

let animationId = null

onMounted(() => {
  initGizmo()
  function animate() {
    if (gizmo) gizmo.render()
    animationId = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  disposeGizmo()
  if (animationId) cancelAnimationFrame(animationId)
})

// 镜头联动（如主相机变化时刷新gizmo）
watch(
  () => props.cameraQuaternion,
  (q) => {
    if (gizmo && q) {
      // 兼容旧用法，直接设置gizmo的camera四元数
      gizmo.camera.quaternion.set(q.x, q.y, q.z, q.w)
      gizmo.cameraUpdate()
    }
  },
  { deep: true }
)
</script>

<template>
  <div ref="gizmoContainer" class="cube-viewport-controls"></div>
</template>

<style lang="scss" scoped>
.cube-viewport-controls {
  width: 100px;
  height: 100px;
  z-index: 300;
}
</style>
