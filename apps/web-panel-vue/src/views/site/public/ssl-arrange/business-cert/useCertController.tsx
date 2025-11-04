import {
  applyBusSsl,
  applyCertOrderPay,
  checkSslMethod,
  checkUrlTxt,
} from '@/api/site';
import { Message, useConfirm, useDataHandle, useDialog, useForm } from '@/hooks/tools';
import { ResponseResult } from '@/types';
import { BusinessTableProps } from '@/types/site';
import { BusCertBuyInfoValue } from '@/types/site';
import { selectItem } from '@/types/site';
import { checkDomain, defaultVerify, isNumber, isObject,checkIp } from '@/utils';
import { useSiteStore } from '@/views/site/useStore';
import { onlineServiceDialog } from '@/public'
import {
  busCertPayDialog,
  busCertVerifyInfoDialog,
  busCertVerifyWayDialog,
  dnsApiVerifyDialog,
  getSslInfoConfig,
	renewalBusCertEvent,
} from '../useController';
import { SITE_SSL_STORE, useSiteSSLStore } from '../useStore';
import BtRadio from '@/components/form/bt-radio';
import BtHelp from '@/components/form/bt-help';
import BtInput from '@/components/form/bt-input';
import useWPLocalStore from '@/views/wordpress/view/local/useStore';
import BtDivider from '@/components/other/bt-divider';
import { ElPopover,ElButton } from 'element-plus';
const { siteInfo, siteType, isRefreshList } = useSiteStore();
const { isRefreshLocalList } = storeToRefs(useWPLocalStore());
const { orderInfo, sslApplicationInfo, certVerifyInfo, otherPopup, isRefreshSSL, sslDnsApiInfo } =
  useSiteSSLStore();
const {
  buyArtificialServiceEvent,
  getCertAdminInfoEvent,
  submitCertInfoEvent,
  setBusSslDeployEvent,
  getSslListEvent,
  verifyBusCertEvent,
  getCertSslListEvent,
  getDomainListEvent,
  jumpSslTabEvent,
} = SITE_SSL_STORE();

export const submitPopup = ref(false); // 提交弹窗
export const errorData = ref<any>([]); // 错误数据

export const recommendList = [
  '企业级证书',
  '极速申请',
  '防劫持/防篡改',
  '提高SEO权重',
  '赔付保证',
  '不成功可退款',
  '官方推荐(宝塔官网bt.cn也在使用)',
];

export const busSslHelp = [
	{
		content: () => (<span class="text-danger">如果您的站点有使用CDN、高防IP、反向代理、301重定向等功能，可能导致验证失败</span>),
	},
	{
		content: '证书支持购买多年，只能一年签发一次（有效期一年），需在到期前30天内续签(续签暂不需要验证域名)。',
	},
	{ content: '申请www.bt.cn这种以www为二级域名的证书，需绑定并解析顶级域名(bt.cn)，否则将验证失败。' },
	{ content: '商用证书相对于普通证书，具有更高的安全性、赔付保障和支持通配符和多域名等方式。' },
]

/**
 * @description 渲染到期时间
 * @param row
 * @returns
 */
export const renderEndDate = (row: any) => {
  let color = 'text-green';
  if (row.endDate) {
    if (row.endDay <= 30) color = 'text-orange';
    return (
      <span class={row.endDay <= 10 ? 'text-danger' : color}>
        {row.endDay > 0 ? `剩余${row.endDay} 天` : '已过期'}
      </span>
    );
  } else {
    return <span>--</span>;
  }
};

/**
 * @description 购买人工服务
 */
export const buyArtificialService = async ({ oid }: BusinessTableProps) => {
 try {
	 const res = await buyArtificialServiceEvent({
	    pdata: JSON.stringify({ oid }),
		});
		orderInfo.value = res.data;
		console.log(res)
	  useDialog({
	    isAsync: true,
	    title: '购买人工服务',
	    area: 60,
	    component: () =>
	      import('@site/public/ssl-arrange/business-cert/pay-ssl-service.vue'),
	    compData: res.data,
	  });
 } catch (error) {
	console.log(error)
 }
};

/**
 * @description 完善商用证书信息
 */
export const openBusCertVerifyInfoView = async (row: BusinessTableProps) => {
  const res: AnyObject = await getCertAdminInfoEvent();
  sslApplicationInfo.value = {
    // 完善商用证书验证信息
    ...sslApplicationInfo.value,
    ...res.data,
  };
  orderInfo.value = row;
  // sslInfoHandle();
  busCertVerifyInfoDialog({ orderInfo: row });
};

/**
 * @description 提交证书信息
 */
