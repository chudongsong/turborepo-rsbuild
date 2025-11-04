
import { useBatch, useDialog, useForm, useRefreshList, useTable, useAllTable, useConfirm, useMessage } from '@/hooks/tools'
import { getLoginInfo, getSshLogs, removeSshIpRules, createSshIpRules } from '@api/logs'
import { useDataHandle } from '@/hooks/tools'
import { actionType } from '@logs/views/ssh-log/useController'
import { getFirewallStore } from '@firewall/useStore'

const message = useMessage()
export const isRefreshDomain = ref(false)
const {
	refs: { sshTabActive },
} = getFirewallStore()
/**
 * @description 获取日志数据
 */
export const getLoginLogsEvent = async (params: any, type: Boolean) => {
    try {
        params.limit = 5
        if (type) {
            params.historyType = "ALL"
        }
        const res: any = await useDataHandle({
            request: type ? getSshLogs({ data: JSON.stringify(params) }) : getLoginInfo(params),
            data: { data: Array, total: Number },
        })
        return { data: res.data, total: res.total, other: {} }
    } catch (error) {
        console.log(error)
        return { data: [], total: 0, other: {} }
    }
}

// 解析获取浏览器名称
export const getBrowserName = (ua?: string): string => {
	if (!ua || typeof ua !== 'string') return '-'
	const lower = ua.toLowerCase()
	
	if (lower.includes('edg/')) return 'Edge'
	if (lower.includes('opr/') || lower.includes('opera')) return 'Opera'
	if (lower.includes('chrome') && !lower.includes('edg/') && !lower.includes('opr/')) {
		return 'Chrome'
	}
	if (lower.includes('firefox')) return 'Firefox'
	if (lower.includes('safari') && !lower.includes('chrome')) {
		return 'Safari'
	}
	if (lower.includes('msie') || lower.includes('trident/')) return 'IE'
	return 'Unknown'
}


export const onHandleIp = async (row: any) => {
	const deny = row.deny_status
	await useConfirm({
		title: '提示',
		content: deny ? '解封该IP后，将恢复此IP对服务器的访问，是否继续操作？' : '封禁该IP后，将不再允许此IP访问服务器，是否继续操作？',
		icon: 'warning-filled',
	})

	let params: { [key: string]: string } = { address: row.address }
	if (!deny) {
		params = {
			address: row.address,
			types: 'drop',
			brief: 'SSH登录日志页面点击IP手动封禁',
			domain: '',
			choose: 'address',
		}
	}
	params = { data: JSON.stringify(params) }

	const res: any = await changeIpRules(params, deny)
	message.request(res)
	// 刷新方法
	isRefreshDomain.value = true
	return res
}


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

export const openMoreLogs = (router: any) => {
    actionType.value = 'ALL'
	sshTabActive.value = 'login'
	router.push('/firewall/ssh-manger')
}