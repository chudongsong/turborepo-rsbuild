
import {getSiteLog} from '@/api/docker'

const SITE_LOGS_STORE = defineStore('DOCKERSITE-LOGS-STORE', () => {

  const getErrorLogsEvent = async (params: any) => {
    try {
      const { data } = await getSiteLog(params);
      return { data, status: true };
    } catch (error) {
      console.log(error);
      return { msg: '获取错误日志失败', status: false };
    }
  };

  /**
   * @description 获取日志
   * @param params
   * @returns
   */
  const getResLogEvent = async (params: any) => {
    try {
      const res = await getSiteLog(params);
      return { data: res.data, status: res.status };
    } catch (error) {
      console.log(error);
      return { msg: '获取日志失败', status: false };
    }
  };

  return {
    getErrorLogsEvent,
    getResLogEvent,
  };
});

const useSiteLogsStore = () => storeToRefs(SITE_LOGS_STORE());

export { SITE_LOGS_STORE, useSiteLogsStore };
