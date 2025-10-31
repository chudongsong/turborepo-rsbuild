<template>
	<div v-bt-loading="viewLoading">
		<!-- 版本切换 -->
		<div class="border-b border-dashed border-darker mb-[2.2rem] pb-[2.2rem]">
			<div class="flex mb-[20px]">
				<div class="title-span">PHP版本</div>
				<el-select v-model="versionData.phpVersion" placeholder="请选择PHP版本" class="!w-[14rem] mr-1rem" @change="eventSelect">
					<el-option v-for="(item, index) in versionData.options" :key="index" :label="item.title" :value="item.key" :disabled="!item.status">
						<span>
							<span>{{ item.label }}</span>
							<template v-if="!item.status">
								[
								<bt-link class="my-[4px]" @click="installVersion(item.key)">未安装</bt-link>
								]
							</template>
						</span>
					</el-option>
				</el-select>
				<bt-input v-show="versionData.phpVersion === 'other'" v-model="versionData.other" @update:modelValue="handleOtherInput" ref="otherInput" class="mr-[.5rem]" width="30rem" placeholder="连接配置，如：1.1.1.1:9001或unix:/tmp/php.sock" />
				<el-button type="primary" v-if="versionData.toggleShow" class="mr-1rem" @click="setVersion">切换</el-button>
				<el-button type="primary" v-if="versionData.noInstall" @click="installVersion()">安装</el-button>
			</div>
			<bt-help :options="phpVersionHelp[versionData.helpIndex]" class="ml-[20px] mt-[20px]"></bt-help>
		</div>
		<!-- session隔离 -->
		<div class="border-b border-dashed border-darker my-[2.2rem] pb-[2.2rem]">
			<div class="flex mb-[20px]">
				<div class="title-span">session隔离</div>
				<el-switch v-model="sessionData.status" @change="setSessionEvent"></el-switch>
			</div>
			<bt-help :options="sessionHelp" class="ml-[20px] mt-[20px]"></bt-help>
		</div>
		<!-- 站点防护 -->
		<div class="my-[2.2rem] relative">
			<div class="flex mb-[20px] items-center">
				<div class="title-span">
					<BtSvgIcon name="icon-ltd" size="1.6" class="mr-[4px]"></BtSvgIcon>
					站点防护
				</div>
				<el-switch v-model="siteProtectData.status" @change="setProtextEvent"></el-switch>
				<span class="ml-[2rem]">今日：{{ siteProtectData.today }}</span>
				<span class="ml-[2rem]">总告警数：{{ siteProtectData.total }}</span>
				<div class="w-[37rem] ml-[2rem]" v-show="siteProtectData.safeTip.show">
					<el-alert type="warning" :closable="false">
						<template #title>
							<span>未启用PHP安全告警，请先</span>
							<bt-link v-if="siteProtectData.safeTip.alarmTip" type="danger" @click="setVersionProtect" class="!inline-block">设置告警</bt-link>
							<span v-if="siteProtectData.safeTip.allTip">和</span>
							<bt-link v-if="siteProtectData.safeTip.safeTip" type="danger" @click="openVersionProtect">开启PHP-{{ siteProtectData.version }}防护</bt-link>
						</template>
					</el-alert>
				</div>
			</div>
			<!-- <div class="flex mb-[20px]">
				<el-button type="default" class="!mr-[12px]" @click="monitor">监视器</el-button>
				<el-button type="default" @click="triggerLog">触发日志</el-button>
			</div> -->
			<bt-help :options="siteProtectHelp" class="ml-[20px] mt-[20px]"></bt-help>
			<bt-install-mask v-if="siteProtectData.tips">
				<template #content>
					<bt-icon icon="el-warning" size="20" class="mr-[8px]" color="orange" />
					<div class="text-small flex items-center font-bold">
						<template v-if="siteProtectData.tipsIndex === 0">当前PHP版本不兼容此功能,请切换其他PHP版本</template>
						<template v-if="siteProtectData.tipsIndex === 1">
							如需使用【PHP网站安全告警】功能，请先安装，
							<bt-link @click="installSecurityNotice">点击安装</bt-link>
						</template>
						<template v-if="siteProtectData.tipsIndex === 2">
							如需使用【PHP网站安全告警】功能，请先购买，
							<bt-link @click="openPayView">点击购买</bt-link>
						</template>
					</div>
				</template>
			</bt-install-mask>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	eventSelect,
	handleOtherInput,
	init,
	installSecurityNotice,
	installVersion,
	monitor,
	openPayView,
	openPlugin,
	openVersionProtect,
	phpVersionHelp,
	sessionData,
	sessionHelp,
	setProtextEvent,
	setSessionEvent,
	setVersion,
	setVersionProtect,
	siteProtectData,
	siteProtectHelp,
	triggerLog,
	versionData,
	viewLoading,
} from '@site/views/php-model/php-setting/useController'

onMounted(init)

defineExpose({
	init,
})
</script>

<style lang="css" scoped>
.title-span {
	@apply mr-[1rem] flex items-center;
}
</style>
