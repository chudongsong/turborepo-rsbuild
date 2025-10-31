<template>
	<div>
		<bt-install-mask v-if="maskLayer" :showConfig="{ width: '44rem' }">
			<template #content>
				<div class="flex items-center">
					<bt-icon icon="el-warning" color="#fc6d26" :size="18" />
					<div class="whitespace-normal leading-1.8rem ml-[4px]">
						<!-- <span v-if="authType !== 'ltd'" class="flex items-center">
							当前为企业版专享功能，
							<bt-link @click="openBuyAndInstall('buy')">点击购买</bt-link>
						</span> -->
						<!-- <span v-if="!pluginStatus.nginx_status">nginx版本小于1.18，请升级版本</span> -->
						<span v-if="!pluginStatus.total_status" class="flex items-center">
							当前尚未安装监控报表插件
							<bt-link @click="openBuyAndInstall('install')" class="!text-small ml-4px">点击安装</bt-link>
						</span>
					</div>
				</div>
			</template>
		</bt-install-mask>
		<div>
			<div v-bt-loading="viewLoading" class="bg-lighter mb-[12px] flex items-center border border-dark justify-evenly p-[8px] py-[12px]">
				<div class="flex flex-col justify-center items-center">
					<span>当前流量</span>
					<span>{{ flowQuotaConfig.traffic }}</span>
				</div>
				<el-divider direction="vertical"></el-divider>
				<div class="flex flex-col justify-center items-center">
					<span>当前请求数</span>
					<span>{{ flowQuotaConfig.request }}</span>
				</div>
			</div>
			<bt-table-group>
				<template #header-left>
					<el-button type="primary" @click="addFlowQuota">添加动态检查告警</el-button>
					<el-button @click="addFlowAlarm">添加流量使用提醒</el-button>
				</template>
				<template #content>
					<BtTable :max-height="400" />
				</template>
			</bt-table-group>
			<bt-help :options="[{ content: '流量限额可设置多条规则，统计周期产生的流量/请求超过限额会告警' }]"></bt-help>
		</div>
	</div>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import BtSelect from '@/components/form/bt-select'
import { useDialog, useForm, useRefreshList, useTable } from '@/hooks/tools'
import { useOperate, useStatus } from '@/hooks/tools/table/column'
import { FormAlarmSelect } from '@/public'
import { ElAlert, ElButton } from 'element-plus'
import { isRefreshFlowList, maskLayer, onConfirmSetting, pluginStatus, viewLoading, openBuyAndInstall, getFlowQuotaConfig, flowUnitOptions, requestUnitOptions, onConfirmTotalSetting, getFlowQuotaData, deleteFlowQuotaConfig, onChangeStatus, flowQuotaConfig } from '../useController'
import { useGlobalStore } from '@/store/global'
import BtDatePicker from '@/components/form/bt-date-picker'
import { formatTime } from '@/utils'

const { payment } = useGlobalStore()
const { authType } = toRefs(payment.value)

const { BtTable } = useTable({
	request: getFlowQuotaConfig,
	columns: [
		{
			label: '类型',
			width: 80,
			render: (row: any) => {
				const typeMap = {
					monitor_traffic_attack: '动态检查',
					monitor_traffic_total: '累计限制',
					monitor_http_flood: '动态检查',
				}
				return typeMap[row.source as keyof typeof typeMap]
			},
		},
		{ label: '描述', prop: 'view_msg' },
		useStatus({
			minWidth: 100,
			event: onChangeStatus,
			data: ['停用', '正常'],
		}),
		useOperate([
			{
				title: '删除',
				onClick: deleteFlowQuotaConfig,
			},
		]),
	],
	extension: [useRefreshList(isRefreshFlowList)],
})

