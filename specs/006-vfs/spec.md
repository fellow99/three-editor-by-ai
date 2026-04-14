# 006-VFS 虚拟文件系统模块 - 规格文档

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 模块概述

### 1.1 模块定位

虚拟文件系统模块是 Three Editor by AI 的资源管理层核心组件，负责统一管理编辑器内所有文件的浏览、读取、写入和拖拽交互。通过抽象多种存储后端为统一的虚拟文件系统接口，为编辑器提供一致的文件操作体验。

### 1.2 模块职责

- **VFS 服务注册与工厂**: 统一管理多种文件系统后端的注册、查找和实例获取
- **服务端读写驱动**: 对接后端文件服务，提供完整的文件读写、上传、存在性检查能力
- **静态只读驱动**: 基于预生成元数据的静态文件浏览，适用于打包发布的资源库
- **文件浏览面板**: 在编辑器侧边栏提供目录导航、文件列表展示和拖拽到场景的交互
- **文件选择对话框**: 供其他组件调用的模态对话框，用于选择文件、目录或材质
- **文件保存对话框**: 支持将编辑器内容保存到虚拟文件系统，含目录浏览和覆盖确认
- **拖拽到场景集成**: 将文件面板中的模型文件直接拖入三维场景自动加载

### 1.3 核心价值

- 双模式设计兼顾开发期读写和生产期只读场景
- 多驱动器配置支持同时访问多个独立文件仓库
- 统一的文件操作接口屏蔽底层存储差异
- 拖拽交互降低模型加载操作门槛
- 元数据预生成机制提升静态资源浏览性能

---

## 2. VFS 服务规格

### 2.1 组件概述

**类名**: `vfs-service`  
**文件**: `src/services/vfs-service.js`  
**大小**: 70 行  
**职责**: VFS 注册中心与工厂方法，统一管理所有已注册的虚拟文件系统实例

### 2.2 核心功能

#### 2.2.1 驱动器注册

**功能描述**: 根据配置类型创建对应的文件系统适配器实例并注册到全局映射表

**输入**:
- `opt`: Object - 驱动器配置对象
  - `type`: string - 驱动器类型（`static` 或 `vfs-server` 或 `asset-server`）
  - `drive`: string - 驱动器名称标识
  - `baseURL`: string - 基础 URL 地址
  - `root`: string - 根路径

**输出**:
- 创建并返回对应的文件系统适配器实例

**处理流程**:
1. 接收配置参数，提取 type 和 drive 字段
2. 根据 type 值创建对应类型的适配器实例
3. 将实例存入全局 driveMap 映射表，key 为 drive 名称
4. 返回创建的实例

**代码示例**:
```javascript
vfsService.registerVfs({
  type: 'vfs-server',
  drive: 'models',
  baseURL: 'http://localhost:3001',
  root: '/'
});
```

---

#### 2.2.2 驱动器查找

**功能描述**: 根据驱动器名称获取已注册的 VFS 实例

**输入**:
- `drive`: string - 驱动器名称

**输出**:
- 对应的 VFS 适配器实例，未找到时抛出错误

**处理流程**:
1. 从全局 driveMap 中查找指定 drive 名称的实例
2. 若未找到，抛出 "VFS not found" 错误
3. 返回找到的实例

---

#### 2.2.3 驱动器列表

**功能描述**: 获取所有已注册的虚拟文件系统实例

**输出**:
- 包含所有已注册 VFS 实例的数组

---

#### 2.2.4 路径工具方法

**getParentPath(path)**:
- 计算并返回指定路径的上级目录路径
- 根路径 `/` 的上级仍为 `/`
- 支持多级路径解析

**getMimetype(path)**:
- 根据文件路径推断 MIME 类型
- 用于文件上传和内容类型识别

---

### 2.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `registerVfs(opt)` | opt: Object | VFS 实例 | 注册虚拟文件系统 |
| `listVfs()` | - | VFS[] | 获取所有已注册驱动器 |
| `getVfs(drive)` | drive: string | VFS 实例 | 按名称获取驱动器 |
| `getMimetype(path)` | path: string | string | 获取文件 MIME 类型 |
| `getParentPath(path)` | path: string | string | 获取上级目录路径 |

