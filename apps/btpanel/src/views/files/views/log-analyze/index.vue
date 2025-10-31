<template>
	<div class="flex flex-col p-16px lib-box">
		<div class="menu">
			<div class="flex items-center">
				<span>获取最新:</span>
				<bt-select v-model="quickForm.limit" :options="limitOptions" class="w-[8rem] mr-[2rem]" @change="changeLimit"></bt-select>
				<span>自动刷新:</span>
				<bt-switch class="mr-[2rem]" v-model="quickForm.auto" @change="setAutoRefresh"></bt-switch>
				<span>刷新间隔:</span>
				<bt-input class="mr-[1rem]" v-model="quickForm.time" @input="checkTime" width="8rem" />
				<span>/单位（秒）</span>
				<span v-show="quickForm.last !== ''">最后刷新时间：{{ quickForm.last }}</span>
			</div>
			<div class="flex items-center mt-[1rem]">
				<span>文件路径:</span>
				<bt-input class="mr-[1rem]" v-model="quickForm.file" readOnly width="46rem" />
				<bt-input class="mr-[1rem]" v-model="quickForm.search" width="20rem" placeholder="搜索关键值/内容" />
				<el-button @click="getLog">搜索</el-button>
			</div>
		</div>
		<div class="log mt-[1rem]" v-bt-loading="loading" v-bt-loading:title="'正在获取日志，请稍候...'">
			<textarea class="w-full h-[42rem] leading-[2.2rem] resize-none bg-darkPrimary text-white p-[.5rem]" v-model="quickForm.data" readOnly="readonly"></textarea>
		</div>
	</div>
</template>

<script setup lang="ts">
import FILES_LOG_ANALYZE_STORE from './store';
import { storeToRefs } from 'pinia';

const store = FILES_LOG_ANALYZE_STORE();
const { loading, quickForm } = storeToRefs(store);
const { limitOptions, changeLimit, getLog, setAutoRefresh, checkTime, init, $reset } = store;

onMounted(() => {
	init();
});

onBeforeUnmount(() => {
	$reset();
});

defineExpose({});
</script>

<style lang="css" scoped>
.menu span {
	@apply mr-[.5rem];
}
</style>
