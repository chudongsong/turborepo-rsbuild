<template>
	<div class="p-2rem">
		<el-form :model="form" class="relative w-full" :label-position="`right`" size="small" @submit.native.prevent>
			<el-form-item label="验证类型" prop="dns_name" class="!m-0">
				<el-select v-model="form.dns_id" class="!w-[33rem]" filterable default-first-option size="default" placeholder="请选择验证类型">
					<template #empty>
						<p class="el-select-dropdown__empty">
							<span>暂无数据，请先添加DNS接口</span>
							<bt-link class="!text-base" @click="addDns">>>添加</bt-link>
						</p>
					</template>
					<el-option v-for="item in dnsList" :key="item.id" :label="item.dns_name" :value="item.id">
						<span style="float: left">{{ item.dns_name }}</span>
						<span class="ml-[1rem]" style="float: right; color: var(--el-base-tertiary); font-size: var(--el-font-size-base)">{{ item.ps }}</span>
					</el-option>
					<el-option label="更多类型" value="none" disabled>
						<p>
							<span>更多类型，请添加DNS接口</span>
							<bt-link class="!text-base" @click="addDns">>>添加</bt-link>
						</p>
					</el-option>
				</el-select>
			</el-form-item>
		</el-form>
		<add-NDS-interface title="添加NDS接口" />
	</div>
</template>

<script setup lang="ts">
import { getDnsData, setDomainDNS } from '@api/ssl'
import { useMessage } from '@/hooks/tools'
import { getSslStore } from '@ssl/useStore'
import { dnsSettingDialog } from '../useMethod'
import addNDSInterface from '../global-DNS/add-NDS-interface/index.vue'

const MessageMethod = useMessage()
const {
	refs: { isRefreshDomainList, isRefreshDomainConfigList },
} = getSslStore()

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})

const emits = defineEmits(['close'])

const form = reactive<any>({
	dns_id: '',
	ids: [],
})
const dnsList = ref<any>([])

const getDnsDataList = async () => {
	const { data } = await getDnsData()
	const { data: dns_list } = data
	dnsList.value = dns_list
}

const onConfirm = async () => {
	if (!form.dns_id) {
		MessageMethod.error('请选择验证类型')
		return
	}
	try {
		const ress = await setDomainDNS({
			dns_id: form.dns_id,
			ids: JSON.stringify(form.ids),
		})
		MessageMethod.request(ress)
		if (ress.status) {
			init()
			if (props.compData.row.domain_id || props.compData?.rowList?.some((item: any) => item.domain_id)) {
				isRefreshDomainConfigList.value = true
			}
			if (props.compData.row.id || props.compData?.rowList?.some((item: any) => item.id)) {
				isRefreshDomainList.value = true
			}
			emits('close')
		}
	} catch (error) {
		console.log(error)
	}
}

const init = () => {
	form.dns_id = ''
	form.ids = []
}

const addDns = () => {
	emits('close')
	dnsSettingDialog()
}

onMounted(() => {
	getDnsDataList()
	// 初始化数据
	if (props.compData.row.id) {
		if (props.compData.row?.dns) {
			form.dns_id = props.compData.row.dns.id
		}
		form.ids.push(props.compData.row.id)
	}
	if (props.compData.row.domain_id) {
		form.ids.push(props.compData.row.domain_id)
	}
	if (props.compData?.rowList && props.compData?.rowList?.length) {
		form.ids = []
		props.compData.rowList.forEach((item: any) => {
			form.ids.push(item.id)
			if (item.domain_id) form.ids.push(item.domain_id)
		})
	}
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>
