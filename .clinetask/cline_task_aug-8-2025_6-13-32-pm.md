**User:**

<task>
改造MaterialPropertyPanel.vue：
- 一些UI组件改为使用element-plus的相关组件
</task>
<environment_details>
# VSCode Visible Files
src/components/editor/ScenePropertyPanel.vue

# VSCode Open Tabs
src/components/editor/ScenePropertyPanel.vue

# Current Time
2025/8/8 下午5:55:30 (Asia/Shanghai, UTC+8:00)

# Current Working Directory (d:/pci-workspace/3D/three-editor-by-ai) Files
.gitignore
index.html
LICENSE
package-lock.json
package.json
README.md
vite.config.js
public/
public/images/
public/images/screenshot01.png
src/
src/App.vue
src/Editor.vue
src/main.js
src/style.css
src/style.scss
src/assets/
src/assets/vue.svg
src/components/
src/components/editor/
src/components/editor/AssetBrowser.vue
src/components/editor/EditorFooter.vue
src/components/editor/Inspector.vue
src/components/editor/MaterialPropertyPanel.vue
src/components/editor/ObjectItem.vue
src/components/editor/ObjectPropertyPanel.vue
src/components/editor/PropertyPanel.vue
src/components/editor/ResourcePanel.vue
src/components/editor/ScenePropertyPanel.vue
src/components/editor/TextureSelectDialog.vue
src/components/editor/Toolbar.vue
src/components/scene/
src/components/scene/CubeViewportControls.vue
src/components/scene/InteractionHints.vue
src/components/scene/ObjectGizmo.vue
src/components/scene/SceneViewer.vue
src/components/scene/ViewportControls.vue
src/composables/
src/composables/useAssets.js
src/composables/useObjectSelection.js
src/composables/useScene.js
src/composables/useTransform.js
src/core/
src/core/AssetLoader.js
src/core/InputManager.js
src/core/ObjectManager.js
src/core/SceneManager.js
src/services/
src/services/api.js
src/utils/
src/utils/fileUtils.js
src/utils/geometryUtils.js
src/utils/mathUtils.js

# Git Remote URLs
origin: https://github.com/fellow99/three-editor-by-ai.git

