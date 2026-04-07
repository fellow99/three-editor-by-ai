# 006-VFS 虚拟文件系统模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-07

---

## 1. 技术上下文

### 1.1 模块定位

虚拟文件系统模块提供统一的文件访问接口，支持本地静态资源和远程 VFS 服务器。

### 1.2 技术约束

- 必须支持多 Drive 配置
- 必须实现 VFS Server API
- 必须实现 Static Drive API

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| VFS Server | Express | 轻量、简单 |
| 多 Drive | JSON 配置 | 灵活可扩展 |
| 静态资源 | .folder.json | 无需后端 |

---

## 2. VFS Server 实现

### 2.1 Express 服务器

```javascript
// vfs-server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 3001;

// 启用 CORS
app.use(cors());

// 加载 Drive 配置
let driveRoots = {};
async function loadDriveConfig() {
  const config = await fs.readFile('./vfs-server.json', 'utf-8');
  const { vfs } = JSON.parse(config);
  
  driveRoots = {};
  vfs.forEach(item => {
    if (item.drive && item.path) {
      driveRoots[item.drive] = path.resolve('./', item.path);
    }
  });
}

// 读取目录（仅一层）
async function readDirCurrent(dir, relPath) {
  const result = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      
      const stat = await fs.stat(path.join(dir, entry.name));
      result.push({
        path: relPath,
        name: entry.name,
        ext: entry.isDirectory() ? '' : path.extname(entry.name).replace('.', ''),
        type: entry.isDirectory() ? 'FOLDER' : 'FILE',
        size: stat.size,
        time: stat.mtime
      });
    }
  } catch (e) {
    console.error('读取目录失败:', e);
  }
  return result;
}
```

### 2.2 API 路由

```javascript
// 获取目录内容
app.get('/api/list/:drive', async (req, res) => {
  const { drive } = req.params;
  const reqPath = req.query.path || '/';
  
  const root = driveRoots[drive];
  if (!root) {
    return res.json({ code: 1, msg: '无效的 drive 参数' });
  }
  
  const absPath = path.join(root, '.' + reqPath);
  try {
    const files = await readDirCurrent(absPath, reqPath);
    res.json({ code: 0, data: { files } });
  } catch (e) {
    res.json({ code: 1, msg: '目录读取失败', error: e.message });
  }
});

// 文件访问
app.get('/file/:drive/*', async (req, res) => {
  const { drive } = req.params;
  const filePath = req.params[0] || '';
  
  const root = driveRoots[drive];
  if (!root) {
    return res.status(404).send('Invalid drive');
  }
  
  const absPath = path.join(root, filePath);
  try {
    await fs.access(absPath);
    res.sendFile(absPath);
  } catch (e) {
    res.status(404).send('File not found');
  }
});

// 检查存在性
app.get('/exists/:drive/*', async (req, res) => {
  const { drive } = req.params;
  const filePath = req.params[0] || '';
  
  const root = driveRoots[drive];
  if (!root) {
    return res.json({ exists: false });
  }
  
  const absPath = path.join(root, filePath);
  try {
    await fs.access(absPath);
    res.json({ exists: true });
  } catch (e) {
    res.json({ exists: false });
  }
});

// 保存文件
app.post('/save/:drive/*', async (req, res) => {
  const { drive } = req.params;
  const filePath = req.params[0] || '';
  
  const root = driveRoots[drive];
  if (!root) {
    return res.status(404).send('Invalid drive');
  }
  
  const absPath = path.join(root, filePath);
  let raw = '';
  
  req.setEncoding('utf8');
  req.on('data', chunk => { raw += chunk; });
  req.on('end', async () => {
    try {
      await fs.writeFile(absPath, raw);
      res.json({ code: 0, msg: '保存成功' });
    } catch (e) {
      res.status(500).json({ code: 1, error: e.message });
    }
  });
});
```

---

## 3. VfsServerApi 客户端

### 3.1 类实现

