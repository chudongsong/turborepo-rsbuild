<!-- 动态查杀 -->
<template>
	<div>
		<bt-table-group v-if="payment.authType === 'ltd'">
			<template #header-left>
				<div class="flex items-center">
					<el-button type="default" @click="spywareWhiteListDialog"> 白名单 </el-button>
					<bt-divider></bt-divider>
					<div class="mr-8px">动态查杀站点</div>
					<div>
						<el-switch v-model="onShellStatus" :width="36" @change="onChangeSpywareDetection"></el-switch>
					</div>
				</div>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getList"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table :column="tableColumns" :max-height="400" :data="tableData" v-bt-loading="tableLoading" />
			</template>
			<template #footer-left>
				<ul class="mt-8px leading-8 text-small list-disc ml-20px">
					<li>注意：隔离文件后的数字表示隔离文件总数。</li>
					<li class="text-warning">动态查杀开启后，当查杀目录中的文件发生修改就会自动的进行木马查杀并进行隔离</li>
				</ul>
			</template>
			<template #footer-right></template>
			<template #popup>
				<bt-dialog title="在线编辑" showFooter v-model="editorPopup" :area="70" @confirm="saveFile">
					<div class="p-20px">
						<bt-editor v-model="editorValue" class="!h-[40rem]"></bt-editor>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
		<bt-product-introduce v-else :data="productData"></bt-product-introduce>
	</div>
</template>

<script setup lang="ts">
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { useOperate, usePath } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { checkMonitorDir, setHandleFile, setMonitorDir, webshellFileSingle } from '@api/site'
import { SITE_STORE, useSiteStore } from '@site/useStore'

const { getFileEvent, saveFileEvent } = SITE_STORE()

const Message = useMessage() // 消息提示

const { payment } = useGlobalStore()

const { siteInfo } = useSiteStore()

const tableData = ref<any>([]) // 响应式数据
const tableLoading = ref(false) //  加载状态
const editorValue = ref('') // 样本文件内容
const editorPopup = ref(false) //  弹窗
const rowData = ref<any>({}) // 行数据

const onShellStatus = ref(false) // 动态查杀开关状态

const productData = reactive({
	title: '动态查杀-功能介绍',
	ps: '当查杀站点目录中的文件发生修改就会自动的进行木马查杀并进行隔离',
	source: 185,
	desc: ['网页内容修改检测', '木马查杀隔离'],
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/site/dynamic_kill.png',
		},
	],
})

/**
 * @description 白名单弹窗
 */
const spywareWhiteListDialog = () => {
	useDialog({
		isAsync: true,
		title: '白名单',
		area: [70, 55],
		component: () => import('@firewall/public/safa-detect-whitelist/index.vue'),
		showFooter: false,
	})
}

/**
 * @description 获取动态查杀开关状态
 */
const checkMessage = async () => {
	try {
		const res = await checkMonitorDir({
			path: siteInfo.value.path,
		})
		onShellStatus.value = res.data.is_run
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 动态查杀开关
 */
const onChangeSpywareDetection = async (val: boolean) => {
	await useDataHandle({
		loading: '正在设置中，请稍后...',
		request: setMonitorDir(val ? false : true, {
			path: siteInfo.value.path,
		}),
		message: true,
	})
	checkMessage()
}

/**
 *@description 保存文件
 */
const saveFile = async () => {
	const res = await saveFileEvent({
		path: rowData.value.path,
		data: editorValue.value,
		encoding: 'utf-8',
	})
	Message.request(res)
}

/**
 * @description 获取动态查杀列表
 */
const getList = async () => {
	tableLoading.value = true
	try {
		const res = await webshellFileSingle({
			path: (siteInfo.value.path + '/').replace('//', '/'),
		})
		tableData.value = Array.isArray(res.data) ? res.data : []
	} catch (error) {
		console.log(error)
	}
	tableLoading.value = false
}

/**
 * @description 删除事件
 */
const delEvent = (row: any) => {
	useConfirm({
		title: '删除文件',
		content: '是否要删除关联的源文件?',
		type: 'check',
		icon: 'warning',
		check: {
			content: '源文件',
			onConfirm: (status: boolean) => {
				useDataHandle({
					loading: '正在删除文件中，请稍后...',
					request: setHandleFile({
						data: JSON.stringify({
							path: row.path,
							md5: row.md5,
							type: status ? 'delete' : '',
						}),
					}),
					message: true,
					success: (res: any) => {
						if (res.status) getList()
					},
				})
			},
		},
	})
}

/**
 * @description 查看样本文件
 */
const sampleFileEvent = async (row: any) => {
	rowData.value = row
	const res = await getFileEvent({ path: row.path })
	console.log(res, '3423')
	if (!res.status) {
		Message.request(res)
		return false
	} else {
		editorValue.value = res.data.data || res.msg
		editorPopup.value = true
	}
}

const tableColumns = ref([
	{
		label: '隔离时间',
		prop: 'time',
	},
	usePath(),
	useOperate([
		{
			width: 80,
			onClick: sampleFileEvent,
			title: '样本文件',
		},
		{ onClick: delEvent, title: '删除' },
	]), // 操作
]) // 表格列配置

onMounted(() => {
	if (payment.value.authType === 'ltd') {
		checkMessage()
		getList()
	}
})
</script>
