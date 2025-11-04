<template>
	<div class="p-[2rem]">
		<span>检测到当前已启用【系统加固】，如需要继续操作，请选择临时关闭时间</span>
		<el-form :model="form" ref="sysFixedForm" :disabled="formDisabled" class="mt-[2rem]">
			<el-form-item label="临时放行：">
				<bt-radio
					type="button"
					v-model="form.timeValue"
					:options="[
						{ label: '5分钟', value: '5分钟' },
						{ label: '10分钟', value: '10分钟' },
						{ label: '30分钟', value: '30分钟' },
						{ label: '60分钟', value: '60分钟' },
					]"></bt-radio>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { setAtuoStartSyssafe } from '@api/crontab'

const form = reactive({
	timeValue: '5分钟',
})
const formDisabled = ref(false) // 表单禁用
const sysFixedForm = ref() // 表单ref

const onConfirm = async (close: any) => {
	let time = form.timeValue.replaceAll('分钟', '')
	let currentTime = Math.floor(Date.now() / 1000) // 当前时间的10位时间戳
	let targetTime = currentTime + parseInt(time) * 60 // 当下过了time分钟后的10位时间戳
	await sysFixedForm.value.validate()
	await useDataHandle({
		loading: formDisabled,
		request: setAtuoStartSyssafe({ time: targetTime }),
		message: true,
	})
	close()
}

defineExpose({
	onConfirm,
})
</script>
