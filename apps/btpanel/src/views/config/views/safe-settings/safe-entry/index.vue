<template>
	<div>
		<config-rows label="安全入口">
			<template #value>
				<bt-input v-model="safeConfig.admin_path" disabled class="!w-[26rem]"></bt-input>
				<el-button type="primary" class="!ml-12px" @click="onSet">设置</el-button>
			</template>
			<template #desc>
				<span>面板管理入口，设置后只能通过指定安全入口登录面板,如: /www_bt_cn</span>
			</template>
		</config-rows>
		<bt-dialog title="设置面板安全入口" v-model="showPopup" :area="40" show-footer @confirm="onConfirm()" @submit.native.prevent>
			<div class="p-[2.8rem]">
				<el-form class="flex justify-center" label-position="right">
					<el-form-item label="安全入口">
						<bt-input v-model="admin_path" class="!w-[24rem]"></bt-input>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { rsaEncrypt } from '@utils/index'
import { useDataHandle } from '@hooks/tools'
import { setAdminPath } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
} = getConfigStore()

const admin_path = ref('')

// 弹窗开关
const showPopup = ref(false)

/**
 * @description: 设置按钮
 */
const onSet = () => {
	admin_path.value = safeConfig.value.admin_path
	showPopup.value = true
}

/**
 * @description: 弹窗确认按钮
 */
const onConfirm = () => {
	safeConfig.value.admin_path = admin_path.value
	setEntrance(admin_path.value)
	showPopup.value = false
}

/**
 * @description: 设置安全入口
 * @param data.admin_path — 安全入口
 */
const setEntrance = async (admin_path: string) => {
	admin_path = await rsaEncrypt(admin_path)
	await useDataHandle({
		request: setAdminPath({ admin_path }),
		message: true,
		loading: '正在设置安全入口，请稍候...',
	})
}
</script>

<style lang="css" scoped>
:deep(.el-form .el-form-item--small .el-form-item__label) {
	@apply min-w-[4rem];
}
</style>
