// script/vfs-server.js
// 功能：虚拟文件系统后端服务，提供目录与文件列表API，供前端资源浏览器调用。
// 新语法：使用 ES6+、async/await、递归、path、fs/promises、Express 框架，ESM模块(import语法)。

/**
 * 虚拟文件系统服务
 * 功能：虚拟文件系统后端服务，提供目录与文件列表API，供前端资源浏览器调用。
 * 支持跨域，可与前端分离部署。
 * - /api/list/:drive?path= 路由，返回指定目录下的文件和文件夹结构
 * - /file/:drive/* 路由，返回指定文件内容，支持二进制
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
const PORT = 3001;

// 虚拟文件系统根目录
const VFS_ROOT = path.resolve(__dirname, "../public/vfs");

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
    let reqPath = req.query.path || "/";
    if (!reqPath.startsWith("/")) reqPath = "/" + reqPath;
    const absPath = path.join(VFS_ROOT, "." + reqPath);
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
    // 只允许访问 public/vfs 下的文件
    const absPath = path.join(VFS_ROOT, filePath);
    try {
        // 检查文件是否存在
        await fs.access(absPath);
        res.sendFile(absPath);
    } catch (e) {
        res.status(404).send("File not found");
    }
});

// 启动服务
app.listen(PORT, () => {
    console.log(`VFS Server running at http://localhost:${PORT}`);
});
