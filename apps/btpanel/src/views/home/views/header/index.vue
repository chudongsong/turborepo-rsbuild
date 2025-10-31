<template>
	<div class="module-ui home-header">
		<div class="home-header-left">
			<!-- 宝塔账号 -->
			<el-popover width="328" popper-class="el-popover-shadow" trigger="hover">
				<template #reference>
					<div class="mr-[8px] flex items-center">
						<bt-svg name="tools-user" size="26" class="mr-[4px]" />
						<span v-if="!isSmall" class="user-phone" @click="() => bindUserDialog(bindUser ? '切换宝塔账号' : '绑定宝塔账号，享受更多服务')">{{ bindUser ? bindUser : '未绑定帐号，点击绑定' }}</span>
					</div>
				</template>
				<component :is="UserInfo" />
			</el-popover>
			<bt-divider />
			<!-- 系统 -->
			<el-popover width="280" popper-class="el-popover-shadow">
				<template #reference>
					<span class="cursor-pointer flex items-center mr-[4px] ml-[4px]">
						<bt-svg :name="'system-' + systemIcon" size="18" class="mr-[4px]" />
						<span>{{ systemInfo.name || '获取中' }}</span>
					</span>
				</template>
				<div>
					<span class="!mb-4px inline-block max-w-[26rem] truncate" :title="systemInfo.simpleName || '获取中'">系统：{{ systemInfo.simpleName || '获取中' }}</span>
					<span class="block"> 持续运行：{{ panelInfo.runningDays || '获取中' }} </span>
				</div>
			</el-popover>
			<bt-divider v-if="!isHideAd" />

			<!-- 授权版本 -->
			<template v-if="!isHideAd">
				<el-popover width="580" :disabled="authType !== 'free'" :show-arrow="false" popper-style="padding: 0;border-radius: var(--el-border-radius-round);overflow: hidden;" popper-class="el-product-state-popover">
					<template #reference>
						<bt-product-state :is-home="true" :disable-pro="true" />
					</template>
					<component :is="HeaderPopVip" />
				</el-popover>
			</template>

			<!-- 待领取优惠券 -->
			<bt-voucher-apply v-if="!isHideAd && !isSmall" />
		</div>
		<div class="home-header-right">
			<!-- 找Bug奖宝塔币 -->
			<bt-link v-if="panelInfo.isBeta" class="mr-[16px] reset-link bug-feedback" href="https://www.bt.cn/bbs/forum-39-1.html">[找Bug奖宝塔币]</bt-link>

			<!-- 主题模式切换 -->
			<el-dropdown v-if="!isSmall" trigger="hover" placement="bottom-end" @command="handleThemeChange">
				<div class="header-operation-icon" :title="currentTheme === 'auto' ? '自动切换主题' : currentTheme === 'light' ? '切换到暗色主题' : '切换到亮色主题'">
					<bt-svg :name="getThemeIcon()" size="18" class="hob-icon" />
				</div>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="auto" :class="{ 'is-active': currentTheme === 'auto' }">
							<div class="flex items-center">
								<bt-svg :name="'tools-adaptive-' + (systemTheme === 'dark' ? 'dark' : 'light') + ''" size="16" class="mr-2" />
								<span>自动</span>
								<span class="ml-2 text-xs text-info">({{ systemTheme === 'dark' ? '暗色' : '亮色' }})</span>
							</div>
						</el-dropdown-item>
						<el-dropdown-item command="light" :class="{ 'is-active': currentTheme === 'light' }">
							<div class="flex items-center">
								<bt-svg name="tools-light" size="16" class="mr-2" />
								<span>亮色</span>
							</div>
						</el-dropdown-item>
						<el-dropdown-item command="dark" :class="{ 'is-active': currentTheme === 'dark' }">
							<div class="flex items-center">
								<bt-svg name="tools-dark" size="16" class="mr-2" />
								<span>暗色</span>
							</div>
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>

			<!-- 界面设置 -->
			<el-popover v-if="!isSmall" width="1" placement="bottom" trigger="hover">
				<template #reference>
					<div class="header-operation-icon" @click="store.jumpRouter('ui')">
						<bt-svg name="tools-theme" size="18" class="hob-icon" />
					</div>
				</template>
				<div class="text-small text-center w-full">打开界面设置</div>
			</el-popover>

			<!-- 告警 -->
			<el-popover v-if="!isSmall" width="1" placement="bottom" trigger="hover">
				<template #reference>
					<div class="header-operation-icon" @click="store.jumpRouter('alarm')">
						<bt-svg name="tools-alarm" size="18" class="hob-icon" />
					</div>
				</template>
				<div class="text-small text-center w-full">打开告警设置</div>
			</el-popover>

			<!-- 需求反馈 -->
			<el-popover v-if="!isSmall" width="20" placement="bottom" trigger="hover">
				<template #reference>
					<div class="header-operation-icon" @click="npsSurveyV2Dialog({ type: 7, isNoRate: true, isCard: true })">
						<bt-svg name="tools-feedback" size="18" class="hob-icon" />
					</div>
				</template>
				<div class="text-small text-center w-full">打开需求反馈</div>
			</el-popover>

			<bt-divider v-if="!isSmall" />

			<!-- 版本号 -->
			<span class="versionInfo mx-[8px] bt-hover-link cursor-pointer" @click="store.histVersionInfoDialog">
				<!-- <span v-show="authType === 'free'" @click="openProductPayView">(正式版)</span> -->
				v{{ (panelInfo.isBeta ? 'Beta ' : '') + (panelVersion || '获取中') }}
			</span>

			<bt-divider />

			<!-- 更新 -->
			<el-badge class="mr-[8px]" is-dot :hidden="panelInfo.upgrade !== 1 || panelInfo.hideBadge">
				<span class="bt-link header-operation-btn" title="点击获取最新版面板程序" @click="store.updateVersionDialog">
					<bt-svg name="tools-update" size="18" class="hob-icon" />
					<span>更新</span>
				</span>
			</el-badge>

			<!-- 修复 -->
			<span class="bt-link header-operation-btn mr-[8px]" title="修复面板会获取最新的面板代码程序，包含bug修复" @click="store.onRepair">
				<bt-svg name="tools-repair" size="18" class="hob-icon" />
				<span>修复</span>
			</span>

			<!-- 重启 -->
			<span class="bt-link header-operation-btn" title="点击可选择重启面板或重启服务器" @click="store.restartSeverDialog">
				<bt-svg name="tools-restart" size="18" class="hob-icon" />
				<span>重启</span>
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { npsSurveyV2Dialog, productPaymentDialog, bindUserDialog } from '@/public/index' // 需求反馈弹窗
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@store/global'
import { isDark, systemTheme, setSchemeTheme, scheme, watchSystemTheme } from '@/utils/theme-config'
import HOME_HEADER_STORE from './store'
import { setPanelTheme } from '@/api/config'
import type { Theme } from '@/types/theme'

