<!--
  三维场景显示与交互组件
  支持拖拽加载、基础几何体、模型资源、模型文件到场景
  采用<script setup>写法，Vue3组合式API重构
  新语法：props直接定义、inject直接调用、生命周期直接使用onMounted/onUnmounted
  规范：每个ref变量、函数均有注释
-->
<script setup>
import { ref, nextTick, computed, onMounted, onUnmounted, watch, inject } from 'vue';
import { ElMessage } from 'element-plus';
import { useEventBus } from '@/composables/useEventBus.js';
import { useThreeViewer, add3DTiles, addLight, add3DModel, addPrimitive } from '@/composables/useThreeViewer.js';
import { useControls, switchControls } from '@/composables/useControls.js';
import { applyInitialPos } from '@/composables/useCameraPosState.js';
import { setupGrid, setGridVisible } from '@/composables/useHelpers.js';
import { useMaterialSelection, loadImageTexture } from '@/composables/useMaterial.js';
import { zoomToPos } from '@/composables/useCameraPosState.js';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import { useEditorConfig } from '@/composables/useEditorConfig.js';
import { useInputManager } from '@/composables/useInputManager.js';
import { useAxesHelper } from '@/composables/useHelpers.js';
import useTransform from '@/composables/useTransform.js';
import vfsService from '@/services/vfs-service.js';
import DEFAULT_CAMERA_POS from '@/constants/DEFAULT_CAMERA_POS.json';

const eventBus = useEventBus();

// 组件props定义
const props = defineProps({
  showWireframe: { type: Boolean, default: false },
  showGrid: { type: Boolean, default: true }
});

// 注入全局appState
const appState = inject('appState');

const showGridRef = computed(() => props.showGrid);

/**
 * 拖拽进入时阻止默认，允许放置
 * @param {DragEvent} event
 */
function onDragOver(event) {
  event.preventDefault();
}

/**
 * 拖拽释放时处理不同类型的对象加载
 * 支持VFS模型文件、资源库模型、基础几何体/灯光
 * @param {DragEvent} event
 */
async function onDrop(event) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;

  let controlsRef = useControls();
  let controls = controlsRef.value;

  event.preventDefault();
  let { scene } = viewer;
  if (appState) appState.isLoading = true;
  
  // 获取当前相机位置，作为新对象的position
  let options = {userData: {}};
  if (scene && controls && controls.target) {
    const target = controls.target;
    options.position = [target.x, target.y, target.z];
  }

  try {
    // 优先判断拖拽类型
    // 基础灯光
    const lightData = event.dataTransfer.getData('application/x-light');
    if (lightData) {
      const opt = JSON.parse(lightData);
      Object.assign(opt, options);
      addLight(opt);
      ElMessage.success('已添加灯光');
      return;
    }
    
    // Decal
    let decalData = event.dataTransfer.getData('application/x-decal');
    if (decalData) {
      decalData = JSON.parse(decalData);
      let opt = Object.assign({}, options);
      
      let { quality, properties } = decalData;
      let base = properties[`modelLop-base-${quality}`];
      let mask = properties[`modelLop-mask-${quality}`];
      let normal = properties[`modelLop-normal-${quality}`];
      let y = properties.y || 1;
      let z = properties.z || 1;
      base = base?.url;
      mask = mask?.url;
      normal = normal?.url;

      let textures = {};
      if(base) {
        let texture = await loadImageTexture(base);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(y, z);
        texture.userData = texture.userData || {};
        texture.userData.fileInfo = {url: base}; // 记录图片URL来源
        textures.map = texture;
        textures.transparent = true;
      }
      if(mask) {
        let texture = await loadImageTexture(mask);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(y, z);
        texture.userData = texture.userData || {};
        texture.userData.fileInfo = {url: mask}; // 记录图片URL来源
        textures.roughnessMap = texture;
        textures.alphaMap = texture;
      }
      if(normal) {
        let texture = await loadImageTexture(normal);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(y, z);
        texture.userData = texture.userData || {};
        texture.userData.fileInfo = {url: normal}; // 记录图片URL来源
        textures.normalMap = texture;
      }

      // 创建一个平面
      opt.position = new THREE.Vector3().fromArray(opt.position);
      let mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1)
      );
      mesh.name = decalData.name || '贴花';
      mesh.position.set(...opt.position);
      mesh.userData = decalData.userData || {};

      let material = new THREE.MeshPhysicalMaterial({
          name: decalData.name || Date.now().toString(),
          ...textures,
          transparent: true,
          depthTest: true,
          depthWrite: true,
          side: THREE.DoubleSide,
          roughness: 0.1,
          metalness: 0
        });
      mesh.material = material;
      
      viewer.registerPickObject(mesh);
      viewer.primitivesGroup.add(mesh);

      ElMessage.success('已添加贴花');
      return;
    }

    // 基础几何体
    const primitiveData = event.dataTransfer.getData('application/x-primitive');
    if (primitiveData) {
      const opt = JSON.parse(primitiveData);
      Object.assign(opt, options);
      addPrimitive(opt);
      ElMessage.success('已添加基础对象');
      return;
    }

    // 虚拟文件系统模型文件
    const modelFile = event.dataTransfer.getData('application/x-model-file');
    if (modelFile) {
      const fileInfo = JSON.parse(modelFile);
      let { type, drive, path, name, url } = fileInfo;
      options.name = name;
      if(fileInfo.userData) {
        options.userData = fileInfo.userData;
        delete fileInfo.userData;
      }
      
      if(!url) {
          const vfs = vfsService.getVfs(drive);
          url = vfs.url(path + '/' + name);
      }
      options.userData.fileInfo = fileInfo;

      let model = await add3DModel(options);
      return;
    }
    // 场景文件
    const sceneFile = event.dataTransfer.getData('application/x-scene-file');
    if (sceneFile) {
      const fileInfo = JSON.parse(sceneFile);
      let { drive, path, name, url } = fileInfo;
      let json;
      if (url) {
        const resp = await fetch(url);
        json = await resp.json();
      } else {
        const vfs = vfsService.getVfs(drive);
        json = await vfs.json(path + '/' + name);
      }
      if(json && json.objects) {
        await viewer.loadScene(json);
        ElMessage.success('场景文件加载成功');
      } else {
        ElMessage.error('无效的场景文件');
      }
    }
  } catch (e) {
    console.error('拖拽加载对象失败', e);
  } finally {
    if (appState) appState.isLoading = false;
  }
}

