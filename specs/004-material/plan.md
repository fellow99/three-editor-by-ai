# 004-Material 材质系统模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

材质系统模块负责 Three.js 材质的创建、编辑、管理和应用。

### 1.2 技术约束

- 必须支持 5 种材质类型
- 必须实现材质缓存
- 必须支持纹理贴图

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 材质创建 | 工厂模式 | 统一接口 |
| 材质缓存 | Map 存储 | 快速查找 |
| 纹理管理 | 引用计数 | 避免重复加载 |

---

## 2. 材质工厂实现

### 2.1 工厂函数

```javascript
function createMaterial(type, params = {}) {
  let material;
  
  switch (type) {
    case 'MeshBasicMaterial':
      material = new THREE.MeshBasicMaterial({
        color: params.color || 0xffffff,
        transparent: params.transparent || false,
        opacity: params.opacity || 1,
        ...params
      });
      break;
      
    case 'MeshStandardMaterial':
      material = new THREE.MeshStandardMaterial({
        color: params.color || 0xffffff,
        roughness: params.roughness ?? 0.5,
        metalness: params.metalness ?? 0.5,
        transparent: params.transparent || false,
        opacity: params.opacity || 1,
        ...params
      });
      break;
      
    case 'MeshPhongMaterial':
      material = new THREE.MeshPhongMaterial({
        color: params.color || 0xffffff,
        specular: params.specular || 0x111111,
        shininess: params.shininess ?? 30,
        transparent: params.transparent || false,
        opacity: params.opacity || 1,
        ...params
      });
      break;
      
    case 'MeshLambertMaterial':
      material = new THREE.MeshLambertMaterial({
        color: params.color || 0xffffff,
        transparent: params.transparent || false,
        opacity: params.opacity || 1,
        ...params
      });
      break;
      
    case 'MeshPhysicalMaterial':
      material = new THREE.MeshPhysicalMaterial({
        color: params.color || 0xffffff,
        roughness: params.roughness ?? 0.5,
        metalness: params.metalness ?? 0.5,
        clearcoat: params.clearcoat ?? 0,
        clearcoatRoughness: params.clearcoatRoughness ?? 0,
        transmission: params.transmission ?? 0,
        thickness: params.thickness ?? 0,
        transparent: params.transparent || false,
        opacity: params.opacity || 1,
        ...params
      });
      break;
      
    default:
      throw new Error(`不支持的材质类型：${type}`);
  }
  
  // 添加到缓存
  materialCache.set(material.uuid, material);
  
  return material;
}
```

---

## 3. 材质参数编辑

### 3.1 参数更新

```javascript
function updateMaterial(material, params) {
  const needsUpdate = [];
  
  Object.keys(params).forEach(key => {
    if (key === 'color') {
      material.color.set(params[key]);
      needsUpdate.push('color');
    } else if (key === 'emissive') {
      material.emissive.set(params[key]);
      needsUpdate.push('emissive');
    } else if (key in material) {
      const oldValue = material[key];
      material[key] = params[key];
      
      // 检查是否需要标记更新
      if (typeof oldValue !== 'function' && 
          !(oldValue instanceof THREE.Color)) {
        needsUpdate.push(key);
      }
    }
  });
  
  // 标记需要更新
  if (needsUpdate.length > 0) {
    material.needsUpdate = true;
    
    // 触发事件
    emitter.emit('material-updated', {
      material,
      changes: needsUpdate
    });
  }
}
```

### 3.2 颜色属性

```javascript
function setColor(material, property, color) {
  if (!(property in material)) {
    throw new Error(`材质没有 ${property} 属性`);
  }
  
  if (material[property] instanceof THREE.Color) {
    material[property].set(color);
  } else {
    material[property] = new THREE.Color(color);
  }
  
  material.needsUpdate = true;
}

function getColor(material, property) {
  const value = material[property];
  if (value instanceof THREE.Color) {
    return '#' + value.getHexString();
  }
  return value;
}
```

---

## 4. 纹理管理

### 4.1 纹理槽位

```javascript
const textureSlots = {
  map: '漫反射贴图',
  normalMap: '法线贴图',
  roughnessMap: '粗糙度贴图',
  metalnessMap: '金属度贴图',
  emissiveMap: '自发光贴图',
  aoMap: '环境光遮蔽贴图',
  bumpMap: '凹凸贴图',
  displacementMap: '置换贴图',
  clearcoatNormalMap: '清漆法线贴图',
  clearcoatRoughnessMap: '清漆粗糙度贴图'
};

function setTexture(material, slot, texture) {
  if (!(slot in textureSlots)) {
    throw new Error(`无效的纹理槽位：${slot}`);
  }
  
  if (!(slot in material)) {
    throw new Error(`材质不支持 ${slot} 纹理`);
  }
  
  // 释放旧纹理
  if (material[slot]) {
    material[slot].dispose();
  }
  
  // 设置新纹理
  material[slot] = texture;
  material.needsUpdate = true;
  
  // 触发事件
  emitter.emit('texture-set', {
    material,
    slot,
    texture
  });
}

function removeTexture(material, slot) {
  if (material[slot]) {
    material[slot].dispose();
    material[slot] = null;
    material.needsUpdate = true;
    
    emitter.emit('texture-removed', {
      material,
      slot
    });
  }
}
```

