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
  normalMap: null, // 法线贴图
  normalMapType: THREE.TangentSpaceNormalMap, // 法线贴图类型
  normalScale: [1, 1], // 法线贴图缩放
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
      normalMap: material.normalMap,
      normalMapType: material.normalMapType,
      normalScale: [material.normalScale.x, material.normalScale.y],
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
      <!-- 法线贴图 -->
      <el-form-item label="法线贴图">
        <TexturePropertyItem
          :texture="materialProp.normalMap"
          @select-texture="onTextureSelected($event, 'normalMap')"
          @clear-texture="clearTexture('normalMap')"
          @change-texture="changeTexture('normalMap', $event)"
        />
      </el-form-item>
      <!-- 法线贴图类型 -->
      <el-form-item label="法线类型">
        <el-select
          v-model="materialFormRef.normalMapType"
          @change="setMaterial({ normalMapType: materialFormRef.normalMapType })"
          class="property-input"
          size="small"
        >
          <el-option label="TangentSpace" :value="0" />
          <el-option label="ObjectSpace" :value="1" />
        </el-select>
      </el-form-item>
      <!-- 法线缩放X -->
      <el-form-item label="法线缩放X">
        <el-slider
          v-model="materialFormRef.normalScale[0]"
          :min="-2"
          :max="2"
          :step="0.01"
          @change="setMaterial({ normalScale: { x: materialFormRef.normalScale[0], y: materialFormRef.normalScale[1] } })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.normalScale[0]?.toFixed(2) }}</span>
      </el-form-item>
      <!-- 法线缩放Y -->
      <el-form-item label="法线缩放Y">
        <el-slider
          v-model="materialFormRef.normalScale[1]"
          :min="-2"
          :max="2"
          :step="0.01"
          @change="setMaterial({ normalScale: { x: materialFormRef.normalScale[0], y: materialFormRef.normalScale[1] } })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.normalScale[1]?.toFixed(2) }}</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
