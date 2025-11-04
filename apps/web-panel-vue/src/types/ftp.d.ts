// FTP 持久化接口
export interface FtpStoreProps {
  tabActive: string; // 当前tab，未激活
  isRefreshActiveList: boolean; // 是否刷新活跃列表
  isLoading: boolean; // 是否显示视图加载中
  ftpPort: number;
  isSearchClick: boolean; // 是否从搜索推荐点击
}

// FTP表格请求参数接口
export interface FtpTableProps {
  p: number;
  limit: number;
  search: string;
  type_id?: number | string;
  table: string;
}

// FTP添加接口
export interface FtpAddProps {
  ftp_username: string;
  ftp_password: string;
  path: string;
  ps: string;
}

// FTP修改密码接口
export interface FtpeEditPawProps {
  id: number;
  ftp_username: string;
  new_password: string;
}

// FTP删除接口
export interface FtpDeleteProps {
  id: number;
  username: string;
}

// FTP修改状态接口
export interface FtpEditStatusProps {
  id: number;
  username: string;
  status: number;
}

// FTP容量Quota接口
export interface FtpQuotaProps {
  size: number;
  used: number;
  free: number;
  path?: string;
  id?: number;
}

// FTP表格数据接口
export interface FtpTableRowProps {
  name: string;
  password: string;
  path: string;
  ps: string;
  id: number;
  quota: FtpQuotaProps;
  domain: string;
  backup_count: number;
  status: string;
  end_time: number | string;
  id: number;
}

export interface FtpRowProps {
  name: string;
  password: string;
  path: string;
}

// FTP表格接口
export interface FtpTableEventProps {
  changeStatusEvent: (row: FtpTableDataProps) => void;
  setQuotaEvent: (row: FtpTableDataProps, isSetup: boolean) => void;
  openQuickConnectEvent: (row: FtpTableDataProps) => void;
  openPawValidityEvent: (row: FtpTableDataProps) => void;
  editPasswordEvent: (row: FtpTableDataProps) => void;
  openLogEvent: (row: FtpTableDataProps) => Promise<void>;
  deleteDataEvent: (
    row: FtpTableDataProps,
    isConfirm: boolean
  ) => Promise<void>;
  configureEvent: (row: FtpTableDataProps) => void;
}

// FTP日志扫描表格接口
export interface FtpLogTableDataProps {
  id: number;
  user: string;
  ip: string;
  time: FtpQuotaProps;
  count: number;
  type: string;
}

// FTP日志扫描表格接口
export interface FtpLogTableEventProps {
  maskIpEvent: (row: FtpLogTableDataProps) => Promise<void>;
  deleteDataEvent: (
    row: FtpLogTableDataProps,
    isConfirm: boolean
  ) => Promise<void>;
  stopDataEvent: (row: FtpLogTableDataProps) => Promise<void>;
  ignoreScanEvent: (row: FtpLogTableDataProps) => Promise<void>;
}

// FTP日志分析白名单表格接口
export interface FtpLogWhiteTableEventProps {
  deleteIpEvent: (row: string) => Promise<void>;
}
