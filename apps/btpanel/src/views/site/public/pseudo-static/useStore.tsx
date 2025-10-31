import { delRewriteTel, getRewriteList, setRewriteTel } from '@/api/site';
import { Message, useDataHandle } from '@/hooks/tools';

const SITE_PSEUDO_STORE = defineStore('SITE-PSEUDO-STORE', () => {
  /**
   * @description 删除伪静态模板
   * @param name
   */
  const delPseudoStaticEvent = async (params: { name: string }) => {
    try {
      const res = await useDataHandle({
        loading: '正在删除伪静态规则，请稍候...',
        request: delRewriteTel(params),
        message: true,
      });
    } catch (error) {
      console.log(error);
      return { status: false, msg: '删除失败' };
    }
  };

  /**
   * @description 获取伪静态列表
   * @param path
   */
  const getReWriteListEvent = async (params: any) => {
    // const loading = Message.load('正在获取伪静态列表，请稍候...');
    try {
      // 不验证 因为 sitePath 可能不会返回
      const { data } = await useDataHandle({
        request: getRewriteList(params),
      });
      return { data, status };
    } catch (error) {
      console.log(error);
      return { status: false, msg: '获取伪静态列表失败' };
    }
  };

  const setTemplateEvent = async (params: any) => {
    try {
      const res: AnyObject = await useDataHandle({
        loading: '正在设置模板，请稍候...',
        request: setRewriteTel(params),
        message: true,
      });
      return { status: res.status, msg: res.msg };
    } catch (error) {
      console.log(error);
      return { status: false, msg: '设置模板失败' };
    }
  };

  return { delPseudoStaticEvent, getReWriteListEvent, setTemplateEvent };
});

const useSitePseudoStore = () => storeToRefs(SITE_PSEUDO_STORE());

export { SITE_PSEUDO_STORE, useSitePseudoStore };
