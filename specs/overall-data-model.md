# Three Editor by AI - 数据模型

**生成日期**: 2026-04-14  
**项目版本**: 0.1.0

---

## 概述

本文档定义项目的核心数据模型，包括场景、对象、材质、灯光、资源、编辑器状态等的数据结构。

---

## 核心实体

### 1. Scene (场景)

场景是最高层级的容器，包含所有 3D 对象、灯光、相机和动画。

```typescript
interface Scene {
  uuid: string;                    // 场景唯一标识
  name: string;                    // 场景名称
  metadata: SceneMetadata;         // 元数据
  background: BackgroundConfig;    // 背景配置
  objects: SceneObject[];          // 所有场景对象
  lights: Light[];                 // 所有灯光
  cameras: Camera[];               // 所有相机
  animations: AnimationClip[];     // 动画剪辑（引用）
}

interface SceneMetadata {
  version: string;                 // 场景格式版本
  createdAt: string;               // 创建时间 (ISO 8601)
  modifiedAt: string;              // 最后修改时间
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

场景中的 3D 对象，可以是几何体、模型组、文字等。

```typescript
interface SceneObject {
  uuid: string;                    // 对象唯一标识 (Three.js uuid)
  name: string;                    // 对象名称
  type: ObjectType;                // 对象类型
  geometry: Geometry;              // 几何体数据
  material: Material | Material[]; // 材质（可以是数组）
  transform: Transform;            // 变换数据
  visible: boolean;                // 可见性
  castShadow: boolean;             // 投射阴影
  receiveShadow: boolean;          // 接收阴影
  userData: UserData;              // 自定义数据
  children: SceneObject[];         // 子对象列表
}

type ObjectType =
  | 'Box'                          // 立方体
  | 'Sphere'                       // 球体
  | 'Cylinder'                     // 圆柱体
  | 'Cone'                         // 圆锥体
  | 'Plane'                        // 平面
  | 'Circle'                       // 圆形
  | 'Ring'                         // 圆环面
  | 'Torus'                        // 环面
  | 'Tube'                         // 管状体
  | 'Dodecahedron'                 // 十二面体
  | 'Icosahedron'                  // 二十面体
  | 'Octahedron'                   // 八面体
  | 'Tetrahedron'                  // 四面体
  | 'Group'                        // 对象组
  | 'Text'                         // 文字
  | 'Sprite'                       // 精灵
  | 'Camera'                       // 相机对象
  | 'ImportedModel';               // 导入的外部模型
```

---

### 3. Transform (变换)

对象的变换数据（位置、旋转、缩放）。

```typescript
interface Transform {
  position: Vector3;               // 位置
  rotation: Vector3;               // 旋转（欧拉角，弧度）
  scale: Vector3;                  // 缩放
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
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
  | 'CircleGeometry'               // 圆形
  | 'RingGeometry'                 // 圆环面
  | 'TorusGeometry'                // 环面
  | 'TubeGeometry'                 // 管状体
  | 'DodecahedronGeometry'         // 十二面体
  | 'IcosahedronGeometry'          // 二十面体
  | 'OctahedronGeometry'           // 八面体
  | 'TetrahedronGeometry'          // 四面体
  | 'TextGeometry'                 // 文字
  | 'GLTF';                        // 导入的 GLTF 模型
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
  map?: TextureRef;                // 漫反射贴图
  normalMap?: TextureRef;          // 法线贴图
  roughnessMap?: TextureRef;       // 粗糙度贴图
  metalnessMap?: TextureRef;       // 金属度贴图
  emissive?: string;               // 自发光颜色 (hex)
  roughness?: number;              // 粗糙度 (0-1)
  metalness?: number;              // 金属度 (0-1)
  opacity: number;                 // 不透明度 (0-1)
  transparent: boolean;            // 是否透明
  side: string;                    // 渲染面：'front' | 'back' | 'double'
  wireframe?: boolean;             // 线框模式
}

type MaterialType =
  | 'MeshStandardMaterial'         // 标准材质
  | 'MeshBasicMaterial'            // 基础材质
  | 'MeshPhongMaterial'            // Phong 材质
  | 'MeshLambertMaterial'          // Lambert 材质
  | 'MeshPhysicalMaterial'         // 物理材质
  | 'MeshToonMaterial'             // 卡通材质
  | 'MeshNormalMaterial';          // 法线材质

