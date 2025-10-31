<template>
	<div class="min-h-[30rem]">
		<bt-install-mask v-if="!firewallInfo.init_status" width="38rem">
			<template #content>
				<InitFirewall />
			</template>
		</bt-install-mask>
		<bt-table-group v-if="payment.authType === 'ltd'">
			<template #header-left>
				<div class="flex items-center text-secondary">
					自动封禁开关
					<el-switch v-model="autoBanned" class="mx-[0.8rem]" @change="changeAutoBanned"></el-switch>
					封禁总数: {{ bannedTotal }}
					<el-button @click="clearIpEvent" class="mx-[0.8rem]">清空</el-button>

					<span>系统将于每日{{ runtime }}自动同步IP情报库</span>
					<el-divider direction="vertical"></el-divider>
					<span class="mr-[8px]">封禁时间：{{ ban_time }}</span>
					<el-button @click="timePopup = true">修改</el-button>
				</div>
			</template>
			<template #header-right>
				<bt-input-search class="!w-[32rem]" v-model="searchValue" @search="getIpBannedList()" placeholder="请输入恶意IP地址" />
			</template>
			<template #content>
				<bt-table ref="ipTableRef" :column="tableColumn" :data="tableData" v-bt-loading="tableLoading" :description="'恶意IP列表为空'" v-bt-loading:title="'正在加载IP列表，请稍后...'"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="ipTableRef" :options="TableBatchOptions" />
			</template>
			<template #footer-right>
				<bt-table-page ref="ipRulesPager" :total="completedTotal" v-model:page="tableParam.p" v-model:row="tableParam.limit" @change="getIpBannedList()" name="ip" />
			</template>

			<template #popup>
				<bt-dialog title="设置封禁时间" v-model="timePopup" :area="42" @confirm="setTimeValue" showFooter>
					<div class="p-[2rem]">
						<div class="flex items-center">
							设置封禁时间:
							<el-input v-model="timeValue" class="mx-[0.8rem] !w-[26rem]" placeholder="请输入要修改的封禁时间"></el-input>
						</div>

						<bt-help :options="[{ content: '0为永久封禁' }, { content: '修改后下一次运行生效' }]" class="mt-[1rem]"></bt-help>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-product-introduce v-else :data="productData" class="px-[20%] py-[2rem]"></bt-product-introduce>
	</div>
</template>
<script lang="tsx" setup>
import type { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'

import { getIpBannedData, clearIpBannedData, delIpBannedData, changeIpBannedData, getIpBannedStatus, setBannedTimeApi } from '@/api/firewall'
import { productPaymentDialog } from '@/public/index'
import { renderIconTip, useBatchEvent } from '@firewall/useMethod'
import { useGlobalStore } from '@store/global'

import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { Message, useDataHandle, useDataPage } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import InitFirewall from '@firewall/views/system-firewall/init-firewall/index.vue'
import { getFirewallStore } from '@/views/firewall/useStore'

const { payment } = useGlobalStore()
const {
	refs: { systemTabActive, firewallInfo },
} = getFirewallStore()

const ipTableRef = ref<any>(null) // 表格ref
const tableData = ref<any>([]) //列表数据
const searchValue = ref<string>('') // 搜索
const completedTotal = ref(0) // 总条数
const runtime = ref('--') // 运行时间

const ban_time = ref('--') // 封禁时间
const timeValue = ref(0) // 时间值
const timePopup = ref(false) // 时间弹窗

const tableLoading = ref<boolean>(false) // 加载状态
const tableParam = reactive({ p: 1, limit: 20 }) // 表格接口请求

const autoBanned = ref<boolean>(false) // 自动封禁开关
const bannedTotal = ref<number>(0) // 封禁总数

const productData = {
	title: '恶意IP自动封禁-功能介绍',
	ps: '从宝塔官网获取最新的恶意IP名单，与访问本机的IP做对比，将吻合的恶意IP全部IP加入黑名单，黑名单将从系统防火墙(网络层)隔离，黑名单内的恶意IP将无法访问任何端口、服务，大大提升本机的安全性。',
	source: 362,
	desc: ['每天自动更新最新恶意IP', '全自动管理', '防入侵', '准确性高'],
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/firewall/malicious.png',
		},
	],
}

/**
 * @description 切换列表页面
 * @param {number} p 当前页码
 */
