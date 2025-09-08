<!--
  设备列表组件
  用于显示某站点的所有设备信息。
  - 顶部通过el-select实现线路-站点级联选择，数据来源src/constants/AllStationInfo.json。
  - 选择站点后，调用equipment-service.js的list函数获取设备，按lineName=>stationName=>stationSpaceName=>stationSubSpaceName用el-tree展示。
  - 使用Vue3 <script setup>语法，所有ref/shallowRef变量均加注释。
  - 每个函数顶部添加必要注释。
  - 通过instanceof判断实例类型。
  - 依赖element-plus。
  - 文件顶部注明新语法：<script setup>、ref、async/await、解构赋值。
-->

<script setup>
/**
 * 该组件用于显示某站点的所有设备信息。
 * 新语法：<script setup>、ref、async/await、解构赋值。
 */
import { ref } from 'vue';
import { ElCascader, ElTree, ElMessage } from 'element-plus';
import equipmentService from '../../services/equipment-service.js';
import allStationInfo from '../../constants/AllStationInfo.json';

const stationData = ref(formatCascaderOptions(allStationInfo)); // 用于级联选择的数据

// 当前选中的站点信息，ref变量
const selectedStation = ref(null); // { lineName, stationName }

// 当前设备树数据，ref变量
const equipmentTreeData = ref([]); // el-tree数据

// 是否正在加载设备，ref变量
const loading = ref(false);

// 级联选择器选项，格式转换
function formatCascaderOptions(raw) {
  // raw为AllStationInfo.json对象
  if (!raw || !raw.lineName || !raw.stations) return [];
  return [
    {
      value: raw.lineName,
      label: raw.lineName,
      children: raw.stations.map(st => ({
        value: st.stationName,
        label: st.stationName
      }))
    }
  ];
}


/**
 * 级联选择变化时回调，更新selectedStation并加载设备
 * @param {Array} val [lineName, stationName]
 */
async function handleStationChange(val) {
  if (!val || val.length < 2) {
    clearEquipmentList();
  } else {
    selectedStation.value = { lineName: val[0], stationName: val[1] };
    await loadEquipmentList();
  }
}

function clearEquipmentList() {
  selectedStation.value = null;
  equipmentTreeData.value = [];
}

/**
 * 加载当前站点的设备信息，并转换为树结构
 */
async function loadEquipmentList() {
  if (!selectedStation.value || !selectedStation.value.stationName) return;
  loading.value = true;
  try {
    const list = await equipmentService.list({ stationName: selectedStation.value.stationName });
    equipmentTreeData.value = buildEquipmentTree(list);
  } catch (e) {
    ElMessage.error('设备信息加载失败');
    equipmentTreeData.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 将设备列表转换为el-tree需要的树结构
 * @param {Array} list
 * @returns {Array}
 */
function buildEquipmentTree(list) {
  // 按lineName=>stationName=>stationSpaceName=>stationSubSpaceName分组
  const tree = [];
  const lineMap = new Map();
  for (const item of list) {
    let lineNode = lineMap.get(item.lineName);
    if (!lineNode) {
      lineNode = { label: item.lineName, children: [], value: item.lineName };
      lineMap.set(item.lineName, lineNode);
      tree.push(lineNode);
    }
    let stationNode = lineNode.children.find(n => n.label === item.stationName);
    if (!stationNode) {
      stationNode = { label: item.stationName, children: [], value: item.stationName };
      lineNode.children.push(stationNode);
    }
    let spaceNode = stationNode.children.find(n => n.label === item.stationSpaceName);
    if (!spaceNode) {
      spaceNode = { label: item.stationSpaceName, children: [], value: item.stationSpaceName };
      stationNode.children.push(spaceNode);
    }
    let subSpaceNode = spaceNode.children.find(n => n.label === item.stationSubSpaceName);
    if (!subSpaceNode) {
      subSpaceNode = { label: item.stationSubSpaceName, children: [], value: item.stationSubSpaceName };
      spaceNode.children.push(subSpaceNode);
    }
    // 设备节点
    subSpaceNode.children.push({
      label: item.name,
      value: item.uniqueId,
      data: item // 可用于后续扩展
    });
  }
  return tree;
}

</script>

<template>
  <div class="equipment-list">
    <!-- 顶部级联选择器 -->
    <div class="equipment-list__selector">
      站点：
      <el-cascader
        :options="stationData"
        :props="{ expandTrigger: 'hover' }"
        placeholder="请选择线路和站点"
        @change="handleStationChange"
        @clear="clearEquipmentList"
        clearable
      />
    </div>
    <!-- 设备树 -->
    <el-tree
      v-loading="loading"
      :data="equipmentTreeData"
      node-key="value"
      :props="{ label: 'label', children: 'children' }"
      default-expand-all
      highlight-current
      class="equipment-list__tree"
      style="margin-top: 16px"
    />
  </div>
</template>

<style scoped>
.equipment-list {
  padding: 8px;
  background: #232323;
  color: #e0e0e0;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.equipment-list__selector {
  margin-bottom: 8px;
}
.equipment-list__tree {
  flex: 1;
  overflow: auto;
  background: #232323;
}
</style>
