<!-- 模块管理 -->
<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<el-select v-model="modForm.type" class="!w-[10rem]">
						<el-option label="yarn" value="yarn"></el-option>
						<el-option label="pnpm" value="pnpm"></el-option>
						<el-option label="npm" value="npm"></el-option>
					</el-select>
					<bt-input class="ml-4px !w-[24rem]" v-model="modForm.mod_name" placeholder="模块名称"></bt-input>
					<el-button type="primary" class="ml-1.4rem" @click="handleOperation(null, 'install')">安装模块</el-button>
				</div>
			</template>
			<template #header-right>
				<el-button type="primary" @click="handleAllInstallEvent">一键安装项目模块</el-button>
			</template>
			<template #content>
				<bt-table max-height="620" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading">
					<template #empty>
						<div class="flex items-center justify-center text-small">
							未安装模块,点击
							<bt-link @click="handleAllInstallEvent">一键安装项目模块</bt-link>
						</div>
					</template>
				</bt-table>
			</template>
			<template #popup>
				<bt-dialog title="正在安装模块,请稍后..." v-model="installPopup" :area="[50, 36]">
					<div class="bg-darkPrimary p-[12px] h-[36rem] text-white overflow-auto" v-scroll-bottom>
						<pre class="whitespace-pre-line" v-html="installMessage"></pre>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useConfirm } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useSiteStore } from '@/views/site/useStore'
import { getNodeModules, installModule, installPackages, uninstallModule, upgradeModule } from '@api/site'
import { Socket, useSocket as createSocket } from '@/hooks/tools/socket'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { siteInfo } = useSiteStore()

const Message = useMessage() // 消息提示

const installPopup = ref(false) // 安装弹窗

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		{ label: '模块名称', prop: 'name' },
		{ label: '版本', prop: 'version' },
		{ label: '协议', prop: 'license' },
		{ label: '描述', prop: 'description' },
		useOperate([
			{
				onClick: (row: any) => {
					handleOperation(row, 'update')
				},
				title: '更新',
			},
			{
				onClick: (row: any) => {
					handleOperation(row, 'uninstall')
				},
				title: '卸载',
			},
		]), // 操作
	])
}

const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 响应式数据
const modForm = ref({
	mod_name: '', // 模块名称
	type: 'yarn', // 安装类型
}) // 响应式数据

const resMsg = ref<any>() // 响应式数据

const installMessage = ref('正在请求安装...') // 安装信息

/**
 * 获取模块列表
 */
const getModules = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getNodeModules({
			data: JSON.stringify({
				project_name: siteInfo.value.name,
				project_cwd: siteInfo.value.project_cwd,
			}),
		}),
		data: [Array, tableData],
	})
}

const handleOperation = async (row: any, type: string) => {
	const { name: project_name } = siteInfo.value
	const { mod_name, type: pkg_manager } = modForm.value
	if (mod_name === '' && type === 'install') {
		Message.error('请输入模块名称')
		return
	}
	if (type !== 'install') {
		await useConfirm({
			width: 38,
			title: `${type === 'update' ? '更新' : '卸载'}模块【${row?.name}】`,
			content: `${type === 'update' ? '更新' : '卸载'}模块后，可能影响项目正常运行，请谨慎操作，是否继续操作？`,
			type: 'calc',
		})
	}
	const paramsType: AnyObject = {
		install: {
			data: JSON.stringify({
				project_name,
				mod_name,
				pkg_manager,
			}),
		},
		update: {
			data: JSON.stringify({
				project_name,
				mod_name: row?.name,
				type: pkg_manager,
			}),
		},
		uninstall: {
			data: JSON.stringify({
				project_name,
				mod_name: row?.name,
			}),
		},
	}
	// 请求方法
	const requestFun: Map<string, AnyFunction> = new Map([
		['install', installModule],
		['update', upgradeModule],
		['uninstall', uninstallModule],
	])

	const fn = requestFun.get(type) as AnyFunction
	const params = paramsType[type]

	const res: AnyObject = await useDataHandle({
		loading: '正在操作,请稍后...',
		request: fn(params),
	})
	console.log(res)
	if (res?.data?.status) {
		modForm.value.mod_name = ''
		getModules()
		Message.success(res?.data?.data)
	} else {
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: res?.data?.error_msg,
			type: 'error',
			duration: 0,
			showClose: true,
		}) // 提示错误信息
	}
}

let useSocket: Socket | null = null
/**
 * @description 创建websocket
 */
const createWebSocket = () => {
	useSocket = createSocket({
		route: '/sock_shell',
		onMessage: onWSReceive,
	})
}
/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	const data = e.data
	// 拼接安装信息
	installMessage.value += '\n' + data
	if (data.includes('Done')) useSocket?.close()
}

/**
 * @description 安装模块
 */
const handleAllInstallEvent = async () => {
	try {
		installMessage.value = ''
		const res: any = installPackages({
			data: JSON.stringify({ project_name: siteInfo.value.name }),
		})
		createWebSocket()
		useSocket?.send({ 'x-http-token': window.vite_public_request_token })
		useSocket?.send('tail -f /www/server/panel/logs/npm-exec.log')
		installPopup.value = true
		resMsg.value = await res
		let { data } = await res
		if (!data.status) {
			Message.request({ status: data.status, msg: data.data || data.msg })
			useSocket?.close()
			// installPopup.value = false
		}
		Message.msg({
			customClass: 'bt-message-error-html',
			dangerouslyUseHTMLString: true,
			message: resMsg.value.data.data,
			type: resMsg.value.status ? 'success' : 'error',
		}) // 提示错误信息
	} catch (error) {
		console.log(error)
	}
}

const tableColumns = useTableColumn() // 响应式数据

onMounted(getModules)
defineExpose({ init: getModules })

// 页面销毁时关闭socket
onBeforeUnmount(() => {
	useSocket?.close()
})
</script>
