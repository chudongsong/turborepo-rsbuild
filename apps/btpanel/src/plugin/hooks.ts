/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-case-declarations */

// 挂载专版
export const useMountExtension = async (dependencies: any): Promise<any> => {
	const { enable, type } = checkExtensionType()
	// 非专版，取消挂载
	if (!enable) return false
	// 腾讯云专版
	if (type.includes('tencent')) {
		const { default: Tencent } = await import('./tencent')
		return new Tencent({ name: '腾讯云专项版', dependencies })
	}

	// 阿里云专版
	if (type.includes('aliyun')) {
		const { default: Aliyun } = await import('./aliyun')
		return new Aliyun({ name: '阿里云专项版', dependencies })
	}
	return false
}

/**
 * @description 检测专版类型
 * @returns {Promise<void>}
 */
export const checkExtensionType = (): { enable: boolean; type: string } => {
	const extensionType = window.vite_public_panel_type
	const types = ['tencent', 'aliyun']
	const type = types.find(type => extensionType.includes(type)) || ''
	const enable = Boolean(type)
	return { enable, type }
}
