<template>
	<div>
		<bt-tabs type="left-bg-card" class="h-full" v-model="tabActive" @tab-click="handleClickTab">
			<el-tab-pane label="JDK管理" name="jdkSettings" :lazy="true" class="overflow-y-auto">
				<bt-table-group>
					<template #header-left>
						<div class="flex items-center">
							<el-popover placement="bottom" width="380" trigger="click" v-model:visible="popoverVisible" popper-class="white-tips-popover">
								<template #default>
									<div class="flex items-center">
										jdk路径:
										<bt-input-icon v-model="jdkPath" placeholder="请输入JDK路径" icon="el-folder-opened" @icon-click="onPathChange" class="!w-[20rem] mx-[12px]" width="20rem" />
										<el-button type="primary" @click="addJdk">添加</el-button>
									</div>
								</template>
								<template #reference>
									<el-button type="primary">添加自定义JDK</el-button>
								</template>
							</el-popover>

							<div class="flex items-center mx-[12px]">
								<span class="mr-[4px]">命令行版本</span>
								<el-select class="!w-[14rem]" v-model="currentVersion" @change="setJdkLin">
									<el-option v-for="item in jdkLinVersion" :key="item.value" :label="item.label" :value="item.value"> </el-option>
								</el-select>
							</div>
						</div>
					</template>
					<template #header-right>
						<bt-table-refresh @refresh="getInfo" />
					</template>
					<template #content>
						<bt-table height="440" :column="tableColumns" :data="tableData" v-bt-loading="tableLoading" />
					</template>
				</bt-table-group>
			</el-tab-pane>
			<el-tab-pane label="Tomcat管理" name="newTomCat" :lazy="true">
				<TomcatManage></TomcatManage>
			</el-tab-pane>
		</bt-tabs>
		<bt-dialog title="安装tomcat" v-model="installPopup" :area="36" showFooter @confirm="handleConfirmInstall('install')">
			<div class="p-[20px] flex flex-col">
				<div class="flex items-center text-base">
					<i class="svgtofont-el-warning-filled text-warning !text-titleLarge mr-[12px]"></i>
					是否安装Tomcat？
				</div>
				<div class="flex items-center ml-[40px]">
					jdk版本：
					<el-select class="!w-[16rem] ml-[12px]" v-model="jdkTomcatVersion" :empty-values="[null, undefined]">
						<el-option label="默认版本" value=""></el-option>
						<el-option v-for="item in jdkTomcatList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</div>
			</div>
		</bt-dialog>

		<bt-dialog title="安装信息" v-model="logPopup" :area="[50, 36]" @cancel="() => (logsMsg = '正在请求安装...')">
			<div class="bg-darkPrimary p-[12px] h-full text-white overflow-auto logMsg">
				<pre v-html="logsMsg" class="whitespace-pre-wrap"></pre>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import BtTableStatus from '@/components/extension/bt-table-status'
import { openPathEvent } from '@table/event'
import { addLocalJdk, delLocalJdk, installNewJdk, setJdkEnvironment, getJavaInfo, installNewTomcat } from '@api/site'
import { Socket } from '@/hooks/tools/socket'
import { msgBoxDialog, fileSelectionDialog } from '@/public'
import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { tabActive } from './useController'
import TomcatManage from './tomcat-manage/index.vue'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const Message = useMessage() // 消息提示
const emit = defineEmits(['close'])

const jdkPath = ref('') // JDK路径
const currentVersion = ref('') // 当前版本
const popoverVisible = ref(false) // 弹窗显示隐藏
const jdkLinVersion = ref<any>([]) // JDK命令行版本列表
const jdkTomcatList = ref<any>([]) // JDK命令行版本列表
const tomcatList = ref<any>([])
const installPopup = ref(false) // 安装弹窗
const jdkTomcatVersion = ref('') // 安装Tomcat版本

const tableData = ref([]) // 响应式数据
const tableLoading = ref(false) // 响应式数据

const logPopup = ref(false) // 弹窗
const logsMsg = ref('正在请求安装...') // 弹窗内容

let useSocket: Socket | null = null

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: jdkPath.value,
		change: path => {
			jdkPath.value = path
			setTimeout(() => {
				popoverVisible.value = true
			}, 0)
		},
	})
}

/**
 * @description 添加JDK
 */
