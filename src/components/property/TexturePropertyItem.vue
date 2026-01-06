<!--
  贴图选择面板
-->
<script setup>
import { nextTick, ref, computed, watch, defineEmits } from 'vue';
import VfsFileChooserDialog from '../dialog/VfsFileChooserDialog.vue';
import TexturePropertyPane from './TexturePropertyPane.vue';

const props = defineProps({
    texture: {
        type: Object
    }
});

const emits = defineEmits(['select-texture', 'clear-texture', 'change-texture']);

const showTextureDialog = ref(false);
const showTexturePropertyPane = ref(false);

function clearTexture() {
    emits('clear-texture');
}

function onTextureSelected(fileInfo) {
    emits('select-texture', fileInfo);
}

/**
 * 获取贴图预览图片的base64
 * @param {HTMLImageElement} image 贴图图片对象
 * @returns {string} base64字符串
 */
function getTexturePreviewSrc() {
    let image = props.texture?.image;
    if(!image)return './images/error.png';
    if(!(image instanceof Image) && !(image instanceof ImageBitmap)) return './images/error.png';

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return canvas.toDataURL();
}
</script>

<template>
    <div class="texture-property-item">
        <div v-if="texture" class="texture-preview-wrapper">
          <img :src="getTexturePreviewSrc()" alt="纹理预览" class="texture-preview-img">
          <el-button type="danger" size="small" @click="clearTexture()">清理</el-button>
          <el-popover v-model="showTexturePropertyPane" width="300" trigger="click" placement="right">
            <template #reference>
                <el-button type="primary" size="small" @click="showTexturePropertyPane = true">配置</el-button>
            </template>
            <TexturePropertyPane :texure="texture" @change-texture="emits('change-texture', $event)" />
          </el-popover>
        </div>
        <el-button v-else type="primary" size="small" @click="showTextureDialog = true">选择</el-button>
    </div>
    <VfsFileChooserDialog
      v-model="showTextureDialog"
      @select="onTextureSelected"
    />
</template>
<style lang="scss" scoped>
.texture-property-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .texture-preview-wrapper {
        position: relative;
        display: flex;
        width: 100%;
        height: 24px;

        .texture-preview-img {
            width: 24px;
            height: 24px;
            border: 1px solid #555;
            display: inline-block;
            border-radius: 4px;
        }
        .el-button {
            margin-left: 8px;
        }
    }
}
</style>