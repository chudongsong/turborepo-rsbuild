<template>
	<div class="p-[1.5rem]">
		<el-form class="mb-[2rem]">
			<el-form-item label="验证方式">
				<bt-select v-model="form.dcvMethod" :change="handleMethod" :options="verifyTypeOptions" class="!w-[36rem]" />
			</el-form-item>
		</el-form>

		<bt-help :list="helpList" list-style="disc" class="ml-[2rem] mt-[1.2rem]"></bt-help>
	</div>
</template>
<script setup lang="ts">
interface Props {
	compData: {
		type: string
		oid: number
		certType: number
		pid: number
	}
}
import { editAgainVerify } from '@api/site'
import { verifyBusCert, busCertVerifyWayDialog } from '@ssl/views/certificate-manger/useMethod'
import { useMessage } from '@/hooks/tools'

const MessageMethod = useMessage()

const verifyTypeOptions = ref([
	{ label: '文件验证(HTTP)', key: 'HTTP_CSR_HASH', value: 'HTTP_CSR_HASH' },
	{ label: '文件验证(HTTPS)', key: 'HTTPS_CSR_HASH', value: 'HTTPS_CSR_HASH' },
	{
		label: 'DNS验证(CNAME解析)',
		key: 'CNAME_CSR_HASH',
		value: 'CNAME_CSR_HASH',
	},
])
const props = withDefaults(defineProps<Props>(), {})
const popupClose = inject<any>('popupClose')

const helpList = ref([
	{
		text: '文件验证（HTTP）：确保网站能够通过http正常访问',
	},
	{
		text: '文件验证（HTTPS）：确保网站已开启https，并且网站能够通过https正常访问',
	},
	{
		useHtml: true,
		content: 'DNS验证：需要手动解析DNS记录值</li><li style="color:red">注意：20分钟内仅允许更换一次，频繁更换会延长申请时间',
	},
]) // 帮助列表
const form = reactive({
	dcvMethod: 'HTTP_CSR_HASH',
})
// 设置权限
const handleMethod = (val: string) => {
	form.dcvMethod = val
}

const onConfirm = async () => {
	let load = null
	try {
		load = MessageMethod.load('正在更改验证方式，请稍后...')
		const { data } = await editAgainVerify({
			oid: props.compData.oid,
			dcvMethod: form.dcvMethod,
		})
		if (data.status) {
			popupClose()
			certVerifyWay(props.compData.oid)
		}
		MessageMethod.request(data)
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
	}
}
/**
 * @description 验证域名
 * @param oid 域名订单id
 */
const certVerifyWay = async (oid: number) => {
	const { data: certVerifyInfo, status }: any = await verifyBusCert(oid,props.compData.certType,props.compData.pid)
	if (status) busCertVerifyWayDialog({...certVerifyInfo,certType:props.compData.certType,cert_ssl_type:props.compData.certType,pid:props.compData.pid})
}
defineExpose({
	onConfirm,
})
</script>
