import { getLoadInfo } from '@/api/site';
import { useSiteStore } from '../../useStore';

const SITE_LOAD_STATE_STORE = defineStore('SITE-LOAD-STATE-STORE', () => {
  const { siteInfo, siteType } = useSiteStore();

  /**
   * @description 获取负载状态
   * @param params
   * @returns
   */
  const getLoadDataEvent = async (params: any) => {
    try {
      const res = await getLoadInfo(params, siteType.value);
      return { status: res.status, data: res.data };
    } catch (error) {
      console.log(error);
      return { status: false, msg: '获取负载状态失败' };
    }
  };

  return { getLoadDataEvent };
});

const useSiteLoadStateStore = () => {
  return storeToRefs(SITE_LOAD_STATE_STORE());
};

export { useSiteLoadStateStore, SITE_LOAD_STATE_STORE };
