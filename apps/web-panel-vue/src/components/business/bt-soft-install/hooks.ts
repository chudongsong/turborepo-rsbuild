import type { ShallowReactive } from 'vue'
import { has } from 'ramda'
import { isObject } from '@vueuse/core'

import { getPluginInfo, inputPackageInfo, getTaskSpeed } from '@/api/global'
import { formatTime, isUndefined } from '@utils/index'
import { msgBoxDialog, pluginInstallDialog } from '@/public/index'
import { Message, useConfirm } from '@/hooks/tools'

import { installPlugin, repairPlugin } from '@api/soft'
import { useGlobalStore } from '@/store/global'
import type { ActiveInfoProps, PluginInfoProps, EnvInstallProps, PluginRowProps, VersionModelProps, PluginInstallOtherProps } from './types'

import { compileInstallDialog, downloadSpeedDialog, speedInstallDialog } from './popup'
import { SOFT_STORE } from '@/views/soft/store'

const { isRefreshSoftList, isUpdatePayment, updatePluginCheck } = useGlobalStore()

/**
 * @description 切割插件的图片介绍信息
 * @param {string} introduction 插件介绍
 * @returns {string[][]} 二维数组
 */
const useSplitIntroduction = (introduction: string): string[][] => {
	if (!introduction) return []
	return introduction.split(';').map(item => item.split('|')) // 介绍图片
}

/**
 * @description 处理插件信息的钩子函数，转成组件需要的数据格式
 * @param {PluginRowProps} row 插件信息
 * @param {string} callType 操作类型
 * @param {PluginInfoProps} pluginInfo 插件信息
 */
const useFinishingInfo = (row: PluginRowProps, callType: 'r' | 'u' | 'i', pluginInfo: PluginInfoProps) => {
	const { title, name, ps, type, dependnet, other_php, versions, version } = row
	const compileList = ['nginx', 'apache', 'mysql', 'php']
	const pluginSpecialList = ['apache', 'nginx', 'mysql']
	const pluginName = name.split('-')[0]
	pluginInfo.title = title // 插件标题
	pluginInfo.name = name // 插件名称,用于唯一标识和参数传递
	pluginInfo.isBeta = !!row.is_beta // 是否是测试版
	pluginInfo.ps = ps // 插件描述
	pluginInfo.type = type // 插件类型
	pluginInfo.call = callType // 操作类型
	pluginInfo.isInstall = callType === 'i' // 是否安装
	pluginInfo.isUpdate = callType === 'u' // 是否有更新
	pluginInfo.isRepair = callType === 'r' // 是否是修复
	pluginInfo.isPHPInstall = pluginName === 'php' && callType === 'i' // 是否是PHP插件
	pluginInfo.isBeta = !!row.is_beta // 是否是测试版
	pluginInfo.isSystem = type === 5 // 是否是系统插件
	pluginInfo.isPHPInstall = pluginName === 'php' // 是否是PHP插件
	pluginInfo.isMysqlUpdate = pluginName === 'mysql' && (callType === 'r' || callType === 'u') // 是否是MySQL插件
	pluginInfo.isSpecialPlugins = pluginSpecialList.includes(name)
	pluginInfo.introduction = useSplitIntroduction(row.introduction) // 插件介绍图片,转成二维数组
	pluginInfo.compile = compileList.includes(pluginName) // 是否支持编译安装
	pluginInfo.currentVersion = version || '' // 当前版本
	pluginInfo.otherPHP = other_php || [] // 其他PHP版本,仅PHP插件有
	pluginInfo.versions = versions || [] // 版本列表
	pluginInfo.dependnet = dependnet // 插件依赖
	pluginInfo.isDependnet = !(dependnet?.need?.length || dependnet?.selected?.length)
}

/**
 * @description 获取插件信息的钩子函数
 * @param {string | object} pluginName 插件名称,或者插件请求数据
 * @param {string} callType 操作类型
 * @param {PluginInfoProps} pluginInfo 插件信息
 */
