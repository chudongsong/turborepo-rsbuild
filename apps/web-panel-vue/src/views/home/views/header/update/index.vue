<template>
	<div v-loading="isLoading" :class="(isUpgrade ? 'update-back ' : '') + 'flex relative w-[100%] flex-col h-[100%] rounded-small update-version-view'">
		<!-- 更新title -->
		<template v-if="isUpgrade">
			<div ref="updateSvg" class="w-full relative">
				<svg viewBox="0 0 548 153.342" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="139" fill="none" customFrame="#000000" preserveAspectRatio="none meet">
					<g>
						<path d="M5.69224e-05 0L548 0L548 153L0 153L5.69224e-05 0Z" class="update-fg-element" fill-rule="evenodd" />
						<path
							d="M0 127.609C22.361 115.208 74.099 102.187 102.17 149.311C102.17 149.311 125.906 81.105 185.763 112.107C185.763 112.107 211.563 67.671 262.132 88.339C289.308 88.683 353.348 76.698 390.5 18L403.518 25.3C396.638 40.458 387.831 79.038 407.646 112.107C424.846 101.429 467.916 89.165 502.592 125.542C514.976 121.753 541.396 116.241 548 124.508L548 151.039L0 151.039L0 127.609Z"
							class="updateed-bg-element"
							fill-rule="evenodd" />
						<path
							d="M0 131.838L0 94.677C11.7134 92.3228 42.0593 92.6576 62.6202 112.94C75.0593 102.441 106.721 88.2543 133.86 115.508C140.8 103.149 165.607 82.413 209.319 98.3354C209.319 98.3354 239.44 59.7058 296.131 82.7745C296.131 82.7745 312.727 66.2293 343.685 71.0559C358.198 58.4547 388.474 31.2026 393.468 23L400.682 26.1796C392.71 38.5351 377.984 67.2003 382.87 83.0155C388.37 84.6108 400.597 90.6492 405.502 102.04C422.401 94.7122 462.566 88.1346 488.029 120.44C499.749 116.522 527.391 110.902 548 120.44L548 153.342L274.535 153.34L3.5882e-05 153.342L0.00011766 141.5L0 131.838Z"
							class="updateed-bg-element"
							fill-rule="evenodd" />
					</g>
				</svg>
			</div>
			<div class="w-[150px] fixed right-30px" :style="`top:${updateSvgRect.top ? updateSvgRect.top - 100 : mainHeight / 2 - 360}px;right:${updateSvgRect.left ? updateSvgRect.left + 40 : mainWidth / 2 - 105}px`">
				<bt-image src="/update/update_rocket.svg" alt="rocket img" />
			</div>
			<div class="absolute top-15px left-15px text-white text-base">
				<span>{{ `${os}${versionType}本更新` }}</span>
			</div>
		</template>
		<!-- 版本title -->
		<template v-else>
			<div class="w-full">
				<svg viewBox="0 0 500 83.775" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500.000000" height="83.775002" fill="none">
					<rect id="update_back2_new 1" width="500.000000" height="83.775002" x="0.000000" y="0.000000" />
					<path
						class="update-fg-element"
						d="M493.826 60.0152C496.046 58.4396 498.083 56.6702 499.937 54.7072L500 19L0 19L0 53.9322C0 54.3652 2.3904 55.7552 2.77766 56.0372C3.88521 56.8297 5.01047 57.5984 6.15344 58.3432C15.524 64.3842 26.3309 69.6113 37.8194 70.1743C50.6284 70.8093 59.0042 63.9312 69.8956 58.8062C81.9499 53.1162 93.4593 55.2412 104.549 61.8262C112.295 66.4493 120.356 71.8963 129.476 71.6253C142.967 71.2123 154.224 63.0752 166.541 58.8352C180.304 54.1132 192.537 57.3652 204.098 65.4013C213.354 71.8463 221.855 79.9423 233.208 82.8624C245.472 86.0144 257.746 82.3793 267.295 74.8873C284.067 62.3002 287.222 55.4622 301.751 55.0192C318.123 54.5362 332.285 65.3213 347.17 70.2553C357.222 73.6283 368.553 74.4853 378.397 70.0133C387.139 66.0563 393.648 58.9372 402.505 55.1612C422.663 46.7322 439.256 63.8813 458.061 67.6973C464.319 68.9164 470.563 68.8497 476.791 67.4973C483.029 66.1713 488.707 63.677 493.826 60.0142L493.826 60.0152Z"
						fill-rule="evenodd" />
					<path
						class="update-bg-element"
						d="M493.865 42.73C496.07 41.1662 498.095 39.4096 499.937 37.46L500 0L0 0L0 36.69C0 37.12 2.375 38.5 2.76042 38.78C3.86458 39.57 4.97917 40.33 6.11458 41.07C15.4271 47.07 29.2917 52.26 40.7083 52.82C53.4375 53.45 61.7604 46.62 72.5833 41.53C84.5625 35.88 96 37.99 107.021 44.53C114.719 49.12 122.729 54.53 131.792 54.26C145.198 53.85 156.385 45.77 168.625 41.56C182.302 36.87 194.458 40.1 205.948 48.08C215.146 54.48 223.594 62.52 234.875 65.42C247.062 68.55 259.271 64.42 268.76 56.98C279.177 48.86 288.552 38.21 302.99 37.77C319.26 37.29 333.333 48 348.125 52.9C358.115 56.25 369.375 57.1 379.156 52.66C387.844 48.73 394.312 41.66 403.115 37.91C423.146 29.54 439.635 46.57 458.323 50.36C464.542 51.5705 470.747 51.5042 476.936 50.161C483.132 48.8452 488.775 46.3682 493.865 42.73L493.865 42.73Z"
						fill-rule="evenodd" />
				</svg>
			</div>
			<div class="absolute top-15px left-15px text-white text-base">
				<span>宝塔{{ os }}面板</span>
			</div>
		</template>

		<!-- 更新视图 -->
		<div :class="isUpgrade ? 'relative rounded-small' : 'relative rounded-small'" v-bt-loading="loading" v-bt-loading:title="'正在加载更新信息，请稍后...'">
			<!-- 需要更新 -->
			<template v-if="isUpgrade">
				<div class="text-extraLarge flex font-bold items-center justify-center text-secondary">
					<span>发现新的正式版本！</span>
				</div>
				<div class="text-base mt-8 flex justify-between mb-16px mx-34px update-text">
					<div class="">
						<span>最新版本:&nbsp;</span>
						<span>
							<bt-link href="https://www.bt.cn/bbs/forum-36-1.html">{{ os }}-{{ currentInfo?.version }} </bt-link>
						</span>
						<span v-if="grayscale < 1" class="text-primary">
							<el-tooltip class="item" effect="dark" content="提示：当前是正式版尝鲜阶段，为了验证新版本的稳定性和兼容性，确保全面推出之前，新功能能正常运行。" placement="top">
								<span>（尝鲜版<i class="svgtofont-el-question-filled"></i>）</span>
							</el-tooltip>
						</span>
					</div>
					<div class="">
						<span>更新时间：{{ currentInfo?.uptime }}</span>
					</div>
				</div>
				<el-alert v-if="panelInfo.envUpgradeInfo?.need_env_check" :closable="false" class="!mx-[3.4rem] !w-[43rem]" :style="panelInfo.envUpgradeInfo?.has_env_py313 ?{
					backgroundColor:  'var(--el-color-primary-light-9) !important',
					color:  'var(--el-color-primary-dark-2) !important',
					border:  '1px solid var(--el-color-primary-light-8) !important',
				}:{}" :type="panelInfo.envUpgradeInfo?.has_env_py313 ? 'primary' : 'error'" >
					<div class="py-[.8rem] text-base flex items-center justify-between update-text bg-[var(--el-color-white-rgb)]">
						<span class="flex items-center">
							{{ `${panelInfo.envUpgradeInfo?.has_env_py313 ? '新版环境包已下载，可更新面板':'新版本需要更新环境，请先预下载新版环境'}。` }}
						</span>
						<span v-if="!panelInfo.envUpgradeInfo?.has_env_py313" class="text-primary">
							<el-tooltip :visible="showTooltip" class="item" effect="dark" content="提示：请先预下载环境包后，再升级面板版本。" placement="top">
								<span class="bt-link" @click="updateEnv">{{panelInfo.envUpgradeInfo?.env_update_running ? '查看日志':'预下载环境'}}</span>
							</el-tooltip>
						</span>
					</div>
				</el-alert>
				<el-alert v-if="panelInfo.envUpgradeInfo?.plugins_check.length > 0" :closable="false" class="!mx-[3.4rem] !w-[43rem] !mt-[1rem]" :style="!panelInfo.envUpgradeInfo?.plugins_hasUpdate ?{
					backgroundColor:  'var(--el-color-primary-light-9) !important',
					color:  'var(--el-color-primary-dark-2) !important',
					border:  '1px solid var(--el-color-primary-light-8) !important',
				}:{}" :type="!panelInfo.envUpgradeInfo?.plugins_hasUpdate ? 'primary' : 'error'" >
					<div class="py-[.8rem] text-base flex items-center justify-between update-text bg-[var(--el-color-white-rgb)]">
						<span class="flex items-center">
							{{ `${panelInfo.envUpgradeInfo?.plugins_hasUpdate ? '新版本部分插件需要更新，请先更新插件':'必要插件已更新完毕，可更新面板'}。` }}
						</span>
						<span v-if="panelInfo.envUpgradeInfo?.plugins_check.length > 0" class="text-primary">
							<el-tooltip :visible="showPluginsTooltip" class="item" effect="dark" content="提示：请先更新插件后，再升级面板版本。" placement="top">
								<span class="bt-link" @click="openPluginList">{{'查看插件列表'}}</span>
							</el-tooltip>
						</span>
					</div>
				</el-alert>
			</template>
			<template v-else>
				<div class="text-extraLarge flex mt-2rem pb-8 font-bold items-center justify-center text-secondary bg-[var(--el-color-white-rgb)]">
					<bt-image src="/update/update_icon.svg" alt="icon" class="h-12 mr-2 mt-1" />
					<span class="leading-10">当前已经是最新版本</span>
				</div>
				<div class="px-32px py-[1.6rem] text-base flex items-center justify-between update-text bg-[var(--el-color-white-rgb)]">
					<span class="flex items-center">
						当前版本：
						<bt-link class="bt-link text-small" href="https://www.bt.cn/bbs/forum-36-1.html" v-text="os + versionType + panelVersion" />
						<span v-if="grayscale < 1" class="text-primary">
							<el-tooltip class="item" effect="dark" content="提示：当前是正式版尝鲜阶段，为了验证新版本的稳定性和兼容性，确保全面推出之前，新功能能正常运行。" placement="top">
								<span>（尝鲜版<i class="svgtofont-el-question-filled"></i>）</span>
							</el-tooltip>
						</span>
					</span>
					<span>当前发布时间：{{ currentInfo?.uptime }} </span>
				</div>
			</template>
			<!-- 中部 -->
			<div :class="isUpgrade ? `mb-[3rem] mt-4 px-16px py-22px mx-34px ${isDark ? 'bg-light' : 'bg-light'} rounded-small` : 'mb-[2.2rem] mt-2 px-16px py-14px mx-32px border-1 border-light bg-light rounded-small'">
				<!-- 更新日志内容 -->
				<div v-if="isUpgrade" class="rounded-base update-content">
					<div class="leading-10 mr-2 text-small text-secondary overflow-auto" v-html="currentInfo?.updateMsg || '获取中'"></div>
				</div>
				<hr v-if="isUpgrade" />
				<!-- 提示信息 -->
				<div class="flex flex-col justify-center leading-10 text-small text-secondary">
					<!-- <span v-if="isBeta">
						如需切换回正式版请点击
						<bt-link class="ml-2" @click="cutUpdateType">切换至正式版</bt-link>
					</span>
					<span v-if="!isBeta">
						如需切换测试版请点击
						<bt-link class="ml-2" @click="cutUpdateType">申请测试版</bt-link>
					</span> -->
					<div class="mt-0.6rem flex items-center">
						<span class="mr-2">有更新时提醒我:</span>
						<el-switch class="mr-4" v-model="update.updatePush" @change="store.openUpdateReminder" active-color="#13ce66" />
						<span class="bt-link" @click="store.updateReminderDialog(update.updatePush)" v-text="'提醒方式'" />
					</div>
				</div>
			</div>
			<div v-if="!isUpgrade">
				<div class="nps_survey_banner flex items-center justify-center" :class="isNPSShow ? '' : 'mb-[2rem]'">
					<span class="text-base font-bold inline-block cursor-pointer text-primary mr-[.4rem]" @click="isNPSShow = !isNPSShow" style="vertical-align: 4px"> 点击此处{{ isNPSShow ? '折叠' : '展开' }}需求反馈 </span>
					<i class="cursor-pointer text-base" :class="isNPSShow ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'" @click="isNPSShow = !isNPSShow"></i>
				</div>
				<div class="pt-[1rem] pb-[3rem] pl-[3.1rem] pr-[3rem]" v-show="isNPSShow">
					<!-- 回答部分 -->
					<el-popover placement="top-start" width="400" popper-class="tips bg-primary text-white text-small w-[40.6rem] !p-12px leading-[20px]" trigger="focus" content="如果您在使用过程中遇到任何问题或功能不完善，请将您的问题或需求详细描述给我们，我们将尽力为您解决或完善。">
						<template #reference>
							<el-input type="textarea" :rows="5" v-model="questions" placeholder="如果您在使用过程中遇到任何问题或功能不完善，请将您的问题或需求详细描述给我们，我们将尽力为您解决或完善。"></el-input>
						</template>
					</el-popover>
					<div class="mt-[1rem]">
						<div class="my-[1rem] flex items-center">
							<span class="text-base text-secondary">是否愿意接受回访：</span>
							<el-switch size="small" v-model="form.status"></el-switch>
						</div>
						<el-form ref="formPhone" label-position="top" :model="form" :rules="rules">
							<el-form-item v-show="form.status" label="" prop="phone">
								<el-input v-model="form.phone" placeholder="请留下手机号码或邮箱"></el-input>
							</el-form-item>
						</el-form>
					</div>
					<div class="mt-[.4rem] text-small text-primary leading-[3rem]">我们特别重视您的需求反馈，我们会每周进行需求评审，希望能更好的帮到您</div>
					<div class="flex flex-col items-center p-[2rem]">
						<el-button type="primary" class="w-[12.5rem]" size="large" @click="store.submit(popupClose)">提交反馈</el-button>
					</div>
				</div>
			</div>

			<!-- 底部 -->
			<template v-if="isUpgrade">
				<div class="flex align-middle justify-center pb-10">
					<!-- 忽略版本 -->
					<el-button type="default" class="ignore-renew text-base border-none h-38px mr-50px w-50 bg-base" size="default" style="color: var(--el-base-tertiary)" round @click="store.ignoreUpdatEVersion(currentInfo.version, popupClose)">忽略本次更新</el-button>

					<!-- 立即更新 -->
					<el-button class="border-none text-base w-50 h-38px" :class="panelInfo.envUpgradeInfo?.need_env_check && !panelInfo.envUpgradeInfo?.has_env_py313 ? 'cursor-not-allowed':''" type="primary" round @click="getUpdate">立即更新</el-button>
				</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { os } from '@utils/index'
