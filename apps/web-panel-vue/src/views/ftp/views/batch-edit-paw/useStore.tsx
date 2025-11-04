import { getRandomPwd } from '@/utils/';
import { defineStore, storeToRefs } from 'pinia';

const FTP_BATCH_EDIT_PAW = defineStore('FTP-BATCH-EDIT-PAW', () => {
  const updateFtpInfoRef = ref(); // 表单ref

  // 密码表单
  const ftpForm = reactive({
    type: '0',
    password: getRandomPwd(12),
  });

  // 批量修改密码类型选项
  const typeOptions = ref<any>([
    { label: '所有密码一致', value: '0' },
    { label: '所有密码不一致', value: '1' },
  ]);

  return {
    updateFtpInfoRef,
    ftpForm,
    typeOptions,
  };
});

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpBatchPwdStore = () => {
  return storeToRefs(FTP_BATCH_EDIT_PAW());
};

export { useFtpBatchPwdStore, FTP_BATCH_EDIT_PAW };
