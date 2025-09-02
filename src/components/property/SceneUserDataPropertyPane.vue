<!--
  场景userData属性面板
  用于展示和编辑当前场景的userData属性（JSON格式）。
  新语法：Vue 3 <script setup>，Composition API，Element Plus。
-->

<script setup>
import { ref, watch } from 'vue'
import { useScene } from '../../composables/useScene'

/** 获取场景管理器和配置 */
const { sceneConfig, updateSceneConfig } = useScene()

/** userData编辑区文本
  用于展示和编辑场景的userData属性（JSON字符串）
*/
const userDataText = ref(JSON.stringify(sceneConfig.userData ?? {}, null, 2))
/** userData校验错误信息
  用于提示userData输入的JSON格式错误
*/
const userDataError = ref('')

/**
 * 场景userData变更时刷新显示
 */
watch(() => sceneConfig.userData, (val) => {
  userDataText.value = JSON.stringify(val ?? {}, null, 2)
})

/**
 * userData编辑失焦时校验并应用
 * 校验JSON格式，应用到场景
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
  <div class="scene-userdata-pane">
    <h4>场景 userData</h4>
    <el-form label-width="70px" class="scene-userdata-form">
        <el-input
          class="user-data-input"
          type="textarea"
          v-model="userDataText"
          placeholder="请输入合法的JSON"
          @blur="onUserDataBlur"
        />
        <div v-if="userDataError" style="color: #f56c6c; font-size: 12px; margin-top: 4px;">
          {{ userDataError }}
        </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.scene-userdata-pane {
  padding: 8px;
}
.scene-userdata-pane h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  border-bottom: 1px solid #444;
  padding-bottom: 4px;
}
.scene-userdata-form {
  margin-top: 8px;
}
.user-data-input {
  width: 100%;
  height: 50vh;
  &:deep(.el-textarea__inner) {
    height: 100%;
  }
}
</style>
