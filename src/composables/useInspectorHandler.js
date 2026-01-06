/**
 * 检查器处理组合式函数
 */
import { h, render } from 'vue';
import { ElMessageBox } from 'element-plus'
import { useThreeViewer, removeObjectFromScene, addObject } from '@/composables/useThreeViewer.js';
import { useObjectSelection } from '@/composables/useObjectSelection.js';
import { useEventBus } from '@/composables/useEventBus.js';

import UserDataPopup from '@/components/dialog/UserDataPopup.vue';

const viewerRef = useThreeViewer();
const objectSelection = useObjectSelection();
const eventBus = useEventBus();

/**
 * 对象弹窗
 */
export function handlePopup(object) {
    if(object.openPopupWindow) {
        // 弹窗
        // 创建vnode
        // Use Vue's render function to create the content
        // See https://vuejs.org/guide/extras/render-function.html#render-functions-jsx
        //      Supports: emit, slots, props, attrs, see onRemove event below
        const vnode = h(
          UserDataPopup,
          { 
            object: object,
              onClose: () => {
              object.closePopupWindow();
            }
          },
          
        )
        
        let div = document.createElement('div');
        render(vnode, div);
        
        object.openPopupWindow({content: div})
    }
}

/**
 * 聚焦对象
 */
export function handleFocus(object) {
    let viewer = viewerRef.value;
    if(!viewer || !object) return;

    objectSelection.selectObject(object);
    viewer.flyToObject3D(object, {duration: 0.5});

    // 弹窗
    handlePopup(object);
}

/**
 * 锁定/解锁对象
 */
export function handleLock(objects) {
    let viewer = viewerRef.value;
    if(!viewer || !objects) return;
    
    if(!Array.isArray(objects)) objects = [objects];
        
    objects.forEach(obj => {
        obj.userData.locked = !obj.userData.locked;
        eventBus.emit('lock-changed', obj);
    });
}

export function handleVisible(objects) {
    let viewer = viewerRef.value;
    if(!viewer || !objects) return;
    
    if(!Array.isArray(objects)) objects = [objects];

    objects.forEach(obj => {
        obj.visible = !obj.visible;
        eventBus.emit('visibility-changed', obj);
    });
}

/**
 * 删除对象
 */
export function handleDelete(objects) {
    let viewer = viewerRef.value;
    if(!viewer || !objects) return;
    
    if(!Array.isArray(objects)) objects = [objects];
    
    ElMessageBox.confirm('确定要删除选中的对象吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 从场景中移除对象
        if(!Array.isArray(objects)) objects = [objects];
        objects.forEach(obj => {
            removeObjectFromScene(obj);
        });
        
        objectSelection.clearSelection();
    });
}

/**
 * 复制对象
 */
export function handleDuplicate(objects) {
    if(!Array.isArray(objects)) objects = [objects];

    objects.forEach((obj) => {
        const clone = obj.clone();
        clone.position.x += 1 + Math.random(); // 简单偏移以示区别
        clone.position.z += 1 + Math.random();
        addObject(clone);
    });
    objectSelection.clearSelection();
}