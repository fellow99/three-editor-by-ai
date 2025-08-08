<template>
  <!--
    PropertyPanel.vue
    该组件仅负责Tabs切换和内容分发，“基本”Tab内容已迁移至ObjectPropertyPanel.vue
  -->
  <div class="property-panel">
    <div class="property-content">
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
      <ObjectPropertyPanel v-if="activeTab === '基本'" />
      <MaterialPropertyPanel v-if="activeTab === '材质'" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import ObjectPropertyPanel from './ObjectPropertyPanel.vue';
import MaterialPropertyPanel from './MaterialPropertyPanel.vue';

export default {
  name: 'PropertyPanel',
  components: {
    ObjectPropertyPanel,
    MaterialPropertyPanel
  },
  setup() {
    // 只保留Tabs切换相关逻辑
    const tabs = ['基本', '材质'];
    const activeTab = ref('基本');
    return {
      tabs,
      activeTab
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
.property-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}
</style>
