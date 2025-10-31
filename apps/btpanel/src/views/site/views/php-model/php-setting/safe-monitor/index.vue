<template>
	<div class="relative p-[16px]">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="openSetting()">添加监视器</el-button>
			</template>
			<template #header-right>
				<bt-table-refresh @refresh="getList"></bt-table-refresh>
			</template>
			<template #content>
				<bt-table ref="ftpTable" :column="tableColumn" :max-height="360" :data="monitorData.list" :description="'暂无数据'" v-bt-loading="monitorData.load" v-bt-loading:title="'正在加载中，请稍后...'" />
			</template>
			<template #footer-left>
				<bt-help :options="helpList" class="ml-[20px] mt-[20px]"></bt-help>
			</template>
		</bt-table-group>
	</div>
</template>
<script lang="tsx" setup>
import { getList, helpList, monitorData, openSetting, tableColumn } from './useController'

// 页面加载完成
onMounted(() => {
	getList()
})
</script>
