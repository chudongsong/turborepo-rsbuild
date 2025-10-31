<template>
	<div>
		<config-rows label="BasicAuth认证">
			<template #value>
				<el-switch v-model="safeConfig.basicAuth" @change="onChange(safeConfig.basicAuth)"></el-switch>
			</template>
			<template #desc>
				<span>为面板增加一道基于BasicAuth的认证服务，有效防止面板被扫描，</span>
				<bt-link href="https://www.bt.cn/bbs/thread-34374-1-1.html">了解详情</bt-link>
			</template>
		</config-rows>

		<bt-dialog title="配置BasicAuth认证" v-model="showPopup2" :area="50" @cancel="onCancel()">
			<div class="p-[24px]">
				<el-form v-model="basicAuthConfig">
					<el-form-item label="服务状态">
						<el-switch v-model="basicAuthConfig.open"></el-switch>
					</el-form-item>
					<el-form-item label="用户名">
						<bt-input class="!w-[28.8rem]" v-model="basicAuthConfig.basic_user" placeholder="请设置用户名"></bt-input>
					</el-form-item>
					<el-form-item label="密码">
						<bt-input class="!w-[28.8rem]" v-model="basicAuthConfig.basic_pwd" placeholder="请输入密码"></bt-input>
					</el-form-item>
					<el-form-item label=" ">
						<el-button type="primary" @click="setBasic()">保存</el-button>
					</el-form-item>
				</el-form>
				<ul class="pl-[32px] list-disc help leading-8">
					<li>注意：请不要在这里使用您的常用密码，这可能导致密码泄漏!</li>
					<li>开启后，以任何方式访问面板，将先要求输入BasicAuth用户名和密码</li>
					<li>开启后，能有效防止面板被扫描发现，但并不能代替面板本身的帐号密码</li>
					<li>请牢记BasicAuth密码，一但忘记将无法访问面板</li>
					<li>如忘记密码，可在SSH通过bt命令来关闭BasicAuth验证</li>
				</ul>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { getConfigStore } from '@config/useStore'
import { Message } from '@hooks/tools'
import { setBasicAuth } from '@api/config'
import { openRiskTipsView } from '@/views/config/useMethod'
import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
} = getConfigStore()

const showPopup1 = ref(false) // 开启BasicAuth认证提示
const showPopup2 = ref(false) // 配置BasicAuth认证
const checked = ref(false) // 是否勾选详情

// BasicAuth表单数据
const basicAuthConfig = reactive({
	basic_user: '', // 用户
	basic_pwd: '', // 密码
	open: true, // 服务状态
})

/**
 * @description: 开启或关闭BasicAuth认证按钮开关
 */
const onChange = async (val: boolean) => {
	if (val) {
		openRiskTipsView({
			content: [
				'<span class="text-danger">必须要用到且了解此功能才决定自己是否要开启!!<span>',
				'开启后，以任何方式访问面板，将先要求输入BasicAuth用户名和密码',
				'开启后，能有效防止面板被扫描发现，但并不能代替面板本身的帐号密码',
				'请牢记BasicAuth密码，一但忘记将无法访问面板',
				'如忘记密码，可在SSH通过bt命令来关闭BasicAuth验证',
			],
			isShowAppCode: false,
			checkTip: '我已了解详情,并愿意承担风险！<a class="bt-link" href="https://www.bt.cn/bbs/thread-34374-1-1.html" target="_blank" rel="noreferrer noopener">什么是BasicAuth认证？</a>',
			onConfirm: () => (showPopup2.value = true),
			onCancel: () => (safeConfig.value.basicAuth = false),
		})
	} else {
		const { data } = await setBasicAuth({ open: 'False', basic_user: '', basic_pwd: '' })
		Message.request(data)
		if (data.status) {
			setTimeout(() => window.location.reload(), 1000) // 刷新页面
		}
	}
}

/**
 * @description: 弹窗取消按钮
 */
const onCancel = () => {
	safeConfig.value.basicAuth = !safeConfig.value.basicAuth
	basicAuthConfig.open
}

/**
 * @description: 设置BasicAuth
 */
const setBasic = async () => {
	try {
		const { data } = await setBasicAuth({
			...basicAuthConfig,
			open: basicAuthConfig.open ? 'True' : 'False',
		})
		Message.request(data)
		if (data.status) {
			showPopup2.value = false
			window.location.reload() // 刷新页面
		}
	} catch (err) {
		console.log(err)
	}
}
</script>
