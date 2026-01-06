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
  emissive: '#000000', // 自发光颜色
  emissiveIntensity: 1, // 自发光强度
  emissiveMap: null, // 自发光贴图
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
      emissive: material.emissive ? '#' + material.emissive.getHexString() : '#000000',
      emissiveIntensity: material.emissiveIntensity,
      emissiveMap: material.emissiveMap,
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
      <!-- 自发光颜色 -->
      <!--
        emissive: 自发光颜色，影响材质在无光照下的发光效果。通常用于模拟LED、霓虹等自发光表面。
      -->
      <el-form-item label="自发光颜色">
        <el-color-picker
          v-model="materialFormRef.emissive"
          @change="setMaterial({ emissive: materialFormRef.emissive })"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <!-- 自发光强度 -->
      <!--
        emissiveIntensity: 自发光强度，控制自发光颜色的亮度。1为正常亮度，0为无自发光。
      -->
      <el-form-item label="自发光强度">
        <el-slider
          v-model="materialFormRef.emissiveIntensity"
          :min="0"
          :max="10"
          :step="0.01"
          @change="setMaterial({ emissiveIntensity: materialFormRef.emissiveIntensity })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.emissiveIntensity?.toFixed(2) }}</span>
      </el-form-item>
      <!-- 自发光贴图 -->
      <!--
        emissiveMap: 自发光贴图，控制每个像素的自发光颜色和强度。常用于实现复杂的发光图案。
      -->
      <el-form-item label="自发光贴图">
        <TexturePropertyItem :texture="materialProp.emissiveMap"
          @select-texture="onTextureSelected($event, 'emissiveMap')" @clear-texture="clearTexture('emissiveMap')" 
          @change-texture="changeTexture('emissiveMap', $event)" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
@use './PropertyPane.scss';
</style>