export const useGetPluginInfo = async (pluginName: PluginRowProps | string, callType: 'r' | 'u' | 'i', pluginInfo: ShallowReactive<PluginInfoProps>) => {
	if (isObject(pluginName) && has('name', pluginName)) {
		useFinishingInfo(pluginName, callType, pluginInfo)
		return
	}
	// 获取插件信息
	const load = Message.load('正在获取插件信息，请稍候...')
	const { data } = await getPluginInfo({ sName: pluginName })
	load.close()
	useFinishingInfo(data, callType, pluginInfo)
}

/**
 * @description 获取选中的插件版本信息的钩子函数
 * @param {number} index 插件索引
 * @param {string} pluginName 插件名称
 * @param {ActiveInfoProps} activeData 选择版本信息
 * @returns {ActiveInfoProps}
 */
export const useActiveVersionInfo = async (pluginData: PluginInfoProps, activeData: ActiveInfoProps, index?: number) => {
	const isInit = isUndefined(index)
	let selectVal = pluginData.versions[index || 0] // 获取主版本后，重新赋值，调用最新版本信息
	if (isInit && pluginData.isSystem) {
		// 若index为undefied 则手动查询一次版本中是否有当前版本的更新
		const versionIndex = pluginData.versions.findIndex((item: any) => pluginData.currentVersion.indexOf(item.m_version) > -1)
		if (versionIndex >= 0) selectVal = pluginData.versions[versionIndex]
	}
	// php安装插件需要的版本信息
	if (pluginData.isPHPInstall) {
		// 初始化，重新获取PHP列表数据
		if (isInit) index = pluginData.otherPHP.findIndex((item: any) => item.name === pluginData.name)
		selectVal = pluginData.otherPHP[index || 0]
		// 如果非当前PHP版本，获取重新插件信息
		if (pluginData.name !== selectVal.name) {
			const load = Message.load('正在获取PHP版本信息，请稍候...')
			const { data } = await getPluginInfo({ sName: selectVal.name })
			selectVal = data.versions[0] // 获取PHP插件的版本信息
			load.close()
		} else {
			selectVal = pluginData.versions[0] // 获取主版本后，重新赋值，调用最新版本信息
		}
	}
	if (!pluginData.isSystem) {
		// 官方插件需要的版本信息
		activeData.updateTime = selectVal.update_time ? formatTime(selectVal.update_time, 'yyyy/MM/dd') : '无'
		activeData.isBeta = !!selectVal.beta
		activeData.updateMsg = selectVal.update_msg || '暂无内容'
	}
	activeData.mVersion = selectVal.m_version
	// 获取当前版本最新子版本-环境插件不可跨大版本-更新时走此条
	if (pluginData.isSystem && pluginData.isUpdate && !pluginData.isPHPInstall) {
		const versionList = await useCheckSystemUpgradeVersion(pluginData)
		if (!versionList.length) {
			activeData.fullVersion = '版本错误'
			return
		}
		activeData.version = versionList[0]?.version
		activeData.fullVersion = `${versionList[0]?.m_version}.${versionList[0].version}`
	} else {
		activeData.version = selectVal.version
		activeData.fullVersion = `${selectVal.m_version}${selectVal.version ? '.' + selectVal.version : ''}`
	}
	return activeData
}

/**
 * @description 获取选中插件的版本信息，并处理成组件需要的数据格式
 * @param {PluginInfoProps} pluginData 插件信息
 * @param {ShallowReactive<VersionModelProps>} versionModel 版本信息
 */
