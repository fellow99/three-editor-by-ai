**User:**

<task>
SceneViewer.vue中，toggleGrid()函数的功能实现一下
</task>
<environment_details>
# VSCode Visible Files
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/0
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/1
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/2
src/components/scene/SceneViewer.vue

# VSCode Open Tabs
src/components/scene/SceneViewer.vue
README.md
src/components/scene/PerformanceMonitor.vue
src/components/scene/InteractionHints.vue
src/components/scene/ViewportControls.vue
src/components/scene/CubeViewportControls.vue

# Current Time
2025/8/5 下午3:27:59 (Asia/Shanghai, UTC+8:00)

# Current Working Directory (d:/pci-workspace/3D/three-editor-by-ai) Files
.gitignore
index.html
LICENSE
package-lock.json
package.json
README.md
vite.config.js
public/
public/vite.svg
src/
src/App.vue
src/main.js
src/style.css
src/assets/
src/assets/vue.svg
src/components/
src/components/editor/
src/components/editor/AssetBrowser.vue
src/components/editor/Inspector.vue
src/components/editor/ObjectItem.vue
src/components/editor/PropertyPanel.vue
src/components/editor/Toolbar.vue
src/components/scene/
src/components/scene/Camera.vue
src/components/scene/CubeViewportControls.vue
src/components/scene/InteractionHints.vue
src/components/scene/ObjectGizmo.vue
src/components/scene/PerformanceMonitor.vue
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
1. 用户要求在 SceneViewer.vue 中实现 toggleGrid() 函数的功能。
2. 需要先查看 SceneViewer.vue 文件，确认 toggleGrid 的上下文和相关依赖（如 THREE.GridHelper 或自定义网格）。
3. 由于未提供具体需求，推测 toggleGrid 应该是显示/隐藏三维场景中的网格辅助线。
4. 先读取 SceneViewer.vue 文件，分析已有内容和如何实现该功能。
</thinking>

<read_file>
<path>src/components/scene/SceneViewer.vue</path>
</read_file>

---

**User:**

[read_file for 'src/components/scene/SceneViewer.vue'] Result:
<template>
  <div class="scene-viewer" ref="containerRef">
    <!-- 加载状态 -->
    <div v-if="!isInitialized" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>初始化3D场景...</p>
      </div>
    </div>

    <!-- 框选指示器 -->
    <div 
      v-if="boxSelection.isActive"
      class="selection-box"
      :style="{
        left: Math.min(boxSelection.startX, boxSelection.endX) + 'px',
        top: Math.min(boxSelection.startY, boxSelection.endY) + 'px',
        width: Math.abs(boxSelection.endX - boxSelection.startX) + 'px',
        height: Math.abs(boxSelection.endY - boxSelection.startY) + 'px'
      }"
    ></div>

    <!-- 视图控制面板 -->
    <ViewportControls
      :showWireframe="showWireframe"
      :showGrid="showGrid"
      :resetView="resetView"
      :fitToScreen="fitToScreen"
      :toggleWireframe="toggleWireframe"
      :toggleGrid="toggleGrid"
    />

    <!-- 立方体视角控件右下角 -->
    <CubeViewportControls
      class="cube-controls-bottomright"
      :cameraQuaternion="cameraQuaternion"
      @viewChange="setViewAngle"
    />

    <!-- 性能监控 -->
    <PerformanceMonitor
      :fps="fps"
      :sceneStats="sceneStats"
      :cameraPosition="cameraPosition"
      :formatNumber="formatNumber"
    />

    <!-- 操作提示 -->
    <InteractionHints />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useScene } from '../../composables/useScene.js';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useInputManager } from '../../core/InputManager.js';
import useTransform from '../../composables/useTransform.js';
import CubeViewportControls from './CubeViewportControls.vue';
import PerformanceMonitor from './PerformanceMonitor.vue';
import InteractionHints from './InteractionHints.vue';
import ViewportControls from './ViewportControls.vue';

