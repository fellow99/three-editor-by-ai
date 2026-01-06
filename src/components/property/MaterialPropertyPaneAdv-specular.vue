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
  specular: '#ffffff', // 高光颜色
  shininess: 30, // 高光强度
  specularMap: null, // 高光贴图
  specularColorMap: null, // 镜面反射颜色贴图
  specularIntensityMap: null, // 镜面反射强度贴图
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
      specular: material.specular ? '#' + material.specular.getHexString() : '#ffffff',
      shininess: material.shininess,
      specularMap: material.specularMap,
      specularColorMap: material.specularColorMap,
      specularIntensityMap: material.specularIntensityMap,
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
      <!-- 高光颜色 -->
      <el-form-item label="高光颜色">
        <el-color-picker
          v-model="materialFormRef.specular"
          @change="setMaterial({ specular: materialFormRef.specular })"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <!-- 高光强度 -->
      <el-form-item label="高光强度">
        <el-slider
          v-model="materialFormRef.shininess"
          :min="0"
          :max="100"
          :step="1"
          @change="setMaterial({ shininess: materialFormRef.shininess })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.shininess }}</span>
      </el-form-item>
      <!-- 高光贴图 -->
      <el-form-item label="高光贴图">
        <TexturePropertyItem
          :texture="materialProp.specularMap"
          @select-texture="onTextureSelected($event, 'specularMap')"
          @clear-texture="clearTexture('specularMap')"
          @change-texture="changeTexture('specularMap', $event)"
        />
      </el-form-item>
      <!-- 镜面反射颜色贴图 -->
      <el-form-item label="镜面反射颜色贴图">
        <TexturePropertyItem
          :texture="materialProp.specularColorMap"
          @select-texture="onTextureSelected($event, 'specularColorMap')"
          @clear-texture="clearTexture('specularColorMap')"
          @change-texture="changeTexture('specularColorMap', $event)"
        />
      </el-form-item>
      <!-- 镜面反射强度贴图 -->
      <el-form-item label="镜面反射强度贴图">
        <TexturePropertyItem
          :texture="materialProp.specularIntensityMap"
          @select-texture="onTextureSelected($event, 'specularIntensityMap')"
          @clear-texture="clearTexture('specularIntensityMap')"
          @change-texture="changeTexture('specularIntensityMap', $event)"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
