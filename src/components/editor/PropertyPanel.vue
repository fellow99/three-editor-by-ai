<!--
  属性面板组件
  功能：根据对象选择状态，动态切换属性面板Tab。
  - 未选对象时，仅显示“场景属性”Tab（ScenePropertyPanel）
  - 选中对象时，显示“对象属性”“材质属性”两个Tab
-->
<template>
  <div class="property-panel">
    <div class="property-content">
      <div class="tabs">
        <!-- 未选对象时，仅显示“场景属性”Tab -->
        <template v-if="!hasSelection">
          <button
            class="tab-btn"
            :class="{ active: activeTab === '场景' }"
            @click="activeTab = '场景'"
          >
            <span class="tab-icon">🌐</span>
            场景
          </button>
        </template>
        <!-- 选中对象时，显示“对象属性”“材质属性”Tab -->
        <template v-else>
          <button
            class="tab-btn"
            :class="{ active: activeTab === '对象' }"
            @click="activeTab = '对象'"
          >
            <span class="tab-icon">📝</span>
            对象属性
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === '材质' }"
            @click="activeTab = '材质'"
          >
            <span class="tab-icon">🎨</span>
            材质属性
          </button>
        </template>
      </div>
      <!-- Tab内容区域 -->
      <ScenePropertyPanel v-show="!hasSelection && activeTab === '场景'" />
      <ObjectPropertyPanel v-if="hasSelection && activeTab === '对象'" />
      <MaterialPropertyPanel v-if="hasSelection && activeTab === '材质'" />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import ScenePropertyPanel from './ScenePropertyPanel.vue';
import ObjectPropertyPanel from './ObjectPropertyPanel.vue';
import MaterialPropertyPanel from './MaterialPropertyPanel.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';

export default {
  name: 'PropertyPanel',
  components: {
    ScenePropertyPanel,
    ObjectPropertyPanel,
    MaterialPropertyPanel
  },
  setup() {
    /**
     * 属性面板Tab切换逻辑
     * - activeTab: 当前激活的Tab
     * - hasSelection: 是否有选中对象
     */
    // 当前激活的Tab
    const activeTab = ref('场景'); // 默认显示场景属性
    // 获取对象选择状态
    const { hasSelection } = useObjectSelection(); // 是否有选中对象

    // 当选择状态变化时，自动切换Tab
    // 必须加注释说明用途
    // 选中对象时，切换到“对象属性”Tab；未选对象时，切换到“场景”Tab
    watch(hasSelection, (val) => {
      if (val) {
        activeTab.value = '对象';
      } else {
        activeTab.value = '场景';
      }
    });

    return {
      activeTab,
      hasSelection
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
