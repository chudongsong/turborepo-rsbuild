<template>
	<div>
		<config-rows :label="'动态口令认证'">
			<template #value>
				<el-switch v-model="safeConfig.checkTwoStep" @change="onChange(safeConfig.checkTwoStep)"></el-switch>
				<el-button size="small" class="!ml-12px" @click="openDynameEvent">动态口令配置</el-button>
			</template>
			<template #desc>
				<span>(Google Authenticator，谷歌身份认证)为面板提供动态口令的登录的验证，</span>
				<bt-link href="https://www.bt.cn/bbs/forum.php?mod=viewthread&tid=105839">了解详情</bt-link>
			</template>
		</config-rows>
	</div>
</template>

<script lang="ts" setup>
import { getCheckTwoStep, setTwoStepAuth } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'
import { useDialog } from '@hooks/tools'
import { openRiskTipsView } from '@/views/config/useMethod'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
} = getConfigStore()

const isSwitch = ref(false) // 是否从开关开启

/**
 * @description: 开启或关闭BasicAuth认证按钮开关
 */
const onChange = (val: boolean) => {
	safeConfig.value.checkTwoStep = !val
	if (val) {
		openTips()
	} else {
		setTwoStep(Number(val))
	}
}

const openTips = () => {
	openRiskTipsView({
		content: [
			'<span class="text-danger">必须要用到且了解此功能才决定自己是否要开启!!<span>',
			'<span class="text-danger">如果无法验证，命令行输入"bt 24" 取消动态口令认证<span>',
			'服务器的时间与网络时间需一致，否则无法验证。',
			'开启服务后，请立即绑定，以免出现面板不能访问。',
			'请先下载宝塔APP或(谷歌认证器)，并完成安装和初始化。',
			'基于google Authenticator 开发,如遇到问题请<a class="btlink" href="https://www.bt.cn/bbs/forum.php?mod=viewthread&tid=105839" rel="noreferrer noopener">查看详情</a>',
		],
		isShowAppCode: true,
		onConfirm: () => setTwoStep(1),
	})
}

/**
 * @description: 打开弹窗
 */
const openDynameEvent = () => {
	if (!safeConfig.value.checkTwoStep) {
		openTips()
	} else {
		openDynameView()
	}
}

/**
 * @description: 打开动态口令配置弹窗
 */
const openDynameView = () => {
	useDialog({
		title: '动态口令配置',
		component: () => import('./dyname-pwd-config.vue'),
		area: 55,
	})
}

/**
 * @description: 设置动态口令
 */
const setTwoStep = async (act: number) => {
	const res = await useDataHandle({
		loading: '正在设置动态口令配置，请稍候...',
		request: setTwoStepAuth({ act }),
		message: true,
		success: () => {
			if (act) openDynameView()
		},
	})
	if (res.status) safeConfig.value.checkTwoStep = Boolean(act)
}

/**
 * @description: 获取动态口令状态
 */
const getCheckTwoStepStatus = async () => {
	const { data } = await getCheckTwoStep()
	safeConfig.value.checkTwoStep = data.status
}

onMounted(() => {
	getCheckTwoStepStatus()
})
</script>
