import { watch } from 'vue';
import * as THREE from 'three';
import ThreeViewer from '../core/ThreeViewer.js';
import { useEditorConfig } from '../composables/useEditorConfig.js';
import { useObjectManager } from '../composables/useObjectManager.js';
import { useObjectSelection } from '../composables/useObjectSelection.js';
import { useAssetsManager } from '../composables/useAssetsManager.js';
import { axesLockState } from '../composables/useAxesLockState.js';

let threeViewer = null;

function initThreeViewer(threeViewer) {
  if (threeViewer) return threeViewer;

  // 新增：监听Y轴锁定状态，动态调整gridHelper位置和颜色
  watch(
    axesLockState,
    (state) => {
      if (!threeViewer.gridHelper) return;
      let gridHelper = threeViewer.gridHelper;
      if (state.locked) {
        // 锁定时，设置y轴位置和颜色为黄色
        gridHelper.position.y = state.yValue;
        // 线条全部变为黄色
        const yellow = new THREE.Color(0xffff00);
        if (this.gridHelper.material) {
          gridHelper.material._originalColor = gridHelper.material.color ? gridHelper.material.color.clone() : null;
          gridHelper.material.color && gridHelper.material.color.copy(yellow);
        }
      } else {
        // 解锁时，恢复y=0和原色
        gridHelper.position.y = 0;
        const { editorConfig } = useEditorConfig();
        const centerColor = new THREE.Color(editorConfig.gridColorCenterLine);
        const gridColor = new THREE.Color(editorConfig.gridColorGrid);
        if (gridHelper.material && gridHelper.material._originalColor) {
          gridHelper.material.color.copy(gridHelper.material._originalColor);
          delete gridHelper.material._originalColor;
        }
      }
    },
    { deep: true, immediate: true }
  );
}

export function useThreeViewer() {
  if(!threeViewer) {
    const objectManager = useObjectManager();
    const objectSelection = useObjectSelection();
    const assetsManager = useAssetsManager();
    const options = {
      objectManager,
      objectSelection,
      assetsManager
    };
    threeViewer = new ThreeViewer(options);
    initThreeViewer(threeViewer);
  }
  return threeViewer;
}