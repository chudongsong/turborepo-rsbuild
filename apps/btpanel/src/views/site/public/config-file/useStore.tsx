import { reHistory } from '@/api/global';
import { getComposerVersion, getRewriteTel } from '@/api/site';
import { useDataHandle, useHandleError } from '@/hooks/tools';

const SITE_CONFIG_FILE_STORE = defineStore('SITE-CONFIG-FILE-STORE', () => {
  /**
   * @description 查看文件历史
   * @param row
   */
  const viewFileHistoryEvent = async (params: { path: string; row: any }) => {
    try {
      const res = await getRewriteTel({
        filename: params.path,
        history: params.row,
      });
      return { status: res.data.status, data: res.data.data };
    } catch (error) {
      useHandleError(error);
      return { status: false, msg: '获取文件历史失败' };
    }
  };

  /**
   * @description 恢复文件
   */
  const recoverFileEvent = async (params: { path: string; row: any }) => {
    try {
      const data: AnyObject = await useDataHandle({
        loading: '正在恢复，请稍后...',
        request: reHistory({ filename: params.path, history: params.row }),
        data: { status: Boolean },
      });
      return {
        msg: data.status ? '恢复成功' : '恢复失败',
        status: data.status,
      };
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * @description 获取composer路径
   */
  const getComposerPathEvent = async (path: string) => {
    try {
      const res = await useDataHandle({
        request: getComposerVersion({ path }),
        data: { file_path: String },
      });
      return { data: res.data.file_path, status: res.status };
    } catch (error) {
      console.log(error);
      return { status: false, msg: '获取composer路径失败' };
    }
  };

  return { viewFileHistoryEvent, recoverFileEvent, getComposerPathEvent };
});

const useSiteConfigFileStore = () => {
  return storeToRefs(SITE_CONFIG_FILE_STORE());
};

export { useSiteConfigFileStore, SITE_CONFIG_FILE_STORE };
