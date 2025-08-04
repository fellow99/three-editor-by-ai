<template>
  <div class="object-gizmo">
    <!-- 变换模式切换 -->
    <div class="gizmo-controls">
      <button 
        @click="setMode('translate')"
        :class="['mode-btn', { active: mode === 'translate' }]"
        title="移动模式 (G)"
      >
        <span class="icon">↔️</span>
      </button>
      <button 
        @click="setMode('rotate')"
        :class="['mode-btn', { active: mode === 'rotate' }]"
        title="旋转模式 (R)"
      >
        <span class="icon">🔄</span>
      </button>
      <button 
        @click="setMode('scale')"
        :class="['mode-btn', { active: mode === 'scale' }]"
        title="缩放模式 (S)"
      >
        <span class="icon">📏</span>
      </button>
    </div>

    <!-- 坐标轴限制 -->
    <div class="axis-controls">
      <span class="axis-label">约束轴:</span>
      <button 
        @click="toggleAxisConstraint('x')"
        :class="['axis-btn', 'x-axis', { active: axisConstraints.x }]"
      >
        X
      </button>
      <button 
        @click="toggleAxisConstraint('y')"
        :class="['axis-btn', 'y-axis', { active: axisConstraints.y }]"
      >
        Y
      </button>
      <button 
        @click="toggleAxisConstraint('z')"
        :class="['axis-btn', 'z-axis', { active: axisConstraints.z }]"
      >
        Z
      </button>
      <button 
        @click="clearAxisConstraints"
        class="axis-btn clear-btn"
        title="清除约束"
      >
        全部
      </button>
    </div>

    <!-- 精确输入 -->
    <div v-if="hasSelection" class="precise-input">
      <h4>精确变换</h4>
      
      <!-- 位置输入 -->
      <div v-if="mode === 'translate'" class="input-group">
        <label>相对移动:</label>
        <div class="vector-input">
          <input 
            v-model.number="deltaTransform.x" 
            type="number" 
            step="0.1"
            placeholder="X"
            @keyup.enter="applyDeltaTransform"
          >
          <input 
            v-model.number="deltaTransform.y" 
            type="number" 
            step="0.1"
            placeholder="Y"
            @keyup.enter="applyDeltaTransform"
          >
          <input 
            v-model.number="deltaTransform.z" 
            type="number" 
            step="0.1"
            placeholder="Z"
            @keyup.enter="applyDeltaTransform"
          >
        </div>
        <button @click="applyDeltaTransform" class="apply-btn">应用</button>
      </div>

      <!-- 旋转输入 -->
      <div v-if="mode === 'rotate'" class="input-group">
        <label>相对旋转 (度):</label>
        <div class="vector-input">
          <input 
            v-model.number="deltaTransform.x" 
            type="number" 
            step="1"
            placeholder="X°"
            @keyup.enter="applyDeltaTransform"
          >
          <input 
            v-model.number="deltaTransform.y" 
            type="number" 
            step="1"
            placeholder="Y°"
            @keyup.enter="applyDeltaTransform"
          >
          <input 
            v-model.number="deltaTransform.z" 
            type="number" 
            step="1"
            placeholder="Z°"
            @keyup.enter="applyDeltaTransform"
          >
        </div>
        <button @click="applyDeltaTransform" class="apply-btn">应用</button>
      </div>

      <!-- 缩放输入 -->
      <div v-if="mode === 'scale'" class="input-group">
        <label>相对缩放:</label>
        <div class="scale-input">
          <label class="uniform-scale">
            <input v-model="uniformScale" type="checkbox">
            <span>统一缩放</span>
          </label>
          <div v-if="uniformScale" class="single-input">
            <input 
              v-model.number="deltaTransform.uniform" 
              type="number" 
              step="0.1"
              placeholder="倍数"
              @keyup.enter="applyDeltaTransform"
            >
          </div>
          <div v-else class="vector-input">
            <input 
              v-model.number="deltaTransform.x" 
              type="number" 
              step="0.1"
              placeholder="X"
              @keyup.enter="applyDeltaTransform"
            >
            <input 
              v-model.number="deltaTransform.y" 
              type="number" 
              step="0.1"
              placeholder="Y"
              @keyup.enter="applyDeltaTransform"
            >
            <input 
              v-model.number="deltaTransform.z" 
              type="number" 
              step="0.1"
              placeholder="Z"
              @keyup.enter="applyDeltaTransform"
            >
          </div>
        </div>
        <button @click="applyDeltaTransform" class="apply-btn">应用</button>
      </div>
    </div>

    <!-- 吸附设置 -->
    <div class="snap-settings">
      <h4>吸附设置</h4>
      
      <label class="snap-option">
        <input v-model="snapSettings.grid" type="checkbox">
        <span>网格吸附</span>
        <input 
          v-if="snapSettings.grid"
          v-model.number="snapSettings.gridSize" 
          type="number" 
          step="0.1"
          min="0.1"
          class="snap-value"
        >
      </label>
      
      <label class="snap-option">
        <input v-model="snapSettings.angle" type="checkbox">
        <span>角度吸附</span>
        <input 
          v-if="snapSettings.angle"
          v-model.number="snapSettings.angleStep" 
          type="number" 
          step="1"
          min="1"
          max="180"
          class="snap-value"
        >
        <span v-if="snapSettings.angle">°</span>
      </label>
      
      <label class="snap-option">
        <input v-model="snapSettings.vertex" type="checkbox">
        <span>顶点吸附</span>
      </label>
      
      <label class="snap-option">
        <input v-model="snapSettings.edge" type="checkbox">
        <span>边缘吸附</span>
      </label>
    </div>

    <!-- 变换历史 -->
    <div class="transform-history">
      <h4>操作历史</h4>
      <div class="history-controls">
        <button 
          @click="undo"
          :disabled="!canUndo"
          class="history-btn"
          title="撤销 (Ctrl+Z)"
        >
          <span class="icon">↶</span>
          撤销
        </button>
        <button 
          @click="redo"
          :disabled="!canRedo"
          class="history-btn"
          title="重做 (Ctrl+Y)"
        >
          <span class="icon">↷</span>
          重做
        </button>
      </div>
      
      <div class="history-list">
        <div 
          v-for="(item, index) in recentHistory" 
          :key="index"
          class="history-item"
        >
          <span class="history-action">{{ item.action }}</span>
          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { useTransform } from '../../composables/useTransform.js';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { degToRad } from '../../utils/mathUtils.js';

