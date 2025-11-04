import { isUndefined } from '@/utils'
import BtTabs from '@/components/navigation/bt-tabs'
import type { UseTabsProps } from './types'

/**
 * @description 标签页
 * @param {UseTabsProps} props.type 必传 card | bg-card | left-bg-card 标签页类型
 * @param {UseTabsProps} props.options 必传 TabsOptionsProps[] 标签页选项数组
 * @param {UseTabsProps} props.value 可选 Ref值 标签页选中值
 * @return {Object} 返回值
 */
export const useTabs = (props: UseTabsProps) => {
	const tabs = !isUndefined(props.value) ? props.value : ref(props.options[0]?.name)
	const tabsOptions = shallowRef(props.options)
	const type = ref(props.type) as Ref<'card' | 'bg-card' | 'left-bg-card'>
	const refs = ref()
	return {
		BtTabs: defineComponent({
			setup() {
				return () => <BtTabs ref={refs} v-model={tabs.value} type={type.value} options={tabsOptions.value} />
			},
		}),
		tabs,
		tabsRefs: () => refs.value.getRef(),
	}
}
