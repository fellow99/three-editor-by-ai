<!--
  交互操作提示组件
  固定显示在视口，提示用户常用鼠标操作说明
-->
<template>
  <div class="interaction-hints">
    <el-tag class="hint-item" size="small" type="info" effect="dark">
      <span class="hint-key">左键</span>
      <span class="hint-action">选择对象</span>
    </el-tag>
    <el-tag class="hint-item" size="small" type="info" effect="dark">
      <span class="hint-key">右键</span>
      <span class="hint-action">旋转视图</span>
    </el-tag>
    <el-tag class="hint-item" size="small" type="info" effect="dark">
      <span class="hint-key">滚轮</span>
      <span class="hint-action">缩放</span>
    </el-tag>
    <el-tag class="hint-item" size="small" type="info" effect="dark">
      <span class="hint-key">中键</span>
      <span class="hint-action">平移</span>
    </el-tag>
  </div>
</template>

<script setup>
import { ElTag } from 'element-plus';
// 交互操作提示组件，无响应式数据
</script>

<style scoped>
.interaction-hints {
  position: absolute;
  bottom: 20px;
  left: 20px;
  min-width: 140px;
  background: rgba(34, 38, 46, 0.92);
  border-radius: 10px;
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.18);
  padding: 16px 18px 12px 18px;
  backdrop-filter: blur(12px);
  z-index: 300;
  font-size: 13px;
  transition: box-shadow 0.2s;
}

.interaction-hints:hover {
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.28);
}

.hint-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
  padding: 0 4px;
  box-sizing: border-box;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-key {
  background: #4a5060;
  color: #fff;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
  font-size: 12px;
  margin-left: -5px;
  margin-right: 5px;
}

.hint-action {
  color: #b0b8c9;
  font-size: 12px;
}
</style>
