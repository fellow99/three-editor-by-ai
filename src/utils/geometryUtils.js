/**
 * 几何工具函数
 * 提供3D几何体相关的工具函数
 */

import * as THREE from 'three';

/**
 * 创建基础几何体类型枚举
 */
export const GeometryTypes = {
  BOX: 'box',
  SPHERE: 'sphere',
  CYLINDER: 'cylinder',
  PLANE: 'plane',
  CONE: 'cone',
  TORUS: 'torus'
};

/**
 * 创建盒子几何体
 * @param {number} width 宽度
 * @param {number} height 高度
 * @param {number} depth 深度
 * @returns {THREE.BoxGeometry} 盒子几何体
 */
export function createBoxGeometry(width = 1, height = 1, depth = 1) {
  return new THREE.BoxGeometry(width, height, depth);
}

/**
 * 创建球体几何体
 * @param {number} radius 半径
 * @param {number} widthSegments 宽度分段
 * @param {number} heightSegments 高度分段
 * @returns {THREE.SphereGeometry} 球体几何体
 */
export function createSphereGeometry(radius = 0.5, widthSegments = 32, heightSegments = 16) {
  return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

/**
 * 创建圆柱体几何体
 * @param {number} radiusTop 顶部半径
 * @param {number} radiusBottom 底部半径
 * @param {number} height 高度
 * @param {number} radialSegments 径向分段
 * @returns {THREE.CylinderGeometry} 圆柱体几何体
 */
export function createCylinderGeometry(radiusTop = 0.5, radiusBottom = 0.5, height = 1, radialSegments = 32) {
  return new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
}

/**
 * 创建平面几何体
 * @param {number} width 宽度
 * @param {number} height 高度
 * @param {number} widthSegments 宽度分段
 * @param {number} heightSegments 高度分段
 * @returns {THREE.PlaneGeometry} 平面几何体
 */
export function createPlaneGeometry(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
  return new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
}

/**
 * 创建圆锥几何体
 * @param {number} radius 底面半径
 * @param {number} height 高度
 * @param {number} radialSegments 径向分段
 * @returns {THREE.ConeGeometry} 圆锥几何体
 */
export function createConeGeometry(radius = 0.5, height = 1, radialSegments = 32) {
  return new THREE.ConeGeometry(radius, height, radialSegments);
}

/**
 * 创建圆环几何体
 * @param {number} radius 圆环半径
 * @param {number} tube 管道半径
 * @param {number} radialSegments 径向分段
 * @param {number} tubularSegments 管道分段
 * @returns {THREE.TorusGeometry} 圆环几何体
 */
export function createTorusGeometry(radius = 0.5, tube = 0.2, radialSegments = 16, tubularSegments = 100) {
  return new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments);
}

/**
 * 计算几何体的包围盒
 * @param {THREE.BufferGeometry} geometry 几何体
 * @returns {THREE.Box3} 包围盒
 */
export function computeBoundingBox(geometry) {
  geometry.computeBoundingBox();
  return geometry.boundingBox;
}

/**
 * 计算几何体的包围球
 * @param {THREE.BufferGeometry} geometry 几何体
 * @returns {THREE.Sphere} 包围球
 */
export function computeBoundingSphere(geometry) {
  geometry.computeBoundingSphere();
  return geometry.boundingSphere;
}

/**
 * 获取几何体的顶点数量
 * @param {THREE.BufferGeometry} geometry 几何体
 * @returns {number} 顶点数量
 */
export function getVertexCount(geometry) {
  const position = geometry.getAttribute('position');
  return position ? position.count : 0;
}

/**
 * 获取几何体的面数量
 * @param {THREE.BufferGeometry} geometry 几何体
 * @returns {number} 面数量
 */
export function getFaceCount(geometry) {
  const index = geometry.getIndex();
  if (index) {
    return index.count / 3;
  } else {
    const position = geometry.getAttribute('position');
    return position ? position.count / 3 : 0;
  }
}

/**
 * 中心化几何体（将几何体中心移动到原点）
 * @param {THREE.BufferGeometry} geometry 几何体
 * @returns {THREE.BufferGeometry} 中心化后的几何体
 */
export function centerGeometry(geometry) {
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);
  return geometry;
}

/**
 * 缩放几何体到指定尺寸
 * @param {THREE.BufferGeometry} geometry 几何体
 * @param {number} size 目标尺寸
 * @returns {THREE.BufferGeometry} 缩放后的几何体
 */
export function scaleGeometryToSize(geometry, size) {
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;
  const currentSize = new THREE.Vector3();
  boundingBox.getSize(currentSize);
  
  const maxSize = Math.max(currentSize.x, currentSize.y, currentSize.z);
  const scale = size / maxSize;
  
  geometry.scale(scale, scale, scale);
  return geometry;
}

/**
 * 合并多个几何体
 * @param {THREE.BufferGeometry[]} geometries 几何体数组
 * @returns {THREE.BufferGeometry} 合并后的几何体
 */
export function mergeGeometries(geometries) {
  return THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
}

/**
 * 创建线框几何体
 * @param {THREE.BufferGeometry} geometry 原始几何体
 * @returns {THREE.WireframeGeometry} 线框几何体
 */
export function createWireframeGeometry(geometry) {
  return new THREE.WireframeGeometry(geometry);
}

/**
 * 创建边缘几何体
 * @param {THREE.BufferGeometry} geometry 原始几何体
 * @param {number} thresholdAngle 阈值角度
 * @returns {THREE.EdgesGeometry} 边缘几何体
 */
export function createEdgesGeometry(geometry, thresholdAngle = 1) {
  return new THREE.EdgesGeometry(geometry, thresholdAngle);
}