export const useFinishingVersion = (pluginData: PluginInfoProps, versionModel: ShallowReactive<VersionModelProps>) => {
	const versionList: any[] = []
	const { versions, isPHPInstall, otherPHP } = pluginData
	if (isPHPInstall) {
		otherPHP.map((item: any, index: number) => {
			versionList.push({
				title: item.name,
				key: index,
				disabled: item.status,
				data: item,
			})
		})
		versionModel.value = otherPHP.findIndex((item: any) => item.name === pluginData.name)
		versionModel.version = versionList
	} else {
		versions.map((item: any, index: number) => {
			let versionLabel = !!isUndefined(item.beta) ? ' Beta' : ' Stable'
			let pluginName = pluginData.name + ' '
			if (pluginData.isSystem) {
				versionLabel = '' // 系统插件不显示Beta/Stable
			} else {
				pluginName = ''
			}
			versionList.push({
				title: `${pluginName}${item.m_version}${item.version === '' ? '' : `.${item.version}`}${versionLabel}`,
				key: index,
				data: item,
			})
		})
		versionModel.value = 0
		versionModel.version = versionList
	}
}

/**
 * @description 获取版本最新版本信息，缺分测试版和正式版
 * @param {PluginInfoProps} pluginData 插件信息
 * @param {ShallowReactive<VersionModelProps>} versionModel 版本信息
 */
