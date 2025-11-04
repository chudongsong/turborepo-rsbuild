<template>
	<!-- 添加修改端口规则表单 -->
	<el-form ref="editIpRulesRef" :rules="rules" :disabled="formDisabled" :model="ruleForm" class="p-[2rem] addfrom">
		<el-form-item label="IP" prop="address">
			<bt-input type="textarea" v-model="ruleForm.address" width="24rem" resize="none" :rows="4" :placeholder="'请输入IP地址'" :disabled="props.compData.selectOptions ? true : false" clearable />
		</el-form-item>

		<el-form-item :label="'策略'">
			<el-select v-model="ruleForm.types" class="!w-[24rem]">
				<el-option label="放行" value="accept"></el-option>
				<el-option label="禁止" value="drop"></el-option>
			</el-select>
		</el-form-item>

		<el-form-item label="方向">
			<el-select v-model="ruleForm.chain" class="!w-[24rem]" @change="changeChainValue">
				<el-option label="入站(默认)" value="INPUT"></el-option>
				<el-option label="出站" value="OUTPUT"></el-option>
			</el-select>
		</el-form-item>

		<!-- <el-form-item label="区域" v-if="firewallInfo.type === 'firewalld' && ruleForm.chain === 'INPUT'">
			<el-select v-model="ruleForm.zone" class="!w-[24rem]">
				<el-option label="public(默认)" value="public"></el-option>
				<el-option label="trusted" value="trusted"></el-option>
			</el-select>
		</el-form-item> -->

		<el-form-item :label="'备注'">
			<bt-input v-model="ruleForm.brief" width="24rem" :placeholder="'可为空'" clearable />
		</el-form-item>

		<ul class="pl-[4.4rem] pt-[2.4rem] leading-8 text-small list-disc">
			<li>支持添加IP：如果添加多个IP请用","隔开</li>
			<li>支持添加IP段,如：192.168.0.0/24</li>
			<li>支持添加IP范围,格式如：192.168.1.xx-192.168.1.xx，暂不支持跨网段范围</li>
			<li v-if="firewallInfo.type === 'firewalld'">区域：非专业人士请勿修改，建议使用public</li>
			<li>此操作将重载防火墙，未持久化的 iptables 规则会清空，请先备份保存！</li>
		</ul>
	</el-form>
</template>
<script lang="ts" setup>
import { getFirewallStore } from '@firewall/useStore'
import { useDataHandle } from '@hooks/tools/data'
import { getFirewallInfoEvent, getFirewallStatus } from '@/views/firewall/useMethod'
import { setIpRules, editIpRules } from '@/api/firewall'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const {
	refs: { firewallInfo }, // 防火墙信息
} = getFirewallStore()

// 表单数据
const ruleForm = ref<any>({
	types: 'accept',
	brief: '',
	address: '',
	id: '',
	chain: 'INPUT',
	family: 'ipv4',
	zone: 'public',
})

const editIpRulesRef = ref() // 表单ref

const rules = {
	address: [{ trigger: ['blur', 'change'], required: true, message: '请输入指定IP' }],
} // 校验规则

/**
 * @description: 提交表单
 */
const onConfirm = async (close: Function) => {
	await editIpRulesRef.value.validate()
	const params = {
		...ruleForm.value,
		operation: 'add',
		strategy: ruleForm.value.types,
	}
	if (!props.compData.isEdit) delete params.id
	await useDataHandle({
		loading: '正在设置IP规则，请稍后...',
		request: props.compData.isEdit
			? editIpRules({
					new_data: JSON.stringify(params),
					old_data: JSON.stringify(props.compData),
			  })
			: setIpRules(params),
		message: true,
		success: () => {
			props.compData.refreshFn()
			getFirewallStatus()
			getFirewallInfoEvent()
			close()
		},
	})
}

/**
 * @description 修改方向
 * @param val 方向值
 */
const changeChainValue = (val: string) => {
	if (val === 'INPUT') ruleForm.value.zone = 'public'
}

onMounted(() => {
	if (props.compData.isEdit) {
		Object.assign(ruleForm.value, {
			types: props.compData.Strategy,
			brief: props.compData.brief,
			chain: props.compData.Chain,
			address: props.compData.Address,
			domain: props.compData.domain,
			id: props.compData.id || '',
			zone: props.compData.Zone || 'public',
		})
	}
})

defineExpose({ onConfirm: onConfirm })
</script>
