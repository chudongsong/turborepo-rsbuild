<template>
	<div>
		<config-rows :label="'访问设备验证'">
			<template #value>
				<el-switch v-model="safeConfig.sslVerify" @change="onChange(safeConfig.sslVerify)"></el-switch>
				<el-button size="small" class="!ml-12px" @click="openPopup">访问设备验证配置</el-button>
			</template>
			<template #desc>
				<span> 基于SSL证书双向验证，开启后电脑需要安装此证书，否则将无法访问，属于极高安全级别的访问限制方式，类似银行账号U盘密钥登录。 </span>
				<bt-link href="https://www.bt.cn/bbs/thread-77863-1-1.html">了解详情</bt-link>
			</template>
		</config-rows>

		<bt-dialog :title="'自定义证书'" v-model="showPopup" :area="70" showFooter @confirm="saveConfig" @cancel="onCancel()">
			<div class="p-[2rem]" v-bt-loading="load.loading" v-bt-loading:title="load.title">
				<template v-if="isSwitch">
					<div class="flex items-center">
						<i class="svgtofont-el-warning-filled text-warningDark !text-titleLarge pr-4"></i>
						<p class="text-extraLarge">风险操作！此功能不懂请勿开启！</p>
					</div>
					<ul class="help-list">
						<li class="text-danger">必须要用到且了解此功能才决定自己是否要开启！</li>
						<li>开启后电脑需要安装此证书，否则将无法访问，属于【极高安全级别】的限制，类似银行账号U盘密钥登录。</li>
						<li>注销列表(crl)和证书(cert)可通过企业版插件[堡塔限制访问型证书->双向认证->服务器证书]获取。</li>
						<li>开启之前请先下载好对应的[客户端证书]，否则将无法访问面板。</li>
						<li>开启访问设备验证后，未授权的用户访问将会出现400错误。</li>
						<li>开启后导致面板不能访问，命令行：bt 29 关闭访问设备验证。</li>
					</ul>
				</template>
				<div class="flex mt-12px">
					<div class="flex-1 mr-20px relative">
						<div class="text-small mb-8px">注销列表(crl)</div>
						<bt-input class="text-small" type="textarea" v-model="sslInfo.crl" :rows="13" size="small"></bt-input>
						<span class="placeholder" v-show="sslInfo.crl === ''">请粘贴您的注销列表（crl）</span>
					</div>
					<div class="flex-1 relative">
						<div class="text-small mb-8px">证书(cert)</div>
						<bt-input type="textarea" v-model="sslInfo.cert" :rows="13" size="small"></bt-input>
						<span class="placeholder" v-show="sslInfo.cert === ''">请粘贴您的证书(cert)</span>
					</div>
				</div>
				<template v-if="!isSwitch">
					<ul class="help-list !pl-20px mt-12px !py-0">
						<li>粘贴您的注销列表(crl)以及证书(cert)，然后保存即可。</li>
						<li>注销列表(crl)和证书(cert)可通过企业版插件[堡塔限制访问型证书->双向认证->服务器证书]获取。</li>
					</ul>
				</template>
				<template v-else>
					<el-checkbox v-model="checked" class="mt-12px px-16px">
						<div class="text-small flex items-center">
							已了经解详情,并愿意承担风险！
							<bt-link href="https://www.bt.cn/bbs/thread-77863-1-1.html" target="_blank"> 了解详情 </bt-link>
						</div>
					</el-checkbox>
				</template>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { getSslVerify, setSslVerify } from '@/api/config'
import { restartPanel } from '@/api/global'
import { Message } from '@hooks/tools'
import { getConfigStore } from '@config/useStore'
import { useDataHandle } from '@hooks/tools'

import ConfigRows from '@config/public/config-rows-new'

const {
	refs: { safeConfig },
} = getConfigStore()

const showPopup = ref(false)
const isSwitch = ref(false) // 是否从开关开启弹窗
const checked = ref(false) // 是否勾选详情

const load = reactive({
	loading: false,
	title: '正在获取证书信息，请稍候...',
}) // 加载中

// 自定义证书信息
const sslInfo = ref({
	crl: '',
	cert: '',
})

/**
 * @description: 打开弹窗
 */
const openPopup = async () => {
	load.title = '正在获取证书信息，请稍候...'
	load.loading = true
	showPopup.value = true
	try {
		const { data } = await getSslVerify()
		safeConfig.value.sslVerify = data.status
		sslInfo.value.crl = data.crl
		sslInfo.value.cert = data.ca
	} catch (error) {
		showPopup.value = false
		console.log(error)
	} finally {
		load.loading = false
	}
}

/**
 * @description: 开启或关闭访问设备验证按钮开关
 */
const onChange = async (val: boolean) => {
	try {
		if (!safeConfig.value.panelSSl) {
			Message.error('请先开启面板SSL证书后重试')
			safeConfig.value.sslVerify = false
			return
		}
		const { data } = await getSslVerify()
		sslInfo.value.crl = data.crl
		sslInfo.value.cert = data.ca
		isSwitch.value = true
		if (val) {
			showPopup.value = true
		} else {
			// 关闭访问设备验证
			const { data } = await setSslVerify({ status: 0 })
			if (data.status) window.location.reload()
		}
	} catch (error) {
		console.log(error)
	}
}

// 弹窗关闭
const onCancel = () => {
	if (isSwitch.value) {
		// 从开关开启弹窗 关闭弹窗后开关状态不变
		safeConfig.value.sslVerify = !safeConfig.value.sslVerify
	}
	isSwitch.value = false // 重置
	// sslVerify.value = !sslVerify.value
}

/**
 * @description 	保存配置
 */
const saveConfig = async () => {
	try {
		if (!sslInfo.value.crl) {
			Message.error('注销列表(crl)不能为空')
			return false
		}
		if (!sslInfo.value.cert) {
			Message.error('证书(cert)不能为空')
			return false
		}
		if (isSwitch.value && !checked.value) {
			Message.error('请勾选并同意承担风险')
			return false
		}

		load.title = '正在保存，请稍候...'
		load.loading = true
		const res: any = await useDataHandle({
			request: setSslVerify({
				crl: sslInfo.value.crl,
				cert: sslInfo.value.cert,
				status: isSwitch.value ? 1 : 0,
			}),
			message: true,
		})
		await restartPanel() // 重启面板
		if (res.status) window.location.reload() // 重载页面
		return res.status
	} catch (error) {
		console.log(error)
	} finally {
		load.loading = false
	}
}

const getSslVerifyData = async () => {
	const { data } = await getSslVerify()
	sslInfo.value.crl = data.crl
	sslInfo.value.cert = data.ca
	safeConfig.value.sslVerify = data.status
}

watch(showPopup, (newValue, oldValue) => {
	!newValue ? ((sslInfo.value.crl = ''), (sslInfo.value.cert = '')) : ''
})

onMounted(() => {
	getSslVerifyData()
})
</script>

<style lang="css" scoped>
.help-list {
	@apply my-[2rem] py-[1.5rem] pl-32px list-disc bg-light;
}
.help-list li {
	@apply h-[2.4rem] text-secondary;
}
.placeholder {
	transform: translateX(-50%);
	@apply absolute top-[13rem] left-[50%] text-base whitespace-nowrap text-tertiary;
}
</style>
