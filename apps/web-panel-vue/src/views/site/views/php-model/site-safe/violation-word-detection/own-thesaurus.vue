<template>
	<bt-table-group class="px-[1.6rem] py-[1.6rem]">
		<template #header-left>
			<el-button @click="addPopup = true" type="primary">添加</el-button>
			<el-button @click="importEvent">导入</el-button>
			<el-button @click="keywordsExport">导出</el-button>
			<el-button @click="clearThesaurusEvent">清空</el-button>
			<UploadThesaurus ref="fileIpRef" @upload-success="changeInputFile"></UploadThesaurus>
		</template>
		<template #content>
			<bt-table max-height="260" :column="tableColumn" :data="tableData" v-bt-loading="isLoading" :description="'词库列表为空'" v-bt-loading:title="'正在加载词库列表，请稍后...'"></bt-table>
		</template>
		<template #popup>
			<bt-dialog title="添加自定义词库" v-model="addPopup" :area="42" @confirm="addKeyWordEvent" showFooter>
				<el-form ref="addThesaurusRef" :rules="rules" :model="addForm" class="p-[2rem]" label-width="5rem">
					<el-form-item label="关键词" prop="key">
						<bt-input v-model="addForm.key" width="20rem" placeholder="请输入你需要扫描的关键词"></bt-input>
					</el-form-item>
					<ul class="leading-8 text-small list-disc ml-20px">
						<li>关键字小于2时会引起大量误报，请设置大于等于2个关键字！</li>
					</ul>
				</el-form>
			</bt-dialog>
		</template>
	</bt-table-group>
</template>
<script lang="tsx" setup>
import { addThesaurus, clearThesaurus, delThesaurus, getThesaurus, outThesaurus } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'
import UploadThesaurus from './upload-thesaurus.vue'
import { useOperate } from '@/hooks/tools/table/column'

const fileIpRef = ref<any>(null) // 上传文件
const tableData = ref([]) // 表格数据
const isLoading = ref(false) // 表格加载状态

const addThesaurusRef = ref<any>() // 添加弹窗
const addPopup = ref(false) // 添加弹窗
const addForm = reactive<any>({
	key: '',
})

// 校验规则
const rules = reactive({
	key: [{ trigger: ['blur', 'change'], required: true, message: '请输入关键词' }],
})

const importEvent = async () => {
	fileIpRef.value.open()
}

/**
 * @description 导出关键词文件
 */
const keywordsExport = () => {
	useDataHandle({
		loading: '正在导出关键词文件，请稍后...',
		request: outThesaurus(),
		data: { msg: String },
		success: (res: any) => {
			if (res.msg) window.open('/download?filename=' + res.msg, '_blank', 'noopener,noreferrer')
		},
	})
}

/**
 * @description 上传文件
 * @param {any} e 上传文件
 */
const changeInputFile = async (e: any) => {
	getThesaurusEvent()
}

/**
 * @description 删除关键词
 * @param {any} data 行数据
 */
const delThesaurusEvent = async (data?: any) => {
	await useDataHandle({
		loading: '正在删除关键词，请稍后...',
		request: delThesaurus({ key: data }),
		message: true,
	})
	getThesaurusEvent()
}

// 表格数据
const tableColumn = [{ label: '关键词	', render: (row: any) => <span>{row}</span> }, useOperate([{ onClick: delThesaurusEvent, title: '删除' }])]

/**
 * @description 清空自定义词库
 */
const clearThesaurusEvent = async () => {
	await useDataHandle({
		loading: '正在清空自定义词库，请稍后...',
		request: clearThesaurus(),
		message: true,
	})
	getThesaurusEvent()
}

/**
 * @description 获取词库列表
 */
const getThesaurusEvent = async () => {
	isLoading.value = true
	await useDataHandle({
		loading: '正在加载词库列表，请稍后...',
		request: getThesaurus(),
		data: [Array, tableData],
	})
	isLoading.value = false
}

/**
 * @description 添加关键词
 */
const addKeyWordEvent = async (close: Function) => {
	await addThesaurusRef.value.validate()
	await useDataHandle({
		loading: '正在添加关键词，请稍候...',
		request: addThesaurus(addForm),
		message: true,
		success: (res: any) => {
			if (res.status) {
				addForm.key = ''
				addPopup.value = false
				getThesaurusEvent()
			}
		},
	})
}

// 页面加载完成
onMounted(() => getThesaurusEvent())
</script>
