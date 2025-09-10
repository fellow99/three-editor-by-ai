// 智慧车站专用组合函数
// 本文件封装设备列表相关状态与操作，供设备列表等组件复用。
// 迁移自EquipmentList.vue，包括selectedStation、equipmentList、loadEquipmentList、clearEquipmentList、createSceneData等。

import { ref } from 'vue';
import equipmentService from '../services/equipment-service.js';
import deviceService from '../services/device-service.js';
import vfsService from '@/services/vfs-service.js';

/**
 * 当前选中的站点信息
 * @type {import('vue').Ref<{ lineId: Number, lineName: string, stationId: Number, stationName: string } | null>}
 */
const selectedStation = ref(null);

/**
 * 当前设备列表
 * @type {import('vue').Ref<Array>}
 * 保存原始设备数据
 * 结构示例：
[
  {
      "uniqueId": 88547,
      "author": "PKX",
      "changeTime": "2025-06-05 17:44:38",
      "lineName": "14号线",
      "stationName": "乐嘉路",
      "stationSpaceName": "负三层",
      "stationSubSpaceName": "站台",
      "equipmentUniqueId": "LJL.PSD.ASD.ASD203",
      "equipmentMajor": "ZTM",
      "equipmentType": "ASD",
      "equipmentSystem": "Custom",
      "name": "LJL.PSD.ASD.ASD203",
      "position": "86.34904|-12.6571|-49.20905",
      "quaternion": "0.000000|0.000000|0.000000|-1.000000",
      "scale": "0.9503896|1|1",
      "equipmentSubType": "Null",
      "parentName": "屏蔽门上",
      "userData": "NULL"
  }，
  ...
]
 */
const equipmentList = ref([]);

/**
 * systemDeviceKlass变量：存储当前系统下的设备分类列表
 * @type {import('vue').Ref<Array>}
 * 用于属性面板等组件动态下拉选择
 * 结构示例：
[
  {
      "id": 66,
      "name": "UPS",
      "description": "不间断电源系统",
      "status": 0,
      "deviceKlassList": [
          {
              "id": 14061,
              "systemId": 66,
              "lineId": 1402,
              "name": "UPS",
              "description": "UPS",
              "status": 0
          },
          ...
      ]
  },
  ...
 ]
 */
const systemDeviceKlass = ref([]); // 当前系统设备分类列表

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
  console.log('加载设备列表', equipmentList.value);
}

/**
 * 加载所有系统的设备分类
 * 1. 先获取所有系统分类（deviceKlassList无参）
 * 2. 再根据当前站点lineName，枚举每个系统调用deviceKlassList({lineId, systemId, systemName})获取设备类型
 * 3. 组织为 { 系统: [类型, ...] } 结构
 * @returns {Promise<void>}
 */
