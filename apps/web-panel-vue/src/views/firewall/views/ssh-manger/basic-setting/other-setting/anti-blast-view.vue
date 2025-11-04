<!--  -->
<template>
	<div class="p-[2rem]">
		<el-form :model="antiBlastForm" ref="blastFormRef">
			<el-form-item label="最大重试次数">
				<bt-input type="number" v-model="antiBlastForm.maxretry" width="24rem">
					<template #append>次</template>
				</bt-input>
			</el-form-item>
			<el-form-item label="周期">
				<bt-input type="number" v-model="antiBlastForm.findtime" width="24rem">
					<template #append>秒</template>
				</bt-input>
			</el-form-item>
			<el-form-item label="禁止时间">
				<bt-input type="number" v-model="antiBlastForm.bantime" width="24rem">
					<template #append>秒</template>
				</bt-input>
			</el-form-item>
		</el-form>
		<ul class="mt-8px leading-8 text-small list-disc ml-20px">
			<li>监控SSHD服务日志，在设置周期内(300秒)有超过最大重试次数(5次)的IP访问，将禁止该IP访问86400秒(默认禁止时间)</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { getAntiConf, setAntiConf } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools/data'

const blastFormRef = ref() // 防暴破表单ref
const antiBlastForm = ref({
	maxretry: 0, // 最大重试次数
	findtime: 0, // 周期
	bantime: 0, // 禁止时间
}) // 防暴破表单数据

/**
 * @description: 获取防暴破配置
 */
const getSshAntiBlast = async () => {
	const res = await useDataHandle({
		loading: '正在获取配置,请稍后...',
		request: getAntiConf(),
	})
	antiBlastForm.value = res.data
}

/**
 * @description: 确认按钮
 */
const onConfirm = async (close: any) => {
	await useDataHandle({
		loading: '正在设置防暴破配置,请稍后...',
		request: setAntiConf(antiBlastForm.value),
		message: true,
	})
	close()
}

defineExpose({ onConfirm })

onMounted(() => {
	// 获取防暴破配置
	getSshAntiBlast()
})
</script>
