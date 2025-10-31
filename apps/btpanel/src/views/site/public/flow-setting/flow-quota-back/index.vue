<template>
	<div>
		<bt-install-mask v-if="maskLayer || (!pluginStatus.buy_status && authType !== 'ltd')" :showConfig="{ width: '44rem' }">
			<template #content>
				<div class="flex items-center">
					<bt-icon icon="el-warning" color="#fc6d26" :size="18" />
					<div class="whitespace-normal leading-1.8rem ml-[4px]">
						<span v-if="authType !== 'ltd' && !pluginStatus.buy_status" class="flex items-center">
							当前为企业版专享功能，
							<bt-link @click="openBuyAndInstall('buy')">点击购买</bt-link>
						</span>
						<span v-if="!pluginStatus.nginx_status">nginx版本小于1.18，请升级版本</span>
						<span v-if="!pluginStatus.total_status" class="flex items-center">
							当前尚未安装监控报表插件或版本小于7.6.0，
							<bt-link @click="openBuyAndInstall('install')" class="!text-base">点击安装</bt-link>
						</span>
					</div>
				</div>
			</template>
		</bt-install-mask>
		<div>
			<BtAlert title="流量限额可设置多条规则，统计周期产生的流量/请求超过限额会告警" type="warning" :closable="false" show-icon></BtAlert>
			<div v-bt-loading="viewLoading" class="bg-[#FAFAFA] my-[20px] flex items-center border border-[#ddd] justify-evenly p-[8px] py-[12px]">
				<div class="flex flex-col justify-center items-center">
					<span>当前流量</span>
					<span>{{ totalForm.length }}</span>
				</div>
				<el-divider direction="vertical"></el-divider>
				<div class="flex flex-col justify-center items-center">
					<span>当前请求数</span>
					<span>{{ totalForm.request }}</span>
				</div>
			</div>
			<bt-table-group>
				<template #header-left>
					<el-button type="primary" @click="openLimitView">添加流量限额配置</el-button>
				</template>
				<template #content>
					<BtTable />
					<!-- <bt-table :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" /> -->
				</template>
			</bt-table-group>
		</div>
	</div>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import BtSelect from '@/components/form/bt-select'
import { useDialog, useForm, useRefreshList, useTable } from '@/hooks/tools'
import { useOperate, useStatus } from '@/hooks/tools/table/column'
import { FormAlarmOldSelect } from '@/public'
import { ElAlert } from 'element-plus'
import { changeStatusEvent, deleteEvent, getPluginMessage, isRefreshFlowList, maskLayer, momentOptions, onConfirmSetting, pluginStatus, totalForm, totalOptions, viewLoading, openBuyAndInstall } from '../useController'
import { useGlobalStore } from '@/store/global'

const { payment } = useGlobalStore()
const { authType } = toRefs(payment.value)

const { BtTable } = useTable({
	request: getPluginMessage,
	columns: [
		{ label: '类型', prop: 'rule_type', width: 80 },
		{
			label: '限额阈值',
			render: (row: any) => {
				return h('span', [row.limit_value.replace('frequency', '次')])
			},
		},
		{ label: '周期', prop: 'time_period' },
		{ label: '策略', prop: 'rule', width: 240, showOverflowTooltip: true },
		useStatus({ prop: 'limit_status', event: changeStatusEvent }),
		useOperate([
			{
				title: '删除',
				onClick: deleteEvent,
			},
		]),
	],
	extension: [useRefreshList(isRefreshFlowList)],
})

