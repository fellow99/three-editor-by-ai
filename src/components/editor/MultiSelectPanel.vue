<!--
  多对象属性批量操作面板
  - 当选中多个对象时显示，支持位置对齐、平均分布、旋转一致、等比例缩放等批量操作
-->
<script setup>
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import TransformPropertyPane from '../property/TransformPropertyPane.vue';

/**
 * 多选对象批量操作面板
 * 提供位置对齐、平均分布、旋转一致、等比例缩放等功能
 */

// 选中对象列表（ref，供面板操作）
const objectSelection = useObjectSelection();

const multiSelectBoxRef = useObjectSelection().multiSelectBoxRef;

/**
 * 对齐操作
 * @param {'x'|'y'|'z'} axis 轴
 * @param {'left'|'center'|'right'} type 对齐类型
 */
function alignPosition(axis, type) {
  let selectedObjects = objectSelection.getSelectedObjects();

  // 计算所有对象在该轴的最小/最大/中心
  const positions = selectedObjects.map(obj => obj.position[axis]);
  let target;
  if (type === 'left') target = Math.min(...positions);
  else if (type === 'right') target = Math.max(...positions);
  else if (type === 'center') target = (Math.min(...positions) + Math.max(...positions)) / 2;
  selectedObjects.forEach(obj => {
    obj.position[axis] = target;
    obj.updateMatrixWorld?.();
  });
  // 批量操作后，更新helper
  objectSelection.updateSelectedHelpers();
}

/**
 * 平均分布
 * @param {'x'|'y'|'z'} axis 轴
 */
function distributeEvenly(axis) {
  let selectedObjects = objectSelection.getSelectedObjects();
  
  // 按该轴排序
  const sorted = [...selectedObjects].sort((a, b) => a.position[axis] - b.position[axis]);
  const min = sorted[0].position[axis];
  const max = sorted[sorted.length - 1].position[axis];
  if (sorted.length <= 2 || min === max) return;
  const step = (max - min) / (sorted.length - 1);
  sorted.forEach((obj, i) => {
    obj.position[axis] = min + i * step;
    obj.updateMatrixWorld?.();
  });
  // 批量操作后，更新helper
  objectSelection.updateSelectedHelpers();
}

/**
 * 旋转一致
 * @param {'x'|'y'|'z'} axis 轴
 */
function unifyRotation(axis) {
  let selectedObjects = objectSelection.getSelectedObjects();
  
  // 取第一个对象的旋转
  const target = selectedObjects[0].rotation[axis];
  selectedObjects.forEach(obj => {
    obj.rotation[axis] = target;
    obj.updateMatrixWorld?.();
  });
  // 批量操作后，更新helper
  objectSelection.updateSelectedHelpers();
}

/**
 * 等比例缩放
 * @param {'min'|'max'} mode 最小/最大等比例
 */
function scaleUniform(mode) {
  let selectedObjects = objectSelection.getSelectedObjects();
  
  // 以每个对象的scale.x/y/z的最小/最大值为目标
  ['x', 'y', 'z'].forEach(axis => {
    const values = selectedObjects.map(obj => obj.scale[axis]);
    let target = mode === 'min' ? Math.min(...values) : Math.max(...values);
    selectedObjects.forEach(obj => {
      obj.scale[axis] = target;
      obj.updateMatrixWorld?.();
    });
  });
  // 批量操作后，更新helper
  objectSelection.updateSelectedHelpers();
}

function createSelectBox() {
  objectSelection.updateMultiSelectBox();
}
</script>

<template>
  <div class="multi-select-panel">
    <h3>多对象批量操作</h3>
    <div class="section">
      <div class="section-title">多选变换</div>
      <el-button v-if="!multiSelectBoxRef" type="primary" size="small" @click="createSelectBox">创建多选盒</el-button>
      <TransformPropertyPane v-else="multiSelectBoxRef" :selectedObject="multiSelectBoxRef" />
    </div>
    <div class="section">
      <div class="section-title">位置对齐</div>
      <div class="align-row">
        <span>X轴：</span>
        <el-button size="small" @click="alignPosition('x','left')">对齐最小</el-button>
        <el-button size="small" @click="alignPosition('x','center')">居中</el-button>
        <el-button size="small" @click="alignPosition('x','right')">对齐最大</el-button>
      </div>
      <div class="align-row">
        <span>Y轴：</span>
        <el-button size="small" @click="alignPosition('y','left')">对齐最小</el-button>
        <el-button size="small" @click="alignPosition('y','center')">居中</el-button>
        <el-button size="small" @click="alignPosition('y','right')">对齐最大</el-button>
      </div>
      <div class="align-row">
        <span>Z轴：</span>
        <el-button size="small" @click="alignPosition('z','left')">对齐最小</el-button>
        <el-button size="small" @click="alignPosition('z','center')">居中</el-button>
        <el-button size="small" @click="alignPosition('z','right')">对齐最大</el-button>
      </div>
    </div>
    <div class="section">
      <div class="section-title">平均分布</div>
      <div class="align-row">
        <el-button size="small" @click="distributeEvenly('x')">X轴平均</el-button>
        <el-button size="small" @click="distributeEvenly('y')">Y轴平均</el-button>
        <el-button size="small" @click="distributeEvenly('z')">Z轴平均</el-button>
      </div>
    </div>
    <div class="section">
      <div class="section-title">旋转一致</div>
      <div class="align-row">
        <el-button size="small" @click="unifyRotation('x')">X轴一致</el-button>
        <el-button size="small" @click="unifyRotation('y')">Y轴一致</el-button>
        <el-button size="small" @click="unifyRotation('z')">Z轴一致</el-button>
      </div>
    </div>
    <div class="section">
      <div class="section-title">等比例缩放</div>
      <div class="align-row">
        <el-button size="small" @click="scaleUniform('min')">按最小等比例</el-button>
        <el-button size="small" @click="scaleUniform('max')">按最大等比例</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.multi-select-panel {
  height: 100%;
  color: #fff;
  padding: 12px 16px;
  overflow: auto;
}
.section {
  margin-bottom: 18px;
}
.section-title {
  font-weight: bold;
  margin-bottom: 6px;
  color: #aad;
}
.align-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
h3 {
  margin-bottom: 16px;
  font-size: 18px;
  color: #fff;
}
.el-button+.el-button {
    margin-left: 0px;
}
</style>
