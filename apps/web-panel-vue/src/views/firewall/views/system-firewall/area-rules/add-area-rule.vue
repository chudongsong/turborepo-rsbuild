<template>
	<el-form ref="editAreaRulesRef" :model="ruleForm" :rules="rules" class="p-[2rem] addfrom">
		<el-form-item :label="'策略'">
			<el-select v-model="ruleForm.types" class="!w-[24rem]">
				<el-option label="屏蔽" value="drop"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item :label="'端口'">
			<el-select v-model="ruleForm.choose" class="!w-[24rem]">
				<el-option v-for="item in chooseOptions" :key="item.key" :label="item.title" :value="item.key"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item v-if="ruleForm.choose === 'point'" :label="'指定端口'" prop="ports">
			<bt-input v-model="ruleForm.ports" type="number" min="1" max="65535" width="24rem" :placeholder="'请输入指定端口'" />
		</el-form-item>
		<el-form-item :label="'地区'" prop="country">
			<el-select v-model="ruleForm.country" v-bt-loading="selectLoad" class="!w-[24rem]" :multiple="!compData.id" :filterable="!compData.id" :collapse-tags="!compData.id">
				<el-option v-for="item in countryList" :key="item.brief" :label="item.CH" :value="item.CH"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item label=" " v-if="!compData.id">
			<el-checkbox v-model="ruleForm.is_update">更新IP池</el-checkbox>
		</el-form-item>
		<ul class="mt-20px leading-8 text-small list-disc ml-24px">
			<li>地区规则中IP数量较多，添加时可能耗时较长</li>
			<li v-if="!compData.id">勾选【更新IP池】会从云端获取指定地区近1个月最新的IP池</li>
			<li>添加【除中国之外】或多个地区时，可能会导致系统防火墙占用高，添加完成后会恢复</li>
			<li>此操作将重载防火墙，未持久化的 iptables 规则会清空，请先备份保存！</li>
		</ul>
	</el-form>
</template>
<script lang="ts" setup>
import { checkPort } from '@utils/index'
import { useDataHandle } from '@hooks/tools'
import { getCountryOptions, modifyCountry, createCountry } from '@/api/firewall'
import { getFirewallInfoEvent, getFirewallStatus } from '@/views/firewall/useMethod'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const editAreaRulesRef = ref() // 表单ref
const selectLoad = ref(false) // 下拉加载状态
const countryList = ref<any>([]) //地区列表

const ruleForm = ref<any>({
	country: ['美国'],
	brief: '',
	types: 'drop',
	ports: '',
	choose: 'all',
	is_update: false, // 是否更新IP池
})

const chooseOptions = [
	{ title: '所有端口', key: 'all' },
	{ title: '指定端口', key: 'point' },
] // 选择来源

const rules = {
	country: [{ required: true, message: '请选择国家或地区', trigger: 'change' }],
	ports: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length > 0) {
					if (!checkPort(value)) callback(new Error('端口格式错误，可用范围：1-65535'))
					callback()
				}
				callback(new Error('请输入源端口'))
			},
			trigger: ['input'],
		},
	],
}

/**
 * @description: 提交表单
 */
const onConfirm = async (close: Function) => {
	await editAreaRulesRef.value.validate()
	let params = { ...ruleForm.value }
	const isEdit = props.compData.isEdit
	if (isEdit) {
		params.id = props.compData.id
		params.addtime = props.compData.addtime
		params.country = ruleForm.value.country
		params.brief = countryList.value.find((item: any) => item.CH === ruleForm.value.country).brief
	}
	if (ruleForm.value.choose === 'all') params.ports = ''
	params = { data: JSON.stringify(params) }
	await useDataHandle({
		loading: '正在设置规则，请稍后...',
		request: isEdit ? modifyCountry(params) : createCountry(params),
		message: true,
	})
	close()
	props.compData.refreshFn()
	getFirewallInfoEvent()
	getFirewallStatus()
}

/**
 * @description: 获取地区列表
 */
const getCountryList = async () => {
	await useDataHandle({
		loading: selectLoad,
		request: getCountryOptions(),
		data: [Array, countryList],
	})
}

onMounted(() => {
	getCountryList()
	if (props.compData.isEdit) {
		const row = props.compData
		Object.assign(ruleForm.value, {
			country: row.country,
			brief: row.brief,
			types: row.types,
			ports: row.ports,
			choose: row.ports ? 'point' : 'all',
		})
	}
})

defineExpose({ onConfirm })
</script>
