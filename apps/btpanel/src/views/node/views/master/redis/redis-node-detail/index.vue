<template>
	<div class="p-[2rem] redis-node-detail-page">
		<BtTabs />
	</div>
</template>

<script lang="tsx" setup>
import { useTabs } from '@/hooks/tools'
import { getNodeDetailSections } from '../useController'

interface Props {
	compData: {
		rowData: {
			master_detail: {}
		}
		type: string
	}
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		rowData: {
			master_detail: {},
		},
		type: 'master',
	}),
})
console.log('props.compData', props.compData)
const detailInfo = props.compData.rowData || {}
const type = props.compData.type as 'master' | 'slave'
const sections = getNodeDetailSections(detailInfo, type)

// tabs 配置
const tabActive = ref(sections[0]?.name || '')
console.log('tabActive', tabActive)
const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: sections.map(section => ({
		label: section.label,
		name: section.name,
		render: () => (
			<div class="grid grid-cols-2 gap-x-[24px] gap-y-[16px]">
				{section.items.map((item: any, idx) => (
					<div class="bg-lighter rounded px-[20px] py-[16px] flex items-center" key={idx}>
						<span class="text-secondary text-base font-bold">
							{item.label}{' '}
							{item?.tooltip && (
								<el-tooltip content={item?.tooltip} placement="top">
									<span class="ml-4px bt-ico-ask font-normal border-color-darkSecondary">?</span>
								</el-tooltip>
							)}
						</span>
						<span class="ml-auto text-base">{item.value}</span>
					</div>
				))}
			</div>
		),
	})),
})
</script>

<style lang="scss" scoped>
.redis-node-detail-page :deep(.bt-ico-ask) {
	width: 14px;
	height: 14px;
	line-height: 12px;
	font-size: var(--el-font-size-small);
	color: var(--el-base-tertiary);
	border: 1px solid var(--el-base-tertiary);
	&:hover {
		background-color: transparent !important;
	}
}
</style>