---

## 3. VFS Server 驱动规格

### 3.1 组件概述

**类名**: `VfsServerApi`  
**文件**: `src/services/vfs-server-api.js`  
**大小**: 162 行  
**职责**: 对接后端文件服务的完整读写 REST 客户端

### 3.2 核心功能

#### 3.2.1 目录列表

**功能描述**: 获取指定目录下的文件和子目录列表

**输入**:
- `path`: string - 目录路径

**输出**:
- Promise\<Object\> - 包含文件列表的 JSON 对象

**API 端点**: `GET /api/list/:drive?path=xxx`

**响应格式**:
```json
{
  "code": 0,
  "data": {
    "files": [
      {
        "path": "/models",
        "name": "car.glb",
        "ext": "glb",
        "type": "FILE",
        "size": 1024000,
        "time": "2026-04-14T10:00:00Z"
      }
    ]
  }
}
```

---

#### 3.2.2 文件内容读取

**功能描述**: 获取文件的文本内容、JSON 内容或 Blob 二进制数据

**方法**:
- `content(path)`: 返回文本字符串
- `json(path)`: 返回解析后的 JSON 对象
- `blob(path)`: 返回 Blob 对象

**API 端点**: `GET /file/:drive/*`

---

#### 3.2.3 文件 URL 生成

**功能描述**: 根据文件路径生成可直接访问的 URL

**输入**:
- `path`: string - 文件路径

**输出**:
- string - 完整的文件访问 URL

---

#### 3.2.4 文件存在性检查

**功能描述**: 判断指定路径的文件或目录是否存在

**输入**:
- `path`: string - 文件或目录路径

**输出**:
- Promise\<boolean\> - 是否存在

**API 端点**: `GET /exists/:drive/*`

---

#### 3.2.5 文件保存

**功能描述**: 将文本内容保存到指定路径

**输入**:
- `path`: string - 目标文件路径
- `text`: string - 文件文本内容

**输出**:
- Promise\<boolean\> - 是否保存成功

**API 端点**: `POST /save/:drive/*`

---

### 3.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `list(path)` | path: string | Promise\<Object\> | 获取目录列表 |
| `url(path)` | path: string | string | 获取文件 URL |
| `content(path)` | path: string | Promise\<string\> | 获取文本内容 |
| `json(path)` | path: string | Promise\<Object\> | 获取 JSON 内容 |
| `blob(path)` | path: string | Promise\<Blob\> | 获取二进制内容 |
| `exists(path)` | path: string | Promise\<boolean\> | 检查存在性 |
| `save(path, text)` | path: string, text: string | Promise\<boolean\> | 保存文本文件 |

---

## 4. 静态驱动规格

### 4.1 组件概述

**类名**: `StaticDriveApi`  
**文件**: `src/services/static-drive-api.js`  
**大小**: 183 行  
**职责**: 基于预生成元数据的只读静态文件系统适配器

### 4.2 核心功能

#### 4.2.1 目录列表

**功能描述**: 通过读取目录下的 `.folder.json` 元数据文件获取目录内容

**输入**:
- `path`: string - 目录路径

**输出**:
- Promise\<Object\> - 目录内容的 JSON 对象

**元数据文件**: `.folder.json`
- 位于每个目录下
- 包含该目录的直接子项列表
- 由 `generate-vfs.js` 脚本预生成

---

#### 4.2.2 文件存在性检查

**功能描述**: 通过读取根目录下的 `.all.json` 元数据文件检查文件是否存在

**输入**:
- `path`: string - 文件路径

**输出**:
- Promise\<boolean\> - 是否存在

**元数据文件**: `.all.json`
- 位于静态资源根目录
- 包含所有文件的扁平列表
- 由 `generate-vfs.js` 脚本预生成

---

#### 4.2.3 只读限制

**功能描述**: 静态驱动不支持任何写操作

**不支持的操作**:
- `mkdir(path)`: 创建目录
- `rmdir(path)`: 删除目录
- `rm(path)`: 删除文件
- `mv(path, to)`: 移动文件
- `cp(path, to)`: 复制文件
- `save(path, text)`: 保存文件
- `saveUrl(path, saveUrl)`: URL 保存为文件

