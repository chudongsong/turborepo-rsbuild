<template>
    <div class="recent-records-panel">
        <div class="flex items-center primary text-medium font-600 mb-[2rem] mt-2">
			{{ props.recordType === 'ssh' ? 'SSH' : '宝塔面板' }}最近5条登录记录
			<span v-if="props.recordType === 'ssh'" class="bt-link ml-auto" @click="openMoreLogs(router)">查看更多</span>
		</div>
        <BtTable />
    </div>
</template>

<script setup lang="tsx">
import { formatTime } from '@/utils'
import { useRefreshList, useAllTable } from '@/hooks/tools'
import { getLoginLogsEvent, getBrowserName, isRefreshDomain, onHandleIp, openMoreLogs } from './useController'
import { useRouter } from 'vue-router'

interface Props {
    recordType?: string
}
const props = withDefaults(defineProps<Props>(), {
	recordType: 'ssh'
})

const currentType = props.recordType === 'ssh'
const router = useRouter()

const { BtTable } = useAllTable({
	request: (param) => {
        return getLoginLogsEvent(param, currentType)
    },
	columns: [
		{
			label: 'IP地址',
			prop: currentType ? 'address' : 'remote_addr',
            minWidth: 100,
			render: (row: any) => {
				const ip = currentType ? row.address : row.remote_addr
				if (currentType) {
					return (
						<bt-link 
							class={row.deny_status ? 'line-through !text-tertiary' : ''}
							onClick={() => onHandleIp(row)}
						>
							{ip}
						</bt-link>
					)
				}
				return <span>{ip}</span>
			},
		},
		{
			label: '登录时间',
			prop: currentType ? 'time' : 'login_time',
            minWidth: 100,
            render: (row: any) => currentType ? row.time : formatTime(row.login_time)
		},
        {
            label: '端口',
            prop: currentType ? 'port' : 'remote_port'
        },
        {
            label: '状态',
            prop: currentType ? 'status' : 'login_type',
            render: (row: any) => {
				const status = currentType ? row.status : row.login_type
                return <span class={status ? 'text-primary' : 'text-danger'}>{status ? '成功' : '失败'}</span>
            }
        },
        {
            label: currentType ? '用户' : '浏览器',
            prop: currentType ? 'user' : 'user_agent',
            render: (row: any) => currentType ? row.user : getBrowserName(row.user_agent)
        }
	],
	extension: [useRefreshList(isRefreshDomain)],
})

</script>

<style scoped lang="scss">

</style>