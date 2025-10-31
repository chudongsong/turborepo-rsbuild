<template>
	<div class="h-full">
		<div v-bt-loading="textLoading" v-bt-loading:title="'正在加载内容，请稍候...'">
			<div v-if="['php', 'proxy', 'phpasync'].includes(siteType)" class="flex items-center justify-between">
				<el-select class="!w-[15rem]" v-model="textValue" @change="handleChange">
					<el-option v-for="(item, index) in optionData" :key="index" :value="item">
						<div class="flex items-center justify-between">
							<span>{{ item }}</span>
							<span v-if="isClose(item)" class="el-icon-close cursor-pointer text-base ml-1rem" @click.stop="delPseudoStatic({ name: item })"></span>
						</div>
					</el-option>
				</el-select>
				<span class="flex items-center"
					>规则转换工具：
					<bt-link href="https://www.bt.cn/Tools" target="_blank">Apache转Nginx <i class="svgtofont-el-link"></i></bt-link>
				</span>
			</div>
			<div class="my-[12px]">
				<bt-editor id="staticContentRef" :request="false" class="!h-[40rem] !w-full border border-dark rounded-base" v-model="staticContent" @save="setReWriteBody()" />
			</div>
			<div>
				<el-button type="primary" @click="setReWriteBody()">保存</el-button>
				<el-button @click="openSaveView" v-if="['php', 'proxy'].includes(siteType)">另存为模板</el-button>
			</div>
			<bt-help :options="helpList" class="ml-[20px] mt-[20px]"></bt-help>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useSiteStore } from '@site/useStore'
import { textLoading, textValue, helpList, optionData, staticContent, isClose, handleChange, initPseudoStatic, setReWriteBody, delPseudoStatic, setOtherTemplate } from '@site/public/pseudo-static/useController'
import { useDialog, useForm } from '@/hooks/tools'

const { siteType } = useSiteStore()

const openSaveView = () => {
	const { BtForm, submit } = useForm({
		options: () => {
			return computed(() => [
				{
					type: 'input',
					label: '模板名称',
					key: 'name',
					attrs: {
						placeholder: '请输入模板名称',
					},
					rules: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
				},
			])
		},
		submit: async (param: Ref<T>, validate: any) => {
			await validate()
			return await setOtherTemplate(param.value)
		},
	})
	useDialog({
		title: `另存为模板`,
		area: 42,
		showFooter: true,
		component: () => <BtForm class="p-2rem" />,
		onConfirm: submit,
	})
}

onMounted(initPseudoStatic)
</script>
