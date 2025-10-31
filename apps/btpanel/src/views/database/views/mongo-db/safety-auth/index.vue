<template>
	<div>
		<el-button type="default" @click="safetyView = true">安全认证</el-button>

		<bt-dialog title="安全认证" v-model="safetyView" :area="40">
			<div class="p-20px">
				<div class="flex items-center">
					<span class="mr-8px">安全认证：</span>
					<el-switch v-model="safetyStatus" :width="36" @change="changeSafety"></el-switch>
				</div>
				<ul class="mt-8px leading-8 text-small list-disc ml-20px">
					<li>安全认证：开启后访问数据需要使用帐号和密码</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { setAuthStatus } from '@/api/database'
import { getDatabaseStore } from '@database/useStore'
import { useHandleError, useDataHandle } from '@hooks/tools'

const {
	refs: { safetyStatus },
} = getDatabaseStore()

const safetyView = ref<boolean>(false) // 安全认证弹窗

/**
 * @description 设置安全认证状态
 */
const changeSafety = async () => {
	try {
		await useDataHandle({
			loading: '正在设置安全状态，请稍候...',
			request: setAuthStatus({
				data: JSON.stringify({ status: safetyStatus.value ? '1' : '0' }),
			}),
			message: true,
			success: (res: any) => {
				if (!res.status) safetyStatus.value = !safetyStatus.value
			},
		})
	} catch (error) {
		useHandleError(error, 'changeSafety')
	}
}
</script>
