/**
 * 资源管理 Composable
 * 提供资源加载和管理相关的响应式状态和操作方法
 */

import { ref, reactive, computed } from 'vue';
import * as THREE from 'three';
import { useAssetLoader } from '../core/AssetLoader.js';
import { useScene } from './useScene.js';
import { 
  isSupported3DFormat, 
  isTextureFormat, 
  getFileExtension, 
  getFileName,
  selectFiles,
  handleDragFiles
} from '../utils/fileUtils.js';

/**
 * 单例模式，确保所有组件共享同一个资源库
 */
let _assetsInstance = null;

export function useAssets() {
  if (_assetsInstance) return _assetsInstance;
  const assetLoader = useAssetLoader();
  const { addObjectToScene } = useScene();
  
  // 资源库状态
  const assetLibrary = reactive({
    models: new Map(),
    textures: new Map(),
    materials: new Map(),
    favorites: new Set(),
    categories: new Map()
  });
  
  // 加载状态
  const loadState = reactive({
    isLoading: false,
    loadProgress: 0,
    loadQueue: [],
    failedLoads: []
  });
  
  // 拖拽状态
  const dragState = reactive({
    isDragOver: false,
    draggedFiles: []
  });
  
  // 搜索和过滤
  const searchQuery = ref('');
  const selectedCategory = ref('all');
  const sortBy = ref('name'); // 'name', 'date', 'size', 'type'
  const sortOrder = ref('asc'); // 'asc', 'desc'
  
  // 计算属性
  const isLoading = computed(() => assetLoader.state.isLoading);
  const loadingProgress = computed(() => assetLoader.state.loadingProgress);
  
  // 过滤后的模型列表
  const filteredModels = computed(() => {
    let models = Array.from(assetLibrary.models.values());
    
    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      models = models.filter(model => 
        model.name.toLowerCase().includes(query) ||
        model.filename.toLowerCase().includes(query) ||
        (model.tags && model.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // 分类过滤
    if (selectedCategory.value !== 'all') {
      models = models.filter(model => model.category === selectedCategory.value);
    }
    
    // 排序
    models.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy.value) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.loadedAt);
          bValue = new Date(b.loadedAt);
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }
      
      if (sortOrder.value === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    return models;
  });
  
  // 过滤后的纹理列表
  const filteredTextures = computed(() => {
    let textures = Array.from(assetLibrary.textures.values());
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      textures = textures.filter(texture => 
        texture.name.toLowerCase().includes(query) ||
        texture.filename.toLowerCase().includes(query)
      );
    }
    
    return textures;
  });
  
  /**
   * 选择并加载文件
   * @param {string[]} accept 接受的文件类型
   * @param {boolean} multiple 是否允许多选
   */
  async function selectAndLoadFiles(accept = [], multiple = true) {
    try {
      const files = await selectFiles(accept, multiple);
      await loadFiles(files);
    } catch (error) {
      console.error('选择文件失败:', error);
    }
  }
  
  /**
   * 加载文件
   * @param {FileList|File[]} files 文件列表
   */
  async function loadFiles(files) {
    const fileArray = Array.from(files);
    
    loadState.isLoading = true;
    loadState.loadProgress = 0;
    loadState.loadQueue = fileArray.map(file => ({
      file,
      status: 'pending',
      progress: 0,
      result: null,
      error: null
    }));
    loadState.failedLoads = [];
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const queueItem = loadState.loadQueue[i];
      
      try {
        queueItem.status = 'loading';
        
        if (isSupported3DFormat(file.name)) {
          const model = await loadModel(file, {
            onProgress: (progress) => {
              queueItem.progress = progress;
              updateOverallProgress();
            }
          });
          queueItem.result = model;
          queueItem.status = 'completed';
        } else if (isTextureFormat(file.name)) {
          const texture = await loadTexture(file, {
            onProgress: (progress) => {
              queueItem.progress = progress;
              updateOverallProgress();
            }
          });
          queueItem.result = texture;
          queueItem.status = 'completed';
        } else {
          throw new Error(`不支持的文件格式: ${file.name}`);
        }
      } catch (error) {
        queueItem.status = 'failed';
        queueItem.error = error.message;
        loadState.failedLoads.push(queueItem);
      }
      
      updateOverallProgress();
    }
    
    loadState.isLoading = false;
  }
  
  /**
   * 加载3D模型
   * @param {File} file 文件对象
   * @param {object} options 选项
   * @returns {object} 模型信息
   */
  async function loadModel(file, options = {}) {
    const model = await assetLoader.loadModel(file, {
      autoScale: false,
      center: false,
      ...options
    });
    
    const modelInfo = {
      id: model.userData.id || generateId(),
      name: getFileName(file.name),
      filename: file.name,
      size: file.size,
      type: getFileExtension(file.name),
      model: model,
      preview: null,
      category: 'uncategorized',
      tags: [],
      loadedAt: new Date().toISOString(),
      isFavorite: false
    };
    
    // 生成预览图
    modelInfo.preview = await generateModelPreview(model);

    // 添加到资源库
    assetLibrary.models.set(modelInfo.id, modelInfo);
    
    return modelInfo;
  }
  
  /**
   * 加载纹理
   * @param {File} file 文件对象
   * @param {object} options 选项
   * @returns {object} 纹理信息
   */
  async function loadTexture(file, options = {}) {
    const texture = await assetLoader.loadTexture(file, options);
    
    const textureInfo = {
      id: generateId(),
      name: getFileName(file.name),
      filename: file.name,
      size: file.size,
      type: getFileExtension(file.name),
      texture: texture,
      preview: URL.createObjectURL(file),
      width: texture.image.width,
      height: texture.image.height,
      loadedAt: new Date().toISOString(),
      isFavorite: false
    };
    
    // 添加到资源库
    assetLibrary.textures.set(textureInfo.id, textureInfo);
    
    return textureInfo;
  }
  
  /**
   * 生成模型预览图
   * @param {THREE.Object3D} model 模型对象
   * @returns {string} 预览图URL
   */
  async function generateModelPreview(model) {
    // 创建临时场景和相机用于渲染预览
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    
    renderer.setSize(256, 256);
    renderer.setClearColor(0x000000, 0);
    
    // 添加光照
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(model);
    
    // 计算相机位置
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    const maxSize = Math.max(size.x, size.y, size.z);
    const distance = maxSize * 2;
    
    camera.position.set(distance, distance, distance);
    camera.lookAt(center);
    
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
  
  /**
   * 添加模型到场景
   * @param {string} modelId 模型ID
   * @param {object} options 选项
   */
  function addModelToScene(modelId, options = {}) {
    const modelInfo = assetLibrary.models.get(modelId);
    if (!modelInfo) return;
    
    // 克隆模型以避免修改原始模型
    const modelClone = modelInfo.model.clone();
    
    // 应用选项
    if (options.position) {
      modelClone.position.set(...options.position);
    }
    if (options.rotation) {
      modelClone.rotation.set(...options.rotation);
    }
    if (options.scale) {
      if (typeof options.scale === 'number') {
        modelClone.scale.setScalar(options.scale);
      } else {
        modelClone.scale.set(...options.scale);
      }
    }
    
    addObjectToScene(modelClone);
    return modelClone;
  }
  
  /**
   * 删除资源
   * @param {string} type 资源类型 ('model', 'texture')
   * @param {string} id 资源ID
   */
  function deleteAsset(type, id) {
    if (type === 'model') {
      const modelInfo = assetLibrary.models.get(id);
      if (modelInfo) {
        // 释放预览图URL
        if (modelInfo.preview && modelInfo.preview.startsWith('blob:')) {
          URL.revokeObjectURL(modelInfo.preview);
        }
        assetLibrary.models.delete(id);
      }
    } else if (type === 'texture') {
      const textureInfo = assetLibrary.textures.get(id);
      if (textureInfo) {
        // 释放预览图URL
        if (textureInfo.preview && textureInfo.preview.startsWith('blob:')) {
          URL.revokeObjectURL(textureInfo.preview);
        }
        textureInfo.texture.dispose();
        assetLibrary.textures.delete(id);
      }
    }
  }
  
  /**
   * 切换收藏状态
   * @param {string} type 资源类型
   * @param {string} id 资源ID
   */
  function toggleFavorite(type, id) {
    const library = type === 'model' ? assetLibrary.models : assetLibrary.textures;
    const asset = library.get(id);
    
    if (asset) {
      asset.isFavorite = !asset.isFavorite;
      
      if (asset.isFavorite) {
        assetLibrary.favorites.add(`${type}:${id}`);
      } else {
        assetLibrary.favorites.delete(`${type}:${id}`);
      }
    }
  }
  
  /**
   * 设置资源分类
   * @param {string} modelId 模型ID
   * @param {string} category 分类
   */
  function setModelCategory(modelId, category) {
    const modelInfo = assetLibrary.models.get(modelId);
    if (modelInfo) {
      modelInfo.category = category;
      
      // 更新分类统计
      if (!assetLibrary.categories.has(category)) {
        assetLibrary.categories.set(category, 0);
      }
      assetLibrary.categories.set(category, assetLibrary.categories.get(category) + 1);
    }
  }
  
  /**
   * 添加标签
   * @param {string} modelId 模型ID
   * @param {string[]} tags 标签数组
   */
  function addModelTags(modelId, tags) {
    const modelInfo = assetLibrary.models.get(modelId);
    if (modelInfo) {
      modelInfo.tags = [...new Set([...modelInfo.tags, ...tags])];
    }
  }
  
  /**
   * 处理拖拽进入
   * @param {DragEvent} event 拖拽事件
   */
  function handleDragEnter(event) {
    event.preventDefault();
    dragState.isDragOver = true;
  }
  
  /**
   * 处理拖拽离开
   * @param {DragEvent} event 拖拽事件
   */
  function handleDragLeave(event) {
    event.preventDefault();
    dragState.isDragOver = false;
  }
  
  /**
   * 处理拖拽放置
   * @param {DragEvent} event 拖拽事件
   */
  async function handleDrop(event) {
    event.preventDefault();
    dragState.isDragOver = false;
    
    const files = handleDragFiles(event);
    if (files.length > 0) {
      await loadFiles(files);
    }
  }
  
  /**
   * 更新总体进度
   */
  function updateOverallProgress() {
    const total = loadState.loadQueue.length;
    const completed = loadState.loadQueue.filter(item => 
      item.status === 'completed' || item.status === 'failed'
    ).length;
    
    loadState.loadProgress = total > 0 ? (completed / total) * 100 : 0;
  }
  
  /**
   * 生成简单ID
   * @returns {string} ID
   */
  function generateId() {
    return 'asset_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * 清空资源库
   */
  function clearAssetLibrary() {
    // 释放所有预览图URL
    assetLibrary.models.forEach(model => {
      if (model.preview && model.preview.startsWith('blob:')) {
        URL.revokeObjectURL(model.preview);
      }
    });
    
    assetLibrary.textures.forEach(texture => {
      if (texture.preview && texture.preview.startsWith('blob:')) {
        URL.revokeObjectURL(texture.preview);
      }
      texture.texture.dispose();
    });
    
    assetLibrary.models.clear();
    assetLibrary.textures.clear();
    assetLibrary.materials.clear();
    assetLibrary.favorites.clear();
    assetLibrary.categories.clear();
  }
  
  /**
   * 导出资源库信息
   * @returns {object} 资源库数据
   */
  function exportAssetLibrary() {
    return {
      models: Array.from(assetLibrary.models.entries()).map(([id, model]) => ({
        id,
        name: model.name,
        filename: model.filename,
        size: model.size,
        type: model.type,
        category: model.category,
        tags: model.tags,
        loadedAt: model.loadedAt,
        isFavorite: model.isFavorite
      })),
      textures: Array.from(assetLibrary.textures.entries()).map(([id, texture]) => ({
        id,
        name: texture.name,
        filename: texture.filename,
        size: texture.size,
        type: texture.type,
        width: texture.width,
        height: texture.height,
        loadedAt: texture.loadedAt,
        isFavorite: texture.isFavorite
      })),
      favorites: Array.from(assetLibrary.favorites),
      categories: Object.fromEntries(assetLibrary.categories),
      exportedAt: new Date().toISOString()
    };
  }
  
  const instance = {
    // 状态
    assetLibrary,
    loadState,
    dragState,
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    isLoading,
    loadingProgress,
    filteredModels,
    filteredTextures,
    
    // 方法
    selectAndLoadFiles,
    loadFiles,
    loadModel,
    loadTexture,
    addModelToScene,
    deleteAsset,
    toggleFavorite,
    setModelCategory,
    addModelTags,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    clearAssetLibrary,
    exportAssetLibrary
  };
  _assetsInstance = instance;
  return instance;
}
