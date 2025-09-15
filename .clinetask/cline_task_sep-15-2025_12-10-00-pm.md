**User:**

<task>
duplicateSelected()函数已经从ObjectManager.js迁移到useObjectSelection.js。
请修改src\components\editor\Toolbar.vue：
- 参考deleteSelected，抛出事件
- Editor.vue中接受事件，执行duplicateSelected
</task>
<environment_details>
# VSCode Visible Files
src/Editor.vue

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
src/core/ObjectManager.js
src/composables/useTransform.js
README.md

# Current Time
9/15/2025, 12:05:52 PM (Asia/Shanghai, UTC+8:00)

# Current Working Directory (d:/pci-workspace/3D/three-editor-by-ai) Files
.gitignore
index.html
LICENSE
package-lock.json
package.json
README.md
vite.config.js
public/
public/vfs.json
public/images/
public/images/screenshot01.png
public/vfs/
public/vfs/.all.json
public/vfs/.folder.json
public/vfs/zoo.json
public/vfs/models/
public/vfs/models/.folder.json
public/vfs/models/fbx/
public/vfs/models/fbx/.folder.json
public/vfs/models/fbx/nurbs.fbx
public/vfs/models/gltf/
public/vfs/models/gltf/.folder.json
public/vfs/models/gltf/collision-world.glb
public/vfs/models/gltf/Flamingo.glb
public/vfs/models/gltf/Horse.glb
public/vfs/models/gltf/Parrot.glb
public/vfs/models/gltf/Stork.glb
public/vfs/models/obj/
public/vfs/models/obj/.folder.json
public/vfs/models/obj/tree.obj
public/vfs/textures/
public/vfs/textures/.folder.json
public/vfs/textures/brick/
public/vfs/textures/brick/.folder.json
public/vfs/textures/brick/brick_bump.jpg
public/vfs/textures/brick/brick_diffuse.jpg
public/vfs/textures/brick/brick_roughness.jpg
public/vfs/textures/hardwood2/
public/vfs/textures/hardwood2/.folder.json
public/vfs/textures/hardwood2/hardwood2_bump.jpg
public/vfs/textures/hardwood2/hardwood2_diffuse.jpg
public/vfs/textures/hardwood2/hardwood2_roughness.jpg
script/
script/generate-vfs.js
script/package-lock.json
script/package.json
script/vfs-server.js
script/vfs-server.json
src/
src/App.vue
src/Editor.vue
src/main-func.js
src/main.js
src/style.scss
src/components/
src/components/dialog/
src/components/dialog/EditorConfigDialog.vue
src/components/dialog/TextureSelectDialog.vue
src/components/dialog/VfsFileChooserDialog.vue
src/components/dialog/VfsFileSaverDialog.vue
src/components/editor/
src/components/editor/AssetBrowser.vue
src/components/editor/EditorFooter.vue
src/components/editor/Inspector.vue
src/components/editor/ObjectItem.vue
src/components/editor/PrimitiveBrowser.vue
src/components/editor/PropertyPanel.vue
src/components/editor/ResourcePanel.vue
src/components/editor/Toolbar.vue
src/components/editor/VfsFileBrowser.vue
src/components/property/
src/components/property/AnimationPropertyPane.vue
src/components/property/BasePropertyPane.vue
src/components/property/LightPropertyPane-AmbientLight.vue
src/components/property/LightPropertyPane-DirectionalLight.vue
src/components/property/LightPropertyPane-HemisphereLight.vue
src/components/property/LightPropertyPane-PointLight.vue
src/components/property/LightPropertyPane-SpotLight.vue
src/components/property/MaterialPropertyPane.vue
src/components/property/PrimitivePropertyPane-box.vue
src/components/property/PrimitivePropertyPane-cone.vue
src/components/property/PrimitivePropertyPane-cylinder.vue
src/components/property/PrimitivePropertyPane-dodecahedron.vue
src/components/property/PrimitivePropertyPane-icosahedron.vue
src/components/property/PrimitivePropertyPane-octahedron.vue
src/components/property/PrimitivePropertyPane-plane.vue
src/components/property/PrimitivePropertyPane-ring.vue
src/components/property/PrimitivePropertyPane-sphere.vue
src/components/property/PrimitivePropertyPane-tetrahedron.vue
src/components/property/PrimitivePropertyPane-torus.vue
src/components/property/PrimitivePropertyPane-tube.vue
src/components/property/ScenePropertyPane.vue
src/components/property/SceneUserDataPropertyPane.vue
src/components/property/TransformPropertyPane.vue
src/components/property/UserDataPropertyPane.vue
src/components/scene/
src/components/scene/CubeViewportControls.vue
src/components/scene/InteractionHints.vue
src/components/scene/SceneViewer.vue
src/components/scene/StatHints.vue
src/components/scene/ViewportControls.vue
src/composables/
src/composables/useAssets.js
src/composables/useEditorConfig.js
src/composables/useObjectSelection.js
src/composables/useScene.js
src/composables/useTransform.js
src/constants/
src/constants/PRIMITIVES.json
src/controls/
src/controls/FlyControls.js
src/core/
src/core/AssetLoader.js
src/core/InputManager.js
src/core/ObjectManager.js
src/core/SceneManager.js
src/services/
src/services/static-drive-api.js
src/services/vfs-server-api.js
src/services/vfs-service.js
src/utils/
src/utils/fileUtils.js
src/utils/geometryUtils.js
src/utils/mathUtils.js

# Git Remote URLs
origin: https://github.com/fellow99/three-editor-by-ai.git

# Latest Git Commit Hash
8c1cc2e348313c4528f44139209e9c1f7cf93ed3

# Context Window Usage
0 / 128K tokens used (0%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. 用户要求将duplicateSelected的调用方式改为事件抛出，参考deleteSelected的实现。
2. 需要先查看Toolbar.vue中deleteSelected的事件抛出方式，然后为duplicateSelected添加类似的事件抛出。
3. 再查看Editor.vue，找到deleteSelected事件的监听和处理方式，添加duplicateSelected事件的监听，并调用useObjectSelection.js中的duplicateSelected。
4. 由于涉及事件抛出和监听，需确保事件名、参数一致。
5. 先查看Toolbar.vue中deleteSelected的实现细节。
</thinking>

<read_file>
<path>src/components/editor/Toolbar.vue</path>
</read_file>

---

**User:**

[read_file for 'src/components/editor/Toolbar.vue'] Result:
<!--
  主工具栏组件
  提供场景文件、编辑、对象变换等操作入口
  文件按钮区包含：新建、导出、导入、暂存、加载、保存
  其中“导出”/“导入”使用新命名及新图标，“暂存”保存到localStorage
  “加载”“保存”按钮为预留，暂未实现
  新增功能：视图分组增加“锁定相机”按钮，控制SceneManager的controlsLocked状态，锁定时controls.enabled=false。
-->
<template>
  <div class="ribbon-toolbar dark">
    <div class="ribbon-content">
      <!-- 文件 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">文件</div>
        <div class="ribbon-group-buttons">
          <button @click="newScene" class="ribbon-btn" title="新建场景">
            <span class="icon">📄</span>
            <div>新建</div>
          </button>
          <button @click="saveLocal" class="ribbon-btn" title="暂存到本地">
            <span class="icon">🗄️</span>
            <div>暂存</div>
          </button>
          <button @click="saveScene" class="ribbon-btn" title="保存场景">
            <span class="icon">💾</span>
            <div>保存</div>
          </button>
          <button @click="loadScene" class="ribbon-btn" title="加载场景">
            <span class="icon">📂</span>
            <div>加载</div>
          </button>
          <button @click="exportScene" class="ribbon-btn" title="导出场景">
            <span class="icon">📤</span>
            <div>导出</div>
          </button>
          <button @click="importScene" class="ribbon-btn" title="导入场景">
            <span class="icon">📥</span>
            <div>导入</div>
          </button>
        </div>
      </div>
      <!-- 编辑 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">编辑</div>
        <div class="ribbon-group-buttons">
          <button @click="undo" :disabled="!canUndo" class="ribbon-btn" title="撤销 (Ctrl+Z)">
            <span class="icon">↶</span>
            <div>撤销</div>
          </button>
          <button @click="redo" :disabled="!canRedo" class="ribbon-btn" title="重做 (Ctrl+Y)">
            <span class="icon">↷</span>
            <div>重做</div>
          </button>
          <button @click="duplicateSelected" :disabled="!hasSelection" class="ribbon-btn" title="复制 (Ctrl+D)">
            <span class="icon">📋</span>
            <div>复制</div>
          </button>
          <button @click="deleteSelected" :disabled="!hasSelection" class="ribbon-btn danger" title="删除 (Delete)">
            <span class="icon">🗑️</span>
            <div>删除</div>
          </button>
        </div>
      </div>
      <!-- 对象变换 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">对象变换</div>
        <div class="ribbon-group-buttons">
          <button
            @click="setTransformMode('translate')"
            :class="['ribbon-btn', { active: transformMode === 'translate' }]"
            :disabled="!hasSelection"
            title="移动工具 (G)"
          >
            <span class="icon">↔️</span>
            <div>移动</div>
          </button>
          <button
            @click="setTransformMode('rotate')"
            :class="['ribbon-btn', { active: transformMode === 'rotate' }]"
            :disabled="!hasSelection"
            title="旋转工具 (R)"
          >
            <span class="icon">🔄</span>
            <div>旋转</div>
          </button>
          <button
            @click="setTransformMode('scale')"
            :class="['ribbon-btn', { active: transformMode === 'scale' }]"
            :disabled="!hasSelection"
            title="缩放工具 (S)"
          >
            <span class="icon">📏</span>
            <div>缩放</div>
          </button>
        </div>
      </div>
      <!-- 视图 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">视图</div>
        <div class="ribbon-group-buttons">
          <button
            @click="focusSelected"
            :disabled="!hasSelection"
            class="ribbon-btn"
            title="聚焦到选中对象 (F)"
          >
            <span class="icon">🎯</span>
            <div>聚焦</div>
          </button>
          <button
            @click="resetCamera"
            class="ribbon-btn"
            title="重置相机"
          >
            <span class="icon">📷</span>
            <div>重置相机</div>
          </button>
          <button
            @click="toggleLockCamera"
            class="ribbon-btn"
            :class="{ active: controlsLocked }"
            title="锁定/解锁相机"
          >
            <span class="icon">{{ controlsLocked ? '🔒' : '🔓' }}</span>
            <div>锁定相机</div>
          </button>
        </div>
      </div>
      <!-- 配置 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">配置</div>
        <div class="ribbon-group-buttons">
          <button @click="showEditorConfig = true" class="ribbon-btn" title="编辑器配置">
            <span class="icon">⚙️</span>
            <div>编辑器</div>
          </button>
        </div>
      </div>
    </div>
    <!-- 编辑器配置对话框 -->
    <EditorConfigDialog v-if="showEditorConfig" v-model="showEditorConfig" />
    <!-- 文件选择对话框 -->
    <VfsFileChooserDialog v-if="showFileChooser" v-model="showFileChooser" @select="handleFileSelect" />
    <!-- 文件保存对话框 -->
    <VfsFileSaverDialog
      v-if="showFileSaver"
      v-model="showFileSaver"
      :text="sceneJsonText"
      ext="json"
      @saved="handleFileSaved"
    />
  </div>
</template>

<script>
import { ref, computed, inject, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import { useScene } from '../../composables/useScene.js';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import useTransform from '../../composables/useTransform.js';
import { useObjectManager } from '../../core/ObjectManager.js';
import { exportJSON } from '../../utils/fileUtils.js';
import { useSceneManager } from '../../core/SceneManager.js';
import EditorConfigDialog from '../dialog/EditorConfigDialog.vue';
import VfsFileChooserDialog from '../dialog/VfsFileChooserDialog.vue';
import VfsFileSaverDialog from '../dialog/VfsFileSaverDialog.vue';
import vfsService from '../../services/vfs-service.js';

export default {
  name: 'Toolbar',
  components: { EditorConfigDialog, VfsFileChooserDialog, VfsFileSaverDialog },
  emits: ['delete-selected'],
  /**
   * 工具栏组件
   * 提供场景文件、编辑、对象变换等操作入口
   */
  setup(props, { emit }) {
    // 注入全局appState
    const appState = inject('appState');
    /**
     * 编辑器配置对话框显示状态
     * @type {import('vue').Ref<boolean>}
     */
    const showEditorConfig = ref(false);
    // Ribbon tab 配置
    const tabs = [
      { key: 'file', label: '文件' },
      { key: 'edit', label: '编辑' },
      { key: 'tools', label: '工具' },
      { key: 'view', label: '视图' },
      { key: 'settings', label: '设置' }
    ];
    const activeTab = ref('file');
    const scene = useScene();
    const objectSelection = useObjectSelection();
    const transform = useTransform();
    const objectManager = useObjectManager();
    // 相机锁定相关
    const sceneManager = useSceneManager();
    const controlsLocked = ref(sceneManager.getControlsLocked());
    function toggleLockCamera() {
      const next = !controlsLocked.value;
      sceneManager.setControlsLocked(next);
      controlsLocked.value = next;
    }
    
    // 计算属性
    const transformMode = computed(() => transform.transformMode.value);
    // 只保留单选模式，移除 selectionMode 相关
    const hasSelection = computed(() => objectSelection.hasSelection.value);
    const selectionCount = computed(() => objectSelection.selectionCount.value);
    const fps = computed(() => scene.fps.value);
    const objectCount = computed(() => objectManager.getAllObjects().length);
    const canUndo = computed(() => transform.transformHistory.undoStack.length > 0);
    const canRedo = computed(() => transform.transformHistory.redoStack.length > 0);

    // 监听选择变化，重新触发锁定相机逻辑
    watch(hasSelection, () => {
      sceneManager.setControlsLocked(controlsLocked.value);
    });
    
    // 方法
    /**
     * 新建场景，清空所有内容
     */
    /**
     * 新建场景，清空所有内容
     */
    function newScene() {
      ElMessageBox.confirm('确定要新建场景吗？这将清除当前所有内容。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        objectSelection.clearSelection();
        transform.clearHistory();

        scene.clearScene();
        scene.resetScene();
      }).catch(() => {});
    }
    
    /**
     * 保存当前场景为JSON文件
     */
    /**
     * 导出当前场景为JSON文件
     */
    function exportScene() {
      try {
        const sceneData = scene.exportScene();
        const filename = `scene_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.json`;
        exportJSON(sceneData, filename);
        ElMessage.success('场景已导出');
      } catch (error) {
        console.error('导出场景失败:', error);
        ElMessage.error('导出场景失败，请检查控制台错误信息。');
      }
    }

    /**
     * 导入场景文件
     * 选择JSON文件并调用SceneManager.loadScene(json)
     */
    async function importScene() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            const text = await file.text();
            const sceneData = JSON.parse(text);
            ElMessageBox.confirm('确定要导入这个场景吗？这将替换当前场景。', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(async () => {
              if (appState) appState.isLoading = true;
              try {
                const sceneManager = useSceneManager();
                objectSelection.clearSelection();
                transform.clearHistory();
                await sceneManager.loadScene(sceneData);
                ElMessage.success('场景导入成功');
              } catch (e) {
                console.error('导入场景失败:', e);
                ElMessage.error('导入场景失败，请检查文件格式。');
              } finally {
                if (appState) appState.isLoading = false;
              }
            }).catch(() => {});
          } catch (error) {
            console.error('导入场景失败:', error);
            ElMessage.error('导入场景失败，请检查文件格式。');
          }
        }
      };
      input.click();
    }

    /**
     * 暂存场景到localStorage
     */
    function saveLocal() {
      try {
        const sceneData = scene.exportScene();
        localStorage.setItem('three-editor-by-ai_editorScene', JSON.stringify(sceneData));
        ElMessage.success('场景已暂存到本地');
      } catch (error) {
        console.error('暂存失败:', error);
        ElMessage.error('暂存失败，请检查控制台错误信息。');
      }
    }

    /**
     * 加载场景：弹出文件选择对话框，选中文件后加载内容并调用loadScene
     */
    const showFileChooser = ref(false);
    async function loadScene() {
      showFileChooser.value = true;
    }
    /**
     * 文件选择回调
     * @param {Object} fileInfo 选中的文件信息
     */
    async function handleFileSelect(fileInfo) {
      showFileChooser.value = false;
      if (!fileInfo || !fileInfo.path) return;
      try {
        if (appState) appState.isLoading = true;
        // 获取文件内容（修正：通过 vfsService.getVfs 获取 vfs，再调用 vfs.content）
        const vfs = vfsService.getVfs(fileInfo.drive);
        if (!vfs || typeof vfs.content !== 'function') {
          ElMessage.error('未找到指定虚拟文件系统或接口不支持');
          return;
        }
        const contentRes = await vfs.content(fileInfo.path + fileInfo.name);
        if (!contentRes) {
          ElMessage.error('文件内容获取失败');
          return;
        }
        // 加载场景
        const sceneManager = useSceneManager();
        objectSelection.clearSelection();
        transform.clearHistory();
        const sceneData = JSON.parse(contentRes);
        await sceneManager.loadScene(sceneData);
        ElMessage.success('场景加载成功');
      } catch (e) {
        console.error('加载场景失败:', e);
        ElMessage.error('加载场景失败，请检查文件内容或格式。');
      } finally {
        if (appState) appState.isLoading = false;
      }
    }

    /**
     * 保存场景：弹出保存对话框，填写文件名后保存到虚拟文件系统
     */
    const showFileSaver = ref(false);
    const sceneJsonText = ref('');
    function saveScene() {
      try {
        const sceneData = scene.exportScene();
        sceneJsonText.value = JSON.stringify(sceneData, null, 2);
        showFileSaver.value = true;
      } catch (error) {
        ElMessage.error('场景序列化失败');
      }
    }
    function handleFileSaved(path) {
      showFileSaver.value = false;
      ElMessage.success('场景已保存到虚拟文件系统');
    }
    
    /**
     * 设置对象变换模式
     * @param {string} mode 变换模式
     */
    function setTransformMode(mode) {
      transform.transformMode.value = mode;
    }
    
    /**
     * 撤销上一步操作
     */
    function undo() {
      transform.undo();
    }
    
    /**
     * 重做操作
     */
    function redo() {
      transform.redo();
    }
    
    /**
     * 复制选中的对象
     */
    function duplicateSelected() {
      objectManager.duplicateSelected();
    }
    
    /**
     * 删除选中的对象
     */
    function deleteSelected() {
        emit('delete-selected');
    }
    
    /**
     * 聚焦到选中对象
     */
    function focusSelected() {
      const selectedObjects = objectSelection.selectedObjects.value;
      if (selectedObjects.length > 0) {
        scene.focusOnObject(selectedObjects[0]);
      }
    }
    
    /**
     * 重置相机位置
     */
    function resetCamera() {
      scene.updateCameraConfig({
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
      });
    }
    
    
    
    return {
      // 状态
      tabs,
      activeTab,
      transformMode,
      // selectionMode, // 移除
      hasSelection,
      selectionCount,
      fps,
      objectCount,
      canUndo,
      canRedo,
      
      // 方法
      newScene,
      exportScene,
      importScene,
      saveLocal,
      loadScene,
      saveScene,
      setTransformMode,
      // setSelectionMode, // 移除
      undo,
      redo,
      duplicateSelected,
      deleteSelected,
      focusSelected,
      resetCamera,
      showEditorConfig,
      showFileChooser,
      handleFileSelect,
      showFileSaver,
      sceneJsonText,
      handleFileSaved,
      controlsLocked,
      toggleLockCamera
    };
  }
};
</script>

<style lang="scss" scoped>
.ribbon-toolbar.dark {
  background: #23272e;
  color: #f3f3f3;
  border-bottom: 1.5px solid #2d323a;
  padding: 0 12px;
  box-shadow: 0 2px 8px #0006;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.ribbon-content {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: flex-end;
  padding: 4px;
  width: 100%;
  flex-wrap: wrap;
}

