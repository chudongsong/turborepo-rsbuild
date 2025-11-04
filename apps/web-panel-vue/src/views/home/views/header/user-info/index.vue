<template>
	<div class="flex flex-col p-[10px] user-info-popover">
		<div class="flex justify-between mb-[14px]">
			<span :class="{ 'cursor-pointer': !bindUser }" @click="openBindDialog">{{ bindUser || '未绑定帐号，点击绑定' }}</span>
			<span v-if="!aliyunEcsLtd && bindUser">
				<span class="user-operate" @click="openBindDialog">切换</span>
				<el-divider direction="vertical" />
				<span class="user-operate" @click="unbindUser">解绑</span>
			</span>
		</div>
		<div class="flex mb-[14px]">
			<el-card shadow="never" class="!border-none">
				<div v-if="authType !== 'pro'" class="user-ltd-info p-[1.4rem] h-[4.6rem] flex items-center justify-between">
					<div class="flex items-center">
						<span class="h-[2.2rem] leading-[2rem] mt-[0.2rem] bg-left bg-no-repeat cursor-pointer" :class="ltdIcon" @click="store.productPayment"></span>
						<div :class="!authExpirationTime ? 'text-danger' : 'text-secondary'" class="ml-[0.4rem] text-small">
							{{ ltdInfo }}
						</div>
					</div>
					<el-button class="payment-btn" type="primary" size="small" @click="store.productPayment">
						{{ ltdBtn }}
					</el-button>
				</div>
				<div v-else class="user-ltd-info p-[1rem] pl-[1.4rem] pr-[1.4rem] h-[7.2rem] mt-[-0.5rem]">
					<div class="flex items-center">
						<span class="h-[2.4rem] w-[6rem] mt-[0.2rem] bg-left bg-no-repeat cursor-pointer" :class="ltdIcon" @click="store.productPayment"></span>
						<div class="ml-[0.4rem] text-small text-secondary">{{ ltdInfo }}</div>
					</div>
					<div class="flex justify-between items-end">
						<span class="ml-[0.4rem] leading-none">企业版享有以下特权</span>
						<el-button type="primary" size="small" @click="store.productPayment">{{ ltdBtn }}</el-button>
					</div>
				</div>
				<div class="product-card-content">
					<template v-for="(item, index) in v2AdvantageList" :key="index">
						<div v-if="item[0] !== 'other'" class="advantage-item">
							<!-- <i :class="`svgtofont-free-${item[0]}-icon text-large  mr-[4px] text-ltd`"></i> -->
							<bt-svg :name="`tools-${item[0]}`" size="18" class="mr-[4px]" />
							<span>{{ item[1] }}</span>
						</div>
						<!-- 其他特权-点击跳转 -->
						<bt-link v-if="item[0] === 'other'" class="advantage-item other" href="https://www.bt.cn/new/pricing.html">
							{{ item[1] }}
						</bt-link>
					</template>
				</div>
			</el-card>
		</div>
		<!-- 更多操作 -->
		<div class="flex flex-col">
			<el-popover width="172" :show-arrow="false" placement="right">
				<template #reference>
					<div class="menu-item">
						<span>{{ serviceName }}</span>
						<i v-show="authType === 'ltd'" class="svgtofont-free-customer ltd-customer-tips"></i>
					</div>
				</template>
				<div class="qrcode-wechat">
					<bt-link :href="ltdCustomerUrl" class="seek-link" target="_blank"> 点击咨询客服<i class="svgtofont-arrow text-primary"></i> </bt-link>
					<div class="qrcode-content">
						<bt-image src="/customer/customer-qrcode.png" />
						<!-- <bt-qrcode :value="ltdCustomerUrl" :size="128" /> -->
						<!-- <bt-image :all="true" :src="`/static/icons/we-com.svg`" class="!absolute bg-white border-[0.2rem] border-light rounded-small mr-[4px] w-2.4rem h-2.4rem top-[50%] left-[50%] -ml-1.2rem -mt-1.2rem" /> -->
					</div>
					<div class="wechat-title flex items-center justify-center">
						<i class="svgtofont-icon-scan !text-subtitleLarge"></i>
						<div class="scan-title text-medium ml-[.4rem] text-secondary font-bold">扫一扫</div>
					</div>
					<bt-link v-if="authType === 'ltd'" class="survey-link" @click="npsSurveyLtdDialog"> 企业版用户专属调研 </bt-link>
				</div>
			</el-popover>
			<!-- <div class="menu-item !border-none" @click="doLogin">退出面板</div> -->
		</div>
	</div>
</template>

<script setup lang="ts">
import { unbindUser, doLogin, npsSurveyLtdDialog, bindUserDialog } from '@/public'
import { useGlobalStore } from '@store/global'
import { formatTime } from '@utils/index'
import HOME_HEADER_STORE from '@home/views/header/store'
import { storeToRefs } from 'pinia'

const store = HOME_HEADER_STORE()
const { authExpirationTime, bindUser, authType, advantageList, v2AdvantageList } = storeToRefs(store)
const { forceLtd, aliyunEcsLtd } = useGlobalStore()
// 企业版图标
const ltdIcon = computed(() => {
	switch (authType.value) {
		case 'ltd':
			return 'icon-paid-ltd'
		case 'pro':
			return 'icon-paid-pro'
		default:
			return 'icon-unpaid-ltd'
	}
})

/**
 * @description 企业版图标 -- 计算属性
 */
const ltdBtn = computed(() => {
	switch (authType.value) {
		case 'ltd':
			return '续费'
		default:
			return '立即升级'
	}
})

