<!--
  设备列表组件
  用于显示某站点的所有设备信息。
  - 顶部通过el-select实现线路-站点级联选择，数据来源src/constants/AllStationInfo.json。
  - 选择站点后，调用equipment-service.js的list函数获取设备，按lineName=>stationName=>stationSpaceName=>stationSubSpaceName用el-tree展示。
-->

<script setup>
/**
 * 该组件用于显示某站点的所有设备信息。
 */
import { ref, watch } from 'vue';
import { ElCascader, ElTree, ElMessage, ElMessageBox } from 'element-plus';
import equipmentService from '../../services/equipment-service.js';
import allStationInfo from '../../constants/AllStationInfo.json';
import { useSceneManager } from '../../core/SceneManager.js';
import { useObjectSelection } from '../../composables/useObjectSelection.js';
import useTransform from '../../composables/useTransform.js';
import { useScene } from '../../composables/useScene.js';

const scene = useScene();
const objectSelection = useObjectSelection();
const transform = useTransform();

const stationData = ref(formatCascaderOptions(allStationInfo)); // 用于级联选择的数据

// 当前选中的站点信息，ref变量
const selectedStation = ref(null); // { lineName, stationName }

// 当前设备列表，ref变量
const equipmentList = ref([]); // 原始设备列表

// 当前设备树数据，ref变量
const equipmentTreeData = ref([]); // el-tree数据

// 是否正在加载设备，ref变量
const loading = ref(false);

/**
 * 搜索关键字，ref变量
 * 用于设备名称模糊搜索
 */
const searchKeyword = ref('');

/**
 * 搜索结果，ref变量
 * 存放搜索到的设备节点
 */
const searchResults = ref([]);

/**
 * 监听searchKeyword变化，自动搜索或恢复设备树
 */
watch(searchKeyword, (val) => {
  if (!val) {
    searchResults.value = [];
  } else {
    handleSearch();
  }
});

/**
 * 设备搜索函数
 * 根据searchKeyword递归查找设备节点，结果存入searchResults
 */
function handleSearch() {
  // 清空上次结果
  searchResults.value = [];
  const keyword = searchKeyword.value.trim();
  if (!keyword) return;
  // 递归遍历设备树，收集匹配节点
  function searchTree(nodes) {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      // 只匹配设备节点（有data属性）
      if (node.data && node.label && node.label.includes(keyword)) {
        searchResults.value.push({
          label: node.label,
          ...node.data
        });
      }
      if (node.children) searchTree(node.children);
    }
  }
  searchTree(equipmentTreeData.value);
}

/**
 * 级联选择器选项，格式转换
 */
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
  equipmentList.value = [];
  searchKeyword.value = '';
  searchResults.value = [];
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
    equipmentList.value = list; // 保存原始列表
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

/**
 * syncScene，先清空所有内容，再按照equipmentList来构建场景
 */
function syncScene() {
  ElMessageBox.confirm('确定要新建场景吗？这将清除当前所有内容。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    objectSelection.clearSelection();
    transform.clearHistory();

    scene.clearScene();
    scene.resetScene();

    // 创建场景JSON
    let sceneData = createSceneData();

    // 加载场景
    const sceneManager = useSceneManager();
    await sceneManager.loadScene(sceneData);
  })
}

/**
 * 创建场景JSON
 */
