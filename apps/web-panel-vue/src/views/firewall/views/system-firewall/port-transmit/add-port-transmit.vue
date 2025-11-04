<template>
	<!-- 添加修改端口规则表单 -->
	<el-form ref="editIpRulesRef" :rules="rules" :model="ruleForm" class="p-[2rem] addfrom">
		<el-form-item label="协议">
			<bt-select v-model="ruleForm.protocol" :options="protocolOptions" class="!w-[24rem]" />
		</el-form-item>
		<el-form-item :label="'源端口'" prop="s_ports">
			<bt-input v-model="ruleForm.s_ports" type="number" min="1" max="65535" width="24rem" :placeholder="'请输入源端口'" />
		</el-form-item>
		<el-form-item :label="'目标IP'">
			<bt-input v-model="ruleForm.d_address" width="24rem" :placeholder="'请输入目标IP地址'" clearable />
		</el-form-item>
		<el-form-item :label="'目标端口'" prop="d_ports">
			<bt-input v-model="ruleForm.d_ports" width="24rem" :placeholder="'请输入目标端口'" clearable />
		</el-form-item>
		<el-form-item :label="'备注'">
			<el-input v-model="ruleForm.brief" class="!w-[24rem] special-input" placeholder="可为空" clearable></el-input>
		</el-form-item>
		<bt-help :options="helpList" listStyle="disc" class="pl-[3.6rem] pt-[2rem]"></bt-help>
	</el-form>
</template>
<script lang="ts" setup>
import { editForwardRules, setForwardRules } from '@/api/firewall'
import { getFirewallInfoEvent, getFirewallStatus } from '@firewall/useMethod'
import { useDataHandle } from '@hooks/tools'
import { checkPort } from '@utils/index'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const editIpRulesRef = ref() // 表单ref

// 表单数据
const ruleForm = ref<any>({
	protocol: props.compData.Protocol ? props.compData.Protocol.toLowerCase() : 'tcp',
	s_ports: props.compData.S_Port ? props.compData.S_Port : '',
	d_ports: props.compData.T_Port ? props.compData.T_Port : '',
	d_address: props.compData.T_Address ? props.compData.T_Address : '',
	id: props.compData.id ? props.compData.id : '',
	brief: props.compData.brief ? props.compData.brief : '',
})

const helpList = [{ content: '如果是本机端口转发，目标IP为：127.0.0.1' }, { content: '如果目标IP不填写，默认则为本机端口转发!' }]

const protocolOptions = [
	{ label: 'TCP', value: 'tcp' },
	{ label: 'UDP', value: 'udp' },
]

const isEdit = ref(props.compData.id ? true : false)

// 校验规则
const rules = {
	s_ports: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length > 0) {
					if (!checkPort(value)) callback(new Error('端口格式错误，可用范围：1-65535'))
					callback()
				}
				callback(new Error('请输入源端口'))
			},
			trigger: ['blur', 'change'],
			required: true,
		},
	],
	d_ports: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length > 0) {
					if (!checkPort(value)) callback(new Error('端口格式错误，可用范围：1-65535'))
					callback()
				}
				callback(new Error('请输入目标端口'))
			},
			trigger: ['blur', 'change'],
			required: true,
		},
	],
}

/**
 * @description: 提交表单
 */
const onConfirm = async (close: Function) => {
	await editIpRulesRef.value.validate()
	const data = {
		operation: 'add',
		protocol: ruleForm.value.protocol,
		S_Port: ruleForm.value.s_ports,
		T_Port: ruleForm.value.d_ports,
		T_Address: ruleForm.value.d_address,
		brief: ruleForm.value.brief,
		id: ruleForm.value.id,
	}
	if (!isEdit.value) delete data.id
	if (data.T_Address == '') data.T_Address = '127.0.0.1'

	await useDataHandle({
		loading: '正在设置端口转发，请稍后...',
		request: isEdit.value
			? editForwardRules({
					new_data: JSON.stringify(data),
					old_data: JSON.stringify(props.compData),
			  })
			: setForwardRules(data),
		message: true,
	})
	props.compData.refreshFn()
	close()
	getFirewallStatus()
	getFirewallInfoEvent()
}
onMounted(() => {
	const val = props.compData
	isEdit.value = val.id !== undefined ? true : false
	ruleForm.value.protocol = val.Protocol ? val.Protocol.toLowerCase() : 'tcp'
	ruleForm.value.s_ports = val.S_Port ? val.S_Port : ''
	ruleForm.value.d_ports = val.T_Port ? val.T_Port : ''
	ruleForm.value.d_address = val.T_Address ? val.T_Address : ''
	ruleForm.value.id = val.id ? val.id : ''
})

defineExpose({ onConfirm })
</script>
