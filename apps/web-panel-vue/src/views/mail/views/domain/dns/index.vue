<template>
	<div class="p-20px">
		<bt-table class="mb-20px" :data="statusData" :column="statusColumns"></bt-table>
		<div class="record-title">第一步：添加 MX 记录</div>
		<div class="record-desc">登录域名服务商，添加记录类型为MX的记录，用于邮箱服务(解析MX记录之前要先解析A记录)</div>
		<el-table class="mb-30px" :data="[{ type: 'MX', host: '@', value: propsData.row?.mx_record, priority: '10' }]">
			<el-table-column prop="type" label="记录类型" />
			<el-table-column prop="host" label="主机记录" />
			<el-table-column prop="value" label="记录值" />
			<el-table-column prop="priority" label="MX优先级" />
		</el-table>
		<div class="record-title">第二步：添加 TXT 记录</div>
		<div class="record-desc">添加记录类型为TXT的记录，用于邮箱反垃圾(请直接复制下列参数)</div>
		<el-table class="mb-30px" :data="addTxtRecordData">
			<el-table-column prop="type" label="记录类型" />
			<el-table-column prop="host" label="主机记录" />
			<el-table-column width="280" prop="value" label="记录值">
				<template #default="scope">
					<el-tooltip :content="scope.row.value" popper-class="w-220px" effect="dark" placement="top-end">
						<span class="mr-4px max-w-220px! truncate"> {{ scope.row.value }} </span>
					</el-tooltip>
					<span class="text-primary cursor-pointer hover:text-primaryDark" @click="onCopy(scope.row.value)"> (复制) </span>
				</template>
			</el-table-column>
		</el-table>
		<!-- <div class="record-title">Step 3: Add PTR records</div>
		<div class="record-desc">(Optional) PTR records are used for reverse DNS lookups.</div>
		<div class="record-desc">Contact your ip provider to create a ptr record.</div> -->
		<div class="flex flex-center mt-24px justify-end">
			<el-button v-if="showParseAll" @click="onParseAllEnvent(popupClose)">一键解析</el-button>
			<el-button type="primary" @click="onVerify(popupClose)"> 已设置，验证域名解析 </el-button>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { MailDomain } from '@mail/types'
import MAIL_DOMAIN_DNS from '@mail/views/domain/dns/store'
import { storeToRefs } from 'pinia'

const { propsData, addTxtRecordData, statusData } = storeToRefs(MAIL_DOMAIN_DNS())
const { init, statusColumns, onCopy, onVerify, onParseAllEnvent } = MAIL_DOMAIN_DNS()

interface PropsData {
	row: MailDomain
	onRefresh: () => void
}

interface Props {
	compData: PropsData
}

const props = withDefaults(defineProps<Props>(), {})

const popupClose = inject<any>('popupClose')

const showParseAll = computed(() => {
	const isAllSuccess = props.compData.row.mx_status && props.compData.row.a_status && props.compData.row.spf_status && props.compData.row.dkim_status && props.compData.row.dmarc_status
	return !isAllSuccess && props.compData.row.dns_id
})

nextTick(() => {
	init(props.compData)
})
</script>

<style lang="css" scoped>
.record-title {
	font-size: var(--el-font-size-medium);
	color: var(--el-color-text-primary);
	font-weight: 600;
	margin-bottom: 10px;
}

.record-desc {
	font-size: var(--el-font-size-base);
	color: var(--el-color-text-secondary);
	margin-bottom: 10px;
}

.bt-link {
	border: none;
	outline: none;
	background: none;
	padding: 0;
}
</style>