import HOME_HEADER_STORE from '@home/views/header/store'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/store/global'
import HOME_STORE from '@/views/home/store'
import { Message, useDialog, useAllTable } from '@/hooks/tools'
import { useOperate } from '@hooks/tools/table/column'
import { isDark } from '@/utils/theme-config'
import { pluginInstallDialog } from '@/public/popup'

import  BtImage  from '@components/base/bt-image'
import  BtButton  from '@components/base/bt-button'
import  BtIcon  from '@components/base/bt-icon'

const homeStore = HOME_STORE()
const { getUpdateInfoNew, downloadEnv } = homeStore
const { panelInfo: info } = storeToRefs(homeStore)
const { upgrade, currentInfo } = toRefs(info.value)
const store = HOME_HEADER_STORE()
// isUpgrade
const { panelInfo, formPhone, loading, grayscale, panelVersion, betaInfo, officialInfo, isBeta, update, isNPSShow, questions, form, rules } = storeToRefs(store)
const updateSvg = useTemplateRef('updateSvg')
const isUpgrade = computed(() => upgrade.value !== 0) // 是否需要更新
// const currentInfo = computed(() => {
// 	return isBeta.value ? betaInfo.value : officialInfo.value
// }) // 当前版本信息

const { mainHeight, mainWidth, updatePluginCheck } = useGlobalStore() // 主体高度

