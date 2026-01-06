<!--
  编辑器底部状态栏组件
  展示选中对象、相机参数，并提供场景统计弹窗
-->
<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { ElTag, ElIcon, ElPopover, ElInputNumber, ElForm, ElFormItem, ElSwitch } from 'element-plus';
import { Box, Camera, Position, DataAnalysis } from '@element-plus/icons-vue';
import { useThreeViewer } from '@/composables/useThreeViewer.js';
import { useMaterialsState } from '@/composables/useMaterial.js';
import { useEditorConfig } from '@/composables/useEditorConfig.js';
import { useAxesHelper } from '@/composables/useHelpers.js';
import { useControls } from '@/composables/useControls.js';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import { useCameraPosState, updateCurrentPos } from '@/composables/useCameraPosState.js';
import { useEventBus } from '@/composables/useEventBus.js';

const eventBus = useEventBus();
const { editorConfig } = useEditorConfig();
const cameraPosState = useCameraPosState();
const objectSelection = useObjectSelection();
const viewerRef = useThreeViewer();
const selectedIdsRef = computed(() => objectSelection.selectedIdsRef);

/**
 * @description 相机位置与四元数
 */
const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
/**
 * @description OrbitControls target（即视点目标点），用于底部状态栏显示
 */
const cameraTarget = reactive({ x: 0, y: 0, z: 0 });

/** 场景统计信息 */
const sceneStats = reactive({
  objects: 0,
  vertices: 0,
  triangles: 0,
  materials: 0,
  textures: 0,
  models: 0,
  tileModels: 0,
  lights: 0,
  labels: 0,
  customMaterials: 0
});

// 当前控制器类型
const lockY = computed({
  get: () => editorConfig.lockY,
  set: (val) => {
    setLockY(val);
  }
});

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

watch(viewerRef, (viewer) => {
  if (viewer) {
    // 在每次渲染时更新相机位置
    viewer.on('render', updateCameraPos);
  }
}, { immediate: true });

// 监听场景变化，更新统计信息
['scene-loaded',
  'add-light', 'add-model', 'add-3dtiles', 'add-label',
  'remove-light', 'remove-model', 'remove-3dtiles', 'remove-label',
  'tile-loaded',
  'visibility-changed', 'lock-changed'
].forEach(eventName => {
  eventBus.on(eventName, updateSceneStats);
});

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

function setLockY(val) {
  editorConfig.lockY = val;

  const controlsRef = useControls();
  const controls = controlsRef.value;
  if(controls && controls.type === 'FlyControls') {
     controls.lockY = val;
  }
}

/**
 * 获取场景统计信息
 * @returns {object} 统计信息
 */
function updateSceneStats() {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;

  const materialsState = useMaterialsState();
  
  sceneStats.objects = 0;
  sceneStats.vertices = 0;
  sceneStats.triangles = 0;
  let materials = new Set();
  let textures = new Set();
  
  viewer.scene.traverse(child => {
    sceneStats.objects++;
    if (child.geometry) {
      const positionAttribute = child.geometry.getAttribute('position');
      if (positionAttribute) {
        sceneStats.vertices += positionAttribute.count;
      }
      
      const index = child.geometry.getIndex();
      if (index) {
        sceneStats.triangles += index.count / 3;
      } else if (positionAttribute) {
        sceneStats.triangles += positionAttribute.count / 3;
      }
    }
    
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(mat => materials.add(mat));
      } else {
        materials.add(child.material);
      }
    }
  });
  
  // 统计纹理
  materials.forEach(material => {
    Object.values(material).forEach(value => {
      if (value && value.isTexture) {
        textures.add(value);
      }
    });
  });

  sceneStats.materials = materials.size;
  sceneStats.textures = textures.size;
  sceneStats.models = viewer.models ? viewer.models.length : 0;
  sceneStats.tileModels = viewer.tilesModels ? viewer.tilesModels.length : 0;
  sceneStats.lights = viewer.lights ? viewer.lights.length : 0;
  sceneStats.labels = viewer.labels ? viewer.labels.length : 0;
  sceneStats.customMaterials = materialsState.materials.length;
}

