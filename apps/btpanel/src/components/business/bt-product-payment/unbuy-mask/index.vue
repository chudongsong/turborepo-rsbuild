<template>
	<div>
		<!-- 主体遮罩 -->
		<div class="software-mask"></div>
		<div class="software-install">
			<div class="software-view">
				<div class="flex items-center leading-[2.2rem]">
					<i class="svgtofont-el-warning text-orange mr-[8px] !text-[3rem]"></i>
					{{ errorMask.title }}
				</div>
				<div class="flex justify-center mt-[1.6rem]">
					<el-button type="primary" @click="onUnbindEvent">解绑宝塔账号</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { delToken } from '@/api/config'
import { useDataHandle, useConfirm } from '@hooks/tools'
import { useGlobalStore } from '@store/global'
import { jumpRouter } from '@utils/index'
import PRODUCT_PAYMENT_STORE from '../store'

interface Props {
	options?: PluginInfo | PluginInfo[]
	icon?: boolean
	width?: string
	height?: string
}

const { errorMask } = PRODUCT_PAYMENT_STORE()
const { resetAuthState } = useGlobalStore()

// 声明组件传参
const props = withDefaults(defineProps<Props>(), {
	options: () => ({
		name: '',
		title: '',
	}),
})


/**
 * @description 解绑事件
 */
 const onUnbindEvent = async () => {
	await useConfirm({
		icon: 'warning-filled',
		title: '解绑宝塔账号',
		content: '解绑宝塔账号后，将无法正常使用面板功能，是否继续操作？',
	})
	await useDataHandle({
		loading: '正在解绑宝塔账号，请稍候...',
		request: delToken(),
		message: true,
	})
	resetAuthState()
	setTimeout(async () => {
		jumpRouter('/bind')
	}, 2000)
}

</script>

<style lang="css" scoped>
.software-mask {
	position: absolute;
	left: 0;
	top: 0;
	background-color: #f9f9f9;
	opacity: 0.7;
	height: 100%;
	width: 100%;
	z-index: 99;
	border-radius: 0.5rem;
	/* // Assuming 'rounded-lg' maps to 0.5rem */
}

.software-install {
	display: flex;
	justify-content: center;
}

.software-view {
	box-shadow: 0 0 10px 1px #f1f1f1;
	border: 1px solid #f1f1f1;
	padding: 16px;
	width: 43rem;
	padding-left: 24px;
	padding-right: 24px;
	border-radius: 0.25rem;
	/* // Assuming 'rounded-default' maps to 0.25rem */
	position: absolute;
	z-index: 100;
	background-color: white;

	margin: auto;
	height: fit-content;
	right: 0;
	left: 0;
	top: 0;
	bottom: 0;
}
</style>
