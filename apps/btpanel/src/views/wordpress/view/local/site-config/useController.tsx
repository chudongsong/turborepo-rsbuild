import { getDataInfo } from '@/api/global'
import useWPLocalStore from '../useStore'
import useWPLocalConfigStore from '@/views/wordpress/view/local/site-config/useStore'
import { Message, useConfirm, useDataHandle, useHandleError } from '@/hooks/tools'
import { addDomain, removeDomain } from '@/api/site'
import { RequestProps } from '@/hooks/tools/message/types'
import { openResultDialog } from '@/views/site/useController'

const { localRow } = storeToRefs(useWPLocalStore())
const { isRefreshDomain, domain, tabActive } = storeToRefs(useWPLocalConfigStore())

/**
 * @description 获取域名列表
 */
export const getDomainList = async () => {
	try {
		const { data } = await getDataInfo({ table: 'domain', list: 'True', search: localRow.value.id })
		return {
			data,
			total: 0,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

export const onAddDomain = async () => {
	if (domain.value.trim() === '') {
		Message.error('域名不能为空!')
		return
	}
	useDataHandle({
		loading: '正在添加域名，请稍后...',
		request: addDomain({
			id: localRow.value.id,
			webname: localRow.value.name,
			domain: domain.value.trim().split('\n').join(','),
		}),
		success: (rdata: RequestProps) => {
			// 打开结果
			openResultDialog({
				title: '域名添加结果',
				resultData: rdata?.data?.domains || rdata?.data?.data || [],
				autoTitle: '添加域名完成',
			})
			domain.value = ''
			isRefreshDomain.value = true
		},
	})
}

/**
 * @description 删除多个域名 一个接口删除
 * @returns
 */
export const delMultDomain = async (list: any) => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `批量删除`,
			content: `同时删除选中的域名，是否继续？`,
			type: 'calc',
		})

		let result: any = [] // 结果

		// 循环删除
		await Promise.all(
			list.map(async (item: any) => {
				const data = {
					id: localRow.value.id,
					webname: localRow.value.name,
					domain: item.name,
					port: item.port,
				}
				try {
					const res = await removeDomain(data)
					result.push({ name: item.name, msg: res.msg, status: res.status })
				} catch (error) {
					useHandleError(error)
				}
			})
		)
		// 打开结果
		openResultDialog({
			resultData: result,
			autoTitle: '删除域名完成',
		})
		isRefreshDomain.value = true
		return { status: true, msg: '删除域名成功' }
	} catch (error) {
		console.log(error)
		return { status: false, msg: '删除域名失败' }
	}
}

export const delDomain = async (row: any) => {
	try {
		const res = await removeDomain({ id: localRow.value.id, webname: localRow.value.name, domain: row.name, port: row.port })
		Message.request(res)
		isRefreshDomain.value = true
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化tab
 */
export const initTab = async () => {
	if (!localRow.value.php_version_status) {
		tabActive.value = 'php'
	}
}

/**
 * @description 更新php提示
 */
export const updatePhpNotice = async () => {
	localRow.value.php_version_status = true
}
