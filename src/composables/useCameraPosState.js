/**
 * 相机状态组合式函数
 */
import { reactive } from 'vue';
import { cloneDeep } from 'lodash';
import { useThreeViewer } from '@/composables/useThreeViewer.js';
import { useControls } from '@/composables/useControls.js';
import DEFAULT_CAMERA_POS from '@/constants/DEFAULT_CAMERA_POS.json';

/**
 * 相机列表状态
 */
export const cameraPosState = reactive({
  initialPos: cloneDeep(DEFAULT_CAMERA_POS),
  currentPos: cloneDeep(DEFAULT_CAMERA_POS),
  posList: []
});

export function useCameraPosState() {
  return cameraPosState;
}


/**
 * 应用相机配置
 * 设置相机位置和目标点，并同步OrbitControls的target
 */
export function applyInitialPos() {
  const viewerRef = useThreeViewer();
  const viewer = viewerRef.value;
  if(!viewer) return;

  const currentPos = cameraPosState.currentPos;

  let { camera, controls } = viewer;
  // 设置相机位置
  if(currentPos.position) camera.position.set(...currentPos.position);
  
  // 设置相机目标
  if(currentPos.target) camera.lookAt(...currentPos.target);

  // 设置OrbitControls的target为新的位置对象
  if (currentPos.target && controls) {
    controls.target.set(...currentPos.target)
    controls.update();
  }
}

export function getCameraPos() {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;

  let { camera } = viewer;
  let controlsRef = useControls();
  let controls = controlsRef.value;

  if (!camera || !controls) return;

  let position = camera.position.toArray();
  let rotation = camera.rotation.toArray();
  let quaternion = camera.quaternion.toArray();
  let spherical = camera.spherical ? [camera.spherical.radius, camera.spherical.phi, camera.spherical.theta] : undefined;
  let target = controls.target ? controls.target.toArray() : undefined;
  return { position, rotation, quaternion, spherical, target };
}

export function addPos(name) {
  cameraPosState.posList = cameraPosState.posList || [];

  let info = getCameraPos();
  cameraPosState.posList.push({ name, ...info });
}

export function removePos(index) {
  cameraPosState.posList = cameraPosState.posList || [];
  cameraPosState.posList.splice(index, 1);
}

export function clearCameras() {
  cameraPosState.posList = cameraPosState.posList || [];
  cameraPosState.posList.length = 0;
}

export function setInitialPos() {
  cameraPosState.initialPos = getCameraPos();
}

export function updateCurrentPos() {
  cameraPosState.currentPos = getCameraPos();
}


/**
 * 切换到指定位置
 */
export function zoomToPos(pos) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;

  let { camera } = viewer;
  let controlsRef = useControls();
  let controls = controlsRef.value;

  if (!camera || !controls) return;

  // 设置相机位置
  if(pos.position)camera.position.set(...pos.position);
  if(pos.rotation)camera.rotation.set(...pos.rotation);
  if(pos.quaternion)camera.quaternion.set(...pos.quaternion);
  if(pos.spherical && camera.spherical)camera.spherical.set(...pos.spherical);
  if(pos.target)camera.lookAt(...pos.target);
  camera.updateMatrixWorld();

  // 设置controls.target
  if(pos.target && controls){
    controls.target.set(...pos.target);
    controls.update();
  }
}

/**
 * 飞到指定位置
 */
export function flyToPos(pos, duration = 1) {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return;

  let { camera } = viewer;
  let controlsRef = useControls();
  let controls = controlsRef.value;

  if (!camera || !controls) return;

  let cam = {};
  if(pos.position)cam.position = { x: pos.position[0], y: pos.position[1], z: pos.position[2] };
  if(pos.rotation)cam.rotation = { x: pos.rotation[0], y: pos.rotation[1], z: pos.rotation[2] };
  if(pos.quaternion)cam.quaternion = { x: pos.quaternion[0], y: pos.quaternion[1], z: pos.quaternion[2], w: pos.quaternion[3] };
  if(pos.spherical)cam.spherical = { radius: pos.spherical[0], phi: pos.spherical[1], theta: pos.spherical[2] };

  // 使用SceneManager的flyTo方法
  viewer.flyToView(
    cam,
    { duration, onComplete: () => {
      // 确保controls.target正确
      if(pos.target && controls)controls.target.set(...pos.target);
    }
  });
}