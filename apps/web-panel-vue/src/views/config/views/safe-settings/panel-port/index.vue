<template>
	<div>
		<config-rows :label="'面板端口'">
			<template #value>
				<bt-input v-model="safeConfig.port" disabled class="!w-[26rem]"></bt-input>
				<el-button type="primary" class="!ml-12px" @click="onSet">设置</el-button>
			</template>
			<template #desc>
				<span>
					<span>建议端口范围8888 - 65535，</span>
					<span class="text-danger">注意：有安全组的服务器请提前在安全组放行新端口</span>
				</span>
			</template>
		</config-rows>
		<bt-dialog :title="'设置面板端口'" v-model="showPopup" :area="40" :show-footer="true" @confirm="onConfirm()">
			<div class="p-[2rem]">
				<ul class="help-list">
					<li>建议端口范围8888 - 65535，</li>
					<li>注意：有安全组的服务器请提前在安全组放行新端口</li>
					<li>如果修改端口导致面板无法访问，请在SSH命令行通过bt命令改回原来的端口</li>
				</ul>
				<el-form id="panelPostFrom" class="mt-[24px] flex justify-center" label-position="left" @submit.native.prevent>
					<el-form-item :label="'面板端口'">
						<bt-input v-model="port" class="w-[21rem] edit-input"></bt-input>
					</el-form-item>
				</el-form>
				<el-checkbox v-model="checked" class="pl-16px">
					<div class="text-small flex items-center">我已了解,<bt-link href="https://www.bt.cn/bbs/thread-40037-1-1.html">如何放行端口？</bt-link></div>
				</el-checkbox>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { Message } from '@hooks/tools'
import { checkPort, refreshBrowser } from '@utils/index'
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'
import { setPanelConfig } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig, openPortPopup },
} = getConfigStore()

const port = ref(8888)
const checked = ref(false)
const showPopup = ref(false) // 弹窗开关

/**
 * @description 设置面板端口
 */
const onSet = () => {
	showPopup.value = true
	port.value = safeConfig.value.port
}

/**
 * @description: 弹窗确认按钮
 */
const onConfirm = () => {
	if (!checked.value) {
		Message.error('请勾选同意协议')
		return false
	}
	// 确保转换为数字类型
	const portNumber = Number(port.value)
	if (!checkPort(portNumber)) return Message.error('端口格式错误，请重新输入')

	showPopup.value = false
	panelSet()
}

/**
 * @description: 设置面板配置
 */
const panelSet = async () => {
	await useDataHandle({
		loading: '正在设置面板端口，请稍候...',
		request: setPanelConfig({ port: port.value }),
		message: true,
	})
	refreshBrowser(`${location.protocol}//${location.hostname}:${port.value}${location.pathname}`, 2000)
}

watch(
	() => openPortPopup,
	val => {
		// 判断是否需要进入打开弹窗
		if (val) {
			onSet()
			openPortPopup.value = false
		}
	},
	{
		deep: true,
	}
)
</script>

<style lang="css" scoped>
.help-list {
	@apply p-[16px] pl-[32px] list-disc border border-light bg-light rounded-base text-danger;
}
.help-list li {
	@apply leading-[2.4rem];
}
:deep(#panelPostFrom.el-form .el-form-item--small .el-form-item__label) {
	min-width: 5rem;
	margin-right: 1rem;
}
:deep(.el-form .el-form-item__label) {
	margin-left: -2rem;
}
:deep(.edit-input .el-input__wrapper) {
	margin-left: -4rem;
}
</style>
