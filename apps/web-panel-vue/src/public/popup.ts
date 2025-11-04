// import type {
//   FileSelectionOptions,
//   PluginInstallOptions,
//   PushMessageConfigOptions,
// } from '@/public/types';
// /* eslint-disable @typescript-eslint/naming-convention */
// import type { App } from 'vue';

import { getPluginInfo, writeNpsQuestion, checkLoginAuth } from '@/api/global'
import { closeAllDialog, useDialog } from '@/hooks/tools/dialog'
import { App } from 'vue'
import { isBoolean, isUndefined } from '@/utils'
import { useGlobalStore } from '@/store/global'
import { useIntstallStore } from '@/components/business/bt-soft-install/store'
import { useMessage } from '@/hooks/tools'
import { useThrottleFn } from '@vueuse/core'
import { title } from 'process'
import { AlarmModuleOptionsProps, BatchSetClassOptions, FileSelectionOptions, NpsSurveyV2DialogProps, PluginInstallOptions, ProductPaymentDialogProps, PushMessageConfigOptions } from './types'

// import { AlarmConfigProps } from '@/components/business/bt-alarm-configure/types'

const { compData } = useIntstallStore()
const { forceLtd, aliyunEcsLtd, payment } = useGlobalStore()

// import { getPluginInfo } from '@/api/global';
// import { AlarmConfigProps } from '@/components/popup/bt-alarm-config/types';
// // import PRODUCT_PAYMENT_STORE from '@/components/popup/bt-product-payment/store';
// import { useGlobalStore } from '@/store/global';
// import { useDialog } from '@dialog/index';
// // import INSTALL_STORE from '@public/bt-soft-install/store';
// import { storeToRefs } from 'pinia';
// import { BatchSetClassOptions } from './types';

/**
 * @description 消息盒子
 * @returns {Promise<App>}
 */
export const msgBoxDialog = (): Promise<App> =>
	useDialog({
		title: '消息盒子',
		area: [72, 56],
		component: () => import('@layout/views/sidebar/msg-box/index.vue'),
	})

/**
 * @description 重启弹窗
 * @returns {Promise<VueConstructor>}
 */
export const restartSeverDialog = async (): Promise<App> =>
	useDialog({
		title: '重启服务器或者面板',
		area: [33, 11],
		component: () => import('@home/views/header/restart/index.vue'),
	})

/**
 * @description 菜单设置
 * @returns {Promise<App>}
 */
export const menuSettingsDialog = (): Promise<App> =>
	useDialog({
		title: '设置菜单显示隐藏',
		area: [35, 40],
		component: () => import('@layout/views/sidebar/menu-settings/index.vue'),
	})

/**
 * @description NPS成功提示
 * @returns {App}
 */
export const npsThanksDialog = (): Promise<App> =>
	useDialog({
		title: false,
		area: 20,
		component: () => import('@components/business/bt-nps-thanks/index.vue'),
	})

/**
 * @description nps默认基础调查(旧版)
 */
export const npsSurveyDialog = (): Promise<App> =>
	useDialog({
		area: 60,
		component: () => import('@components/business/bt-nps-survey/index.vue'),
	})

/**
 * @description nps默认基础调查 v2 版本(新版)
 * @param {NpsSurveyV2DialogProps} options 调查配置
 */
export const npsSurveyV2Dialog = (options: NpsSurveyV2DialogProps): Promise<App> => {
	return useDialog({
		area: 52,
		compData: options,
		component: () => import('@components/business/bt-nps-survey-v2/index.vue'),
	})
}

/**
 * @description nps被动触发调查
 * @param {string} options.name 调查名称
 * @param {number} options.type 调查类型
 */
export const npsSurveyPassiveDialog = (options: { name: string; type: 31 }): Promise<App> | void => {
	const endtime = Number(localStorage.getItem('NPS-TIME'))
	const expArr = localStorage.getItem('NPS-EXP') || ''
	if (endtime < new Date().getTime() && !expArr.includes('31')) {
		return useDialog({
			title: false,
			area: 36,
			component: () => import('@components/business/bt-nps-survey-passive/index.vue'),
			modal: false,
			compData: options,
		})
	}
}

