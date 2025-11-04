<!--  -->
<template>
	<div class="flex flex-col">
		<bt-tabs type="card" v-model="tabActive" @change="handleClickTab">
			<el-tab-pane label="配置文件列表" name="config"></el-tab-pane>
			<el-tab-pane label="网站备份列表" name="site" :lazy="true"></el-tab-pane>
		</bt-tabs>

		<div class="py-[20px]">
			<bt-table-group>
				<template #header-left>
					<div class="flex items-center" v-if="tabActive === 'site'">
						已备份的站点
						<el-select v-model="siteName" class="ml-[20px] !w-[16rem]" @change="getListBySite">
							<el-option v-for="(item, index) in siteOptions" :key="index" :value="item" :label="item"></el-option>
						</el-select>
					</div>
					<el-button v-else type="primary" @click="uploadFileEvent">导入配置文件</el-button>
				</template>
				<template #header-right>
					<!-- <bt-table-refresh :refresh=""/> -->
				</template>
				<template #content>
					<bt-table v-bt-loading="tableLoading" v-bt-loading:title="'正在加载中，请稍后...'" :column="tableColumns" :data="tableData" />
				</template>
				<template #footer-left>
					<bt-help v-if="tabActive === 'config'" :options="[{ content: '执行恢复时，如果网站已经存在将不会进行恢复' }]" class="ml-[20px]"></bt-help>
				</template>
			</bt-table-group>
		</div>
	</div>
</template>

<script setup lang="tsx">
import BtDivider from '@/components/base/bt-divider/index.vue'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { formatTime } from '@/utils'
import { deleteFile } from '@api/global'
import { getBackupListBySite, getSiteBackupList, getSiteList, recoverSites } from '@api/site'

const Message = useMessage() // 消息提示
// tab菜单
const tabActive = ref('config')
const tableLoading = ref(false) // 表格loading
const tableColumns = ref([
	{
		label: '文件名',
		prop: 'name',
	},
	{
		label: '文件路径',
		prop: 'filename',
	},
	{
		label: '文件大小',
		prop: 'size',
	},
	{
		label: '备份时间',
		render: (row: any) => {
			return h('span', formatTime(row.time))
		},
	},
	{
		label: '操作',
		align: 'right',
		render: (row: any) => {
			return (
				<div>
					<span
						class="bt-link"
						onClick={() => {
							recoverSitesEvent(row)
						}}>
						恢复
					</span>
					<BtDivider class={tabActive.value === 'config' ? '' : '!hidden'} />
					<span
						class={'bt-link ' + (tabActive.value === 'config' ? '' : 'hidden')}
						onClick={() => {
							deleteEvent(row)
						}}>
						删除
					</span>
				</div>
			)
		},
	},
])
const tableData = ref<any>([])
const siteName = ref()
const siteOptions = ref<any>([])

const handleClickTab = (name: string) => {
	tableData.value = []
	if (name === 'config') {
		getConfigList()
	} else {
		getSiteListData()
	}
}

/**
 * @description 上传文件
 */
const uploadFileEvent = () => {
	useDialog({
		isAsync: true,
		component: () => import('./upload-file.vue'),
		title: '上传文件到',
		area: 80,
		compData: { refreshEvent: getConfigList, path: '/www/server/site_backup' },
		btn: ['开始上传', '取消'],
	})
}

/**
 * @description 恢复配置文件
 * @param row
 */
const recoverSitesEvent = async (row: any) => {
	await useConfirm({
		title: '恢复配置文件',
		icon: 'warning-filled',
		content: `是否将配置文件【${row.name}】恢复至网站中?`,
	})
	let params: any = {
		file_name: row.name,
		force_names: JSON.stringify([siteName.value]),
	}
	if (tabActive.value !== 'site') {
		delete params.force_names
	}
	useDataHandle({
		loading: '正在恢复，请稍后...',
		request: recoverSites(params),
		message: true,
	})
}

/**
 * @description 删除配置文件
 */
const deleteEvent = async (row: any) => {
	await useConfirm({
		title: '删除配置文件',
		icon: 'warning-filled',
		content: `是否删除配置文件【${row.name}】?`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除配置文件，请稍后...',
		request: deleteFile({ path: row.filename, type: 'file' }),
		message: true,
	})
	if (res.status) getConfigList()
}

/**
 * @description 获取配置文件列表
 */
const getConfigList = async () => {
	useDataHandle({
		loading: tableLoading,
		request: getSiteBackupList(),
		data: [Array, tableData],
	})
}

/**
 * @description 已备份站点
 */
const getListBySite = async () => {
	if (!siteName.value) return
	useDataHandle({
		loading: tableLoading,
		request: getBackupListBySite({ site_name: siteName.value }),
		data: [Array, tableData],
	})
}

const getSiteListData = async () => {
	await useDataHandle({
		loading: tableLoading,
		request: getSiteList(),
		data: [Array, siteOptions],
	})
	siteName.value = siteOptions.value[0] || ''
	getListBySite()
}

onMounted(() => {
	getConfigList()
})
</script>
