<!--
  材质属性面板（专家模式）
-->
<script setup>
import { nextTick, ref, computed, watch } from 'vue';
import { addMaterialToState, useMaterialSelection, setMaterialToObject } from '@/composables/useMaterial.js';
import { useThreeViewer } from '@/composables/useThreeViewer.js';
import MaterialPropertyPaneAdv_basic from './MaterialPropertyPaneAdv-basic.vue';
import MaterialPropertyPaneAdv_color from './MaterialPropertyPaneAdv-color.vue';
import MaterialPropertyPaneAdv_normal from './MaterialPropertyPaneAdv-normal.vue';
import MaterialPropertyPaneAdv_roughness from './MaterialPropertyPaneAdv-roughness.vue';
import MaterialPropertyPaneAdv_metalness from './MaterialPropertyPaneAdv-metalness.vue';
import MaterialPropertyPaneAdv_alpha from './MaterialPropertyPaneAdv-alpha.vue';
import MaterialPropertyPaneAdv_ao from './MaterialPropertyPaneAdv-ao.vue';
import MaterialPropertyPaneAdv_emissive from './MaterialPropertyPaneAdv-emissive.vue';
import MaterialPropertyPaneAdv_light from './MaterialPropertyPaneAdv-light.vue';
import MaterialPropertyPaneAdv_env from './MaterialPropertyPaneAdv-env.vue';
import MaterialPropertyPaneAdv_specular from './MaterialPropertyPaneAdv-specular.vue';
import MaterialPropertyPaneAdv_bump from './MaterialPropertyPaneAdv-bump.vue';
import MaterialPropertyPaneAdv_displacement from './MaterialPropertyPaneAdv-displacement.vue';
import MaterialPropertyPaneAdv_clearcoat from './MaterialPropertyPaneAdv-clearcoat.vue';
import MaterialPropertyPaneAdv_sheen from './MaterialPropertyPaneAdv-sheen.vue';
import MaterialPropertyPaneAdv_thickness from './MaterialPropertyPaneAdv-thickness.vue';
import MaterialPropertyPaneAdv_transmission from './MaterialPropertyPaneAdv-transmission.vue';

const materialSelection = useMaterialSelection();

const props = defineProps({
  material: { type: Object, default: null },
  activeTab: { type: String, default: '基础' }
});

const emits = defineEmits(['update:activeTab']);

const materialProp = computed(() => props.material);

