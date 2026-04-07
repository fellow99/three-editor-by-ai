# 007-Serialization 场景序列化模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

场景序列化模块负责 Three.js 场景的完整序列化与反序列化。

### 1.2 技术约束

- 必须支持 JSON 格式
- 必须完整序列化 userData
- 必须排除运行时对象

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 序列化格式 | JSON | 通用、可读 |
| 运行时对象 | 前缀_ | 易于识别排除 |
| 动画恢复 | 延迟加载 | 性能优化 |

---

## 2. 序列化实现

### 2.1 导出场景

```javascript
exportScene() {
  const objects = [];
  
  this.scene.traverse((obj) => {
    if (obj.type === 'Mesh' || obj.type === 'Light') {
      const objData = {
        uuid: obj.uuid,
        type: obj.type,
        name: obj.name,
        
        // 几何体
        geometry: obj.geometry ? {
          type: obj.geometry.type,
          parameters: { ...obj.geometry.parameters }
        } : null,
        
        // 材质
        material: obj.material ? this.exportMaterial(obj.material) : null,
        
        // 变换
        transform: {
          position: {
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z
          },
          rotation: {
            x: obj.rotation.x,
            y: obj.rotation.y,
            z: obj.rotation.z,
            order: obj.rotation.order
          },
          scale: {
            x: obj.scale.x,
            y: obj.scale.y,
            z: obj.scale.z
          }
        },
        
        // 可见性和阴影
        visible: obj.visible,
        castShadow: obj.castShadow,
        receiveShadow: obj.receiveShadow,
        
        // userData（过滤运行时对象）
        userData: this.filterUserData(obj.userData),
        
        // 动画（如果有）
        animations: obj.animations?.length ? obj.animations.map(anim => ({
          name: anim.name,
          duration: anim.duration
        })) : null
      };
      
      objects.push(objData);
    }
  });
  
  return JSON.stringify({
    version: '1.0',
    metadata: {
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      objectCount: objects.length,
      generator: 'Three Editor by AI'
    },
    scene: {
      background: this.scene.background ? 
        this.scene.background.getHex() : null,
      fog: this.scene.fog ? this.exportFog(this.scene.fog) : null
    },
    objects
  }, null, 2);
}
```

### 2.2 过滤 userData

```javascript
filterUserData(userData) {
  const filtered = {};
  
  for (const key in userData) {
    // 跳过运行时对象（以_开头）
    if (key.startsWith('_')) {
      continue;
    }
    
    const value = userData[key];
    
    // 跳过函数
    if (typeof value === 'function') {
      continue;
    }
    
    // 跳过 Three.js 对象
    if (value instanceof THREE.Object3D ||
        value instanceof THREE.Material ||
        value instanceof THREE.Texture) {
      continue;
    }
    
    // 深拷贝普通对象和数组
    if (typeof value === 'object' && value !== null) {
      filtered[key] = JSON.parse(JSON.stringify(value));
    } else {
      filtered[key] = value;
    }
  }
  
  return filtered;
}
```

### 2.3 材质导出

```javascript
exportMaterial(material) {
  const data = {
    type: material.type,
    uuid: material.uuid,
    name: material.name,
    
    // 基础属性
    color: material.color?.getHex(),
    transparent: material.transparent,
    opacity: material.opacity,
    side: material.side,
    
    // Standard/Physical 属性
    roughness: material.roughness,
    metalness: material.metalness,
    normalScale: material.normalScale ? {
      x: material.normalScale.x,
      y: material.normalScale.y
    } : null,
    
    // Physical 特有属性
    clearcoat: material.clearcoat,
    clearcoatRoughness: material.clearcoatRoughness,
    transmission: material.transmission,
    thickness: material.thickness,
    
    // 纹理引用
    map: material.map ? this.exportTexture(material.map) : null,
    normalMap: material.normalMap ? 
      this.exportTexture(material.normalMap) : null,
    roughnessMap: material.roughnessMap ? 
      this.exportTexture(material.roughnessMap) : null,
    metalnessMap: material.metalnessMap ? 
      this.exportTexture(material.metalnessMap) : null
  };
  
  return data;
}

exportTexture(texture) {
  return {
    uuid: texture.uuid,
    url: texture.image?.src || texture.image?.currentSrc,
    type: texture.type,
    format: texture.format,
    encoding: texture.encoding,
    wrap: {
      s: texture.wrapS,
      t: texture.wrapT
    },
    repeat: {
      x: texture.repeat.x,
      y: texture.repeat.y
    },
    offset: {
      x: texture.offset.x,
      y: texture.offset.y
    }
  };
}
```

---

## 3. 反序列化实现

### 3.1 加载场景

