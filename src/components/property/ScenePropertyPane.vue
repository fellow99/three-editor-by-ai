<!--
  场景属性面板
  用于查看和编辑当前场景的基础属性（如名称、背景色）。
  userData已抽取到SceneUserDataPropertyPane.vue独立管理。
-->
<script setup>
import { ref, computed, watch } from 'vue'
import { useScene } from '../../composables/useScene'

/** 获取场景管理器和配置 */
const { sceneConfig, updateSceneConfig, getSceneStats, threeViewer } = useScene()

/** 场景统计信息 */
const sceneStats = computed(() => getSceneStats())

/**
 * 格式化数字显示
 * @param {number} num 数值
 * @returns {string} 格式化结果
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num?.toString() ?? '0'
}

/** 当前场景ID（唯一标识，来源于THREE.Scene.uuid） */
const sceneId = ref(threeViewer.scene?.uuid ?? '')

/** 当前场景名称（如需支持可扩展） */
const sceneName = ref('')
/** 当前场景背景色 */
const backgroundColor = ref(sceneConfig.backgroundColor)

/**
 * 初始化面板数据
 */
function initPanel() {
  backgroundColor.value = sceneConfig.backgroundColor
}
initPanel()

/**
 * 属性变更后立即应用到场景
 */
watch([backgroundColor], () => {
  updateSceneConfig({
    backgroundColor: backgroundColor.value
  })
})


</script>

<template>
  <div class="scene-property-panel">
    

    <el-form class="scene-form" label-width="70px">
      <el-form-item label="场景ID">
        <el-input v-model="sceneId" disabled />
      </el-form-item>
      <el-form-item label="场景名称">
        <el-input v-model="sceneName" placeholder="请输入场景名称" />
      </el-form-item>
      <el-form-item label="背景色">
        <el-color-picker v-model="backgroundColor" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.scene-property-panel {
  padding: 16px;
}
.scene-form {
  margin-top: 16px;
}
</style>