/**
 * 材质属性表单响应式对象
 * 材质配置结构，以下是基础结构字段：
{
  // 材质类型
  name: 'Material001', // 材质名称

  transparent: false, // 是否透明
  opacity: 1, // 不透明度
  visible: true, // 可见性
  side: THREE.FrontSide, // 可见面
  overdraw: 0, // 过度绘制
  needsUpdate: true, // 是否需要更新
  colorWrite: true, // 是否写入颜色缓冲区
  flatShading: false, // 是否使用平面着色
  lights: true, // 是否受光照影响
  premultipliedAlpha: false, // 是否预乘Alpha通道
  dithering: false, // 是否使用抖动
  shadowSide: null, // 阴影面
  vertexColors: false, // 是否使用顶点颜色
  fog: true, // 是否受雾影响

  blending: THREE.NormalBlending, // 混合模式
  blendSrc: THREE.SrcAlphaFactor, // 混合源
  blendSrcAlpha: null, // 源Alpha通道
  blendDst: THREE.OneMinusSrcAlphaFactor, // 混合目标
  blendDstAlpha: null, // 目标Alpha通道
  blendEquation: THREE.AddEquation, // 混合方程

  depthTest: true, // 是否进行深度测试
  depthWrite: true, // 是否写入深度缓冲区
  depthFunc: THREE.LessEqualDepth, // 深度测试函数
  polygonOffset: false, // 是否启用多边形偏移
  polygonOffsetFactor: 0, // 多边形偏移因子
  polygonOffsetUnits: 0, // 多边形偏移单位
  alphaTest: 0, // Alpha测试值
  precision: null, // 着色器精度
  
  wireframe: false, // 是否显示线框
  wireframeLinewidth: 1, // 线框宽度
  wireframeLinecap: 'round', // 线框端点样式
  wireframeLinejoin: 'round', // 线框连接点样式
}

以下是MeshBasicMaterial相关结构字段：
{
  ...基础结构字段,
  type: 'MeshStandardMaterial',

  color: '#888888', // 主颜色

  map: null, // 颜色贴图
  alphaMap: null, // 透明贴图
  aoMap: null, // 环境光遮蔽贴图
  aoMapIntensity: 1, // 环境光遮蔽贴图强度
  lightMap: null, // 光照贴图
  lightMapIntensity: 1, // 光照贴图强度
  specularMap: null, // 高光贴图
  envMap: null, // 环境贴图
  reflectivity: 1, // 反射率
  refractionRatio: 0.98, // 折射率
  combine: THREE.MultiplyOperation, // 环境贴图混合模式
}


以下是MeshNormalMaterial相关结构字段：
{
  ...基础结构字段,
  type: 'MeshNormalMaterial',

  flatShading: false, // 是否使用平面着色
  bumpMap: null, // 凹凸贴图
  bumpScale: 1, // 凹凸贴图强度
  displacementMap: null, // 位移贴图
  displacementScale: 1, // 位移贴图强度
  displacementBias: 0, // 位移贴图偏移
  normalMap: null, // 法线贴图
  normalMapType: THREE.TangentSpaceNormalMap, // 法线贴图类型
  normalScale: [1, 1], // 法线贴图缩放
}


以下是MeshLambertMaterial相关结构字段：
{
  ...基础结构字段,
  type: 'MeshLambertMaterial',

  color: '#888888', // 主颜色
  emissive: '#000000', // 自发光颜色
  emissiveIntensity: 1, // 自发光强度
  
  map: null, // 颜色贴图
  alphaMap: null, // 透明贴图
  aoMap: null, // 环境光遮蔽贴图
  aoMapIntensity: 1, // 环境光遮蔽贴图强度
  lightMap: null, // 光照贴图
  lightMapIntensity: 1, // 光照贴图强度
  specularMap: null, // 高光贴图
  envMap: null, // 环境贴图
  reflectivity: 1, // 反射率
  refractionRatio: 0.98, // 折射率
  combine: THREE.MultiplyOperation, // 环境贴图混合模式
  bumpMap: null, // 凹凸贴图
  bumpScale: 1, // 凹凸贴图强度
  displacementMap: null, // 位移贴图
  displacementScale: 1, // 位移贴图强度
  displacementBias: 0, // 位移贴图偏移
  normalMap: null, // 法线贴图
  normalMapType: THREE.TangentSpaceNormalMap, // 法线贴图类型
  normalScale: [1, 1], // 法线贴图缩放
  emissiveMap: null, // 自发光贴图
}


以下是MeshPhongMaterial相关结构字段：
{
  ...基础结构字段,
  type: 'MeshPhongMaterial',
  
  color: '#888888', // 主颜色
  emissive: '#000000', // 自发光颜色
  emissiveIntensity: 1, // 自发光强度
  specular: '#ffffff', // 高光颜色
  shininess: 30, // 高光强度

  map: null, // 颜色贴图
  alphaMap: null, // 透明贴图
  aoMap: null, // 环境光遮蔽贴图
  aoMapIntensity: 1, // 环境光遮蔽贴图强度
  lightMap: null, // 光照贴图
  lightMapIntensity: 1, // 光照贴图强度
  specularMap: null, // 高光贴图
  envMap: null, // 环境贴图
  reflectivity: 1, // 反射率
  refractionRatio: 0.98, // 折射率
  combine: THREE.MultiplyOperation, // 环境贴图混合模式
  bumpMap: null, // 凹凸贴图
  bumpScale: 1, // 凹凸贴图强度
  displacementMap: null, // 位移贴图
  displacementScale: 1, // 位移贴图强度
  displacementBias: 0, // 位移贴图偏移
  normalMap: null, // 法线贴图
  normalMapType: THREE.TangentSpaceNormalMap, // 法线贴图类型
  normalScale: [1, 1], // 法线贴图缩放
  emissiveMap: null, // 自发光贴图
}


以下是MeshStandardMaterial相关结构字段：
{
  ...基础结构字段,
  type: 'MeshStandardMaterial',

  color: '#888888', // 主颜色
  emissive: '#000000', // 自发光颜色
  emissiveIntensity: 1, // 自发光强度

  roughness: 0.4, // 粗糙度
  roughnessMap: null, // 粗糙度贴图

  metalness: 0.1, // 金属度
  metalnessMap: null, // 金属度贴图

  map: null, // 颜色贴图
  alphaMap: null, // 透明贴图
  aoMap: null, // 环境光遮蔽贴图
  aoMapIntensity: 1, // 环境光遮蔽贴图强度
  lightMap: null, // 光照贴图
  lightMapIntensity: 1, // 光照贴图强度
  specularMap: null, // 高光贴图
  envMap: null, // 环境贴图
  reflectivity: 1, // 反射率
  refractionRatio: 0.98, // 折射率
  combine: THREE.MultiplyOperation, // 环境贴图混合模式
  bumpMap: null, // 凹凸贴图
  bumpScale: 1, // 凹凸贴图强度
  displacementMap: null, // 位移贴图
  displacementScale: 1, // 位移贴图强度
  displacementBias: 0, // 位移贴图偏移
  normalMap: null, // 法线贴图
  normalMapType: THREE.TangentSpaceNormalMap, // 法线贴图类型
  normalScale: [1, 1], // 法线贴图缩放
  emissiveMap: null, // 自发光贴图
}

以下是MeshPhysicalMaterial相关结构字段：
{
  ...基础结构字段,
  type: 'MeshPhysicalMaterial',

  color: '#888888', // 主颜色
  emissive: '#000000', // 自发光颜色
  emissiveIntensity: 1, // 自发光强度
  roughness: 0.4, // 粗糙度
  metalness: 0.1, // 金属度
  attenuationColor: '#ffffff', // 吸收颜色
  attenuationDistance: 0, // 吸收距离
  clearcoat: 0, // 清漆层强度
  clearcoatRoughness: 0, // 清漆层粗糙度
  ior: 1.5, // 折射率
  sheenColor: '#ffffff', // 光泽颜色
  sheen: 0, // 光泽强度
  sheenRoughness: 0, // 光泽粗糙度
  specularColor: '#ffffff', // 镜面反射颜色
  specularIntensity: 1, // 镜面反射强度
  thickness: 0, // 介质厚度
  transmission: 0, // 透射率

  map: null, // 颜色贴图
  alphaMap: null, // 透明贴图
  aoMap: null, // 环境光遮蔽贴图
  aoMapIntensity: 1, // 环境光遮蔽贴图强度
  lightMap: null, // 光照贴图
  lightMapIntensity: 1, // 光照贴图强度
  specularMap: null, // 高光贴图
  envMap: null, // 环境贴图
  reflectivity: 1, // 反射率
  refractionRatio: 0.98, // 折射率
  combine: THREE.MultiplyOperation, // 环境贴图混合模式
  bumpMap: null, // 凹凸贴图
  bumpScale: 1, // 凹凸贴图强度
  displacementMap: null, // 位移贴图
  displacementScale: 1, // 位移贴图强度
  displacementBias: 0, // 位移贴图偏移
  normalMap: null, // 法线贴图
  normalMapType: THREE.TangentSpaceNormalMap, // 法线贴图类型
  normalScale: [1, 1], // 法线贴图缩放
  emissiveMap: null, // 自发光贴图
  clearcoatMap: null, // 清漆层贴图
  clearcoatRoughnessMap: null, // 清漆层粗糙度贴图
  clearcoatNormalMap: null, // 清漆层法线贴图
  sheenColorMap: null, // 光泽颜色贴图
  sheenRoughnessMap: null, // 光泽粗糙度贴图
  specularColorMap: null, // 镜面反射颜色贴图
  specularIntensityMap: null, // 镜面反射强度贴图
  thicknessMap: null, // 介质厚度贴图
  transmissionMap: null, // 透射率贴图
}
 */
