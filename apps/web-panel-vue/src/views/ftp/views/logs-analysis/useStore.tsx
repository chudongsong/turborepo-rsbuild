import { defineStore, storeToRefs } from 'pinia';

const FTP_LOGS_ANALYSIS = defineStore('FTP_LOGS_ANALYSIS', () => {
  const ftpScanTable = ref();
  const ftpAnalysisList = ref<any>({
    scanStatus: false,
    autoScanText: '定时自动扫描',
    btn: '立即扫描',
    data: [],
  });

  const ruleForm = ref({
    login_error: true, // 多次登录失败
    time: true, // 时间
    area: true, // 地区
    anonymous: true, // 匿名用户登录
    upload_shell: true, // 上传脚本文件
    day: 7 as number | string, // 扫描天数
    otherDay: 1, // 自定义天数
    user: 'all', // 用户选择
    userList: [] as string[], // 用户列表
    cycle: 1,
    channel: [] as string[], // 信息通道
    option: {} as any, // 信息配置
    config: {
      login_error: 5,
      time: {
        start_time: 0,
        end_time: 24,
      },
      area: {
        country: [],
        city: [],
      },
      upload_shell: [],
      login_error_des: '超过5次',
      time_des: '0点至24点范围外',
      area_des: '非地区',
      upload_shell_des: '未配置',
    } as any, // 安全风险配置数据
    search: '', // 搜索条件
    status: true, // 告警状态
  });

  // ---------------------------------扫描

  const areaOptions = ref<any>([]); // 地区选项
  const setScanInfo = ref<any>(null); // 表单实例

  // -------------------------------------------白名单

  const whiteTableData = ref<Array<any>>([]); // 表格数据
  const ip = ref<any>(); // 表单数据

  // -------------------------------------------timed-scan

  const isLoading = ref(false); // 加载状态
  const isAutoScan = ref(); // 是否自动扫描
  const userOptions = ref<any[]>([]); // 用户列表
  const addFtpInfo = ref(); // 表单实例

  return {
    ftpAnalysisList,
    ftpScanTable,
    ruleForm,
    //---------------------------------白名单
    whiteTableData,
    ip,
    // --------------------------------timeScan
    setScanInfo,
    addFtpInfo,
    isAutoScan,
    userOptions,
    isLoading,
    //----------------------------
    areaOptions,
  };
});

/**
 * @description FTP全局数据
 * @returns {Ref<Record<string, any>>}
 */
const useFtpAnalysisStore = () => {
  return storeToRefs(FTP_LOGS_ANALYSIS());
};

export { useFtpAnalysisStore, FTP_LOGS_ANALYSIS };
