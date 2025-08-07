<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性面板</h3>
      <button v-if="hasSelection" @click="clearSelection" class="clear-btn">
        清除选择
      </button>
    </div>
    
    <div v-if="!hasSelection" class="no-selection">
      <p>请选择一个对象来编辑属性</p>
    </div>
    
    <div v-else class="property-content">
      <!-- 基本信息 -->
      <div class="property-section">
        <h4>基本信息</h4>
        <div class="property-group">
          <label>名称:</label>
          <input 
            v-model="objectName" 
            type="text" 
            @blur="updateObjectName"
            class="property-input"
          >
        </div>
        <div class="property-group">
          <label>类型:</label>
          <span class="property-value">{{ objectType }}</span>
        </div>
      </div>
      
      <!-- 变换属性 -->
      <div class="property-section">
        <h4>变换</h4>
        
        <!-- 位置 -->
        <div class="property-group">
          <label>位置:</label>
          <div class="vector-input">
            <input 
              v-model.number="transform.position.x" 
              @input="updateTransform"
              type="number" 
              step="0.1"
              placeholder="X"
            >
            <input 
              v-model.number="transform.position.y" 
              @input="updateTransform"
              type="number" 
              step="0.1"
              placeholder="Y"
            >
            <input 
              v-model.number="transform.position.z" 
              @input="updateTransform"
              type="number" 
              step="0.1"
              placeholder="Z"
            >
          </div>
        </div>
        
        <!-- 旋转 -->
        <div class="property-group">
          <label>旋转:</label>
          <div class="vector-input">
            <input 
              v-model.number="transform.rotation.x" 
              @input="updateTransform"
              type="number" 
              step="1"
              placeholder="X°"
            >
            <input 
              v-model.number="transform.rotation.y" 
              @input="updateTransform"
              type="number" 
              step="1"
              placeholder="Y°"
            >
            <input 
              v-model.number="transform.rotation.z" 
              @input="updateTransform"
              type="number" 
              step="1"
              placeholder="Z°"
            >
          </div>
        </div>
        
        <!-- 缩放 -->
        <div class="property-group">
          <label>缩放:</label>
          <div class="vector-input">
            <input 
              v-model.number="transform.scale.x" 
              @input="updateTransform"
              type="number" 
              step="0.1"
              min="0.001"
              placeholder="X"
            >
            <input 
              v-model.number="transform.scale.y" 
              @input="updateTransform"
              type="number" 
              step="0.1"
              min="0.001"
              placeholder="Y"
            >
            <input 
              v-model.number="transform.scale.z" 
              @input="updateTransform"
              type="number" 
              step="0.1"
              min="0.001"
              placeholder="Z"
            >
          </div>
          <button @click="resetScale" class="reset-btn">重置</button>
        </div>
      </div>
      
