<!--
  场景属性面板
  用于查看和编辑当前场景的基础属性（如名称、背景色、userData等）。
-->
<script setup>
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

<template>
  <div class="scene-property-panel">
    

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

<style lang="scss" scoped>
.scene-property-panel {
  padding: 16px;
}
.scene-form {
  margin-top: 16px;
}
</style>
