<!--
  ObjectPropertyPanel.vue
  该组件用于展示和编辑选中对象的基本属性，包括名称、类型、变换（位置、旋转、缩放）。
-->

<template>
  <div v-if="hasSelection" class="object-property-panel">
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
  <div v-else class="no-selection">
    <p>请选择一个对象来编辑属性</p>
  </div>
</template>

<script>
/**
 * 该组件用于展示和编辑选中对象的基本属性，包括名称、类型、变换（位置、旋转、缩放）。
 */
import { ref, reactive, computed, watch, inject } from 'vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useTransform } from '../../composables/useTransform.js';
import { radToDeg, degToRad } from '../../utils/mathUtils.js';

export default {
  name: 'ObjectPropertyPanel',
  setup() {
    // Tabs相关逻辑已移除，仅保留对象属性逻辑
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
      hasSelection,
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
.object-property-panel {
  /* 复用原property-panel样式 */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #fff;
  min-height: 0;
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
.no-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}
</style>
