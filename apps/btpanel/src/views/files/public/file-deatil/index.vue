<template>
	<div class="p-2rem" v-bt-loading="load" v-bt-loading:title="'正在获取文件信息，请稍候...'">
		<bt-tabs v-model="activeName" type="card">
			<el-tab-pane label="常规" name="routine" lazy>
				<FileRoutine />
			</el-tab-pane>
			<el-tab-pane label="详细信息" name="detail" lazy>
				<FileDetail />
			</el-tab-pane>
			<el-tab-pane label="历史版本" name="history" lazy>
				<FileHistory />
			</el-tab-pane>
			<el-tab-pane label="权限" name="auth" lazy>
				<FileAuth />
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>

<script setup lang="ts">
import FileRoutine from './base.vue'
import FileDetail from './detail.vue'
import FileHistory from './history.vue'
import FileAuth from './auth.vue'

import { storeToRefs } from 'pinia'
import FILES_DETAIL_STORE from './store'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		fileItem: {}, // 文件信息
		tab: 'routine', // 当前tab
	}),
})

const store = FILES_DETAIL_STORE()
const { activeName, load } = storeToRefs(store)
const { getFileItem, $reset } = store

onMounted(() => {
	getFileItem()
})

onUnmounted(() => {
	$reset()
})
</script>
