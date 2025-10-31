<template>
	<div class="p-24px">
		<div class="flex items-center">
			<span>绑定域名：</span>
			<div class="w-[20rem] flex ml-[1rem]">
				<bt-input v-model="configData.domain" placeholder="请输入绑定域名"> </bt-input>
			</div>
		</div>
		<div class="my-6 flex items-center leading-[3rem]">
			<span>SSL证书：</span>
			<div class="flex ml-[1rem]">
				<el-radio-group v-model="sslValue" size="small" @change="onChangeEvent">
					<el-radio v-for="(item, index) in sslOption" :key="index" :label="item.value">
						<span>{{ item.title }}</span>
					</el-radio>
				</el-radio-group>
			</div>
		</div>
		<div v-if="sslValue !== 'no'" class="flex mt-12px">
			<div class="flex-1 mr-20px">
				<div class="text-small mb-[.8rem]">密钥(KEY)</div>
				<bt-input class="text-small" type="textarea" v-model="configData.key" :rows="13" size="small" @focus="detectCertFromClipboard('key', configData.key)"></bt-input>
			</div>
			<div class="flex-1">
				<div class="text-small mb-[.8rem]">证书(PEM格式)</div>
				<bt-input type="textarea" v-model="configData.cert" :rows="13" size="small" @focus="detectCertFromClipboard('cert', configData.cert)"></bt-input>
			</div>
		</div>
		<el-button @click="savaConfig" type="primary" class="mt-4">保存</el-button>

		<ul class="list-disc text-secondary px-20px pt-12px">
			<li>配置后可在网站--反向代理项目中管理,<span class="text-primary cursor-pointer" @click="goToReverseProxy">点击前往</span></li>
			<li>配置此域名的证书到面板，浏览器即可信任访问</li>
			<li>
				<div class="flex items-center">
					粘贴您的*.key以及*.pem内容，然后保存即可
					<bt-link href="https://www.bt.cn/bbs/thread-105443-1-1.html">帮助</bt-link>
				</div>
			</li>
			<li>如果浏览器提示证书链不完整,请检查是否正确拼接PEM证书</li>
			<li>PEM格式证书 = 域名证书.crt + 根证书(root_bundle).crt</li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import { Message } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { setPanelGeneration } from '@/api/config'
import { useDialog } from '@hooks/tools'

interface Props {
	compData: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const sslValue = ref('auto')
const sslOption = [
	{ title: '自定义证书', value: 'auto' },
	{ title: '不部署证书', value: 'no' },
	{ title: '选择已有证书', value: 'select' },
]

const configData = ref<any>(props.compData)

/**
 * @description: 改变radio值
 */
const onChangeEvent = (val: string) => {
	sslValue.value = val
	if (val === 'select') {
		useDialog({
			title: '选择已有证书',
			component: () => import('./cert-list-dialog.vue'),
			area: 70,
			compData: {
				refreshData: (data: any) => {
					configData.value.domain = data?.dns[0].replace(/^\*\./, 'panel.') || ''
					configData.value.cert = data?.fullchain || ''
					configData.value.key = data?.privkey || ''
					configData.value.certInfo = data.info || {}
				},
			},
		})
	}
}

/**
 * @description: 校验规则
 */
const checkRules = () => {
	if (!props.compData.domain) {
		Message.error('域名不能为空')
		return false
	}

	// 校验域名格式
	const domainPattern = /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)+[a-zA-Z]{2,6}$/
	if (!domainPattern.test(props.compData.domain)) {
		Message.error('域名格式不正确')
		return false
	}

	if (sslValue.value !== 'no') {
		if (!props.compData.key || !props.compData.cert) {
			Message.error('请填写证书内容')
			return false
		}
	}
	return true
}

/**
 * @description: 保存配置
 */
const savaConfig = async () => {
	if (!checkRules()) return
	await useConfirm({
		title: '提示',
		icon: 'warning-filled',
		content: `基于Nginx/Apache，如果环境运行异常会导致无法访问，是否继续操作？`,
	})
	await useDataHandle({
		loading: '正在设置免端口访问配置，请稍候...',
		request: setPanelGeneration({
			domain: props.compData.domain,
			key: sslValue.value === 'no' ? '' : configData.value.key,
			cert: sslValue.value === 'no' ? '' : configData.value.cert,
		}),
		message: true,
	})
	props.compData.refresh()
	emit('close')
}

/**
 * @description 检测粘贴板中是否包含证书或密钥
 * @param {string} type - 检测类型，'key'表示密钥，'cert'表示证书
 * @returns {Promise<string>} 返回检测到的证书或密钥内容，如果没有则返回空字符串
 */
const detectCertFromClipboard = async (type: 'key' | 'cert', value: string): Promise<void> => {
	if (value) return
	try {
		// 从粘贴板获取文本
		const clipboardText = await navigator.clipboard.readText()

		// 定义正则表达式匹配证书和密钥的模式
		const keyPatterns = [
			// 私钥模式
			/-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/,
			// RSA私钥模式
			/-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/,
			// EC私钥模式
			/-----BEGIN EC PRIVATE KEY-----[\s\S]*?-----END EC PRIVATE KEY-----/,
		]

		const certPatterns = [
			// 证书模式
			/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/,
			// CSR请求模式
			/-----BEGIN CERTIFICATE REQUEST-----[\s\S]*?-----END CERTIFICATE REQUEST-----/,
		]

		// 根据类型选择要检测的模式
		const patterns = type === 'key' ? keyPatterns : certPatterns

		// 遍历所有模式进行匹配
		for (const pattern of patterns) {
			const match = clipboardText.match(pattern)
			if (match && match[0]) {
				Message.success(`已从粘贴板检测到${type === 'key' ? '密钥' : '证书'}`)
				switch (type) {
					case 'key':
						configData.value.key = match[0]
						break
					case 'cert':
						configData.value.cert = match[0]
						break
				}
			}
		}
	} catch (error) {
		console.error('读取粘贴板失败:', error)
		// Message.error('读取粘贴板失败，请检查浏览器权限');
	}
}

const goToReverseProxy = () => {
	window.location.href = '/site/nginx'
}

onMounted(() => {
	sslValue.value = props.compData.use_ssl ? 'auto' : 'no'
})
</script>