<!-- 材质属性 -->
      <div v-if="selectedObject && selectedObject.material" class="property-section">
        <h4>材质</h4>
        <div class="property-group">
          <label>类型:</label>
          <select v-model="materialType" @change="onMaterialTypeChange" class="property-input">
            <option value="MeshStandardMaterial">标准(Standard)</option>
            <option value="MeshPhysicalMaterial">物理(Physical)</option>
            <option value="MeshPhongMaterial">冯氏(Phong)</option>
            <option value="MeshLambertMaterial">兰伯特(Lambert)</option>
            <option value="MeshNormalMaterial">法向(Normal)</option>
            <option value="MeshBasicMaterial">基础(Basic)</option>
          </select>
        </div>
        <div class="property-group">
          <label>颜色:</label>
          <input 
            v-model="materialColor" 
            @input="updateMaterialColor"
            type="color"
            class="color-input"
          >
        </div>
        <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
          <label>粗糙度:</label>
          <input 
            v-model.number="materialRoughness" 
            @input="updateMaterialRoughness"
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            class="range-input"
          >
          <span class="range-value">{{ materialRoughness.toFixed(2) }}</span>
        </div>
        <div v-if="materialType==='MeshStandardMaterial' || materialType==='MeshPhysicalMaterial'" class="property-group">
          <label>金属度:</label>
          <input 
            v-model.number="materialMetalness" 
            @input="updateMaterialMetalness"
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            class="range-input"
          >
          <span class="range-value">{{ materialMetalness.toFixed(2) }}</span>
        </div>
        <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
          <label>清漆(clearcoat):</label>
          <input 
            v-model.number="materialClearcoat" 
            @input="updateMaterialClearcoat"
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            class="range-input"
          >
          <span class="range-value">{{ materialClearcoat.toFixed(2) }}</span>
        </div>
        <div v-if="materialType==='MeshPhysicalMaterial'" class="property-group">
          <label>清漆粗糙度(clearcoatRoughness):</label>
          <input 
            v-model.number="materialClearcoatRoughness" 
            @input="updateMaterialClearcoatRoughness"
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            class="range-input"
          >
          <span class="range-value">{{ materialClearcoatRoughness.toFixed(2) }}</span>
        </div>
        <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
          <label>高光(speclar):</label>
          <input 
            v-model="materialSpecular" 
            @input="updateMaterialSpecular"
            type="color"
            class="color-input"
          >
        </div>
        <div v-if="materialType==='MeshPhongMaterial'" class="property-group">
          <label>高光强度(shininess):</label>
          <input 
            v-model.number="materialShininess" 
            @input="updateMaterialShininess"
            type="range" 
            min="0" 
            max="200" 
            step="1"
            class="range-input"
          >
          <span class="range-value">{{ materialShininess }}</span>
        </div>
        <div v-if="materialType==='MeshLambertMaterial'" class="property-group">
          <label>自发光(emissive):</label>
          <input 
            v-model="materialEmissive" 
            @input="updateMaterialEmissive"
            type="color"
            class="color-input"
          >
        </div>
        <!-- 纹理相关 -->
        <div class="property-group">
          <label>纹理:</label>
          <div v-if="selectedObject.material.map">
            <img :src="getTexturePreviewSrc(selectedObject.material.map.image)" alt="纹理预览" style="width:64px;height:64px;border:1px solid #555;">
            <button @click="clearTexture" class="action-btn danger" style="margin-left:8px;">清除纹理</button>
          </div>
          <div v-else>
            <span style="color:#aaa;">无纹理</span>
          </div>
          <button @click="showTextureDialog = true" class="action-btn" style="margin-top:8px;">选择纹理</button>
          <TextureSelectDialog
            :visible="showTextureDialog"
            @close="showTextureDialog = false"
            @select="onTextureSelected"
          />
        </div>
      </div>
      
      
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, inject } from 'vue';
import TextureSelectDialog from './TextureSelectDialog.vue';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import { useTransform } from '../../composables/useTransform.js';
import { useObjectManager } from '../../core/ObjectManager.js';
import { radToDeg, degToRad } from '../../utils/mathUtils.js';

