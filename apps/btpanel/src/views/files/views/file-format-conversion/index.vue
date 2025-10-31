<template>
	<div class="flex flex-col p-16px lib-box">
		<bt-tabs v-model="activeName" type="card" @change="handleTabEvent">
			<el-tab-pane label="格式转换" name="conver" lazy>
				<div class="flex flex-col p-[1rem] lib-box">
					<bt-table-group>
						<template #header-left>
							<el-button @click="addFile" type="primary">添加</el-button>
						</template>
						<template #content>
							<bt-table ref="scanTable" height="34rem" :max-height="340" :column="tableColumn" v-bt-loading="loading" v-bt-loading:title="'正在获取文件，请稍候...'" @selection-change="handleSelectionChange" :description="'列表为空'" :data="formatData.fileList"></bt-table>
						</template>
						<template #footer-left>
							<div class="flex flex-col text-base">
								<span
									>保存路径:<span class="ml-2rem">{{ formatData.path }}</span>
									<bt-svg-icon name="file-dir" size="1.8" @click="openFile" class="ml-[1rem] cursor-pointer inline-block"></bt-svg-icon>
									<!-- <i
										class="el-icon-folder-opened text-black cursor-pointer ml-[1rem] text-medium"
										@click="openFile"></i
								> -->
								</span>
								<el-checkbox class="mt-[1rem]" v-model="formatData.del">是否删除源文件</el-checkbox>
							</div>
						</template>
					</bt-table-group>
					<div class="flex justify-end">
						<el-button @click="goConversion" :loading="subLoad" type="primary">{{ btnText }}</el-button>
					</div>
				</div>
			</el-tab-pane>
			<el-tab-pane label="操作日志" name="log" lazy>
				<div class="flex flex-col p-[1rem] lib-box">
					<bt-table-group>
						<template #content>
							<bt-table ref="scanTable" height="34rem" :max-height="340" :column="logTableColumn" :description="'列表为空'" :data="tableData.fileList"></bt-table>
						</template>
						<template #footer-right>
							<bt-table-page v-model:page="tableData.p" v-model:row="tableData.limit" :total="tableData.fileList.length" @change="getData()"></bt-table-page>
						</template>
					</bt-table-group>
				</div>
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>

<script setup lang="ts">
// import type { FileDataProps } from '@files/types'
import { storeToRefs } from 'pinia'

import FILES_FORMAT_CONVERSION_STORE from './store'

const store = FILES_FORMAT_CONVERSION_STORE()
const { activeName, tableColumn, loading, formatData, subLoad, btnText, logTableColumn, tableData } = storeToRefs(store)
const { addFile, openFile, goConversion, handleSelectionChange, handleTabEvent, getData, init, $reset } = store

// interface Props {
// 	compData: any
// }

// const props = withDefaults(defineProps<Props>(), {
// 	compData: () => ({
// 		fileItem: {}, // 文件信息
// 	}),
// })

// const emit = defineEmits(['close'])

// 文件信息
// const fileItem: FileDataProps = props.compData.fileItem

onMounted(init)

onUnmounted($reset)
</script>