interface TextureRef {
  uuid: string;                    // 纹理 uuid
  url: string;                     // 纹理 URL
  type: string;                    // 纹理类型
}
```

---

### 6. Light (灯光)

场景中的光源。

```typescript
interface Light {
  uuid: string;                    // 灯光唯一标识
  name: string;                    // 灯光名称
  type: LightType;                 // 灯光类型
  color: string;                   // 颜色 (hex)
  intensity: number;               // 强度
  castShadow: boolean;             // 投射阴影
  
  // 类型特有属性
  ambient?: Record<string, never>; // 环境光（无额外属性）
  directional?: {                  // 平行光
    position?: Vector3;
    shadowMapSize?: Vector2;
    shadowCameraNear?: number;
    shadowCameraFar?: number;
  };
  point?: {                        // 点光源
    position?: Vector3;
    distance?: number;
    decay?: number;
  };
  spot?: {                         // 聚光灯
    position?: Vector3;
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
  | 'Ambient'                      // 环境光
  | 'Directional'                  // 平行光
  | 'Point'                        // 点光源
  | 'Spot'                         // 聚光灯
  | 'Hemisphere'                   // 半球光
  | 'RectArea';                    // 矩形光

interface Vector2 {
  x: number;
  y: number;
}
```

---

### 7. Camera (相机)

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

### 8. Animation (动画)

动画剪辑与动画状态定义。

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
  property: string;                // 属性路径（如 'position', 'rotation'）
  times: number[];                 // 时间数组
  values: number[];                // 值数组
}

interface AnimationState {
  animationIndex: number;          // 当前动画索引
  clips: AnimationClip[];          // 可用动画剪辑列表
}
```

**运行时说明**: 动画相关的运行时对象（如 `_mixer`、`_activeAction`）直接挂载在 Object3D 主对象上，不存储在 userData 中，避免序列化污染。

---

### 9. EditorConfig (编辑器配置)

编辑器运行时配置。

```typescript
interface EditorConfig {
  controlsType: 'orbit' | 'map' | 'fly';  // 控制器类型
  targetDistance: number;                  // 目标距离
  lockY: boolean;                          // Y 轴锁定
  enableKeyboard: boolean;                 // 启用键盘控制
  movementSpeed: number;                   // 移动速度
  rollSpeed: number;                       // 翻滚速度
  panSpeed: number;                        // 平移速度
  rotateSpeed: number;                     // 旋转速度
  zoomSpeed: number;                       // 缩放速度
  gridSize: number;                        // 网格大小
  gridDivisions: number;                   // 网格分割数
  gridColorCenterLine: string;             // 网格中心线颜色
  gridColorGrid: string;                   // 网格线颜色
  axesSize: number;                        // 坐标轴大小
}
```

---

### 10. AppState (应用状态)

编辑器 UI 应用状态。

```typescript
interface AppState {
  isLoading: boolean;                // 是否正在加载
  leftPanelCollapsed: boolean;       // 左侧面板是否折叠
  rightPanelCollapsed: boolean;      // 右侧面板是否折叠
  bottomPanelCollapsed: boolean;     // 底部面板是否折叠
  activeLeftTab: string;             // 当前激活的左侧标签
  panels: PanelSizes;                // 面板尺寸
}

interface PanelSizes {
  leftWidth: number;                 // 左侧面板宽度
  rightWidth: number;                // 右侧面板宽度
  bottomHeight: number;              // 底部面板高度
}
```

---

### 11. ObjectManagerState (对象管理器状态)

对象管理器的运行时状态。

```typescript
interface ObjectManagerState {
  objects: Map<string, Object3D>;    // 所有对象映射（UUID -> Object3D）
  selectedObjects: Set<string>;      // 已选中对象 UUID 集合
  clipboard: Object3D[] | null;      // 剪贴板中的对象
}
```

---

### 12. TransformHistory (变换历史)

变换操作的撤销/重做历史记录。

```typescript
interface TransformHistory {
  undoStack: TransformState[];       // 撤销栈
  redoStack: TransformState[];       // 重做栈
  maxHistory: number;                // 最大历史记录数（默认 50）
}

interface TransformState {
  objectUuid: string;                // 对象 UUID
  position: Vector3;                 // 变换前位置
  rotation: Vector3;                 // 变换前旋转
  scale: Vector3;                    // 变换前缩放
}
```

---

### 13. UserData (自定义数据)

对象的自定义数据字段。

```typescript
interface UserData {
  locked?: boolean;                  // 锁定状态（防止误操作）
  animationIndex?: number;           // 动画索引
  
  // 用户自定义字段（任意）
  [key: string]: any;
}
```

---

### 14. VFS (虚拟文件系统)

虚拟文件系统相关数据结构。

```typescript
interface VFSDrive {
  drive: string;                     // 驱动器标识
  path: string;                      // 路径
}

interface VFSFileEntry {
  path: string;                      // 完整路径
  name: string;                      // 文件/文件夹名称
  ext: string;                       // 扩展名
  type: 'FILE' | 'FOLDER';           // 类型
  size: number;                      // 文件大小（字节）
  time: string;                      // 修改时间 (ISO 8601)
}
```

---

### 15. AssetEntry (资源条目)

资源库中的资源定义。

```typescript
interface AssetEntry {
  name: string;                      // 资源名称
  type: 'model' | 'texture';         // 资源类型
  file: File | null;                 // 原始文件对象
  url: string;                       // 资源 URL
  preview: string | null;            // 预览图 URL
  cached: boolean;                   // 是否已缓存
}
```

---

### 16. CameraState (相机状态)

相机运行时状态，用于视点记录和恢复。

```typescript
interface CameraState {
  position: Vector3;                 // 相机位置
  rotation: Vector3;                 // 相机旋转（欧拉角）
  quaternion: Quaternion;            // 四元数
  spherical: SphericalCoords;        // 球面坐标
  target: Vector3;                   // 观察目标点
}

interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

interface SphericalCoords {
  radius: number;                    // 半径（到目标点距离）
  phi: number;                       // 极角（垂直角度）
  theta: number;                     // 方位角（水平角度）
}
```

---

## 关系图

```
┌─────────────────┐
│      Scene      │
└────────┬────────┘
         │
    ┌────┼────────────────────┐
    │    │                    │
    ▼    ▼                    ▼
┌───────┐ ┌───────┐    ┌───────────┐
│Object │ │ Light │    │ Animation │
└───┬───┘ └───────┘    └───────────┘
    │
    ├──────────────┐
    │              │
    ▼              ▼
┌─────────┐  ┌───────────┐
│Geometry │  │ Material  │
└─────────┘  └─────┬─────┘
                   │
              ┌────▼────┐
              │Texture  │
              └─────────┘

┌──────────────────┐     ┌──────────────────┐
│ TransformHistory │     │  ObjectManager   │
│  undo/redo stack │     │  objects map     │
└──────────────────┘     │  selected set    │
                         │  clipboard       │
                         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│   EditorConfig   │     │     AppState     │
│  controls type   │     │  panel states    │
│  speeds & sizes  │     │  loading status  │
└──────────────────┘     └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│    VFSDrive      │     │   AssetEntry     │
│  drive & path    │     │  model/texture   │
└──────────────────┘     │  file/url/preview│
                         └──────────────────┘

┌──────────────────┐
│   CameraState    │
│  position/rot/   │
│  quaternion/     │
│  spherical/target│
└──────────────────┘
```

---

## 序列化格式

### 场景序列化示例

```json
{
  "version": "1.0",
  "metadata": {
    "createdAt": "2026-04-14T10:00:00.000Z",
    "modifiedAt": "2026-04-14T12:00:00.000Z"
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
      "type": "Box",
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
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 1, "y": 1, "z": 1 }
      },
      "userData": {
        "locked": false,
        "animationIndex": 0
      },
      "visible": true,
      "castShadow": true,
      "receiveShadow": true,
      "children": []
    }
  ],
  "lights": [
    {
      "uuid": "light-001",
      "name": "DirectionalLight1",
      "type": "Directional",
      "color": "#ffffff",
      "intensity": 1,
      "castShadow": true,
      "directional": {
        "position": { "x": 5, "y": 5, "z": 5 }
      }
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
| 1.0 | 2026-04-14 | 初始数据模型文档 |
