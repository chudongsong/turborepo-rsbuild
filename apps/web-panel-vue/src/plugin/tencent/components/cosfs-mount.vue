<template>
	<div v-if="isShow" class="mr-1rem">
		<el-dropdown placement="bottom-start" @command="handleMountCommand">
			<el-button>腾讯云COSFS挂载工具<i class="svgtofont-el-arrow-down el-icon--right"></i></el-button>
			<template #dropdown>
				<el-dropdown-menu v-bt-loading="isLoading" class="w-20rem">
					<template v-if="!isNoCorrelation">
						<el-dropdown-item v-for="(item, index) in list" :key="index" :command="index">
							<div class="inline-block w-full flex items-center justify-between">
								<div class="flex items-center" :title="item.Name.split('-')[0]">
									<BtSvgIcon name="file-hdd" size="1.4" class="mr-4px"></BtSvgIcon>
									<div class="truncate max-w-[12rem]">{{ item.Name.split('-')[0] }}</div>
								</div>
								<div class="text-primary">挂载</div>
							</div>
						</el-dropdown-item>
						<div v-if="!list.length" class="h-4rem flex items-center justify-center text-tertiaryer">暂无未挂载存储桶</div>
					</template>
					<div v-else class="h-4rem flex items-center justify-center text-tertiaryer text-small">未关联腾讯云API密钥<a class="bt-link cursor-pointer ml-4px" @click="tencentCloudDialog">>>关联密钥</a></div>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<BtDialog :title="`【${mountFrom.bucket_name}】本地挂载`" v-model="isAddMount" :show-footer="true" :area="[50]" :confirm-text="'挂载'" @confirm="addMountEvent">
			<el-form ref="mountFromRef" class="p-2rem" :model="mountFrom" :rules="rules">
				<el-form-item label="挂载地址" prop="path">
					<BtInputIcon v-model="mountFrom.path" v-trim name="path" icon="el-folder-opened" width="32rem" placeholder="请选择文件目录" @icon-click="onPathChange" />
				</el-form-item>
			</el-form>
		</BtDialog>
	</div>
</template>

<script setup lang="ts">
import { getPluginInfo, getTencentInfo, getUnmountedBuckets, mountCosfs, setInstance } from '../api'

interface Props {
	dependencies: AnyObject
}
const props: any = withDefaults(defineProps<Props>(), {
	dependencies: () => ({}),
})

// eslint-disable-next-line @typescript-eslint/naming-convention
const { BtDialog, BtInputIcon, BtSvgIcon, ElDropdown, ElDropdownItem, ElDropdownMenu, ElForm, ElButton, ElFormItem } = unref(props.dependencies.components)
// eslint-disable-next-line vue/no-setup-props-destructure
const { useAxios: instance, useMessage, useDialog } = unref(props.dependencies.hooks)
const { fileSelectionDialog } = unref(props.dependencies.dialog)
const { getDiskList } = unref(props.dependencies.custom)

const Message = useMessage()

const isShow = ref<boolean>(false) // 是否显示下拉按钮
const isLoading = ref<boolean>(false) // 加载状态
const list = ref<any>([]) // 腾讯云COSFS挂载列表

const isNoCorrelation = ref<boolean>(false) // 关联腾讯云密钥
const isAddMount = ref<boolean>(false) // 添加本地挂载
const mountFromRef = ref<any>() // 添加本地挂载表单实例
const mountFrom = reactive({
	// 本地挂载表单数据
	region: '',
	// eslint-disable-next-line @typescript-eslint/naming-convention
	bucket_name: '',
	path: '',
})
const rules = reactive({
	// 校验规则
	path: [
		{
			required: true,
			message: '请选择文件目录',
			trigger: 'blur',
		},
	],
})

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		change: (path: string) => {
			mountFrom.path = path
		},
	})
}

/**
 * @description 腾讯云API配置
 */
const tencentCloudDialog = () => {
	useDialog({
		isAsync: true,
		component: () => import('./config.vue'),
		title: false,
		area: [48],
		compData: {
			dependencies: props.dependencies,
		},
	})
}

/**
 * @description: 确认挂载
 */
const handleMountCommand = (index: number) => {
	const { Name, Location } = list.value[index]
	mountFrom.region = Location
	mountFrom.bucket_name = Name
	mountFrom.path = `/www/cosfs/${Name.replace(/([-][^-]+)$/, '')}`
	isAddMount.value = true
}

/**
 * @description: 添加本地挂载
 */
const addMountEvent = async () => {
	try {
		await mountFromRef.value.validate()
		const loadT = Message.load('正在挂载，请稍后...')
		const res = await mountCosfs(mountFrom)
		Message.request(res)
		if (res.status) {
			isAddMount.value = false // 关闭弹窗
			getListData() // 刷新腾讯云COSFS挂载列表
			getDiskList() // 刷新文件磁盘列表
		}
		loadT.close()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 获取腾讯云COSFS挂载列表
 */
const getListData = async () => {
	try {
		isLoading.value = true
		const res = await getUnmountedBuckets()
		if (res.status) list.value = res.data.list
	} catch (error) {
		console.log(error)
	} finally {
		isLoading.value = false
	}
}

/**
 * @description: 获取cosfs插件状态
 */
const getCosfsPluginStatus = async () => {
	try {
		const res = await getPluginInfo({ sName: 'cosfs' })
		// 已安装cosfs插件
		if (res.data.setup) getListData()
		isShow.value = res.data.setup // 显示下拉按钮
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 腾讯云检测
 */
const tencentCheck = async () => {
	try {
		const { data } = await getTencentInfo()
		if (data?.status === false && data?.msg) {
			isNoCorrelation.value = true // 没有关联腾讯云
		}
		if (data) {
			// 已关联腾讯云
			getCosfsPluginStatus() // 获取cosfs插件状态
		}
		isShow.value = !!data // 显示下拉按钮
	} catch (error) {
		console.log(error)
	}
}

onMounted(() => {
	setInstance(instance) // 设置axios实例
	tencentCheck() // 腾讯云检测
})
</script>

<style scoped></style>