const materialFormRef = ref(null);

// 监听对象变化，更新材质属性
watch(materialProp, () => {
  updateMaterialForm();
}, { immediate: true });

function updateMaterialForm(){
  let material = materialProp.value;
  if(material) {
    materialFormRef.value = {
      type: material.type
    };
  }
}

// 直接修改对象材质
/**
 * 设置材质属性
 * @param {Object} update 需要更新的材质属性
 */
function setMaterial(update) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;
  
  let name = materialSelection.selectedMaterialNameRef.value;
  setMaterialToObject(viewer.scene, name, update);

  let material = materialSelection.getSelectedMaterial();
  if (material) addMaterialToState(name, material);

  // 刷新选中材质以触发界面更新
  materialSelection.selectedMaterialNameRef.value = null;
  nextTick(() => {
    materialSelection.selectedMaterialNameRef.value = name;
  });
}

function changeMaterial() {
  let val = materialFormRef.value;
  setMaterial({
    type: val.type,
  });
}

</script>

<template v-if="true">
  <div v-if="materialFormRef" class="property-section">
    <h4>材质属性：{{ material.name }}</h4>
    <el-select v-model="materialFormRef.type" @change="changeMaterial" class="property-input" size="small">
      <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
      <el-option label="标准(Standard)" value="MeshStandardMaterial" />
      <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
      <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
      <el-option label="卡通（Toon）" value="MeshToonMaterial" />
      <el-option label="法向(Normal)" value="MeshNormalMaterial" />
      <el-option label="基础(Basic)" value="MeshBasicMaterial" />
    </el-select>
    <el-tabs v-model="props.activeTab" @tab-change="emits('update:activeTab', $event)">
      <el-tab-pane name="基础" label="基础">
        <MaterialPropertyPaneAdv_basic :material="materialProp" />
      </el-tab-pane>
      <el-tab-pane name="常用贴图" label="常用贴图">
        <template v-if="materialFormRef.type !== 'MeshNormalMaterial'">
          <el-divider style="margin:8px 0;">颜色</el-divider>
          <MaterialPropertyPaneAdv_color :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">法线</el-divider>
          <MaterialPropertyPaneAdv_normal :material="materialProp" />
        </template>
        <template v-if="materialFormRef.type == 'MeshStandardMaterial' || materialFormRef.type == 'MeshPhysicalMaterial'">
          <el-divider style="margin:8px 0;">粗糙度</el-divider>
          <material-property-pane-adv_roughness :material="materialProp" />
        </template>
        <template v-if="materialFormRef.type == 'MeshStandardMaterial' || materialFormRef.type == 'MeshPhysicalMaterial'">
          <el-divider style="margin:8px 0;">金属度</el-divider>
          <material-property-pane-adv_metalness :material="materialProp" />
        </template>
        <template v-if="materialFormRef.type !== 'MeshNormalMaterial' && materialFormRef.type !== 'MeshBasicMaterial'">
          <el-divider style="margin:8px 0;">自发光</el-divider>
          <material-property-pane-adv_emissive :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">透明度</el-divider>
          <material-property-pane-adv_alpha :material="materialProp" />
        </template>
      </el-tab-pane>
      <el-tab-pane name="进阶" label="进阶">
        <template v-if="true">
          <el-divider style="margin:8px 0;">环境光遮蔽</el-divider>
          <material-property-pane-adv_ao :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">光照</el-divider>
          <material-property-pane-adv_light :material="materialProp" />
        </template>
        <template v-if="materialFormRef.type !== 'MeshNormalMaterial' && materialFormRef.type !== 'MeshPhongMaterial'">
          <el-divider style="margin:8px 0;">环境贴图</el-divider>
          <material-property-pane-adv_env :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">高光</el-divider>
          <material-property-pane-adv_specular :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">凹凸</el-divider>
          <material-property-pane-adv_bump :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">位移</el-divider>
          <material-property-pane-adv_displacement :material="materialProp" />
        </template>
      </el-tab-pane>
      <el-tab-pane v-if="materialFormRef.type == 'MeshPhysicalMaterial'" name="物理" label="物理">
        <template v-if="true">
          <el-divider style="margin:8px 0;">清漆层</el-divider>
          <material-property-pane-adv_clearcoat :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">光泽</el-divider>
          <material-property-pane-adv_sheen :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">厚度</el-divider>
          <material-property-pane-adv_thickness :material="materialProp" />
        </template>
        <template v-if="true">
          <el-divider style="margin:8px 0;">透射率</el-divider>
          <material-property-pane-adv_transmission :material="materialProp" />
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.property-section {
  padding: 8px;
  height: calc(100vh - 100px);
  overflow-y: auto;
}
.property-section h4 {
  height: 50px;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  border-bottom: 1px solid #444;
  padding-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.el-tabs {
  height: calc(100% - 90px);
  &:deep(.el-tabs__content) {
    height: calc(100% - 40px);
  }
  .el-tab-pane {
    height: 100%;
    overflow-y: auto;
  }
}
</style>
