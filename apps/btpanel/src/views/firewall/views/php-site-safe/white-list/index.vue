<template>
	<div class="flex w-full p-[2rem]">
		<el-tabs tab-position="left" v-model="whiteForm.type" @tab-click="typeToggle" class="w-[8%] mr-[2.4rem]">
			<el-tab-pane label="URL白名单" name="url"></el-tab-pane>
			<el-tab-pane label="IP白名单" name="ip"></el-tab-pane>
		</el-tabs>
		<div class="w-[86%] flex-1">
			<bt-table-group class="flex-1">
				<template #header-left>
					<div class="flex items-center" v-show="whiteForm.type === 'url'">
						<bt-input v-model="whiteForm.url" width="30rem" placeholder="URL地址，例如：/admin/update" />
					</div>
					<div class="flex items-center" v-show="whiteForm.type === 'ip'">
						<bt-input v-model="whiteForm.startIP" width="25rem" :placeholder="`起始IP地址`" />
						<bt-input v-model="whiteForm.endIP" class="ml-[0.8rem]" width="25rem" :placeholder="`结束IP地址`" />
					</div>
					<el-button type="primary" title="添加" @click="addWhiteList" class="ml-[0.8rem]"> 添加 </el-button>
					<el-button @click="clearAllWhite">清空</el-button>
				</template>
				<template #content>
					<bt-table :column="whiteForm.type === 'url' ? urlColumn : ipColumn" :data="whiteForm.type === 'url' ? urlList : ipList" v-bt-loading="viewLoading" v-bt-loading:title="'正在加载列表，请稍后...'" />
				</template>
				<template #footer-left>
					<bt-help list-style="disc" :options="whiteForm.type === 'ip' ? whiteForm.ipHelp : whiteForm.urlHelp" class="mt-[2rem] ml-[2rem]"></bt-help>
				</template>
			</bt-table-group>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { addPhpIpWhite, addUrlWhite, clearWhite, delIpWhite, delUrlWhite, getPhpWhiteList } from '@/api/firewall'
import { useOperate } from '@/hooks/tools/table/column'
import { Message } from '@hooks/tools'
import { useConfirm } from '@hooks/tools'
import { useDataHandle } from '@hooks/tools'
import { useGlobalStore } from '@store/global'
import { checkIp } from '@utils/index'

const { mainHeight } = useGlobalStore()

const viewLoading = shallowRef(false) // 表格loading
const ipList = ref([]) // ip白名单列表
const urlList = ref([]) // url白名单列表

// 白名单表单
const whiteForm = shallowReactive({
	type: 'url', // 类型
	url: '', // url地址
	startIP: '', // 起始IP
	endIP: '', // 结束IP
	urlHelp: [
		{
			content: '例子1: bt.cn/admin/admin.php?system=abc 添加地址: ^/admin/admin.php',
		},
		{
			content: '例子2: bt.cn/admin/1 1 为可变 1-99 添加地址为: ^/admin/[1-99]',
		},
	],
	ipHelp: [{ content: '添加某个IP：起始IP为192.168.10.6 结束IP为192.168.10.6' }, { content: '添加IP段：起始IP为192.168.1.1 结束IP为192.168.1.254' }],
})

//切换类型
const typeToggle = (tab: any): void => {
	whiteForm.type = tab.paneName
	getWhiteList()
}

/**
 * @description 添加白名单
 */
const addWhiteList = async () => {
	switch (whiteForm.type) {
		case 'url':
			if (!whiteForm.url) return Message.error('请输入URL地址')
			await useDataHandle({
				loading: '正在添加，请稍后...',
				request: addUrlWhite({ url_rule: whiteForm.url }),
				message: true,
			})
			whiteForm.url = ''
			break
		case 'ip':
			if (!checkIp(whiteForm.startIP) || !checkIp(whiteForm.endIP)) {
				return Message.error('IP地址格式不正确')
			}
			await useDataHandle({
				loading: '正在添加，请稍后...',
				request: addPhpIpWhite({
					start_ip: whiteForm.startIP,
					end_ip: whiteForm.endIP,
				}),
				message: true,
			})
			whiteForm.startIP = ''
			whiteForm.endIP = ''
			break
	}
	getWhiteList()
}

/**
 * @description 清空白名单
 */
const clearAllWhite = async (): Promise<void> => {
	await useConfirm({
		title: '清空白名单',
		content: '是否清空白名单？',
		icon: 'warning-filled',
	})
	await useDataHandle({
		loading: '正在清空，请稍后...',
		request: clearWhite({ type: whiteForm.type + '_white' }),
		message: true,
		success: (res: any) => {
			if (res.status) getWhiteList()
		},
	})
}

/**
 * @description 获取ip/url白名单表格数据
 */
const getWhiteList = async (): Promise<void> => {
	await useDataHandle({
		loading: viewLoading,
		request: getPhpWhiteList(),
		data: {
			ip_white: [Array, ipList],
			url_white: [Array, urlList],
		},
	})
}

/**
 * @description 删除操作
 * @param row
 * @param index
 */
const deleteEvent = async (row: any, index: number) => {
	const isUrl = whiteForm.type === 'url'
	if (!isUrl) {
		// 获取index
		index = ipList.value.findIndex((item: any) => item.at(0) === row.at(0) && item.at(1) === row.at(1))
	} else {
		index -= 1
	}
	await useDataHandle({
		loading: '正在删除，请稍后...',
		request: isUrl ? delUrlWhite({ index }) : delIpWhite({ index }),
		message: true,
		success: (res: any) => {
			if (res.status) getWhiteList()
		},
	})
}

// ip表格列
const ipColumn = [{ label: '起始IP', render: (row: any) => h('span', row[0]) }, { label: '结束IP', render: (row: any) => h('span', row[1]) }, useOperate([{ onClick: deleteEvent, title: '删除' }])]

// url表格列
const urlColumn = [{ label: 'URL', render: (row: string) => h('span', row) }, useOperate([{ onClick: deleteEvent, title: '删除' }])]

onMounted(() => getWhiteList())
</script>

<style lang="css" scoped>
:deep(.el-tabs__content) {
	display: none;
}
</style>
