<template>
	<div class="p-[16px]">
		<el-form ref="formRef" size="small" :rules="rules" :model="form" class="relative w-full" :label-position="`right`" @submit.native.prevent>
			<el-form-item label="主机记录" prop="domain_name">
				<div class="flex items-center">
					<el-input v-model="form.domain_name" class="!w-[34rem]" placeholder="请填写域名前缀，支持多级，如：ab.cd.ef">
						<template #append>{{ form.domain }}</template>
					</el-input>
					<el-select size="small" v-model="form.record_type" class="!w-[8rem] ml-[1rem]" placeholder="请选择">
						<el-option v-for="item in typeOptions" :key="item.key" :label="item.title" :value="item.key"> </el-option>
					</el-select>
				</div>
			</el-form-item>
			<el-form-item label="记录值" prop="domain_dns_value">
				<el-input v-model="form.domain_dns_value" class="!w-[43rem]" :placeholder="placeholderTip"></el-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { domainFun } from '@api/ssl'
import { useMessage } from '@/hooks/tools'
import { getSslStore } from '@ssl/useStore'

const MessageMethod = useMessage()

const {
	refs: { isRefreshDomainList },
} = getSslStore()

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})

const emits = defineEmits(['close'])

const form = reactive<any>({
	domain_name: '',
	domain_dns_value: '',
	dns_id: '',
	record_type: 'A',
	domain: '',
})

const typeOptions = [
	{
		title: 'A',
		key: 'A',
		placeholderTip: '将域名指向IPv4地址',
	},
	{
		title: 'TXT',
		key: 'TXT',
		placeholderTip: '设置文本记录',
	},
	{
		title: 'CNAME',
		key: 'CNAME',
		placeholderTip: '将域名指向另外一个域名',
	},
	// {
	// 	title: 'MX',
	// 	key: 'MX',
	// 	placeholderTip: '如果需要设置邮箱，让邮箱能收到邮件，就需要添加MX记录。',
	// },
	{
		title: 'CAA',
		key: 'CAA',
		placeholderTip: 'CA证书颁发机构授权校验',
	},
	{
		title: 'AAAA',
		key: 'AAAA',
		placeholderTip: '用来指定主机名（或域名）对应的IPv6地址（例如：ff06:0:0:0:0:0:0:c3）记录。',
	},
]

const placeholderTip = computed(() => {
	const tip = typeOptions.find(item => item.key === form.record_type)?.placeholderTip
	return tip
})

const formRef = ref<any>(null)

const validateDomainName = (rule: any, value: string, callback: (error?: Error) => void) => {
	if (!value) {
		callback(new Error('请填写域名前缀'))
	} else {
		callback()
	}
}

const validateDomainDnsValue = (rule: any, value: string, callback: (error?: Error) => void) => {
	if (!value) {
		callback(new Error('请输入记录值'))
	} else {
		callback()
	}
}

const rules = {
	domain_name: [{ validator: validateDomainName, trigger: 'blur' }],
	domain_dns_value: [{ validator: validateDomainDnsValue, trigger: 'blur' }],
}

const init = () => {
	form.domain_name = ''
	form.domain_dns_value = ''
	form.dns_id = ''
	form.record_type = 'A'
	form.domain = ''
}

const onConfirm = async () => {
	try {
		await formRef.value.validate()
		const load = MessageMethod.load('正在解析域名，请稍候...')
		const ress = await domainFun({
			dns_id: form.dns_id,
			domain_name: `${form.domain_name}${form.domain}`,
			domain_dns_value: form.domain_dns_value,
			record_type: form.record_type,
			fun_name: 'create_dns_record',
		})
		MessageMethod.request(ress)
		load && load.close()
		if (ress.status) {
			isRefreshDomainList.value = true
			init()
			emits('close')
		}
	} catch (error) {
		console.log(error)
	}
}

onMounted(() => {
	if (props.compData.row.dns_id) {
		form.dns_id = props.compData.row.dns_id
		form.domain = `.${props.compData.row.domain}`
	}
})

defineExpose({
	onConfirm,
})
</script>

<style scoped></style>
