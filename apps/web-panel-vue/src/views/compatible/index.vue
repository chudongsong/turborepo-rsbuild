<template>
	<div class="w-full" :style="{ 'min-height': mainHeight + 'px' }" :key="timer" v-bt-loading="loading" v-bt-loading:title="`正在加载页面，请稍后...`">
		<div ref="maskRef" v-if="maskStatus" class="mask" :style="{ left }">
			<compatible-load-file v-if="routerActive === '/files'" />
			<compatible-load v-else />
		</div>
		<template v-if="(pluginWafInfo.endtime === -1 || !pluginWafInfo?.setup) && routePath === '/waf'">
			<bt-router-tabs v-model="tabActive" :options="options">
				<template #default>
					<bt-product-preview :data="productData" class="p-[4rem]"></bt-product-preview>
				</template>
			</bt-router-tabs>
		</template>
		<iframe v-else ref="frameRef" id="ifrramApp" class="ifrramApp" :style="{ zIndex: iframezIndex }" :src="iframeSrc" @load="handleIframeLoad" @mouseenter="handleMouseEnter" />
	</div>
</template>

<script lang="tsx" setup>
import { pluginInstallDialog, productPaymentDialog } from '@/public/index'
import { useMessage } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { getPluginInfo } from '@/api/global'
import { useRoute } from 'vue-router'

const routePath = computed(() => useRoute().path)
const { iframezIndex, menuControl, routerActive, iframeActive, mainHeight, payment } = useGlobalStore()
const iframeSrc = ref('/software')
const maskRef = ref<HTMLElement | null>(null)
const timer = ref<any>(null)
const maskStatus = ref(false)
const frameRef = ref<HTMLIFrameElement | null>(null)
const pluginWafInfo = useSessionStorage('pluginWafInfo', { setup: false, endtime: -1 }) // 插件信息

const left = computed(() => {
	return menuControl.value.collapse ? '60px' : '184px'
})

const compRoute = [['/waf', '/btwaf/index']]

const activeRoute = ref() // 当前路由

const loading = ref(false) // 加载状态
const tabActive = ref('waf')
const options = ref([
	{
		name: 'waf',
		show: true,
		meta: {
			title: '防火墙',
		},
	},
])
const { warn: $warn } = useMessage()
const productData = computed(() => ({
	title: 'Nginx防火墙-功能介绍',
	imgSrc: '/soft_ico/ico-btwaf.png',
	productSrc: 'https://www.bt.cn/new/product_nginx_firewall.html',
	ps: 'Nginx防火墙是保护Web应用程序免受各种网络攻击，检测过滤恶意请求限制访问频率，增强应用程序的安全，易于配置和使用，是保护Web应用程序安全的重要工具之一',
	source: 25,
	desc: ['仅支持Nginx', '抵御CC攻击', '关键词拦截', '拦截恶意扫描', '阻止黑客入侵'],
	tabImgs: [
		{
			title: '概览',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/waf/nginx_firewall_1.png',
		},
		{
			title: '攻击地图',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/waf/nginx_firewall_2.png',
		},
		{
			title: '攻击报表',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/waf/nginx_firewall_3.png',
		},
		{
			title: '全局设置',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/waf/nginx_firewall_4.png',
		},
		{
			title: '站点设置',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/waf/nginx_firewall_5.png',
		},
		{
			title: '封锁记录',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/waf/nginx_firewall_6.png',
		},
		{
			title: '操作日志',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/waf/nginx_firewall_7.png',
		},
	],
	pluginInfo: pluginWafInfo.value,
	isInstall: !pluginWafInfo.value?.setup && pluginWafInfo.value?.endtime > -1, // 是否显示安装
})) // 产品介绍

watch(
	() => routerActive.value,
	async val => {
		activeRoute.value = compRoute.filter((item: string[]) => item.indexOf(routerActive.value) !== -1)[0] || [] // 筛选路由是否为旧版页面
		if (activeRoute.value.length) {
			iframezIndex.value = 996
			const iframeWindow = frameRef.value?.contentWindow
			if (routerActive.value === activeRoute.value[0] && iframeWindow && iframeWindow?.location.pathname === activeRoute.value[1]) {
				iframeWindow.location.reload()
				console.log('reload')
			} else {
				maskStatus.value = true
				timer.value = new Date().getTime()
				iframeSrc.value = activeRoute.value[1] // 设置iframe src
				iframeActive.value = activeRoute.value[1]
			}
		}
	},
	{ immediate: true } // 立即执行
)

/**
 * @description iframe加载完成事件
 */
const handleIframeLoad = () => {
	const iframeWindow = frameRef.value?.contentWindow
	const appDom = iframeWindow?.document.getElementById('#app') // 替换元素是否被替换
	if (iframeWindow && !appDom) {
		iframeActive.value = activeRoute.value[1]
		iframezIndex.value = 998
		// maskStatus.value = false
		// maskRef.value?.remove()
	}
}

// iframe鼠标移入事件
const handleMouseEnter = () => {
	const iframeWindow = frameRef.value?.contentWindow
	if (iframeWindow) {
		if (!iframeWindow.document.getElementById('#app')) {
			// 判断当前元素已经被替换
			iframezIndex.value = 998
		}
	}
}

const getPluginData = async () => {
	if (routePath.value === '/waf') {
		try {
			loading.value = true
			const res = await getPluginInfo({ sName: 'btwaf' })
			pluginWafInfo.value = res.data
			checkPluginWafVersion(res.data)
			loading.value = false
		} catch (error) {
			console.log(error)
			loading.value = false
		}
	}
}

// 检查插件版本
const checkPluginWafVersion = async (data: AnyObject) => {
	try {
		if (data.setup) {
			const version = data?.version
			if (!version) return
			const versionNumber = version.replace(/\./g, '')
			if (versionNumber < 955) {
				await pluginInstallDialog({
					type: 'u',
					name: 'btwaf',
					pluginInfo: data,
				})
				setTimeout(() => {
					$warn('当前插件版本过低，请升级防火墙插件版本至9.5.5及以上版本')
				}, 1000)
			}
		}
	} catch (error) {
		console.log(error)
	}
}

onMounted(() => {
	window.pay = productPaymentDialog
	getPluginData()
})
</script>

<style lang="css" scoped>
.mask {
	position: fixed !important @apply right-0 top-0 bottom-0 z-996 h-full bg-light;
}
.ifrramApp {
	@apply fixed left-0 right-0 top-0 bottom-0 z-996 w-full h-full border-none;
	color-scheme: light;
}
.ifrramApp:hover {
	@apply z-998;
}
</style>
