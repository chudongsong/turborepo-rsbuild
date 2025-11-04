<template>
	<div class="ssh-login-stats">
		
		<div v-if="sshLoading" class="skeleton-container">
			<el-skeleton :rows="2" animated />
		</div>
		
		<div v-else class="stats-content">
			<div class="stats-panels flex gap-12px">
				<div class="panels success flex flex-col items-center cursor-pointer" @click="jumpLoginDetailEvent('Accepted')">
					<div class="font-600 text-large text-primary mb-3">{{ loginInfo.success }}</div>
					<span class="text-secondary text-small">SSH成功登录</span>
				</div>
				<div class="panels error flex flex-col items-center cursor-pointer" @click="jumpLoginDetailEvent('Failed')">
					<div class="font-600 text-large text-danger mb-3">{{ loginInfo.error }}</div>
					<span class="text-secondary text-small">SSH失败尝试</span>
				</div>
			</div>
			<div class="flex flex-1 flex-col justify-around">
				<div class="progress-item flex items-center">
					<div class="text-secondary text-base font-600 w-[3rem]">今日</div>
					<div class="flex-1 flex items-center ml-4">
						<div class="progress-bar !h-[8px]">
							<div class="progress-success" :style="{ width: getPercentage(loginInfo.today_success, loginInfo.today_success + loginInfo.today_error) + '%' }"></div>
							<div class="progress-error" :style="{ width: getPercentage(loginInfo.today_error, loginInfo.today_success + loginInfo.today_error) + '%' }"></div>
						</div>
						<div class="progress-numbers !text-base w-[6rem] flex ml-12px">
							<span class="success mr-4">{{ loginInfo.today_success }}</span>
							<span class="error">{{ loginInfo.today_error }}</span>
						</div>
					</div>
				</div>
				
				<div class="progress-item flex items-center">
					<div class="text-secondary text-small w-[3rem]">昨日</div>
					<div class="flex-1 flex items-center ml-4">
						<div class="progress-bar">
							<div class="progress-success" :style="{ width: getPercentage(loginInfo.yesterday_success || 0, (loginInfo.yesterday_success || 0) + (loginInfo.yesterday_error || 0)) + '%' }"></div>
							<div class="progress-error" :style="{ width: getPercentage(loginInfo.yesterday_error || 0, (loginInfo.yesterday_success || 0) + (loginInfo.yesterday_error || 0)) + '%' }"></div>
						</div>
						<div class="progress-numbers w-[6rem] flex ml-12px">
							<span class="success mr-4">{{ loginInfo.yesterday_success || 0 }}</span>
							<span class="error">{{ loginInfo.yesterday_error || 0 }}</span>
						</div>
					</div>
				</div>
				
				<div class="progress-item flex items-center">
					<div class="text-secondary text-small w-[3rem]">7天</div>
					<div class="flex-1 flex items-center ml-4">
						<div class="progress-bar">
							<div class="progress-success" :style="{ width: getPercentage(loginInfo.sevenday_success || 0, (loginInfo.sevenday_success || 0) + (loginInfo.sevenday_error || 0)) + '%' }"></div>
							<div class="progress-error" :style="{ width: getPercentage(loginInfo.sevenday_error || 0, (loginInfo.sevenday_success || 0) + (loginInfo.sevenday_error || 0)) + '%' }"></div>
						</div>
						<div class="progress-numbers w-[6rem] flex ml-12px">
							<span class="success mr-4">{{ loginInfo.sevenday_success || 0 }}</span>
							<span class="error">{{ loginInfo.sevenday_error || 0 }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import type { LoginInfo, YesterdayData, WeekData } from './types'
import { getFirewallStore } from '@firewall/useStore'
import { useRouter } from 'vue-router'
import { actionType, historyType } from '@logs/views/ssh-log/useController'
import { getSSHLoginInfo } from '@/api/firewall'
import { useDataHandle } from '@hooks/tools/data'
import { ElSkeleton } from 'element-plus'
import { LOG_SSH_STORE } from '@logs/views/ssh-log/useStore'

interface Props {
	hideTitle?: boolean
}

const {
	refs: { sshTabActive, sshLoginType },
} = getFirewallStore()

const router = useRouter()
const sshLogStore = LOG_SSH_STORE()
const { isRefreshList } = storeToRefs(sshLogStore)
const props = withDefaults(defineProps<Props>(), {
})

const sshLoading = ref(false) // SSH登录详情loading

const loginInfo = shallowRef<LoginInfo>({
	success: 0, // 成功总数
	today_success: 0, // 今日新增成功总数
	error: 0, // 失败总数
	today_error: 0, // 今日新增失败总数
	yesterday_success: 0, // 昨日成功数
	yesterday_error: 0, // 昨日失败数
	sevenday_success: 0, // 7天成功数
	sevenday_error: 0, // 7天失败数
})

/**
 * @description: 计算百分比
 * @param {number} value 要计算的值
 * @param {number} total 总数
 */
const getPercentage = (value: number, total: number) => {
	if (total === 0) return 0
	const percentage = Math.round((value / total) * 100)
	return value > 0 && percentage === 0 ? 1 : percentage
}

/**
 * @description: 获取SSH登录详情
 */
const getSSHLoginInfoEvent = async () => {
	const res: any = await useDataHandle({
		loading: sshLoading,
		request: getSSHLoginInfo(),
		data: {
			success: Number,
			today_success: Number,
			error: Number,
			today_error: Number,
			yesterday_success: Number,
			yesterday_error: Number,
			sevenday_success: Number,
			sevenday_error: Number,
		},
	})
	if (res) loginInfo.value = res
}

/**
 * @description: 跳转登录详情
 * @param {string} type 类型
 */
 const jumpLoginDetailEvent = (type: string) => {
	actionType.value = type
	historyType.value = '7'
	sshTabActive.value = 'login'
	// sshLoginType.value = type
	// actionType.value = type
	if (router.currentRoute.value.path !== '/firewall/ssh-manger') {
		router.push('/firewall/ssh-manger')
	} else {
		isRefreshList.value = false
		nextTick(() => {
			isRefreshList.value = true
		})
	}
}

onMounted(getSSHLoginInfoEvent)
</script>

<style scoped lang="scss">
.ssh-login-stats {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	
	.title {
		font-size: 16px;
		font-weight: 600;
		color: var(--el-color-text-primary);
		margin-bottom: 16px;
	}
	
	.stats-content {
		display: flex;
		gap: 24px;
		
		.stats-panels {
			.panels {
				border-width: 1px;
				padding: 12px 0;
				width: 12rem;
			}
			.success {
				border-color: var(--el-color-primary-light-8);
				border-radius: var(--el-border-radius-base);
				background-color: var(--el-color-primary-light-9);
			}
			.error {
				border-color: var(--el-color-danger-light-8);
				border-radius: var(--el-border-radius-base);
				background-color: var(--el-color-danger-light-9);
			}
		}
		
		.progress-item {
			.progress-bar {
				flex: 1;
				height: 6px;
				background-color: var(--el-fill-color-dark);
				border-radius: 4px;
				overflow: hidden;
				display: flex;
				
				.progress-success {
					background-color: var(--el-color-primary);
				}
				
				.progress-error {
					background-color: var(--el-color-danger);
				}
			}
			
			.progress-numbers {
				font-size: var(--el-font-size-small);
				.success {
					color: var(--el-color-primary);
				}
				.error {
					color: var(--el-color-danger);
				}
			}
		}
	}
}
</style>