function createSceneData() {
  let { lineName, stationName } = selectedStation.value || {};
  if (!lineName || !stationName) {
    ElMessage.error('请先选择站点');
    return null;
  }
  let drive = 'vfs';

  let sceneData = {
    "objects": [],
    "lights": [
      {
        "type": "AmbientLight",
        "position": [ 0, 0, 0 ],
        "color": 4210752,
        "intensity": 10
      },
      {
        "type": "DirectionalLight",
        "position": [ 50, 50, 50 ],
        "color": 16777215,
        "intensity": 1
      }
    ],
    "camera": {
      "position": { "x": 200, "y": 200, "z": 200 },
      "target": { "x": 0, "y": 0, "z": 0 },
      "fov": 75, "near": 0.1, "far": 1000
    },
    "background": 2236962,
    "config": {
      "backgroundColor": "#222222",
      "shadowsEnabled": true,
      "toneMappingEnabled": true,
      "exposure": 1
    }
  };

  // 添加站点模型
  let station = {
    "id": stationName,
    "name": "",
    "position": [ 0, 0, 0 ],
    "rotation": [ 0, 0, 0, "XYZ" ],
    "scale": [ 0.01, 0.01, 0.01 ],
    "userData": {
      "unitScaleFactor": 1,
      "fileInfo": {
        "drive": drive,
        "path": "/" + lineName,
        "name": stationName + ".fbx",
        "type": "FILE"
      },
      "id": stationName,
      "locked": true
    }
  }
  sceneData.objects.push(station);

  // 枚举设备，添加设备模型
  for (let eq of equipmentList.value) {
    let { position, quaternion, scale } = eq;
    let { equipmentUniqueId, name, equipmentMajor, equipmentType } = eq;
    if(equipmentType != 'AGM1')continue; // 目前仅支持AGM1设备模型

    position = position ? position.split('|').map(v => parseFloat(v)) : [0,0,0];
    quaternion = quaternion ? quaternion.split('|').map(v => parseFloat(v)) : [0,0,0,1];
    scale = scale ? scale.split('|').map(v => parseFloat(v)) : [1,1,1];
    scale = scale.map(v => v * 0.01); // 设备模型缩小100倍
    let rotation = [0,0,0,'XYZ']; // 默认欧拉角

    let eqModel = {
      "id": equipmentUniqueId,
      "name": name,
      "position": position,
      "rotation": rotation,
      "scale": scale,
      "userData": {
        "fileInfo": {
          "drive": drive,
          "path": "/" + equipmentMajor,
          "name": equipmentType + ".fbx",
          "type": "FILE"
        },
        "id": equipmentUniqueId,
        "deviceInfo": eq
      }
    };
    sceneData.objects.push(eqModel);
  }

  return sceneData;
}

/**
 * 设备树节点点击事件处理
 * @param {Object} data 节点数据
 */
function handleEquipmentNodeClick(data) {
  // 只处理设备节点（有data且有equipmentUniqueId）
  if (!data || !data.equipmentUniqueId) return;
  const equipmentId = data.equipmentUniqueId;
  // 查找三维场景中的对象，userData.id等于equipmentId
  const object = scene.getObjectByProperty && scene.getObjectByProperty('userData.id', equipmentId);
  if (object) {
    objectSelection.selectObject(object);
    // 选中后再聚焦，确保聚焦目标为最新选中对象
    setTimeout(() => {
      scene.focusOnObject(object);
    }, 0);
  } else {
    ElMessage.warning('未找到对应三维对象');
  }
}
</script>

<template>
  <div class="equipment-list">
    <div class="station__selector">
      站点：
      <el-cascader
        :options="stationData"
        :props="{ expandTrigger: 'hover' }"
        placeholder="请选择线路和站点"
        @change="handleStationChange"
        @clear="clearEquipmentList"
        clearable
        style="width: 150px"
      />
      &nbsp;
      <el-button @click="syncScene">布点</el-button>
    </div>
    <div class="station__search">
      <el-input v-model="searchKeyword" placeholder="搜索设备" style="width: 200px" />
      &nbsp;
      <el-button @click="handleSearch">搜索</el-button>
      <!-- 输入框变化自动搜索，无需手动点击 -->
    </div>
    <!-- 设备树 -->
    <el-tree
      v-show="!searchKeyword || !searchResults.length"
      v-loading="loading"
      :data="equipmentTreeData"
      node-key="value"
      :props="{ label: 'label', children: 'children' }"
      default-expand-all
      highlight-current
      class="equipment-list__tree"
      style="margin-top: 16px"
      @node-click="handleEquipmentNodeClick($event.data)"
    />
    <!-- 搜索结果 -->
    <el-table
      v-show="searchKeyword && searchResults.length"
      v-loading="loading"
      :data="searchResults"
      style="margin-top: 16px"
      @row-click=""
      >
      <el-table-column prop="label" label="设备名称">
        <template #default="{ row }">
        <el-link type="primary" :underline="false" @click="handleEquipmentNodeClick(row)">{{ row.equipmentUniqueId }}</el-link>
        <br/>
        {{ row.equipmentMajor }} / {{ row.equipmentType }} / {{ row.equipmentSystem }}
        <br/>
        {{ row.stationSpaceName }} / {{ row.stationSubSpaceName }}
        </template>
      </el-table-column>
    </el-table>
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
.station__selector {
  margin-bottom: 8px;
}
.equipment-list__tree {
  flex: 1;
  overflow: auto;
  background: #232323;
}
</style>