const versionType = computed(() => (panelInfo.value.isBeta ? '测试版' : '正式版')) // 版本类型
const popupClose = inject('popupClose', () => {}) // 关闭弹窗
const isLoading = ref(false) // 是否加载中

const showTooltip = ref(false) // 是否展示提示
const showPluginsTooltip = ref(false) // 是否展示插件提示
const openPluginList = () => {
	
const { BtTable, refresh, BtRefresh } = useAllTable({
	request: () => {
		return {data:panelInfo.value.envUpgradeInfo.plugins_check}
	},
	columns: [
		{ label: '插件名称', prop: 'title', width: 170,
		render: (row:any) => {
			const appSrc = 'soft_ico/ico-' + (row.name?.indexOf('php-') > -1 ? 'php' : row.name) + '.png'
			const title = row.title.indexOf('PHP-') > -1 ? 'PHP' : row.title
			return h('div', {
				class: 'whitespace-normal inline-flex items-center p-[2px]',
				title: `${title} ${row.local_version}`
			}, [
				h(BtImage, {
					src: appSrc,
					class: 'soft-ico-img',
					type: 'img'
				}, {
					error: () => h('img', {
						src: '/static/images/soft_ico/icon_plug.svg',
						alt: ''
					})
				}),
				h('span', `${title} ${row.local_version || ''}`)
			])
		}, },
		{ label: '等级', prop: 'level',width: 80,render: (row: any) => {
			const isMust = row.level === 'must'
			return h('span', {
				class: isMust ? 'text-primary' : 'text-secondary',
			}, isMust ? '必须更新' : '可选更新')
		} },
		{ label: '最低适配版本',width: 100, prop: 'version' },
		{ label: '备注', prop: 'tip' },
		useOperate([
			{ onClick: (row: any) => {
				updatePluginCheck.value.status = true
				updatePluginCheck.value.callback = async () => {
					await getUpdateInfoNew()
					refresh()
				}
				pluginInstallDialog({
				name: row.name,
				type: 'u',
			})
			}, title: '更新' },
		]),
	],
})
const BtUpdatePluginList = defineComponent({
	setup() {
			const isRefreshing = ref(false)
			const popupClose = inject('popupClose', () => {})
			const debouncedRefresh = useDebounceFn(async () => {
				isRefreshing.value = true
				await getUpdateInfoNew()
				if(panelInfo.value.envUpgradeInfo.plugins_check.length === 0){
					popupClose()
					return
				}
				refresh()
				Message.success('刷新成功')
				isRefreshing.value = false
			}, 100)
	return () => h('div',{class: 'p-[1.2rem]'}, [
		h('div',{class: 'flex justify-end mb-[1rem]'},h(BtButton,{disabled: isRefreshing.value,onClick:async () => {
			debouncedRefresh()
		}},[h(BtIcon,{icon: 'el-refresh', class: `${isRefreshing.value ? '!hidden' : ''}`}),h('i',{class: `svgtofont-el-loading ${isRefreshing.value ? 'animation' : '!hidden'}`})]) ),
		h(BtTable,{
			class: 'max-h-[40rem]',
		}),
	])
},
})
	useDialog({
				title: `待更新插件列表`,
				area: 76,
				component: () => BtUpdatePluginList,
			})
}
// /**
//  * @description 切换版本的更新方式
//  */
// const cutUpdateType = () => {
// 	if (!isBeta) {
// 		applyBetaDialog(updateVersion)
// 	} else {
// 		updateVersion(false) // 切换到正式版
// 	}
// }
const updateSvgRect = computed(() => {
	if (updateSvg.value) {
		return updateSvg.value.getBoundingClientRect()
	}
	return {
		top: 0,
		left: 0,
	}
})

