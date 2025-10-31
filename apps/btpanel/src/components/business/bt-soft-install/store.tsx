import { defineStore, storeToRefs } from 'pinia'
import { has } from 'ramda'
import { getByteUnit } from '@utils/index'
import { useGlobalStore } from '@/store/global'
import { addCustomModule, delCustomModule, getCustomModule, getDownloadSpeed, getLines, getPluginUpgrades, setCustomModule } from '@/api/global'
import { Message, useConfirm } from '@hooks/tools'

import { SOFT_STORE } from '@soft/store'
import { ElSwitch } from 'element-plus'
import { isDark } from '@/utils/theme-config'
import { useEnvInstall, useGetPluginInfo, useActiveVersionInfo, useFinishingVersion, useGenerateInstallInfo, usePluginInstall, usePluginUpdate, usePluginRepair, useCheckMysqlUpgrade } from './hooks'
import type {
	// Props,
	PluginInfoProps,
	ActiveInfoProps,
	VersionModelProps,
	PluginRowProps,
} from './types'

const INSTALL_STORE = defineStore('INSTALL-STORE', () => {
	const { installInfo } = useGlobalStore()
	const compData = ref() // 外部传入内容存储

	const downLoadPopup = ref() // 下载弹窗

	const labelList = [
		[7, '免', 'border-disabled text-darkTertiary'],
		[8, '专', 'border-[var(--bt-pro-light-color)] text-[var(--bt-pro-color)]'],
		[12, '企', 'border-[var(--bt-ltd-light-color)] text-[var(--bt-ltd-color)]'],
	] // 模块标签，用于显示模块类型

	// 插件信息-全部信息
	const pluginModuleInfo = shallowReactive<PluginInfoProps>({
		title: '', // 插件名称
		name: '', // 插件名称-id
		ps: '', // 插件描述
		type: 0, // 插件类型，5-环境插件、7-免费插件、8-专业插件、12-企业插件
		call: 'i', // 模块类型，r-修复插件模块，i-安装插件模块，u-更新插件模块
		isBeta: false, // 是否是测试版
		isSystem: false, // 是否是系统插件
		isInstall: false, // 当前安装方式，是安装
		isUpdate: false, // 当前安装方式，是更新
		isRepair: false, // 当前安装方式，是修复
		isSpecialPlugins: false, // 是否是特殊插件，例如PHP、MySQL、Nginx、Apache，等子版本可选
		isPHPInstall: false, // 是否是php插件安装，安装时需要选择版本，版本列表不同
		isMysqlUpdate: false, // 是否是mysql插件更新
		otherPHP: [], // 是否是其他php插件
		compile: false, // 是否支持编译安装，仅类型为5的插件支持
		currentVersion: '', // 当前的版本，仅更新插件使用
		versions: [], // 版本列表
		label: [], // 模块标签，用于显示模块类型
		introduction: [] as string[][], // 插件介绍图片
		isDependnet: false, // 是否有依赖
		dependnet: {
			need: [],
			selected: [],
		},
	})

	// 插件信息，当前选择的版本信息
	const pluginActiveInfo = reactive<ActiveInfoProps>({
		fullVersion: '', // 完整版本
		mVersion: '', // 当前选择的主版本
		version: '', // 当前选择的版本
		isBeta: false, // 是否是测试版
		status: false, // 是否已安装，仅php插件使用
		updateTime: '',
		updateMsg: '',
	})

	// 版本选择配置
	const versionModel = shallowReactive<VersionModelProps>({
		value: 0,
		version: [],
	})

	const historyLoad = ref<boolean>(false) // 加载中
	const historyData = ref<Array<any>>([]) // 日志数据

	const isRefreshDownLoad = ref(true) // 是否刷新下载进度

	const downloadSpeed = reactive({
		progress: 0, // 下载进度
		done: 0, // 已下载
		total: 0, // 总大小
		estimated: 0, // 预计时间
		speed: 0, // 下载速度
	})

	const completeFlag = ['安装完成', 'Successify', 'complete']
	const speedMsg = ref(compData.value?.speedConfig?.msg) // 日志内容
	const installShow = ref<any>(null)

	// 自定义模块表单
	const customForm = ref({
		args_name: '', // 模块名称
		ps: '', // 模块描述
		args: '', // 模块参数
		init: '#在编译前执行的shell脚本内容，通常为第三方模块的依赖安装和源码下载等前置准备', // 前置脚本
	})

	const customFormRef = ref<any>() // 自定义模块表单ref

	const customVisible = ref<boolean>(false) // 自定义模块是否可见

	const config = {
		mode: 'ace/mode/nginx',
		theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', // 主题
		wrap: true, // 是否自动换行
		showInvisibles: false, // 是否显示空格
		showFoldWidgets: false, // 是否显示代码折叠线
		useSoftTabs: true, // 是否使用空格代替tab
		tabSize: 2, // tab宽度
		showPrintMargin: false, // 是否显示打印边距
		readOnly: false, // 是否只读
		fontSize: '12px', // 字体大小
	} // ace编辑器配置

	// 插件标题
	const pluginTitle = computed(() => {
		return pluginModuleInfo.title.indexOf('PHP-') > -1 ? 'PHP' : pluginModuleInfo.title
	})

	// 插件标签
	const pluginLabel = computed(() => {
		return labelList.find(item => item[0] === pluginModuleInfo.type) || []
	})

	// 插件图片
	const pluginPictureSrc = (index: number) => {
		const name = pluginModuleInfo.name.includes('php-') ? 'php' : pluginModuleInfo.name
		const imagesId = pluginModuleInfo.introduction[index]
		return `https://www.bt.cn/Public/new/plugin/${name}/${imagesId[1]}`
	}

	// 插件icon图标
	const pluginImgSrc = computed(() => {
		return `soft_ico/ico-${pluginModuleInfo.name?.indexOf('php-') > -1 ? 'php' : pluginModuleInfo.name}.png`
	})

	const doneSize = computed(() => getByteUnit(downloadSpeed.done))
	const totalSize = computed(() => getByteUnit(downloadSpeed.total))
	const speedSize = computed(() => getByteUnit(downloadSpeed.speed))

	// 表格列表
	const tableColumn = ref([
		{
			label: '模块名称',
			prop: 'name',
		},
		{
			label: '模块描述',
			prop: 'ps',
		},
		{
			label: '是否启用',
			render: (row: any) => {
				return (
					<ElSwitch
						v-model={row.checked}
						onChange={() => {
							setCustomModuleData()
						}}></ElSwitch>
				)
			},
		},
		{
			label: '操作',
			align: 'right',
			render: (row: any) => {
				return [
					<div class="flex items-center justify-end">
						<span class="bt-link" onClick={() => delCustomModuleData(row)}>
							删除
						</span>
					</div>,
				]
			},
		},
	])
	// 表格内容
	const customData = ref([
		{
			name: '模块名称',
			ps: '模块描述',
		},
	])
	// 表单验证
	const rules = shallowRef({
		args_name: [{ required: true, message: '请输入模块名称', trigger: 'blur' }],
		args: [{ required: true, message: '请输入模块参数', trigger: 'blur' }],
	})
	/**
	 * @description 添加自定义模块
	 */
	const handleAddCustomModule = () => {
		customVisible.value = true
	}

	/**
	 * @description 提交自定义模块
	 */
	const submitCustomModule = async () => {
		await customFormRef.value?.validate()
		try {
			customVisible.value = false
			const rdata = await addCustomModule({
				name: pluginModuleInfo.name,
				...customForm.value,
			})
			Message.request(rdata)
			// rdata.status && customFormRef.value.resetFields()
			getCustomModuleData()
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 获取自定义模块
	 */
	const getCustomModuleData = async () => {
		try {
			const rdata = await getCustomModule({ name: pluginModuleInfo.name })
			customData.value = rdata.data.args
			// 获取并选中已设置的模块
			const config_data = rdata.data.config.split('\n')
			customData.value.forEach((item: any) => {
				if (config_data.includes(item.name)) {
					item.checked = true
				} else {
					item.checked = false
				}
			})
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 删除自定义模块
	 */
	const delCustomModuleData = async (row: any) => {
		try {
			await useConfirm({
				content: `确认删除模块【 ${row.name}】 吗？`,
				title: '提示',
				icon: 'warning-filled',
			})
			const rdata = await delCustomModule({
				name: pluginModuleInfo.name,
				args_name: row.name,
			})
			getCustomModuleData()
			Message.request(rdata)
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 设置自定义模块
	 */
	const setCustomModuleData = async () => {
		const load = Message.load('正在设置模块，请稍后...')
		try {
			// 获取已选中的参数
			const params = customData.value
				.filter((item: any) => item.checked)
				.map((item: any) => item.name)
				.join('\n')
			const rdata = await setCustomModule({ name: pluginModuleInfo.name, args_names: params })
			load.close()
			Message.request(rdata)
			getCustomModuleData()
		} catch (error) {
			console.log(error)
		} finally {
			load.close()
		}
	}

	/**
	 * @description 清空表单+表单验证
	 */
	const clearAddForm = () => {
		// customFormRef.value.resetFields()
		// customFormRef.value.clearValidate()
		customForm.value = {
			args_name: '', // 模块名称
			ps: '', // 模块描述
			args: '', // 模块参数
			init: '#在编译前执行的shell脚本内容，通常为第三方模块的依赖安装和源码下载等前置准备', // 前置脚本
		}
	}
	const speedInstallTimer = ref<any>()
	/**
	 * @description 获取日志
	 */
	const showSpeed = async () => {
		const { inputZipFlag, speedInstallView } = storeToRefs(SOFT_STORE())
		try {
			// 获取进度日志
			const rdata = await getLines({ num: 10, filename: '/tmp/panelShell.pl' })
			const msgLines = rdata.msg.trim().split('\n')
			// 如果最后一行是 Successify 则表示安装完成
			// 若返回结果包含completeFlag其中之一
			const successFlag = completeFlag.some(item => {
				return msgLines[msgLines.length - 1].includes(item)
			})

			if (msgLines[msgLines.length - 1] === 'Successify' || inputZipFlag.value === true || successFlag) {
				inputZipFlag.value = false
				speedInstallView.value = false
				// await getSoftTableList()
				clearTimeoutAll()
				return false
			}
			speedMsg.value = rdata.msg // 更新日志渲染
			if (installShow.value?.scrollHeight) installShow.value.scrollTop = installShow.value.scrollHeight // 滚动条置底
			speedInstallTimer.value = setTimeout(() => {
				showSpeed() // 递归调用查询最新日志
			}, 1000)
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 获取下载速度，轮询进度
	 */
	const getSoftDownloadSpeed = async () => {
		try {
			const { data } = await getDownloadSpeed({ plugin_name: pluginModuleInfo.name })
			if (data.status) {
				downloadSpeed.done = data.down_size
				downloadSpeed.total = data.total_size
				downloadSpeed.progress = data.down_pre
				downloadSpeed.estimated = data.need_time
				downloadSpeed.speed = data.sec_speed
			}
			if (isRefreshDownLoad.value) {
				setTimeout(() => {
					if (!isRefreshDownLoad.value) return
					getSoftDownloadSpeed()
				}, 400)
			}
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 切换插件版本
	 * @param {number} val 版本索引
	 */
	const cutPluginActiveInfo = (val: any) => {
		versionModel.value = val
		useActiveVersionInfo(pluginModuleInfo, pluginActiveInfo, versionModel.value) // 获取插件选中的版本信息
	}

	/**
	 * @description 获取插件所有版本日志信息
	 */
	const getHistoryVersion = async () => {
		try {
			historyLoad.value = true
			const { data: res } = await getPluginUpgrades({ plugin_name: compData.value.name }) // 获取插件所有版本日志信息
			historyData.value = res
			historyLoad.value = false
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 关闭安装弹窗
	 */
	const closeInstallPopup = async () => {
		const popup = await installInfo.value
		popup?.unmount() // 关闭弹窗
	}

	/**
	 * @description 安装插件
	 * @param {number} type 安装类型，0-编译安装，1-极速安装，仅系统插件使用，非环境插件可为空
	 */
	const install = async (type?: number) => {
		try {
			const param = useGenerateInstallInfo(pluginModuleInfo, pluginActiveInfo)
			type !== 0 && closeInstallPopup() // 关闭弹窗
			if (pluginModuleInfo.isSystem) return await useEnvInstall(param, type, () => closeInstallPopup()) // 环境插件安装
			const info = await usePluginInstall(param, {
				title: pluginModuleInfo.title,
				fullVersion: pluginActiveInfo.fullVersion,
			})
			if (!info) return false // 如果安装失败则不继续执行
			closeInstall()
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 关闭安装日志页面
	 */
	const closeInstall = () => {
		compData.value.softData && compData.value.softData.callBack && compData.value.softData.callBack()
	}

	/**
	 * @description 修复插件
	 */
	const repair = async () => {
		try {
			const param = useGenerateInstallInfo(pluginModuleInfo, pluginActiveInfo)
			closeInstallPopup() // 关闭弹窗
			usePluginRepair(param, {
				title: pluginModuleInfo.title,
				fullVersion: pluginActiveInfo.fullVersion,
			})
		} catch (error) {
			console.log(error)
		}
	}

	/**
	 * @description 更新插件
	 */
	const update = async () => {
		try {
			const param: {
				sName: string
				version: string
				min_version: string
				upgrade?: string
			} = useGenerateInstallInfo(pluginModuleInfo, pluginActiveInfo)
			param.upgrade = param.version // 环境插件更新时，upgrade字段为当前更新的版本
			!pluginModuleInfo.isSystem && closeInstallPopup() // 关闭弹窗
			// 环境插件更新
			if (pluginModuleInfo.isSystem) {
				await useCheckMysqlUpgrade(pluginModuleInfo, pluginActiveInfo.fullVersion)
				return await useEnvInstall(param, 0, () => closeInstallPopup())
			}
			usePluginUpdate(param, {
				title: pluginModuleInfo.title,
				fullVersion: pluginActiveInfo.fullVersion,
			})
		} catch (error) {
			console.log(error)
		}
	}

	// 初始化
	const init = async () => {
		if (!compData.value.name) return
		const pluginInfo: PluginRowProps | string = has('name', compData.value.pluginInfo) ? compData.value.pluginInfo : compData.value.name
		await useGetPluginInfo(pluginInfo, compData.value.type, pluginModuleInfo) // 获取插件信息，并初始化数据
		await useFinishingVersion(pluginModuleInfo, versionModel) // 初始化版本列表信息
		await useActiveVersionInfo(pluginModuleInfo, pluginActiveInfo) // 获取插件选中的版本信息
		if (compData.value.name && compData.value.name === 'mysql' && pluginModuleInfo.isInstall) {
			// 查版本5.7并选中
			versionModel.version.forEach((item, index) => {
				if (/^5\.7\.\d+/.test(item.title.replace('mysql', '').trim())) {
					versionModel.value = index
					cutPluginActiveInfo(index)
				}
			})
		}
	}
	const timerDownload = ref<any>()
	const initDownLoad = () => {
		timerDownload.value = setTimeout(() => {
			getSoftDownloadSpeed()
		}, 100)
	}

	/**
	 * @description 关闭下载弹窗
	 */
	const closeDownLoad = async () => {
		isRefreshDownLoad.value = false
		const dialog = await downLoadPopup.value // 关闭弹窗
		dialog.unmount()
	}

	const timerSpeed = ref<any>()
	const initSpeed = () => {
		const { speedInstallView } = storeToRefs(SOFT_STORE())
		timerSpeed.value = setTimeout(() => {
			showSpeed()
			speedInstallView.value = true
		}, 100)
	}

	const clearTimeoutAll = () => {
		timerDownload.value && clearTimeout(timerDownload.value)
		timerSpeed.value && clearTimeout(timerSpeed.value)
		speedInstallTimer.value && clearTimeout(speedInstallTimer.value)
	}

	const $reset = () => {
		pluginActiveInfo.fullVersion = ''
		pluginActiveInfo.mVersion = ''
		pluginActiveInfo.version = ''
		pluginActiveInfo.isBeta = false
		pluginActiveInfo.status = false
		pluginActiveInfo.updateTime = ''
		pluginActiveInfo.updateMsg = '暂无日志'
	}

	return {
		customFormRef,
		compData,
		$reset,
		init,
		pluginModuleInfo,
		pluginActiveInfo,
		versionModel,
		cutPluginActiveInfo,
		install,
		repair,
		update,
		clearTimeoutAll,
		pluginImgSrc,
		pluginTitle,
		pluginLabel,
		pluginPictureSrc,
		getHistoryVersion,
		historyLoad,
		historyData,
		getSoftDownloadSpeed,
		downloadSpeed,
		doneSize,
		totalSize,
		speedSize,
		closeInstall,
		initDownLoad,
		downLoadPopup,
		closeDownLoad,
		initSpeed,
		speedMsg,

		getCustomModuleData,
		config,
		customForm,
		customVisible,
		clearAddForm,
		rules,
		setCustomModuleData,
		tableColumn,
		handleAddCustomModule,
		customData,
		submitCustomModule,
	}
})

const useIntstallStore = () => {
	return storeToRefs(INSTALL_STORE())
}

export { INSTALL_STORE, useIntstallStore }
