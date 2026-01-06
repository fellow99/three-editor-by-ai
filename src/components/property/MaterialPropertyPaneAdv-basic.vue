<!--
  材质属性面板（专家模式）
-->
<script setup>
import { nextTick, ref, computed, watch } from 'vue';
import { addMaterialToState, useMaterialSelection, setMaterialToObject, loadImageTexture, updateTexture } from '@/composables/useMaterial.js';
import { useThreeViewer } from '@/composables/useThreeViewer.js';

const materialSelection = useMaterialSelection();

const props = defineProps({
  material: { type: Object, default: null }
});

const materialProp = computed(() => props.material);

/**
 * 材质属性表单响应式对象
 * 材质配置结构，以下是基础结构字段：
{
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
      type: material.type,
      side: material.side ?? THREE.FrontSide,
      transparent: material.transparent ?? false,
      opacity: material.opacity ?? 1,
      visible: material.visible ?? true,
      overdraw: material.overdraw ?? 0,
      colorWrite: material.colorWrite ?? true,
      flatShading: material.flatShading ?? false,
      lights: material.lights ?? true,
      premultipliedAlpha: material.premultipliedAlpha ?? false,
      dithering: material.dithering ?? false,
      shadowSide: material.shadowSide ?? null,
      vertexColors: material.vertexColors ?? false,
      fog: material.fog ?? true,
      blending: material.blending ?? THREE.NormalBlending,
      blendSrc: material.blendSrc ?? THREE.SrcAlphaFactor,
      blendSrcAlpha: material.blendSrcAlpha ?? null,
      blendDst: material.blendDst ?? THREE.OneMinusSrcAlphaFactor,
      blendDstAlpha: material.blendDstAlpha ?? null,
      blendEquation: material.blendEquation ?? THREE.AddEquation,
      depthTest: material.depthTest ?? true,
      depthWrite: material.depthWrite ?? true,
      depthFunc: material.depthFunc ?? THREE.LessEqualDepth,
      polygonOffset: material.polygonOffset ?? false,
      polygonOffsetFactor: material.polygonOffsetFactor ?? 0,
      polygonOffsetUnits: material.polygonOffsetUnits ?? 0,
      alphaTest: material.alphaTest ?? 0,
      precision: material.precision ?? null,
      wireframe: material.wireframe ?? false,
      wireframeLinewidth: material.wireframeLinewidth ?? 1,
      wireframeLinecap: material.wireframeLinecap ?? 'round',
      wireframeLinejoin: material.wireframeLinejoin ?? 'round',
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

</script>

<template>
  <div v-if="materialFormRef" class="property-pane">
    <el-form v-if="materialFormRef" label-width="100px">
      <el-form-item label="可见面">
        <el-select
          v-model="materialFormRef.side"
          @change="setMaterial({ side: materialFormRef.side })"
          class="property-input"
          size="small"
        >
          <el-option label="单面(FrontSide)" :value="0" />
          <el-option label="背面(BackSide)" :value="1" />
          <el-option label="双面(DoubleSide)" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否透明">
        <el-switch
          v-model="materialFormRef.transparent"
          @change="setMaterial({ transparent: materialFormRef.transparent })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <el-form-item label="不透明度">
        <el-slider
          v-model="materialFormRef.opacity"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setMaterial({ opacity: materialFormRef.opacity })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.opacity?.toFixed(2) }}</span>
      </el-form-item>
      <!-- AI完善表单代码 -->
      <!-- 可见性 -->
      <el-form-item label="可见性">
        <el-switch
          v-model="materialFormRef.visible"
          @change="setMaterial({ visible: materialFormRef.visible })"
          active-text="可见"
          inactive-text="隐藏"
          size="small"
        />
      </el-form-item>
      <!-- 过度绘制 -->
      <el-form-item label="过度绘制">
        <el-slider
          v-model="materialFormRef.overdraw"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setMaterial({ overdraw: materialFormRef.overdraw })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.overdraw?.toFixed(2) }}</span>
      </el-form-item>
      <!-- 是否写入颜色缓冲区 -->
      <el-form-item label="写入颜色缓冲">
        <el-switch
          v-model="materialFormRef.colorWrite"
          @change="setMaterial({ colorWrite: materialFormRef.colorWrite })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 是否平面着色 -->
      <el-form-item label="平面着色">
        <el-switch
          v-model="materialFormRef.flatShading"
          @change="setMaterial({ flatShading: materialFormRef.flatShading })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 是否受光照影响 -->
      <el-form-item label="受光照影响">
        <el-switch
          v-model="materialFormRef.lights"
          @change="setMaterial({ lights: materialFormRef.lights })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 是否预乘Alpha -->
      <el-form-item label="预乘Alpha">
        <el-switch
          v-model="materialFormRef.premultipliedAlpha"
          @change="setMaterial({ premultipliedAlpha: materialFormRef.premultipliedAlpha })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 是否抖动 -->
      <el-form-item label="抖动">
        <el-switch
          v-model="materialFormRef.dithering"
          @change="setMaterial({ dithering: materialFormRef.dithering })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 阴影面 -->
      <el-form-item label="阴影面">
        <el-select
          v-model="materialFormRef.shadowSide"
          @change="setMaterial({ shadowSide: materialFormRef.shadowSide })"
          class="property-input"
          size="small"
        >
          <el-option label="无" :value="null" />
          <el-option label="正面" :value="0" />
          <el-option label="背面" :value="1" />
          <el-option label="双面" :value="2" />
        </el-select>
      </el-form-item>
      <!-- 顶点颜色 -->
      <el-form-item label="顶点颜色">
        <el-switch
          v-model="materialFormRef.vertexColors"
          @change="setMaterial({ vertexColors: materialFormRef.vertexColors })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 受雾影响 -->
      <el-form-item label="受雾影响">
        <el-switch
          v-model="materialFormRef.fog"
          @change="setMaterial({ fog: materialFormRef.fog })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>

      
      <el-divider>混合属性</el-divider>
      <!-- 混合模式 -->
      <el-form-item label="混合模式">
        <el-select
          v-model="materialFormRef.blending"
          @change="setMaterial({ blending: materialFormRef.blending })"
          class="property-input"
          size="small"
        >
          <el-option label="正常" :value="1" />
          <el-option label="加法" :value="2" />
          <el-option label="减法" :value="3" />
          <el-option label="乘法" :value="4" />
          <el-option label="自定义" :value="5" />
        </el-select>
      </el-form-item>
      <!-- 混合源 -->
      <el-form-item label="混合源">
        <el-select
          v-model="materialFormRef.blendSrc"
          @change="setMaterial({ blendSrc: materialFormRef.blendSrc })"
          class="property-input"
          size="small"
        >
          <el-option label="SrcAlpha" :value="2" />
          <el-option label="One" :value="1" />
          <el-option label="Zero" :value="0" />
          <el-option label="DstAlpha" :value="4" />
          <el-option label="OneMinusSrcAlpha" :value="5" />
        </el-select>
      </el-form-item>
      <!-- 源Alpha通道 -->
      <el-form-item label="源Alpha通道">
        <el-select
          v-model="materialFormRef.blendSrcAlpha"
          @change="setMaterial({ blendSrcAlpha: materialFormRef.blendSrcAlpha })"
          class="property-input"
          size="small"
        >
          <el-option label="无" :value="null" />
          <el-option label="SrcAlpha" :value="2" />
          <el-option label="One" :value="1" />
          <el-option label="Zero" :value="0" />
        </el-select>
      </el-form-item>
      <!-- 混合目标 -->
      <el-form-item label="混合目标">
        <el-select
          v-model="materialFormRef.blendDst"
          @change="setMaterial({ blendDst: materialFormRef.blendDst })"
          class="property-input"
          size="small"
        >
          <el-option label="OneMinusSrcAlpha" :value="5" />
          <el-option label="One" :value="1" />
          <el-option label="Zero" :value="0" />
          <el-option label="DstAlpha" :value="4" />
        </el-select>
      </el-form-item>
      <!-- 目标Alpha通道 -->
      <el-form-item label="目标Alpha通道">
        <el-select
          v-model="materialFormRef.blendDstAlpha"
          @change="setMaterial({ blendDstAlpha: materialFormRef.blendDstAlpha })"
          class="property-input"
          size="small"
        >
          <el-option label="无" :value="null" />
          <el-option label="OneMinusSrcAlpha" :value="5" />
          <el-option label="One" :value="1" />
          <el-option label="Zero" :value="0" />
        </el-select>
      </el-form-item>
      <!-- 混合方程 -->
      <el-form-item label="混合方程">
        <el-select
          v-model="materialFormRef.blendEquation"
          @change="setMaterial({ blendEquation: materialFormRef.blendEquation })"
          class="property-input"
          size="small"
        >
          <el-option label="加法" :value="100" />
          <el-option label="减法" :value="101" />
          <el-option label="反向减法" :value="102" />
        </el-select>
      </el-form-item>

      <el-divider>高级属性</el-divider>
      <!-- 深度测试 -->
      <el-form-item label="深度测试">
        <el-switch
          v-model="materialFormRef.depthTest"
          @change="setMaterial({ depthTest: materialFormRef.depthTest })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 写入深度缓冲 -->
      <el-form-item label="写入深度缓冲">
        <el-switch
          v-model="materialFormRef.depthWrite"
          @change="setMaterial({ depthWrite: materialFormRef.depthWrite })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 深度测试函数 -->
      <el-form-item label="深度测试函数">
        <el-select
          v-model="materialFormRef.depthFunc"
          @change="setMaterial({ depthFunc: materialFormRef.depthFunc })"
          class="property-input"
          size="small"
        >
          <el-option label="LessEqual" :value="3" />
          <el-option label="Less" :value="1" />
          <el-option label="Greater" :value="2" />
        </el-select>
      </el-form-item>
      <!-- 多边形偏移 -->
      <el-form-item label="多边形偏移">
        <el-switch
          v-model="materialFormRef.polygonOffset"
          @change="setMaterial({ polygonOffset: materialFormRef.polygonOffset })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 多边形偏移因子 -->
      <el-form-item label="偏移因子">
        <el-slider
          v-model="materialFormRef.polygonOffsetFactor"
          :min="-10"
          :max="10"
          :step="0.1"
          @change="setMaterial({ polygonOffsetFactor: materialFormRef.polygonOffsetFactor })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.polygonOffsetFactor }}</span>
      </el-form-item>
      <!-- 多边形偏移单位 -->
      <el-form-item label="偏移单位">
        <el-slider
          v-model="materialFormRef.polygonOffsetUnits"
          :min="-10"
          :max="10"
          :step="0.1"
          @change="setMaterial({ polygonOffsetUnits: materialFormRef.polygonOffsetUnits })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.polygonOffsetUnits }}</span>
      </el-form-item>
      <!-- Alpha测试值 -->
      <el-form-item label="Alpha测试">
        <el-slider
          v-model="materialFormRef.alphaTest"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setMaterial({ alphaTest: materialFormRef.alphaTest })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.alphaTest?.toFixed(2) }}</span>
      </el-form-item>
      <!-- 着色器精度 -->
      <el-form-item label="着色器精度">
        <el-select
          v-model="materialFormRef.precision"
          @change="setMaterial({ precision: materialFormRef.precision })"
          class="property-input"
          size="small"
        >
          <el-option label="默认" :value="null" />
          <el-option label="highp" value="highp" />
          <el-option label="mediump" value="mediump" />
          <el-option label="lowp" value="lowp" />
        </el-select>
      </el-form-item>

      <el-divider>线框</el-divider>
      <!-- 线框显示 -->
      <el-form-item label="线框显示">
        <el-switch
          v-model="materialFormRef.wireframe"
          @change="setMaterial({ wireframe: materialFormRef.wireframe })"
          active-text="是"
          inactive-text="否"
          size="small"
        />
      </el-form-item>
      <!-- 线框宽度 -->
      <el-form-item label="线框宽度">
        <el-slider
          v-model="materialFormRef.wireframeLinewidth"
          :min="1"
          :max="10"
          :step="1"
          @change="setMaterial({ wireframeLinewidth: materialFormRef.wireframeLinewidth })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.wireframeLinewidth }}</span>
      </el-form-item>
      <!-- 线框端点样式 -->
      <el-form-item label="线框端点">
        <el-select
          v-model="materialFormRef.wireframeLinecap"
          @change="setMaterial({ wireframeLinecap: materialFormRef.wireframeLinecap })"
          class="property-input"
          size="small"
        >
          <el-option label="round" value="round" />
          <el-option label="butt" value="butt" />
          <el-option label="square" value="square" />
        </el-select>
      </el-form-item>
      <!-- 线框连接点样式 -->
      <el-form-item label="线框连接点">
        <el-select
          v-model="materialFormRef.wireframeLinejoin"
          @change="setMaterial({ wireframeLinejoin: materialFormRef.wireframeLinejoin })"
          class="property-input"
          size="small"
        >
          <el-option label="round" value="round" />
          <el-option label="bevel" value="bevel" />
          <el-option label="miter" value="miter" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
