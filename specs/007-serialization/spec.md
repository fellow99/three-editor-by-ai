# 007-Serialization 场景序列化模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

场景序列化模块负责 Three.js 场景的完整序列化与反序列化，确保场景状态可以保存和恢复。

### 1.2 模块职责

- **场景导出**: JSON 格式序列化
- **场景导入**: JSON 反序列化
- **userData 序列化**: 自定义属性完整保存
- **动画状态**: 动画索引保存与恢复

---

## 2. 序列化策略

### 2.1 序列化内容

**✅ 序列化**:
- 所有 3D 对象（Mesh、Light、Group 等）
- 几何体数据和参数
- 材质数据和纹理引用
- 变换（position、rotation、scale）
- userData（自定义属性）
- 动画索引（userData.animationIndex）

**❌ 不序列化**:
- 运行时对象（_mixer、_activeAction）
- 事件监听器
- 临时缓存

### 2.2 序列化格式

```json
{
  "version": "1.0",
  "metadata": {
    "createdAt": "2026-04-07T10:00:00.000Z",
    "modifiedAt": "2026-04-07T12:00:00.000Z"
  },
  "scene": {
    "background": "#1a1a1a"
  },
  "objects": [
    {
      "uuid": "...",
      "type": "Mesh",
      "geometry": { "type": "BoxGeometry", "parameters": {...} },
      "material": { "type": "MeshStandardMaterial", ... },
      "transform": {
        "position": { "x": 0, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 1, "y": 1, "z": 1 }
      },
      "userData": {
        "name": "Box1",
        "animationIndex": 0
      }
    }
  ]
}
```

---

## 3. ThreeViewer 序列化方法

### 3.1 导出场景

```javascript
exportScene() {
  const objects = [];
  
  this.scene.traverse((obj) => {
    if (obj.type === 'Mesh' || obj.type === 'Light') {
      objects.push({
        uuid: obj.uuid,
        type: obj.type,
        geometry: obj.geometry?.toJSON(),
        material: obj.material?.toJSON(),
        transform: {
          position: obj.position,
          rotation: obj.rotation,
          scale: obj.scale
        },
        userData: obj.userData
      });
    }
  });
  
  return JSON.stringify({
    version: '1.0',
    metadata: {
      createdAt: new Date().toISOString()
    },
    scene: {
      background: this.scene.background
    },
    objects
  });
}
```

### 3.2 加载场景

```javascript
async loadScene(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  
  // 清空场景
  this.clearScene();
  
  // 恢复背景
  if (data.scene.background) {
    this.scene.background = new THREE.Color(data.scene.background);
  }
  
  // 恢复对象
  for (const objData of data.objects) {
    const obj = this.importObject(objData);
    this.scene.add(obj);
    
    // 恢复动画
    if (obj.userData.animationIndex !== undefined) {
      this.restoreAnimation(obj, objData.animations);
    }
  }
  
  this.emitter.emit('scene-loaded', { scene: this.scene });
}
```

---

## 4. 动画状态恢复

### 4.1 动画索引保存

```javascript
// 导出时
userData: {
  animationIndex: 0  // 当前播放的动画索引
}
```

### 4.2 动画恢复

```javascript
restoreAnimation(object, animations) {
  if (!animations || animations.length === 0) return;
  
  const index = object.userData.animationIndex || 0;
  if (index >= animations.length) return;
  
  // 创建 AnimationMixer
  const mixer = new THREE.AnimationMixer(object);
  const action = mixer.clipAction(animations[index]);
  action.play();
  
  // 挂载运行时对象
  object._mixer = mixer;
  object._activeAction = action;
}
```

---

## 5. 使用示例

```javascript
// 导出场景
const sceneJson = threeViewer.exportScene();

// 保存到文件
await vfs.save('/scenes/scene1.json', sceneJson);

// 加载场景
await threeViewer.loadScene(sceneJson);
```

---

**版本**: 1.0 | **日期**: 2026-04-07
