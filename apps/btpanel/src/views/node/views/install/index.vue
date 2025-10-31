<template>
	<div class="p-16px module-ui">
		<div class="py-52px flex justify-center flex-col items-center">
			<div class="mb-12px text-center text-subtitleLarge font-bold">宝塔节点管理</div>
			<div class="flex mb-16px justify-center">
				<div class="text-center text-base mr-[10px] color-desc text-tertiary">全面支持多机统一管理，支持用户在单机环境中实现简单高效的服务器运维，快速创建负载均衡及主从复制等安全稳定的容灾方案。</div>
				<bt-link href="https://www.bt.cn/new/wechat_customer" class="!text-base mr-[10px]"><img src="/static/icons/we-com.svg" class="w-[16px] h-[16px]" /><span>联系客服</span></bt-link>
				<div class="flex items-center mr-[10px]" @click="npsSurveyV2Dialog({ name: '用户管理', type: 35, id: 62 })">
					<i class="svgtofont-desired !text-medium mr-[4px]"></i>
					<span class="bt-link !text-base">需求反馈</span>
				</div>
				<!-- <bt-link href="https://www.bt.cn/bbs/thread-141273-1-1.html" class="!text-base mr-[4px]">>> 使用文档</bt-link> -->
			</div>
			<div class="mb-16px">
				<ul class="ul-style">
					<li>多节点管理</li>
					<li>快速负载均衡和主从复制</li>
					<li>异常告警</li>
				</ul>
			</div>
			<div class="text-center mb-40px">
				<bt-button type="primary" size="large" class="!text-medium w-[140px]" @click="onInstall">立即安装</bt-button>
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
import { setNodeUsedStatus } from '@/api/node'
import { msgBoxDialog } from '@/public'
import { useMessage } from '@/hooks/tools'
import { npsSurveyV2Dialog } from '@/public'
import { useRouter } from 'vue-router'

const router = useRouter()
const { load: $load, request: $request } = useMessage()

const productImage = ref<AnyObject>([
	['节点', 'node.png'],
	['负载均衡', 'node_clb.png'],
	['主从复制', 'master.png'],
	['文件互传', 'file-transfer.png'],
	['告警管理', 'alarm.png'],
])
/**
 * @description 安装
 */
const onInstall = async () => {
	const loading = $load('正在安装节点模块，请稍后...')
	try {
		const data = await setNodeUsedStatus()
		$request(data)
		if (data.status) {
			router.push('/node/node-mgt')
		}
	} catch (error) {
		console.error(error)
	} finally {
		loading.close()
	}
}

// 图片地址
const url = (name: string) => {
	return `https://www.bt.cn/static/new/plugin/node/${name}`
}
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
