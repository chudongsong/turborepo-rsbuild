import { PluginInfoProps } from '@/store/type';

const FTP_STORE = defineStore('FTP-STORE', () => {
  const ftpPort = ref(21); // FTP端口

  const pluginInfo = reactive<PluginInfoProps>({
    setup: true, // 是否安装
    title: 'ftp', // 插件标题
    name: 'pure-ftpd', // 插件名称
    status: true, // 状态
    version: '', // 版本
  });

  return {
    ftpPort,
    pluginInfo,
  };
});

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpStore = () => {
  return storeToRefs(FTP_STORE());
};

export { useFtpStore, FTP_STORE };
