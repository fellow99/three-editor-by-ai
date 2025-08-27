// useEditorConfig.js
// ===========================
// 编辑器配置响应式状态与操作方法
// 提供控制器、网格、坐标轴、场景默认配置的响应式管理
// 新语法说明：使用Vue 3 Composition API（ref、reactive、computed），支持响应式对象与方法导出
// ===========================

import { ref, reactive, computed } from 'vue';

/**
 * 控制器类型选项
 */
export const CONTROLS_OPTIONS = [
  { label: 'OrbitControls', value: 'OrbitControls' },
  { label: 'MapControls', value: 'MapControls' },
  { label: 'FlyControls', value: 'FlyControls' }
];

/**
 * 编辑器配置的响应式状态
 */
/**
 * 从localStorage读取配置
 */
function loadConfigFromLocalStorage() {
  try {
    const raw = localStorage.getItem('three-editor-by-ai_editorConfig');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

/**
 * 保存配置到localStorage
 */
function saveConfigToLocalStorage() {
  try {
    localStorage.setItem('three-editor-by-ai_editorConfig', JSON.stringify(editorConfig));
  } catch (e) {}
}

const defaultConfig = {
  controlsType: 'OrbitControls',
  panSpeed: 1.0,
  rotateSpeed: 1.0,
  zoomSpeed: 1.0,
  gridSize: 1000,
  gridDivisions: 1000,
  gridColorCenterLine: '#666666',
  gridColorGrid: '#888888',
  axesSize: 5,
  sceneBgColor: '#222222'
};

const loadedConfig = loadConfigFromLocalStorage();
const editorConfig = reactive({
  ...defaultConfig,
  ...(loadedConfig || {})
});

/**
 * 获取编辑器配置的只读副本
 * @returns {object}
 */
function useEditorConfigState() {
  // 返回只读配置，防止外部直接修改
  return computed(() => ({ ...editorConfig }));
}

/**
 * 设置控制器类型
 * @param {string} type
 */
function setControlsType(type) {
  editorConfig.controlsType = type;
  saveConfigToLocalStorage();
}

/**
 * 设置控制器参数
 * @param {object} params
 */
function setControlsParams(params) {
  if (typeof params.panSpeed === 'number') editorConfig.panSpeed = params.panSpeed;
  if (typeof params.rotateSpeed === 'number') editorConfig.rotateSpeed = params.rotateSpeed;
  if (typeof params.zoomSpeed === 'number') editorConfig.zoomSpeed = params.zoomSpeed;
  saveConfigToLocalStorage();
}

/**
 * 设置网格配置
 * @param {object} params
 */
function setGridConfig(params) {
  if (typeof params.gridSize === 'number') editorConfig.gridSize = params.gridSize;
  if (typeof params.gridDivisions === 'number') editorConfig.gridDivisions = params.gridDivisions;
  if (typeof params.gridColorCenterLine === 'string') editorConfig.gridColorCenterLine = params.gridColorCenterLine;
  if (typeof params.gridColorGrid === 'string') editorConfig.gridColorGrid = params.gridColorGrid;
  saveConfigToLocalStorage();
}

/**
 * 设置坐标轴尺寸
 * @param {number} size
 */
function setAxesSize(size) {
  editorConfig.axesSize = size;
  saveConfigToLocalStorage();
}

/**
 * 设置场景背景色
 * @param {string} color
 */
function setSceneBgColor(color) {
  editorConfig.sceneBgColor = color;
  saveConfigToLocalStorage();
}

/**
 * 重置为默认配置
 */
function resetEditorConfig() {
  Object.assign(editorConfig, defaultConfig);
  saveConfigToLocalStorage();
}

export function useEditorConfig() {
  // 组合式函数，提供响应式状态与操作方法
  return {
    editorConfig,
    useEditorConfigState,
    setControlsType,
    setControlsParams,
    setGridConfig,
    setAxesSize,
    setSceneBgColor,
    resetEditorConfig,
    CONTROLS_OPTIONS
  };
}
