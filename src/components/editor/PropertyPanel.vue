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
        <button v-if="!selectedObject && !selectedMaterial"
          class="tab-btn"
          :class="{ active: activeTab === '场景' }"
          @click="activeTab = '场景'"
        >
          场景
        </button>
        <button v-if="selectedObject"
          class="tab-btn"
          :class="{ active: activeTab === '对象' }"
          @click="activeTab = '对象'"
        >
          对象
        </button>
        <button v-if="selectedMaterial"
          class="tab-btn"
          :class="{ active: activeTab === '材质' && !isMaterialPropertyPaneAdv }"
          @click="isMaterialPropertyPaneAdv=false; activeTab = '材质'"
        >
          材质
        </button>
        <button v-if="selectedMaterial"
          class="tab-btn"
          :class="{ active: activeTab === '材质' && isMaterialPropertyPaneAdv }"
          @click="isMaterialPropertyPaneAdv=true; activeTab = '材质'"
        >
          材质专家模式
        </button>
        <button v-if="!selectedMaterial"
          class="tab-btn"
          :class="{ active: activeTab === 'userData' }"
          @click="activeTab = 'userData'"
        >
          userData
        </button>
      </div>
      <!-- Tab内容区域 -->
      <ScenePropertyPane v-if="activeTab === '场景' && !selectedObject && !selectedMaterial" />
      <div v-if="activeTab === '对象'">
        <BasePropertyPane />
        <TransformPropertyPane v-if="selectedObject" :selectedObject="selectedObject" />
        <AnimationPropertyPane v-if="selectedObject" />
        <LightPropertyPaneDirectionalLight v-if="selectedObject && selectedObject.type === 'DirectionalLight'" />
        <LightPropertyPanePointLight v-else-if="selectedObject && selectedObject.type === 'PointLight'" />
        <LightPropertyPaneSpotLight v-else-if="selectedObject && selectedObject.type === 'SpotLight'" />
        <LightPropertyPaneAmbientLight v-else-if="selectedObject && selectedObject.type === 'AmbientLight'" />
        <LightPropertyPaneRectAreaLight v-else-if="selectedObject && selectedObject.type === 'RectAreaLight'" />
        <LightPropertyPaneHemisphereLight v-else-if="selectedObject && selectedObject.type === 'HemisphereLight'" />
        <PrimitivePropertyPaneBox v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'BoxGeometry'" />
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
        <PrimitivePropertyPaneCircle v-else-if="selectedObject && selectedObject.geometry && selectedObject.geometry.type === 'CircleGeometry'" />
      </div>
      <MaterialPropertyPane v-if="activeTab === '材质' && !isMaterialPropertyPaneAdv && selectedMaterial" :material="selectedMaterial" />
      <UserDataPropertyPane v-if="activeTab === '属性'" />
      <div v-if="activeTab === 'userData'">
        <SceneUserDataPropertyPane v-if="!selectedObject && !selectedMaterial" />
        <UserDataPropertyPane v-if="selectedObject" :object="selectedObject" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, shallowRef } from 'vue';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import { useMaterialSelection } from '@/composables/useMaterial.js';
import ScenePropertyPane from '../property/ScenePropertyPane.vue';
import SceneUserDataPropertyPane from '../property/SceneUserDataPropertyPane.vue';
import BasePropertyPane from '../property/BasePropertyPane.vue';
import UserDataPropertyPane from '../property/UserDataPropertyPane.vue';
import TransformPropertyPane from '../property/TransformPropertyPane.vue';
import AnimationPropertyPane from '../property/AnimationPropertyPane.vue';
import MaterialPropertyPane from '../property/MaterialPropertyPane.vue';
import LightPropertyPaneDirectionalLight from '../property/LightPropertyPane-DirectionalLight.vue';
import LightPropertyPanePointLight from '../property/LightPropertyPane-PointLight.vue';
import LightPropertyPaneSpotLight from '../property/LightPropertyPane-SpotLight.vue';
import LightPropertyPaneAmbientLight from '../property/LightPropertyPane-AmbientLight.vue';
import LightPropertyPaneRectAreaLight from '../property/LightPropertyPane-RectAreaLight.vue';
import LightPropertyPaneHemisphereLight from '../property/LightPropertyPane-HemisphereLight.vue';
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
import PrimitivePropertyPaneCircle from '../property/PrimitivePropertyPane-circle.vue';


const activeTab = ref('场景');
const materialPropertyPaneAdvTab = ref('基础');
const isMaterialPropertyPaneAdv = ref(false);

const { selectedIdsRef, getSelectedObjects } = useObjectSelection();
const { selectedMaterialNameRef, getSelectedMaterial } = useMaterialSelection();

// 当前选中的对象
const selectedObject = shallowRef(null);
// 当前选中的材质
const selectedMaterial = shallowRef(null);

// 监听选中对象变化
watch([selectedIdsRef, selectedMaterialNameRef], () => {
  let ids = selectedIdsRef.value;
  let materialName = selectedMaterialNameRef.value;
  selectedObject.value = null;
  selectedMaterial.value = null;
  if (ids && ids.length > 0) {
    activeTab.value = '对象';
    let objects = getSelectedObjects();
    let object = objects ? objects[0] : null;
    selectedObject.value = object;
  } else if(materialName) {
    activeTab.value = '材质';
    selectedMaterial.value = getSelectedMaterial();
  } else {
    activeTab.value = '场景';
  }
});

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
