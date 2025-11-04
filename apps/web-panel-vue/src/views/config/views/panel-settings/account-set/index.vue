<template>
	<config-rows :label="'绑定宝塔账号'">
		<template #value>
			<div></div>
			<bt-input v-model="panelConfig.account" disabled class="!w-[26rem]"></bt-input>
			<template v-if="!aliyunEcsLtd && payment.bindUser">
				<el-button type="primary" class="!ml-12px" @click="onSetEvent">设置</el-button>
				<el-button class="!ml-12px" @click="onUnbindEvent">解绑</el-button>
			</template>
			<template v-else>
				<el-button type="primary" class="!ml-12px" @click="onSetEvent">绑定</el-button>
			</template>
		</template>
		<template #desc>
			<span><span v-if="aliyunEcsLtd" class="text-danger">(当前为企业版，绑定账号后无法切换账号)，</span>面板大多数功能依赖云端服务(证书申请，产品购买，软件列表等)，该功能仅用于云端服务，不涉及敏感操作</span>
		</template>
	</config-rows>
</template>

<script lang="ts" setup>
import { delToken } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { bindUserDialog } from '@/public/index'
import { jumpRouter } from '@utils/index'
import { getConfigStore } from '@/views/config/useStore'
import { useConfirm, useMessage } from '@hooks/tools'
import { useGlobalStore } from '@store/global'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { panelConfig },
	getGlobalConfig,
} = getConfigStore()

const { forceLtd, aliyunEcsLtd, payment, resetAuthState } = useGlobalStore()

/**
 * @description 设置事件
 */
const onSetEvent = () => bindUserDialog()

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
