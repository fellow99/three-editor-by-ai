/**
 * 辅助对象组合式函数
 */
import { shallowRef } from 'vue';
import * as THREE from 'three';
import { useEditorConfig } from '../composables/useEditorConfig.js';
import { useThreeViewer } from '@/composables/useThreeViewer.js';

// 网格辅助线
const gridHelperRef = shallowRef(null);

// 视点辅助线
const axesHelperRef = shallowRef(null);

export function useGridHelper() {
    return gridHelperRef;
}

export function useAxesHelper() {
    return axesHelperRef;
}


export function setupGrid() {
    let viewerRef = useThreeViewer();
    let viewer = viewerRef.value;
    if(!viewer) return;
    
    let { scene } = viewer;
    const { editorConfig } = useEditorConfig();
    let gridHelper = gridHelperRef.value;
    let axesHelper = axesHelperRef.value;
    if (!gridHelper) {
        gridHelper = new THREE.GridHelper(
                editorConfig.gridSize,
                editorConfig.gridDivisions,
                new THREE.Color(editorConfig.gridColorCenterLine),
                new THREE.Color(editorConfig.gridColorGrid)
        );
        gridHelper.name = 'grid_helper';
        gridHelper.userData.id = 'grid_helper';
        scene.add(gridHelper);
        gridHelperRef.value = gridHelper;
    }
    if (!axesHelper) {
        axesHelper = new THREE.AxesHelper(editorConfig.axesSize);
        axesHelper.name = 'axes_helper';
        axesHelper.userData.id = 'axes_helper';
        scene.add(axesHelper);
        axesHelperRef.value = axesHelper;
    }
}

export function setGridVisible(visible) {
    let gridHelper = gridHelperRef.value;
    let axesHelper = axesHelperRef.value;
    if (gridHelper) {
        gridHelper.visible = visible;
    }
    if (axesHelper) {
        axesHelper.visible = visible;
    }
}