const { payment, aliyunEcsLtd, forceLtd, isHideAd, mainWidth, globalTheme } = useGlobalStore()

const { authType } = toRefs(payment.value)

const UserInfo = defineAsyncComponent(() => import('./user-info/index.vue'))

const HeaderPopVip = defineAsyncComponent(() => import('./pop-vip/index.vue'))

const store = HOME_HEADER_STORE()
const { bindUser, systemInfo, panelInfo, panelVersion } = storeToRefs(store)

// 当前主题模式
const currentTheme = computed(() => scheme.value)

// 获取主题图标
const getThemeIcon = () => {
	switch (currentTheme.value) {
		case 'auto':
			return 'tools-adaptive-' + (!isDark.value ? 'light' : 'dark') + ''
		case 'light':
			return 'tools-light'
		case 'dark':
			return 'tools-dark'
	}
	return 'tools-light'
}

// 处理主题切换
const handleThemeChange = (command: Theme) => {
	setSchemeTheme(command)
	globalTheme.value.theme.preset = command
	setPanelTheme({ data: JSON.stringify(globalTheme.value) })
}

// 监听系统主题变化
onMounted(() => {
	watchSystemTheme()
})

// 是否隐藏
const isSmall = computed(() => {
	return mainWidth.value < 968
})

// 系统图标
const systemIcon = computed(() => {
	if (!systemInfo.value.name) return ''
	return systemInfo.value.name.split(' ')[0]?.toLowerCase()
})

const showClose = computed(() => {
	if (aliyunEcsLtd.value && payment.value.authType !== 'ltd') return false
	// if (forceLtd.value && payment.value.authType !== 'ltd') return false
	return true
})

/**
 * @description 打开产品支付弹窗
 */
const openProductPayView = () => {
	const config = { disablePro: true }
	if (authType.value === 'pro') config.disablePro = false // 如果当前是专业版，不禁用专业版
	productPaymentDialog({
		disablePro: config.disablePro,
		sourceId: 27,
		showClose: showClose.value,
	})
}
</script>

<style lang="css" scoped>
.home-header {
	@apply px-[1.8rem] py-0 mb-[1.2rem] flex items-center h-[5.4rem] justify-between text-small;
}

.home-header-left,
.home-header-right {
	@apply flex items-center;
}

.home-header-right {
	:deep(.el-badge__content.is-dot) {
		width: 10px;
		height: 10px;
		right: 6px;
		top: 2px;
	}
}
/* 用户手机号 */
.user-phone {
	@apply text-primary cursor-pointer text-default;
}
.user-phone:hover {
	color: var(--el-color-text-secondary);
}
.header-operation-btn {
	@apply flex items-center border-[1px] border-light h-[26px] leading-9 rounded-round bg-darker px-[10px] transition-all-[0.3s];
	color: var(--el-color-text-primary) !important;
	.hob-icon {
		@apply mr-4px !text-medium;
	}
	&:hover {
		color: var(--el-color-black);
		background-color: var(--el-fill-color-darker);
	}
}

.header-operation-icon {
	@apply mr-[16px] inline-flex items-center cursor-pointer h-[2.6rem] w-[2.6rem] justify-center rounded-round hover:bg-dark transition-all-[0.3s];
}

/* 主题下拉菜单样式 */
:deep(.el-dropdown-menu__item.is-active) {
	background-color: var(--el-color-primary-light-9);
	color: var(--el-color-primary);
}

:deep(.el-dropdown-menu__item.is-active .bt-svg) {
	color: var(--el-color-primary);
}
</style>
