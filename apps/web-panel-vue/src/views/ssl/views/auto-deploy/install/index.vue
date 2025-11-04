<template>
	<div class="p-16px">
		<div class="py-52px flex justify-center flex-col items-center">
			<div class="mb-12px text-center text-subtitleLarge font-bold">宝塔SSL自动部署</div>
			<div class="flex mb-16px justify-center">
				<div class="text-center text-base mr-[10px] color-desc text-tertiary">自动部署SSL证书到服务器</div>
				<bt-link href="https://www.bt.cn/new/wechat_customer" class="!text-base mr-[10px]"><img src="/static/icons/we-com.svg" class="w-[16px] h-[16px]" /><span>联系客服</span></bt-link>
				<div class="flex items-center mr-[10px]" @click="npsSurveyV2Dialog({ name: 'SSL证书需求反馈收集', type: 28, id: 993, isNoRate: true, softName: '1', isCard: false })">
					<i class="svgtofont-desired !text-medium mr-[4px]"></i>
					<span class="bt-link !text-base">需求反馈</span>
				</div>
				<bt-link href="https://www.bt.cn/bbs/thread-141273-1-1.html" class="!text-base mr-[4px]">>> 使用文档</bt-link>
			</div>
			<div class="mb-16px">
				<ul class="ul-style">
					<li>自动部署SSL证书到服务器</li>
					<li>支持宝塔、Let's Encrypt、商用证书</li>
					<li>支持单域名、多域名、通配符域名</li>
				</ul>
			</div>

			<div class="mb-16px">
				<bt-button type="primary" size="large" class="!text-medium w-[140px]" @click="productPaymentDialog({ sourceId: 351, disablePro: false })">立即购买</bt-button>
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
</template>

<script lang="ts" setup>
import { productPaymentDialog } from '@/public'
import { npsSurveyV2Dialog } from '@/public'

const productImage = ref<AnyObject>([['自动部署概览', 'deploy-overview.png']])

// 图片地址
const url = (name: string) => {
	return `https://www.bt.cn/Public/new/plugin/ssl-deploy/${name}`
}

onMounted(async () => {})
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
