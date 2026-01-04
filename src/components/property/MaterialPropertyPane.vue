<!--
  材质属性面板
  用于编辑选中对象的材质属性，包括颜色、纹理、粗糙度等
  支持多种材质类型（标准、物理、Phong等）
-->
<script setup>
import { ref, watch } from 'vue';
import TextureSelectDialog from '../dialog/TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../composables/useObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';

const objectSelection = useObjectSelection();
const objectManager = useObjectManager();

// 选中对象
const selectedObject = ref(null);
watch(() => objectSelection.selectedObjects.value, (objs) => {
  selectedObject.value = objs.length === 1 ? objs[0] : null;
}, { immediate: true });

// 材质相关响应式变量
const materialType = ref('MeshStandardMaterial');
const materialColor = ref('#888888');
const materialRoughness = ref(0.4);
const materialMetalness = ref(0.1);
const materialClearcoat = ref(0);
const materialClearcoatRoughness = ref(0);
const materialSpecular = ref('#ffffff');
const materialShininess = ref(30);
const materialEmissive = ref('#000000');

// 纹理弹窗相关
const showTextureDialog = ref(false);
const showTextureDialogType = ref('map');

// 监听对象变化，更新材质属性
watch(selectedObject, (object) => {
  if (object && object.material) {
    materialType.value = object.material.type || 'MeshStandardMaterial';
    materialColor.value = `#${object.material.color?.getHexString?.() ?? '888888'}`;
    materialRoughness.value = object.material.roughness ?? 0.4;
    materialMetalness.value = object.material.metalness ?? 0.1;
    materialClearcoat.value = object.material.clearcoat ?? 0;
    materialClearcoatRoughness.value = object.material.clearcoatRoughness ?? 0;
    materialSpecular.value = object.material.specular ? `#${object.material.specular.getHexString()}` : '#ffffff';
    materialShininess.value = object.material.shininess ?? 30;
    materialEmissive.value = object.material.emissive ? `#${object.material.emissive.getHexString()}` : '#000000';
  }
}, { immediate: true });

// 直接修改对象材质
function setMaterial(update) {
  if (!selectedObject.value) return;
  objectManager.setObjectMaterial(selectedObject.value.userData.id, update);
}
function onMaterialTypeChange() {
  setMaterial({ type: materialType.value });
}
function updateMaterialColor() {
  setMaterial({ color: materialColor.value });
}
function updateMaterialRoughness() {
  setMaterial({ roughness: materialRoughness.value });
}
function updateMaterialMetalness() {
  setMaterial({ metalness: materialMetalness.value });
}
function updateMaterialClearcoat() {
  setMaterial({ clearcoat: materialClearcoat.value });
}
function updateMaterialClearcoatRoughness() {
  setMaterial({ clearcoatRoughness: materialClearcoatRoughness.value });
}
function updateMaterialSpecular() {
  setMaterial({ specular: materialSpecular.value.replace('#', '0x') });
}
function updateMaterialShininess() {
  setMaterial({ shininess: materialShininess.value });
}
function updateMaterialEmissive() {
  setMaterial({ emissive: materialEmissive.value.replace('#', '0x') });
}
function clearTexture(type) {
  setMaterial({ [type]: null });
}
function onTextureSelected(textureInfo) {
  showTextureDialog.value = false;
  if (textureInfo?.texture) {
    setMaterial({ [showTextureDialogType.value]: textureInfo.texture });
  }
}
function getTexturePreviewSrc(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL();
}
</script>

<template>
  <div v-if="selectedObject && selectedObject.material" class="property-section">
    <h4>材质</h4>
    <el-form label-width="70px">
      <el-form-item label="类型">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度">
        <el-slider
          v-model="materialRoughness"
          :min="0"
          :max="1"
          :step="0.01"
          @change="updateMaterialRoughness"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialRoughness.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度">
        <el-slider
          v-model="materialMetalness"
          :min="0"
          :max="1"
          :step="0.01"
          @change="updateMaterialMetalness"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialMetalness.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat)">
        <el-slider
          v-model="materialClearcoat"
          :min="0"
          :max="1"
          :step="0.01"
          @change="updateMaterialClearcoat"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialClearcoat.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度">
        <el-slider
          v-model="materialClearcoatRoughness"
          :min="0"
          :max="1"
          :step="0.01"
          @change="updateMaterialClearcoatRoughness"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialClearcoatRoughness.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度">
        <el-slider
          v-model="materialShininess"
          :min="0"
          :max="200"
          :step="1"
          @change="updateMaterialShininess"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialShininess }}</span>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <!-- 统一贴图相关写法 -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('map')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('envMap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture('matcap')">清理</el-button>
          <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true">重选</el-button>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true">选择</el-button>
      </el-form-item>
    </el-form>
    <TextureSelectDialog
      v-model="showTextureDialog"
      @select="onTextureSelected"
    />
  </div>
</template>

<style lang="scss" scoped>
.property-section {
  padding: 8px;
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
.color-input {
  width: 100%;
  height: 32px;
  padding: 2px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
}
.range-input {
  flex: 1;
  margin-right: 8px;
}
.range-value {
  font-size: 12px;
  color: #ccc;
  min-width: 40px;
}
.action-btn {
  padding: 8px 12px;
  background: #007acc;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}
.action-btn:hover {
  background: #0088dd;
}
.action-btn.danger {
  background: #d73a49;
}
.action-btn.danger:hover {
  background: #e85662;
}
.texture-preview-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  height: 24px;

  .texture-preview-img {
    width: 48px;
    height: 24px;
    border: 1px solid #555;
    display: inline-block;
    border-radius: 4px;
  }
  .el-button {
    margin-left: 8px;
  }
}
</style>
