/**
 * 控制器状态组合式函数
 */
import { shallowRef, reactive } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { FlyControls } from '../controls/FlyControls.js';
import { useThreeViewer } from './useThreeViewer.js';
import { useEditorConfig } from './useEditorConfig.js';

const controlsRef = shallowRef(null);

const controlsLockState = reactive({
  locked: false
});


export function useControls() {
  return controlsRef;
}

export function useControlsLockState() {
  return controlsLockState;
}


export function updateControlsConfig(config) {
  let controls = controlsRef.value;
  if (!controls) return;

  Object.entries(config).forEach(([key, value]) => {
    if (controls.hasOwnProperty(key)) {
      controls[key] = value;
    }
  });
  controls.update();
}


export function switchControls(type) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;
  
  let { camera, renderer } = viewer;
  let controls = controlsRef.value;
  let lastTarget = null;
  if (controls && controls.target) {
    lastTarget = controls.target.clone();
  }
  if (controls) {
    controls.dispose && controls.dispose();
    controls = null;
  }
  if (!camera || !renderer) return;
  if (type === 'OrbitControls') {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI;
  } else if (type === 'MapControls') {
    controls = new MapControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 1;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI;
  } else if (type === 'FlyControls') {
    const { editorConfig } = useEditorConfig();
    controls = new FlyControls(camera, renderer.domElement, editorConfig.targetDistance);
    controls.lockY = editorConfig.lockY;
    controls.movementSpeed = editorConfig.movementSpeed;
    controls.rollSpeed = editorConfig.rollSpeed;
    controls.panSpeed = editorConfig.panSpeed;
    controls.rotateSpeed = editorConfig.rotateSpeed;
    controls.zoomSpeed = editorConfig.zoomSpeed;
    controls.enableKeyboard = editorConfig.enableKeyboard;
    controls.autoForward = false;
    controls.dragToLook = true;
  }
  if (controls) {
    if (type !== 'FlyControls') {
      const { editorConfig } = useEditorConfig();
      controls.rotateSpeed = editorConfig.rotateSpeed;
      controls.zoomSpeed = editorConfig.zoomSpeed;
      controls.panSpeed = editorConfig.panSpeed;
    }
    if (controls.target && lastTarget) {
      controls.target.copy(lastTarget);
    } else if (controls.target) {
      controls.target.set(0, 0, 0);
    }
    controls.update && controls.update();

    setControlsLocked();

    controlsRef.value = controls;
    return controls;
  }
}


export function setControlsLocked(locked) {
  let controls = controlsRef.value;
  locked = (typeof locked === 'undefined') ? controlsLockState.locked : locked;
  controlsLockState.locked = !!locked;
  if (controlsRef.value) {
    controlsRef.value.enabled = !controlsLockState.locked;
  }
  // 强制同步controls.enabled，防止被其它逻辑覆盖
  if (controls) {
    setTimeout(() => {
      controlsRef.value.enabled = !controlsLockState.locked;
    }, 0);
  }
}

export function getControlsLocked() {
  return !!controlsLockState.locked;
}

