<template>
	<div class="flex flex-col p-[1.6rem]">
		<el-tabs type="card" v-model="tabActive">
			<el-tab-pane label="拦截规则" name="1">
				<el-form :model="form" :rules="rules" ref="formRef" class="relative w-full" :label-position="`right`" @submit.native.prevent>
					<el-form-item prop="minutes" label="扫描时间">
						<el-input v-model="form.minutes" class="form-input" />
						<span class="ad-unit">分钟</span>
					</el-form-item>
					<el-form-item prop="scan_count" label="访问次数">
						<el-input v-model="form.scan_count" class="form-input" />
						<span class="ad-unit">次</span>
					</el-form-item>
					<el-form-item label="" class="ml-40">
						<el-button type="primary" @click="handleSubmit">保存</el-button>
					</el-form-item>
				</el-form>
			</el-tab-pane>
			<el-tab-pane label="数据清理" name="2">
				<el-form :model="form" :rules="rules" class="relative w-full" :label-position="`right`" @submit.native.prevent>
					<el-form-item prop="cleanup_days" label="扫描数据超过">
						<el-input v-model="form.cleanup_days" class="form-input" />
						<span class="ad-unit">天，将自动清理</span>
					</el-form-item>
					<el-form-item class="ml-40">
						<el-button type="primary" @click="handleSubmit">保存</el-button>
					</el-form-item>
				</el-form>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script lang="ts" setup>
import { saveScanPerceptionDetail } from '@/api/firewall'
import { useDataHandle, useMessage } from '@/hooks/tools'

type formDataProp = {
	minutes?: string
	scan_count?: string
	cleanup_days?: string
}

const props = withDefaults(
	defineProps<{
		compData: {
			config: formDataProp
		}
	}>(),
	{
		compData: () => ({
			config: {
				minutes: '',
				scan_count: '',
				cleanup_days: '',
			},
		}),
	}
)
const emit = defineEmits<{
	(event: 'update:config', config: formDataProp): void
}>()
const tabActive = ref('1')
const formRef = ref()
const form = ref<formDataProp>(props.compData.config)
const rules = {
	minutes: [{ required: true, message: '请输入扫描时间', trigger: 'blur' }],
	scan_count: [{ required: true, message: '请输入访问次数', trigger: 'blur' }],
	cleanup_days: [{ required: true, message: '请输入最大天数', trigger: 'blur' }],
}
/**
 * @description 保存
 */
const handleSubmit = async () => {
	await formRef.value.validate()
	let params: formDataProp = {}
	if (tabActive.value === '1') {
		params['minutes'] = form.value.minutes
		params['scan_count'] = form.value.scan_count
	} else {
		params['cleanup_days'] = form.value.cleanup_days
	}
	await useDataHandle({
		loading: '正在保存规则，请稍后...',
		request: saveScanPerceptionDetail(params),
		success: (res: any) => {
			useMessage().request(res)
			if (res.status) {
				emit('update:config', params)
			}
		},
	})
}
</script>
<style lang="sass" scoped>
.form-input
	width: 12rem !important
	margin-right: 1rem !important
.ad-unit
	@apply text-small
</style>
