/**
 * 编辑器配置组合式函数
 */
import { reactive, computed, watch } from 'vue';
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
    const raw = localStorage.getItem('three-editor-config');
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
    localStorage.setItem('three-editor-config', JSON.stringify(editorConfig));
  } catch (e) {}
}

const defaultConfig = {
  controlsType: 'FlyControls',
  // FlyControls相关参数
  targetDistance: 10,
  lockY: false,
  enableKeyboard: true,
  movementSpeed: 10.0,
  rollSpeed: 0.05,
  panSpeed: 1.0,
  rotateSpeed: 1.0,
  zoomSpeed: 1.0,
  gridSize: 1000,
  gridDivisions: 100,
  gridColorCenterLine: '#666666',
  gridColorGrid: '#333333',
  axesSize: 5
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
  if (typeof params.targetDistance === 'number') editorConfig.targetDistance = params.targetDistance;
  if (typeof params.lockY === 'boolean') editorConfig.lockY = params.lockY;
  if (typeof params.enableKeyboard === 'boolean') editorConfig.enableKeyboard = params.enableKeyboard;
  if (typeof params.movementSpeed === 'number') editorConfig.movementSpeed = params.movementSpeed;
  if (typeof params.rollSpeed === 'number') editorConfig.rollSpeed = params.rollSpeed;
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
    resetEditorConfig,
    CONTROLS_OPTIONS
  };
}