const getIpBannedList = async () => {
	if (systemTabActive.value !== 'banned') return
	getBannedStatus()
	await useDataHandle({
		loading: tableLoading,
		request: getIpBannedData({
			data: JSON.stringify({
				...tableParam,
				query: searchValue.value,
			}),
		}),
		data: {
			data: [Array, tableData],
			page: useDataPage(completedTotal),
		},
		success: (res: any) => {
			console.log(res)
		},
	})
}

const getBannedStatus = async () => {
	try {
		const { data: res } = await getIpBannedStatus()
		console.log(res, '222222')
		if (res.status) {
			autoBanned.value = res.data.status
			bannedTotal.value = res.data.ip_count || 0
			runtime.value = res.data.runtime || '--'
			ban_time.value = res.data.bantime
			timeValue.value = ban_time.value === '永久封禁' ? 0 : Number(ban_time.value.replace('天', ''))
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 清空恶意IP列表
 */
const clearIpEvent = async () => {
	await useConfirm({
		icon: 'warning',
		title: '清空恶意IP',
		content: '将清空所有恶意IP，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在清空恶意IP列表，请稍后...',
		request: clearIpBannedData(),
		message: true,
		success: getIpBannedList,
	})
}

/**
 * @description 删除ip规则
 * @param {any} data ip规则行数据
 */
const deleteEvent = async (data: any) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '删除恶意IP【' + data.address + '】',
		content: '删除选中的IP后，该IP将不再被监控，是否继续操作？',
	})

	await useDataHandle({
		loading: '正在删除恶意IP，请稍后...',
		request: delIpBannedData({ data: JSON.stringify({ id: data.id, address: data.address }) }),
		message: true,
		success: getIpBannedList,
	})
}

/**
 * @description 切换自动封禁开关s
 * @param val
 */
const changeAutoBanned = async (val: any) => {
	try {
		autoBanned.value = !val
		await useConfirm({
			icon: 'warning',
			title: '自动封禁开关提示',
			content: `${val ? '开启' : '关闭'}自动封禁功能后，系统将${val ? '会' : '不会'}运行封禁恶意IP，是否继续操作？`,
		})
		const res: any = await useDataHandle({
			loading: `正在${val ? '开启' : '关闭'}自动封禁功能，请稍后...`,
			request: changeIpBannedData({ data: JSON.stringify({ status: val ? 1 : 0 }) }),
			message: true,
			success: getIpBannedData,
		})
		res.status && (autoBanned.value = val)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 修改封禁时间
 */
const setTimeValue = async () => {
	//不可输入非数字，不可输入负数+小数点
	const reg = /^[1-9]\d*$|^0$/
	if (!reg.test(timeValue.value.toString())) {
		Message.error('请输入正确的封禁时间')
		return false
	}
	try {
		await useDataHandle({
			loading: '正在设置封禁时间，请稍后...',
			request: setBannedTimeApi(Number(timeValue.value)),
			message: true,
			success: getIpBannedList,
		})
		timePopup.value = false
	} catch (error) {
		console.log(error)
	}
}

const TableBatchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any, index: number) => {
				return await delIpBannedData({ data: JSON.stringify({ id: item.id, address: item.address }) })
			}
			await useBatchEvent(batchConfirm, nextAll, requestHandle, { label: '恶意IP地址', prop: 'address' }, getIpBannedList)
		},
	},
]

const tableColumn = [
	useCheckbox({ key: 'id' }),
	{ label: 'IP地址', prop: 'address', width: 120 },
	{
		label: 'IP归属地',
		render: (row: any) => {
			if (payment.value.authType != 'ltd') {
				return (
					<span class="bt-link" onClick={() => productPaymentDialog({ sourceId: 362 })}>
						点击查看
					</span>
				)
			}
			return <span>{(row.area.continent || '') + (row.area.info || '--')}</span>
		},
	},
	{
		label: '时间',
		prop: 'addtime',
		renderHeader: () => renderIconTip('添加时间', `封禁时间:${ban_time.value}`),
	},
	useOperate([{ onClick: deleteEvent, title: '删除' }]),
]

// 页面加载完成
onMounted(getIpBannedList)
</script>

<style lang="css" scoped>
/* :deep(.el-radio-button__inner) {
	padding: 8px 16px !important;
} */
</style>
