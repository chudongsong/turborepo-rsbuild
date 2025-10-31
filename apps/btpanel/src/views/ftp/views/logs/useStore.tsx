import { defineStore, storeToRefs } from 'pinia';

const FTP_LOG_STORE = defineStore('FTP-LOG-STORE', () => {
  const tabActive = ref('loginLog'); // 默认tab展开栏
  const actionType = ref<string>('all'); // 操作类型

  return {
    tabActive,
    actionType,
  };
});

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpLogStore = () => {
  return storeToRefs(FTP_LOG_STORE());
};

export { useFtpLogStore, FTP_LOG_STORE };
