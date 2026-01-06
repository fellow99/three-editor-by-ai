<!--
  材质属性面板（专家模式）
-->
<script setup>
import { nextTick, ref, computed, watch } from 'vue';
import { addMaterialToState, useMaterialSelection, setMaterialToObject, loadImageTexture, updateTexture } from '@/composables/useMaterial.js';
import { useThreeViewer } from '@/composables/useThreeViewer.js';
import vfsService from '@/services/vfs-service.js'

import TexturePropertyItem from './TexturePropertyItem.vue';

const materialSelection = useMaterialSelection();

const props = defineProps({
  material: { type: Object, default: null }
});

const materialProp = computed(() => props.material);

/**
 * 材质属性表单响应式对象
 * 材质配置结构，以下是基础结构字段：
{
  clearcoat: 0, // 清漆层强度
  clearcoatRoughness: 0, // 清漆层粗糙度
  clearcoatMap: null, // 清漆层贴图
  clearcoatRoughnessMap: null, // 清漆层粗糙度贴图
  clearcoatNormalMap: null, // 清漆层法线贴图
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
      clearcoat: material.clearcoat,
      clearcoatRoughness: material.clearcoatRoughness,
      clearcoatMap: material.clearcoatMap,
      clearcoatRoughnessMap: material.clearcoatRoughnessMap,
      clearcoatNormalMap: material.clearcoatNormalMap,
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

function changeTexture(textureType, update) {
  let material = materialSelection.getSelectedMaterial();
  if(!material[textureType])return;

  // 更新贴图属性
  updateTexture(material[textureType], update);

  // 材质已修改，更新到状态库
  let name = materialSelection.selectedMaterialNameRef.value;
  if (material) addMaterialToState(name, material);
}

/**
 * 清除指定类型的贴图
 * @param {string} textureType 贴图类型字段名
 */
function clearTexture(textureType) {
  setMaterial({ [textureType]: null });
}

/**
 * 处理纹理选择弹窗回调
 * @param {Object} fileInfo 纹理文件信息
 */
async function onTextureSelected(fileInfo, textureType) {
  if (!fileInfo || !textureType) return;

  let { type, drive, path, name, url } = fileInfo;
  if(!url) {
      const vfs = vfsService.getVfs(drive);
      url = vfs.url(path + '/' + name);
  }
  fileInfo.url = url;

  if(!url) return;
  else if(url.endsWith('.hdr') || url.endsWith('.exr')) {
    let viewerRef = useThreeViewer();
    let viewer = viewerRef.value;
    if (!viewer) return;
  
    const loader = new HDRLoader();
    let texture = await loader.loadAsync(url);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;
    texture.userData = texture.userData || {};
    texture.userData.fileInfo = fileInfo; // 记录图片URL来源

    setMaterial({ [textureType]: texture });
  } else {
    let texture = await loadImageTexture(url);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.userData = texture.userData || {};
    texture.userData.fileInfo = fileInfo; // 记录图片URL来源
    
    setMaterial({ [textureType]: texture });
  }
  
}

</script>

<template>
  <div v-if="materialFormRef" class="property-pane">
    <el-form v-if="materialFormRef" label-width="100px">
      <!-- 清漆层强度 -->
      <!--
        clearcoat: 清漆层强度，范围0~1，控制材质表面清漆层的厚度和反射效果。0为无清漆，1为最大清漆效果。
      -->
      <el-form-item label="清漆强度">
        <el-slider
          v-model="materialFormRef.clearcoat"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setMaterial({ clearcoat: materialFormRef.clearcoat })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.clearcoat?.toFixed(2) }}</span>
      </el-form-item>
      <!-- 清漆层粗糙度 -->
      <!--
        clearcoatRoughness: 清漆层粗糙度，范围0~1，控制清漆表面的模糊程度。0为完全光滑，1为完全粗糙。
      -->
      <el-form-item label="清漆粗糙度">
        <el-slider
          v-model="materialFormRef.clearcoatRoughness"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setMaterial({ clearcoatRoughness: materialFormRef.clearcoatRoughness })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.clearcoatRoughness?.toFixed(2) }}</span>
      </el-form-item>
      <!-- 清漆层贴图 -->
      <!--
        clearcoatMap: 清漆层强度贴图，灰度图控制每个像素的清漆强度。白色区域最大清漆，黑色区域无清漆。
      -->
      <el-form-item label="清漆贴图">
        <TexturePropertyItem :texture="materialProp.clearcoatMap"
          @select-texture="onTextureSelected($event, 'clearcoatMap')" @clear-texture="clearTexture('clearcoatMap')" 
          @change-texture="changeTexture('clearcoatMap', $event)" />
      </el-form-item>
      <!-- 清漆层粗糙度贴图 -->
      <!--
        clearcoatRoughnessMap: 清漆层粗糙度贴图，灰度图控制每个像素的清漆粗糙度。白色区域最粗糙，黑色区域最光滑。
      -->
      <el-form-item label="清漆粗糙度贴图">
        <TexturePropertyItem :texture="materialProp.clearcoatRoughnessMap"
          @select-texture="onTextureSelected($event, 'clearcoatRoughnessMap')" @clear-texture="clearTexture('clearcoatRoughnessMap')" 
          @change-texture="changeTexture('clearcoatRoughnessMap', $event)" />
      </el-form-item>
      <!-- 清漆层法线贴图 -->
      <!--
        clearcoatNormalMap: 清漆层法线贴图，影响清漆表面的法线方向，用于模拟微小表面细节。
      -->
      <el-form-item label="清漆法线贴图">
        <TexturePropertyItem :texture="materialProp.clearcoatNormalMap"
          @select-texture="onTextureSelected($event, 'clearcoatNormalMap')" @clear-texture="clearTexture('clearcoatNormalMap')" 
          @change-texture="changeTexture('clearcoatNormalMap', $event)" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
