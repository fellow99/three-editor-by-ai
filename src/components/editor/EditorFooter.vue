<!--
  编辑器底部状态栏组件
  展示选中对象、相机参数，并提供场景统计弹窗
-->
<script setup>
import { ref, computed, watch } from 'vue';
import { ElTag, ElIcon, ElPopover, ElInputNumber, ElForm, ElFormItem } from 'element-plus';
import { Box, Camera, Position, DataAnalysis } from '@element-plus/icons-vue';

/** 组件属性定义 */
const { objectSelection, scene, cameraPosition, cameraTarget } = defineProps({
  objectSelection: { type: Object, required: true },
  scene: { type: Object, required: true },
  cameraPosition: { type: Object, required: true },
  /**
   * @description OrbitControls target（即视点目标点），用于显示当前视点
   */
  cameraTarget: { type: Object, required: true }
});

/** 场景统计信息，复用 scene.getSceneStats() */
const sceneStats = computed(() => (typeof scene.getSceneStats === 'function' ? scene.getSceneStats() : {}));

/** 相机位置编辑弹窗的可编辑副本，避免直接修改props */
const cameraPosEdit = ref({
  x: 0,
  y: 0,
  z: 0
});
/** 目标位置编辑弹窗的可编辑副本，避免直接修改props */
const cameraTargetEdit = ref({
  x: 0,
  y: 0,
  z: 0
});
/** 控制弹窗显示 */
const cameraPosPopoverVisible = ref(false);
const cameraTargetPopoverVisible = ref(false);

/**
 * 监听弹窗显示，弹出时同步当前值
 */
watch(cameraPosPopoverVisible, (val) => {
  if (val) {
    cameraPosEdit.value.x = cameraPosition.x;
    cameraPosEdit.value.y = cameraPosition.y;
    cameraPosEdit.value.z = cameraPosition.z;
  }
});
watch(cameraTargetPopoverVisible, (val) => {
  if (val) {
    cameraTargetEdit.value.x = cameraTarget.x;
    cameraTargetEdit.value.y = cameraTarget.y;
    cameraTargetEdit.value.z = cameraTarget.z;
  }
});

/**
 * 通知父组件更新相机位置
 */
const emit = defineEmits(['update:cameraPosition', 'update:cameraTarget']);
function handleCameraPosChange() {
  emit('update:cameraPosition', { ...cameraPosEdit.value });
}
/**
 * 通知父组件更新controls目标
 */
function handleCameraTargetChange() {
  emit('update:cameraTarget', { ...cameraTargetEdit.value });
}

/**
 * 格式化数字显示
 * @param {number} num 数值
 * @returns {string} 格式化结果
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num?.toString() ?? '0';
}
</script>

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
      <!-- 相机位置hover可编辑 -->
      <el-popover
        placement="top"
        trigger="hover"
        v-model:visible="cameraPosPopoverVisible"
      >
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;">
            <el-icon><Position /></el-icon>
            位置: ({{ cameraPosition.x.toFixed(1) }}, {{ cameraPosition.y.toFixed(1) }}, {{ cameraPosition.z.toFixed(1) }})
          </el-tag>
        </template>
        <el-form size="small">
          <el-form-item label="X">
<el-input-number v-model="cameraPosEdit.x" :step="1" :precision="2" controls-position="right" @change="handleCameraPosChange" />
          </el-form-item>
          <el-form-item label="Y">
<el-input-number v-model="cameraPosEdit.y" :step="1" :precision="2" controls-position="right" @change="handleCameraPosChange" />
          </el-form-item>
          <el-form-item label="Z">
<el-input-number v-model="cameraPosEdit.z" :step="1" :precision="2" controls-position="right" @change="handleCameraPosChange" />
          </el-form-item>
        </el-form>
      </el-popover>
      <!-- 当前视点（OrbitControls target），hover可编辑 -->
      <el-popover
        placement="top"
        trigger="hover"
        v-model:visible="cameraTargetPopoverVisible"
      >
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;">
            <el-icon><Camera /></el-icon>
            目标: ({{ cameraTarget?.x?.toFixed?.(2) ?? 'N/A' }}, {{ cameraTarget?.y?.toFixed?.(2) ?? 'N/A' }}, {{ cameraTarget?.z?.toFixed?.(2) ?? 'N/A' }})
          </el-tag>
        </template>
        <el-form size="small">
          <el-form-item label="X">
<el-input-number v-model="cameraTargetEdit.x" :step="1" :precision="2" controls-position="right" @change="handleCameraTargetChange" />
          </el-form-item>
          <el-form-item label="Y">
<el-input-number v-model="cameraTargetEdit.y" :step="1" :precision="2" controls-position="right" @change="handleCameraTargetChange" />
          </el-form-item>
          <el-form-item label="Z">
<el-input-number v-model="cameraTargetEdit.z" :step="1" :precision="2" controls-position="right" @change="handleCameraTargetChange" />
          </el-form-item>
        </el-form>
      </el-popover>
    </div>
    <div class="footer-right">
      <!-- 场景统计弹窗 -->
      <el-popover
        placement="top"
        width="100"
        trigger="hover"
        popper-class="scene-stats-popover"
      >
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;">
            <el-icon><DataAnalysis /></el-icon>
            场景统计
          </el-tag>
        </template>
        <div class="scene-stats">
          <div class="stat-item">
            <span class="stat-label">对象数量:</span>
            <span class="stat-value">{{ sceneStats.objects }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">三角形:</span>
            <span class="stat-value">{{ formatNumber(sceneStats.triangles) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">顶点:</span>
            <span class="stat-value">{{ formatNumber(sceneStats.vertices) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">材质:</span>
            <span class="stat-value">{{ sceneStats.materials }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">纹理:</span>
            <span class="stat-value">{{ sceneStats.textures }}</span>
          </div>
        </div>
      </el-popover>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
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
.scene-stats {
  padding: 8px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}
.stat-label {
  color: #aaa;
}
.stat-value {
  color: #fff;
  font-weight: 600;
}
.scene-stats-popover {
  background: #232323;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 10px 12px 8px 12px;
}
</style>
