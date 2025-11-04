<template>
	<div class="p-[2rem]">
		<bt-table ref="certTable" :column="tableColumn" :data="tableData" :description="'证书列表为空'" v-bt-loading="tableLoad" v-bt-loading:title="'正在加载证书列表，请稍后...'" />
	</div>
</template>

<script lang="ts" setup>
import { getCertInfo, getCertList } from '@/api/config'
import { useOperate } from '@hooks/tools/table/column'
import { useDataHandle } from '@hooks/tools'
import { Message } from '@hooks/tools'

interface Props {
	compData: any
}

const props = defineProps<Props>()

const emit = defineEmits(['close'])

const tableLoad = ref(false)
const tableData = ref([])

/**
 * @description 获取证书列表
 */
const getCertListData = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getCertList(),
		data: [Array, tableData],
	})
}

/**
 *	@description 选择证书
 */
const selectCert = async (data: any) => {
	const res = await useDataHandle({
		loading: '正在选择证书，请稍候...',
		request: getCertInfo({ ssl_id: data.id, ssl_hash: data.hash }),
		success: (res: any) => {
			if (res.msg) {
				return Message.error(res.msg)
			}
			Message.success('选择成功')
			emit('close')
			props.compData.refreshData(res.data)
		},
	})
}

const tableColumn = [
	{ label: '域名', render: (row: any) => row.info.dns.map((dns: any) => [dns, h('br')]) },
	{ label: '到期时间', minWidth: 100, render: (row: any) => h('span', [row.info.notAfter]) },
	{ label: '品牌', prop: 'info.issuer', minWidth: 150 },
	{ label: '位置', minWidth: 60, render: (row: any) => (row.cloud_id == -1 ? '本地' : '云端') },
	useOperate([{ onClick: selectCert, title: '选择' }]),
]

onMounted(() => getCertListData())
</script>
