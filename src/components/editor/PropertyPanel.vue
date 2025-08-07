<template>
  <div class="property-panel">
    <div v-if="!hasSelection" class="no-selection">
      <p>请选择一个对象来编辑属性</p>
    </div>
    <div v-else class="property-content">
      <!-- Tabs切换 -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab-btn', { active: activeTab === tab }]"
          @click="activeTab = tab"
        >
          <span class="tab-icon" v-if="tab === '基本'">📝</span>
          <span class="tab-icon" v-else-if="tab === '材质'">🎨</span>
          {{ tab }}
        </button>
      </div>
      <!-- “基本”Tab内容 -->
      <div v-if="activeTab === '基本'">
        <!-- 基本信息 -->
        <div class="property-section">
          <h4>基本信息</h4>
          <div class="property-group">
            <label>名称:</label>
            <input 
              v-model="objectName" 
              type="text" 
              @blur="updateObjectName"
              class="property-input"
            >
          </div>
          <div class="property-group">
            <label>类型:</label>
            <span class="property-value">{{ objectType }}</span>
          </div>
        </div>
        <!-- 变换属性 -->
        <div class="property-section">
          <h4>变换</h4>
          <!-- 位置 -->
          <div class="property-group">
            <label>位置:</label>
            <div class="vector-input">
              <input 
                v-model.number="transform.position.x" 
                @input="updateTransform"
                type="number" 
                step="0.1"
                placeholder="X"
              >
              <input 
                v-model.number="transform.position.y" 
                @input="updateTransform"
                type="number" 
                step="0.1"
                placeholder="Y"
              >
              <input 
                v-model.number="transform.position.z" 
                @input="updateTransform"
                type="number" 
                step="0.1"
                placeholder="Z"
              >
            </div>
          </div>
          <!-- 旋转 -->
          <div class="property-group">
            <label>旋转:</label>
            <div class="vector-input">
              <input 
                v-model.number="transform.rotation.x" 
                @input="updateTransform"
                type="number" 
                step="1"
                placeholder="X°"
              >
              <input 
                v-model.number="transform.rotation.y" 
                @input="updateTransform"
                type="number" 
                step="1"
                placeholder="Y°"
              >
              <input 
                v-model.number="transform.rotation.z" 
                @input="updateTransform"
                type="number" 
                step="1"
                placeholder="Z°"
              >
            </div>
          </div>
          <!-- 缩放 -->
          <div class="property-group">
            <label>缩放:</label>
            <div class="vector-input">
              <input 
                v-model.number="transform.scale.x" 
                @input="updateTransform"
                type="number" 
                step="0.1"
                min="0.001"
                placeholder="X"
              >
              <input 
                v-model.number="transform.scale.y" 
                @input="updateTransform"
                type="number" 
                step="0.1"
                min="0.001"
                placeholder="Y"
              >
              <input 
                v-model.number="transform.scale.z" 
                @input="updateTransform"
                type="number" 
                step="0.1"
                min="0.001"
                placeholder="Z"
              >
            </div>
            <button @click="resetScale" class="reset-btn">重置</button>
          </div>
        </div>
      </div>
      <!-- “材质”Tab内容 -->
      <MaterialPropertyPanel v-if="activeTab === '材质'" />
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, inject } from 'vue';
import MaterialPropertyPanel from './MaterialPropertyPanel.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useTransform } from '../../composables/useTransform.js';
import { radToDeg, degToRad } from '../../utils/mathUtils.js';