所有写操作均抛出 "Unsupported operation" 错误。

---

### 4.3 API 接口

#### 公共方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `list(path)` | path: string | Promise\<Object\> | 获取目录列表 |
| `url(path)` | path: string | string | 获取文件 URL |
| `content(path)` | path: string | Promise\<string\> | 获取文本内容 |
| `json(path)` | path: string | Promise\<Object\> | 获取 JSON 内容 |
| `blob(path)` | path: string | Promise\<Blob\> | 获取二进制内容 |
| `exists(path)` | path: string | Promise\<boolean\> | 检查存在性 |
| `mkdir(path)` | path: string | Error | 不支持 |
| `rmdir(path)` | path: string | Error | 不支持 |
| `rm(path)` | path: string | Error | 不支持 |
| `mv(path, to)` | path: string, to: string | Error | 不支持 |
| `cp(path, to)` | path: string, to: string | Error | 不支持 |
| `save(path, text)` | path: string, text: string | Error | 不支持 |
| `saveUrl(path, saveUrl)` | path: string, saveUrl: string | Error | 不支持 |

---

## 5. VFS 文件浏览器规格

### 5.1 组件概述

**组件名**: `VfsFileBrowser`  
**文件**: `src/components/editor/VfsFileBrowser.vue`  
**大小**: 251 行  
**职责**: 嵌入资源面板的文件浏览组件，支持目录导航和拖拽到场景

### 5.2 核心功能

#### 5.2.1 文件系统切换

**功能描述**: 在多个已注册的虚拟文件系统之间切换

**交互**:
- 下拉选择器显示所有已注册驱动器
- 切换时重置当前路径为根目录
- 自动加载新驱动器的根目录内容

---

#### 5.2.2 目录导航

**功能描述**: 浏览目录结构，支持进入子目录和返回上级

**交互**:
- 点击文件夹项进入该目录
- 点击"返回上一级"回到父目录
- 当前路径显示在面板头部

---

#### 5.2.3 文件列表展示

**功能描述**: 显示当前目录下的文件和文件夹

**展示内容**:
- 文件夹: 文件夹图标 + 名称（蓝色加粗）
- 文件: 文件图标 + 名称

**空目录提示**: 显示"该目录为空"

---

#### 5.2.4 拖拽到场景

**功能描述**: 将模型文件从文件浏览器拖入三维场景自动加载

**支持的模型格式**:
- `.glb` - GLTF 二进制格式
- `.gltf` - GLTF JSON 格式
- `.obj` - Wavefront OBJ 格式
- `.fbx` - Autodesk FBX 格式

**支持的场景文件格式**:
- `.json` - 场景序列化文件

**拖拽数据格式**:
- 模型文件: `application/x-model-file` - JSON 字符串包含 drive、path、name、url
- 场景文件: `application/x-scene-file` - JSON 字符串包含 drive、path、name、url

---

### 5.3 事件系统

#### 触发的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `dragstart` | 拖拽模型文件开始 | `{ drive, path, name, type, url }` |

---

## 6. VFS 文件选择对话框规格

### 6.1 组件概述

**组件名**: `VfsFileChooserDialog`  
**文件**: `src/components/dialog/VfsFileChooserDialog.vue`  
**大小**: 249 行  
**职责**: 模态对话框，供其他组件选择虚拟文件系统中的文件

### 6.2 核心功能

#### 6.2.1 文件浏览与选择

**功能描述**: 在对话框中浏览文件系统并选择单个文件

**交互**:
- 驱动器切换下拉选择器（仅显示 vfs-server 类型）
- 目录导航（进入子目录、返回上级）
- 文件列表网格布局展示
- 点击文件项选中，点击文件夹进入
- 文件列表按类型排序（文件夹在前，文件在后）

#### 6.2.2 确认选择

**功能描述**: 确认当前选中的文件并返回文件信息

**输出事件**:
- `select`: 触发时传递 `{ drive, path, name, url }`
- `update:modelValue`: 控制对话框显隐

---

## 7. VFS 文件保存对话框规格

