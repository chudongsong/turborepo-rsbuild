<template>
	<div>
		<el-dropdown @command="handleCommand">
			<el-button type="default">
				同步数据库
				<i class="svgtofont-el-arrow-down ml-4px"></i>
			</el-button>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item v-for="(item, index) in dropList" :command="item.name" :key="index">
						<div class="inline-block flex flex-col py-[1.2rem] mb-[0.8rem]">
							<span class="text-secondary text-base mb-[8px]">{{ item.label }}</span>
							<span class="text-tertiary text-small leading-1.8rem" v-html="item.description"></span>
						</div>
					</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<!-- 从服务器获取 -->
		<bt-dialog title="从服务器获取" v-model="syncPanelView" :area="46" @confirm="syncToPanel" showFooter>
			<div class="p-[16px]">
				<el-form ref="syncFormRef" :model="syncForm">
					<el-form-item label="数据库位置">
						<el-select v-model="addressValue" class="!w-[28rem]">
							<el-option v-for="(item, index) in addressOptions" :key="index" :value="item.id" :label="item.ps + '（服务器地址：' + item.db_host + '）'"></el-option>
						</el-select>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { getDatabaseStore } from '@database/useStore'
import { syncDataToPanel, syncModuleDataToPanel } from '@api/database'
import { useDataHandle, Message, useHandleError } from '@hooks/tools'

import { refreshServerList, syncDatabaseEvent } from '@database/useMethod'

interface Props {
	compData: ServerItem[]
}

interface ServerItem {
	id: number
	db_host: string
	ps: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => [],
})

const {
	refs: { tabActive, isRefreshClassList },
	refreshTableList,
} = getDatabaseStore()

const addressOptions = ref(props.compData) // 服务器列表
const addressValue = ref<string | number>(addressOptions.value[0]?.id || '') //数据库位置

const syncForm = reactive({}) // 表单数据
const syncFormRef = ref() // 表单实例
const syncPanelView = ref<boolean>(false) // 从服务器获取弹窗

// 下拉菜单列表
const dropList = [
	{
		label: '从面板同步到服务器',
		name: 'SyncToServer',
		description: '将面板的数据库同步到本地服务器中',
	},
	{
		label: '从服务器同步到面板',
		name: 'SyncToPanel',
		description: '从服务器获取所有数据库，并同步到面板中<br>（数据库密码无法同步，需在面板重新配置）',
	},
]

/**
 * @description 处理下拉菜单点击事件
 * @param command 命令
 */
const handleCommand = async (command: string) => {
	if (command === 'SyncToServer') {
		// 同步所有数据库
		syncToServer()
	} else {
		// 打开从数据库同步到面板的弹窗
		const res = await refreshServerList()
		addressValue.value = res[0].id
		addressOptions.value = res as ServerItem[]
		syncPanelView.value = true
	}
}
/**
 * @description 同步所有数据库
 */
const syncToServer = async () => {
	const loading = Message.load('正在同步...')
	try {
		const res = await syncDatabaseEvent() // 公共方法
		Message.request(res)
		refreshTableList() // 刷新表格
	} catch (error) {
		useHandleError(error, 'syncToServer')
	} finally {
		loading.close()
	}
}

/**
 * @description 打开-从服务器获取所有数据库
 */
const syncToPanel = async () => {
	await syncFormRef.value.validate()
	let params = { sid: Number(addressValue.value) }
	await useDataHandle({
		loading: '正在获取数据库,请稍候...',
		request: tabActive.value === 'mysql' ? syncDataToPanel(params) : syncModuleDataToPanel({ data: JSON.stringify(params) }, tabActive.value),
		message: true,
	})
	isRefreshClassList.value = true
	setTimeout(() => {
		refreshTableList() // 刷新表格,延迟1秒
	}, 1000)
}
</script>

<style scoped></style>
