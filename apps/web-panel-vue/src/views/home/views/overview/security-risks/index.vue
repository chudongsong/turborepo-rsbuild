<template>
	<div class="h-full">
		<!-- 类型 -->
		<bt-tabs class="h-full scanning-style" type="left-bg-card" v-model="repairTypeActive" @tab-click="handleChangeTab" :options="repairType" />
		<!-- QQ群 -->
		<el-tooltip effect="dark" content="点击加入“宝塔云安全中心交流群”" placement="bottom">
			<div class="box-item flex items-center">
				<span class="w-[1.4rem] h-[1.4rem] mr-1">
					<svg t="1741419396670" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4968" width="16" height="16">
						<path
							d="M506.88 139.776c-96.768 0-175.104 78.848-175.104 175.104 0 53.76 24.576 103.936 67.072 137.728l13.824 10.752-16.384 6.656C281.6 515.584 207.872 624.64 207.872 747.52v61.952c0 11.264 9.216 20.48 20.48 20.48h556.544c11.264 0 20.48-9.216 20.48-20.48V747.52c0-122.88-73.728-231.936-188.416-277.504l-16.384-6.656 13.824-10.752c43.008-33.792 67.072-83.968 67.072-137.728 1.024-96.256-77.824-175.104-174.592-175.104z m257.536 608.256v40.96H249.344v-40.96c0-141.824 115.712-257.536 257.536-257.536 142.336 0 257.536 115.712 257.536 257.536zM506.88 449.024c-73.728 0-134.144-59.904-134.144-134.144 0-73.728 59.904-134.144 134.144-134.144 73.728 0 134.144 59.904 134.144 134.144S581.12 449.024 506.88 449.024z"
							fill="var(--el-color-text-tertiary)"
							p-id="4969"></path>
						<path
							d="M292.352 205.312c-1.536 0-3.072 0-4.608 0.512-65.024 15.872-110.592 73.216-110.592 140.288 0 35.84 13.312 70.144 37.376 96.768l8.704 9.728-11.776 6.144c-78.848 40.96-127.488 121.344-127.488 210.432V716.8c0 11.264 9.216 20.48 20.48 20.48s20.48-9.216 20.48-20.48v-47.616c0-89.6 60.928-167.936 147.968-189.44h1.024c7.168-1.024 13.312-5.632 15.872-11.776v-1.024c0-1.024 0.512-1.536 0.512-2.56l0.512-1.024c0-0.512 0.512-1.024 0.512-1.536V454.656c0-0.512-0.512-1.024-0.512-1.536s-0.512-1.024-1.024-1.536l-0.512-0.512c-1.024-2.048-1.536-3.584-2.56-4.608-0.512 0-0.512-0.512-1.024-0.512-2.048-2.048-4.096-3.584-6.656-4.608-37.376-16.384-61.44-53.76-61.44-94.208 0-47.616 32.256-89.088 78.848-100.352 11.264-2.56 17.92-13.824 15.36-25.088-1.536-10.24-10.24-16.384-19.456-16.384z"
							fill="var(--el-color-text-tertiary)"
							p-id="4970"></path>
						<path d="M320.512 256c8.704-8.192 13.312-19.456 13.312-31.232-5.632 9.728-9.728 20.48-13.312 31.232z" fill="var(--el-color-text-tertiary)" p-id="4971"></path>
						<path
							d="M802.304 458.752l-11.776-6.144 8.704-9.728c24.064-26.624 37.376-60.928 37.376-96.768 0-65.024-44.032-122.368-107.008-139.264-10.752-3.072-22.528 3.584-25.6 14.848-3.072 10.752 3.584 22.528 14.848 25.088 45.056 12.288 76.288 52.736 76.288 99.328 0 40.448-24.064 77.312-60.928 94.208-2.56 1.024-4.608 2.56-6.656 4.608l-1.024 1.024c-1.024 1.024-1.536 2.56-2.56 4.608l-0.512 1.024c0 0.512-0.512 1.024-0.512 1.536s-0.512 1.024-0.512 1.024v2.048c-0.512 2.56-0.512 3.584 0 5.12 0 0.512 0 1.024 0.512 1.536v0.512c0.512 1.024 0.512 2.048 0.512 3.072v1.536c2.56 6.144 8.704 10.752 15.872 11.776h1.024c87.04 22.016 147.968 99.84 147.968 189.44V716.8c0 11.264 9.216 20.48 20.48 20.48s20.48-9.216 20.48-20.48v-47.616c0.512-89.088-48.64-169.472-126.976-210.432z"
							fill="var(--el-color-text-tertiary)"
							p-id="4972"></path>
						<path d="M692.224 251.904c-2.56-7.168-5.12-14.336-8.704-20.992 1.024 7.68 4.096 14.848 8.704 20.992z m114.688 198.144z" fill="var(--el-color-text-tertiary)" p-id="4973"></path>
					</svg>
				</span>
				<bt-link href="https://qm.qq.com/cgi-bin/qm/qr?k=hN4oLX6_LMvjYhtXQZEnTx_c6sGPQ_t3&jump_from=webapi&authKey=zeeFfBmcTI0YGllM0/owNJJrfGm/dd2J0fTjKxVMIeIikJlOeMHz/TsxqjHgO/Hb">云安全交流群</bt-link>
			</div>
		</el-tooltip>
	</div>