```javascript
async loadScene(json) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    
    // 验证数据结构
    if (!data.objects || !Array.isArray(data.objects)) {
      throw new Error('Invalid scene format: missing objects array');
    }
    
    // 清空场景
    this.clearScene();
    
    // 恢复场景设置
    if (data.scene.background) {
      this.scene.background = new THREE.Color(data.scene.background);
    }
    if (data.scene.fog) {
      this.scene.fog = this.importFog(data.scene.fog);
    }
    
    // 恢复对象
    const loadedObjects = [];
    for (const objData of data.objects) {
      const obj = await this.importObject(objData);
      if (obj) {
        this.scene.add(obj);
        loadedObjects.push(obj);
      }
    }
    
    // 触发事件
    this.emitter.emit('scene-loaded', { 
      scene: this.scene,
      objectCount: loadedObjects.length
    });
    
    return loadedObjects;
  } catch (error) {
    console.error('场景加载失败:', error);
    this.emitter.emit('scene-load-error', { error });
    throw error;
  }
}
```

### 3.2 导入对象

```javascript
async importObject(objData) {
  let object;
  
  // 根据类型创建对象
  if (objData.type === 'Mesh') {
    const geometry = this.createGeometry(objData.geometry);
    const material = await this.loadMaterial(objData.material);
    object = new THREE.Mesh(geometry, material);
  } else if (objData.type === 'DirectionalLight') {
    object = new THREE.DirectionalLight(
      objData.color || 0xffffff,
      objData.intensity || 1
    );
  } else if (objData.type === 'PointLight') {
    object = new THREE.PointLight(
      objData.color || 0xffffff,
      objData.intensity || 1,
      objData.distance || 0,
      objData.decay || 2
    );
  }
  // ... 其他类型
  
  if (!object) {
    console.warn('无法创建对象:', objData.type);
    return null;
  }
  
  // 恢复名称
  object.name = objData.name || '';
  
  // 恢复变换
  if (objData.transform) {
    object.position.set(
      objData.transform.position.x,
      objData.transform.position.y,
      objData.transform.position.z
    );
    object.rotation.set(
      objData.transform.rotation.x,
      objData.transform.rotation.y,
      objData.transform.rotation.z
    );
    object.rotation.order = objData.transform.rotation.order || 'XYZ';
    object.scale.set(
      objData.transform.scale.x,
      objData.transform.scale.y,
      objData.transform.scale.z
    );
  }
  
  // 恢复可见性和阴影
  object.visible = objData.visible !== false;
  object.castShadow = objData.castShadow || false;
  object.receiveShadow = objData.receiveShadow || false;
  
  // 恢复 userData
  object.userData = { ...objData.userData };
  
  // 恢复动画
  if (objData.animations && objData.userData.animationIndex !== undefined) {
    // 动画将在模型加载后恢复
    object._pendingAnimations = objData.animations;
  }
  
  return object;
}
```

### 3.3 创建几何体

```javascript
createGeometry(geoData) {
  if (!geoData || !geoData.type) {
    return new THREE.BoxGeometry(1, 1, 1);
  }
  
  const { type, parameters = {} } = geoData;
  
  switch (type) {
    case 'BoxGeometry':
      return new THREE.BoxGeometry(
        parameters.width || 1,
        parameters.height || 1,
        parameters.depth || 1
      );
    case 'SphereGeometry':
      return new THREE.SphereGeometry(
        parameters.radius || 0.5,
        parameters.widthSegments || 32,
        parameters.heightSegments || 16
      );
    // ... 其他类型
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}
```

---

## 4. 动画恢复

### 4.1 动画状态恢复

```javascript
async restoreAnimation(object, animations) {
  if (!animations || animations.length === 0) {
    return;
  }
  
  const index = object.userData.animationIndex || 0;
  if (index >= animations.length) {
    return;
  }
  
  // 等待模型完全加载
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 创建 AnimationMixer
  const mixer = new THREE.AnimationMixer(object);
  const action = mixer.clipAction(object.animations[index]);
  
  // 播放动画
  action.play();
  
  // 挂载运行时对象
  object._mixer = mixer;
  object._activeAction = action;
}
```

---

## 5. 版本兼容

### 5.1 版本检查

```javascript
async loadScene(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  
  // 检查版本
  const version = data.version || '1.0';
  const [major] = version.split('.').map(Number);
  
  if (major > 1) {
    console.warn('场景文件版本高于当前支持版本');
  }
  
  // 版本迁移
  if (major < 1) {
    migrateScene(data);
  }
  
  // ... 正常加载逻辑
}

function migrateScene(data) {
  // 版本迁移逻辑
  if (!data.version) {
    // v0.x 迁移到 v1.0
    data.version = '1.0';
    data.metadata = data.metadata || {};
  }
  return data;
}
```

---

**版本**: 1.0 | **日期**: 2026-04-07