### 4.2 纹理参数

```javascript
function updateTextureParams(texture, params) {
  if (params.offset) {
    texture.offset.set(params.offset.x, params.offset.y);
  }
  if (params.repeat) {
    texture.repeat.set(params.repeat.x, params.repeat.y);
  }
  if (params.rotation !== undefined) {
    texture.rotation = params.rotation;
  }
  if (params.center) {
    texture.center.set(params.center.x, params.center.y);
  }
  if (params.wrap) {
    texture.wrapS = params.wrap.s || THREE.ClampToEdgeWrapping;
    texture.wrapT = params.wrap.t || THREE.ClampToEdgeWrapping;
  }
  
  texture.needsUpdate = true;
}
```

---

## 5. 材质克隆

### 5.1 克隆实现

```javascript
function cloneMaterial(material) {
  const params = {
    color: material.color?.getHex(),
    roughness: material.roughness,
    metalness: material.metalness,
    transparent: material.transparent,
    opacity: material.opacity,
    side: material.side,
    flatShading: material.flatShading,
    // ... 其他参数
  };
  
  // 复制纹理
  const textureSlots = ['map', 'normalMap', 'roughnessMap', 'metalnessMap'];
  textureSlots.forEach(slot => {
    if (material[slot]) {
      params[slot] = material[slot].clone();
    }
  });
  
  return createMaterial(material.type, params);
}
```

### 5.2 材质复制应用

```javascript
function applyMaterialToObjects(material, objects) {
  objects.forEach(obj => {
    if (obj.material) {
      // 释放旧材质
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
      
      // 应用新材质
      obj.material = material.clone();
      obj.material.needsUpdate = true;
    }
  });
}
```

---

## 6. 材质库管理

### 6.1 材质库

```javascript
const materialLibrary = reactive({
  presets: new Map(),
  custom: new Map()
});

function addPresetMaterial(name, material) {
  materialLibrary.presets.set(name, material);
}

function getMaterialPreset(name) {
  return materialLibrary.presets.get(name);
}

function getAllPresets() {
  return Array.from(materialLibrary.presets.entries()).map(([name, material]) => ({
    name,
    type: material.type,
    color: material.color?.getHex(),
    thumbnail: generateMaterialThumbnail(material)
  }));
}
```

### 6.2 预设材质

```javascript
function initDefaultPresets() {
  addPresetMaterial('默认灰色', createMaterial('MeshStandardMaterial', {
    color: 0x888888,
    roughness: 0.5,
    metalness: 0.5
  }));
  
  addPresetMaterial('金属', createMaterial('MeshStandardMaterial', {
    color: 0xffffff,
    roughness: 0.2,
    metalness: 1.0
  }));
  
  addPresetMaterial('塑料', createMaterial('MeshStandardMaterial', {
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.1
  }));
  
  addPresetMaterial('玻璃', createMaterial('MeshPhysicalMaterial', {
    color: 0xffffff,
    roughness: 0,
    metalness: 0,
    transmission: 1,
    thickness: 0.5
  }));
}
```

---

## 7. 性能优化

### 7.1 材质合并

```javascript
function mergeMaterials(materials) {
  // 检查是否可以合并
  const sameType = materials.every(m => m.type === materials[0].type);
  if (!sameType) {
    return materials; // 无法合并
  }
  
  // 创建合并后的材质
  const merged = materials[0].clone();
  
  return [merged];
}
```

### 7.2 材质释放

```javascript
function disposeMaterial(material) {
  // 释放纹理
  const textureSlots = ['map', 'normalMap', 'roughnessMap', 'metalnessMap'];
  textureSlots.forEach(slot => {
    if (material[slot]) {
      material[slot].dispose();
    }
  });
  
  // 释放材质本身
  material.dispose();
  
  // 从缓存中移除
  materialCache.delete(material.uuid);
}
```

---

## 8. 测试策略

### 8.1 单元测试

```javascript
describe('useMaterial', () => {
  test('创建材质', () => {
    const material = createMaterial('MeshStandardMaterial', {
      color: 0xff0000,
      roughness: 0.5
    });
    
    expect(material.type).toBe('MeshStandardMaterial');
    expect(material.color.getHex()).toBe(0xff0000);
  });
  
  test('材质参数更新', () => {
    const material = createMaterial('MeshStandardMaterial');
    updateMaterial(material, { roughness: 0.8 });
    
    expect(material.roughness).toBe(0.8);
  });
});
```

---

**版本**: 1.0 | **日期**: 2026-04-07
