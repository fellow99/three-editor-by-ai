<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';

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
    <div class="property-group">
      <label>类型:</label>
      <select v-model="materialType" @change="onMaterialTypeChange" class="property-input">
        <option value="MeshStandardMaterial">标准(Standard)</option>
        <option value="MeshPhysicalMaterial">物理(Physical)</option>
        <option value="MeshPhongMaterial">冯氏(Phong)</option>
        <option value="MeshLambertMaterial">兰伯特(Lambert)</option>
        <option value="MeshNormalMaterial">法向(Normal)</option>
        <option value="MeshBasicMaterial">基础(Basic)</option>
      </select>
    </div>
    <div class="property-group">
      <label>颜色:</label>
      <input 
        v-model="materialColor" 
        @input="updateMaterialColor"
        type="color"
        class="color-input"
      >
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>粗糙度:</label>
      <input 
        v-model.number="materialRoughness" 
        @input="updateMaterialRoughness"
        type="range" 
        min="0" 
        max="1" 
        step="0.01"
        class="range-input"
      >
      <span class="range-value">{{ materialRoughness.toFixed(2) }}</span>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>金属度:</label>
      <input 
        v-model.number="materialMetalness" 
        @input="updateMaterialMetalness"
        type="range" 
        min="0" 
        max="1" 
        step="0.01"
        class="range-input"
      >
      <span class="range-value">{{ materialMetalness.toFixed(2) }}</span>
    </div>
    <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>清漆(clearcoat):</label>
      <input 
        v-model.number="materialClearcoat" 
        @input="updateMaterialClearcoat"
        type="range" 
        min="0" 
        max="1" 
        step="0.01"
        class="range-input"
      >
      <span class="range-value">{{ materialClearcoat.toFixed(2) }}</span>
    </div>
    <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>清漆粗糙度(clearcoatRoughness):</label>
      <input 
        v-model.number="materialClearcoatRoughness" 
        @input="updateMaterialClearcoatRoughness"
        type="range" 
        min="0" 
        max="1" 
        step="0.01"
        class="range-input"
      >
      <span class="range-value">{{ materialClearcoatRoughness.toFixed(2) }}</span>
    </div>
    <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
      <label>高光(speclar):</label>
      <input 
        v-model="materialSpecular" 
        @input="updateMaterialSpecular"
        type="color"
        class="color-input"
      >
    </div>
    <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
      <label>高光强度(shininess):</label>
      <input 
        v-model.number="materialShininess" 
        @input="updateMaterialShininess"
        type="range" 
        min="0" 
        max="200" 
        step="1"
        class="range-input"
      >
      <span class="range-value">{{ materialShininess }}</span>
    </div>
    <div v-if="materialType==='MeshLambertMaterial'" class="property-group">
      <label>自发光(emissive):</label>
      <input 
        v-model="materialEmissive" 
        @input="updateMaterialEmissive"
        type="color"
        class="color-input"
      >
    </div>
    <!-- 纹理相关（多种类型） -->
    <div class="property-group">
      <label>颜色贴图(map):</label>
      <div v-if="selectedObject.material.map">
        <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('map')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'map'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境光遮蔽贴图(aoMap):</label>
      <div v-if="selectedObject.material.aoMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('aoMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>位移贴图(displacementMap):</label>
      <div v-if="selectedObject.material.displacementMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('displacementMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>法线贴图(normalMap):</label>
      <div v-if="selectedObject.material.normalMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('normalMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>金属度贴图(metalnessMap):</label>
      <div v-if="selectedObject.material.metalnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('metalnessMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>粗糙度贴图(roughnessMap):</label>
      <div v-if="selectedObject.material.roughnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('roughnessMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境映射贴图(envMap):</label>
      <div v-if="selectedObject.material.envMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('envMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'envMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshToonMaterial'" class="property-group">
      <label>渐变贴图(gradientMap):</label>
      <div v-if="selectedObject.material.gradientMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('gradientMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <div v-if="materialType==='MeshMatcapMaterial'" class="property-group">
      <label>Matcap贴图(matcap):</label>
      <div v-if="selectedObject.material.matcap">
        <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <button @click="clearTexture('matcap')" class="action-btn danger" style="margin-left:8px;">清除</button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <button @click="showTextureDialogType = 'matcap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
    </div>
    <TextureSelectDialog
      :visible="showTextureDialog"
      @close="showTextureDialog = false"
      @select="onTextureSelected"
    />
  </div>
</template>

<style scoped>
.property-section {
  margin-bottom: 24px;
  padding: 16px;
  overflow-y: auto;
  max-height: calc(100vh - 48px - 32px);
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
</style>
