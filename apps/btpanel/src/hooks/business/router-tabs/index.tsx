import type { RouteLocationMatched, RouteRecordNameGeneric, RouteRecordRaw } from 'vue-router'

import BtRouterTabs from '@/components/business/bt-router-tabs/index.vue'
import { router } from '@/router'
import { isUndefined } from '@/utils'

// 路由选项
interface UseRouterTabsProps {
	level?: boolean // 是否只获取一级路由
	contentClass?: string // 是否继承class
	default?: () => Promise<JSX.Element> // 默认插槽
	store?: boolean
	disabled?: boolean
}

// 路由配置
export const useRouterTabs = (props: UseRouterTabsProps = {}) => {
	const routerActive: Ref<RouteRecordNameGeneric> = ref('') // 当前激活的路由
	const routerOptions: Ref<Array<RouteRecordRaw | RouteLocationMatched>> = ref([]) // 路由选项
	const { currentRoute } = router // 当前路由
	// 初始化路由
	const initRouter = () => {
		routerActive.value = currentRoute.value.name
		if (props.level) {
			routerOptions.value = currentRoute.value.matched.slice(1, 2)
		} else {
			routerOptions.value = currentRoute.value.matched[1].children
		}
	}
	initRouter()
	return {
		BtRouterTabs: (_props: any, { slots }: { slots: any }) => (
			<BtRouterTabs v-model={routerActive.value} options={routerOptions.value} contentClass={props.contentClass} store={isUndefined(props.store) ? true : props.store} disabled={isUndefined(props.disabled) ? false : props.disabled} {..._props}>
				{slots}
			</BtRouterTabs>
		),
	}
}