.ribbon-group {
  background: #282c34;
  border-radius: 8px 8px 0 0;
  border: 1.5px solid #353a42;
  box-shadow: 0 2px 8px #0003;
  padding: 4px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
  height: 80px;
  position: relative;
  box-sizing: border-box;
}

.ribbon-group-title {
  font-size: 13px;
  font-weight: bold;
  color: #7ecfff;
  margin-bottom: 4px;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px #0008;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.ribbon-group-buttons {
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: flex-start;
}

.ribbon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  background: #23272e;
  border: 1px solid #353a42;
  border-radius: 5px;
  color: #f3f3f3;
  font-size: 11px;
  cursor: pointer;
  margin-bottom: 6px;
  min-width: 48px;
  transition: background 0.2s, border 0.2s, color 0.2s;
}

.ribbon-btn:hover:not(:disabled) {
  background: #2d323a;
  border-color: #7ecfff;
  color: #fff;
}

.ribbon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ribbon-btn.active {
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
}

.ribbon-btn.danger {
  background: #d73a49;
  border-color: #e85662;
  color: #fff;
}

.ribbon-btn.danger:hover:not(:disabled) {
  background: #e85662;
}

.icon {
  font-size: 18px;
  line-height: 1;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 6px;
  color: #b3cfff;
}

.toggle-text {
  user-select: none;
}

.ribbon-status {
  margin-left: auto;
  display: flex;
  gap: 18px;
  padding: 6px 0 8px 0;
}


/* 移动端响应式 */
@media (max-width: 900px) {
  .ribbon-content {
    flex-wrap: wrap;
    gap: 12px;
  }
  .ribbon-group {
    min-width: 90px;
    padding: 8px 8px 10px 8px;
  }
  .ribbon-group-title {
    font-size: 12px;
    margin-bottom: 6px;
  }
  .ribbon-btn {
    min-width: 40px;
    font-size: 10px;
    padding: 5px 6px;
  }
  .icon {
    font-size: 15px;
  }
}
</style>

<environment_details>
# VSCode Visible Files
src/Editor.vue

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
src/core/ObjectManager.js
src/composables/useTransform.js
README.md

# Current Time
9/15/2025, 12:05:57 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
14,638 / 111.424K tokens used (13%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. Toolbar.vue中deleteSelected通过emit('delete-selected')抛出事件，duplicateSelected当前直接调用objectManager.duplicateSelected()。
2. 需要将duplicateSelected方法改为emit('duplicate-selected')，并在emits中声明'duplicate-selected'。
3. 还需在Editor.vue中监听duplicate-selected事件，并调用useObjectSelection.js中的duplicateSelected。
4. 先查看Editor.vue中如何处理delete-selected事件，然后再做相应修改。
</thinking>

<read_file>
<path>src/Editor.vue</path>
</read_file>

---

**User:**

[read_file for 'src/Editor.vue'] Result:
<!--
  3D场景编辑器主应用组件
  - 编辑器主界面，集成场景视图、工具栏、属性面板等
  - 部分UI组件采用element-plus
-->
<template>
  <div id="app" class="editor-container">
    <!-- 加载遮罩 -->
    <div v-if="appState.isLoading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="spin"><Loading /></el-icon>
        <!-- <h2>3D 场景编辑器</h2> -->
        <p>正在加载，请稍候...</p>
      </div>
    </div>

    <!-- 顶部工具栏 -->
    <!-- 主工具栏 -->
    <div class="main-toolbar">
      <Toolbar @delete-selected="handleDeleteSelected" />
    </div>
    
    <!-- 主编辑区域 -->
    <main class="editor-main">
      <!-- 主场景视口 -->
      <div class="editor-viewport">
        <!-- 浮动面板：右上 -->
        <ViewportControls
          :showWireframe="showWireframe"
          :showGrid="showGrid"
          :resetView="resetView"
          :fitToScreen="fitToScreen"
          :toggleWireframe="toggleWireframe"
          :toggleGrid="toggleGrid"
          :class="[
            'viewport-controls',
            { 'with-right': !appState.rightPanelCollapsed }
          ]"
        />
        <!-- 浮动面板：右下 -->
        <CubeViewportControls
          v-if="scene.sceneManager && scene.sceneManager.controls"
          :class="[
            'cube-controls-bottomright',
            { 'with-right': !appState.rightPanelCollapsed }
          ]"
          :camera="scene.sceneManager?.camera"
          :renderer="scene.sceneManager?.renderer"
          :controls="scene.sceneManager?.controls"
          :cameraQuaternion="cameraQuaternion"
          @viewChange="setViewAngle"
        />
        <!-- 浮动面板：左上 性能监控 -->
        <StatHints
          :class="[
            'stat-hints',
            { 'with-left': !appState.leftPanelCollapsed }
          ]"
        />
        <!-- 浮动面板：左下 -->
        <InteractionHints
          :class="[
            'interaction-hints',
            { 'with-left': !appState.leftPanelCollapsed }
          ]"
        />
        <SceneViewer
          @delete-selected="handleDeleteSelected"
          :showWireframe="showWireframe"
          :showGrid="showGrid"
        />
      </div>
      
      <!-- 左侧资源面板 -->
      <div 
        v-show="!appState.leftPanelCollapsed" 
        class="editor-sidebar left-panel"
        :style="{ width: appState.panels.leftWidth + 'px' }"
      >
        <ResourcePanel
          :activeLeftTab="appState.activeLeftTab"
          :setActiveLeftTab="setActiveLeftTab"
        />
      </div>
      <!-- 浮动切换按钮（左侧） -->
      <div 
        @click="toggleLeftPanel" 
        class="sidebar-toggle left"
        :class="{ active: !appState.leftPanelCollapsed }"
      >
      </div>
      
      <!-- 右侧属性面板 -->
      <div 
        v-show="!appState.rightPanelCollapsed" 
        class="editor-sidebar right-panel"
        :style="{ width: appState.panels.rightWidth + 'px' }"
      >
        <PropertyPanel />
      </div>
      <!-- 浮动切换按钮（右侧） -->
      <div
        @click="toggleRightPanel" 
        class="sidebar-toggle right"
        :class="{ active: !appState.rightPanelCollapsed }"
      >
      </div>
    </main>

    <!-- 状态栏 -->
    <EditorFooter
      :objectSelection="objectSelection"
      :scene="scene"
      :cameraPosition="cameraPosition"
      :cameraTarget="cameraTarget"
      @update:cameraPosition="onCameraPositionUpdate"
      @update:cameraTarget="onCameraTargetUpdate"
    />
  </div>
</template>

<script setup>
 // 3D场景编辑器主应用组件
import { ref, reactive, provide, onMounted, onUnmounted } from 'vue';

/**
 * 处理EditorFooter相机位置变更事件
 * @param {Object} pos 新的相机位置
 */
function onCameraPositionUpdate(pos) {
  if (scene.sceneManager?.camera) {
    scene.sceneManager.camera.position.set(pos.x, pos.y, pos.z);
  }
}
/**
 * 处理EditorFooter目标点变更事件
 * @param {Object} target 新的controls target
 */
function onCameraTargetUpdate(target) {
  if (scene.sceneManager?.controls && scene.sceneManager.controls.target) {
    scene.sceneManager.controls.target.set(target.x, target.y, target.z);
    // 同步相机朝向
    if (scene.sceneManager.camera && typeof scene.sceneManager.camera.lookAt === 'function') {
      scene.sceneManager.camera.lookAt(target.x, target.y, target.z);
    }
  }
}
import { ElMessageBox } from 'element-plus';
import 'element-plus/es/components/message-box/style/css';
import { useScene } from './composables/useScene.js';
// 引入element-plus图标
import { Setting, Loading } from '@element-plus/icons-vue';
import { useObjectSelection } from './composables/useObjectSelection.js';
import { useTransform } from './composables/useTransform.js';
import { useAssets } from './composables/useAssets.js';

// 导入组件
import Toolbar from './components/editor/Toolbar.vue';
import ResourcePanel from './components/editor/ResourcePanel.vue';
import SceneViewer from './components/scene/SceneViewer.vue';
import PropertyPanel from './components/editor/PropertyPanel.vue';
import EditorFooter from './components/editor/EditorFooter.vue';

// 浮动面板组件
import ViewportControls from './components/scene/ViewportControls.vue';
import CubeViewportControls from './components/scene/CubeViewportControls.vue';
import InteractionHints from './components/scene/InteractionHints.vue';
import StatHints from './components/scene/StatHints.vue';

 // 应用状态管理
const appState = reactive({
  isLoading: true,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  bottomPanelCollapsed: true,
  activeLeftTab: 'primitives', // 'primitives' | 'files' | 'assets' | 'inspector'
  panels: {
    leftWidth: 300,
    rightWidth: 300,
    bottomHeight: 200
  }
});

// 左侧面板控制方法
function toggleLeftPanel() {
  appState.leftPanelCollapsed = !appState.leftPanelCollapsed;
}

import { computed } from 'vue';

// 使用各种 composables
const scene = useScene();
const objectSelection = useObjectSelection();
const transform = useTransform();
const assets = useAssets();

import * as THREE from 'three';

// 提供给子组件使用
provide('scene', scene);
provide('objectSelection', objectSelection);
provide('transform', transform);
provide('assets', assets);
provide('appState', appState);

// ====== 以下为浮动面板迁移相关状态和方法 ======

// 线框/网格显示
const showWireframe = ref(false);
const showGrid = ref(true);

/**
 * @description 相机位置与四元数
 */
const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
const cameraQuaternion = ref({ x: 0, y: 0, z: 0, w: 1 });
/**
 * @description OrbitControls target（即视点目标点），用于底部状态栏显示
 */
const cameraTarget = reactive({ x: 0, y: 0, z: 0 });

// 性能监控
const fps = computed(() => scene.fps.value);
const sceneStats = computed(() => scene.getSceneStats());

// 定时更新相机状态
let animationId = null;
function updateCameraState() {
  if (scene.sceneManager?.camera) {
    const pos = scene.sceneManager.camera.position;
    cameraPosition.x = pos.x;
    cameraPosition.y = pos.y;
    cameraPosition.z = pos.z;
    // 获取 OrbitControls target
    const controls = scene.sceneManager.controls;
    if (controls && controls.target) {
      cameraTarget.x = controls.target.x;
      cameraTarget.y = controls.target.y;
      cameraTarget.z = controls.target.z;
    }
  }
  animationId = requestAnimationFrame(updateCameraState);
}

// 控制方法
function resetView() {
  scene.updateCameraConfig({
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 }
  });
}

function fitToScreen() {
  const objects = scene.objectManager.getAllObjects();
  if (objects.length > 0) {
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
  // 由SceneViewer负责网格辅助线的添加/显示
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

// 生命周期挂载/卸载
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard);
  setTimeout(() => {
    appState.isLoading = false;
  }, 1000);
  updateCameraState();
});
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);
  if (animationId) cancelAnimationFrame(animationId);
});

// 键盘快捷键处理
function handleKeyboard(event) {
  // 阻止某些默认行为
  if (event.ctrlKey || event.metaKey) {
    switch (event.code) {
      case 'KeyS':
        event.preventDefault();
        // 保存场景
        break;
      case 'KeyZ':
        event.preventDefault();
        if (event.shiftKey) {
          // 重做
          transform.redo?.();
        } else {
          // 撤销
          transform.undo?.();
        }
        break;
      case 'KeyD':
        event.preventDefault();
        // 复制对象
        if (objectSelection.hasSelection.value) {
          // TODO: 实现复制功能
        }
        break;
    }
  }
  
  // 单键快捷键
  switch (event.code) {
    case 'Delete':
      if (objectSelection.hasSelection.value) {
        ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
          selectedIds.forEach(id => {
            scene.removeObjectFromScene(id);
          });
          objectSelection.clearSelection();
        }).catch(() => {});
      }
      break;
    case 'Escape':
      objectSelection?.clearSelection?.();
      break;
  }
}


function toggleRightPanel() {
  appState.rightPanelCollapsed = !appState.rightPanelCollapsed;
}

function setActiveLeftTab(tab) {
  appState.activeLeftTab = tab;
  if (appState.leftPanelCollapsed) {
    appState.leftPanelCollapsed = false;
  }
}

function handleDeleteSelected() {
  if (objectSelection.hasSelection.value) {
    ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
      selectedIds.forEach(id => {
        scene.removeObjectFromScene(id);
      });
      objectSelection.clearSelection();
    }).catch(() => {});
  }
}

// 生命周期
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyboard);
  
  // 应用加载完成
  setTimeout(() => {
    appState.isLoading = false;
  }, 1000);
});

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('keydown', handleKeyboard);
});
</script>

<style lang="scss" scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #1a1a1a;
  color: #fff;
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(33,33,33,0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #333;
  border-top: 4px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.loading-content p {
  margin: 0;
  color: #aaa;
  font-size: 14px;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}


/* 主工具栏 */
.main-toolbar {
  border-bottom: 1px solid #444;
}

/* 主编辑区域 */
.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 侧边栏 */
.editor-sidebar {
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.left-panel {
  left: 0;
}

.right-panel {
  right: 0;
}

.left-panel {
  border-right: 1px solid #444;
}

.right-panel {
  border-left: 1px solid #444;
}

/* 浮动切换按钮样式 */
.sidebar-toggle {
  cursor: pointer;
  position: absolute;
  top: 0;
  z-index: 20;
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.sidebar-toggle.left {
  left: 0;
  top: 50%;
  width: 10px;
  height: 50px;
  border-radius: 0 10px 10px 0;
}
.sidebar-toggle.right {
  right: 0;
  top: 50%;
  width: 10px;
  height: 50px;
  border-radius: 10px 0 0 10px;
}


.sidebar-toggle.left.active {
  left: 300px; /* 300px面板宽度 */
}
.sidebar-toggle.right.active {
  right: 300px; /* 300px面板宽度 */
}

/* 面板标签页 */
.panel-tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #444;
  color: #fff;
}

.tab-btn.active {
  background: #2a2a2a;
  border-bottom-color: #007acc;
  color: #fff;
}

/* 面板内容 */
.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 主视口 */
.editor-viewport {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #1a1a1a;
  overflow: hidden;
  z-index: 1;
}

/* 状态栏 */
.editor-footer {
  height: 28px;
  background: #2a2a2a;
  border-top: 1px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: #aaa;
}

.footer-left,
.footer-center,
.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  padding: 2px 8px;
  background: #333;
  border-radius: 3px;
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-sidebar {
    width: 280px !important;
  }
  
  .header-left h1 {
    font-size: 14px;
  }
  
  .panel-toggle-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    height: 44px;
    padding: 0 12px;
  }
  
  .header-left h1 {
    font-size: 12px;
  }
  
  .editor-sidebar {
    width: 260px !important;
  }
  
  .tab-btn {
    padding: 10px 12px;
    font-size: 11px;
  }
  
  .editor-footer {
    height: 24px;
    padding: 0 12px;
    font-size: 10px;
  }
  
  .footer-center {
    display: none;
  }
}

/* 深色主题优化 */
:deep(.panel),
:deep(.asset-browser),
:deep(.inspector),
:deep(.property-panel) {
  background: #2a2a2a;
  color: #fff;
}

/* 滚动条样式 */
:deep(*::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(*::-webkit-scrollbar-track) {
  background: #333;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: #555;
  border-radius: 4px;
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: #666;
}

/* 选择文本颜色 */
::selection {
  background: #007acc;
  color: #fff;
}

:deep(::selection) {
  background: #007acc;
  color: #fff;
}
/* 浮动面板自适应侧边栏 */
.viewport-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 200;
  transition: right 0.2s, left 0.2s;
}
.viewport-controls.with-right {
  right: 316px; /* 300px面板+16px间距 */
}
.viewport-controls.with-left {
  left: 316px;
}
.viewport-controls.with-left.with-right {
  left: 316px;
  right: 316px;
}

.cube-controls-bottomright {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 300;
  transition: right 0.2s, bottom 0.2s;
}
.cube-controls-bottomright.with-right {
  right: 316px;
}

.interaction-hints {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 200;
  transition: left 0.2s;
}
.interaction-hints.with-left {
  left: 316px;
}

/* 性能监控面板定位样式 */
.stat-hints {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 210;
  transition: left 0.2s;
}
.stat-hints.with-left {
  left: 316px;
}
</style>

<environment_details>
# VSCode Visible Files
src/Editor.vue

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
src/core/ObjectManager.js
src/composables/useTransform.js
README.md

