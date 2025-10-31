<template>
	<section>
		<!-- 标题 -->
		<div class="text-black text-base pl-[1.6rem] pt-[1.6rem]">选择{{ selectType }}</div>
		<!-- 主体 -->
		<div class="p-[1.6rem] flex justify-between">
			<div class="file-selector-head">
				<!-- 上一层 -->
				<i title="返回上一层" class="bt-open-icon inline-block !rounded-tl-large !rounded-bl-large" @click="goBack"> <BtIcon icon="el-back" class="leading-[2rem]" /></i>
				<!-- 路径 -->
				<div ref="pathInputRef" class="file-selector-input overflow-hidden">
					<ul v-if="isTagMode" ref="pathRef" class="absolute top-[1px] left-[1px] h-[28px] z-1 flex rounded-none bg-light">
						<li v-for="(item, key) in showPathList" :key="key" class="flex items-center px-[1rem]" @click="filePathJump(item.path)">
							<span class="truncate max-w-[8rem]">{{ item.title }}</span>
							<i class="ml-[0.4rem] flex items-align">
								<BtIcon icon="el-arrow-right" />
							</i>
						</li>
					</ul>
					<BtInput v-model="temporaryPath" class="!w-[400px]" @focus="temporaryFocus" @blur="temporaryBlur" @keyup.enter="temporaryEnter" />
				</div>
				<!-- 刷新 -->
				<i title="刷新" class="bt-open-icon inline-block !rounded-tr-large !rounded-br-large" @click="getDirList()">
					<BtIcon icon="el-refresh-right" class="leading-[2rem]" />
				</i>
			</div>
			<!-- 搜索内容 -->
			<BtInputSearch v-model="fileSerachText" placeholder="搜索文件/目录" class="!w-[220px]" @search="fileSearch" />
		</div>

		<!-- 新建文件/文件夹 -->
		<div class="ml-[1.6rem] mb-[1.6rem]">
			<!-- <span class="create-file-btn mr-[0.8rem]" @click="createDiskStructure('File')">新建文件</span>
			<span class="create-file-btn" @click="createDiskStructure('Dir')">新建文件夹</span> -->
			<el-button type="default" :disabled="disabledCreate" @click="createDiskStructure('File')">新建文件</el-button>
			<el-button type="default" :disabled="disabledCreate" @click="createDiskStructure('Dir')">新建文件夹</el-button>
		</div>

		<div class="flex h-[48rem] file-selector-main">
			<!-- 磁盘列表 -->
			<div class="w-[16rem] h-full pt-[1.2rem] text-xl inline-block overflow-auto disk-list">
				<ul class="flex items-center flex-col">
					<li v-for="(item, key) in diskList" :key="key" class="flex p-[0.8rem] pl-[1.6rem] items-center w-full" @click="diskPathJump(item.path)">
						<i class="file-disk-icon mr-[0.8rem] text-base"></i>
						<span class="w-full truncate" :title="item.path === '/' ? `${'根目录'}` : item.path"> {{ item.path === '/' ? '根目录' : item.path }} ({{ item.size[2] }}) </span>
					</li>
				</ul>
			</div>
			<!-- 文件列表 -->
			<div class="h-full w-full inline-block flex w-[59rem]">
				<BtTable
					ref="tableRef"
					v-bt-loading="loading"
					v-bt-loading:title="'正在加载文件列表，请稍后...'"
					empty-text="(空)"
					max-height="480"
					highlight-current-row
					class="file-selector-table"
					:column="fileSelectorColumn"
					:data="fileSelectorData"
					:span-method="arraySpanMethod"
					:border="false"
					@current-change="handleCurrentChange"
					@row-dblclick="handleRowDBClick" />
			</div>
		</div>

		<!-- 底部 -->
		<div class="flex justify-between bg-light p-[1.2rem] pr-[1.6rem] rounded-base">
			<div class="ml-[9.6rem]">
				<div v-if="isAction" class="flex align-middle items-center">
					<span>当前选中{{ selectType }}：</span>
					<span class="bg- rounded-large px-4 h-12 leading-[2.8rem] w-[30rem] inline-block border-light border-1 border-opacity-20 truncate">
						{{ fileSelectedItem?.title }}
					</span>
				</div>
			</div>
			<span class="flex">
				<BtButton type="default" class="BtButton--cancel" @click="emits('close')"> 取消 </BtButton>
				<BtButton type="primary" :disabled="!isAction" @click="onConfirm()">
					{{ compData.confirmText || '确认' }}
				</BtButton>
			</span>
		</div>
	</section>
