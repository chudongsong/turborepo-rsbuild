<template>
	<div class="p-16px">
		<div class="py-52px flex justify-center flex-col items-center">
			<div class="mb-12px text-center text-subtitleLarge font-bold">宝塔Docker模块</div>
			<div class="flex mb-16px justify-center">
				<div class="text-center text-base mr-[10px] color-desc text-tertiary">可视化Docker模块，提供图形用户界面，能够以更直观的方式管理和操作Docker容器</div>
				<bt-link href="https://www.bt.cn/new/wechat_customer" class="!text-base mr-[10px]"><img src="/static/icons/we-com.svg" class="w-[16px] h-[16px]" /><span>联系客服</span></bt-link>
				<!-- <div class="flex items-center mr-[10px]" @click="npsSurveyV2Dialog({ name: '用户管理', type: 35, id: 62 })">
					<i class="svgtofont-desired !text-medium mr-[4px]"></i>
					<span class="bt-link !text-base">需求反馈</span>
				</div> -->
				<bt-link href="https://www.bt.cn/bbs/thread-141215-1-1.html" class="!text-base mr-[4px]">>> 使用文档</bt-link>
			</div>
			<div class="mb-16px">
				<ul class="ul-style">
					<li>一键部署应用</li>
					<li>Docker快速建站</li>
					<li>容器管理</li>
					<li>容器编排</li>
				</ul>
			</div>
			<div class="text-center mb-40px">
				<bt-button type="primary" size="large" class="!text-medium w-[140px]" @click="onInstall">{{ settingData.installing ? '正在安装...' : '立即安装' }}</bt-button>
			</div>
			<div class="w-76% rounded-base overflow-hidden">
				<!-- 介绍图片 -->
				<el-tabs tab-position="left" class="carousel">
					<el-tab-pane v-for="(item, index) in productImage" :label="item[0]" lazy :key="index">
						<div class="rounded-base overflow-hidden text-0">
							<el-image :src="url(item[1])" class="h-[100%] object-scale-down" :preview-src-list="[url(item[1])]" />
						</div>
					</el-tab-pane>
				</el-tabs>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { msgBoxDialog } from '@/public'
import { getDockerStore } from '@docker/useStore'
import { goInstall } from '@docker/useMethods'

const {
	refs: { settingData },
} = getDockerStore()

const productImage: AnyObject = [
	['应用商店', 'appstore.png'],
	['总览', 'manger.png'],
	['网站', 'site.png'],
	['容器', 'container.png'],
	['线上镜像', 'cloudimage.png'],
	['本地镜像', 'image.png'],
	['容器编排', 'orchestration.png'],
	['网络', 'network.png'],
	['存储卷', 'storage.png'],
	['仓库', 'warehouse.png'],
	['设置', 'setting.png'],
]
/**
 * @description 安装
 */
const onInstall = async () => {
	if (settingData.value.installing) {
		// 正在安装中
		msgBoxDialog()
		return
	} else {
		goInstall()
	}
}

// 图片地址
const url = (name: string) => {
	return `https://www.bt.cn/Public/new/plugin/dockermode/${name}`
}

onMounted(async () => {
	if (settingData.value.installing === 1) msgBoxDialog()
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
