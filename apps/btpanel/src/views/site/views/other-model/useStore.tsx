import { advanceCheckPort, getSystemUserList, modifyProject } from '@/api/site';
import { Message } from '@/hooks/tools';
import { useSiteStore } from '../../useStore';

const SITE_OTHER_STORE = defineStore('SITE-OTHER-STORE', () => {
  // const isRefreshList = ref(false);
  const { activeType } = useSiteStore();

  /**
   * @description  编辑其他项目
   * @param params
   * @returns
   */
  const editOtherProject = async (params: any) => {
    try {
      const res = modifyProject(params, activeType.value);
      Message.request(res);
      return { status: res.status, msg: res.msg || res.errorMsg };
    } catch (error) {
      console.log(error);
      return { status: false, msg: '编辑项目失败' };
    }
  };

  return {
    editOtherProject,
  };
});

const useSiteOtherStore = () => {
  return storeToRefs(SITE_OTHER_STORE());
};

export { SITE_OTHER_STORE, useSiteOtherStore };
