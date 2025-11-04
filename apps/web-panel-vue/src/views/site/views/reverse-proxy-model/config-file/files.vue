<template>
	<div class="h-full">
		<div>
			<div v-if="tabActive !== 'master'" class="mb-1rem text-secondary flex items-center">
				<span>选择配置块：</span>
				<bt-select class="!w-[16rem]" v-model="fileType" :options="typeOptions" @change="getConfigData()"></bt-select>
			</div>
			<bt-help v-show="tabActive === 'master'" :options="helpList" list-style="none" class="ml-0 text-small mb-1rem"></bt-help>
			<!-- nginx apache opensite..需要测试 -->

			<bt-editor v-if="tabActive === 'master'" v-bt-loading="textLoading" class="!w-[64rem] border border-dark rounded-base !h-[50rem]" v-model="staticContent" @save="saveDataEvent()" />
			<bt-editor v-else v-bt-loading="textLoading" class="!w-[64rem] border border-dark rounded-base !h-[34rem]" v-model="staticContent" @save="saveDataEvent()" />
			<div class="mt-1rem">
				<el-button v-if="tabActive !== 'master'" type="primary" @click="saveDataEvent">保存</el-button>
				<el-button type="default" @click="copyText({ value: staticContent })">复制</el-button>
			</div>
		</div>
		<div v-if="tabActive !== 'master'" class="ml-[20px] mt-[2rem]">
			<bt-help :options="customHelp"></bt-help>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { copyText } from '@/utils'
import { tabActive, customHelp, typeOptions, helpList, textLoading, fileType, staticContent, changeDataEvent, saveDataEvent, getConfigData } from './useController'

onMounted(getConfigData)

defineExpose({
	init: getConfigData,
})
</script>
