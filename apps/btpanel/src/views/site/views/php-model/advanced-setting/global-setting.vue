<template>
	<div class="flex flex-col site-globa-setting-module" v-bt-loading="viewLoading">
		<div>
			<el-form ref="globalSettingRef" :model="logForm" :rules="rules">
				<el-form-item label="日志切割">
					<div class="flex items-center">
						<el-switch @change="handleChangeStatus" v-model="logForm.log_split"></el-switch>
						<span class="text-tertiary ml-[4px]">*提示：开启该选项将自动创建网站日志切割任务，当存在所有网站日志切割任务时不会新建</span>
					</div>
				</el-form-item>
				<el-form-item label="预设日志路径" prop="log_path">
					<div class="flex items-center">
						<bt-input-icon v-model="logForm.log_path" icon="icon-file_mode" @icon-click="onPathChange"></bt-input-icon>
						<el-button type="primary" class="!ml-1rem" @click="handleSaveEvent">保存</el-button>
					</div>
				</el-form-item>
			</el-form>
		</div>
		<el-divider></el-divider>
		<el-form :model="defalutForm">
			<el-form-item label="默认页面设置">
				<div class="flex items-center">
					<el-switch @change="handleChangeStatus" v-model="defalutForm.page_index"></el-switch>
					<span class="ml-[4px] mb-[2px]">自动生成index.html(默认首页)</span>
				</div>
			</el-form-item>
			<el-form-item label=" ">
				<div class="flex items-center">
					<el-switch @change="handleChangeStatus" v-model="defalutForm.page_404"></el-switch>
					<span class="ml-[4px] mb-[2px]">自动生成404.html(默认404页面)</span>
				</div>
			</el-form-item>
		</el-form>
		<bt-help :options="[{ content: '请注意，仅对后续创建的PHP网站生效。' }]" class="ml-[20px] mt-[20px]"></bt-help>

		<el-divider></el-divider>
		<el-form :model="totalFlowForm">
			<el-form-item label="日流量统计">
				<div class="flex items-center">
					<el-switch @change="handleChangeTotalFlow" v-model="totalFlowForm.total_flow"></el-switch>
					<span class="text-tertiary ml-[4px]">*提示：开启会适量占用服务器内存，如需针对某个网站单独开关请到 网站设置->其它设置 中调整。</span>
				</div>
			</el-form-item>
		</el-form>
		<bt-help :options="[{ content: '注意，关闭后网站的单独设置将失效。' },{ content: '不影响监控报表插件的配置。' }]" class="ml-[20px] mt-[20px]"></bt-help>

		<template v-if="webServerType === 'nginx'">
			<el-divider></el-divider>
			<el-form :model="cdnForm">
				<el-form-item label="cdn来源IP解析">
					<div class="flex items-center">
						<el-switch @change="handleChangeStatusCdn" v-model="cdnForm.cdn_ip"></el-switch>
						<span class="ml-[4px] mb-[2px]">
							* 请确保使用
							<span class="text-danger">安全可靠</span>
							的cdn
						</span>
					</div>
				</el-form-item>
				<el-form-item v-show="cdnForm.cdn_ip" label="来源的请求头">
					<div class="flex items-center">
						<el-autocomplete v-model="cdnForm.header" :fetch-suggestions="querySearch" placeholder="请选择或输入来源的请求头" @focus="handleFocus" @blur="handleBlur">
							<template #suffix>
								<span class="svgtofont-el-arrow-down"></span>
							</template>
						</el-autocomplete>
						<el-button type="primary" class="!ml-1rem" @click="handleChangeStatusCdn(cdnForm.cdn_ip)">保存</el-button>
					</div>
				</el-form-item>
			</el-form>
		</template>
	</div>
</template>

<script setup lang="ts">
import { useConfirm, useDataHandle } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { useHandleError } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { useGlobalStore } from '@/store/global'
import { openResultDialog } from '@/views/site/useController'
import { getGloalSetting, openCdnIp, setSitesLogPath, setSitesLogStatus, getCdnIp, getFreeTotalStatus, setFreeTotalStatus } from '@api/site'

const Message = useMessage() // 消息提示

const { plugin } = useGlobalStore()

const { webserver: webServerType } = plugin.value

const viewLoading = ref(false) // 页面加载状态
const globalSettingRef = ref<any>() // 表单实例
const logForm = reactive({
	log_split: false,
	log_path: '',
}) // 表单数据

const defalutForm = reactive({
	page_index: false,
	page_404: false,
}) // 表单数据

const totalFlowForm = reactive({
	total_flow: false,
}) // 表单数据
const cdnForm = reactive({
	cdn_ip: '',
	header: '',
}) // 表单数据
let oldHeader = ''

const rules = reactive({
	log_path: [{ required: true, message: '请选择日志路径', trigger: 'change' }],
})

const resultColumn = ref<any[]>([
	{
		label: '名称',
		prop: 'site_name',
	},
	{
		label: '结果',
		render: (row: any) => {
			return h('span', { class: row.status ? 'text-primary' : 'text-danger' }, row.status ? '操作成功' : '操作失败')
		},
	},
]) // 表格列

