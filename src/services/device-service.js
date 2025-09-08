let BASE_URL = '/mics-datahub';

/**
 * 枚举线路信息
 * @param {*} params 
 * @returns
 */
async function lineList(params = {}) {
    let url = `${BASE_URL}/device/micsLine/list`;
    let resp = await fetch(url);
    let json = await resp.json();
    if(json.code !== 0) throw new Error(json.message);
    return json.data || [];
}

/**
 * 枚举系统清单
 * @param {*} params 
 * @returns
 */
async function systemList(params = {}) {
    let url = `${BASE_URL}/device/micsSystem/list`;
    let resp = await fetch(url);
    let json = await resp.json();
    if(json.code !== 0) throw new Error(json.message);
    return json.data || [];
}

/**
 * 枚举指定系统的设备分类
 * @param {*} params.lineId 线路ID
 * @param {*} params.systemId 系统ID
 * @param {*} params.systemName 系统名称
 * @returns 
 */
async function deviceKlassList(params = {}) {
    let url = `${BASE_URL}/device/micsDeviceKlass/listBySystemId?`;
    if(params.lineId) url += `lineId=${params.lineId}`;
    if(params.systemId) url += `systemId=${params.systemId}`;
    if(params.systemName) url += `stationName=${params.systemName}`;
    let resp = await fetch(url);
    let json = await resp.json();
    if(json.code !== 0) throw new Error(json.message);
    return json.data || [];
}
export default {
    lineList,
    systemList,
    deviceKlassList
}