const openLimitView = () => {
	const timeValue = computed(() => {
		let value = param.value.time_period
		if (param.value.rule_type === 'moment') {
			momentOptions.forEach((item: any) => {
				if (item.value === value) {
					value = item.label
				}
			})
		} else {
			totalOptions.forEach((item: any) => {
				if (item.value === value) {
					value = item.label
				}
			})
		}
		return value
	})
	const { BtForm, submit, param } = useForm({
		data: { rule_type: 'moment', time_period: '10m', limit_unit: 'MB', limit_value: 100, threshold_percentage: 60, limit_action: 'alert', module: [], cycle: 3, type: 'total' },
		options: (formData: any) =>
			computed(() => [
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="限额">
							<div class="flex items-center">
								<BtSelect
									class="!w-[10rem]"
									v-model={formData.value.type}
									options={[
										{ value: 'total', label: '流量' },
										{ value: 'request', label: '请求数' },
									]}
								/>
								<BtFormItem prop="limit_value" label="">
									<BtInput type="number" width="10rem" class="mx-[12px]" v-model={formData.value.limit_value} />
								</BtFormItem>
								{formData.value.type === 'request' ? (
									<span class="text-secondary text-small">次数</span>
								) : (
									<BtSelect
										class="unit-select !w-[8rem]"
										v-model={formData.value.limit_unit}
										options={[
											{ value: 'GB', label: 'GB' },
											{ value: 'MB', label: 'MB' },
										]}
									/>
								)}
							</div>
						</BtFormItem>
					),
					rules: {
						limit_value: [{ required: true, message: '请输入限额阈值', trigger: 'blur' }],
					},
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="类型">
							<div class="flex flex-col">
								<div class="flex items-center">
									<el-radio-group v-model={formData.value.rule_type}>
										<el-radio value="moment">实时{formData.value.type === 'total' ? '流量' : '请求数'}</el-radio>
										<el-radio value="total">累计{formData.value.type === 'total' ? '流量' : '请求数'}</el-radio>
									</el-radio-group>
								</div>
								<span class="text-small text-secondary">
									当前网站运行
									{formData.value.rule_type === 'moment' ? '实时' : '累计'}
									{formData.value.type === 'total' ? '流量' : '请求数'}
								</span>
							</div>
						</BtFormItem>
					),
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="周期">
							<div class="flex items-center">
								<BtSelect class="!w-[12rem] mr-[12px]" v-model={formData.value.time_period} options={formData.value.rule_type === 'moment' ? momentOptions : totalOptions} />
								<span class="text-small text-secondary">
									检测{timeValue.value}内的
									{formData.value.rule_type === 'moment' ? '实时' : '累计'}
									{formData.value.type === 'total' ? '流量' : '请求情况'}
								</span>
							</div>
						</BtFormItem>
					),
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="策略">
							<div class="flex items-center">
								<BtFormItem label="" prop="threshold_percentage">
									<BtInput v-model={formData.value.threshold_percentage} type="number" width="12rem" class="mr-[12px]">
										{{
											append: '%',
										}}
									</BtInput>
								</BtFormItem>
								<BtSelect
									class="!w-[15rem]"
									v-model={formData.value.limit_action}
									options={[
										{ label: '告警', value: 'alert' },
										{ label: '告警并停止网站', value: 'alert_stop' },
									]}
								/>
							</div>
							<span class="text-small text-secondary">
								当访问【{formData.value.type === 'total' ? '流量' : '请求次数'}
								】超过限额阈值【{formData.value.threshold_percentage}%】时【
								{formData.value.limit_action === 'alert' ? '告警' : '告警并停止网站'}】
							</span>
						</BtFormItem>
					),
					rules: {
						threshold_percentage: [
							{ required: true, message: '请输入阈值百分比', trigger: 'blur' },
							{
								validator: (rule: any, value: any, callback: any) => {
									if (value < 1 || !Number.isInteger(parseFloat(value))) {
										callback(new Error('阈值百分比不能小于1'))
									} else {
										callback()
									}
								},
								trigger: ['blur', 'change'],
							},
						],
					},
				},
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="发送次数" prop="cycle">
							<div class="flex items-center">
								<BtInput width="12rem" type="number" min="1" v-model={formData.value.cycle}>
									{{
										append: '次',
									}}
								</BtInput>
								<span class="text-small text-secondary ml-[12px]">后将不再发送告警信息，如需发送多次请填写2次以上</span>
							</div>
						</BtFormItem>
					),
					rules: {
						cycle: [{ required: true, message: '请输入发送次数', trigger: 'blur' }],
					},
				},
				FormAlarmOldSelect('告警方式', 'module', {
					rules: {
						module: [{ required: true, message: '请选择告警方式', trigger: 'blur' }],
					},
				}),
			]),
		submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
			await validate()
			return await onConfirmSetting(param.value)
		},
	})

	useDialog({
		title: '添加流量限额配置',
		area: 60,
		component: () => (
			<div class="p-[2rem]">
				<ElAlert title="通过设置流量限额，可以限制在特定时间段内允许网络传输的数据量" type="warning" closable={false} show-icon></ElAlert>
				<BtForm class="!mt-[12px]" />
			</div>
		),
		showFooter: true,
		onConfirm: submit,
	})
}
</script>

<style scoped></style>
