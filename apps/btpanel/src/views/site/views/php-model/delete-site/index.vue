<template>
	<div class="">
		<!-- 删除确认第一步 -->
		<div class="p-[20px] w-[480px]" v-if="delData.steps === 1">
			<div class="flex items-center">
				<i class="text-warning svgtofont-el-warning-filled !text-titleLarge"></i>
				<span class="text-base ml-[8px] leading-10">是否要删除关联的FTP、数据库、站点目录！</span>
				<!-- 测试版描述 -->
				<!-- 删除站点数据后，选中删除关联的FTP将永久消失，选中删除关联的数据库将迁至回收站，选中删除关联的站点目录将迁至回收站，是否继续操作？ -->
			</div>
			<div class="flex items-center ml-[48px] mt-[12px]">
				<el-checkbox v-model="delData.isFtp">FTP</el-checkbox>
				<el-checkbox v-model="delData.isDatabase">数据库</el-checkbox>
				<el-checkbox v-model="delData.isSite">站点目录</el-checkbox>
			</div>
			<div class="!mt-[12px] text-danger ml-[48px]" v-if="!recycleBin || !recycleDb">
				<span>
					当前
					<span v-if="!recycleBin && !recycleDb">【文件回收站】【数据库回收站】</span>
					<span v-if="recycleBin && !recycleDb">【数据库回收站】</span>
					<span v-if="!recycleBin && recycleDb">【文件回收站】</span>
					尚未开启，请谨慎操作！
				</span>
			</div>
			<div class="p-[20px] bg-base mt-[12px]">
				<span>计算结果：</span>
				<span class="mx-[1rem]">{{ delData.addend1 }} + {{ delData.addend2 }}</span>
				<span class="mr-[1rem]">=</span>
				<el-input-number v-model="delData.sum" v-focus autofocus="true" controls-position="right" size="small" />
			</div>
		</div>

		<!-- 删除确认第二步 -->
		<div class="p-[20px] w-[610px]" v-if="delData.steps === 2">
			<div class="flex items-center">
				<i class="text-warning svgtofont-el-warning !text-titleLarge"></i>
				<span class="text-extraLarge ml-[8px] leading-10 font-bold">堡塔温馨提示您，请冷静几秒钟，确认以下要删除的数据。</span>
			</div>
			<div class="border border-base min-h-[12rem] overflow-auto mt-[20px] mb-1rem max-h-[40rem]">
				<div v-for="(item, index) in delData.data" :key="index" class="flex items-center flex-col p-[12px] border-b-1 border-extraLight hover:bg-[rgba(var(--el-file-color-light-rgb),0.4)] last:border-b-0" style="gap: 0.4rem">
					<div class="inline-flex items-center justify-between px-[12px] py-[8px] w-full">
						<span class="truncate w-[28%]">站点名:{{ item.name }}</span>

						<div class="inline-flex items-center justify-between flex-1">
							<div class="flex item-center" v-if="delData.isSite">
								<span class="truncate w-[110px]" :title="item.path">目录:{{ item.path }}</span>
								<span v-if="item.total" class="text-danger flex items-center">
									({{ getByteUnit(item.total) }})
									<el-tooltip v-if="delData.fileSize <= item.total" class="item" effect="dark" placement="top">
										<template #content>
											此目录较大，可能为重要数据，请谨慎操作！
											<br />
											目录：{{ item.path }}
										</template>
										<i class="svgtofont-el-warning cursor-pointer ml-4px"></i>
									</el-tooltip>
								</span>
							</div>
							<div v-if="!delData.isSite">仅删除记录</div>

							<span class="truncate !w-[180px] flex-shrink-0">创建时间:{{ item.addtime }}</span>
						</div>
					</div>
					<div class="flex items-center justify-between px-[12px] py-[8px] w-full border-t-1 border-extraLight" v-if="item.database && delData.isDatabase">
						<span class="truncate w-[28%]">数据库:{{ item.database.name }}</span>
						<div class="items-center inline-flex justify-between flex-1">
							<span class="truncate mr-12px flex items-center">
								大小:{{ getByteUnit(item.database.total) }}
								<el-tooltip v-if="delData.dbSize <= item.database.total" class="item" effect="dark" placement="top">
									<template #content>
										此数据库较大，可能为重要数据，请谨慎操作！
										<br />
										数据库：{{ item.database.name }}
									</template>
									<i class="svgtofont-el-warning cursor-pointer ml-4px text-dangerDark"></i>
								</el-tooltip>
							</span>
							<span class="truncate !w-[180px] flex-shrink-0">创建时间:{{ item.addtime }}</span>
						</div>
					</div>
				</div>
			</div>
			<div v-if="countdown && disableDeleteButton">
				请仔细阅读以上要删除信息，防止网站数据被误删，确认删除还有
				<span class="text-danger bold">{{ countdown }}</span>
				秒可以操作。
			</div>
			<div v-else class="text-danger">注意：请仔细阅读以上要删除信息，防止网站数据被误删</div>
		</div>
		<div class="bg-light footer-btn flex items-center justify-end p-[12px] w-full">
			<el-button type="warning" @click="handleCancelDel">取消</el-button>
			<el-button type="danger" v-if="delData.steps === 1" @click="handleNextStep">下一步</el-button>
			<el-button type="danger" v-if="delData.steps === 2" :disabled="disableDeleteButton" @click="handleConfirm">
				{{ countdown && disableDeleteButton ? `等待${countdown}秒` : '确认删除数据' }}
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { batchDelSite, checkDelData, deleteAsync, deleteSite } from '@/api/site'
import { Message, useDataHandle, useHandleError } from '@/hooks/tools'
import { assembBatchParams, assembBatchResults } from '@/public'
import { router } from '@/router'
import { useGlobalStore } from '@/store/global'
import { checkVariable, getByteUnit, isArray } from '@/utils'
import { openResultDialog } from '@/views/site/useController'
import { useSiteStore } from '@/views/site/useStore'
import { useWPLocalStore } from '@/views/wordpress/view/local/useStore'
import { useRoute } from 'vue-router'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const { panel } = useGlobalStore()

