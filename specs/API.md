# Three Editor by AI - REST API 清单

**生成日期**: 2026-04-07  
**项目版本**: 0.1.0  
**API 版本**: v1

---

## 概述

本项目包含两套文件系统 API：

1. **虚拟文件系统 API (VFS Server)** - 后端服务，支持读写操作
2. **静态文件系统 API (Static Drive)** - 静态资源访问，只读操作

---

## 虚拟文件系统 API (VFS Server)

**服务地址**: `http://localhost:3001` (默认端口，可通过命令行参数修改)  
**入口文件**: `script/vfs-server.js`  
**前端封装**: `src/services/vfs-server-api.js`

### 配置说明

VFS Server 支持多 drive 配置，通过 `script/vfs-server.json` 定义：

```json
{
  "vfs": [
    {
      "drive": "models",
      "path": "../models"
    },
    {
      "drive": "textures",
      "path": "../textures"
    }
  ]
}
```

---

### API 列表

#### 1. 获取目录内容

**路径**: `/api/list/:drive`  
**Method**: `GET`  
**用途**: 获取指定虚拟驱动器中目录的文件和文件夹列表  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `path` (查询参数): 目录路径，默认为 `/`

**请求示例**:
```
GET /api/list/models?path=/gltf
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "files": [
      {
        "path": "/gltf",
        "name": "Horse.glb",
        "ext": "glb",
        "type": "FILE",
        "size": 123456,
        "time": "2026-04-07T10:00:00.000Z"
      },
      {
        "path": "/gltf",
        "name": "subfolder",
        "ext": "",
        "type": "FOLDER",
        "size": 0,
        "time": null
      }
    ]
  }
}
```

**前端调用**:
```javascript
const vfs = new VfsServerApi({ drive: 'models', baseURL: 'http://localhost:3001' });
const result = await vfs.list('/gltf');
```

---

#### 2. 获取文件访问链接

**路径**: `/file/:drive/*path`  
**Method**: `GET`  
**用途**: 获取文件的直接访问 URL，支持二进制文件（模型、纹理等）  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 文件相对路径

**请求示例**:
```
GET /file/models/gltf/Horse.glb
```

**响应**: 文件二进制内容（直接下载/显示）

**前端调用**:
```javascript
const vfs = new VfsServerApi({ drive: 'models' });
const url = vfs.url('/gltf/Horse.glb');
// 结果：http://localhost:3001/file/models/gltf/Horse.glb
```

---

#### 3. 获取文件文本内容

**路径**: `/file/:drive/*path`  
**Method**: `GET`  
**用途**: 获取文件的文本内容（如 JSON、配置文件等）  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 文件相对路径

**请求示例**:
```
GET /file/config/settings.json
```

**响应示例**:
```json
{
  "setting1": "value1",
  "setting2": "value2"
}
```

**前端调用**:
```javascript
const vfs = new VfsServerApi({ drive: 'config' });
const text = await vfs.content('/settings.json');
```

---

#### 4. 获取文件 JSON 内容

**路径**: `/file/:drive/*path`  
**Method**: `GET`  
**用途**: 获取文件内容并自动解析为 JSON 对象  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 文件相对路径

**前端调用**:
```javascript
const vfs = new VfsServerApi({ drive: 'config' });
const json = await vfs.json('/settings.json');
```

---

#### 5. 获取文件 Blob 内容

**路径**: `/file/:drive/*path`  
**Method**: `GET`  
**用途**: 获取文件内容的 Blob 对象，用于二进制处理  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 文件相对路径

**前端调用**:
```javascript
const vfs = new VfsServerApi({ drive: 'models' });
const blob = await vfs.blob('/gltf/Horse.glb');
```

---

#### 6. 检查文件/目录是否存在

**路径**: `/exists/:drive/*path`  
**Method**: `GET`  
**用途**: 判断指定虚拟驱动器中的文件或目录是否存在  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 文件或目录相对路径

**请求示例**:
```
GET /exists/models/gltf/Horse.glb
```

**响应示例**:
```json
{
  "exists": true
}
```

**前端调用**:
```javascript
const vfs = new VfsServerApi({ drive: 'models' });
const exists = await vfs.exists('/gltf/Horse.glb');
```

---

#### 7. 保存文本文件

