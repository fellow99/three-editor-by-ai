/**
 * 材质管理组合式函数
 */
import { ref, reactive } from 'vue';
import * as THREE from 'three';
import { useThreeViewer, getObjectById } from './useThreeViewer.js';

/**
 * 材质变更列表状态
 */
const materialsState = reactive({
  materials: [],
  originMaterials: [], // 原始材质列表备份
});

/**
 * 材质变更列表状态
 */
export function useMaterialsState() {
  return materialsState;
}

/**
 * 添加材质到状态列表
 */
export function addMaterialToState(name, material) {
  let json = material.toJSON();
  delete json.metadata;

  // 如果贴图包含userData.fileInfo.url，则image的url替换为这个url，不然则使用默认的base64
  json.textures && json.textures.forEach(tex => {
    if (tex.userData && tex.userData.fileInfo && tex.userData.fileInfo.url) {
      let imageUuid = tex.image;
      if (json.images) {
        let img = json.images.find(img => img.uuid === imageUuid);
        if (img) {
          img.url = tex.userData.fileInfo.url;
        }
      }
    }
  });
  
  // 更新或添加材质
  let list = materialsState.materials || [];
  let idx = list.findIndex(item => item.name === name);
  if (idx > -1) {
    list[idx] = json;
  } else {
    list.push(json);
  }
  materialsState.materials = list;

  // 备份原始材质
  let originList = materialsState.originMaterials || [];
  idx = originList.findIndex(item => item.name === name);
  if (idx === -1) { // 只备份原始的材质一次
    originList.push(material.clone());
    materialsState.originMaterials = originList;
  }
}

/**
 * 从状态列表移除材质
 */
export function removeMaterialFromState(index) {
  materialsState.materials = materialsState.materials || [];
  materialsState.materials.splice(index, 1);
}

/**
 * 清空材质状态列表
 */
export function clearMaterialState() {
  materialsState.materials = materialsState.materials || [];
  materialsState.materials.length = 0;
}


/**
 * 根据材质名称获取场景中所有使用该材质的材质对象
 * @param {string} name 材质名称
 * @returns {THREE.Material[]} 材质对象数组
 */
export function getMaterialsByName(name) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return [];

  let ret = [];

  viewer.scene.traverse((obj) => {
    if (obj.material) {
      let materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (let mat of materials) {
        if (mat.name === name) {
          ret.push(mat);
        }
      }
    }
  });
  return ret;
}

/**
 * 设置材质属性到指定对象
 * @param {THREE.Object3D} object 目标对象
 * @param {string} materialName 材质名称
 * @param {THREE.Material|object} options 材质或材质参数
 */
export async function setMaterialToObject(object, materialName, options, isStoreOriginal = false) {
  object.traverse(async (obj) => {
    if (!obj.material) return;
    if (Array.isArray(obj.material)) {
      for (let i = 0; i < obj.material.length; i++) {
        let mat = obj.material[i];
        if (mat.name === materialName) {
          // 保存原始材质
          if(isStoreOriginal) materialsState.originMaterials.push(obj.material[i]);
          // 更新材质属性
          obj.material[i] = await updateMaterial(mat, options);
        }
      }
    } else {
      let mat = obj.material;
      if (mat.name === materialName) {
        // 保存原始材质
        if(isStoreOriginal) materialsState.originMaterials.push(obj.material);
        // 更新材质属性
        obj.material = await updateMaterial(mat, options);
      }
    }
  });
}

/**
 * 恢复材质到原始材质
 * @param {string} materialName 材质名称
 */
export async function restoreMaterialByMaterialName(materialName) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let originalMaterial = materialsState.originMaterials.find(mat => mat.name === materialName);
  if (!originalMaterial) return;
  await setMaterialToObject(viewer.scene, materialName, originalMaterial);
}

/**
 * 从JSON加载材质
 * @param {object} options 材质参数
 * @returns {THREE.Material} 材质对象
 */
