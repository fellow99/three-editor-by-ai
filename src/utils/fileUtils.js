/**
 * 文件处理工具函数
 * 提供文件上传、下载、格式转换等功能
 */

/**
 * 支持的3D模型文件格式
 */
export const SupportedFormats = {
  GLTF: ['.gltf', '.glb'],
  OBJ: ['.obj'],
  FBX: ['.fbx'],
  DAE: ['.dae'],
  PLY: ['.ply'],
  STL: ['.stl']
};

/**
 * 支持的纹理文件格式
 */
export const TextureFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tga', '.tiff'];

/**
 * 获取文件扩展名
 * @param {string} filename 文件名
 * @returns {string} 扩展名（小写，包含点）
 */
export function getFileExtension(filename) {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * 获取文件名（不包含扩展名）
 * @param {string} filename 文件名
 * @returns {string} 文件名
 */
export function getFileName(filename) {
  const name = filename.substring(filename.lastIndexOf('/') + 1);
  return name.substring(0, name.lastIndexOf('.')) || name;
}

/**
 * 检查文件是否为支持的3D模型格式
 * @param {string} filename 文件名
 * @returns {boolean} 是否支持
 */
export function isSupported3DFormat(filename) {
  const ext = getFileExtension(filename);
  return Object.values(SupportedFormats).some(formats => formats.includes(ext));
}

/**
 * 检查文件是否为纹理格式
 * @param {string} filename 文件名
 * @returns {boolean} 是否为纹理
 */
export function isTextureFormat(filename) {
  const ext = getFileExtension(filename);
  return TextureFormats.includes(ext);
}

/**
 * 获取文件格式类型
 * @param {string} filename 文件名
 * @returns {string|null} 格式类型
 */
export function getFormatType(filename) {
  const ext = getFileExtension(filename);
  
  for (const [type, formats] of Object.entries(SupportedFormats)) {
    if (formats.includes(ext)) {
      return type;
    }
  }
  
  if (TextureFormats.includes(ext)) {
    return 'TEXTURE';
  }
  
  return null;
}

/**
 * 读取文件为ArrayBuffer
 * @param {File} file 文件对象
 * @returns {Promise<ArrayBuffer>} ArrayBuffer数据
 */
export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 读取文件为文本
 * @param {File} file 文件对象
 * @returns {Promise<string>} 文本内容
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}

/**
 * 读取文件为Data URL
 * @param {File} file 文件对象
 * @returns {Promise<string>} Data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 下载文件
 * @param {string|Blob} data 文件数据
 * @param {string} filename 文件名
 * @param {string} mimeType MIME类型
 */
export function downloadFile(data, filename, mimeType = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * 创建文件输入元素
 * @param {string[]} accept 接受的文件类型
 * @param {boolean} multiple 是否允许多选
 * @returns {HTMLInputElement} 文件输入元素
 */
export function createFileInput(accept = [], multiple = false) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = multiple;
  
  if (accept.length > 0) {
    input.accept = accept.join(',');
  }
  
  return input;
}

/**
 * 选择文件对话框
 * @param {string[]} accept 接受的文件类型
 * @param {boolean} multiple 是否允许多选
 * @returns {Promise<FileList>} 选择的文件列表
 */
export function selectFiles(accept = [], multiple = false) {
  return new Promise((resolve, reject) => {
    const input = createFileInput(accept, multiple);
    
    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        resolve(input.files);
      } else {
        reject(new Error('未选择文件'));
      }
    };
    
    input.click();
  });
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 验证文件大小
 * @param {File} file 文件对象
 * @param {number} maxSize 最大大小（字节）
 * @returns {boolean} 是否通过验证
 */
export function validateFileSize(file, maxSize) {
  return file.size <= maxSize;
}

/**
 * 创建文件预览URL
 * @param {File} file 文件对象
 * @returns {string} 预览URL
 */
export function createPreviewURL(file) {
  return URL.createObjectURL(file);
}

/**
 * 释放预览URL
 * @param {string} url 预览URL
 */
export function revokePreviewURL(url) {
  URL.revokeObjectURL(url);
}

/**
 * 将JSON对象导出为文件
 * @param {object} data JSON数据
 * @param {string} filename 文件名
 */
export function exportJSON(data, filename) {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, filename, 'application/json');
}

/**
 * 处理拖拽文件
 * @param {DragEvent} event 拖拽事件
 * @returns {FileList} 文件列表
 */
export function handleDragFiles(event) {
  event.preventDefault();
  return event.dataTransfer.files;
}

/**
 * 检查是否支持文件拖拽
 * @returns {boolean} 是否支持
 */
export function supportsDragAndDrop() {
  return 'draggable' in document.createElement('div') && 
         'ondragstart' in document.createElement('div') && 
         'ondrop' in document.createElement('div');
}
