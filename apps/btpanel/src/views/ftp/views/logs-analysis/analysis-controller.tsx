import {
  createIpRules,
  deleteFtp,
  editFtpStatus,
  exitFtpLogsStatus,
  ftpUsers,
  getWhiteList,
  logAnalysis,
  setAnalysisConfig,
  setCronTask,
  setWhiteList,
} from '@/api/ftp';
import { Message, useConfirm, useDataHandle } from '@/hooks/tools';
import { isArray } from '@/utils';

/********** FTP日志分析业务 **********/

type CallbackProps = (data?: any) => void;

/**
 * @description 获取日志服务状态
 * @param type
 */
export const getAnalysisStatus = async () => {
  try {
    await useDataHandle({
      loading: '正在获取日志服务状态，请稍后...',
      request: exitFtpLogsStatus({ exec_name: 'getlog' }),
      data: { status: Boolean, msg: String },
      success: (res: any) => {
        if (res.status) {
          // 打开日志分析
        } else {
          Message.error(res.msg);
          openLogsAnalysis();
        }
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 开启日志分析
 * @param callback
 */
export const openLogsAnalysis = async (callback?: CallbackProps) => {
  try {
    await useConfirm({
      icon: 'warning-filled',
      title: '开启FTP日志服务',
      content: 'FTP日志服务未启动，无法记录访问日志，是否启动日志服务?',
    });

    await useDataHandle({
      loading: '正在开启FTP日志服务，请稍后...',
      request: exitFtpLogsStatus({ exec_name: 'start' }),
      data: { status: Boolean },
      message: true,
      success: (res: any) => {
        callback && callback(res);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 获取日志分析扫描数据
 */
export const getLogScanData = async (params: any, callback?: CallbackProps) => {
  try {
    const rdata = await logAnalysis(params);
    return rdata;
  } catch (error) {
    console.log(error);
    return {};
  }
};

/**
 * @description 获取ftp日志分析配置
 */
export const getAnalysisConfig = async () => {
  try {
    useDataHandle({
      loading: '正在获取FTP日志分析配置，请稍后...',
      request: getAnalysisConfig(),
      success: (res: any) => {
        return res.data;
        // 后续是使用getAreaParamTools进行参数填充
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 获取分析用户
 */
export const getAnalysisUser = async () => {
  try {
    const { data } = await ftpUsers();
    return data;
  } catch (error) {
    console.log(error);
    return {};
  }
};

/**
 * @description 获取扫描参数工具方法
 * @param data
 * @returns
 */
export const getScanParamTools = async (data: any) => {
  let params: any = {
    time: JSON.stringify({
      start_time: Number(data.start_time.split(':')[0]),
      end_time: Number(data.end_time.split(':')[0]),
    }),
    area: JSON.stringify({
      country: data.area.country,
      city: [],
    }),
    upload_shell: JSON.stringify(data.upload_shell_br.split('\n')),
    login_error: data.login_error,
  };
  return params;
};

/**
 * @description 开始扫描分析
 * @param params
 * @param ref
 * @param callback
 */
export const startScan = async (
  params: any,
  ref: any,
  callback?: CallbackProps
) => {
  try {
    await ref.value.validate();

    await useDataHandle({
      loading: '正在提交中数据，请稍候...',
      request: setAnalysisConfig(params),
      message: true,
    });

    callback && callback();
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @returns @description 获取白名单列表
 */
export const getWhiteData = async () => {
  try {
    const res = await useDataHandle({
      loading: '正在获取白名单列表，请稍后...',
      request: getWhiteList(),
    });
    return res;
  } catch (error) {
    console.log(error);
    return {};
  }
};

/**
 * @description 拉黑IP
 */
export const blackIp = async ({ ip }: any, callback?: CallbackProps) => {
  try {
    await useConfirm({
      icon: 'warning-filled',
      title: 'IP封禁',
      content: '封禁【' + ip + '】后，将不再允许此IP访问服务器，是否继续操作？',
    });

    // 封禁IP参数
    const params = JSON.stringify({
      choose: 'address',
      address: ip,
      domain: '',
      types: 'drop',
      brief: 'FTP日志分析点击IP拉黑',
    });

    // 数据请求
    await useDataHandle({
      loading: '正在封禁IP，请稍后...',
      request: createIpRules({ data: params }),
      data: { status: Boolean },
      message: true,
      success: (res: any) => {
        callback && callback(res);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 忽略Ip
 */
export const ignoreIp = async ({ ip }: any, callback?: CallbackProps) => {
  try {
    await useConfirm({
      icon: 'warning-filled',
      title: '忽略FTP用户',
      content: '忽略后，将不再显示该FTP用户的操作日志，是否继续操作？',
    });

    // 忽略IP
    await useDataHandle({
      loading: '正在忽略IP，请稍后...',
      request: setWhiteList({ ip, type: 'add' }),
      data: { status: Boolean },
      message: true,
      success: (res: any) => {
        callback && callback(res);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 删除IP
 */
export const deleteIp = async ({ ip }: any, callback?: CallbackProps) => {
  try {
    // 删除FTP用户
    await useDataHandle({
      loading: '正在删除白名单IP，请稍后...',
      request: setWhiteList({ ip, type: 'del' }),
      data: { status: Boolean },
      message: true,
      success: (res: any) => {
        callback && callback(res);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 添加IP
 */

export const addIp = async ({ ip, type }: any, callback?: CallbackProps) => {
  try {
    if (!ip) return Message.error('请输入ip地址');
    if (!/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.test(ip)) {
      Message.error('请输入正确的ip地址');
      return;
    }

    await useDataHandle({
      loading: '正在添加白名单IP，请稍后...',
      request: setWhiteList({ ip, type }),
      data: { status: Boolean },
      message: true,
      success: (res: any) => {
        callback && callback(res);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 删除账号事件
 * @param param0
 * @param callback
 * @returns
 */
export const deleteAccount = async (
  { user, id }: any,
  callback?: CallbackProps
) => {
  try {
    if (id === 0) return Message.error('匿名用户不可删除');

    await useConfirm({
      icon: 'warning-filled',
      title: '删除FTP用户',
      content:
        '删除选中的FTP用户后，该FTP用户将彻底失去访问和操作权限，是否继续操作？',
    });

    // 删除FTP用户
    await useDataHandle({
      loading: '正在删除FTP用户，请稍后...',
      request: deleteFtp({ id, username: user }),
      data: { status: Boolean },
      message: true,
      success: (res: any) => {
        callback && callback(res);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 停用账号事件
 */
export const stopAccount = async (
  { user, id }: any,
  callback?: CallbackProps
) => {
  try {
    if (id === 0) return Message.error('匿名用户不可停用');

    await useConfirm({
      icon: 'warning-filled',
      title: '停用FTP用户',
      content:
        '停用【' + user + '】后，该FTP用户将失去访问权限，是否继续操作？',
    });

    // 停用FTP用户
    await useDataHandle({
      loading: '正在停用FTP用户，请稍后...',
      request: editFtpStatus({ id, username: user, status: 0 }),
      data: { status: Boolean },
      message: true,
      success: (res: any) => {
        callback && callback(res);
      },
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 获取配置参数
 * @param data
 * @param isAuto 是否自动扫描
 */
export const getConfigParamTools = (data: any, isAuto: boolean) => {
  let params: any = {};
  const search = JSON.stringify({
    anonymous: data.anonymous,
    area: data.area,
    login_error: data.login_error,
    time: data.time,
    upload_shell: data.upload_shell,
  });
  if (!isAuto) {
    params = {
      search,
      day: data.day === 'other' ? Number(data.otherDay) : data.day,
      username: data.user === 'all' ? '[]' : JSON.stringify(data.userList),
    };
  } else {
    params = {
      task_type: search,
      cycle: data.cycle,
      channel: data.channel.join(','),
      status: data.status ? 1 : 0,
    };
  }
  return params;
};

/**
 * @description 设置FTP分析任务
 */
export const setAnalysisTask = async (
  params: any,
  callback?: CallbackProps
) => {
  try {
    const res = await setCronTask(params);
    Message.request(res);
    callback && callback(res);
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 设置配置扫描
 * @param isAutoScan 是否自动扫描
 * @param callback
 */
export const startConfigScan = async (params: any, ref: any, isAutoScan: boolean, callback?: CallbackProps) => {
  await ref.value.validate();
  let load: any;
  try {
    load = Message.load('扫描中...');
    if (!isAutoScan) {
      const res: any = await getLogScanData(params);
      Message.request({
        status: res.status,
        msg: res.status ? '扫描成功' : '扫描失败',
        time: 500,
      });
      callback && callback(res);
    } else {
      // 设置自动任务
      setAnalysisTask(params, callback);
    }
  } catch (error) {
    console.log(error);
  } finally {
    load?.close();
  }
};

/**
 * @description 获取地区选项
 */
export const getAreaOptions = () => {
  const worldData = [
    '美国',
    '中国',
    '印度',
    '日本',
    '德国',
    '英国',
    '法国',
    '俄罗斯',
    '巴西',
    '加拿大',
    '意大利',
    '澳大利亚',
    '韩国',
    '墨西哥',
    '印度尼西亚',
    '沙特阿拉伯',
    '南非',
    '阿根廷',
    '土耳其',
    '西班牙',
  ];
  return worldData.map(item => ({ label: item, value: item }));
};

/**
 * @description  获取地区参数工具方法
 */
export const getAreaParamTools = async (data: any) => {
  try {
    const { country, city } = data;
    const countries = isArray(country) ? country.join(',') : '';
    const cities = isArray(city) ? city.join(',') : '';
    return `非${countries}${countries && cities ? ',' : ''}${cities}地区`;
  } catch (error) {
    console.log(error);
    return {};
  }
};