/**
 * @description nps企业用户调查
 * @returns
 */
export const npsSurveyLtdDialog = (): Promise<App> =>
	useDialog({
		area: 60,
		component: () => import('@components/business/bt-nps-survey-ltd/index.vue'),
		async cancel() {
			await writeNpsQuestion({
				questions: JSON.stringify({ '25': '用户未填写任何信息' }), // 问题与回答
				product_type: 19, // 产品类型 0:面板 1:waf 2:监控报表 3：防篡改  7：需求分析
				software_name: 'Enterprise-Edition-Survey', // 面板类型 panel、total、btwaf
				rate: 0, // 评分
			})
		},
	})

/**
 * @description 告警设置 消息通道配置
 * @param {string} options.title 标题
 * @param {string} options.type 类型
 * @param {Function} options.callback 回调函数
 * @returns
 */
export const setAlarmModuleDialog = (options: AlarmModuleOptionsProps): Promise<App> => {
	return useDialog({
		title: `${options.title}配置`,
		area: 54,
		compData: options,
		component: () => import('@components/business/bt-alarm-configure/index.vue'),
	})
}

/**
 * @description 选择路径
 * @param {string} options.type 选择类型，必填
 * @param {string} options.path 选择路径，非必填
 * @param {Function} options.change 当前选中事件，非必填，返回当前选中的路径path
 * @param {string} options.confirmText 当前确认按钮文本，非必填
 * @returns {Promise<App>}
 */
export const fileSelectionDialog = (options: FileSelectionOptions): Promise<App> =>
	useDialog({
		area: [75, 68.6],
		compData: options,
		component: () => import('@components/business/bt-file-selection/index.vue'),
	})

/**
 * @description 绑定账号
 * @returns {Promise<App>}
 */
export const bindUserDialog = async (title: string = '绑定宝塔账号，享受更多服务', redirect: string = ''): Promise<App> => {
	if (aliyunEcsLtd.value) return useMessage().error('当前为企业版，无法切换账号。')
	let asyncBindComponent = () => import('@components/business/bt-bind-user/index.vue')
	try {
		const authData = ref({ client: 0, login: 0 })
		const res = await checkLoginAuth()
		if (res.status) {
			if (res.data?.login !== 0) {
				authData.value.client = res.data.client
				authData.value.login = res.data.login
				switch (res.data?.client) {
					case 1:
						asyncBindComponent = () => import('@components/business/bt-bind-user/tencent-bind-user.vue')
						break
					case 2:
						asyncBindComponent = () => import('@components/business/bt-bind-user/ali-bind-user.vue')
						break
				}
			}
		}
		return useDialog({
			area: 40,
			component: asyncBindComponent,
			compData: { authData: authData.value, title, isDialog: true, redirect },
		})
	} catch (error) {
		return useDialog({
			area: 40,
			component: () => import('@components/business/bt-bind-user/index.vue'),
		})
	}
}

/**
 * @description 实时任务
 * @returns {Promise<App>}
 */
export const realTimeTaskDialog = (): Promise<App> =>
	useDialog({
		title: '实时任务队列',
		area: 52,
		component: () => import('@components/business/bt-real-time-task/index.vue'),
	})

/**
 * @description 在线客服
 * @returns {Promise<App>}
 */
export const onlineServiceDialog = (): Promise<App> =>
	useDialog({
		area: 20,
		component: () => import('@components/business/bt-online-service/index.vue'),
	})

/**
 * @description 修改用户名
 * @returns {Promise<App>}
 */
export const editorUserDialog = (): Promise<App> =>
	useDialog({
		area: 20,
		component: () => import('@components/business/bt-editor-username/index.vue'),
	})

