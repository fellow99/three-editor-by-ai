<template>
  <div class="camera-controls">
    <div class="camera-header">
      <h4>相机控制</h4>
      <button @click="resetCamera" class="reset-btn" title="重置相机">
        <span class="icon">🔄</span>
      </button>
    </div>

    <!-- 相机信息 -->
    <div class="camera-info">
      <div class="info-item">
        <span class="info-label">位置:</span>
        <span class="info-value">
          ({{ cameraPosition.x.toFixed(2) }}, 
           {{ cameraPosition.y.toFixed(2) }}, 
           {{ cameraPosition.z.toFixed(2) }})
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">目标:</span>
        <span class="info-value">
          ({{ cameraTarget.x.toFixed(2) }}, 
           {{ cameraTarget.y.toFixed(2) }}, 
           {{ cameraTarget.z.toFixed(2) }})
        </span>
      </div>
      <div class="info-item">
        <span class="info-label">距离:</span>
        <span class="info-value">{{ cameraDistance.toFixed(2) }}</span>
      </div>
    </div>

    <!-- 相机设置 -->
    <div class="camera-settings">
      <div class="setting-group">
        <label>视野 (FOV):</label>
        <div class="setting-control">
          <input 
            v-model.number="cameraConfig.fov" 
            @input="updateCameraSettings"
            type="range" 
            min="10" 
            max="120" 
            step="1"
            class="range-input"
          >
          <span class="range-value">{{ cameraConfig.fov }}°</span>
        </div>
      </div>

      <div class="setting-group">
        <label>近裁剪面:</label>
        <div class="setting-control">
          <input 
            v-model.number="cameraConfig.near" 
            @input="updateCameraSettings"
            type="number" 
            step="0.01"
            min="0.01"
            max="10"
            class="number-input"
          >
        </div>
      </div>

      <div class="setting-group">
        <label>远裁剪面:</label>
        <div class="setting-control">
          <input 
            v-model.number="cameraConfig.far" 
            @input="updateCameraSettings"
            type="number" 
            step="100"
            min="100"
            max="10000"
            class="number-input"
          >
        </div>
      </div>
    </div>

    <!-- 相机模式 -->
    <div class="camera-modes">
      <h5>相机模式</h5>
      <div class="mode-buttons">
        <button 
          @click="setCameraMode('perspective')"
          :class="['mode-btn', { active: cameraMode === 'perspective' }]"
        >
          透视
        </button>
        <button 
          @click="setCameraMode('orthographic')"
          :class="['mode-btn', { active: cameraMode === 'orthographic' }]"
        >
          正交
        </button>
      </div>
    </div>

    <!-- 控制设置 -->
    <div class="control-settings">
      <h5>控制设置</h5>
      
      <div class="setting-group">
        <label>旋转速度:</label>
        <div class="setting-control">
          <input 
            v-model.number="controlConfig.rotateSpeed" 
            @input="updateControlSettings"
            type="range" 
            min="0.1" 
            max="2" 
            step="0.1"
            class="range-input"
          >
          <span class="range-value">{{ controlConfig.rotateSpeed.toFixed(1) }}</span>
        </div>
      </div>

      <div class="setting-group">
        <label>缩放速度:</label>
        <div class="setting-control">
          <input 
            v-model.number="controlConfig.zoomSpeed" 
            @input="updateControlSettings"
            type="range" 
            min="0.1" 
            max="2" 
            step="0.1"
            class="range-input"
          >
          <span class="range-value">{{ controlConfig.zoomSpeed.toFixed(1) }}</span>
        </div>
      </div>

      <div class="setting-group">
        <label>平移速度:</label>
        <div class="setting-control">
          <input 
            v-model.number="controlConfig.panSpeed" 
            @input="updateControlSettings"
            type="range" 
            min="0.1" 
            max="2" 
            step="0.1"
            class="range-input"
          >
          <span class="range-value">{{ controlConfig.panSpeed.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <!-- 预设视角 -->
    <div class="camera-presets">
      <h5>预设视角</h5>
      <div class="preset-grid">
        <button 
          @click="setPresetView('front')"
          class="preset-btn"
          title="前视图"
        >
          前视
        </button>
        <button 
          @click="setPresetView('back')"
          class="preset-btn"
          title="后视图"
        >
          后视
        </button>
        <button 
          @click="setPresetView('left')"
          class="preset-btn"
          title="左视图"
        >
          左视
        </button>
        <button 
          @click="setPresetView('right')"
          class="preset-btn"
          title="右视图"
        >
          右视
        </button>
        <button 
          @click="setPresetView('top')"
          class="preset-btn"
          title="顶视图"
        >
          顶视
        </button>
        <button 
          @click="setPresetView('bottom')"
          class="preset-btn"
          title="底视图"
        >
          底视
        </button>
        <button 
          @click="setPresetView('iso')"
          class="preset-btn"
          title="等轴测视图"
        >
          等轴测
        </button>
      </div>
    </div>

    <!-- 动画设置 -->
    <div class="animation-settings">
      <h5>动画设置</h5>
      
      <label class="checkbox-label">
        <input 
          v-model="animationConfig.enableDamping" 
          @change="updateAnimationSettings"
          type="checkbox"
        >
        <span>启用阻尼</span>
      </label>
      
      <div v-if="animationConfig.enableDamping" class="setting-group">
        <label>阻尼系数:</label>
        <div class="setting-control">
          <input 
            v-model.number="animationConfig.dampingFactor" 
            @input="updateAnimationSettings"
            type="range" 
            min="0.01" 
            max="0.3" 
            step="0.01"
            class="range-input"
          >
          <span class="range-value">{{ animationConfig.dampingFactor.toFixed(2) }}</span>
        </div>
      </div>

      <label class="checkbox-label">
        <input 
          v-model="animationConfig.autoRotate" 
          @change="updateAnimationSettings"
          type="checkbox"
        >
        <span>自动旋转</span>
      </label>
      
      <div v-if="animationConfig.autoRotate" class="setting-group">
        <label>旋转速度:</label>
        <div class="setting-control">
          <input 
            v-model.number="animationConfig.autoRotateSpeed" 
            @input="updateAnimationSettings"
            type="range" 
            min="0.1" 
            max="5" 
            step="0.1"
            class="range-input"
          >
          <span class="range-value">{{ animationConfig.autoRotateSpeed.toFixed(1) }}</span>
        </div>
      </div>
    </div>

    <!-- 保存/加载设置 -->
    <div class="camera-presets-save">
      <h5>保存设置</h5>
      <div class="save-controls">
        <button @click="saveCurrentView" class="save-btn">
          <span class="icon">💾</span>
          保存当前视角
        </button>
        <button @click="loadSavedViews" class="load-btn">
          <span class="icon">📂</span>
          加载保存的视角
        </button>
      </div>
      
      <div v-if="savedViews.length > 0" class="saved-views-list">
        <div 
          v-for="(view, index) in savedViews" 
          :key="index"
          class="saved-view-item"
        >
          <span class="view-name">{{ view.name }}</span>
          <div class="view-actions">
            <button @click="applySavedView(view)" class="apply-view-btn">
              应用
            </button>
            <button @click="deleteSavedView(index)" class="delete-view-btn">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useScene } from '../../composables/useScene.js';

export default {
  name: 'Camera',
  /**
   * 相机控制面板组件
   * 提供相机参数调整、模式切换、预设视角等功能
   */
  setup() {
    const scene = useScene();
    
    // 响应式状态
    const cameraMode = ref('perspective');
    const cameraConfig = reactive({
      fov: 75,
      near: 0.1,
      far: 1000
    });
    const controlConfig = reactive({
      rotateSpeed: 1.0,
      zoomSpeed: 1.0,
      panSpeed: 1.0
    });
    const animationConfig = reactive({
      enableDamping: true,
      dampingFactor: 0.05,
      autoRotate: false,
      autoRotateSpeed: 2.0
    });
    const savedViews = ref([]);
    
    // 计算属性
    const cameraPosition = computed(() => {
      if (scene.sceneManager?.camera) {
        return scene.sceneManager.camera.position;
      }
      return { x: 0, y: 0, z: 0 };
    });
    
    const cameraTarget = computed(() => {
      if (scene.sceneManager?.controls?.target) {
        return scene.sceneManager.controls.target;
      }
      return { x: 0, y: 0, z: 0 };
    });
    
    const cameraDistance = computed(() => {
      if (scene.sceneManager?.camera && scene.sceneManager?.controls?.target) {
        const camera = scene.sceneManager.camera;
        const target = scene.sceneManager.controls.target;
        return camera.position.distanceTo(target);
      }
      return 0;
    });
    
    // 方法
    /**
     * 更新相机参数（FOV、近远裁剪面等）
     */
    function updateCameraSettings() {
      scene.updateCameraConfig(cameraConfig);
    }
    
    /**
     * 更新控制器参数（旋转、缩放、平移速度）
     */
    function updateControlSettings() {
      if (scene.sceneManager?.updateControlsConfig) {
        scene.sceneManager.updateControlsConfig({
          rotateSpeed: controlConfig.rotateSpeed,
          zoomSpeed: controlConfig.zoomSpeed,
          panSpeed: controlConfig.panSpeed
        });
      }
    }
    
    /**
     * 更新动画相关参数（阻尼、自动旋转等）
     */
    function updateAnimationSettings() {
      if (scene.sceneManager?.updateControlsConfig) {
        scene.sceneManager.updateControlsConfig({
          enableDamping: animationConfig.enableDamping,
          dampingFactor: animationConfig.dampingFactor,
          autoRotate: animationConfig.autoRotate,
          autoRotateSpeed: animationConfig.autoRotateSpeed
        });
      }
    }
    
    /**
     * 切换相机模式（透视/正交）
     * @param {string} mode 模式
     */
    function setCameraMode(mode) {
      cameraMode.value = mode;
      // TODO: 实现相机模式切换
      console.log('切换相机模式:', mode);
    }
    
    /**
     * 设置预设视角
     * @param {string} preset 视角类型
     */
    function setPresetView(preset) {
      const distance = 10;
      let position;
      let target = { x: 0, y: 0, z: 0 };
      
      switch (preset) {
        case 'front':
          position = { x: 0, y: 0, z: distance };
          break;
        case 'back':
          position = { x: 0, y: 0, z: -distance };
          break;
        case 'left':
          position = { x: -distance, y: 0, z: 0 };
          break;
        case 'right':
          position = { x: distance, y: 0, z: 0 };
          break;
        case 'top':
          position = { x: 0, y: distance, z: 0 };
          break;
        case 'bottom':
          position = { x: 0, y: -distance, z: 0 };
          break;
        case 'iso':
          position = { x: distance * 0.7, y: distance * 0.7, z: distance * 0.7 };
          break;
        default:
          return;
      }
      
      scene.updateCameraConfig({ position, target });
    }
    
    /**
     * 重置相机到默认参数
     */
    function resetCamera() {
      scene.updateCameraConfig({
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75,
        near: 0.1,
        far: 1000
      });
      
      // 重置本地配置
      cameraConfig.fov = 75;
      cameraConfig.near = 0.1;
      cameraConfig.far = 1000;
      
      controlConfig.rotateSpeed = 1.0;
      controlConfig.zoomSpeed = 1.0;
      controlConfig.panSpeed = 1.0;
      
      animationConfig.enableDamping = true;
      animationConfig.dampingFactor = 0.05;
      animationConfig.autoRotate = false;
      animationConfig.autoRotateSpeed = 2.0;
      
      updateControlSettings();
      updateAnimationSettings();
    }
    
    /**
     * 保存当前视角到本地
     */
    function saveCurrentView() {
      const name = prompt('请输入视角名称:');
      if (!name) return;
      
      const view = {
        name: name.trim(),
        position: { ...cameraPosition.value },
        target: { ...cameraTarget.value },
        fov: cameraConfig.fov,
        mode: cameraMode.value,
        timestamp: Date.now()
      };
      
      savedViews.value.push(view);
      saveSavedViewsToStorage();
    }
    
    /**
     * 应用已保存的视角
     * @param {Object} view 视角对象
     */
    function applySavedView(view) {
      scene.updateCameraConfig({
        position: view.position,
        target: view.target,
        fov: view.fov
      });
      
      cameraConfig.fov = view.fov;
      cameraMode.value = view.mode;
    }
    
    /**
     * 删除已保存的视角
     * @param {number} index 视角索引
     */
    function deleteSavedView(index) {
      if (confirm('确定要删除这个保存的视角吗？')) {
        savedViews.value.splice(index, 1);
        saveSavedViewsToStorage();
      }
    }
    
    /**
     * 加载本地保存的视角列表
     */
    function loadSavedViews() {
      const saved = localStorage.getItem('tres-editor-saved-views');
      if (saved) {
        try {
          savedViews.value = JSON.parse(saved);
        } catch (error) {
          console.error('加载保存的视角失败:', error);
        }
      }
    }
    
    /**
     * 保存视角列表到本地存储
     */
    function saveSavedViewsToStorage() {
      localStorage.setItem('tres-editor-saved-views', JSON.stringify(savedViews.value));
    }
    
    // 生命周期
    onMounted(() => {
      loadSavedViews();
      
      // 同步相机设置
      if (scene.sceneManager?.camera) {
        cameraConfig.fov = scene.sceneManager.camera.fov;
        cameraConfig.near = scene.sceneManager.camera.near;
        cameraConfig.far = scene.sceneManager.camera.far;
      }
    });
    
    return {
      // 状态
      cameraMode,
      cameraConfig,
      controlConfig,
      animationConfig,
      savedViews,
      cameraPosition,
      cameraTarget,
      cameraDistance,
      
      // 方法
      updateCameraSettings,
      updateControlSettings,
      updateAnimationSettings,
      setCameraMode,
      setPresetView,
      resetCamera,
      saveCurrentView,
      applySavedView,
      deleteSavedView,
      loadSavedViews
    };
  }
};
</script>

<style scoped>
.camera-controls {
  width: 250px;
  height: 100%;
  background: #2a2a2a;
  border-left: 1px solid #444;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow-y: auto;
}

.camera-header {
  padding: 16px;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.camera-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.reset-btn {
  padding: 6px 8px;
  background: #555;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

.reset-btn:hover {
  background: #666;
}

.camera-info {
  padding: 12px 16px;
  border-bottom: 1px solid #444;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 11px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #aaa;
}

.info-value {
  color: #fff;
  font-family: monospace;
}

.camera-settings,
.control-settings,
.animation-settings {
  padding: 16px;
  border-bottom: 1px solid #444;
}

.camera-settings h5,
.control-settings h5,
.animation-settings h5,
.camera-modes h5,
.camera-presets h5,
.camera-presets-save h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #ccc;
}

.setting-group {
  margin-bottom: 12px;
}

.setting-group label {
  display: block;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
}

.range-value {
  font-size: 11px;
  color: #ccc;
  min-width: 40px;
  text-align: right;
  font-family: monospace;
}

.number-input {
  width: 100%;
  padding: 4px 8px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.number-input:focus {
  outline: none;
  border-color: #007acc;
}

.camera-modes {
  padding: 16px;
  border-bottom: 1px solid #444;
}

.mode-buttons {
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
  font-size: 12px;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #444;
}

.mode-btn.active {
  background: #007acc;
  border-color: #0088dd;
}

.camera-presets {
  padding: 16px;
  border-bottom: 1px solid #444;
}

.preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.preset-btn {
  padding: 8px 6px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #444;
  border-color: #666;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  cursor: pointer;
}

.checkbox-label input {
  margin: 0;
}

.camera-presets-save {
  padding: 16px;
}

.save-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.save-btn,
.load-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #007acc;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
}

.save-btn:hover,
.load-btn:hover {
  background: #0088dd;
}

.saved-views-list {
  max-height: 200px;
  overflow-y: auto;
}

.saved-view-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #333;
  border-radius: 4px;
  margin-bottom: 6px;
}

.view-name {
  font-size: 11px;
  color: #fff;
  flex: 1;
}

.view-actions {
  display: flex;
  gap: 4px;
}

.apply-view-btn,
.delete-view-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
}

.apply-view-btn {
  background: #28a745;
  color: #fff;
}

.apply-view-btn:hover {
  background: #34ce57;
}

.delete-view-btn {
  background: #dc3545;
  color: #fff;
}

.delete-view-btn:hover {
  background: #e85662;
}
</style>
