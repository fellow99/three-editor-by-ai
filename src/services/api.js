/**
 * API 服务基础模块
 * 提供通用的API请求功能
 */

/**
 * API配置
 */
const API_CONFIG = {
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * HTTP状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * 请求拦截器
 * @param {object} config 请求配置
 * @returns {object} 处理后的配置
 */
function requestInterceptor(config) {
  // 添加认证token等
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}

/**
 * 响应拦截器
 * @param {Response} response 响应对象
 * @returns {object} 处理后的响应数据
 */
async function responseInterceptor(response) {
  const contentType = response.headers.get('content-type');
  
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  
  if (!response.ok) {
    throw new APIError(data.message || '请求失败', response.status, data);
  }
  
  return data;
}

/**
 * API错误类
 */
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * 创建请求URL
 * @param {string} endpoint 端点
 * @param {object} params 查询参数
 * @returns {string} 完整URL
 */
function createURL(endpoint, params = {}) {
  const url = new URL(endpoint, API_CONFIG.baseURL || window.location.origin);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
}

/**
 * 发送HTTP请求
 * @param {string} method HTTP方法
 * @param {string} endpoint 端点
 * @param {object} options 选项
 * @returns {Promise} 请求结果
 */
async function request(method, endpoint, options = {}) {
  const {
    data,
    params = {},
    headers = {},
    timeout = API_CONFIG.timeout,
    ...restOptions
  } = options;
  
  const url = createURL(endpoint, params);
  
  const config = {
    method: method.toUpperCase(),
    headers: {
      ...API_CONFIG.headers,
      ...headers
    },
    ...restOptions
  };
  
  // 添加请求体
  if (data) {
    if (data instanceof FormData) {
      // FormData自动设置Content-Type
      delete config.headers['Content-Type'];
      config.body = data;
    } else if (typeof data === 'object') {
      config.body = JSON.stringify(data);
    } else {
      config.body = data;
    }
  }
  
  // 应用请求拦截器
  const interceptedConfig = requestInterceptor(config);
  
  // 设置超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  interceptedConfig.signal = controller.signal;
  
  try {
    const response = await fetch(url, interceptedConfig);
    clearTimeout(timeoutId);
    
    return await responseInterceptor(response);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new APIError('请求超时', 408);
    }
    
    throw error;
  }
}

/**
 * GET请求
 * @param {string} endpoint 端点
 * @param {object} options 选项
 * @returns {Promise} 请求结果
 */
export function get(endpoint, options = {}) {
  return request('GET', endpoint, options);
}

/**
 * POST请求
 * @param {string} endpoint 端点
 * @param {object} data 请求数据
 * @param {object} options 选项
 * @returns {Promise} 请求结果
 */
export function post(endpoint, data, options = {}) {
  return request('POST', endpoint, { ...options, data });
}

/**
 * PUT请求
 * @param {string} endpoint 端点
 * @param {object} data 请求数据
 * @param {object} options 选项
 * @returns {Promise} 请求结果
 */
export function put(endpoint, data, options = {}) {
  return request('PUT', endpoint, { ...options, data });
}

/**
 * PATCH请求
 * @param {string} endpoint 端点
 * @param {object} data 请求数据
 * @param {object} options 选项
 * @returns {Promise} 请求结果
 */
export function patch(endpoint, data, options = {}) {
  return request('PATCH', endpoint, { ...options, data });
}

/**
 * DELETE请求
 * @param {string} endpoint 端点
 * @param {object} options 选项
 * @returns {Promise} 请求结果
 */
export function del(endpoint, options = {}) {
  return request('DELETE', endpoint, options);
}

/**
 * 上传文件
 * @param {string} endpoint 端点
 * @param {File|FormData} file 文件或FormData
 * @param {object} options 选项
 * @returns {Promise} 上传结果
 */
export function upload(endpoint, file, options = {}) {
  const formData = file instanceof FormData ? file : new FormData();
  
  if (file instanceof File) {
    formData.append('file', file);
  }
  
  // 添加额外字段
  if (options.fields) {
    Object.entries(options.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return request('POST', endpoint, {
    ...options,
    data: formData
  });
}

/**
 * 下载文件
 * @param {string} endpoint 端点
 * @param {string} filename 文件名
 * @param {object} options 选项
 * @returns {Promise} 下载结果
 */
export async function download(endpoint, filename, options = {}) {
  const response = await fetch(createURL(endpoint, options.params), {
    method: 'GET',
    headers: requestInterceptor({}).headers
  });
  
  if (!response.ok) {
    throw new APIError('下载失败', response.status);
  }
  
  const blob = await response.blob();
  
  // 创建下载链接
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  return blob;
}

/**
 * 设置API配置
 * @param {object} config 配置对象
 */
export function setConfig(config) {
  Object.assign(API_CONFIG, config);
}

/**
 * 获取API配置
 * @returns {object} 当前配置
 */
export function getConfig() {
  return { ...API_CONFIG };
}

/**
 * 创建API实例
 * @param {object} config 实例配置
 * @returns {object} API实例
 */
export function createAPI(config = {}) {
  const instanceConfig = { ...API_CONFIG, ...config };
  
  return {
    get: (endpoint, options = {}) => 
      request('GET', endpoint, { ...options, baseURL: instanceConfig.baseURL }),
    post: (endpoint, data, options = {}) => 
      request('POST', endpoint, { ...options, data, baseURL: instanceConfig.baseURL }),
    put: (endpoint, data, options = {}) => 
      request('PUT', endpoint, { ...options, data, baseURL: instanceConfig.baseURL }),
    patch: (endpoint, data, options = {}) => 
      request('PATCH', endpoint, { ...options, data, baseURL: instanceConfig.baseURL }),
    delete: (endpoint, options = {}) => 
      request('DELETE', endpoint, { ...options, baseURL: instanceConfig.baseURL }),
    upload: (endpoint, file, options = {}) => 
      upload(endpoint, file, { ...options, baseURL: instanceConfig.baseURL }),
    download: (endpoint, filename, options = {}) => 
      download(endpoint, filename, { ...options, baseURL: instanceConfig.baseURL })
  };
}

// 默认导出
export default {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  download,
  setConfig,
  getConfig,
  createAPI,
  APIError,
  HTTP_STATUS
};
