# 006-VFS 虚拟文件系统模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 模块概述

### 1.1 模块定位

虚拟文件系统模块提供统一的文件访问接口，支持本地静态资源和远程 VFS 服务器的文件读写操作。

### 1.2 模块职责

- **VFS Server API**: 远程文件读写
- **Static Drive API**: 本地静态资源访问
- **文件浏览**: 目录浏览和文件选择
- **文件上传**: 拖拽上传和保存

---

## 2. VfsServerApi 类

### 2.1 组件概述

**类名**: `VfsServerApi`  
**文件**: `src/services/vfs-server-api.js`  
**大小**: 162 行

### 2.2 API 接口

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `list(path)` | path: string | Promise<Object> | 获取目录内容 |
| `url(path)` | path: string | string | 获取文件 URL |
| `content(path)` | path: string | Promise<string> | 获取文本内容 |
| `json(path)` | path: string | Promise<Object> | 获取 JSON 内容 |
| `blob(path)` | path: string | Promise<Blob> | 获取 Blob 内容 |
| `exists(path)` | path: string | Promise<boolean> | 检查是否存在 |
| `save(path, text)` | path: string, text: string | Promise<boolean> | 保存文件 |

### 2.3 使用示例

```javascript
import { VfsServerApi } from './services/vfs-server-api.js';

const vfs = new VfsServerApi({
  drive: 'models',
  baseURL: 'http://localhost:3001'
});

// 列出目录
const dir = await vfs.list('/gltf');

// 加载模型
const url = vfs.url('/gltf/Horse.glb');
loader.load(url);

// 保存文件
await vfs.save('/scenes/scene1.json', jsonData);
```

---

## 3. StaticDriveApi 类

### 3.1 组件概述

**类名**: `StaticDriveApi`  
**文件**: `src/services/static-drive-api.js`  
**大小**: 183 行  
**特点**: 只读访问静态资源

### 3.2 API 接口

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `list(path)` | path: string | Promise<Object> | 获取目录元数据 |
| `url(path)` | path: string | string | 获取文件 URL |
| `content(path)` | path: string | Promise<string> | 获取文本内容 |
| `json(path)` | path: string | Promise<Object> | 获取 JSON 内容 |
| `blob(path)` | path: string | Promise<Blob> | 获取 Blob 内容 |
| `exists(path)` | path: string | Promise<boolean> | 检查是否存在 |

---

## 4. vfs-server.js 后端服务

### 4.1 服务概述

**文件**: `script/vfs-server.js`  
**大小**: 386 行  
**端口**: 3001（默认）

### 4.2 REST API

| 路径 | Method | 说明 |
|------|--------|------|
| `/api/list/:drive` | GET | 获取目录内容 |
| `/file/:drive/*` | GET | 获取文件内容 |
| `/exists/:drive/*` | GET | 检查存在性 |
| `/save/:drive/*` | POST | 保存文件 |
| `/upload/:drive/*` | POST | 上传文件 |

### 4.3 多 Drive 配置

**配置文件**: `script/vfs-server.json`

```json
{
  "vfs": [
    { "drive": "models", "path": "../models" },
    { "drive": "textures", "path": "../textures" }
  ]
}
```

---

## 5. 使用示例

```javascript
// VFS Server（可读写）
const vfs = new VfsServerApi({ drive: 'models' });
const dir = await vfs.list('/gltf');
await vfs.save('/scenes/scene1.json', json);

// Static Drive（只读）
const staticDrive = new StaticDriveApi({ drive: 'vfs' });
const texture = await staticDrive.json('/textures/.folder.json');
```

---

**版本**: 1.0 | **日期**: 2026-04-07
