import { defineStore } from 'pinia'
import type { TableColumnProps } from '@components/data/bt-table/types'

import type { SoftTypeItemProps, SoftTableRowProps, SoftTableProps } from '@/views/soft/types'
import type { SelectOptionProps } from '@/components/form/bt-select/types'

import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@store/global'
import { SOFT_STORE } from '@soft/store'

import { isString } from '@utils/index'
import { checkSoftPluginPay, checkTaskStatus, checkPluginUpdate, productPaymentDialog, checkDiskWarnDialog } from '@/public/index'
import { formatTime } from '@utils/index'
import { Message, useDialog } from '@hooks/tools'

import { getSoftList } from '@/api/soft'
import { getPluginUpgrades } from '@/api/global'

import {
	useSoftDev,
	useSoftEndTime,
	useSoftHomeShow,
	useSoftName,
	useSoftPosition,
	useSoftPrice,
	useSoftPs,
	useSoftStatus,
	useSoftOperate,
	setHomeShowEvent,
	softDataHandle,
	previewEvent,
	pluginInstallEvent,
	modulePathEvent,
	softForceMsg,
	pluginPayEvent as openPluginPay,
	openPluginEvent,
} from '@/views/soft/useMethod'
import { npsSurveyV2Dialog, openProductPayView, msgBoxDialog } from '@/public'
import { useHandleError } from '@hooks/tools/error'
import { router } from '@/router'