export async function loadMaterial(options) {
  const materialLoader = THREE.LoadUtils.loaders.materialLoader;
  
  if (options.textures && options.textures.length > 0) {
      const textures = {};
      for (let j = 0; j < options.textures.length; j++) {
          const textureData = options.textures[j];
          if (textureData.userData && textureData.userData.fileInfo && textureData.userData.fileInfo.url) {
              textureData.image = textureData.userData.fileInfo.url;
          }
          textures[textureData.uuid] = await THREE.Generator.generateTexture(textureData);
      }
      materialLoader.setTextures(textures);
  }
  const material = materialLoader.parse(options);
  material.color = options.color ? new THREE.Color(options.color) : new THREE.Color(0xffffff);
  material.isCustomMaterial = true; // 标记为自定义材质
  return material;
}

/**
 * 加载图片纹理
 * @param {string} url 图片URL
 * @returns {Promise<THREE.Texture>} 纹理对象
 */
export async function loadImageTexture(url) {
  return new Promise((resolve, reject) => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
      resolve(texture);
    }, undefined, (err) => {
      reject(err);
    });
  });
}

/**
 * 更新材质属性
 * @param {THREE.Material} material 材质对象
 * @param {THREE.Material|object} options 材质或材质参数
 * @returns {THREE.Material} 更新后的材质对象
 */
export async function updateMaterial(material, options) {
  let name = material.name;
  if (options.isMaterial) {
    // 直接替换材质
    material = options.clone();
    material.name = name; // 保留原材质名称
    return material;
  } else if (options.type) {
    // 从参数创建新材质
    material = await loadMaterial(options);
    material.name = name; // 保留原材质名称
    return material;
  } else {
    // 更新材质属性
    if (options.color) {
      // 支持 '#rrggbb' 或 '0xRRGGBB' 字符串
      if (typeof options.color === 'string') {
        material.color = new THREE.Color(options.color);
      } else if (typeof options.color === 'number') {
        material.color = new THREE.Color(options.color);
      } else if (options.color instanceof THREE.Color) {
        material.color.copy(options.color);
      }
    }

    if(options.emissive) {
      if (typeof options.emissive === 'string') {
        material.emissive = new THREE.Color(options.emissive);
      } else if (typeof options.emissive === 'number') {
        material.emissive = new THREE.Color(options.emissive);
      } else if (options.emissive instanceof THREE.Color) {
        material.emissive.copy(options.emissive);
      }
    }

    if(options.specular) {
      if (typeof options.specular === 'string') {
        material.specular = new THREE.Color(options.specular);
      } else if (typeof options.specular === 'number') {
        material.specular = new THREE.Color(options.specular);
      } else if (options.specular instanceof THREE.Color) {
        material.specular.copy(options.specular);
      }
    }

    // 其他属性直接赋值
    Object.entries(options).forEach(([key, value]) => {
      if (key === 'color' || key === 'emissive' || key === 'specular') return; // 已处理color属性
      // 纹理贴图属性需特殊处理
      if (['map', 'normalMap', 'aoMap', 'displacementMap', 'metalnessMap', 'roughnessMap', 'envMap', 'gradientMap', 'matcap'].includes(key)) {
        material[key] = value;
        material.needsUpdate = true;
      } else {
        material[key] = value;
      }
    });
    material.name = name; // 保留原材质名称
    material.needsUpdate = true;
    material.isCustomMaterial = true; // 标记为自定义材质
    return material;
  }
}

export async function updateTexture(texture, options) {
  texture.wrapS = THREE.RepeatWrapping; // 设置水平重复模式（目前固定）
  texture.wrapT = THREE.RepeatWrapping; // 设置垂直重复模式（目前固定）
  if(options.repeat !== undefined) texture.repeat.fromArray(options.repeat);
  if(options.offset !== undefined) texture.offset.fromArray(options.offset);
  if(options.center !== undefined) texture.center.fromArray(options.center);
  if(options.rotation !== undefined) texture.rotation = options.rotation;
  if(options.wrapS !== undefined) texture.wrapS = options.wrapS;
  if(options.wrapT !== undefined) texture.wrapT = options.wrapT;
  texture.needsUpdate = true;
  return texture;
}