// 回收站状态 数据库回收站状态
const { isFileRecycle: recycleBin, isDbRecycle: recycleDb } = toRefs(panel.value)
const { isRefreshList, batchConfig } = useSiteStore()
const { isRefreshLocalList } = storeToRefs(useWPLocalStore())

const emits = defineEmits(['close'])

const delData = reactive({
	addend1: Math.round(Math.random() * 9 + 1),
	addend2: Math.round(Math.random() * 9 + 1),
	sum: undefined as any,
	steps: 1,
	isFtp: false,
	isDatabase: false,
	isSite: false,
	data: {} as any,
	isMult: false, // 是否是多选
	fileSize: 0,
	dbSize: 0,
}) // 删除数据

const handleCancelDel = () => {
	// delEventPopup.value = false;
	emits('close')
	delData.steps = 1
	delData.addend1 = Math.round(Math.random() * 9 + 1)
	delData.addend2 = Math.round(Math.random() * 9 + 1)
	delData.sum = undefined
	delData.isFtp = false
	delData.isDatabase = false
	delData.isSite = false
}

const disableDeleteButton = ref(false) // 控制删除按钮的禁用状态
const countdown = ref(5) // 倒数秒数
const startCountdown = () => {
	disableDeleteButton.value = true // 禁用按钮
	countdown.value = 5 // 重置倒计时
	const intervalId = setInterval(() => {
		countdown.value -= 1
		if (countdown.value <= 0) {
			clearInterval(intervalId)
			disableDeleteButton.value = false // 重新启用按钮
		}
	}, 1000)
}

/**
 * @description: 删除-下一步
 */
