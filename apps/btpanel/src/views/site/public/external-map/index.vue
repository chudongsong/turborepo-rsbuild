<template>
	<div class="flex flex-col">
		<div class="flex items-center">
			外网映射
			<el-switch v-model="mappingStatus" class="ml-[8px]" :disabled="mappingType" @change="changeStatus"></el-switch>
		</div>
		<div v-if="siteType === 'java' || siteType === 'python'">
			<BtTable class="my-2rem" :maxHeight="450" />
			<!-- <bt-table
				class="my-2rem"
				:column="tableColumns"
				:data="tableData"
				v-bt-loading="tableLoading"
				:maxHeight="450" /> -->
			<div v-if="siteInfo.project_config?.java_type === 'springboot'" class="flex items-center">
				静态文件：
				<span>
					<el-switch v-model="siteInfo.project_config.static_info.status" @change="changeStaticStatus"></el-switch>
					<!-- {{ siteInfo.project_config?.static_info?.status ? '已配置' : '未配置' }} -->
				</span>
				<!-- openStaticPopup -->
				<el-button class="!ml-[2rem]" type="default" @click="openStaticView()"> 设置静态文件 </el-button>
			</div>
		</div>
		<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
			<li>如果您的是HTTP项目，且需要外网通过80/443访问，请开启外网映射</li>
			<li>开启外网映射前，请到【域名管理】中至少添加1个域名</li>
			<li class="text-danger" v-if="siteType === 'java'">外网映射开启后可在配置文件中查看修改服务器（Nginx/Apache）的配置文件</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import BtFormItem from '@/components/form/bt-form-item'
import BtInput from '@/components/form/bt-input'
import BtInputNumber from '@/components/form/bt-input-number'
import { Message, useConfirm, useDialog, useForm, useRefreshList, useTable } from '@/hooks/tools'
import { FormInputPath, FormMore } from '@/hooks/tools/form/form-item'
import { usePort } from '@site/useController'
import { SITE_STORE } from '@site/useStore'
import { ElCheckbox } from 'element-plus'
import { changeStatus, getInfo, mappingStatus, mappingType, saveProxyMap, setStaticFile } from './useController'
import { SITE_EXTERNAL_MAP_STORE } from './useStore'
import { fileSelectionDialog } from '@/public'
import { router } from '@/router'

const { siteType, siteInfo } = storeToRefs(SITE_STORE())
const { isRefreshPortList } = storeToRefs(SITE_EXTERNAL_MAP_STORE())
const { getJavaPortData } = SITE_EXTERNAL_MAP_STORE()
const popupClose = inject<any>('popupClose') //     弹窗关闭

const otherSetting = ref(false) // 其他设置
let currentRow: any = {} // 当前行数据