const onOpen = async () => {
	if (!currentInfo.value) {
		isLoading.value = true
		const data = await getUpdateInfoNew() // 获取更新信息
		isLoading.value = false
		if (data?.msg) {
			Message.request(data)
			popupClose()
		}
	}
}
/**
 * @description 升级环境
 */
const updateEnv = async () => {
	if (panelInfo.value.envUpgradeInfo.env_update_running) {
		// 查看日志
		openDownloadEnvLog()
	} else {
		// 预下载环境
		const res:any = await downloadEnv()
		if(res.status){
			openDownloadEnvLog()
			getUpdateInfoNew()	// 获取更新提醒信息
		}
	}
}
/**
 * @description 打开日志
 */
const openDownloadEnvLog = async () => {
			useDialog({
				title: `正在下载环境包，请耐心等候...`,
				area: 76,
				component: () => import('./down-log.vue'),
			})
}

/**
 * @description 升级处理
 */
const getUpdate = () => {
	if(panelInfo.value.envUpgradeInfo.need_env_check && !panelInfo.value.envUpgradeInfo.has_env_py313){
		showTooltip.value = true
		const time = setTimeout(() => {
			showTooltip.value = false
			clearTimeout(time)
		},3000)
	} else if(panelInfo.value.envUpgradeInfo.plugins_hasUpdate){
		showPluginsTooltip.value = true
		const time = setTimeout(() => {
			showPluginsTooltip.value = false
			clearTimeout(time)
		},3000)
	} else {
		store.updateVersion()
	}
}

