<template>
	<div class="p-[16px]">
		<el-form :model="form" class="relative w-full" :label-position="`right`" size="small" @submit.native.prevent>
			<el-form-item label="部署网站" prop="dns_name">
				<el-select v-model="form.siteName" class="!w-[33rem]" filterable default-first-option size="default" placeholder="请选择部署网站">
					<el-option v-for="item in domainList" :key="item.id" :label="item.name" :value="item.name">
						<span style="float: left">{{ item.name }}</span>
					</el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { deploySslCert, deployTestCert, deployLetsEncryptCert, getSiteList } from '@api/ssl'
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
	ssl_hash: '',
	oid: '',
	partnerOrderId: '',
	index: '',
})
const domainList = ref<any>([])

const getDomainDataList = async () => {
	const { data } = await getSiteList()
	domainList.value = data
}

const onConfirm = async (close: any) => {
	if (!form.siteName) {
		MessageMethod.error('请选择部署网站')
		return
	}
	let load
	try {
		load = MessageMethod.load('正在部署证书,请稍后...')
		const ress = await sendRequest(props.compData.row.type)
		MessageMethod.request(ress)
		if (ress.status) {
			init()
			const refreshMap = {
				ssl: () => (sslIsRefresh.value = true),
				test: () => (testIsRefresh.value = true),
				encrypt: () => (encryptIsRefresh.value = true),
				other: () => (otherIsRefresh.value = true),
			} as const
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
			close && close()
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}

/**
 * @description 根据类型发送请求
 * @param type
 *
 */
const sendRequest = async (type: string) => {
	let ress
	try {
		switch (type) {
			case '1':
				ress = await deploySslCert({
					siteName: form.siteName,
					oid: form.oid,
				})
				break
			case '2':
				ress = await deployTestCert({
					siteName: form.siteName,
					partnerOrderId: form.partnerOrderId,
				})
				break
			case '3':
				let params = {
					siteName: form.siteName,
					ssl_hash: form.ssl_hash,
					index: form.index,
				}
				if (!props.compData.row.order_status) {
					delete params.index
				} else {
					delete params.ssl_hash
				}
				ress = await deployLetsEncryptCert(params)
				break
			default:
				break
		}
	} catch (error) {
		console.log(error)
	}
	return ress
}

const init = () => {
	form.siteName = ''
	form.ssl_hash = ''
	form.oid = ''
	form.partnerOrderId = ''
	form.index = ''
}

const getInitData = (row: any) => {
	switch (row.type) {
		case '1':
			form.oid = row.oid
			break
		case '2':
			form.partnerOrderId = row.partnerOrderId
			break
		case '3':
			form.ssl_hash = row.hash
			form.index = row.index
			break
		default:
			break
	}
}

onMounted(() => {
	getDomainDataList()
	getInitData(props.compData.row)
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>
