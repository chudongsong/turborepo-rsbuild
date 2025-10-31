<template>
	<div>
		<MsgBase @save="$emit('close')">
			<template #from>
				<el-form label-position="right" label-width="100px">
					<el-form-item label="绑定微信公众号">
						<div style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: flex-start; align-items: center">
							<span v-if="msgData.res.is_subscribe === 1" style="color: var(--el-color-primary)">已绑定</span>
							<span v-if="msgData.res.is_subscribe === 0" style="color: red">未绑定</span>
							<el-popover v-model="form.visible" width="160" :popper-class="'white-popover'">
								<el-card shadow="always" style="box-shadow: rgb(0 0 0 / 46%) 0px 0 2rem 0px">
									<span style="font-size: var(--el-font-size-small)">请扫码，进行绑定</span>
									<bt-image :src="'https://www.bt.cn/Public/img/bt_wx.jpg'" :custom="true"></bt-image>
									<el-button @click="ok">已扫码并完成绑定</el-button>
								</el-card>

								<template #reference>
									<el-button class="ml-[1.6rem]">立即绑定</el-button>
								</template>
							</el-popover>
						</div>
					</el-form-item>
					<el-form-item label="绑定微信帐号">
						<div style="display: flex; flex-direction: row; flex-wrap: nowrap; justify-content: flex-start; align-items: center">
							<span v-if="msgData.res.is_bound === 1 && msgData.res.nickname === ''" style="color: var(--el-color-primary)">已绑定</span>
							<div v-if="msgData.res.is_bound === 1" style="display: flex; flex-direction: row; justify-content: flex-start; align-items: center">
								<el-avatar size="small" :src="msgData.res.head_img"></el-avatar>
								<span class="ml-[1.5rem]">{{ msgData.res.nickname }}</span>
							</div>
							<span v-if="msgData.res.is_bound === 0" style="color: red">未绑定</span>
							<el-popover width="190" :visible="form.weChatAccount" :popper-class="'white-popover'">
								<el-card shadow="always" style="box-shadow: rgb(0 0 0 / 46%) 0px 0 2rem 0px">
									<div style="display: flex; flex-direction: column; align-items: center">
										<span style="font-size: var(--el-font-size-small)">请扫码，进行绑定</span>
										<bt-qrcode v-show="qrCode !== ''" v-bt-loading="qrCode === ''" v-bt-loading:title="'正在获取二维码，请稍后....'" :value="qrCode" :size="150" />
										<el-button @click="ok">已扫码并完成绑定</el-button>
									</div>
								</el-card>
								<template #reference>
									<el-button class="ml-[1.6rem]" @click="getQrCode">
										{{ msgData.res.is_bound === 1 ? '更换微信账号' : '立即绑定' }}
									</el-button>
								</template>
							</el-popover>
						</div>
					</el-form-item>
					<el-form-item label="今日剩余发送次数">
						<span>{{ msgData.res.remaining }}</span>
						<el-button class="ml-[1.6rem]" @click="setMsgFun">发送测试消息</el-button>
					</el-form-item>
				</el-form>
			</template>
			<template #tip>
				<ul style="list-style: disc">
					<li>没有绑定微信公众号无法接收面板告警消息</li>
					<li>当前为体验版,限制每个宝塔账号发送频率100条/天</li>
				</ul>
			</template>
		</MsgBase>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { getMsgFun } from '@api/global'
import MsgBase from '@components/business/bt-msg-config/components/msg-base.vue'

const { proxy: vm }: any = getCurrentInstance()

interface From {
	circleUrl: string
	visible: boolean
	weChatAccount: boolean
	nickname: string
}

const form = reactive<From>({
	circleUrl: '',
	visible: false,
	weChatAccount: false,
	nickname: '',
})

interface Data {
	nonce: number
	res: {
		is_bound: number
		is_subscribe: number
		head_img: string
		nickname: string
		remaining: number
	}
	success: boolean
	status: boolean
}

let msgData = reactive<Data>({
	nonce: 0,
	res: { is_bound: 0, is_subscribe: 0, head_img: '', nickname: '', remaining: 0 },
	success: false,
	status: false,
})
const { load: $load, request: $request } = useMessage()
let qrCode = ref('')
const getMsgFunData = async () => {
	let load: any
	try {
		load = $load('正在获取信息配置，请稍后...')
		const { data } = await getMsgFun('wx_account', 'get_web_info')
		msgData = Object.assign(msgData, data)
	} catch (e) {
		console.log(e)
	} finally {
		load && load.close()
	}
}

const getQrCode = async () => {
	try {
		if (form.weChatAccount && qrCode.value !== '') {
			return
		}
		const { data } = await getMsgFun('wx_account', 'get_auth_url')
		qrCode.value = data.res
	} catch (e) {
		console.log(e)
	} finally {
	}
}

const ok = async () => {
	form.visible = false
	form.weChatAccount = false
	qrCode.value = ''
	await getMsgFunData()
}

const setMsgFun = async () => {
	let load: any
	try {
		load = $load('正在发送测试消息，请稍后...')
		const data = await getMsgFun('wx_account', 'push_data', '发送测试消息')
		$request(data)
	} catch (e) {
		console.log(e)
	} finally {
		load && load.close()
	}
}

onMounted(async () => {
	await getMsgFunData()
})
</script>
