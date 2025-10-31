<template>
	<div class="pt-1.6rem">
		<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" @submit.native.prevent>
			<el-form-item prop="type" label="重启策略">
				<bt-select v-model="cmdForm.Name" :options="options" class="!w-[20rem]" />
			</el-form-item>
			<el-form-item prop="MaximumRetryCount" label="最大重试计数" v-show="cmdForm.Name == 'on-failure'">
				<bt-input width="20rem" type="number" v-model.number="cmdForm.MaximumRetryCount" placeholder="请输入最大重试计数" :min="0" textType="次">
					<template #append> 次 </template>
				</bt-input>
			</el-form-item>
		</el-form>
		<el-button class="ml-[10rem]" title="保存策略" type="primary" @click="onConfirm()">保存策略</el-button>
		<ul class="tips mt-[3.4rem] list-square ml-[10rem]">
			<li class="mt-[4px]">手动关闭的将不会自动启动</li>
		</ul>
	</div>
</template>
<script setup lang="ts">
import { setConReset } from '@/api/docker'
import { useDataHandle } from '@hooks/tools/data'

import { getDockerStore } from '@docker/useStore'

const {
	refs: { currentConDetail },
	getCurrentCon,
} = getDockerStore()

// 表单ref
const cmdFormRef = ref()

// 表单
const cmdForm = reactive({
	Name: '',
	MaximumRetryCount: 0, // 最大重试计数
})

// 重启策略类型
const options = [
	{ value: 'no', label: '不重启' },
	{ value: 'unless-stopped', label: '仅非正常退出的时候重启' },
	{ value: 'always', label: '停止后马上重启' },
	{ value: 'on-failure', label: '失败后重启' },
]

// 验证规则
const cmdRules = {
	MaximumRetryCount: [
		{ required: true, message: '请输入最大重试计数', trigger: ['blur'] },
		{ type: 'number', message: '请输入正整数', min: 0, trigger: ['blur'] },
	],
}

// 提交
const onConfirm = async () => {
	await cmdFormRef.value.validate()

	const params: any = {
		id: currentConDetail.value.Id,
		restart_policy: {
			Name: cmdForm.Name,
		},
	}
	if (cmdForm.Name == 'on-failure') {
		params.restart_policy.MaximumRetryCount = Number(cmdForm.MaximumRetryCount)
	}

	useDataHandle({
		loading: '正在保存策略,请稍后...',
		request: setConReset({ data: JSON.stringify(params) }),
		message: true,
		success: async (res: any) => {
			if (res.status) getCurrentCon(currentConDetail.value.Id)
		},
	})
}

onMounted(async () => {
	cmdForm.Name = currentConDetail.value.HostConfig?.RestartPolicy.Name || ''
	cmdForm.MaximumRetryCount = currentConDetail.value.HostConfig?.RestartPolicy.MaximumRetryCount || 0
})
</script>