async function loadSystemDeviceKlass() {
  systemDeviceKlass.value = {};
  const lineId = selectedStation.value?.lineId;
  try {
    // 1. 获取所有系统分类
    const systemList = await deviceService.systemList();
    // 3. 枚举每个系统，获取设备类型
    const result = systemList;
    if (Array.isArray(systemList)) {
      for (const sys of systemList) {
        const systemId = sys.id;
        const systemName = sys.name;
        if (!lineId || !systemId) continue;
        let params = { lineId, systemName };
        // 获取该系统下所有设备类型
        let types = [];
        try {
          const deviceKlassList = await deviceService.deviceKlassList(params);
          sys.deviceKlassList = deviceKlassList || [];
        } catch (e) {
          // 某个系统失败不影响整体
          console.error(`加载系统${systemName}的设备分类失败`, e);
          sys.deviceKlassList = [];
        }
      }
    }
    systemDeviceKlass.value = result;
  } catch (e) {
    systemDeviceKlass.value = {};
    throw e;
  }
  console.log(systemDeviceKlass.value);
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
    "position": stringToPosition('0|0|0'),
    "rotation": stringToQuaternion('0|0|0|1'),
    "scale": stringToScale('1|1|1'),
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

    position = stringToPosition(position);
    quaternion = stringToQuaternion(quaternion);
    let rotation = quaternionToRotation(quaternion);
    scale = stringToScale(eq.scale);

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

/**
 * 获取指定线路的所有站点信息，主要用于获取站点内的空间分布
 */
async function getAllStationInfo(lineName){
  let vfs = vfsService.getVfs('vfs');
  if(!vfs) throw new Error('找不到指定虚拟文件系统：vfs');
  let path = `/${lineName}/AllStationInfo.json`;
  let json = await vfs.json(path);
  return json;
}

/**
 * 将scale转为字符串，注意要乘以100
 */
function scaleToString(scale) {
  if (Array.isArray(scale) && scale.length === 3) {
    return scale.map(v => (parseFloat(v) * 100)).join('|');
  } else if (typeof scale === 'object' && scale !== null) {
    return [scale.x, scale.y, scale.z].map(v => (parseFloat(v) * 100)).join('|');
  }
  return '';
}

/**
 * 将字符串转为scale数组，注意要除以100
 */
function stringToScale(scaleStr) {
  if (typeof scaleStr === 'string' && scaleStr.length > 0) {
    let parts = scaleStr.split('|').map(v => parseFloat(v) / 100);
    if (parts.length === 3) {
      return parts;
    }
  }
  return [1,1,1];
}

function quaternionToEuler(q) {
  let [x, y, z, w] = q;
  let ysqr = y * y;

  // roll (x-axis rotation)
  let t0 = +2.0 * (w * x + y * z);
  let t1 = +1.0 - 2.0 * (x * x + ysqr);
  let roll = Math.atan2(t0, t1);
  // pitch (y-axis rotation)
  let t2 = +2.0 * (w * y - z * x);
  t2 = t2 > +1.0 ? +1.0 : t2;
  t2 = t2 < -1.0 ? -1.0 : t2;
  let pitch = Math.asin(t2);
  // yaw (z-axis rotation)
  let t3 = +2.0 * (w * z + x * y);
  let t4 = +1.0 - 2.0 * (ysqr + z * z);  
  let yaw = Math.atan2(t3, t4);
  return [roll, pitch, yaw];
}

function eulerToQuaternion(e) {
  let [roll, pitch, yaw] = e;
  let cy = Math.cos(yaw * 0.5);
  let sy = Math.sin(yaw * 0.5);
  let cr = Math.cos(roll * 0.5);
  let sr = Math.sin(roll * 0.5);
  let cp = Math.cos(pitch * 0.5);
  let sp = Math.sin(pitch * 0.5);
  let w = cy * cr * cp + sy * sr * sp;
  let x = cy * sr * cp - sy * cr * sp;
  let y = cy * cr * sp + sy * sr * cp;
  let z = sy * cr * cp - cy * sr * sp;
  return [x, y, z, w];
}

function quaternionToRotation(q) {
  let e = quaternionToEuler(q);
  return [e[0], e[1], e[2], 'XYZ'];
}

function stringToQuaternion(str) {
  if (typeof str === 'string' && str.length > 0) {
    let parts = str.split('|').map(v => parseFloat(v));
    if (parts.length === 4) {
      return parts;
    }
  }
  return [0,0,0,1];
}

function stringToPosition(str) {
  if (typeof str === 'string' && str.length > 0) {
    let parts = str.split('|').map(v => parseFloat(v));
    if (parts.length === 3) {
      return parts;
    }
  }
  return [0,0,0];
}

/**
 * 智慧车站设备列表相关组合函数
 * 提供站点选择、设备列表加载与清空、场景数据生成等功能
 */
export default function useV3D() {
  return {
    selectedStation,
    equipmentList,
    loadEquipmentList,
    clearEquipmentList,
    createSceneData,
    getLineList,
    getAllStationInfo,
    systemDeviceKlass,      // 当前系统设备分类列表
    loadSystemDeviceKlass,   // 加载设备分类方法
    scaleToString,
    stringToScale,
    quaternionToEuler,
    quaternionToRotation,
    eulerToQuaternion,
    stringToQuaternion,
    stringToPosition,
  };
}
