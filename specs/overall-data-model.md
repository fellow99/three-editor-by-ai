# Three Editor by AI - 数据模型

**生成日期**: 2026-04-07  
**项目版本**: 0.1.0

---

## 概述

本文档定义项目的核心数据模型，包括场景、对象、材质、资源等的数据结构。

---

## 核心实体

### 1. Scene (场景)

场景是最高层级的容器，包含所有 3D 对象、灯光、相机等。

```typescript
interface Scene {
  uuid: string;                    // 场景唯一标识
  name: string;                    // 场景名称
  metadata: SceneMetadata;         // 元数据
  background: BackgroundConfig;    // 背景配置
  objects: SceneObject[];          // 所有对象
  lights: Light[];                 // 所有灯光
  cameras: Camera[];               // 所有相机
  animations: AnimationClip[];     // 动画剪辑（引用）
}

interface SceneMetadata {
  version: string;                 // 场景格式版本
  createdAt: string;               // 创建时间 (ISO 8601)
  modifiedAt: string;              // 最后修改时间
  author?: string;                 // 作者（可选）
  description?: string;            // 描述（可选）
}

interface BackgroundConfig {
  type: 'color' | 'texture' | 'environment';
  color?: string;                  // 背景颜色 (hex)
  texture?: string;                // 背景纹理 URL
  environment?: string;            // 环境贴图 URL
}
```

---

### 2. SceneObject (场景对象)

场景中的 3D 对象，可以是几何体、模型等。

```typescript
interface SceneObject {
  uuid: string;                    // 对象唯一标识 (Three.js uuid)
  name: string;                    // 对象名称
  type: ObjectType;                // 对象类型
  geometry: Geometry;              // 几何体数据
  material: Material | Material[]; // 材质（可以是数组）
  transform: Transform;            // 变换数据
  userData: UserData;              // 自定义数据
  visible: boolean;                // 可见性
  castShadow: boolean;             // 投射阴影
  receiveShadow: boolean;          // 接收阴影
  locked?: boolean;                // 锁定状态（防止误操作）
  parent?: string;                 // 父对象 uuid（层级结构）
  children?: string[];             // 子对象 uuid 列表
}

type ObjectType = 
  | 'Mesh'                        // 网格对象
  | 'Group'                       // 对象组
  | 'Skeleton'                    // 骨骼
  | 'Bone';                       // 骨头
```

---

### 3. Transform (变换)

对象的变换数据（位置、旋转、缩放）。

```typescript
interface Transform {
  position: Vector3;               // 位置
  rotation: Euler | Quaternion;    // 旋转（欧拉角或四元数）
  scale: Vector3;                  // 缩放
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Euler {
  x: number;                       // X 轴旋转 (弧度)
  y: number;                       // Y 轴旋转 (弧度)
  z: number;                       // Z 轴旋转 (弧度)
  order: string;                   // 旋转顺序，如 'XYZ'
}

interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}
```

---

### 4. Geometry (几何体)

几何体定义对象的形状。

```typescript
interface Geometry {
  type: GeometryType;              // 几何体类型
  parameters?: Record<string, any>; // 几何体参数
  url?: string;                    // 外部模型 URL（如 GLTF）
  uuid?: string;                   // Three.js 几何体 uuid
}

type GeometryType =
  | 'BoxGeometry'                  // 立方体
  | 'SphereGeometry'               // 球体
  | 'CylinderGeometry'             // 圆柱体
  | 'ConeGeometry'                 // 圆锥体
  | 'PlaneGeometry'                // 平面
  | 'TorusGeometry'                // 圆环
  | 'TorusKnotGeometry'            // 圆环结
  | 'DodecahedronGeometry'         // 十二面体
  | 'IcosahedronGeometry'          // 二十面体
  | 'OctahedronGeometry'           // 八面体
  | 'TetrahedronGeometry'          // 四面体
  | 'CircleGeometry'               // 圆形
  | 'TubeGeometry'                 // 管状体
  | 'GLTF';                        // GLTF 模型
```

**几何体参数示例**:

```typescript
// BoxGeometry 参数
{
  width: 1,
  height: 1,
  depth: 1,
  widthSegments: 1,
  heightSegments: 1,
  depthSegments: 1
}

// SphereGeometry 参数
{
  radius: 1,
  widthSegments: 32,
  heightSegments: 16,
  phiStart: 0,
  phiLength: Math.PI * 2,
  thetaStart: 0,
  thetaLength: Math.PI
}

// GLTF 模型
{
  type: 'GLTF',
  url: '/vfs/models/gltf/Horse.glb',
  animations: ['animation1', 'animation2']
}
```

---

### 5. Material (材质)

材质定义对象的表面外观。

