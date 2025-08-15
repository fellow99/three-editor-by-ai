<!--
  ScenePropertyPanel.vue
  场景属性面板：用于查看和编辑当前场景的基础属性（如名称、背景色、userData等）。
-->

<template>
  <div class="scene-property-panel">
    <!-- 场景统计信息 -->
    <div class="scene-stats">
      <div class="stat-item">
        <span class="stat-label">对象数量:</span>
        <span class="stat-value">{{ sceneStats.objects }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">三角形:</span>
        <span class="stat-value">{{ formatNumber(sceneStats.triangles) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">顶点:</span>
        <span class="stat-value">{{ formatNumber(sceneStats.vertices) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">材质:</span>
        <span class="stat-value">{{ sceneStats.materials }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">纹理:</span>
        <span class="stat-value">{{ sceneStats.textures }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">FPS:</span>
        <span class="stat-value">{{ sceneStats.fps }}</span>
      </div>
    </div>

    <el-form class="scene-form" label-width="70px">
      <el-form-item label="场景名称">
        <el-input v-model="sceneName" placeholder="请输入场景名称" />
      </el-form-item>
      <el-form-item label="背景色">
        <el-color-picker v-model="backgroundColor" />
      </el-form-item>
      <el-form-item label="userData">
        <el-input
          type="textarea"
          v-model="userDataText"
          :rows="4"
          placeholder="请输入合法的JSON"
          @blur="onUserDataBlur"
        />
        <div v-if="userDataError" style="color: #f56c6c; font-size: 12px; margin-top: 4px;">
          {{ userDataError }}
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
/**
 * 用于管理场景属性的编辑和应用
 * - 移除“应用修改”按钮
 * - 属性修改后立即生效
 */
import { ref, computed, watch } from 'vue'
import { useScene } from '../../composables/useScene'

/** 获取场景管理器和配置 */
const { sceneConfig, updateSceneConfig, getSceneStats } = useScene()

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

/** 当前场景名称（如需支持可扩展） */
const sceneName = ref('')
/** 当前场景背景色 */
const backgroundColor = ref(sceneConfig.backgroundColor)
/** userData编辑区文本 */
const userDataText = ref('')
/** userData校验错误信息 */
const userDataError = ref('')

/**
 * 初始化面板数据
 */
function initPanel() {
  backgroundColor.value = sceneConfig.backgroundColor
  // userData初始化为格式化JSON字符串
  userDataText.value = JSON.stringify(sceneConfig.userData ?? {}, null, 2)
  userDataError.value = ''
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

/**
 * userData编辑失焦时校验并应用
 */
function onUserDataBlur() {
  try {
    const json = JSON.parse(userDataText.value)
    updateSceneConfig({
      userData: json
    })
    userDataError.value = ''
  } catch (e) {
    userDataError.value = 'JSON格式错误，请检查输入'
  }
}

</script>

<style scoped>
.scene-property-panel {
  padding: 16px;
}

.scene-stats {
  padding: 12px 0 0 0;
  border-bottom: 1px solid #444;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.stat-label {
  color: #aaa;
}

.stat-value {
  color: #fff;
  font-weight: 600;
}

.scene-form {
  margin-top: 16px;
}
</style>
