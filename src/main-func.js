/**
 * 应用入口文件相关的功能函数
 */

import vfsService from './services/vfs-service';

/**
 * 读取配置文件，注册虚拟文件系统
 */
export async function registerVfsFromURL(url) {
    try {
        let resp  = await fetch(url);
        let list = await resp.json();
        if (Array.isArray(list)) {
            list.forEach(item=>{
                vfsService.registerVfs(item);
            });
        }
    } catch(err) {
        console.error('虚拟文件系统时出错:', err);
    }
}