```typescript
interface Material {
  uuid: string;                    // 材质唯一标识
  name: string;                    // 材质名称
  type: MaterialType;              // 材质类型
  color?: string;                  // 基础颜色 (hex)
  transparent: boolean;            // 是否透明
  opacity: number;                 // 不透明度 (0-1)
  side: string;                    // 渲染面：'front' | 'back' | 'double'
  
  // Standard/Physical 材质属性
  roughness?: number;              // 粗糙度 (0-1)
  metalness?: number;              // 金属度 (0-1)
  normalScale?: Vector2;           // 法线贴图强度
  
  // 纹理引用
  map?: TextureRef;                // 漫反射贴图
  normalMap?: TextureRef;          // 法线贴图
  roughnessMap?: TextureRef;       // 粗糙度贴图
  metalnessMap?: TextureRef;       // 金属度贴图
  emissiveMap?: TextureRef;        // 自发光贴图
  aoMap?: TextureRef;              // 环境光遮蔽贴图
  
  // Physical 材质特有
  clearcoat?: number;              // 清漆强度
  clearcoatRoughness?: number;     // 清漆粗糙度
  transmission?: number;           // 透射
  thickness?: number;              // 厚度
  sheen?: number;                  // 光泽
  
  userData?: Record<string, any>;  // 自定义数据
}

type MaterialType =
  | 'MeshBasicMaterial'            // 基础材质
  | 'MeshStandardMaterial'         // 标准材质
  | 'MeshPhongMaterial'            // Phong 材质
  | 'MeshLambertMaterial'          // Lambert 材质
  | 'MeshPhysicalMaterial';        // 物理材质

interface TextureRef {
  uuid: string;                    // 纹理 uuid
  url: string;                     // 纹理 URL
  type: string;                    // 纹理类型
}

interface Vector2 {
  x: number;
  y: number;
}
```

---

### 6. Texture (纹理)

纹理资源定义。

```typescript
interface Texture {
  uuid: string;                    // 纹理唯一标识
  name: string;                    // 纹理名称
  url: string;                     // 纹理 URL
  type: TextureType;               // 纹理类型
  format: string;                  // 文件格式 (jpg, png, ktx2)
  size: number;                    // 文件大小 (字节)
  width: number;                   // 宽度 (像素)
  height: number;                  // 高度 (像素)
  encoding: string;                // 编码 (sRGB, Linear)
  wrap: {                          // 包裹方式
    s: string;                     // 'repeat' | 'clamp' | 'mirrored'
    t: string;
  };
  repeat: Vector2;                 // 重复次数
  offset: Vector2;                 // 偏移
  rotation: number;                // 旋转 (弧度)
  center: Vector2;                 // 旋转中心
}

type TextureType =
  | 'map'                          // 漫反射贴图
  | 'normalMap'                    // 法线贴图
  | 'roughnessMap'                 // 粗糙度贴图
  | 'metalnessMap'                 // 金属度贴图
  | 'emissiveMap'                  // 自发光贴图
  | 'aoMap'                        // 环境光遮蔽贴图
  | 'bumpMap'                      // 凹凸贴图
  | 'displacementMap'              // 置换贴图
  | 'environment';                 // 环境贴图
```

---

### 7. Light (灯光)

场景中的光源。

```typescript
interface Light {
  uuid: string;                    // 灯光唯一标识
  name: string;                    // 灯光名称
  type: LightType;                 // 灯光类型
  color: string;                   // 颜色 (hex)
  intensity: number;               // 强度
  position?: Vector3;              // 位置（点光源、聚光灯）
  target?: string;                 // 目标对象 uuid
  castShadow: boolean;             // 投射阴影
  
  // 类型特有属性
  ambient?: Record<string, never>; // 环境光（无额外属性）
  directional?: {                  // 平行光
    shadowMapSize?: Vector2;
    shadowCameraNear?: number;
    shadowCameraFar?: number;
    shadowCameraLeft?: number;
    shadowCameraRight?: number;
    shadowCameraTop?: number;
    shadowCameraBottom?: number;
  };
  point?: {                        // 点光源
    distance?: number;
    decay?: number;
  };
  spot?: {                         // 聚光灯
    angle?: number;                // 锥形角度 (弧度)
    penumbra?: number;             // 半影 (0-1)
    distance?: number;
    decay?: number;
  };
  hemisphere?: {                   // 半球光
    groundColor?: string;          // 地面颜色
  };
  rectarea?: {                     // 矩形光
    width?: number;
    height?: number;
  };
}

type LightType =
  | 'AmbientLight'                 // 环境光
  | 'DirectionalLight'             // 平行光
  | 'PointLight'                   // 点光源
  | 'SpotLight'                    // 聚光灯
  | 'HemisphereLight'              // 半球光
  | 'RectAreaLight';               // 矩形光
```

---

### 8. Camera (相机)

场景相机。