# Current Time
9/15/2025, 12:06:01 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
17,724 / 111.424K tokens used (16%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. Toolbar.vue中deleteSelected通过emit('delete-selected')，Editor.vue通过@delete-selected="handleDeleteSelected"监听并处理。
2. 需要让Toolbar.vue duplicateSelected方法也通过emit('duplicate-selected')抛出事件，并在emits中声明'duplicate-selected'。
3. Editor.vue中Toolbar组件增加@duplicate-selected="handleDuplicateSelected"，并实现handleDuplicateSelected函数，调用useObjectSelection.js中的duplicateSelected。
4. 需要查看useObjectSelection.js中duplicateSelected的用法，确保调用方式正确。
5. 先修改Toolbar.vue，再修改Editor.vue。
</thinking>

<replace_in_file>
<path>src/components/editor/Toolbar.vue</path>
<diff>
------- SEARCH
export default {
  name: 'Toolbar',
  components: { EditorConfigDialog, VfsFileChooserDialog, VfsFileSaverDialog },
  emits: ['delete-selected'],
  /**
   * 工具栏组件
   * 提供场景文件、编辑、对象变换等操作入口
   */
  setup(props, { emit }) {
=======
export default {
  name: 'Toolbar',
  components: { EditorConfigDialog, VfsFileChooserDialog, VfsFileSaverDialog },
  emits: ['delete-selected', 'duplicate-selected'],
  /**
   * 工具栏组件
   * 提供场景文件、编辑、对象变换等操作入口
   */
  setup(props, { emit }) {
+++++++ REPLACE

------- SEARCH
    /**
     * 复制选中的对象
     */
    function duplicateSelected() {
      objectManager.duplicateSelected();
    }
    
    /**
     * 删除选中的对象
     */
    function deleteSelected() {
        emit('delete-selected');
    }
=======
    /**
     * 复制选中的对象
     * 通过事件抛出，由父组件处理
     */
    function duplicateSelected() {
      emit('duplicate-selected');
    }
    
    /**
     * 删除选中的对象
     */
    function deleteSelected() {
        emit('delete-selected');
    }
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/components/editor/Toolbar.vue'] Result:
The content was successfully saved to src/components/editor/Toolbar.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/components/editor/Toolbar.vue">
<!--
  主工具栏组件
  提供场景文件、编辑、对象变换等操作入口
  文件按钮区包含：新建、导出、导入、暂存、加载、保存
  其中“导出”/“导入”使用新命名及新图标，“暂存”保存到localStorage
  “加载”“保存”按钮为预留，暂未实现
  新增功能：视图分组增加“锁定相机”按钮，控制SceneManager的controlsLocked状态，锁定时controls.enabled=false。
-->
<template>
  <div class="ribbon-toolbar dark">
    <div class="ribbon-content">
      <!-- 文件 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">文件</div>
        <div class="ribbon-group-buttons">
          <button @click="newScene" class="ribbon-btn" title="新建场景">
            <span class="icon">📄</span>
            <div>新建</div>
          </button>
          <button @click="saveLocal" class="ribbon-btn" title="暂存到本地">
            <span class="icon">🗄️</span>
            <div>暂存</div>
          </button>
          <button @click="saveScene" class="ribbon-btn" title="保存场景">
            <span class="icon">💾</span>
            <div>保存</div>
          </button>
          <button @click="loadScene" class="ribbon-btn" title="加载场景">
            <span class="icon">📂</span>
            <div>加载</div>
          </button>
          <button @click="exportScene" class="ribbon-btn" title="导出场景">
            <span class="icon">📤</span>
            <div>导出</div>
          </button>
          <button @click="importScene" class="ribbon-btn" title="导入场景">
            <span class="icon">📥</span>
            <div>导入</div>
          </button>
        </div>
      </div>
      <!-- 编辑 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">编辑</div>
        <div class="ribbon-group-buttons">
          <button @click="undo" :disabled="!canUndo" class="ribbon-btn" title="撤销 (Ctrl+Z)">
            <span class="icon">↶</span>
            <div>撤销</div>
          </button>
          <button @click="redo" :disabled="!canRedo" class="ribbon-btn" title="重做 (Ctrl+Y)">
            <span class="icon">↷</span>
            <div>重做</div>
          </button>
          <button @click="duplicateSelected" :disabled="!hasSelection" class="ribbon-btn" title="复制 (Ctrl+D)">
            <span class="icon">📋</span>
            <div>复制</div>
          </button>
          <button @click="deleteSelected" :disabled="!hasSelection" class="ribbon-btn danger" title="删除 (Delete)">
            <span class="icon">🗑️</span>
            <div>删除</div>
          </button>
        </div>
      </div>
      <!-- 对象变换 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">对象变换</div>
        <div class="ribbon-group-buttons">
          <button
            @click="setTransformMode('translate')"
            :class="['ribbon-btn', { active: transformMode === 'translate' }]"
            :disabled="!hasSelection"
            title="移动工具 (G)"
          >
            <span class="icon">↔️</span>
            <div>移动</div>
          </button>
          <button
            @click="setTransformMode('rotate')"
            :class="['ribbon-btn', { active: transformMode === 'rotate' }]"
            :disabled="!hasSelection"
            title="旋转工具 (R)"
          >
            <span class="icon">🔄</span>
            <div>旋转</div>
          </button>
          <button
            @click="setTransformMode('scale')"
            :class="['ribbon-btn', { active: transformMode === 'scale' }]"
            :disabled="!hasSelection"
            title="缩放工具 (S)"
          >
            <span class="icon">📏</span>
            <div>缩放</div>
          </button>
        </div>
      </div>
      <!-- 视图 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">视图</div>
        <div class="ribbon-group-buttons">
          <button
            @click="focusSelected"
            :disabled="!hasSelection"
            class="ribbon-btn"
            title="聚焦到选中对象 (F)"
          >
            <span class="icon">🎯</span>
            <div>聚焦</div>
          </button>
          <button
            @click="resetCamera"
            class="ribbon-btn"
            title="重置相机"
          >
            <span class="icon">📷</span>
            <div>重置相机</div>
          </button>
          <button
            @click="toggleLockCamera"
            class="ribbon-btn"
            :class="{ active: controlsLocked }"
            title="锁定/解锁相机"
          >
            <span class="icon">{{ controlsLocked ? '🔒' : '🔓' }}</span>
            <div>锁定相机</div>
          </button>
        </div>
      </div>
      <!-- 配置 -->
      <div class="ribbon-group">
        <div class="ribbon-group-title">配置</div>
        <div class="ribbon-group-buttons">
          <button @click="showEditorConfig = true" class="ribbon-btn" title="编辑器配置">
            <span class="icon">⚙️</span>
            <div>编辑器</div>
          </button>
        </div>
      </div>
    </div>
    <!-- 编辑器配置对话框 -->
    <EditorConfigDialog v-if="showEditorConfig" v-model="showEditorConfig" />
    <!-- 文件选择对话框 -->
    <VfsFileChooserDialog v-if="showFileChooser" v-model="showFileChooser" @select="handleFileSelect" />
    <!-- 文件保存对话框 -->
    <VfsFileSaverDialog
      v-if="showFileSaver"
      v-model="showFileSaver"
      :text="sceneJsonText"
      ext="json"
      @saved="handleFileSaved"
    />
  </div>
</template>

<script>
import { ref, computed, inject, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import { useScene } from '../../composables/useScene.js';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import useTransform from '../../composables/useTransform.js';
import { useObjectManager } from '../../core/ObjectManager.js';
import { exportJSON } from '../../utils/fileUtils.js';
import { useSceneManager } from '../../core/SceneManager.js';
import EditorConfigDialog from '../dialog/EditorConfigDialog.vue';
import VfsFileChooserDialog from '../dialog/VfsFileChooserDialog.vue';
import VfsFileSaverDialog from '../dialog/VfsFileSaverDialog.vue';
import vfsService from '../../services/vfs-service.js';

export default {
  name: 'Toolbar',
  components: { EditorConfigDialog, VfsFileChooserDialog, VfsFileSaverDialog },
  emits: ['delete-selected', 'duplicate-selected'],
  /**
   * 工具栏组件
   * 提供场景文件、编辑、对象变换等操作入口
   */
  setup(props, { emit }) {
    // 注入全局appState
    const appState = inject('appState');
    /**
     * 编辑器配置对话框显示状态
     * @type {import('vue').Ref<boolean>}
     */
    const showEditorConfig = ref(false);
    // Ribbon tab 配置
    const tabs = [
      { key: 'file', label: '文件' },
      { key: 'edit', label: '编辑' },
      { key: 'tools', label: '工具' },
      { key: 'view', label: '视图' },
      { key: 'settings', label: '设置' }
    ];
    const activeTab = ref('file');
    const scene = useScene();
    const objectSelection = useObjectSelection();
    const transform = useTransform();
    const objectManager = useObjectManager();
    // 相机锁定相关
    const sceneManager = useSceneManager();
    const controlsLocked = ref(sceneManager.getControlsLocked());
    function toggleLockCamera() {
      const next = !controlsLocked.value;
      sceneManager.setControlsLocked(next);
      controlsLocked.value = next;
    }
    
    // 计算属性
    const transformMode = computed(() => transform.transformMode.value);
    // 只保留单选模式，移除 selectionMode 相关
    const hasSelection = computed(() => objectSelection.hasSelection.value);
    const selectionCount = computed(() => objectSelection.selectionCount.value);
    const fps = computed(() => scene.fps.value);
    const objectCount = computed(() => objectManager.getAllObjects().length);
    const canUndo = computed(() => transform.transformHistory.undoStack.length > 0);
    const canRedo = computed(() => transform.transformHistory.redoStack.length > 0);

    // 监听选择变化，重新触发锁定相机逻辑
    watch(hasSelection, () => {
      sceneManager.setControlsLocked(controlsLocked.value);
    });
    
    // 方法
    /**
     * 新建场景，清空所有内容
     */
    /**
     * 新建场景，清空所有内容
     */
    function newScene() {
      ElMessageBox.confirm('确定要新建场景吗？这将清除当前所有内容。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        objectSelection.clearSelection();
        transform.clearHistory();

        scene.clearScene();
        scene.resetScene();
      }).catch(() => {});
    }
    
    /**
     * 保存当前场景为JSON文件
     */
    /**
     * 导出当前场景为JSON文件
     */
    function exportScene() {
      try {
        const sceneData = scene.exportScene();
        const filename = `scene_${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.json`;
        exportJSON(sceneData, filename);
        ElMessage.success('场景已导出');
      } catch (error) {
        console.error('导出场景失败:', error);
        ElMessage.error('导出场景失败，请检查控制台错误信息。');
      }
    }

    /**
     * 导入场景文件
     * 选择JSON文件并调用SceneManager.loadScene(json)
     */
    async function importScene() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
          try {
            const text = await file.text();
            const sceneData = JSON.parse(text);
            ElMessageBox.confirm('确定要导入这个场景吗？这将替换当前场景。', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(async () => {
              if (appState) appState.isLoading = true;
              try {
                const sceneManager = useSceneManager();
                objectSelection.clearSelection();
                transform.clearHistory();
                await sceneManager.loadScene(sceneData);
                ElMessage.success('场景导入成功');
              } catch (e) {
                console.error('导入场景失败:', e);
                ElMessage.error('导入场景失败，请检查文件格式。');
              } finally {
                if (appState) appState.isLoading = false;
              }
            }).catch(() => {});
          } catch (error) {
            console.error('导入场景失败:', error);
            ElMessage.error('导入场景失败，请检查文件格式。');
          }
        }
      };
      input.click();
    }

    /**
     * 暂存场景到localStorage
     */
    function saveLocal() {
      try {
        const sceneData = scene.exportScene();
        localStorage.setItem('three-editor-by-ai_editorScene', JSON.stringify(sceneData));
        ElMessage.success('场景已暂存到本地');
      } catch (error) {
        console.error('暂存失败:', error);
        ElMessage.error('暂存失败，请检查控制台错误信息。');
      }
    }

    /**
     * 加载场景：弹出文件选择对话框，选中文件后加载内容并调用loadScene
     */
    const showFileChooser = ref(false);
    async function loadScene() {
      showFileChooser.value = true;
    }
    /**
     * 文件选择回调
     * @param {Object} fileInfo 选中的文件信息
     */
    async function handleFileSelect(fileInfo) {
      showFileChooser.value = false;
      if (!fileInfo || !fileInfo.path) return;
      try {
        if (appState) appState.isLoading = true;
        // 获取文件内容（修正：通过 vfsService.getVfs 获取 vfs，再调用 vfs.content）
        const vfs = vfsService.getVfs(fileInfo.drive);
        if (!vfs || typeof vfs.content !== 'function') {
          ElMessage.error('未找到指定虚拟文件系统或接口不支持');
          return;
        }
        const contentRes = await vfs.content(fileInfo.path + fileInfo.name);
        if (!contentRes) {
          ElMessage.error('文件内容获取失败');
          return;
        }
        // 加载场景
        const sceneManager = useSceneManager();
        objectSelection.clearSelection();
        transform.clearHistory();
        const sceneData = JSON.parse(contentRes);
        await sceneManager.loadScene(sceneData);
        ElMessage.success('场景加载成功');
      } catch (e) {
        console.error('加载场景失败:', e);
        ElMessage.error('加载场景失败，请检查文件内容或格式。');
      } finally {
        if (appState) appState.isLoading = false;
      }
    }

    /**
     * 保存场景：弹出保存对话框，填写文件名后保存到虚拟文件系统
     */
    const showFileSaver = ref(false);
    const sceneJsonText = ref('');
    function saveScene() {
      try {
        const sceneData = scene.exportScene();
        sceneJsonText.value = JSON.stringify(sceneData, null, 2);
        showFileSaver.value = true;
      } catch (error) {
        ElMessage.error('场景序列化失败');
      }
    }
    function handleFileSaved(path) {
      showFileSaver.value = false;
      ElMessage.success('场景已保存到虚拟文件系统');
    }
    
    /**
     * 设置对象变换模式
     * @param {string} mode 变换模式
     */
    function setTransformMode(mode) {
      transform.transformMode.value = mode;
    }
    
    /**
     * 撤销上一步操作
     */
    function undo() {
      transform.undo();
    }
    
    /**
     * 重做操作
     */
    function redo() {
      transform.redo();
    }
    
    /**
     * 复制选中的对象
     * 通过事件抛出，由父组件处理
     */
    function duplicateSelected() {
      emit('duplicate-selected');
    }
    
    /**
     * 删除选中的对象
     */
    function deleteSelected() {
        emit('delete-selected');
    }
    
    /**
     * 聚焦到选中对象
     */
    function focusSelected() {
      const selectedObjects = objectSelection.selectedObjects.value;
      if (selectedObjects.length > 0) {
        scene.focusOnObject(selectedObjects[0]);
      }
    }
    
    /**
     * 重置相机位置
     */
    function resetCamera() {
      scene.updateCameraConfig({
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 }
      });
    }
    
    
    
    return {
      // 状态
      tabs,
      activeTab,
      transformMode,
      // selectionMode, // 移除
      hasSelection,
      selectionCount,
      fps,
      objectCount,
      canUndo,
      canRedo,
      
      // 方法
      newScene,
      exportScene,
      importScene,
      saveLocal,
      loadScene,
      saveScene,
      setTransformMode,
      // setSelectionMode, // 移除
      undo,
      redo,
      duplicateSelected,
      deleteSelected,
      focusSelected,
      resetCamera,
      showEditorConfig,
      showFileChooser,
      handleFileSelect,
      showFileSaver,
      sceneJsonText,
      handleFileSaved,
      controlsLocked,
      toggleLockCamera
    };
  }
};
</script>

<style lang="scss" scoped>
.ribbon-toolbar.dark {
  background: #23272e;
  color: #f3f3f3;
  border-bottom: 1.5px solid #2d323a;
  padding: 0 12px;
  box-shadow: 0 2px 8px #0006;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.ribbon-content {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: flex-end;
  padding: 4px;
  width: 100%;
  flex-wrap: wrap;
}

.ribbon-group {
  background: #282c34;
  border-radius: 8px 8px 0 0;
  border: 1.5px solid #353a42;
  box-shadow: 0 2px 8px #0003;
  padding: 4px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 120px;
  height: 80px;
  position: relative;
  box-sizing: border-box;
}

.ribbon-group-title {
  font-size: 13px;
  font-weight: bold;
  color: #7ecfff;
  margin-bottom: 4px;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px #0008;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.ribbon-group-buttons {
  display: flex;
  flex-direction: row;
  gap: 4px;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: flex-start;
}

.ribbon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  background: #23272e;
  border: 1px solid #353a42;
  border-radius: 5px;
  color: #f3f3f3;
  font-size: 11px;
  cursor: pointer;
  margin-bottom: 6px;
  min-width: 48px;
  transition: background 0.2s, border 0.2s, color 0.2s;
}

.ribbon-btn:hover:not(:disabled) {
  background: #2d323a;
  border-color: #7ecfff;
  color: #fff;
}

.ribbon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ribbon-btn.active {
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
}

.ribbon-btn.danger {
  background: #d73a49;
  border-color: #e85662;
  color: #fff;
}

.ribbon-btn.danger:hover:not(:disabled) {
  background: #e85662;
}

.icon {
  font-size: 18px;
  line-height: 1;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 6px;
  color: #b3cfff;
}

.toggle-text {
  user-select: none;
}

.ribbon-status {
  margin-left: auto;
  display: flex;
  gap: 18px;
  padding: 6px 0 8px 0;
}


/* 移动端响应式 */
@media (max-width: 900px) {
  .ribbon-content {
    flex-wrap: wrap;
    gap: 12px;
  }
  .ribbon-group {
    min-width: 90px;
    padding: 8px 8px 10px 8px;
  }
  .ribbon-group-title {
    font-size: 12px;
    margin-bottom: 6px;
  }
  .ribbon-btn {
    min-width: 40px;
    font-size: 10px;
    padding: 5px 6px;
  }
  .icon {
    font-size: 15px;
  }
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/components/editor/Toolbar.vue

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/core/ObjectManager.js
src/composables/useTransform.js
README.md

# Current Time
9/15/2025, 12:06:13 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
22,572 / 111.424K tokens used (20%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. Toolbar.vue已完成duplicateSelected事件抛出。
2. 现在需在Editor.vue的<Toolbar>组件上添加@duplicate-selected="handleDuplicateSelected"，并实现handleDuplicateSelected函数，调用useObjectSelection.js中的duplicateSelected。
3. 由于Editor.vue为<script setup>，直接引入useObjectSelection并调用其duplicateSelected方法即可。
4. 需在合适位置添加handleDuplicateSelected函数，并在模板中绑定事件。
</thinking>

<replace_in_file>
<path>src/Editor.vue</path>
<diff>
------- SEARCH
    <div class="main-toolbar">
      <Toolbar @delete-selected="handleDeleteSelected" />
    </div>
=======
    <div class="main-toolbar">
      <Toolbar @delete-selected="handleDeleteSelected" @duplicate-selected="handleDuplicateSelected" />
    </div>
+++++++ REPLACE

------- SEARCH
function handleDeleteSelected() {
  if (objectSelection.hasSelection.value) {
    ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
      selectedIds.forEach(id => {
        scene.removeObjectFromScene(id);
      });
      objectSelection.clearSelection();
    }).catch(() => {});
  }
}
=======
function handleDeleteSelected() {
  if (objectSelection.hasSelection.value) {
    ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
      selectedIds.forEach(id => {
        scene.removeObjectFromScene(id);
      });
      objectSelection.clearSelection();
    }).catch(() => {});
  }
}

/**
 * 复制选中的对象
 * 由Toolbar抛出duplicate-selected事件时调用
 */
function handleDuplicateSelected() {
  // 调用useObjectSelection.js中的duplicateSelected
  objectSelection.duplicateSelected();
}
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/Editor.vue'] Result:
The content was successfully saved to src/Editor.vue.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/Editor.vue">
<!--
  3D场景编辑器主应用组件
  - 编辑器主界面，集成场景视图、工具栏、属性面板等
  - 部分UI组件采用element-plus
-->
<template>
  <div id="app" class="editor-container">
    <!-- 加载遮罩 -->
    <div v-if="appState.isLoading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="spin"><Loading /></el-icon>
        <!-- <h2>3D 场景编辑器</h2> -->
        <p>正在加载，请稍候...</p>
      </div>
    </div>

    <!-- 顶部工具栏 -->
    <!-- 主工具栏 -->
    <div class="main-toolbar">
      <Toolbar @delete-selected="handleDeleteSelected" @duplicate-selected="handleDuplicateSelected" />
    </div>
    
    <!-- 主编辑区域 -->
    <main class="editor-main">
      <!-- 主场景视口 -->
      <div class="editor-viewport">
        <!-- 浮动面板：右上 -->
        <ViewportControls
          :showWireframe="showWireframe"
          :showGrid="showGrid"
          :resetView="resetView"
          :fitToScreen="fitToScreen"
          :toggleWireframe="toggleWireframe"
          :toggleGrid="toggleGrid"
          :class="[
            'viewport-controls',
            { 'with-right': !appState.rightPanelCollapsed }
          ]"
        />
        <!-- 浮动面板：右下 -->
        <CubeViewportControls
          v-if="scene.sceneManager && scene.sceneManager.controls"
          :class="[
            'cube-controls-bottomright',
            { 'with-right': !appState.rightPanelCollapsed }
          ]"
          :camera="scene.sceneManager?.camera"
          :renderer="scene.sceneManager?.renderer"
          :controls="scene.sceneManager?.controls"
          :cameraQuaternion="cameraQuaternion"
          @viewChange="setViewAngle"
        />
        <!-- 浮动面板：左上 性能监控 -->
        <StatHints
          :class="[
            'stat-hints',
            { 'with-left': !appState.leftPanelCollapsed }
          ]"
        />
        <!-- 浮动面板：左下 -->
        <InteractionHints
          :class="[
            'interaction-hints',
            { 'with-left': !appState.leftPanelCollapsed }
          ]"
        />
        <SceneViewer
          @delete-selected="handleDeleteSelected"
          :showWireframe="showWireframe"
          :showGrid="showGrid"
        />
      </div>
      
      <!-- 左侧资源面板 -->
      <div 
        v-show="!appState.leftPanelCollapsed" 
        class="editor-sidebar left-panel"
        :style="{ width: appState.panels.leftWidth + 'px' }"
      >
        <ResourcePanel
          :activeLeftTab="appState.activeLeftTab"
          :setActiveLeftTab="setActiveLeftTab"
        />
      </div>
      <!-- 浮动切换按钮（左侧） -->
      <div 
        @click="toggleLeftPanel" 
        class="sidebar-toggle left"
        :class="{ active: !appState.leftPanelCollapsed }"
      >
      </div>
      
      <!-- 右侧属性面板 -->
      <div 
        v-show="!appState.rightPanelCollapsed" 
        class="editor-sidebar right-panel"
        :style="{ width: appState.panels.rightWidth + 'px' }"
      >
        <PropertyPanel />
      </div>
      <!-- 浮动切换按钮（右侧） -->
      <div
        @click="toggleRightPanel" 
        class="sidebar-toggle right"
        :class="{ active: !appState.rightPanelCollapsed }"
      >
      </div>
    </main>

    <!-- 状态栏 -->
    <EditorFooter
      :objectSelection="objectSelection"
      :scene="scene"
      :cameraPosition="cameraPosition"
      :cameraTarget="cameraTarget"
      @update:cameraPosition="onCameraPositionUpdate"
      @update:cameraTarget="onCameraTargetUpdate"
    />
  </div>
