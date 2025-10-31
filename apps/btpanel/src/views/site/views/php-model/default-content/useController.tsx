import { useDataHandle, useHandleError } from '@/hooks/tools';
import { useSiteStore } from '@/views/site/useStore';
import { getContentIndex, setContentIndex } from '@api/site';

const { siteInfo } = useSiteStore();

export const domainData = ref(''); // 域名数据
export const viewLoading = ref(false); // 表单加载状态

/**
 * @description 获取默认文档
 */
export const getDefaultData = async () => {
  viewLoading.value = true;
  try {
    const { data: res } = await getContentIndex({ id: siteInfo.value.id });
    domainData.value = res.split(',').join('\n');
  } catch (error) {
    useHandleError(error);
  } finally {
    viewLoading.value = false;
  }
};

/**
 *  @description 保存默认文档
 */
export const saveDefaultData = async () => {
  const res: AnyObject = await useDataHandle({
    loading: '正在保存默认文档，请稍后...',
    request: setContentIndex({
      id: siteInfo.value.id,
      Index: domainData.value.split('\n').join(','),
    }),
    message: true,
  });
  if (res.status) getDefaultData();
};