/**
 * @description 支付界面（需要重新优化，参数过多） ---节流1000ms防止重复点击
 * @param {boolean} param.disablePro 是否禁用专业版，默认推荐企业版
 * @param {string} param.sourceId 来源ID
 * @param {boolean} param.plugin 是否为插件
 * @param {any} param.pluginInfo 插件信息
 * @param {any} param.isHomeBubble 是否为首页气泡进入
 * @param {boolean} param.compulsionLtd 是否强制企业版
 * @returns {Promise<App>}
 */
export const productPaymentDialog = useThrottleFn((options: ProductPaymentDialogProps): Promise<App> => {
	const area = aliyunEcsLtd.value ? [82, 60] : [100, 72]
	const isClose = aliyunEcsLtd.value && payment.value.authType !== 'ltd' ? false : isBoolean(options.showClose) ? options.showClose : true
	// if (!payment.value.bindUser) return bindUserDialog('绑定宝塔账号，享受更多服务') // 如果未绑定帐号，则打开绑定帐号弹窗
	return useDialog({
		area,
		showClose: isClose,
		compData: { ...options, disablePro: isUndefined(options.disablePro) ? true : options.disablePro },
		component: () => import('@components/business/bt-product-payment/index.vue'),
	})
}, 1000)

/**
 * @description 打开插件安装界面
 * @param {AnyObject} options.type 类型 i：安装 u：更新 r：修复，非必填，默认为i(安装)
 * @param {string} options.name 插件名称，非必填，通过插件名称获取插件信息
 * @param {AnyObject} options.pluginInfo 插件信息，非必填，如果传入，则不会根据name去获取插件信息
 */
export const pluginInstallDialog = async (options: PluginInstallOptions): Promise<App> => {
	const { installInfo } = useGlobalStore()
	installInfo.value = useDialog({
		area: 63,
		compData: options,
		component: () => import('@components/business/bt-soft-install/index.vue'),
	})
	return installInfo.value
}

/**
 * @description 消息通道配置
 * @param {string} options.title 标题
 * @param {string} options.type 类型
 * @param {Function} options.callback 回调函数
 * @returns
 */
export const pushMessageConfigDialog = (options: PushMessageConfigOptions): Promise<App> => {
	const { title, type, callback } = options
	return useDialog({
		title,
		area: 50,
		compData: { type, callback },
		component: () => import('@components/business/bt-msg-config/index.vue'),
	})
}

// /**
//  * @description 打开插件安装界面
//  * @param {AnyObject} options.type 类型 i：安装 u：更新 r：修复，非必填，默认为i(安装)
//  * @param {string} options.name 插件名称，非必填，通过插件名称获取插件信息
//  * @param {AnyObject} options.plugin 插件信息，非必填，如果传入，则不会根据name去获取插件信息
//  */
// export const pluginInstallDialog = async (
//   options: PluginInstallOptions
// ): Promise<App> => {
//   const { compData } = storeToRefs(INSTALL_STORE());
//   compData.value = options;
//   const { installInfo } = useGlobalStore();
//   installInfo.value = useDialog({
//     area: 63,
//     compData: options,
//     component: () => import('@public/bt-soft-install/index.vue'),
//   });
//   return installInfo.value;
// };
// // /**
// //  * @description 打开插件视图界面
// //  * @param {AnyObject} options.name 插件名称，非必填，通过插件名称获取插件信息
// //  * @param {AnyObject} options.pluginInfo 插件信息，非必填，如果传入，则不会根据name去获取插件信息 发个
// //  *
// //  */
// // export const pluginViewDialog = async (options: PluginInstallOptions): Promise<App> => {
// // 	// 插件-安装检测
// // 	// 插件-权限检测
// // 	// 打开插件视图界面
// // }

// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// // |
// //  以下的模块参数过多，需要重新优化
// // ---------------------------------------------------------------------------------------------------------------

