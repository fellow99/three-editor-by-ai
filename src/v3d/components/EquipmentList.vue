<!--
  设备列表组件
  用于显示某站点的所有设备信息。
  - 顶部通过el-cascader实现线路-站点级联选择，数据来源src/services/device-service.js的lineList接口。
  - 选择站点后，调用equipment-service.js的list函数获取设备，按lineName=>stationName=>stationSpaceName=>stationSubSpaceName用el-tree展示。
  - 本组件已适配lineList接口返回的新结构。
-->

<script setup>
/**
 * 该组件用于显示某站点的所有设备信息。
 */
import { ref, watch, onMounted, nextTick } from 'vue';
import { ElCascader, ElTree, ElMessage, ElMessageBox } from 'element-plus';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import { useScene } from '@/composables/useScene.js';

const scene = useScene();
const objectSelection = useObjectSelection();

// 引入智慧车站设备组合函数，统一管理设备相关状态与操作
import useV3D from '../composables/useV3D.js';
const { selectedStation, equipmentList, systemDeviceKlass } = useV3D();

const treeType = ref('space'); // 设备树类型，'space'按空间位置，'klass'按系统分类


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
 * 搜索关键字不区分大小写
 * 新语法：使用String.prototype.toLowerCase()实现不区分大小写的模糊匹配
 */
function handleSearch() {
  // 清空上次结果
  searchResults.value = [];
  const keyword = searchKeyword.value.trim().toLowerCase();
  if (!keyword) return;
  // 递归遍历设备树，收集匹配节点
  function searchTree(nodes) {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      // 只匹配设备节点（有data属性），不区分大小写
      if (node.data && node.label && node.label.toLowerCase().includes(keyword)) {
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
 * 监听selectedStation变化，自动加载设备列表
 */
watch(equipmentList, async () => {
  clear();
  await loadEquipmentListWrapper();
});

/**
 * 重置本地树和搜索状态
 */
function clear() {
  searchKeyword.value = '';
  searchResults.value = [];
}

/**
 * 包装加载设备列表，加载后构建本地树
 */
/**
 * 包装加载设备列表，加载后构建本地树，并同步加载系统设备分类
 */
async function loadEquipmentListWrapper() {
  if (!selectedStation.value || !selectedStation.value.stationName) return;
  loading.value = true;
  try {
    // 按空间位置构建设备树
    equipmentTreeData.value = buildEquipmentTreeBySpace(equipmentList.value);
  } catch (e) {
    console.error('加载设备列表失败', e);
    equipmentTreeData.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 按空间位置构建设备树
 * @param {Array} list
 * @returns {Array}
 */
function buildEquipmentTreeBySpace(list) {
  // 按stationSpaceName=>stationSubSpaceName分组
  const tree = [];
  for (const item of list) {
    let spaceNode = tree.find(n => n.label === item.stationSpaceName);
    if (!spaceNode) {
      spaceNode = { label: item.stationSpaceName, children: [], value: item.stationSpaceName };
      tree.push(spaceNode);
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
 * 按系统分类构建设备树
 * - 一级：systemDeviceKlass（系统）
 * - 二级：deviceKlassList（设备分类）
 * - 三级：设备（equipmentList，equipmentType与二级分类name关联）
 */
function buildEquipmentTreeByKlass(list) {
  // systemDeviceKlass结构：[{id, name, description, status, deviceKlassList:[{id, systemId, lineId, name, ...}]}]
  if (!Array.isArray(systemDeviceKlass.value)) return [];
  const tree = [];
  for (const sys of systemDeviceKlass.value) {
    // 一级节点：系统
    const sysNode = {
      label: sys.name,
      value: sys.id,
      children: [],
      data: sys
    };
    // 二级节点：设备分类
    if (Array.isArray(sys.deviceKlassList)) {
      for (const klass of sys.deviceKlassList) {
        const klassNode = {
          label: klass.name,
          value: klass.id,
          children: [],
          data: klass
        };
        // 三级节点：设备，equipmentType需与klass.name关联
        const devices = list.filter(
          eq => eq.equipmentType === klass.name
        );
        for (const eq of devices) {
          klassNode.children.push({
            label: eq.name,
            value: eq.uniqueId,
            data: eq
          });
        }
        // 仅有设备时才显示该分类
        if (klassNode.children.length > 0) {
          sysNode.children.push(klassNode);
        }
      }
    }
    // 仅有分类时才显示该系统
    if (sysNode.children.length > 0) {
      tree.push(sysNode);
    }
  }
  return tree;
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

function changTreeType() {
  if (treeType.value === 'space') {
    equipmentTreeData.value = buildEquipmentTreeBySpace(equipmentList.value);
  } else if (treeType.value === 'klass') {
    equipmentTreeData.value = buildEquipmentTreeByKlass(equipmentList.value);
  }
}
</script>

<template>
  <div class="equipment-list">
    <!-- 站点选择与布点功能已迁移到StationToSceneDialog -->
    <div class="station__search">
      <el-input v-model="searchKeyword" clearable placeholder="搜索设备" style="width: 200px" @keyup.enter="handleSearch" />
      &nbsp;
      <el-button @click="handleSearch">搜索</el-button>
    </div>
    <div v-show="!searchKeyword" class="station__tree-type">
      <el-radio-group v-model="treeType" size="small" @change="changTreeType">
        <el-radio label="space">按空间位置</el-radio>
        <el-radio label="klass">按系统分类</el-radio>
      </el-radio-group>
    </div>

    <!-- 设备树 -->
    <el-tree
      v-show="!searchKeyword"
      v-loading="loading"
      :data="equipmentTreeData"
      node-key="value"
      :props="{ label: 'label', children: 'children' }"
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
