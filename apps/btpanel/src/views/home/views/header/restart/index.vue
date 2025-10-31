<template>
	<div class="flex justify-between items-center h-full px-[3rem] reset">
		<!-- 重启服务器 -->
		<el-button type="danger" class="danger-btn" @click="initCalcVerify">重启服务器</el-button>
		<!-- 重启面板 -->
		<el-button size="default" @click="store.onRestartPanel">重启面板</el-button>
		<bt-dialog title="安全重启服务器" v-model="showServer" :area="[46.6, showFooter ? 49 : 45]" ref="serverRestartRef">
			<div class="relative h-full">
				<div class="p-[1.5rem]">
					<el-alert v-if="isDockerPanel" title="危险操作警告：当前服务器疑似运行在容器环境中！" type="warning" :closable="false" class="mb-3">
						<template #default>
							<p class="font-medium mb-2 text-base text-secondary">重启服务器将造成：</p>
							<ul class="list-disc list-inside space-y-1 ml-2 text-small text-secondary">
								<li class="font-medium">容器实例立即销毁</li>
								<li class="font-medium">所有未挂载数据永久丢失</li>
								<li class="font-medium">网站服务完全中断</li>
								<li class="font-medium">可能需要重新部署和配置</li>
							</ul>
							<p class="mt-2 font-medium text-base text-secondary">建议：如仅需重启面板服务，请选择"重启面板服务"</p>
						</template>
					</el-alert>
					<el-alert type="warning" :closable="false" title="即将重启服务器" class="mb-3" v-else>
						<template #default>
							<p class="font-medium mb-2 text-base text-secondary">影响范围：</p>
							<ul class="list-disc list-inside space-y-1 ml-2 text-small text-secondary">
								<li>所有网站服务临时中断（1-5分钟）</li>
								<li>正在进行的用户会话将断开</li>
								<li>未保存的临时数据可能丢失</li>
								<li>SSH连接将断开</li>
							</ul>
							<p class="mt-2 font-medium text-base text-secondary">建议：如仅需重启面板服务，请选择"重启面板服务"</p>
						</template>
					</el-alert>
					<div class="text-small leading-[2.6rem]">
						<p class="mt-[1rem] mb-[1rem]">面板重启服务器将执行以下操作：</p>
						<div id="SafeRestart" class="flex justify-between">
							<div v-if="!courseList.webServe" class="info">
								<span class="gray-bg"></span>
								<p>1. 停止Web服务</p>
							</div>
							<div v-else class="info">
								<span class="green-bg"></span>
								<p class="green-font">正在停止Web服务...</p>
							</div>
							<div v-if="!courseList.mysqlServe" class="info">
								<span class="gray-bg circle-gray"></span>
								<p>2. 停止MySQL服务</p>
							</div>
							<div v-else class="info">
								<span class="green-bg circle-green"></span>
								<p class="green-font">正在停止MySQL服务...</p>
							</div>
							<div v-if="!courseList.restartServe" class="info">
								<span class="gray-bg circle-gray"></span>
								<p>3. 开始重启服务器</p>
							</div>
							<div v-else class="info">
								<span class="green-bg circle-green"></span>
								<p class="green-font">正在重启服务器...</p>
							</div>
							<div v-if="!courseList.serveStart" class="info">
								<span class="gray-bg circle-gray"></span>
								<p>4. 等待服务器启动</p>
							</div>
							<div v-else class="info">
								<span class="green-bg circle-green"></span>
								<p class="green-font">4. 等待服务器启动</p>
								<i class="svgtofont-el-loading animate-spin"></i>
							</div>
						</div>
						<div class="flex items-center tips mb-[12px]" v-if="courseList.serveStart">
							<p>重启进行中时，请勿随意进行刷新，若长时间未响应，可以进行刷新尝试。</p>
						</div>
					</div>
					<!-- 数学计算 -->
					<div class="vcode flex items-center h-[4.8rem] mt-4 pl-[1.2rem] text-base">
						<span>计算结果：</span>
						<span class="mx-[1rem]"> {{ countGroup.num1 }} + {{ countGroup.num2 }} </span>
						<span class="mr-[1rem]">=</span>
						<el-input-number v-model="countGroup.gentle" v-focus autofocus="true" controls-position="right" size="small" @keydown.native.enter="nextTickComfirm" />
					</div>
				</div>
				<div class="el-dialog__footer absolute bottom-0 w-full flex justify-end">
					<el-button type="warning" @click="showServer = false">取消</el-button>
					<el-button type="primary" @click="nextTickComfirm">确认</el-button>
				</div>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import HOME_HEADER_STORE from '@home/views/header/store'

