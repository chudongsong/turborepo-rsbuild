<template>
	<section class="flex flex-col">
		<svg viewBox="0 0 402 485" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="402.000000" height="485.000000" fill="none">
			<g>
				<path
					class="coupon-background"
					d="M402 10C402 4.47715 397.523 0 392 0L10 0C4.47715 0 0 4.47715 0 10L0 303.008C0.165974 303.003 0.332656 303 0.5 303C8.50813 303 15 309.492 15 317.5C15 325.508 8.50813 332 0.5 332C0.332656 332 0.165974 331.997 0 331.992L0 475C0 480.523 4.47715 485 10 485L392 485C397.523 485 402 480.523 402 475L402 331.992C394.223 331.728 388 325.341 388 317.5C388 309.659 394.223 303.272 402 303.008L402 10Z"
					fill-rule="evenodd" />
				<path id="直线 1" class="coupon-line" d="M15 318L387 318" />
			</g>
		</svg>
		<div class="flex flex-col absolute w-full">
			<div class="pt-2.6rem bottom-bg">
				<div class="px-3.6rem">
					<div class="text-extraLarge text-pro w-full text-center">免费限时领取【大额优惠券】</div>
					<div class="voucher-list mt-2.6rem min-h-[230px] flex flex-col items-center justify-center">
						<div v-for="(item, index) in couponItem" :key="index" class="voucher-item flex items-center justify-between py-[1.6rem] rounded-base" :class="index === couponItem.length - 1 ? 'mb-[1.4rem]' : 'mb-[2.4rem]'">
							<div class="voucher-amount inline-block px-1.6rem relative w-12rem">
								<div class="font-bold text-large">
									￥<span class="text-large36">{{ item.val2 }}</span>
								</div>
								<div class="text-tertiary mt-1rem">满{{ item.val1 }}减{{ item.val2 }}</div>
							</div>
							<div class="inline-block text-left mr-1rem text-secondary voucher-instructions flex-1 pl-1.6rem">
								<div class="text-base mb-1rem">仅限{{ item.name }}</div>
								<div class="voucher-count-down mt-1.2rem text-left">
									领取后有效期
									<div class="text-danger mlr-[1rem] inline-block text-extraLarge">{{ formatDuration(item.timeout) }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="px-[3.6rem] pb-1rem mt-1.4rem">
				<div class="voucher-count-down text-center text-medium leading-[3rem] mt-[2.6rem] text-secondary flex justify-center">
					距结束<span>{{ countdown.hour }}</span
					>时<span>{{ countdown.minute }}</span
					>分<span>{{ countdown.second }}</span
					>秒<span>{{ countdown.millisecond }}</span>
				</div>
				<div class="mt-[2rem] voucher-footer text-center">
					<span class="text-white bg-pro hover:bg-[var(--bt-pro-sub-color)]" @click="claimCouponEvent(popupClose)">一键领取</span>
					<bt-select v-model="timeClose" :options="siteList" class="reminder mt-1rem !w-[14rem]" placeholder="选择不通知的时间" @change="changeCloseTimeEvent" />
				</div>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PRODUCT_PAYMENT_STORE from '../store'

const store = PRODUCT_PAYMENT_STORE()
const { couponItem, closeAfterReload, timeClose, timeNow } = storeToRefs(store)
const { siteList, addZero, claimCouponEvent, changeCloseTimeEvent } = store
const popupClose = inject('popupClose', () => {})

// 自定义时间转换函数，只显示天、小时、分，0值不显示
const formatDuration = (second: number | string | null | undefined): string => {
	// 防御性编程：处理异常输入
	if (second === null || second === undefined) {
		return '时间未知'
	}

	// 转换为数字并验证
	const numSecond = Number(second)
	if (isNaN(numSecond) || numSecond < 0) {
		return '时间格式错误'
	}

	// 处理极大值（防止计算溢出）
	if (numSecond > Number.MAX_SAFE_INTEGER / 1000) {
		return '时间过长'
	}

	const days = Math.floor(numSecond / 86400)
	const hours = Math.floor((numSecond % 86400) / 3600)
	const minutes = Math.floor(((numSecond % 86400) % 3600) / 60)

	const parts: string[] = []
	if (days > 0) parts.push(`${days}天`)
	if (hours > 0) parts.push(`${hours}小时`)
	if (minutes > 0) parts.push(`${minutes}分`)

	return parts.length > 0 ? parts.join('') : '不足1分钟'
}

interface Props {
	compData: {
		isCoupon: any[]
		isHome: boolean
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		isCoupon: [],
		isHome: false,
	}),
})

