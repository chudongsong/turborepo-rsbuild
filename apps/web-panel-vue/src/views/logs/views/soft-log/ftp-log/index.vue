<template>
	<div>
		<bt-table-group v-if="payment.authType === 'ltd'">
			<template #header-left>
				<div class="flex items-center">
					<!-- ftp用户名 -->
					<span class="!w-[6.8rem]">ftp用户名：</span>
					<bt-select filterable @change="refresh" class="!w-[16rem] lt-xl:(w-[12rem])" v-model="userName" :options="ftpList"></bt-select>
				</div>
			</template>
			<template #header-right>
				<!-- 搜索+日志类型 -->
				<div class="flex items-center">
					<div class="mr-1rem">
						<BtTableSelect v-if="param.ftpType === 'action'" />
					</div>
					<div class="mr-1rem">
						<BtSearch placeholder="请输入搜索关键字" class="lt-xl:(!w-[14rem]) at-xl:(!w-[14rem])" />
					</div>
					<div class="flex items-center mr-1rem">
						日志类型：
						<BtRadioButton />
					</div>
					<BtRefresh />
				</div>
			</template>
			<template #content>
				<!-- 登录日志 -->
				<BtTable v-if="param.ftpType === 'login'" />
				<!-- 操作日志 -->
				<BtTable v-else />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</bt-table-group>
		<!-- 付费引导 -->
		<bt-product-introduce v-else :data="productData" class="px-[20%] my-[8rem]"></bt-product-introduce>
	</div>
</template>
<script lang="ts" setup>
import { useGlobalStore } from '@store/global'

import { useAllTable, useRadioButton, useRefreshList, useTableSelect } from '@/hooks/tools'
import { ftpList, productData, renderFtpList, userName, isRefreshList, isInit } from '../useController'

const { payment } = useGlobalStore()

const ftpTypeSelect = useRadioButton({
	options: [
		{ label: '登录日志', value: 'login' },
		{ label: '操作日志', value: 'action' },
	],
	key: 'ftpType',
})

const typeSelect = useTableSelect({
	options: [
		{ label: '全部', value: 'all' },
		{ label: '上传', value: 'upload' },
		{ label: '下载', value: 'download' },
		{ label: '删除', value: 'delete' },
		{ label: '重命名', value: 'rename' },
	],
	key: 'type',
	other: {
		style: 'width: 10rem',
	},
})

const { BtTable, BtSearch, BtPage, BtRefresh, BtRadioButton, BtTableSelect, refresh, param } = useAllTable({
	request: renderFtpList,
	columns: computed(() => {
		return param.value.ftpType === 'login' // 登录日志
			? [
					{ label: '用户名', prop: 'user' },
					{ label: '登录ip', prop: 'ip' },
					{ label: '状态', prop: 'status' },
					{ label: '登陆时间', prop: 'in_time' },
					{ label: '登出时间', prop: 'out_time' },
			  ]
			: [
					// 操作日志
					{ label: '操作ip', prop: 'ip' },
					{ label: '文件', prop: 'file' },
					{ label: '操作类型', prop: 'type' },
					{ label: '操作时间', prop: 'time' },
			  ]
	}),
	extension: [ftpTypeSelect, typeSelect, useRefreshList(isRefreshList)],
})

onMounted(() => {
	isInit.value = true
})
</script>