export default {
  name: 'SceneViewer',
  components: { CubeViewportControls, PerformanceMonitor, InteractionHints, ViewportControls },
  setup() {
    const containerRef = ref(null);
    const scene = useScene();
    const objectSelection = useObjectSelection();
    const inputManager = useInputManager();
    const transform = useTransform();
    
    // TransformControls相关
    let transformControls = null;
    let helper = null;
    let currentObject = null;
    
    // 本地状态
    const showWireframe = ref(false);
    const showGrid = ref(true);
    const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
    
    // 计算属性
    const isInitialized = computed(() => scene.isInitialized.value);
    const fps = computed(() => scene.fps.value);
    const sceneStats = computed(() => scene.getSceneStats());
    const boxSelection = computed(() => objectSelection.boxSelection);

    // 相机四元数，传递给CubeViewportControls
    const cameraQuaternionRef = ref({ x: 0, y: 0, z: 0, w: 1 });
    
    // 监听器
    let animationId = null;
    
    // 方法
    function initializeScene() {
      if (containerRef.value) {
        scene.initScene(containerRef.value);
        scene.startRender();

        // 初始化TransformControls
        initTransformControls();

        // 设置输入事件监听
        setupInputHandlers();
        
        // 启动相机位置更新
        startCameraPositionUpdate();
        
        // 注释掉默认测试对象
        // addTestObjects();
      }
    }
    
    function addTestObjects() {
      // 添加一个立方体作为测试对象
      scene.createPrimitive('box', {
        name: '测试立方体',
        position: [0, 0, 0],
        scale: [1, 1, 1]
      });
      
      // 添加一个球体
      scene.createPrimitive('sphere', {
        name: '测试球体',
        position: [2, 0, 0],
        scale: [1, 1, 1]
      });
      
      // 添加一个圆柱体
      scene.createPrimitive('cylinder', {
        name: '测试圆柱体',
        position: [-2, 0, 0],
        scale: [1, 1, 1]
      });
    }

    // 初始化TransformControls
    function initTransformControls() {
      if (!scene.sceneManager.camera || !scene.sceneManager.renderer) return;
      transformControls = new TransformControls(scene.sceneManager.camera, scene.sceneManager.renderer.domElement);

      // 监听变换事件，同步属性
      transformControls.addEventListener('objectChange', () => {
        if (currentObject) {
          // 变换已自动作用于对象，无需额外同步
          // 触发对象属性同步，确保属性面板等响应式刷新
          if (scene.objectManager && scene.objectManager.setObjectTransform) {
            scene.objectManager.setObjectTransform(
              currentObject.userData.id,
              {
                position: [currentObject.position.x, currentObject.position.y, currentObject.position.z],
                rotation: [currentObject.rotation.x, currentObject.rotation.y, currentObject.rotation.z],
                scale: [currentObject.scale.x, currentObject.scale.y, currentObject.scale.z]
              }
            );
          }
        }
      });

      // 拖拽时禁用OrbitControls
      transformControls.addEventListener('dragging-changed', function (event) {
        if (scene.sceneManager.controls) {
          scene.sceneManager.controls.enabled = !event.value;
        }
      });

      // 禁止TransformControls事件冒泡到OrbitControls等
      transformControls.addEventListener('mouseDown', function (event) {
        event.stopPropagation?.();
      });

      // 添加辅助对象到场景
      helper = transformControls.getHelper ? transformControls.getHelper() : null;
      if (helper) {
        scene.sceneManager.scene.add(helper);
      }

      // 监听transformMode变化
      watch(() => transform.transformMode.value, (mode) => {
        if (transformControls) {
          transformControls.setMode(mode);
          // 切换模式时重新attach对象，确保控件刷新
          if (currentObject) {
            transformControls.attach(currentObject);
            transformControls.visible = true;
          }
        }
      }, { immediate: true });

      // 监听选中对象变化
      watch(() => objectSelection.selectedObjects.value, (objs) => {
        if (objs.length === 1) {
          currentObject = objs[0];
          transformControls.attach(currentObject);
          transformControls.visible = true;
        } else {
          transformControls.detach();
          transformControls.visible = false;
        }
      }, { immediate: true });
    }
    
    function setupInputHandlers() {
      // 鼠标点击选择
      inputManager.on('click', (event) => {
        if (scene.sceneManager.camera) {
          objectSelection.handleClickSelection(event, scene.sceneManager.camera);
        }
      });
      
      // 鼠标悬停
      inputManager.on('mousemove', (event) => {
        if (scene.sceneManager.camera) {
          objectSelection.handleHover(event, scene.sceneManager.camera);
        }
      });
      
      // 框选
      inputManager.on('dragstart', (event) => {
        if (objectSelection.selectionMode.value === 'box') {
          objectSelection.startBoxSelection(event.mouse.x, event.mouse.y);
        }
      });
      
      inputManager.on('drag', (event) => {
        if (objectSelection.selectionMode.value === 'box') {
          objectSelection.updateBoxSelection(event.mouse.x, event.mouse.y);
        }
      });
      
      inputManager.on('dragend', (event) => {
        if (objectSelection.selectionMode.value === 'box') {
          objectSelection.endBoxSelection(
            scene.sceneManager.camera, 
            scene.sceneManager.renderer.domElement
          );
        }
      });
      
      // 键盘快捷键
      inputManager.on('keydown', (event) => {
        handleKeyboardShortcuts(event);
      });
    }
    
    function handleKeyboardShortcuts(event) {
      switch (event.code) {
        case 'KeyF':
          if (objectSelection.hasSelection.value) {
            const selectedObjects = objectSelection.selectedObjects.value;
            scene.focusOnObject(selectedObjects[0]);
          }
          break;
        case 'KeyG':
          // TODO: 切换到移动模式
          break;
        case 'KeyR':
          // TODO: 切换到旋转模式
          break;
        case 'KeyS':
          // TODO: 切换到缩放模式
          break;
        case 'Delete':
          if (objectSelection.hasSelection.value) {
            // TODO: 删除选中对象
          }
          break;
      }
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
    
    function resetView() {
      scene.updateCameraConfig({
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
      });
    }
    
    function fitToScreen() {
      const objects = scene.objectManager.getAllObjects();
      if (objects.length > 0) {
        // 计算所有对象的包围盒
        const box = new THREE.Box3();
        objects.forEach(obj => {
          box.expandByObject(obj);
        });
        
        if (!box.isEmpty()) {
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          const distance = maxSize * 2;
          
          scene.updateCameraConfig({
            position: { 
              x: center.x + distance, 
              y: center.y + distance, 
              z: center.z + distance 
            },
            target: { x: center.x, y: center.y, z: center.z }
          });
        }
      }
    }
    
    function toggleWireframe() {
      showWireframe.value = !showWireframe.value;
      
      // 应用线框模式到所有对象
      const objects = scene.objectManager.getAllObjects();
      objects.forEach(object => {
        object.traverse(child => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.wireframe = showWireframe.value;
              });
            } else {
              child.material.wireframe = showWireframe.value;
            }
          }
        });
      });
    }
    
    function toggleGrid() {
      showGrid.value = !showGrid.value;
      // TODO: 实现网格显示/隐藏
    }
    
    function setViewAngle(angle) {
      const distance = 10;
      let position;
      
      switch (angle) {
        case 'front':
          position = { x: 0, y: 0, z: distance };
          break;
        case 'back':
          position = { x: 0, y: 0, z: -distance };
          break;
        case 'left':
          position = { x: -distance, y: 0, z: 0 };
          break;
        case 'right':
          position = { x: distance, y: 0, z: 0 };
          break;
        case 'top':
          position = { x: 0, y: distance, z: 0 };
          break;
        case 'bottom':
          position = { x: 0, y: -distance, z: 0 };
          break;
        default:
          return;
      }
      
      scene.updateCameraConfig({
        position,
        target: { x: 0, y: 0, z: 0 }
      });
    }
    
    function formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
    
    // 生命周期
    onMounted(() => {
      initializeScene();
    });
    
    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scene.stopRender();
      inputManager.dispose();
      // 移除TransformControls
      if (transformControls) {
        scene.sceneManager.scene.remove(transformControls);
        if (helper) scene.sceneManager.scene.remove(helper);
        transformControls.dispose?.();
      }
    });
    
    return {
      // 模板引用
      containerRef,
      
      // 状态
      isInitialized,
      fps,
      sceneStats,
      boxSelection,
      showWireframe,
      showGrid,
      cameraPosition,
      
      // 方法
      resetView,
      fitToScreen,
      toggleWireframe,
      toggleGrid,
      setViewAngle,
      formatNumber,
      cameraQuaternion: cameraQuaternionRef
    };
  }
};
</script>

