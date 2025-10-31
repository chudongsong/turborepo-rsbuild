<template>
	<div class="p-[2rem]">
		<span>检测到当前已启用【系统加固】，如需要继续操作，请选择临时关闭时间</span>
		<el-form ref="sysFixedForm" :model="form" :disabled="formDisabled" class="mt-[2rem]">
			<el-form-item label="临时放行：">
				<el-radio-group v-model="form.timeValue" size="small">
					<el-radio-button label="5分钟" value="5分钟"></el-radio-button>
					<el-radio-button label="10分钟" value="10分钟"></el-radio-button>
					<el-radio-button label="30分钟" value="30分钟"></el-radio-button>
					<el-radio-button label="60分钟" value="60分钟"></el-radio-button>
				</el-radio-group>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { setAtuoStartSyssafe } from '@api/global'
import { useDataHandle } from '@/hooks/tools'

const form = reactive({
	timeValue: '5分钟',
})
const formDisabled = ref(false) // 表单禁用
const sysFixedForm = ref() // 表单ref

const onConfirm = async (close: () => void) => {
	const time = form.timeValue.replaceAll('分钟', '')
	const currentTime = Math.floor(Date.now() / 1000) // 当前时间的10位时间戳
	const targetTime = currentTime + parseInt(time, 10) * 60 // 当下过了time分钟后的10位时间戳
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
