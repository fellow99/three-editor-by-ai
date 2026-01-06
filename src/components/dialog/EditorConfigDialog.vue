<!--
  编辑器配置对话框
  用于修改编辑器的控制器、网格、坐标轴、场景默认配置
  采用 element-plus 组件，支持所有配置项的可视化编辑
  新语法说明：使用<script setup>，组合式API，严格遵循Vue文件结构规范
-->

<script setup>
import { ref, watch } from 'vue';
import { useEditorConfig, CONTROLS_OPTIONS } from '@/composables/useEditorConfig.js';

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
  resetEditorConfig
} = useEditorConfig();

/**
 * 临时表单数据，避免直接修改响应式状态
 */
const form = ref({
  controlsType: editorConfig.controlsType,
  targetDistance: editorConfig.targetDistance,
  lockY: editorConfig.lockY,
  enableKeyboard: editorConfig.enableKeyboard,
  movementSpeed: editorConfig.movementSpeed,
  rollSpeed: editorConfig.rollSpeed,
  panSpeed: editorConfig.panSpeed,
  rotateSpeed: editorConfig.rotateSpeed,
  zoomSpeed: editorConfig.zoomSpeed,
  gridSize: editorConfig.gridSize,
  gridDivisions: editorConfig.gridDivisions,
  gridColorCenterLine: editorConfig.gridColorCenterLine,
  gridColorGrid: editorConfig.gridColorGrid,
  axesSize: editorConfig.axesSize,
});

/**
 * 打开时同步配置
 */
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value.controlsType = editorConfig.controlsType;
      form.value.targetDistance = editorConfig.targetDistance;
      form.value.lockY = editorConfig.lockY;
      form.value.enableKeyboard = editorConfig.enableKeyboard;
      form.value.movementSpeed = editorConfig.movementSpeed;
      form.value.rollSpeed = editorConfig.rollSpeed;
      form.value.panSpeed = editorConfig.panSpeed;
      form.value.rotateSpeed = editorConfig.rotateSpeed;
      form.value.zoomSpeed = editorConfig.zoomSpeed;
      form.value.gridSize = editorConfig.gridSize;
      form.value.gridDivisions = editorConfig.gridDivisions;
      form.value.gridColorCenterLine = editorConfig.gridColorCenterLine;
      form.value.gridColorGrid = editorConfig.gridColorGrid;
      form.value.axesSize = editorConfig.axesSize;
    }
  }
);

/**
 * 保存配置
 */
function handleSave() {
  setControlsType(form.value.controlsType);
  setControlsParams({
    targetDistance: form.value.targetDistance,
    lockY: form.value.lockY,
    enableKeyboard: form.value.enableKeyboard,
    movementSpeed: form.value.movementSpeed,
    rollSpeed: form.value.rollSpeed,
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
  form.value.targetDistance = editorConfig.targetDistance;
  form.value.lockY = editorConfig.lockY;
  form.value.enableKeyboard = editorConfig.enableKeyboard;
  form.value.movementSpeed = editorConfig.movementSpeed;
  form.value.rollSpeed = editorConfig.rollSpeed;
  form.value.panSpeed = editorConfig.panSpeed;
  form.value.rotateSpeed = editorConfig.rotateSpeed;
  form.value.zoomSpeed = editorConfig.zoomSpeed;
  form.value.gridSize = editorConfig.gridSize;
  form.value.gridDivisions = editorConfig.gridDivisions;
  form.value.gridColorCenterLine = editorConfig.gridColorCenterLine;
  form.value.gridColorGrid = editorConfig.gridColorGrid;
  form.value.axesSize = editorConfig.axesSize;
}
</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    title="编辑器配置"
    width="500px"
    @close="handleClose"
  >
    <el-form label-width="120px" size="small">
      <el-divider content-position="left">控制器配置</el-divider>
      <!-- 控制器配置 -->
      <el-form-item label="默认Controls">
        <el-select v-model="form.controlsType" style="width: 200px">
          <el-option
            v-for="item in CONTROLS_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <template v-if="form.controlsType === 'FlyControls'">
        <el-form-item label="目标距离">
          <el-input-number v-model="form.targetDistance" :min="0.1" :max="1000" :step="0.1" />
        </el-form-item>
        <el-form-item label="镜头锁定Y轴">
          <el-switch v-model="form.lockY" active-text="强制平视" />
        </el-form-item>
        <el-form-item label="允许键盘操作">
          <el-switch v-model="form.enableKeyboard" />
        </el-form-item>
        <el-form-item label="键盘移动速度">
          <el-input-number v-model="form.movementSpeed" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
        <el-form-item label="键盘旋转速度">
          <el-input-number v-model="form.rollSpeed" :min="0.001" :max="1" :step="0.001" />
        </el-form-item>
        <el-form-item label="鼠标平移速度">
          <el-input-number v-model="form.panSpeed" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
        <el-form-item label="鼠标旋转速度">
          <el-input-number v-model="form.rotateSpeed" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
        <el-form-item label="鼠标缩放速度">
          <el-input-number v-model="form.zoomSpeed" :min="0.1" :max="10" :step="0.1" />
        </el-form-item>
      </template>
      <template v-else>
        <!-- 其他控制器通用配置 -->
      <el-form-item label="平移速度">
        <el-input-number v-model="form.panSpeed" :min="0.1" :max="10" :step="0.1" />
      </el-form-item>
      <el-form-item label="旋转速度">
        <el-input-number v-model="form.rotateSpeed" :min="0.1" :max="10" :step="0.1" />
      </el-form-item>
      <el-form-item label="缩放速度">
        <el-input-number v-model="form.zoomSpeed" :min="0.1" :max="10" :step="0.1" />
      </el-form-item>
      </template>
      <el-divider content-position="left">网格配置</el-divider>
      <!-- 网格配置 -->
      <el-form-item label="网格尺寸">
        <el-input-number v-model="form.gridSize" :min="1" :step="1" />
      </el-form-item>
      <el-form-item label="网格分段">
        <el-input-number v-model="form.gridDivisions" :min="1" :step="1" />
      </el-form-item>
      <el-form-item label="中心线颜色">
        <el-color-picker v-model="form.gridColorCenterLine" />
      </el-form-item>
      <el-form-item label="网格颜色">
        <el-color-picker v-model="form.gridColorGrid" />
      </el-form-item>
      <el-divider content-position="left">视点坐标轴配置</el-divider>
      <!-- 视点坐标轴配置 -->
      <el-form-item label="坐标轴尺寸">
        <el-input-number v-model="form.axesSize" :min="1" :max="100" :step="1" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleReset" type="warning">重置默认</el-button>
      <el-button @click="handleClose">取消</el-button>
      <el-button @click="handleSave" type="primary">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 编辑器配置对话框样式，可根据需要自定义 */
</style>
