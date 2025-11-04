<template>
	<div>
		<bt-install-mask v-if="isSetupConfigMask.value">
			<template #content>
				<div class="content-mask">
					<i class="text-warning !text-subtitleLarge svgtofont-el-warning mr-4px"></i>
					<span class="mr-8px">{{ isSetupConfigMask.message }}</span>
				</div>
			</template>
		</bt-install-mask>
		<BtForm v-bt-loading="loading" />
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import useWPWordpressSettingStore from '@/views/wordpress/view/local/site-config/wordpress/useStore'
import { getSetupConfig, getSetupFormOption, getSiteLanguageOption, isSetupConfigMask } from './useController'

const { form, loading } = storeToRefs(useWPWordpressSettingStore())

// 创建一个提交处理函数
const handleSubmit = async () => {
	await submit()
}

const { BtForm, submit } = useForm({
	data: () => form.value,
	options: () => getSetupFormOption(handleSubmit),
	submit: async (param: Ref<any>, validate: () => Promise<'closed' | true>) => {
		await validate()
	},
})

onMounted(async () => {
	await getSetupConfig()
	await getSiteLanguageOption()
})

defineExpose({ init: getSetupConfig })
</script>

<style scoped></style>