export default {
  name: 'PropertyPanel',
  components: {
    TextureSelectDialog
  },
  /**
   * 属性面板组件
   * 提供对象属性的展示与编辑功能
   */
  setup() {
    const objectSelection = useObjectSelection();
    const transformManager = useTransform();
    const objectManager = useObjectManager();
    const scene = inject('scene');
    
    // 响应式数据
    const objectName = ref('');
    const transform = reactive({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });
    
    // 材质相关响应式变量
    const materialType = ref('MeshStandardMaterial');
    const materialColor = ref('#888888');
    const materialRoughness = ref(0.4);
    const materialMetalness = ref(0.1);
    const materialClearcoat = ref(0);
    const materialClearcoatRoughness = ref(0);
    const materialSpecular = ref('#ffffff');
    const materialShininess = ref(30);
    const materialEmissive = ref('#000000');

    // 计算属性
    const hasSelection = computed(() => objectSelection.hasSelection.value);
    const selectedObject = computed(() => {
      const objects = objectSelection.selectedObjects.value;
      return objects.length === 1 ? objects[0] : null;
    });
    
    const objectType = computed(() => {
      if (!selectedObject.value) return '';
      return selectedObject.value.userData.type || selectedObject.value.type || 'Object3D';
    });
    
    // 监听选择变化
    watch(selectedObject, (newObject) => {
      if (newObject) {
        updatePropertyValues(newObject);
        // 监听对象属性变化，实时刷新面板
        watch(() => [
          newObject.position.x, newObject.position.y, newObject.position.z,
          newObject.rotation.x, newObject.rotation.y, newObject.rotation.z,
          newObject.scale.x, newObject.scale.y, newObject.scale.z
        ], () => {
          updatePropertyValues(newObject);
        }, { immediate: false });
      }
    }, { immediate: true });
    
    // 方法

    /**
     * 更新属性面板的显示数据
     * @param {Object} object 选中的对象
     */
    function updatePropertyValues(object) {
      objectName.value = object.name || '';
      
      // 更新变换数据
      transform.position.x = Number(object.position.x.toFixed(3));
      transform.position.y = Number(object.position.y.toFixed(3));
      transform.position.z = Number(object.position.z.toFixed(3));
      
      transform.rotation.x = Number(radToDeg(object.rotation.x).toFixed(1));
      transform.rotation.y = Number(radToDeg(object.rotation.y).toFixed(1));
      transform.rotation.z = Number(radToDeg(object.rotation.z).toFixed(1));
      
      transform.scale.x = Number(object.scale.x.toFixed(3));
      transform.scale.y = Number(object.scale.y.toFixed(3));
      transform.scale.z = Number(object.scale.z.toFixed(3));
      
      // 更新材质数据
      if (object.material) {
        materialType.value = object.material.type || 'MeshStandardMaterial';
        materialColor.value = `#${object.material.color?.getHexString?.() ?? '888888'}`;
        materialRoughness.value = object.material.roughness ?? 0.4;
        materialMetalness.value = object.material.metalness ?? 0.1;
        materialClearcoat.value = object.material.clearcoat ?? 0;
        materialClearcoatRoughness.value = object.material.clearcoatRoughness ?? 0;
        materialSpecular.value = object.material.specular ? `#${object.material.specular.getHexString()}` : '#ffffff';
        materialShininess.value = object.material.shininess ?? 30;
        materialEmissive.value = object.material.emissive ? `#${object.material.emissive.getHexString()}` : '#000000';
      }
    }
    
    /**
     * 更新对象名称
     */
    function updateObjectName() {
      if (selectedObject.value) {
        selectedObject.value.name = objectName.value;
      }
    }
    
    /**
     * 更新对象的变换属性（位置、旋转、缩放）
     */
    function updateTransform() {
      if (!selectedObject.value) return;
      
      transformManager.setPosition(selectedObject.value, [
        transform.position.x,
        transform.position.y,
        transform.position.z
      ]);
      
      transformManager.setRotation(selectedObject.value, [
        degToRad(transform.rotation.x),
        degToRad(transform.rotation.y),
        degToRad(transform.rotation.z)
      ]);
      
      transformManager.setScale(selectedObject.value, [
        transform.scale.x,
        transform.scale.y,
        transform.scale.z
      ]);
    }
    
    /**
     * 材质类型切换
     */
    function onMaterialTypeChange() {
      if (!selectedObject.value) return;
      // 构造新材质参数
      let params = { color: materialColor.value.replace('#', '0x') };
      if (materialType.value === 'MeshStandardMaterial') {
        params.roughness = materialRoughness.value;
        params.metalness = materialMetalness.value;
      } else if (materialType.value === 'MeshPhysicalMaterial') {
        params.roughness = materialRoughness.value;
        params.metalness = materialMetalness.value;
        params.clearcoat = materialClearcoat.value;
        params.clearcoatRoughness = materialClearcoatRoughness.value;
      } else if (materialType.value === 'MeshPhongMaterial') {
        params.specular = materialSpecular.value.replace('#', '0x');
        params.shininess = materialShininess.value;
      } else if (materialType.value === 'MeshLambertMaterial') {
        params.emissive = materialEmissive.value.replace('#', '0x');
      }
      objectManager.setObjectMaterial(selectedObject.value.userData.id, {
        type: materialType.value,
        ...params
      });
    }

    /**
     * 更新材质颜色
     */
    function updateMaterialColor() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          color: materialColor.value.replace('#', '0x')
        });
      }
    }

    /**
     * 更新材质粗糙度
     */
    function updateMaterialRoughness() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          roughness: materialRoughness.value
        });
      }
    }

    /**
     * 更新材质金属度
     */
    function updateMaterialMetalness() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          metalness: materialMetalness.value
        });
      }
    }

    /**
     * 更新清漆
     */
    function updateMaterialClearcoat() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          clearcoat: materialClearcoat.value
        });
      }
    }

    /**
     * 更新清漆粗糙度
     */
    function updateMaterialClearcoatRoughness() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          clearcoatRoughness: materialClearcoatRoughness.value
        });
      }
    }

    /**
     * 更新高光
     */
    function updateMaterialSpecular() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          specular: materialSpecular.value.replace('#', '0x')
        });
      }
    }

    /**
     * 更新高光强度
     */
    function updateMaterialShininess() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          shininess: materialShininess.value
        });
      }
    }

    /**
     * 更新自发光
     */
    function updateMaterialEmissive() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, {
          emissive: materialEmissive.value.replace('#', '0x')
        });
      }
    }
    /**
     * 重置缩放为1
     */
    function resetScale() {
      transform.scale.x = 1;
      transform.scale.y = 1;
      transform.scale.z = 1;
      updateTransform();
    }
    
    /**
     * 清除当前选择
     */
    function clearSelection() {
      objectSelection.clearSelection();
    }
    
    /**
     * 清除当前对象材质的纹理
     */
    function clearTexture() {
      if (selectedObject.value && selectedObject.value.material) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, { map: null });
      }
    }

    /**
     * 选择纹理弹窗状态
     */
    const showTextureDialog = ref(false);

    /**
     * 处理纹理选择回调
     * @param {object} textureInfo 选中的纹理信息
     */
    function onTextureSelected(textureInfo) {
      showTextureDialog.value = false;
      if (selectedObject.value && selectedObject.value.material && textureInfo?.texture) {
        objectManager.setObjectMaterial(selectedObject.value.userData.id, { map: textureInfo.texture });
      }
    }

    /**
     * 纹理预览 src 处理
     * @param {HTMLImageElement} image 纹理图片对象
     * @returns {string} 预览图数据URL
     */
    function getTexturePreviewSrc(image) {
        // 创建临时canvas
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return canvas.toDataURL();
    }

    return {
      // 状态
      hasSelection,
      selectedObject,
      objectName,
      objectType,
      transform,
      materialType,
      materialColor,
      materialRoughness,
      materialMetalness,
      materialClearcoat,
      materialClearcoatRoughness,
      materialSpecular,
      materialShininess,
      materialEmissive,

      // 方法
      updateObjectName,
      updateTransform,
      onMaterialTypeChange,
      updateMaterialColor,
      updateMaterialRoughness,
      updateMaterialMetalness,
      updateMaterialClearcoat,
      updateMaterialClearcoatRoughness,
      updateMaterialSpecular,
      updateMaterialShininess,
      updateMaterialEmissive,
      resetScale,
      clearSelection,
      clearTexture,
      getTexturePreviewSrc,
      showTextureDialog,
      onTextureSelected
    };
  }
};
</script>

<style scoped>
.property-panel {
  width: 300px;
  height: 100%;
  background: #2a2a2a;
  border-left: 1px solid #444;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.clear-btn {
  padding: 4px 8px;
  background: #666;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #777;
}

.no-selection {
  padding: 20px;
  text-align: center;
  color: #999;
}

.property-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ccc;
  border-bottom: 1px solid #444;
  padding-bottom: 4px;
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

.property-input:focus {
  outline: none;
  border-color: #007acc;
}

.property-value {
  padding: 6px 8px;
  background: #333;
  border-radius: 4px;
  font-size: 12px;
  color: #ccc;
}

.vector-input {
  display: flex;
  gap: 4px;
}

.vector-input input {
  width: 33%;
  flex: none;
  padding: 6px 8px;
  background: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
}

.vector-input input:focus {
  outline: none;
  border-color: #007acc;
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

.property-group:has(.range-input) {
  flex-direction: row;
  align-items: center;
}

.reset-btn {
  padding: 4px 12px;
  background: #555;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  margin-top: 4px;
}

.reset-btn:hover {
  background: #666;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
