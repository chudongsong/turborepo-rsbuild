<template>
	<div class="p-2rem">
		<BtForm label-width="10rem" />
		<ul class="mt-[20px] leading-8 text-small list-disc ml-[2rem]" v-if="!siteInfo">
			<li>执行命令：请输入项目需要携带的参数，默认请输入执行文件名</li>
			<li>
				项目教程可参考:
				<bt-link href="https://www.bt.cn/bbs/thread-93034-1-1.html" target="_blank">
					https://www.bt.cn/bbs/thread-93034-1-1.html
					<i class="svgtofont-el-link"></i>
				</bt-link>
			</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import { useForm } from '@/hooks/tools'
import { FormButton, FormGroup, FormInput, FormInputPath, FormItemCustom, FormMore, FormSelect } from '@/hooks/tools/form/form-item'
import { fileSelectionDialog } from '@/public'
import { defaultVerify, portVerify } from '@/utils'
import { SITE_STORE } from '@site/useStore'
import { ElCheckbox, ElPopover, ElTooltip } from 'element-plus'
import { addOtherMounted, onPathFileChange, setOtherSite, userList } from '../useController'
import BtSelect from '@/components/form/bt-select'

const popoverFocus = ref(false) // 是否显示popover

const { siteInfo } = storeToRefs(SITE_STORE())
const { checkPortUseEvent } = SITE_STORE()

const { BtForm, submit } = useForm({
	data: addOtherMounted,
	options: (formData: any) => {
		return computed(() => {
			return [
				FormInputPath(
					'项目执行文件',
					'project_exe',
					{
						attrs: {
							placeholder: '请选择项目可执行文件',
							style: 'width: 32rem;',
						},
						rules: [defaultVerify({ message: '请选择项目可执行文件' })],
					},
					() => {
						onPathFileChange(formData.value.project_exe, (path: string) => {
							formData.value.project_exe = path
							let str = path.substring(path.lastIndexOf('/') + 1).replace(/\W/g, '_')
							if (!formData.value.project_name) formData.value.project_name = str
							if (!formData.value.project_ps) formData.value.project_ps = str
						})
					}
				),
				FormInput('项目名称', 'project_name', {
					attrs: {
						placeholder: '请输入项目名称',
						style: 'width: 32rem;',
						disabled: !!siteInfo.value,
						onInput: () => {
							console.log('onInput')
						},
					},
					rules: [defaultVerify({ message: '请输入项目名称' })],
				}),
				FormGroup([
					FormInput('项目端口', 'port', {
						attrs: {
							placeholder: '请输入项目的真实端口',
							style: 'width: 20rem;',
							onChange: checkPortUseEvent,
						},
						rules: [defaultVerify({ message: '请输入端口号', trigger: 'blur' }), portVerify()],
					}),
					...((siteInfo.value
						? []
						: [
								{
									type: 'custom',
									render: (formVal: any) => {
										if (!formVal.value.hasOwnProperty('release_firewall')) {
											formVal.value['release_firewall'] = false
										}
										return (
											<ElCheckbox v-model={formData.value.release_firewall} class="ml-1rem">
												<div class="flex items-center">
													<span class="!text-small">放行端口</span>
													<ElTooltip effect="dark" placement="right" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问">
														<i class="svgtofont-el-question-filled text-small ml-[4px] text-warning"></i>
													</ElTooltip>
												</div>
											</ElCheckbox>
										)
									},
								},
						  ]) as any),
				]),
				FormInput('执行命令', 'project_cmd', {
					attrs: {
						placeholder: '请输入项目的执行命令',
						style: 'width: 32rem;',
					},
					rules: [defaultVerify({ message: '请输入项目执行命令' })],
				}),
				{
					type: 'custom',
					render: (formVal: any) => {
						return (
							<BtFormItem label="运行用户">
								<div class="flex items-center">
									<div class="w-[20rem]">
										<BtSelect v-model={formData.value.run_user} options={userList.value} />
									</div>
									<div class="text-small ml-1rem">* 无特殊需求请选择www用户</div>
								</div>
							</BtFormItem>
						)
					},
				},
				{
					type: 'custom',
					render: (formVal: any) => {
						if (!formVal.value.hasOwnProperty('is_power_on')) {
							formVal.value['is_power_on'] = false
						}
						return (
							<BtFormItem label="开机启动">
								<ElCheckbox v-model={formData.value.is_power_on}>
									<span class="!text-small">是否设置开机启动</span>
								</ElCheckbox>
							</BtFormItem>
						)
					},
				},
				FormInput('项目备注', 'project_ps', {
					attrs: {
						placeholder: '输入项目备注，非必填',
						style: 'width: 32rem;',
					},
				}),
				...(siteInfo.value
					? [
							FormButton('保存配置', {
								label: ' ',
								attrs: {
									type: 'primary',
									onClick: submit,
								},
							}),
					  ]
					: [
							{
								type: 'custom',
								render: (formVal: any) => {
									if (!formVal.value.hasOwnProperty('domains')) {
										formVal.value['domains'] = ''
									}
									return (
										<BtFormItem label="绑定域名">
											<ElPopover ref="popover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="400" v-model:visible={popoverFocus.value} trigger-keys={[]} trigger="focus">
												{{
													default: () => (
														<div class="!p-[12px] bg-primary text-white">
															如需填写多个域名，请换行填写，每行一个域名，默认为80端口
															<br />
															IP地址格式：192.168.1.199
															<br />
															泛解析添加方法 *.domain.com
															<br />
															如另加端口格式为 www.domain.com:88
														</div>
													),
													reference: () => (
														<bt-input
															rows={6}
															resize="none"
															width="40rem"
															v-model={formData.value.domains}
															onFocus={() => {
																popoverFocus.value = true
															}}
															type="textarea"
															placeholder={`如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88`}
														/>
													),
												}}
											</ElPopover>
										</BtFormItem>
									)
								},
							},
					  ]),
			]
		})
	},
	submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
		await validate()
		return await setOtherSite(param.value)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
