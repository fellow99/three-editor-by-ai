# 006-VFS 虚拟文件系统模块 - 技术方案

**模块版本**: 1.0.0  
**生成日期**: 2026-04-14  
**最后更新**: 2026-04-14

---

## 1. 技术上下文

### 1.1 模块定位

虚拟文件系统模块是 Three Editor by AI 的资源管理层核心，负责统一管理编辑器内所有文件的浏览、读取、写入和拖拽交互。通过抽象多种存储后端为统一的虚拟文件系统接口，为编辑器提供一致的文件操作体验。

### 1.2 技术约束

- 必须使用 Vue 3 Composition API (`<script setup>`)
- 必须使用 Element Plus 对话框和选择器组件
- 必须支持双模式驱动（服务端读写 + 静态只读）
- 必须支持多驱动器配置
- 必须支持拖拽模型文件到三维场景
- 必须使用 Fetch API 进行网络请求

### 1.3 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 事件通信 | mitt 事件总线 | 与项目其他模块保持一致 |
| 文件拖拽 | HTML5 Drag & Drop API | 原生支持，无需额外依赖 |
| MIME 类型 | mime 库 | 准确的扩展名到 MIME 映射 |
| 服务端框架 | Express | 轻量、成熟、生态丰富 |
| 文件上传 | multer | Express 生态标准上传中间件 |
| 元数据格式 | JSON (`.folder.json`, `.all.json`) | 轻量、易读、前端直接解析 |

---

## 2. VFS 服务技术设计

### 2.1 模块结构

```javascript
// src/services/vfs-service.js
import mime from 'mime';
import { StaticDriveApi } from './static-drive-api';
import { VfsServerApi } from './vfs-server-api';

const driveMap = {};

export default {
  registerVfs,   // 注册驱动器
  listVfs,       // 列出所有驱动器
  getVfs,        // 获取指定驱动器
  getMimetype,   // 获取 MIME 类型
  getParentPath  // 获取上级目录
};
```

### 2.2 驱动器注册实现

```javascript
function registerVfs(opt) {
  opt = opt || {};
  let { type, drive } = opt;
  let vfs = null;
  
  if (type === 'static') {
    vfs = driveMap[drive] = new StaticDriveApi(opt);
  } else if (type === 'vfs-server') {
    vfs = driveMap[drive] = new VfsServerApi(opt);
  } else if (type === 'asset-server') {
    vfs = driveMap[drive] = new VfsServerApi(opt);
  }
  
  return vfs;
}
```

**设计要点**:
- `driveMap` 为模块级闭包变量，外部无法直接访问
- `asset-server` 类型复用 `VfsServerApi`，仅语义区分
- 注册时直接返回实例，便于链式调用

### 2.3 路径工具实现

```javascript
function getParentPath(path) {
  if (!path || path === '/') return '/';
  var strs = path.split('/');
  var ret = '';
  strs.forEach((str, idx) => {
    if (!str) return;
    if (idx >= strs.length - 1) return;
    ret += '/' + str;
  });
  if (!ret) ret = '/';
  return ret;
}
```

**边界情况处理**:
- 空路径或根路径返回 `/`
- 单级路径如 `/models` 返回 `/`
- 多级路径如 `/models/characters` 返回 `/models`

---

## 3. VFS Server API 技术设计

### 3.1 类结构

```javascript
// src/services/vfs-server-api.js
export class VfsServerApi {
  constructor(opt) {
    this._drive = opt.drive || 'xx';
    this._baseURL = opt.baseURL || '';
    this._root = opt.root;
    this.type = opt.type || 'vfs-server';
  }
  
  // 读取方法
  async list(path) { ... }
  url(path) { ... }
  async content(path) { ... }
  async json(path) { ... }
  async blob(path) { ... }
  async exists(path) { ... }
  
  // 写入方法
  async save(path, text) { ... }
}
```

### 3.2 目录列表实现

```javascript
async list(path) {
  let drive = this._drive;
  let root = this._root;
  root = (root === '/' ? '' : root);
  let url = `${this._baseURL}${root}/api/list/${drive}?path=${path}`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    let json = await res.json();
    
    // 路径规范化：去掉 item.path 开头的 .
    json && json.data && json.data.files && json.data.files.forEach(item => {
      if (item.path.startsWith('./')) {
        item.path = item.path.substring(1);
      }
    });
    
    return json;
  } catch (e) {
    throw e;
  }
}
```

