# Three Editor by AI - REST API 清单

**生成日期**: 2026-04-14  
**项目版本**: 0.1.0  
**API 版本**: v1

---

## 概述

本项目包含两套文件系统 API：

1. **虚拟文件系统 API (VFS Server)** - 后端 Express 服务，支持读写操作
2. **静态文件系统 API (Static Drive)** - 静态资源访问，只读操作

---

## 虚拟文件系统 API (VFS Server)

**服务地址**: `http://localhost:3001` (默认端口，可通过命令行参数修改)  
**入口文件**: `script/vfs-server.js`  
**前端封装**: `src/services/vfs-server-api.js`

### 配置说明

VFS Server 支持多 drive 配置，通过 `script/vfs-server.json` 定义 drive 到本地路径的映射。

---

### API 列表

| API 路径 | Method | 用途 | 相关入口代码文件 |
|----------|--------|------|------------------|
| `/api/list/:drive` | GET | 获取指定虚拟驱动器中目录的文件和文件夹列表 | `script/vfs-server.js`, `src/services/vfs-server-api.js` |
| `/file/:drive/*` | GET | 获取文件的直接访问 URL 或文件内容（支持二进制和文本） | `script/vfs-server.js`, `src/services/vfs-server-api.js` |
| `/exists/:drive/*` | GET | 判断指定虚拟驱动器中的文件或目录是否存在 | `script/vfs-server.js`, `src/services/vfs-server-api.js` |
| `/save/:drive/*` | POST | 保存文本内容到指定文件 | `script/vfs-server.js`, `src/services/vfs-server-api.js` |
| `/save-base64/:drive/*` | POST | 将 Base64 编码的数据解码并保存为文件 | `script/vfs-server.js` |
| `/upload/:drive/*` | POST | 上传文件到指定目录（multipart/form-data） | `script/vfs-server.js` |

---

## 静态文件系统 API (Static Drive)

**服务地址**: 静态资源（通过 Vite 开发服务器或直接访问 public 目录）  
**入口文件**: 无（静态文件，位于 `public/vfs/`）  
**前端封装**: `src/services/static-drive-api.js`

### 配置说明

静态文件系统读取 `public/vfs/` 目录下的资源，通过 `.folder.json` 和 `.all.json` 提供目录元数据和完整索引。

---

### API 列表

| API 路径 | Method | 用途 | 相关入口代码文件 |
|----------|--------|------|------------------|
| `{path}/.folder.json` | GET | 获取静态目录的元数据信息（文件和子目录列表） | `src/services/static-drive-api.js` |
| `{root}/{path}` | GET | 获取静态文件的访问 URL 或文件内容 | `src/services/static-drive-api.js` |
| `{root}/.all.json` | GET | 通过完整索引文件检查静态文件是否存在 | `src/services/static-drive-api.js` |

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

## VFS 服务注册表 (VFS Service Registry)

**统一接口**: `src/services/vfs-service.js`

VFS Service 封装了 VFS Server API 和 Static Drive API，提供统一的文件系统接口，前端通过此服务透明调用底层 API。

| 方法 | 用途 | 底层实现 |
|------|------|---------|
| `list(path)` | 列出目录内容 | VFS Server API 或 Static Drive API |
| `content(path)` | 获取文件文本内容 | VFS Server API 或 Static Drive API |
| `json(path)` | 获取文件 JSON 内容 | VFS Server API 或 Static Drive API |
| `blob(path)` | 获取文件 Blob 内容 | VFS Server API 或 Static Drive API |
| `url(path)` | 获取文件访问 URL | VFS Server API 或 Static Drive API |
| `exists(path)` | 检查文件是否存在 | VFS Server API 或 Static Drive API |
| `save(path, text)` | 保存文本文件 | VFS Server API |
| `saveBase64(path, data)` | 保存 Base64 数据 | VFS Server API |
| `upload(path, formData)` | 上传文件 | VFS Server API |

> 注：Static Drive 为只读，写入类操作（save、upload 等）仅由 VFS Server API 支持。

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1 | 2026-04-14 | 初始版本，包含 VFS Server API（6 端点）、Static Drive API（3 端点）和 VFS Service Registry |