### 7.1 组件概述

**组件名**: `VfsFileSaverDialog`  
**文件**: `src/components/dialog/VfsFileSaverDialog.vue`  
**大小**: 244 行  
**职责**: 模态对话框，支持将内容保存到虚拟文件系统

### 7.2 核心功能

#### 7.2.1 保存参数

**输入属性**:
- `modelValue`: Boolean - 控制对话框显隐
- `text`: String - 待保存的文件内容
- `ext`: String - 文件扩展名（默认 `json`）

#### 7.2.2 目录浏览

**功能描述**: 浏览目标驱动器目录结构，选择保存位置

**交互**:
- 驱动器选择（仅 vfs-server 类型）
- 目录导航
- 点击文件项自动填充文件名（去除扩展名）

#### 7.2.3 文件名输入与覆盖确认

**功能描述**: 输入文件名并检测是否覆盖已有文件

**交互**:
- 文件名输入框
- 自动显示扩展名后缀
- 实时检测同名文件，显示"将覆盖已有文件"警告

#### 7.2.4 保存执行

**功能描述**: 执行保存操作并反馈结果

**输出事件**:
- `saved`: 保存成功时触发，传递保存路径
- `update:modelValue`: 关闭对话框

---

## 8. VFS 目录选择对话框规格

### 8.1 组件概述

**组件名**: `VfsFolderChooserDialog`  
**文件**: `src/components/dialog/VfsFolderChooserDialog.vue`  
**大小**: 236 行  
**职责**: 模态对话框，供其他组件选择虚拟文件系统中的目录

### 8.2 核心功能

#### 8.2.1 目录浏览与选择

**功能描述**: 在对话框中浏览文件系统并选择目录

**交互**:
- 仅显示文件夹，过滤所有文件
- 点击文件夹进入该目录
- 确认选择当前所在目录路径

**输出事件**:
- `select`: 触发时传递 `{ drive, path }`
- `update:modelValue`: 控制对话框显隐

---

## 9. VFS 材质选择对话框规格

### 9.1 组件概述

**组件名**: `VfsMaterialChooserDialog`  
**文件**: `src/components/dialog/VfsMaterialChooserDialog.vue`  
**大小**: 257 行  
**职责**: 模态对话框，专门用于选择材质文件并显示预览缩略图

### 9.2 核心功能

#### 9.2.1 材质文件识别

**功能描述**: 自动识别材质文件并提取预览缩略图

**材质文件命名规则**:
- 材质文件: `*.material.json`
- 缩略图文件: `*_thumbnail.png`（与材质文件同名，替换扩展名）

**文件列表过滤**:
- 仅显示文件夹和 `.material.json` 文件
- 材质文件自动提取标题（去除 `.material.json` 后缀）
- 材质文件自动关联缩略图 URL

#### 9.2.2 缩略图展示

**功能描述**: 在文件列表中显示材质预览缩略图

**展示方式**:
- 有缩略图的材质文件: 显示 140x140 缩略图
- 无缩略图的文件: 显示默认文件图标
- 文件夹: 显示文件夹图标

---

## 10. VFS 服务端规格

### 10.1 组件概述

**文件名**: `vfs-server.js`  
**文件**: `script/vfs-server.js`  
**大小**: 386 行  
**职责**: 基于 Express 的虚拟文件系统后端服务

### 10.2 核心功能

#### 10.2.1 多驱动器配置

**功能描述**: 启动时读取配置文件，动态映射多个驱动器到不同物理路径

**配置文件**: `vfs-server.json`
```json
{
  "vfs": [
    {
      "drive": "vfs",
      "path": "../public/vfs"
    }
  ]
}
```

**配置项**:
- `drive`: 驱动器名称标识
- `path`: 相对于配置文件的物理路径

---