const {
	BtTable,
	refresh,
	config: tableConfig,
} = useTable({
	request: async () => {
		// if (siteType.value === 'java') {
		return await getJavaPortData()
		// }
		return { data: [], total: 0 }
	},
	columns: [
		usePort(),
		{
			label: '防火墙状态',
			prop: 'fire_wall',
			width: 200,
			render: (row: any) => {
				return (
					<span
						onClick={() => {
							// 使用安全 - 系统防火墙 端口规则 添加修改
							row.fire_wall === null
								? useDialog({
										title: '端口规则',
										area: 44,
										component: () => import('@firewall/views/system-firewall/port-rules/add-port-rule.vue'),
										compData: {
											...(row.fire_wall === null ? { port: row.port, isEdit: false, noNps: true } : { ...row.fire_wall, isEdit: true, noNps: true }),
											refreshFn: () => {
												getInfo()
												refresh()
											},
										},
										showFooter: true,
								  })
								: Message.msg({
										message: (
											<span>
												请前往系统防火墙模块修改，
												<span class="text-primary cursor-pointer go-firewall" onClick={goPortRule}>
													立即前往
												</span>
											</span>
										),
										duration: 2000,
										dangerouslyUseHTMLString: true,
										type: 'error',
								  })
						}}
						class={(row.fire_wall === null || row.fire_wall?.Strategy === 'drop' ? 'text-danger' : 'text-primary') + ' cursor-pointer'}>
						{row.fire_wall === null ? '未配置' : row.fire_wall?.Strategy === 'accept' ? '放行' : '禁止'}
					</span>
				)
			},
		},
		{
			label: '外网映射',
			prop: 'nginx_proxy',
			showOverflowTooltip: false,
			render: (row: any) => {
				if (!mappingStatus.value) return '请先点击上方启用外网映射后再使用'
				return (
					<div class="flex">
						<span
							onClick={() => {
								let rowData: any = {
									isEdit: false,
									proxy_dir: '',
									proxy_id: '',
									proxy_port: '',
									site_name: '',
									rewrite: {
										status: false,
										src_path: '',
										target_path: '',
									},
									add_headers: '',
									status: true,
								}
								if (row.nginx_proxy !== null) {
									currentRow = row
									rowData.isEdit = true
									rowData.proxy_id = row.nginx_proxy.proxy_id
									rowData.proxy_dir = row.nginx_proxy.proxy_dir
									rowData.proxy_port = row.nginx_proxy.proxy_port
									rowData.site_name = row.nginx_proxy.site_name
									rowData.status = !!row.nginx_proxy.status
									if (siteType.value !== 'python') {
										rowData.rewrite = row.nginx_proxy.rewrite
										rowData.add_headers = row.nginx_proxy.add_headers.map((item: any) => `${item.k}=${item.v}`).join('\n')
									}
								} else {
									rowData.isEdit = false
									rowData.proxy_port = row.port
								}
								if (siteType.value === 'python') rowData.proxy_dir = '/'
								openProxyView(rowData)
							}}
							class={(row.nginx_proxy === null || row.nginx_proxy?.status === 0 ? 'text-danger' : 'text-primary') + ' cursor-pointer max-w-[26rem] truncate'}
							title={row.nginx_proxy !== null && row.nginx_proxy?.status ? '已开启，代理路由：' + row.nginx_proxy?.proxy_dir : ''}>
							{row.nginx_proxy === null ? '未配置' : row.nginx_proxy?.status ? '已开启，代理路由：' + row.nginx_proxy?.proxy_dir : '已停止'}
						</span>{' '}
					</div>
				)
			},
		},
	],
	extension: [useRefreshList(isRefreshPortList)],
})

const renderStatus = (formData: Ref<AnyObject>, rowData: AnyObject) => {
	return {
		type: 'custom',
		render: (formVal: any) => {
			if (!formVal.value.hasOwnProperty('status')) {
				formVal.value['status'] = false
			}
			return (
				<BtFormItem label="开启代理">
					<ElCheckbox v-model={formData.value.status}></ElCheckbox>
				</BtFormItem>
			)
		},
	}
}

const goPortRule = () => {
	popupClose()
	router.push({ path: `/firewall/system` })
}

const changeStaticStatus = async (status: boolean) => {
	if (status) {
		openStaticView()
	} else {
		await useConfirm({
			title: '确定要关闭静态文件吗？',
			content: '关闭静态文件后，项目将无法访问静态文件',
		})
		setStaticFile({
			status: false,
			index: siteInfo.value?.project_config?.static_info?.index || 'index.html',
			path: siteInfo.value?.project_config?.static_info?.path || '',
		})
	}
}

const openStaticView = (data?: AnyObject) => {
	if (!mappingStatus.value) return Message.error('请先点击上方启用外网映射后再使用')
	const isProxyRoot = tableConfig.data.some((item: any) => item.nginx_proxy?.proxy_dir === '/')
	if (isProxyRoot) {
		siteInfo.value.project_config.static_info.status = false
		Message.error('项目已存在根路由【/】配置,无法设置静态文件')
		return
	}
	const { BtForm, submit } = useForm({
		data: data || {
			status: true,
			index: siteInfo.value?.project_config?.static_info?.index || 'index.html',
			path: siteInfo.value?.project_config?.static_info?.path || '',
		},
		options: (formData: Ref<AnyObject>) => {
			formData.value.status = siteInfo.value.project_config?.static_info?.status || false
			return computed(() => [
				// renderStatus(formData, {}),
				{
					type: 'input',
					label: '默认文档',
					key: 'index',
					attrs: {
						placeholder: '请输入内容，用,分割',
						class: 'w-[26rem]',
					},
					rules: [
						{
							validator: (rule: any, value: any, callback: any) => {
								if (formData.value.status && value === '') {
									callback(new Error('默认文档不能为空'))
								} else {
									callback()
								}
							},
						},
					],
				},
				FormInputPath(
					'文件路径',
					'path',
					{
						attrs: { style: 'width: 26rem' },
						rules: [
							{
								validator: (rule: any, value: any, callback: any) => {
									if (formData.value.status && value === '') {
										callback(new Error('文件路径不能为空'))
									} else {
										callback()
									}
								},
							},
						],
					},
					() => {
						fileSelectionDialog({
							type: 'dir',
							path: formData.value.path,
							change: path => {
								formData.value.path = path
							},
						})
					}
				),
			])
		},
		submit: async (param: any, validate: any) => {
			await validate()
			return setStaticFile(param.value)
		},
	})
	useDialog({
		title: `设置静态文件【${siteInfo.value.name}】`,
		area: 65,
		showFooter: true,
		component: () => <BtForm class="p-2rem" />,
		onConfirm: submit,
		onCancel: () => {
			getInfo()
		},
	})
}