</template>

<script lang="tsx" setup>
import { ElBadge } from 'element-plus'
import { storeToRefs } from 'pinia'
import HOME_SECURITY_RISKS_STORE from './store'

const store = HOME_SECURITY_RISKS_STORE()
const { repairTypeActive } = storeToRefs(store)
const { tootipTotal, getScanTotal } = store
// 修复类型
const repairType = ref([
	{
		label: () => {
			return (
				<>
					<img class={`overviewLogo${repairTypeActive.value === 'overview' ? '-active' : ''}`} alt="" src={`/static/icons/logo-white.svg`} />
				</>
			)
		},
		name: 'overview',
		render: () => import('./overview/index.vue'),
	},
	{
		label: () => {
			return (
				<>
					<ElBadge value={tootipTotal.risk} color={'#ff0000'} hidden={tootipTotal.risk === 0}>
						<img alt="" src={`/static/images/home/risk${repairTypeActive.value === 'risk' ? '-active' : ''}.svg`} />
					</ElBadge>
				</>
			)
		},
		name: 'risk',
		render: () => import('./risk.vue'),
	},
	{
		label: () => {
			return (
				<>
					<ElBadge value={tootipTotal.malware} color={'#ff0000'} hidden={tootipTotal.malware === 0}>
						<img alt="" src={`/static/images/home/ware${repairTypeActive.value === 'malware' ? '-active' : ''}.svg`} />
					</ElBadge>
				</>
			)
		},
		name: 'malware',
		render: () => import('./malware.vue'),
	},
	{
		label: () => {
			return (
				<>
					<ElBadge value={tootipTotal.web} color={'#ff0000'} hidden={tootipTotal.web === 0}>
						<img alt="" src={`/static/images/home/web${repairTypeActive.value === 'web' ? '-active' : ''}.svg`} />
					</ElBadge>
				</>
			)
		},
		name: 'web',
		render: () => import('./web.vue'),
	},
	{
		label: () => {
			return (
				<>
					<ElBadge value={tootipTotal.baseline} color={'#ff0000'} hidden={tootipTotal.baseline === 0}>
						<img alt="" src={`/static/images/home/safeDetect${repairTypeActive.value === 'safeDetect' ? '-active' : ''}.svg`} />
					</ElBadge>
				</>
			)
		},
		name: 'safeDetect',
		render: () => import('./safeDetect.vue'),
	},
	{
		label: () => {
			return <img alt="" src={`/static/images/home/alarm${repairTypeActive.value === 'alarm' ? '-active' : ''}.svg`} />
		},
		name: 'alarm',
		render: () => import('./alarm.vue'),
	},
])
// 切换tab
const handleChangeTab = async (tab: any) => {}

getScanTotal()

onUnmounted(store.$reset)

defineExpose({
	onOpen: store.onOpen,
})
</script>

<style lang="sass" scoped>
:deep(.scanning-style.el-tabs.tabs-left-bg-card .is-left.el-tabs__nav)
	width: 80px !important
	.el-tabs__item
		padding: 0 26px !important
		height: 74px
		&:first-child
			height: 84px


:deep(.el-tag.repairNum)
	font-size: var(--el-font-size-extra-small)
	height: 15px
	padding: 0 4px
	position: absolute
	right: 6px
	top: 16px
.box-item
	position: absolute
	right: 64px
	top: 16px

:deep(.overviewLogo)
	filter: invert(1%) sepia(2%) saturate(40%) hue-rotate(180deg) brightness(100%) contrast(65%)

:deep(.overviewLogo-active)
	filter: invert(60%) sepia(100%) saturate(385%) hue-rotate(93deg) brightness(100%) contrast(80%)
</style>