**设计要点**:
- 路径规范化处理服务端返回的 `./` 前缀
- 错误直接抛出，由调用方处理

### 3.3 文件内容读取实现

```javascript
async content(path) {
  let drive = this._drive;
  let root = this._root;
  root = (root === '/' ? '' : root);
  path = (path === '/' ? '' : path);
  let url = `${this._baseURL}${root}/file/${drive}${path}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return await res.text();
}

async json(path) {
  // 同 content，但返回 res.json()
}

async blob(path) {
  // 同 content，但返回 res.blob()
}
```

### 3.4 文件保存实现

```javascript
async save(path, text) {
  let drive = this._drive;
  let root = this._root;
  root = (root === '/' ? '' : root);
  path = (path === '/' ? '' : path);
  let url = `${this._baseURL}${root}/save/${drive}${path}`;
  
  try {
    let body = text;
    let headers = { 'Content-Type': 'text/plain' };
    const res = await fetch(url, { method: 'POST', body, headers });
    if (!res.ok) return false;
    const json = await res.json();
    return json && json.success;
  } catch (e) {
    return false;
  }
}
```

---

## 4. 静态驱动技术设计

### 4.1 类结构

```javascript
// src/services/static-drive-api.js
export class StaticDriveApi {
  constructor(opt) {
    this._drive = opt.drive || 'xx';
    this._baseURL = opt.baseURL || '';
    this._root = opt.root;
    this.type = opt.type || 'static';
  }
  
  // 读取方法（与 VfsServerApi 接口一致）
  async list(path) { ... }
  url(path) { ... }
  async content(path) { ... }
  async json(path) { ... }
  async blob(path) { ... }
  async exists(path) { ... }
  
  // 写操作（全部抛出错误）
  mkdir(path) { throw new Error('Unsupported operation.'); }
  rmdir(path) { throw new Error('Unsupported operation.'); }
  rm(path) { throw new Error('Unsupported operation.'); }
  mv(path, to) { throw new Error('Unsupported operation.'); }
  cp(path, to) { throw new Error('Unsupported operation.'); }
  save(path, text) { throw new Error('Unsupported operation.'); }
  saveUrl(path, saveUrl) { throw new Error('Unsupported operation.'); }
}
```

### 4.2 目录列表实现

```javascript
async list(path) {
  let root = this._root;
  root = (root === '/' ? '' : root);
  path = (path === '/' ? '' : path);
  let url = `${this._baseURL}${root}${path}/.folder.json`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return await res.json();
}
```

**设计要点**:
- 通过读取 `.folder.json` 获取目录内容
- 元数据文件由 `generate-vfs.js` 脚本预生成
- 无需服务端支持，纯静态文件即可

### 4.3 存在性检查实现

```javascript
async exists(path) {
  let root = this._root;
  root = (root === '/' ? '' : root);
  path = (path === '/' ? '' : path);
  let url = `${this._baseURL}${root}/.all.json`;
  
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const all = await res.json();
    
    let exists = false;
    for (let i = 0; i < all.length; i++) {
      let item = all[i];
      if (path === `${item.path}/${item.name}`) {
        exists = true;
        break;
      }
    }
    return exists;
  } catch (e) {
    return false;
  }
}
```

**设计要点**:
- 通过读取 `.all.json` 全局索引进行存在性检查
- 线性遍历匹配路径，适用于中小规模文件库
- 大规模场景可考虑改用 Set 或二分查找优化

---

## 5. VFS 文件浏览器技术设计

### 5.1 组件结构

```vue
<!-- src/components/editor/VfsFileBrowser.vue -->
<script setup>
import { ref, shallowRef, onMounted, watch } from 'vue';
import vfsService from '../../services/vfs-service.js';

// 响应式状态
const vfsList = shallowRef([]);        // 已注册驱动器列表
const selectedDrive = ref('');         // 当前选中驱动器名
const currentVfs = shallowRef(null);   // 当前 VFS 实例
const currentPath = ref('/');          // 当前目录路径
const files = shallowRef([]);          // 当前目录文件列表