const options = [
	{
		value: 'X-Forwarded-For',
		label: 'X-Forwarded-For',
	},
	{
		value: 'X-Real-IP',
		label: 'X-Real-IP',
	},
	{
		value: 'X-Forwarded',
		label: 'X-Forwarded',
	},
	{
		value: 'Forwarded-For',
		label: 'Forwarded-For',
	},
	{
		value: 'Forwarded',
		label: 'Forwarded',
	},
	{
		value: 'True-Client-IP',
		label: 'True-Client-IP',
	},
	{
		value: 'Client-IP',
		label: 'Client-IP',
	},
	{
		value: 'Ali-Cdn-Real-IP',
		label: 'Ali-Cdn-Real-IP',
	},
	{
		value: 'Cdn-Src-IP',
		label: 'Cdn-Src-IP',
	},
	{
		value: 'Cdn-Real-IP',
		label: 'Cdn-Real-IP',
	},
	{
		value: 'Cf-Connecting-IP',
		label: 'Cf-Connecting-IP',
	},
	{
		value: 'X-Cluster-Client-IP',
		label: 'X-Cluster-Client-IP',
	},
	{
		value: 'Wl-Proxy-Client-IP',
		label: 'Wl-Proxy-Client-IP',
	},
	{
		value: 'Proxy-Client-IP',
		label: 'Proxy-Client-IP',
	},
]

const querySearch = (queryString: string, cb: any) => {
	cb(options)
}

/**
 * 获取全局设置
 */
const getGloalData = async () => {
	viewLoading.value = true
	try {
		const { data } = await getGloalSetting()
		logForm.log_path = data.log_path
		logForm.log_split = data.log_split
		defalutForm.page_index = data.page_index
		defalutForm.page_404 = data.page_404
		cdnForm.cdn_ip = data.cdn_ip
	} catch (error) {
		console.log(error)
	} finally {
		viewLoading.value = false
	}
}

const handleSaveEvent = async () => {
	await globalSettingRef.value.validate()
	await useConfirm({
		title: '修改日志路径',
		content: '是否修改日志预设路径,继续执行?',
		type: 'check',
		icon: 'warning-filled',
		check: {
			content: '更改已有网站日志',
			value: true,
			onConfirm: async (status: boolean) => {
				try {
					const res = await setSitesLogPath({
						mv_log: '1',
						change_sites: status ? '1' : '0',
						log_path: logForm.log_path,
					})
					if (status) {
						openResultDialog({
							resultColumn: resultColumn.value,
							resultData: res.data,
							resultTitle: '修改日志路径',
							title: '修改日志路径结果',
						})
					} else {
						Message.request(res)
					}
				} catch (error) {
					useHandleError(error)
				}
			},
		},
	})
}

const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: logForm.log_path,
		change: (path: any) => {
			logForm.log_path = path
		},
	})
}

const handleChangeStatus = async () => {
	useDataHandle({
		loading: '正在设置，请稍后...',
		request: setSitesLogStatus({
			log_split: logForm.log_split,
			page_index: defalutForm.page_index,
			page_404: defalutForm.page_404,
		}),
		message: true,
	})
}

const handleChangeStatusCdn = async (val: any) => {
	useDataHandle({
		loading: '正在设置，请稍后...',
		request: openCdnIp({
			cdn_ip: val,
			header_cdn: cdnForm.header,
		}),
		message: true,
		success: getGloalData,
	})
}
/**
 * @description 开启日流量统计
 */
const handleChangeTotalFlow = async () => {
	try {
	if(!totalFlowForm.total_flow){
		await useConfirm({
			title: '关闭日流量统计',
			content: '关闭全局日流量统计后,网站的单独设置将失效,是否继续执行?',
		})
	}
	useDataHandle({
		loading: '正在设置，请稍后...',
		message: true,
		request: setFreeTotalStatus({
			site_id: 'global',
			status: totalFlowForm.total_flow ? 1 : 0,
		}),
		success: (res) => {
			if(!res.status){
				totalFlowForm.total_flow = !totalFlowForm.total_flow
			}
		}
	})
	} catch (error) {
		totalFlowForm.total_flow = !totalFlowForm.total_flow
	}
}
/**
 * 获取cdn来源IP解析
 */
const getCdnIpData = async () => {
	const { data } = await getCdnIp()
	cdnForm.header = data.header_cdn || 'X-Forwarded-For'
}

const handleFocus = () => {
	oldHeader = cdnForm.header
	cdnForm.header = ''
}

const handleBlur = () => {
	if (cdnForm.header === '') {
		cdnForm.header = oldHeader
	}
}

/**
 * @description 获取日流量配置情况
 */
const getFreeTotalStatusData = async () => {
	const { data } = await getFreeTotalStatus({site_id:'global'})
	totalFlowForm.total_flow = data.data.status
}

onMounted(() => {
	getGloalData()
	getCdnIpData()
	getFreeTotalStatusData()
})
</script>

<style lang="css" scoped>
.site-globa-setting-module :deep(.el-form-item__content) {
	font-size: var(--el-font-size-small);
}
</style>