// /**
//  * @description 打开插件支付界面（需要重新优化，参数过多）
//  * @param {boolean} param.isDisablePro 不传默认禁用，是否禁用专业版，默认推荐企业版
//  * @param {number | string} param.sourceId 来源ID 不传默认为
//  * @param {any} param.pluginInfo 插件信息
//  * @param {any} param.isHomeBubble 是否为首页气泡进入
//  * @returns {Promise<App>}
//  */
// export const openProductPayment = async ({
//   isDisablePro = true,
//   sourceId = 27, // 27 首页右上角支付来源
//   pluginInfo,
//   isHomeBubble,
// }: {
//   isDisablePro?: boolean; // 是否禁用专业版，默认推荐企业版
//   sourceId?: string | number; // 来源ID
//   pluginInfo?: {
//     // 插件信息 存在则显示插件tab
//     title: string;
//     type: number;
//     pid: number;
//     ps: string;
//   };
//   isHomeBubble?: AnyObject;
// }): Promise<App> => {
//   const { payment } = useGlobalStore();
//   const { instance } = toRefs(payment.value);
//   const productPaymentStore = PRODUCT_PAYMENT_STORE();
//   const { compData } = storeToRefs(productPaymentStore);
//   compData.value = {
//     isDisablePro, // 使用解构赋值设置的默认值
//     sourceId,
//     pluginInfo,
//     isHomeBubble,
//   };
//   instance.value = useDialog({
//     area: [100, 72],
//     compData: {
//       isDisablePro, // 使用解构赋值设置的默认值
//       sourceId,
//       pluginInfo,
//       isHomeBubble,
//     },
//     component: () => import('@components/popup/bt-product-payment/index.vue'),
//   });
//   return instance.value;
// };

/**
 * @description 需求反馈
 */
export const desiredNpsDialog = async ({
	id = 999,
	type,
	name,
	softName = 'panel',
	description,
	isNoRate = false,
	title,
	isCard = true,
	isShowPhone = true,
}: {
	id?: number
	type: number
	name?: string
	softName?: string
	description?: string
	isNoRate?: boolean
	title?: string
	isCard?: boolean
	isShowPhone?: boolean
}): Promise<App> => {
	return npsSurveyV2Dialog({
		id,
		type,
		name,
		softName,
		description,
		isNoRate,
		title,
		isCard,
		isShowPhone,
	})
}

/**
 * @description 错误弹窗
 * @returns {Promise<App>}
 */
// export const errorDialog = (message: string, errorFind: any, isShow: boolean): Promise<App> =>
// 	useDialog({
// 		area: ['120'],
// 		title: false,
// 		component: () => import('@public/BtError/popup/BtErrorPopup.vue'),
// 		compData: {
// 			gl_error_body: message,
// 			error_find: errorFind,
// 			isBuy: isShow,
// 		},
// 	})

/**
 * @description 打开插件弹窗-兼容模式
 */
export const pluginPopupDialog = async (compData: { name?: string; id?: string; built?: boolean; pluginInfo: any; callback?: (app: Window) => void }) => {
	// 判断是否为特殊环境插件
	const row = compData.pluginInfo
	if (!row) {
		const { data: res } = await getPluginInfo({ sName: compData.name as string })
		compData.pluginInfo = res
	}
	const softPopup: any = {
		phpmyadmin: () => phpMyAdminPluginView(),
		tomcat: () => tomcatPluginView(row),
		pureftpd: () => ftpdPluginView(row),
		memcached: () => memcachedPluginView(row),
		nginx: () => nginxPluginView(row),
		mysql: () => mysqlPluginView(row),
		openlitespeed: () => openLitePluginView(row),
		php: () => phpPluginView(row),
		apache: () => apachePluginView(row),
	}
	if (row.name?.includes('php-') || softPopup[row.name]) {
		// const { data: res } = await getPluginInfo({ sName: row.name })
		// Object.assign(row, res)
		if (row.name.includes('php-')) return softPopup.php()
		if (softPopup[row.name]) return softPopup[row.name]()
	}
}

/**
 * @description mysql phpMyadmin弹窗
 * @returns {Promise<any>}
 */
