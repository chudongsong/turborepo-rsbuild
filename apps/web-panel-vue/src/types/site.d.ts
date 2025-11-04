export interface BusinessTableProps {
  oid: number;
  certId: string;
  domainName: string[];
  endDate: number;
  install: boolean;
  orderStatus: string;
  title: string;
  status: number;
  renew: boolean;
  endDay: number;
  ssl_state: number;
}

export interface selectItem {
  name: string;
  title: string;
  value: string | number;
  tips: string[];
  disable?: boolean;
  subscript?: string;
}
export type BusCertBuyInfoValue = {
  [key: string]: any;
  // 其他属性
};

// 网站store模块
export interface SiteStoreProps {
  isLoading: boolean; // 是否加载中
  isRefreshActiveList: boolean; // 是否刷新活跃列表
  isRefreshSsL: boolean;
  isJump: boolean;
  siteInfo: AnyObject;
  settingTabActive: string;
  sslTabActive: string;
  sslInfo: SslInfoProps;
  sslDnsApiInfo: AnyObject[];
  sslApplicationInfo: SslApplicationInfoProps;
  letApplyInfo: LetApplyInfoProps;
  scanData: AnyObject;
}

export interface LetApplyInfoProps {
  result: AnyObject;
  info: AnyObject;
  dnsTable: AnyObject[];
  verifyDialog: boolean;
}

export interface SslApplicationInfoProps {
  address: string;
  city: string;
  country: string;
  email: string;
  firstName: string;
  job: string;
  lastName: string;
  mobile: string;
  organation: string;
  postCode: string;
  state: string;
}

export interface SslInfoProps {
  isCertInfo: boolean;
  https: boolean;
  type: number;
  key: string;
  csr: string;
  index: string;
  oid: number;
  dns: string[];
  subject: string;
  issuer: string;
  endtime: string;
  push: AnyObject;
  pushAlarm: string | boolean;
  isSupportRenewal: boolean;
  isStart: boolean;
  notAfter: string;
  authType: string;
}

export interface OtherTableProps {
  p: number;
  limit: number;
  type_id?: number | string;
  search: string;
  table?: string;
  type?: number | string;
}

export type KeyProps = {
  [key: string]: any;
};

export interface RedirectTableProps {
  domainorpath: string;
  errorpage: number;
  holdpath: number;
  redirect_conf_file: string;
  redirectdomain: string[];
  redirectname: string;
  redirectpath: string;
  redirecttype: string;
  sitename: string;
  topath: string;
  tourl: string;
  type: number;
}

export interface BusinessTableProps {
  oid: number;
  certId: string;
  domainName: string[];
  endDate: number;
  install: boolean;
  orderStatus: string;
  title: string;
  status: number;
  renew: boolean;
  endDay: number;
  ssl_state: number;
}

export interface ErrorDataProps {
  field: string;
  error: string;
}

export interface TrustAsiaTableProps {
  authDomain: string;
  authKey: string;
  authPath: string;
  authValue: string;
  commonName: string;
  createTime: number;
  dvAuthMethod: string;
  endtime: number;
  partnerOrderId: string;
  product: string | null;
  productShortName: string;
  setup: boolean;
  ssl_id: number;
  stateCode: string;
  stateName: string;
  updateTime: number;
  validityPeriod: number;
}

export interface LetsTableProps {
  auth_to: string;
  auth_type: string;
  cert_timeout: number;
  certificate_url: string;
  domains: string[];
  endDay: number;
  expires: number;
  index: string;
  next_retry_time: number;
  renew_time: number;
  retry_count: number;
  save_path: string;
  status: string;
}

export interface CertFolderTableProps {
  id: number;
  auth_info: AnyObject;
  cloud_id: number;
  create_time: number;
  dns: string[];
  endtime: number;
  group_id: number;
  hash: string;
  info: AnyObject;
  not_after: string;
  path: string;
  ps: string;
  subject: string;
  use_for_panel: number;
  use_for_site: any[];
}

export interface TypeParamsProps {
  value: string | number;
  label: string;
}

// 违规词检测-检测历史 表格数据参数
export interface HistoryTableDataProps {
  id: number;
  is_status: number;
  pid: number;
  site_id: number;
  site_name: string;
  scans: string;
  start_time: number;
  end_time: number;
  time: number;
  risks: number;
  status: number;
  testing_id: string;
}

// 风险动态表格数据参数
export interface RiskTableDataProps {
  id: number;
  content: string;
  new_content_file: string;
  risk_content: string;
  risk_type: string;
  site_id: number;
  site_name: string;
  source_content_file: string;
  source_file: string;
  testing_id: string;
  url: string;
  time: number;
}
