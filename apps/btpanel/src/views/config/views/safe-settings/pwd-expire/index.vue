<template>
	<div>
		<config-rows label="密码过期时间">
			<template #value>
				<div class="w-[26rem]">
					<bt-input v-model="ps" disabled></bt-input>
				</div>
				<el-button type="primary" class="!ml-12px" @click="showPopup = true">设置</el-button>
			</template>
			<template #desc>
				<span>为面板密码设置过期时间，过期后需要重新设置密码</span>
			</template>
		</config-rows>
		<bt-dialog title="设置密码过期时间" v-model="showPopup" :area="40" :show-footer="true" @confirm="onConfirm()">
			<div class="p-[2rem]">
				<el-form ref="pwdFormRef" :rules="rules" :model="pwdForm" class="my-[12px] flex justify-center" label-position="left" @submit.native.prevent>
					<el-form-item label="密码过期时间" prop="day">
						<bt-input v-model="pwdForm.day" text-type="天" type="number" min="0" class="!w-[16rem]">
							<template #append> 天 </template>
						</bt-input>
					</el-form-item>
				</el-form>
				<ul class="px-[1.6rem] py-[.2rem] list-disc">
					<li class="h-[2.4rem] text-danger">面板密码过期时间设置，过期后需要重新设置密码</li>
					<li class="h-[2.4rem]">密码过期时间为“0天”，则关闭密码过期时间功能</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { Message } from '@hooks/tools'
import { formatTime } from '@utils/index'
import { useDataHandle } from '@hooks/tools'
import { getPasswordConfig, setPawExpire } from '@/api/config'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
} = getConfigStore()

const pwdFormRef = ref()
const pwdForm = ref({
	day: 0 as number,
})

const ps = ref('')
const showPopup = ref(false) // 弹窗开关

let defaultExpire: number = 0

const rules = reactive({
	day: [
		{
			validator: (rule: any, value: any, callback: any) => {
				// 大于等于0的整数
				if (Number.parseInt(value) < 0 || !Number.isInteger(parseFloat(value))) {
					callback(new Error('请输入大于等于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['input', 'change'],
		},
	],
})

watch(
	() => showPopup.value,
	val => {
		if (val) pwdForm.value.day = defaultExpire
	}
)

/**
 * @description: 弹窗确认按钮
 */
const onConfirm = async () => {
	await pwdFormRef.value.validate()
	showPopup.value = false
	setPasswordStatus(pwdForm.value.day)
	getPasswordStatus()
}

/**
 * @description: 获取密码过期验证状态
 */
const getPasswordStatus = async () => {
	try {
		const { data } = await getPasswordConfig()
		data.expire ? (ps.value = formatTime(data.expire_time, 'yyyy/MM/dd HH:mm:ss') + ' （剩余' + data.expire_day + '天过期）') : (ps.value = '未设置')
		pwdForm.value.day = data.expire
		defaultExpire = data.expire
		safeConfig.value.pawComplexity = data.password_safe // 密码复杂度
	} catch (err) {
		console.log(err)
	}
}

/**
 * @description: 设置密码过期验证状态
 * @param { string | number } data.expire 密码过期天数
 */
const setPasswordStatus = async (expire: number) => {
	await useDataHandle({
		loading: '正在设置密码过期时间，请稍候...',
		request: setPawExpire({ expire }),
		message: true,
	})
}

onMounted(() => {
	getPasswordStatus()
})
</script>