```javascript
// vfs-server-api.js
export class VfsServerApi {
  constructor(opt) {
    this._drive = opt.drive || 'xx';
    this._baseURL = opt.baseURL || '';
    this._root = opt.root || '';
  }
  
  async list(path) {
    const root = this._root === '/' ? '' : this._root;
    const url = `${this._baseURL}${root}/api/list/${this._drive}?path=${path}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    
    const json = await res.json();
    // 处理路径
    if (json?.data?.files) {
      json.data.files.forEach(item => {
        if (item.path.startsWith('./')) {
          item.path = item.path.substring(1);
        }
      });
    }
    return json;
  }
  
  url(path) {
    const root = this._root === '/' ? '' : this._root;
    path = path === '/' ? '' : path;
    return `${this._baseURL}${root}/file/${this._drive}${path}`;
  }
  
  async content(path) {
    const url = this.url(path);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.text();
  }
  
  async json(path) {
    const url = this.url(path);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  }
  
  async blob(path) {
    const url = this.url(path);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.blob();
  }
  
  async exists(path) {
    const root = this._root === '/' ? '' : this._root;
    path = path === '/' ? '' : path;
    const url = `${this._baseURL}${root}/exists/${this._drive}${path}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) return false;
      const json = await res.json();
      return json?.exists || false;
    } catch (e) {
      return false;
    }
  }
  
  async save(path, text) {
    const root = this._root === '/' ? '' : this._root;
    path = path === '/' ? '' : path;
    const url = `${this._baseURL}${root}/save/${this._drive}${path}`;
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: text,
        headers: { 'Content-Type': 'text/plain' }
      });
      if (!res.ok) return false;
      const json = await res.json();
      return json?.success || false;
    } catch (e) {
      return false;
    }
  }
}
```

---

## 4. StaticDriveApi 实现

### 4.1 类实现

```javascript
// static-drive-api.js
export class StaticDriveApi {
  constructor(opt) {
    this._drive = opt.drive || 'xx';
    this._baseURL = opt.baseURL || '';
    this._root = opt.root || '';
  }
  
  async list(path) {
    const root = this._root === '/' ? '' : this._root;
    path = path === '/' ? '' : path;
    const url = `${this._baseURL}${root}${path}/.folder.json`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  }
  
  url(path) {
    const root = this._root === '/' ? '' : this._root;
    path = path === '/' ? '' : path;
    return `${root}${path}`;
  }
  
  async content(path) {
    const url = this._baseURL + this.url(path);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.text();
  }
  
  async json(path) {
    const url = this._baseURL + this.url(path);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  }
  
  async blob(path) {
    const url = this._baseURL + this.url(path);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.blob();
  }
  
  async exists(path) {
    const root = this._root === '/' ? '' : this._root;
    path = path === '/' ? '' : path;
    const url = `${this._baseURL}${root}/.all.json`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) return false;
      const all = await res.json();
      
      for (let item of all) {
        if (path === `${item.path}/${item.name}`) {
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
```

---

## 5. .folder.json 格式

### 5.1 目录元数据

```json
{
  "path": "/models/gltf",
  "name": "GLTF Models",
  "files": [
    {
      "name": "Horse.glb",
      "type": "FILE",
      "ext": "glb",
      "size": 123456
    },
    {
      "name": "subfolder",
      "type": "FOLDER"
    }
  ]
}
```

### 5.2 生成脚本

```javascript
// generate-vfs.js
import fs from 'fs/promises';
import path from 'path';

async function generateFolderJson(dir, basePath = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    
    const stat = await fs.stat(path.join(dir, entry.name));
    files.push({
      name: entry.name,
      type: entry.isDirectory() ? 'FOLDER' : 'FILE',
      ext: entry.isDirectory() ? '' : path.extname(entry.name).replace('.', ''),
      size: stat.size
    });
  }
  
  const folderJson = {
    path: basePath || '/',
    name: path.basename(dir),
    files
  };
  
  await fs.writeFile(
    path.join(dir, '.folder.json'),
    JSON.stringify(folderJson, null, 2)
  );
  
  // 递归处理子目录
  for (const entry of entries) {
    if (entry.isDirectory()) {
      await generateFolderJson(
        path.join(dir, entry.name),
        path.posix.join(basePath, entry.name)
      );
    }
  }
}

// 使用
await generateFolderJson('./public/vfs');
```

---

## 6. 错误处理

### 6.1 客户端错误处理

```javascript
async function safeList(vfs, path) {
  try {
    return await vfs.list(path);
  } catch (error) {
    console.error('列出目录失败:', path, error);
    return { code: 1, error: error.message };
  }
}

async function safeLoad(vfs, path, type = 'json') {
  try {
    if (type === 'json') {
      return await vfs.json(path);
    } else if (type === 'blob') {
      return await vfs.blob(path);
    } else {
      return await vfs.content(path);
    }
  } catch (error) {
    console.error('加载文件失败:', path, error);
    throw error;
  }
}
```

---

**版本**: 1.0 | **日期**: 2026-04-07
