<template>
	<div class="flex flex-col">
		<div v-if="siteInfo?.project_config?.java_type === 'springboot'" class="flex h-3.2rem items-center mb-1rem">
			<span class="inline-block mr-[1rem]">控制台日志</span>
			<el-checkbox slot="reference" v-model="nohup_log" @change="changeNohupLog"></el-checkbox>
		</div>
		<div class="flex items-center">
			<div v-if="logData.isGunicorn">
				<span>日志级别</span>
				<el-select class="mx-[8px] w-[10rem]" v-model="logData.type">
					<el-option label="debug" value="debug"></el-option>
					<el-option label="info" value="info"></el-option>
					<el-option label="warning" value="warning"></el-option>
					<el-option label="error" value="error"></el-option>
					<el-option label="critical" value="critical"></el-option>
				</el-select>
			</div>
			<span class="mr-[8px]">日志路径</span>
			<bt-input-icon v-model="logData.path" icon="el-folder-opened" @icon-click="onPathChange" width="38rem" />
			<el-button class="ml-[8px]" type="primary" @click="savePath">保存</el-button>
		</div>

		<template v-if="siteType !== 'java'">
			<div class="mt-[16px] flex items-center">
				<span class="mr-[8px]">日志大小</span>
				<span>{{ logData.size }}</span>
			</div>

			<div class="mt-[16px] flex items-center">
				<el-popover placement="bottom" width="200" popper-class="green-tips-popover" trigger="hover">
					<span class="p-[8px] inline-block">当日志文件过大时，读取和搜索时间会增加，同时也会占用存储空间，因此需要对日志进行切割以方便管理和维护。</span>
					<template #reference>
						<el-checkbox v-model="logData.split" size="small" @change="changeSplitEvent">日志切割</el-checkbox>
					</template>
				</el-popover>

				<span class="ml-[8px]"> {{ tips }}<span class="bt-link" @click="openConfigEvent">编辑配置</span> </span>
			</div>

			<ul class="mt-[16px] leading-8 text-small list-disc ml-[20px]" v-if="siteType === 'java'">
				<li>修改日志路径会重启项目</li>
				<li>Tomcat内置项目，修改日志路径会对当前版本Tomcat的所有站点生效，不能单独设置</li>
			</ul>
		</template>

		<div class="mt-[16px]">
			<div v-if="siteType === 'java'" class="mb-[16px]">
				<el-button @click="getLogsInfo">刷新日志</el-button>
				<el-button type="default" @click="openRealTimeLogsEvent">实时日志</el-button>
				<el-divider direction="vertical"></el-divider>
				<el-button type="default" @click="logInfoPopup = true">日志切割设置</el-button>
			</div>

			<bt-log
				:content="logData.logs"
				:isHtml="true"
				:fullScreen="{
					title: `全屏查看【项目】日志`,
					onRefresh: getLogsInfo,
				}"
				:style="{ height: siteType === 'java' ? '46rem' : '54rem', width: '99.5%' }" />
		</div>
		<bt-dialog title="查看日志" @cancel="cancelRealLogsEvent" v-model="fullLogPopup" :area="['100%', '100%']" :close-btn="2">
			<div class="bg-[#333] text-white w-full h-full" :style="`height: ${mainHeight}px;`">
				<pre class="p-[12px] w-full flex items-start overflow-y-auto h-full">
					<code class="flex-1 w-full p-0 bg-none whitespace-pre-line text-i text-[#ececec]" v-html="logData.logs"></code>
				</pre>
			</div>
		</bt-dialog>
		<bt-dialog title="日志切割设置" v-model="logInfoPopup" :area="56">
			<div class="p-2rem">
				<div class="flex items-center">
					<span class="mr-[8px]">日志大小</span>
					<span>{{ logData.size }}</span>
				</div>

				<div class="mt-[16px] flex items-center">
					<el-popover placement="bottom" width="200" popper-class="green-tips-popover" trigger="hover">
						<span class="p-[8px] inline-block">当日志文件过大时，读取和搜索时间会增加，同时也会占用存储空间，因此需要对日志进行切割以方便管理和维护。</span>
						<template #reference>
							<el-checkbox v-model="logData.split" size="small" @change="changeSplitEvent">日志切割</el-checkbox>
						</template>
					</el-popover>
					<span class="ml-[8px]"
						>{{ tips.replace('修改请点击', '修改下面配置') }}
						<!-- <bt-link @click="openConfig">编辑配置</bt-link> -->
					</span>
				</div>
				<el-divider></el-divider>
				<div class="py-20x">
					<BtForm class="py-2rem -ml-1rem" />
				</div>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import BtLog from '@/components/extension/bt-log/index.vue'
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import { useDialog, useForm } from '@/hooks/tools'
import { FormInputAppend } from '@/hooks/tools/form/form-item'
import { fileSelectionDialog } from '@/public/popup'
import { defaultVerify } from '@/utils'
import type { LogDataProps } from '@site/types.d'
import { useSiteStore } from '@site/useStore'
import { ElCheckbox } from 'element-plus'
import { logInfoPopup, nohup_log, changeNohupLog, fullLogPopup, logData, tips, getLogsInfo, savePath, changeSplitEvent, initLog, getLogsSplit, openRealTimeLogsEvent, saveSplitTask, cancelRealLogsEvent } from './useController'
import { useGlobalStore } from '@/store/global'

