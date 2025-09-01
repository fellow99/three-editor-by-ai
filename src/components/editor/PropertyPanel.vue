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
<!-- 未选对象时，显示“属性”“光影”“环境”“后处理”“场景”Tab -->
<template v-if="!hasSelection">
  <button
    class="tab-btn"
    :class="{ active: activeTab === '场景' }"
    @click="activeTab = '场景'"
  >
    场景
  </button>
  <button
    class="tab-btn"
    :class="{ active: activeTab === '光影' }"
    @click="activeTab = '光影'"
  >
    光影
  </button>
  <button
    class="tab-btn"
    :class="{ active: activeTab === '环境' }"
    @click="activeTab = '环境'"
  >
    环境
  </button>
  <button
    class="tab-btn"
    :class="{ active: activeTab === '后处理' }"
    @click="activeTab = '后处理'"
  >
    后处理
  </button>
</template>
        <!-- 选中对象时，显示“对象属性”“材质属性”Tab -->
        <template v-else>
          <button
            class="tab-btn"
            :class="{ active: activeTab === '对象' }"
            @click="activeTab = '对象'"
          >
            对象
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === '属性' }"
            @click="activeTab = '属性'"
          >
            属性
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === '材质' }"
            @click="activeTab = '材质'"
          >
            材质
          </button>
        </template>
      </div>
      <!-- Tab内容区域 -->
      <ScenePropertyPane v-show="activeTab === '场景'" />
      <div v-show="activeTab === '光影'" style="padding: 24px; color: #888;">光影内容占位</div>
      <div v-show="activeTab === '环境'" style="padding: 24px; color: #888;">环境内容占位</div>
      <div v-show="activeTab === '后处理'" style="padding: 24px; color: #888;">后处理内容占位</div>
      <BasePropertyPane v-if="activeTab === '对象'" />
<div v-if="activeTab === '属性'">
  <PrimitivePropertyPaneBox v-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'BoxGeometry'" />
  <PrimitivePropertyPaneSphere v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'SphereGeometry'" />
  <PrimitivePropertyPaneCylinder v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'CylinderGeometry'" />
  <PrimitivePropertyPanePlane v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'PlaneGeometry'" />
  <PrimitivePropertyPaneTorus v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'TorusGeometry'" />
  <PrimitivePropertyPaneCone v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'ConeGeometry'" />
  <PrimitivePropertyPaneTetrahedron v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'TetrahedronGeometry'" />
  <PrimitivePropertyPaneOctahedron v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'OctahedronGeometry'" />
  <PrimitivePropertyPaneDodecahedron v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'DodecahedronGeometry'" />
  <PrimitivePropertyPaneIcosahedron v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'IcosahedronGeometry'" />
  <PrimitivePropertyPaneRing v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'RingGeometry'" />
  <PrimitivePropertyPaneTube v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'TubeGeometry'" />
  <div v-else style="padding: 24px; color: #888;">属性内容占位</div>
</div>
      <MaterialPropertyPane v-if="activeTab === '材质'" />
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import ScenePropertyPane from '../property/ScenePropertyPane.vue';
import BasePropertyPane from '../property/BasePropertyPane.vue';
import MaterialPropertyPane from '../property/MaterialPropertyPane.vue';
import PrimitivePropertyPaneBox from '../property/PrimitivePropertyPane-box.vue';
import PrimitivePropertyPaneSphere from '../property/PrimitivePropertyPane-sphere.vue';
import PrimitivePropertyPaneCylinder from '../property/PrimitivePropertyPane-cylinder.vue';
import PrimitivePropertyPanePlane from '../property/PrimitivePropertyPane-plane.vue';
import PrimitivePropertyPaneTorus from '../property/PrimitivePropertyPane-torus.vue';
import PrimitivePropertyPaneCone from '../property/PrimitivePropertyPane-cone.vue';
import PrimitivePropertyPaneTetrahedron from '../property/PrimitivePropertyPane-tetrahedron.vue';
import PrimitivePropertyPaneOctahedron from '../property/PrimitivePropertyPane-octahedron.vue';
import PrimitivePropertyPaneDodecahedron from '../property/PrimitivePropertyPane-dodecahedron.vue';
import PrimitivePropertyPaneIcosahedron from '../property/PrimitivePropertyPane-icosahedron.vue';
import PrimitivePropertyPaneRing from '../property/PrimitivePropertyPane-ring.vue';
import PrimitivePropertyPaneTube from '../property/PrimitivePropertyPane-tube.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';

export default {
  name: 'PropertyPanel',
  components: {
    ScenePropertyPane,
    BasePropertyPane,
    MaterialPropertyPane,
    PrimitivePropertyPaneBox,
    PrimitivePropertyPaneSphere,
    PrimitivePropertyPaneCylinder,
    PrimitivePropertyPanePlane,
    PrimitivePropertyPaneTorus,
    PrimitivePropertyPaneCone,
    PrimitivePropertyPaneTetrahedron,
    PrimitivePropertyPaneOctahedron,
    PrimitivePropertyPaneDodecahedron,
    PrimitivePropertyPaneIcosahedron,
    PrimitivePropertyPaneRing,
    PrimitivePropertyPaneTube
  },
  setup() {
    /**
     * 属性面板Tab切换逻辑
     * - activeTab: 当前激活的Tab
     * - hasSelection: 是否有选中对象
     * - selectedObject: 当前选中对象（仅支持单选）
     */
    const activeTab = ref('场景');
    const { hasSelection, selectedObjects } = useObjectSelection(); // 是否有选中对象

    // 当前选中对象（仅支持单选）
    const selectedObject = computed(() => {
      const arr = selectedObjects.value || [];
      return arr.length === 1 ? arr[0] : null;
    });

    watch(hasSelection, (val) => {
      if (val) {
        activeTab.value = '对象';
      } else {
        activeTab.value = '场景';
      }
    });

    return {
      activeTab,
      hasSelection,
      selectedObject
    };
  }
};
</script>

<style lang="scss" scoped>
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
