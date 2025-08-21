/**
 * @class StaticDriveApi
 * 静态文件系统封装类
 */
export class StaticDriveApi {
    /**
     * 构造函数
     * @param {Object} opt 配置项，包含 drive、baseURL、root
     */
    constructor (opt) {
        let { drive, baseURL, root } = opt;
        this._drive = drive || 'xx';
        this._baseURL = baseURL || '';
        this._root = root;
    }

    /**
     * 获取目录内容
     * @param {string} path 目录路径
     * @returns {Promise<Object>} 目录内容的JSON对象
     */
    async list (path) {
        let root = this._root;
        root = (root === '/' ? '' : root);
        path = (path === '/' ? '' : path);
        let url = `${this._baseURL}${root}${path}/.folder.json`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (e) {
            throw e;
        }
    }

    /**
     * 获取文件的访问链接
     * @param {string} path 文件路径
     * @returns {string} 文件URL
     */
    url (path) {
        let root = this._root;
        root = (root === '/' ? '' : root);
        path = (path === '/' ? '' : path);
        let url = `${root}/${path}`;
        return url;
    }

    /**
     * 获取文件的文本内容
     * @param {string} path 文件路径
     * @returns {Promise<string>} 文件文本内容
     */
    async content (path) {
        let root = this._root;
        root = (root === '/' ? '' : root);
        path = (path === '/' ? '' : path);
        let url = `${this._baseURL}${root}${path}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.text();
        } catch (e) {
            throw e;
        }
    }

    /**
     * 获取文件内容，自动转为json
     * @param {string} path 文件路径
     * @returns {Promise<Object>} 文件内容的JSON对象
     */
    async json (path) {
        let root = this._root;
        root = (root === '/' ? '' : root);
        path = (path === '/' ? '' : path);
        let url = `${this._baseURL}${root}${path}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (e) {
            throw e;
        }
    }

    /**
     * 获取文件内容，返回Blob对象
     * @param {string} path 文件路径
     * @returns {Promise<Blob>} 文件内容的Blob对象
     */
    async blob (path) {
        let root = this._root;
        root = (root === '/' ? '' : root);
        path = (path === '/' ? '' : path);
        let url = `${this._baseURL}${root}${path}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.blob();
        } catch (e) {
            throw e;
        }
    }

    /**
     * 判断文件路径是否存在
     * @param {string} path 文件路径
     * @returns {Promise<boolean>} 是否存在
     */
    async exists (path) {
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

    /**
     * 创建目录
     */
    mkdir (path) {
        throw new Error('Unsupported operation.');
    }

    /**
     * 删除目录
     */
    rmdir (path) {
        throw new Error('Unsupported operation.');
    }

    /**
     * 删除文件
     */
    rm (path) {
        throw new Error('Unsupported operation.');
    }

    /**
     * 移动文件
     */
    mv (path, to) {
        throw new Error('Unsupported operation.');
    }

    /**
     * 复制文件
     */
    cp (path, to) {
        throw new Error('Unsupported operation.');
    }

    /**
     * 保存文件
     */
    save (path, text) {
        throw new Error('Unsupported operation.');
    }

    /**
     * URL保存为文件
     */
    saveUrl (path, saveUrl) {
        throw new Error('Unsupported operation.');
    }
}
