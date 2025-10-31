<template>
	<el-form ref="editPortRulesRef" :rules="rules" :model="ruleForm" class="p-[2rem] addfrom">
		<el-form-item label="协议">
			<bt-select v-model="ruleForm.protocol" class="!w-[24rem]" :options="protocolOptions" />
		</el-form-item>
		<el-form-item label="端口" prop="port">
			<bt-input v-model="ruleForm.port" width="24rem" placeholder="请输入端口" :disabled="isEdit" @input="onInputPort" />
		</el-form-item>
		<el-form-item label="来源">
			<el-select v-model="ruleForm.choose" @change="chooseChange" class="!w-[24rem]">
				<el-option v-for="(item, index) in chooseOptions" :key="index" :label="item.title" :value="item.key"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item v-if="ruleForm.choose === 'point'" label="指定IP" prop="address">
			<bt-input type="textarea" :rows="3" width="24rem" v-model="ruleForm.address" :placeholder="formPromptMessages.ports" clearable />
		</el-form-item>
		<!-- <el-form-item v-if="authType === 'ltd' && ruleForm.choose === 'domain'" label="指定域名" prop="domain">
			<bt-tooltip content="指定域名，将在下个版本下架，如有疑问，请咨询客服" :effect="'light'">
				<bt-input type="textarea" :rows="3" v-model="ruleForm.domain" width="24rem" :placeholder="formPromptMessages.domain" clearable />
			</bt-tooltip>
		</el-form-item> -->
		<el-form-item label="策略">
			<el-select v-model="ruleForm.types" class="!w-[24rem]">
				<el-option v-for="(item, index) in typesOptions" :key="index" :label="item.title" :value="item.key"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item label="方向">
			<el-select v-model="ruleForm.chain" class="!w-[24rem]">
				<el-option v-for="item in directOptions" :key="item.key" :label="item.title" :value="item.key"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item label="备注">
			<el-input v-model="ruleForm.brief" class="!w-[24rem] special-input" clearable placeholder="请填写备注，可为空"></el-input>
		</el-form-item>

		<bt-help :options="helpList" listStyle="disc" class="pl-[6rem] pt-[1.2rem]"></bt-help>

		<bt-dialog title="指定域名-功能介绍" :area="60" v-model="ltdPayShow">
			<bt-product-introduce :data="productData" class="p-4rem"></bt-product-introduce>
		</bt-dialog>
	</el-form>
</template>
<script lang="ts" setup>
import { addPortRules, editPortRules } from '@/api/firewall'
import { getFirewallInfoEvent, getFirewallStatus } from '@/views/firewall/useMethod'
import { useDataHandle } from '@hooks/tools'
import { useGlobalStore } from '@store/global'
import { validatePort } from '@utils/index'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})
const { payment } = useGlobalStore()

const { authType } = payment.value

const ltdPayShow = ref(false) // 付费购买弹窗
const editPortRulesRef = ref<any>() // 表单ref
const isEdit = shallowRef(props.compData.isEdit) // 是否编辑

const productData = {
	title: '指定域名-功能介绍',
	ps: '系统防火墙将会放行/阻止设置域名所解析的A/AAAA记录',
	source: 106,
	desc: ['放行/阻止域名解析记录'],
	tabImgs: [
		{
			title: '防火墙禁止端口',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/specify_domain_1.png',
		},
		{
			title: '域名解析已生效',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/specify_domain_2.png',
		},
		{
			title: '设置效果',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/firewall/specify_domain_3.png',
		},
	],
}

// 表单数据
const ruleForm = reactive<any>({
	protocol: 'tcp',
	port: '',
	choose: 'all',
	types: 'accept',
	brief: '',
	address: '',
	domain: '',
	chain: 'INPUT',
})

const helpList = [{ content: '支持添加多个端口，如：80,88' }, { content: '支持添加多个端口范围，如：80,88,90-99,110-120' }, { content: '默认配置下防火墙无法管理Docker容器端口' }, { content: '此操作将重载防火墙，未持久化的 iptables 规则会清空，请先备份保存！' }]
const directOptions = [
	{ title: '入站(默认)', key: 'INPUT' },
	{ title: '出站', key: 'OUTPUT' },
]

