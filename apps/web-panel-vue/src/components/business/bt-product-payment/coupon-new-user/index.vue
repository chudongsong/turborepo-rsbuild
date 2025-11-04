<template>
	<div>
		<!-- 优惠券弹窗 -->
		<div ref="couponModal" class="w-full relative overflow-hidden rounded-medium" :class="{ 'scale-95 opacity-0': isClosing }">
			<!-- 优惠券卡片 -->
			<div class="relative bg-[var(--el-bg-color)] rounded-medium overflow-hidden shadow-2xl transform transition-all duration-500 scale-100">
				<!-- 优惠券内容 -->
				<div class="py-[40px] px-[20px]">
					<!-- 标题区域 -->
					<div class="flex items-center justify-center mb-[16px]">
						<i class="fa fa-ticket text-[var(--bt-pro-color)] text-subtitleLarge mr-[8px]"></i>
						<h2 class="text-[clamp(1.2rem,2.5vw,1.8rem)] font-bold text-default text-shadow">绑定账号领取限时优惠券</h2>
					</div>

					<!-- 优惠金额显示 -->
					<div class="flex flex-col items-center mb-[24px]">
						<p class="text-gray-500 text-small mb-[4px]">领取随机金额优惠券</p>
						<div class="flex items-end">
							<span class="text-[var(--bt-pro-color)] text-subtitleLarge font-bold mr-[4px]">¥</span>
							<span class="text-[var(--bt-pro-color)] text-large50 font-bold -mb-[12px]">{{ discountRange }}</span>
							<span class="text-[var(--bt-pro-color)] text-medium font-bold ml-[4px] mb-[4px]">元</span>
						</div>
						<p class="text-gray-500 text-small mt-[8px]">满1399元可用</p>
					</div>

					<!-- 倒计时区域 -->
					<div class="bg-light rounded-large p-[12px] mb-[20px]">
						<p class="text-center text-gray-600 text-base mb-[8px]">优惠券将在以下时间后过期</p>
						<div class="flex justify-center space-x-[8px] items-center">
							<div class="text-white rounded-large w-[56px] h-[40px] flex items-center justify-center font-bold text-medium" :class="totalSeconds < 10 ? 'bg-red-500' : 'bg-warning'">
								<span>{{ formattedMinutes }}</span>
							</div>
							<span class="text-[var(--bt-pro-color)] font-bold">:</span>
							<div class="text-white rounded-large w-[56px] h-[40px] flex items-center justify-center font-bold text-medium" :class="totalSeconds < 10 ? 'bg-red-500' : 'bg-warning'">
								<span>{{ formattedSeconds }}</span>
							</div>
							<span class="text-[var(--bt-pro-color)] font-bold">:</span>
							<div class="text-white rounded-large w-[56px] h-[40px] flex items-center justify-center font-bold text-medium" :class="totalSeconds < 10 ? 'bg-red-500' : 'bg-warning'">
								<span>{{ formattedMilliseconds }}</span>
							</div>
						</div>
					</div>

					<!-- 使用规则 -->
					<div class="mb-5">
						<h3 class="text-gray-700 font-semibold text-base mb-[8px] flex items-center">
							<i class="fa fa-info-circle text-[var(--bt-pro-color)] mr-2"></i>
							使用规则
						</h3>
						<ul class="text-gray-600 text-small space-y-1 pl-[20px] list-disc">
							<li>用户绑定账号专属优惠</li>
							<li>有效期10分钟</li>
						</ul>
					</div>

					<!-- 领取按钮 -->
					<button
						:disabled="isExpired"
						class="w-full py-[10px] rounded-large font-bold text-medium shadow-lg transform transition-all duration-300 flex items-center justify-center"
						:class="isExpired ? 'bg-gray-400 text-gray-600 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-[var(--bt-pro-color)] to-[var(--bt-pro-light-color)] text-white hover:shadow-xl hover:-translate-y-1'"
						@click="claimCoupon">
						<i :class="isExpired ? 'fa fa-clock-o mr-[8px]' : 'fa fa-gift mr-[8px]'"></i>
						{{ isExpired ? '已过期' : '立即领取优惠券' }}
					</button>
				</div>
			</div>

			<!-- 装饰元素 -->
			<div class="absolute -top-[20px] -right-[20px] w-[64px] h-[64px] bg-[var(--bt-pro-light-color)] rounded-full opacity-20 animate-pulse-slow"></div>
			<div class="absolute -bottom-[24px] -left-[24px] w-[96px] h-[96px] bg-warning rounded-full opacity-10 animate-pulse-slow"></div>
		</div>

		<!-- 礼花容器 -->
		<div ref="fireworksContainer" class="fixed inset-0 pointer-events-none" :class="{ hidden: !showFireworks }">
			<div
				v-for="firework in fireworks"
				:key="firework.id"
				class="absolute rounded-full"
				:style="{
					width: firework.size + 'px',
					height: firework.size + 'px',
					backgroundColor: firework.color,
					left: firework.x + '%',
					top: firework.y + '%',
					animation: 'firework 1s ease-out forwards',
				}"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { bindUserDialog } from '@/public'
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Firework {
	id: number
	x: number
	y: number
	size: number
	color: string
}

const totalSeconds = ref<number>(10 * 60) // 10分钟
const milliseconds = ref<number>(99)
const isClosing = ref<boolean>(false)
const showFireworks = ref<boolean>(false)
const fireworks = ref<Firework[]>([])
const discountRange = ref<string>('200～400')

const emit = defineEmits(['close'])

