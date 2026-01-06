<!--
  材质属性面板
  用于编辑选中对象的材质属性，包括颜色、纹理、粗糙度等
  支持多种材质类型（标准、物理、Phong等）
-->
<script setup>
import { nextTick, ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { addMaterialToState, useMaterialSelection, setMaterialToObject, loadMaterial, loadImageTexture, updateTexture, exportMaterial } from '@/composables/useMaterial.js';
import { useThreeViewer } from '@/composables/useThreeViewer.js';
import vfsService from '@/services/vfs-service.js'
import VfsFolderChooserDialog from '@/components/dialog/VfsFolderChooserDialog.vue';

import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader"; // HDRLoader

import TexturePropertyItem from './TexturePropertyItem.vue';
import MaterialSelectPropertyItem from './MaterialSelectPropertyItem.vue';

const materialSelection = useMaterialSelection();

const props = defineProps({
  material: { type: Object, default: null }
});

const materialProp = computed(() => props.material);

const showExportDialog = ref(false);

/**
 * 材质属性表单响应式对象
 * 材质配置结构：
{
  // 材质类型
  type: 'MeshStandardMaterial',
  // 主颜色
  color: '#888888',
  // 粗糙度
  roughness: 0.4,
  // 金属度
  metalness: 0.1,
  // 清漆
  clearcoat: 0,
  // 清漆粗糙度
  clearcoatRoughness: 0,
  // 高光色
  specular: '#ffffff',
  // 高光强度
  shininess: 30,
  // 自发光
  emissive: '#000000'
}
 */
const materialFormRef = ref(null);

/**
 * 贴图配置表单响应式对象
 * 贴图配置结构：
 {
  // 重复
  repeat: [1, 1],
  // 偏移
  offset: [0, 0],
  // 中心
  center: [0, 0],
  // 旋转
  rotation: 0,
  // 环绕模式
  wrapS: 'RepeatWrapping',
  wrapT: 'RepeatWrapping',
}
 */
const textureFormRef = ref(null);

// 监听对象变化，更新材质属性
watch(materialProp, () => {
  updateMaterialForm();
}, { immediate: true });

function updateMaterialForm(){
  let material = materialProp.value;
  let texture = material?.map;
  if(material) {
    materialFormRef.value = {
      type: material.type,
      side: material.side ?? THREE.FrontSide,
      transparent: material.transparent ?? false,
      opacity: material.opacity ?? 1,
      color: `#${material.color?.getHexString() || '888888'}`,
      roughness: material.roughness ?? 0.4,
      metalness: material.metalness ?? 0.1,
      clearcoat: material.clearcoat ?? 0,
      clearcoatRoughness: material.clearcoatRoughness ?? 0,
      specular: material.specular ? `#${material.specular?.getHexString()}` : '#ffffff',
      shininess: material.shininess ?? 30,
      emissive: material.emissive ? `#${material.emissive?.getHexString()}` : '#000000',
    };
  }
  if(texture) {
    textureFormRef.value = {
      repeat: [parseFloat(texture.repeat.x), parseFloat(texture.repeat.y)],
      offset: [texture.offset.x, texture.offset.y],
      center: [texture.center.x, texture.center.y],
      rotation: texture.rotation,
      wrapS: texture.wrapS,
      wrapT: texture.wrapT,
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
    side: val.side,
    transparent: val.transparent,
    opacity: val.opacity,
    color: new THREE.Color(val.color),
    roughness: val.roughness,
    metalness: val.metalness,
    clearcoat: val.clearcoat,
    clearcoatRoughness: val.clearcoatRoughness,
    specular: new THREE.Color(val.specular),
    shininess: val.shininess,
    emissive: new THREE.Color(val.emissive),
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

function setTexture() {
  let val = {...textureFormRef.value};
  changeTexture('map', val);
  changeTexture('normalMap', val);
  changeTexture('roughnessMap', val);
  changeTexture('alphaMap', val);
  changeTexture('metalnessMap', val);
  changeTexture('emissiveMap', val);
  changeTexture('envMap', val);
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

/**
 * 处理预置材质选择弹窗回调
 * @param {Object} materialInfo 预置材质信息
 */
async function onMaterialSelected(materialInfo) {
  let { quality, properties } = materialInfo;
  let base = properties[`modelLop-base-${quality}`];
  let mask = properties[`modelLop-mask-${quality}`];
  let normal = properties[`modelLop-normal-${quality}`];
  let y = properties.y || 1;
  let z = properties.z || 1;
  base = base?.url;
  mask = mask?.url;
  normal = normal?.url;

  if(base) {
    let texture = await loadImageTexture(base);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(y, z);
    texture.userData = texture.userData || {};
    texture.userData.fileInfo = {url: base}; // 记录图片URL来源
    setMaterial({ map: texture });
  }
  if(mask) {
    let texture = await loadImageTexture(mask);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(y, z);
    texture.userData = texture.userData || {};
    texture.userData.fileInfo = {url: mask}; // 记录图片URL来源
    setMaterial({ 
      roughnessMap: texture,
      alphaMap: texture,
    });
  }
  if(normal) {
    let texture = await loadImageTexture(normal);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(y, z);
    texture.userData = texture.userData || {};
    texture.userData.fileInfo = {url: normal}; // 记录图片URL来源
    setMaterial({ normalMap: texture });
  }
}

/**
 * 处理预置材质选择弹窗回调
 * @param {Object} materialInfo 预置材质信息
 */
async function onMaterialSelectedV2(materialInfo) {
  let material = await loadMaterial(materialInfo);
  console.log('选择预置材质2:', material);
  setMaterial(material);
}

async function handleExportDialog() {
  let material = materialSelection.getSelectedMaterial();
  if(!material)return;

  showExportDialog.value = true;
}

async function handleExport(folderInfo) {
  let material = materialSelection.getSelectedMaterial();
  if(!material)return;

  let materialName = material.name || '';
  let ret = await ElMessageBox.prompt('请输入材质名称', '导出材质', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: material.name || '',
      inputPattern: /.+/,
      inputErrorMessage: '名称不能为空'
  })
  if(!ret || !ret.value)return;

  materialName = ret.value;
  let json = await exportMaterial(material);
  if(!json)return;

  console.log('导出材质：', json);

  if(json.metadata && json.metadata.thumbnail) {
    try {
      let thumbnail = json.metadata.thumbnail;
      if(thumbnail.startsWith('data:image/png;base64,')) {
        let base64 = thumbnail.replace('data:image/png;base64,', '');
        let path = folderInfo.path;
        let name = materialName + '_thumbnail.png';
        let vfs = vfsService.getVfs(folderInfo.drive);
        await vfs.saveBase64(`${path}/${name}`, base64);

        json.metadata.thumbnail = vfs.url(`${path}/${name}`); // 更新为文件URL
      }
    } catch (err) {
      console.error('保存材质缩略图失败:', err);
      ElMessage.error('保存材质缩略图失败: ' + err.message);
      return;
    }
  }

  for(let idx=0; idx < json.images.length; idx++) {
    try {
      let image = json.images[idx];
      let {uuid: imageUuid, url} = image;
      if(url.startsWith('data:image/png;base64,')) {
        let base64 = url.replace('data:image/png;base64,', '');

        let subname = `${idx}`;
        let texture = json.textures.find(t => t.image === imageUuid);
        if(texture && texture.uuid) {
          let textureUuid = texture.uuid;
          if(json.map === textureUuid) subname = 'map';
          else if(json.normalMap === textureUuid) subname = 'normalMap';
          else if(json.roughnessMap === textureUuid) subname = 'roughnessMap';
          else if(json.metalnessMap === textureUuid) subname = 'metalnessMap';
          else if(json.emissiveMap === textureUuid) subname = 'emissiveMap';
          else if(json.alphaMap === textureUuid) subname = 'alphaMap';
          else if(json.aoMap === textureUuid) subname = 'aoMap';
          else if(json.envMap === textureUuid) subname = 'envMap';
          else if(json.bumpMap === textureUuid) subname = 'bumpMap';
          else if(json.clearcoatMap === textureUuid) subname = 'clearcoatMap';
          else if(json.clearcoatRoughnessMap === textureUuid) subname = 'clearcoatRoughnessMap';
          else if(json.clearcoatNormalMap === textureUuid) subname = 'clearcoatNormalMap';
          else if(json.displacementMap === textureUuid) subname = 'displacementMap';
          else if(json.emissiveMap === textureUuid) subname = 'emissiveMap';
          else if(json.lightMap === textureUuid) subname = 'lightMap';
          else if(json.metalnessMap === textureUuid) subname = 'metalnessMap';
          else if(json.roughnessMap === textureUuid) subname = 'roughnessMap';
          else if(json.sheenColorMap === textureUuid) subname = 'sheenColorMap';
          else if(json.sheenRoughnessMap === textureUuid) subname = 'sheenRoughnessMap';
          else if(json.specularMap === textureUuid) subname = 'specularMap';
          else if(json.specularColorMap === textureUuid) subname = 'specularColorMap';
          else if(json.specularIntensityMap === textureUuid) subname = 'specularIntensityMap';
          else if(json.thicknessMap === textureUuid) subname = 'thicknessMap';
          else if(json.transmissionMap === textureUuid) subname = 'transmissionMap';
        }

        let path = folderInfo.path;
        let name = materialName + `_${subname}.png`;
        let vfs = vfsService.getVfs(folderInfo.drive);
        await vfs.saveBase64(`${path}/${name}`, base64);

        image.url = vfs.url(`${path}/${name}`); // 更新为文件URL
      }
    } catch (err) {
      console.error('保存材质贴图失败:', err);
      ElMessage.error('保存材质贴图失败: ' + err.message);
      return;
    }
  }

  try {
    let text = JSON.stringify(json, null, 2);
    let path = folderInfo.path;
    let name = materialName + '.material.json';
    let vfs = vfsService.getVfs(folderInfo.drive);
    await vfs.save(`${path}/${name}`, text);
  } catch (err) {
    console.error('保存材质文件失败:', err);
    ElMessage.error('保存材质文件失败: ' + err.message);
    return;
  }

  ElMessage.success('材质导出成功');
}
</script>

<template>
  <div v-if="materialFormRef" class="property-section">
    <h4>
      <span>材质属性：{{ material.name }}</span>
      <el-button size="small" @click="handleExportDialog">导出</el-button>
      <VfsFolderChooserDialog
        v-model="showExportDialog"
        @select="handleExport"
      />
    </h4>
    <el-form v-if="materialFormRef" label-width="80px">
      <el-form-item label="类型">
        <el-select v-model="materialFormRef.type" @change="changeMaterial" class="property-input" size="small">
          <el-option label="标准(Standard)" value="MeshStandardMaterial" />
          <el-option label="物理(Physical)" value="MeshPhysicalMaterial" />
          <el-option label="冯氏(Phong)" value="MeshPhongMaterial" />
          <el-option label="兰伯特(Lambert)" value="MeshLambertMaterial" />
          <el-option label="卡通（Toon）" value="MeshToonMaterial" />
          <el-option label="法向(Normal)" value="MeshNormalMaterial" />
          <el-option label="基础(Basic)" value="MeshBasicMaterial" />
        </el-select>
      </el-form-item>
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
      <el-form-item label="颜色">
        <el-color-picker
          v-model="materialFormRef.color"
          @change="setMaterial({ color: materialFormRef.color })"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="粗糙度">
        <el-slider
          v-model="materialFormRef.roughness"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setMaterial({ roughness: materialFormRef.roughness })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.roughness?.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item v-if="(materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial')" label="金属度">
        <el-slider
          v-model="materialFormRef.metalness"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setMaterial({ metalness: materialFormRef.metalness })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.metalness?.toFixed(2) }}</span>
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshPhysicalMaterial'" label="清漆">
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
      <el-form-item v-if="materialFormRef.type==='MeshPhysicalMaterial'" label="清漆粗糙度">
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
      <el-form-item v-if="materialFormRef.type==='MeshPhongMaterial'" label="高光">
        <el-color-picker
          v-model="materialFormRef.specular"
          @change="setMaterial({ specular: materialFormRef.specular })"
          class="color-input"
          size="small"
        />
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshPhongMaterial'" label="高光强度">
        <el-slider
          v-model="materialFormRef.shininess"
          :min="0"
          :max="200"
          :step="1"
          @change="setMaterial({ shininess: materialFormRef.shininess })"
          class="range-input"
          size="small"
        />
        <span class="range-value">{{ materialFormRef.shininess }}</span>
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshLambertMaterial' || materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="自发光">
        <el-color-picker
          v-model="materialFormRef.emissive"
          @change="setMaterial({ emissive: materialFormRef.emissive })"
          class="color-input"
          size="small"
        />
      </el-form-item>
    </el-form>
    <el-form v-if="materialFormRef" label-width="80px">
      <el-divider>材质贴图</el-divider>
      <el-form-item label="预置材质">
        <MaterialSelectPropertyItem @select-material="onMaterialSelected" />
      </el-form-item>
      <!-- 统一贴图相关写法 -->
      <el-form-item label="颜色贴图">
        <TexturePropertyItem :texture="materialProp.map"
          @select-texture="onTextureSelected($event, 'map')" @clear-texture="clearTexture('map')" 
          @change-texture="changeTexture('map', $event)" />
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="法线贴图">
        <TexturePropertyItem :texture="materialProp.normalMap"
          @select-texture="onTextureSelected($event, 'normalMap')" @clear-texture="clearTexture('normalMap')"
          @change-texture="changeTexture('map', $event)" />
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="粗糙贴图">
        <TexturePropertyItem :texture="materialProp.roughnessMap"
          @select-texture="onTextureSelected($event, 'roughnessMap')" @clear-texture="clearTexture('roughnessMap')"
          @change-texture="changeTexture('roughnessMap', $event)" />
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="金属贴图">
        <TexturePropertyItem :texture="materialProp.metalnessMap"
        @select-texture="onTextureSelected($event, 'metalnessMap')" @clear-texture="clearTexture('metalnessMap')"
        @change-texture="changeTexture('metalnessMap', $event)" />
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="自发光贴图">
        <TexturePropertyItem :texture="materialProp.emissiveMap"
          @select-texture="onTextureSelected($event, 'emissiveMap')" @clear-texture="clearTexture('emissiveMap')"
          @change-texture="changeTexture('emissiveMap', $event)" />
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="透明贴图">
        <TexturePropertyItem :texture="materialProp.alphaMap"
          @select-texture="onTextureSelected($event, 'alphaMap')" @clear-texture="clearTexture('alphaMap')"
          @change-texture="changeTexture('alphaMap', $event)"/>
      </el-form-item>
      <el-form-item v-if="materialFormRef.type==='MeshStandardMaterial' || materialFormRef.type==='MeshPhysicalMaterial'" label="环境贴图">
        <TexturePropertyItem :texture="materialProp.envMap"
          @select-texture="onTextureSelected($event, 'envMap')" @clear-texture="clearTexture('envMap')"
          @change-texture="changeTexture('envMap', $event)"/>
      </el-form-item>
    </el-form>
    <el-form v-if="textureFormRef" label-width="80px">
      <el-divider>贴图配置</el-divider>
      <!--
        贴图配置表单
        支持repeat、offset、center、rotation、wrap、minFilter、magFilter、anisotropy、flipY、generateMipmaps、premultiplyAlpha、unpackAlignment等参数
      -->
      <el-form-item label="重复">
        <!-- repeat: 纹理在U/V方向的重复次数 -->
        <el-input-number
          v-model="textureFormRef.repeat[0]"
          :min="0.01"
          :step="0.01"
          @change="setTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        /> ×
        <el-input-number
          v-model="textureFormRef.repeat[1]"
          :min="0.01"
          :step="0.01"
          @change="setTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
      <el-form-item label="偏移">
        <!-- offset: 纹理在U/V方向的偏移 -->
        <el-input-number
          v-model="textureFormRef.offset[0]"
          :min="-1"
          :max="1"
          :step="0.01"
          @change="setTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        /> ×
        <el-input-number
          v-model="textureFormRef.offset[1]"
          :min="-1"
          :max="1"
          :step="0.01"
          @change="setTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
      <el-form-item label="中心">
        <!-- center: 旋转中心点 -->
        <el-input-number
          v-model="textureFormRef.center[0]"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        /> ×
        <el-input-number
          v-model="textureFormRef.center[1]"
          :min="0"
          :max="1"
          :step="0.01"
          @change="setTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
      <el-form-item label="旋转">
        <!-- rotation: 纹理旋转角度，单位弧度 -->
        <el-input-number
          v-model="textureFormRef.rotation"
          :min="-6.28"
          :max="6.28"
          :step="0.01"
          @change="setTexture"
          size="small"
          controls-position="right"
          style="width:5em"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.property-section {
  padding: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 48px - 32px);
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
