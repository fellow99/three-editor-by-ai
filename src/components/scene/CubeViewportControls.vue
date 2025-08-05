<template>
  <div class="cube-viewport-controls">
    <canvas ref="cubeCanvas" class="cube-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  cameraQuaternion: { type: Object, required: false, default: null }
})
const emit = defineEmits(['viewChange'])

const cubeCanvas = ref(null)
let renderer, scene, camera, cube, animationId

// 立方体6面与方向映射
const faceToDirection = [
  { face: 10, dir: 'front', vector: new THREE.Vector3(0, 0, 1) },   // Z+
  { face: 8,  dir: 'back',  vector: new THREE.Vector3(0, 0, -1) },  // Z-
  { face: 4,  dir: 'right', vector: new THREE.Vector3(1, 0, 0) },   // X+
  { face: 6,  dir: 'left',  vector: new THREE.Vector3(-1, 0, 0) },  // X-
  { face: 0,  dir: 'top',   vector: new THREE.Vector3(0, 1, 0) },   // Y+
  { face: 2,  dir: 'bottom',vector: new THREE.Vector3(0, -1, 0) }   // Y-
]

function initCubeScene() {
  const width = 80
  const height = 80
  renderer = new THREE.WebGLRenderer({ canvas: cubeCanvas.value, alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10)
  camera.position.set(2, 2, 2)
  camera.lookAt(0, 0, 0)

  // 立方体
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const materials = [
    new THREE.MeshBasicMaterial({ color: '#ff6666', transparent: true, opacity: 0.9 }), // +X
    new THREE.MeshBasicMaterial({ color: '#66ccff', transparent: true, opacity: 0.9 }), // -X
    new THREE.MeshBasicMaterial({ color: '#66ff66', transparent: true, opacity: 0.9 }), // +Y
    new THREE.MeshBasicMaterial({ color: '#ffcc66', transparent: true, opacity: 0.9 }), // -Y
    new THREE.MeshBasicMaterial({ color: '#cccccc', transparent: true, opacity: 0.9 }), // +Z
    new THREE.MeshBasicMaterial({ color: '#cc66ff', transparent: true, opacity: 0.9 })  // -Z
  ]
  cube = new THREE.Mesh(geometry, materials)
  scene.add(cube)

  // 光照
  scene.add(new THREE.AmbientLight(0xffffff, 1))

  animate()
}

function animate() {
  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
}

function dispose() {
  cancelAnimationFrame(animationId)
  renderer && renderer.dispose()
  scene = null
  camera = null
  cube = null
}

function onCanvasClick(e) {
  if (!cube || !renderer) return
  const rect = cubeCanvas.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
  const mouse = new THREE.Vector2(x, y)
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(cube)
  if (intersects.length > 0) {
    const faceIndex = intersects[0].faceIndex
    // BoxGeometry每个面2个三角形，faceIndex/2取整
    const faceId = Math.floor(faceIndex / 2)
    const mapping = faceToDirection.find(f => f.face === faceId)
    if (mapping) {
      emit('viewChange', mapping.dir)
    }
  }
}

onMounted(() => {
  initCubeScene()
  cubeCanvas.value.addEventListener('click', onCanvasClick)
})

onUnmounted(() => {
  dispose()
  cubeCanvas.value?.removeEventListener('click', onCanvasClick)
})

// 镜头联动
watch(
  () => props.cameraQuaternion,
  (q) => {
    if (cube && q) {
      cube.quaternion.set(q.x, q.y, q.z, q.w)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.cube-viewport-controls {
  width: 80px;
  height: 80px;
  background: rgba(42,42,42,0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px #0006;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.cube-canvas {
  width: 80px;
  height: 80px;
  cursor: pointer;
  display: block;
}
</style>
