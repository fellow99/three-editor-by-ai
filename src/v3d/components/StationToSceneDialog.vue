<!--
  车站布点对话框组件
  用于选择线路-站点并执行布点操作。
-->

<script setup>
import { ref, watch, onMounted } from 'vue';
import { ElCascader, ElButton, ElDialog, ElMessage } from 'element-plus';
import useV3D from '../composables/useV3D.js';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import useTransform from '@/composables/useTransform.js';
import { useSceneManager } from '@/core/SceneManager.js';
import { useScene } from '@/composables/useScene.js';

const objectSelection = useObjectSelection();
const transform = useTransform();
const sceneManager = useSceneManager();
const scene = useScene();
const { selectedStation, clearEquipmentList, loadEquipmentList, loadSystemDeviceKlass, createSceneData } = useV3D();

// 对话框显示状态，父组件控制
const props = defineProps({
  modelValue: { type: Boolean, required: true }
});
const emit = defineEmits(['update:modelValue', 'sync']);

/** 站点级联选择数据 */
const stationData = ref([]); // el-cascader数据

/** 级联数据 */
const selected = ref(null);

/** 是否正在加载线路数据 */
const loading = ref(false);

/**
 * 页面初始化时加载线路-站点数据
 */
onMounted(async () => {
  loading.value = true;
  try {
    const { getLineList } = useV3D();
    const lines = await getLineList();
    stationData.value = formatCascaderOptions(lines);
  } finally {
    loading.value = false;
  }
});

/**
 * 格式化lineList接口返回的数据为el-cascader所需格式
 * @param {Array} lines
 * @returns {Array}
 */
function formatCascaderOptions(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.map(line => ({
    value: line.lineId,
    label: line.lineCn,
    children: Array.isArray(line.stations)
      ? line.stations.map(st => ({
          value: st.stationId,
          label: st.nameCn
        }))
      : []
  }));
}

/**
 * 级联选择变化时回调，更新selectedStation
 * @param {Array} val [lineId, stationId]
 */
function handleStationChange(val) {
  if (!val || val.length < 2) {
    selectedStation.value = null;
    return;
  }
  let lineId = val[0];
  let stationId = val[1];
  let line = stationData.value.find(l => l.value === lineId);
  let station = line ? line.children.find(s => s.value === stationId) : null;
  if (!line || !station) {
    ElMessage.error('未找到对应线路或站点');
    selectedStation.value = null;
    return;
  }
  selectedStation.value = {
    lineId,
    lineName: line.label,
    stationId,
    stationName: station.label
  };
}

async function handleSync() {
    // 先更新selectedStation
    handleStationChange(selected.value);

    loading.value = true;
    try {
      if (!selectedStation.value) {
        ElMessage.warning('请先选择线路和站点');
        return;
      }
      objectSelection.clearSelection();
      transform.clearHistory();

      scene.clearScene();
      scene.resetScene();

      // 清空当前设备列表和选中站点
      await clearEquipmentList();

      // 加载系统设备分类，参数可根据实际业务调整
      await loadSystemDeviceKlass();
      
      // 加载设备列表
      await loadEquipmentList();

      // 创建场景JSON
      let sceneData = createSceneData();

      // 加载场景
      await sceneManager.loadScene(sceneData);
    } catch (error) {
      console.error('布点失败:', error);
      ElMessage.error('布点失败，请重试。');
    } finally {
      loading.value = false;
    }

    emit('update:modelValue', false);
}

/**
 * 关闭对话框
 */
function handleClose() {
  emit('update:modelValue', false);
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="车站布点"
    width="400px"
    @close="handleClose"
    append-to-body
  >
    <div>
      <el-cascader
        v-model="selected"
        :options="stationData"
        :props="{ expandTrigger: 'hover' }"
        placeholder="请选择线路和站点"
        clearable
        style="width: 220px"
      />
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-loading="loading" type="primary" @click="handleSync">布点</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 车站布点对话框样式 */
</style>
