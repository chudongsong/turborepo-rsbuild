<template>
	<div class="p-[2rem]">
		<bt-table ref="certTable" :column="tableColumn" :height="500" :data="certTableData" :description="'证书列表为空'" v-bt-loading="certLoad" v-bt-loading:title="'正在加载证书列表，请稍后...'" />
	</div>
</template>

<script lang="tsx" setup>
import { Message, useDataHandle } from '@hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { getCertInfo, getCertList } from '@/api/config'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits(['close'])

const certLoad = ref(false)
const certTableData = ref([])

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
			props.compData.onRefresh(res.data)
		},
	})
}

/**
 * @description 获取证书
 */
const getCertListEvent = async () => {
	await useDataHandle({
		loading: certLoad,
		request: getCertList(),
		data: [Array, certTableData],
	})
}

const tableColumn = [
	{
		label: '域名',
		render: (row: any) => <span>{row.info.dns.map((dns: any) => [dns, h('br')])}</span>,
	},
	{ label: '到期时间', prop: 'info.notAfter', minWidth: 100 },
	{ label: '品牌', prop: 'info.issuer', minWidth: 150 },
	{
		label: '位置',
		prop: 'cloud_id',
		minWidth: 60,
		render: (row: any) => (row.cloud_id == -1 ? '本地' : '云端'),
	},
	useOperate([{ onClick: selectCert, title: '选择' }]),
]

onMounted(() => {
	getCertListEvent()
})
</script>