const handleNextStep = async () => {
	// 验证计算结果
	if (delData.sum === delData.addend1 + delData.addend2) {
		let loading
		// 是否勾选了删除FTP、数据库、站点目录
		if (delData.isFtp || delData.isDatabase || delData.isSite) {
			try {
				let param: any
				if (delData.data.hasOwnProperty('id')) {
					param = [delData.data.id]
				} else {
					param = delData.data?.map((item: any) => {
						return item.id
					})
					delData.isMult = true
				}
				loading = Message.load('正在检查要删除的数据,请稍后...')
				const res = await checkDelData({ ids: JSON.stringify(param) })
				const list = checkVariable(res.data.data, 'array', [])?.map((item: any) => {
					const type = Array.isArray(delData.data) ? delData.data.find(i => i.id === item.id)?.project_config?.type : delData.data?.project_config?.type || delData.data.project_type
					return type === 'PHPMOD' ? { ...item, project_config: { type: 'PHPMOD' } } : item
				})
				delData.data = list
				delData.fileSize = res.data.file_size
				delData.dbSize = res.data.db_size
			} catch (error) {
				console.log(error)
			} finally {
				loading?.close()
			}
			delData.steps = 2
			delData.addend1 = Math.round(Math.random() * 9 + 1)
			delData.addend2 = Math.round(Math.random() * 9 + 1)
			delData.sum = undefined
		} else {
			// 当delData不为数组时,使其成为数组
			if (!Array.isArray(delData.data)) delData.data = [delData.data]
			// 当有多条数据时,赋值为多选
			// if (delData.data.length > 1) delData.isMult = true
			await delEvent()
			delData.addend1 = Math.round(Math.random() * 9 + 1)
			delData.addend2 = Math.round(Math.random() * 9 + 1)
			delData.sum = undefined
		}
		startCountdown()
	} else {
		Message.error('计算错误，请重新计算')
	}
}

/**
 * @description:删除递归
 * @param {Array} result 结果数组
 * @param {Number} index 当前索引
 * @param {Boolean} isMult 是否为批量删除
 */
const deleteRecursion = async (result: any, index: number, isMult: boolean) => {
	const item = delData.data[index] // 当前数据
	const type = item.project_config?.type || item.project_type // 类型

	let param: any = {
		id: item.id,
		webname: item.name,
		ftp: delData.isFtp ? 1 : 0,
		database: delData.isDatabase ? 1 : 0,
		path: delData.isSite ? 1 : 0,
	}

	// 当isFtp，isDatabase，isSite自身为false时，删除该条此参数
	if (!delData.isFtp) delete param.ftp
	if (!delData.isDatabase) delete param.database
	if (!delData.isSite) delete param.path

	// 删除请求
	const res =
		type === 'PHPMOD'
			? await deleteAsync({
					id: item.id,
					webname: item.name,
			  })
			: await deleteSite(param)
	// 添加结果
	result.push({ name: item.name, status: true })

	// 完成所有删除时
	if (index === delData.data.length - 1) {
		isRefreshList.value = true
		isRefreshLocalList.value = true
		if (isMult) {
			openResultDialog({
				resultData: result,
				resultTitle: '删除结果',
			}) // 批量删除-展开结果列表
		} else {
			Message.request(res) // 单个删除-提示结果
		}
	}
	// 未完成所有删除，继续递归删除
	if (index < delData.data.length - 1) deleteRecursion(result, index + 1, isMult)
}

/**
 * @description: 删除事件
 */
const delEvent = async () => {
	let loading = Message.load('正在删除站点...')
	let deleteArr: any = []
	const { fullPath } = router.currentRoute.value
	try {
		if (delData.isMult && fullPath.includes('site')) {
			const { enable, exclude } = batchConfig.value
			const params = assembBatchParams(delData.data, exclude, enable, { params: { project_type: 'PHP', ftp: delData.isFtp ? 1 : 0, database: delData.isDatabase ? 1 : 0, path: delData.isSite ? 1 : 0 } })
			useDataHandle({
				loading: '正在删除站点,请稍后...',
				request: batchDelSite(params),
				success: (res: any) => {
					const { data } = assembBatchResults(res.data)
					openResultDialog({ resultData: data, title: '批量删除站点' })
					isRefreshList.value = true
					isRefreshLocalList.value = true
				},
			})
		} else {
			await deleteRecursion(deleteArr, 0, delData.isMult)
		}
		loading.close()
		emits('close')
	} catch (error) {
		useHandleError(error)
	} finally {
		delData.steps = 1 // 步骤调整为1
	}
}

/**
 * @description: 确认删除
 */
const handleConfirm = async () => {
	if (delData.steps === 1) {
		if (delData.sum === delData.addend1 + delData.addend2) {
			await delEvent()
			emits('close')
		} else {
			Message.error('计算错误，请重新计算')
		}
	} else {
		await delEvent()
		emits('close')
	}
}

onMounted(() => {
	delData.data = props.compData
	if (isArray(props.compData)) delData.isMult = true
})
</script>

<style scoped></style>
