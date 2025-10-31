<template>
	<div class="p-[2rem]">
		<bt-table-group>
			<template #header-left>
				<el-button @click="clearRecord">清空记录</el-button>
			</template>
			<template #content>
				<bt-table ref="alarmRecordRef" :column="tableColumn" :data="tableData" :description="'记录为空'" max-height="42rem" v-bt-loading="tableLoading" v-bt-loading:title="`正在获取告警记录，请稍候...`" />
			</template>
			<template #footer-right>
				<bt-table-page :total="tableParam.total" v-model:page="tableParam.page" v-model:row="tableParam.size" @change="getRecord" />
			</template>
			<template #popup>
				<bt-dialog v-model="detailPopup" :area="48" title="告警详情">
					<div class="p-[2rem]">
						<div class="item">
							<div class="title">发送情况</div>
							<div v-if="detailData.length > 0" class="border border-light rounded-base max-h-[20rem] overflow-y-auto">
								<div class="table-box">
									<span class="w-[50%]">发送账号</span>
									<span class="w-[50%]">发送结果</span>
								</div>
								<div class="table-box" v-for="(account, index) in detailData" :key="index">
									<span class="w-[50%]" v-if="account.accounts.account && account.accounts.title">{{ `${account.accounts.account}(${account.accounts.title})` }}</span>
									<span class="w-[50%]" v-else>{{ `${account.accounts.title}` }}</span>
									<span class="w-[50%] truncate">
										<bt-ellipsis-tooltip popperClass="w-[400px]" placement="left" :class="account.result ? 'text-primary' : 'text-danger'" :text="account.resultMsg"></bt-ellipsis-tooltip>
									</span>
								</div>
							</div>
							<div v-if="detailData.length == 0" class="box">
								{{ rowData.result.stop_msg }}
							</div>
						</div>
						<div class="item">
							<div class="title">告警信息</div>
							<div class="box" v-html="rowData.send_data.msg_list.join('<br>')"></div>
						</div>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { useConfirm, useDataHandle, Message } from '@hooks/tools'
import { useOperate } from '@hooks/tools/table/column'
import { formatTime } from '@utils/index'
import { clearTaskRecord, delTaskRecord, getTaskRecordList } from '@/api/config'
import { useGlobalStore } from '@store/global'
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const { push } = useGlobalStore()

const rowData = ref<any>({}) // 行数据

const detailPopup = ref(false) // 详情弹窗
const detailData = ref<any>([]) // 详情数据

const tableLoading = ref(false) // 表格loading
const tableData = ref([])
const tableParam = reactive({
	page: 1,
	size: 10,
	total: 0,
})

// 清空记录
const clearRecord = async (row: any) => {
	try {
		await useConfirm({
			title: `清空记录【${props.compData.title}】`,
			content: `您真的要清空【${props.compData.title}】的所有告警记录吗？`,
		})
		await useDataHandle({
			loading: '正在清空记录，请稍后...',
			request: clearTaskRecord({
				task_id: props.compData.id,
				record_ids: JSON.stringify([row.id]),
			}),
			message: true,
		})
		getRecord()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取告警详情
 */
const getDetailData = (row: any) => {
	rowData.value = row
	let loading = Message.load('正在获取告警详情，请稍后...')
	try {
		const map = new Map([
			['wx_account', '微信公众号'],
			['feishu', '飞书'],
			['mail', '邮箱'],
			['sms', '短信通知'],
			['dingding', '钉钉'],
			['weixin', '企业微信'],
			['webhook', '自定义消息通道'],
		])
		const sendData = Object.entries(row.result.send_data)
		const arr = sendData.map((item: any) => {
			// 获取告警设置类型账号的id数组
			const sender = item.at(0)
			const account: any = push.value.config.find((accounts: any) => accounts.id === sender)
			return {
				result: item.at(1) === 1,
				resultMsg: item.at(1) === 1 ? '发送成功' : item.at(1),
				accounts: {
					title: map.get(account?.sender_type) || '',
					account: account?.data.title,
				},
			}
		})
		detailData.value = arr
		detailPopup.value = true
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

// 删除记录
const delRecord = async (row: any) => {
	try {
		await useConfirm({
			title: `删除记录`,
			content: `您真的要删除这条告警记录吗？`,
		})
		await useDataHandle({
			loading: '正在删除记录，请稍后...',
			request: delTaskRecord({
				task_id: props.compData.id,
				record_ids: JSON.stringify([row.id]),
			}),
			message: true,
		})
		getRecord()
	} catch (error) {
		console.log(error)
	}
}

// 获取告警记录
const getRecord = async () => {
	try {
		await useDataHandle({
			loading: tableLoading,
			request: getTaskRecordList({
				task_id: props.compData.id,
				page: tableParam.page,
				size: tableParam.size,
			}),
			success: ({ data: res }: any) => {
				tableData.value = res.data.list
				tableParam.total = res.data.count
			},
		})
	} catch (error) {
		console.log(error)
	}
}

const tableColumn = [
	{
		label: '发送时间',
		render: (row: any) => <span>{formatTime(row.create_time)}</span>,
	},
	{
		label: '发送状态',
		render: (row: any) => {
			let tip: string = row.result.stop_msg
			if (row.do_send) {
				const count: any = Object.values(row.result.send_data).reduce(
					(acc: any, item) => {
						if (typeof item === 'number' && item === 1) {
							acc.success++
						} else if (typeof item === 'string') {
							acc.fail++
						}
						return acc
					},
					{ success: 0, fail: 0 }
				)
				tip = '发送成功' + count.success + '次，发送失败' + count.fail + '次'
			}
			return h(
				ElTooltip,
				{
					popperClass: 'softTooltip',
					effect: 'light',
					enterable: false,
					placement: 'top-end',
					content: tip,
				},
				() => h('span', { class: row.do_send ? 'text-primary' : 'text-danger' }, row.do_send ? '已发送' : '未发送')
			)
		},
	},
	{
		label: '告警详情',
		render: (row: any) => (
			<span class="bt-link" onClick={() => getDetailData(row)}>
				点击查看
			</span>
		),
	},
	useOperate([{ onClick: delRecord, title: '删除' }]),
]

onMounted(() => getRecord())
</script>

<style lang="css" scoped>
.item:not(:last-child) {
	@apply mb-[2rem];
}
.title {
	@apply text-base font-bold mb-[1rem];
}
.box {
	@apply border border-light rounded-base p-[1.6rem] bg-light max-h-[20rem] overflow-y-auto;
}
.table-box {
	@apply flex justify-between p-[1rem];
}
.table-box:not(:last-child) {
	@apply border-b border-light;
}
</style>
