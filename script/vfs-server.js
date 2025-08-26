/**
 * 虚拟文件系统服务
 * 功能：虚拟文件系统后端服务，提供目录与文件列表API，供前端资源浏览器调用。
 * 支持跨域，可与前端分离部署。
 * - /api/list/:drive?path= 路由，返回指定目录下的文件和文件夹结构
 * - /file/:drive/* 路由，返回指定文件内容，支持二进制
 * - /exist/:drive/* 路由，检查指定文件或目录是否存在
 * 
 * 新增：支持多 drive，启动时读取同目录 vfs-server.json，按配置动态映射 drive 到不同根路径。
 * 新语法：fs/promises、import.meta.url、ESM下__dirname、JSON配置动态加载
 * 新增：服务端口PORT可通过命令行参数传入，如 node vfs-server.js 8080，默认3001
 */

import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// 兼容ESM下的__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// 支持通过命令行参数传入端口，默认3001
let PORT = 3001;
const portArg = process.argv.find(arg => /^\d+$/.test(arg));
if (portArg) {
    PORT = parseInt(portArg, 10);
}

// 读取 vfs-server.json 配置，构建 drive 映射
const VFS_CONFIG_PATH = path.resolve(__dirname, "vfs-server.json");
/**
 * driveRoots: { [drive: string]: 绝对路径 }
 */
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
        driveRoots = {};
    }
}
// 启动时加载一次
await loadDriveConfig();

// 只读取当前目录内容，不递归子目录
/**
 * 读取指定目录下的文件和文件夹（仅一层，不递归）
 * @param {string} dir 绝对路径
 * @param {string} relPath 相对虚拟根目录的路径（以/开头）
 * @returns {Promise<Array>} 文件和文件夹对象数组
 */
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
                // 文件夹
                result.push({
                    path: relPath,
                    name: entry.name,
                    ext: "",
                    type: "FOLDER",
                    size: 0,
                    time: null,
                    url: `/three-editor-by-ai/vfs${entryRelPath}`,
                });
            } else {
                // 文件
                result.push({
                    path: relPath,
                    name: entry.name,
                    ext: path.extname(entry.name).replace(".", ""),
                    type: "FILE",
                    size: stat.size,
                    time: stat.mtime,
                    url: `/three-editor-by-ai/vfs${entryRelPath}`,
                });
            }
        }
    } catch (e) {
        // 目录不存在或无权限
    }
    return result;
}

// 启用 CORS
app.use(cors());

/**
 * 获取目录内容API
 * GET /api/list/:drive?path=xxx
 * @param {string} drive 虚拟盘符（实际未用，仅做路由占位）
 * @param {string} path 查询路径，默认为/
 * 返回：{ code: 0, data: { files: [...] } }
 */
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

// 文件访问接口：/file/:drive/*
// 返回指定虚拟文件内容，支持二进制
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
        // 检查文件是否存在
        await fs.access(absPath);
        res.sendFile(absPath);
    } catch (e) {
        res.status(404).send("File not found");
    }
});

/**
 * 判断文件或目录是否存在
 * GET /exists/:drive/*
 * 返回：{ exists: true/false }
 */
app.get("/exists/:drive/*", async (req, res) => {
    const drive = req.params.drive;
    const filePath = req.params[0] || "";
    const root = driveRoots[drive];
    if (!root) {
        res.json({ exists: false });
        return;
    }
    const absPath = path.join(root, filePath);
    try {
        await fs.access(absPath);
        res.json({ exists: true });
    } catch (e) {
        res.json({ exists: false });
    }
});

// 启动服务
app.listen(PORT, () => {
    console.log(`VFS Server running at http://localhost:${PORT}`);
});