</template>

<script setup>
 // 3D场景编辑器主应用组件
import { ref, reactive, provide, onMounted, onUnmounted } from 'vue';

/**
 * 处理EditorFooter相机位置变更事件
 * @param {Object} pos 新的相机位置
 */
function onCameraPositionUpdate(pos) {
  if (scene.sceneManager?.camera) {
    scene.sceneManager.camera.position.set(pos.x, pos.y, pos.z);
  }
}
/**
 * 处理EditorFooter目标点变更事件
 * @param {Object} target 新的controls target
 */
function onCameraTargetUpdate(target) {
  if (scene.sceneManager?.controls && scene.sceneManager.controls.target) {
    scene.sceneManager.controls.target.set(target.x, target.y, target.z);
    // 同步相机朝向
    if (scene.sceneManager.camera && typeof scene.sceneManager.camera.lookAt === 'function') {
      scene.sceneManager.camera.lookAt(target.x, target.y, target.z);
    }
  }
}
import { ElMessageBox } from 'element-plus';
import 'element-plus/es/components/message-box/style/css';
import { useScene } from './composables/useScene.js';
// 引入element-plus图标
import { Setting, Loading } from '@element-plus/icons-vue';
import { useObjectSelection } from './composables/useObjectSelection.js';
import { useTransform } from './composables/useTransform.js';
import { useAssets } from './composables/useAssets.js';

// 导入组件
import Toolbar from './components/editor/Toolbar.vue';
import ResourcePanel from './components/editor/ResourcePanel.vue';
import SceneViewer from './components/scene/SceneViewer.vue';
import PropertyPanel from './components/editor/PropertyPanel.vue';
import EditorFooter from './components/editor/EditorFooter.vue';

// 浮动面板组件
import ViewportControls from './components/scene/ViewportControls.vue';
import CubeViewportControls from './components/scene/CubeViewportControls.vue';
import InteractionHints from './components/scene/InteractionHints.vue';
import StatHints from './components/scene/StatHints.vue';

 // 应用状态管理
const appState = reactive({
  isLoading: true,
  leftPanelCollapsed: false,
  rightPanelCollapsed: false,
  bottomPanelCollapsed: true,
  activeLeftTab: 'primitives', // 'primitives' | 'files' | 'assets' | 'inspector'
  panels: {
    leftWidth: 300,
    rightWidth: 300,
    bottomHeight: 200
  }
});

// 左侧面板控制方法
function toggleLeftPanel() {
  appState.leftPanelCollapsed = !appState.leftPanelCollapsed;
}

import { computed } from 'vue';

// 使用各种 composables
const scene = useScene();
const objectSelection = useObjectSelection();
const transform = useTransform();
const assets = useAssets();

import * as THREE from 'three';

// 提供给子组件使用
provide('scene', scene);
provide('objectSelection', objectSelection);
provide('transform', transform);
provide('assets', assets);
provide('appState', appState);

// ====== 以下为浮动面板迁移相关状态和方法 ======

// 线框/网格显示
const showWireframe = ref(false);
const showGrid = ref(true);

/**
 * @description 相机位置与四元数
 */
const cameraPosition = reactive({ x: 0, y: 0, z: 0 });
const cameraQuaternion = ref({ x: 0, y: 0, z: 0, w: 1 });
/**
 * @description OrbitControls target（即视点目标点），用于底部状态栏显示
 */
const cameraTarget = reactive({ x: 0, y: 0, z: 0 });

// 性能监控
const fps = computed(() => scene.fps.value);
const sceneStats = computed(() => scene.getSceneStats());

// 定时更新相机状态
let animationId = null;
function updateCameraState() {
  if (scene.sceneManager?.camera) {
    const pos = scene.sceneManager.camera.position;
    cameraPosition.x = pos.x;
    cameraPosition.y = pos.y;
    cameraPosition.z = pos.z;
    // 获取 OrbitControls target
    const controls = scene.sceneManager.controls;
    if (controls && controls.target) {
      cameraTarget.x = controls.target.x;
      cameraTarget.y = controls.target.y;
      cameraTarget.z = controls.target.z;
    }
  }
  animationId = requestAnimationFrame(updateCameraState);
}

// 控制方法
function resetView() {
  scene.updateCameraConfig({
    position: { x: 5, y: 5, z: 5 },
    target: { x: 0, y: 0, z: 0 }
  });
}

function fitToScreen() {
  const objects = scene.objectManager.getAllObjects();
  if (objects.length > 0) {
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
  // 由SceneViewer负责网格辅助线的添加/显示
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

// 生命周期挂载/卸载
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard);
  setTimeout(() => {
    appState.isLoading = false;
  }, 1000);
  updateCameraState();
});
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);
  if (animationId) cancelAnimationFrame(animationId);
});

// 键盘快捷键处理
function handleKeyboard(event) {
  // 阻止某些默认行为
  if (event.ctrlKey || event.metaKey) {
    switch (event.code) {
      case 'KeyS':
        event.preventDefault();
        // 保存场景
        break;
      case 'KeyZ':
        event.preventDefault();
        if (event.shiftKey) {
          // 重做
          transform.redo?.();
        } else {
          // 撤销
          transform.undo?.();
        }
        break;
      case 'KeyD':
        event.preventDefault();
        // 复制对象
        if (objectSelection.hasSelection.value) {
          // TODO: 实现复制功能
        }
        break;
    }
  }
  
  // 单键快捷键
  switch (event.code) {
    case 'Delete':
      if (objectSelection.hasSelection.value) {
        ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
          selectedIds.forEach(id => {
            scene.removeObjectFromScene(id);
          });
          objectSelection.clearSelection();
        }).catch(() => {});
      }
      break;
    case 'Escape':
      objectSelection?.clearSelection?.();
      break;
  }
}


function toggleRightPanel() {
  appState.rightPanelCollapsed = !appState.rightPanelCollapsed;
}

function setActiveLeftTab(tab) {
  appState.activeLeftTab = tab;
  if (appState.leftPanelCollapsed) {
    appState.leftPanelCollapsed = false;
  }
}

function handleDeleteSelected() {
  if (objectSelection.hasSelection.value) {
    ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const selectedIds = Array.from(objectSelection.selectedObjectIds.value);
      selectedIds.forEach(id => {
        scene.removeObjectFromScene(id);
      });
      objectSelection.clearSelection();
    }).catch(() => {});
  }
}

/**
 * 复制选中的对象
 * 由Toolbar抛出duplicate-selected事件时调用
 */
function handleDuplicateSelected() {
  // 调用useObjectSelection.js中的duplicateSelected
  objectSelection.duplicateSelected();
}

// 生命周期
onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyboard);
  
  // 应用加载完成
  setTimeout(() => {
    appState.isLoading = false;
  }, 1000);
});

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('keydown', handleKeyboard);
});
</script>

<style lang="scss" scoped>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #1a1a1a;
  color: #fff;
}

/* 加载遮罩 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(33,33,33,0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: #fff;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #333;
  border-top: 4px solid #007acc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.loading-content p {
  margin: 0;
  color: #aaa;
  font-size: 14px;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
}


/* 主工具栏 */
.main-toolbar {
  border-bottom: 1px solid #444;
}

/* 主编辑区域 */
.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 侧边栏 */
.editor-sidebar {
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.left-panel {
  left: 0;
}

.right-panel {
  right: 0;
}

.left-panel {
  border-right: 1px solid #444;
}

.right-panel {
  border-left: 1px solid #444;
}

/* 浮动切换按钮样式 */
.sidebar-toggle {
  cursor: pointer;
  position: absolute;
  top: 0;
  z-index: 20;
  background: #007acc;
  border-color: #0088dd;
  color: #fff;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.sidebar-toggle.left {
  left: 0;
  top: 50%;
  width: 10px;
  height: 50px;
  border-radius: 0 10px 10px 0;
}
.sidebar-toggle.right {
  right: 0;
  top: 50%;
  width: 10px;
  height: 50px;
  border-radius: 10px 0 0 10px;
}


.sidebar-toggle.left.active {
  left: 300px; /* 300px面板宽度 */
}
.sidebar-toggle.right.active {
  right: 300px; /* 300px面板宽度 */
}

/* 面板标签页 */
.panel-tabs {
  display: flex;
  background: #333;
  border-bottom: 1px solid #444;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #444;
  color: #fff;
}

.tab-btn.active {
  background: #2a2a2a;
  border-bottom-color: #007acc;
  color: #fff;
}

/* 面板内容 */
.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 主视口 */
.editor-viewport {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: #1a1a1a;
  overflow: hidden;
  z-index: 1;
}

/* 状态栏 */
.editor-footer {
  height: 28px;
  background: #2a2a2a;
  border-top: 1px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: #aaa;
}

.footer-left,
.footer-center,
.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-item {
  padding: 2px 8px;
  background: #333;
  border-radius: 3px;
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-sidebar {
    width: 280px !important;
  }
  
  .header-left h1 {
    font-size: 14px;
  }
  
  .panel-toggle-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    height: 44px;
    padding: 0 12px;
  }
  
  .header-left h1 {
    font-size: 12px;
  }
  
  .editor-sidebar {
    width: 260px !important;
  }
  
  .tab-btn {
    padding: 10px 12px;
    font-size: 11px;
  }
  
  .editor-footer {
    height: 24px;
    padding: 0 12px;
    font-size: 10px;
  }
  
  .footer-center {
    display: none;
  }
}

/* 深色主题优化 */
:deep(.panel),
:deep(.asset-browser),
:deep(.inspector),
:deep(.property-panel) {
  background: #2a2a2a;
  color: #fff;
}

/* 滚动条样式 */
:deep(*::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(*::-webkit-scrollbar-track) {
  background: #333;
}

:deep(*::-webkit-scrollbar-thumb) {
  background: #555;
  border-radius: 4px;
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: #666;
}

/* 选择文本颜色 */
::selection {
  background: #007acc;
  color: #fff;
}

:deep(::selection) {
  background: #007acc;
  color: #fff;
}
/* 浮动面板自适应侧边栏 */
.viewport-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 200;
  transition: right 0.2s, left 0.2s;
}
.viewport-controls.with-right {
  right: 316px; /* 300px面板+16px间距 */
}
.viewport-controls.with-left {
  left: 316px;
}
.viewport-controls.with-left.with-right {
  left: 316px;
  right: 316px;
}

.cube-controls-bottomright {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 300;
  transition: right 0.2s, bottom 0.2s;
}
.cube-controls-bottomright.with-right {
  right: 316px;
}

.interaction-hints {
  position: absolute;
  bottom: 16px;
  left: 16px;
  z-index: 200;
  transition: left 0.2s;
}
.interaction-hints.with-left {
  left: 316px;
}

/* 性能监控面板定位样式 */
.stat-hints {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 210;
  transition: left 0.2s;
}
.stat-hints.with-left {
  left: 316px;
}
</style>

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/Editor.vue

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
src/core/ObjectManager.js
src/composables/useTransform.js
README.md