const addJdk = async () => {
	try {
		const res = await addLocalJdk({ data: JSON.stringify({ jdk: jdkPath.value }) })
		Message.request(res)
		res.status && (popoverVisible.value = false)
		// getLocalJdkVersionEvent()
		getInfo()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 安装JDK
 * @param row
 */
const installJdkEvent = async (row: any) => {
	try {
		// 在tableData中改变当前行的operation为3
		tableData.value.find((item: any) => {
			if (item.name === row.name) {
				item.operation = 3
			}
		})
		const res = await installNewJdk({ version: row.name })
		Message.request(res)

		if (res.status) msgBoxDialog()
		// getLocalJdkVersionEvent()
		getInfo()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置JDK环境
 */
const setJdkLin = async () => {
	try {
		const res = await setJdkEnvironment({ name: currentVersion.value })
		if (res?.status) {
			Message.request(res)
		} else {
			Message.error(typeof res === 'string' ? res : res.msg)
		}
	} catch (error) {
		console.log(error)
	}
}

const delJdk = async (row: any) => {
	await useConfirm({
		title: '删除jdk',
		isHtml: true,
		content: `是否删除【 ${row.name}】，<span class="text-danger">此操作将会删除该JDK目录下的所有文件，请确保该JDK未被使用</span>，是否继续操作？`,
	})
	useDataHandle({
		loading: '正在删除，请稍后...',
		request: delLocalJdk({ data: JSON.stringify({ jdk: row.path }) }),
		success: getInfo,
	})
}

const handleClickTab = (tab: any) => {
	if (tab.hasOwnProperty('props')) {
		tabActive.value = tab.props.name
	} else {
		tabActive.value = tab.name
	}
	getInfo()
}

const currentItem = ref<any>({}) // 当前操作的item

/**
 * @description 安装Tomcat
 */
const handleConfirmInstall = async (type: string) => {
	try {
		const res = await installNewTomcat({
			java_path: jdkTomcatVersion.value,
			version: currentItem.value.name.replace('Tomcat', ''),
		})
		if (res.status) msgBoxDialog()
		else Message.error(res.msg)
		installPopup.value = false
	} catch (error) {
		console.log(error)
	}
}

const tableColumns = ref<any>([
	{
		label: 'JDK版本',
		prop: 'name',
		width: 100,
	},
	{
		label: 'JDK地址',
		render: (row: any) => {
			// 当operation为2 只显示地址，不可跳转
			// operation为1 显示地址并可跳转
			if (row.operation === 2) {
				return <span class="truncate">{row.path}</span>
			} else {
				return (
					<span
						class="truncate bt-link "
						onClick={() => {
							openPathEvent(row)
							emit('close')
						}}>
						{row.path}
					</span>
				)
			}
		},
	},
	{
		label: '操作',
		align: 'right',
		width: 136,
		render: (row: any) => {
			// 当operation为2 显示为不可操作
			// 当operation为3 显示为正在安装
			// 当operation为0 显示为安装
			// 当operation为1 显示为卸载
			switch (row.operation) {
				case 0:
					return (
						<span
							class=" bt-link"
							onClick={() => {
								installJdkEvent(row)
							}}>
							安装
						</span>
					)
				case 1:
					return (
						<span
							class="bt-danger"
							onClick={() => {
								delJdk(row)
							}}>
							删除
						</span>
					)
				case 2:
					return <span>不可操作</span>
				case 3:
					return (
						<span
							class="bt-link"
							onClick={() => {
								getInfo()
							}}>
							正在安装,点击刷新
						</span>
					)
			}
		},
	},
]) // 响应式数据

const getInfo = async () => {
	try {
		tableLoading.value = true
		const res = await getJavaInfo()
		// 针对operation字段进行排序
		tableData.value = res.data.jdk_info.sort((a: any, b: any) => {
			return b.operation - a.operation
		})
		jdkLinVersion.value.length = 0
		jdkTomcatList.value = []
		// 循环res.data,若operationt为1，则加入到jdkLinVersion中
		for (let i = 0; i < res.data.jdk_info.length; i++) {
			if (res.data.jdk_info[i].is_current) {
				currentVersion.value = res.data.jdk_info[i].name
			}
			if (res.data.jdk_info[i].operation === 1) {
				jdkLinVersion.value.push({
					label: res.data.jdk_info[i].name,
					value: res.data.jdk_info[i].name,
				})
			}
			if (res.data.jdk_info[i].operation !== 0) {
				jdkTomcatList.value.push({
					label: res.data.jdk_info[i].name,
					value: res.data.jdk_info[i].path,
				})
			}
		}
		tomcatList.value = []
		res.data.tomcat_status.forEach((item: any) => {
			tomcatList.value.push({
				name: `Tomcat${item.version}`,
				...item,
				popover: false,
				portInput: item.port,
			})
		})
	} catch (error) {
	} finally {
		tableLoading.value = false
	}
}

onMounted(async () => {
	if (props.compData.name) {
		tabActive.value = props.compData.name
		handleClickTab({ name: props.compData.name })
	} else {
		tabActive.value = 'newTomCat'
		await getInfo()
	}
})

// 页面销毁时关闭socket
onBeforeUnmount(() => {
	useSocket?.close()
	tabActive.value = 'jdkSettings'
})
</script>

<style lang="css" scoped>
:deep(.el-button--info) {
	background-color: var(--el-fill-color-darker);
	color: var(--el-color-white);
	border-color: var(--el-color-border-darker);
}
:deep(.el-button--info:hover) {
	background-color: var(--el-color-danger-light-3);
	border-color: var(--el-color-danger-light-3);
	color: var(--el-color-white) !important;
}
</style>
