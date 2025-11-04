<template>
	<div class="container-dialog !p-0">
		<el-form ref="cmdFormRef" size="default" :model="cmdForm" class="relative w-full" :label-position="`right`" @submit.native.prevent>
			<div class="flex items-center relative">
				<bt-input-icon v-model="cmdForm.path" width="51rem" icon="icon-file_mode" @icon-click="openFile" @change.passive="clearSpace('path')" :placeholder="`请输入镜像路径`" />
				<el-checkbox class="!absolute top-[0rem] left-[36rem]" v-model="cmdForm.checked">包含子目录</el-checkbox>
				<el-button class="ml-8px" type="primary" @click="search">搜索</el-button>
			</div>
			<div class="table w-full mt-[1rem]">
				<bt-table ref="ftpTable" :column="tableColumn" height="33rem" :data="tableData.list" :description="'模板列表为空'" v-bt-loading="tableData.loading" @selection-change="handleSelectionChange" v-bt-loading:title="'正在加载模板列表，请稍后...'" />
			</div>
			<div class="pl-[2rem]">
				<ul class="help-info-text c7 list-disc text-[#ff0000] mt-[1.5rem]">
					<li>选中需要添加的Compose 【已选中：{{ select.selectList.length }}个】</li>
				</ul>
			</div>
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { getDockerStore } from '@docker/useStore'
import { fileSelectionDialog } from '@/public/index'
import { useSearchTableColumn } from '@docker/useMethods'
import { addDirTemplate, searchTemplate } from '@/api/docker'
import { Message, useDataHandle } from '@hooks/tools'

const emits = defineEmits(['close', 'complate'])

const {
	refs: { isRefreshTemplateList },
} = getDockerStore()

// 表单
const cmdForm = reactive({
	path: '',
	checked: false,
})

// 表格
const tableData = reactive({
	loading: false,
	list: [] as any[],
	selection: [],
})
const tableColumn = useSearchTableColumn()

const cmdFormRef = ref()
// 已选数据
const select = reactive({
	selectList: [],
})

/**
 * @description: 触发目录选择
 */
const openFile = () => {
	fileSelectionDialog({
		type: 'dir',
		change: path => {
			cmdForm.path = path
		},
	})
}

/**
 * @description: 搜索
 */
const search = async (): Promise<void | boolean> => {
	if (cmdForm.path === '') {
		Message.error('请选择路径')
		return false
	}
	useDataHandle({
		request: searchTemplate({
			data: JSON.stringify({
				path: cmdForm.path,
				sub_dir: cmdForm.checked ? '1' : '0',
			}),
		}),
		data: [Array, toRef(tableData, 'list')],
		loading: toRef(tableData, 'loading'),
	})
}

/**
 * @description: 获取选中数据
 * @param {FtpTableDataProps[]} val 选中row数据
 * @return {void}
 */
const handleSelectionChange = (val: any): void => {
	select.selectList = val
}

/**
 * @description: 清除空格
 */
const clearSpace = (name: string) => {
	cmdForm.path = cmdForm.path.replace(/\s+/g, '')
}

// 提交
const confirm = () => {
	if (select.selectList.length === 0) {
		Message.error('请选择模板')
		return
	}
	useDataHandle({
		request: addDirTemplate({
			data: JSON.stringify({ template_list: select.selectList }),
		}),
		message: true,
		success: (res: any) => {
			if (res.status) {
				emits('complate', res)
				isRefreshTemplateList.value = true
				emits('close')
			}
		},
	})
}

defineExpose({
	confirm,
})
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col p-[1.6rem] lib-box;
}
.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-[#f2f4f7] border-medium border-[1px] border-[#e4e7ed] rounded-l-[0.4rem] px-[1rem] box-border;
}
</style>