// 表单提示语
const formPromptMessages = {
	ports: `请输入指定IP，多个IP请用,隔开或换行。例如192.168.1.1,192.168.1.2`,
	domain: `请输入指定域名。例如www.bt.cn`,
}

const protocolOptions = [
	{ label: 'TCP', value: 'tcp' },
	{ label: 'UDP', value: 'udp' },
	{ label: 'TCP/UDP', value: 'all' },
]

const chooseOptions = [
	{ title: '所有IP', key: 'all' },
	{ title: '指定IP', key: 'point' },
	// { title: '指定域名 -- 企业版专享', key: 'domain' },
]

const typesOptions = [
	{ title: '放行', key: 'accept' },
	{ title: '禁止', key: 'drop' },
]

// 校验规则
const rules = {
	port: [{ validator: validatePort, trigger: ['blur'], required: true }],
	address: [{ trigger: ['blur', 'change'], required: true, message: '请输入指定IP' }],
	domain: [{ trigger: ['blur', 'change'], required: true, message: '请输入指定域名' }],
}

/**
 * @description: 设置协议
 */
const setProtocol = (val: string) => (ruleForm.protocol = val)

const onInputPort = (val: any) => {
	try {
		// 不允许输入英文+中文，输入了直接替换掉
		const reg = /[^0-9,-]/g
		ruleForm.port = val.replace(reg, '')
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 选择来源
 */
const chooseChange = (val: string) => {
	editPortRulesRef.value.clearValidate()
	if (authType !== 'ltd' && val === 'domain') {
		ruleForm.choose = 'all'
		ltdPayShow.value = true // 打开付费购买弹窗
		return
	} else {
		ruleForm.choose = val
	}
}

/**
 * @description: 处理参数
 */
const handelParams = () => {
	const params = { ...ruleForm, operation: 'add', strategy: ruleForm.types }
	if (params.choose === 'all') delete params.address
	if (!params.brief) params.brief = ''
	if (isEdit.value) params['id'] = props.compData.id

	if (isEdit.value) {
		const old = { ...props.compData }
		if (old.noNps) delete old.noNps
		return { old_data: JSON.stringify(old), new_data: JSON.stringify(params) }
	} else {
		return params
	}
}

/**
 * @description: 提交表单
 */
const onConfirm = async (close: Function) => {
	await editPortRulesRef.value.validate()
	const params = await handelParams()
	const isDomain = ruleForm.choose === 'domain'
	await useDataHandle({
		loading: '正在提交，请稍后...',
		message: true,
		request: isEdit.value ? editPortRules(params, isDomain) : addPortRules(params, isDomain),
		success: (res: any) => {
			if (res.status) {
				close()
			}
		},
	})
	props.compData.refreshFn()
	await getFirewallInfoEvent()
	getFirewallStatus()
	if (!isEdit.value) openNps()
}

/**
 * @description 打开NPS弹窗
 */
const openNps = () => {
	// // 判断是否有不弹出选项
	// if (props.compData?.noNps) return
	// const endtime = Number(localStorage.getItem('NPS-TIME'))
	// const expArr: any = localStorage.getItem('NPS-EXP') || []
	// if (endtime < new Date().getTime() && !expArr.includes(32)) {
	// 	useDialog({
	// 		title: false,
	// 		area: 36,
	// 		component: () => import('@public/BtExperienceNps/index.vue'),
	// 		modal: false,
	// 		compData: {
	// 			name: '安全',
	// 			type: 32,
	// 		},
	// 	})
	// }
}

onMounted(() => {
	ruleForm.port = props.compData?.port || ''
	if (props.compData.isEdit) {
		const address = props.compData?.Address === 'all'
		Object.assign(ruleForm, {
			protocol: props.compData.Protocol,
			port: props.compData.Port,
			types: props.compData.Strategy,
			brief: props.compData.brief,
			chain: props.compData.Chain,
			address: address ? '' : props.compData.Address,
			domain: props.compData.domain,
		})
		ruleForm.choose = address ? 'all' : props.compData.domain === '' ? 'point' : 'domain'
	}
})

defineExpose({ onConfirm })
</script>

<style lang="css" scoped>
:deep(.special-input .el-input__inner) {
	padding-right: 3rem !important;
}
</style>