const SOFT_PLUGIN_STORE = defineStore('SOFT-PLUGIN-STORE', () => {
	const tablePage = reactive({ total: 0, page: 1, row: 15 }) // 表格分页配置
	const softTypeList = useSessionStorage<SoftTypeItemProps[]>('softTypeList', []) // 软件类型列表
	const softTableList = ref<SoftTableRowProps[]>([]) // 软件列表

	const { isSpecial, searchVal, isLoading, tabTypeActive, showNpsCollect, historyList } = storeToRefs(SOFT_STORE())
	const { unInstallPlugin } = SOFT_STORE()

	const { payment, forceLtd, aliyunEcsLtd } = useGlobalStore()
	const { authType, authExpirationTime } = toRefs(payment.value)

	const plugin = reactive({
		upgrades: [],
		version: '',
		options: [] as SelectOptionProps[],
		info: {} as any,
	})
	const softData = ref() // 软件信息
	const repairPopup = ref() // 修复弹窗
	const helpList = [{ content: '无法修复？请尝试切换下版本。' }]

	const recomLtdList = [
		{ title: '5分钟极速响应', icon: 'free-time-icon' },
		{ title: '15天无理由退款', icon: 'free-refund-icon' },
		{ title: '30+款付费插件', icon: 'free-plunge-icon' },
		{ title: '20+企业版专享功能', icon: 'free-function-icon' },
		{ title: '1000条免费短信（年付）', icon: 'free-message-icon' },
		{ title: '2张SSL商用证书（年付）', icon: 'free-certificate-icon' },
		// { title: '专享企业服务群（年付）', icon: 'free-group-icon' },
	]

	const recomProList = [
		{ title: '更换授权IP', icon: 'free-ip-icon' },
		{ title: '客服优先响应', icon: 'contact-customer' },
		{ title: '15+款付费插件', icon: 'free-fifteen-icon' },
		{ title: '商用防火墙授权', icon: 'icon-file-lock' },
	]

	// 是否支付显示
	const isPay = computed(() => {
		return authExpirationTime.value >= 0 && authType.value !== 'free'
	})

	// 选中的是否企业版
	const isActiveLtd = computed(() => {
		return tabTypeActive.value === 12
	})

	// 选中的是否专业版
	const isActivePro = computed(() => {
		return tabTypeActive.value === 8
	})

	// 选中的是否付费
	const isActivePay = computed(() => {
		// console.log('isActivePay', isPay.value, isActiveLtd.value, authType.value, forceLtd.value)
		return isPay.value && !(isActiveLtd.value && authType.value === 'pro') //
	})

	// 是否是企业版/专业版，true为企业版, false为专业版
	const isShowType = computed(() => {
		console.log('+++', isActiveLtd.value, isActivePro.value, isPay.value, authType.value, forceLtd.value)
		if (aliyunEcsLtd.value) return true // 企业版强制购买
		if (isActiveLtd.value || (isPay.value && authType.value === 'ltd')) return true // 如果当前类型为企业版，或者支付类型为企业版，强制显示企业版，最高优先级
		if (!isActivePro.value && isPay.value && authType.value === 'pro') return false // 如果当前授权为专业版，除去企业版栏目，其他显示专业版
		if (isActivePro.value) return false // 默认仅类型8显示专业版
		return true // 默认显示企业版
	})

	// 到期时间
	const isExpTime = computed(() => {
		return formatTime(authExpirationTime.value, 'yyyy-MM-dd')
	})

	/**
	 * @description 是否是距离天数
	 */
	const isDistanceDays = computed(() => {
		const time = new Date().getTime() / 1000
		const distance = authExpirationTime.value - time
		return Math.ceil(distance / 86400)
	})

	// 是否显示颜色
	const isShowColor = computed(() => {
		return isShowType.value ? '#966000' : '#f1ad29'
	})

	// 推荐列表描述
	const recomList = computed(() => {
		if (isActiveLtd.value) return recomLtdList
		return isShowType.value ? recomLtdList : recomProList
	})

	// 类型列表
	const typeList = computed(() => {
		return [
			...[
				{ title: '全部', id: 0 },
				{ title: '已安装', id: -1 },
			],
			...softTypeList.value,
		].filter(item => item.id != 11 && item.id != 10)
	})

	/**
	 * @description 续费软件
	 * @param {number} sourceId 软件id
	 * @returns {Promise<void>}
	 */
	const pluginPayEvent = async (sourceId: number): Promise<void> => {
		if (authExpirationTime.value === -2) sourceId = 32 // 过期后续费
		productPaymentDialog({
			sourceId,
			disablePro: isShowType.value,
			compulsionLtd: isShowType.value,
		})
	}

	/**
	 * @description 切换分类事件
	 * @param {number} type 分类id
	 */
	const toggleClassEvent = (type: number) => {
		tabTypeActive.value = type
		sessionStorage.setItem('SOFT-PLUGIN-TYPE', String(type))
		tablePage.page = 1
		refreshPluginList('0')
	}

	/**
	 * @description 打开NPS弹窗事件
	 */
	const openNpsEvent = () =>
		npsSurveyV2Dialog({
			type: 16,
			id: 993,
			isNoRate: true,
		})

	/**
	 * @description 获取软件列表
	 * @returns {Promise<void>} void
	 */
	const getSoftListData = async (
		params: SoftTableProps = {
			type: tabTypeActive.value,
			query: searchVal.value,
			p: tablePage.page,
			row: tablePage.row,
			force: '0',
		}
	) => {
		try {
			isLoading.value = true
			params.query = searchVal.value || ''
			const { data } = await getSoftList(params)
			const { softList, total, historyList: history, typeList, isForce } = await softDataHandle(data) // 数据处理
			if (params.force == '1') softForceMsg(isForce) // 强制刷新提示
			showNpsCollect.value = !total // 显示NPS弹窗
			console.log('softList', softList)
			softTableList.value = softList as SoftTableRowProps[] // 软件列表
			historyList.value = history // 软件历史记录
			softTypeList.value = typeList as SoftTypeItemProps[] // 软件类型列表
			tablePage.total = total // 分页总数
		} catch (error) {
			useHandleError(error, 'getSoftListData') // 错误处理
		} finally {
			isLoading.value = false
		}
	}

	/**
	 * @description 生成表格配置
	 * @returns {Promise<void>} void
	 */
	const useSoftTableColumn = () => {
		return shallowRef<TableColumnProps[]>([
			useSoftName({
				type: 'app',
				onClick: (row: SoftTableRowProps) => openPluginEvent(row),
			}),
			useSoftDev(),
			useSoftPs('app'),
			useSoftPrice(),
			useSoftEndTime({
				onClick: (row: SoftTableRowProps) => {
					if (row.type != 10) openPluginPay(row, '', 34)
				},
			}),
			useSoftPosition(),
			useSoftStatus(),
			useSoftHomeShow({
				onChange: async (row: SoftTableRowProps, val: boolean) => {
					const rdata = await setHomeShowEvent(row, val)
					if (!rdata.status) refreshPluginList('0')
				},
			}),
			useSoftOperate((row: SoftTableRowProps) => {
				let softOperateList: any[] = []
				const showStatus = isString(checkTaskStatus(row.task)) // 是否展示任务状态
				const payStatus = checkSoftPluginPay(row, authType.value) // 是否已支付插件
				// 预览 -当未安装或(未购买:(付费插件未购买))且存在预览地址时显示
				const showPreview = isString(row?.preview_url) && row.preview_url != '' && !payStatus
				const isModule = !!row.route // 是否为模块
				// 操作
				const operate = (title: string, onClick: AnyFunction, isHide: AnyFunction = () => false) => {
					return softOperateList.push({ title, onClick, isHide })
				}

				// 没有支付的操作项
				if (!payStatus) {
					operate('立即跳转', modulePathEvent, () => !isModule) // 模块：立即跳转
					operate(checkTaskStatus(row.task) as string, msgBoxDialog, () => !showStatus) // 任务状态:正在更新、正在安装、正在卸载
					operate('预览', previewEvent, () => !showPreview) // 预览显示按钮
					operate(
						row.endtime !== -1 ? '立即续费' : '立即购买',
						(row: any) => openPluginPay(row, row.type, row.endtime !== -1 ? 34 : 31),
						() => payStatus
					) // 未支付插件 判定续费 -1：购买 -2：续费
					operate('卸载', unInstallPlugin, () => !(!payStatus && row.setup)) // 若软件已安装显示卸载
					return softOperateList // 直接返回 不再进行后续判断
				}

				const showUpdate = checkPluginUpdate(row) // 更新：比对版本，添加更新操作
				const showRepair = row.type !== 5 // 修复:运行环境不展示修复
				// 有支付的操作项且、安装
				if (row.setup) {
					operate(
						'更新',
						(row: SoftTableRowProps) => pluginInstallEvent(row, 'update'),
						() => !showUpdate
					) // 更新
					operate('设置', openPluginEvent) // 设置
					operate('修复', openRepairView, () => !showRepair) // 修复
					operate('卸载', unInstallPlugin) // 卸载
				} else {
					if (row.is_docker)
						operate('立即前往', () => {
							router.push({ name: 'docker' })
						})
					// 安装
					else operate('安装', pluginInstallEvent) // 安装
				}
				return softOperateList
			}),
		])
	}

	/**
	 * @description 获取插件信息
	 * @returns {Promise<void>}
	 */
	const getPluginInfo = async (): Promise<void> => {
		const res = await getPluginUpgrades({ plugin_name: softData.value.name, show: 1 })
		if (res.status) {
			plugin.upgrades = res.data
			// 获取最新版本
			const lastInfo = plugin.upgrades.at(-1) || { beta: false }
			// 判断最新版本是否是beta版本
			const beta = lastInfo.beta ? lastInfo : {}
			// 获取第一个版本
			const tls = plugin.upgrades.at(0)
			// 判断当前插件是否是beta版本
			plugin.info = softData.value.is_beta ? beta : tls
			if (!plugin.info) {
				const version = softData.value.version
				plugin.info = {
					beta: 2,
					m_version: version.split[0],
					update_msg: 0,
					update_time: 0,
					version: version.split[1],
				}
			}
			// 如果是特定插件，提供版本选择
			if (isSpecial) {
				plugin.options = plugin.upgrades.map((item: any) => {
					return {
						label: item.m_version + '.' + item.version + (item.beta ? 'bate' : 'Stable'),
						value: item.m_version + '.' + item.version,
					}
				})
				plugin.version = `${plugin.options.at(0)?.value || ''}`
			}
		} else {
			Message.error(res.msg)
		}
	}

	/**
	 * @description 修复插件
	 * @returns {Promise<void>}
	 */
	const repairPluginEvent = async (): Promise<void> => {
		const dialog = await repairPopup.value
		dialog.unmount()
		// 打开安装界面
		pluginInstallEvent(softData.value, 'repair')
	}

	/**
	 * @description 切换版本
	 * @returns {Promise<void>}
	 */
	const cutVersionEvent = async (): Promise<void> => {
		// 修改插件版本、打开安装界面
		pluginInstallEvent({ ...softData.value, ...{ version: plugin.version } }, 'repair')
	}

	// 表格列
	let TableColumn = useSoftTableColumn()

	const refreshPluginList = (force: '0' | '1' = '0') => {
		TableColumn = useSoftTableColumn()
		getSoftListData({
			type: tabTypeActive.value,
			query: searchVal.value,
			p: tablePage.page,
			row: tablePage.row,
			force,
		})
	}

	/**
	 * @description 修复插件
	 * @param softData 插件信息
	 */
	const openRepairView = async (data: any) => {
		const isCheck = await checkDiskWarnDialog() // 判断是否弹出磁盘警告
		if (isCheck) return
		softData.value = data
		repairPopup.value = useDialog({
			title: `${data.title}v${data.version}-修复插件`,
			area: 50, // 【number、string、array<number/string>】视图大小，支持数组[宽，高]，默认单位rem
			component: () => import('@soft/views/plugin/repair-plugin/index.vue'), // 组件引入
		})
	}

	const $reset = () => {
		searchVal.value = ''
		softTableList.value = []
		softTypeList.value = []
		tablePage.page = 1
		softData.value = {}
		plugin.options = []
		plugin.version = ''
		plugin.upgrades = []
		TableColumn.value = []
	}

	return {
		TableColumn,
		searchVal,
		tablePage,
		softTableList,
		typeList,
		refreshPluginList,
		getSoftListData,
		openNpsEvent,
		toggleClassEvent,

		// 推荐购买
		isPay,
		isActiveLtd,
		isActivePro,
		isActivePay,
		isShowType,
		isExpTime,
		isDistanceDays,
		isShowColor,
		recomList,
		pluginPayEvent,

		// 修复插件
		plugin,
		helpList,
		getPluginInfo,
		cutVersionEvent,
		repairPluginEvent,

		// 卸载
		softData,
		$reset,
	}
})

export default SOFT_PLUGIN_STORE
