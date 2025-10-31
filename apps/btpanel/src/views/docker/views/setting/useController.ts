import { getDockerStore } from '@docker/useStore'
import { useSocket as createSocket, Socket } from '@/hooks/tools'
import { setDocker, setMonitor, setMonitorDate, repairDocker, checkUnstaillStatus, setDockerIpv6, setConfigFile, getSystemInfo, setDockerGlobal, updateDockerComposeVersion, setDockerProjectPath } from '@/api/docker'
import { restartPanel } from '@/api/global'
import { FormItemCustom, FormTextarea, FormInput, FormHelp, FormCustom } from '@form/form-item'
import { useConfirm, useDataHandle, useDialog, useForm, Message } from '@/hooks/tools'
import { msgBoxDialog } from '@/public'
import { clearCache, getByteUnit } from '@/utils'
import { defineEmits, h } from 'vue'
import type { AnyObject, AnyFunction } from '@/types'

import BtLog from '@/components/extension/bt-log/index.vue'

const {
	refs: { settingData, loading },
	getSet,
	getDockerState,
} = getDockerStore()

export const configEditorPopup = ref(false) // 配置文件弹窗
export const configEditorData = ref('') // 配置文件内容
export const systemInfo = ref<any>({}) // 系统信息

// 系统信息模板
export const systemTemplate: any[] = [
	{
		name: '主机名',
		key: 'Name',
	},
	{
		name: '系统版本',
		key: 'OperatingSystem',
	},
	{
		name: '架构',
		key: 'Architecture',
	},
	{
		name: '内核版本',
		key: 'KernelVersion',
	},
	{
		name: 'CPU核心',
		key: 'NCPU',
	},
	{
		name: '内存大小',
		key: 'MemTotal',
	},
	{
		name: 'Docker版本',
		key: 'ServerVersion',
	},
	{
		name: 'docker-compose版本',
		key: 'DockerComposeVersion',
		append: defineComponent({
			name: 'UpdateButton',
			setup() {
				return () =>
					h(
						'span',
						{
							class: 'bt-link ml-[1rem]',
							onClick: async () => {
								await useConfirm({
									title: '更新docker-compose版本',
									content: '是否更新docker-compose版本？',
								})
								useDataHandle({
									request: updateDockerComposeVersion(),
									loading: '正在更新docker-compose版本,请稍后...',
									success: (res: any) => {
										if (!res.status) {
											Message.error(res.msg)
										} else {
											// 更新日志
											useDialog({
												title: '更新日志',
												area: 56,
												btns: false,
												component: defineComponent({
													setup() {
														let useLogSocket: Socket | null = null
														const logContent = ref('')
														const emits = defineEmits(['close'])
														/**
														 * @description 创建websocket
														 */
														const createWebSocket = () => {
															useLogSocket = createSocket({
																route: '/sock_shell',
																onMessage: onWSReceive,
															})
															useLogSocket?.send('tail -f /tmp/update_dk-compose.log')
														}

														/**
														 * @description 消息接收检测和输出
														 * @param {MessageEvent} e 对象
														 */
														const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
															try {
																const data = e.data
																logContent.value += data
																if (data.includes('bt_successful') || data.includes('bt_failed')) {
																	useLogSocket?.close()
																	emits('close')
																	getDockerState()
																}
															} catch (error) {
																console.log(error)
																useLogSocket?.close()
															}
														}

														onMounted(() => {
															createWebSocket()
														})

														onUnmounted(() => {
															useLogSocket?.close()
														})

														return () => h('div', { class: 'overflow-y-auto' }, h(BtLog, { class: '!h-[40rem]', content: logContent.value, isHtml: true }))
													},
												}),
											})
										}
									},
								})
							},
						},
						'更新'
					)
			},
		}),
	},
	{
		name: 'unix地址',
		key: 'DockerUnixSocket',
	},
	{
		name: '数据目录',
		key: 'DockerRootDir',
	},
]

