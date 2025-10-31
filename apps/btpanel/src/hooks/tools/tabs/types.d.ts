import type { TabsOptionsProps } from '@/components/navigation/bt-tabs/types';
// hooks 参数
export interface UseTabsProps {
	type: 'card' | 'bg-card' | 'left-bg-card';
	options: TabsOptionsProps[];
	value?: Ref<string>;
}