function selectAxesHelper() {
  let axesHelperRef = useAxesHelper();
  let axesHelper = axesHelperRef.value;
  if(!axesHelper) return;

  // 选择坐标轴辅助对象
  objectSelection.selectObject(axesHelper);
  ElMessage.primary('已选择坐标轴辅助对象');
}


/**
 * 处理EditorFooter相机位置变更事件
 */
function handleCameraPositionChange() {
  let pos = cameraPosEdit.value;

  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;

  let { camera } = viewer;
  camera.position.set(pos.x, pos.y, pos.z);
}
/**
 * 处理EditorFooter目标点变更事件
 */
function handleCameraTargetChange() {
  let target = cameraTargetEdit.value;

  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;
  
  let { camera } = viewer;
  let controlsRef = useControls();
  let controls = controlsRef.value;

  if (controls && controls.target) {
    controls.target.set(target.x, target.y, target.z);
    // 同步相机朝向
    if (camera && camera.lookAt) {
      camera.lookAt(target.x, target.y, target.z);
    }
  }
}

// 定时更新相机状态
function updateCameraPos() {
  let viewer = viewerRef.value;
  if(viewer) {
    let { camera, controls  } = viewer;
    updateCurrentPos(camera, controls);
  }
  if(cameraPosState?.currentPos?.position) {
    cameraPosition.x = cameraPosState.currentPos.position[0];
    cameraPosition.y = cameraPosState.currentPos.position[1];
    cameraPosition.z = cameraPosState.currentPos.position[2];
  }
  if(cameraPosState?.currentPos?.target) {
    cameraTarget.x = cameraPosState.currentPos.target[0];
    cameraTarget.y = cameraPosState.currentPos.target[1];
    cameraTarget.z = cameraPosState.currentPos.target[2];
  }
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
        {{ selectedIdsRef && selectedIdsRef.value.length ? `已选中 ${selectedIdsRef.value.length || 0} 个对象` : '未选中对象' }}
      </el-tag>
      <el-tag size="small" type="info" effect="dark">
        按Ctrl多选
      </el-tag>
    </div>
    <div class="footer-center">
      <!-- 相机位置hover可编辑 -->
      <el-popover
        placement="top"
        trigger="click"
        v-model:visible="cameraPosPopoverVisible"
      >
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;">
            <el-icon><Camera /></el-icon>
            相机: ({{ cameraPosition.x.toFixed(1) }}, {{ cameraPosition.y.toFixed(1) }}, {{ cameraPosition.z.toFixed(1) }})
          </el-tag>
        </template>
        <el-form size="small">
          <el-form-item label="X">
<el-input-number v-model="cameraPosEdit.x" :step="1" :precision="2" controls-position="right" @change="handleCameraPositionChange" />
          </el-form-item>
          <el-form-item label="Y">
<el-input-number v-model="cameraPosEdit.y" :step="1" :precision="2" controls-position="right" @change="handleCameraPositionChange" />
          </el-form-item>
          <el-form-item label="Z">
<el-input-number v-model="cameraPosEdit.z" :step="1" :precision="2" controls-position="right" @change="handleCameraPositionChange" />
          </el-form-item>
        </el-form>
      </el-popover>
      <!-- 当前视点（OrbitControls target），hover可编辑 -->
      <el-popover
        placement="top"
        trigger="click"
        v-model:visible="cameraTargetPopoverVisible"
      >
        <template #reference>
          <el-tag size="small" type="info" effect="dark" style="cursor:pointer;" @click="selectAxesHelper">
            <el-icon><Position /></el-icon>
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

      <ElSwitch v-model="lockY" active-text="平视"  size="small"  />
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
          <hr>
          <div class="stat-item">
            <span class="stat-label">模型:</span>
            <span class="stat-value">{{ sceneStats.models }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">3DTiles:</span>
            <span class="stat-value">{{ sceneStats.tileModels }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">灯光:</span>
            <span class="stat-value">{{ sceneStats.lights }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">标签:</span>
            <span class="stat-value">{{ sceneStats.labels }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">自定义材质:</span>
            <span class="stat-value">{{ sceneStats.customMaterials }}</span>
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
