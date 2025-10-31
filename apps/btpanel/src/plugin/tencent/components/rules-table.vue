<template>
	<div>
		<el-button v-if="isLighthouse" type="default" class="!mr-[1rem]" @click="openFirewallRules">轻量云防火墙规则</el-button>
		<BtDialog v-model="isRirewallRules" title="轻量云防火墙规则" :area="[80]">
			<div class="p-2rem">
				<BtTableGroup>
					<template #header-left>
						<el-button type="primary" @click="openAddRules()">添加规则</el-button>
					</template>
					<template #header-right> </template>
					<template #content>
						<BtTable ref="ftpTable" v-bt-loading:title="'正在加载轻量云防火墙规则列表，请稍后...'" v-bt-loading="isLoading" :column="tableColumn" :data="tableData" :description="'列表为空'" :max-height="360" />
					</template>
				</BtTableGroup>
			</div>
		</BtDialog>
		<BtDialog v-model="isAddRules" title="添加轻量云防火墙规则" :show-footer="true" :area="[48]" @confirm="addRulesEvent">
			<el-form ref="addRulesformRef" class="p-2rem" :model="form" :rules="rules">
				<el-form-item label="端口" prop="Port">
					<BtInput v-model="form.Port" width="30rem" :disabled="isHasData" placeholder="端口范围1到65535之间，支持端口放行范围80-90" />
				</el-form-item>
				<el-form-item label="协议" prop="Protocol">
					<ElSelect v-model="form.Protocol" class="!w-[30rem]">
						<ElOption v-for="item in protocolOptions" :key="item.value" :label="item.label" :value="item.value" />
					</ElSelect>
				</el-form-item>
				<el-form-item label="允许访问IP">
					<BtInput v-model="form.CidrBlock" width="30rem" :disabled="isHasData" placeholder="默认为空，表示所有来源，支持IP网段，可为空" />
				</el-form-item>
				<el-form-item label="备注" prop="ps">
					<BtInput v-model="form.ps" :rows="4" type="textarea" width="30rem" placeholder="备注和说明，可为空" />
				</el-form-item>
				<el-form-item label="">
					<ul class="pl-[4rem] list-disc text-secondary leading-[2.4rem] text-small">
						<li>支持添加多个端口，如：80,88</li>
						<li>支持添加多个端口范围，如：80,88,90-99,110-120</li>
					</ul>
				</el-form-item>
			</el-form>
		</BtDialog>
	</div>
</template>

<script setup lang="tsx">
import { setInstance, getTencentCloudPorts, delTencentRule, getLocalLighthouse, addTencentRule, getTencentInfo } from '../api'
import { tencentDataG, tencentCVM } from '../store'

interface Props {
	dependencies: AnyObject
}

const props: any = withDefaults(defineProps<Props>(), {
	dependencies: () => ({}),
})

// eslint-disable-next-line vue/no-setup-props-destructure, @typescript-eslint/naming-convention
const { BtDialog, ElButton, BtTable, BtInput, BtTableGroup, ElTooltip, ElForm, ElFormItem, ElSelect, ElOption } = unref(props.dependencies.components)
// eslint-disable-next-line vue/no-setup-props-destructure
const { useAxios: instance, useMessage, useConfirm, useDialog } = unref(props.dependencies.hooks)
const { setPortConfig, useOperate, portsPs } = unref(props.dependencies.custom)

const protocolOptions = [
	{
		label: 'TCP',
		value: 'tcp',
	},
	{
		label: 'UDP',
		value: 'udp',
	},
]

const Message = useMessage()

const isLighthouse = ref<boolean>(false)

const isRirewallRules = ref<boolean>(false) // 防火墙规则
const isLoading = ref<boolean>(false)
const tableData = ref<any>([])

const isAddRules = ref<boolean>(false) // 添加规则
const isHasData = ref<boolean>(false) // 是否有数据
const addRulesformRef = ref<any>()
const form = reactive({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Port: '',
	// eslint-disable-next-line @typescript-eslint/naming-convention
	CidrBlock: '',
	ps: '',
	Protocol: '',
})
const isError = ref<boolean>(false) // 获取规则是否错误
const isNoCorrelation = ref<boolean>(false) // 是否关联密钥

