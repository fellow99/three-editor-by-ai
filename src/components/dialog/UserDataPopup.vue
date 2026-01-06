<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    object: {
        type: Object,
        required: true
    }
})

const selectedObject = computed(() => props.object);

/** 
 * userData编辑区文本，用于展示和编辑选中对象的userData属性（JSON字符串）
 */
const userDataText = ref('')

/**
 * userData校验错误信息，用于提示userData输入的JSON格式错误
 */
const userDataError = ref('')

/**
 * userData属性表格数据，用于以key-value表格方式展示userData
 */
const userDataEntries = computed(() => {
  if (!props.object || !props.object.userData) return []
  const entries = []
  for (const [key, value] of Object.entries(props.object.userData)) {
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
 * 刷新userData显示
 * 仅在选中对象变化时触发
 */
function refreshUserData() {
  const newObject = selectedObject.value
  if (newObject) {
    userDataText.value = JSON.stringify(newObject.userData ?? {}, null, 2)
    userDataError.value = ''
  }
}
watch(selectedObject, refreshUserData, { immediate: true })


/**
 * userData编辑失焦时校验并应用
 * 校验JSON格式，应用到选中对象
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

const emit = defineEmits(['close']);

function handleClose() {
    emit('close');
}
</script>

<template>
  <div v-if="object" class="user-data-popup">
    <div class="popup-header">
        <div class="popup-title">&nbsp;{{ object.name || object.uuid }}</div>
        <div class="button-place">
            <div class="button-close" @click="handleClose">×</div>
        </div>
    </div>
    <el-tabs v-if="selectedObject && selectedObject.userData">
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
                  <pre style="max-height: 40vh; overflow: auto;white-space: pre-wrap; margin: 0;">{{ scope.row.str }}</pre>
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
.user-data-popup {
    position: relative;
    width: 20em;
    height: 15em;
    overflow: hidden;
    padding: 0.5em;
    background-color: rgba(0, 0, 0, 0.8);
    border: 1px solid #ccc;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    .popup-header {
        display: flex;
        justify-content: space-between;
        .popup-title {
            font-weight: bold;
            color: white;
            margin-bottom: 0.5em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .button-place {
            .button-close {
                position: relative;
                width: 1.2em;
                height: 1.2em;
                cursor: pointer;
                font-size: 1em;
                line-height: 1;
                text-align: center;
                padding: 0;
                margin: 0;
                background-color: rgba(255, 255, 255, 0.1);
                border: 1px solid #ccc;
                border-radius: 1em;
                color: white;
                &:hover {
                    background-color: rgba(255,0,0,0.2);
                }
            }
        }
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
}
</style>