</template>

<script lang="tsx" setup>
import { useGlobalStore } from '@/store/global'
import { formatTime, getPckageVm } from '@/utils'
import { getSelectDir } from '@api/global'
import { useMessage } from '@message/index'
import { useResizeObserver } from '@vueuse/core'
import CreateFile from './create-file.vue'

interface Props {
	compData: {
		type: 'all' | 'file' | 'dir'
		path?: string
		change?: (path: string, type: string) => void
		confirmText?: string
		disabledCreate?: boolean
		customRequest?: boolean
		customRequestApi?: (params: { path: string; disk: boolean; search: string }) => Promise<{ status: boolean; data: any }>
	}
}
interface FileColumnParams {
	title: string
	name: string
	mtime: string
	accept: string
	path: string
	type: string
	create?: boolean
}
interface FileColumn {
	title: string
	path: string
}

const emits = defineEmits(['close'])

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		type: 'all',
		path: '/www/wwwroot',
		change: () => {},
		confirmText: '确认',
		customRequest: false,
		disabledCreate: false,
		customRequestApi: () => {
			return Promise.resolve({
				status: true,
				data: {},
			})
		},
	}),
})
const { type, path: currentPath, change, disabledCreate } = props.compData

const { error: $error, request: $request } = useMessage()
const { panel } = useGlobalStore()

const pathRef = ref() // 路径ulRef
const pathInputRef = ref() // 路径Ref
const inputWidth = ref(0) // 路径框宽度
const ulWidth = ref(0) // 路径框宽度
// 选中路径
const fileSelectedPath = ref('')

// 变量
const tableRef = ref()
const pathType = ref(type) // 文件类型
const loading = ref(false)
const isTagMode = ref(true) // 是否是标签模式
const isAction = ref(false) // 是否有操作
const filePath = ref(currentPath || panel.value.sitePath) // 当前路径
const temporaryPath = ref(currentPath || panel.value.sitePath) // 临时路径
const pathList = shallowRef<FileColumn[]>([]) // 当前路径列表
const showPathList = shallowRef<FileColumn[]>([]) // 显示路径列表
const diskList = ref<{ path: string; size: AnyObject }[]>([]) // 文件磁盘列表
const fileSerachText = ref('') // 文件搜索内容
const fileSelectedItem = ref<FileColumnParams | FileColumn | any>() // 当前选中名称
const fileSelectorData = ref<FileColumnParams[]>() // 文件选择器数据

const selectType = computed(() => {
	return pathType.value === 'file' ? '文件' : pathType.value === 'dir' ? '文件夹' : '文件/文件夹'
})

//  监听路径栏宽度
useResizeObserver(pathInputRef, entries => {
	// 动态获取路径栏宽度
	const entry = entries[0]
	const { width } = entry.contentRect
	inputWidth.value = width
})

// 监听路径栏宽度
useResizeObserver(pathRef, entries => {
	// 动态获取路径栏宽度
	const entry = entries[0]
	const { width } = entry.contentRect
	ulWidth.value = width
	// 路径栏宽度大于路径框宽度时，隐藏多余的路径
	if (ulWidth.value > inputWidth.value) {
		//	显示最后4项
		showPathList.value = pathList.value.slice(-4)
	}
})

