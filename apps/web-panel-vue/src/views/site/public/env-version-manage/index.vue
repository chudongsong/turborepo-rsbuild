<!-- sdk环境管理 -->
<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #header-left>
				<el-radio-group v-model="versionType" size="default" @change="getVersionListEvent">
					<el-radio-button value="常用版本">常用版本</el-radio-button>
					<el-radio-button value="所有版本">所有版本</el-radio-button>
				</el-radio-group>
			</template>
			<template #header-right>
				<el-button v-if="props.compData.type === 'go'" type="default" @click="openEnvVersionView"> 切换GOPROXY源 </el-button>
				<el-button type="default" @click="getVersionListEvent(true)"> 更新版本列表 </el-button>
			</template>
			<template #content>
				<bt-table height="400" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #popup>
				<bt-dialog title="安装信息" v-model="logPopup" :area="[50, 36]" @cancel="() => (logsMsg = '正在请求安装...')">
					<div class="bg-default p-[12px] h-[36rem] text-white overflow-auto logMsg">
						<pre v-html="logsMsg" class="whitespace-pre-wrap"></pre>
					</div>
				</bt-dialog>
				<bt-dialog :title="`安装版本【${installInfo.version}】`" v-model="installInfo.status" :area="50" :show-footer="true" @confirm="installVersionEvent(installInfo.version)">
					<div class="p-2rem">
						<el-form :model="installInfo">
							<el-form-item label="自定义参数">
								<bt-input v-model="installInfo.extended" name="extended" width="32rem" placeholder="可为空，实例：--enable-optimizations"></bt-input>
							</el-form-item>
						</el-form>
						<bt-help class="pl-4rem mt-1rem" :options="helpList"></bt-help>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useConfirm, useDataHandle, useHandleError, useMessage, useDialog, useForm } from '@/hooks/tools'
import { FormItemCustom } from '@form/form-item'
import { Socket, useSocket } from '@/hooks/tools/socket'
import { msgBoxDialog } from '@/public'
import { getPyVersion, getVersionList, installPyVersion, installPyVersionNew, installVersion, setGoEnvironment, uninstallVersion, setGoProxy } from '@api/site'

import { ElAutocomplete } from 'element-plus'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})
const versionUsed = ref<any>('') // 已使用版本

const Message = useMessage() // 消息提示
const logPopup = ref(false) // 弹窗
const logsMsg = ref('正在请求安装...') // 弹窗内容
let dataArr: any[] = [] // 内容数据
const proxyList = ref<any[]>([]) // go镜像源列表
const goProxy = ref<any>('') // go镜像源
const tableColumns = [
	{
		label: '版本号',
		width: 200,
		render: (row: any) => {
			return (
				<div>
					{row.version.replace(props.compData.type, '')} {row.type === 'stable' && props.compData.type === 'go' ? '(正式版)' : ''}
				</div>
			)
		},
	},
	{
		label: '安装状态',
		render: (row: any) => {
			if (typeof row.installed === 'string') {
				row.installed = row.installed === '1'
			}
			return <div>{row.is_install === true ? <span class="text-tertiary">安装中</span> : row.installed ? <span class="text-primary">已安装</span> : <span class="text-danger">未安装</span>}</div>
		},
	},
	{
		label: '操作',
		align: 'right',
		render: (row: any) => {
			let version = row.version.replace(props.compData.type, '')
			return (
				<div>
					<div v-show={props.compData.type === 'go'} class="inline-block">
						{row.installed && row.version !== versionUsed.value && props.compData.type === 'go' ? (
							<span
								class="cursor-pointer bt-link"
								onClick={() => {
									setDefaultVersion(row.version)
								}}>
								应用至命令行
							</span>
						) : (
							props.compData.type === 'go' && row.installed ? <span class="shrink-0 text-secondary">正在使用</span>:null
						)}
						<el-divider direction="vertical" />
					</div> 
					{/* {
						props.compData.type === 'go' && row.version === versionUsed.value && row.installed && (<div class="inline-block"><span class="shrink-0 text-[#666]">正在使用</span><el-divider direction="vertical" /></div>)
					} */}

					{row.installed ? (
						<span
							class="cursor-pointer text-danger"
							onClick={() => {
								uninstallVersionEvent(row.version)
							}}>
							卸载
						</span>
					) : row.is_install === true || row.installing === true ? (
						<span
							class="cursor-pointer text-tertiary"
							onClick={() => {
								msgBoxDialog()
							}}>
							安装中...
						</span>
					) : (
						<span
							class="cursor-pointer bt-link"
							onClick={() => {
								installVersionEvent(row.version)
							}}>
							安装
						</span>
					)}
				</div>
			)
		},
	},
] // 表格列
const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 响应式数据
const installMessage = ref('') // 安装信息
const allData = ref([]) // 所有数据
const versionType = ref(props.compData.type === 'py' ? '常用版本' : '所有版本') // 版本分类

