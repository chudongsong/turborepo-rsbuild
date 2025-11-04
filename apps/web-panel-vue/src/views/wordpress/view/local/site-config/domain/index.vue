<template>
	<div class="">
		<div class="flex items-end">
			<el-popover ref="popover" placement="top-start" width="36rem" popper-class="green-tips-popover !p-0 !border-none" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
				<template #default>
					<div class="!p-[12px] bg-primary text-white leading-[2.4rem]">
						如需绑定外网，请换行填写，每行一个域名，默认为80端口
						<br />
						IP地址格式：192.168.1.199
						<br />
						泛解析添加方法 *.domain.com
						<br />
						如另加端口格式为 www.domain.com:88
					</div>
				</template>
				<template #reference>
					<bt-input
						v-model="domain"
						type="textarea"
						resize="none"
						:rows="4"
						width="42rem"
						@focus="popoverFocus = true"
						:placeholder="'如需绑定外网，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'"
						class="domain-textarea"></bt-input>
				</template>
			</el-popover>
			<el-button type="primary" class="absolute" style="right: 4rem; top: 5.5rem" @click="onAddDomain"> 添加 </el-button>
		</div>
		<bt-table-group>
			<template #content>
				<BtTable :max-height="440" />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="tsx">
import { useBatch, useConfirm, useRefreshList, useTable } from '@/hooks/tools'
import useWPLocalConfigStore from '../useStore'
import { delDomain, delMultDomain, getDomainList, onAddDomain } from '../useController'
import { useCheckbox } from '@/hooks/tools/table/column'
import BtLink from '@/components/base/bt-link'

const { isRefreshDomain, domain } = storeToRefs(useWPLocalConfigStore())

const popoverFocus = ref(false) // 域名popover

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'delete',
		event: async (batchCofirm, nextAll, selectedList, options) => {
			delMultDomain(selectedList.value)
		},
	},
])

const { BtTable, BtBatch, config } = useTable({
	request: getDomainList,
	columns: [
		useCheckbox(),
		{
			label: '域名',
			prop: 'name',
			width: 400,
			render: (row: any) => {
				return (
					<div class="truncate">
						<BtLink href={`http://${row.name}:${row.port}`} target="_blank">
							{row.name}
						</BtLink>
					</div>
				)
			},
		},
		{
			label: '端口',
			prop: 'port',
		},
		{
			label: '操作',
			align: 'right',
			render: (row: any) => {
				// 当只有一个域名时,且外网映射为开启状态时显示不可操作
				if (config.data.length === 1) return <span>不可操作</span>
				return h(
					'span',
					{
						class: 'cursor-pointer bt-link',
						onClick: async () => {
							await useConfirm({
								title: `删除域名【${row.name}】`,
								content: '您确定要删除此域名吗？',
								onConfirm: async () => {
									await delDomain(row)
								},
							})
						},
					},
					'删除'
				)
			},
		},
	],
	extension: [useTableBatch, useRefreshList(isRefreshDomain)],
})
</script>

<style lang="css">
.domain-textarea .el-textarea__inner {
	padding: 1rem;
}
</style>
