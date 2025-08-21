<!--
  基础几何体与灯光浏览组件
  用于展示和选择预定义的几何体、灯光等对象
  直接从PRIMITIVES.json读取并分组渲染
-->
<template>
  <div class="primitives-grid">
    <template v-for="(group, idx) in groupedPrimitives" :key="group.category">
      <div
        class="primitives-section"
        v-if="group.items && group.items.length"
      >
        <h4 class="section-title">{{ group.category }}</h4>
        <div class="primitives-list">
          <div
            v-for="primitive in group.items"
            :key="primitive.type"
            class="primitive-item"
            :title="primitive.description"
            draggable="true"
            @dragstart="onDragStart(primitive)"
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
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
// @ts-ignore
import PRIMITIVES from '../../constants/PRIMITIVES.json';

/**
 * 拖拽开始事件，设置拖拽数据
 * @param {Object} primitive 拖拽的几何体/灯光对象
 */
function onDragStart(primitive) {
  // 拖拽类型统一为primitive，便于SceneViewer区分
  event.dataTransfer.setData('application/x-primitive', JSON.stringify({
    type: primitive.type
  }));
  // 可选：设置拖拽效果
  event.dataTransfer.effectAllowed = 'copy';
}

// 按category分组
const groupedPrimitives = computed(() => {
  const groups = {};
  for (const item of PRIMITIVES) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }
  // 保证顺序：基础几何体、扩展几何体、灯光、其他对象
  const order = ['基础几何体', '扩展几何体', '灯光', '其他对象'];
  // 保证每个group结构完整且items为数组
  return order
    .map(category => {
      const items = Array.isArray(groups[category]) ? groups[category] : [];
      return { category, items };
    })
    .filter(group => Array.isArray(group.items) && group.items.length > 0);
});
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
