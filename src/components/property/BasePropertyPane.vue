<!--
  基础属性面板
  用于展示和编辑选中对象的基本属性，包括名称、类型、内部ID、对外ID。
  已将userData相关逻辑抽离到UserDataPropertyPane.vue。
-->

<script setup>
import { ref, shallowRef, watch } from 'vue'
import { useObjectSelection } from '@/composables/useObjectSelection.js'

const { selectedIdsRef, getSelectedObjects } = useObjectSelection();
// 是否有选中对象
const hasSelection = ref(false);
// 当前选中对象（仅支持单选）
const selectedObject = shallowRef(null);


// 对象基本信息表单数据
const formDataRef = ref({
  id: '',
  name: '',
  visible: true
});

// 监听选中对象变化，更新activeTab和hasSelection
watch(selectedIdsRef, (ids) => {
  if (ids && ids.length > 0) {
    hasSelection.value = true;
    let objects = getSelectedObjects();
    let object = objects ? objects[0] : null;
    selectedObject.value = object;
    formDataRef.value = {
      id: object.userData?.id || '',
      name: object.name || object.userData?.name || object.userData?.equipmentInfo?.name || object.userData?.fileInfo?.name || '',
      visible: object.visible
    }
  } else {
    hasSelection.value = false;
    selectedObject.value = null;
    formDataRef.value = {
      id: '',
      name: '',
      visible: true
    }
  }
}, { immediate: true });

/**
 * 更新对象名称
 * @description 修改对象的name属性
 */
function updateObject() {
  if (!selectedObject.value) return;
    
  selectedObject.value._edited = true; // 标记为已编辑
  selectedObject.value.name = formDataRef.value.name;
  selectedObject.value.visible = formDataRef.value.visible;
  if(selectedObject.value.userData && formDataRef.value.id)selectedObject.value.userData.id = formDataRef.value.id;
}

</script>

<template>
  <div v-if="selectedObject && formDataRef" class="property-pane">
    <!-- 基本信息 -->
    <div class="property-section">
      <h4>基本信息</h4>
      <el-form label-width="60px" class="property-form">
        <el-form-item label="UUID">
          <el-input :modelValue="selectedObject.uuid" disabled size="small" />
        </el-form-item>
        <el-form-item label="对外ID">
          <el-input
            v-model="formDataRef.id"
            size="small"
          />
        </el-form-item>
        <el-form-item label="名称">
          <el-input
            v-model="formDataRef.name"
            placeholder="请输入对象名称"
            @blur="updateObject"
            size="small"
            clearable
          />
        </el-form-item>
        <el-form-item label="类型">
          <span class="property-value">{{ selectedObject.type }}</span>
        </el-form-item>
        <el-form-item label="是否可见">
          <el-switch
            v-model="formDataRef.visible"
            size="small"
            @change="updateObject"
            />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
