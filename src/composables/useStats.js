/**
 * 场景统计信息组合式函数
 */
import { useThreeViewer } from '@/composables/useThreeViewer.js';

const fpsRef = ref(0);
const frameCountRef = ref(0);

/**
 * 获取场景统计信息
 * @returns {object} 统计信息
 */
export function getSceneStats() {
  let viewerRef = useThreeViewer();
  let viewer = viewerRef.value;
  if(!viewer) return {};

  let objects = viewer.models;
  
  let vertices = 0;
  let triangles = 0;
  let materials = new Set();
  let textures = new Set();
  
  objects.forEach(object => {
    object.traverse(child => {
      if (child.geometry) {
        const positionAttribute = child.geometry.getAttribute('position');
        if (positionAttribute) {
          vertices += positionAttribute.count;
        }
        
        const index = child.geometry.getIndex();
        if (index) {
          triangles += index.count / 3;
        } else if (positionAttribute) {
          triangles += positionAttribute.count / 3;
        }
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => materials.add(mat));
        } else {
          materials.add(child.material);
        }
      }
    });
  });
  
  // 统计纹理
  materials.forEach(material => {
    Object.values(material).forEach(value => {
      if (value && value.isTexture) {
        textures.add(value);
      }
    });
  });
  
  return {
    objects: objects.length,
    vertices,
    triangles,
    materials: materials.size,
    textures: textures.size,
    fps: fpsRef.value,
    frameCount: frameCountRef.value
  };
}
