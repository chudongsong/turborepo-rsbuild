<!--  -->
<template>
	<div class="p-[2rem]">
		<el-descriptions title="" direction="vertical" :column="4" border class="mb-[1.2rem] table-descriptions">
			<el-descriptions-item label="时间">{{ formatTime(compData.row.addtime) }}</el-descriptions-item>
			<el-descriptions-item label="用户Ip"
				><bt-link @click="addIpWhite">{{ compData.row.address }}</bt-link></el-descriptions-item
			>
			<el-descriptions-item label="触发函数">{{ compData.row.fun_name }}</el-descriptions-item>
			<el-descriptions-item label="过滤器">{{ compData.row.intercept }} </el-descriptions-item>
		</el-descriptions>
		<div class="mb-[1.2rem] flex flex-col">
			<span class="detail-title">URL地址</span>
			<span class="detail-content"> {{ compData.row.url }} </span>
		</div>
		<div class="mb-[1.2rem] flex flex-col">
			<span class="detail-title">User-Agent</span>
			<span class="detail-content">
				{{ compData.row.data_info.data.request.headers['user-agent'] }}
			</span>
		</div>
		<div class="mb-[1.2rem] flex flex-col">
			<div class="flex justify-between items-end">
				<span class="detail-title">传入值</span>
				<el-button type="text" @click="addUrlWhite">URL加白</el-button>
			</div>
			<span class="detail-content">
				{{ compData.row.data_info.data.args.join('\n') }}
			</span>
		</div>
		<div class="mb-[1.2rem] flex flex-col">
			<span class="detail-title">调用栈</span>
			<span class="detail-content">
				{{ compData.row.data_info.data.stack_trace.join('\n') }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { formatTime } from '@utils/index'
import { setSiteUrlWhite } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools'

interface Props {
	compData: any
}
const message = useMessage()
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

// 获取vue实例对象

/**
 * @description: ip加白
 */
const addIpWhite = () => {
	props.compData.addIpWhiteEvent(props.compData.row)
}

/**
 * @description: URL加白
 */
const addUrlWhite = async () => {
	await useConfirm({
		title: '加入URL白名单',
		content: `加入URL白名单后此URL将不再进行防御，是否继续操作？`,
		icon: 'warning-filled',
	})

	await useDataHandle({
		loading: '正在加入URL白名单...',
		request: setSiteUrlWhite({ url_rule: props.compData.row.url }),
		message: true,
	})
}
</script>

<style lang="css" scoped>
.detail-title {
	@apply font-bold text-base text-default ml-[.4rem] mb-[8px];
}
.detail-content {
	@apply bg-lighter border-1 border-lighter p-[.8rem] rounded-small mb-[1.2rem];
}
</style>
