// 智慧车站专用组合函数
// 本文件封装设备列表相关状态与操作，供设备列表等组件复用。
// 迁移自EquipmentList.vue，包括selectedStation、equipmentList、loadEquipmentList、clearEquipmentList、createSceneData等。

import { ref } from 'vue';
import equipmentService from '../services/equipment-service.js';
import deviceService from '../services/device-service.js';

/**
 * 智慧车站设备列表相关组合函数
 * 提供站点选择、设备列表加载与清空、场景数据生成等功能
 */
export default function useV3D() {
  /**
   * 当前选中的站点信息
   * @type {import('vue').Ref<{ lineName: string, stationName: string } | null>}
   */
  const selectedStation = ref(null); // { lineName, stationName }

  /**
   * 当前设备列表
   * @type {import('vue').Ref<Array>}
   * 保存原始设备数据
   */
  const equipmentList = ref([]);

  /**
   * 清空设备列表及选中站点
   * 用于切换站点或重置
   */
  function clearEquipmentList() {
    selectedStation.value = null;
    equipmentList.value = [];
  }

  /**
   * 加载当前站点的设备信息
   * @returns {Promise<void>}
   */
  async function loadEquipmentList() {
    if (!selectedStation.value || !selectedStation.value.stationName) return;
    try {
      const list = await equipmentService.list({ stationName: selectedStation.value.stationName });
      equipmentList.value = list;
    } catch (e) {
      equipmentList.value = [];
      throw e;
    }
  }

  /**
   * 创建场景JSON数据
   * @returns {Object|null}
   */
  function createSceneData() {
    let { lineName, stationName } = selectedStation.value || {};
    if (!lineName || !stationName) {
      throw new Error('请先选择站点');
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
      if (typeof equipmentType !== 'string' || equipmentType.indexOf('AGM') !== 0) continue; // 仅支持AGM1设备模型

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
          "equipmentInfo": eq
        }
      };
      sceneData.objects.push(eqModel);
    }

    return sceneData;
  }

  /**
   * 获取线路-站点数据
   * @returns {Promise<void>}
   */
  async function getLineList() {
    const lines = await deviceService.lineList();
    return lines;
  }

  return {
    selectedStation,
    equipmentList,
    getLineList,
    loadEquipmentList,
    clearEquipmentList,
    createSceneData
  };
}
