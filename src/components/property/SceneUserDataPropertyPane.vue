<!--
  场景userData属性面板
  用于展示和编辑当前场景的userData属性（JSON格式）。
  新语法：Vue 3 <script setup>，Composition API，Element Plus。
-->

<script setup>
import { ref, watch, computed } from 'vue'

const sceneConfig = {
  name: '',
  userData: {}
}

/** userData编辑区文本
  用于展示和编辑场景的userData属性（JSON字符串）
*/
const userDataText = ref(JSON.stringify(sceneConfig.userData ?? {}, null, 2))
/** userData校验错误信息
  用于提示userData输入的JSON格式错误
*/
const userDataError = ref('')

/** userData属性表格数据
  用于以key-value表格方式展示userData
*/
const userDataEntries = computed(() => {
  if (!sceneConfig.userData) return []
  const entries = []
  for (const [key, value] of Object.entries(sceneConfig.userData)) {
    if(key === 'id') {
      // id字段放在最前面
      entries.unshift({ key, value: value })
    } else if (value && typeof value === 'object') {
      // 其他对象序列化
      entries.push({
        key,
        value,
        str: JSON.stringify(value, null, 2)
      })
    } else {
      entries.push({ key, value: value })
    }
  }
  return entries
})

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
    setSceneUserData(json);
    userDataError.value = ''
  } catch (e) {
    userDataError.value = 'JSON格式错误，请检查输入'
  }
}
</script>

<template>
  <div class="property-section">
    <el-tabs>
      <el-tab-pane label="表格视图">
        <el-table
          :data="userDataEntries"
          border
          size="small"
          style="margin-bottom: 12px;"
          :show-header="true"
        >
          <el-table-column prop="key" label="Key" width="80" />
          <el-table-column prop="value" label="Value">
            <template #default="scope">
                <el-popover v-if="scope.row.str && (scope.row.str.startsWith('{') || scope.row.str.startsWith('['))" width="400" trigger="hover">
                  <template #reference>
                    <el-link size="small">查看</el-link>
                  </template>
                  <pre style="white-space: pre-wrap; margin: 0;">{{ scope.row.str }}</pre>
                </el-popover>
              <span v-else-if="scope.row.str">{{ scope.row.str }}</span>
              <span v-else>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="JSON视图">
        <el-form label-width="60px" class="property-form">
            <el-input
              class="user-data-input"
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
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.property-section {
  padding: 8px;
  overflow-y: auto;
  height: calc(100vh - 160px);
}
.el-tabs {
  height: 100%;
  &:deep(.el-tabs__content) {
    height: calc(100% - 40px);
  }
  .el-tab-pane {
    height: 100%;
    overflow: auto;
  }
}
.el-form {
  height: calc(100% - 10px);
}
.user-data-input {
  width: 100%;
  height: 100%;
  &:deep(.el-textarea__inner) {
    height: 100%;
  }
}
</style>