<style scoped>
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

<environment_details>
# VSCode Visible Files
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/0
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/1
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/2
src/components/scene/SceneViewer.vue

# VSCode Open Tabs
src/components/scene/SceneViewer.vue
README.md
src/components/scene/PerformanceMonitor.vue
src/components/scene/InteractionHints.vue
src/components/scene/ViewportControls.vue
src/components/scene/CubeViewportControls.vue

# Current Time
2025/8/5 下午3:28:05 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
135 / 111.452K tokens used (0%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. toggleGrid() 目前只切换 showGrid 状态，未真正控制 THREE.GridHelper 的显示与隐藏。
2. 需要在场景中添加一个 GridHelper，并在 toggleGrid 时添加或移除它。
3. 需保证 GridHelper 只创建一次，且切换时不会重复添加。
4. 需在合适位置（如 initializeScene）初始化网格，或首次 toggleGrid 时创建。
5. 只需修改 SceneViewer.vue，不涉及其他文件。
</thinking>

<replace_in_file>
<path>src/components/scene/SceneViewer.vue</path>
<diff>
------- SEARCH
    // 本地状态
    const showWireframe = ref(false);
    const showGrid = ref(true);
    const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
=======
    // 本地状态
    const showWireframe = ref(false);
    const showGrid = ref(true);
    const cameraPosition = reactive({ x: 0, y: 0, z: 0 });

    // 网格辅助对象
    let gridHelper = null;
+++++++ REPLACE

------- SEARCH
    function initializeScene() {
      if (containerRef.value) {
        scene.initScene(containerRef.value);
        scene.startRender();

        // 初始化TransformControls
        initTransformControls();

        // 设置输入事件监听
        setupInputHandlers();
        
        // 启动相机位置更新
        startCameraPositionUpdate();
        
        // 注释掉默认测试对象
        // addTestObjects();
      }
    }
=======
    function initializeScene() {
      if (containerRef.value) {
        scene.initScene(containerRef.value);
        scene.startRender();

        // 初始化网格辅助线
        if (!gridHelper) {
          gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
          gridHelper.visible = showGrid.value;
          scene.sceneManager.scene.add(gridHelper);
        }

        // 初始化TransformControls
        initTransformControls();

        // 设置输入事件监听
        setupInputHandlers();
        
        // 启动相机位置更新
        startCameraPositionUpdate();
        
        // 注释掉默认测试对象
        // addTestObjects();
      }
    }
+++++++ REPLACE

------- SEARCH
    function toggleGrid() {
      showGrid.value = !showGrid.value;
      // TODO: 实现网格显示/隐藏
    }
=======
    function toggleGrid() {
      showGrid.value = !showGrid.value;
      if (!gridHelper) {
        gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
        scene.sceneManager.scene.add(gridHelper);
      }
      gridHelper.visible = showGrid.value;
    }
+++++++ REPLACE

------- SEARCH
      scene.stopRender();
      inputManager.dispose();
      // 移除TransformControls
      if (transformControls) {
        scene.sceneManager.scene.remove(transformControls);
        if (helper) scene.sceneManager.scene.remove(helper);
        transformControls.dispose?.();
      }
    });
