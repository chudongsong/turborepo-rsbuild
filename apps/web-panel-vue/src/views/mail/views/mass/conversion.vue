<template>
	<div class="pt-40px pb-40px">
		<div class="mb-24px text-center text-subtitleLarge font-bold">群发邮件</div>
		<div class="mb-16px">
			<ul class="ul-style">
				<li>
					<bt-icon icon="mail-email" size="22"></bt-icon>
					<span class="ml-4px">群发邮件</span>
				</li>
				<li>
					<bt-icon icon="mail-audit" size="22"></bt-icon>
					<span class="ml-4px">错误审计</span>
				</li>
				<li>
					<bt-icon icon="mail-record" size="22"></bt-icon>
					<span class="ml-4px">发送记录</span>
				</li>
				<li>
					<bt-icon icon="mail-send" size="22"></bt-icon>
					<span class="ml-4px">避免成为垃圾邮件发送者</span>
				</li>
			</ul>
		</div>
		<div class="text-center text-base color-desc">使用宝塔邮局轻松批量发送邮件，查看发送成功率和发送日志，助力您的业务成功！</div>
		<div class="text-center my-24px">
			<el-button type="primary" class="h-36px text-base" @click="onPay"> 立即购买 </el-button>
		</div>
		<div class="flex justify-center">
			<div class="w-76%">
				<el-image width="100%" :src="ProImage" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { isDev } from '@/utils'
import { productPaymentDialog } from '@/public'
// import ProImage from '@images/mail/pro.png'

const ProImage = `/static/images/mail/pro.png`

const onPay = () => {
	productPaymentDialog({
		sourceId: 22,
		disablePro: true,
	})
}
</script>

<style lang="css" scoped>
.ul-style {
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 48px;
	font-size: var(--el-font-size-medium);
}
.ul-style li {
	display: flex;
	align-items: center;
}
</style>
