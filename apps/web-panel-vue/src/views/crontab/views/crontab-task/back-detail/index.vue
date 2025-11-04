<template>
	<div class="p-[20px]">
		<bt-table-group>
			<template #content>
				<bt-table :max-height="400" v-bt-loading="backLoad" v-bt-loading:title="'正在加载中，请稍候...'" :column="backColumns" :data="backData" />
			</template>
			<template #footer-right>
				<bt-table-page :total="backTotal" v-model:page="backParam.p" v-model:row="backParam.rows" @change="getBackFileList" />
			</template>
		</bt-table-group>
		<bt-help list-style="disc" class="mt-[1rem]">
			<li v-if="isShowTip">
				<bt-link @click="openPath(close)">一键跳转至本地备份目录</bt-link>
			</li>
		</bt-help>
	</div>
</template>

<script setup lang="ts">
import { openPath, isShowTip } from '../useController'
import { backLoad, backTotal, backData, backParam, backColumns, getBackFileList } from './useController'

const emit = defineEmits(['close'])

const close = () => {
	emit('close')
}

onMounted(() => getBackFileList())
</script>
