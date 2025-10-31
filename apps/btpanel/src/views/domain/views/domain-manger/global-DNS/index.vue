<template>
	<div class="p-[16px]">
		<bt-table-group>
			<template #header-left>
				<bt-btn-group :options="tableBtnGroup" />
			</template>
			<template #content>
				<bt-table class="soft-table" :column="tableColumn" max-height="350" :data="tableList" :description="'列表为空'" v-bt-loading="isLoading" v-bt-loading:title="'正在加载NDS验证接口列表，请稍后...'" />
			</template>
			<template #popup>
				<addNDSInterface :title="title" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import addNDSInterface from './add-NDS-interface/index.vue'
import { checkObjKey } from '@utils/index'
import { useOperate } from '@hooks/tools/table/column'
import { getDnsData, delDnsData } from '@api/ssl'
import { useDialog, useMessage } from '@/hooks/tools'
import { useConfirm } from '@hooks/tools'
import { getSslStore } from '@ssl/useStore'

const MessageMethod = useMessage()

const {
	refs: { isRefreshDomainList },
} = getSslStore()

const tableList = ref<any>([]) // 表格数据
const formParams = ref<any>({}) // 表单参数
const isLoading = ref<boolean>(false) // 是否加载
const isRefreshDNSList = ref<boolean>(false) // 是否刷新DNS列表
const isShowForm = ref<boolean>(false) // 是否显示表单
const title = shallowRef<string>('添加DNS接口')
const formRow = shallowRef<any>({}) // 编辑表单数据
const tableColumn: any = [
	{
		label: '类型',
		prop: 'dns_name',
	},
	{
		label: '账号备注',
		prop: 'ps',
	},
	useOperate([
		{
			onClick: (row: any) => {
				formRow.value = row
				useDialog({
					title: `DNS域名【${row.dns_name}】`,
					area: 50,
					component: () => import('./dns-domain/index.vue'),
					compData: {
						row,
					},
				})
			},
			title: '域名',
		},
		{
			onClick: (row: any) => {
				formRow.value = row
				title.value = `编辑【${row.dns_name}】`
				isShowForm.value = true
			},
			title: '编辑',
		},
		{
			onClick: (row: any) => {
				onDel(row)
			},
			title: '删除',
		},
	]),
] // 表格列配置

const tableBtnGroup: any = [
	{
		content: '添加DNS接口',
		active: true,
		event: () => {
			formRow.value = {}
			title.value = '添加DNS接口'
			isShowForm.value = true
		},
	},
] // 表格按钮组配置

/**
 * @description 点击删除按钮
 * @param {Object} row
 */
const onDel = async (row: any) => {
	await useConfirm({
		title: `删除【${row.dns_name}】`,
		content: '删除该验证接口，是否继续操作？',
		icon: 'warning',
	})
	try {
		const ress = await delDnsData({ dns_id: row.id })
		MessageMethod.request(ress)
		isRefreshDNSList.value = true
		isRefreshDomainList.value = true
	} catch (error) {
		console.log('error', error)
	}
}

/**
 * @description 获取DNS列表
 */
const getDnsDataList = async () => {
	isLoading.value = true
	const { data } = await getDnsData()
	const chekckObj = checkObjKey(data) // 检查对象是否存在，柯里化函数
	if (chekckObj('data')) {
		const { data: dns_list } = data
		tableList.value = dns_list
	}
	if (chekckObj('add_data')) {
		const { add_data } = data
		formParams.value = add_data
	}
	isLoading.value = false
}

watch(
	isRefreshDNSList,
	val => {
		if (val) {
			getDnsDataList()
			isRefreshDNSList.value = false
		}
	},
	{ immediate: true }
)

onMounted(() => {
	isRefreshDNSList.value = true
})

provide('isShowForm', isShowForm)
provide('formParams', formParams)
provide('isRefreshDNSList', isRefreshDNSList)
provide('formRow', formRow)
</script>

<style scoped></style>
