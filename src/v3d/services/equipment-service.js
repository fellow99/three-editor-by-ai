let BASE_URL = '/mics-datahub';

/**
 * 枚举设备信息
 * @param {*} params.stationName 站点名称
 * @returns 
 */
async function list(params = {}) {
    let url = `${BASE_URL}/equipmentinfo/list?`;
    if(params.stationName) url += `stationName=${params.stationName}`;
    let resp = await fetch(url);
    let json = await resp.json();
    if(json.code !== 0) throw new Error(json.message);
    return json.data || [];
}

export default {
    list
}