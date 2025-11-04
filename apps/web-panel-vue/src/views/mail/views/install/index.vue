<template>
	<div class="px-[12px] !bg-[transparent]">
		<div class="module-ui">
			<div class="py-52px flex justify-center flex-col items-center">
				<div class="mb-12px text-center text-subtitleLarge font-bold">宝塔邮局管理器</div>
				<div class="flex mb-16px justify-center">
					<div class="text-center text-base mr-[10px] color-desc text-tertiary">自建邮局服务器，多域，多用户邮局，邮件服务器，支持SMTP/IMAP/POP3/HTTP接口，25端口</div>
					<bt-link href="https://www.bt.cn/new/wechat_customer" class="!text-base mr-[10px]"><img src="/static/icons/we-com.svg" class="w-[16px] h-[16px]" /><span>联系客服</span></bt-link>
					<div class="flex items-center mr-[10px]" @click="npsSurveyV2Dialog({ name: '宝塔邮局', type: 36, id: 63 })">
						<i class="svgtofont-desired !text-medium mr-[4px]"></i>
						<span class="bt-link !text-base">需求反馈</span>
					</div>
					<bt-link href="https://www.bt.cn/bbs/thread-141971-1-1.html" class="!text-base mr-[4px]">>> 使用文档</bt-link>
				</div>
				<div class="mb-16px">
					<ul class="ul-style">
						<li>发件成功率分析</li>
						<li>集成webmail</li>
						<li>群发邮件</li>
					</ul>
				</div>

				<div v-if="payment.authType === 'free'" class="text-center mb-40px">
					<bt-button type="primary" size="large" class="!text-medium w-[140px]" @click="productPaymentDialog({ sourceId: 360 })">立即购买</bt-button>
				</div>
				<div v-else class="text-center mb-40px">
					<bt-button type="primary" size="large" class="!text-medium w-[140px]" @click="onInstall">立即安装</bt-button>
				</div>
				<div class="w-76% rounded-base overflow-hidden flex justify-center">
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
import { installService } from '@/api/mail'
import { msgBoxDialog, productPaymentDialog } from '@/public'
import { useMessage } from '@/hooks/tools'
import { npsSurveyV2Dialog } from '@/public'
import { getMailStore } from '../../useStore'

const { load: $load, request: $request } = useMessage()
const { payment, plugin } = useGlobalStore()
const {
	refs: { install },
} = getMailStore()

const productImage = ref<AnyObject>([
	['概览', 'overview.png'],
	['邮箱', 'mailbox.png'],
	['发送任务', 'sendtask.png'],
	['邮件模板', 'temp.png'],
	['设置', 'setting.png'],
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
	return `https://www.bt.cn/Public/new/plugin/mail_sys/${name}`
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
