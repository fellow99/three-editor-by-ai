<!--
  三维场景显示与交互组件
  支持拖拽加载、基础几何体、模型资源、模型文件到场景
-->
<template>
  <div
    class="scene-viewer"
    ref="containerRef"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- 加载状态 -->
    <div v-if="!isInitialized" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>初始化3D场景...</p>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 三维场景显示与交互组件
 * - 支持拖拽VFS模型文件到场景
 */
import { ref, reactive, computed, onMounted, onUnmounted, watch, inject } from 'vue';
import { useScene } from '../../composables/useScene.js';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useInputManager } from '../../core/InputManager.js';
import useTransform from '../../composables/useTransform.js';
import vfsService from '../../services/vfs-service.js';
import { useAssetLoader } from '../../core/AssetLoader.js';
import { useAssets } from '../../composables/useAssets.js';
import { ElMessage } from 'element-plus';
import 'element-plus/es/components/message/style/css';

export default {
  name: 'SceneViewer',
  props: {
    showWireframe: { type: Boolean, default: false },
    showGrid: { type: Boolean, default: true }
  },
  setup(props) {
    // 注入全局appState
    const appState = inject('appState');
    // 模型加载器单例
    const assetLoader = useAssetLoader();
    // 资源管理器
    const { loadModel, addModelToScene, getCachedModel } = useAssets();

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
      event.preventDefault();
      if (appState) appState.isLoading = true;
      // 获取当前相机位置，作为新对象的position
      let options = {};
      if (scene && scene.sceneManager && scene.sceneManager.controls && scene.sceneManager.controls.target) {
        const target = scene.sceneManager.controls.target;
        options.position = [target.x, target.y, target.z];
      }

      try {
        // 优先判断拖拽类型
        // 1. 基础几何体/灯光
        const primitiveData = event.dataTransfer.getData('application/x-primitive');
        if (primitiveData) {
          const primitive = JSON.parse(primitiveData);
          // 触发添加基础几何体/灯光的逻辑
          // 这里假设有scene.addPrimitive(type)方法，实际需根据项目实现
          if (scene) {
            options.name = primitive.name || primitive.type;
            if(primitive.type === '3dtiles') {
              // 3DTiles模型需额外的url参数
              const url = prompt('请输入3DTiles模型URL:');
              if(!url) {
                ElMessage.warning('未输入URL，取消添加3DTiles模型');
                return;
              }
              await scene.add3DTiles(url);
              ElMessage.success('已添加3DTiles模型');
            } else {
              // 创建对象后需手动添加到管理器
              const obj = await scene.createPrimitive(primitive.type, options);
              scene.sceneManager.addObject(obj);
              ElMessage.success('已添加基础对象');
            }
          } else {
            ElMessage.warning('未实现基础对象添加');
          }
          return;
        }
        // 2. 资源库模型
        const modelData = event.dataTransfer.getData('application/x-model');
        if (modelData) {
          const modelInfo = JSON.parse(modelData);
          // 资源库模型（有id字段）
          if (modelInfo.id) {
            // 优先判断资源是否已存在，优先用带后缀的name
            const fileName = modelInfo.name || modelInfo.id;
            const cached = getCachedModel( modelInfo.id);
            if (cached) {
              addModelToScene(cached.id, options);
              ElMessage.success('已从缓存加载');
            } else {
              ElMessage.error('未找到模型资源：' + fileName);
            }
            return;
          }
        }
        // 3. 虚拟文件系统模型文件
        const modelFile = event.dataTransfer.getData('application/x-model-file');
        if (modelFile) {
          const fileInfo = JSON.parse(modelFile);
          let { name } = fileInfo;

          // 文件名作为对象名称
          options.name = name;

          // 优先判断资源是否已存在
          const cached = getCachedModel(name);
          if (cached) {
            addModelToScene(cached.id, options);
            ElMessage.success('已从缓存加载');
          } else {
            /**
             * 从VfsFileBrowser中拖拽模型，支持url字段
             * - 若有url字段，则fetch该url获取blob
             * - 否则按原有方式通过vfs获取blob
             * 新增用法：fetch(url)获取blob并转为File对象
             */
            let { drive, path, name, url } = fileInfo;
            let blob;
            if (url) {
              // 有url字段，直接fetch获取blob
              const resp = await fetch(url);
              blob = await resp.blob();
            } else {
              // 无url字段，按原有方式
              const vfs = vfsService.getVfs(drive);
              blob = await vfs.blob(path + '/' + name);
            }
            // Blob转File对象
            const file = new File([blob], name, { type: blob.type });
            file.fileInfo = fileInfo; // 保留原始文件信息

            // 通过useAssets加载模型并纳入资源库
            const loaded = await loadModel(file);
            addModelToScene(loaded.id, options);
            ElMessage.success('文件加载成功');
          }
          return;
        }
        // 4. 场景文件
        const sceneFile = event.dataTransfer.getData('application/x-scene-file');
        if (sceneFile) {
          const fileInfo = JSON.parse(sceneFile);
          let { drive, path, name, url } = fileInfo;
          let json;
          if (url) {
            // 有url字段，直接fetch获取blob
            const resp = await fetch(url);
            json = await resp.json();
          } else {
            // 无url字段，按原有方式
            const vfs = vfsService.getVfs(drive);
            json = await vfs.json(path + '/' + name);
          }
          if(json && json.objects) {
            // 通过SceneManager加载场景数据
            await scene.sceneManager.loadScene(json);
            ElMessage.success('场景文件加载成功');
          } else {
            ElMessage.error('无效的场景文件');
          }
        }
      } catch (e) {
        // 可根据需要弹窗提示
        console.error('拖拽加载对象失败', e);
      } finally {
        if (appState) appState.isLoading = false;
      }
    }

    const containerRef = ref(null);
    const scene = useScene();
    const objectSelection = useObjectSelection();
    const inputManager = useInputManager();
    const transform = useTransform();
    
    // 网格辅助线
    let gridHelper = null;
    
    // 本地状态
    // 由props控制
    const showWireframe = computed(() => props.showWireframe);
    const showGrid = computed(() => props.showGrid);
    const cameraPosition = reactive({ x: 0, y: 0, z: 0 });

    // 计算属性
    const isInitialized = computed(() => scene.isInitialized.value);
    const fps = computed(() => scene.fps.value);
    const sceneStats = computed(() => scene.getSceneStats());

    // 相机四元数，传递给CubeViewportControls
    const cameraQuaternionRef = ref({ x: 0, y: 0, z: 0, w: 1 });
    
    // 监听器
    let animationId = null;
    
    // 方法
    function initializeScene() {
      if (containerRef.value) {
        scene.initScene(containerRef.value);
        scene.startRender();

        // 监听showGrid变化，动态切换SceneManager中的网格显示
        watch(showGrid, (val) => {
          scene.sceneManager.setGridVisible?.(val);
        }, { immediate: true });

        // 初始化TransformControls
        objectSelection.initTransformControls({
          scene: scene.sceneManager.scene,
          camera: scene.sceneManager.camera,
          renderer: scene.sceneManager.renderer,
          controls: scene.sceneManager.controls,
          transform
        });

        // 设置输入事件监听
        setupInputHandlers();
        
        // 启动相机位置更新
        startCameraPositionUpdate();
      }
    }

    
    function setupInputHandlers() {
      // 鼠标点击选择
      inputManager.on('click', (event) => {
        if (scene.sceneManager.camera) {
          objectSelection.handleClickSelection(event, scene.sceneManager.camera);
        }
      });
      
      /*
      // 鼠标悬停（性能太差，已禁用）
      // inputManager.on('mousemove', (event) => {
      //   if (scene.sceneManager.camera) {
      //     objectSelection.handleHover(event, scene.sceneManager.camera);
      //   }
      // });
      */
    }
    
    
    function startCameraPositionUpdate() {
      function updateCameraPosition() {
        if (scene.sceneManager.camera) {
          const pos = scene.sceneManager.camera.position;
          cameraPosition.x = pos.x;
          cameraPosition.y = pos.y;
          cameraPosition.z = pos.z;
          // 同步相机四元数
          const q = scene.sceneManager.camera.quaternion;
          if (q) {
            cameraQuaternionRef.value = {
              x: q.x,
              y: q.y,
              z: q.z,
              w: q.w
            }
          }
        }
        animationId = requestAnimationFrame(updateCameraPosition);
      }
      updateCameraPosition();
    }
    
    // 生命周期
    onMounted(() => {
      initializeScene();
      // 初始化完成后自动尝试加载localStorage中的暂存场景
      // key: three-editor-by-ai_editorScene
      setTimeout(async () => {
        try {
          const raw = localStorage.getItem('three-editor-by-ai_editorScene');
          if (raw) {
            const sceneData = JSON.parse(raw);
            // 尝试加载场景数据
            if (scene && scene.sceneManager && typeof scene.sceneManager.loadScene === 'function') {
              await scene.sceneManager.loadScene(sceneData);
              ElMessage.success('已自动加载本地暂存场景');
            }
          }
        } catch (e) {
          console.warn('自动加载本地暂存场景失败', e);
        }
        // 使canvas点击时获得焦点
        const container = containerRef.value;
        if (container) {
          const canvas = container.querySelector('canvas');
          if (canvas) {
            // 允许canvas聚焦
            canvas.setAttribute('tabindex', '0');
            canvas.addEventListener('click', () => {
              canvas.focus();
            });
          }
        }
      }, 100);
    });

    // 不再监听场景对象变化自动刷新helper
    
    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scene.stopRender();
      inputManager.dispose();
      // 只保留网格辅助线清理
      if (gridHelper) {
        scene.sceneManager.scene.remove(gridHelper);
        gridHelper = null;
      }
      // TransformControls及helper由SceneManager统一清理
    });
    
    return {
      // 模板引用
      containerRef,
      // 拖拽事件
      onDragOver,
      onDrop,
      // 状态
      isInitialized,
      fps,
      sceneStats,
      showWireframe,
      showGrid,
      cameraPosition
    };
  }
};
</script>

