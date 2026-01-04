import ThreeViewer from '../core/ThreeViewer.js';

let instance = null;

export function useThreeViewer() {
  if (!instance) {
    instance = new ThreeViewer();
  }
  return instance;
}