const addFlowQuota = () => {
	const { BtForm, submit, param } = useForm({
		data: { cycle: 5, cycle_unit: 'm', traffic: 1, traffic_unit: 'mb', request: 10, request_unit: 'kc', type: 'total', sender: [], total: 3 },
		options: (formData: any) =>
			computed(() => [
				{
					type: 'custom',
					render: () => <ElAlert title="实时检查近一段时间内的资源消耗情况，当出现超过阀值的高资源占用时，发出告警信息" type="warning" closable={false} show-icon class="!mb-[12px]"></ElAlert>,
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="周期" prop="cycle">
							<div class="flex items-center">
								<BtInput width="7rem" type="number" min="1" v-model={formData.value.cycle}></BtInput>
								<BtSelect
									class="!w-[7rem] !ml-[.4rem] !mt-[2px]"
									v-model={formData.value.cycle_unit}
									options={[
										{ label: '分钟', value: 'm' },
										{ label: '小时', value: 'h' },
									]}
								/>
							</div>
						</BtFormItem>
					),
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="阈值信息" prop={formData.value.type === 'total' ? 'traffic' : 'request'}>
							<div class="flex items-center">
								<BtSelect
									class="!w-[10rem] !mr-[.4rem] !mt-[2px]"
									v-model={formData.value.type}
									options={[
										{ value: 'total', label: '流量' },
										{ value: 'request', label: '请求数' },
									]}
									onChange={(val: any) => {
										if (val === 'total') {
											formData.value.cycle_unit = 'm'
											formData.value.traffic = 1
											formData.value.traffic_unit = 'mb'
										} else {
											formData.value.cycle_unit = 'h'
											formData.value.request = 10
											formData.value.request_unit = 'kc'
										}
									}}
								/>
								{formData.value.type === 'total' ? (
									<div class="flex items-center">
										<BtInput width="12rem" type="number" min="1" v-model={formData.value.traffic}></BtInput>
										<BtSelect class="!w-[8rem] !ml-[.4rem] !mt-[2px]" v-model={formData.value.traffic_unit} options={flowUnitOptions} />
									</div>
								) : (
									<div class="flex items-center">
										<BtInput width="12rem" type="number" min="1" v-model={formData.value.request}></BtInput>
										<BtSelect class="!w-[8rem] !ml-[.4rem] !mt-[2px]" v-model={formData.value.request_unit} options={requestUnitOptions} />
									</div>
								)}
							</div>
							<span class="text-small text-secondary">{`近${formData.value.cycle}${formData.value.cycle_unit === 'm' ? '分钟' : '小时'}内的${formData.value.type === 'total' ? '流量' : '请求数'}超过${formData.value.type === 'total' ? formData.value.traffic : formData.value.request}${
								formData.value.type === 'total' ? flowUnitOptions.find(item => item.value === formData.value.traffic_unit)?.label : requestUnitOptions.find(item => item.value === formData.value.request_unit)?.label
							}就触发告警`}</span>
						</BtFormItem>
					),
					rules: {
						traffic: [{ required: true, message: '请输入流量阈值', trigger: 'blur' }],
						request: [{ required: true, message: '请输入请求数阈值', trigger: 'blur' }],
					},
				},
				FormAlarmSelect('告警方式', 'sender', {
					attrs: {
						class: '!w-24rem',
						limit: ['sms'],
					},
					rules: {
						sender: [{ required: true, message: '请选择告警方式', trigger: 'blur' }],
					},
				}),
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="发送次数" prop="total">
							<div class="flex items-center">
								<BtInput width="12rem" type="number" min="0" v-model={formData.value.total}>
									{{
										append: '次',
									}}
								</BtInput>
								<span class="text-small text-secondary ml-[12px]">后将不再发送告警信息，无需限制次数可填0次表示不限制</span>
							</div>
						</BtFormItem>
					),
					rules: {
						total: [{ required: true, message: '请输入发送次数', trigger: 'blur' }],
					},
				},
			]),
		submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
			await validate()
			return await onConfirmSetting(param.value)
		},
	})

	useDialog({
		title: '添加动态异常告警',
		area: 60,
		component: () => (
			<div class="p-[2rem]">
				<BtForm />
			</div>
		),
		showFooter: true,
		onConfirm: submit,
	})
}

const addFlowAlarm = () => {
	const labelWidth = 100
	const { BtForm, submit, param } = useForm({
		data: { cycle: 0, traffic: 1, traffic_unit: 'mb', sender: [], total: 3 },
		options: (formData: any) =>
			computed(() => [
				{
					type: 'custom',
					render: () => <ElAlert title="监控某段时间内的流量累计使用情况，当使用量超过当前规则设置的阀值，则发出告警信息" type="warning" closable={false} show-icon class="!mb-[12px]"></ElAlert>,
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="时间段" prop="cycle" label-width={labelWidth}>
							<div>
								<BtDatePicker v-model={formData.value.cycle} value-format="X" class="date" type="date" placeholder={formData.value.cycle === 0 ? '每个自然月' : '请选择时间'} onChange={(val: any) => (formData.value.cycle = Number(val))} />
								<ElButton type="default" class="!ml-[.4rem]" onClick={() => (formData.value.cycle = 0)}>
									设为每个自然月
								</ElButton>
								{formData.value.cycle !== 0 && <span class="block text-small text-secondary">自{formatTime(formData.value.cycle, 'yyyy-MM-dd')}日起(包含该日)</span>}
							</div>
						</BtFormItem>
					),
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="流量使用量阈值" prop="traffic" label-width={labelWidth}>
							<div class="flex items-center">
								<BtInput width="12rem" type="number" min="1" v-model={formData.value.traffic}></BtInput>
								<BtSelect class="!w-[8rem] !ml-[.4rem] !mt-[2px] !mr-[12px]" v-model={formData.value.traffic_unit} options={flowUnitOptions} />
							</div>
							<span class="block text-small text-secondary">{`每个自然月的流量累计超过${formData.value.traffic}${flowUnitOptions.find(item => item.value === formData.value.traffic_unit)?.label}就触发告警`}</span>
						</BtFormItem>
					),
					rules: {
						traffic: [{ required: true, message: '请输入流量阈值', trigger: 'blur' }],
					},
				},
				FormAlarmSelect('告警方式', 'sender', {
					attrs: {
						class: '!w-24rem',
						limit: ['sms'],
						labelWidth: labelWidth,
					},
					rules: {
						sender: [{ required: true, message: '请选择告警方式', trigger: 'blur' }],
					},
				}),
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="发送次数" prop="total" label-width={labelWidth}>
							<div class="flex items-center">
								<BtInput width="12rem" type="number" min="0" v-model={formData.value.total}>
									{{
										append: '次',
									}}
								</BtInput>
								<span class="text-small text-secondary ml-[12px]">后将不再发送告警信息，无需限制次数可填0次表示不限制</span>
							</div>
						</BtFormItem>
					),
					rules: {
						total: [{ required: true, message: '请输入发送次数', trigger: 'blur' }],
					},
				},
			]),
		submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
			await validate()
			return await onConfirmTotalSetting(param.value)
		},
	})
	useDialog({
		title: '添加流量使用提醒',
		area: 60,
		component: () => (
			<div class="p-[2rem]">
				<BtForm />
			</div>
		),
		showFooter: true,
		onConfirm: submit,
	})
}

onMounted(() => {
	getFlowQuotaData()
})
</script>

<style scoped></style>
