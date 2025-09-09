<!--
  地铁设备专用属性编辑面板
  以表单方式上下布局展示equipmentInfo各字段，支持编辑并通过emit更新父组件。
  数据结构例子如下：
  {
      "uniqueId": 18303,
      "lineName": "7号线",
      "stationName": "大沙东",
      "stationSpaceName": "负一层",
      "stationSubSpaceName": "站厅",
      "equipmentUniqueId": "DSD.AFC.AFC.AGM3005",
      "equipmentMajor": "AFC",
      "equipmentType": "AGM1",
      "equipmentSubType": "Null",
      "equipmentSystem": "Custom",
      "parentName": "AFC",
      "name": "DSD.AFC.AFC.AGM3005",
      "position": "-47.552|0.1120542|-76.87899",
      "quaternion": "0.000000|-0.707107|0.000000|-0.707107",
      "scale": "1|1|1",
      "author": "xk",
      "changeTime": "2023-06-09 11:54:46",
      "userData": "NULL"
    }  
-->

<script setup>
import { ref, watch, computed } from 'vue'
import { useObjectSelection } from '../../composables/useObjectSelection.js'
import useV3D from '../composables/useV3D.js'
const { selectedStation, getAllStationInfo, systemDeviceKlass } = useV3D()


/** 父组件传入的地铁设备信息对象 */
const props = defineProps({
  /** 地铁设备信息对象 */
  equipmentInfo: {
    type: Object,
    required: true
  }
})

/** 直接获取当前选中对象，避免父组件高频传递，提升性能 */
const objectSelection = useObjectSelection()
const selectedObject = computed(() => {
  const arr = objectSelection.selectedObjects.value
  return arr.length === 1 ? arr[0] : null
})

/** 用于表单双向绑定的本地副本 */
const localEquipmentInfo = ref({ ...props.equipmentInfo })

/**
 * 手动获取选中对象的position/quaternion/scale，点击按钮时触发
 */
function fetchPosition() {
  const obj = selectedObject.value
  if (obj) {
    localEquipmentInfo.value.position = Array.isArray(obj.position)
      ? obj.position.join('|')
      : (typeof obj.position === 'object' && obj.position !== null)
        ? [obj.position.x, obj.position.y, obj.position.z].join('|')
        : (obj.position ?? '')
  }
}
function fetchQuaternion() {
  const obj = selectedObject.value
  if (obj) {
    localEquipmentInfo.value.quaternion = Array.isArray(obj.quaternion)
      ? obj.quaternion.join('|')
      : (typeof obj.quaternion === 'object' && obj.quaternion !== null)
        ? [obj.quaternion.x, obj.quaternion.y, obj.quaternion.z, obj.quaternion.w].join('|')
        : (obj.quaternion ?? '')
  }
}
function fetchScale() {
  const obj = selectedObject.value
  if (obj) {
    localEquipmentInfo.value.scale = Array.isArray(obj.scale)
      ? obj.scale.join('|')
      : (typeof obj.scale === 'object' && obj.scale !== null)
        ? [obj.scale.x, obj.scale.y, obj.scale.z].join('|')
        : (obj.scale ?? '')
  }
}

/** 专业选项，取所有系统分类name */
const majorOptions = computed(() => {
  if (!Array.isArray(systemDeviceKlass.value)) return [];
  return systemDeviceKlass.value.map(sys => sys.name).filter(Boolean);
});

/** 类型选项，随专业联动，取当前major的deviceKlassList.name */
const typeOptions = computed(() => {
  const major = localEquipmentInfo.value.equipmentMajor;
  if (!major || !Array.isArray(systemDeviceKlass.value)) return [];
  const sys = systemDeviceKlass.value.find(sys => sys.name === major);
  if (!sys || !Array.isArray(sys.deviceKlassList)) return [];
  return sys.deviceKlassList.map(item => item.name).filter(Boolean);
});

/** 当前选中站点的线路和车站名称 */
const lineName = computed(() => selectedStation.value?.lineName || '')
const stationName = computed(() => selectedStation.value?.stationName || '')