// 定时器引用
let countdownInterval: ReturnType<typeof setInterval> | null = null

// localStorage 键名
const STORAGE_KEY = 'bt-coupon-countdown'
const OPEN_TIME_KEY = 'bt-coupon-open-time'

// 存储倒计时状态
const saveCountdownState = (): void => {
	const state = {
		totalSeconds: totalSeconds.value,
		milliseconds: milliseconds.value,
		timestamp: Date.now(),
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// 存储打开时间
const saveOpenTime = (): void => {
	localStorage.setItem(OPEN_TIME_KEY, Date.now().toString())
}

// 清除存储的时间
const clearStoredTimes = (): void => {
	localStorage.removeItem(STORAGE_KEY)
	localStorage.removeItem(OPEN_TIME_KEY)
}

// 初始化倒计时
const initializeCountdown = (): void => {
	const storedOpenTime = localStorage.getItem(OPEN_TIME_KEY)
	const currentTime = Date.now()

	if (storedOpenTime) {
		try {
			const openTime = parseInt(storedOpenTime, 10)
			const tenMinutesMs = 10 * 60 * 1000 // 10分钟的毫秒数

			// 计算剩余时间：打开时间 + 10分钟 - 当前时间
			const remainingMs = openTime + tenMinutesMs - currentTime

			if (remainingMs > 0) {
				// 还有剩余时间，设置倒计时
				totalSeconds.value = Math.floor(remainingMs / 1000)
				milliseconds.value = Math.floor((remainingMs % 1000) / 10)
				return
			}
			// 时间已过期，清除存储并直接关闭弹窗
			clearStoredTimes()
			emit('close')
			return
		} catch (error) {
			console.error('解析存储的打开时间失败:', error)
			clearStoredTimes()
		}
	}

	// 没有存储状态或需要重新开始，使用默认值
	totalSeconds.value = 10 * 60
	milliseconds.value = 99
	saveOpenTime()
}

// 计算属性
const formattedMinutes = computed(() => {
	const minutes = Math.floor(totalSeconds.value / 60)
	return minutes.toString().padStart(2, '0')
})

const formattedSeconds = computed(() => {
	const seconds = totalSeconds.value % 60
	return seconds.toString().padStart(2, '0')
})

const formattedMilliseconds = computed(() => {
	return milliseconds.value.toString().padStart(2, '0')
})

const isExpired = computed(() => {
	return totalSeconds.value <= 0 && milliseconds.value <= 0
})

const updateCountdown = (): void => {
	// 倒计时结束处理在计算属性中完成
}

const startCountdown = (): void => {
	countdownInterval = setInterval(() => {
		milliseconds.value -= 1

		if (milliseconds.value < 0) {
			milliseconds.value = 99
			totalSeconds.value--
		}

		// 检查倒计时是否结束
		if (totalSeconds.value <= 0 && milliseconds.value <= 0) {
			if (countdownInterval) {
				clearInterval(countdownInterval)
				countdownInterval = null
			}
			clearStoredTimes()
			emit('close')
			return
		}

		// 实时保存倒计时状态
		saveCountdownState()

		updateCountdown()
	}, 10)
}

const claimCoupon = (): void => {
	if (isExpired.value) return
	// 显示礼花效果
	createFireworks()

	// 清除存储的时间数据
	clearStoredTimes()

	emit('close')

	// 绑定用户
	bindUserDialog('绑定宝塔账号，享受更多服务', '/?model=bind-cupon')
}

const createFireworks = (): void => {
	showFireworks.value = true
	fireworks.value = []

	// 创建多个礼花粒子
	for (let i = 0; i < 50; i++) {
		setTimeout(() => {
			const firework: Firework = {
				id: Date.now() + i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size: Math.random() * 8 + 4,
				color: getRandomColor(),
			}
			fireworks.value.push(firework)

			// 1秒后移除礼花
			setTimeout(() => {
				const index = fireworks.value.findIndex(f => f.id === firework.id)
				if (index > -1) {
					fireworks.value.splice(index, 1)
				}
			}, 1000)
		}, i * 50)
	}

	// 3秒后隐藏礼花容器
	setTimeout(() => {
		showFireworks.value = false
		fireworks.value = []
	}, 3000)
}

const getRandomColor = (): string => {
	const colors = ['var(--bt-pro-color)', 'var(--bt-pro-light-color)', 'var(--bt-pro-sub-color)', 'var(--bt-pro-light-bg-color)', 'var(--bt-pro-color)']
	return colors[Math.floor(Math.random() * colors.length)]
}

// 生命周期
onMounted(() => {
	initializeCountdown()
	startCountdown()
})

onUnmounted(() => {
	if (countdownInterval) {
		clearInterval(countdownInterval)
	}
	// 保存最后的倒计时状态
	saveCountdownState()
})
</script>

<style>
/* UnoCSS 自定义样式 */
.text-shadow {
	text-shadow: 0 2px 4px rgba(var(--el-color-black-rgb), 0.1);
}

/* .text-shadow-lg {
		text-shadow: 0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08);
	} */

.animate-float {
	animation: float 3s ease-in-out infinite;
}

.animate-pulse-slow {
	animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes float {
	0% {
		transform: translateY(0px);
	}
	50% {
		transform: translateY(-10px);
	}
	100% {
		transform: translateY(0px);
	}
}

@keyframes firework {
	0% {
		transform: translateY(0) scale(1);
		opacity: 1;
	}
	100% {
		transform: translateY(-100px) scale(0);
		opacity: 0;
	}
}
</style>