<style lang="scss" scoped>
.scene-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #444;
  border-top: 3px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.selection-box {
  position: absolute;
  border: 1px dashed #007acc;
  background: rgba(0, 122, 204, 0.1);
  pointer-events: none;
  z-index: 100;
}

.viewport-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 200;
}

.control-group {
  display: flex;
  gap: 4px;
  background: rgba(42, 42, 42, 0.9);
  border-radius: 6px;
  padding: 4px;
  backdrop-filter: blur(10px);
}

.control-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 12px;
}

.control-btn:hover {
  background: #444;
  border-color: #777;
}

.control-btn.active {
  background: #007acc;
  border-color: #0088dd;
}

.view-btn {
  font-size: 10px;
  font-weight: 600;
}

.performance-monitor {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(42, 42, 42, 0.9);
  border-radius: 6px;
  padding: 12px;
  backdrop-filter: blur(10px);
  z-index: 200;
}

.monitor-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  margin-bottom: 4px;
}

.monitor-item:last-child {
  margin-bottom: 0;
}

.monitor-label {
  color: #aaa;
}

.monitor-value {
  color: #fff;
  font-weight: 600;
  font-family: monospace;
}

.interaction-hints {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(42, 42, 42, 0.9);
  border-radius: 6px;
  padding: 12px;
  backdrop-filter: blur(10px);
  z-index: 200;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  margin-bottom: 4px;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-key {
  background: #555;
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
}

.hint-action {
  color: #ccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .viewport-controls {
    top: 8px;
    right: 8px;
    gap: 8px;
  }
  
  .control-btn {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
  
  .performance-monitor,
  .interaction-hints {
    font-size: 10px;
    padding: 8px;
  }
  
  .interaction-hints {
    display: none;
  }
}
.cube-controls-bottomright {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 300;
}
</style>
