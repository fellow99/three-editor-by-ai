<template>
  <footer class="editor-footer">
    <div class="footer-left">
      <el-tag size="small" type="info" effect="dark">
        <el-icon><Box /></el-icon>
        {{ objectSelection?.hasSelection?.value ? `已选中 ${objectSelection?.selectionCount?.value || 0} 个对象` : '未选中对象' }}
      </el-tag>
    </div>
    <div class="footer-center">
      <el-tag size="small" type="info" effect="dark">
        <el-icon><Camera /></el-icon>
        相机: {{ scene?.cameraState?.fov || 75 }}° FOV
      </el-tag>
      <el-tag size="small" type="info" effect="dark">
        <el-icon><Position /></el-icon>
        位置: ({{ cameraPosition.x.toFixed(1) }}, {{ cameraPosition.y.toFixed(1) }}, {{ cameraPosition.z.toFixed(1) }})
      </el-tag>
      <!-- 当前视点（OrbitControls target） -->
      <el-tag size="small" type="info" effect="dark">
        <el-icon><Camera /></el-icon>
        视点: ({{ cameraTarget?.x?.toFixed?.(2) ?? 'N/A' }}, {{ cameraTarget?.y?.toFixed?.(2) ?? 'N/A' }}, {{ cameraTarget?.z?.toFixed?.(2) ?? 'N/A' }})
      </el-tag>
    </div>
    <div class="footer-right">
      <el-tag size="small" type="success" effect="dark">
        <el-icon><Cpu /></el-icon>
        FPS: {{ scene?.fps?.value || 0 }}
      </el-tag>
      <el-tag size="small" type="warning" effect="dark">
        <el-icon><Box /></el-icon>
        对象数: {{ scene?.getSceneStats?.()?.objects || 0 }}
      </el-tag>
    </div>
  </footer>
</template>

<!--
  编辑器底部状态栏组件
  展示选中对象、相机参数、FPS等实时信息
-->
<!--
  编辑器底部状态栏组件
  展示选中对象、相机参数、FPS等实时信息
-->
<script setup>
import { ElTag, ElIcon } from 'element-plus';
import { Box, Camera, Cpu, Position } from '@element-plus/icons-vue';

defineProps({
  objectSelection: { type: Object, required: true },
  scene: { type: Object, required: true },
  cameraPosition: { type: Object, required: true },
  /**
   * @description OrbitControls target（即视点目标点），用于显示当前视点
   */
  cameraTarget: { type: Object, required: true }
});
</script>

<style scoped>
.editor-footer {
  height: 28px;
  background: #2a2a2a;
  border-top: 1px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: #aaa;
}

.footer-left,
.footer-center,
.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  padding: 2px 8px;
  background: #333;
  border-radius: 3px;
  font-family: monospace;
}

@media (max-width: 768px) {
  .editor-footer {
    height: 24px;
    padding: 0 12px;
    font-size: 10px;
  }
  .footer-center {
    display: none;
  }
}
</style>
