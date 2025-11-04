<template>
	<div>
		<div class="px-20px pt-24px pb-8px">
			<el-form :model="form" label-width="auto">
				<div class="mb-20px">链接：{{ url || '--' }}</div>
				<div class="mb-20px text-desc">
					<div class="mb-6px">注意：</div>
					<div class="leading-18px text-tertiary text-small">默认链接直接使用面板地址访问，用户可以根据IP端口判断出你的面板地址，建议你对原链接反向代理后填入以保证你的面板地址不被泄露。</div>
				</div>
				<el-form-item label="新链接：" prop="url" label-position="left" label-width="50px">
					<div class="w-260px">
						<el-input v-model="form.url" class="w-full" placeholder="" @paste="onPasteUrl">
							<template #prepend>
								<el-select v-model="form.http" :style="{ width: '90px' }">
									<el-option v-for="item in httpOptions" :key="item.value" :label="item.label" :value="item.value" />
								</el-select>
							</template>
						</el-input>
					</div>
				</el-form-item>
			</el-form>
		</div>
		<div class="flex justify-end gap-0 w-full px-18px py-10px border-t border-lighter rounded-b-base bg-light">
			<el-button size="default" @click="onSetDefault"> 恢复默认 </el-button>
			<el-button type="danger" size="default" @click="onCancel"> 取消 </el-button>
			<el-button type="primary" size="default" @click="onConfirm"> 确定 </el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { isObject } from '@/utils'
import { useConfirm, useDataHandle } from '@hooks/tools'
import { delUnsubscribeInfo, getUnsubscribeInfo, setUnsubscribeInfo } from '@/api/mail'

const emit = defineEmits<{
	(event: 'close'): void
}>()

const form = reactive({
	http: 'https://',
	url: '',
})

const url = ref('')

const httpOptions = ref<any[]>([
	{ label: 'http://', value: 'http://' },
	{ label: 'https://', value: 'https://' },
])

const onPasteUrl = (e: ClipboardEvent) => {
	const { clipboardData } = e
	if (clipboardData) {
		const text = clipboardData.getData('text')
		if (text) {
			if (text.indexOf('://') === -1) {
				console.log(1)
				form.url = text
			} else {
				const http = text.split('://')[0] + '://'
				form.http = http
				form.url = text.replace(http, '')
			}
		}
	}
	e.preventDefault()
}

const onSetDefault = async () => {
	useConfirm({
		title: '恢复默认',
		content: '确定要恢复默认退订设置吗？',
		onConfirm: async () => {
			useDataHandle({
				loading: '正在恢复...',
				message: true,
				request: delUnsubscribeInfo(),
				success: () => {
					getInfo()
				},
			})
		},
	})
}

const getInfo = async () => {
	const { data } = await getUnsubscribeInfo()
	if (isObject<{ url: string; panel_url: string }>(data)) {
		url.value = data.panel_url
		if (url.value) {
			const http = url.value.split('://')[0] + '://'
			form.http = http
		}
		if (data.url) {
			const http = data.url.split('://')[0] + '://'
			form.http = http
			form.url = data.url.replace(http, '')
		}
	}
}

const onCancel = () => {
	emit('close')
}

const onConfirm = async () => {
	useDataHandle({
		loading: '正在设置...',
		message: true,
		request: setUnsubscribeInfo({
			url: form.http + form.url,
		}),
		success: () => {
			emit('close')
		},
	})
}

getInfo()

defineExpose({
	onConfirm,
})
</script>

<style lang="scss" scoped>
:deep(.el-form-item__label) {
	min-width: unset;
}
</style>