// 渲染系统信息
export const renderSystem = (key: any) => {
	switch (key) {
		case 'MemTotal':
			return getByteUnit(systemInfo.value.MemTotal)
		case 'DockerUnixSocket':
			return settingData.value.socket
		case 'DockerComposeVersion':
			return settingData.value.docker_compose_version
		default:
			return systemInfo.value[key]
	}
}

export const onConfirmConfig = () => {
	useDataHandle({
		request: setConfigFile({
			data: JSON.stringify({ daemon_json: configEditorData.value }),
		}),
		message: true,
		success: ({ status }: { status: boolean }) => {
			if (status) configEditorPopup.value = false
		},
	})
}

// 打开关闭重启服务
export const openStatus = async (type: string) => {
	try {
		// 重启和关闭时提示
		!(!settingData.value.service_status && type === 'toggle') &&
			(await useConfirm({
				title: `${type === 'reset' ? '重启' : '关闭'}Docker服务`,
				content: `是否${type === 'reset' ? '重启' : '关闭'}Docker服务？`,
			}))
		loading.value = true
		if (type === 'reset') {
			await setDocker({ data: JSON.stringify({ act: 'restart' }) })
			window.location.reload()
		} else {
			// settingData.value.service_status = !settingData.value.service_status
			useDataHandle({
				request: setDocker({
					data: JSON.stringify({
						act: !settingData.value.service_status ? 'start' : 'stop',
					}),
				}),
				message: true,
				success: (res: any) => {
					if (res.status) window.location.reload()
				},
			})
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}

// 修复
export const repair = async () => {
	try {
		await useConfirm({
			title: `修复docker模块`,
			content: `修复docker可能会导致容器异常，修复大约5分钟，是否继续修复？`,
		})
		useDataHandle({
			request: repairDocker(),
			message: true,
			success: (res: any) => {
				res.status && msgBoxDialog()
			},
		})
	} catch (error) {}
}
// 卸载
export const unInstall = async () => {
	try {
		const res = await checkUnstaillStatus()
		useDialog({
			component: () => import('./uninstall-confirm/index.vue'),
			compData: {
				needForce: !res.status,
				msg: res.msg,
			},
			title: '卸载Docker',
			btn: '确定',
			area: 45,
		})
	} catch (error) {}
}

// 设置监控状态
export const setMStatus = async (val: boolean) => {
	settingData.value.monitor_status = val
	useDataHandle({
		request: setMonitor({
			data: JSON.stringify({ act: val ? 'start' : 'stop' }),
		}),
		message: true,
		success: getSet,
	})
}

// 保存
export const save = async (type: string) => {
	switch (type) {
		case 'date':
			useDataHandle({
				request: setMonitorDate({
					data: JSON.stringify({
						save_date: settingData.value.monitor_save_date,
					}),
				}),
				message: true,
				success: getSet(),
			})
			break
	}
}

// 设置加速URL
export const setUrl = async (url: string) => {
	useDialog({
		component: () => import('./set-url/index.vue'),
		title: `设置加速URL`,
		area: 64,
		btn: true,
		compData: { url },
	})
}

// 设置compose路径
export const setCompose = async () => {
	useDialog({
		component: () => import('./set-docker-path-dialog/index.vue'),
		title: `设置Compose路径`,
		area: 45,
		btn: true,
	})
}

// 设置私有仓库
export const openWareForm = (warehouse: string) => {
	const { BtForm, submit } = useForm({
		data: () => ({
			warehouse: warehouse.replaceAll(/,/g, '\n'),
		}),
		options: () => {
			return computed(() => [
				FormTextarea('私有仓库', 'warehouse', {
					attrs: { placeholder: `请输入私有仓库地址,一行一个,如:\n192.168.1.111:8087\n192.168.1.112:8087`, style: 'width:27rem;', rows: 5 },
					rules: [
						// {required: true,message: '请输入私有仓库地址',trigger: 'blur'},
					],
				}),
				FormCustomHelp(`*设置后将重启Docker`),
			])
		},
		submit: async (formDataRef: Ref<{ warehouse: string }>, validate: AnyFunction) => {
			try {
				await validate()
				await useConfirm({
					title: '提示',
					content: '即将重启Docker，是否继续？',
				})
				const res: any = await useDataHandle({
					request: setDockerGlobal({ warehouse: formDataRef.value.warehouse.replace(/ /g, '').replaceAll(/\n/g, ',') }),
					message: true,
					loading: '正在设置私有仓库,请稍后...',
				})
				if (res.status) {
					getDockerState()
					return true
				}
				return false
			} catch (error) {
				return false
			}
		},
	})
	useDialog({
		component: () => h('div', { class: 'p-[1.6rem]' }, h(BtForm)),
		title: `设置私有仓库`,
		area: 45,
		btn: true,
		onConfirm: submit,
	})
}

/**
 * @description 设置日志切割
 */
export const setLogCutting = async (val: boolean) => {
	try {
		if (val) {
			setLogCuttingView()
			return
		}
		await useConfirm({
			icon: 'question-filled',
			title: val ? '开启日志切割' : '关闭日志切割',
			content: `${val ? '开启' : '关闭'}日志切割后需要重启docker，请确保可以重启docker再操作。是否继续？`,
		})

		await useDataHandle({
			loading: '正在设置日志切割,请稍后...',
			request: setDockerGlobal({ log_cutting: val ? JSON.stringify({ 'max-file': settingData.value.log_cutting.file, 'max-size': `${settingData.value.log_cutting.size}m` }) : JSON.stringify({}) }),
			message: true,
			success: getDockerState,
			error: () => {
				settingData.value.log_cutting.status = !val
			},
		})
	} catch (error) {
		settingData.value.log_cutting.status = !val
	}
}
/**
 * @description 设置日志切割
 */
export const setLogCuttingView = (): Promise<any> => {
	const { BtForm, submit } = useForm({
		data: () => ({
			'max-file': Number(settingData.value.log_cutting.file) || 1,
			'max-size': Number(settingData.value.log_cutting.size) || 10,
		}),
		options: () => {
			return computed(() => [
				FormInput('文件大小', 'max-size', {
					attrs: { placeholder: '文件大小', style: 'width:27rem;' },
					slots: {
						unit: () => h('div', { class: 'inline-block w-[3rem] text-tertiary mt-[2px] leading-[2rem] text-small ml-[20px]' }, 'MB'),
					},
					rules: [
						{ required: true, message: '请输入文件大小', trigger: 'blur' },
						{
							validator: (rule: any, value: any, callback: any) => {
								if (!value || !/^\d+$/.test(value)) {
									callback(new Error('请输入正整数'))
								} else {
									callback()
								}
							},
						},
					],
				}),
				FormInput('保留份数', 'max-file', {
					attrs: { placeholder: '保留份数', style: 'width:27rem;' },
					slots: {
						unit: () => h('div', { class: 'inline-block w-[3rem] text-tertiary mt-[2px] leading-[2rem] text-small ml-[20px]' }, '份'),
					},
					rules: [
						{ required: true, message: '请输入保留份数', trigger: 'blur' },
						{
							validator: (rule: any, value: any, callback: any) => {
								if (!value || !/^\d+$/.test(value)) {
									callback(new Error('请输入正整数'))
								} else {
									callback()
								}
							},
						},
					],
				}),
				FormHelp('', [{ content: '当前配置只会影响新创建的容器,已经创建的容器需要重新创建使配置生效' }, { content: '如果你的容器中有重要数据，确保在执行重建操作之前进行备份' }]),
			])
		},
		submit: async (formDataRef: Ref<{ 'max-file': string; 'max-size': string }>, validate: AnyFunction) => {
			try {
				await validate()
				const res: any = await useDataHandle({
					request: setDockerGlobal({ log_cutting: JSON.stringify({ 'max-file': formDataRef.value['max-file'], 'max-size': `${formDataRef.value['max-size']}m` }) }),
					message: true,
					loading: '正在设置日志切割,请稍后...',
				})
				if (res.status) {
					getDockerState()
					return true
				}
				return false
			} catch (error) {
				return false
			}
		},
	})
	return useDialog({
		component: () => h('div', { class: 'p-[1.6rem]' }, h(BtForm)),
		title: `设置日志切割`,
		area: 45,
		btn: true,
		onConfirm: submit,
		onCancel: () => {
			getDockerState()
		},
	})
}

/**
 * @description 设置
 */
export const setSwitch = async (type: string, val: boolean) => {
	try {
		let typeText = ''
		switch (type) {
			case 'iptables':
				typeText = 'iptables'
				break
			case 'live_restore':
				typeText = 'live_restore'
				break
		}
		await useConfirm({
			icon: 'question-filled',
			title: val ? `开启${typeText}` : `关闭${typeText}`,
			content: `${val ? '开启' : '关闭'}${typeText}后需要重启docker，请确保可以重启docker再操作。是否继续？`,
		})

		await useDataHandle({
			loading: `正在设置${typeText},请稍后...`,
			request: setDockerGlobal({ [type]: val ? 1 : 0 }),
			message: true,
			success: getDockerState,
			error: () => {
				settingData.value[type] = !val
			},
		})
	} catch (error) {
		settingData.value[type] = !val
	}
}

/**
 * @description 设置cgroup driver
 */
export const setDriver = async (val: string) => {
	try {
		await useConfirm({
			icon: 'question-filled',
			title: '设置cgroup driver',
			content: `设置cgroup driver后需要重启docker，请确保可以重启docker再操作。是否继续？`,
		})

		await useDataHandle({
			loading: '正在设置cgroup driver,请稍后...',
			request: setDockerGlobal({ driver: val }),
			message: true,
			success: getDockerState,
		})
	} catch (error) {
		getDockerState()
	}
}
/**
 * @description 设置ipv6
 */
export const setIpv6View = (): Promise<any> =>
	useDialog({
		component: () => import('./ipv6-setting-dialog/index.vue'),
		title: 'ipv6设置',
		btn: '确定',
		area: 60,
	})

// 设置ipv6
export const setIpv6 = async (val: boolean) => {
	try {
		await useConfirm({
			icon: 'question-filled',
			title: val ? '开启IPV6' : '关闭IPV6',
			content: `${val ? '开启' : '关闭'}IPV6后需要重启docker，请确保可以重启docker再操作。是否继续？`,
		})

		await useDataHandle({
			loading: '正在设置IPV6,请稍后...',
			request: setDockerGlobal({ status: val ? 1 : 0 }),
			message: true,
			success: getDockerState,
			error: () => {
				settingData.value.ipv6 = !val
			},
		})
	} catch (error) {
		settingData.value.ipv6 = !val
	}
}

/**
 * @description 设置Docker代理
 */
export const setDockerProxy = async (val?: boolean): Promise<any> => {
	if (val !== false) {
		const { BtForm, submit } = useForm({
			data: () => ({
				http_proxy: settingData.value.proxy.http_proxy || 'http://',
				https_proxy: settingData.value.proxy.https_proxy || 'https://',
				no_proxy: settingData.value.proxy.no_proxy || 'localhost,127.0.0.1',
			}),
			options: (formDataRef: any) => {
				return computed(() => [
					FormInput('HTTP代理', 'http_proxy', {
						attrs: {
							placeholder: '请输入HTTP代理地址',
							style: 'width:32rem',
							onInput: (val: string) => {
								const value = val.replace(/^http:\/\//, '')
								formDataRef.value.https_proxy = `https://${value}`
							},
						},
						rules: [
							{ required: true, message: '请输入HTTP代理地址', trigger: 'blur' },
							{
								pattern: /^http:\/\/.+/,
								message: 'HTTP代理必须以http://开头',
								trigger: 'blur',
							},
						],
					}),
					FormInput('HTTPS代理', 'https_proxy', {
						attrs: {
							placeholder: '请输入HTTPS代理地址',
							style: 'width:32rem',
						},
						rules: [
							{ required: true, message: '请输入HTTPS代理地址', trigger: 'blur' },
							{
								pattern: /^https?:\/\/.+/,
								message: 'HTTPS代理必须以http://或https://开头',
								trigger: 'blur',
							},
						],
					}),
					FormInput('不代理的地址', 'no_proxy', {
						attrs: {
							placeholder: '请输入无需代理的地址,多个地址用逗号分隔',
							style: 'width:32rem',
						},
					}),
					FormCustom(() =>
						h(
							'span',
							{
								class: 'text-tertiary mt-[2px] leading-[2rem] text-small ml-[20px]',
							},
							'*设置代理后需要重启Docker服务才能生效'
						)
					),
					FormCustom(() =>
						h(
							'div',
							{
								class: 'text-tertiary mt-[2px] leading-[2rem] text-small ml-[20px]',
							},
							'*http示例：http://127.0.0.1:8888'
						)
					),
					FormCustom(() =>
						h(
							'div',
							{
								class: 'text-tertiary mt-[2px] leading-[2rem] text-small ml-[20px]',
							},
							'*https示例：https://127.0.0.1:8888'
						)
					),
				])
			},
			submit: async (formDataRef: any, validate: any) => {
				try {
					await validate()
					await useConfirm({
						icon: 'question-filled',
						title: '设置Docker代理',
						content: '设置代理后需要重启docker，请确保可以重启docker再操作。是否继续？',
					})

					const proxy_settings = {
						http_proxy: formDataRef.value.http_proxy,
						https_proxy: formDataRef.value.https_proxy,
						no_proxy: formDataRef.value.no_proxy,
					}

					const res: any = await useDataHandle({
						loading: '正在设置Docker代理,请稍后...',
						request: setDockerGlobal({ proxy_settings: JSON.stringify(proxy_settings) }),
						message: true,
						success: getDockerState,
					})

					return res.status
				} catch (error) {
					return false
				}
			},
		})

		return useDialog({
			component: () => h('div', { class: 'p-2rem' }, h(BtForm)),
			title: 'Docker代理设置',
			area: 50,
			btn: '确定',
			onConfirm: submit,
			onCancel: () => {
				getDockerState()
			},
		})
	} else {
		try {
			// 关闭代理
			await useConfirm({
				icon: 'question-filled',
				title: '关闭Docker代理',
				content: '是否关闭Docker代理？',
			})
			await useDataHandle({
				loading: '正在关闭Docker代理？,请稍后...',
				request: setDockerGlobal({ proxy_settings: JSON.stringify({}) }),
				message: true,
				success: getDockerState,
				error: () => {
					getDockerState()
				},
			})
		} catch (error) {
			settingData.value.proxy.status = !val
		}
	}
}

const getInfo = () => {
	useDataHandle({
		request: getSystemInfo(),
		success: (res: any) => {
			systemInfo.value = res.data
		},
	})
}

export const FormCustomHelp = (text: string): any => {
	return FormItemCustom('', () => h('span', { class: 'text-tertiary mt-[2px] leading-[2rem] text-small ml-[20px]' }, `${text}`))
}

// 初始化
export const init = () => {
	getSet(false)
	getInfo()
}

// 销毁
export const unmountHandler = () => {
	configEditorPopup.value = false
	configEditorData.value = ''
	systemInfo.value = {}
}

export const setDockerConfigAppPath = async (path: string) => {
	try {
		if (!path || typeof path !== 'string' || !/^\/.+/.test(path)) {
			Message.error('请输入有效的目录路径！')
			return
		}
		await useConfirm({
			title: '设置应用商店目录',
			content: '修改应用商店目录将会重启面板，是否继续？',
		})
		await useDataHandle({
			request: setDockerProjectPath({ path }),
			loading: '正在设置应用商店目录,请稍后...',
			success: (res: any) => {
				if (!res.status) {
					Message.error(res.msg)
				}
			},
		})
		await useDataHandle({
			loading: '正在重启面板，请稍候...',
			request: restartPanel(),
			message: true,
			success: (res: any) => {
				if (res.status) {
					setTimeout(() => {
						clearCache()
						window.location.reload()
					}, 1000)
				}
			},
		})
	} catch (error) {
		console.log('error', error)
		return false
	}
}
