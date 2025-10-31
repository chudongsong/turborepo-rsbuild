<template>
	<div class="flex flex-col p-[1.2rem]">
		<div class="header-tabs" :class="{ disabled }">
			<div ref="headerChildContentRef" class="flex flex-wrap">
				<template v-for="(item, _index) in defaultOptions" :key="_index">
					<div v-if="item.show" ref="tabListRef" class="header-child-tab" :class="{ 'active-tab': modelVal === item.name, '!hidden': item?.meta?.ignore }" @click="cutTabs(item.name as string)" @mouseenter="handleMouseEnter" @mouseleave="isMouseenter = false">
						{{ item.meta?.title }}
					</div>
				</template>
			</div>
			<template v-if="$slots.right">
				<slot name="right"></slot>
			</template>
			<template v-if="!$slots.right">
				<el-popover width="580" :disabled="authType !== 'free'" :show-arrow="false" popper-style="padding: 0;border-radius: var(--el-border-radius-round);overflow: hidden;" popper-class="el-product-state-popover">
					<template #reference>
						<bt-product-state v-show="productHide && !(aliyunEcsLtd)" :is-home="true" :disable-pro="true" />
					</template>
					<component :is="HeaderPopVip" />
				</el-popover>
			</template>
			<!-- <bt-product-state v-if="!$slots.right" v-show="productHide && !(forceLtd || aliyunEcsLtd)" :is-home="false" :disable-pro="true" /> -->
		</div>
		<div v-if="showContent" class="" :class="{ 'module-ui': isDefalutContentClass, 'mt-[1.2rem]': isDefalutContentClass }">
			<template v-if="$slots.default">
				<div :class="contentClass">
					<slot />
				</div>
			</template>
			<template v-else>
				<div :class="contentClass">
					<router-view v-slot="{ Component }">
						<transition name="fade" mode="out-in" @after-leave="emits('afterLeave')">
							<component :is="Component" />
						</transition>
					</router-view>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { type RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import { defineModel, ModelRef } from 'vue'
import { useGlobalStore } from '@/store/global'
import { checkVariable } from '@/utils'
import { useResizeObserver } from '@vueuse/core'
import { menuRoute } from '@/router/hooks/router-menu'

interface Props {
	options?: RouteRecordRaw[]
	store?: boolean
	disabled: boolean
	showContent?: boolean // 是否显示内容
	contentClass?: string
}

const HeaderPopVip = defineAsyncComponent(() => import('@/views/home/views/header/pop-vip/index.vue'))

const props = withDefaults(defineProps<Props>(), {
	options: () => [], // 配置
	store: true, // 是否存储
	disabled: false, // 是否禁用
	contentClass: 'router-tabs-content', // 是否继承class
	showContent: true, // 是否显示内容
})

const emits = defineEmits<{
	(e: 'cutTab', tab: string): void // 切换tab
	(e: 'afterLeave'): void // 路由切换后
}>()

const modelVal = defineModel() as ModelRef<string> // 当前选中的tab
const { mainWidth, forceLtd, aliyunEcsLtd, payment } = useGlobalStore()
const route = useRoute() // 获取当前路由状态
const router = useRouter() // 路由实例
const defaultOptions = toRef(props.options) // tabs列表
const productHide = ref<boolean>(true) // 当主体宽度小于1300px时，隐藏产品状态
const isMouseenter = ref(false) // 是否鼠标移入
const setLeft = ref('0px') // 设置left值
const tabWidth = ref(0) // tabs宽度
const headerChildContentRef = ref<HTMLElement>() // tabs子容器
const tabListRef = ref<HTMLElement[]>() // tabs列表
const storageSizeName = `${route.path.split('/')[1] as string}_router`.toUpperCase() // 存储sizeName
const { authType } = toRefs(payment.value)

const isDefalutContentClass = computed(() => {
	return props.contentClass === 'router-tabs-content'
})

watch(
	() => route.name,
	() => {
		console.log('route.name', route.name)
		if (!isCheckRouter()) {
			const storage = localStorage.getItem(storageSizeName) || defaultOptions.value[0].name
			router.push({ name: storage })
			setStorage(storage as string)
			modelVal.value = storage as string
		} else {
			setStorage(route.name as string)
			modelVal.value = route.name as string
		}
	}
)

/**
 * @description 切换tabs切换组件
 * @param {string} tab 当前tabs的name
 */
const cutTabs = (tab: string, isIgnore: boolean = false) => {
	if (props.disabled) return
	if (modelVal.value === tab && !isIgnore) return
	setStorage(tab) // 设置storageName
	modelVal.value = tab
	router.push({ name: tab })
	emits('cutTab', tab)
}

/**
 * @description 鼠标移入事件
 * @param {any} e 事件对象
 */
const handleMouseEnter = (e: MouseEvent) => {
	const left = (e.target as HTMLElement).offsetLeft // 获取当前元素的位置
	const width = (e.target as HTMLElement).offsetWidth // 获取当前元素的宽度
	setLeft.value = `${left + width - 22}px`
	isMouseenter.value = true
}

// 监听tabs宽度, 当tabs宽度大于mainWidth-250时，隐藏支付状态栏
const resizeTabsWidth = useResizeObserver(headerChildContentRef, entries => {
	const entry = entries[0]
	const { width } = entry.contentRect
	tabWidth.value = width
	productHide.value = mainWidth.value - 320 >= tabWidth.value
})

// 设置storageName
const setStorage = (tab: string) => {
	localStorage.setItem(storageSizeName, tab)
}

// 判断是否是store
const isCheckRouter = () => {
	const pathList = route.path.split('/')
	if (pathList.length > 2 && pathList[2] != '') return true
	return false
}

// 设置tabs页面
const setTabsPage = (tabsNames: string, isStorage: boolean = true, isPush: boolean = true) => {
	modelVal.value = tabsNames
	if (isStorage) setStorage(tabsNames)
	if (route.name === tabsNames) return
	if (isPush) router.push({ name: tabsNames })
}

watch(
	() => menuRoute.value,
	val => {
		const currentRoute = val.find(item => route.path.indexOf(item.path) !== -1) as any
		if (currentRoute?.children && Array.isArray(currentRoute.children)) {
			defaultOptions.value.forEach((item: any) => {
				const currentItem = currentRoute.children.find((child: any) => item.path === child.name)
				item.show = currentItem ? currentItem.show : true
			})
		}
		if (!defaultOptions.value.find((item: any) => item.name === route.name)?.show) {
			const showList = defaultOptions.value.filter((item: any) => item.show) as any
			if (showList && showList.length) setTabsPage(showList[0].name)
		}
	},
	{ immediate: true }
)
// 监听主体宽度，当主体宽度变化时，重新计算tabs宽度
watch(mainWidth, () => {
	productHide.value = mainWidth.value - 320 >= tabWidth.value
})

onMounted(() => {
	const storage = localStorage.getItem(storageSizeName)
	if (!defaultOptions.value.length) defaultOptions.value = checkVariable(route.matched[1]?.children, 'array', []) as RouteRecordRaw[] // tabs列表
	// 若为邮局，手动给每个tabs添加show属性
	if (route.matched[1]?.path === '/mail') {
		defaultOptions.value.forEach((item: any) => {
			item.show = true
		})
	}
	// 若为多用户管理，手动给每个tabs添加show属性
	if (route.matched[1]?.path === '/vhost') {
		defaultOptions.value.forEach((item: any) => {
			item.show = true
		})
	}
	// 判断是否为二级路由
	if (props.store) {
		if (isCheckRouter()) return setTabsPage(route.name as string) // 如果是二级路由，直接设置tabs页面
		return setTabsPage(storage || (defaultOptions.value[0].name as string)) // 如果不是二级路由，设置storageName
	}
})

onUnmounted(() => {
	resizeTabsWidth.stop()
})
</script>

<style lang="css" scoped>
.header-tabs {
	@apply h-[fit-content] w-full flex items-center block rounded-extraLarge relative justify-between;
	font-family: 'PingFang SC', 'Microsoft YaHei', 'Arial', 'sans-serif';
	background-color: rgba(var(--el-color-white-rgb), var(--bt-main-content-opacity));
	box-shadow: 0 0 6px 0 rgba(var(--bt-main-shadow-color), var(--bt-main-shadow-opacity));
}

.header-child-tab {
	@apply inline-block text-secondary px-[2.2rem] h-[5.4rem] leading-[5.4rem] rounded-extraLarge text-base cursor-pointer;
}

.header-child-tab:hover,
.header-child-tab.active-tab {
	@apply relative text-primary bg-[var(--bt-layout-active-color)];
	background-color: rgba(var(--bt-layout-active-color-rgb), var(--bt-main-content-opacity))
}

.header-child-tab.active-tab {
	@apply font-bold;
}

.active-tab::after {
	@apply content-[''] left-[50%] bottom-0 absolute block -ml-[10%] w-[20%] h-[0.2rem] bg-primary transition-all-[0.3s];
}

.router-tabs-content {
	@apply relative rounded-medium;
	font-family:
		PingFang SC,
		HarmonyOS_Medium,
		Helvetica Neue,
		Microsoft YaHei,
		sans-serif !important;
}
</style>
