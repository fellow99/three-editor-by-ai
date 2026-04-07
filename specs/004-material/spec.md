# 004-Material 材质系统模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

材质系统模块负责 Three.js 材质的创建、编辑、管理和应用，提供多种材质类型支持和实时参数调节。

### 1.2 模块职责

- **材质创建**: 支持 5 种材质类型
- **材质编辑**: 颜色、纹理、参数调节
- **材质管理**: 材质库、材质缓存
- **材质应用**: 单对象/多对象应用

### 1.3 支持的材质类型

| 材质类型 | 用途 | 特点 |
|----------|------|------|
| MeshBasicMaterial | 基础材质 | 不受光照影响 |
| MeshStandardMaterial | 标准材质 | 物理渲染 |
| MeshPhongMaterial | Phong 材质 | 高光反射 |
| MeshLambertMaterial | Lambert 材质 | 漫反射 |
| MeshPhysicalMaterial | 物理材质 | 高级 PBR |

---

## 2. useMaterial 组合式函数

### 2.1 组件概述

**函数名**: `useMaterial`  
**文件**: `src/composables/useMaterial.js`  
**大小**: 约 550 行

### 2.2 核心功能

#### 2.2.1 材质创建

```javascript
function createMaterial(type, params = {}) {
  let material;
  
  switch (type) {
    case 'MeshBasicMaterial':
      material = new THREE.MeshBasicMaterial(params);
      break;
    case 'MeshStandardMaterial':
      material = new THREE.MeshStandardMaterial({
        roughness: 0.5,
        metalness: 0.5,
        ...params
      });
      break;
    // ... 其他材质类型
  }
  
  return material;
}
```

#### 2.2.2 材质参数编辑

**支持调节的参数**:

| 参数组 | 参数 | 范围 | 说明 |
|--------|------|------|------|
| 基础 | color | hex | 基础颜色 |
| 基础 | transparent | boolean | 透明度启用 |
| 基础 | opacity | 0-1 | 不透明度 |
| Standard | roughness | 0-1 | 粗糙度 |
| Standard | metalness | 0-1 | 金属度 |
| Physical | clearcoat | 0-1 | 清漆强度 |
| Physical | transmission | 0-1 | 透射 |

```javascript
function updateMaterial(material, params) {
  Object.keys(params).forEach(key => {
    if (key === 'color') {
      material.color.set(params[key]);
    } else if (key in material) {
      material[key] = params[key];
    }
  });
  material.needsUpdate = true;
}
```

#### 2.2.3 纹理管理

**纹理槽位**:
- map - 漫反射贴图
- normalMap - 法线贴图
- roughnessMap - 粗糙度贴图
- metalnessMap - 金属度贴图
- emissiveMap - 自发光贴图
- aoMap - 环境光遮蔽贴图

```javascript
function setTexture(material, slot, texture) {
  if (!(slot in material)) {
    throw new Error(`Invalid texture slot: ${slot}`);
  }
  material[slot] = texture;
  material.needsUpdate = true;
}
```

---

### 2.3 API 接口

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `createMaterial(type, params)` | type: string, params: Object | Material | 创建材质 |
| `updateMaterial(material, params)` | material: Material, params: Object | void | 更新材质 |
| `cloneMaterial(material)` | material: Material | Material | 克隆材质 |
| `setTexture(material, slot, texture)` | material: Material, slot: string, texture: Texture | void | 设置纹理 |
| `disposeMaterial(material)` | material: Material | void | 释放材质 |

---

## 3. 材质编辑 UI

### 3.1 MaterialPropertyPane 组件

**文件**: `src/components/property/MaterialPropertyPane.vue`

**功能**:
- 材质类型选择
- 颜色选择器
- 滑块参数调节
- 纹理槽位管理

### 3.2 高级材质编辑

**MaterialPropertyPaneAdv 组件**:
- 分面板编辑（基础、颜色、金属度、法线等）
- 实时预览
- 参数重置

---

## 4. 使用示例

```javascript
import { useMaterial } from './composables/useMaterial.js';

const { createMaterial, updateMaterial, setTexture } = useMaterial();

// 创建标准材质
const material = createMaterial('MeshStandardMaterial', {
  color: '#ff0000',
  roughness: 0.5,
  metalness: 0.5
});

// 更新参数
updateMaterial(material, {
  roughness: 0.8,
  metalness: 0.2
});

// 应用纹理
const texture = await loadTexture('/textures/brick.jpg');
setTexture(material, 'map', texture);

// 应用到对象
mesh.material = material;
```

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [资源管理模块](../002-assets/spec.md)

---

**版本**: 1.0 | **日期**: 2026-04-07
