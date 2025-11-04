<template>
	<div>
		<config-rows label="密码复杂度验证">
			<template #value>
				<el-switch v-model="safeConfig.pawComplexity" @change="changeSwitch"></el-switch>
			</template>
			<template #desc>
				<span>为面板密码提供复杂度验证方式，复杂度验证规则：</span>
				<span class="text-danger">密码必须满足密码长度大于8位且大写字母、小写字母、数字、特殊字符至少3项组合</span>
			</template>
		</config-rows>
		<bt-dialog title="开启 密码复杂度验证" v-model="openPwdSafePopup" :area="36" :show-footer="true" @confirm="handleDialogConfirm(true)" @cancel="handleDialogAction(true)">
			<div class="p-[2rem] flex">
				<i class="svgtofont-el-warning-filled text-warningDark !text-titleLarge pr-4"></i>
				<p class="text-base leading-8">
					开启密码复杂度验证后，将会对密码进行复杂度判断，规则：
					<span class="text-danger">密码必须满足密码长度大于8位且大写字母、小写字母、数字、特殊字符至少3项组合</span>
					，继续操作！
				</p>
			</div>
		</bt-dialog>
		<bt-dialog title="关闭 密码复杂度验证" v-model="closePwdSafePopup" :area="[36, 'auto']" :show-footer="true" @confirm="handleDialogConfirm(false)" @cancel="handleDialogAction(false)">
			<div class="p-[2rem] flex">
				<i class="svgtofont-el-warning-filled text-warningDark !text-titleLarge pr-4"></i>
				<p class="text-base leading-8">关闭密码复杂度后，密码登录将不再验证密码复杂度，这将会导致面板安全性下降，继续操作！</p>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { getPasswordConfig, setPasswordSafe } from '@/api/config'
import { useDataHandle } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
} = getConfigStore()

const openPwdSafePopup = ref(false) // 开启弹窗显示与隐藏
const closePwdSafePopup = ref(false) // 关闭弹窗显示与隐藏

/**
 * @description: Switch开关
 */
const changeSwitch = (val: boolean) => {
	val ? (openPwdSafePopup.value = true) : (closePwdSafePopup.value = true)
}

/**
 * @description: 统一处理弹窗取消操作
 */
const handleDialogAction = (isOpenDialog: boolean) => {
	const dialogRef = isOpenDialog ? openPwdSafePopup : closePwdSafePopup
	if (!dialogRef.value) return // 如果已经关闭则不再执行
	safeConfig.value.pawComplexity = !safeConfig.value.pawComplexity
	dialogRef.value = false
}

/**
 * @description: 统一处理弹窗确认操作
 */
const handleDialogConfirm = (isOpenDialog: boolean) => {
	const dialogRef = isOpenDialog ? openPwdSafePopup : closePwdSafePopup
	if (!dialogRef.value) return // 如果已经关闭则不再执行
	dialogRef.value = false
	setPassword()
}

/**
 * @description: 获取密码过期验证状态
 */
const getPasswordStatus = async () => {
	try {
		const { data } = await getPasswordConfig()
		safeConfig.value.pawComplexity = data.password_safe // 密码复杂度
	} catch (err) {
		console.log(err)
	}
}

/**
 * @description: 开启或关闭密码复杂度
 */
const setPassword = async () => {
	await useDataHandle({
		loading: '正在设置密码复杂度，请稍候...',
		request: setPasswordSafe(),
		message: true,
		success: getPasswordStatus,
	})
}
</script>
