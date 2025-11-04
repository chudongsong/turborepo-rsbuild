import type { App } from 'vue'
import { defineStore } from 'pinia'
import { productPaymentDialog, onlineServiceDialog } from '@/public/index'
import { Message, useHandleError, useDialog } from '@hooks/tools'
import { setCookie, getCookie } from '@utils/index'
import { repairRisk, setIgnore } from '@api/global'
import { getRiskInfo, getScanningProgress, killGetList, getTemplateList, getRepairProgress, getSafecloudList, getRiskList, getWebshellConfig, setWebshellConfig } from '@api/home'
import { useGlobalStore } from '@store/global'
import { useRouter } from 'vue-router'

const HOME_SECURITY_RISKS_STORE = defineStore('HOME-SECURITY-RISKS-STORE', () => {
	const router = useRouter()

	// const popupClose = inject('popupClose', () => {})

	const { payment } = useGlobalStore()

	const { authType } = toRefs(payment.value)

	const activeMent = ref('') // 当前展开项
	const activeMentIgnore = ref('') // 当前展开项
	const loadingText = ref('正在扫描中，请耐心等待...') // 加载中文字
	const loading = ref(false) // 加载中
	const allSelect = ref(false) // 全选
	const lastScanTime = ref('') // 上次扫描时间
	const repairAutoRiskButton = ref(false) // 一键修复按钮
	const resultConfirm = ref(false) // 修复结果确认弹窗
	const emptyDetail = ref(false) // 无风险项时展示空状态
	const showAnimation = ref(false) // 是否运行动画
	const animateFlag = ref() // 动画标识
	const cookieRepair = ref(true) // cookie数据是否存在

	const scanSelectShow = ref(false) // 修复全部按钮组 - 全选按钮是否展示
	const scanButtonType = ref<'info' | 'primary'>('primary') // 扫描按钮类型
	const scanScore = ref<any>(100) // 扫描分数
	const scanTextClass = ref('!text-primary') // 扫描文字class
	const scanOuterClass = ref('safe') // 扫描外层class
	const scanTimer = ref() // 扫描定时器
	const scanPreText = ref(`当前服务器未进行安全扫描，可能存在风险`)
	const scanItemText = ref('') // 扫描文字

	const resultTable = ref() // 修复结果表格
	const tableData = ref([]) // 可一键修复的表格列表
	const allData = ref<any>([]) // 所有数据
	const is_autofix = ref<any>([]) // 能够自动修复的项
	const allSelectionDis = ref(true) // 禁用全选选择框
	const checkedData = ref<any>([]) // 选中的数据
	const ignoreData = ref<any>([]) // 忽略的数据

	const isShow = ref(true) // 是否展示更多安全工具
	const isIgnoreAll = ref(false) // 是否展示忽略风险项弹窗
	const isFirst = ref(true) // 是否首次进入

	// 恶意文件检测
	const malwareData = ref<{
		exclude_dirs: { name: any }[]
		monitor_dirs: { name: any }[]
		ossConfig: {
			status: boolean
			isHasMounts: boolean
		}
		autoIntercept: boolean
	}>({
		autoIntercept: false, // 是否自动拦截
		ossConfig: {
			status: false,
			isHasMounts: false,
		},
		exclude_dirs: [],
		monitor_dirs: [],
	})

	const repairData = reactive({
		progress: 1,
		repairProgress: false,
		repairText: '修复中..',
	}) // 修复数据

	// 进度条数据
	const processData = reactive({
		processPercentage: 0, // 进度条进度
		processColor: 'var(--el-color-primary)', // 进度条颜色
	})
	// 分类列表
	const scanData: any = {
		risk: { type: 'danger', label: '风险项', list: [] },
		security: { type: 'primary', label: '无风险项', list: [] },
		ignore: { type: 'warning', label: '已忽略项', list: [] },
	}
	// 修复结果长度显示
	const resultItemLength = reactive({
		cannot_automatically: 0,
		failed: 0,
		success: 0,
	})
	const riskNum = ref(0)

	// 结果列数据
	const resultColumn = ref<any>([
		{
			label: '风险项',
			prop: 'm_name',
			width: 150,
			render: (row: any) => {
				return <span>{row.m_name}</span>
			},
		},
		{
			label: '修复内容',
			prop: 'msg',
			width: 150,
		},
		{
			label: '相关信息',
			prop: 'type',
			align: 'center',
			render: (row: any) => {
				if (Array.isArray(row.type) && row.type.length > 0) {
					return <span class="h-[3.2rem] inline-block whitespace-pre-wrap">{row.type.join('，')}</span>
				}
				return '无'
			},
		},
		{
			label: '操作结果',
			align: 'right',
			render: (row: any) => {
				if (row.status) return <span class="text-primary">修复成功</span>
				return <span class="text-[red]">修复失败</span>
			},
		},
	])

	// 风险等级展示
	const levelData: any = reactive({
		1: {
			text: '低危',
			bg: 'rgba(var(--el-color-warning-rgb), 0.1)',
			color: 'var(--el-color-warning-light-3)',
		},
		2: {
			text: '中危',
			bg: 'rgba(var(--el-color-warning-rgb), 0.1)',
			color: 'var(--el-color-warning)',
		},
		3: {
			text: '高危',
			bg: 'rgba(var(--el-color-danger-rgb), 0.1)',
			color: 'var(--el-color-danger)',
		},
	})

	/**
	 * @description 拼接漏洞涉及软件名称
	 * @param data
	 */
	const vulnerabilityInvolvesSoftware = (data: AnyObject) => {
		let keys = Object.keys(data.soft_name)
		let str = ''
		keys.forEach((item, index) => {
			if (index === keys.length - 1) {
				str += `${keys}:${data.soft_name[item]}`
			} else {
				str += `${keys}:${data.soft_name[item]}\n`
			}
		})
		return str
	}

	const repairTypeActive = ref('overview') // 风险类型
	// 风险类型扫描结果
	const tootipTotal = reactive({
		risk: 0,
		malware: 0,
		web: 0,
		baseline: 0,
	})
	// 获取风险类型扫描数量
	const getScanTotal = async () => {
		const { data } = await getSafecloudList()
		const { vulnerability, malware, security, baseline } = data.data
		tootipTotal.malware = malware
		tootipTotal.risk = security
		tootipTotal.web = vulnerability
		tootipTotal.baseline = baseline
		if (isFirst.value && tootipTotal.risk) {
			scanPreText.value = `已检测到<span class='text-danger'>${tootipTotal.risk}</span>个风险,请及时修复`
			const { data } = await getRiskList()
			allData.value = data.risk

			lastScanTime.value = data.check_time
			scanSelectShow.value = true
			repairAutoRiskButton.value = true
			isShow.value = false
			emptyDetail.value = false
			showAnimation.value = true
			scanScore.value = data.score
			setScoreNum()
		}
	}

	/**
	 * @description 获取恶意文件检测数据
	 */
	const getMalwareList = async () => {
		const { data } = await getWebshellConfig()
		const config = data.data
		malwareData.value.autoIntercept = config.auto_intercept
		malwareData.value.ossConfig.status = config.scan_oss
		malwareData.value.ossConfig.isHasMounts = config.has_oss_mounts
		malwareData.value.exclude_dirs = convertDataStructure(config.exclude_dirs)
		malwareData.value.monitor_dirs = convertDataStructure(config.monitor_dirs)
	}

	/**
	 * @description 转换数据结构
	 * @param {any} data
	 * @return {Array}
	 */
	const convertDataStructure = (data: any) => {
		if (!data || !Array.isArray(data)) return []
		return data.map((item: any) => {
			return {
				name: item,
			}
		})
	}
	/**
	 * @description 恶意文件检测-高级设置
	 * @returns {Promise<App>}
	 */
	const malwareAdvanced = async (): Promise<App> =>
		useDialog({
			isAsync: true,
			title: '高级设置',
			area: [80, 54],
			component: () => import('@home/views/overview/security-risks/advanced-setting/index.vue'),
		})
	/**
	 * @description 设置恶意文件配置
	 * @param {Record<string,any>} param
	 */
	const setMalwareConfig = async (param: Record<string, any>) => {
		const res = await setWebshellConfig(param)
		Message.request(res)
		if (res.status) await getMalwareList()
	}

	/**
	 * @description 下载安全扫描报告
	 */
	const handleDownloadReport = () => {
		window.open('/project/security/report/html', '_blank', 'noopener,noreferrer')
	}

	/**
	 * 点击选项选择方法
	 * @param {any} item
	 */
	const changeSelectValue = (item: any) => {
		item.selection = !item.selection
		// 循环判断是否全选
		allSelect.value = checkedData.value.every((item1: any) => item1.selection == true)
	}

	/**
	 * 点击扫描开启扫描动画
	 */
	const scanningProcess = async () => {
		// 初始化扫描内容
		isShow.value = false
		emptyDetail.value = false
		scanScore.value = 100
		scanOuterClass.value = 'safe'
		scanTextClass.value = '!text-primary'
		if (scanButtonType.value == 'info') {
			clearInterval(scanTimer.value)
			// 终止扫描进程 获取当前扫描结果
			await killGetList()
			const rdata = await getTemplateList()
			resultAssignment(rdata.data)
			scanScore.value = '?'
			scanTextClass.value = '!text-dangerDark'
			scanOuterClass.value = 'danger'
			loading.value = false
			riskNum.value = rdata.data.risk.length
			scanPreText.value = `扫描中断，`
		} else {
			processData.processPercentage = 0
			showAnimation.value = true
			scanPreText.value = `正在进行安全扫描...`
			riskNum.value = 0
			scanItemText.value = '正在检测...'
			animateFlag.value = ''
			scanButtonType.value = 'info'
			cookieRepair.value = true
			repairAutoRiskButton.value = false
			getScanList(true)
			try {
				// 先清除上一轮定时器
				clearInterval(scanTimer.value)
				scanTimer.value = setInterval(async function () {
					const res = await getScanningProgress()
					processData.processPercentage = res.data.percentage
					riskNum.value = res.data.count
					scanItemText.value = res.data.status
					scanScore.value = res.data.score
					if (res.data.count && !(res.data.percentage == '100')) {
						scanTextClass.value = '!text-dangerDark'
						scanOuterClass.value = 'danger'
						scanPreText.value = `正在进行安全扫描，`
					}
					if (res.data.percentage == '100') {
						clearInterval(scanTimer.value)
					}
					// 分数显示
					setScoreNum()
				}, 1000)
			} catch (error) {
				console.log(error)
			}
		}
	}
	/**
	 * @description 设置分数
	 */
	const setScoreNum = () => {
		// 分数显示
		if (scanScore.value >= 80 && scanScore.value <= 99) {
			scanTextClass.value = '!text-[var(--el-color-warning-light-5)]'
			scanOuterClass.value = 'risk'
			processData.processColor = 'var(--el-color-warning-light-9)'
		} else if (scanScore.value >= 60 && scanScore.value <= 79) {
			scanTextClass.value = '!text-warningDark'
			processData.processColor = 'var(--el-color-warning)'
			scanOuterClass.value = 'warn'
		} else if (scanScore.value < 60) {
			scanTextClass.value = '!text-dangerDark'
			processData.processColor = 'var(--el-color-danger)'
			scanOuterClass.value = 'danger'
		}
	}

	/**
	 * @description 一键修复按钮点击事件
	 */
	const handleRepairAutoRisk = () => {
		// 非企业版
		if (authType.value !== 'ltd') return openPayView()
		try {
			let arr = allData.value.filter((item: any) => item.selection == true).map((item: any) => item.m_name)
			if (arr.length == 0) {
				loading.value = false
				Message.error('暂无可自动修复的风险项！')
				return
			}
			loading.value = true
			loadingText.value = '正在修复中,可能耗时较长,请耐心等候...'
			repairData.progress = 0
			const rdata: any = repairRisk({ data: JSON.stringify({ m_name: arr }) })
			// 循环请求修复进度
			repairData.repairProgress = true
			let repairTimer = setInterval(async () => {
				const { data } = await getRepairProgress()
				repairData.progress = data.percentage
				repairData.repairText = data.status
				if (data.percentage === 100) {
					repairData.repairText = '修复完成'
					repairData.repairProgress = false
					repairData.progress = 100
					clearInterval(repairTimer)
					let ress = await rdata
					getRepairResult(ress.data)
					getScanList(true)
				}
			}, 800)
		} catch (error) {
			useHandleError(error)
			console.log(error)
		} finally {
			loading.value = false
		}
	}

	/**
	 * @description 修复结果分配
	 */
	const resultAssignment = (rdata: any) => {
		is_autofix.value = rdata.is_autofix
		isFirst.value = false
		localStorage.setItem('isAutoFix', JSON.stringify(is_autofix.value))
		for (const key in scanData) {
			const list = rdata[key]
			if (Array.isArray(list)) {
				for (let i = 0; i < list.length; i++) {
					const sItem = scanData[key].list.find((item: any) => item.m_name == list[i].m_name)
					list[i].show = sItem?.show || false
					list[i].selection = sItem?.selection || false
				}
				if (Object.keys(scanData).includes(key) && key == 'risk') {
					allData.value = [...allData.value, ...list]
				}
				scanData[key].list = list
			}
		}
		lastScanTime.value = rdata.check_time
		scanButtonType.value = 'primary'
		repairAutoRiskButton.value = true
		scanSelectShow.value = true
		handelAllSelection(true)
		animateFlag.value = ' !animate-none'
		// 在cookie中存储本次扫描数据（扫描时间，结果）
		localStorage.setItem('scanData', JSON.stringify(allData.value))
		localStorage.setItem('ignoreData', JSON.stringify(scanData.ignore.list))
		setCookie('lastScanTime', lastScanTime.value)
	}

	/**
	 * @description 获取风险列表
	 * @param {boolean} isCheck 是否检测
	 * @return {void}
	 */
	const getScanList = async (isCheck: boolean = false) => {
		loading.value = true
		loadingText.value = '正在扫描中，请稍等...'
		try {
			const param: { force?: number } = {}
			isCheck && (param.force = 1)
			const { data: rdata } = await getRiskInfo(param)
			allData.value = []
			if (!rdata.interrupt) {
				allData.value = []
				resultAssignment(rdata)
				scanScore.value = rdata.score
				riskNum.value = allData.value.length
				scanPreText.value = `已完成安全扫描，`
				ignoreData.value = rdata.ignore
			}
		} catch (err) {
			console.log(err)
		}
		loading.value = false
	}

	/**
	 * @description 全选
	 * @return {void}
	 */
	const handelAllSelection = (flag?: boolean) => {
		let haveSelect = false
		checkedData.value = []
		allData.value.forEach((item: any) => {
			if (is_autofix.value.includes(item.m_name)) {
				item.selection = true
				checkedData.value.push(item)
				haveSelect = true
			} else {
				item.selection = false
			}
		})
		if (haveSelect && flag) {
			allSelectionDis.value = false
			allSelect.value = checkedData.value.every((item1: any) => item1.selection == true)
		} else if (haveSelect && !flag) {
			// allSelect.value = !allSelect.value
			if (!allSelect.value) {
				// 清空全选项
				checkedData.value = []
				allData.value.forEach((item: any) => {
					if (is_autofix.value.includes(item.m_name)) {
						item.selection = false
					}
				})
			}
		}
	}

	/**
	 * @description 修复风险项
	 * @param {boolean} isSingle 是否单个修复
	 * @param {any} item 当前项 (非单个修复时为null：即为选中修复)
	 */
	const handleRepair = async (isSingle: boolean, item: any) => {
		// 非企业版
		if (authType.value !== 'ltd') {
			openPayView()
			return
		}
		let riskItem = allData.value.filter((item: any) => item.selection == true).map((item: any) => item.m_name)
		try {
			if (!isSingle && riskItem.length == 0) {
				Message.error('请选择需要修复的风险项！')
				return
			} else if (checkedData.value.length == 0) {
			}
			loading.value = true
			loadingText.value = '正在修复中,可能耗时较长,请耐心等候...'
			const { data } = await repairRisk({
				data: JSON.stringify({ m_name: isSingle ? [item.m_name] : riskItem }),
			})
			if (isSingle && data.success.length > 0) {
				Message.success('修复成功')
				riskNum.value--
				allData.value = allData.value.filter((i: any) => i.m_name !== item.m_name)
				getRepairResult(data)
			} else {
				getRepairResult(data)
			}
			// else if (isSingle && !data.success.length) {
			// 	Message.error('修复失败')
			// }
			// else {
			// 	getRepairResult(data)
			// }
		} catch (error) {
			useHandleError(error)
			console.log(error)
		} finally {
			loading.value = false
		}
	}

	/**
	 * @description 忽略风险项
	 * @param {any} item 当前项
	 * @param {any} temp false 忽略 true 移除忽略
	 */
	const handleIgnore = async (item: any, temp: boolean) => {
		try {
			loading.value = true
			loadingText.value = '正在忽略风险项,请耐心等候...'
			const { data } = await setIgnore({ m_name: item.m_name })
			Message.request(data)
			if (data.status) {
				if (temp) ignoreData.value = ignoreData.value.filter((i: any) => i.m_name !== item.m_name)
				else allData.value = allData.value.filter((i: any) => i.m_name !== item.m_name)
				getScanList(true)
			}
		} catch (error) {
			console.log(error)
		} finally {
			loading.value = false
		}
	}

	/**
	 * @description 赋值结果框
	 */
	const getRepairResult = async (data: any) => {
		resultTable.value = []
		resultConfirm.value = true
		resultItemLength.cannot_automatically = data.cannot_automatically.length
		resultItemLength.failed = data.failed.length
		resultItemLength.success = data.success.length
		tableData.value = []
		for (const item in data) {
			for (const son_item of data[item]) {
				tableData.value.push({
					m_name: son_item.m_name,
					type: son_item.result.type,
					msg: son_item.result.msg,
					status: son_item.result.status,
					name: item,
				})
			}
		}
		resultTable.value = tableData.value
		loading.value = false
		// 剔除掉原有基础上修复成功的项
		allData.value = allData.value.filter((item: any) => {
			return !data.success.some((successItem: any) => successItem.m_name === item.m_name)
		})
		riskNum.value = allData.value.length
		// 在localStorage中存储本次扫描数据（扫描结果）
		localStorage.setItem('scanData', JSON.stringify(allData.value))
	}

	/**
	 * @description 显示或者隐藏
	 * @param {any} item 当前项
	 * @param {any} list 当前列表
	 * @return {void}
	 */
	const onToggle = (item: any, list: any) => {
		if (!item.show) list.forEach((item: any) => (item.show = false))
		item.show = !item.show
	}

	/**
	 * @description 打开弹窗
	 * @return {void}
	 */
	const onOpen = () => {
		// 检测是否有上一次的扫描数据 存在则赋值
		const scanData: any = localStorage.getItem('scanData')
		const isAutoFix: any = localStorage.getItem('isAutoFix')
		const ignoreData1: any = localStorage.getItem('ignoreData')
		if (isAutoFix) is_autofix.value = JSON.parse(isAutoFix) // 能够自动修复的项-缓存
		if (ignoreData1 && JSON.parse(ignoreData1).length) {
			ignoreData.value = JSON.parse(ignoreData1)
		}
		if (scanData && JSON.parse(scanData).length) {
			allData.value = JSON.parse(scanData).map((item: any) => {
				return {
					...item,
					selection: false,
				}
			})
			scanSelectShow.value = true
			repairAutoRiskButton.value = true
			isShow.value = false
		} else {
			emptyDetail.value = true
			repairAutoRiskButton.value = false
		}
		// 展示对应按钮以及扫描时间
		cookieRepair.value = false
		lastScanTime.value = getCookie('lastScanTime') || ''
	}

	// /**
	//  * @description 跳转安全页面
	//  * @param {number} num
	//  */
	// const jumpFirewall = async (tabActive?: string) => {
	// 	// return false
	// 	// const { getFirewallStore } = await import('@firewall/useStore')
	// 	// const {
	// 	// 	ref: { tabActive: firewallTabActive, safeDetectActive },
	// 	// } = getFirewallStore()
	// 	// firewallTabActive.value = tabActive
	// 	// if (twoTabActive) safeDetectActive.value = twoTabActive
	// 	router.push({ name: tabActive })

	// 	// popupClose()
	// }

	/**
	 * @description 打开支付页面
	 * @return {void}
	 */
	const openPayView = () => {
		productPaymentDialog({
			sourceId: 68,
		})
	}

	const $reset = () => {
		// 重置数组
		tableData.value = []
		allData.value = []
		checkedData.value = []
		ignoreData.value = []
		is_autofix.value = []
		repairTypeActive.value = 'overview'
		tootipTotal.risk = 0
		tootipTotal.malware = 0
		tootipTotal.web = 0
		tootipTotal.baseline = 0
		clearInterval(scanTimer.value)
	}

	return {
		showAnimation,
		scanScore,
		scanTextClass,
		scanOuterClass,
		animateFlag,
		scanPreText,
		riskNum,
		scanButtonType,
		repairAutoRiskButton,
		cookieRepair,
		scanItemText,
		processData,
		lastScanTime,
		scanSelectShow,
		allSelect,
		allSelectionDis,
		isFirst,
		isIgnoreAll,
		ignoreData,
		emptyDetail,
		loading,
		loadingText,
		isShow,
		activeMent,
		activeMentIgnore,
		is_autofix,
		levelData,
		allData,
		repairData,
		resultConfirm,
		resultItemLength,
		resultTable,
		resultColumn,
		handleIgnore,
		scanningProcess,
		handleRepairAutoRisk,
		handleDownloadReport,
		changeSelectValue,
		handelAllSelection,
		handleRepair,
		vulnerabilityInvolvesSoftware,
		onlineServiceDialog,
		onToggle,
		onOpen,
		$reset,
		repairTypeActive,
		tootipTotal,
		getScanTotal,
		openPayView,
		getMalwareList,
		convertDataStructure,
		malwareData,
		malwareAdvanced,
		setMalwareConfig,
	}
})

export default HOME_SECURITY_RISKS_STORE