#### 10.2.2 REST API 端点

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/api/list/:drive` | 获取目录列表 |
| GET | `/file/:drive/*` | 获取文件内容 |
| GET | `/exists/:drive/*` | 检查文件存在性 |
| POST | `/save/:drive/*` | 保存文本文件 |
| POST | `/save-base64/:drive/*` | 保存 Base64 二进制文件 |
| POST | `/upload/:drive/*` | 上传文件（FormData） |

---

#### 10.2.3 端口配置

**功能描述**: 支持通过命令行参数指定服务端口

**默认端口**: 3001  
**命令行用法**: `node vfs-server.js 8080`

---

## 11. 元数据生成规格

### 11.1 组件概述

**文件名**: `generate-vfs.js`  
**文件**: `script/generate-vfs.js`  
**大小**: 131 行  
**职责**: 为静态驱动生成目录元数据文件

### 11.2 核心功能

#### 11.2.1 目录元数据生成

**功能描述**: 递归遍历目录，为每个目录生成 `.folder.json` 元数据文件

**生成内容**:
- 目录下的直接子项列表
- 每个子项的路径、名称、扩展名、类型、大小、时间
- 文件夹排在文件前面

#### 11.2.2 全局文件索引生成

**功能描述**: 生成根目录下的 `.all.json` 全局文件索引

**生成内容**:
- 所有文件的扁平列表
- 用于快速存在性检查

#### 11.2.3 命令行参数

**用法**: `node generate-vfs.js <drive> <rootPath> <rootDir>`

**参数**:
- `drive`: 驱动器名称
- `rootPath`: 虚拟根路径
- `rootDir`: 物理根目录（默认 `./`）

---

## 12. 依赖关系

### 12.1 内部依赖

```
VfsFileBrowser → vfs-service
VfsFileChooserDialog → vfs-service
VfsFileSaverDialog → vfs-service
VfsFolderChooserDialog → vfs-service
VfsMaterialChooserDialog → vfs-service
vfs-service → StaticDriveApi
vfs-service → VfsServerApi
SceneViewer → VfsFileBrowser (拖拽事件)
```

### 12.2 外部依赖

| 依赖 | 用途 |
|------|------|
| mime | MIME 类型推断 |
| express | VFS 服务端框架 |
| cors | 跨域支持 |
| multer | 文件上传处理 |
| fs/promises | 文件系统操作 |

---

## 13. 使用示例

### 13.1 注册 VFS 驱动器

```javascript
import vfsService from './services/vfs-service.js';

// 注册服务端驱动器（读写）
vfsService.registerVfs({
  type: 'vfs-server',
  drive: 'models',
  baseURL: 'http://localhost:3001',
  root: '/'
});

// 注册静态驱动器（只读）
vfsService.registerVfs({
  type: 'static',
  drive: 'assets',
  baseURL: '',
  root: '/vfs'
});
```

### 13.2 使用 VFS 读取文件

```javascript
const vfs = vfsService.getVfs('models');

// 获取目录列表
const listing = await vfs.list('/characters');

// 获取文件内容
const content = await vfs.json('/characters/hero.material.json');

// 获取文件 URL
const url = vfs.url('/characters/hero.glb');
```

### 13.3 使用 VFS 保存文件

```javascript
const vfs = vfsService.getVfs('models');

// 保存场景数据
const sceneData = JSON.stringify(editor.exportScene());
const success = await vfs.save('/scenes/my-scene.json', sceneData);
```

---

## 14. 测试要点

### 14.1 单元测试

- [ ] VFS 服务注册与查找
- [ ] 驱动器列表获取
- [ ] 路径工具方法（getParentPath）
- [ ] VFS Server API 各端点调用
- [ ] 静态驱动目录列表读取
- [ ] 静态驱动文件存在性检查
- [ ] 静态驱动写操作拒绝

### 14.2 集成测试

- [ ] VFS Server 启动与多驱动器配置
- [ ] 文件上传端点
- [ ] Base64 保存端点
- [ ] 元数据生成脚本
- [ ] 文件浏览器组件渲染
- [ ] 文件选择对话框交互
- [ ] 文件保存对话框覆盖确认
- [ ] 材质选择对话框缩略图显示
- [ ] 拖拽模型文件到场景

### 14.3 性能测试

- [ ] 大目录列表加载时间
- [ ] 静态驱动 .all.json 存在性检查性能
- [ ] 文件浏览器滚动流畅度

---

## 相关文档

- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)
- [API 清单](../API.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始模块规格文档 |