export default {
  name: 'ObjectGizmo',
  setup() {
    const transform = useTransform();
    const objectSelection = useObjectSelection();
    
    // 本地状态
    const mode = ref('translate');
    const uniformScale = ref(true);
    const axisConstraints = reactive({ x: false, y: false, z: false });
    const deltaTransform = reactive({ x: 0, y: 0, z: 0, uniform: 1 });
    const snapSettings = reactive({
      grid: false,
      gridSize: 1,
      angle: false,
      angleStep: 15,
      vertex: false,
      edge: false
    });
    
    // 计算属性
    const hasSelection = computed(() => objectSelection.hasSelection.value);
    const canUndo = computed(() => transform.transformHistory.undoStack.length > 0);
    const canRedo = computed(() => transform.transformHistory.redoStack.length > 0);
    const recentHistory = computed(() => 
      transform.transformHistory.undoStack.slice(-5).reverse()
    );
    
    // 监听变换模式变化
    watch(() => transform.transformMode.value, (newMode) => {
      mode.value = newMode;
    });
    
    // 监听吸附设置变化
    watch(snapSettings, (settings) => {
      transform.transformConfig.snapToGrid = settings.grid;
      transform.transformConfig.gridSize = settings.gridSize;
      transform.transformConfig.snapToAngle = settings.angle;
      transform.transformConfig.angleStep = settings.angleStep;
      transform.transformConfig.snapToVertex = settings.vertex;
      transform.transformConfig.snapToEdge = settings.edge;
    }, { deep: true });
    
    // 方法
    function setMode(newMode) {
      mode.value = newMode;
      transform.transformMode.value = newMode;
      clearDeltaTransform();
    }
    
    function toggleAxisConstraint(axis) {
      // 如果已经激活了这个轴，则取消；否则设置为唯一激活的轴
      if (axisConstraints[axis]) {
        axisConstraints[axis] = false;
      } else {
        // 清除其他轴约束
        Object.keys(axisConstraints).forEach(key => {
          axisConstraints[key] = key === axis;
        });
      }
      
      // 更新变换配置
      transform.transformConfig.axisConstraint = getActiveAxis();
    }
    
    function clearAxisConstraints() {
      Object.keys(axisConstraints).forEach(key => {
        axisConstraints[key] = false;
      });
      transform.transformConfig.axisConstraint = null;
    }
    
    function getActiveAxis() {
      const activeAxes = Object.keys(axisConstraints).filter(axis => axisConstraints[axis]);
      return activeAxes.length === 1 ? activeAxes[0] : null;
    }
    
    function applyDeltaTransform() {
      const selectedObjects = objectSelection.selectedObjects.value;
      if (selectedObjects.length === 0) return;
      
      const activeAxis = getActiveAxis();
      
      selectedObjects.forEach(object => {
        switch (mode.value) {
          case 'translate':
            applyTranslation(object, activeAxis);
            break;
          case 'rotate':
            applyRotation(object, activeAxis);
            break;
          case 'scale':
            applyScaling(object, activeAxis);
            break;
        }
      });
      
      // 清除输入值
      clearDeltaTransform();
      
      // 记录到历史
      transform.addToHistory({
        action: getActionName(),
        objects: selectedObjects.map(obj => obj.userData.id),
        timestamp: Date.now()
      });
    }
    
    function applyTranslation(object, activeAxis) {
      const delta = { ...deltaTransform };
      
      if (activeAxis) {
        // 只应用指定轴的变换
        Object.keys(delta).forEach(axis => {
          if (axis !== activeAxis) delta[axis] = 0;
        });
      }
      
      transform.translate(object, [delta.x, delta.y, delta.z]);
    }
    
    function applyRotation(object, activeAxis) {
      const delta = { ...deltaTransform };
      
      // 转换为弧度
      Object.keys(delta).forEach(axis => {
        delta[axis] = degToRad(delta[axis]);
      });
      
      if (activeAxis) {
        // 只应用指定轴的旋转
        Object.keys(delta).forEach(axis => {
          if (axis !== activeAxis) delta[axis] = 0;
        });
      }
      
      transform.rotate(object, [delta.x, delta.y, delta.z]);
    }
    
    function applyScaling(object, activeAxis) {
      let scaleVector;
      
      if (uniformScale.value) {
        const scale = deltaTransform.uniform;
        scaleVector = [scale, scale, scale];
      } else {
        const delta = { ...deltaTransform };
        
        if (activeAxis) {
          // 只应用指定轴的缩放
          Object.keys(delta).forEach(axis => {
            if (axis !== activeAxis) delta[axis] = 1;
          });
        }
        
        scaleVector = [delta.x, delta.y, delta.z];
      }
      
      transform.scale(object, scaleVector);
    }
    
    function clearDeltaTransform() {
      deltaTransform.x = 0;
      deltaTransform.y = 0;
      deltaTransform.z = 0;
      deltaTransform.uniform = 1;
    }
    
    function getActionName() {
      const modeNames = {
        translate: '移动',
        rotate: '旋转',
        scale: '缩放'
      };
      
      const activeAxis = getActiveAxis();
      const axisName = activeAxis ? ` (${activeAxis.toUpperCase()}轴)` : '';
      
      return `${modeNames[mode.value]}${axisName}`;
    }
    
    function undo() {
      transform.undo();
    }
    
    function redo() {
      transform.redo();
    }
    
    function formatTime(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;
      
      if (diff < 60000) {
        return '刚刚';
      } else if (diff < 3600000) {
        return `${Math.floor(diff / 60000)}分钟前`;
      } else {
        return `${Math.floor(diff / 3600000)}小时前`;
      }
    }
    
    return {
      // 状态
      mode,
      uniformScale,
      axisConstraints,
      deltaTransform,
      snapSettings,
      hasSelection,
      canUndo,
      canRedo,
      recentHistory,
      
      // 方法
      setMode,
      toggleAxisConstraint,
      clearAxisConstraints,
      applyDeltaTransform,
      undo,
      redo,
      formatTime
    };
  }
};
</script>