=======
      scene.stopRender();
      inputManager.dispose();
      // 移除TransformControls
      if (transformControls) {
        scene.sceneManager.scene.remove(transformControls);
        if (helper) scene.sceneManager.scene.remove(helper);
        transformControls.dispose?.();
      }
      // 移除网格辅助线
      if (gridHelper) {
        scene.sceneManager.scene.remove(gridHelper);
        gridHelper = null;
      }
    });
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/scene/SceneViewer.vue'] Result:
The content was successfully saved to src/components/scene/SceneViewer.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/scene/SceneViewer.vue">
<template>
  <div class="scene-viewer" ref="containerRef">
    <!-- 加载状态 -->
    <div v-if="!isInitialized" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>初始化3D场景...</p>
      </div>
    </div>

    <!-- 框选指示器 -->
    <div 
      v-if="boxSelection.isActive"
      class="selection-box"
      :style="{
        left: Math.min(boxSelection.startX, boxSelection.endX) + 'px',
        top: Math.min(boxSelection.startY, boxSelection.endY) + 'px',
        width: Math.abs(boxSelection.endX - boxSelection.startX) + 'px',
        height: Math.abs(boxSelection.endY - boxSelection.startY) + 'px'
      }"
    ></div>

    <!-- 视图控制面板 -->
    <ViewportControls
      :showWireframe="showWireframe"
      :showGrid="showGrid"
      :resetView="resetView"
      :fitToScreen="fitToScreen"
      :toggleWireframe="toggleWireframe"
      :toggleGrid="toggleGrid"
    />

    <!-- 立方体视角控件右下角 -->
    <CubeViewportControls
      class="cube-controls-bottomright"
      :cameraQuaternion="cameraQuaternion"
      @viewChange="setViewAngle"
    />

    <!-- 性能监控 -->
    <PerformanceMonitor
      :fps="fps"
      :sceneStats="sceneStats"
      :cameraPosition="cameraPosition"
      :formatNumber="formatNumber"
    />

    <!-- 操作提示 -->
    <InteractionHints />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useScene } from '../../composables/useScene.js';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useInputManager } from '../../core/InputManager.js';
import useTransform from '../../composables/useTransform.js';
import CubeViewportControls from './CubeViewportControls.vue';
import PerformanceMonitor from './PerformanceMonitor.vue';
import InteractionHints from './InteractionHints.vue';
import ViewportControls from './ViewportControls.vue';