onMounted(async () => {
	await store.getUpdatePushInfo() // 获取更新提醒信息
})

onBeforeUnmount(() => {
	store.$reset()
})

defineExpose({ onOpen: onOpen })
</script>

<style lang="css" scoped>
.update-version-view :deep(.el-switch__core) {
	@apply bg-darker border-light border-1 border;
}
:deep(.el-switch.is-checked .el-switch__core) {
	@apply border border-primary bg-primary;
}
.update-back {
	/* @apply bg-center bg-no-repeat; */
	/* background: url('/static/images/update/update_back1.svg') 95% center no-repeat; */
	/* background-size: cover; */
	/* background-position-y: inherit; */
}

hr {
	@apply w-[310px] mx-auto mb-[18px] border-0 border-t border-light;
}

.update-content {
	@apply overflow-auto max-h-[18rem];
}

.update-content::-webkit-scrollbar {
	@apply w-[16px] h-[1px];
}

.update-content::-webkit-scrollbar-track {
	@apply bg-base;
}

.update-content::-webkit-scrollbar-thumb {
	@apply bg-darker rounded-extraRound;
	background-image: url('/static/images/scroll/scroll-bar-block.svg');
	/* background-size: 100% 100%;
	background-position: bottom; */
	background-repeat: no-repeat;
}

.update-content::-webkit-scrollbar-button:start {
	@apply bg-base;
	background-image: url('/static/images/scroll/scroll-bar-up.svg');
	background-size: 100%;
	background-position: center;
	background-repeat: no-repeat;
	height: 15px;
}

.update-content::-webkit-scrollbar-button:end {
	@apply bg-base;
	background-image: url('/static/images/scroll/scroll-bar-down.svg');
	background-size: 90%;
	background-position: center;
	height: 15px;
}

/* .bg-linear {
	@apply bg-gradient-to-t from-white to-transparent;
} */

.absolute-image .el-image {
	@apply absolute;
}

.update-fg-element {
	fill: var(--el-color-primary);
}
.update-bg-element {
	fill: var(--el-color-primary);
}
.updateed-bg-element {
	fill: var(--el-bg-color);
}
.ignore-renew:hover {
	@apply bg-darker;
}
</style>
