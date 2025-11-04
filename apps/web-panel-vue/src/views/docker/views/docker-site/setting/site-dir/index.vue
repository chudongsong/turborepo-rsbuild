<template>
	<div class="p-[2rem] overflow-auto">
		<BtForm />
	</div>
</template>
<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormItemCustom, FormCustom } from '@form/form-item'
import { ElButton, ElSelect, ElOption, ElDivider, ElSwitch } from 'element-plus'
import { openFile } from './useController'
import { DOCKER_SITE_SITE_DIR_STORE } from './useStore'

import BtInput from '@/components/form/bt-input'
import BtIcon from '@/components/base/bt-icon'

const store = DOCKER_SITE_SITE_DIR_STORE()
const { dirOptions, formData } = storeToRefs(store)
const { getDir, resetData, saveDirPath, setDirUser, getUserini } = store

// 表单实体
const { BtForm } = useForm({
	data: () => formData.value,
	options: (formDataRef: any) => {
		return computed(() => [
			FormItemCustom(
				'网站目录',
				() => {
					return (
						<div>
							<div class="formItem">
								<BtInput v-model={formDataRef.value.path} width="32rem">
									{{
										append: () => {
											return (
												<ElButton onClick={() => openFile(formDataRef)}>
													<BtIcon icon="icon-file_mode" class="cursor-pointer" />
												</ElButton>
											)
										},
									}}
								</BtInput>

								<ElButton type="primary" class="!ml-[1.2rem]" onClick={() => saveDirPath(formDataRef.value.path, 'path')}>
									保存
								</ElButton>
							</div>
							<span class="formTips">当前网站的部署目录，可以选择其他目录</span>
						</div>
					)
				},
				'path',
				{
					rules: [{ required: false, trigger: 'change', message: '请选择网站目录' }],
				}
			),
			FormItemCustom(
				'运行目录',
				() => {
					return (
						<div>
							<div class="formItem">
								<ElSelect class="!w-[32rem]" v-model={formDataRef.value.run_path}>
									{dirOptions.value.map((item: any) => (
										<ElOption key={item.value} label={item.label} value={item.value} />
									))}
								</ElSelect>

								<ElButton type="primary" class="!ml-[1.2rem]" onClick={() => saveDirPath(formDataRef.value.run_path, 'run_path')}>
									保存
								</ElButton>
							</div>
							<span class="formTips">部分程序需要指定二级目录作为运行目录，如ThinkPHP5,Laravel</span>
						</div>
					)
				},
				'run_path',
				{
					rules: [{ required: false, trigger: 'change', message: '请选择网站运行目录' }],
				}
			),
			FormCustom(
				() => {
					return (
						<div>
							<ElDivider></ElDivider>

							<div class="formItem">
								<span class="formLabel">防跨站攻击</span>
								<ElSwitch class="mr-[12px]" v-model={formDataRef.value.userini} onChange={setDirUser}></ElSwitch>
								<span class="text-tertiary">防跨站攻击(open_basedir)，防止黑客通过其他网站目录进行入侵攻击</span>
							</div>
						</div>
					)
				},
				{
					key: 'userini',
					rules: [],
				}
			),
		])
	},
})

onMounted(() => {
	getDir()
	getUserini()
})

onUnmounted(() => {
	resetData()
})

defineExpose({
	init: () => {
		getDir()
		getUserini()
	},
})
</script>

<style lang="css" scoped>
:deep(.formItem) {
	@apply flex items-center;
}
:deep(.formLabel) {
	@apply text-secondary mr-2rem text-right w-[8rem];
}
:deep(.formItem .formLabel) {
	@apply text-secondary mr-2rem text-right w-[8rem];
}
:deep(.el-form .el-form-item--small .el-form-item__label) {
	min-width: 7rem;
}
:deep(.formTips) {
	@apply text-tertiary text-small;
}
</style>