// 文件表格列结构
const fileSelectorColumn = ref([
	{
		label: '名称',
		prop: 'name',
		showOverflowTooltip: false,
		render: (row: any) => {
			if (row.create && isCreateStatus) {
				return (
					<CreateFile
						type={row.type}
						path={filePath.value}
						filelist={fileSelectorData}
						onCreateStatus={() => {
							cancelCreateStatus()
						}}
					/>
				)
			}
			return (
				<span class="bt-open-dir">
					<i class={`svgtofont${row.type === 'dir' ? '-icon-file_mode' : '-file-text'}`}></i>
					<span
						onClick={(ev: MouseEvent) => {
							if (row.type === 'dir') handleRowDBClick(row, ev)
						}}>
						{row.name}
					</span>
				</span>
			)
		},
	},
	{
		label: '修改时间',
		width: 160,
		prop: 'mtime',
	},
	{
		label: '权限/所有者',
		width: 125,
		prop: 'accept',
	},
])

// watch(
// 	() => temporaryPath.value,
// 	val => {
// 		if (val === '' && filePath.value === temporaryPath.value) return
// 		// filePath.value = val.replace(/\/$/, '')
// 	}
// )

/**
 * @description 表格合并行，元素创建
 * @param {Object} row  行数据
 */
const arraySpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
	if (rowIndex === 0 && row.create && isCreateStatus) {
		return [1, 3]
	}
}

/**
 * @description: 返回上一级
 * @return {Void} void
 */
const goBack = () => {
	if (pathList.value.length === 1) return
	filePath.value = pathList.value[pathList.value.length - 2].path
	getDirList()
}

/**
 * @description: 路径框焦点（非指定文件名时）
 * @return {Void} void
 */
const temporaryFocus = () => {
	isTagMode.value = false
	temporaryPath.value = filePath.value
}

/**
 * @description: 路径框失去焦点
 * @return {Void} void
 */
const temporaryBlur = () => {
	isTagMode.value = true // 标签模式
	setTimeout(() => {
		temporaryPath.value = filePath.value
	}, 1500)
}

/**
 * @description: 路径框回车
 * @param {Any} event  回车后的事件
 * @return {Void} void
 */
const temporaryEnter = (event: any) => {
	filePath.value = temporaryPath.value
	getDirList()
	event.preventDefault()
	event.target.blur()
}

/**
 * @description: 路径框指定文件名点击、跳转路径
 * @param {String} path  跳转路径
 * @return {Void} void
 */
const filePathJump = (path: string) => {
	if (filePath.value === path) return
	filePath.value = path
	temporaryPath.value = path
	getDirList()
}

/**
 * @description: 搜索文件名
 * @param {String} value  搜索内容
 * @return {Void} void
 */
const fileSearch = (value: string) => {
	if (!value) value = ''
	fileSerachText.value = value
	getDirList(true)
}

let isCreateStatus = ref(false) // 是否创建状态

/**
 * @description: 新建文件/文件夹
 * @param {String} type  类型[file/dir]
 * @return {Void} void
 */
const createDiskStructure = (type: string) => {
	if (isCreateStatus.value) return false
	isCreateStatus.value = true
	fileSelectorData.value?.unshift({
		title: '',
		name: '',
		mtime: '',
		accept: '',
		type,
		path: '',
		create: true,
	})
}
/**
 * @description: 取消创建状态
 * @return {Void} void
 */
const cancelCreateStatus = () => {
	isCreateStatus.value = false
	getDirList()
}
/**
 * @description: 磁盘路径跳转
 * @param {String} path  跳转路径
 * @return {Void} void
 */
const diskPathJump = (path: string) => {
	filePath.value = path
	getDirList()
}
/**
 * @description: 获取目录信息
 * @param {Boolean} isSerach  是否搜索 true/false   [可选]
 * @return {Void} void
 */