// 核心方法
async function loadVfsList() { ... }
async function loadFiles() { ... }
function onDriveChange() { ... }
function onItemClick(item) { ... }
function goParent() { ... }
function onItemDrag(file, event) { ... }
</script>
```

### 5.2 拖拽到场景实现

```javascript
function onItemDrag(file, event) {
  const modelExts = ['.glb', '.gltf', '.fbx', '.obj'];
  const ext = file.name 
    ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() 
    : '';
  
  if (file.type !== 'FILE') return;
  
  if (modelExts.includes(ext)) {
    // 模型文件拖拽
    event.dataTransfer.setData('application/x-model-file', JSON.stringify({
      drive: currentVfs.value?._drive,
      path: file.path,
      name: file.name,
      type: file.type,
      url: file.url
    }));
  } else if (ext === '.json') {
    // 场景文件拖拽
    event.dataTransfer.setData('application/x-scene-file', JSON.stringify({
      drive: currentVfs.value?._drive,
      path: file.path,
      name: file.name,
      type: file.type,
      url: file.url
    }));
  }
}
```

**与 SceneViewer 的集成**:
- `SceneViewer.vue` 监听 `drop` 事件
- 读取 `application/x-model-file` 类型数据
- 调用 `useAssetsManager.loadModel()` 加载模型
- 自动放置到当前视点位置

### 5.3 响应式更新机制

```javascript
// 组件挂载时加载驱动器列表
onMounted(() => {
  loadVfsList();
});

// 监听驱动器和路径变化，自动加载文件列表
watch([currentVfs, currentPath], () => {
  loadFiles();
});
```

---

## 6. VFS 文件选择对话框技术设计

### 6.1 组件结构

```vue
<!-- src/components/dialog/VfsFileChooserDialog.vue -->
<script setup>
import { ref, shallowRef, onMounted, watch } from 'vue';
import { ElDialog, ElButton } from 'element-plus';
import vfsService from '@/services/vfs-service.js';

const emit = defineEmits(['select', 'update:modelValue']);

const visible = ref(false);
const selectedDrive = ref('');
const vfsList = shallowRef([]);
const currentVfs = shallowRef(null);
const currentPath = ref('/');
const files = shallowRef([]);
const selectedFile = shallowRef(null);
const loading = ref(false);
</script>
```

### 6.2 文件列表排序实现

```javascript
async function loadFiles() {
  if (!currentVfs.value) return;
  loading.value = true;
  
  try {
    const res = await currentVfs.value.list(currentPath.value);
    let list = (res && res.data && res.data.files) ? res.data.files : [];
    
    // 排序：文件夹在前，文件在后；同类按名称字母排序
    list = list.sort((a, b) => {
      if (a.type === 'FOLDER' && b.type === 'FILE') return -1;
      if (a.type === 'FILE' && b.type === 'FOLDER') return 1;
      return a.name.localeCompare(b.name);
    });
    
    files.value = list;
  } catch (err) {
    console.error('加载文件列表失败', err);
    files.value = [];
  }
  
  loading.value = false;
}
```

### 6.3 驱动器过滤

```javascript
async function loadVfsList() {
  // 仅显示 vfs-server 类型的驱动器（可读写）
  vfsList.value = vfsService.listVfs().filter(v => v.type === 'vfs-server');
  
  if (vfsList.value.length > 0 && !selectedDrive.value) {
    selectedDrive.value = vfsList.value[0]._drive;
    currentVfs.value = vfsList.value[0];
  }
}
```

---

## 7. VFS 文件保存对话框技术设计

### 7.1 Props 定义

```javascript
const props = defineProps({
  modelValue: Boolean,    // 控制对话框显隐
  text: String,           // 待保存的内容
  ext: {                  // 文件扩展名
    type: String,
    default: 'json'
  }
});