const rules = reactive({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	Port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
	ps: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value && value?.length > 60) {
					callback(new Error('备注不能超过60个字符'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
})

const useTableColumn = () => {
	return ref<any[]>([
		{
			label: '应用类型',
			prop: 'AppType',
		},
		{
			label: '来源',
			prop: 'CidrBlock',
		},
		{
			label: '协议',
			prop: 'Protocol',
			width: 150,
		},
		{
			label: '端口',
			prop: 'Port',
			width: 120,
		},
		{
			label: '策略',
			prop: 'Action',
			width: 60,
			render: (row: any) => {
				const action = row.Action === 'ACCEPT'
				return <span class={action ? 'text-primary' : 'text-danger'}>{action ? '允许' : '拒绝'}</span>
			},
		},
		useOperate([
			{
				onClick: deleteEvent,
				isHide: () => {
					return tableData.value.length === 1
				},
				title: '删除',
			},
		]),
	])
}

/**
 * @description 删除规则
 * @param row
 */
const deleteEvent = async (row: any) => {
	await useConfirm({
		icon: 'warning',
		title: '删除防火墙规则',
		content: '删除后可能导致服务无法访问，是否继续操作？',
	})
	try {
		const loadT = Message.load('正在删除防火墙规则，请稍后...')
		const params: any = row
		delete params.FirewallRuleDescription
		const res = await delTencentRule(params)
		loadT.close()
		Message.request(res)
		if (res.status) getRulesList()
	} catch (error) {
		console.log(error)
	}
}

const openFirewallRules = () => {
	if (isError.value || isNoCorrelation.value) {
		// 密钥错误 或 没有关联密钥
		tencentCloudDialog()
		return
	}
	isRirewallRules.value = true
	getRulesList()
}

/**
 * @description 获取规则列表
 */
const getRulesList = async () => {
	isError.value = false
	try {
		isLoading.value = true
		const res = await getTencentCloudPorts()
		isNoCorrelation.value = !Array.isArray(res.data.FirewallRuleSet) // 没有FirewallRuleSet字段 说明没关联密钥
		tableData.value = Array.isArray(res.data.FirewallRuleSet) ? res.data.FirewallRuleSet : []
	} catch (error) {
		console.log(error)
		isError.value = true // 密钥错误
	} finally {
		isLoading.value = false
	}
}

/**
 * @description 获取本地轻量云检测
 */
const tencentCheck = async () => {
	try {
		const { data } = await getTencentInfo()
		if (data?.status === false && data?.msg) {
			isNoCorrelation.value = true
		}
		const { data: data2 } = await getLocalLighthouse()
		if (data2?.server_type === 'lighthouse') {
			isLighthouse.value = true
		}
		tencentDataG.value = data2
		tencentCVM.value = data2.server_type === 'cvm'
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 渲染图标提示
 * @param label
 * @param tips
 * @param icon
 */
const renderIconTip = (label: string, tips: string, icon?: string) => {
	return (
		<div>
			<span>{label}</span>
			<ElTooltip content={tips} placement="top">
				<span class="ml-4x bt-ico-ask">{icon || '?'}</span>
			</ElTooltip>
		</div>
	)
}

/**
 * @description 获取端口配置
 */
const getPortConfig = (isSuccess?: boolean) => {
	return {
		label: '端口', // 用户名
		prop: 'Port',
		renderHeader: () => renderIconTip('端口', '防火墙会加载系统所有端口信息，IPV6端口无法与IPV4分开管理，非必要勿删除IPV6端口'),
		width: 300,
		render: (row: any) => {
			row.brief = row.brief || portsPs[row.Port]
			const specialArr = ['20', '21', '22', '80', '443', '8888', '3306']
			const isFirewall = tableData.value.some((item: any) => item.Port === row.Port)
			const isSpecial = specialArr.includes(row.Port) // 是否是特殊端口
			return (
				<div>
					<span class={'mr-[1rem]'}>{row.Port + (row.Family === 'ipv6' ? '（ipv6）' : '')}</span>
					{!isFirewall && !isSpecial && (isSuccess !== false) ? (
						<span
							class="bt-link cursor-pointer"
							onClick={() => {
								openAddRules({
									// eslint-disable-next-line @typescript-eslint/naming-convention
									Port: row.Port,
									// eslint-disable-next-line @typescript-eslint/naming-convention
									CidrBlock: row.Address !== 'all' ? row.Address : '',
									ps: row.brief?.substring(0, 60),
									Protocol: row.Protocol,
								})
							}}>
							点击放行，腾讯云轻量云防火墙端口
						</span>
					) : (
						''
					)}
				</div>
			)
		},
	}
}

/**
 * @description 添加规则
 */
const openAddRules = (row?: any) => {
	console.log(isError.value, isNoCorrelation.value)
	if (isError.value || isNoCorrelation.value) {
		// 密钥错误 或 没有关联密钥
		tencentCloudDialog()
		return
	}
	clearForm()
	isHasData.value = !!row
	if (row) Object.assign(form, row)
	isAddRules.value = true
}

/**
 * @description 腾讯云API配置
 */
const tencentCloudDialog = (data?: any) => {
	data = data || {}
	data.alert = isError.value ? '当前密钥错误，请重新关联API密钥' : ''
	useDialog({
		isAsync: true,
		component: () => import('./config.vue'),
		title: false,
		area: [48],
		compData: {
			...data,
			dependencies: props.dependencies,
		},
	})
}

/**
 * @description 添加规则
 */
const addRulesEvent = async () => {
	try {
		await addRulesformRef.value.validate()
		const loadT = Message.load('正在添加防火墙规则，请稍后...')
		const params = {
			...form,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Protocol: form.Protocol || 'tcp',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			ActionType: 'ACCEPT',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			CidrBlock: form.CidrBlock || '0.0.0.0/0',
		}
		const res = await addTencentRule(params)
		loadT.close()
		Message.request(res)
		if (res.status) {
			isAddRules.value = false // 关闭添加弹窗
			getRulesList() // 获取防火墙规则列表
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 清空表单
 */
const clearForm = () => {
	form.Port = ''
	form.CidrBlock = ''
	form.ps = ''
	form.Protocol = 'tcp'
}

const tableColumn = useTableColumn()

onMounted(async () => {
	try {
	setInstance(instance) // 设置axios实例
	await tencentCheck() // 本地轻量云检测
	if(!isLighthouse.value){
		setPortConfig(getPortConfig(false)) // 设置防火墙端口配置
		return
	}
	await getRulesList() // 获取防火墙规则列表
	setPortConfig(getPortConfig()) // 设置防火墙端口配置
	} catch (error) {
		setPortConfig(getPortConfig(false)) // 设置防火墙端口配置
		isLighthouse.value = false
		console.log(error)
	}
})

defineExpose({
	getPortConfig,
})
</script>

<style scoped></style>