export default {
  name: 'PropertyPanel',
  components: {
    MaterialPropertyPanel
  },
  setup() {
    const tabs = ['基本', '材质'];
    const activeTab = ref('基本');
    const objectSelection = useObjectSelection();
    const transformManager = useTransform();
    const scene = inject('scene');
    const objectName = ref('');
    const transform = reactive({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });
    const hasSelection = computed(() => objectSelection.hasSelection.value);
    const selectedObject = computed(() => {
      const objects = objectSelection.selectedObjects.value;
      return objects.length === 1 ? objects[0] : null;
    });
    const objectType = computed(() => {
      if (!selectedObject.value) return '';
      return selectedObject.value.userData.type || selectedObject.value.type || 'Object3D';
    });
    watch(selectedObject, (newObject) => {
      if (newObject) {
        objectName.value = newObject.name || '';
        transform.position.x = Number(newObject.position.x.toFixed(3));
        transform.position.y = Number(newObject.position.y.toFixed(3));
        transform.position.z = Number(newObject.position.z.toFixed(3));
        transform.rotation.x = Number(radToDeg(newObject.rotation.x).toFixed(1));
        transform.rotation.y = Number(radToDeg(newObject.rotation.y).toFixed(1));
        transform.rotation.z = Number(radToDeg(newObject.rotation.z).toFixed(1));
        transform.scale.x = Number(newObject.scale.x.toFixed(3));
        transform.scale.y = Number(newObject.scale.y.toFixed(3));
        transform.scale.z = Number(newObject.scale.z.toFixed(3));
      }
    }, { immediate: true });
    function updateObjectName() {
      if (selectedObject.value) {
        selectedObject.value.name = objectName.value;
      }
    }
    function updateTransform() {
      if (!selectedObject.value) return;
      transformManager.setPosition(selectedObject.value, [
        transform.position.x,
        transform.position.y,
        transform.position.z
      ]);
      transformManager.setRotation(selectedObject.value, [
        degToRad(transform.rotation.x),
        degToRad(transform.rotation.y),
        degToRad(transform.rotation.z)
      ]);
      transformManager.setScale(selectedObject.value, [
        transform.scale.x,
        transform.scale.y,
        transform.scale.z
      ]);
    }
    function resetScale() {
      transform.scale.x = 1;
      transform.scale.y = 1;
      transform.scale.z = 1;
      updateTransform();
    }
    return {
      tabs,
      activeTab,
      hasSelection,
      selectedObject,
      objectName,
      objectType,
      transform,
      updateObjectName,
      updateTransform,
      resetScale
    };
  }
};
</script>

<style scoped>
.property-panel {
  width: 300px;
  height: 100%;
  background: #2a2a2a;
  border-left: 1px solid #444;
  display: flex;
  flex-direction: column;
  color: #fff;
  min-height: 0;
}
.tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tab-btn:hover {
  background: #444;
  color: #fff;
}
.tab-btn.active {
  background: #2a2a2a;
  border-bottom-color: #007acc;
  color: #fff;
}
.tab-icon {
  font-size: 15px;
  vertical-align: middle;
  margin-right: 2px;
}
.no-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
.property-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}
.property-section {
  margin-bottom: 24px;
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 48px - 32px);
}
.property-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  border-bottom: 1px solid #444;
  padding-bottom: 4px;
}
.property-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.property-group label {
  font-size: 12px;
  color: #aaa;
}
.property-input {
  padding: 6px 8px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}
.property-input:focus {
  outline: none;
  border-color: #007acc;
}
.property-value {
  padding: 6px 8px;
  background: #333;
  border-radius: 4px;
  font-size: 12px;
  color: #ccc;
}
.vector-input {
  display: flex;
  gap: 4px;
}
.vector-input input {
  width: 33%;
  flex: none;
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
.color-input {
  width: 100%;
  height: 32px;
  padding: 2px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
}
.range-input {
  flex: 1;
  margin-right: 8px;
}
.range-value {
  font-size: 12px;
  color: #ccc;
  min-width: 40px;
}
.property-group:has(.range-input) {
  flex-direction: row;
  align-items: center;
}
.reset-btn {
  padding: 4px 12px;
  background: #555;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  margin-top: 4px;
}
.reset-btn:hover {
  background: #666;
}
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.action-btn {
  padding: 8px 12px;
  background: #007acc;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}
.action-btn:hover {
  background: #0088dd;
}
.action-btn.danger {
  background: #d73a49;
}
.action-btn.danger:hover {
  background: #e85662;
}
</style>