const getDirList = async (isSerach?: boolean) => {
	loading.value = true
	try {
		const rdata = props.compData.customRequest
			? await props.compData.customRequestApi?.({
					path: filePath.value,
					disk: true,
					search: isSerach ? fileSerachText.value : '',
			  })
			: await getSelectDir({
					path: filePath.value,
					disk: true,
					search: isSerach ? fileSerachText.value : '',
			  })
		if (fileSelectedItem.value) {
			fileSelectedItem.value.path = filePath.value
			fileSelectedItem.value.title = filePath.value.split('/')[filePath.value.split('/').length - 1]
		}
		if (!rdata.status) {
			fileSelectedItem.value = undefined
			$request(rdata)
			return false
		}
		const { DIR, FILES, DISK, PATH } = rdata.data
		fileNavHead(PATH) // 文件导航头部
		diskList.value = DISK // 文件磁盘列表
		fileSelectorData.value = [...fileRegroup(DIR, 'dir'), ...fileRegroup(FILES)] // 文件数据
		selectorTypeEstimate()
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}
/**
 * @description: 文件导航头部
 * @param {String} PATH  路径
 * @return {Void} void
 */
const fileNavHead = (path: string) => {
	let lastPath = ''
	const pathNew = path.replace(/\/*$/, '')
	filePath.value = pathNew
	temporaryPath.value = pathNew
	pathList.value = [] // 重置
	if (pathNew === '') {
		pathList.value.push({
			title: '根目录',
			path: '/',
		})
		showPathList.value = pathList.value
		return
	}
	pathNew.split('/').forEach((item: any, index: number) => {
		lastPath += `${index === 1 ? '' : '/'}${item}`
		pathList.value.push({
			title: item === '' && index === 0 ? '根目录' : item,
			path: lastPath,
		})
	})
	showPathList.value = pathList.value
}

/**
 * @description: 重组文件数据
 * @param {Array} list  文件列表
 * @param {String} type  类型[dir/file]
 * @return {Array} 重组后的文件数据
 */
const fileRegroup = (list: Array<string>, type?: string) => {
	const data: FileColumnParams[] = []
	list.forEach((item: string) => {
		const itemF = item.split(';')
		let fName = itemF[0]
		// 文件长度大于20
		if (fName.length > 30) {
			fName = `${fName.slice(0, 30)}...`
		}
		// 如果是中文
		if (isChineseChar(fName)) {
			fName = `${fName.slice(0, 16)}...`
		}

		data.push({
			title: itemF[0], // 文件名
			name: fName, // 文件名(长度限制)
			mtime: formatTime(Number(itemF[2]) * 1000, 'yyyy/MM/dd HH:mm:ss'), // 修改时间
			accept: `${itemF[3]} / ${itemF[4]}`, // 权限/所有者
			type: type || 'file', // 类型
			path: `${filePath.value}/${itemF[0]}`, // 路径
		})
	})
	/**
	 * @description: 判断是否是中文
	 * @param {String} s  字符串
	 * @return {Boolean} true/false
	 */
	function isChineseChar(s: string) {
		const c = /[\u4E00-\u9FA5\uF900-\uFA2D]/
		return c.test(s)
	}
	return data
}

/**
 * @description: 表格单选
 * @param {Any} val  选中项
 * @return {Void} void
 */
const handleCurrentChange = (val: any) => {
	// 限制的类型和鼠标选中的类型不相同时，清空选中项
	// ;(type == 'file' && val.type !== 'file') || (type == 'dir' && val.type !== 'dir')
	if (!val || val.create) return // 修复报错
	if (pathType.value === 'all') {
		fileSelectedItem.value = val
	} else {
		if (val.type !== 'dir' && pathType.value === 'dir') {
			$error('请选择文件夹，否则将无法选择')
			return
		}
		if (val.type !== 'file' && pathType.value === 'file') {
			return
		}
		if (pathType.value !== val.type) {
			fileSelectedItem.value = undefined

			getPckageVm(tableRef.value).setCurrentRow()
			return
		}
		if (val !== null) {
			fileSelectedItem.value = val
		}
	}
	isAction.value = true
}

/**
 * @description: 当某行被双击时
 * @param {AnyObject} row  双击行
 * @return {Void} void
 */
const handleRowDBClick = (row: AnyObject, ev: MouseEvent) => {
	// 非文件夹或新建状态时不可双击
	if (row.type !== 'dir' || row.create) return
	// 限制的类型和鼠标选中的类型不相同时，清空选中项
	if (pathType.value === 'file') isAction.value = false
	filePath.value = row.path
	getDirList()
	if (ev.stopPropagation) ev.stopPropagation()
}

// /**
//  * @description: 当某行被单击时
//  * @param {AnyObject} row  单击行
//  * @return {Void} void
//  */
// const handleRowClick = (row: AnyObject) => {
// 	if (row.type !== 'dir' && pathType.value === 'dir' && !row.create) {
// 		$error('请选择文件夹，否则将无法选择')
// 	}
// }

/**
 * @description: 路径跳转时清空选中项（文件）
 * @return {Void} void
 */
const selectorTypeEstimate = () => {
	if (tableRef.value.type === 'file') {
		fileSelectedItem.value = undefined
		isAction.value = false
	}
	isCreateStatus.value = false
}

/**
 * @description 确认选择
 */
const onConfirm = () => {
	if (change) change(fileSelectedItem.value.path, fileSelectedItem.value.type)
	fileSelectedPath.value = fileSelectedItem.value.path
	emits('close')
}

// 初始化
const init = async () => {
	await getDirList()
	if (pathType.value !== 'file') {
		fileSelectedItem.value = pathList.value[pathList.value.length - 1]
		isAction.value = true
	}
}

defineExpose({
	onOpen: () => init(),
})
</script>

<style lang="css" scoped>
.bt-open-icon {
	@apply cursor-pointer rounded-base px-[1.2rem] py-[6px] text-medium h-[3.2rem];
	border: 1px solid var(--el-color-border-darker);
}
.bt-open-icon:hover {
	color: var(--el-color-primary);
	border-color: var(--el-color-primary-light-7);
	background-color: var(--el-color-primary-light-9);
}

.file-selector-head .bt-open-icon:first-child {
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
}
.file-selector-head .bt-open-icon:last-child {
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
}
.file-selector-input {
	@apply align-top inline-block border-t border-b border-darker relative;
}
.file-selector-input li:hover {
	background-color: var(--el-color-text-tertiary);
	cursor: pointer;
}
.create-file-btn {
	@apply px-1.2rem py-0.4rem rounded-base;
}
.create-file-btn:hover {
	@apply cursor-pointer;
	color: var(--el-color-primary);
	background-color: var(--el-color-primary-light-9);
}
.file-selector-main {
	border-top: 0.1rem solid var(--el-color-border-dark);
}
.file-selector-main .disk-list {
	border-right: 0.1rem solid var(--el-color-border-dark);
}
.file-selector-main .disk-list li:hover {
	background-color: var(--el-fill-color-dark);
	cursor: pointer;
}
.file-selector-table :deep(.el-table .el-table__header th.is-leaf) {
	border-top: none !important;
	background-color: var(--el-color-white) !important;
	height: 4rem !important;
}
:deep(.file-selector-table .el-table .el-table__header th.gutter) {
	border-bottom: 0.1rem solid var(--el-color-border-dark);
}
:deep(.file-selector-table .el-table .el-table__header th.gutter) {
	border-bottom: 0.1rem solid var(--el-color-border-dark);
}
:deep(.file-selector-table .el-table .el-table__body .el-table__row .el-table__cell) {
	padding: 0.8rem 0;
}
:deep(.file-selector-table .el-table .el-table__empty-block) {
	border-left: none;
}

:deep(.file-selector-table .bt-open-dir) {
	@apply flex w-full;
}
:deep(.file-selector-table .svgtofont-icon-file_mode) {
	color: var(--el-color-warning-light-3);
}
:deep(.file-selector-table .bt-open-dir > span) {
	@apply max-w-full cursor-pointer text-small leading-[22px];
}
:deep(.file-selector-table .bt-open-dir > span:hover) {
	@apply text-primary;
}
:deep(.file-selector-table .bt-open-dir i) {
	@apply w-[2.2rem] h-[2.2rem] inline-block mr-[.5rem] align-middle ml-[2px] text-subtitleLarge mr-[12px] flex items-center justify-center;
}

:deep(.file-selector-table .bt-open-dir) {
	@apply cursor-pointer rounded-base px-[12px] py-[6px] text-medium h-[32px];
}

.file-selector-input .el-input {
	@apply h-[31px] rounded-none;
}

:deep(.file-selector-input .el-input__wrapper) {
	@apply h-[31px] rounded-none;
	box-shadow: none;
}
:deep(.file-selector-input .el-input__inner:focus) {
	@apply border-primary;
}
</style>
