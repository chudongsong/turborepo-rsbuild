<template>
	<div class="p-2rem">
		<div class="title-box flex items-center justify-between">
			<div class="flex items-center">
				<!-- 图标-扫描中 -->
				<div class="scan-icon relative h-[8rem] w-[8rem]" v-if="scanLoad == 'loading'">
					<div class="animate-spin absolute top-0 border-primary border-b-2 rounded-full h-full w-full"></div>
					<bt-icon icon="scanning-scan" :size="60" color="var(--el-color-primary)" class="absolute top-0 left-0 right-0 bottom-0 m-[auto] h-[8rem] w-[6rem]"></bt-icon>
				</div>
				<!-- 图标-扫描完成 -->

				<bt-icon icon="scanning-success" :size="60" color="var(--el-color-primary)" v-if="scanLoad == 'success'"></bt-icon>
				<bt-icon icon="scanning-danger" :size="60" color="var(--el-color-danger)" v-if="scanLoad == 'danger'"></bt-icon>

				<div class="scan-title flex flex-col items-start ml-2rem">
					<span class="font-bold text-large text-default"
						>查杀{{ scanningData.scanningText }} ，已扫描文件 {{ scanningData.scanningCount }} /{{ scanningData.scanCount }} 个；发现木马文件 <span class="text-danger">{{ scanningData.shellCount }}</span
						>个</span
					>
					<span class="text-small text-secondary mt-12px truncate max-w-[60rem]">{{ scanningData.scanInfo }}</span>
				</div>
			</div>

			<div class="flex items-center ml-12px">
				<el-button type="default" @click="cancelScan" v-if="scanLoad === 'loading'">取消</el-button>
				<el-button type="primary" @click="scanData()" v-if="scanLoad != 'loading'">重新查杀</el-button>
			</div>
		</div>
		<el-divider class="!my-[1rem]"></el-divider>
		<bt-table-group>
			<template #content>
				<bt-table ref="scanTableRef" :column="tableColumns" :data="tableData" v-bt-loading:title="'正在加载中，请稍后...'" v-bt-loading="scanLoad === 'loading'" height="360" />
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="scanTableRef" :options="batchOptions" />
			</template>
			<template #popup>
				<bt-dialog title="在线编辑" showFooter v-model="editorPopup" :area="70" @confirm="saveFile">
					<div class="p-2rem">
						<bt-editor v-model="editorValue" class="!h-[40rem]" :editor-option="{ theme: 'ace/theme/monokai' }"></bt-editor>
					</div>
				</bt-dialog>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_VIRUS_SCAN_STORE from './store'

const store = FILES_VIRUS_SCAN_STORE()
const { scanLoad, scanningData, tableColumns, tableData, scanTableRef, editorPopup, editorValue } = storeToRefs(store)
const { saveFile, scanData, cancelScan, $reset, batchOptions } = store

onMounted(() => {
	scanData()
})

onUnmounted(() => {
	$reset()
})
</script>
