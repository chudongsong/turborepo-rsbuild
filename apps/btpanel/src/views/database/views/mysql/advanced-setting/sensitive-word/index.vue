<template>
	<div class="h-full">
		<bt-install-mask v-if="!softData.setup" :options="{ name: 'sphinx', title: 'Sphinx' }"> </bt-install-mask>
		<bt-removed-tips />
		<div class="flex items-center flex-col w-full">
			<div class="border border-dark p-20px flex items-center w-full">
				<div class="flex flex-col w-full">
					<div class="w-full flex items-center">
						服务器<el-select @change="getSearchData" class="!w-[14rem] mx-8px" v-model="sensitiveForm.sid">
							<el-option v-for="(item, index) in serverList" :key="index" :value="item.id" :label="item.db_host"></el-option>
						</el-select>
						数据库
						<el-select @change="onDatabaseChange" class="!w-[14rem] mx-8px" v-model="sensitiveForm.db_name">
							<el-option v-for="(item, index) in databaseNameList" :key="index" :value="item.name" :label="item.name"></el-option>
						</el-select>
						数据库表<el-select class="mx-8px !w-[14rem]" v-model="sensitiveForm.tb_name">
							<el-option v-for="(item, index) in tableNameList" :key="index" :value="item.value" :label="item.name"></el-option>
						</el-select>
					</div>
					<div class="flex items-center mt-12px justify-between">
						<div class="flex items-center w-full">
							<span class="">搜索内容</span>
							<bt-input class="ml-8px !w-[28rem]" placeholder="请输入查询的语句或内容，该字段可为空" v-model="sensitiveForm.search_content"></bt-input>
						</div>
						<div class="flex justify-center items-center">
							<el-button type="primary" @click="onSubmit" :disabled="tableLoading">
								搜索
								<i class="svgtofont-el-loading animate-spin text-base" v-show="tableLoading"></i
							></el-button>
							<el-button @click="getIndexPopup">索引记录</el-button>
						</div>
					</div>
				</div>
			</div>
			<bt-table max-height="420" class="mt-16px" v-bt-loading="tableLoading" v-bt-loading:title="'正在搜索中，请稍后...'" :column="tableColumn" :data="resultData"></bt-table>
			<bt-dialog v-model="indexRecordPopup" title="索引记录" :area="60">
				<div class="p-20px">
					<bt-table max-height="300" class="w-full mt-24px" :column="indexColumn" :data="indexData"></bt-table>
				</div>
			</bt-dialog>
		</div>
	</div>
</template>
<script lang="tsx" setup>
import type { CloudServerItem } from '@database/types'

import { useSocket as createSocket, Socket } from '@hooks/tools'
import { getPluginInfo } from '@/api/global'
import { Message } from '@hooks/tools'
import { getSphinxDatabase, delIndexList, getIndexList, getMysqlCloudServer } from '@/api/database'
import { useConfirm, useDataHandle } from '@hooks/tools'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})
const softData = ref<any>({}) // 软件信息
const serverList = ref<CloudServerItem[]>([]) // 服务器列表

const resultData = ref<Array<any>>([]) // 分析结果
const showOutput = ref(false) // 是否显示导出分析按钮

const indexRecordPopup = ref(false) // 索引记录弹窗
const databaseNameList = ref() // 数据库名称
const tableNameList = ref() // 数据库表名称
const tableColumn = ref([{ label: '数据列' }]) // 表格列配置
const tableLoading = ref(false) // 表格loading
const header = { 'x-http-token': window.vite_public_request_token }

const sensitiveForm = reactive<any>({
	sid: 0,
	model_index: 'project',
	mod_name: 'sphinx_search',
	def_name: 'sphinx_search',
	ws_callback: '1',
	p: 1,
	db_name: '',
	tb_name: '',
	search: '',
}) // 表单

const indexColumn = [
	{ label: '数据库名称', prop: 'db_name' },
	{ label: '表名称', prop: 'tb_name' },
	{ label: '端口号', prop: 'search_port' },
	{ label: '索引时间', prop: 'create_index' },
	{ label: '索引大小', prop: 'size' },
	{
		label: '操作',
		render: function (row: any) {
			return (
				<span onClick={() => delIndexPopup(row)} class="bt-link">
					删除
				</span>
			)
		},
	},
] // 索引记录表格列配置

const indexData = ref([]) // 索引记录数据

/**
 * @description 获取详情数据
 * @param {any} row 行数据
 */