const emit = defineEmits(['update:modelValue', 'saved']);
```

### 7.2 覆盖检测实现

```javascript
// 监听文件名和文件列表变化，实时检测是否覆盖
watch([fileName, files], () => {
  overwrite.value = files.value.some(
    f => f.type === 'FILE' && f.name === fileName.value + '.' + props.ext
  );
});
```

### 7.3 保存执行实现

```javascript
async function handleSave() {
  if (!fileName.value) {
    ElMessage.error('请输入文件名');
    return;
  }
  
  saving.value = true;
  try {
    const vfs = await vfsService.getVfs(selectedDrive.value);
    const path = currentPath.value + '/' + fileName.value + '.' + props.ext;
    await vfs.save(path, props.text);
    
    ElMessage.success(overwrite.value ? '覆盖保存成功' : '保存成功');
    emit('saved', path);
    emit('update:modelValue', false);
  } catch (e) {
    ElMessage.error('保存失败：' + e.message);
  }
  
  saving.value = false;
}
```

---

## 8. VFS 目录选择对话框技术设计

### 8.1 文件夹过滤实现

```javascript
async function loadFiles() {
  if (!currentVfs.value) return;
  loading.value = true;
  
  try {
    const res = await currentVfs.value.list(currentPath.value);
    let list = (res && res.data && res.data.files) ? res.data.files : [];
    
    // 仅保留文件夹
    list = list.filter(item => item.type === 'FOLDER');
    files.value = list;
  } catch (e) {
    files.value = [];
  }
  
  loading.value = false;
}
```

### 8.2 确认选择实现

```javascript
function confirmSelect() {
  emit('select', {
    drive: currentVfs.value?._drive,
    path: currentPath.value,
  });
  closeDialog();
}
```

---

## 9. VFS 材质选择对话框技术设计

### 9.1 材质文件识别实现

```javascript
async function loadFiles() {
  if (!currentVfs.value) return;
  loading.value = true;
  
  try {
    const res = await currentVfs.value.list(currentPath.value);
    let list = (res && res.data && res.data.files) ? res.data.files : [];
    
    // 过滤：仅保留文件夹和 .material.json 文件
    list = list.filter(item => {
      return item.type === 'FOLDER' || 
        item.name.lastIndexOf('.material.json') === item.name.length - 14;
    });
    
    // 排序
    list = list.sort((a, b) => {
      if (a.type === 'FOLDER' && b.type === 'FILE') return -1;
      if (a.type === 'FILE' && b.type === 'FOLDER') return 1;
      return a.name.localeCompare(b.name);
    });
    
    // 提取材质标题和缩略图 URL
    list.forEach(item => {
      if (item.name.lastIndexOf('.material.json') === item.name.length - 14) {
        item.title = item.name.substring(0, item.name.length - 14);
        let thumbnail = item.name.replace('.material.json', '_thumbnail.png');
        item.thumbnail = currentVfs.value.url(currentPath.value + '/' + thumbnail);
      }
    });
    
    files.value = list;
  } catch (err) {
    console.error('加载文件列表失败', err);
    files.value = [];
  }
  
  loading.value = false;
}
```

### 9.2 缩略图渲染

```vue
<div class="file-icon">
  <span v-if="item.type === 'FOLDER'">📁</span>
  <span v-else-if="item.thumbnail">
    <img :src="item.thumbnail" alt="thumbnail" 
         style="width:140px; height:140px; object-fit:cover; border-radius:4px;" />
  </span>
  <span v-else>📄</span>
</div>
```

---

## 10. VFS 服务端技术设计

### 10.1 服务启动与配置加载

```javascript
// script/vfs-server.js
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 端口配置
let PORT = 3001;
const portArg = process.argv.find(arg => /^\d+$/.test(arg));
if (portArg) {
  PORT = parseInt(portArg, 10);
}

// 驱动器配置加载
const VFS_CONFIG_PATH = path.resolve(__dirname, "vfs-server.json");
let driveRoots = {};

async function loadDriveConfig() {
  try {
    const configRaw = await fs.readFile(VFS_CONFIG_PATH, "utf-8");
    const config = JSON.parse(configRaw);
    if (Array.isArray(config.vfs)) {
      driveRoots = {};
      for (const item of config.vfs) {
        if (item.drive && item.path) {
          driveRoots[item.drive] = path.resolve(__dirname, item.path);
        }
      }
    }
  } catch (e) {
    console.error("读取vfs-server.json失败：", e);
  }
}

