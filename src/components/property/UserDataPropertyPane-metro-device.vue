<!--
  地铁设备专用属性编辑面板
  以表单方式上下布局展示deviceInfo各字段，支持编辑并通过emit更新父组件。
  本文件实现了线路、车站、空间、子空间的级联下拉选择，数据来源于AllStationInfo.json。
  新增用法：动态import加载JSON，级联下拉联动，ref变量注释齐全。
-->

<script setup>
import { ref, watch } from 'vue'

/** 父组件传入的地铁设备信息对象 */
const props = defineProps({
  deviceInfo: {
    type: Object,
    required: true
  }
})

/** 用于表单双向绑定的本地副本 */
const localDeviceInfo = ref({ ...props.deviceInfo })

/** 设备专业-类型数据字典 */
import majorTypeInfo from '../../constants/StationActiveMajorTypeInfo.json'

/** 专业选项 */
const majorOptions = Object.keys(majorTypeInfo)

/** 类型选项，随专业联动 */
const typeOptions = ref([])

/** 线路-车站-空间-子空间数据字典 */
import allStationInfo from '../../constants/AllStationInfo.json'

/** 线路选项（只有一条线路，仍做成数组便于扩展） */
const lineOptions = ref([
  { label: allStationInfo.lineName, value: allStationInfo.lineName }
])

/** 车站选项，随线路变化联动 */
const stationOptions = ref([])
/** 空间选项，随车站变化联动 */
const spaceOptions = ref([])
/** 子空间选项，随空间变化联动 */
const subSpaceOptions = ref([])

/** 监听线路变化，联动车站选项 */
watch(
  () => localDeviceInfo.value.lineName,
  (line) => {
    if (line === allStationInfo.lineName) {
      stationOptions.value = allStationInfo.stations.map(s => ({
        label: s.stationName,
        value: s.stationName
      }))
    } else {
      stationOptions.value = []
    }
    // 自动重置下级
    if (!stationOptions.value.some(opt => opt.value === localDeviceInfo.value.stationName)) {
      localDeviceInfo.value.stationName = ''
    }
  },
  { immediate: true }
)

/** 监听车站变化，联动空间选项 */
watch(
  () => localDeviceInfo.value.stationName,
  (stationAcronym) => {
    const station = allStationInfo.stations.find(s => s.stationName === stationAcronym)
    if (station) {
      spaceOptions.value = station.spaces.map((sp) => ({
        label: sp.spaceName,
        value: sp.spaceName
      }))
    } else {
      spaceOptions.value = []
    }
    if (!spaceOptions.value.some(opt => opt.value === localDeviceInfo.value.stationSpaceName)) {
      localDeviceInfo.value.stationSpaceName = ''
    }
  },
  { immediate: true }
)

/** 监听空间变化，联动子空间选项 */
watch(
  [() => localDeviceInfo.value.stationName, () => localDeviceInfo.value.stationSpaceName],
  ([stationName, spaceName]) => {
    const station = allStationInfo.stations.find(s => s.stationName === stationName)
    if (station) {
      const space = station.spaces.find(sp => sp.spaceName === spaceName)
      if (space) {
        subSpaceOptions.value = space.subSpaces
          .filter(sub => sub && sub.trim() !== '')
          .map(sub => ({ label: sub, value: sub }))
      } else {
        subSpaceOptions.value = []
      }
    } else {
      subSpaceOptions.value = []
    }
    if (!subSpaceOptions.value.some(opt => opt.value === localDeviceInfo.value.stationSubSpaceName)) {
      localDeviceInfo.value.stationSubSpaceName = ''
    }
  },
  { immediate: true }
)

/** 监听专业变化，联动类型选项 */
watch(
  () => localDeviceInfo.value.equipmentMajor,
  (major) => {
    typeOptions.value = majorTypeInfo[major] || []
    if (!typeOptions.value.includes(localDeviceInfo.value.equipmentType)) {
      localDeviceInfo.value.equipmentType = ''
    }
  },
  { immediate: true }
)

/** 向父组件同步更新 */
const emit = defineEmits(['update:device-info'])

/**
 * 监听props.deviceInfo变化，保持本地副本同步
 */
watch(
  () => props.deviceInfo,
  (val) => {
    localDeviceInfo.value = { ...val }
  },
  { deep: true }
)

/**
 * 表单项变更时，emit更新父组件
 */
function onFieldChange() {
  emit('update:device-info', { ...localDeviceInfo.value })
}
</script>

<template>
  <el-form
    label-width="100px"
    label-position="right"
    class="metro-device-form"
    :model="localDeviceInfo"
    size="small"
    @input="onFieldChange"
  >
    <el-form-item label="唯一ID">
      <el-input v-model="localDeviceInfo.uniqueId" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="线路名称">
      <el-select v-model="localDeviceInfo.lineName" @change="onFieldChange" placeholder="请选择线路">
        <el-option v-for="opt in lineOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="车站名称">
      <el-select v-model="localDeviceInfo.stationName" @change="onFieldChange" placeholder="请选择车站">
        <el-option v-for="opt in stationOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="空间名称">
      <el-select v-model="localDeviceInfo.stationSpaceName" @change="onFieldChange" placeholder="请选择空间">
        <el-option v-for="opt in spaceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="子空间名称">
      <el-select v-model="localDeviceInfo.stationSubSpaceName" @change="onFieldChange" placeholder="请选择子空间">
        <el-option v-for="opt in subSpaceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <el-form-item label="设备专业">
      <el-select v-model="localDeviceInfo.equipmentMajor" @change="onFieldChange" placeholder="请选择设备专业">
        <el-option v-for="major in majorOptions" :key="major" :label="major" :value="major" />
      </el-select>
    </el-form-item>
    <el-form-item label="设备类型">
      <el-select v-model="localDeviceInfo.equipmentType" @change="onFieldChange" placeholder="请选择设备类型">
        <el-option v-for="type in typeOptions" :key="type" :label="type" :value="type" />
      </el-select>
    </el-form-item>
    <el-form-item label="设备系统">
      <el-input v-model="localDeviceInfo.equipmentSystem" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="设备子类型">
      <el-input v-model="localDeviceInfo.equipmentSubType" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="设备唯一编号">
      <el-input v-model="localDeviceInfo.equipmentUniqueId" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="名称">
      <el-input v-model="localDeviceInfo.name" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="父级名称">
      <el-input v-model="localDeviceInfo.parentName" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="位置">
      <el-input v-model="localDeviceInfo.position" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="四元数">
      <el-input v-model="localDeviceInfo.quaternion" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="缩放">
      <el-input v-model="localDeviceInfo.scale" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="作者">
      <el-input v-model="localDeviceInfo.author" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="修改时间">
      <el-input v-model="localDeviceInfo.changeTime" @input="onFieldChange" />
    </el-form-item>
    <el-form-item label="用户数据">
      <el-input v-model="localDeviceInfo.userData" @input="onFieldChange" />
    </el-form-item>
  </el-form>
</template>

<style lang="scss" scoped>
.metro-device-form {
  display: flex;
  flex-direction: column;
  gap: 0;
  .el-form-item {
    margin-bottom: 8px;
  }
}
</style>
