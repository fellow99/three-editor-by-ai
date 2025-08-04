/**
 * 数学工具函数
 * 提供3D编辑器中常用的数学计算功能
 */

import * as THREE from 'three';

/**
 * 角度转弧度
 * @param {number} degrees 角度值
 * @returns {number} 弧度值
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * 弧度转角度
 * @param {number} radians 弧度值
 * @returns {number} 角度值
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * 限制数值在指定范围内
 * @param {number} value 输入值
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 限制后的值
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 线性插值
 * @param {number} a 起始值
 * @param {number} b 结束值
 * @param {number} t 插值因子 (0-1)
 * @returns {number} 插值结果
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 计算两点间距离
 * @param {THREE.Vector3} point1 点1
 * @param {THREE.Vector3} point2 点2
 * @returns {number} 距离
 */
export function distance(point1, point2) {
  return point1.distanceTo(point2);
}

/**
 * 计算两个向量的夹角
 * @param {THREE.Vector3} vec1 向量1
 * @param {THREE.Vector3} vec2 向量2
 * @returns {number} 夹角（弧度）
 */
export function angleBetween(vec1, vec2) {
  return vec1.angleTo(vec2);
}

/**
 * 生成随机数范围
 * @param {number} min 最小值
 * @param {number} max 最大值
 * @returns {number} 随机数
 */
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 将世界坐标转换为屏幕坐标
 * @param {THREE.Vector3} worldPosition 世界坐标
 * @param {THREE.Camera} camera 相机
 * @param {number} width 屏幕宽度
 * @param {number} height 屏幕高度
 * @returns {THREE.Vector2} 屏幕坐标
 */
export function worldToScreen(worldPosition, camera, width, height) {
  const vector = worldPosition.clone();
  vector.project(camera);
  
  vector.x = (vector.x + 1) / 2 * width;
  vector.y = -(vector.y - 1) / 2 * height;
  
  return new THREE.Vector2(vector.x, vector.y);
}

/**
 * 将屏幕坐标转换为世界坐标
 * @param {number} x 屏幕X坐标
 * @param {number} y 屏幕Y坐标
 * @param {THREE.Camera} camera 相机
 * @param {number} width 屏幕宽度
 * @param {number} height 屏幕高度
 * @param {number} depth 深度值 (默认0.5)
 * @returns {THREE.Vector3} 世界坐标
 */
export function screenToWorld(x, y, camera, width, height, depth = 0.5) {
  const vector = new THREE.Vector3();
  vector.x = (x / width) * 2 - 1;
  vector.y = -(y / height) * 2 + 1;
  vector.z = depth;
  
  vector.unproject(camera);
  return vector;
}

/**
 * 计算包围盒中心点
 * @param {THREE.Box3} boundingBox 包围盒
 * @returns {THREE.Vector3} 中心点
 */
export function getBoundingBoxCenter(boundingBox) {
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  return center;
}

/**
 * 计算包围盒尺寸
 * @param {THREE.Box3} boundingBox 包围盒
 * @returns {THREE.Vector3} 尺寸
 */
export function getBoundingBoxSize(boundingBox) {
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  return size;
}