await loadDriveConfig();
```

### 10.2 目录列表 API 实现

```javascript
app.get("/api/list/:drive", async (req, res) => {
  const drive = req.params.drive;
  let reqPath = req.query.path || "/";
  if (!reqPath.startsWith("/")) reqPath = "/" + reqPath;
  
  const root = driveRoots[drive];
  if (!root) {
    res.json({ code: 1, msg: "无效的drive参数" });
    return;
  }
  
  const absPath = path.join(root, "." + reqPath);
  try {
    const files = await readDirCurrent(absPath, reqPath);
    res.json({ code: 0, data: { files } });
  } catch (e) {
    res.json({ code: 1, msg: "目录读取失败", error: e.message });
  }
});
```

### 10.3 目录读取实现

```javascript
async function readDirCurrent(dir, relPath = "/") {
  const result = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue; // 跳过隐藏文件
      
      const entryPath = path.join(dir, entry.name);
      const entryRelPath = path.posix.join(relPath, entry.name);
      const stat = await fs.stat(entryPath);
      
      if (entry.isDirectory()) {
        result.push({
          path: relPath,
          name: entry.name,
          ext: "",
          type: "FOLDER",
          size: 0,
          time: null
        });
      } else {
        result.push({
          path: relPath,
          name: entry.name,
          ext: path.extname(entry.name).replace(".", ""),
          type: "FILE",
          size: stat.size,
          time: stat.mtime
        });
      }
    }
  } catch (e) {
    // 目录不存在或无权限
  }
  return result;
}
```

### 10.4 文件访问 API 实现

```javascript
app.get("/file/:drive/*", async (req, res) => {
  const drive = req.params.drive;
  const filePath = req.params[0] || "";
  const root = driveRoots[drive];
  
  if (!root) {
    res.status(404).send("Invalid drive");
    return;
  }
  
  const absPath = path.join(root, filePath);
  try {
    await fs.access(absPath);
    res.sendFile(absPath);
  } catch (e) {
    res.status(404).send("File not found");
  }
});
```

### 10.5 文件保存 API 实现

```javascript
app.post('/save/:drive/*', function (req, res, next) {
  try {
    var drive = req.params.drive;
    var drivepath = req.params[0];
    const root = driveRoots[drive];
    
    if (!root) {
      res.status(404).send("Invalid drive");
      return;
    }
    
    // 路径规范化
    if (!drivepath) {
      drivepath = './';
    } else if (drivepath[0] === '/') {
      drivepath = '.' + drivepath;
    } else {
      drivepath = './' + drivepath;
    }
    
    const absPath = path.join(root, drivepath);
    var raw = '';
    
    req.setEncoding('utf8');
    req.on('data', function (chunk) { raw += chunk; });
    req.on('end', async function () {
      try {
        await fs.writeFile(absPath, raw);
        // 返回保存结果
        res.send(JSON.stringify({
          code: 0,
          data: { config: { drive, path: drivepath }, file: { ... } },
          msg: '操作成功'
        }));
      } catch (e) {
        res.status(500).send(e.message);
      }
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});
```

### 10.6 Base64 保存 API 实现

```javascript
app.post('/save-base64/:drive/*', function (req, res, next) {
  // 路径处理同上
  req.on('end', function () {
    let buf = Buffer.from(raw, 'base64');
    fs.writeFileSync(absPath, buf);
    // 返回结果
  });
});
```

### 10.7 文件上传 API 实现

```javascript
// multer 配置
const FILE_SERVER_REPO = './tmp/';
var multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FILE_SERVER_REPO);
  },
  filename: function (req, file, cb) {
    var extname = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + extname);
  }
});
var upload = multer({ multerStorage });

app.post('/upload/:drive/*', upload.any(), async function (req, res, next) {
  // 处理上传文件
  if (!req.files || !req.files[0]) {
    throw new Error('Upload file not found.');
  }
  // 将上传文件移动到目标路径
});
```

---

## 11. 元数据生成脚本技术设计

### 11.1 脚本结构

```javascript
// script/generate-vfs.js
import fs from 'fs';
import path from 'path';