// 打开绑定弹窗
const openBindDialog = async () => {
	bindUserDialog(bindUser.value ? '切换宝塔账号' : '绑定宝塔账号，享受更多服务')
}

/**
 * @description 企业版到期时间 -- 计算属性
 */
const ltdInfo = computed(() => {
	const formattedDate = formatTime(authExpirationTime.value, 'yyyy-MM-dd')
	switch (authType.value) {
		case 'ltd':
			return `${formattedDate}到期`
		case 'pro':
			if (authExpirationTime.value === 0) return '永久授权'
			return `${formattedDate}到期`
		default:
			return ''
	}
})

/**
 * @description 企业版客服链接 -- 计算属性
 */
const ltdCustomerUrl = computed(() => {
	return `https://www.bt.cn/new/wechat_customer?${authType.value === 'ltd' ? `vip=` : ''}`
})

/**
 * @description 企业版客服链接 -- 计算属性
 */
const serviceName = computed(() => {
	if (authType.value === 'ltd') return '您的专属客服'
	return '帮助与客服'
})
</script>

<style lang="css" scoped>
:deep(.payment-btn.el-button--primary) {
	background: var(--bt-pro-sub-bg-color) !important;
	border-color: var(--bt-pro-sub-bg-color) !important;
	@apply h-[2.4rem] flex flex-row items-center justify-center;
}

.payment-btn.el-button--primary span {
	@apply text-small;
}

.payment-btn.el-button--primary:hover {
	@apply bg-warningDark border border-1 border-warningDark;
}

.user-operate:hover {
	@apply cursor-pointer text-primary;
}

.product-card-header {
	@apply flex p-[12px] border-b-[1px] border-solid border-lighter;
	background: linear-gradient(140.75deg, rgba(255, 246, 241, 0.23) -48.385%, rgba(255, 244, 237, 0.23) -16.724%, rgba(255, 245, 238, 0.23) -5.651%, rgba(255, 206, 108, 0.45) 194.528%);
}

.product-card-content {
	@apply px-[12px] pt-[12px] text-small flex flex-wrap;
	background: linear-gradient(140.75deg, rgba(255, 246, 241, 0.15) -55.417%, rgba(255, 244, 237, 0.15) -22.187%, rgba(255, 245, 238, 0.15) -10.565%, rgba(255, 206, 108, 0.3) 199.533%, transparent 20px);
}

:deep(.advantage-item) {
	@apply flex items-center text-small text-secondary w-[50%] mb-[10px];
}

.advantage-item.other:hover {
	@apply text-primary cursor-pointer;
}

.user-ltd-info {
	border-bottom: 0.5px solid var(--el-color-border-dark-tertiaryer);
	background: linear-gradient(140.75deg, rgba(var(--el-file-color-light-rgb), 0.23) -48.385%, rgba(255, 244, 237, 0.23) -16.724%, rgba(255, 245, 238, 0.23) -5.651%, rgba(255, 206, 108, 0.45) 194.528%);
}

.user-ltd-intro {
	border-bottom-right-radius: var(--el-border-radius-large);
	border-bottom-left-radius: var(--el-border-radius-large);
	background: linear-gradient(140.75deg, rgba(var(--el-file-color-light-rgb), 0.15) -55.417%, rgba(255, 244, 237, 0.15) -22.187%, rgba(255, 245, 238, 0.15) -10.565%, rgba(255, 206, 108, 0.3) 199.533%, transparent 20px);
}

.user-ltd-intro .other:hover {
	@apply cursor-pointer text-primary;
}

.el-divider--horizontal {
	margin: 0;
}

.menu-item {
	@apply p-[10px] border-t-[1px] border-dashed border-lighter flex items-center;
}

.menu-item:hover {
	@apply cursor-pointer text-primary bg-light;
}

.ltd-customer-tips {
	@apply text-[8rem] h-[2rem] text-warning flex justify-center items-center;
}

.qrcode-wechat {
	@apply flex flex-col justify-center mb-[8px];
}

:deep(.seek-link) {
	@apply flex justify-center items-center mb-[10px];
}

.qrcode-content {
	@apply flex justify-center mb-[10px];
}

:deep(.survey-link) {
	@apply text-medium mt-8px cursor-pointer text-center;
}
.user-info-popover :deep(.el-card__body) {
	padding: 0 !important;
	overflow: hidden;
	border-radius: var(--el-border-radius-large);
}
.icon-paid-ltd,
.icon-unpaid-ltd {
	background-color: var(--el-base-tertiary);
	border-radius: var(--el-border-radius-extra-round);
	padding-left: 28px;
	padding-right: 12px;
	margin-right: 4px;
	background-image: url('/static/images/home/home-vip-pop-img.png');
	background-size: 15px 15px;
	background-position: left 8px top 3px;
	filter: grayscale(100%);
}
.icon-paid-ltd {
	background:
		url('/static/images/home/home-vip-pop-img.png') no-repeat left 8px top 3px/15px 15px,
		linear-gradient(90deg, var(--bt-ltd-color-linear-1) 0%, var(--bt-ltd-color-linear-2) 50%, var(--bt-ltd-color-linear-1) 100%);
	filter: grayscale(0);
}
.icon-paid-ltd::before,
.icon-unpaid-ltd::before {
	content: '企业版';
	font-size: var(--el-font-size-small);
	color: var(--el-color-white);
}
/* .icon-paid-ltd::before {
	color: var(--el-fill-color-darker);
} */
</style>