const getIndexPopup = async (row: any) => {
	indexRecordPopup.value = true
	try {
		await useDataHandle({
			loading: '正在获取索引记录, 请稍后...',
			request: getIndexList({ sid: sensitiveForm.sid }),
			data: { data: [Array, indexData] },
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 删除索引记录
 * @param {any} row 行数据
 */
const delIndexPopup = async ({ db_name, tb_name }: any) => {
	try {
		await useConfirm({
			title: '删除索引记录',
			content: `删除索引记录后，该索引记录将永久消失，是否继续操作？`,
			icon: 'warning-filled',
		})
		await useDataHandle({
			loading: '正在删除索引记录, 请稍后...',
			request: delIndexList({ sid: sensitiveForm.sid, db_name, tb_name }),
			message: true,
			success: getIndexList,
		})
	} catch (error) {
		console.log(error)
	}
}
/**
 * @description 数据库名称变更
 * @param {string} val 数据库名称
 */
const onDatabaseChange = (val: string) => {
	// 在controlOptions.value中找到对应的数据库表，并赋值给tableNameList
	const tableList = databaseNameList.value.find((item: any) => item.name === val).table_list
	tableNameList.value = tableList
	sensitiveForm.tb_name = tableList.length ? tableList[0].value : ''
}

/**
 * @description 获取选项数据 初始化
 */
const getSearchData = async () => {
	try {
		await useDataHandle({
			loading: '正在获取服务器数据，请稍后...',
			request: getSphinxDatabase({ sid: sensitiveForm.sid }),
			data: { data: [Array, databaseNameList] },
		})
		// 默认选中第一个数据库
		sensitiveForm.db_name = databaseNameList.value[0]?.name
		// 表赋值
		tableNameList.value = databaseNameList.value[0]?.table_list
		// 默认选中第一个表
		sensitiveForm.tb_name = databaseNameList.value[0]?.table_list[0]?.value
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 提交分析
 */
const onSubmit = async () => {
	if (!sensitiveForm.db_name || !sensitiveForm.tb_name) return Message.error('请选择数据库和表')
	tableLoading.value = true // 开启表格loading
	showOutput.value = false // 隐藏导出分析按钮
	createWebSocket()
	resultData.value = []
	// 处理数据格式
	useSocket?.send(sensitiveForm)
}

/**
 * @description 创建websocket
 */
let useSocket: Socket | null = null
const createWebSocket = () => {
	useSocket = createSocket({
		route: '/ws_model',
		onMessage: onWSReceive,
	})
}

/**
 * @description 消息接收检测和输出
 * @param {MessageEvent} e 对象
 */
const onWSReceive = (ws: WebSocket, e: MessageEvent) => {
	if (e.data === 'token error') {
		Message.error('token error')
		useSocket?.close()
		tableLoading.value = false
		return
	}
	// 首次接收消息，发送给后端，进行同步适配
	const msg = JSON.parse(e.data)
	if (msg.status === false) {
		Message.error(msg.msg)
		tableLoading.value = false
		useSocket?.close()
		return
	}
	// 将field_list中的数据处理赋值给表格列
	if (msg.type === 1) {
		tableColumn.value = msg.data.field_list.map((item: any) => ({ label: item, prop: item, showOverflowTooltip: true }))
	}
	// 将数据处理赋值给表格数据
	if (msg.type === 2) {
		const obj: any = {},
			valueData: any = {}
		tableColumn.value.forEach((item: any) => (obj[item.prop] = ''))
		for (let i = 0; i < msg.data.length; i++) {
			const item = msg.data[i]
			const keysData = Object.keys(obj)
			valueData[keysData[i]] = item
		}
		resultData.value.push(valueData)
	}
	if (Object.keys(msg).includes('result')) {
		useSocket?.close()
		tableLoading.value = false
		Message.success('搜索完成')
	}
}

/**
 * @description 获取软件信息
 */
const getSoftFindData = async () => {
	try {
		const res = await getPluginInfo({ sName: 'sphinx' })
		softData.value = res.data
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取服务器列表
 */
const getServerList = async () => {
	await useDataHandle({
		loading: '正在获取服务器数据，请稍后...',
		request: getMysqlCloudServer(),
		data: [Array, serverList],
	})
	sensitiveForm.sid = serverList.value[0]?.id
}

const init = async () => {
	await getSoftFindData()
	if (softData.value.setup) {
		await getSearchData()
		getServerList()
	}
}

onMounted(init)

onUnmounted(() => {
	useSocket?.close()
	useSocket = null
})

defineExpose({ init })
</script>