/**
 * @description 打开代理视图
 * @param rowData
 */
const openProxyView = (rowData: AnyObject) => {
	const { BtForm, submit } = useForm({
		data: rowData,
		options: (formData: Ref<AnyObject>) => {
			return computed(() => [
				renderStatus(formData, rowData),
				{
					type: 'input',
					label: '代理路由',
					key: 'proxy_dir',
					attrs: {
						width: '26rem',
						placeholder: '请输入内容，用,分割',
						disabled: siteType.value === 'python',
						onInput: () => {},
					},
					rules: [{ required: true, message: '请输入代理路由', trigger: 'blur' }],
				},
				{
					type: 'custom',
					render: (formVal: any) => {
						return (
							<BtFormItem label="代理端口" prop="proxy_port">
								<BtInputNumber v-model={formData.value.proxy_port} controls-position="right" class="!w-[10rem]"></BtInputNumber>
							</BtFormItem>
						)
					},
					rules: {
						proxy_port: [
							{ required: true, message: '请输入代理端口', trigger: 'blur' },
							{
								validator: (rule: any, value: any, callback: any) => {
									if (!/^\d+$/.test(value)) {
										callback(new Error('端口号必须为数字，范围0-65535'))
									} else if (value < 0 || value > 65535) {
										callback(new Error('端口号范围为0-65535'))
									} else {
										callback()
									}
								},
							},
						],
					},
				},
				...(siteType.value !== 'python'
					? [
							FormMore(otherSetting),
							...(otherSetting.value
								? [
										{
											type: 'textarea',
											label: '自定义头部',
											key: 'add_headers',
											attrs: {
												placeholder: '自定义头部，1行1个,例如：\nX-Client-IP=$remote_addr',
												class: '!w-[26rem]',
												width: '26rem',
												rows: 4,
												resize: 'none',
											},
										},
										{
											type: 'custom',
											render: () => (
												<BtFormItem label="路由重写">
													<ElCheckbox v-model={formData.value.rewrite.status}></ElCheckbox>
												</BtFormItem>
											),
										},
										...(formData.value.rewrite.status
											? [
													// {
													// 	type: 'custom',
													// 	render: () => (
													// 		<BtFormItem label="访问路由" prop="srcPath">
													// 			<BtInput v-model={formData.value.rewrite.src_path} class="w-[25rem]" placeholder={`访问路由,例如：${formData.value.proxy_dir}/`.replace(/ /g, '').replace(/\/\//g, '/')}></BtInput>
													// 		</BtFormItem>
													// 	),
													// },
													{
														type: 'custom',
														render: () => (
															<BtFormItem label="后端路由" prop="targetPath">
																<BtInput v-model={formData.value.rewrite.target_path} class="w-[25rem]" placeholder={`后端路由,例如：${formData.value.proxy_dir}/xxx/`.replace(/ /g, '').replace(/\/\//g, '/')}></BtInput>
															</BtFormItem>
														),
													},
											  ]
											: []),
								  ]
								: []),
					  ]
					: []),
			])
		},
		submit: saveProxyMap,
	})
	useDialog({
		title: `${rowData.isEdit ? `修改反向代理映射` : '添加反向代理映射'}`,
		area: 50,
		showFooter: true,
		component: () => <BtForm class="p-2rem" />,
		onConfirm: submit,
	})
}

onMounted(getInfo)
defineExpose({
	init: () => {
		getInfo()
		refresh()
	},
})
</script>