const timestamp = useTimestamp() // 响应式获取当前时间戳

watch(
	() => timestamp.value,
	val => {
		timeNow.value = val
	}
)

const countdown = computed(() => {
	let hour: string = '00'
	// eslint-disable-next-line init-declarations
	let minute: string = '00'
	// eslint-disable-next-line init-declarations
	let second: string = '00'
	// eslint-disable-next-line init-declarations
	let millisecond: string = '00'
	let endTime = Number(sessionStorage.getItem('HOME-ENDTIME'))
	if (!endTime || timeNow.value >= endTime) {
		// 如果没有结束时间，设置当前时间戳加2小时的时间戳为结束时间
		endTime = timeNow.value + 2 * 3600 * 1000 // 2小时
		sessionStorage.setItem('HOME-ENDTIME', endTime.toString())
	}
	const diff = endTime - timeNow.value
	if (diff > 0) {
		hour = addZero(Math.floor(diff / (1000 * 60 * 60)))
		minute = addZero(Math.floor((diff / (1000 * 60)) % 60))
		second = addZero(Math.floor((diff / 1000) % 60))
		millisecond = addZero(Math.floor((diff % 1000) / 10))
	} else {
		hour = '00'
		minute = '00'
		second = '00'
		millisecond = '00'
		if (diff === 0) {
			sessionStorage.removeItem('HOME-ENDTIME')
			changeCloseTimeEvent('week', false)
		}
	}
	return {
		hour,
		minute,
		second,
		millisecond,
	}
})

onMounted(() => {
	if (props.compData.isCoupon.length) {
		couponItem.value = props.compData.isCoupon
	}
})
</script>

<style lang="css" scoped>
.coupon-element {
	fill: none;
	stroke: var(--el-color-text-primary);
	stroke-width: 60px;
}

.coupon-background {
	fill: var(--el-fill-color-lighter);
}

.coupon-line {
	stroke: var(--el-color-text-secondary);
	stroke-dasharray: 4 4;
	stroke-width: 1;
}

.parting-line {
	@apply w-full h-0 relative flex justify-between;
}

.line {
	@apply flex-1 border-dotted border-dark border-t-width-[0.2rem] h-0;
}

.parting-line-before {
	@apply w-[1.4rem] h-[2.8rem] overflow-hidden relative right-0 -top-[1.4rem];
}

.parting-line-before::after {
	@apply content-[''] relative w-[2.8rem] h-[2.8rem] rounded-full inline-block -left-[1.4rem];
	background: rgba(var(--el-color-black-rgb), 0.08);
}

.parting-line-after {
	@apply w-[1.4rem] h-[2.8rem] overflow-hidden relative right-0 -top-[1.4rem];
}

.parting-line-after::after {
	@apply content-[''] relative w-[2.8rem] h-[2.8rem] rounded-full inline-block;
	background: rgba(var(--el-color-black-rgb), 0.08);
}

.voucher-item {
	@apply relative;
	width: 100%;
	border: 1px solid var(--bt-ltd-border-color);
	background: rgba(var(--el-file-color-light-rgb), 0.6);
}

.voucher-item::before {
	@apply content-[''] inline-block w-[4.4rem] h-[4.4rem] top-[0.4rem] left-0 -mt-[.5rem] absolute;
	background: url('/static/images/advantage/bg-voucher-left-icon.svg') no-repeat;
}

.voucher-amount {
	background: linear-gradient(to bottom, var(--bt-ltd-sub-color), var(--bt-ltd-light-color));
	-webkit-background-clip: text;
	color: transparent;
}

.voucher-amount::after {
	position: absolute;
	content: '';
	display: block;
	width: 0.1rem;
	height: 4.7rem;
	background: var(--bt-ltd-light-bg-color);
	right: 0;
	bottom: 0.8rem;
}

.voucher-count-down :deep(span) {
	@apply text-danger rounded-small font-bold text-large;
	background: rgba(var(--el-color-danger-rgb), 0.08);
	padding: 0.2rem 0.4rem;
	margin: 0 6px;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 40px;
	height: 30px;
}

.voucher-footer span {
	@apply h-[4.2rem] leading-[2.2rem] text-medium py-[0.8rem] w-full block text-center rounded-extraLarge cursor-pointer;
}

.voucher-footer span:first-child {
	box-shadow: 0 0.2rem 0.2rem 0 rgba(var(--el-color-black-rgb), 0.2);
}

:deep(.reminder.el-select .el-select__wrapper) {
	@apply shadow-none w-14rem text-tertiary;
}
</style>
