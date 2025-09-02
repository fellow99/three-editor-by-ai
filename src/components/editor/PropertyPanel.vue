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
        <button v-if="!hasSelection"
          class="tab-btn"
          :class="{ active: activeTab === '场景' }"
          @click="activeTab = '场景'"
        >
          场景
        </button>
        <button v-if="!hasSelection"
          class="tab-btn"
          :class="{ active: activeTab === '环境' }"
          @click="activeTab = '环境'"
        >
          环境
        </button>
        <button v-if="!hasSelection"
          class="tab-btn"
          :class="{ active: activeTab === '后处理' }"
          @click="activeTab = '后处理'"
        >
          后处理
        </button>
        <button v-if="hasSelection"
          class="tab-btn"
          :class="{ active: activeTab === '对象' }"
          @click="activeTab = '对象'"
        >
          对象
        </button>
        <button v-if="hasSelection"
          class="tab-btn"
          :class="{ active: activeTab === '材质' }"
          @click="activeTab = '材质'"
        >
          材质
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'userData' }"
          @click="activeTab = 'userData'"
        >
          userData
        </button>
      </div>
      <!-- Tab内容区域 -->
      <ScenePropertyPane v-show="activeTab === '场景'" />
      <div v-show="activeTab === '光影'" style="padding: 24px; color: #888;">光影内容占位</div>
      <div v-show="activeTab === '环境'" style="padding: 24px; color: #888;">环境内容占位</div>
      <div v-show="activeTab === '后处理'" style="padding: 24px; color: #888;">后处理内容占位</div>
      <div v-if="activeTab === '对象'">
        <BasePropertyPane />
        <TransformPropertyPane />
        <AnimationPropertyPane />
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
        <LightPropertyPaneDirectionalLight v-else-if="selectedObject && selectedObject.type === 'DirectionalLight'" />
        <LightPropertyPanePointLight v-else-if="selectedObject && selectedObject.type === 'PointLight'" />
        <LightPropertyPaneSpotLight v-else-if="selectedObject && selectedObject.type === 'SpotLight'" />
        <LightPropertyPaneAmbientLight v-else-if="selectedObject && selectedObject.type === 'AmbientLight'" />
        <LightPropertyPaneHemisphereLight v-else-if="selectedObject && selectedObject.type === 'HemisphereLight'" />
      </div>
      <MaterialPropertyPane v-if="activeTab === '材质'" />
      <UserDataPropertyPane v-if="activeTab === '属性'" />
      <div v-show="activeTab === 'userData'">
        <SceneUserDataPropertyPane v-show="!hasSelection" />
        <UserDataPropertyPane v-if="selectedObject" v-show="hasSelection" :object="selectedObject" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue';
import ScenePropertyPane from '../property/ScenePropertyPane.vue';
import SceneUserDataPropertyPane from '../property/SceneUserDataPropertyPane.vue';
import BasePropertyPane from '../property/BasePropertyPane.vue';
import UserDataPropertyPane from '../property/UserDataPropertyPane.vue';
import TransformPropertyPane from '../property/TransformPropertyPane.vue';
import AnimationPropertyPane from '../property/AnimationPropertyPane.vue';
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
import LightPropertyPaneDirectionalLight from '../property/LightPropertyPane-DirectionalLight.vue';
import LightPropertyPanePointLight from '../property/LightPropertyPane-PointLight.vue';
import LightPropertyPaneSpotLight from '../property/LightPropertyPane-SpotLight.vue';
import LightPropertyPaneAmbientLight from '../property/LightPropertyPane-AmbientLight.vue';
import LightPropertyPaneHemisphereLight from '../property/LightPropertyPane-HemisphereLight.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';

export default {
  name: 'PropertyPanel',
  components: {
    ScenePropertyPane,
    SceneUserDataPropertyPane,
    BasePropertyPane,
    UserDataPropertyPane,
    TransformPropertyPane,
    AnimationPropertyPane,
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
    PrimitivePropertyPaneTube,
    LightPropertyPaneDirectionalLight,
    LightPropertyPanePointLight,
    LightPropertyPaneSpotLight,
    LightPropertyPaneAmbientLight,
    LightPropertyPaneHemisphereLight
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
