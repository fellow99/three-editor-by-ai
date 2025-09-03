import mime from 'mime';

import { StaticDriveApi} from './static-drive-api'; // 静态文件系统API
import { VfsServerApi } from './vfs-server-api'; // vfs-server服务API

const driveMap = {};

/**
 * 注册虚拟文件系统
 */
function registerVfs (opt) {
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

/**
 * 列举已注册的虚拟文件系统
 */
function listVfs () {
    return Object.values(driveMap);
}

/**
 * 获取一个虚拟文件系统
 */
function getVfs (drive) {
    let vfs = driveMap[drive];
    if (!vfs) throw new Error('VFS not found: ' + drive);
    return vfs;
}

/**
 * 获取文件的mimetype
 */
function getMimetype (path) {
    return mime.getType(path);
}

/**
 * 计算上级目录
 */
function getParentPath (path) {
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

export default {
    registerVfs,
    listVfs,
    getVfs,
    getMimetype,
    getParentPath
}