# Current Time
9/15/2025, 12:06:24 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
27,471 / 111.424K tokens used (25%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. 已完成Toolbar.vue中duplicateSelected事件的抛出，并在Editor.vue中监听并调用useObjectSelection.js的duplicateSelected。
2. 由于涉及事件通信和功能迁移，需同步更新README.md的项目结构说明，反映事件抛出与处理的变更。
3. 只需更新README.md的相关部分，无需描述src/assets目录内容。
4. 先读取README.md，定位“项目结构”部分，准备插入/修改说明。
</thinking>

<read_file>
<path>README.md</path>
</read_file>

---

**User:**

[read_file for 'README.md'] Result:
# 3D 场景编辑器 (Three Editor by AI)

一个基于 Vue 3 + Three.js 的现代化3D场景编辑器，支持三维模型的拖放、调整和属性配置。
本工程完全使用AI自行编写代码。

## 🎨 截图
![截图1](public/images/screenshot01.png)

## ✅ 主要功能

- 3D场景渲染和管理
- 多种基础与扩展几何体创建
- 完整的对象变换系统（移动、旋转、缩放）、撤销重做历史记录
- 多格式3D模型和纹理加载与管理（GLTF、OBJ、FBX等）
- 拖拽上传、资源管理与资源浏览（支持模型预览和几何体创建）
- 相机控制与预设视角（OrbitControls、MapControls、FlyControls切换，FlyControls支持基于键盘、鼠标的三维飞行控制）
- 材质编辑和属性调整（多种材质类型与参数动态配置）
- 场景序列化、导入导出与完整层级管理
- 单对象选择和编辑
- 支持GLTF等模型的动画选择与播放，动画状态可导出与恢复
- 底部状态栏显示当前视点（相机旋转）
- 虚拟文件系统，对接后端文件库
- 文件面板拖拽模型文件到场景直接加载
- 支持从虚拟文件系统面板拖拽模型文件到场景直接加载
- 拖拽添加对象时，自动放置到当前视点位置
- 后处理机制（集成Three.js EffectComposer，支持Bloom、FXAA等多种后处理效果链路，统一API动态管理Pass）

## 🚀 技术栈

- **前端框架**: Vue 3 + Vite
- **3D引擎**: Three.js
- **构建工具**: Vite
- **样式**: Sass
- **网络请求**: Fetch API
- **工具库**: 
  - Element Plus - 主流UI组件库
  - Lodash - 实用工具函数库
  - Day.js - 轻量级日期时间库
  - three-viewport-gizmo - 立方体视角控件库
  - stats-gl - 性能监控

## 📁 项目结构

```
three-editor-by-ai/
├── src/
│   ├── components/                           # Vue 组件
│   │   ├── editor/                           # 编辑器 UI 组件
│   │   │   ├── PropertyPanel.vue             # 属性面板
│   │   │   ├── Toolbar.vue                   # 工具栏
│   │   │   ├── EditorFooter.vue              # 编辑器底部状态栏
│   │   │   ├── AssetBrowser.vue              # 资源浏览器
│   │   │   ├── PrimitiveBrowser.vue          # 基础几何体与灯光浏览组件
│   │   │   ├── ResourcePanel.vue             # 资源面板
│   │   │   ├── VfsFileBrowser.vue            # 虚拟文件系统面板
│   │   │   ├── Inspector.vue                 # 对象检查器
│   │   ├── property/                         # 各种属性编辑组件
│   │   │   ├── ScenePropertyPane.vue         # 场景属性编辑面板
│   │   │   ├── BasePropertyPane.vue          # 对象基础属性编辑面板
│   │   │   ├── UserDataPropertyPane.vue      # userData属性编辑面板
│   │   │   ├── TransformPropertyPane.vue     # 变换属性面板（位置、旋转、缩放）
│   │   │   ├── AnimationPropertyPane.vue     # 动画属性面板（动画选择与播放）
│   │   │   ├── MaterialPropertyPane.vue      # 材质编辑面板
│   │   │   ├── PrimitivePropertyPane-*.vue   # 各种Primitive的专属属性编辑面板
│   │   │   ├── LightPropertyPane-*.vue       # 各种灯光的专属属性面板
│   │   ├── dialog/                           # 各类对话框组件
│   │   │   ├── TextureSelectDialog.vue       # 纹理选择对话框
│   │   │   ├── EditorConfigDialog.vue        # 编辑器配置对话框
│   │   │   ├── VfsFileChooserDialog.vue      # 虚拟文件系统文件选择对话框
│   │   │   ├── VfsFileSaverDialog.vue        # 虚拟文件系统文件保存对话框
│   │   ├── scene/                            # 3D 场景组件
│   │   │   ├── SceneViewer.vue               # 主场景视图，支持拖拽添加对象到当前视点位置
│   │   │   ├── StatHints.vue                 # 性能监控面板
│   │   │   ├── InteractionHints.vue          # 操作提示组件，支持切换控制器
│   │   │   ├── ViewportControls.vue          # 视图控制面板组件
│   │   │   ├── CubeViewportControls.vue      # 立方体视角控件
│   ├── composables/           # Vue Composition API 可组合函数
│   │   ├── useScene.js        # 场景管理
│   │   ├── useObjectSelection.js  # 对象选择、TransformControls与选中对象辅助功能
│   │   ├── useTransform.js    # 变换操作
│   │   ├── useAssets.js       # 资源管理，包含模型/纹理等资源的加载、缓存与去重机制
│   │   ├── useEditorConfig.js # 编辑器配置响应式状态与操作方法
│   ├── core/                  # 核心 Three.js 逻辑
│   │   ├── SceneManager.js    # 场景管理器
│   │   ├── ObjectManager.js   # 对象管理器
│   │   ├── InputManager.js    # 输入处理
│   │   ├── AssetLoader.js     # 资源加载器
│   ├── services/              # 数据请求和外部接口
│   │   ├── static-drive-api.js# 静态文件系统封装
│   │   ├── vfs-server-api.js  # 虚拟文件系统封装
│   │   ├── vfs-service.js     # 虚拟文件系统服务
│   ├── controls/             # 控制器
│   │   ├── FlyControls.js    # 飞行控制器，支持基于键盘、鼠标的三维飞行
│   ├── utils/                # 工具函数
│   │   ├── mathUtils.js      # 数学工具
│   │   ├── geometryUtils.js  # 几何工具
│   │   ├── fileUtils.js      # 文件处理工具
│   ├── constants/            # 常量定义
│   │   ├── PRIMITIVES.json   # 预定义几何体与灯光类型数据
│   ├── App.vue               # 根组件（仅负责引入Editor.vue）
│   ├── Editor.vue            # 主编辑器组件（包含全部业务与UI）
│   ├── main.js               # 应用入口
│   ├── main-func.js          # 应用入口文件相关的功能函数
│   ├── style.scss            # 全局样式
├── public/                   # 存放无需构建的静态资源
│   ├── images/               # 图片资源目录
│   ├── vfs/                  # 静态资源目录（虚拟文件系统，.folder.json文件用于描述目录和文件信息）
├── script/                   # 脚本
│   ├── package.json          # 脚本子项目配置
│   ├── generate-vfs.js       # 脚本：生成虚拟文件系统的元数据，用于编辑器的文件浏览器
│   ├── vfs-server.js         # 脚本：虚拟文件系统后端服务，支持多 drive 配置（读取vfs-server.json）
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
├── README.md                 # 项目说明
```

## 🏗️ 架构设计

### 组件层次

1. **主编辑器组件** (`Editor.vue`): 负责所有业务逻辑和UI的集成
2. **UI 层** (`components/editor/`, `components/dialog/`): 负责用户界面和交互
3. **3D 渲染层** (`components/scene/`): 处理 3D 场景渲染和显示
4. **逻辑层** (`composables/`, `core/`): 业务逻辑和状态管理
5. **服务层** (`services/`): 数据请求和外部接口
6. **工具层** (`utils/`): 通用工具函数

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

## 重要逻辑

- vite.config.js中，配置vite-plugin-static-copy，把几个js库的复制到目标路径：
  - 如需加载Draco压缩的glTF模型，请将node_modules/three/examples/jsm/libs/draco/目录中的文件复制到 /draco/ 目录下。
  - 如需加载KTX2纹理，请将node_modules/three/examples/jsm/libs/basis目录中的文件放入 /basis/ 目录下。
  - 如需加载Meshopt压缩的glTF模型，请将node_modules/three/examples/jsm/libs/meshopt_decoder.module.js文件放入 public/meshopt/ 目录下。
- SceneManager.js中：
  - loadScene()方法加载场景时，灯光和对象会完整恢复userData到Three.js对象，包括自定义属性、动画索引等，确保序列化与反序列化一致。
  - 运行时创建的动画相关对象（如_mixer、_activeAction等）不再挂载到userData，而是直接挂在主对象上（如obj._mixer、obj._activeAction），所有运行时临时对象均采用此设计，避免序列化污染，提升运行时管理效率。
- ObjectManager.js中：
  - 导出对象数据时，仅保留可序列化字段（如animationIndex），所有运行时对象（如_mixer、_activeAction等）均直接挂主对象，不再出现在userData中。
- ObjectManager.js中：
  - createPrimitive(type, options) 只负责创建对象，不自动添加到管理器（不调用addObject），需在外部调用addObject方法完成对象注册；
  - 新增 getUnlockedObjects() 方法，支持获取所有未被锁定（userData.locked !== true）的对象；
  - getIntersectedObjects() 和 getIntersectedFirstObject() 仅返回未锁定对象；
  - 变换后分发object-transform-updated事件。
- useScene.js中：
  - 聚焦对象时计算中心点并设置OrbitControls target。
- useObjectSelection.js中：
  - 使用ObjectManager.getIntersectedFirstObject(raycaster)高效获取第一个相交对象。
  - 内部定义了 `selectionStore`（响应式对象）：
    - 用于存储选中对象的临时材质信息，key 为对象 id。
    - selectionStore 生命周期与 useObjectSelection 组合式函数一致，自动随页面刷新或状态重置而清空。
  - TransformControls与选中对象辅助功能已迁移至useObjectSelection.js统一管理，SceneManager.js仅负责场景本身，SceneViewer.vue仅负责初始化调用。
  - TransformControls拖拽时会自动禁用OrbitControls，避免拖拽时镜头跟随问题，并在拖拽开始/结束时自动调用 useTransform 的 startTransform/endTransform，支持撤销/重做历史记录。
- FlyControls.js中，已支持基于键盘的三维飞行控制（WASD/QE/方向键等），核心逻辑参考 three/examples/jsm/controls/OrbitControls.js、three/examples/jsm/controls/FlyControls.js 实现，支持速度、旋转、拖拽等多种操作。空格键与R键逻辑一致，均可向上飞行。
- useAssets.js 中：
  - 资源加载函数（如 loadModel、loadTexture）已实现缓存机制：若 assetLibrary 中已存在同名且大小一致的资源，则直接返回缓存，避免重复加载和内存浪费。
- 所有资源（基础几何体、模型、资源）添加方式已统一为拖拽，点击添加功能已移除。
- 对象动画：GLTF等模型加载后自动挂载animations，属性面板支持动画下拉选择并记录到userData.animationIndex，SceneManager.js统一驱动所有对象动画，ObjectManager.js导出/导入时自动保存与恢复动画索引，支持动画状态完整序列化。

## 💯 AI

- 本工程基本使用AI自行编写代码（人工编写代码目前少于5%）；
- 开发环境：VSCode + Cline + GitHub Copilot + Claude 4 / GPT-4.1
- 使用Claude 4搭建本工程的主体框架，但由于GitHub Copilot Pro版2天内就消耗完（300 Premium requests），后转向使用GPT-4.1实现各项功能。
- .clinerules目录：存储AI规则
- .clinetask目录：存储历史对话

<environment_details>
# VSCode Visible Files
src/Editor.vue

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
src/core/ObjectManager.js
src/composables/useTransform.js
README.md

# Current Time
9/15/2025, 12:06:28 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
32,196 / 111.424K tokens used (29%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. 需要在README.md“项目结构”部分的Toolbar.vue描述中，补充“复制”按钮事件抛出与Editor.vue事件处理的说明。
2. 还应在“重要逻辑”或“useObjectSelection.js”说明中，补充duplicateSelected迁移与事件通信的说明。
3. 只需补充相关说明，不影响其他内容。
</thinking>

<replace_in_file>
<path>README.md</path>
<diff>
------- SEARCH
│   │   │   ├── Toolbar.vue                   # 工具栏
=======
│   │   │   ├── Toolbar.vue                   # 工具栏（复制/删除按钮均通过事件抛出，由Editor.vue统一处理，复制功能事件为duplicate-selected，调用useObjectSelection.js的duplicateSelected方法）
+++++++ REPLACE

------- SEARCH
- useObjectSelection.js中：
  - 使用ObjectManager.getIntersectedFirstObject(raycaster)高效获取第一个相交对象。
  - 内部定义了 `selectionStore`（响应式对象）：
    - 用于存储选中对象的临时材质信息，key 为对象 id。
    - selectionStore 生命周期与 useObjectSelection 组合式函数一致，自动随页面刷新或状态重置而清空。
  - TransformControls与选中对象辅助功能已迁移至useObjectSelection.js统一管理，SceneManager.js仅负责场景本身，SceneViewer.vue仅负责初始化调用。
  - TransformControls拖拽时会自动禁用OrbitControls，避免拖拽时镜头跟随问题，并在拖拽开始/结束时自动调用 useTransform 的 startTransform/endTransform，支持撤销/重做历史记录。
=======
- useObjectSelection.js中：
  - duplicateSelected()方法已从ObjectManager.js迁移至useObjectSelection.js，并通过Toolbar.vue抛出duplicate-selected事件，由Editor.vue统一监听并调用，实现复制功能的事件驱动与解耦。
  - 使用ObjectManager.getIntersectedFirstObject(raycaster)高效获取第一个相交对象。
  - 内部定义了 `selectionStore`（响应式对象）：
    - 用于存储选中对象的临时材质信息，key 为对象 id。
    - selectionStore 生命周期与 useObjectSelection 组合式函数一致，自动随页面刷新或状态重置而清空。
  - TransformControls与选中对象辅助功能已迁移至useObjectSelection.js统一管理，SceneManager.js仅负责场景本身，SceneViewer.vue仅负责初始化调用。
  - TransformControls拖拽时会自动禁用OrbitControls，避免拖拽时镜头跟随问题，并在拖拽开始/结束时自动调用 useTransform 的 startTransform/endTransform，支持撤销/重做历史记录。
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
本工程完全使用AI自行编写代码。

## 🎨 截图
![截图1](public/images/screenshot01.png)

## ✅ 主要功能

- 3D场景渲染和管理
- 多种基础与扩展几何体创建
- 完整的对象变换系统（移动、旋转、缩放）、撤销重做历史记录
- 多格式3D模型和纹理加载与管理（GLTF、OBJ、FBX等）
- 拖拽上传、资源管理与资源浏览（支持模型预览和几何体创建）
- 相机控制与预设视角（OrbitControls、MapControls、FlyControls切换，FlyControls支持基于键盘、鼠标的三维飞行控制）
- 材质编辑和属性调整（多种材质类型与参数动态配置）
- 场景序列化、导入导出与完整层级管理
- 单对象选择和编辑
- 支持GLTF等模型的动画选择与播放，动画状态可导出与恢复
- 底部状态栏显示当前视点（相机旋转）
- 虚拟文件系统，对接后端文件库
- 文件面板拖拽模型文件到场景直接加载
- 支持从虚拟文件系统面板拖拽模型文件到场景直接加载
- 拖拽添加对象时，自动放置到当前视点位置
- 后处理机制（集成Three.js EffectComposer，支持Bloom、FXAA等多种后处理效果链路，统一API动态管理Pass）

## 🚀 技术栈

- **前端框架**: Vue 3 + Vite
- **3D引擎**: Three.js
- **构建工具**: Vite
- **样式**: Sass
- **网络请求**: Fetch API
- **工具库**: 
  - Element Plus - 主流UI组件库
  - Lodash - 实用工具函数库
  - Day.js - 轻量级日期时间库
  - three-viewport-gizmo - 立方体视角控件库
  - stats-gl - 性能监控

## 📁 项目结构

```
three-editor-by-ai/
├── src/
│   ├── components/                           # Vue 组件
│   │   ├── editor/                           # 编辑器 UI 组件
│   │   │   ├── PropertyPanel.vue             # 属性面板
│   │   │   ├── Toolbar.vue                   # 工具栏（复制/删除按钮均通过事件抛出，由Editor.vue统一处理，复制功能事件为duplicate-selected，调用useObjectSelection.js的duplicateSelected方法）
│   │   │   ├── EditorFooter.vue              # 编辑器底部状态栏
│   │   │   ├── AssetBrowser.vue              # 资源浏览器
│   │   │   ├── PrimitiveBrowser.vue          # 基础几何体与灯光浏览组件
│   │   │   ├── ResourcePanel.vue             # 资源面板
│   │   │   ├── VfsFileBrowser.vue            # 虚拟文件系统面板
│   │   │   ├── Inspector.vue                 # 对象检查器
│   │   ├── property/                         # 各种属性编辑组件
│   │   │   ├── ScenePropertyPane.vue         # 场景属性编辑面板
│   │   │   ├── BasePropertyPane.vue          # 对象基础属性编辑面板
│   │   │   ├── UserDataPropertyPane.vue      # userData属性编辑面板
│   │   │   ├── TransformPropertyPane.vue     # 变换属性面板（位置、旋转、缩放）
│   │   │   ├── AnimationPropertyPane.vue     # 动画属性面板（动画选择与播放）
│   │   │   ├── MaterialPropertyPane.vue      # 材质编辑面板
│   │   │   ├── PrimitivePropertyPane-*.vue   # 各种Primitive的专属属性编辑面板
│   │   │   ├── LightPropertyPane-*.vue       # 各种灯光的专属属性面板
│   │   ├── dialog/                           # 各类对话框组件
│   │   │   ├── TextureSelectDialog.vue       # 纹理选择对话框
│   │   │   ├── EditorConfigDialog.vue        # 编辑器配置对话框
│   │   │   ├── VfsFileChooserDialog.vue      # 虚拟文件系统文件选择对话框
│   │   │   ├── VfsFileSaverDialog.vue        # 虚拟文件系统文件保存对话框
│   │   ├── scene/                            # 3D 场景组件
│   │   │   ├── SceneViewer.vue               # 主场景视图，支持拖拽添加对象到当前视点位置
│   │   │   ├── StatHints.vue                 # 性能监控面板
│   │   │   ├── InteractionHints.vue          # 操作提示组件，支持切换控制器
│   │   │   ├── ViewportControls.vue          # 视图控制面板组件
│   │   │   ├── CubeViewportControls.vue      # 立方体视角控件
│   ├── composables/           # Vue Composition API 可组合函数
│   │   ├── useScene.js        # 场景管理
│   │   ├── useObjectSelection.js  # 对象选择、TransformControls与选中对象辅助功能
│   │   ├── useTransform.js    # 变换操作
│   │   ├── useAssets.js       # 资源管理，包含模型/纹理等资源的加载、缓存与去重机制
│   │   ├── useEditorConfig.js # 编辑器配置响应式状态与操作方法
│   ├── core/                  # 核心 Three.js 逻辑
│   │   ├── SceneManager.js    # 场景管理器
│   │   ├── ObjectManager.js   # 对象管理器
│   │   ├── InputManager.js    # 输入处理
│   │   ├── AssetLoader.js     # 资源加载器
│   ├── services/              # 数据请求和外部接口
│   │   ├── static-drive-api.js# 静态文件系统封装
│   │   ├── vfs-server-api.js  # 虚拟文件系统封装
│   │   ├── vfs-service.js     # 虚拟文件系统服务
│   ├── controls/             # 控制器
│   │   ├── FlyControls.js    # 飞行控制器，支持基于键盘、鼠标的三维飞行
│   ├── utils/                # 工具函数
│   │   ├── mathUtils.js      # 数学工具
│   │   ├── geometryUtils.js  # 几何工具
│   │   ├── fileUtils.js      # 文件处理工具
│   ├── constants/            # 常量定义
│   │   ├── PRIMITIVES.json   # 预定义几何体与灯光类型数据
│   ├── App.vue               # 根组件（仅负责引入Editor.vue）
│   ├── Editor.vue            # 主编辑器组件（包含全部业务与UI）
│   ├── main.js               # 应用入口
│   ├── main-func.js          # 应用入口文件相关的功能函数
│   ├── style.scss            # 全局样式
├── public/                   # 存放无需构建的静态资源
│   ├── images/               # 图片资源目录
│   ├── vfs/                  # 静态资源目录（虚拟文件系统，.folder.json文件用于描述目录和文件信息）
├── script/                   # 脚本
│   ├── package.json          # 脚本子项目配置
│   ├── generate-vfs.js       # 脚本：生成虚拟文件系统的元数据，用于编辑器的文件浏览器
│   ├── vfs-server.js         # 脚本：虚拟文件系统后端服务，支持多 drive 配置（读取vfs-server.json）
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
├── README.md                 # 项目说明
```

## 🏗️ 架构设计

### 组件层次

1. **主编辑器组件** (`Editor.vue`): 负责所有业务逻辑和UI的集成
2. **UI 层** (`components/editor/`, `components/dialog/`): 负责用户界面和交互
3. **3D 渲染层** (`components/scene/`): 处理 3D 场景渲染和显示
4. **逻辑层** (`composables/`, `core/`): 业务逻辑和状态管理
5. **服务层** (`services/`): 数据请求和外部接口
6. **工具层** (`utils/`): 通用工具函数

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

## 重要逻辑

- vite.config.js中，配置vite-plugin-static-copy，把几个js库的复制到目标路径：
  - 如需加载Draco压缩的glTF模型，请将node_modules/three/examples/jsm/libs/draco/目录中的文件复制到 /draco/ 目录下。
  - 如需加载KTX2纹理，请将node_modules/three/examples/jsm/libs/basis目录中的文件放入 /basis/ 目录下。
  - 如需加载Meshopt压缩的glTF模型，请将node_modules/three/examples/jsm/libs/meshopt_decoder.module.js文件放入 public/meshopt/ 目录下。
- SceneManager.js中：
  - loadScene()方法加载场景时，灯光和对象会完整恢复userData到Three.js对象，包括自定义属性、动画索引等，确保序列化与反序列化一致。
  - 运行时创建的动画相关对象（如_mixer、_activeAction等）不再挂载到userData，而是直接挂在主对象上（如obj._mixer、obj._activeAction），所有运行时临时对象均采用此设计，避免序列化污染，提升运行时管理效率。
- ObjectManager.js中：
  - 导出对象数据时，仅保留可序列化字段（如animationIndex），所有运行时对象（如_mixer、_activeAction等）均直接挂主对象，不再出现在userData中。
- ObjectManager.js中：
  - createPrimitive(type, options) 只负责创建对象，不自动添加到管理器（不调用addObject），需在外部调用addObject方法完成对象注册；
  - 新增 getUnlockedObjects() 方法，支持获取所有未被锁定（userData.locked !== true）的对象；
  - getIntersectedObjects() 和 getIntersectedFirstObject() 仅返回未锁定对象；
  - 变换后分发object-transform-updated事件。
- useScene.js中：
  - 聚焦对象时计算中心点并设置OrbitControls target。
- useObjectSelection.js中：
  - duplicateSelected()方法已从ObjectManager.js迁移至useObjectSelection.js，并通过Toolbar.vue抛出duplicate-selected事件，由Editor.vue统一监听并调用，实现复制功能的事件驱动与解耦。
  - 使用ObjectManager.getIntersectedFirstObject(raycaster)高效获取第一个相交对象。
  - 内部定义了 `selectionStore`（响应式对象）：
    - 用于存储选中对象的临时材质信息，key 为对象 id。
    - selectionStore 生命周期与 useObjectSelection 组合式函数一致，自动随页面刷新或状态重置而清空。
  - TransformControls与选中对象辅助功能已迁移至useObjectSelection.js统一管理，SceneManager.js仅负责场景本身，SceneViewer.vue仅负责初始化调用。
  - TransformControls拖拽时会自动禁用OrbitControls，避免拖拽时镜头跟随问题，并在拖拽开始/结束时自动调用 useTransform 的 startTransform/endTransform，支持撤销/重做历史记录。
- FlyControls.js中，已支持基于键盘的三维飞行控制（WASD/QE/方向键等），核心逻辑参考 three/examples/jsm/controls/OrbitControls.js、three/examples/jsm/controls/FlyControls.js 实现，支持速度、旋转、拖拽等多种操作。空格键与R键逻辑一致，均可向上飞行。
- useAssets.js 中：
  - 资源加载函数（如 loadModel、loadTexture）已实现缓存机制：若 assetLibrary 中已存在同名且大小一致的资源，则直接返回缓存，避免重复加载和内存浪费。
- 所有资源（基础几何体、模型、资源）添加方式已统一为拖拽，点击添加功能已移除。
- 对象动画：GLTF等模型加载后自动挂载animations，属性面板支持动画下拉选择并记录到userData.animationIndex，SceneManager.js统一驱动所有对象动画，ObjectManager.js导出/导入时自动保存与恢复动画索引，支持动画状态完整序列化。

## 💯 AI

- 本工程基本使用AI自行编写代码（人工编写代码目前少于5%）；
- 开发环境：VSCode + Cline + GitHub Copilot + Claude 4 / GPT-4.1
- 使用Claude 4搭建本工程的主体框架，但由于GitHub Copilot Pro版2天内就消耗完（300 Premium requests），后转向使用GPT-4.1实现各项功能。
- .clinerules目录：存储AI规则
- .clinetask目录：存储历史对话

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
README.md

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
README.md
src/core/ObjectManager.js
src/composables/useTransform.js

# Current Time
9/15/2025, 12:06:44 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
34,524 / 111.424K tokens used (31%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
已完成如下修改，实现duplicateSelected事件的解耦与迁移：

1. Toolbar.vue：将duplicateSelected方法改为emit('duplicate-selected')，并在emits中声明，复制按钮点击时抛出事件。
2. Editor.vue：监听Toolbar的duplicate-selected事件，统一调用useObjectSelection.js中的duplicateSelected方法，实现复制功能。
3. README.md已同步更新，项目结构和重要逻辑部分均补充了复制事件的事件流与解耦说明。

所有相关文件已按规范更新，功能已实现并文档同步。
</result>
</attempt_completion>

---

**User:**

[attempt_completion] Result:
The user has provided feedback on the results. Consider their input to continue the task, and then attempt completion again.
<feedback>
useObjectSelection.js我已手动改过，请重新阅读

点击复制按钮后，出现以下错误：
SceneManager.js:555 
 TransformControls: The attached 3D object must be a part of the scene graph.
render	@	SceneManager.js:555
animate	@	SceneManager.js:512
</feedback>
<environment_details>
# VSCode Visible Files
src/composables/useObjectSelection.js

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
README.md
src/core/ObjectManager.js
src/composables/useTransform.js

# Current Time
9/15/2025, 12:09:27 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
36,732 / 111.424K tokens used (33%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. 用户反馈“复制”按钮报错：TransformControls: The attached 3D object must be a part of the scene graph.
2. 需排查useObjectSelection.js的duplicateSelected实现，确认复制对象后是否已正确添加到场景（scene graph）。
3. 需阅读useObjectSelection.js，分析duplicateSelected逻辑，定位是否有遗漏addObject或add到scene的步骤。
</thinking>

<read_file>
<path>src/composables/useObjectSelection.js</path>
</read_file>

---

**User:**

[read_file for 'src/composables/useObjectSelection.js'] Result:
/**
 * 对象选择与变换控制管理 Composable
 * 提供对象选择、TransformControls、选中对象辅助显示等功能
 * 新增功能：拖拽结束时根据SceneManager的controlsLocked状态决定是否恢复controls.enabled，避免与镜头锁定冲突。
 */

import { ref, reactive, computed, watch } from 'vue';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { FlyControls } from '../controls/FlyControls.js';
import { DirectionalLightHelper, PointLightHelper, SpotLightHelper, HemisphereLightHelper, CameraHelper, BoxHelper } from 'three';

/**
 * selectionStore
 * 用于存储选中对象的临时材质信息，key为对象id
 */
const selectionStore = reactive({});
import { useObjectManager } from '../core/ObjectManager.js';
import { useInputManager } from '../core/InputManager.js';

const objectManager = useObjectManager();
const inputManager = useInputManager();

// TransformControls及辅助对象相关
/** @type {TransformControls|null} */
let transformControls = null;
/** @type {THREE.Object3D|null} */
let transformHelper = null;
/** @type {THREE.Object3D|null} */
let currentTransformObject = null;
/** @type {THREE.Object3D|null} */
let currentHelper = null;
/** @type {object|null} */
let transform = null; // 外部传入响应式transform对象
/** @type {object|null} */
let scene = null; // 外部传入Three.js场景对象
/** @type {object|null} */
let camera = null; // 外部传入Three.js相机对象
/** @type {object|null} */
let renderer = null; // 外部传入Three.js渲染器对象
/** @type {object|null} */
let controls = null; // OrbitControls实例

/**
 * 初始化TransformControls及辅助对象
 * @param {object} options { scene, camera, renderer, controls, objectSelection, transform }
 */
function initTransformControls(options = {}) {
  scene = options.scene;
  camera = options.camera;
  renderer = options.renderer;
  controls = options.controls;
  transform = options.transform;

  if (!scene || !camera || !renderer) return;
  if (transformControls) {
    scene.remove(transformControls);
    transformControls.dispose?.();
    transformControls = null;
  }
  transformControls = new TransformControls(camera, renderer.domElement);

  // 监听变换事件，同步属性
  transformControls.addEventListener('objectChange', () => {
    if (currentTransformObject) {
      // 变换时动态更新BoxHelper
      if (currentHelper && currentHelper instanceof BoxHelper) {
        currentHelper.update();
      }
      if (objectManager && objectManager.setObjectTransform) {
        objectManager.setObjectTransform(
          currentTransformObject.userData.id,
          {
            position: [
              currentTransformObject.position.x,
              currentTransformObject.position.y,
              currentTransformObject.position.z
            ],
            rotation: [
              currentTransformObject.rotation.x,
              currentTransformObject.rotation.y,
              currentTransformObject.rotation.z
            ],
            scale: [
              currentTransformObject.scale.x,
              currentTransformObject.scale.y,
              currentTransformObject.scale.z
            ]
          }
        );
      }
    }
  });

  // 拖拽时禁用当前控制器（OrbitControls、MapControls、FlyControls）
  // 拖拽时禁用当前控制器（OrbitControls、MapControls、FlyControls）
transformControls.addEventListener('dragging-changed', (event) => {
    // 拖拽开始/结束时，记录变换历史
    try {
      // 动态引入 useTransform，避免循环依赖
      import('../composables/useTransform.js').then(mod => {
        const transform = mod.default ? mod.default() : mod.useTransform();
        if (event.value) {
          // 拖拽开始
          transform.startTransform();
        } else {
          // 拖拽结束
          transform.endTransform();
        }
      });
    } catch (e) {
      // ignore
    }
    if (controls) {
      // 判断控制器类型，禁用对应控制器（instanceof判断，兼容混淆环境）
      if (
        controls instanceof OrbitControls ||
        controls instanceof MapControls ||
        controls instanceof FlyControls
      ) {
        controls.enabled = !event.value;
        // 拖拽结束后，主动重置控制器状态
        if (!event.value && typeof controls.state !== 'undefined') {
          controls.state = -1; // _STATE.NONE
        }
        // 拖拽结束时，若镜头锁定则保持controls.enabled=false
        if (!event.value) {
          import('../core/SceneManager.js').then(mod => {
            const sceneManager = mod.useSceneManager();
            if (sceneManager.getControlsLocked && sceneManager.getControlsLocked()) {
              controls.enabled = false;
            }
          });
        }
      }
    }
  });

  // 禁止TransformControls事件冒泡到OrbitControls等
  transformControls.addEventListener('mouseDown', (event) => {
    event.stopPropagation?.();
  });

  // 添加辅助对象到场景
  transformHelper = transformControls.getHelper ? transformControls.getHelper() : null;
  if (transformHelper) {
    scene.add(transformHelper);
  }

  // 监听transformMode变化
  if (transform && transform.transformMode) {
    watch(() => transform.transformMode.value, (mode) => {
      if (transformControls) {
        transformControls.setMode(mode);
        if (currentTransformObject) {
          transformControls.attach(currentTransformObject);
          transformControls.visible = true;
        }
      }
    }, { immediate: true });
  }

  // 监听选中对象变化
  if (selectedObjects) {
    watch(selectedObjects, (objs) => {
      if (objs.length === 1) {
        currentTransformObject = objs[0];
        // 检查transformHelper是否已挂载到场景，若未挂载则重新添加
        if (transformHelper && scene && !scene.children.includes(transformHelper)) {
          scene.add(transformHelper);
        }
        // 锁定状态下不绑定transformControls
        if (currentTransformObject.userData && currentTransformObject.userData.locked) {
          transformControls.detach();
          transformControls.visible = false;
          updateSelectedHelper(currentTransformObject);
        } else {
          transformControls.attach(currentTransformObject);
          transformControls.visible = true;
          updateSelectedHelper(currentTransformObject);
        }
      } else {
        transformControls.detach();
        transformControls.visible = false;
        updateSelectedHelper(null);
      }
    }, { immediate: true });
  }

  // 新版three.js写法：只添加transformHelper
  transformHelper = transformControls.getHelper ? transformControls.getHelper() : null;
  if (transformHelper) {
    scene.add(transformHelper);
  }
}

/**
 * 移除TransformControls及相关helper
 */
function disposeTransformControls() {
  if (transformControls && scene) {
    scene.remove(transformControls);
    if (transformHelper) scene.remove(transformHelper);
    transformControls.dispose?.();
    transformControls = null;
  }
  if (currentHelper && scene) {
    scene.remove(currentHelper);
    if (currentHelper.dispose) currentHelper.dispose();
    currentHelper = null;
  }
}

/**
 * 选中对象时动态添加helper
 * @param {THREE.Object3D|null} selected
 */
function updateSelectedHelper(selected) {
  console.log(selected, currentHelper, scene);
  if (currentHelper && scene) {
    scene.remove(currentHelper);
    if (currentHelper.dispose) currentHelper.dispose();
    currentHelper = null;
  }
  if (!selected || !scene) return;
  let helper = null;
  if (selected.isDirectionalLight) {
    helper = new DirectionalLightHelper(selected, 5, 0xffaa00);
  } else if (selected.isPointLight) {
    helper = new PointLightHelper(selected, 2, 0x00aaff);
  } else if (selected.isSpotLight) {
    helper = new SpotLightHelper(selected, 2, 0xaaff00);
  } else if (selected.isHemisphereLight) {
    helper = new HemisphereLightHelper(selected, 2);
  } else if (selected.isCamera) {
    helper = new CameraHelper(selected);
  } else {
    // 非光源和镜头，添加包围盒辅助对象
    helper = new BoxHelper(selected, 0xffff00);
  }
  if (helper) {
    scene.add(helper);
    currentHelper = helper;
  }
}

// 响应式状态
const selectedObjects = computed(() => 
  Array.from(objectManager.state.selectedObjects)
    .map(id => objectManager.getObject(id))
    .filter(Boolean)
);

const selectedObjectIds = computed(() => 
  Array.from(objectManager.state.selectedObjects)
);

const hasSelection = computed(() => 
  objectManager.state.selectedObjects.size > 0
);

const selectionCount = computed(() => 
  objectManager.state.selectedObjects.size
);

// 选择模式
const selectionMode = ref('single'); // 'single', 'multiple', 'box'

// 框选状态
const boxSelection = reactive({
  isActive: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
});

// 选择配置（已去除高亮相关）
const selectionConfig = reactive({
  showBoundingBox: true
});

// 悬停状态
const hoveredObject = ref(null);

/**
 * 选择单个对象
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 * @param {boolean} addToSelection 是否添加到现有选择
 */
function selectObject(objectOrId, addToSelection = false) {
  let id;
  
  if (typeof objectOrId === 'string') {
    id = objectOrId;
  } else {
    id = objectOrId.userData.id;
  }
  
  if (!id) return;
  
  if (selectionMode.value === 'single' && !addToSelection) {
    objectManager.selectObjects(id);
  } else {
    objectManager.selectObjects(id, addToSelection);
  }
}

/**
 * 选择多个对象
 * @param {string[]|THREE.Object3D[]} objects 对象数组
 * @param {boolean} addToSelection 是否添加到现有选择
 */
function selectObjects(objects, addToSelection = false) {
  const ids = objects.map(obj => 
    typeof obj === 'string' ? obj : obj.userData.id
  ).filter(Boolean);
  
  objectManager.selectObjects(ids, addToSelection);
}

/**
 * 清空选择
 * 保证镜头锁定状态优先，主动同步SceneManager的controlsLocked到controls.enabled
 */
function clearSelection() {
  objectManager.clearSelection();
  try {
    const { useSceneManager } = require('../core/SceneManager.js');
    const sceneManager = useSceneManager();
    if (sceneManager.controls && sceneManager.getControlsLocked) {
      sceneManager.controls.enabled = !sceneManager.getControlsLocked();
    }
  } catch (e) {
    // ignore
  }
}

/**
 * 切换对象选择状态
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function toggleSelection(objectOrId) {
  let id;
  
  if (typeof objectOrId === 'string') {
    id = objectOrId;
  } else {
    id = objectOrId.userData.id;
  }
  
  if (!id) return;
  
  if (objectManager.state.selectedObjects.has(id)) {
    deselectObject(id);
  } else {
    selectObject(id, selectionMode.value === 'multiple');
  }
}

/**
 * 全选对象
 */
function selectAll() {
  const allObjects = objectManager.getAllObjects();
  const allIds = allObjects.map(obj => obj.userData.id).filter(Boolean);
  objectManager.selectObjects(allIds);
}

/**
 * 反选对象
 */
function invertSelection() {
  const allObjects = objectManager.getAllObjects();
  const selectedIds = Array.from(objectManager.state.selectedObjects);
  
  const invertedIds = allObjects
    .map(obj => obj.userData.id)
    .filter(id => id && !selectedIds.includes(id));
  
  objectManager.selectObjects(invertedIds);
}

/**
 * 根据类型选择对象
 * @param {string} type 对象类型
 * 支持: primitive（几何体），light，group，camera，具体几何体类型（如 box、sphere 等）
 */
function selectByType(type) {
  const objects = objectManager.getAllObjects().filter(obj => {
    if (type === 'primitive') {
      return obj.isMesh;
    }
    if (type === 'light') {
      return obj.isLight;
    }
    if (type === 'group') {
      return obj.isGroup;
    }
    if (type === 'camera') {
      return obj.isCamera;
    }
    // 具体几何体类型
    if (obj.isMesh && obj.geometry && obj.geometry.type) {
      return obj.geometry.type.replace('Geometry', '').toLowerCase() === type;
    }
    // 灯光类型
    if (obj.isLight && obj.type) {
      return obj.type === type;
    }
    return false;
  });
  const ids = objects.map(obj => obj.userData.id).filter(Boolean);
  objectManager.selectObjects(ids);
}

/**
 * 根据名称选择对象
 * @param {string} name 对象名称
 * @param {boolean} exactMatch 是否精确匹配
 */
function selectByName(name, exactMatch = false) {
  const objects = objectManager.getAllObjects()
    .filter(obj => {
      if (exactMatch) {
        return obj.name === name;
      } else {
        return obj.name.toLowerCase().includes(name.toLowerCase());
      }
    });
  
  const ids = objects.map(obj => obj.userData.id).filter(Boolean);
  objectManager.selectObjects(ids);
}

/**
 * 取消选择对象
 * 保证镜头锁定状态优先，主动同步SceneManager的controlsLocked到controls.enabled
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function deselectObject(objectOrId) {
  let id;
  
  if (typeof objectOrId === 'string') {
    id = objectOrId;
  } else {
    id = objectOrId.userData.id;
  }
  
  if (!id) return;
  
  objectManager.deselectObjects(id);
  try {
    const { useSceneManager } = require('../core/SceneManager.js');
    const sceneManager = useSceneManager();
    if (sceneManager.controls && sceneManager.getControlsLocked) {
      sceneManager.controls.enabled = !sceneManager.getControlsLocked();
    }
  } catch (e) {
    // ignore
  }
}

/**
 * 处理鼠标点击选择
 * 使用ObjectManager.getIntersectedFirstObject(raycaster)高效获取第一个相交对象
 * @param {object} event 鼠标事件数据
 * @param {THREE.Camera} camera 相机
 */
function handleClickSelection(event, camera) {
  if (!camera) return;
  const raycaster = inputManager.getRaycaster(camera);
  const targetObject = objectManager.getIntersectedFirstObject(raycaster);
  if (targetObject) {
    // 如果对象被锁定，则不允许选中
    if (targetObject.userData && targetObject.userData.locked) {
      return;
    }
    const addToSelection = event.modifiers?.ctrl || event.modifiers?.shift;
    if (addToSelection && selectionMode.value === 'multiple') {
      toggleSelection(targetObject);
    } else {
      selectObject(targetObject, false);
    }
    return;
  }
  // 点击空白区域，清空选择
  if (!event.modifiers?.ctrl && !event.modifiers?.shift) {
    clearSelection();
  }
}

// 已去除悬停高亮相关功能

/**
 * 开始框选
 * @param {number} x 起始X坐标
 * @param {number} y 起始Y坐标
 */
function startBoxSelection(x, y) {
  if (selectionMode.value !== 'box') return;
  
  boxSelection.isActive = true;
  boxSelection.startX = x;
  boxSelection.startY = y;
  boxSelection.endX = x;
  boxSelection.endY = y;
}

/**
 * 更新框选
 * @param {number} x 当前X坐标
 * @param {number} y 当前Y坐标
 */
function updateBoxSelection(x, y) {
  if (!boxSelection.isActive) return;
  
  boxSelection.endX = x;
  boxSelection.endY = y;
}

/**
 * 结束框选
 * @param {THREE.Camera} camera 相机
 * @param {HTMLElement} element 渲染元素
 */
function endBoxSelection(camera, element) {
  if (!boxSelection.isActive || !camera || !element) return;
  
  const rect = element.getBoundingClientRect();
  const selectedIds = [];
  
  // 计算框选区域
  const minX = Math.min(boxSelection.startX, boxSelection.endX);
  const maxX = Math.max(boxSelection.startX, boxSelection.endX);
  const minY = Math.min(boxSelection.startY, boxSelection.endY);
  const maxY = Math.max(boxSelection.startY, boxSelection.endY);
  
  // 检查每个对象是否在框选区域内
  objectManager.getAllObjects().forEach(object => {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    
    // 将世界坐标转换为屏幕坐标
    const screenPos = center.clone().project(camera);
    const x = (screenPos.x + 1) / 2 * rect.width;
    const y = -(screenPos.y - 1) / 2 * rect.height;
    
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      selectedIds.push(object.userData.id);
    }
  });
  
  if (selectedIds.length > 0) {
    objectManager.selectObjects(selectedIds);
  }
  
  boxSelection.isActive = false;
}

/**
 * 获取选择边界框
 * @returns {THREE.Box3|null} 边界框
 */
function getSelectionBounds() {
  if (selectedObjects.value.length === 0) return null;
  
  const box = new THREE.Box3();
  
  selectedObjects.value.forEach(object => {
    const objectBox = new THREE.Box3().setFromObject(object);
    box.union(objectBox);
  });
  
  return box;
}

/**
 * 获取选择中心点
 * @returns {THREE.Vector3|null} 中心点
 */
function getSelectionCenter() {
  const bounds = getSelectionBounds();
  return bounds ? bounds.getCenter(new THREE.Vector3()) : null;
}

  
/**
 * 复制选中的对象
 */
function duplicateSelected() {
  const selectedIds = Array.from(objectManager.state.selectedObjects);

  // 用 useObjectSelection 的 deselectObject 取消选择，确保高亮和 userData 恢复
  selectedIds.forEach(id => {
    const obj = objectManager.getObject(id);
    if (obj) deselectObject(obj);
  });

  objectManager.copyObjects(selectedIds);

  const duplicated = objectManager.pasteObjects(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
  const duplicatedIds = duplicated.map(obj => obj.userData.id);
  objectManager.selectObjects(duplicatedIds);

  return duplicated;
}

// 监听选择变化
watch(selectedObjects, (newSelection, oldSelection) => {
  // 可以在这里触发选择变化事件
});

/**
 * useObjectSelection
 * 3D对象选择与变换控制管理的组合式函数，提供响应式选择状态、TransformControls与辅助对象管理
 * @returns {object} 选择相关状态与方法
 */
export function useObjectSelection() {
  return {
    // 状态
    selectedObjects,
    selectedObjectIds,
    hasSelection,
    selectionCount,
    selectionMode,
    boxSelection,
    selectionConfig,
    hoveredObject,

    // TransformControls相关
    initTransformControls,
    disposeTransformControls,
    updateSelectedHelper,
    get transformControls() { return transformControls; },
    get currentTransformObject() { return currentTransformObject; },
    get currentHelper() { return currentHelper; },

    // 方法
    selectObject,
    selectObjects,
    deselectObject,
    clearSelection,
    toggleSelection,
    selectAll,
    invertSelection,
    selectByType,
    selectByName,
    handleClickSelection,
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,
    getSelectionBounds,
    getSelectionCenter,
    duplicateSelected
  };
}

<environment_details>
# VSCode Visible Files
src/composables/useObjectSelection.js

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
README.md
src/core/ObjectManager.js
src/composables/useTransform.js

# Current Time
9/15/2025, 12:09:32 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
37,024 / 111.424K tokens used (33%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. duplicateSelected实现为：取消当前选择→调用objectManager.copyObjects(selectedIds)→pasteObjects到随机位置→重新选中新对象。
2. pasteObjects传入的位置是Math.random()，这可能导致新对象不在场景可见区域或未被正确添加到scene。
3. 错误提示“TransformControls: The attached 3D object must be a part of the scene graph.”说明新对象未被正确添加到Three.js场景。
4. 需确认objectManager.pasteObjects是否负责将新对象add到scene，或需手动添加。
5. 需检查objectManager.pasteObjects的实现，确认其行为。
</thinking>

<read_file>
<path>src/core/ObjectManager.js</path>
</read_file>

---

**User:**

[read_file for 'src/core/ObjectManager.js'] Result:
/**
 * 对象管理器
 * 负责3D对象的创建、管理和操作
 * 
 * 新增方法说明：
 * - getIntersectedFirstObject(raycaster)：高效获取射线第一个相交对象，仅返回第一个命中的顶级对象，适用于对象数量极大时的高性能选择。
 * - getUnlockedObjects()：获取所有未被锁定（userData.locked !== true）的对象，便于过滤交互对象。
 */

import * as THREE from 'three';
import { reactive } from 'vue';
/**
 * 简单的UUID生成器
 * @returns {string} 生成的唯一ID
 */
function generateId() {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
import { createBoxGeometry, createSphereGeometry, createCylinderGeometry } from '../utils/geometryUtils.js';

/**
 * @class ObjectManager
 * 统一的3D对象创建、管理、变换、选择与批量操作管理类
 */
class ObjectManager {
  constructor() {
    // 响应式状态
    this.state = reactive({
      objects: new Map(),
      selectedObjects: new Set(),
      clipboard: null
    });
    
    // 材质缓存
    this.materialCache = new Map();
    
    // 默认材质
    this.defaultMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.4,
      metalness: 0.1
    });
  }
  
  /**
   * 创建基础几何体对象
   * @param {string} type 几何体类型
   * @param {object} options 选项参数
   * @returns {THREE.Mesh|THREE.Light|THREE.Camera|THREE.Group} 创建的对象
   * 注意：本方法只负责创建对象，不自动添加到管理器（不调用addObject）
   */
  createPrimitive(type, options = {}) {
    let object;
    let userData = options?.userData || {};

    // 几何体类型
    if (['box', 'sphere', 'cylinder', 'plane', 'cone', 'torus', 'dodecahedron', 'icosahedron', 'octahedron', 'tetrahedron', 'ring', 'tube'].includes(type)) {
      let geometry;
      
      switch (type) {
        case 'box':
          geometry = createBoxGeometry(
            options.width || 1,
            options.height || 1,
            options.depth || 1
          );
          break;
        case 'sphere':
          geometry = createSphereGeometry(
            options.radius || 0.5,
            options.widthSegments || 32,
            options.heightSegments || 16
          );
          break;
        case 'cylinder':
          geometry = createCylinderGeometry(
            options.radiusTop || 0.5,
            options.radiusBottom || 0.5,
            options.height || 1,
            options.radialSegments || 32
          );
          break;
        case 'plane':
          geometry = new THREE.PlaneGeometry(
            options.width || 1,
            options.height || 1,
            options.widthSegments || 1,
            options.heightSegments || 1
          );
          break;
        case 'cone':
          geometry = new THREE.ConeGeometry(
            options.radius || 0.5,
            options.height || 1,
            options.radialSegments || 32
          );
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(
            options.radius || 0.5,
            options.tube || 0.2,
            options.radialSegments || 16,
            options.tubularSegments || 100
          );
          break;
        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(
            options.radius || 0.5,
            options.detail || 0
          );
          break;
        case 'icosahedron':
          geometry = new THREE.IcosahedronGeometry(
            options.radius || 0.5,
            options.detail || 0
          );
          break;
        case 'octahedron':
          geometry = new THREE.OctahedronGeometry(
            options.radius || 0.5,
            options.detail || 0
          );
          break;
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(
            options.radius || 0.5,
            options.detail || 0
          );
          break;
        case 'ring':
          geometry = new THREE.RingGeometry(
            options.innerRadius || 0.2,
            options.outerRadius || 0.5,
            options.thetaSegments || 32,
            options.phiSegments || 8
          );
          break;
        case 'tube':
          // 创建一个简单的管道路径
          const path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-0.5, 0.5, 0),
            new THREE.Vector3(0.5, -0.5, 0),
            new THREE.Vector3(1, 0, 0)
          ]);
          geometry = new THREE.TubeGeometry(
            path,
            options.tubularSegments || 64,
            options.radius || 0.1,
            options.radialSegments || 8
          );
          break;
        default:
          geometry = createBoxGeometry();
      }
      
      const material = options.material || this.defaultMaterial.clone();
      object = new THREE.Mesh(geometry, material);
      object.castShadow = true;
      object.receiveShadow = true;
    
      // 设置基本属性（只设置{}，不包含type/primitiveType字段）
      object.userData = {...userData};
      
    } else if (['DirectionalLight', 'PointLight', 'SpotLight', 'AmbientLight', 'HemisphereLight'].includes(type)) {
      // 灯光类型
      switch (type) {
        case 'DirectionalLight':
          object = new THREE.DirectionalLight(
            options.color || 0xffffff,
            options.intensity || 1
          );
          object.position.set(options.x || 5, options.y || 5, options.z || 5);
          object.castShadow = true;
          break;
        case 'PointLight':
          object = new THREE.PointLight(
            options.color || 0xffffff,
            options.intensity || 1,
            options.distance || 0,
            options.decay || 2
          );
          object.position.set(options.x || 0, options.y || 2, options.z || 0);
          object.castShadow = true;
          break;
        case 'SpotLight':
          object = new THREE.SpotLight(
            options.color || 0xffffff,
            options.intensity || 1,
            options.distance || 0,
            options.angle || Math.PI / 3,
            options.penumbra || 0,
            options.decay || 2
          );
          object.position.set(options.x || 0, options.y || 3, options.z || 0);
          object.castShadow = true;
          break;
        case 'AmbientLight':
          object = new THREE.AmbientLight(
            options.color || 0x404040,
            options.intensity || 0.5
          );
          break;
        case 'HemisphereLight':
          object = new THREE.HemisphereLight(
            options.skyColor || 0xffffbb,
            options.groundColor || 0x080820,
            options.intensity || 1
          );
          break;
      }
    
      // 设置基本属性（只设置{}，不包含type/primitiveType字段）
      object.userData = {...userData};
      
    } else if (['camera', 'group', 'text', 'sprite'].includes(type)) {
      // 其他对象类型
      switch (type) {
        case 'camera':
          object = new THREE.PerspectiveCamera(
            options.fov || 75,
            options.aspect || window.innerWidth / window.innerHeight,
            options.near || 0.1,
            options.far || 1000
          );
          object.position.set(options.x || 0, options.y || 0, options.z || 5);
          break;
        case 'group':
          object = new THREE.Group();
          break;
        case 'text':
          // 创建简单的文本几何体（需要字体文件，这里创建占位符）
          const textGeometry = new THREE.BoxGeometry(1, 0.2, 0.1);
          const textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          object = new THREE.Mesh(textGeometry, textMaterial);
          break;
        case 'sprite':
          const spriteMaterial = new THREE.SpriteMaterial({ 
            color: options.color || 0xffffff 
          });
          object = new THREE.Sprite(spriteMaterial);
          break;
      }
    
      // 设置基本属性（只设置{}，不包含type/primitiveType字段）
      object.userData = {...userData};
    } else {
      // 默认创建立方体
      const geometry = createBoxGeometry();
      const material = options.material || this.defaultMaterial.clone();
      object = new THREE.Mesh(geometry, material);
      object.castShadow = true;
      object.receiveShadow = true;
    
      // 设置基本属性（只设置{}，不包含type/primitiveType字段）
      object.userData = {...userData};
    }

    if (options.name) {
      object.name = options.name;
    } else {
      object.name = `${type}`;
    }
    
    // 设置位置、旋转、缩放
    if (options.position) {
      object.position.set(...options.position);
    }
    if (options.rotation) {
      object.rotation.set(...options.rotation);
    }
    if (options.scale) {
      object.scale.set(...options.scale);
    }
    
    // 只创建对象，不自动添加到管理器
    return object;
  }
  
  /**
   * 添加对象到管理器
   * @param {THREE.Object3D} object 3D对象
   */
  addObject(object) {
    if (!object.userData.id) {
      object.userData.id = generateId();
    }
    this.state.objects.set(object.userData.id, object);
  }
  
  /**
   * 移除对象
   * @param {string|THREE.Object3D} objectOrId 对象或ID
   */
  removeObject(objectOrId) {
    let object, id;
    
    if (typeof objectOrId === 'string') {
      id = objectOrId;
      object = this.state.objects.get(id);
    } else {
      object = objectOrId;
      id = object.userData.id;
    }
    
    if (!object) return;
    
    // 从选择集合中移除
    this.state.selectedObjects.delete(id);
    
    // 从对象映射中移除
    this.state.objects.delete(id);
    
    // 清理资源
    this.disposeObject(object);
  }
  
  /**
   * 清理对象资源
   * @param {THREE.Object3D} object 3D对象
   */
  disposeObject(object) {
    object.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
  
  /**
   * 获取对象
   * @param {string} id 对象ID
   * @returns {THREE.Object3D|null} 对象
   */
  getObject(id) {
    return this.state.objects.get(id) || null;
  }
  
  /**
   * 获取所有对象
   * @returns {THREE.Object3D[]} 对象数组
   */
  getAllObjects() {
    return Array.from(this.state.objects.values());
  }

  /**
   * 获取所有未被锁定的对象
   * @returns {THREE.Object3D[]} 未锁定对象数组
   * 新语法说明：使用Array.prototype.filter过滤userData.locked!==true的对象
   */
  getUnlockedObjects() {
    return Array.from(this.state.objects.values()).filter(obj => !(obj.userData && obj.userData.locked === true));
  }
  
  /**
   * 选择对象
   * @param {string|string[]} objectIds 对象ID或ID数组
   * @param {boolean} addToSelection 是否添加到现有选择
   */
  selectObjects(objectIds, addToSelection = false) {
    if (!addToSelection) {
      this.state.selectedObjects.clear();
    }
    
    const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
    ids.forEach(id => {
      if (this.state.objects.has(id)) {
        this.state.selectedObjects.add(id);
      }
    });
  }
  
  /**
   * 取消选择对象
   * @param {string|string[]} objectIds 对象ID或ID数组
   */
  deselectObjects(objectIds) {
    const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
    ids.forEach(id => this.state.selectedObjects.delete(id));
  }
  
  /**
   * 清空选择
   */
  clearSelection() {
    this.state.selectedObjects.clear();
  }
  
  /**
   * 获取选中的对象
   * @returns {THREE.Object3D[]} 选中的对象数组
   */
  getSelectedObjects() {
    return Array.from(this.state.selectedObjects)
      .map(id => this.state.objects.get(id))
      .filter(Boolean);
  }
  
  /**
   * 深度克隆对象，确保材质为标准three.js材质实例
   * @param {THREE.Object3D} source
   * @returns {THREE.Object3D}
   */
  deepCloneObject(source) {
    const clone = source.clone(true);
    clone.traverse((child, idx) => {
      if (child.isMesh) {
        // 处理 material 为数组或单个材质
        const fixMaterial = (mat) => {
          let fixed = mat && typeof mat.clone === 'function'
            ? mat.clone()
            : this.defaultMaterial.clone();
          // 保证材质类型为 MeshStandardMaterial
          if (!(fixed instanceof THREE.MeshStandardMaterial)) {
            fixed = new THREE.MeshStandardMaterial({ color: 0x888888 });
          }
          // 保证 color 字段为 THREE.Color 实例
          if (!fixed.color || !(fixed.color instanceof THREE.Color)) {
            fixed.color = new THREE.Color(0x888888);
          }
          return fixed;
        };
        if (child.material) {
          if (Array.isArray(child.material)) {
            // 只保留第一个材质，转为单一材质，避免属性面板访问数组
            child.material = fixMaterial(child.material[0]);
          } else {
            child.material = fixMaterial(child.material);
          }
        }
        // 兜底：如果 material 仍无效，强制赋默认材质
        if (!child.material || typeof child.material !== 'object' || !('color' in child.material)) {
          child.material = this.defaultMaterial.clone();
        }
      }
    });
    
    return clone;
  }

  /**
   * 复制对象
   * @param {string|string[]} objectIds 对象ID或ID数组
   */
  copyObjects(objectIds) {
    const ids = Array.isArray(objectIds) ? objectIds : [objectIds];
    const objects = ids.map(id => this.state.objects.get(id)).filter(Boolean);

    this.state.clipboard = objects.map(obj => this.deepCloneObject(obj));
  }
  
  /**
   * 粘贴对象
   * @param {THREE.Vector3} position 粘贴位置
   * @returns {THREE.Object3D[]} 粘贴的对象
   */
  pasteObjects(position = new THREE.Vector3()) {
    if (!this.state.clipboard || this.state.clipboard.length === 0) {
      return [];
    }

    const pastedObjects = [];

    this.state.clipboard.forEach((clipboardObj, index) => {
      // 使用 deepCloneObject，确保材质和 color 字段类型正确
      const clone = this.deepCloneObject(clipboardObj);
      
      // 重新生成ID
      clone.userData.id = generateId();
      clone.name = `${clone.name}_copy`;

      // 随机新位置
      clone.position.copy(position);

      this.addObject(clone);
      pastedObjects.push(clone);
    });

    return pastedObjects;
  }
  
  /**
   * 设置对象变换
   * @param {string} objectId 对象ID
   * @param {object} transform 变换参数
   */
  setObjectTransform(objectId, transform) {
    const object = this.getObject(objectId);
    if (!object) return;
    
    if (transform.position) {
      object.position.set(...transform.position);
    }
    if (transform.rotation) {
      object.rotation.set(...transform.rotation);
    }
    if (transform.scale) {
      object.scale.set(...transform.scale);
    }
    // 变换后分发事件，通知属性面板刷新
    window.dispatchEvent(new CustomEvent('object-transform-updated', { detail: { objectId } }));
  }
  
  /**
   * 获取对象变换
   * @param {string} objectId 对象ID
   * @returns {object|null} 变换数据
   */
  getObjectTransform(objectId) {
    const object = this.getObject(objectId);
    if (!object) return null;
    
    return {
      position: object.position.toArray(),
      rotation: object.rotation.toArray(),
      scale: object.scale.toArray()
    };
  }
  
  /**
   * 设置对象材质
   * @param {string} objectId 对象ID
   * @param {THREE.Material|object} material 材质或材质参数
   */
  setObjectMaterial(objectId, material) {
    const object = this.getObject(objectId);
    if (!object || !object.material) return;

    if (material instanceof THREE.Material) {
      object.material = material;
    } else if (material.type) {
      // 新建材质对象并赋值，避免直接修改type属性导致threejs报错
      object.material = this.createMaterial(material);
    } else {
      // 更新材质属性
      if (material.color) {
        // 支持 '#rrggbb' 或 '0xRRGGBB' 字符串
        if (typeof material.color === 'string') {
          object.material.color = new THREE.Color(material.color);
        } else if (typeof material.color === 'number') {
          object.material.color = new THREE.Color(material.color);
        } else if (material.color instanceof THREE.Color) {
          object.material.color.copy(material.color);
        }
      }
      // 其他属性直接赋值
      Object.entries(material).forEach(([key, value]) => {
        if (key !== 'color') {
          // 纹理贴图属性需特殊处理
          if (['map', 'normalMap', 'aoMap', 'displacementMap', 'metalnessMap', 'roughnessMap', 'envMap', 'gradientMap', 'matcap'].includes(key)) {
            object.material[key] = value;
            object.material.needsUpdate = true;
          } else {
            object.material[key] = value;
          }
        }
      });
      object.material.needsUpdate = true;
    }
  }
  
  /**
   * 创建材质
   * @param {object} options 材质选项
   * @returns {THREE.Material} 材质
   */
  createMaterial(options = {}) {
    const materialType = options.type || 'MeshStandardMaterial';
    
    switch (materialType) {
      case 'MeshBasicMaterial':
        return new THREE.MeshBasicMaterial(options);
      case 'MeshLambertMaterial':
        return new THREE.MeshLambertMaterial(options);
      case 'MeshPhongMaterial':
        return new THREE.MeshPhongMaterial(options);
      case 'MeshNormalMaterial':
        // MeshNormalMaterial只支持部分参数，过滤掉color等无效参数
        const { flatShading } = options;
        return new THREE.MeshNormalMaterial({ flatShading });
      case 'MeshPhysicalMaterial':
        return new THREE.MeshPhysicalMaterial(options);
      case 'MeshStandardMaterial':
      default:
        return new THREE.MeshStandardMaterial(options);
    }
  }
  
  /**
   * 根据射线查找未锁定对象
   * @param {THREE.Raycaster} raycaster 射线投射器
   * @returns {THREE.Object3D[]} 相交的未锁定对象
   */
  getIntersectedObjects(raycaster) {
    const objects = this.getUnlockedObjects();
    const intersects = raycaster.intersectObjects(objects, true);

    return intersects.map(intersect => {
      // 找到顶级管理的对象
      let targetObject = intersect.object;
      while (targetObject.parent && !this.state.objects.has(targetObject.userData.id)) {
        targetObject = targetObject.parent;
      }
      return targetObject;
    }).filter(obj => this.state.objects.has(obj.userData.id));
  }

  /**
   * 高效获取射线第一个相交未锁定对象
   * 只返回第一个命中的顶级未锁定对象，适用于对象数量极大时的高性能选择
   * @param {THREE.Raycaster} raycaster 射线投射器
   * @returns {THREE.Object3D|null} 第一个相交未锁定对象或null
   */
  getIntersectedFirstObject(raycaster) {
    const objects = this.getUnlockedObjects();
    const intersects = raycaster.intersectObjects(objects, true);
    if (intersects.length === 0) return null;
    // 找到顶级管理的对象
    let targetObject = intersects[0].object;
    while (targetObject.parent && !this.state.objects.has(targetObject.userData.id)) {
      targetObject = targetObject.parent;
    }
    return this.state.objects.has(targetObject.userData.id) ? targetObject : null;
  }
  
  /**
   * 清空所有对象
   */
  clear() {
    this.getAllObjects().forEach(object => {
      this.disposeObject(object);
    });
    
    this.state.objects.clear();
    this.state.selectedObjects.clear();
    this.state.clipboard = null;
  }
  
  /**
   * 导出对象数据
   * @param {string[]} objectIds 对象ID数组，为空则导出所有对象
   * @returns {object} 对象数据
   */
  exportObjects(objectIds = []) {
    let objects = objectIds.length > 0 
      ? objectIds.map(id => this.getObject(id)).filter(Boolean)
      : this.getAllObjects();
    
    // 过滤掉灯光（通过对象属性判断）
    objects = objects.filter(obj => !obj.isLight);
    return {
      objects: objects.map(obj => {
        // 导出userData时，仅保留可序列化数据（如animationIndex），不处理主对象上的_mixer/_activeAction等运行时字段
        const { animationIndex, ...userDataExport } = obj.userData || {};
        // 导出时，type=primitive时增加primitiveType字段
        let type = obj.userData.type;
        let primitiveType = undefined;
        if (!type && obj.isMesh) {
          type = 'primitive';
          primitiveType = obj.geometry && obj.geometry.type ? obj.geometry.type.replace('Geometry', '').toLowerCase() : undefined;
        }
        if (!type && obj.isLight) {
          type = 'light';
          primitiveType = obj.type;
        }
        // 保留animationIndex字段
        if (typeof obj.userData.animationIndex !== 'undefined') {
          userDataExport.animationIndex = obj.userData.animationIndex;
        }
        return {
          id: obj.userData.id,
          name: obj.name,
          type,
          primitiveType,
          position: obj.position.toArray(),
          rotation: obj.rotation.toArray(),
          scale: obj.scale.toArray(),
          userData: userDataExport
        };
      }),
      timestamp: new Date().toISOString()
    };
  }
}

// 单例模式
let instance = null;

export function useObjectManager() {
  if (!instance) {
    instance = new ObjectManager();
  }
  return instance;
}

export default ObjectManager;

<environment_details>
# VSCode Visible Files
src/composables/useObjectSelection.js

# VSCode Open Tabs
src/composables/useObjectSelection.js
src/components/editor/Toolbar.vue
src/Editor.vue
README.md
src/core/ObjectManager.js
src/composables/useTransform.js

# Current Time
9/15/2025, 12:09:36 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
41,624 / 111.424K tokens used (37%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<thinking>
1. objectManager.pasteObjects只会将克隆对象添加到objectManager（addObject），不会自动添加到Three.js场景（scene.add）。
2. duplicateSelected只调用了objectManager.selectObjects，没有将新对象添加到scene。
3. 这导致TransformControls尝试attach新对象时报“must be a part of the scene graph”。
4. 需在duplicateSelected中，将pasteObjects返回的新对象逐个添加到scene（即scene.add(obj)）。
5. useObjectSelection.js中scene为initTransformControls时传入的全局scene对象，可直接使用。
</thinking>

<replace_in_file>
<path>src/composables/useObjectSelection.js</path>
<diff>
------- SEARCH
function duplicateSelected() {
  const selectedIds = Array.from(objectManager.state.selectedObjects);

  // 用 useObjectSelection 的 deselectObject 取消选择，确保高亮和 userData 恢复
  selectedIds.forEach(id => {
    const obj = objectManager.getObject(id);
    if (obj) deselectObject(obj);
  });

  objectManager.copyObjects(selectedIds);

  const duplicated = objectManager.pasteObjects(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
  const duplicatedIds = duplicated.map(obj => obj.userData.id);
  objectManager.selectObjects(duplicatedIds);

  return duplicated;
}
=======
/**
 * 复制选中的对象
 * 复制后将新对象添加到Three.js场景，避免TransformControls报错
 */
function duplicateSelected() {
  const selectedIds = Array.from(objectManager.state.selectedObjects);

  // 用 useObjectSelection 的 deselectObject 取消选择，确保高亮和 userData 恢复
  selectedIds.forEach(id => {
    const obj = objectManager.getObject(id);
    if (obj) deselectObject(obj);
  });

  objectManager.copyObjects(selectedIds);

  // 粘贴到原对象附近（避免重叠）
  const duplicated = objectManager.pasteObjects(new THREE.Vector3(Math.random(), Math.random(), Math.random()));

  // 新对象必须添加到Three.js场景
  if (scene && typeof scene.add === 'function') {
    duplicated.forEach(obj => {
      scene.add(obj);
    });
  }

  const duplicatedIds = duplicated.map(obj => obj.userData.id);
  objectManager.selectObjects(duplicatedIds);

  return duplicated;
}
+++++++ REPLACE
</diff>
</replace_in_file>

---

**User:**

[replace_in_file for 'src/composables/useObjectSelection.js'] Result:
The content was successfully saved to src/composables/useObjectSelection.js.

Here is the full, updated content of the file that was saved:

<final_file_content path="src/composables/useObjectSelection.js">
/**
 * 对象选择与变换控制管理 Composable
 * 提供对象选择、TransformControls、选中对象辅助显示等功能
 * 新增功能：拖拽结束时根据SceneManager的controlsLocked状态决定是否恢复controls.enabled，避免与镜头锁定冲突。
 */

import { ref, reactive, computed, watch } from 'vue';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { FlyControls } from '../controls/FlyControls.js';
import { DirectionalLightHelper, PointLightHelper, SpotLightHelper, HemisphereLightHelper, CameraHelper, BoxHelper } from 'three';

/**
 * selectionStore
 * 用于存储选中对象的临时材质信息，key为对象id
 */
const selectionStore = reactive({});
import { useObjectManager } from '../core/ObjectManager.js';
import { useInputManager } from '../core/InputManager.js';

const objectManager = useObjectManager();
const inputManager = useInputManager();

// TransformControls及辅助对象相关
/** @type {TransformControls|null} */
let transformControls = null;
/** @type {THREE.Object3D|null} */
let transformHelper = null;
/** @type {THREE.Object3D|null} */
let currentTransformObject = null;
/** @type {THREE.Object3D|null} */
let currentHelper = null;
/** @type {object|null} */
let transform = null; // 外部传入响应式transform对象
/** @type {object|null} */
let scene = null; // 外部传入Three.js场景对象
/** @type {object|null} */
let camera = null; // 外部传入Three.js相机对象
/** @type {object|null} */
let renderer = null; // 外部传入Three.js渲染器对象
/** @type {object|null} */
let controls = null; // OrbitControls实例

/**
 * 初始化TransformControls及辅助对象
 * @param {object} options { scene, camera, renderer, controls, objectSelection, transform }
 */
function initTransformControls(options = {}) {
  scene = options.scene;
  camera = options.camera;
  renderer = options.renderer;
  controls = options.controls;
  transform = options.transform;

  if (!scene || !camera || !renderer) return;
  if (transformControls) {
    scene.remove(transformControls);
    transformControls.dispose?.();
    transformControls = null;
  }
  transformControls = new TransformControls(camera, renderer.domElement);

  // 监听变换事件，同步属性
  transformControls.addEventListener('objectChange', () => {
    if (currentTransformObject) {
      // 变换时动态更新BoxHelper
      if (currentHelper && currentHelper instanceof BoxHelper) {
        currentHelper.update();
      }
      if (objectManager && objectManager.setObjectTransform) {
        objectManager.setObjectTransform(
          currentTransformObject.userData.id,
          {
            position: [
              currentTransformObject.position.x,
              currentTransformObject.position.y,
              currentTransformObject.position.z
            ],
            rotation: [
              currentTransformObject.rotation.x,
              currentTransformObject.rotation.y,
              currentTransformObject.rotation.z
            ],
            scale: [
              currentTransformObject.scale.x,
              currentTransformObject.scale.y,
              currentTransformObject.scale.z
            ]
          }
        );
      }
    }
  });

  // 拖拽时禁用当前控制器（OrbitControls、MapControls、FlyControls）
  // 拖拽时禁用当前控制器（OrbitControls、MapControls、FlyControls）
transformControls.addEventListener('dragging-changed', (event) => {
    // 拖拽开始/结束时，记录变换历史
    try {
      // 动态引入 useTransform，避免循环依赖
      import('../composables/useTransform.js').then(mod => {
        const transform = mod.default ? mod.default() : mod.useTransform();
        if (event.value) {
          // 拖拽开始
          transform.startTransform();
        } else {
          // 拖拽结束
          transform.endTransform();
        }
      });
    } catch (e) {
      // ignore
    }
    if (controls) {
      // 判断控制器类型，禁用对应控制器（instanceof判断，兼容混淆环境）
      if (
        controls instanceof OrbitControls ||
        controls instanceof MapControls ||
        controls instanceof FlyControls
      ) {
        controls.enabled = !event.value;
        // 拖拽结束后，主动重置控制器状态
        if (!event.value && typeof controls.state !== 'undefined') {
          controls.state = -1; // _STATE.NONE
        }
        // 拖拽结束时，若镜头锁定则保持controls.enabled=false
        if (!event.value) {
          import('../core/SceneManager.js').then(mod => {
            const sceneManager = mod.useSceneManager();
            if (sceneManager.getControlsLocked && sceneManager.getControlsLocked()) {
              controls.enabled = false;
            }
          });
        }
      }
    }
  });

  // 禁止TransformControls事件冒泡到OrbitControls等
  transformControls.addEventListener('mouseDown', (event) => {
    event.stopPropagation?.();
  });

  // 添加辅助对象到场景
  transformHelper = transformControls.getHelper ? transformControls.getHelper() : null;
  if (transformHelper) {
    scene.add(transformHelper);
  }

  // 监听transformMode变化
  if (transform && transform.transformMode) {
    watch(() => transform.transformMode.value, (mode) => {
      if (transformControls) {
        transformControls.setMode(mode);
        if (currentTransformObject) {
          transformControls.attach(currentTransformObject);
          transformControls.visible = true;
        }
      }
    }, { immediate: true });
  }

  // 监听选中对象变化
  if (selectedObjects) {
    watch(selectedObjects, (objs) => {
      if (objs.length === 1) {
        currentTransformObject = objs[0];
        // 检查transformHelper是否已挂载到场景，若未挂载则重新添加
        if (transformHelper && scene && !scene.children.includes(transformHelper)) {
          scene.add(transformHelper);
        }
        // 锁定状态下不绑定transformControls
        if (currentTransformObject.userData && currentTransformObject.userData.locked) {
          transformControls.detach();
          transformControls.visible = false;
          updateSelectedHelper(currentTransformObject);
        } else {
          transformControls.attach(currentTransformObject);
          transformControls.visible = true;
          updateSelectedHelper(currentTransformObject);
        }
      } else {
        transformControls.detach();
        transformControls.visible = false;
        updateSelectedHelper(null);
      }
    }, { immediate: true });
  }

  // 新版three.js写法：只添加transformHelper
  transformHelper = transformControls.getHelper ? transformControls.getHelper() : null;
  if (transformHelper) {
    scene.add(transformHelper);
  }
}

/**
 * 移除TransformControls及相关helper
 */
function disposeTransformControls() {
  if (transformControls && scene) {
    scene.remove(transformControls);
    if (transformHelper) scene.remove(transformHelper);
    transformControls.dispose?.();
    transformControls = null;
  }
  if (currentHelper && scene) {
    scene.remove(currentHelper);
    if (currentHelper.dispose) currentHelper.dispose();
    currentHelper = null;
  }
}

/**
 * 选中对象时动态添加helper
 * @param {THREE.Object3D|null} selected
 */
function updateSelectedHelper(selected) {
  console.log(selected, currentHelper, scene);
  if (currentHelper && scene) {
    scene.remove(currentHelper);
    if (currentHelper.dispose) currentHelper.dispose();
    currentHelper = null;
  }
  if (!selected || !scene) return;
  let helper = null;
  if (selected.isDirectionalLight) {
    helper = new DirectionalLightHelper(selected, 5, 0xffaa00);
  } else if (selected.isPointLight) {
    helper = new PointLightHelper(selected, 2, 0x00aaff);
  } else if (selected.isSpotLight) {
    helper = new SpotLightHelper(selected, 2, 0xaaff00);
  } else if (selected.isHemisphereLight) {
    helper = new HemisphereLightHelper(selected, 2);
  } else if (selected.isCamera) {
    helper = new CameraHelper(selected);
  } else {
    // 非光源和镜头，添加包围盒辅助对象
    helper = new BoxHelper(selected, 0xffff00);
  }
  if (helper) {
    scene.add(helper);
    currentHelper = helper;
  }
}

// 响应式状态
const selectedObjects = computed(() => 
  Array.from(objectManager.state.selectedObjects)
    .map(id => objectManager.getObject(id))
    .filter(Boolean)
);

const selectedObjectIds = computed(() => 
  Array.from(objectManager.state.selectedObjects)
);

const hasSelection = computed(() => 
  objectManager.state.selectedObjects.size > 0
);

const selectionCount = computed(() => 
  objectManager.state.selectedObjects.size
);

// 选择模式
const selectionMode = ref('single'); // 'single', 'multiple', 'box'

// 框选状态
const boxSelection = reactive({
  isActive: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0
});

// 选择配置（已去除高亮相关）
const selectionConfig = reactive({
  showBoundingBox: true
});

// 悬停状态
const hoveredObject = ref(null);

/**
 * 选择单个对象
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 * @param {boolean} addToSelection 是否添加到现有选择
 */
function selectObject(objectOrId, addToSelection = false) {
  let id;
  
  if (typeof objectOrId === 'string') {
    id = objectOrId;
  } else {
    id = objectOrId.userData.id;
  }
  
  if (!id) return;
  
  if (selectionMode.value === 'single' && !addToSelection) {
    objectManager.selectObjects(id);
  } else {
    objectManager.selectObjects(id, addToSelection);
  }
}

/**
 * 选择多个对象
 * @param {string[]|THREE.Object3D[]} objects 对象数组
 * @param {boolean} addToSelection 是否添加到现有选择
 */
function selectObjects(objects, addToSelection = false) {
  const ids = objects.map(obj => 
    typeof obj === 'string' ? obj : obj.userData.id
  ).filter(Boolean);
  
  objectManager.selectObjects(ids, addToSelection);
}

/**
 * 清空选择
 * 保证镜头锁定状态优先，主动同步SceneManager的controlsLocked到controls.enabled
 */
function clearSelection() {
  objectManager.clearSelection();
  try {
    const { useSceneManager } = require('../core/SceneManager.js');
    const sceneManager = useSceneManager();
    if (sceneManager.controls && sceneManager.getControlsLocked) {
      sceneManager.controls.enabled = !sceneManager.getControlsLocked();
    }
  } catch (e) {
    // ignore
  }
}

/**
 * 切换对象选择状态
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function toggleSelection(objectOrId) {
  let id;
  
  if (typeof objectOrId === 'string') {
    id = objectOrId;
  } else {
    id = objectOrId.userData.id;
  }
  
  if (!id) return;
  
  if (objectManager.state.selectedObjects.has(id)) {
    deselectObject(id);
  } else {
    selectObject(id, selectionMode.value === 'multiple');
  }
}

/**
 * 全选对象
 */
function selectAll() {
  const allObjects = objectManager.getAllObjects();
  const allIds = allObjects.map(obj => obj.userData.id).filter(Boolean);
  objectManager.selectObjects(allIds);
}

/**
 * 反选对象
 */
function invertSelection() {
  const allObjects = objectManager.getAllObjects();
  const selectedIds = Array.from(objectManager.state.selectedObjects);
  
  const invertedIds = allObjects
    .map(obj => obj.userData.id)
    .filter(id => id && !selectedIds.includes(id));
  
  objectManager.selectObjects(invertedIds);
}

/**
 * 根据类型选择对象
 * @param {string} type 对象类型
 * 支持: primitive（几何体），light，group，camera，具体几何体类型（如 box、sphere 等）
 */
function selectByType(type) {
  const objects = objectManager.getAllObjects().filter(obj => {
    if (type === 'primitive') {
      return obj.isMesh;
    }
    if (type === 'light') {
      return obj.isLight;
    }
    if (type === 'group') {
      return obj.isGroup;
    }
    if (type === 'camera') {
      return obj.isCamera;
    }
    // 具体几何体类型
    if (obj.isMesh && obj.geometry && obj.geometry.type) {
      return obj.geometry.type.replace('Geometry', '').toLowerCase() === type;
    }
    // 灯光类型
    if (obj.isLight && obj.type) {
      return obj.type === type;
    }
    return false;
  });
  const ids = objects.map(obj => obj.userData.id).filter(Boolean);
  objectManager.selectObjects(ids);
}

/**
 * 根据名称选择对象
 * @param {string} name 对象名称
 * @param {boolean} exactMatch 是否精确匹配
 */
function selectByName(name, exactMatch = false) {
  const objects = objectManager.getAllObjects()
    .filter(obj => {
      if (exactMatch) {
        return obj.name === name;
      } else {
        return obj.name.toLowerCase().includes(name.toLowerCase());
      }
    });
  
  const ids = objects.map(obj => obj.userData.id).filter(Boolean);
  objectManager.selectObjects(ids);
}

/**
 * 取消选择对象
 * 保证镜头锁定状态优先，主动同步SceneManager的controlsLocked到controls.enabled
 * @param {string|THREE.Object3D} objectOrId 对象或ID
 */
function deselectObject(objectOrId) {
  let id;
  
  if (typeof objectOrId === 'string') {
    id = objectOrId;
  } else {
    id = objectOrId.userData.id;
  }
  
  if (!id) return;
  
  objectManager.deselectObjects(id);
  try {
    const { useSceneManager } = require('../core/SceneManager.js');
    const sceneManager = useSceneManager();
    if (sceneManager.controls && sceneManager.getControlsLocked) {
      sceneManager.controls.enabled = !sceneManager.getControlsLocked();
    }
  } catch (e) {
    // ignore
  }
}

/**
 * 处理鼠标点击选择
 * 使用ObjectManager.getIntersectedFirstObject(raycaster)高效获取第一个相交对象
 * @param {object} event 鼠标事件数据
 * @param {THREE.Camera} camera 相机
 */
function handleClickSelection(event, camera) {
  if (!camera) return;
  const raycaster = inputManager.getRaycaster(camera);
  const targetObject = objectManager.getIntersectedFirstObject(raycaster);
  if (targetObject) {
    // 如果对象被锁定，则不允许选中
    if (targetObject.userData && targetObject.userData.locked) {
      return;
    }
    const addToSelection = event.modifiers?.ctrl || event.modifiers?.shift;
    if (addToSelection && selectionMode.value === 'multiple') {
      toggleSelection(targetObject);
    } else {
      selectObject(targetObject, false);
    }
    return;
  }
  // 点击空白区域，清空选择
  if (!event.modifiers?.ctrl && !event.modifiers?.shift) {
    clearSelection();
  }
}

// 已去除悬停高亮相关功能

/**
 * 开始框选
 * @param {number} x 起始X坐标
 * @param {number} y 起始Y坐标
 */
function startBoxSelection(x, y) {
  if (selectionMode.value !== 'box') return;
  
  boxSelection.isActive = true;
  boxSelection.startX = x;
  boxSelection.startY = y;
  boxSelection.endX = x;
  boxSelection.endY = y;
}

/**
 * 更新框选
 * @param {number} x 当前X坐标
 * @param {number} y 当前Y坐标
 */
function updateBoxSelection(x, y) {
  if (!boxSelection.isActive) return;
  
  boxSelection.endX = x;
  boxSelection.endY = y;
}

/**
 * 结束框选
 * @param {THREE.Camera} camera 相机
 * @param {HTMLElement} element 渲染元素
 */
function endBoxSelection(camera, element) {
  if (!boxSelection.isActive || !camera || !element) return;
  
  const rect = element.getBoundingClientRect();
  const selectedIds = [];
  
  // 计算框选区域
  const minX = Math.min(boxSelection.startX, boxSelection.endX);
  const maxX = Math.max(boxSelection.startX, boxSelection.endX);
  const minY = Math.min(boxSelection.startY, boxSelection.endY);
  const maxY = Math.max(boxSelection.startY, boxSelection.endY);
  
  // 检查每个对象是否在框选区域内
  objectManager.getAllObjects().forEach(object => {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    
    // 将世界坐标转换为屏幕坐标
    const screenPos = center.clone().project(camera);
    const x = (screenPos.x + 1) / 2 * rect.width;
    const y = -(screenPos.y - 1) / 2 * rect.height;
    
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      selectedIds.push(object.userData.id);
    }
  });
  
  if (selectedIds.length > 0) {
    objectManager.selectObjects(selectedIds);
  }
  
  boxSelection.isActive = false;
}

/**
 * 获取选择边界框
 * @returns {THREE.Box3|null} 边界框
 */
function getSelectionBounds() {
  if (selectedObjects.value.length === 0) return null;
  
  const box = new THREE.Box3();
  
  selectedObjects.value.forEach(object => {
    const objectBox = new THREE.Box3().setFromObject(object);
    box.union(objectBox);
  });
  
  return box;
}

/**
 * 获取选择中心点
 * @returns {THREE.Vector3|null} 中心点
 */
function getSelectionCenter() {
  const bounds = getSelectionBounds();
  return bounds ? bounds.getCenter(new THREE.Vector3()) : null;
}

  
/**
 * 复制选中的对象
 */
/**
 * 复制选中的对象
 * 复制后将新对象添加到Three.js场景，避免TransformControls报错
 */
function duplicateSelected() {
  const selectedIds = Array.from(objectManager.state.selectedObjects);

  // 用 useObjectSelection 的 deselectObject 取消选择，确保高亮和 userData 恢复
  selectedIds.forEach(id => {
    const obj = objectManager.getObject(id);
    if (obj) deselectObject(obj);
  });

  objectManager.copyObjects(selectedIds);

  // 粘贴到原对象附近（避免重叠）
  const duplicated = objectManager.pasteObjects(new THREE.Vector3(Math.random(), Math.random(), Math.random()));

  // 新对象必须添加到Three.js场景
  if (scene && typeof scene.add === 'function') {
    duplicated.forEach(obj => {
      scene.add(obj);
    });
  }

  const duplicatedIds = duplicated.map(obj => obj.userData.id);
  objectManager.selectObjects(duplicatedIds);

  return duplicated;
}

// 监听选择变化
watch(selectedObjects, (newSelection, oldSelection) => {
  // 可以在这里触发选择变化事件
});

/**
 * useObjectSelection
 * 3D对象选择与变换控制管理的组合式函数，提供响应式选择状态、TransformControls与辅助对象管理
 * @returns {object} 选择相关状态与方法
 */
export function useObjectSelection() {
  return {
    // 状态
    selectedObjects,
    selectedObjectIds,
    hasSelection,
    selectionCount,
    selectionMode,
    boxSelection,
    selectionConfig,
    hoveredObject,

    // TransformControls相关
    initTransformControls,
    disposeTransformControls,
    updateSelectedHelper,
    get transformControls() { return transformControls; },
    get currentTransformObject() { return currentTransformObject; },
    get currentHelper() { return currentHelper; },

    // 方法
    selectObject,
    selectObjects,
    deselectObject,
    clearSelection,
    toggleSelection,
    selectAll,
    invertSelection,
    selectByType,
    selectByName,
    handleClickSelection,
    startBoxSelection,
    updateBoxSelection,
    endBoxSelection,
    getSelectionBounds,
    getSelectionCenter,
    duplicateSelected
  };
}

</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.


<environment_details>
# VSCode Visible Files
src/composables/useObjectSelection.js

# VSCode Open Tabs
src/components/editor/Toolbar.vue
src/Editor.vue
README.md
src/core/ObjectManager.js
src/composables/useObjectSelection.js
src/composables/useTransform.js

# Current Time
9/15/2025, 12:09:51 PM (Asia/Shanghai, UTC+8:00)

# Context Window Usage
47,247 / 111.424K tokens used (42%)

# Current Mode
ACT MODE
</environment_details>

---

**Assistant:**

<attempt_completion>
<result>
已修复复制功能：duplicateSelected 现在会将新复制的对象自动添加到 Three.js 场景，避免 TransformControls 报错“must be a part of the scene graph”。  
实现方式为：复制后遍历新对象，逐个执行 scene.add(obj)。

请验证复制按钮功能，理论上已无上述报错，复制对象应能正常选中和变换。
</result>
</attempt_completion>