const installInfo = reactive({
	version: '',
	extended: '',
	status: false,
}) // 安装信息

const helpList = ref([{ content: '填写时请勿添加换行符等特殊符号，这可能会导致参数不生效' }, { content: '多个参数时以空格隔开' }, { content: '"--prefix"参数已被使用' }, { content: '验证参数是否生效，可查看安装日志并搜索对应名称' }])
/**
 * @description 获取版本列表
 */
const getVersionListEvent = async (force?: boolean) => {
	let type = 'all'
	if (versionType.value === '常用版本') type = 'streamline'
	// 获取版本列表
	try {
		let res: any
		if (props.compData.type === 'py') {
			force === true &&
				(await useConfirm({
					title: `提示`,
					width: '35rem',
					icon: 'warning-filled',
					content: `将从镜像源获取版本列表，是否继续？`,
				}))
			let params = { force: force === true ? 'true' : 'false' }
			tableLoading.value = true
			res = await getPyVersion(params)
			tableData.value = res.data.sdk[type]
			versionUsed.value = res.data.command_path.find((item: any) => item.python_path === res.data.used)?.version || ''
		} else {
			force === true &&
				(await useConfirm({
					title: `提示`,
					width: '35rem',
					icon: 'warning-filled',
					content: `将从镜像源获取版本列表，是否继续？`,
				}))
			tableLoading.value = true
			res = await getVersionList(props.compData.type,force === true ? 'true' : 'false')
			allData.value = res.data
			goProxy.value = res.data.goproxy.now || ''
			proxyList.value = res.data.goproxy.list.map((item: any) => ({label: `${item.name}(${item.proxy})`, value: item.proxy}))
			res.data.sdk[type].sort((a: any, b: any) => b.installed - a.installed) // 排序，已安装的先显示
			versionUsed.value = res.data.used
			tableData.value = res.data.sdk[type]
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		tableLoading.value = false
	}
}

/**
 * @description 设置默认版本 go项目特有
 * @param name 版本名称
 */
const setDefaultVersion = async (name: string) => {
	// 设置默认版本
	const res: AnyObject = await useDataHandle({
		loading: '正在设置默认版本，请稍后...',
		request: setGoEnvironment({ name }),
		message: true,
	})
	if (res.status) getVersionListEvent()
	if (props.compData && typeof props.compData?.refresh === 'function') {
		// 刷新父组件数据
		props.compData.refresh()
	}
}

/**
 * @description 安装版本
 * @param version 安装版本
 */
const installVersionEvent = async (version: string) => {
	const isPy = props.compData.type === 'py'
	if (isPy) {
		if (!installInfo.status) {
			installInfo.version = version
			installInfo.status = true
		} else {
			const params = {
				data: JSON.stringify({
					version: installInfo.version,
					extended: installInfo.extended,
				}),
			}
			await useDataHandle({
				request: installPyVersionNew(params),
				message: true,
			})
			installInfo.status = false
			msgBoxDialog()
			if (props.compData && typeof props.compData?.refresh === 'function') {
				// 刷新父组件数据
				props.compData.refresh()
			}
			getVersionListEvent()
			socketInfo?.close()
		}
		return
	}
	await useConfirm({
		title: `安装`,
		content: `是否安装[${version}]版本？`,
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在安装，请稍后...',
		request: installVersion({ version: version }),
		message: true,
	})
	if (res.status) {
		msgBoxDialog()
		// if (props.compData && typeof props.compData?.refresh === 'function') {
		// 	// 刷新父组件数据
		// 	props.compData.refresh()
		// }
		// getVersionListEvent()
		socketInfo?.close()
	}
}

/**
 * @description 卸载
 * @param version 卸载版本
 */
const uninstallVersionEvent = async (version: string) => {
	await useConfirm({
		title: `卸载sdk`,
		content: `卸载[${version}]版本后，相关项目将无法启动，是否继续？`,
		icon: 'warning-filled',
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在卸载，请稍后...',
		request: uninstallVersion({ version }, props.compData.type),
	})
	if (res.status || (Array.isArray(res.data) && res.data[0].status)) getVersionListEvent()
	if (Array.isArray(res.data) && !res.data[0].status) Message.error(res.data?.[0]?.msg)
}

/**
 * @description 切换镜像源
 */
 const openEnvVersionView = async () => {
	const querySearch = (queryString: string, cb: any) => {
		cb(proxyList.value)
	}
	const { BtForm, submit } = useForm({
		data: {
			proxy: goProxy.value,
		},
		options: (formData: any) => {
			return ref([
				FormItemCustom(
					'GOPROXY源',
					() => {
						return <ElAutocomplete v-model={formData.value.proxy} placeholder="请输入或选择GOPROXY源" value-key="label" fetch-suggestions={querySearch} onSelect={(val:any) => {
							formData.value.proxy = val.value
						}}>{{
							default: ({item}:{item:any}) => (
								<div class={item.value === formData.value.proxy ? ' bt-link' : ''}>
									{ item.label }
								</div>
							)
						}}</ElAutocomplete>
					},
					'proxy',
					{
						rules: [{required: true, message: '请输入或选择GOPROXY源'}],
					}
				),
			])
		},
		submit: async (param: any, validate: any, ref: Ref<any>) => {
			await validate() // 校验表单
			const res: AnyObject = await useDataHandle({
				loading: '正在设置GOPROXY源，请稍后...',
				request: setGoProxy({ proxy: param.value.proxy }),
				message: true,
			})
			getVersionListEvent()
			return res.status
		},
	})
	useDialog({
		title: '切换GOPROXY源',
		area: 65,
		btn: true,
		component: <BtForm class="!p-[2rem]" />,
		onConfirm: submit,
	})
}

let socketInfo: Socket | null = null
/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	socketInfo = useSocket({
		route: '/sock_shell',
		onMessage: onWSReceive,
	})
}

const scrollEnd = () => {
	const el = document.querySelector('.logMsg')
	nextTick(() => {
		if (el) {
			el.scrollTop = el.scrollHeight
		}
	})
}

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	const data = e.data
	dataArr.push(data)
	// 拼接安装信息
	// logsMsg.value += '\n' + data

	// 如果队列长度超过最大长度，删除多余的消息
	if (dataArr.length > 50) {
		logsMsg.value = dataArr.slice(dataArr.length - 50).join('\n')
	} else {
		logsMsg.value = dataArr.join('\n')
	}
	scrollEnd()
	if (data.includes('Done')) {
		logPopup.value = false
		socketInfo?.close()
		logsMsg.value = '正在请求安装...'
		getVersionListEvent()
	}
}

onMounted(() => {
	getVersionListEvent()
})

// 页面销毁时关闭socket
onBeforeUnmount(() => {
	dataArr = []
	socketInfo?.close()
})
</script>
