import vfsService from './services/vfs-service';

/**
 * 读取配置文件，注册VFS
 */
export async function register(url) {
    let resp  = await fetch(url);
    if (resp.ok) {
        let list = await resp.json();
        if (Array.isArray(list)) {
            list.forEach(item=>{
                vfsService.registerVfs(item);
                console.log('已注册VFS:', item.drive);
            });
        }
    } else {
        console.warn(`无法加载VFS配置文件: ${url}`);
    }
}