import { storeToRefs } from 'pinia'
import { useMessage } from '@/hooks/tools'
import HOME_STORE from '@home/store'

const store = HOME_HEADER_STORE()
const { showFooter, showServer, serverRestartRef, courseList } = storeToRefs(store)
const homeStore = HOME_STORE()
const { isDockerPanel } = storeToRefs(homeStore)

// 用于计算验证
const countGroup = reactive({
	num1: 0,
	num2: 0,
	gentle: undefined as undefined | number,
})

/**
 * @description 初始化计算验证
 * @returns {void}
 */
const initCalcVerify = (isInit: boolean) => {
	countGroup.num1 = Math.round(Math.random() * 9 + 1)
	countGroup.num2 = Math.round(Math.random() * 9 + 1)
	countGroup.gentle = undefined
	if (isInit !== true) {
		showServer.value = true
	}
}

/**
 * @description 计算验证
 * @param {boolean} isClose 是否关闭弹窗
 * @returns {boolean} 是否验证通过
 */
const onCalc = () => {
	if (countGroup.gentle === countGroup.num1 + countGroup.num2) {
		return false
	}
	useMessage().error('计算错误，请重新计算！')
	return true
}
/**
 * @description 异步提交（解决第一次回车获取不到输入的值问题）
 */
const nextTickComfirm = () => {
	if (onCalc()) return
	const timer = setTimeout(() => {
		store.onRestartServer()
		clearTimeout(timer)
	}, 0)
}

onMounted(() => {
	initCalcVerify(true)
})

onBeforeUnmount(() => {
	store.clearRestart() // 组件卸载时清除定时器
})
</script>

<style lang="css" scoped>
.reset > .el-button {
	@apply w-[12rem] h-[4.2rem] text-small rounded-large border bg-darker border-dark text-default;
}
.reset > .el-button.danger-btn {
	@apply hover:bg-danger hover:text-white;
}
.reset > .el-button:hover:not(.danger-btn) {
	background-color: var(--el-color-primary) !important;
	color: var(--el-color-white);
}
.tips {
	@apply text-small text-danger;
}
#SafeRestart {
	@apply flex-1 leading-[2.6rem] bg-[rgb(var(--el-file-color-light-rgb),0.6)] rounded-base py-[1.6rem] px-[2rem] flex-col;
}
.info {
	@apply flex items-center;
}
.info span {
	@apply w-[0.8rem] h-[0.8rem] rounded-round inline-block relative mr-[1.5rem];
}
.circle-gray::after {
	@apply w-[0.1rem] h-[2.6rem] absolute left-[50%] bottom-[50%];
	content: '';
	transform: translateX(-50%);
	background-color: var(--el-fill-color-darker);
}
.circle-green::after {
	@apply w-[0.1rem] h-[2.6rem] absolute left-[50%] bottom-[50%];
	content: '';
	transform: translateX(-50%);
	background-color: var(--el-color-primary);
}
.green-bg {
	background-color: var(--el-color-primary);
}
.gray-bg {
	background-color: var(--el-fill-color-darker);
}
.green-font {
	@apply text-primary;
}
:deep(.el-message.xiaoMessage) {
	transform: none;
}
</style>