var args = process.argv.splice(2);
var drive = args[0] || '';
var rootPath = args[1] || '';
var rootDir = args[2] || './';
var root = path.join(process.cwd(), rootDir);
```

### 11.2 递归目录元数据生成

```javascript
function metadataRecurse(parent, pp) {
  var parentPath = path.join(root, parent);
  var files = fs.readdirSync(parentPath);
  var metadata = { data: { files: [] } };
  
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (file == ".folder.json" || file == ".all.json" || 
        file == "uni.json" || file == "Thumbs.db") continue;
    
    var ext = path.extname(file);
    if (ext && ext.indexOf(".") == 0) ext = ext.substr(1);
    
    var child = (parent == "/" ? parent : parent + "/") + file;
    var childPath = path.join(parentPath, file);
    var fileinfo = fs.statSync(childPath);
    var type = "FILE";
    
    if (!fileinfo.isFile()) {
      type = "FOLDER";
      metadataRecurse(child, parent); // 先递归子目录
    }
    
    var meta = {
      "path": parent,
      "name": file,
      "ext": ext,
      "type": type,
      "size": 0,
      "time": null,
      "url": `/${drive}${rootPath}${parent}/${file}`
    };
    
    if (type == "FOLDER") {
      metadata.data.files.unshift(meta); // 文件夹放前面
    } else {
      metadata.data.files.push(meta);
    }
  }
  
  metadata.code = 0;
  var text = JSON.stringify(metadata, null, 2);
  var metafile = path.join(parentPath, '.folder.json');
  fs.writeFileSync(metafile, text);
}
```

### 11.3 全局文件索引生成

```javascript
function metadataAll(root) {
  var recurse = function(metadata, parent, pp) {
    var parentPath = path.join(root, parent);
    var files = fs.readdirSync(parentPath);
    
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file == ".folder.json" || file == ".all.json" || 
          file == "uni.json" || file == "Thumbs.db") continue;
      
      var child = (parent == "/" ? parent : parent + "/") + file;
      var childPath = path.join(parentPath, file);
      var fileinfo = fs.statSync(childPath);
      var type = "FILE";
      
      if (!fileinfo.isFile()) {
        type = "FOLDER";
        recurse(metadata, child, parent);
      }
      
      var meta = {
        "path": parent,
        "name": file,
        "ext": path.extname(file).replace('.', ''),
        "type": type,
        "size": 0,
        "time": null,
        "url": `/${drive}${rootPath}${parent}/${file}`
      };
      
      if (type !== "FOLDER") {
        metadata.data.files.push(meta);
      }
    }
  };
  
  var metadata = { data: { files: [] } };
  recurse(metadata, "/", null);
  metadata.code = 0;
  
  var metafile = path.join(root, '.all.json');
  fs.writeFileSync(metafile, JSON.stringify(metadata, null, 2));
}
```

---

## 12. 性能优化

### 12.1 静态驱动元数据预生成

**策略**: 使用 `generate-vfs.js` 脚本预生成 `.folder.json` 和 `.all.json`

**优势**:
- 避免运行时递归扫描文件系统
- 前端直接 fetch JSON，无需服务端处理
- 适合打包发布的资源库场景

**生成时机**:
- 资源库更新后手动运行
- 可集成到 CI/CD 流程中

### 12.2 目录列表缓存

**策略**: 前端组件通过 Vue 响应式系统缓存已加载的目录内容

**实现**:
```javascript
// VfsFileBrowser.vue 中
watch([currentVfs, currentPath], () => {
  loadFiles(); // 路径变化时重新加载
});
```

**优化方向**:
- 可引入 LRU 缓存避免重复请求
- 可引入 WebSocket 实现文件变更推送

### 12.3 按需加载

**策略**: 仅加载当前目录的直接子项，不递归加载

**实现**:
- VFS Server: `readDirCurrent()` 只读取当前层
- 静态驱动: `.folder.json` 只包含当前层
- 子目录内容在用户点击进入时按需加载

---

## 13. 错误处理

### 13.1 网络请求错误

```javascript
async list(path) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    return await res.json();
  } catch (e) {
    throw e; // 由调用方处理
  }
}
```

### 13.2 驱动器未找到错误

```javascript
function getVfs(drive) {
  let vfs = driveMap[drive];
  if (!vfs) throw new Error('VFS not found: ' + drive);
  return vfs;
}
```

### 13.3 静态驱动写操作拒绝

```javascript
mkdir(path) {
  throw new Error('Unsupported operation.');
}
```

### 13.4 服务端路径安全

```javascript
// vfs-server.js 中
const absPath = path.join(root, "." + reqPath);
// 使用 path.join 防止路径穿越攻击
// 但当前实现未做严格的根目录校验，生产环境需加强
```

---

## 14. 测试策略

### 14.1 单元测试

```javascript
describe('vfs-service', () => {
  test('注册和获取驱动器', () => {
    const vfs = vfsService.registerVfs({
      type: 'static',
      drive: 'test',
      baseURL: '',
      root: '/vfs'
    });
    
    expect(vfsService.getVfs('test')).toBe(vfs);
    expect(vfsService.listVfs()).toContain(vfs);
  });
  
  test('获取不存在的驱动器抛出错误', () => {
    expect(() => vfsService.getVfs('nonexistent'))
      .toThrow('VFS not found');
  });
  
  test('getParentPath 路径计算', () => {
    expect(vfsService.getParentPath('/')).toBe('/');
    expect(vfsService.getParentPath('/models')).toBe('/');
    expect(vfsService.getParentPath('/models/chars')).toBe('/models');
  });
});
```

### 14.2 集成测试

```javascript
describe('VFS Server API', () => {
  test('目录列表获取', async () => {
    const vfs = vfsService.registerVfs({
      type: 'vfs-server',
      drive: 'test',
      baseURL: 'http://localhost:3001',
      root: '/'
    });
    
    const result = await vfs.list('/');
    expect(result.code).toBe(0);
    expect(result.data.files).toBeDefined();
  });
  
  test('文件保存和读取', async () => {
    const vfs = vfsService.getVfs('test');
    const content = '{"test": true}';
    
    await vfs.save('/test-save.json', content);
    const read = await vfs.json('/test-save.json');
    expect(read.test).toBe(true);
  });
});
```

### 14.3 组件测试

```javascript
describe('VfsFileBrowser', () => {
  test('渲染驱动器选择器', async () => {
    const wrapper = mount(VfsFileBrowser);
    await wrapper.vm.$nextTick();
    
    expect(wrapper.find('select').exists()).toBe(true);
  });
  
  test('点击文件夹进入目录', async () => {
    const wrapper = mount(VfsFileBrowser);
    // 模拟文件列表
    wrapper.vm.files = [{ type: 'FOLDER', path: '/', name: 'models' }];
    await wrapper.vm.$nextTick();
    
    await wrapper.find('.vfs-item.folder').trigger('click');
    expect(wrapper.vm.currentPath).toBe('/models');
  });
  
  test('拖拽模型文件设置数据', async () => {
    const wrapper = mount(VfsFileBrowser);
    wrapper.vm.currentVfs = { _drive: 'test' };
    
    const file = { 
      type: 'FILE', 
      name: 'model.glb', 
      path: '/models',
      url: '/test/models/model.glb'
    };
    
    const event = { 
      dataTransfer: { setData: vi.fn() } 
    };
    
    wrapper.vm.onItemDrag(file, event);
    expect(event.dataTransfer.setData).toHaveBeenCalledWith(
      'application/x-model-file',
      expect.stringContaining('model.glb')
    );
  });
});
```

---

## 15. 依赖关系

### 15.1 NPM 依赖

```json
{
  "dependencies": {
    "mime": "^4.0.0"
  },
  "devDependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5"
  }
}
```

### 15.2 内部依赖

```
VfsFileBrowser.vue → vfs-service.js
VfsFileChooserDialog.vue → vfs-service.js
VfsFileSaverDialog.vue → vfs-service.js
VfsFolderChooserDialog.vue → vfs-service.js
VfsMaterialChooserDialog.vue → vfs-service.js
vfs-service.js → static-drive-api.js
vfs-service.js → vfs-server-api.js
SceneViewer.vue → VfsFileBrowser.vue (拖拽事件消费)
vfs-server.js → vfs-server.json (配置)
generate-vfs.js → 静态资源目录 (元数据生成)
```

### 15.3 文件清单

| 文件 | 路径 | 行数 | 职责 |
|------|------|------|------|
| vfs-service.js | `src/services/` | 70 | VFS 注册中心与工厂 |
| vfs-server-api.js | `src/services/` | 162 | 服务端读写客户端 |
| static-drive-api.js | `src/services/` | 183 | 静态只读适配器 |
| VfsFileBrowser.vue | `src/components/editor/` | 251 | 文件浏览面板 |
| VfsFileChooserDialog.vue | `src/components/dialog/` | 249 | 文件选择对话框 |
| VfsFileSaverDialog.vue | `src/components/dialog/` | 244 | 文件保存对话框 |
| VfsFolderChooserDialog.vue | `src/components/dialog/` | 236 | 目录选择对话框 |
| VfsMaterialChooserDialog.vue | `src/components/dialog/` | 257 | 材质选择对话框 |
| vfs-server.js | `script/` | 386 | VFS 后端服务 |
| generate-vfs.js | `script/` | 131 | 元数据生成脚本 |
| vfs-server.json | `script/` | 8 | 多驱动器配置 |

---

## 相关文档

- [模块规格](./spec.md)
- [架构设计](../ARCHITECTURE.md)
- [数据模型](../overall-data-model.md)

---

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-14 | 初始技术方案 |
