<template>
	<div class="flex flex-col px-[5rem] py-[1.5rem] lib-box">
		<div class="flex items-center">
			<img src="/static/images/docker/success-pic.png" class="w-[12rem] mr-[3.3rem]" />
			<div class="right w-full">
				<div class="add border-b border-dashed border-darker leading-[2.3rem] pb-[1rem] mb-[1rem]">
					{{ deployMsg.title }}
				</div>
				<div v-if="deployMsg.databaseName !== ''" class="item flex">
					<div>数据库名：</div>
					<div class="text-tertiary flex-1" v-html="deployMsg.databaseName"></div>
				</div>
				<div v-if="deployMsg.user" class="item mt-[.5rem]">
					用户：<span class="text-tertiary">{{ deployMsg.user }}</span>
				</div>
				<div v-if="deployMsg.password" class="item mt-[.5rem]">
					密码：<span class="text-tertiary">{{ deployMsg.password }}</span>
				</div>
				<div class="item mt-[.5rem]">
					访问站点：<span class="text-primary cursor-pointer" @click="openView()">{{ 'http://' + deployMsg.domain }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import SOFT_DEPLOY_PROJECT_STORE from './store'

const store = SOFT_DEPLOY_PROJECT_STORE()

const { deployMsg } = storeToRefs(store)
const { openView } = store
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-light border-darkSecondary border-[1px] border-light rounded-l-base px-[1rem] box-border;
}

.el-form-item {
	@apply mb-[1.5rem];
}

:deep(.el-form .el-form-item--mini.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>
