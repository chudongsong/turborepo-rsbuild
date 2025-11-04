<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<div class="flex items-center">
					<bt-btn-group :options="tableBtnGroup" />
					<div class="bg-darker w-1px h-2rem mx-8"></div>
					<el-button type="default" @click="openAlarm">定期扫描</el-button>
				</div>
			</template>
			<template #content>
				<bt-table ref="portTable" :column="tableColumn" :data="table.data" v-bt-loading="table.loading" max-height="500" :description="'文件完整性列表为空'" v-bt-loading:title="'正在加载文件完整性列表，请稍后...'"></bt-table>
			</template>
			<template #footer-right>
				<bt-table-page v-model:page="search.p" v-model:row="search.limit" :total="table.total" @change="getResultData" />
			</template>
		</bt-table-group>
		<bt-help :options="help_list" class="mx-[1.6rem] my-[0.6rem]"></bt-help>
		<bt-dialog :title="`[${detail.data.File}]详情`" v-model="detail.visible" :show-footer="false" :area="[60]">
			<div class="p-[2rem]">
				<el-descriptions class="margin-top table-descriptions" :column="2" border>
					<el-descriptions-item label="文件大小">
						{{ getByteUnit(detail.data.Size) }}
					</el-descriptions-item>
					<el-descriptions-item>
						<template #label>最近一次修改时间</template>
						{{ detail.data.Mtime }}
					</el-descriptions-item>
					<el-descriptions-item :span="2">
						<template #label>创建时间</template>
						{{ detail.data.Time }}
					</el-descriptions-item>
					<el-descriptions-item>
						<template #label>建议</template>
						{{ detail.data.Suggestion }}
					</el-descriptions-item>
				</el-descriptions>
				<div class="mt-1rem detail-info">
					<div>
						<div class="">文件路径</div>
						<p>{{ detail.data.File }}</p>
					</div>
					<div>
						<div class="">MD5</div>
						<p>
							新：{{ detail.data.NewHash }}
							<br />
							旧：{{ detail.data.OldHash }}
						</p>
					</div>
				</div>
			</div>
		</bt-dialog>
	</div>
</template>
<script lang="ts" setup>
import { getFileIntegrityResult, getFileIntegrityResultHandle, getFileIntegrityResultNow } from '@/api/firewall' // 获取接口
import { useOperate } from '@/hooks/tools/table/column'
import { useDialog } from '@hooks/tools'
import { useMessage } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { getByteUnit, getPageTotal } from '@utils/index'

interface ResultData {
	Size: number
	Describe: string
	File: string
	NewHash: string
	OldHash: string
	Status: number
	Suggestion: string
	Mtime: string
	Time: string
	id: number
}

const Message = useMessage()

const table = ref({
	total: 0,
	loading: false,
	data: [] as ResultData[],
})
const search = reactive({
	p: 1,
	limit: 50,
})

// 详情信息
const detail = reactive({
	visible: false,
	data: {
		Describe: '',
		File: '',
		NewHash: '',
		OldHash: '',
		Status: 0,
		Suggestion: '',
		Time: '',
		id: 0,
	} as ResultData,
})

// 表格左上方按钮组
const tableBtnGroup = [
	{
		active: true,
		content: '立即检测',
		event: () => {
			immediateDetection()
		},
	},
	{
		content: '检测目录',
		event: () => {
			useDialog({
				title: '检测目录',
				area: 58,
				isAsync: true,
				component: () => import('@firewall/views/safe-detect/file-integrity-detection/dir-monitor/index.vue'),
			})
		},
	},
]
// 底部提示
const help_list = [{ content: '注意：初次使用请先添加检测目录，当前表格仅展示检测目录的结果' }, { content: '检测内容主要以系统重要执行文件为主' }, { content: '若出现风险项将在首页上展示' }]

// 处理文件结果
const optFileResult = async (row: any) => {
	useDataHandle({
		request: getFileIntegrityResultHandle({ path: row.File }),
		message: true,
		success: (res: any) => {
			if (res.status) {
				getResultData()
			}
		},
	})
}
// 获取检测结果详情
const getResultDetails = (row: any) => {
	// 获取检测结果详情
	detail.visible = true
	detail.data = row
}
// 自动检测
const openAlarm = () => {
	useDialog({
		title: '定期扫描',
		area: 48,
		isAsync: true,
		showFooter: true,
		component: () => import('./file-integrity-auto-check/index.vue'),
	})
}

// 表格配置
const tableColumn = [
	{ label: '所在目录', prop: 'File' },
	{ label: '描述', prop: 'Describe' },
	{
		label: '状态',
		prop: 'Status',
		render: (row: any) => {
			return h(
				'span',
				{
					class: row.Status !== 1 ? 'text-primary' : 'text-warning',
				},
				row.Status !== 1 ? '正常' : '异常'
			)
		},
	},
	{ label: '最后一次修改时间', prop: 'Mtime', minWidth: 120 },
	useOperate([
		{ onClick: optFileResult, title: '已处理', width: 50 },
		{ onClick: getResultDetails, title: '详情' },
	]), // 操作
]

const immediateDetection = async () => {
	// 立即检测
	useDataHandle({
		request: getFileIntegrityResultNow(),
		loading: '正在检测中，请稍后...',
		message: true,
		success: (res: any) => {
			if (res.status) {
				getResultData()
			}
		},
	})
}

// 获取结果数据
const getResultData = async () => {
	useDataHandle({
		request: getFileIntegrityResult(search),
		loading: toRef(table.value, 'loading'),
		data: {
			data: [Array, toRef(table.value, 'data')],
			page: [
				String,
				(page: string) => {
					table.value.total = getPageTotal(page)
				},
			],
		},
	})
}
onMounted(() => {
	getResultData()
})
</script>
<style lang="css" scoped>
.detail-info > div {
	@apply mt-2rem;
}

.detail-info > div > div {
	@apply font-bold text-base mb-[.8rem];
}

.detail-info > div > p {
	@apply bg-darker border-darker text-secondary p-[0.6rem] rounded-small;
}
</style>
