<!--
  文件功能：性能监控面板，仅显示FPS，hover显示完整state，单击切换常驻显示。
  使用 stats-gl 监控 threejs 渲染性能。
  新语法：<script setup>、defineProps、defineEmits、shallowRef、watchEffect。
  注意：通过 useScene 获取 sceneManager.renderer，renderer 存在时初始化 stats-gl。
-->

<script setup>
import { ref, shallowRef, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Stats from "stats-gl"
import { useScene } from '../../composables/useScene.js'

/**
 * stateRef：保存 stats-gl 的 state 对象，用于显示详细性能信息
 */
const stateRef = shallowRef(null) // stats-gl state对象

/**
 * showDetail：是否显示详细信息（hover或常驻）
 */
const showDetail = ref(false) // 是否显示详细信息
/**
 * stickyDetail：是否常驻显示详细信息（单击切换）
 */
const stickyDetail = ref(false) // 是否常驻显示详细信息

/**
 * fps：当前FPS，仅显示数字
 */
const fps = ref(0) // 当前FPS

let stats = null
let requestAnimationFrameObj = null

const scene = useScene()

const statsRef = shallowRef(null);
statsRef.value = new Stats({ trackGPU: true, horizontal: false })

function updateTimer() {
  requestAnimationFrameObj = requestAnimationFrame(() => {
    const stats = statsRef.value
    if (stats) {
      stats.update();
      if(stats.updateCounter % 100 === 0){
        fps.value = Math.round(stats.lastValue.FPS);
      }
    }
    updateTimer();
  })
}
/**
 * 监听 renderer 初始化，动态挂载 stats-gl
 */
function init() {
  const renderer = scene.sceneManager?.renderer
  const stats = statsRef.value
  if (renderer) {
    stats.dom.style.position = 'relative'
    stats.dom.style.width = '90px'
    stats.dom.style.height = '150px'
    stateRef.value.appendChild(stats.dom)
    stats.init(renderer);
    updateTimer();
  }
}

onMounted(() => {
  nextTick(() => {
    init();
  })
})

/**
 * 卸载时移除 stats-gl
 */
onUnmounted(() => {
  const stats = statsRef.value
  if (stats && stats.dom && stats.dom.parentNode) {
    stats.dom.parentNode.removeChild(stats.dom)
  }
  statsRef.value = null

  if (requestAnimationFrameObj) {
    cancelAnimationFrame(requestAnimationFrameObj)
    requestAnimationFrameObj = null
  }
})

/**
 * 鼠标进入，显示详细信息
 */
function onMouseEnter() {
  showDetail.value = true
}
/**
 * 鼠标离开，若未常驻则隐藏详细信息
 */
function onMouseLeave() {
  if (!stickyDetail.value) showDetail.value = false
}
/**
 * 单击切换常驻显示
 */
function onClick() {
  stickyDetail.value = !stickyDetail.value
  if (!stickyDetail.value) showDetail.value = false
}
</script>

<template>
  <div
    class="stat-hints"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
    :title="showDetail ? '' : '点击常驻显示详细信息'"
  >
    <span class="fps">{{ fps }}</span>
    <span v-show="showDetail"ref="stateRef" class="detail">
    </span>
  </div>
</template>

<style scoped>
/* 文件功能：性能监控面板样式，仅显示FPS，hover/单击显示详细信息 */
.stat-hints {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 100;
  background: rgba(0,0,0,0.3);
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 16px;
  user-select: none;
  cursor: pointer;
  transition: background 0.2s;
}
.stat-hints:hover, .stat-hints:active {
  background: rgba(0,0,0,0.8);
}
.fps {
  font-weight: bold;
  font-size: 18px;
}
.detail {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-width: 320px;
  max-height: 240px;
  overflow: auto;
}
</style>
