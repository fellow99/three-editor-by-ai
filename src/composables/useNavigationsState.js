/**
 * 漫游列表状态组合式函数
 */
import { reactive } from 'vue';

import { getCameraPos } from './useCameraPosState';
/**
 * 漫游列表状态
 */
const navigationsState = reactive({
  navigations: []
});

export function useNavigationsState() {
  return navigationsState;
}

export function addNavigation(name, checkpoints) {
  navigationsState.navigations = navigationsState.navigations || [];
  navigationsState.navigations.push({ name, checkpoints });
}

export function removeNavigation(index) {
  navigationsState.navigations = navigationsState.navigations || [];
  navigationsState.navigations.splice(index, 1);
}

export function clearNavigations() {
  navigationsState.navigations = navigationsState.navigations || [];
  navigationsState.navigations.length = 0;
}

export function addNavigationCheckpoint(name) {
  let nav = navigationsState.navigations.find(n => n.name === name);
  if (!nav) {
    throw new Error(`Navigation ${name} not found`);
  }
  let pos = getCameraPos();

  nav.checkpoints.push({ name, ...pos });
}

export function removeNavigationCheckpoint(name, index) {
  let nav = navigationsState.navigations.find(n => n.name === name);
  if (!nav) {
    throw new Error(`Navigation ${name} not found`);
  }
  nav.checkpoints.splice(index, 1);
}

export function clearNavigationCheckpoints(name) {
  let nav = navigationsState.navigations.find(n => n.name === name);
  if (!nav) {
    throw new Error(`Navigation ${name} not found`);
  }
  nav.checkpoints = [];
}