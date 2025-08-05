<template>
  <div class="performance-monitor">
    <div class="monitor-item">
      <span class="monitor-label">FPS:</span>
      <span class="monitor-value">{{ fps }}</span>
    </div>
    <div class="monitor-item">
      <span class="monitor-label">三角形:</span>
      <span class="monitor-value">{{ formatNumber(sceneStats.triangles) }}</span>
    </div>
    <div class="monitor-item">
      <span class="monitor-label">相机:</span>
      <span class="monitor-value">
        ({{ cameraPosition.x.toFixed(1) }}, 
         {{ cameraPosition.y.toFixed(1) }}, 
         {{ cameraPosition.z.toFixed(1) }})
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PerformanceMonitor',
  props: {
    fps: { type: [Number, String], required: true },
    sceneStats: { type: Object, required: true },
    cameraPosition: { type: Object, required: true },
    formatNumber: { type: Function, required: true }
  }
};
</script>

<style scoped>
.performance-monitor {
  position: absolute;
  top: 20px;
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

.performance-monitor:hover {
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.28);
}

.monitor-item {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 8px;
}

.monitor-item:last-child {
  margin-bottom: 0;
}

.monitor-label {
  color: #b0b8c9;
  font-weight: 500;
}

.monitor-value {
  color: #fff;
  font-weight: 700;
  font-family: monospace;
}
</style>
