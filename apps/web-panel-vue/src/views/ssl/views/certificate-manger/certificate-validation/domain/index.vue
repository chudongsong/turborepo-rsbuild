<template>
	<div class="p-[16px]">
		<el-form :model="form" class="relative w-full" :label-position="`right`" size="small" @submit.native.prevent>
			<el-form-item label="验证域名" prop="dns_name">
				<el-select v-model="form.siteName" class="!w-[33rem]" filterable default-first-option size="default" placeholder="请选择验证域名">
					<el-option v-for="item in domainList" :key="item" :label="item" :value="item">
						<span style="float: left">{{ item }}</span>
					</el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { verifyTrustAsiaCret } from '@api/site'
import { useMessage } from '@/hooks/tools'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const MessageMethod = useMessage()

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})

const form = reactive<any>({
	siteName: '',
	partnerOrderId: '',
})
const domainList = ref<any>([])

const getDomainDataList = async () => {
	domainList.value = props.compData.row.domainName
	form.partnerOrderId = props.compData.row.partnerOrderId
	if (props.compData.row.domainName?.length) form.siteName = props.compData.row.domainName[0]
}

const onConfirm = async (close: () => void) => {
	if (!form.siteName) {
		MessageMethod.error('请选择验证域名')
		return
	}
	let load
	try {
		load = MessageMethod.load('正在验证证书申请状态，请稍后...')
		const { data, msg, status } = await verifyTrustAsiaCret({
			partnerOrderId: form.partnerOrderId,
			siteName: form.siteName,
		})
		MessageMethod.request({ status, msg })
		if (status) {
			init()
			close()
			if (data.stateCode === 'COMPLETED') {
				MessageMethod.success('验证成功')
				const refreshMap = {
					ssl: () => (sslIsRefresh.value = true),
					test: () => (testIsRefresh.value = true),
					encrypt: () => (encryptIsRefresh.value = true),
					other: () => (otherIsRefresh.value = true),
				} as const
				refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			} else {
				MessageMethod.success('等待CA验证中，若长时间未能成功验证，请登录官网使用DNS方式重新申请...')
			}
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

const init = () => {
	form.siteName = ''
	form.partnerOrderId = ''
}

onMounted(() => {
	getDomainDataList()
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>
