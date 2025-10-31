import { createSshIpRules, getSSHLoginInfo, getSshLogs, getSshPath, removeSshIpRules } from '@/api/logs'
import { getPageTotal } from '@/utils'
import { Message, useDataHandle } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { ResponseResult } from '@/types'
import { defineStore, storeToRefs } from 'pinia'

const LOG_SSH_STORE = defineStore('LOG-SSH-STORE', () => {
	const isRefreshList = ref(false) // 是否刷新SSH
	const { payment } = useGlobalStore()
	const banCronJob = ref(false) // 定时封禁开关状态

	/**
	 * @description 获取SSH日志
	 * @param params
	 */
	const getLogs = async (params: any) => {
		try {
			if (payment.value.authType !== 'ltd') return { data: [], total: 0, other: {} }
			const res: ResponseResult = await useDataHandle({
				loading: '正在获取日志数据，请稍后...',
				request: getSshLogs({ data: JSON.stringify(params) }),
			})
			if (!res.status && res.msg) return Message.error(res.msg)

			// // 请求分页总数
			// const total = await getSSHLoginInfo()
			// const totalData = total.data.success + total.data.error

			return { data: res.data.data, total: getPageTotal(res.data.page), other: {} }
		} catch (error) {
			console.log(error)
			return { data: [], total: 0, other: {} }
		}
	}

	/**
	 * @description 处理Ip
	 * @param params
	 * @param deny
	 */
	const changeIpRules = async (params: any, deny: boolean) => {
		try {
			const res: any = await useDataHandle({
				loading: '正在处理中，请稍后...',
				request: deny ? removeSshIpRules(params) : createSshIpRules(params),
			})
			return {
				msg: res.data[0].msg,
				status: res.data[0].status,
				data: { ip: res.data[0].ip },
			}
		} catch (error) {
			console.log(error)
			return { msg: '操作失败', status: false, data: {} }
		}
	}

	/**
	 * @description 导出日志
	 */
	const outLogs = async (params: any) => {
		try {
			const { count, type: select } = params
			let data = { count, select }
			if (data.select === 'all') delete (data as { select?: string }).select // 全部时，不传select

			const res: any = await useDataHandle({
				loading: '正在导出日志，请稍后...',
				request: getSshPath({ data: JSON.stringify(data) }),
				success: (res: ResponseResult) => {
					window.open('/download?filename=' + res.data.output_file, '_blank', 'noopener,noreferrer')
				},
			})
			return { status: res.status, msg: `导出${res.status ? '成功' : '失败'}` }
		} catch (error) {
			console.log(error)
			return { status: false, msg: '导出失败' }
		}
	}

	return {
		isRefreshList,
		banCronJob,
		getLogs,
		changeIpRules,
		outLogs,
	}
})

const useSSHLogStore = () => {
	return storeToRefs(LOG_SSH_STORE())
}

export { useSSHLogStore, LOG_SSH_STORE }
