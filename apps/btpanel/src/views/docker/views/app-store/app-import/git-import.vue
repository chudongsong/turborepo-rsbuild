<template>
	<div class="app-import-git-container">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { importGitApphub, installApphub } from '@/api/docker'
import { useDockerAppStoreLocal } from './useStore'
import { useForm, Message, useDataHandle, useConfirm } from '@/hooks/tools'
import { ElButton } from 'element-plus'
import { FormInput, FormItemCustom, FormHelp } from '@form/form-item'
import { saveGitConfig } from './useController'
import { refreshList } from '../top-tools/useController'
import BtLink from '@components/base/bt-link'

const { apphubGitConfig, isSaveGitConfig, usingHelpLink } = useDockerAppStoreLocal()
const isMoreGitOption = ref(false)

const { BtForm, submit, param } = useForm({
	data: apphubGitConfig.value || {},
	options: (formData: any) => {
		return computed(() => [
			FormInput('Git地址', 'git_url', {
				attrs: { class: '!w-[44rem]', placeholder: '请输入Git地址' },
				rules: [{ required: true, message: 'Git地址不能为空' }],
			}),
			FormInput('分支', 'git_branch', {
				attrs: { class: '!w-[44rem]', placeholder: '请输入Git分支' },
				rules: [{ required: true, message: '分支不能为空' }],
			}),
			FormItemCustom(
				' ',
				() => {
					return (
						<div>
							<span class="text-primary cursor-pointer text-small flex items-center" onClick={() => (isMoreGitOption.value = !isMoreGitOption.value)}>
								{isMoreGitOption.value ? '更多设置，点击收起' : '更多设置，点击查看'}
								<i class={`ml-2 ${isMoreGitOption.value ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'}`}></i>
							</span>
						</div>
					)
				},
				''
			) as any,
			...(isMoreGitOption.value
				? [
						FormInput('用户名（可选）', 'name', {
							attrs: {
								class: '!w-[44rem]',
								placeholder: '如果是私有仓库请输入用户名',
								onInput: () => {
									param.value.user = formData.value.user
								},
							},
						}),
						FormInput('访问令牌（可选）', 'password', {
							attrs: {
								class: '!w-[44rem]',
								placeholder: '如果是私有仓库请输入访问令牌',
								showPassword: true,
								onInput: () => {
									param.value.password = formData.value.password
								},
							},
						}),
				  ]
				: []),
			FormItemCustom(
				' ',
				() => {
					return (
						<div>
							<ElButton type="default" onClick={() => saveGitConfig(param)}>
								保存配置
							</ElButton>
						</div>
					)
				},
				''
			) as any,
			FormHelp(' ', [
				{
					content: (
						<span>
							使用帮助：如果您在导入应用的过程中遇到问题，请点击 <BtLink href={usingHelpLink.value}>{`使用教程`}</BtLink>
						</span>
					),
				},
				{ content: <span class="text-red-500">安全提醒：请甄别导入应用的安全性，否则将存在安全风险！</span> },
			]),
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		const loading = Message.load('正在导入应用，请稍后...')
		try {
			await validate()
			console.log('isSaveGitConfig', isSaveGitConfig.value)
			if (!isSaveGitConfig.value) {
				Message.error('导入失败，请先保存git配置')
				return false
			}
			const result = await importGitApphub()
			if (!result.status && result.msg == '缺少git环境，请先安装git') {
				loading?.close()
				await useConfirm({
					title: '提示',
					content: '缺少git环境，是否进行安装？',
					icon: 'warning-filled',
					confirmText: '安装',
				})
				await useDataHandle({
					request: installApphub(),
					loading: '正在安装环境，请稍后...',
					message: true,
				})
				return false
			}
			if (!result.status) {
				Message.error(result.msg || '导入失败')
				return false
			}
			Message.success('导入成功')
			refreshList(true)
			console.log('result结果', result)
			// 其它提交逻辑
			console.log('提交表单', param.value)
			return result.status
		} catch (error) {
			console.error('提交失败:', error)
			return false
		} finally {
			loading?.close()
		}
	},
})

defineExpose({ onConfirm: submit })
</script>

<style scoped lang="scss">
.app-import-git-container {
	:deep(.el-form .el-form-item__label) {
		min-width: 100px;
	}
}
.app-checkbox-card .el-checkbox.is-checked {
	border-color: var(--el-color-primary);
}
</style>
