import { getDaemonTime, setDaemonTime } from '@/api/site';
import { useDataHandle } from '@/hooks/tools';
import { useSiteStore } from '../../useStore';

const SITE_GUARDIAN_STORE = defineStore('SITE-GUARDIAN-STORE', () => {
  const { activeType } = useSiteStore();

  const getTimeEvent = async () => {
    try {
      const res: AnyObject = await useDataHandle({
        loading: '正在获取中，请稍后...',
        request: getDaemonTime(activeType.value),
        data: { daemon_time: Number },
      });
      return { data: res, status: true };
    } catch (error) {
      console.log(error);
      return { status: false, msg: '获取时间失败' };
    }
  };

  /**
   * @description 设置时间
   * @param params
   * @returns
   */
  const setTimeEvent = async (params: any) => {
    try {
      const res: AnyObject = await useDataHandle({
        loading: '正在设置中，请稍后...',
        request: setDaemonTime(params, activeType.value),
        message: true,
      });
      return { status: res.status, msg: res.msg };
    } catch (error) {
      console.log(error);
      return { status: false, msg: '设置时间失败' };
    }
  };

  return { getTimeEvent, setTimeEvent };
});

const useSiteGuardianStore = () => storeToRefs(SITE_GUARDIAN_STORE());

export { useSiteGuardianStore, SITE_GUARDIAN_STORE };
