<template>
	<div class="h-full">
		<div>
			<div v-if="tabActive !== 'master'" class="mb-1rem text-secondary flex items-center">
				<span>选择配置块：</span>
				<bt-select class="!w-[16rem]" v-model="fileType" :options="typeOptions" @change="getConfigData()"></bt-select>
			</div>
			<bt-help v-show="tabActive === 'master'" :options="helpList" list-style="none" class="ml-[12px] text-small mb-1rem"></bt-help>
			<!-- nginx apache opensite..需要测试 -->

			<bt-editor
				v-bt-loading="textLoading"
				class="!w-[64rem] border border-dark rounded-base"
				v-model="staticContent"
				:class="props.type === 'master' ? '!h-[50rem]' : '!h-[34rem]'"
				:id="Math.random() * 1000"
				:editorOption="{
					readOnly: tabActive === 'master',
					mode: 'ace/mode/nginx',
				}" />
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
import { tabActive, customHelp, typeOptions, helpList, textLoading, fileType, staticContent, saveDataEvent, getConfigData } from './useController'
interface Props {
	type: string
}
const props = defineProps<Props>()
const requestInstance = {
	get: getConfigData,
	set: saveDataEvent,
}
onMounted(() => {
	getConfigData()
})
</script>
