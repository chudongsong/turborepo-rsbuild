<template>
	<div class="p-[2rem]">
		<bt-table ref="certTable" :column="tableColumn" :max-height="400" :data="certTableData.list" :description="'证书列表为空'" v-bt-loading="certTableData.loading" v-bt-loading:title="'正在加载证书列表，请稍后...'" />
	</div>
</template>

<script lang="ts" setup>
import { getCertList } from '@api/global'
import { getCertInfo } from '@/api/docker'
import { Message } from '@hooks/tools/message'
import { useDataHandle } from '@hooks/tools/data'
import { useOperate } from '@hooks/tools/table/column'

interface Props {
	compData?: any
}
const certTableData = reactive({
	list: [],
	loading: false,
})

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const { selectdCert } = props.compData

const emit = defineEmits(['close'])

const selectCert = async (row: any) => {
	useDataHandle({
		loading: '正在选择证书，请稍候...',
		request: getCertInfo({ cert_name: row.subject }),
		success: (res: any) => {
			if (!res.status) {
				Message.error(res.msg)
				return false
			} else {
				selectdCert(res.data)
				emit('close')
			}
		},
	})
}

const getCertListData = async () => {
	useDataHandle({
		loading: toRef(certTableData, 'loading'),
		request: getCertList(),
		data: [Array, toRef(certTableData, 'list')],
	})
}

const tableColumn = [{ label: '域名', render: (row: any) => row.dns.join(',') }, { label: '到期时间', prop: 'not_after', minWidth: 100 }, { label: '品牌', prop: 'info.issuer', minWidth: 100 }, useOperate([{ onClick: selectCert, title: '选择' }])]

onMounted(getCertListData)
</script>