/** 线路-车站-空间-子空间数据字典（异步获取，随lineName变化自动更新） */
const allStationInfo = ref({})

/** 线路选项 */
const lineOptions = ref([])
/** 车站选项，随线路变化联动 */
const stationOptions = ref([])
/** 空间选项，随车站变化联动 */
const spaceOptions = ref([])
/** 子空间选项，随空间变化联动 */
const subSpaceOptions = ref([])


watch(lineName, async (val) => {
  if (val) {
    allStationInfo.value = await getAllStationInfo(val)
  } else {
    allStationInfo.value = {stations: []}
  }
  // 线路下拉选项
  lineOptions.value = [{ label: val, value: val }]
  // 车站下拉选项
  stationOptions.value = (allStationInfo.value.stations || []).map(s => ({
    label: s.stationName ?? '',
    value: s.stationName ?? ''
  }))

  // 空间下拉选项
  const station = (allStationInfo.value.stations || []).find(s => s.stationName === stationName.value)
  if (station) {
    spaceOptions.value = (station.spaces || []).map((sp) => ({
      label: sp.spaceName ?? '',
      value: sp.spaceName ?? ''
    }))
  } else {
    spaceOptions.value = []
  }

  // 子空间下拉选项
  const space = station ? (station.spaces || []).find(sp => sp.spaceName === localEquipmentInfo.value.stationSpaceName) : null
  if (space) {
    subSpaceOptions.value = (space.subSpaces || [])
      .filter(sub => typeof sub === 'string' && sub.trim() !== '')
      .map(sub => ({ label: sub, value: sub }))
  } else {
    subSpaceOptions.value = []
  }
}, { immediate: true })

/** 监听线路变化，联动车站选项（allStationInfo响应式） */
watch(
  [() => localEquipmentInfo.value.lineName, () => allStationInfo],
  ([line], _, onCleanup) => {
    stationOptions.value = (allStationInfo.value.stations || []).map(s => ({
      label: s.stationName ?? '',
      value: s.stationName ?? ''
    }))
    // if (!stationOptions.value.some(opt => opt.value === localEquipmentInfo.value.stationName)) {
    //   localEquipmentInfo.value.stationName = ''
    // }
  },
  { immediate: true }
)

/** 监听车站变化，联动空间选项（allStationInfo响应式） */
watch(
  [() => localEquipmentInfo.value.stationName, () => allStationInfo],
  ([stationName], _, onCleanup) => {
    const station = (allStationInfo.value.stations || []).find(s => s.stationName === stationName)
    if (station) {
      spaceOptions.value = (station.spaces || []).map((sp) => ({
        label: sp.spaceName ?? '',
        value: sp.spaceName ?? ''
      }))
    } else {
      spaceOptions.value = []
    }
    // if (!spaceOptions.value.some(opt => opt.value === localEquipmentInfo.value.stationSpaceName)) {
    //   localEquipmentInfo.value.stationSpaceName = ''
    // }
  },
  { immediate: true }
)

/** 监听空间变化，联动子空间选项（allStationInfo响应式） */
watch(
  [() => localEquipmentInfo.value.stationName, () => localEquipmentInfo.value.stationSpaceName, () => allStationInfo],
  ([stationName, spaceName], _, onCleanup) => {
    const station = (allStationInfo.value.stations || []).find(s => s.stationName === stationName)
    if (station) {
      const space = (station.spaces || []).find(sp => sp.spaceName === spaceName)
      if (space) {
        subSpaceOptions.value = (space.subSpaces || [])
          .filter(sub => typeof sub === 'string' && sub.trim() !== '')
          .map(sub => ({ label: sub, value: sub }))
      } else {
        subSpaceOptions.value = []
      }
    } else {
      subSpaceOptions.value = []
    }
    // if (!subSpaceOptions.value.some(opt => opt.value === localEquipmentInfo.value.stationSubSpaceName)) {
    //   localEquipmentInfo.value.stationSubSpaceName = ''
    // }
  },
  { immediate: true }
)