export async function generateMaterialPreview(material, options = {}) {
  let {
    width = 256,
    height = 256,
    modelType = 'sphere', // 'sphere', 'cube', 'plane'
    modelSize = 3,
    cameraDistance = 3,
    lightDistance = 5,
  } = options;
    // 创建临时场景和相机用于渲染预览
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(cameraDistance, cameraDistance, cameraDistance);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    
    // 添加光照
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(lightDistance, lightDistance, lightDistance);
    
    scene.add(ambientLight);
    scene.add(directionalLight);

    let model = null;
    if(modelType === 'cube') {
      const geometry = new THREE.BoxGeometry(modelSize, modelSize, modelSize);
      model = new THREE.Mesh(geometry, material);
    } else if(modelType === 'plane') {
      const geometry = new THREE.PlaneGeometry(modelSize, modelSize, 1, 1);
      model = new THREE.Mesh(geometry, material);
    } else {
      // 默认使用球体
      const geometry = new THREE.SphereGeometry(modelSize, 64, 64);
      model = new THREE.Mesh(geometry, material);
    }
    scene.add(model);
    // 渲染
    renderer.render(scene, camera);
    
    // 获取预览图
    const canvas = renderer.domElement;
    const dataURL = canvas.toDataURL('image/png');
    
    // 清理
    renderer.dispose();
    scene.remove(model);
    
    return dataURL;
}


export async function exportMaterial(material) {
  if(!material) return null;
  let json = material.toJSON();
  json.metadata = json.metadata || {};

  // 生成材质预览图
  json.metadata.thumbnail = json.metadata.thumbnail || await generateMaterialPreview(material);
  
  // 如果贴图包含userData.fileInfo.url，则image的url替换为这个url，不然则使用默认的base64
  json.textures && json.textures.forEach(tex => {
    if (tex.userData && tex.userData.fileInfo && tex.userData.fileInfo.url) {
      let imageUuid = tex.image;
      if (json.images) {
        let img = json.images.find(img => img.uuid === imageUuid);
        if (img) {
          img.url = tex.userData.fileInfo.url;
        }
      }
    }
  });

  return json;
}


/**
 * 设置对象材质
 * @param {string} objectId 对象ID
 * @param {THREE.Material|object} options 材质或材质参数
 */
export async function setMaterialByObjectId(objectId, options) {
  const obj = getObjectById(objectId);

  if (!obj || !obj.material) return;
  if (Array.isArray(obj.material)) {
    for (let i = 0; i < obj.material.length; i++) {
      let mat = obj.material[i];
      if (material.name === materialName) {
        // 更新材质属性
        obj.material[i] = await updateMaterial(mat, options);
      }
    }
  } else {
    let mat = obj.material;
    if (material.name === materialName) {
      // 更新材质属性
      obj.material = await updateMaterial(mat, options);
    }
  }
}

/**
 * 选中材质的名称
 */
const selectedMaterialNameRef = ref(null);

function getSelectedMaterial() {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let name = selectedMaterialNameRef.value;

  let materials = getMaterialsByName(name);
  return materials && materials.length ? materials[0] : null;
}

/**
 * 选择单个对象
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 * @param {boolean} addToSelection 是否添加到现有选择
 */
function selectMaterial(objectOrId) {
  selectedMaterialNameRef.value = null;
  if(!objectOrId) return;

  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  let id;
  if(objectOrId.isObject3D) {
    id = objectOrId.uuid;
  } else {
    id = objectOrId;
  }
  let object = getObjectById(id);
  if (!object || !object.material) return;

  let material = Array.isArray(object.material) ? object.material[0] : object.material;
  if (!material) return;

  selectedMaterialNameRef.value = material.name;
}

/**
 * 清空选择
 * 保证镜头锁定状态优先，主动同步SceneManager的controlsLocked到controls.enabled
 */
function clearSelection() {
  selectedMaterialNameRef.value = null;
}

/**
 * 处理viewer的pick事件
 */
function handlePickEvent(result){
  clearSelection();

  if(!result || !result.mesh) return;

  selectMaterial(result.mesh);
}


/**
 * 材质选择与变换控制管理 Composable
 */
export function useMaterialSelection() {
  return {
    // 状态
    selectedMaterialNameRef,

    getSelectedMaterial,
    selectMaterial,
    clearSelection,
    handlePickEvent
  };
}
