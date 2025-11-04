<template>
	<div class="disk-warning">
		<div class="warning-icon">
			<i class="svgtofont-el-warning-filled"></i>
			<span class="text-medium text-red-500">警告，磁盘空间不足</span>
		</div>
		<div class="warning-message">
			<p>当前磁盘存储可用空间小于 500MB，将会导致以下风险，请及时处理：</p>
			<ul>
				<li>1. 网站相关服务无法运行和访问</li>
				<li>2. 面板相关服务将无法正常运或启动</li>
				<li>2. 插件相关服务将无法安装或运行</li>
				<li>3. 服务器出现瘫痪和宕机风险</li>
			</ul>
			<bt-checkbox v-model="isCheckbox" :options="checkList" @change="handleCheckboxChange" />
			<div class="action-buttons">
				<bt-button type="primary" @click="handleProceed">立即处理</bt-button>
				<bt-button @click="handleDismiss">暂不处理</bt-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { openPluginView } from '@/public/index'
import { setCookie } from '@/utils/index'

const isCheckbox = ref([]) // 是否选中
const checkList = ref([
	{
		label: '已知晓风险，忽略本次风险警告',
		value: 1,
	},
])

const emit = defineEmits(['close'])

// 立即处理
const handleProceed = () => {
	openPluginView({
		pluginName: 'disk_analysis',
		source: 120,
		type: 'ltd',
	})
	setCookie('diskPath', '/')
	setCookie('taskStatus', 'true')
	emit('close')
	if (isCheckbox.value.length > 0) sessionStorage.setItem('diskWarn', 'true')
}

// 暂不处理
const handleDismiss = () => {
	// Logic to handle the dismiss action
	emit('close')
	if (isCheckbox.value.length > 0) sessionStorage.setItem('diskWarn', 'true')
}

defineExpose({
	onCancel: handleDismiss,
})
</script>

<style scoped>
/* 风险警告 */
.disk-warning {
	@apply flex flex-col items-center px-[40px] py-[20px];
}
.warning-icon {
	@apply h-[65px] rounded-full flex items-center justify-center;
}
.warning-icon i {
	@apply text-iconLarge text-red-500 mr-[6px];
}
.warning-icon span {
	@apply text-subtitleLarge text-red-500 font-bold;
}

/* 风险警告 */
.warning-message p {
	@apply text-medium mb-[16px] font-bold;
}

/* 风险警告列表 */
.warning-message ul {
	@apply list-none pl-[20px] pl-[0px] mb-[16px];
}

/* 风险警告列表项 */
.warning-message ul li {
	@apply text-base mb-[5px] text-secondary;
}

/* 风险警告列表项-最后一个 */
.warning-message ul li:last-child {
	@apply mb-[0px];
}

.action-buttons {
	@apply mt-[2px];
}
</style>
