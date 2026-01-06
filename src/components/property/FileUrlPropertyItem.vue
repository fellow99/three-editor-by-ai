<!--
  贴图选择面板
-->
<script setup>
import { nextTick, ref, computed, watch, defineEmits } from 'vue';
import vfsService from '@/services/vfs-service.js';
import VfsFileChooserDialog from '../dialog/VfsFileChooserDialog.vue';

const props = defineProps({
    modelValue: {
        type: String
    }
});

const valRef = computed({
    get() {
        return props.modelValue;
    },
    set(newVal) {
        emits('update:modelValue', newVal);
        emits('change', newVal);
    }
});

const emits = defineEmits(['change', 'update:modelValue']);

const showDialog = ref(false);
function onFileSelected(fileInfo) {
    if(!fileInfo) return;
    let { type, drive, path, name, url } = fileInfo;
    if(!url) {
        const vfs = vfsService.getVfs(drive);
        url = vfs.url(path + '/' + name);
    }
    valRef.value = url;
}
</script>

<template>
    <div class="texture-property-item">
        <el-input v-model="valRef" size="small" style="flex:1;" />
        &nbsp;
        <el-button type="primary" size="small" @click="showDialog = true">选择</el-button>
    </div>
    <VfsFileChooserDialog
      v-model="showDialog"
      @select="onFileSelected"
    />
</template>
<style lang="scss" scoped>
.texture-property-item {
    display: flex;
    flex-direction: row;
}
</style>