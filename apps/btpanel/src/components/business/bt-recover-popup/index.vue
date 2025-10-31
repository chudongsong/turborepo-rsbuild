<template>
	<div class="mx-auto border border-gray-300 rounded-xl p-8 flex flex-col items-center gap-6">
		<div class="relative">
			<span class="svgtofont-el-warning-filled w-[4rem] h-[4rem] !text-large50 inline-block text-amber-400" />
		</div>

		<div class="text-center space-y-3 text-base mt-[2rem]">
			<p>
				当前有数据还原任务正在进行，
				<span class="text-primary cursor-pointer hover:text-primaryDark" @click="handleJump"> 点击跳转还原页面查看进度 </span>
			</p>

			<p class="text-small text-tertiary">*还原过程中请勿进行数据修改操作，否则可能影响数据完整性</p>
		</div>

		<ElButton class="mt-[2rem]" type="primary" @click="handleDismiss"> 我已知晓，不再弹出 </ElButton>
	</div>
</template>

<script setup>
import { useDataHandle } from '@hooks/tools'
import { setBackupPopup } from '@/api/global'

const emit = defineEmits(['close'])
const handleDismiss = async () => {
	// 这里可以添加逻辑将用户选择保存到localStorage或发送到服务器
	await useDataHandle({
		request: setBackupPopup(),
	})
	emit('close')
}

const handleJump = () => {
	localStorage.setItem('hasJump', 'true')
	window.location.href = '/config/back'
}
</script>

<style scoped>
/* 如果需要额外的样式，可以在这里添加 */
</style>
