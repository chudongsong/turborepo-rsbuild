<template>
	<div class="container-dialog">
		<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" :label-position="`right`" @submit.native.prevent>
			<el-form-item style="margin-bottom: 1.5rem" label="创建方式">
				<bt-radio type="button" v-model="more" :options="type" />
			</el-form-item>

			<el-form-item prop="repository" style="margin-bottom: 1.5rem" label="镜像名">
				<bt-input v-model="cmdForm.repository" width="24rem" :placeholder="`请输入镜像名`" />
			</el-form-item>

			<el-form-item prop="path" label="版本号" display="flex">
				<div class="flex items-center">
					<bt-input v-model="cmdForm.tag" width="24rem" :placeholder="`请输入版本号`" />
					<span class="ml-[1rem] text-secondary text-small whitespace-nowrap">默认：latest</span>
				</div>
			</el-form-item>

			<div v-show="more == 'more'">
				<el-form-item prop="path" label="仓库地址">
					<bt-select v-model="cmdForm.stash" :options="SOptions" class="!w-[24rem]" placeholder="请选择仓库地址" />
				</el-form-item>

				<el-form-item prop="path" label="描述">
					<bt-input v-model="cmdForm.message" width="24rem" :placeholder="`描述`" />
				</el-form-item>

				<el-form-item prop="path" label="作者">
					<bt-input v-model="cmdForm.author" width="24rem" :placeholder="`作者`" />
				</el-form-item>

				<div class="mt-[2.4rem]">
					<el-checkbox-group v-model="cmdForm.isExport" class="mb-[2rem] ml-[10rem]">
						<el-checkbox size="default" label="生成镜像并导出压缩包" value="生成镜像并导出压缩包" />
					</el-checkbox-group>

					<el-form-item v-show="cmdForm.isExport.length > 0" label=" ">
						<bt-input-icon v-model="cmdForm.path" class="!w-[24rem]" icon="el-folder-opened" @icon-click="openFile" @change.passive="clearSpace('path')" :placeholder="`请输入镜像路径`" />
					</el-form-item>

					<el-form-item v-show="cmdForm.isExport.length > 0" prop="path" label="文件名">
						<div class="flex items-center">
							<bt-input v-model="cmdForm.name" width="24rem" :placeholder="`文件名`" />
							<span class="ml-[1rem]">.tar</span>
						</div>
					</el-form-item>
				</div>
			</div>
			<el-button type="primary" class="ml-[10rem]" @click="onConfirm">生成镜像</el-button>
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { getDockerStore } from '@docker/useStore'

import { setConMirror, getStorageList, getStashList } from '@/api/docker'
import { fileSelectionDialog } from '@/public'
import { useDataHandle } from '@hooks/tools/data'
import { SelectOptionProps } from '@/components/form/bt-select/types'

interface Props {
	compData?: any
}

const {
	refs: { currentConDetail },
	getCurrentCon,
} = getDockerStore()

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

// 创建方式
const more = ref('easy')

// 创建方式选项
const type = [
	{ label: '简单模式', value: 'easy' },
	{ label: '高级模式', value: 'more' },
]

// 表单
const cmdForm = reactive({
	repository: '',
	tag: 'latest',
	stash: 'official',
	message: '',
	author: '',
	isExport: [] as string[],
	path: '',
	name: '',
})

// 仓库选项
const SOptions = shallowRef<SelectOptionProps[]>([])

// ref
const cmdFormRef = ref()
// 验证规则
const cmdRules = {
	repository: [{ required: true, trigger: ['blur', 'change'], message: '请输入镜像名' }],
}

/**
 * @description: 触发目录选择
 */
const openFile = () => {
	fileSelectionDialog({
		type: 'dir',
		change: (path: string) => {
			cmdForm.path = path
		},
	})
}

/**
 * @description: 清除空格
 */
const clearSpace = (name: string) => {
	cmdForm.path = cmdForm.path.replace(/\s+/g, '')
}

// 提交
const onConfirm = async () => {
	await cmdFormRef.value.validate()

	const params: any = {
		id: props.compData.row.id,
		repository: cmdForm.repository,
		tag: cmdForm.tag,
	}

	if (more.value == 'more') {
		params.message = cmdForm.message
		params.author = cmdForm.author
		params.repository = `${cmdForm.stash != '' ? cmdForm.stash + '/' : ''}${cmdForm.repository}`
		if (cmdForm.isExport.length > 0) {
			params.path = cmdForm.path
			params.name = cmdForm.name
		}
	}
	useDataHandle({
		request: setConMirror({ data: JSON.stringify(params) }),
		message: true,
		success: async (res: any) => {
			if (res.status) {
				await getCurrentCon(currentConDetail.value.Id)
				more.value = 'easy'
				initForm()
			}
		},
	})
}

// 初始化表单
const initForm = () => {
	cmdForm.repository = ''
	cmdForm.tag = 'latest'
	cmdForm.stash = 'official'
	cmdForm.message = ''
	cmdForm.author = ''
	cmdForm.isExport = []
	cmdForm.path = ''
	cmdForm.name = ''
	cmdFormRef.value.clearValidate()
}

onMounted(async () => {
	// 获取存储卷选项
	await useDataHandle({
		request: getStashList(),
		data: Array,
		success: (data: any) => {
			SOptions.value = data.map((item: any) => {
				return {
					label: item.name,
					value: item.url === 'docker.io' ? 'official' : item.namespace,
				}
			})
		},
	})
})
</script>
<style lang="css" scoped>
.container-dialog {
	@apply flex flex-col lib-box min-h-[60rem]  pt-[1.6rem];
}
.table .item {
	@apply flex items-center h-[5rem];
}
</style>
