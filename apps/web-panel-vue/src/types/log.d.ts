/* eslint-disable @typescript-eslint/naming-convention */
// 面板日志 -计划任务日志 -菜单子项
export interface CrontabParams {
  id: number;
  name: string;
  type: string;
  where1?: string;
  where_hour?: number;
  where_minute?: number;
  echo?: string;
  addtime?: string;
  status?: number;
  save?: string;
  backupTo?: string;
  sName?: string;
  sBody?: string;
  sType?: string;
  urladdress?: string;
  save_local?: number;
  notice?: number;
}

/**
 * 日志审计 - 菜单子项
 */
export interface LogMenuData {
  name: string;
  log_file: string;
  size: number;
  title: string;
  uptime: number;
  list: Array<{
    name: string;
    size: number;
    uptime: number;
    log_file: string;
  }>;
}

/**
 * ssh - 表格项
 */
export interface SSHLogItem {
  address: string;
  port: number;
  area: {
    info: string;
  };
  user: string;
  status: boolean;
  time: string;
  deny_status: boolean;
}

export interface LogStoreProps {
  selectedWebSite: string; // 选中的网站
  tabActive: string; // 当前tab
  panelTabActive: string; // 当前tab
  webTabActive: string; // 当前tab
}
