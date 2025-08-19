<!--
  PrimitiveBrowser.vue
  基础几何体与灯光浏览组件
  用于展示和选择预定义的几何体、灯光等对象
-->
<template>
  <div class="primitives-grid">
    <div class="primitives-section" v-if="basicPrimitives.length">
      <h4 class="section-title">基础几何体</h4>
      <div class="primitives-list">
        <div 
          v-for="primitive in basicPrimitives" 
          :key="primitive.type"
          class="primitive-item"
          @click="onSelect(primitive.type)"
          :title="primitive.description"
        >
          <div class="primitive-preview">
            <span class="primitive-icon">{{ primitive.icon }}</span>
          </div>
          <div class="primitive-info">
            <div class="primitive-name">{{ primitive.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="primitives-section" v-if="extendedPrimitives.length">
      <h4 class="section-title">扩展几何体</h4>
      <div class="primitives-list">
        <div 
          v-for="primitive in extendedPrimitives" 
          :key="primitive.type"
          class="primitive-item"
          @click="onSelect(primitive.type)"
          :title="primitive.description"
        >
          <div class="primitive-preview">
            <span class="primitive-icon">{{ primitive.icon }}</span>
          </div>
          <div class="primitive-info">
            <div class="primitive-name">{{ primitive.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="primitives-section" v-if="lightPrimitives.length">
      <h4 class="section-title">灯光</h4>
      <div class="primitives-list">
        <div 
          v-for="light in lightPrimitives" 
          :key="light.type"
          class="primitive-item"
          @click="onSelect(light.type)"
          :title="light.description"
        >
          <div class="primitive-preview">
            <span class="primitive-icon">{{ light.icon }}</span>
          </div>
          <div class="primitive-info">
            <div class="primitive-name">{{ light.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="primitives-section" v-if="otherPrimitives.length">
      <h4 class="section-title">其他对象</h4>
      <div class="primitives-list">
        <div 
          v-for="other in otherPrimitives" 
          :key="other.type"
          class="primitive-item"
          @click="onSelect(other.type)"
          :title="other.description"
        >
          <div class="primitive-preview">
            <span class="primitive-icon">{{ other.icon }}</span>
          </div>
          <div class="primitive-info">
            <div class="primitive-name">{{ other.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 基础几何体与灯光浏览组件
 * props:
 *   - basicPrimitives: Array
 *   - extendedPrimitives: Array
 *   - lightPrimitives: Array
 *   - otherPrimitives: Array
 * emits:
 *   - select(type: string)
 */
defineProps({
  basicPrimitives: { type: Array, default: () => [] },
  extendedPrimitives: { type: Array, default: () => [] },
  lightPrimitives: { type: Array, default: () => [] },
  otherPrimitives: { type: Array, default: () => [] }
});
const emit = defineEmits(['select']);
function onSelect(type) {
  emit('select', type);
}
</script>

<style scoped>
/* 复用AssetBrowser中的样式 */
.primitives-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px;
  overflow: auto;
}
.primitives-section {
  margin-bottom: 16px;
}
.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid #555;
  padding-bottom: 8px;
}
.primitives-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}
.primitive-item {
  background: #333;
  border: 1px solid #555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}
.primitive-item:hover {
  background: #444;
  border-color: #777;
  transform: translateY(-1px);
}
.primitive-item:active {
  transform: translateY(0);
  background: #007acc;
  border-color: #0088dd;
}
.primitive-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: #2a2a2a;
}
.primitive-icon {
  font-size: 24px;
  line-height: 1;
}
.primitive-info {
  padding: 8px 6px;
  text-align: center;
}
.primitive-name {
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 768px) {
  .primitives-list {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 6px;
  }
  .primitive-preview {
    height: 50px;
  }
  .primitive-icon {
    font-size: 20px;
  }
  .primitive-name {
    font-size: 9px;
  }
  .section-title {
    font-size: 12px;
  }
}
</style>