// 场景容器DOM引用
const containerRef = ref(null); // 用于挂载3D场景

// 对象选择管理
const objectSelection = useObjectSelection(); // 负责对象选中与TransformControls

// 输入管理器
const inputManager = useInputManager(); // 负责鼠标/键盘输入事件

// 变换操作管理
const transform = useTransform(); // 负责对象变换（移动/旋转/缩放）

/**
 * 初始化场景
 */
function initializeScene() {
  const { editorConfig } = useEditorConfig();
  const container = containerRef.value;
  if (container) {
    const viewerRef = useThreeViewer(container);
    const viewer = viewerRef.value;
    if (!viewer) return;

    viewer.setContainer(container);

    viewer.startRender();

    applyInitialPos();
    
    let { scene, camera, renderer } = viewer;

    // 初始化控制器
    let controls = switchControls(editorConfig.controlsType);

    // 初始化TransformControls
    objectSelection.initTransformControls({
      scene: scene,
      camera: camera,
      renderer: renderer,
      controls: controls,
      transform
    });

    // 初始化网格辅助线
    setupGrid();

    // 设置输入事件监听
    inputManager.setElement(container);
    setupInputHandlers();

    // 初始调整渲染器尺寸
    handleResize();

    // 监听showGrid变化，动态切换SceneManager中的网格显示
    watch(showGridRef, (val) => {
      setGridVisible(val);
    }, { immediate: true });

    zoomToPos(DEFAULT_CAMERA_POS);

    viewer.on('update', ()=>{
      let { camera } = viewer;
      let axesHelperRef = useAxesHelper();

      let axesHelper = axesHelperRef.value;
      
      let controlsRef = useControls();
      let controls = controlsRef.value;
      if(!axesHelper || !controls) return;

      if (axesHelper && controls && controls.target && camera) {
        axesHelper.position.copy(controls.target);
        const distance = camera.position.distanceTo(controls.target);
        const scale = distance / 50;
        axesHelper.scale.setScalar(scale > 0 ? scale : 0.01);
      }
    })
  }
}

/**
 * 设置输入事件监听
 */
function setupInputHandlers() {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if (!viewer) return;

  const materialSelection = useMaterialSelection();

  inputManager.on('click', (event) => {
    if(event.originalEvent.button == 0){
      // 左键点击，进行对象选择
      
      viewer.selectedObjects = undefined; // 清空viewer的选中状态
      materialSelection.selectedMaterialNameRef.value = null; // 清空选中材质状态

      let { camera } = viewer;
      objectSelection.handleClickSelection(event, camera); // 按照编辑器的选择模式处理选中
    } else {
      objectSelection.clearSelection(); // 按照编辑器的选择模式清空选中
    }
  });
}



  function handleResize() {
    let container = containerRef.value;
    let viewerRef = useThreeViewer();
    let viewer = viewerRef.value;
    if (!viewer) return;
    let { camera, renderer } = viewer;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

// 生命周期钩子
onMounted(async () => {
  await nextTick();
  initializeScene();

  await nextTick();
  // 使canvas点击时获得焦点
  const container = containerRef.value;
  if (container) {
    const canvas = container.querySelector('canvas');
    if (canvas) {
      canvas.setAttribute('tabindex', '0');
      canvas.addEventListener('click', () => {
        canvas.focus();
      });
    }
  }
});


// 监听窗口大小变化，调整渲染器尺寸
window.addEventListener('resize', handleResize);
</script>

<template>
  <div
    class="scene-viewer"
    ref="containerRef"
    @dragover="onDragOver"
    @drop="onDrop"
  >
  </div>
</template>

<style lang="scss" scoped>
@use './SceneViewer.scss';
</style>