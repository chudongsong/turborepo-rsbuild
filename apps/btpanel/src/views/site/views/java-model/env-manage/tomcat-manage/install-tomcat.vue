<!--  -->
<template>
	<div class="p-2rem">
		<BtForm></BtForm>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormGroup, FormHelp, FormInput, FormItemCustom, FormRadio, FormSelect } from '@/hooks/tools/form/form-item'
import { getIntallList, getRandomPort, getRootUser, installTomcat, jdkVersionList, tomcatVersionList, userList } from './useController'
import { ElCheckbox } from 'element-plus'

const { BtForm, submit, param: formData } = useForm({
	data: () => ({
		install_type: 'global',
		user: 'www',
		release_firewall: false,
		auto_start: false,
		// base_version: tomcatVersionList.value[0].value || '',
		// jdk_path: jdkVersionList.value[0].value || '',
	}),
	options: (formData: any) =>
		computed(() => [
			FormRadio(' ', 'install_type', [
				{ label: '全局安装', value: 'global' },
				{ label: '独立安装', value: 'custom' },
			]),
			...(formData.value.install_type === 'global'
				? // 全局安装
				  [
						FormSelect('版本', 'base_version', tomcatVersionList.value, {
							attrs: {
								class: '!w-[30rem]',
								placeholder: '请选择Tomcat版本',
								onChange: (val: any) => {
									if (tomcatVersionList.value.find((item: any) => item.value === val).port) {
										formData.value.port = tomcatVersionList.value.find((item: any) => item.value === val).port
									}
								},
							},
							rules: [{ required: true, message: '请选择Tomcat版本' }],
						}),
				  ]
				: // 自定义安装
				  [
						FormSelect('版本', 'base_version', tomcatVersionList.value, {
							attrs: { class: '!w-[30rem]', placeholder: '请选择Tomcat版本' },
							rules: [{ required: true, message: '请选择Tomcat版本' }],
						}),
						FormInput('名称', 'name', {
							attrs: { class: '!w-[30rem]', placeholder: '请输入Tomcat名称' },
							rules: [{ required: true, message: '请输入Tomcat名称', trigger: 'blur' }],
						}),
						// FormInput('备注', 'ps', { attrs: { class: '!w-[30rem]', placeholder: '请输入备注' } }),
						FormSelect('启动用户', 'user', userList.value, { attrs: { class: '!w-[30rem]' } }),
				  ]),
			// 其他通用项
			FormGroup([
				FormInput('端口', 'port', {
					attrs: { class: '!w-[30rem]', placeholder: '请输入端口' },
					rules: [
						{ required: true, message: '请输入端口', trigger: 'blur' },
						{
							validator: (rule, value) => {
								// 必须输入端口，且端口号不能为80，443，21，20，8080，8081，888，8888，3306，5432，6379，27017，27018，27019，11211特殊端口
								const portList = [80, 443, 21, 20, 8080, 8443, 8081, 888, 8888, 3306, 5432, 6379, 27017, 27018, 27019, 11211]
								if (!value) {
									return Promise.reject('请输入端口')
								} else if (portList.includes(+value)) {
									return Promise.reject('端口号不能为特殊端口')
								} else if (value < 1 || value > 65535) {
									return Promise.reject('端口号范围为1-65535')
								} else {
									return Promise.resolve()
								}
							},
						},
					],
				}),
				FormItemCustom(
					'',
					() => {
						return (
							<ElCheckbox class="!ml-10px" v-model={formData.value.release_firewall}>
								端口放行
							</ElCheckbox>
						)
					},
					'release_firewall'
				),
			]),
			FormSelect('JDK版本', 'jdk_path', jdkVersionList.value, { attrs: { class: '!w-[30rem]', placeholder: '请选择jdk版本' }, rules: [{ required: true, message: '请选择JDK版本' }] }),
			FormItemCustom(
				'开机自启',
				() => {
					return <ElCheckbox v-model={formData.value.auto_start}></ElCheckbox>
				},
				'auto_start',
				{ attrs: { class: '!ml-[10px] !w-[10rem]' } }
			),
			FormInput('备注', 'ps', { attrs: { class: '!w-[30rem]', placeholder: '请输入备注' } }),
			FormHelp('', [
				{
					content: '【全局安装】所有指定使用该版本的项目将共用Tomcat',
				},
				{
					content: '【独立安装】可根据项目编排需要为某一个项目独立使用',
				},
				// {
				// 	content: '【独立Tomcat】每个项目运行在一个单独的Tomcat实例中。每个实例有自己的配置文件、日志文件和工作目录。隔离性好，资源消耗较高',
				// },
				// {
				// 	content: '【共用Tomcat】多个项目共享同一个Tomcat实例。所有的应用部署在同一台服务器上，使用相同的配置文件和资源。资源消耗低，隔离性低',
				// },
			]),
		]),
	submit: async (params: any, validate: any) => {
		await validate()
		return await installTomcat(params.value)
	},
})
defineExpose({
	onConfirm: submit,
})
onMounted(() => {
	getIntallList()
	getRootUser()
	getRandomPort(formData)
})
</script>

<style lang="sass" scoped></style>
