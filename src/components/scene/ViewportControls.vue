<template>
  <div class="viewport-controls">
    <div class="control-group">
      <el-button 
        @click="resetView"
        class="control-btn"
        title="重置视图"
        circle
        type="primary"
      >
        <el-icon><House /></el-icon>
      </el-button>
      
      <el-button 
        @click="fitToScreen"
        class="control-btn"
        title="适应屏幕"
        circle
        type="primary"
      >
        <el-icon><ZoomIn /></el-icon>
      </el-button>
      
      <el-button 
        @click="toggleWireframe"
        class="control-btn"
        :class="{ active: showWireframe }"
        title="线框模式"
        circle
        type="primary"
      >
        <el-icon><Box /></el-icon>
      </el-button>
      
      <el-button 
        @click="toggleGrid"
        class="control-btn"
        :class="{ active: showGrid }"
        title="网格"
        circle
        type="primary"
      >
        <el-icon><Grid /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ElButton, ElIcon } from 'element-plus';
import { House, ZoomIn, Box, Grid } from '@element-plus/icons-vue';

defineProps({
  showWireframe: { type: Boolean, required: true },
  showGrid: { type: Boolean, required: true },
  resetView: { type: Function, required: true },
  fitToScreen: { type: Function, required: true },
  toggleWireframe: { type: Function, required: true },
  toggleGrid: { type: Function, required: true }
});
</script>

<style scoped>
.viewport-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(34, 38, 46, 0.92);
  border-radius: 10px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.18);
  padding: 10px 10px 6px 10px;
  backdrop-filter: blur(12px);
  z-index: 300;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.2s;
}

.viewport-controls:hover {
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.28);
}

.control-group {
  display: flex;
  gap: 6px;
}

.control-btn {
  width: 34px;
  height: 34px;
  background: rgba(60, 65, 80, 0.92);
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.10);
  outline: none;
}

.control-btn:hover {
  background: #007acc;
  color: #fff;
}

.control-btn.active {
  background: #1e90ff;
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(30,144,255,0.18);
}

.icon {
  font-size: 18px;
}
</style>
