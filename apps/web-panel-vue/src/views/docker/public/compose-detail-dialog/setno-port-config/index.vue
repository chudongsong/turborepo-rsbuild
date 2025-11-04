<template>
	<div :class="isEdit ? '' : 'p-[2.4rem]'">
		<bt-install-mask v-if="!isProxyPort && isEdit" width="36rem">
			<template #content>
				<i class="svgtofont-el-warning-filled text-warning mr-4px text-2rem"></i>
				<span>当前容器暂无端口映射，无法做容器反向代理</span>
			</template>
		</bt-install-mask>

		<div class="flex items-center">
			<span>反向代理状态：</span>
			<span class="ml-[1rem]">{{ isEditEmpty ? '已开启' : '未开启' }} </span>
			<span :class="isEditEmpty ? 'svgtofont-icon-start text-primary' : 'svgtofont-icon-stop text-[#ff0000]'"></span>
		</div>
		<div class="flex items-center mt-6">
			<span>绑定域名</span>
			<div class="w-[20rem] flex ml-[1rem]">
				<el-input v-model="noPortConfig.domain" :disabled="isEditEmpty" placeholder="请输入绑定域名"> </el-input>
			</div>
		</div>
		<div class="flex items-center mt-6">
			<span>需要代理的本地端口</span>
			<div class="w-[20rem] flex ml-[1rem]">
				<template v-if="isEdit && portList.length > 0">
					<bt-select v-model="noPortConfig.port" placeholder="请选择端口号" :disabled="isEditEmpty" :options="portList" class="w-[20rem]" />
				</template>
				<template v-else>
					<el-input v-model="noPortConfig.port" type="number" placeholder="端口号"> </el-input>
				</template>
			</div>
		</div>
		<div class="my-6 flex items-center leading-[3rem]">
			<span>SSL证书</span>
			<div class="flex ml-[1rem]">
				<el-radio-group v-model="sslValue" :size="'small'">
					<el-radio v-for="(item, index) in sslOption" :key="index" :value="item.value">
						<span @click="onChange(item.value)">{{ item.title }}</span>
					</el-radio>
				</el-radio-group>
			</div>
		</div>
		<div v-if="sslValue !== 'no'" class="flex mt-[1.2rem]">
			<div class="flex-1 mr-[2rem]">
				<div class="text-small mb-[.8rem]">{{ `密钥(KEY)` }}</div>
				<el-input class="text-small" type="textarea" v-model="noPortConfig.key" :rows="13" size="small" placeholder="粘贴您的*.key文件内容" @focus="detectCertFromClipboard('key', noPortConfig.key)"></el-input>
			</div>
			<div class="flex-1">
				<div class="text-small mb-[.8rem]">{{ `证书(PEM格式)` }}</div>
				<el-input type="textarea" v-model="noPortConfig.cert" :rows="13" size="small" placeholder="粘贴您的*.pem文件内容" @focus="detectCertFromClipboard('cert', noPortConfig.cert)"> </el-input>
			</div>
		</div>
		<el-button @click="savaConfig" type="primary" class="!mt-1rem">保存</el-button>

		<el-button @click="closeNoPortLogin" class="!mt-1rem" v-if="isEditEmpty">关闭反向代理</el-button>
		<ul class="list-disc text-[#777] px-[2rem] pt-[1.2rem]">
			<li>配置此域名的证书到面板，浏览器即可信任访问</li>
			<li>
				<div class="flex items-center">
					粘贴您的*.key以及*.pem内容，然后保存即可
					<bt-link href="https://www.bt.cn/bbs/thread-105443-1-1.html">帮助</bt-link>
				</div>
			</li>
			<li>如果浏览器提示证书链不完整,请检查是否正确拼接PEM证书</li>
			<li>PEM格式证书 = 域名证书.crt + 根证书(root_bundle).crt</li>
			<li>如需更多设置，请前往<a class="bt-link" href="/docker/dockersite">Docker--网站</a></li>
		</ul>
	</div>
</template>

