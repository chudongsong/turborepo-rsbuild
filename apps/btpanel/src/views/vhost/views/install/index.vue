<template>
	<div class="px-12px !bg-transparent">
		<div class="module-ui">
			<div class="py-52px flex justify-center flex-col items-center">
				<div class="mb-12px text-center text-subtitleLarge font-bold">宝塔多用户虚拟主机面板</div>
				<div class="flex mb-16px justify-center">
					<div class="text-center text-base mr-[10px] color-desc text-tertiary">划分服务器资源当作虚拟主机给多个不同的用户单独管理</div>
					<bt-link href="https://www.bt.cn/new/wechat_customer" class="!text-base mr-[10px]"><img src="/static/icons/we-com.svg" class="w-[16px] h-[16px]" /><span>联系客服</span></bt-link>
					<div class="flex items-center mr-[10px]" @click="npsSurveyV2Dialog({ name: '用户管理', type: 35, id: 62 })">
						<i class="svgtofont-desired !text-medium mr-[4px]"></i>
						<span class="bt-link !text-base">需求反馈</span>
					</div>
					<bt-link href="https://www.bt.cn/bbs/thread-141273-1-1.html" class="!text-base mr-[4px]">>> 使用文档</bt-link>
				</div>
				<div class="mb-16px">
					<ul class="ul-style">
						<li>单独的管理系统</li>
						<li>资源配额</li>
						<li>权限分离</li>
					</ul>
				</div>

				<div v-if="payment.authExpirationTime < 0" class="text-center mb-40px">
					<bt-button type="primary" size="large" class="!text-medium w-[140px]" @click="productPaymentDialog({ sourceId: 361 })">{{`立即${payment.authExpirationTime === -1 ? '购买' : '续费'}`}}</bt-button>
				</div>
				<div v-else class="text-center mb-40px">
					<bt-button v-if="plugin.webserver === 'nginx'" type="primary" size="large" class="!text-medium w-[140px]" @click="onInstall">立即安装</bt-button>
					<bt-alert v-else class="install-tips inline-flex w-auto mx-auto" type="warning">
						<div v-if="plugin.webserver" class="text-medium">仅支持Nginx，检测到web服务器为: {{ plugin.webserver }}，请将切换web服务器为Nginx，切换前请备份相关数据。</div>
						<div v-else class="">Web 服务器当前未安装，请先安装 <bt-link @click="pluginInstallDialog({ name: 'nginx', type: 'i' })">安装Nginx</bt-link></div>
					</bt-alert>
				</div>
				<div class="w-76% rounded-base overflow-hidden">
					<!-- 介绍图片 -->
					<el-tabs tab-position="left" class="carousel">
						<el-tab-pane v-for="(item, index) in productImage" :label="item[0]" lazy :key="index">
							<div class="rounded-base overflow-hidden text-0">
								<el-image :src="url(item[1])" class="max-h-[100%] object-scale-down" :preview-src-list="[url(item[1])]" />
							</div>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useGlobalStore } from '@/store/global'
import { installService } from '@/api/vhost'
import { msgBoxDialog, pluginInstallDialog, productPaymentDialog } from '@/public'
import { useMessage } from '@/hooks/tools'
import { npsSurveyV2Dialog } from '@/public'
import { useSettingsStore } from '../settings/useStore'

const { load: $load, request: $request } = useMessage()
const { payment, plugin } = useGlobalStore()
const { install } = useSettingsStore()

const productImage = ref<AnyObject>([
	['用户列表', 'account.png'],
	['资源包', 'package.png'],
	['存储', 'storage.png'],
	['虚拟主机概览', 'overview.png'],
	['虚拟主机网站', 'site.png'],
])
/**
 * @description 安装
 */
const onInstall = async () => {
	const loading = $load('正在初始化安装信息，请稍后...')
	try {
		const rdata = await installService()
		$request(rdata)
		msgBoxDialog()
	} catch (error) {
		console.error(error)
	} finally {
		loading.close()
	}
}

// 图片地址
const url = (name: string) => {
	return `https://www.bt.cn/Public/new/plugin/vhost/${name}`
}

onMounted(async () => {
	if (install.value === 1) msgBoxDialog()
})
</script>

<style lang="scss" scoped>
.ul-style {
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 48px;
	font-size: var(--el-font-size-base);
	list-style: disc;
}

:deep(.el-image-viewer__wrapper) {
	z-index: 99999999999 !important;
}
</style>
