import { checkVersion } from '@/utils'

/* eslint-disable @typescript-eslint/naming-convention */
interface SoftProps {
	title: string // 标题
	is_beta: boolean // 是否beta
	version: string // 版本
	type: number // 软件类型
	name: string // 名称
	setup: string // 安装命令
	endtime: number // 到期时间
	id: number // 软件id
	versions: SoftVersionRowProps[] // 版本列表
	admin: boolean // 是否管理员
}

interface SoftVersionRowProps {
	m_version: string // 主版本
	beta: number // 是否beta
	version: string // 子版本
	ctime: number // 创建时间
	utime: number // 更新时间
}

/**
 * @description 检查插件是否已购买
 * @param param0  插件信息
 * @param authType 授权类型
 * @returns  { boolean } 是否已购买
 */
export const checkSoftPluginPay = ({ endtime, type }: SoftProps, authType: string) => {
	// 插件已购买或当前是企业版授权
	if (endtime >= 0 || authType === 'ltd') return true
	// 当前是专业版授权，且插件是专业版插件
	if (authType === 'pro' && type !== 12) return true
	// 免费版授权
	if (authType === 'free' && type !== 12 && type !== 8) return true
	return false // 未购买
}

/**
 * @description 检查插件是否需要更新
 * @param item  插件信息
 * @returns { boolean } 是否需要更新
 */
export const checkPluginUpdate = (item: SoftProps) => {
	if (item.name === 'phpmyadmin') return false
	if (!item.versions) return false
	// 已安装
	if (item.versions?.length > 1) {
		const otherEnv = ['Redis']
		// 版本大于1
		// 如果是插件
		if (item.admin && !otherEnv.includes(item.title)) {
			// 正式版最新
			const minVersion = item.versions[0] // 取最新的版本
			const cloudVersion = `${minVersion.m_version}.${minVersion.version}`
			// 如果需要更新，使用最新正式版
			let isUpdate = item.version !== cloudVersion
			// 如果当前安装的是测试版
			if (item.is_beta) {
				// 如果有测试版，则在版本列表中的最后一行，注意：只显示最新的一个测试版本
				const betaVs = item.versions[item.versions.length - 1]
				// 判断是否存在测试版
				if (betaVs.beta === 1) {
					const betaVersion = `${betaVs.m_version}.${betaVs.version}`
					// 当前安装的是测试版，且当前应用有测试版本可用，如果需要更新，此时使用最新测试版
					isUpdate = item.version !== betaVersion && item.version < betaVersion
				}
			}
			// 可以更新，渲染更新按钮,mongodb不显示更新按钮
			if (isUpdate && item.name !== 'mongodb') return true
		} else {
			// 不是插件
			for (let i = 0; i < item.versions.length; i++) {
				const minVersion = item.versions[i]
				const ret = checkVersion(item.version, `${minVersion.m_version}.${minVersion.version}`)
				if (ret === 2) return true // 可以更新，渲染更新按钮
			}
		}
	} else {
		// 测试版？
		const minVersion = item.versions[0]
		let isBeta = !!minVersion.beta
		// 单个版本
		if (isBeta === undefined) isBeta = false
		if (item.is_beta === undefined) item.is_beta = false
		const cloudVersion = `${minVersion.m_version}.${minVersion.version}`
		if (item.version !== cloudVersion && isBeta === item.is_beta && item.version < cloudVersion) {
			return true // 测试版？渲染更新按钮
		}
	}
	return false
}

/**
 * @description 检查插件当下状态
 * @param status 插件状态
 * @returns { boolean | string } 插件状态 false：正常状态 string：安装进行态
 */
export const checkTaskStatus = (status: string) => {
	let statusText: boolean | string = false
	switch (status) {
		case '-1':
			statusText = '正在安装' // 正在安装
			break
		case '0':
			statusText = '等待安装' // 等待安装
			break
		case '-2':
			statusText = '正在更新' // 正在更新
			break
	}
	return statusText
}