export const phpMyAdminPluginView = (): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'PHPMyAdmin',
		area: [74, 56],
		component: () => import('@soft/public/environment-plugin/php-my-admin/index.vue'), // 组件引入
	})

/**
 * @description 环境插件-ftpd
 * @returns {App}
 */
export const ftpdPluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'Ftp管理',
		area: [100, 56],
		component: () => import('@soft/public/environment-plugin/ftp/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

/**
 * @description 环境插件-mysql
 * @returns {App}
 */
export const mysqlPluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'Mysql',
		area: [80, 65],
		component: () => import('@soft/public/environment-plugin/mysql/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

/**
 * @description 环境插件-tomcat
 * @returns {App}
 */
export const tomcatPluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'Tomcat管理',
		area: [64, 54],
		component: () => import('@soft/public/environment-plugin/tomcat/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

/**
 * @description 环境插件-memcached
 * @returns {App}
 */
export const memcachedPluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'Memcached管理',
		area: [64, 54],
		component: () => import('@soft/public/environment-plugin/memcached/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

/**
 * @description 环境插件-nginx
 * @returns {App}
 */
export const nginxPluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'Nginx',
		area: [68, 58],
		component: () => import('@soft/public/environment-plugin/nginx/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

/**
 * @description 环境插件-openLiteSpeed
 * @returns {App}
 */
export const openLitePluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'OpenLiteSpeed',
		area: [64, 54],
		component: () => import('@soft/public/environment-plugin/open-lite-speed/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

/**
 * @description 环境插件-php
 * @returns {App}
 */
export const phpPluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: `PHP-${softData.version}管理`,
		area: [80, 64],
		component: () => import('@soft/public/environment-plugin/php/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

/**
 * @description 环境插件-apache
 * @returns {App}
 */
export const apachePluginView = (softData: any): Promise<App<any>> =>
	useDialog({
		isAsync: true,
		title: 'Apache',
		area: [68, 58],
		component: () => import('@soft/public/environment-plugin/apache/index.vue'), // 组件引入
		compData: softData,
		showClose: true,
	})

// /**
//  * @description 打开插件安装弹窗
//  * @param {string} compData.name 插件名称
//  * @param {string} compData.type 类型 i：安装 u：更新 r：修复
//  * @returns
//  */
// // export const pluginInstallDialog = (compData: {
// // 	name: string
// // 	type: string | number
// // 	softData?: any
// // 	pluginInfo?: any
// // }): Promise<App> => {
// // 	if (compData.type !== 'i' && compData.type !== 'u' && compData.type !== 'r') {
// // 		compData.type = 'i'
// // 	}
// // 	return useDialog({
// // 		area: 63,
// // 		component: () => import('@public/BtSoftInstall/index.vue'),
// // 		compData,
// // 	})
// // }

/**
 * @description 新打开插件安装弹窗 调试111
 * @param {string} compData.name 插件名称
 * @param {string} compData.type 类型 i：安装 u：更新 r：修复
 * @param {any} compData.softData 插件信息2选1
 * @param {any} compData.pluginInfo 插件信息2选1
 * @param {AnyFunction} compData.callback 安装成功函数
 * @param {boolean} compData.update 是否为更新
 * @returns
 */
// export const newPluginInstallDialog = (compData: { name: string; type: string | number; softData?: any; pluginInfo?: any; callback?: AnyFunction; update?: boolean }): Promise<App> => {
// 	// 处理回调函数
// 	if (compData.callback) {
// 		if (!compData.softData) {
// 			compData.pluginInfo = {
// 				...compData.pluginInfo,
// 				callback: compData.callback,
// 			}
// 		} else {
// 			compData.softData = {
// 				...compData.softData,
// 				callback: compData.callback,
// 			}
// 		}
// 		delete compData.callback
// 	}
// 	return useDialog({
// 		area: 63,
// 		compData,
// 		component: () => import('@public/bt-soft-install/index.vue'),
// 	})
// }

/**
 * @description 系统加固弹窗
 * @returns
 */
export const systemFixedDialog = (compData?: any): Promise<App> => {
	return useDialog({
		title: '临时关闭系统加固',
		area: 44,
		component: () => import('@components/business/bt-system-fixed/index.vue'),
		compData,
		showFooter: true,
	})
}

/**
 * @description 宝塔终端
 * @returns {Promise<App>}
 * @param compData.url 终端地址
 */
// export const btTermDialog = ({ url }: { url?: string }): App =>
// 	useDialog({
// 		title: '宝塔终端',
// 		area: [93, 64],
// 		component: BtXterm,
// 		// modal: false,
// 		compData: {
// 			url,
// 		},
// 	})

/**
 * @description 批量设置分类
 * @param {string} data.name 分类名称
 * @param {SelectOptionProps[]} data.options 分类列表
 * @param {AnyObject[]} data.selectList 选择的列表
 */
export const batchClassDialog = async ({ name, options, request, selectList }: BatchSetClassOptions) => {
	await useDialog({
		title: `批量设置${name}`,
		area: '40',
		compData: {
			name,
			options,
			selectList,
			request,
		},
		showFooter: true,
		component: () => import('@/components/extension/bt-batch-class/index.vue'),
	})
}

/**
 * @description 修复方案
 */
export const recoveryPlanDialog = () => {
	useDialog({
		area: 35,
		component: () => import('@components/business/bt-recovery-plan/index.vue'),
	})
}

/**
 * @description 打开编辑器
 * @param {string} path 文件路径
 * @returns {void}
 */
export const openEditor = async (path: string, editorType: string = 'editor', mode: string = '') => {
	const filesHook = await import('@files/useMethods')
	const { useCreateEditorTabs, editorExample } = await import('@files/public/ace/useMethods')
	const { FilesAceEditor: filesAceEditor } = filesHook
	const fileItem: any = {
		path,
		title: path.split('/').pop(),
		type: editorType,
		mode,
	}
	if (editorExample.value) {
		useCreateEditorTabs(fileItem)
		return
	}
	filesAceEditor(fileItem)
}

/**
 * @description 打开批量结果展示弹窗
 * @param list
 * @param config
 */
export const openResultView = (list: any, config: { title: string }) => {
	if (!list.length) return useMessage().error('操作失败，请重试')
	useDialog({
		title: `批量${config.title || '操作'}结果`,
		area: 42,
		component: () => import('@components/extension/bt-result/index.vue'),
		compData: {
			resultData: list,
			resultTitle: config.title || '操作',
		},
	})
}

/**
 * @description 单位转换
 * @param {string} size 大小
 * @returns {number} 转换后的值
 */
const unitConversion = (size: string) => {
	const unitSplit = size.split(' ')
	const unitList = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	const num = Number(unitSplit[0])
	const unit = unitSplit[1]
	const index = unitList.indexOf(unit)
	return num * 1024 ** index
}

/**
 * @description 检查磁盘警告信息
 */
export const checkDiskWarnDialog = async (): Promise<boolean> => {
	const diskWarn = sessionStorage.getItem('diskWarn')
	if (diskWarn) return false
	const checkWarnInfo = localStorage.getItem('checkWarnInfo')
	const limits = 500 * 1024 * 1024 // 500MB
	if (checkWarnInfo) {
		try {
			const checkWarnInfoObj = JSON.parse(checkWarnInfo)
			const { byte_size: byteSize } = checkWarnInfoObj // 磁盘信息
			// 剩余磁盘大小
			const surplusDiskSize = Number(byteSize[0]) - Number(byteSize[1])
			// 剩余磁盘大小小于500MB触发磁盘警告
			if (surplusDiskSize <= limits) {
				await useDialog({
					title: false,
					showClose: false,
					area: [40, 36],
					component: () => import('@/components/business/bt-disk-warn/index.vue'),
				})
				return true
			}
			sessionStorage.removeItem('diskWarn')
			return false
		} catch (error) {
			return false
		}
	}
	return false
}
