<!--
  编辑器配置对话框
  用于修改编辑器的控制器、网格、坐标轴、场景默认配置
  采用 element-plus 组件，支持所有配置项的可视化编辑
  新语法说明：使用<script setup>，组合式API，严格遵循Vue文件结构规范
-->

<script setup>
import { ref, watch } from 'vue';
import { ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElInputNumber, ElColorPicker, ElButton } from 'element-plus';
import { useEditorConfig, CONTROLS_OPTIONS } from '../../composables/useEditorConfig.js';

/**
 * 对话框显示状态，由父组件通过 v-model:visible 控制
 */
const props = defineProps({
  modelValue: { type: Boolean, required: true }
});
const emit = defineEmits(['update:modelValue']);

/**
 * 编辑器配置响应式对象
 */
const {
  editorConfig,
  setControlsType,
  setControlsParams,
  setGridConfig,
  setAxesSize,
  setSceneBgColor,
  resetEditorConfig
} = useEditorConfig();

/**
 * 临时表单数据，避免直接修改响应式状态
 */
const form = ref({
  controlsType: editorConfig.controlsType,
  panSpeed: editorConfig.panSpeed,
  rotateSpeed: editorConfig.rotateSpeed,
  zoomSpeed: editorConfig.zoomSpeed,
  gridSize: editorConfig.gridSize,
  gridDivisions: editorConfig.gridDivisions,
  gridColorCenterLine: editorConfig.gridColorCenterLine,
  gridColorGrid: editorConfig.gridColorGrid,
  axesSize: editorConfig.axesSize,
  sceneBgColor: editorConfig.sceneBgColor
});

/**
 * 打开时同步配置
 */
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value.controlsType = editorConfig.controlsType;
      form.value.panSpeed = editorConfig.panSpeed;
      form.value.rotateSpeed = editorConfig.rotateSpeed;
      form.value.zoomSpeed = editorConfig.zoomSpeed;
      form.value.gridSize = editorConfig.gridSize;
      form.value.gridDivisions = editorConfig.gridDivisions;
      form.value.gridColorCenterLine = editorConfig.gridColorCenterLine;
      form.value.gridColorGrid = editorConfig.gridColorGrid;
      form.value.axesSize = editorConfig.axesSize;
      form.value.sceneBgColor = editorConfig.sceneBgColor;
    }
  }
);

/**
 * 保存配置
 */
function handleSave() {
  setControlsType(form.value.controlsType);
  setControlsParams({
    panSpeed: form.value.panSpeed,
    rotateSpeed: form.value.rotateSpeed,
    zoomSpeed: form.value.zoomSpeed
  });
  setGridConfig({
    gridSize: form.value.gridSize,
    gridDivisions: form.value.gridDivisions,
    gridColorCenterLine: form.value.gridColorCenterLine,
    gridColorGrid: form.value.gridColorGrid
  });
  setAxesSize(form.value.axesSize);
  setSceneBgColor(form.value.sceneBgColor);
  emit('update:modelValue', false);
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('update:modelValue', false);
}

/**
 * 重置为默认配置
 */
function handleReset() {
  resetEditorConfig();
  form.value.controlsType = editorConfig.controlsType;
  form.value.panSpeed = editorConfig.panSpeed;
  form.value.rotateSpeed = editorConfig.rotateSpeed;
  form.value.zoomSpeed = editorConfig.zoomSpeed;
  form.value.gridSize = editorConfig.gridSize;
  form.value.gridDivisions = editorConfig.gridDivisions;
  form.value.gridColorCenterLine = editorConfig.gridColorCenterLine;
  form.value.gridColorGrid = editorConfig.gridColorGrid;
  form.value.axesSize = editorConfig.axesSize;
  form.value.sceneBgColor = editorConfig.sceneBgColor;
}
</script>

<template>
  <ElDialog
    :model-value="props.modelValue"
    title="编辑器配置"
    width="500px"
    @close="handleClose"
  >
    <ElForm label-width="120px" size="small">
      <el-divider content-position="left">控制器配置</el-divider>
      <!-- 控制器配置 -->
      <ElFormItem label="默认Controls">
        <ElSelect v-model="form.controlsType" style="width: 200px">
          <ElOption
            v-for="item in CONTROLS_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="平移速度">
        <ElInputNumber v-model="form.panSpeed" :min="0.1" :max="10" :step="0.1" />
      </ElFormItem>
      <ElFormItem label="旋转速度">
        <ElInputNumber v-model="form.rotateSpeed" :min="0.1" :max="10" :step="0.1" />
      </ElFormItem>
      <ElFormItem label="缩放速度">
        <ElInputNumber v-model="form.zoomSpeed" :min="0.1" :max="10" :step="0.1" />
      </ElFormItem>
      <el-divider content-position="left">网格配置</el-divider>
      <!-- 网格配置 -->
      <ElFormItem label="网格尺寸">
        <ElInputNumber v-model="form.gridSize" :min="1" :max="1000" :step="1" />
      </ElFormItem>
      <ElFormItem label="网格分段">
        <ElInputNumber v-model="form.gridDivisions" :min="1" :max="100" :step="1" />
      </ElFormItem>
      <ElFormItem label="中心线颜色">
        <ElColorPicker v-model="form.gridColorCenterLine" />
      </ElFormItem>
      <ElFormItem label="网格颜色">
        <ElColorPicker v-model="form.gridColorGrid" />
      </ElFormItem>
      <el-divider content-position="left">坐标轴配置</el-divider>
      <!-- 坐标轴配置 -->
      <ElFormItem label="坐标轴尺寸">
        <ElInputNumber v-model="form.axesSize" :min="1" :max="500" :step="1" />
      </ElFormItem>
      <el-divider content-position="left">场景默认配置</el-divider>
      <!-- 场景默认配置 -->
      <ElFormItem label="背景色">
        <ElColorPicker v-model="form.sceneBgColor" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleReset" type="warning">重置默认</ElButton>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton @click="handleSave" type="primary">保存</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
/* 编辑器配置对话框样式，可根据需要自定义 */
</style>