export default {
  name: 'SceneViewer',
  components: { CubeViewportControls, PerformanceMonitor, InteractionHints, ViewportControls },
  setup() {
    const containerRef = ref(null);
    const scene = useScene();
    const objectSelection = useObjectSelection();
    const inputManager = useInputManager();
    const transform = useTransform();
    
    // TransformControls相关
    let transformControls = null;
    let helper = null;
    let currentObject = null;
    
    // 本地状态
    const showWireframe = ref(false);
    const showGrid = ref(true);
    const cameraPosition = reactive({ x: 0, y: 0, z: 0 });

    // 网格辅助对象
    let gridHelper = null;
    
    // 计算属性
    const isInitialized = computed(() => scene.isInitialized.value);
    const fps = computed(() => scene.fps.value);
    const sceneStats = computed(() => scene.getSceneStats());
    const boxSelection = computed(() => objectSelection.boxSelection);

    // 相机四元数，传递给CubeViewportControls
    const cameraQuaternionRef = ref({ x: 0, y: 0, z: 0, w: 1 });
    
    // 监听器
    let animationId = null;
    
    // 方法
    function initializeScene() {
      if (containerRef.value) {
        scene.initScene(containerRef.value);
        scene.startRender();

        // 初始化网格辅助线
        if (!gridHelper) {
          gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
          gridHelper.visible = showGrid.value;
          scene.sceneManager.scene.add(gridHelper);
        }

        // 初始化TransformControls
        initTransformControls();

        // 设置输入事件监听
        setupInputHandlers();
        
        // 启动相机位置更新
        startCameraPositionUpdate();
        
        // 注释掉默认测试对象
        // addTestObjects();
      }
    }
    
    function addTestObjects() {
      // 添加一个立方体作为测试对象
      scene.createPrimitive('box', {
        name: '测试立方体',
        position: [0, 0, 0],
        scale: [1, 1, 1]
      });
      
      // 添加一个球体
      scene.createPrimitive('sphere', {
        name: '测试球体',
        position: [2, 0, 0],
        scale: [1, 1, 1]
      });
      
      // 添加一个圆柱体
      scene.createPrimitive('cylinder', {
        name: '测试圆柱体',
        position: [-2, 0, 0],
        scale: [1, 1, 1]
      });
    }

    // 初始化TransformControls
    function initTransformControls() {
      if (!scene.sceneManager.camera || !scene.sceneManager.renderer) return;
      transformControls = new TransformControls(scene.sceneManager.camera, scene.sceneManager.renderer.domElement);

      // 监听变换事件，同步属性
      transformControls.addEventListener('objectChange', () => {
        if (currentObject) {
          // 变换已自动作用于对象，无需额外同步
          // 触发对象属性同步，确保属性面板等响应式刷新
          if (scene.objectManager && scene.objectManager.setObjectTransform) {
            scene.objectManager.setObjectTransform(
              currentObject.userData.id,
              {
                position: [currentObject.position.x, currentObject.position.y, currentObject.position.z],
                rotation: [currentObject.rotation.x, currentObject.rotation.y, currentObject.rotation.z],
                scale: [currentObject.scale.x, currentObject.scale.y, currentObject.scale.z]
              }
            );
          }
        }
      });

      // 拖拽时禁用OrbitControls
      transformControls.addEventListener('dragging-changed', function (event) {
        if (scene.sceneManager.controls) {
          scene.sceneManager.controls.enabled = !event.value;
        }
      });

      // 禁止TransformControls事件冒泡到OrbitControls等
      transformControls.addEventListener('mouseDown', function (event) {
        event.stopPropagation?.();
      });

      // 添加辅助对象到场景
      helper = transformControls.getHelper ? transformControls.getHelper() : null;
      if (helper) {
        scene.sceneManager.scene.add(helper);
      }

      // 监听transformMode变化
      watch(() => transform.transformMode.value, (mode) => {
        if (transformControls) {
          transformControls.setMode(mode);
          // 切换模式时重新attach对象，确保控件刷新
          if (currentObject) {
            transformControls.attach(currentObject);
            transformControls.visible = true;
          }
        }
      }, { immediate: true });

      // 监听选中对象变化
      watch(() => objectSelection.selectedObjects.value, (objs) => {
        if (objs.length === 1) {
          currentObject = objs[0];
          transformControls.attach(currentObject);
          transformControls.visible = true;
        } else {
          transformControls.detach();
          transformControls.visible = false;
        }
      }, { immediate: true });
    }
    
    function setupInputHandlers() {
      // 鼠标点击选择
      inputManager.on('click', (event) => {
        if (scene.sceneManager.camera) {
          objectSelection.handleClickSelection(event, scene.sceneManager.camera);
        }
      });
      
      // 鼠标悬停
      inputManager.on('mousemove', (event) => {
        if (scene.sceneManager.camera) {
          objectSelection.handleHover(event, scene.sceneManager.camera);
        }
      });
      
      // 框选
      inputManager.on('dragstart', (event) => {
        if (objectSelection.selectionMode.value === 'box') {
          objectSelection.startBoxSelection(event.mouse.x, event.mouse.y);
        }
      });
      
      inputManager.on('drag', (event) => {
        if (objectSelection.selectionMode.value === 'box') {
          objectSelection.updateBoxSelection(event.mouse.x, event.mouse.y);
        }
      });
      
      inputManager.on('dragend', (event) => {
        if (objectSelection.selectionMode.value === 'box') {
          objectSelection.endBoxSelection(
            scene.sceneManager.camera, 
            scene.sceneManager.renderer.domElement
          );
        }
      });
      
      // 键盘快捷键
      inputManager.on('keydown', (event) => {
        handleKeyboardShortcuts(event);
      });
    }
    
    function handleKeyboardShortcuts(event) {
      switch (event.code) {
        case 'KeyF':
          if (objectSelection.hasSelection.value) {
            const selectedObjects = objectSelection.selectedObjects.value;
            scene.focusOnObject(selectedObjects[0]);
          }
          break;
        case 'KeyG':
          // TODO: 切换到移动模式
          break;
        case 'KeyR':
          // TODO: 切换到旋转模式
          break;
        case 'KeyS':
          // TODO: 切换到缩放模式
          break;
        case 'Delete':
          if (objectSelection.hasSelection.value) {
            // TODO: 删除选中对象
          }
          break;
      }
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
    
    function resetView() {
      scene.updateCameraConfig({
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
      });
    }
    
    function fitToScreen() {
      const objects = scene.objectManager.getAllObjects();
      if (objects.length > 0) {
        // 计算所有对象的包围盒
        const box = new THREE.Box3();
        objects.forEach(obj => {
          box.expandByObject(obj);
        });
        
        if (!box.isEmpty()) {
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          const distance = maxSize * 2;
          
          scene.updateCameraConfig({
            position: { 
              x: center.x + distance, 
              y: center.y + distance, 
              z: center.z + distance 
            },
            target: { x: center.x, y: center.y, z: center.z }
          });
        }
      }
    }
    
    function toggleWireframe() {
      showWireframe.value = !showWireframe.value;
      
      // 应用线框模式到所有对象
      const objects = scene.objectManager.getAllObjects();
      objects.forEach(object => {
        object.traverse(child => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.wireframe = showWireframe.value;
              });
            } else {
              child.material.wireframe = showWireframe.value;
            }
          }
        });
      });
    }
    
    function toggleGrid() {
      showGrid.value = !showGrid.value;
      if (!gridHelper) {
        gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
        scene.sceneManager.scene.add(gridHelper);
      }
      gridHelper.visible = showGrid.value;
    }
    
    function setViewAngle(angle) {
      const distance = 10;
      let position;
      
      switch (angle) {
        case 'front':
          position = { x: 0, y: 0, z: distance };
          break;
        case 'back':
          position = { x: 0, y: 0, z: -distance };
          break;
        case 'left':
          position = { x: -distance, y: 0, z: 0 };
          break;
        case 'right':
          position = { x: distance, y: 0, z: 0 };
          break;
        case 'top':
          position = { x: 0, y: distance, z: 0 };
          break;
        case 'bottom':
          position = { x: 0, y: -distance, z: 0 };
          break;
        default:
          return;
      }
      
      scene.updateCameraConfig({
        position,
        target: { x: 0, y: 0, z: 0 }
      });
    }
    
    function formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }
    
    // 生命周期
    onMounted(() => {
      initializeScene();
    });
    
    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      scene.stopRender();
      inputManager.dispose();
      // 移除TransformControls
      if (transformControls) {
        scene.sceneManager.scene.remove(transformControls);
        if (helper) scene.sceneManager.scene.remove(helper);
        transformControls.dispose?.();
      }
      // 移除网格辅助线
      if (gridHelper) {
        scene.sceneManager.scene.remove(gridHelper);
        gridHelper = null;
      }
    });
    
    return {
      // 模板引用
      containerRef,
      
      // 状态
      isInitialized,
      fps,
      sceneStats,
      boxSelection,
      showWireframe,
      showGrid,
      cameraPosition,
      
      // 方法
      resetView,
      fitToScreen,
      toggleWireframe,
      toggleGrid,
      setViewAngle,
      formatNumber,
      cameraQuaternion: cameraQuaternionRef
    };
  }
};
</script>

