<!--
  材质选择面板
-->
<script setup>
import { nextTick, ref, computed, watch, defineEmits } from 'vue';
import vfsService from '@/services/vfs-service.js'
import VfsMaterialChooserDialog from '../dialog/VfsMaterialChooserDialog.vue';

const emits = defineEmits(['select-material']);

// 材质弹窗相关
/** 预置材质弹窗开关 */
const showMaterialDialog = ref(false);

async function onMaterialSelected(fileInfo) {
    showMaterialDialog.value = false;
    let { drive, path, name } = fileInfo;
    let vfs = vfsService.getVfs(drive);
    let materialInfo = await vfs.json(`${path}/${name}`);
    emits('select-material', materialInfo);
}

</script>

<template>
    <div class="material-property-item">
        <el-button type="primary" size="small" @click="showMaterialDialog = true">选择材质</el-button>
    </div>
    <VfsMaterialChooserDialog
      v-model="showMaterialDialog"
      @select="onMaterialSelected"
    />
</template>
<style lang="scss" scoped>
.material-property-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>