/** 监听专业变化，联动类型选项，若类型不在可选范围则重置 */
watch(
  () => localEquipmentInfo.value.equipmentMajor,
  (major) => {
    // if (!typeOptions.value.includes(localEquipmentInfo.value.equipmentType)) {
    //   localEquipmentInfo.value.equipmentType = ''
    // }
  },
  { immediate: true }
)

/** 向父组件同步更新 */
const emit = defineEmits(['update:equipment-info'])

/**
 * 监听props.equipmentInfo变化，保持本地副本同步
 */
watch(
  () => props.equipmentInfo,
  (val) => {
    localEquipmentInfo.value = { ...val }
  },
  { deep: true }
)

/**
 * 表单项变更时，emit更新父组件
 */
function onFieldChange() {
  emit('update:equipment-info', { ...localEquipmentInfo.value })
}
</script>

<template>
  <el-form
    label-width="100px"
    label-position="right"
    class="equipmentinfo-form"
    :model="localEquipmentInfo"
    size="small"
    @input="onFieldChange"
  >
    <el-form-item label="唯一ID">
      <el-input v-model="localEquipmentInfo.uniqueId" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="线路名称">
      <el-select v-model="localEquipmentInfo.lineName" @change="onFieldChange" placeholder="请选择线路">
        <el-option v-for="opt in lineOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="车站名称">
      <el-select v-model="localEquipmentInfo.stationName" @change="onFieldChange" placeholder="请选择车站">
        <el-option v-for="opt in stationOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="空间名称">
      <el-select v-model="localEquipmentInfo.stationSpaceName" @change="onFieldChange" placeholder="请选择空间">
        <el-option v-for="opt in spaceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="子空间名称">
      <el-select v-model="localEquipmentInfo.stationSubSpaceName" @change="onFieldChange" placeholder="请选择子空间">
        <el-option v-for="opt in subSpaceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="设备专业">
      <el-select v-model="localEquipmentInfo.equipmentMajor" @change="onFieldChange" placeholder="请选择设备专业">
        <el-option v-for="major in majorOptions" :key="major" :label="major" :value="major" />
      </el-select>
    </el-form-item>
    <el-form-item label="设备类型">
      <el-select v-model="localEquipmentInfo.equipmentType" @change="onFieldChange" placeholder="请选择设备类型">
        <el-option v-for="type in typeOptions" :key="type" :label="type" :value="type" />
      </el-select>
    </el-form-item>
    <el-form-item label="设备系统">
      <el-input v-model="localEquipmentInfo.equipmentSystem" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="设备子类型">
      <el-input v-model="localEquipmentInfo.equipmentSubType" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="设备唯一编号">
      <el-input v-model="localEquipmentInfo.equipmentUniqueId" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="名称">
      <el-input v-model="localEquipmentInfo.name" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="父级名称">
      <el-input v-model="localEquipmentInfo.parentName" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="位置">
      <el-input v-model="localEquipmentInfo.position" readonly style="width:calc(100% - 70px);display:inline-block;" />
      <el-button type="primary" size="small" style="margin-left:8px;" @click="fetchPosition">获取</el-button>
    </el-form-item>
    <el-form-item label="四元数">
      <el-input v-model="localEquipmentInfo.quaternion" readonly style="width:calc(100% - 70px);display:inline-block;" />
      <el-button type="primary" size="small" style="margin-left:8px;" @click="fetchQuaternion">获取</el-button>
    </el-form-item>
    <el-form-item label="缩放">
      <el-input v-model="localEquipmentInfo.scale" readonly style="width:calc(100% - 70px);display:inline-block;" />
      <el-button type="primary" size="small" style="margin-left:8px;" @click="fetchScale">获取</el-button>
    </el-form-item>
    <el-form-item label="作者">
      <el-input v-model="localEquipmentInfo.author" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="修改时间">
      <el-input v-model="localEquipmentInfo.changeTime" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="用户数据">
      <el-input v-model="localEquipmentInfo.userData" @input="onFieldChange" />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.equipmentinfo-form {
  display: flex;
  flex-direction: column;
  gap: 0;
  .el-form-item {
    margin-bottom: 8px;
  }
}
</style>