# Context Window Usage
0 / 128K tokens used (0%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
根据用户需求，需要将 MaterialPropertyPanel.vue 中部分 UI 组件替换为 element-plus 的相关组件。首先需要读取 src/components/editor/MaterialPropertyPanel.vue 文件内容，分析当前使用的 UI 组件，确定哪些可以替换为 element-plus 组件。之后再进行具体替换。
</thinking>

<read_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
</read_file>

---

**User:**

[read_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
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

<environment_details>
# VSCode Visible Files
src/components/editor/ScenePropertyPanel.vue

# VSCode Open Tabs
src/components/editor/ScenePropertyPanel.vue

# Current Time
2025/8/8 下午5:55:34 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
12,952 / 111.452K tokens used (12%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
需要将 MaterialPropertyPanel.vue 中的 select、input[type=color]、input[type=range]、button 等原生UI组件替换为 element-plus 组件。常用替换如下：
- select → ElSelect/ElOption
- input[type=color] → ElColorPicker
- input[type=range] → ElSlider
- button → ElButton
同时需要在 script 部分引入 element-plus 组件，并保证样式和交互逻辑不变。先进行这些组件替换，之后再根据自动格式化后的内容继续调整。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
=======
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
+++++++ REPLACE

------- SEARCH
      <label>类型:</label>
      <select v-model="materialType" @change="onMaterialTypeChange" class="property-input">
        <option value="MeshStandardMaterial">标准(Standard)</option>
        <option value="MeshPhysicalMaterial">物理(Physical)</option>
        <option value="MeshPhongMaterial">冯氏(Phong)</option>
        <option value="MeshLambertMaterial">兰伯特(Lambert)</option>
        <option value="MeshNormalMaterial">法向(Normal)</option>
        <option value="MeshBasicMaterial">基础(Basic)</option>
      </select>
=======
      <label>类型:</label>
      <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
        <el-option label="标准(Standard)" value="MeshStandardMaterial" />
        <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
        <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
        <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
        <el-option label="法向(Normal)" value="MeshNormalMaterial" />
        <el-option label="基础(Basic)" value="MeshBasicMaterial" />
      </el-select>
+++++++ REPLACE

------- SEARCH
      <label>颜色:</label>
      <input 
        v-model="materialColor" 
        @input="updateMaterialColor"
        type="color"
        class="color-input"
      >
=======
      <label>颜色:</label>
      <el-color-picker
        v-model="materialColor"
        @change="updateMaterialColor"
        class="color-input"
        size="small"
      />
+++++++ REPLACE

------- SEARCH
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
=======
      <label>粗糙度:</label>
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
+++++++ REPLACE

------- SEARCH
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
=======
      <label>金属度:</label>
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
+++++++ REPLACE

------- SEARCH
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
=======
      <label>清漆(clearcoat):</label>
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
+++++++ REPLACE

------- SEARCH
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
=======
      <label>清漆粗糙度(clearcoatRoughness):</label>
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
+++++++ REPLACE

------- SEARCH
      <label>高光(speclar):</label>
      <input 
        v-model="materialSpecular" 
        @input="updateMaterialSpecular"
        type="color"
        class="color-input"
      >
=======
      <label>高光(speclar):</label>
      <el-color-picker
        v-model="materialSpecular"
        @change="updateMaterialSpecular"
        class="color-input"
        size="small"
      />
+++++++ REPLACE

------- SEARCH
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
=======
      <label>高光强度(shininess):</label>
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
+++++++ REPLACE

------- SEARCH
      <label>自发光(emissive):</label>
      <input 
        v-model="materialEmissive" 
        @input="updateMaterialEmissive"
        type="color"
        class="color-input"
      >
=======
      <label>自发光(emissive):</label>
      <el-color-picker
        v-model="materialEmissive"
        @change="updateMaterialEmissive"
        class="color-input"
        size="small"
      />
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('map')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'map'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('aoMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('displacementMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('normalMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('metalnessMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('roughnessMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('envMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'envMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('gradientMap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE

------- SEARCH
        <button @click="clearTexture('matcap')" class="action-btn danger" style="margin-left:8px;">清除</button>
=======
        <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
+++++++ REPLACE

------- SEARCH
      <button @click="showTextureDialogType = 'matcap'; showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择</button>
=======
      <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
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
    <div class="property-group">
      <label>类型:</label>
      <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
        <el-option label="标准(Standard)" value="MeshStandardMaterial" />
        <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
        <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
        <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
        <el-option label="法向(Normal)" value="MeshNormalMaterial" />
        <el-option label="基础(Basic)" value="MeshBasicMaterial" />
      </el-select>
    </div>
    <div class="property-group">
      <label>颜色:</label>
      <el-color-picker
        v-model="materialColor"
        @change="updateMaterialColor"
        class="color-input"
        size="small"
      />
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>粗糙度:</label>
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
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>金属度:</label>
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
    </div>
    <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>清漆(clearcoat):</label>
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
    </div>
    <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>清漆粗糙度(clearcoatRoughness):</label>
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
    </div>
    <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
      <label>高光(speclar):</label>
      <el-color-picker
        v-model="materialSpecular"
        @change="updateMaterialSpecular"
        class="color-input"
        size="small"
      />
    </div>
    <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
      <label>高光强度(shininess):</label>
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
    </div>
    <div v-if="materialType==='MeshLambertMaterial'" class="property-group">
      <label>自发光(emissive):</label>
      <el-color-picker
        v-model="materialEmissive"
        @change="updateMaterialEmissive"
        class="color-input"
        size="small"
      />
    </div>
    <!-- 纹理相关（多种类型） -->
    <div class="property-group">
      <label>颜色贴图(map):</label>
      <div v-if="selectedObject.material.map">
        <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境光遮蔽贴图(aoMap):</label>
      <div v-if="selectedObject.material.aoMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>位移贴图(displacementMap):</label>
      <div v-if="selectedObject.material.displacementMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>法线贴图(normalMap):</label>
      <div v-if="selectedObject.material.normalMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>金属度贴图(metalnessMap):</label>
      <div v-if="selectedObject.material.metalnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>粗糙度贴图(roughnessMap):</label>
      <div v-if="selectedObject.material.roughnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境映射贴图(envMap):</label>
      <div v-if="selectedObject.material.envMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshToonMaterial'" class="property-group">
      <label>渐变贴图(gradientMap):</label>
      <div v-if="selectedObject.material.gradientMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshMatcapMaterial'" class="property-group">
      <label>Matcap贴图(matcap):</label>
      <div v-if="selectedObject.material.matcap">
        <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午5:56:47 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
18,408 / 111.452K tokens used (17%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
已完成MaterialPropertyPanel.vue的element-plus组件替换。根据规范，新增或修改文件后需同步更新/README.md的项目结构说明。下一步读取/README.md，分析并补充MaterialPropertyPanel.vue的element-plus改造说明。
</thinking>

<read_file>
<path>README.md</path>
</read_file>

---

**User:**

[read_file for 'README.md'] Result:
# 3D 场景编辑器 (Three Editor by AI)

一个基于 Vue 3 + Three.js 的现代化3D场景编辑器，支持三维模型的拖放、调整和属性配置。
本工程完全使用AI自行编写代码。

## 🎨 截图
![截图1](public/images/screenshot01.png)

## ✅ 功能体系
- 3D场景渲染和管理
- 多种基础几何体创建
- 完整的对象变换系统（移动、旋转、缩放）
- 撤销重做历史记录
- 3D模型和纹理加载（GLTF、OBJ、FBX等格式）
- 拖拽上传和资源管理
- 相机控制和预设视角
- 材质编辑和属性调整（支持多种材质类型选择与参数动态配置）
- 场景序列化和导入导出

## 🚀 技术栈

- **前端框架**: Vue 3 + Vite
- **3D引擎**: Three.js
- **构建工具**: Vite
- **网络请求**: Fetch API
- **工具库**: 
  - Element Plus - 主流UI组件库
  - Lodash - 实用工具函数库
  - Day.js - 轻量级日期时间库
  - three-viewport-gizmo - 立方体视角控件库

## 📁 项目结构

```
three-editor-by-ai/
├── public/                     # 静态资源
│   └── vite.svg
├── src/
│   ├── assets/                 # 静态资源 (3D模型、纹理等)
│   │   └── vue.svg
│   ├── components/             # Vue 组件
│   │   ├── editor/            # 编辑器 UI 组件
│   │   │   ├── PropertyPanel.vue    # 属性面板
│   │   │   ├── ScenePropertyPanel.vue    # 场景属性面板
│   │   │   ├── ObjectPropertyPanel.vue    # 对象基本属性面板
│   │   │   ├── MaterialPropertyPanel.vue    # 材质编辑面板
│   │   │   ├── TextureSelectDialog.vue # 纹理选择对话框
│   │   │   ├── Toolbar.vue          # 工具栏
│   │   │   ├── EditorFooter.vue     # 编辑器底部状态栏
│   │   │   ├── AssetBrowser.vue     # 资源浏览器
│   │   │   ├── ResourcePanel.vue    # 资源面板
│   │   │   └── Inspector.vue        # 对象检查器
│   │   ├── scene/             # 3D 场景组件
│   │   │   ├── SceneViewer.vue      # 主场景视图
│   │   │   ├── InteractionHints.vue     # 操作提示组件
│   │   │   ├── ViewportControls.vue     # 视图控制面板组件
│   │   │   ├── CubeViewportControls.vue # 立方体视角控件
│   │   │   ├── ObjectGizmo.vue      # 对象操作控制器
│   ├── composables/           # Vue Composition API 可组合函数
│   │   ├── useScene.js        # 场景管理
│   │   ├── useObjectSelection.js  # 对象选择
│   │   ├── useTransform.js    # 变换操作
│   │   └── useAssets.js       # 资源管理
│   ├── core/                  # 核心 Three.js 逻辑
│   │   ├── SceneManager.js    # 场景管理器
│   │   ├── ObjectManager.js   # 对象管理器
│   │   ├── InputManager.js    # 输入处理
│   │   └── AssetLoader.js     # 资源加载器
│   ├── api/                  # API 接口
│   │   ├── *.api.js            # 各种模块API接口
│   ├── utils/                 # 工具函数
│   │   ├── mathUtils.js      # 数学工具
│   │   ├── geometryUtils.js  # 几何工具
│   │   └── fileUtils.js      # 文件处理工具
│   ├── App.vue               # 根组件（仅负责引入Editor.vue）
│   ├── Editor.vue            # 主编辑器组件（包含全部业务与UI）
│   ├── main.js               # 应用入口
│   └── style.css             # 全局样式
├── .gitignore                # Git 忽略文件
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── package-lock.json         # 依赖锁定
├── vite.config.js            # Vite 配置
└── README.md                 # 项目说明
```

**注意：**
- vite.config.js中，配置vite-plugin-static-copy，把几个js库的复制到目标路径：
  - 如需加载Draco压缩的glTF模型，请将node_modules/three/examples/jsm/libs/draco/目录中的文件复制到 /draco/ 目录下。
  - 如需加载KTX2纹理，请将node_modules/three/examples/jsm/libs/basis目录中的文件放入 /basis/ 目录下。
  - 如需加载Meshopt压缩的glTF模型，请将node_modules/three/examples/jsm/libs/meshopt_decoder.module.js文件放入 public/meshopt/ 目录下。

## 🎯 主要功能

- **3D场景渲染**: 基于 Three.js 的高性能 3D 渲染，支持灯光、相机helper自动可视化
- **几何体创建**: 支持多种基础和扩展几何体创建
  - 基础几何体: 立方体、球体、圆柱体、平面、圆锥体、圆环体
  - 扩展几何体: 十二面体、二十面体、八面体、四面体、环形、管道
  - 灯光对象: 方向光、点光源、聚光灯、环境光、半球光
  - 其他对象: 相机、空对象、文本、精灵
- **模型管理**: 支持多种 3D 模型格式的导入和管理
- **交互操作**: 
  - 资源浏览器中直接添加几何体
  - 实时变换操作 (位移、旋转、缩放)
  - 单对象选择和编辑
  - 支持相机控制模式切换：OrbitControls（鼠标）与FlyControls（键盘飞行模式），可在操作提示区勾选“键盘控制”启停
- **属性编辑**: 实时修改模型的材质、几何体等属性
- **场景管理**: 完整的场景层级管理和序列化
- **资源浏览**: 内置资源管理器，支持模型预览和几何体创建
- **后处理机制**: 
  - 集成了Three.js EffectComposer后处理框架，支持多种后处理效果链路（如Bloom、FXAA等）。
  - 提供统一API，可动态添加、移除、调整各类Pass。
  - 主要API：
    - `scene.sceneManager.addPass(pass, index)`：添加指定Pass到后处理链（可指定插入顺序）。
    - `scene.sceneManager.removePass(pass)`：移除指定Pass。
    - `scene.sceneManager.setPassParams(pass, params)`：批量修改Pass参数。
  - 默认已集成RenderPass，业务层可通过`scene.sceneManager.addPass(...)`等方法灵活扩展后处理效果。

## 🏗️ 架构设计

### 组件层次

1. **UI 层** (`components/editor/`): 负责用户界面和交互
2. **主编辑器组件** (`Editor.vue`): 负责所有业务逻辑和UI的集成
3. **3D 渲染层** (`components/scene/`): 处理 3D 场景渲染和显示
4. **逻辑层** (`composables/`, `core/`): 业务逻辑和状态管理
5. **API层** (`api/`): 数据请求和外部接口
6. **工具层** (`utils/`): 通用工具函数

### 技术特点

- **响应式状态**: 使用 Vue 3 Composition API 管理应用状态
- **模块化设计**: 清晰的代码组织和职责分离
- **类型安全**: 良好的代码结构支持 TypeScript 迁移
- **性能优化**: 合理的组件懒加载和渲染优化

## 📋 开发规范

- 遵循 Vue 3 组合式 API 最佳实践
- 使用 ES6+ 语法特性
- 组件命名采用 PascalCase
- 文件和目录命名采用 camelCase
- Git 提交信息格式: `feat: 功能描述`
- 【重要】SceneViewer.vue中TransformControls拖拽时会自动禁用OrbitControls，避免拖拽时镜头跟随问题。若遇到该问题，请优先排查controls.enabled赋值冲突（如飞行控制切换、其他组件逻辑），并参考SceneViewer.vue相关注释。


## 💯 AI
- 本工程完全使用AI自行编写代码（人工编写代码目前少于10行）；
- 开发环境：VSCode + Cline + GitHub Copilot + Claude 4 / GPT-4.1
- 使用Claude 4搭建本工程的主体框架，但由于GitHub Copilot Pro版2天内就消耗完（300 Premium requests），后转向使用GPT-4.1实现各项功能。
- .clinerules目录：存储AI规则
- .clinetask目录：存储历史对话

<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午5:56:51 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
22,404 / 111.452K tokens used (20%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
需要在README.md的项目结构部分补充MaterialPropertyPanel.vue已完成element-plus组件改造的说明。根据规范，需在相关组件条目后添加简要说明，例如“已使用element-plus重构UI”。直接在项目结构表格的MaterialPropertyPanel.vue条目后添加注释。
</thinking>

<replace_in_file>
<path>README.md</path>
<diff>
------- SEARCH
│   │   │   ├── MaterialPropertyPanel.vue    # 材质编辑面板
=======
│   │   │   ├── MaterialPropertyPanel.vue    # 材质编辑面板（已使用element-plus重构UI组件）
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'README.md'] Result:
The content was successfully saved to README.md.

Here is the full, updated content of the file that was saved:

<final_file_content path="README.md">
# 3D 场景编辑器 (Three Editor by AI)

一个基于 Vue 3 + Three.js 的现代化3D场景编辑器，支持三维模型的拖放、调整和属性配置。
本工程完全使用AI自行编写代码。

## 🎨 截图
![截图1](public/images/screenshot01.png)

## ✅ 功能体系
- 3D场景渲染和管理
- 多种基础几何体创建
- 完整的对象变换系统（移动、旋转、缩放）
- 撤销重做历史记录
- 3D模型和纹理加载（GLTF、OBJ、FBX等格式）
- 拖拽上传和资源管理
- 相机控制和预设视角
- 材质编辑和属性调整（支持多种材质类型选择与参数动态配置）
- 场景序列化和导入导出

## 🚀 技术栈

- **前端框架**: Vue 3 + Vite
- **3D引擎**: Three.js
- **构建工具**: Vite
- **网络请求**: Fetch API
- **工具库**: 
  - Element Plus - 主流UI组件库
  - Lodash - 实用工具函数库
  - Day.js - 轻量级日期时间库
  - three-viewport-gizmo - 立方体视角控件库

## 📁 项目结构

```
three-editor-by-ai/
├── public/                     # 静态资源
│   └── vite.svg
├── src/
│   ├── assets/                 # 静态资源 (3D模型、纹理等)
│   │   └── vue.svg
│   ├── components/             # Vue 组件
│   │   ├── editor/            # 编辑器 UI 组件
│   │   │   ├── PropertyPanel.vue    # 属性面板
│   │   │   ├── ScenePropertyPanel.vue    # 场景属性面板
│   │   │   ├── ObjectPropertyPanel.vue    # 对象基本属性面板
│   │   │   ├── MaterialPropertyPanel.vue    # 材质编辑面板（已使用element-plus重构UI组件）
│   │   │   ├── TextureSelectDialog.vue # 纹理选择对话框
│   │   │   ├── Toolbar.vue          # 工具栏
│   │   │   ├── EditorFooter.vue     # 编辑器底部状态栏
│   │   │   ├── AssetBrowser.vue     # 资源浏览器
│   │   │   ├── ResourcePanel.vue    # 资源面板
│   │   │   └── Inspector.vue        # 对象检查器
│   │   ├── scene/             # 3D 场景组件
│   │   │   ├── SceneViewer.vue      # 主场景视图
│   │   │   ├── InteractionHints.vue     # 操作提示组件
│   │   │   ├── ViewportControls.vue     # 视图控制面板组件
│   │   │   ├── CubeViewportControls.vue # 立方体视角控件
│   │   │   ├── ObjectGizmo.vue      # 对象操作控制器
│   ├── composables/           # Vue Composition API 可组合函数
│   │   ├── useScene.js        # 场景管理
│   │   ├── useObjectSelection.js  # 对象选择
│   │   ├── useTransform.js    # 变换操作
│   │   └── useAssets.js       # 资源管理
│   ├── core/                  # 核心 Three.js 逻辑
│   │   ├── SceneManager.js    # 场景管理器
│   │   ├── ObjectManager.js   # 对象管理器
│   │   ├── InputManager.js    # 输入处理
│   │   └── AssetLoader.js     # 资源加载器
│   ├── api/                  # API 接口
│   │   ├── *.api.js            # 各种模块API接口
│   ├── utils/                 # 工具函数
│   │   ├── mathUtils.js      # 数学工具
│   │   ├── geometryUtils.js  # 几何工具
│   │   └── fileUtils.js      # 文件处理工具
│   ├── App.vue               # 根组件（仅负责引入Editor.vue）
│   ├── Editor.vue            # 主编辑器组件（包含全部业务与UI）
│   ├── main.js               # 应用入口
│   └── style.css             # 全局样式
├── .gitignore                # Git 忽略文件
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── package-lock.json         # 依赖锁定
├── vite.config.js            # Vite 配置
└── README.md                 # 项目说明
```

**注意：**
- vite.config.js中，配置vite-plugin-static-copy，把几个js库的复制到目标路径：
  - 如需加载Draco压缩的glTF模型，请将node_modules/three/examples/jsm/libs/draco/目录中的文件复制到 /draco/ 目录下。
  - 如需加载KTX2纹理，请将node_modules/three/examples/jsm/libs/basis目录中的文件放入 /basis/ 目录下。
  - 如需加载Meshopt压缩的glTF模型，请将node_modules/three/examples/jsm/libs/meshopt_decoder.module.js文件放入 public/meshopt/ 目录下。

## 🎯 主要功能

- **3D场景渲染**: 基于 Three.js 的高性能 3D 渲染，支持灯光、相机helper自动可视化
- **几何体创建**: 支持多种基础和扩展几何体创建
  - 基础几何体: 立方体、球体、圆柱体、平面、圆锥体、圆环体
  - 扩展几何体: 十二面体、二十面体、八面体、四面体、环形、管道
  - 灯光对象: 方向光、点光源、聚光灯、环境光、半球光
  - 其他对象: 相机、空对象、文本、精灵
- **模型管理**: 支持多种 3D 模型格式的导入和管理
- **交互操作**: 
  - 资源浏览器中直接添加几何体
  - 实时变换操作 (位移、旋转、缩放)
  - 单对象选择和编辑
  - 支持相机控制模式切换：OrbitControls（鼠标）与FlyControls（键盘飞行模式），可在操作提示区勾选“键盘控制”启停
- **属性编辑**: 实时修改模型的材质、几何体等属性
- **场景管理**: 完整的场景层级管理和序列化
- **资源浏览**: 内置资源管理器，支持模型预览和几何体创建
- **后处理机制**: 
  - 集成了Three.js EffectComposer后处理框架，支持多种后处理效果链路（如Bloom、FXAA等）。
  - 提供统一API，可动态添加、移除、调整各类Pass。
  - 主要API：
    - `scene.sceneManager.addPass(pass, index)`：添加指定Pass到后处理链（可指定插入顺序）。
    - `scene.sceneManager.removePass(pass)`：移除指定Pass。
    - `scene.sceneManager.setPassParams(pass, params)`：批量修改Pass参数。
  - 默认已集成RenderPass，业务层可通过`scene.sceneManager.addPass(...)`等方法灵活扩展后处理效果。

## 🏗️ 架构设计

### 组件层次

1. **UI 层** (`components/editor/`): 负责用户界面和交互
2. **主编辑器组件** (`Editor.vue`): 负责所有业务逻辑和UI的集成
3. **3D 渲染层** (`components/scene/`): 处理 3D 场景渲染和显示
4. **逻辑层** (`composables/`, `core/`): 业务逻辑和状态管理
5. **API层** (`api/`): 数据请求和外部接口
6. **工具层** (`utils/`): 通用工具函数

### 技术特点

- **响应式状态**: 使用 Vue 3 Composition API 管理应用状态
- **模块化设计**: 清晰的代码组织和职责分离
- **类型安全**: 良好的代码结构支持 TypeScript 迁移
- **性能优化**: 合理的组件懒加载和渲染优化

## 📋 开发规范

- 遵循 Vue 3 组合式 API 最佳实践
- 使用 ES6+ 语法特性
- 组件命名采用 PascalCase
- 文件和目录命名采用 camelCase
- Git 提交信息格式: `feat: 功能描述`
- 【重要】SceneViewer.vue中TransformControls拖拽时会自动禁用OrbitControls，避免拖拽时镜头跟随问题。若遇到该问题，请优先排查controls.enabled赋值冲突（如飞行控制切换、其他组件逻辑），并参考SceneViewer.vue相关注释。


## 💯 AI
- 本工程完全使用AI自行编写代码（人工编写代码目前少于10行）；
- 开发环境：VSCode + Cline + GitHub Copilot + Claude 4 / GPT-4.1
- 使用Claude 4搭建本工程的主体框架，但由于GitHub Copilot Pro版2天内就消耗完（300 Premium requests），后转向使用GPT-4.1实现各项功能。
- .clinerules目录：存储AI规则
- .clinetask目录：存储历史对话

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
README.md

# VSCode Open Tabs
src/components/editor/MaterialPropertyPanel.vue
README.md

# Current Time
2025/8/8 下午5:57:01 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
23,793 / 111.452K tokens used (21%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
已完成 MaterialPropertyPanel.vue 的 UI 组件改造，所有 select、color、range、button 等原生控件已替换为 element-plus 组件，并已在 README.md 的项目结构部分补充“已使用element-plus重构UI组件”说明，符合项目规范要求。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
<el-form label-width="70px">
</feedback>
<environment_details>
# VSCode Visible Files
src/components/editor/ScenePropertyPanel.vue

# VSCode Open Tabs
src/components/editor/MaterialPropertyPanel.vue
README.md
src/components/editor/ScenePropertyPanel.vue

# Current Time
2025/8/8 下午5:58:07 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
25,263 / 111.452K tokens used (23%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
用户反馈建议使用<el-form label-width="70px">，即希望将属性面板表单结构统一用element-plus的el-form组件包裹，并设置label宽度。需将MaterialPropertyPanel.vue的主要表单内容用el-form包裹，label宽度设置为70px，原有label可改为el-form-item的label属性。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
  <div v-if="selectedObject && selectedObject.material" class="property-section">
    <h4>材质</h4>
    <div class="property-group">
      <label>类型:</label>
      <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
        <el-option label="标准(Standard)" value="MeshStandardMaterial" />
        <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
        <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
        <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
        <el-option label="法向(Normal)" value="MeshNormalMaterial" />
        <el-option label="基础(Basic)" value="MeshBasicMaterial" />
      </el-select>
    </div>
    <div class="property-group">
      <label>颜色:</label>
      <el-color-picker
        v-model="materialColor"
        @change="updateMaterialColor"
        class="color-input"
        size="small"
      />
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>粗糙度:</label>
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
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>金属度:</label>
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
    </div>
    <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>清漆(clearcoat):</label>
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
    </div>
    <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>清漆粗糙度(clearcoatRoughness):</label>
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
    </div>
    <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
      <label>高光(speclar):</label>
      <el-color-picker
        v-model="materialSpecular"
        @change="updateMaterialSpecular"
        class="color-input"
        size="small"
      />
    </div>
    <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
      <label>高光强度(shininess):</label>
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
    </div>
    <div v-if="materialType==='MeshLambertMaterial'" class="property-group">
      <label>自发光(emissive):</label>
      <el-color-picker
        v-model="materialEmissive"
        @change="updateMaterialEmissive"
        class="color-input"
        size="small"
      />
    </div>
=======
  <div v-if="selectedObject && selectedObject.material" class="property-section">
    <h4>材质</h4>
    <el-form label-width="70px">
      <el-form-item label="类型:">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色:">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
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
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
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
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
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
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
    </el-form>
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
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
      <el-form-item label="类型:">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色:">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
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
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
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
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
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
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
    </el-form>
    <!-- 纹理相关（多种类型） -->
    <div class="property-group">
      <label>颜色贴图(map):</label>
      <div v-if="selectedObject.material.map">
        <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境光遮蔽贴图(aoMap):</label>
      <div v-if="selectedObject.material.aoMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>位移贴图(displacementMap):</label>
      <div v-if="selectedObject.material.displacementMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>法线贴图(normalMap):</label>
      <div v-if="selectedObject.material.normalMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>金属度贴图(metalnessMap):</label>
      <div v-if="selectedObject.material.metalnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>粗糙度贴图(roughnessMap):</label>
      <div v-if="selectedObject.material.roughnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境映射贴图(envMap):</label>
      <div v-if="selectedObject.material.envMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshToonMaterial'" class="property-group">
      <label>渐变贴图(gradientMap):</label>
      <div v-if="selectedObject.material.gradientMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshMatcapMaterial'" class="property-group">
      <label>Matcap贴图(matcap):</label>
      <div v-if="selectedObject.material.matcap">
        <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午5:58:32 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
27,310 / 111.452K tokens used (25%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
已将 MaterialPropertyPanel.vue 的属性表单部分统一用 element-plus 的 el-form 包裹，并设置 label-width="70px"，所有属性项已用 el-form-item 组织，符合 element-plus 表单规范和用户反馈要求。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
纹理相关也放在el-form和el-form-item中
</feedback>
<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午5:59:42 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
31,310 / 111.452K tokens used (28%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
用户反馈需将纹理相关部分也放入el-form和el-form-item中。需将所有纹理贴图（map、aoMap、displacementMap等）相关内容，按属性项分别用el-form-item包裹，并移入el-form标签内，label设置为对应贴图名称。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
    </el-form>
    <!-- 纹理相关（多种类型） -->
    <div class="property-group">
      <label>颜色贴图(map):</label>
      <div v-if="selectedObject.material.map">
        <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境光遮蔽贴图(aoMap):</label>
      <div v-if="selectedObject.material.aoMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>位移贴图(displacementMap):</label>
      <div v-if="selectedObject.material.displacementMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>法线贴图(normalMap):</label>
      <div v-if="selectedObject.material.normalMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>金属度贴图(metalnessMap):</label>
      <div v-if="selectedObject.material.metalnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>粗糙度贴图(roughnessMap):</label>
      <div v-if="selectedObject.material.roughnessMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
      <label>环境映射贴图(envMap):</label>
      <div v-if="selectedObject.material.envMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshToonMaterial'" class="property-group">
      <label>渐变贴图(gradientMap):</label>
      <div v-if="selectedObject.material.gradientMap">
        <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <div v-if="materialType==='MeshMatcapMaterial'" class="property-group">
      <label>Matcap贴图(matcap):</label>
      <div v-if="selectedObject.material.matcap">
        <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
        <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
      </div>
      <div v-else>
        <span style="color:#aaa;">无</span>
      </div>
      <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
    </div>
    <TextureSelectDialog
      :visible="showTextureDialog"
      @close="showTextureDialog = false"
      @select="onTextureSelected"
    />
  </div>
=======
    <!-- 纹理相关（多种类型） -->
    <el-form label-width="70px">
      <el-form-item label="颜色贴图(map):">
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图(aoMap):">
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图(displacementMap):">
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图(normalMap):">
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图(metalnessMap):">
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图(roughnessMap):">
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图(envMap):">
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图(gradientMap):">
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图(matcap):">
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
    <TextureSelectDialog
      :visible="showTextureDialog"
      @close="showTextureDialog = false"
      @select="onTextureSelected"
    />
  </div>
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
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
      <el-form-item label="类型:">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色:">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
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
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
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
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
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
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
    <!-- 纹理相关（多种类型） -->
    <el-form label-width="70px">
      <el-form-item label="颜色贴图(map):">
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图(aoMap):">
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图(displacementMap):">
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图(normalMap):">
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图(metalnessMap):">
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图(roughnessMap):">
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图(envMap):">
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图(gradientMap):">
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图(matcap):">
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.



New problems detected after saving the file:
src/components/editor/MaterialPropertyPanel.vue
- [vue Error] Line 103: Element is missing end tag.
<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:00:22 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
34,842 / 111.452K tokens used (31%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
编译错误：Element is missing end tag。原因是嵌套了两个<el-form>，第一个<el-form>没有闭合，导致标签结构错误。解决方案：将所有el-form-item（包括纹理相关）合并到同一个el-form内，删除多余的el-form标签，保证结构闭合。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
    <el-form label-width="70px">
      <el-form-item label="类型:">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色:">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
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
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
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
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
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
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
    <!-- 纹理相关（多种类型） -->
    <el-form label-width="70px">
      <el-form-item label="颜色贴图(map):">
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图(aoMap):">
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图(displacementMap):">
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图(normalMap):">
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图(metalnessMap):">
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图(roughnessMap):">
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图(envMap):">
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图(gradientMap):">
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图(matcap):">
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
    <TextureSelectDialog
      :visible="showTextureDialog"
      @close="showTextureDialog = false"
      @select="onTextureSelected"
    />
  </div>
=======
    <el-form label-width="70px">
      <el-form-item label="类型:">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色:">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
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
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
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
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
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
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图(map):">
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图(aoMap):">
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图(displacementMap):">
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图(normalMap):">
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图(metalnessMap):">
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图(roughnessMap):">
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图(envMap):">
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图(gradientMap):">
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图(matcap):">
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
    <TextureSelectDialog
      :visible="showTextureDialog"
      @close="showTextureDialog = false"
      @select="onTextureSelected"
    />
  </div>
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
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
      <el-form-item label="类型:">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色:">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
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
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
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
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
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
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图(map):">
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图(aoMap):">
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图(displacementMap):">
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图(normalMap):">
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图(metalnessMap):">
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图(roughnessMap):">
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图(envMap):">
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图(gradientMap):">
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图(matcap):">
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:02:11 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
44,006 / 111.452K tokens used (39%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
已将所有纹理相关内容（颜色贴图、环境光遮蔽贴图、位移贴图、法线贴图、金属度贴图、粗糙度贴图、环境映射贴图、渐变贴图、Matcap贴图）全部纳入同一个el-form标签，并用el-form-item组织，结构规范且无编译错误，完全满足element-plus表单风格和用户反馈要求。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
纹理相关的label，都去掉()和其中英文
</feedback>
<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:03:47 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
48,011 / 111.452K tokens used (43%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
需要将所有纹理相关el-form-item的label属性中的括号及括号内的中英文内容去掉，只保留中文。例如“颜色贴图(map):”改为“颜色贴图:”，其余依次处理。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
      <el-form-item label="颜色贴图(map):">
=======
      <el-form-item label="颜色贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图(aoMap):">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图(displacementMap):">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图(normalMap):">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图(metalnessMap):">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图(roughnessMap):">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图(envMap):">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图(gradientMap):">
=======
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图:">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图(matcap):">
=======
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图:">
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
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
      <el-form-item label="类型:">
        <el-select v-model="materialType" @change="onMaterialTypeChange" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
      <el-form-item label="颜色:">
        <el-color-picker
          v-model="materialColor"
          @change="updateMaterialColor"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
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
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
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
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
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
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
        <el-color-picker
          v-model="materialSpecular"
          @change="updateMaterialSpecular"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
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
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
        <el-color-picker
          v-model="materialEmissive"
          @change="updateMaterialEmissive"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图:">
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图:">
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图:">
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图:">
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图:">
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图:">
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图:">
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图:">
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图:">
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:04:02 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
48,777 / 111.452K tokens used (44%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
所有纹理相关el-form-item的label已去除括号及其中英文，仅保留中文描述，界面更简洁规范，完全符合用户反馈要求。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
所有label的问题都去掉:号
</feedback>
<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:04:47 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
52,738 / 111.452K tokens used (47%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
需要将所有el-form-item的label属性末尾的“:”去掉，包括材质属性和纹理相关。直接批量删除所有label="xxx:"中的冒号。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
      <el-form-item label="类型:">
=======
      <el-form-item label="类型">
+++++++ REPLACE

------- SEARCH
      <el-form-item label="颜色:">
=======
      <el-form-item label="颜色">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat):">
=======
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆(clearcoat)">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度:">
=======
      <el-form-item v-if="materialType==='MeshPhysicalMaterial'" label="清漆粗糙度">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光:">
=======
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度:">
=======
      <el-form-item v-if="materialType==='MeshPhongMaterial'" label="高光强度">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光:">
=======
      <el-form-item v-if="materialType==='MeshLambertMaterial'" label="自发光">
+++++++ REPLACE

------- SEARCH
      <el-form-item label="颜色贴图:">
=======
      <el-form-item label="颜色贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图:">
=======
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图:">
=======
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
+++++++ REPLACE

------- SEARCH
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图:">
=======
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境光遮蔽贴图">
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属度贴图">
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙度贴图">
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="环境映射贴图">
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
        <div v-else>
          <span style="color:#aaa;">无</span>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:05:09 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
53,915 / 111.452K tokens used (48%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
所有el-form-item的label已去除末尾冒号，材质属性和纹理相关均为纯中文或中英文，无冒号，完全符合用户反馈要求。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
优化各个“清除按钮”的位置，做成一个小X按钮放在图片右上角
</feedback>
<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:09:04 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
57,872 / 111.452K tokens used (52%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
需要将所有纹理预览图片旁的“清除”按钮，改为图片右上角的小X按钮。实现方式：将图片和X按钮包裹在一个相对定位的div内，图片为100%宽度，小X按钮绝对定位于右上角，使用el-button type="danger" icon="el-icon-close" size="small"圆形样式。需为按钮添加自定义样式使其悬浮于图片右上角。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
        <div v-if="selectedObject.material.map">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('map')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.aoMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('aoMap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.displacementMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('displacementMap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.normalMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('normalMap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.metalnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('metalnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.roughnessMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('roughnessMap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.envMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('envMap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.gradientMap">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('gradientMap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
        <div v-if="selectedObject.material.matcap">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
          <el-button type="danger" size="small" @click="clearTexture('matcap')" style="margin-left:8px;">清除</el-button>
        </div>
=======
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          />
        </div>
+++++++ REPLACE

------- SEARCH
</style>
=======
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 2px #333;
}
</style>
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          />
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  background: rgba(255,255,255,0.8);
  box-shadow: 0 0 2px #333;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:09:29 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
60,112 / 111.452K tokens used (54%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
所有纹理预览图片的“清除”按钮已优化为图片右上角的小X圆形按钮，采用el-button circle样式并绝对定位，界面更美观实用，完全符合用户反馈要求。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
el-button中，图标的写法要按element-plus的方式来写
</feedback>
<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:11:58 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
64,220 / 111.452K tokens used (58%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
element-plus的el-button图标写法应使用<template #icon>插槽，并引入对应图标组件（如CircleClose），而不是icon="el-icon-close"。需在script部分引入@element-plus/icons-vue的CircleClose图标，并在所有el-button清除按钮中用<template #icon><CircleClose /></template>替换原icon属性。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
=======
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
import { CircleClose } from '@element-plus/icons-vue';
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE

------- SEARCH
          <el-button
            type="danger"
            icon="el-icon-close"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          />
=======
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
import { CircleClose } from '@element-plus/icons-vue';

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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  box-shadow: 0 0 2px #333;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:12:17 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
65,814 / 111.452K tokens used (59%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
所有纹理清除按钮已采用element-plus标准写法，使用<template #icon><CircleClose /></template>插槽，并已在script部分正确引入CircleClose图标组件，完全符合element-plus官方规范和用户反馈要求。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
CircleClose改为close
</feedback>
<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:12:42 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
70,102 / 111.452K tokens used (63%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
用户要求将清除按钮图标由CircleClose改为close。element-plus图标库中应使用Close图标组件。需将script部分的CircleClose改为Close，并在所有el-button图标插槽中用<Close />替换<CircleClose />。
</thinking>

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
import { CircleClose } from '@element-plus/icons-vue';
=======
import { Close } from '@element-plus/icons-vue';
+++++++ REPLACE

------- SEARCH
              <CircleClose />
=======
              <Close />
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  box-shadow: 0 0 2px #333;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:12:53 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
70,364 / 111.452K tokens used (63%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
              <CircleClose />
=======
              <Close />
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  box-shadow: 0 0 2px #333;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:13:02 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
74,652 / 111.452K tokens used (67%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
              <CircleClose />
=======
              <Close />
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  box-shadow: 0 0 2px #333;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:13:11 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
78,939 / 111.452K tokens used (71%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
              <CircleClose />
=======
              <Close />
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  box-shadow: 0 0 2px #333;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:13:20 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
83,224 / 111.452K tokens used (75%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<replace_in_file>
<path>src/components/editor/MaterialPropertyPanel.vue</path>
<diff>
------- SEARCH
              <CircleClose />
=======
              <Close />
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/MaterialPropertyPanel.vue'] Result:
The content was successfully saved to src/components/editor/MaterialPropertyPanel.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/MaterialPropertyPanel.vue">
<script setup>
// 材质属性面板
import { ref, watch } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useObjectManager } from '../../core/ObjectManager.js';
// 引入element-plus组件
import { ElSelect, ElOption, ElColorPicker, ElSlider, ElButton } from 'element-plus';
import { Close } from '@element-plus/icons-vue';

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
      <!-- 纹理相关（多种类型） -->
      <el-form-item label="颜色贴图">
        <div v-if="selectedObject.material.map" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('map')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'map'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="遮蔽贴图">
        <div v-if="selectedObject.material.aoMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.aoMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('aoMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'aoMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="位移贴图">
        <div v-if="selectedObject.material.displacementMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.displacementMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('displacementMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'displacementMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="法线贴图">
        <div v-if="selectedObject.material.normalMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.normalMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('normalMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'normalMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="金属贴图">
        <div v-if="selectedObject.material.metalnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.metalnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('metalnessMap')"
          >
            <template #icon>
              <Close />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'metalnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="粗糙贴图">
        <div v-if="selectedObject.material.roughnessMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.roughnessMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('roughnessMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'roughnessMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" label="映射贴图">
        <div v-if="selectedObject.material.envMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.envMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('envMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'envMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshToonMaterial'" label="渐变贴图">
        <div v-if="selectedObject.material.gradientMap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.gradientMap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('gradientMap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'gradientMap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
      <el-form-item v-if="materialType==='MeshMatcapMaterial'" label="Matcap贴图">
        <div v-if="selectedObject.material.matcap" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc(selectedObject.material.matcap.image)" alt="纹理预览" class="texture-preview-img">
          <el-button
            type="danger"
            circle
            size="small"
            class="texture-clear-btn"
            @click="clearTexture('matcap')"
          >
            <template #icon>
              <CircleClose />
            </template>
          </el-button>
        </div>
        <el-button type="primary" size="small" @click="showTextureDialogType = 'matcap'; showTextureDialog = true" style="margin-top:8px;">选择</el-button>
      </el-form-item>
    </el-form>
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
.texture-preview-wrapper {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 64px;
}
.texture-preview-img {
  width: 64px;
  height: 64px;
  border: 1px solid #555;
  display: block;
  border-radius: 4px;
}
.texture-clear-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  box-shadow: 0 0 2px #333;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/MaterialPropertyPanel.vue

# VSCode Open Tabs
README.md
src/components/editor/MaterialPropertyPanel.vue

# Current Time
2025/8/8 下午6:13:32 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
87,508 / 111.452K tokens used (79%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<

[Response interrupted by user]

