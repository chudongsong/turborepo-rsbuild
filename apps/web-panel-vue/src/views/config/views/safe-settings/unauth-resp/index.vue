<template>
	<div>
		<config-rows label="未认证响应状态">
			<template #value>
				<bt-input v-model="mode" disabled class="!w-[26rem]"></bt-input>
				<el-button type="primary" class="!ml-12px" @click="onOpen()">设置</el-button>
			</template>
			<template #desc>
				<span>陌生IP在未登录且未正确输入安全入口时的响应，可用于隐藏面板特征</span>
			</template>
		</config-rows>
		<bt-dialog title="设置未认证时的响应状态" v-model="showPopup" :area="42" show-footer @confirm="onConfirm()">
			<div class="p-[2rem]">
				<el-form class="my-[12px] flex justify-center" label-position="right">
					<el-form-item label="响应状态">
						<el-select v-model="status" placeholder="请选择" class="!w-[20rem]">
							<el-option v-for="item in options" :key="item.key" :label="item.title" :value="item.key"> </el-option>
						</el-select>
					</el-form-item>
				</el-form>
				<ul class="px-[16px] py-[2px] list-disc">
					<li class="h-[2.4rem] text-danger">用于未登录且未正确输入安全入口时的响应,用于隐藏面板特征</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'
import { setNotAuthStatus } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
} = getConfigStore()

const options = shallowRef([
	{ key: 403, title: '403-拒绝访问' },
	{ key: 404, title: '404-页面不存在' },
	{ key: 416, title: '416-无效的请求' },
	{ key: 408, title: '408-客户端超时' },
	{ key: 400, title: '400-客户端请求错误' },
	{ key: 401, title: '401-未授权访问' },
])

// 弹窗开关
const showPopup = ref(false)
const status = ref(404)
const mode = ref(options.value.find((val: any) => val.key === safeConfig.value.statusCode)?.title)

/**
 * @description: 点击设置按钮，打开弹窗
 */
const onOpen = () => {
	showPopup.value = true
	options.value.forEach((val: any) => {
		if (val.key == safeConfig.value.statusCode) {
			status.value = val.key
		}
	})
}

/**
 * @description: 弹窗确认按钮
 */
const onConfirm = () => {
	showPopup.value = false
	setRequestStatus(status.value)
}

/**
 * @description: 设置未认证响应状态
 * @param data.status_code  未认证响应方式的id
 */
const setRequestStatus = async (status_code: number | string) => {
	!status_code ? (status_code += '') : Number(status_code)
	await useDataHandle({
		loading: '正在设置未认证响应状态，请稍候...',
		request: setNotAuthStatus({ status_code }),
		message: true,
	})

	options.value.forEach((val: any) => {
		if (val.key == status.value) {
			safeConfig.value.statusCode = val.key
			mode.value = val.title
		}
	})
}

watch(
	() => safeConfig.value.statusCode,
	(val: number | string) => {
		options.value.forEach((val: any) => {
			if (val.key === safeConfig.value.statusCode) {
				mode.value = val.title
			}
		})
	}
)
</script>

<style lang="css" scoped>
:deep(.el-form .el-form-item--small .el-form-item__label) {
	min-width: 5rem !important;
	margin-right: 1rem;
}
</style>