export const submitCertInfo = async (row: BusinessTableProps) => {
  try {
    const { data: res }: any = await submitCertInfoEvent({ oid: row.oid });
    // code为-1时
    if (res.code === -1 && res.errors) {
      // 渲染错误提示数据
      renderErrorTips(res.errors);
      // 打开提示弹窗
      submitPopup.value = true;
    } else {
      let msg = res.msg || res.data.msg;
      let status = res.status;
      Message.request({
        msg: status
          ? msg || '提交成功'
          : '资料提交错误，请检查管理员信息是否填写正确，如填写错误请联系客服重置订单',
        status: status,
      });
      status && certVerifyWayEvent(row.oid,row.cert_ssl_type,row.pid); // 验证域名
    }
    getCertBusinessList(); // 刷新商业证书列表
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 渲染错误提示
 */
export const renderErrorTips = (errors: AnyObject) => {
  try {
    // 转换数据结构
    let tableData: Array<any> = [];
    Object.keys(errors).forEach((item: any) => {
      errors[item].forEach((error: any) => {
        tableData.push({ field: item, error });
      });
    });
    // errorData.value = tableData;
    return { data: tableData, total: tableData.length, other: {} };
  } catch (error) {
    console.log(error);
    return { data: [], total: 0, other: {} };
  }
};

/**
 * @description 下载商业证书
 */
export const downloadBusSslEvent = ({ oid }: BusinessTableProps) => {
  window.open(`/ssl?action=download_cert&oid=${oid}`);
};

/**
 * @description 设置证书部署
 *  @param {BusinessTableProps} row
 */
export const setBusSslDeploy = async ({
  oid,
  title,
  domainName,
}: BusinessTableProps) => {
  try {
    const siteName = siteInfo.value.name;
    const type = siteType.value;

    await useConfirm({
      title: '部署证书',
      isHtml: true,
      content: `是否部署该证书,是否继续？<br>
		    证书类型：${title}<br>
		    证书支持域名：${domainName.join('、')}<br>
		    部署站点名:${siteName}`,
    });

    const paramsType: AnyObject = {
      proxy: { oid, site_name: siteName },
      docker: { oid, site_name: siteName },
      default: { oid, siteName },
    };
    const res = await setBusSslDeployEvent(
      paramsType[type] || paramsType.default
    );

    getCertBusinessList(); // 刷新商业证书列表
    getSslInfoConfig(); // 重新获取证书信息

		isRefreshSSL.value = true; // 刷新商业证书列表refreshActiveList()
    isRefreshList.value = true; // 刷新网站列表
    isRefreshLocalList.value = true; // 刷新wp本地列表
    jumpSslTabEvent('currentCertInfo');

    return res;
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 验证域名
 * @param oid 域名订单id
 */
export const certVerifyWayEvent = async (oid: number,certType:number,pid:number) => {
  const { data: certVerifyInfo, status }: any = await verifyBusCertEvent(oid,certType,pid);
  // 验证证书方式
	if (status) busCertVerifyWayDialog({...certVerifyInfo,cert_ssl_type:certType,certType,pid});
			otherPopup.value?.unmount()
};

/**
 * @description 获取商用证书列表
 */
export const getCertBusinessList = async () => {
  try {
    const res = await getSslListEvent({
      siteName: siteInfo.value.name,
    });
    // 重置刷新状态
    isRefreshSSL.value = false;
    return res;
  } catch (error) {
    return { data: [], total: 0, other: {} };
  }
};

/*********************申请商业证书**********************/
export const loading = ref(false); // 加载状态
// 推荐品牌
export const certYearNum = ref<number>(0); // 默认包含的域名数量
export const certRecomBrand = ref<BusCertBuyInfoValue>({});
export const certBusSslList: BusCertBuyInfoValue = {
  defalutList: [],
  domianNumList: [],
  classList: [],
  brandList: [],
  typeList: [],
};

export const certSelectSslInfo = ref({
  addPrice: 0, // 额外域名价格/年
  productName: '', // 产品名称
  price: 0, // 价格,仅证书价格
  totalPrice: 0, // 总价格
  originalPrice: 0, // 原价
  deploymentPrice: 0, // 部署服务价格
  pid: 0, // 产品id
  years: 1, // 证书年限
  yearsPrice: 0, // 证书年限价格
  number: 1, // 证书数量
  extraNumber: 0, // 额外域名数量
  extraPrice: 0, // 额外域名价格
  install: 1, // 是否需要部署 0不需要 1需要
});

// 商业证书-模板信息
export const busCertBuyInfo = ref<BusCertBuyInfoValue>({
  num: 1,
  // 证书分类
  certClassAcitve: 'OV',
  certClass: [
    { name: 'OV证书', title: '推荐企业使用', value: 'OV', tips: [], data: [] },
    {
      name: 'DV证书',
      title: '推荐个人，测试使用',
      value: 'DV',
      subscript: '热销',
      tips: [],
    },
    {
      name: 'EV证书',
      title: '推荐大型政企使用，高安全性',
      value: 'EV',
      tips: [],
    },
  ] as selectItem[],

  // 证书品牌
  certBrandAcitve: '',
  certBrand: [
    { name: '宝塔证书', title: '宝塔证书', value: '宝塔证书', tips: [] },
    { name: 'Positive', title: 'Positive', value: 'Positive', tips: [] },
    { name: '锐安信', title: '锐安信', value: '锐安信', tips: [] },
    { name: 'CFCA', title: 'CFCA', value: 'CFCA', tips: [] },
    { name: 'Digicert', title: 'Digicert', value: 'Digicert', tips: [] },
    { name: 'GeoTrust', title: 'GeoTrust', value: 'GeoTrust', tips: [] },
    { name: 'Sectigo', title: 'Sectigo', value: 'Sectigo', tips: [] },
    { name: '亚洲诚信', title: '亚洲诚信', value: '亚洲诚信', tips: [] },
  ] as selectItem[],

  // 证书类型
  certTypeAcitve: 'single',
  certType: [
    { name: 'single', title: '单域名', value: 'single', tips: [] },
    { name: 'multiple', title: '多域名', value: 'multiple', tips: [] },
    { name: 'wildcard', title: '泛域名', value: 'wildcard', tips: [] },
    { name: 'ip', title: 'IP证书', value: 'ip', tips: [] },
  ] as selectItem[],

  certLifeAcitve: 1,
  certLife: [
    { name: '1年', title: '1年', value: 1, tips: [] },
    { name: '2年', title: '2年', value: 2, tips: [] },
    { name: '3年', title: '3年', value: 3, tips: [] },
    { name: '4年', title: '4年', value: 4, tips: [] },
    { name: '5年', title: '5年', value: 5, tips: [] },
  ] as selectItem[],

  certDeployAcitve: 1,
  certDeploy: [
    { name: '不需要', title: '不需要', value: 0, tips: [] },
    { name: '部署服务', title: '部署服务', value: 1, tips: [] },
    { name: '部署服务（国密）', title: '部署服务（国密）', value: 2, tips: [] },
  ] as selectItem[],
});

export const certTypeConfig: BusCertBuyInfoValue = {
  single: [
    '仅支持绑定一个二级域名或者子域名，例如 bt.com、cloud.bt.com、dnspod.cloud.bt.com的其中之一 。',
    '如需要绑定同级的所有子域名，例如*.bt.com，请购买泛域名证书。',
  ],
  wildcard: [
    '带通配符的域名，例如：*.bt.com、*.cloud.bt.com均为泛域名，包含同一级的全部子域名。',
    '注意泛域名不支持跨级，例如*.bt.com 不包含 *.cloud.bt.com的支持',
  ],
};

export const certDeployConfig = {
  0: [],
  1: [
    '宝塔提供9:00 - 24:00的人工部署证书部署服务，帮助客户排查部署证书部署生效问题，快速上线',
  ],
  2: [
    '宝塔提供9:00 - 24:00的人工部署国密算法证书部署服务，帮助客户排查部署证书部署生效问题，快速上线',
  ],
};

// 证书类型提示
export const certClassTips = computed((): string[] => {
  const list = busCertBuyInfo.value.certClass.filter(
    (item: any) => item.value === busCertBuyInfo.value.certClassAcitve
  );
  return list && list.length > 0 ? list[0].tips : [];
});

// 证书品牌提示
export const certBrandTips = computed((): string[] => {
  const list = busCertBuyInfo.value.certBrand.filter(
    (item: any) => item.value === busCertBuyInfo.value.certBrandAcitve
  );
  return list && list.length > 0 ? list[0].tips : [];
});

// 证书类型提示
export const certTypeTips = computed((): string[] => {
  const list = busCertBuyInfo.value.certType.filter(
    (item: any) => item.value === busCertBuyInfo.value.certTypeAcitve
  );

  return list && list.length > 0 ? list[0].tips : [];
});

// 证书年限提示
export const certLifeTips = computed((): string[] => {
  const list = busCertBuyInfo.value.certLife.filter(
    (item: any) => item.value === parseInt(busCertBuyInfo.value.certLifeAcitve)
  );
  return list && list.length > 0 ? list[0].tips : [];
});

// 证书部署提示
export const certDeployTips = computed((): string[] => {
  const list = busCertBuyInfo.value.certDeploy.filter(
    (item: any) =>
      item.value === parseInt(busCertBuyInfo.value.certDeployAcitve)
  );
  return list && list.length > 0 ? list[0].tips : [];
});

/**
 * @description 获取商业证书列表
 * @returns
 */
export const getCertList = async () => {
  try {
    loading.value = true;
    const { data, status }: any = await getCertSslListEvent();
    loading.value = false;
    if (!status) {
      Message.request({ msg: '获取证书列表失败', status: false });
      return { status: false, msg: '获取证书列表失败' };
    }
    // 推荐品牌
    certRecomBrand.value = data.info.recommend;
    // 初始化证书配置
    initCertConfig();
    // 创建证书提示结构
    createCertTipsStructure(data.info);
    // 创建商业证书品牌列表
    createCertMateSslList(data.data);
    // 商业证书配置
    certSslHandle();
  } catch (error) {
    console.log(error);
    return { status: false, msg: '获取证书列表失败' };
  }
};

/**
 * @description 证书域名数量
 */
export const certDomainNumHandle = (
  num: AnyObject | number = busCertBuyInfo.value.num
) => {
  let newNum = num;
  if (isObject(num) && typeof num !== 'number') {
    num = Number(num.data);
    newNum = Number(busCertBuyInfo.value.num) || 1; // 域名数量，最小为1，禁止为0
  } else {
    newNum = Number(busCertBuyInfo.value.num + num) || 1; // 域名数量，最小为1，禁止为0
  }
  if (newNum && (newNum < 1 || newNum > 99)) {
    busCertBuyInfo.value.num = newNum < 1 ? 1 : 99;
    return Message.error('域名数量范围为1-99');
  }
  busCertBuyInfo.value.num = newNum;
  if (busCertBuyInfo.value.certTypeAcitve !== 'wildcard') {
    busCertBuyInfo.value.certTypeAcitve =
      busCertBuyInfo.value.num > 1 ? 'multiple' : 'single';
  }
  certSslHandle();
};

/**
 * @description 切换证书的选项
 */
export const cutCertOption = (name: string, type: string, item?: any) => {
  if (!item)
    item = busCertBuyInfo.value[type].filter(
      (items: any) => items.value === name
    );
  if (item.disable) return;
  if (`${type}Acitve` in busCertBuyInfo.value)
		busCertBuyInfo.value[`${type}Acitve`] = name;

	//切换后 默认选中推荐品牌
	if(type == 'certClass')busCertBuyInfo.value.certBrandAcitve = getRecomBrand()
  certSslHandle();
};

/**
 * @description 获取推荐品牌
 */
export const getRecomBrand = () => {
  return certRecomBrand.value[
    busCertBuyInfo.value.certClassAcitve?.toLowerCase()
  ];
};

/**
 * @description 初始化证书配置
 */
export const initCertConfig = () => {
  busCertBuyInfo.value.certClassAcitve = 'DV';
  busCertBuyInfo.value.certBrandAcitve = getRecomBrand();
  busCertBuyInfo.value.certTypeAcitve = 'single';
  busCertBuyInfo.value.certLifeAcitve = 1;
  busCertBuyInfo.value.certDeployAcitve = 1;
};

/**
 * @description 合并列表提示
 */
const mergeListTips = (list: any[], tips: AnyObject, callback?: any) => {
  return list.map((item: any, index: number) => {
    const tipsItem = callback ? callback(item, tips) : tips[item.value];
    return {
      ...item,
      tips: tipsItem,
    };
  });
};

/**
 * @description 创建证书提示结构
 * @param {Object} info 证书提示信息
 */
const createCertTipsStructure = ({ type, brand, times }: AnyObject) => {
  // 证书分类的提示
  busCertBuyInfo.value.certClass = mergeListTips(
    busCertBuyInfo.value.certClass,
    type,
    (item: selectItem, tips: any) => {
      return tips[`${item.value}`.toLowerCase()];
    }
  );
  certTypeConfig['multiple'] = certTypeConfig.single; // 多域名证书与单域名证书提示一致
  busCertBuyInfo.value.certType = mergeListTips(
    busCertBuyInfo.value.certType,
    certTypeConfig
  );
  busCertBuyInfo.value.certDeploy = mergeListTips(
    busCertBuyInfo.value.certDeploy,
    certDeployConfig
  );
  busCertBuyInfo.value.certBrand = mergeListTips(
    busCertBuyInfo.value.certBrand,
    brand,
    (item: selectItem, tips: any) => {
      return tips[
        item.value !== 'Positive' ? `${item.value}`.toLowerCase() : 'Positive'
      ];
    }
  );
  busCertBuyInfo.value.certLife = mergeListTips(
    busCertBuyInfo.value.certLife,
    times,
    (item: selectItem, tips: any) => {
      return tips[item.value + '_year'];
    }
  );
};

/**
 * @description 获取商业证书配置
 * @param {Object} config 证书配置
 * @returns {Object} 证书配置
 */
const getBusCertConfig = (data: any = {}): AnyObject => {
  let { num, classify, brand, type, life, deploy } = data;
  const busCertBuy = busCertBuyInfo.value;
  if (!num) num = busCertBuy.num;
  if (!classify) classify = busCertBuy.certClassAcitve;
  if (!brand) brand = busCertBuy.certBrandAcitve;
  if (!type) type = busCertBuy.certTypeAcitve;
  if (!life) life = busCertBuy.certLifeAcitve;
  if (!deploy) deploy = busCertBuy.certDeployAcitve;
  return { num, classify, brand, type, life, deploy };
};

/**
 * @description 创建商业证书品牌列表
 */
export const createCertMateSslList = (data: any[]) => {
  const list = [] as any;
  data.forEach((item: any) => {
    const type = item.type.match(/(OV|DV|EV)/)?.[0];
    const isWildcard = item.code.indexOf('wildcard') !== -1; // 是否支持泛域名
    const isIp = item.code.indexOf('ip') !== -1; // 是否支持IP证书
    const isMulti = item.add_price > 0; // 是否支持多域名
    let certType = isWildcard ? 'wildcard' : isMulti ? 'multiple' : 'single';
    // Digicert品牌只支持单域名，可以购买多张。
    if (item.brand === 'Digicert')
      certType = isWildcard ? 'wildcard' : 'single';
    list.push({ ...item, ...{ type, certType, isMulti,isIp } });
  });
  certBusSslList.defalutList = list;
};

/**
 * @description 商业证书配置
 */
const certSslHandle = () => {
  certSslDataHandle(certBusSslList.defalutList); // 证书列表处理
  certSslConfigHandle(); // 商业证书视图调整
  calculateCertSslPrice(); // 计算证书价格
};

/**
 * @description 证书域名处理
 */
const certSslDataHandle = (list: any[]) => {
  let { num } = getBusCertConfig();
  const newList = list.filter((item: any) => {
    return num > 1 ? item.isMulti : true;
  });
  if (newList.length > 0) {
    certBusSslList.domianNumList = newList;
    certClassHandle(newList);
  }
};

/**
 * @description 证书分类处理
 */
const certClassHandle = (list: any[]) => {
  const { classify } = getBusCertConfig();
  const newList = list.filter((item: any) => {
		// if(item.isIp && classify === 'DV') return true// IP证书只支持DV证书
    return item.type === classify;
  });
  if (newList.length > 0) {
    certBusSslList.classList = newList;
    certBrandHandle(newList);
  } else {
    console.log('证书分类', list);
  }
};

/**
 * @description 证书品牌处理
 */
const certBrandHandle = (list: any[]) => {
  const { brand } = getBusCertConfig();
  const newList = list.filter((item: any) => {
    return item.brand === brand;
  });
  if (newList.length > 0) {
    certBusSslList.brandList = newList;
    certTypeHandle(newList);
  }
};

/**
 * @description 证书类型处理
 */
const certTypeHandle = (list: any[]) => {
  const { type } = getBusCertConfig();
  if (list.length === 1) busCertBuyInfo.value.certTypeAcitve = list[0].certType; // 单个证书类型时，直接设置为当前证书类型
  const newList = list.filter((item: any) => {
    // 兼容单域名支持多购买的证书。
    const isContainMulti =
      busCertBuyInfo.value.certTypeAcitve === 'multiple' &&
      item.certType !== 'wildcard' &&
      item.isMulti;
    const isContainWildcard =
      busCertBuyInfo.value.certTypeAcitve === 'wildcard' &&
      item.certType === 'wildcard' &&
      item.isMulti;
    const isContainIp =
      busCertBuyInfo.value.certTypeAcitve === 'ip' &&
      item.isIp;

    return item.certType === type || isContainMulti || isContainWildcard || isContainIp;
  });
  if (newList.length > 0) {
    certBusSslList.typeList = newList;
  }
};

/**
 * @description 商业证书视图调整
 */
const certSslConfigHandle = () => {
  const { domianNumList, classList, brandList, typeList } = certBusSslList;

  // 证书分类
  busCertBuyInfo.value.certClass.forEach((item: any) => {
    let isDisable = domianNumList.some(
      (items: any) => items.type === item.value
    );
    if (
      item.value == 'EV' &&
      busCertBuyInfo.value.certTypeAcitve === 'wildcard'
    )
      isDisable = false;
    item.disable = !isDisable;
  });

  // 证书品牌
  busCertBuyInfo.value.certBrand.forEach((item: any) => {
    const isHidden = !classList.some(
      (items: any) => items.brand === item.value
    );
    item.hidden = isHidden;
    item.subscript = item.value === getRecomBrand() ? '推荐' : '';
    // 品牌匹配为空时，将品牌设置为推荐品牌，如果推荐品牌也为空，则设置为第一个品牌
    if (item.value === busCertBuyInfo.value.certBrandAcitve && item.hidden) {
      busCertBuyInfo.value.certBrandAcitve = getRecomBrand();
      if(item.value === busCertBuyInfo.value.certBrandAcitve && item.hidden){
        busCertBuyInfo.value.certBrandAcitve = certBusSslList?.classList?.[0]?.brand
      }
      const newList = certBusSslList?.classList?.filter((item: any) => {
        return item.brand === busCertBuyInfo.value.certBrandAcitve;
      });
      if (newList.length > 0) {
        certBusSslList.brandList = newList;
        certTypeHandle(newList);
      }
    }
  });

  // 证书类型
  busCertBuyInfo.value.certType.forEach((item: any) => {
    let isHidden = !brandList.some((items: any) => {
			if(items.isIp && item.value === 'ip') return true// IP证书只支持DV证书
      return items.certType === item.value;
    });
    if (item.value === 'single' && busCertBuyInfo.value.num > 1)
      isHidden = true;
    if (item.value === 'multiple' && busCertBuyInfo.value.num === 1)
      isHidden = true;
    if (item.value === 'multiple' && busCertBuyInfo.value.num > 1)
      isHidden = false;
    if (item.value === 'ip' && busCertBuyInfo.value.num > 1)
      isHidden = true;
    item.hidden = isHidden;
  });

  // 部署服务,非CFCA品牌不支持自动部署
  if(busCertBuyInfo.value.certBrandAcitve !== 'CFCA' && busCertBuyInfo.value.certDeployAcitve === 2){
    busCertBuyInfo.value.certDeployAcitve = 1
  }
};

/**
 * @description 计算证书价格
 * @param {Array} list 证书列表
 * @param {Object} item 证书配置
 */
const calculateCertSslPrice = () => {
  const certInfo = certBusSslList.typeList[0] || null; // 证书信息
  certYearNum.value = certInfo?.num || 0; // 默认包含的域名数量
  if (certInfo) {
    const { num, life: years, deploy } = getBusCertConfig();
    const {
      price,
      other_price,
      add_price,
      pid,
      num: includeNum,
      install_price,
      install_price_v2,
    } = certInfo;

    const extraNumber = num - includeNum < 0 ? 0 : num - includeNum; // 额外域名数量
    const deployPriceList = [0, install_price, install_price_v2];
    const deploymentPrice = deployPriceList[deploy]; // 部署服务价格

    const extraPrice = add_price * extraNumber; // 额外域名价格
    const totalPrice = (extraPrice + price) * years + deploymentPrice; // 总价格
    const originalPrice = other_price + extraPrice + deploymentPrice; // 原价
    certSelectSslInfo.value = {
      addPrice: add_price || 0,
      productName: certInfo.title,
      price,
      totalPrice,
      originalPrice,
      deploymentPrice,
      pid,
      years,
      yearsPrice: price * years,
      number: includeNum,
      extraNumber,
      extraPrice,
      install: Number(deploy),
    };
  }
};

const payOrderInfo = ref({
  oid: 0,
  wxcode: '',
  alicode: '',
  qq: '',
  orderInfo: {},
}); // 支付订单信息

/**
 * @description 支付商业证书订单
 *
 */
export const paymentSslOrder = async (close?: any) => {
  const { pid, install, years, extraNumber }: AnyObject =
    certSelectSslInfo.value;

  const params = {
    pdata: JSON.stringify({ pid, install, years, num: extraNumber }),
  };

  const {data:res,msg}: AnyObject = await useDataHandle({
    loading: '正在创建商业证书订单，请稍后...',
    request: applyCertOrderPay(params),
    // data: {
    //   status: Boolean,
    //   'msg.oid': [Number, 'oid'],
    //   'msg.wxcode': [String, 'wxcode'],
    //   'msg.alicode': [String, 'alicode'],
    //   'msg.qq': [String, 'qq'],
    //   'msg.order_info': [Object, 'orderInfo'],
    //   msg: [String, data => data],
    // },
	});
	const {status} = res
  if (!status) return Message.error(msg);
	const { oid, wxcode, alicode, qq, order_info:orderInfo} = res.msg;
  payOrderInfo.value = {
    oid,
    wxcode,
    alicode,
    qq,
    orderInfo,
  };
  busCertPayDialog({
    ...payOrderInfo.value,
    productInfo: certSelectSslInfo.value,
  });
  // popupClose() 关闭商业证书申请弹窗
};

/*********************商业证书验证**********************/
export const isWildcardHelp = [{ content: '通配符证书只支持DNS验证' }];
const isMultiHelp = [{ content: '多域名只支持DNS验证' }];
export const selectExistDomainPopup = ref(false);
export const customDomainPopup = ref(false);
export const existDomainSerach = ref('');
export const existDomainActive = ref('');
export const existDomainList = ref<any[]>([]);
export const existDomainBackupList = ref<any[]>([]);
export const checkDomainMethod = ref(false);
export const customDomainRef = ref()
export const customDomainForm = ref({
  domain: '',
});

// 证书验证类型
export const sslVerifyType = ref('CNAME_CSR_HASH');
// 证书用户信息展示
export const userBaseShow = ref(true);
// DNS验证方式-自动解析
export const dnsVerify = ref('dns');
// 当前证书验证类型，是否为多域名证书
export const isMulti = ref(false);
// 当前证书验证类型，是否为通配符证书
export const isWildcard = ref(false);
// 当前证书验证类型，是否为Ip证书
export const isIp = ref(false);

// export const orderInfo = ref({
//   pid: 0,
//   oid: 0,
//   title: '',
//   limit: 1,
//   type: 'dv',
//   install: false,
//   isWildcard: false,
//   isMulti: false,
// }); // 证书信息

export const defalutHelp = [
  { content: 'https或者http验证，必须保证网站能通过http/https访问' },
  {
    content:
      '域名前缀是www,提醒用户解析上级根域名，如申请www.bt.cn，请确保解析bt.cn',
  },
  {
    content: () => (<a class="text-primary" href="https://www.bt.cn/bbs/thread-85379-1-1.html" target="_blank">如何验证商用证书?</a>),
  },
];

export const addDomainHelp: any[] = [
  { content: '申请之前，请确保域名已解析，如未解析会导致审核失败(包括根域名)' },
  {
    content:
      '申请www.bt.cn这种以www为二级域名的证书，需绑定并解析顶级域名(bt.cn)，否则将验证失败',
  },
  { content: 'SSL证书可选名称赠送规则：' },
  { content: '1、申请根域名(如：bt.cn),赠送下一级为www的域名(如：www.bt.cn)' },
  {
    content:
      '2、申请当前host为www的域名（如：www.bt.cn）,赠送上一级域名，(如: bt.cn)',
  },
  {
    content:
      '3、申请其它二级域名，(如：app.bt.cn)，赠送下一级为www的域名 (如：www.app.bt.cn)',
  },
];

// 证书验证类型列表
export const sslVerifyTypeList = ref([
  {
    value: 'CNAME_CSR_HASH',
    label: 'DNS验证(CNAME解析)',
    tips: '如网站还未备案完成，可选【DNS验证】',
    isCheck: '',
    checkTips: [],
  },
  {
    value: 'HTTP_CSR_HASH',
    label: '文件验证(HTTP)',
    tips: '如网站未开启301、302、强制HTTPS、反向代理功能，请选择HTTP',
    isCheck: '',
    checkTips: [],
  },
  {
    value: 'HTTPS_CSR_HASH',
    label: '文件验证(HTTPS)',
    tips: '如网站开启【强制HTTPS】，请选【HTTPS验证】',
    isCheck: '',
    checkTips: [],
  },
]);

// 证书验证方式
export const getCertVerifyMode = (isWild:boolean,isIpCert:any,item:any) => {
  // 通配符证书只支持DNS验证,ip证书只支持文件验证
  if(isIpCert){
    sslVerifyType.value = 'HTTP_CSR_HASH'
  }
  switch(item.value){
    case 'CNAME_CSR_HASH':
      return !isIpCert
    case 'HTTP_CSR_HASH':
      return !isWild
    case 'HTTPS_CSR_HASH':
      return !isWild
  }
};

export const isNotDvHelp = [
  { content: 'OV/EV证书申请流程条件：' },
  { content: '1、填写网站验证信息(文件验证或DNS验证)' },
  { content: '2、完成邮箱认证，根据CA发送的邮件完善邮件内容(中文填写即可)' },
  {
    content:
      '3、企查查或者爱企查、百度地图、114best能查询到相关企业信息，且公司名和公司地址完全匹配',
  },
  {
    content:
      '4、企查查或其他平台留下的电话能保证周一到周五(7:00 - 15:00)能接听到CA的认证电话，电话号码归属地来自美国，请留意接听。',
  },
];

/**
 * @description 证书验证帮助
 */
export const sslVerifyHelp = computed(() => {
  const help = [];
  isWildcard.value && help.push(...isWildcardHelp);
  isMulti.value && help.push(...isMultiHelp);
  help.push(...defalutHelp);
  if (orderInfo.value.type !== 'dv') {
    help.push(...isNotDvHelp);
  }
  return help;
});

/**
 * @description 证书域名提示
 */
export const sslDomainsTips = computed(() => {
  const prefix = isWildcard.value ? '*' : 'www';
  return isMulti.value
    ? `多域名${isWildcard.value ? '通配符' : ''}证书，每行一个域名，支持${
        orderInfo.value.limit
      }个域名，必填项,例如：<div>${prefix}.bt.cn</div><div>${prefix}.bttest.cn</div>`
    : `请输入需要申请证书的域名（单域名${
        isWildcard.value ? '通配符' : ''
      }证书），必填项，例如：${prefix}.bt.cn`;
});

// 证书申请信息 - 按视图分析是否需要写在业务层
export const form = ref({
  domains: '',
  dcvMethod: '',
  auth_to: '',
  Administrator: {
    address: '',
    city: '',
    country: '',
    email: '',
    firstName: '',
    lastName: '',
    job: '',
    name: '',
    mobile: '',
    organation: '',
    postCode: '',
    state: '',
  },
});

// 管理员姓名
export const adminName = computed(() => {
  return form.value.Administrator.lastName + form.value.Administrator.firstName;
});

/**
 * @description 展开证书用户信息
 */
export const cutCretUserBase = () => {
  userBaseShow.value = !userBaseShow.value;
};

/**
 * @description 证书数据预处理
 */
export const sslInfoHandle = () => {
  form.value.Administrator = {
    ...sslApplicationInfo.value,
    name: '',
  };
  form.value.Administrator.name = adminName.value;
  const { pid, oid, title, limit, install, code } = orderInfo.value;
  const orderSslType =
    code.indexOf('ev') > -1 ? 'ev' : code.indexOf('ov') > -1 ? 'ov' : 'dv';
  isMulti.value = code.indexOf('multi') > -1;
  isWildcard.value = code.indexOf('wildcard') > -1;
  isIp.value = code.indexOf('ip') > -1;
  orderInfo.value = {
    pid,
    oid,
    title,
    limit,
    install,
    isMulti: isMulti.value,
    isWildcard: isWildcard.value,
    isIp: isIp.value,
    type: orderSslType,
	};
};

/**
 * @description 选择已有域名
 */
export const selectExistDomain = async () => {
  try {
    const res: any = await getDomainListEvent();
    existDomainList.value = res.data.map((item: any) => ({label: item.name,value: item.name,...item}))
    selectExistDomainPopup.value = true;
    existDomainActive.value = existDomainList.value?.[0]?.name || '';
    existDomainBackupList.value = existDomainList.value; // 备份域名列表
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 搜索匹配域名
 */
export const serachExistDomain = (val: string) => {
  existDomainList.value = [];
  existDomainBackupList.value.forEach((item: any) => {
    if (item.name.indexOf(val) > -1) existDomainList.value.push(item);
  });
  if (!existDomainList.value.length)
    existDomainList.value = existDomainBackupList.value;
};

/**
 * @description 选择已有域名确认
 */
export const selectExistDomainConfirm = async () => {
  form.value.domains = existDomainActive.value;
  selectExistDomainPopup.value = false;
  if (!isWildcard.value) reanderDomainCheck();
};

/**
 * @description 重新渲染域名检测
 */
export const reanderDomainCheck = async () => {
  checkDomainMethod.value = true;
  const { data } = await checkSslMethod(existDomainActive.value);
  checkDomainMethod.value = false;
  sslVerifyTypeList.value.forEach((item: any) => {
    if (isNumber(data[item.value])) {
      item.isCheck = !!data[item.value];
      item.checkTips = !!data[item.value];
    } else {
      item.isCheck = false;
      item.checkTips = data[item.value];
    }
  });
};

export const customRules = reactive({
	domain: [
		defaultVerify({ message: '域名不能为空' }),
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!checkDomain(value)) {
					callback(new Error('域名格式错误，请重新输入'))
				} else if (!isWildcard.value && value.indexOf('*') > -1) {
					callback(new Error('当前为单域名证书，不支持通配符申请'))
				} else { 
					callback()
				}
			},
			trigger: ['change'],
		},
	]
})

/**
 * @description 提交自定义域名
 */
export const selectCustomDomain = () => {
  customDomainPopup.value = true;
};

/**
 * @description 提交自定义域名
 */
export const submitCustomDomain = async () => {
	await customDomainRef.value?.validate()
  form.value.domains = customDomainForm.value.domain;
  customDomainPopup.value = false;
  if (!isWildcard.value) reanderDomainCheck();
};

/**
 * @description 切换证书DNS验证方式
 * @param {boolean} status 是否设置
 */
export const setSslDnsApi = (status?: boolean) => {
  const active = dnsVerify.value;
  if (active !== 'dns') {
    const item = sslDnsApiInfo.value.find((item: any) => item.value === active);
    if (item) {
      const isDeploy = !item.data;
      if (!status || (status && isDeploy)) {
        dnsApiVerifyDialog({
          title: `设置${item.info.title}接口`,
          row: item.info,
        });
      }
    }
  }
};

/**
 * @description 证书信息提交
 */
export const sslInfoSubmit = async (params: any,certType:number) => {
  let load = null;
  if (!params.value.domains) {
    return Message.error('域名不能为空');
  }

  if(orderInfo.value.isIp){
    // 如果是IP证书，则需要验证domains是否为ipv4
    if(!checkIp(params.value.domains)){
      return Message.error('IP证书申请域名格式错误，请输入正确的ipv4地址');
    }
  }
  if (!params.value.Administrator.state && !params.value.Administrator.city) {
    return Message.error('所在地区不能为空');
  }
  if (!params.value.Administrator.address && orderInfo.value.type !== 'dv') {
    return Message.error('公司详细地址不能为空');
  }
  if (!params.value.Administrator.organation) {
    return Message.error('公司名称不能为空');
  }
  if (!params.value.Administrator.name) {
    return Message.error('姓名不能为空');
  }
  if (!params.value.Administrator.email) {
    return Message.error('邮箱不能为空');
  }
  if (!params.value.Administrator.mobile) {
    return Message.error('手机不能为空');
  }
  try {
    load = Message.load('正在提交证书信息，请稍后...');
    const {
      job,
      postCode,
      country,
      firstName,
      lastName,
      name,
      state,
      city,
      address,
      organation,
      email,
      mobile,
    } = params.value.Administrator;
    const res = await applyBusSsl(
      JSON.stringify({
        pid: orderInfo.value.pid,
				cert_ssl_type: certType,
        oid: orderInfo.value.oid,
        domains: form.value.domains
          ?.split('\n')
          .filter((item: string) => item.trim()),
        dcvMethod: sslVerifyType.value,
        auth_to: dnsVerify.value,
        Administrator: {
          job,
          postCode,
          country,
          lastName: name,
          state,
          city,
          address,
          organation,
          email,
          mobile,
        },
      })
    );

    if (isObject(res.data.msg) && res.data.msg.hasOwnProperty('code')) {
      let errors = res.data.errors;
      errorData.value = [];
      Object.keys(errors).forEach((item: any) => {
        errors[item].forEach((error: any, index: number) => {
          errorData.value.push({
            field: item,
            error: error,
          });
        });
      });
      submitPopup.value = true;
    } else {
      let msg = res.msg || res.data.msg;
      let status = res.data.status;
      Message.request(
        res.data || {
          msg: status
            ? msg || '提交成功'
            : msg ||
              '资料提交错误，请检查管理员信息是否填写正确，如填写错误请联系客服重置订单',
          status: status,
        }
      );
    }

    if (res.data.status) {
      // popupClose(); // 关闭弹窗
      //  刷新商业证书列表
      isRefreshSSL.value = true;
      const { data: certVerifyInfo, status }: any  = await verifyBusCertEvent(orderInfo.value.oid,certType,orderInfo.value.pid); // 验证域名前置操作
			if (certVerifyInfo) busCertVerifyWayDialog({...certVerifyInfo,cert_ssl_type:certType,certType,pid:orderInfo.value.pid}); // 验证弹窗
			otherPopup.value?.unmount()
    }
  } catch (error) {
    console.log(error);
  } finally {
    load && load.close();
  }
};

/**
 * @description 重新验证
 */
export const resultsVerify = async (row: any, index: number) => {
  try {
    const params = {
      url: row.url,
      content: row.content,
    };

    const data = await useDataHandle({
      loading: '正在验证商用证书，请稍后...',
      request: checkUrlTxt(params),
      data: Number,
    });
    // 替换urlTableData[index] = data
    urlTableData.value[index]['status'] = data as never;
  } catch (error) {
    console.log(error);
  }
};

/**
 * @description 验证域名
 */
export const verifyDomain = async () => {
  // 验证商用证书
  const { data } = await verifyBusCertEvent(certVerifyInfo.value.oid,certVerifyInfo.value.cert_ssl_type,certVerifyInfo.value.pid);
  if (data) certVerifyInfo.value = data;
	await initCertData();
  if (certVerifyInfo.value?.certStatus === 'PENDING')
		Message.success('验证中，请耐心等待！');
	if (certVerifyInfo.value?.certStatus === 'COMPLETE')
		Message.success('验证成功！');
	otherPopup.value.unmount()
  isRefreshSSL.value = true;
};

/**
 * @description 设置验证方式
 */
export const setVerifyType = (close: any) => {
  let isIp = certVerifyInfo.value.res && certVerifyInfo.value.res.verification && certVerifyInfo.value.res.verification.indexOf('dns') == -1
  
  console.log(certVerifyInfo.value.res,isIp)
  // 打开修改验证方式弹窗
  ModifyVerifyWayDialog({ oid: certVerifyInfo.value.oid, type: wayType.value, certType: certVerifyInfo.value.certType, pid: certVerifyInfo.value.pid,isIp });
};

export const helpList = ref([
  {
    content:
      '本次验证结果是由【本服务器验证】，实际验证将由【CA服务器】进行验证，请耐心等候',
  },
  {
    content: '请确保以上列表所有项都验证成功后点击【验证域名】重新提交验证',
  },
  {
    content: '如长时间验证不通过，请通过【修改验证方式】更改为【DNS验证】',
  },
  {
    content: () => (<span>如何添加域名解析，《<a href="https://cloud.tencent.com/document/product/302/3446" class="text-primary" target="__blink">点击查看教程</a>》，和咨询服务器运营商</span>),
  },
]); // 帮助列表

/**
 * @description 组装数据
 */

export const initCertData = async() => {
  if (certVerifyInfo.value?.data) {
    const {
      data: {
        dcvList,
        DCVdnsHost,
        DCVdnsType,
        DCVdnsValue,
        DCVfileName,
        DCVfileContent,
      },
      paths,
    } = certVerifyInfo.value;
    // 提取dcvList中的domainName用逗号分隔
    domains.value = dcvList?.map((item: any) => item.domainName).join(',');
    wayType.value = dcvList[0].dcvMethod;

    const form = {
      dnsHost: DCVdnsHost,
      dnsType: DCVdnsType,
      dnsValue: DCVdnsValue,
      fileName: DCVfileName,
      fileContent: DCVfileContent,
      filePath: '/.well-known/pki-validation/',
    };

    // 文件类型
    if (wayType.value !== 'CNAME_CSR_HASH') {
      // 表格信息
      urlTableData.value = paths?.map((item: any) => {
        return {
          url: item.url,
          status: item.status,
          content: DCVfileContent,
        };
      });

      helpList.value.splice(3, 1, {
        content: () => (<span>SSL添加文件验证方式 ->> <a href="https://www.bt.cn/bbs/thread-56802-1-1.html" target="_blank" class="text-primary" >查看教程</a></span>),
      });
    }
    return form;
  } else {
    Message.error('获取数据失败');
    return {};
  }
};

/**
 * @description 修改验证方式
 * @param data
 */
export const ModifyVerifyWayDialog = (data: AnyObject): Promise<any> =>
  useDialog({
    title:
      '验证域名-' + (data.type.indexOf('CNAME_') > -1 ? 'DNS验证' : '文件验证'),
    area: 52,
    showFooter: true,
    btn: ['更改', '取消'],
    component: () =>
      import('@site/public/ssl-arrange/business-cert/modify-verify-way.vue'),
    compData: data,
  });

/**
 * @description 打开详情
 */
export const openDetailView = (row: BusinessTableProps) => {
  useDialog({
    title:
      '多年期证书详情',
    area: 52,
    compData: row,
    component: () =>
      import('@site/public/ssl-arrange/business-cert/mulit-cert-detail.vue'),
  });
}

export const wayType = ref('');
export const urlTableData = ref([]);
export const domains = ref();


/**
 * @description 获取宝塔证书SSL状态
 */
export const getBtSslStatus = (row: BusinessTableProps) => {
  // -1=已取消 0=刚生成 1=待审核 2=正在提交CA 3=待域名验证  4=签发中  5=已签发  6=取消确认 7=待续费 8=待吊销确认 9=待重颁发 10=重颁发中 11=吊销中 12=已吊销
				const troub = (
					<ElPopover placement="bottom-end" width="400" popper-class="white-theme" trigger="click">
						{{
							default: () => (
								<div class="bus-ssl-popover">
									<div class="ssl-popover-item">
										<span class="ssl-popover-title">自行排查</span>
										<p>以图文的形式，一步步教您验证并部署商业SSL</p>
										<a class="bt-link" href="https://www.bt.cn/bbs/thread-85379-1-1.html" target="_blank">
											如何验证商用证书?
										</a>
									</div>
									<div class="ssl-popover-item">
										<span class="ssl-popover-title">购买人工</span>
										<p>不会部署?人工客服帮你全程部署，不成功可退款</p>
										<ElButton size="small" type="primary" onClick={() => buyArtificialService(row)}>
											购买人工
										</ElButton>
									</div>
								</div>
							),
							reference: () => <span class="bt-link">排查方法?</span>,
						}}
					</ElPopover>
				)
	const status = row.orderStatus

	const btnGround = []
	switch(Number(status)) {
		case -1:
			btnGround.push(<span class="text-danger">已取消</span>)
			break
		case 0:
			btnGround.push(<span class="text-warning">待完善资料</span>)
			if(!row.install) btnGround.push(troub)
			break
		case 1:
			btnGround.push(<span class="text-warning">待审核</span>)
			break
		case 2:
			btnGround.push(<span class="text-warning">正在提交CA</span>)
			break
		case 3:
			btnGround.push(<span class="text-warning">待域名验证</span>)
			break
		case 4:
			btnGround.push(<span class="text-warning">签发中</span>)
			break
		case 5:
			btnGround.push(<span class="text-success">已签发</span>)
			break
		case 6:
			btnGround.push(<span class="text-warning">取消确认</span>)
			break
		case 7:
			btnGround.push(<span class="text-warning">待续费</span>)
			break
		case 8:
			btnGround.push(<span class="text-warning">待吊销确认</span>)
			break
		case 9:
			btnGround.push(<span class="text-warning">待重颁发</span>)
			break
		case 10:
			btnGround.push(<span class="text-warning">重颁发中</span>)
			break
		case 11:
			btnGround.push(<span class="text-warning">吊销中</span>)
			break
		case 12:
			btnGround.push(<span class="text-danger">已吊销</span>)
			break
		default:
			btnGround.push(<span class="text-warning">待完善资料</span>)
	}
	const newBtnGround: JSX.Element[] = []
	btnGround.map((item, index) => {
		newBtnGround.push(item)
		index < btnGround.length - 1 ? newBtnGround.push(<BtDivider />) : ''
	})
	return newBtnGround
}

/**
 * @description 获取宝塔证书SSL操作
 */
export const getBtSslOperate = (row: BusinessTableProps) => {
	// 0 完善资料  5 下载证书  3、11  验证
	// 按钮渲染
	const spanRender = (text: string, onClick: AnyFunction) => (
		<span class="bt-link" onClick={onClick}>
			{text}
		</span>
	)
	const artificial = spanRender('人工服务', () => onlineServiceDialog())
	const detail = spanRender('详情', () => openDetailView(row))
	const download = spanRender('下载', () => downloadBusSslEvent(row))
	const deploy = spanRender('部署', () => setBusSslDeploy(row))
	const verify = spanRender('验证', () => certVerifyWayEvent(row.oid,row.cert_ssl_type,row.pid))
	const renewal = spanRender('续签', () => renewalBusCertEvent(row.oid))
	const improve = spanRender('完善资料', () => openBusCertVerifyInfoView(row))
	const status = row.orderStatus
	const btnGround = []
  if(row.years && row.years > 1 && [5,15].includes(Number(status))) btnGround.push(detail)
	switch(Number(status)) {
		case 0:
			if (row.install) btnGround.push(artificial)
			btnGround.push(improve)
			break
		case 3:
			if (row.install) btnGround.push(artificial)
			btnGround.push(verify)
			break
		case 5:
			btnGround.push(deploy)
			btnGround.push(download)
			break
		case 7:
			btnGround.push(renewal)
			break
		case 11:
			if (row.install) btnGround.push(artificial)
			btnGround.push(verify)
			break
		default:
			break
	}
	const newBtnGround: JSX.Element[] = []
	btnGround.map((item, index) => {
		newBtnGround.push(item)
		index < btnGround.length - 1 ? newBtnGround.push(<BtDivider />) : ''
	})
	return newBtnGround
}
