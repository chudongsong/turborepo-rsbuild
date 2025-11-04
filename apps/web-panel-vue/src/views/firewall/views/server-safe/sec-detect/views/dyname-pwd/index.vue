<template>
    <div>
        <el-switch :model-value="totpAuth" @change="onChange" />
    </div>
</template>

<script setup lang="tsx">
import { openRiskTipsView } from '@/views/config/useMethod'
import { useDataHandle, useDialog } from '@hooks/tools'
import { getCheckTwoStep, setTwoStepAuth } from '@/api/config'
import { fetchSecDetect } from '../../useController'

interface Props {
    initialStatus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    initialStatus: false
})

const totpAuth = ref(props.initialStatus)

// 监听 props 变化，更新本地状态
watch(() => props.initialStatus, (newStatus) => {
    totpAuth.value = newStatus
}, { immediate: true })

const onChange = (val: boolean | string | number) => {
	const boolVal = Boolean(val)
	if (boolVal) {
		openTips()
	} else {
		setTwoStep(Number(boolVal))
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
 * @description: 打开动态口令配置弹窗
 */
 const openDynameView = () => {
	useDialog({
		title: '动态口令配置',
		component: () => import('@config/views/safe-settings/dyname-pwd/dyname-pwd-config.vue'),
		area: 55,
	})
}

/**
 * @description: 设置动态口令
 */
 const setTwoStep = async (act: number) => {
	try {
		const res: any = await useDataHandle({
			loading: '正在设置动态口令配置，请稍候...',
			request: setTwoStepAuth({ act }),
			message: true,
			success: () => {
				fetchSecDetect()
				if (act) openDynameView()
			},
		})
		if (res.status) {
			totpAuth.value = Boolean(act)
		}
	} catch (error) {
		console.error('设置动态口令失败:', error)
	}
}

</script>

<style scoped lang="scss">
</style>