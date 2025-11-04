import { getPyVersion } from '@/api/site';
import { useHandleError } from '@/hooks/tools';

const SITE_PYTHON_STORE = defineStore('SITE-PYTHON-STORE', () => {
  /**
   * @description 检测Python版本
   */
  const checkPythonVersion = async () => {
    try {
      const res = await getPyVersion();
      return { data: res.data, status: res.status };
      // if (!res.data.cpy_installed.length && !res.data.pypy_installed.length)
      //   maskLayer.value = true;
    } catch (error) {
      useHandleError(error);
    }
  };

  return {
    checkPythonVersion,
  };
});

const useSitePythonStore = () => {
  return storeToRefs(SITE_PYTHON_STORE());
};

export { SITE_PYTHON_STORE, useSitePythonStore };