const { mainHeight } = useGlobalStore()

const { siteType, siteInfo } = useSiteStore()

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: logData.path,
		change: (path: string) => {
			logData.path = path
		},
	})
}
const { BtForm, submit } = useForm({
	data: async () => {
		const { data } = await getLogsSplit()
		return data
	},
	options: (formData: Ref<any>) => {
		return computed(() => {
			return [
				{
					type: 'radio',
					label: '切割方式',
					key: 'type',
					options: [
						{ label: '按日志大小', value: '1' },
						{ label: '按执行周期', value: '0' },
					],
				},
				...(formData.value.type === '0'
					? [
							{
								type: 'custom',
								render: () => (
									<BtFormItem label="执行时间">
										<div class="flex items-center">
											<BtInput width="18.6rem" v-model={formData.value.hour}>
												{{
													prepend: '每天',
													append: '时',
												}}
											</BtInput>
											<BtInput width="12rem" v-model={formData.value.minute}>
												{{
													append: '分',
												}}
											</BtInput>
										</div>
									</BtFormItem>
								),
								rules: {
									hour: [
										{
											validator: (rule: any, value: any, callback: any) => {
												if (formData.value.type === '0' && !/^(?:[01]?[0-9]|2[0-3])$/.test(value)) {
													callback(new Error('请输入0-23的整数'))
												} else {
													callback()
												}
											},
											trigger: ['blur', 'change'],
										},
									],
									minute: [
										{
											validator: (rule: any, value: any, callback: any) => {
												if (formData.value.type === '0' && !/^[0-5]?[0-9]$/.test(value)) {
													callback(new Error('请输入0-59的整数'))
												} else {
													callback()
												}
											},
											trigger: ['blur', 'change'],
										},
									],
								},
							},
					  ]
					: [
							FormInputAppend('日志大小', 'log_size', 'MB', {
								attrs: {
									style: 'width: 24rem;',
								},
								rules: [
									{ required: true, message: '请输入日志大小', trigger: ['blur', 'change'] },
									{
										validator: (rule: any, value: any, callback: any) => {
											//	大于0的数
											if (!/^\d+(\.\d+)?$/.test(value) || value <= 0) {
												callback(new Error('请输入大于0的数'))
											} else {
												callback()
											}
										},
										trigger: ['blur', 'change'],
									},
								],
							}),
					  ]),
				{
					type: 'custom',
					render: () => (
						<BtFormItem label="保留最新" prop="num">
							<BtInput type="number" v-model={formData.value.num} class="!w-[24rem]">
								{{
									append: '份',
								}}
							</BtInput>
						</BtFormItem>
					),
					rules: {
						num: [
							defaultVerify({ message: '请输入保留最新份数' }),
							{
								validator: (rule: any, value: any, callback: any) => {
									// 1-1800的整数
									if (!/^(?:[1-9]\d{0,2}|1[01]\d{2}|1800)$/.test(value)) {
										callback(new Error('请输入1-1800的整数'))
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
						<BtFormItem label=" ">
							<ElCheckbox v-model={formData.value.compress}>切割后压缩日志</ElCheckbox>
						</BtFormItem>
					),
				},
				...(siteType.value === 'java'
					? [
							{
								type: 'button',
								label: ' ',
								slots: '保存',
								attrs: {
									type: 'primary',
									onClick: () => {
										submit()
									},
								},
							},
					  ]
					: []),
				{
					type: 'help',
					options: [...(formData.value.type === '1' ? [{ content: '每5分钟执行一次' }, { content: '【日志大小】：日志文件大小超过指定大小时进行切割日志文件' }] : []), { content: '【保留最新】：保留最新的日志文件，超过指定数量时，将自动删除旧的日志文件' }],
				},
			]
		})
	},
	submit: async (param: Ref<T>, validate: any) => {
		await validate()
		return await saveSplitTask(param.value)
	},
})

/**
 * @description: 打开日志切割配置
 */
const openConfigEvent = () => {
	useDialog({
		title: `配置日志切割任务`,
		area: 50,
		showFooter: true,
		component: () => <BtForm class="p-2rem" />,
		onConfirm: submit,
	})
}

onMounted(initLog)

defineExpose({ init: initLog })
</script>