<style scoped>
.object-gizmo {
  width: 280px;
  height: 100%;
  background: #2a2a2a;
  border-left: 1px solid #444;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow-y: auto;
}

.gizmo-controls {
  padding: 16px;
  border-bottom: 1px solid #444;
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px 12px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #444;
  border-color: #666;
}

.mode-btn.active {
  background: #007acc;
  border-color: #0088dd;
}

.axis-controls {
  padding: 12px 16px;
  border-bottom: 1px solid #444;
}

.axis-label {
  display: block;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
}

.axis-controls .axis-btn {
  padding: 6px 12px;
  margin-right: 8px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s;
}

.axis-btn:hover {
  background: #444;
}

.axis-btn.active {
  background: #555;
  border-color: #777;
}

.x-axis.active {
  background: #d73a49;
  border-color: #e85662;
}

.y-axis.active {
  background: #28a745;
  border-color: #34ce57;
}

.z-axis.active {
  background: #007bff;
  border-color: #0088ff;
}

.clear-btn {
  background: #666 !important;
}

.clear-btn:hover {
  background: #777 !important;
}

.precise-input {
  padding: 16px;
  border-bottom: 1px solid #444;
}

.precise-input h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #ccc;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 6px;
}

.vector-input {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.vector-input input {
  flex: 1;
  padding: 6px 8px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.vector-input input:focus {
  outline: none;
  border-color: #007acc;
}

.scale-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uniform-scale {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
}

.single-input {
  display: flex;
}

.single-input input {
  flex: 1;
  padding: 6px 8px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.apply-btn {
  width: 100%;
  padding: 8px 12px;
  background: #007acc;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

.apply-btn:hover {
  background: #0088dd;
}

.snap-settings {
  padding: 16px;
  border-bottom: 1px solid #444;
}

.snap-settings h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #ccc;
}

.snap-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  cursor: pointer;
}

.snap-option input[type="checkbox"] {
  margin: 0;
}

.snap-value {
  padding: 2px 6px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  width: 60px;
}

.transform-history {
  padding: 16px;
  flex: 1;
}

.transform-history h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #ccc;
}

.history-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.history-btn {
  flex: 1;
  padding: 6px 8px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.history-btn:hover:not(:disabled) {
  background: #444;
}

.history-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #333;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 11px;
}

.history-action {
  color: #fff;
}

.history-time {
  color: #aaa;
}
</style>