**路径**: `/save/:drive/*path`  
**Method**: `POST`  
**用途**: 保存文本内容到指定文件  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 文件相对路径
- Body: 文本内容（Content-Type: text/plain）

**请求示例**:
```
POST /save/config/settings.json
Content-Type: text/plain

{"setting1": "newvalue"}
```

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "config": {
      "drive": "config",
      "path": "/settings.json"
    },
    "file": {
      "name": "settings.json",
      "path": "/",
      "type": "FILE",
      "ext": "json"
    }
  },
  "msg": "操作成功"
}
```

**前端调用**:
```javascript
const vfs = new VfsServerApi({ drive: 'config' });
const success = await vfs.save('/settings.json', '{"setting1": "newvalue"}');
```

---

#### 8. 保存 Base64 数据为文件

**路径**: `/save-base64/:drive/*path`  
**Method**: `POST`  
**用途**: 将 Base64 编码的数据保存为文件  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 文件相对路径
- Body: Base64 编码的字符串

**请求示例**:
```
POST /save-base64/textures/image.png
Content-Type: text/plain

iVBORw0KGgoAAAANSUhEUgAA...
```

**响应**: 同保存文本文件

**前端调用**:
```javascript
// 需要手动调用 fetch，因为 VfsServerApi 未封装此方法
const response = await fetch('http://localhost:3001/save-base64/textures/image.png', {
  method: 'POST',
  body: base64Data
});
```

---

#### 9. 上传文件

**路径**: `/upload/:drive/*path`  
**Method**: `POST`  
**用途**: 上传文件到指定目录  
**参数**: 
- `drive` (路径参数): 虚拟驱动器名称
- `*path` (通配符路径): 目录相对路径
- FormData: 包含上传文件的 FormData 对象

**请求示例**:
```
POST /upload/models/gltf
Content-Type: multipart/form-data

(file field: Horse.glb)
```

**响应**: 同保存文本文件

**前端调用**:
```javascript
// 需要手动调用 fetch，因为 VfsServerApi 未封装此方法
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3001/upload/models/gltf', {
  method: 'POST',
  body: formData
});
```

---

## 静态文件系统 API (Static Drive)

**服务地址**: 静态资源（通过 Vite 开发服务器或直接访问 public 目录）  
**入口文件**: 无（静态文件）  
**前端封装**: `src/services/static-drive-api.js`

### 配置说明

静态文件系统读取 `public/vfs/` 目录下的资源，通过 `.folder.json` 和 `.all.json` 提供元数据。

---

### API 列表

#### 1. 获取目录内容

**路径**: `{path}/.folder.json`  
**Method**: `GET`  
**用途**: 获取静态目录的元数据信息  
**参数**: 
- `path` (路径): 目录相对路径

**请求示例**:
```
GET /vfs/models/gltf/.folder.json
```

**响应示例**:
```json
{
  "path": "/models/gltf",
  "files": [
    {
      "name": "Horse.glb",
      "type": "FILE",
      "ext": "glb"
    }
  ]
}
```

**前端调用**:
```javascript
const staticDrive = new StaticDriveApi({ drive: 'vfs' });
const result = await staticDrive.list('/models/gltf');
```

---

#### 2. 获取文件访问链接

**路径**: `{root}/{path}`  
**Method**: `GET` (URL 生成)  
**用途**: 生成静态文件的访问 URL  
**参数**: 
- `path` (路径): 文件相对路径

**前端调用**:
```javascript
const staticDrive = new StaticDriveApi({ drive: 'vfs' });
const url = staticDrive.url('/models/gltf/Horse.glb');
// 结果：/vfs/models/gltf/Horse.glb
```

---

#### 3. 获取文件文本内容

**路径**: `{root}/{path}`  
**Method**: `GET`  
**用途**: 获取静态文件的文本内容  
**参数**: 
- `path` (路径): 文件相对路径

**前端调用**:
```javascript
const staticDrive = new StaticDriveApi({ drive: 'vfs' });
const text = await staticDrive.content('/vfs/models/gltf/.folder.json');
```

---

#### 4. 获取文件 JSON 内容

**路径**: `{root}/{path}`  
**Method**: `GET`  
**用途**: 获取静态文件内容并自动解析为 JSON  
**参数**: 
- `path` (路径): 文件相对路径

**前端调用**:
```javascript
const staticDrive = new StaticDriveApi({ drive: 'vfs' });
const json = await staticDrive.json('/vfs/models/gltf/.folder.json');
```

---

#### 5. 获取文件 Blob 内容

**路径**: `{root}/{path}`  
**Method**: `GET`  
**用途**: 获取静态文件内容的 Blob 对象  
**参数**: 
- `path` (路径): 文件相对路径

**前端调用**:
```javascript
const staticDrive = new StaticDriveApi({ drive: 'vfs' });
const blob = await staticDrive.blob('/vfs/models/gltf/Horse.glb');
```

---

#### 6. 检查文件是否存在

**路径**: `{root}/.all.json`  
**Method**: `GET`  
**用途**: 通过完整索引文件检查文件是否存在  
**参数**: 
- `path` (路径): 文件相对路径

**前端调用**:
```javascript
const staticDrive = new StaticDriveApi({ drive: 'vfs' });
const exists = await staticDrive.exists('/models/gltf/Horse.glb');
```

---

### 不支持的操作

静态文件系统为只读，以下操作会抛出 `Unsupported operation` 错误：

- `mkdir(path)` - 创建目录
- `rmdir(path)` - 删除目录
- `rm(path)` - 删除文件
- `mv(path, to)` - 移动文件
- `cp(path, to)` - 复制文件
- `save(path, text)` - 保存文件
- `saveUrl(path, url)` - 保存 URL 为文件

---

## API 使用示例

### 完整示例：加载 3D 模型

```javascript
import { VfsServerApi } from './services/vfs-server-api.js';

// 1. 初始化 VFS 客户端
const vfs = new VfsServerApi({ 
  drive: 'models', 
  baseURL: 'http://localhost:3001',
  root: ''
});

// 2. 列出目录内容
const dirContent = await vfs.list('/gltf');
console.log('可用模型:', dirContent.data.files);

// 3. 检查模型是否存在
const exists = await vfs.exists('/gltf/Horse.glb');
if (!exists) {
  console.error('模型不存在');
  return;
}

// 4. 获取模型 URL 并加载
const modelUrl = vfs.url('/gltf/Horse.glb');
const loader = new GLTFLoader();
loader.load(modelUrl, (gltf) => {
  scene.add(gltf.scene);
});

// 5. 保存场景配置
const sceneConfig = JSON.stringify({ model: 'Horse.glb', position: [0, 0, 0] });
await vfs.save('/scenes/scene1.json', sceneConfig);
```

---

## 错误处理

### VFS Server 错误码

| Code | 说明 |
|------|------|
| 0 | 成功 |
| 1 | 一般错误（参数无效、目录读取失败等） |
| 404 | 文件或目录不存在 |
| 500 | 服务器内部错误 |

### 错误响应示例

```json
{
  "code": 1,
  "msg": "无效的 drive 参数"
}
```

```json
{
  "code": 1,
  "msg": "目录读取失败",
  "error": "ENOENT: no such file or directory"
}
```

### 前端错误处理

```javascript
try {
  const result = await vfs.list('/invalid-path');
} catch (error) {
  console.error('VFS 操作失败:', error.message);
  // 显示用户友好的错误提示
}
```

---

## CORS 配置

VFS Server 已启用 CORS，允许跨域访问：

```javascript
app.use(cors());
```

如需限制特定域名，可修改为：

```javascript
app.use(cors({
  origin: 'http://localhost:5173' // Vite 开发服务器地址
}));
```

---

## 部署说明

### 开发环境

1. 启动 VFS Server：
   ```bash
   cd script
   node vfs-server.js 3001
   ```

2. 启动前端开发服务器：
   ```bash
   npm run dev
   ```

### 生产环境

1. 构建前端：
   ```bash
   npm run build
   ```

2. 部署 VFS Server 到生产服务器（可选独立部署）

3. 配置前端 API 基础 URL 指向生产环境的 VFS Server

---

## 相关文件

- **后端服务**: `script/vfs-server.js`
- **前端封装 (VFS)**: `src/services/vfs-server-api.js`
- **前端封装 (Static)**: `src/services/static-drive-api.js`
- **VFS 配置**: `script/vfs-server.json`
- **静态资源**: `public/vfs/`

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1 | 2026-04-07 | 初始版本，包含完整的 VFS 和 Static Drive API |
