<template>
	<div class="flex flex-col p-16px lib-box">
		<div class="top">
			<el-button type="primary" @click="FileDecompressionView(fileItem)">解压至</el-button>
			<el-button @click="addFile">添加文件</el-button>
		</div>
		<!-- 表格部分 -->
		<div class="mt-[1rem]">
			<bt-table-group>
				<template #header-left>
					<!-- 面板屑 -->
					<el-breadcrumb separator-class="svgtofont-el-arrow-right">
						<el-breadcrumb-item v-for="(path, index) in breadList" :key="index" @click.native="goPath(index)">
							{{ path }}
						</el-breadcrumb-item>
					</el-breadcrumb>
				</template>
				<template #content>
					<bt-table ref="fileTableRef" height="40rem" :column="tableColumn" v-bt-loading="loading" v-bt-loading:title="'正在获取压缩包信息，请稍候...'" :description="'列表为空'" @cell-dblclick="cellDblclick" :data="tableList"></bt-table>
				</template>
				<template #footer-left>
					<bt-table-batch :table-ref="fileTableRef" :options="batchOptions"></bt-table-batch>
				</template>
				<template #popup>
					<!-- 解压、批量解压 -->
					<bt-dialog ref="deCompressPopup" v-model="deCompressPopupData.visible" :area="35" showFooter @confirm="confirmDeCompress(tableList, breadList)" @cancel="batch.selectList = []" title="解压文件">
						<div class="py-20px">
							<el-form :model="deCompressPopupData.form">
								<el-form-item label="解压目录" prop="path">
									<bt-input-icon v-model="deCompressPopupData.form.path" icon="el-folder-opened" width="22rem" @icon-click="openPathDialog" placeholder="请输入解压目录"></bt-input-icon>
								</el-form-item>
							</el-form>
							<div class="px-[1.5rem] pt-[1rem] pb-[2rem]" v-show="batch.selectList.length !== 0">
								<bt-table height="18rem" max-height="18rem" :column="batch.decompressTableColumn" :data="batch.selectList"></bt-table>
							</div>
						</div>
					</bt-dialog>
					<!-- 批量删除 -->
					<bt-dialog ref="batchDeletePopupRef" v-model="batchDeletePopup" :area="35" showFooter @confirm="delEvent" @cancel="batch.selectList = []" title="批量删除">
						<div class="py-20px">
							<div class="px-[1.5rem] pt-[1rem] pb-[2rem]">
								<bt-table height="18rem" max-height="18rem" :column="batch.decompressTableColumn" :data="batch.selectList"></bt-table>
							</div>
						</div>
					</bt-dialog>
				</template>
			</bt-table-group>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { FileDecompressionView } from '@files/useMethods'
import { storeToRefs } from 'pinia'
import FILES_COMPRESS_PREVIEW_STORE from './store'

const emit = defineEmits(['close'])

const store = FILES_COMPRESS_PREVIEW_STORE()
const { fileItem, compressData, deCompressPopupData, tableColumn, loading, fileTableRef, batch, batchDeletePopup } = storeToRefs(store)
const { delEvent, confirmDeCompress, openPathDialog, cellDblclick, goPath, addFile, init, $reset, batchOptions } = store

// 面包屑路径列表
const breadList = computed(() => compressData.value.file.path.split('/').filter(item => item !== ''))

// 当前文件列表
const tableList = computed(() => {
	// 当前路径列表
	const pathList = compressData.value.file.path.split('/').filter((item: any) => item !== '')
	// 当前文件列表
	let currentData: any = compressData.value.file.data

	// 获取当前路径的数据
	pathList.forEach((item: any, index: number) => {
		// 跳过第一个，不需要获取
		if (index === 0) return
		currentData = currentData[item]
	})
	if (!currentData) {
		return []
	}
	const arr: any[] = []
	// 遍历当前路径的数据,为目录文件加上文件名
	Object.entries(currentData).forEach(([key, value]: [any, any]) => {
		arr.push({
			...value,
			filename: key,
			uploadName: value.is_dir == 0 ? key : key + '/dddir',
		})
	})
	// 返回当前路径的文件
	return arr
})

onMounted(() => {
	init()
})

onUnmounted(() => {
	$reset()
})
</script>

<style lang="css" scoped>
.top {
	@apply flex pb-[1rem] w-full border-b border-extraLight;
}
:deep(.el-breadcrumb__inner) {
	@apply cursor-pointer hover:text-primary;
}
</style>