<script lang="ts" setup>
import { closePortLogin, getNoPortConfig, createPortProxy } from '@/api/docker'
import { useMessage, useDialog, useDataHandle } from '@hooks/tools'

interface Props {
	compData?: any
}

const Message = useMessage() // 消息提示

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const { addNoPortLogin } = props.compData

const isEdit = ref(false)
const isEditEmpty = ref(false) // 是否开启反向代理
const isProxyPort = ref(false) // 是否代理端口
const portList = ref([])
const noPortConfig = reactive({
	domain: '',
	port: '',
	key: '',
	cert: '',
})

const emit = defineEmits(['close'])

const sslValue = ref('auto')
const sslOption = [
	{
		title: '不部署证书',
		value: 'no',
	},
	{
		title: '自定义证书',
		value: 'auto',
	},
	{
		title: '选择已有证书',
		value: 'select',
	},
]
const selectdCert = (info: any) => {
	noPortConfig.key = info.key
	noPortConfig.cert = info.cert
}

/**
 * @description: 改变radio值
 */
const onChange = (val: string) => {
	sslValue.value = val
	if (val === 'select') {
		useDialog({
			component: () => import('./selected-cert-dialog.vue'),
			title: '免端口登录',
			area: 70,
			showFooter: false,
			compData: { selectdCert },
		})
	}
}

/**
 * @description: 关闭反向代理
 */
const closeNoPortLogin = async () => {
	useDataHandle({
		loading: '正在关闭反向代理，请稍候...',
		request: closePortLogin({ container_id: props.compData.row.id }),
		message: true,
		success: (data: any) => {
			if (data.status) {
				sslValue.value = 'no'
				noPortConfig.key = ''
				noPortConfig.cert = ''
				noPortConfig.port = ''
				noPortConfig.domain = ''
				isEditEmpty.value = false
			}
		},
	})
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
						noPortConfig.key = match[0]
						break
					case 'cert':
						noPortConfig.cert = match[0]
						break
				}
			}
		}
	} catch (error) {
		console.error('读取粘贴板失败:', error)
		// Message.error('读取粘贴板失败，请检查浏览器权限');
	}
}

/**
 * @description: 获取反向代理配置
 */
const getNoPortConfigInfo = async (id: number) => {
	const load = Message.load('正在获取配置中，请稍候...')
	try {
		const { data } = await getNoPortConfig({ container_id: id })
		const proxy_prot = data.proxy_port
		if (proxy_prot.length > 0) {
			portList.value = proxy_prot.map((item: any) => ({ label: item, value: item }))
			noPortConfig.port = proxy_prot[0]
		}
		isProxyPort.value = proxy_prot.length > 0
		const { cert, key, name } = data
		noPortConfig.domain = name
		sslValue.value = data.ssl ? 'auto' : 'no'
		isEditEmpty.value = !!data.status
		noPortConfig.key = key || ''
		noPortConfig.cert = cert || ''
	} catch (error) {
		console.log(error)
		load.close()
	} finally {
		load.close()
	}
}

/**
 * @description: 保存配置
 */
const savaConfig = async () => {
	if (!noPortConfig.domain) {
		Message.error('域名不能为空')
		return
	}
	if (sslValue.value !== 'no') {
		if (!noPortConfig.key || !noPortConfig.cert) {
			Message.error('请填写证书内容')
			return
		}
	}
	if (isEdit.value) {
		const { id, name } = props.compData.row
		await useDataHandle({
			request: createPortProxy({
				container_id: id,
				container_name: name,
				container_port: noPortConfig.port,
				domain: noPortConfig.domain,
				privateKey: noPortConfig.key,
				certPem: noPortConfig.cert,
			}),
			message: true,
		})
		getNoPortConfigInfo(props.compData.row.id)
	} else {
		addNoPortLogin(noPortConfig)
	}
	emit('close')
}
onMounted(() => {
	if (props.compData.row) {
		isEdit.value = true
		getNoPortConfigInfo(props.compData.row.id)
	}
})
</script>
