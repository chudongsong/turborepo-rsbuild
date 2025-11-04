<template>
	<div class="software-mask"></div>
	<div class="software-install">
		<div class="software-view">
			<span class="svgtofont-el-warning-filled text-warning !text-iconLarge mr-1rem"></span>
			<div class="flex flex-col">
				<div class="text-large flex items-center leading-10 mb-[4px]">警告：{{ errorActive?.title || '未知错误' }}</div>
				<span class="my-[4px]">
					错误代码：
					<span class="text-danger font-normal">
						{{ errorActive?.code || code || '未知错误数据' }}
					</span>
				</span>
				<span class="font-normal mb-[4px] leading-10">
					<span class="font-bold">错误：</span>
					{{ errorActive?.content || '出现未知错误，请联系客服排查问题' }}
				</span>
				<BtButton v-if="errorType.includes('disk')" class="!mt-[8px]" @click="jumpRouter('/files')"> 立即清理 </BtButton>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ErrorMaskProps } from '@/hooks/business/error-mask'
import { jumpRouter } from '@/utils'

interface Props {
	options: ErrorMaskProps
}

// 组件参数
const props = withDefaults(defineProps<Props>(), {
	options: () => ({
		code: '',
	}),
})

// 错误文本
const code = toRef(props.options.code)

// 错误类型
const errorType = ref<'request' | 'disk'>('request')

// 错误数据
const errorActive = computed(() => {
	return errorInfo.find(item => item.code === code.value)
})

// 错误配置
const errorInfo = [
	{
		code: 'database is read only!',
		content: '系统根目录磁盘已满，面板数据库已更改为只读模式，面板部分功能无法正常使用，请立即前往文件管理清理磁盘空间',
		title: '系统根目录磁盘已满，请清理磁盘空间！',
	},
	{
		code: 'unable to open database file',
		title: '系统根目录磁盘已满，请清理磁盘空间！',
		content: '系统根目录磁盘已满，面板数据无法显示，请立即前往文件管理清理磁盘空间',
	},
]
</script>

<style lang="css" scoped>
.software-mask {
	position: absolute;
	left: 0;
	top: 0;
	background-color: rgba(var(--el-color-white-rgb), 1);
	opacity: 0.7;
	height: 100%;
	width: 100%;
	z-index: 99;
	border-radius: var(--el-radius-base);
	/* // Assuming 'rounded-base' maps to 0.5rem */
}

.software-install {
	display: flex;
	justify-content: center;
}

.software-view {
	box-shadow: 0 0 10px 1px var(--el-color-border-extra-light);
	border: 1px solid var(--el-color-border-extra-light);
	display: flex;
	justify-content: center;
	align-items: start;
	padding: 16px;
	padding-left: 24px;
	padding-right: 24px;
	border-radius: var(--el-radius-small);
	position: absolute;
	left: 50%;
	top: 50%;
	margin-left: -20rem;
	margin-top: -2.5rem;
	z-index: 3008;
	background-color: rgba(var(--el-color-white-rgb), 1);
}
</style>
