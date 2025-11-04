<template>
	<div class="p-[16px]">
		<el-alert type="success" :closable="false">
			<template #title>
				<div class="mr-[3.2rem] text-small pb-[5px]">温馨提示：支持拖拽证书文件上传，并自动识别。</div>
			</template>
		</el-alert>
		<div class="flex flex-1 justify-start mt-[16px]">
			<div class="flex-1 mr-[2rem]">
				<div class="mb-[.4rem]">密钥(KEY)</div>
				<div class="drop-zone mb-[.2rem] p-[.2rem]" :class="{ over: isDraggingKey }" @dragover.prevent="isDraggingKey = true" @dragleave.prevent="isDraggingKey = false" @drop="handleDrop('key', $event)">
					<el-input type="textarea" :rows="22" v-model="certKey" />
				</div>
			</div>
			<div class="flex-1">
				<div class="mb-[.4rem]">证书(PEM格式)</div>
				<div class="drop-zone mb-[.2rem] p-[.2rem]" :class="{ over: isDraggingCsr }" @dragover.prevent="isDraggingCsr = true" @dragleave.prevent="isDraggingCsr = false" @drop="handleDrop('csr', $event)">
					<el-input type="textarea" :rows="22" v-model="certCsr" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { createLetsEncryptCertOrder, saveCert } from '@api/ssl'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const emits = defineEmits(['close'])
const certKey = ref('')
const certCsr = ref('')
const isDraggingKey = ref(false)
const isDraggingCsr = ref(false)

const handleDrop = (type: 'key' | 'csr', event: DragEvent) => {
	event.preventDefault()
	if (type === 'key') {
		isDraggingKey.value = false
	} else {
		isDraggingCsr.value = false
	}

	if (window.FileReader) {
		const files = event.dataTransfer?.files
		if (files && files.length > 0) {
			const file = files[0]
			const reader = new FileReader()
			reader.onload = e => {
				if (e.target?.result) {
					if (type === 'key') {
						certKey.value = e.target.result as string
					} else {
						certCsr.value = e.target.result as string
					}
				}
			}
			reader.onerror = () => {
				useMessage().error('请上传证书文件')
			}
			reader.readAsText(file)
		} else {
			useMessage().error('无效的证书文件拖拽上传')
		}
	} else {
		useMessage().error('当前浏览器版本不支持文件拖拽上传，请升级浏览器版本')
	}
}

const refreshMap = {
	ssl: () => (sslIsRefresh.value = true),
	test: () => (testIsRefresh.value = true),
	encrypt: () => (encryptIsRefresh.value = true),
	other: () => (otherIsRefresh.value = true),
} as const

const onConfirm = async () => {
	try {
		const ress = await saveCert({ key: certKey.value, csr: certCsr.value })
		useMessage().request(ress)
		if (ress.status) {
			emits('close')
			if (ress.creat_order) {
				useConfirm({
					title: '创建证书订单',
					content: "检测到证书文件为let's encrypt证书，是否立即同步证书？",
					onConfirm: async () => {
						useDataHandle({
							request: createLetsEncryptCertOrder({ ssl_hash: ress.ssl_hash }),
							loading: '正在同步证书',
							message: true,
							success: () => {
								refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
							},
						})
					},
				})
			}
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
		}
	} catch (error) {
		console.log(error)
	}
}

defineExpose({ onConfirm })
</script>

<style scoped>
.drop-zone {
	/* border: 2px dashed var(--el-base-primary); */
	border-radius: var(--el-border-radius-base);
	padding: 5px;
	text-align: center;
	transition:
		border-color 0.3s,
		color 0.3s;
}

.drop-zone.over {
	border-color: var(--el-base-primary);
	color: var(--el-color-text-primary);
}
</style>
