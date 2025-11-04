<template>
	<BtForm class="p-2rem" />
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import { useForm } from '@/hooks/tools'
import { FormInputPath } from '@/hooks/tools/form/form-item'
import { useGlobalStore } from '@/store/global'
import { defaultVerify, domainPortVerify, getRandomChart } from '@/utils'
import { ElPopover } from 'element-plus'
import { addHtmlSite, onPathChange } from '../useController'

const popoverFocus = ref(false) // 是否显示popover

const { panel } = useGlobalStore()
const { sitePath } = toRefs(panel.value)

const defaultPathValue = computed(() => {
	if (sitePath.value) {
		return (sitePath.value + '/')?.replace(/\/\//g, '/')
	} else {
		return '/www/wwwroot/'
	}
})

const addSiteForm = ref({
	webname: '',
	path: '/www/wwwroot',
	ftp: false,
	ps: '',
	port: 80,
	ftp_username: '',
	ftp_password: '',
})

const { BtForm, submit } = useForm({
	data: addSiteForm.value,
	options: (formData: any) => {
		return computed(() => {
			if (!formData.value.hasOwnProperty('ftp')) formData.value.ftp = false
			return [
				{
					type: 'custom',
					render: (formVal: any) => {
						if (!formVal.value.hasOwnProperty('webname')) formVal.value['webname'] = ''
						return (
							<BtFormItem label="绑定域名" prop="webname">
								<ElPopover ref="popover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="370" v-model:visible={popoverFocus.value} trigger-keys={[]} trigger="focus">
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
											<BtInput
												rows={6}
												resize="none"
												width="42rem"
												v-model={formData.value.webname}
												onInput={(val: any) => {
													// formData.value.webname = val
													if (typeof val !== 'string') return
													formData.value.ps = val.split('\n')[0]
													formData.value.path = defaultPathValue.value?.replace(/\/\//g, '/') + val.split('\n')[0]?.replace(/:/g, '_')?.trim()
													formData.value.ftp_username = val.split('\n')[0]?.toString()?.replace(/\W/g, '_').substring(0, 16)
													formData.value.ftp_password = getRandomChart(12)
												}}
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
					key: 'webname',
					rules: {
						webname: [defaultVerify({ message: '请输入域名', trigger: 'blur' }), domainPortVerify()],
					},
				},
				{
					type: 'input',
					label: '备注',
					key: 'ps',
					attrs: {
						placeholder: '请输入备注，可为空',
						width: '42rem',
					},
				},
				FormInputPath(
					'根目录',
					'path',
					{
						attrs: {
							width: '42rem',
							placeholder: '请输入根目录',
						},
						rules: [defaultVerify({ message: '请选择路径' })],
					},
					() => {
						onPathChange(formData.value.path, (path: string) => {
							formData.value.path = path
						})
					}
				),
				{
					type: 'select',
					label: 'FTP',
					key: 'ftp',
					options: [
						{ label: '不创建', value: false },
						{ label: '创建', value: true },
					],
					attrs: {
						style: 'width: 16rem;',
					},
				},
				...(formData.value.ftp
					? [
							{
								type: 'custom',
								render: (formVal: any) => {
									if (!formVal.value.hasOwnProperty('ftp_username')) {
										formVal.value['ftp_username'] = ''
										formVal.value['ftp_password'] = ''
									}
									return (
										<BtFormItem label="FTP账号">
											<div class="flex items-center mb-[12px]">
												<BtFormItem prop="ftp_username">
													<BtInput placeholder="创建FTP账号" width="16rem" v-model={formData.value.ftp_username}></BtInput>
												</BtFormItem>
												<BtFormItem label="密码" class="!mt-0" prop="ftp_password">
													<BtInput width="16rem" placeholder="FTP密码" v-model={formData.value.ftp_password}></BtInput>
												</BtFormItem>
											</div>
											<span class="text-tertiary text-small">创建站点的同时，为站点创建一个对应FTP帐户，并且FTP目录指向站点所在目录。</span>
										</BtFormItem>
									)
								},
								rules: {
									ftp_username: [
										{
											validator: (rule: any, value: any, callback: any) => {
												if (formData.value.ftp) {
													if (value.length === 0) {
														callback(new Error('FTP用户名不能为空！'))
													} else if (!/^[a-zA-Z0-9_]+$/g.test(value)) {
														callback(new Error('FTP用户名只能包含字母、数字和下划线！'))
													} else if (value.length <= 3) {
														callback(new Error('FTP用户名长度错误，不能少于3个字符！'))
													} else {
														callback()
													}
												} else {
													callback()
												}
											},
											trigger: ['blur', 'change'],
										},
									],
									ftp_password: [
										{
											validator: (rule: any, value: any, callback: any) => {
												if (value === '' && formData.value.ftp) {
													callback(new Error('FTP密码不能为空！'))
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
					: []),
			]
		})
	},
	submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
		await validate()
		return await addHtmlSite(param.value)
	},
})

onMounted(() => {
	if (sitePath.value) {
		Object.assign(addSiteForm.value, { path: sitePath.value })
	}
})

defineExpose({
	onConfirm: submit,
})
</script>