<style scoped>
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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/0
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/1
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/2
src/components/scene/SceneViewer.vue

# VSCode Open Tabs
README.md
src/components/scene/PerformanceMonitor.vue
src/components/scene/InteractionHints.vue
src/components/scene/ViewportControls.vue
src/components/scene/SceneViewer.vue
src/components/scene/CubeViewportControls.vue

# Current Time
2025/8/5 下午3:28:23 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
781 / 111.452K tokens used (1%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. toggleGrid()功能已实现，切换时会显示/隐藏THREE.GridHelper。
2. 按.clinerules/要求，新增/修改了SceneViewer.vue，需要同步更新/README.md的项目结构描述。
3. 只需在/README.md中说明SceneViewer.vue已实现toggleGrid网格辅助线显示/隐藏功能。
</thinking>

<read_file>
<path>README.md</path>
</read_file>

---

**User:**

[read_file for 'README.md'] Result:
# 3D 场景编辑器 (Three Editor by AI)

一个基于 Vue 3 + Three.js 的现代化3D场景编辑器，支持三维模型的拖放、调整和属性配置。

## ✅ 功能体系
- 3D场景渲染和管理
- 多种基础几何体创建
- 完整的对象变换系统（移动、旋转、缩放）
- 单选（多选、框选功能已移除，仅支持单选）
- 撤销重做历史记录
- 3D模型和纹理加载（GLTF、OBJ、FBX等格式）
- 拖拽上传和资源管理
- 相机控制和预设视角
- 材质编辑和属性调整
- 场景序列化和导入导出

## 🚀 技术栈

- **前端框架**: Vue 3 + Vite
- **3D引擎**: Three.js
- **构建工具**: Vite
- **网络请求**: Fetch API
- **工具库**: 
  - Lodash - 实用工具函数库
  - Day.js - 轻量级日期时间库

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
│   │   │   ├── PropertyPanel.vue    # 属性面板（已移除操作相关功能，优化了变换输入框宽度）
│   │   │   ├── Toolbar.vue          # 工具栏，对象未选中时移动/旋转/缩放按钮禁用，仅支持单选
│   │   │   ├── AssetBrowser.vue     # 资源浏览器
│   │   │   └── Inspector.vue        # 对象检查器
│   │   ├── scene/             # 3D 场景组件
│   │   │   ├── SceneViewer.vue      # 主场景视图，集成TransformControls，支持对象选中后变换操作
│   │   │   ├── PerformanceMonitor.vue   # 性能监控组件
│   │   │   ├── InteractionHints.vue     # 操作提示组件
│   │   │   ├── ViewportControls.vue     # 视图控制面板组件
│   │   │   ├── CubeViewportControls.vue # 立方体视角控件，6面点击切换视角，镜头联动
│   │   │   ├── ObjectGizmo.vue      # 对象操作控制器
│   │   │   └── Camera.vue           # 相机控制
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
│   ├── App.vue               # 根组件
│   ├── main.js               # 应用入口
│   └── style.css             # 全局样式
├── .gitignore                # Git 忽略文件
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── package-lock.json         # 依赖锁定
├── vite.config.js            # Vite 配置
└── README.md                 # 项目说明
```

## 🎯 主要功能

- **3D场景渲染**: 基于 Three.js 的高性能 3D 渲染
- **几何体创建**: 支持多种基础和扩展几何体创建
  - 基础几何体: 立方体、球体、圆柱体、平面、圆锥体、圆环体
  - 扩展几何体: 十二面体、二十面体、八面体、四面体、环形、管道
  - 灯光对象: 方向光、点光源、聚光灯、环境光、半球光
  - 其他对象: 相机、空对象、文本、精灵
- **模型管理**: 支持多种 3D 模型格式的导入和管理
- **交互操作**: 
  - 资源浏览器中直接添加几何体
  - 实时变换操作 (位移、旋转、缩放)
  - 单对象选择和编辑（多选、框选功能已移除，仅支持单选）
- **属性编辑**: 实时修改模型的材质、几何体等属性
- **场景管理**: 完整的场景层级管理和序列化
- **资源浏览**: 内置资源管理器，支持模型预览和几何体创建

## 🏗️ 架构设计

### 组件层次

1. **UI 层** (`components/editor/`): 负责用户界面和交互
2. **3D 渲染层** (`components/scene/`): 处理 3D 场景渲染和显示
3. **逻辑层** (`composables/`, `core/`): 业务逻辑和状态管理
4. **API层** (`api/`): 数据请求和外部接口
5. **工具层** (`utils/`): 通用工具函数

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

<environment_details>
# VSCode Visible Files
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/0
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/1
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/2
src/components/scene/SceneViewer.vue

# VSCode Open Tabs
README.md
src/components/scene/PerformanceMonitor.vue
src/components/scene/InteractionHints.vue
src/components/scene/ViewportControls.vue
src/components/scene/SceneViewer.vue
src/components/scene/CubeViewportControls.vue

# Current Time
2025/8/5 下午3:28:29 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
122 / 111.452K tokens used (0%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. 需要在/README.md的项目结构部分补充SceneViewer.vue的toggleGrid功能描述。
2. 建议在components/scene/SceneViewer.vue注释后补充“支持网格辅助线显示/隐藏”。
3. 只需小幅修改，不影响其他内容。
</thinking>

<replace_in_file>
<path>README.md</path>
<diff>
------- SEARCH
│   │   │   ├── SceneViewer.vue      # 主场景视图，集成TransformControls，支持对象选中后变换操作
=======
│   │   │   ├── SceneViewer.vue      # 主场景视图，集成TransformControls，支持对象选中后变换操作，支持网格辅助线显示/隐藏
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

## ✅ 功能体系
- 3D场景渲染和管理
- 多种基础几何体创建
- 完整的对象变换系统（移动、旋转、缩放）
- 单选（多选、框选功能已移除，仅支持单选）
- 撤销重做历史记录
- 3D模型和纹理加载（GLTF、OBJ、FBX等格式）
- 拖拽上传和资源管理
- 相机控制和预设视角
- 材质编辑和属性调整
- 场景序列化和导入导出

## 🚀 技术栈

- **前端框架**: Vue 3 + Vite
- **3D引擎**: Three.js
- **构建工具**: Vite
- **网络请求**: Fetch API
- **工具库**: 
  - Lodash - 实用工具函数库
  - Day.js - 轻量级日期时间库

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
│   │   │   ├── PropertyPanel.vue    # 属性面板（已移除操作相关功能，优化了变换输入框宽度）
│   │   │   ├── Toolbar.vue          # 工具栏，对象未选中时移动/旋转/缩放按钮禁用，仅支持单选
│   │   │   ├── AssetBrowser.vue     # 资源浏览器
│   │   │   └── Inspector.vue        # 对象检查器
│   │   ├── scene/             # 3D 场景组件
│   │   │   ├── SceneViewer.vue      # 主场景视图，集成TransformControls，支持对象选中后变换操作，支持网格辅助线显示/隐藏
│   │   │   ├── PerformanceMonitor.vue   # 性能监控组件
│   │   │   ├── InteractionHints.vue     # 操作提示组件
│   │   │   ├── ViewportControls.vue     # 视图控制面板组件
│   │   │   ├── CubeViewportControls.vue # 立方体视角控件，6面点击切换视角，镜头联动
│   │   │   ├── ObjectGizmo.vue      # 对象操作控制器
│   │   │   └── Camera.vue           # 相机控制
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
│   ├── App.vue               # 根组件
│   ├── main.js               # 应用入口
│   └── style.css             # 全局样式
├── .gitignore                # Git 忽略文件
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── package-lock.json         # 依赖锁定
├── vite.config.js            # Vite 配置
└── README.md                 # 项目说明
```

## 🎯 主要功能

- **3D场景渲染**: 基于 Three.js 的高性能 3D 渲染
- **几何体创建**: 支持多种基础和扩展几何体创建
  - 基础几何体: 立方体、球体、圆柱体、平面、圆锥体、圆环体
  - 扩展几何体: 十二面体、二十面体、八面体、四面体、环形、管道
  - 灯光对象: 方向光、点光源、聚光灯、环境光、半球光
  - 其他对象: 相机、空对象、文本、精灵
- **模型管理**: 支持多种 3D 模型格式的导入和管理
- **交互操作**: 
  - 资源浏览器中直接添加几何体
  - 实时变换操作 (位移、旋转、缩放)
  - 单对象选择和编辑（多选、框选功能已移除，仅支持单选）
- **属性编辑**: 实时修改模型的材质、几何体等属性
- **场景管理**: 完整的场景层级管理和序列化
- **资源浏览**: 内置资源管理器，支持模型预览和几何体创建

## 🏗️ 架构设计

### 组件层次

1. **UI 层** (`components/editor/`): 负责用户界面和交互
2. **3D 渲染层** (`components/scene/`): 处理 3D 场景渲染和显示
3. **逻辑层** (`composables/`, `core/`): 业务逻辑和状态管理
4. **API层** (`api/`): 数据请求和外部接口
5. **工具层** (`utils/`): 通用工具函数

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

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/0
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/1
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/2
README.md

# VSCode Open Tabs
src/components/scene/PerformanceMonitor.vue
src/components/scene/InteractionHints.vue
src/components/scene/ViewportControls.vue
src/components/scene/SceneViewer.vue
README.md
src/components/scene/CubeViewportControls.vue

# Current Time
2025/8/5 下午3:28:40 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
212 / 111.452K tokens used (0%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. toggleGrid功能已实现，/README.md已同步更新项目结构说明。
2. 按.clinerules/无需对src/assets目录内容变更做说明，其他要求已满足。
3. 任务已完成，无需进一步操作。
4. 按用户git规范，提交注释需为中文且以"feat:"开头，注释加双引号。
</thinking>

<execute_command>
<command>git add src/components/scene/SceneViewer.vue README.md; git commit -m "feat: SceneViewer.vue支持网格辅助线显示隐藏功能，并更新README项目结构"</command>
<requires_approval>true</requires_approval>
</execute_command>

---

**User:**

[execute_command for 'git add src/components/scene/SceneViewer.vue README.md; git commit -m "feat: SceneViewer.vue支持网格辅助线显示隐藏功能，并更新README项目结构"'] Result:
Command executed.
Output:
[main 2bb1c16] feat: SceneViewer.vue支持网格辅助线显示隐藏功能，并更新README项目结构
 2 files changed, 21 insertions(+), 2 deletions(-)
<environment_details>
# VSCode Visible Files
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/0
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/1
C:/response_9d24c334-8dec-41c2-a3e0-32eb019f545c/2
src/components/scene/SceneViewer.vue

# VSCode Open Tabs
src/components/scene/PerformanceMonitor.vue
src/components/scene/InteractionHints.vue
src/components/scene/ViewportControls.vue
src/components/scene/SceneViewer.vue
README.md
src/components/scene/CubeViewportControls.vue

# Current Time
2025/8/5 下午4:08:23 (Asia/Shanghai, UTC+8:00)

# Context Window Usage
188 / 111.452K tokens used (0%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
SceneViewer.vue 的 toggleGrid() 功能已实现，现在可切换网格辅助线的显示与隐藏。/README.md 项目结构已同步更新，所有变更已按规范提交。
</result>
</attempt_completion>