export const useFinishingVersionNew = async (param: EnvInstallProps) => {
	try {
		const { data } = await repairPlugin({
			plugin_name: param.sName,
			version: param.version,
			min_version: param.min_version,
		})
		return data
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 生成安装信息的钩子函数，支持环境软件/插件
 * @param {PluginInfoProps} pluginInfo 插件信息
 * @param {ActiveInfoProps} activeVersion 选中的插件版本信息
 * @returns {EnvInstallProps}
 */
export const useGenerateInstallInfo = (pluginInfo: PluginInfoProps, activeVersion: ActiveInfoProps): EnvInstallProps => {
	return {
		sName: pluginInfo.name,
		version: activeVersion.mVersion,
		min_version: activeVersion.version,
	}
}

/**
 * @description 安装/更新环境软件的钩子函数
 * @param {EnvInstallProps} param 插件安装/更新参数
 * @param {number} type 插件安装方式, 0：编译安装
 */
export const useEnvInstall = async (param: EnvInstallProps, type: number = 1, close?: any) => {
	// 检查同类安装
	const haveSameInstall = await useCheckEnvIsInstalling(param)
	if (haveSameInstall) return
	// 编译安装
	if (type === 0) {
		const data = await useCompileInstall(param, !param.upgrade ? '安装' : '更新')
		if (!data) return
		close()
	}
	const load = Message.load('正在添加安装任务，请稍候...')
	try {
		const { data } = await installPlugin({ ...param, type })
		if (has('status', data) && has('msg', data) && !data.status) {
			Message.msg({
				dangerouslyUseHTMLString: true,
				message: `<div style="line-height:22px;">${data.msg}</div>`,
				type: 'error',
				duration: 2000,
			})
			return
		}
		isRefreshSoftList.value = true
		msgBoxDialog()
		setTimeout(() => {
			Message.request(data)
		}, 1000)
	} catch (error) {
		console.error(error)
	} finally {
		load.close()
	}
}

/**
 * @description 编译安装-环境软件的钩子函数
 * @param param
 */
export const useCompileInstall = async (param: EnvInstallProps, type: string) => {
	// 打开自定义模块编译安装弹窗
	return compileInstallDialog(param.sName, type)
}

/**
 * @description 通用的前置数据处理处理函数，钩子函数，下载进度获取插件包数据
 * @param {EnvInstallProps} param 插件安装参数
 * @param {PluginInstallOtherProps} pluginOtherData 插件其他信息
 * @returns {Promise<PluginInstallOtherProps>}
 */
export const useCommonHandleBefore = async (param: EnvInstallProps, pluginOtherData: PluginInstallOtherProps) => {
	try {
		const dialog = await useDownload({
			pluginTitle: pluginOtherData.title,
			pluginName: param.sName,
			fullVersion: pluginOtherData.fullVersion,
		})
		const { data } = await installPlugin({ ...param })
		dialog.unmount() // 关闭下载进度弹窗
		if (has('status', data) && has('msg', data) && !data.status) {
			// 判断是否有status和msg属性，如果有则返回错误信息
			Message.msg({
				message: `<div style="line-height:22px;">${data.msg}</div>`,
				type: 'error',
				duration: 2000,
				showClose: true,
				dangerouslyUseHTMLString: true,
			})
			return false
		}
		return data
	} catch (error) {
		console.error(error)
	}
}

/**
 * @description 通用的处理函数，用于处理插件安装/修复/更新的操作，执行修复和更新操作
 * @param {string} plugin_name 插件名称
 * @param {string} tmp_path 插件包路径
 * @param {'i' | 'r' | 'u'} install_opt 操作类型
 * @returns {Promise<void>}
 */
export const useCommonHandle = async (plugin_name: string, tmp_path: string, install_opt: 'i' | 'r' | 'u', plugin_title: string = '') => {
	const opt_message = {
		i: '安装',
		r: '修复',
		u: '更新',
	}
	const installDialog = await useInstallProgress({
		title: `正在${opt_message[install_opt]}插件：${plugin_title},请稍候...`,
		msg: '正在安装插件，请稍候...',
	})
	const data = await inputPackageInfo({
		plugin_name,
		tmp_path,
		install_opt,
	})
	Message.request(data)
	const { inputZipFlag } = storeToRefs(SOFT_STORE())
	inputZipFlag.value = true
	installDialog.unmount() // 关闭下载进度弹窗
	if (updatePluginCheck.value.status) {
		updatePluginCheck.value.status = false
		updatePluginCheck.value.callback?.()
		return
	}
	// 当前路由不为软件商店时，刷新整个页面
	if (location.pathname !== '/soft/plugin') {
		// 刷新页面
		// router.go(0)
		window.location.reload()
	} else {
		isRefreshSoftList.value = true
	}
}

/**
 * @description 安装插件的钩子函数
 * @param {PluginInstallProps} param 插件安装参数
 * @param {PluginInstallOtherProps} pluginOtherData 插件其他信息
 * @returns {Promise<void>}
 */
export const usePluginInstall = async (param: EnvInstallProps, pluginOtherData: PluginInstallOtherProps) => {
	const pluginPathInfo = await useCommonHandleBefore(param, pluginOtherData)
	if (!pluginPathInfo) return false
	if (pluginPathInfo) useCommonHandle(param.sName, pluginPathInfo.tmp_path, 'i', pluginOtherData.title)
}

/**
 * @description 更新软件的钩子函数
 * @param {PluginInstallProps} param 插件安装参数
 * @param {PluginInstallOtherProps} pluginOtherData 插件其他信息
 * @returns {Promise<void>}
 */
export const usePluginUpdate = async (param: EnvInstallProps, pluginOtherData: PluginInstallOtherProps) => {
	const pluginPathInfo = await useCommonHandleBefore(param, pluginOtherData)
	if (pluginPathInfo) useCommonHandle(param.sName, pluginPathInfo.tmp_path, 'u', pluginOtherData.title)
}

/**
 * @description 修复软件的钩子函数
 */
export const usePluginRepair = async (pluginInfo: EnvInstallProps, pluginOtherData: PluginInstallOtherProps) => {
	const pluginPathInfo = await useCommonHandleBefore(pluginInfo, pluginOtherData)
	if (pluginPathInfo) useCommonHandle(pluginInfo.sName, pluginPathInfo.tmp_path, 'r', pluginOtherData.title)
}

/**
 * @description 显示下载进度的钩子函数
 */
export const useDownload = ({ pluginTitle, pluginName, fullVersion }: any) => downloadSpeedDialog({ pluginTitle, pluginName, fullVersion })

/**
 * @description 显示安装进度的钩子函数
 */
export const useInstallProgress = (speedConfig: AnyObject) => speedInstallDialog(speedConfig)

/**
 * @description 检查插件依赖的钩子函数
 * @param pluginConfig
 */
export const useCheckDependence = async (pluginConfig: ShallowReactive<PluginInfoProps>) => {
	if (pluginConfig.dependnet.need.length) {
		await useConfirm({
			title: '提示',
			content: `安装插件需要先安装${pluginConfig.dependnet.need[0]}环境依赖,是否安装?`,
			icon: 'warning-filled',
		})
		const softData = {
			...pluginConfig,
			// 安装成功的回调
			callback: () => {
				isRefreshSoftList.value = true
				isUpdatePayment.value = true
			},
		}
		// 安装对应环境
		await pluginInstallDialog({
			name: pluginConfig.dependnet.need[0],
			type: 'i',
			pluginInfo: softData,
		})
	}
}

/**
 * @description 升级mysql版本的检查钩子函数
 */
export const useCheckMysqlUpgrade = async (pluginModuleInfo: ShallowReactive<PluginInfoProps>, fullVersion: any) => {
	if (pluginModuleInfo.isMysqlUpdate) {
		// 提示mysql更新信息
		await useConfirm({
			title: '更新[MySQL]',
			isHtml: true,
			width: '40rem',
			content: `<div class="!text-secondary">更新过程可能会导致服务中断,您真的现在就将[MySQL]更新到[${fullVersion}]吗?</div>
				<div class="text-danger">更新数据库有风险,建议在更新前,先备份您的数据库</div>
				<div class="text-danger">若您的是云服务器,强烈建议您在更新前做一个快照</div>
				<div class="text-danger">建议您在服务器负载闲时进行软件更新</div>`,
			type: 'calc',
		})
	}
}

/**
 * @description 检查系统升级版本的钩子函数
 * @param pluginData
 */
export const useCheckSystemUpgradeVersion = async (pluginData: any) => {
	let versionList: any = []
	const matchOtherVersion = pluginData.currentVersion?.match(/(\d+\.\d+)/)?.at(1)
	// 若为mysql则需要进行特殊三种版本处理/mariadb_/greatsql_/AliSQL
	if (pluginData.isMysqlUpdate) {
		const matchMysqlVersion = pluginData.currentVersion.match(/(greatsql_\d+\.\d+|mariadb_\d+\.\d+|AliSQL)/)?.at(1)
		versionList = pluginData.versions.filter((item: any) => item.m_version === matchMysqlVersion || item.m_version === matchOtherVersion)
	} else {
		versionList = pluginData.versions.filter((item: any) => item.m_version === matchOtherVersion)
	}
	return versionList
}

/**
 * @description 检查是否正在安装同类型/同插件的钩子函数
 * @description nginx apache openLiteSpeed 三者存其一
 * @description php 判定是否存在同版本安装
 */
export const useCheckEnvIsInstalling = async (param: EnvInstallProps) => {
	const { data }: any = await getTaskSpeed()
	if (!has('task', data)) return false
	const { task }: any = data // 正在准备安装/安装的插件列表

	// PHP插件版本---------------------
	if (param.sName.indexOf('php-') > -1) {
		// 判定消息盒子中是否存在同版本php安装
		const isSame = task.some((item: any) => {
			// 判定是否存在同版本php安装
			let versionSame = item.name.match(/-(.*?)\]/) && item.name.match(/-(.*?)\]/)[1] === param.version
			// 判定是否存在同名php安装
			let nameSame = item.name.indexOf('php-') > -1
			return versionSame && nameSame
		})
		if (isSame) {
			Message.error('正在安装相同版本的php插件，不可重复安装!')
			return true
		}
	}

	// 环境插件------------------------
	let serverEnv = ['nginx', 'apache', 'openlitespeed']
	if (serverEnv.includes(param.sName)) {
		const isSimple = task.some((item: any) => item.name.match(/\[(.*?)-/) && serverEnv.includes(item.name.match(/\[(.*?)-/)[1]))
		// 判定消息盒子中是否存在同类型安装
		if (isSimple) {
			Message.error('正在安装同类型软件nginx,apache或openLiteSpeed，不可重复安装!')
			return true
		}
	}
	return false
}