```typescript
interface Camera {
  uuid: string;                    // 相机唯一标识
  name: string;                    // 相机名称
  type: 'Perspective' | 'Orthographic';
  position: Vector3;               // 相机位置
  target: Vector3;                 // 观察目标
  up: Vector3;                     // 上方向
  
  // 透视相机属性
  fov?: number;                    // 视野角度
  aspect?: number;                 // 宽高比
  near?: number;                   // 近裁剪面
  far?: number;                    // 远裁剪面
  
  // 正交相机属性
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
```

---

### 9. Animation (动画)

动画剪辑定义。

```typescript
interface AnimationClip {
  uuid: string;                    // 动画唯一标识
  name: string;                    // 动画名称
  duration: number;                // 持续时间 (秒)
  tracks: AnimationTrack[];        // 动画轨道
}

interface AnimationTrack {
  type: string;                    // 轨道类型
  target: string;                  // 目标对象 uuid
  property: string;                // 属性路径 (如 'position', 'rotation')
  times: number[];                 // 时间数组
  values: number[];                // 值数组
}

interface AnimationState {
  objectUuid: string;              // 对象 uuid
  animationIndex: number;          // 当前动画索引
  isPlaying: boolean;              // 是否正在播放
  time: number;                    // 当前播放时间
  speed: number;                   // 播放速度
  loop: string;                    // 循环模式：'once' | 'loop' | 'pingpong'
}
```

---

### 10. Resource (资源)

资源库中的资源定义。

```typescript
interface Resource {
  uuid: string;                    // 资源唯一标识
  name: string;                    // 资源名称
  type: ResourceType;              // 资源类型
  url: string;                     // 资源 URL
  thumbnail?: string;              // 缩略图 URL
  format: string;                  // 文件格式
  size: number;                    // 文件大小 (字节)
  createdAt: string;               // 创建时间
  tags?: string[];                 // 标签
  metadata?: Record<string, any>;  // 元数据
}

type ResourceType =
  | 'model'                        // 3D 模型
  | 'texture'                      // 纹理
  | 'environment'                  // 环境贴图
  | 'hdr';                         // HDR 贴图
```

---

### 11. UserData (自定义数据)

对象的自定义数据字段。

```typescript
interface UserData {
  name?: string;                   // 自定义名称
  description?: string;            // 描述
  animationIndex?: number;         // 动画索引
  locked?: boolean;                // 锁定状态
  
  // 用户自定义字段（任意）
  [key: string]: any;
}
```

---

## 关系图

```
┌─────────────┐
│    Scene    │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
  ┌────▼────┐    ┌────▼────┐
  │ Object  │    │  Light  │
  └────┬────┘    └─────────┘
       │
       ├──────────────┐
       │              │
  ┌────▼────┐    ┌────▼────┐
  │Geometry │    │Material │
  └─────────┘    └────┬────┘
                      │
                 ┌────▼────┐
                 │ Texture │
                 └─────────┘
```

---

## 序列化格式

### 场景序列化示例

```json
{
  "version": "1.0",
  "metadata": {
    "createdAt": "2026-04-07T10:00:00.000Z",
    "modifiedAt": "2026-04-07T12:00:00.000Z"
  },
  "scene": {
    "background": {
      "type": "color",
      "color": "#1a1a1a"
    }
  },
  "objects": [
    {
      "uuid": "obj-001",
      "name": "Box1",
      "type": "Mesh",
      "geometry": {
        "type": "BoxGeometry",
        "parameters": {
          "width": 1,
          "height": 1,
          "depth": 1
        }
      },
      "material": {
        "uuid": "mat-001",
        "name": "Red Material",
        "type": "MeshStandardMaterial",
        "color": "#ff0000",
        "roughness": 0.5,
        "metalness": 0.5
      },
      "transform": {
        "position": { "x": 0, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0, "order": "XYZ" },
        "scale": { "x": 1, "y": 1, "z": 1 }
      },
      "userData": {
        "name": "Box1",
        "animationIndex": 0
      },
      "visible": true,
      "castShadow": true,
      "receiveShadow": true
    }
  ],
  "lights": [
    {
      "uuid": "light-001",
      "name": "DirectionalLight1",
      "type": "DirectionalLight",
      "color": "#ffffff",
      "intensity": 1,
      "position": { "x": 5, "y": 5, "z": 5 },
      "castShadow": true
    }
  ],
  "cameras": [
    {
      "uuid": "cam-001",
      "name": "MainCamera",
      "type": "Perspective",
      "position": { "x": 5, "y": 5, "z": 5 },
      "target": { "x": 0, "y": 0, "z": 0 },
      "up": { "x": 0, "y": 1, "z": 0 },
      "fov": 75,
      "near": 0.1,
      "far": 1000
    }
  ]
}
```

---

## 相关文档

- [API 清单](./API.md)
- [整体规格](./overall-spec.md)
- [架构设计](./ARCHITECTURE.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-07 | 初始数据模型文档 |
