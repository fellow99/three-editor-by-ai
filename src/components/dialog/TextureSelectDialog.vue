<!--
  纹理选择对话框
  用于展示所有已加载纹理，供用户选择
-->
<script setup>
import { ref, computed } from 'vue';
import { useAssets } from '../../composables/useAssets.js';

/**
 * 对话框显示状态，由父组件通过 v-model:visible 控制
 */
const props = defineProps({
  modelValue: { type: Boolean, required: true }
});
const emits = defineEmits(['update:modelValue', 'select']);

const { filteredTextures } = useAssets();

const textures = computed(() => filteredTextures.value);

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化结果
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 关闭对话框
 */
function close() {
  emits('update:modelValue', false);
}

/**
 * 选择纹理
 */
function select(texture) {
  emits('select', texture);
  emits('update:modelValue', false);
}
</script>

<template>
  <ElDialog
    :model-value="props.modelValue"
    title="选择纹理"
    width="560px"
    @close="close"
    class="texture-dialog-el"
  >
    <div class="texture-list">
      <div v-if="textures.length === 0" class="empty-tip">暂无纹理资源</div>
      <div class="textures-grid">
        <div
          v-for="texture in textures"
          :key="texture.id"
          class="texture-card"
          @click="select(texture)"
        >
          <div class="card-preview">
            <img :src="texture.preview" :alt="texture.name" class="preview-image" />
          </div>
          <div class="card-info">
            <div class="card-name" :title="texture.name">{{ texture.name }}</div>
            <div class="card-meta">
              <span class="card-resolution">{{ texture.width }}×{{ texture.height }}</span>
              <span class="card-size">{{ formatFileSize(texture.size) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<style lang="scss" scoped>
.texture-dialog-mask {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.texture-dialog {
  background: #222;
  border-radius: 10px;
  width: 540px;
  max-height: 80vh;
  box-shadow: 0 2px 24px rgba(0,0,0,0.28);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #fff;
}
.texture-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px;
  border-bottom: 1px solid #444;
  font-size: 17px;
  font-weight: bold;
  background: #292929;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #fff;
}
.texture-list {
  padding: 22px;
  flex: 1;
  overflow-y: auto;
}
.textures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 18px;
}
.texture-card {
  background: #333;
  border: 1px solid #555;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
}
.texture-card:hover {
  border-color: #007acc;
  box-shadow: 0 0 0 2px #007acc;
  transform: translateY(-2px);
}
.card-preview {
  width: 100%;
  height: 80px;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  background: #444;
}
.card-info {
  padding: 10px 8px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card-name {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #aaa;
}
.card-resolution {
  color: #81d4fa;
}
.card-size {
  color: #aaa;
}
.empty-tip {
  width: 100%;
  text-align: center;
  color: #aaa;
  font-size: 15px;
  margin-top: 32px;
}
</style>
