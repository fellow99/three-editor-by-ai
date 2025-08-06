<template>
  <footer class="editor-footer">
    <div class="footer-left">
      <span class="status-item">
        {{ objectSelection?.hasSelection?.value ? `已选中 ${objectSelection?.selectionCount?.value || 0} 个对象` : '未选中对象' }}
      </span>
    </div>
    <div class="footer-center">
      <span class="status-item">
        相机: {{ scene?.cameraState?.fov || 75 }}° FOV
      </span>
      <span class="status-item">
        位置: ({{ cameraPosition.x.toFixed(1) }}, {{ cameraPosition.y.toFixed(1) }}, {{ cameraPosition.z.toFixed(1) }})
      </span>
    </div>
    <div class="footer-right">
      <span class="status-item">
        FPS: {{ scene?.fps?.value || 0 }}
      </span>
      <span class="status-item">
        对象数: {{ scene?.getSceneStats?.()?.objects || 0 }}
      </span>
    </div>
  </footer>
</template>

<!--
  编辑器底部状态栏组件
  展示选中对象、相机参数、FPS等实时信息
-->
<script setup>
defineProps({
  objectSelection: { type: Object, required: true },
  scene: { type: Object, required: true },
  cameraPosition: { type: Object, required: true }
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
