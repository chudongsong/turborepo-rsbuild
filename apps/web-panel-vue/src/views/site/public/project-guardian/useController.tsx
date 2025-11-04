import { SITE_GUARDIAN_STORE } from './useStore';
const { setTimeEvent, getTimeEvent } = SITE_GUARDIAN_STORE();

export const getTime = async () => {
  try {
    const res = await getTimeEvent();
    return res.data;
  } catch (error) {
    console.log(error);
    return { daemon_time: '' }
  }
};

/**
 * @description 设置时间
 * @param close
 */
export const setTime = async (
  param: any,
) => {
  try {
    const res = await setTimeEvent(param);
    return res.status;
  } catch (error) {
    console.log(error);
  }
};
