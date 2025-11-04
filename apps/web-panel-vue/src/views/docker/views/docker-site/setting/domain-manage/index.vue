<template>
	<div class="">
		<div class="flex items-end mb-[12px]">
			<el-popover ref="popover" placement="top-start" width="41rem" popper-class="green-tips-popover !p-0 !border-none" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
				<template #default>
					<div class="!p-[12px] bg-primary text-white">
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
					<bt-input v-model="domainData" type="textarea" resize="none" :rows="4" width="42rem" @focus="popoverFocus = true" :placeholder="'如需绑定外网，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'"></bt-input>
				</template>
			</el-popover>
			<el-button type="primary" class="absolute" style="right: 4rem; top: 5rem" @click="addDomain">添加</el-button>
		</div>
		<bt-table-group>
			<template #header-right>
				<!-- 测试版功能 -->
				<div>
					HTTPS端口：{{ port }}
					<span class="bt-link cursor-pointer" v-show="typeof port === 'number'" @click="openUpdatePortView">更换</span>
				</div>
			</template>
			<template #content>
				<BtTable :max-height="440" />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
		</bt-table-group>
		<ul class="mt-[.8rem] leading-8 text-small list-disc ml-2rem">
			<li>建议所有域名都使用默认的80端口</li>
		</ul>
	</div>
</template>

<script setup lang="tsx">
import BtInputNumber from '@/components/form/bt-input-number'
import { useBatch, useDialog, useForm, useRefreshList, useTable } from '@/hooks/tools'
import { FormItemCustom } from '@/hooks/tools/form/form-item'
import { defaultVerify, portVerify } from '@/utils'
import { addDomain, delDomain, delMultDomain, domainData, initDomain, popoverFocus, setPort } from './useController'
import { useSiteDomainStore } from './useStore'
import { useCheckbox } from '@/hooks/tools/table/column'
import BtLink from '@/components/base/bt-link'

const { isRefreshDomain, port } = useSiteDomainStore()

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
	request: initDomain,
	columns: [
		useCheckbox(),
		{
			label: '域名',
			prop: 'name',
			width: 400,
			render: (row: any) => {
				return (
					<div class="truncate">
						<BtLink class="bt-link" href={`http://${row.name}:${row.port}`} target="_blank">
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
						onClick: () => {
							delDomain(row)
						},
					},
					'删除'
				)
			},
		},
	],
	extension: [useTableBatch, useRefreshList(isRefreshDomain)],
})

/**
 * @description 更换端口
 */
const openUpdatePortView = () => {
	const { BtForm, submit } = useForm({
		data: {
			port: port.value,
		},
		options: (formData: Ref<AnyObject>) =>
			computed(() => [
				FormItemCustom(
					'HTTPS端口',
					() => {
						return <BtInputNumber v-model={formData.value.port}></BtInputNumber>
					},
					'port',
					{
						attrs: {
							min: 1,
							max: 65535,
						},
						rules: [defaultVerify({ message: '请输入端口号', trigger: 'blur' }), portVerify()],
					}
				),
			]),
		submit: setPort,
	})
	useDialog({
		title: `更换端口`,
		area: 42,
		showFooter: true,
		component: () => <BtForm class="p-2rem" />,
		onConfirm: submit,
	})
}
</script>
