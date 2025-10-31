<template>
	<a class="flex items-center" title="点击计算大小" @click="onClickCalc(row)">
		<span v-if="load" class="svgtofont-el-loading animate-spin mr-2px"></span>
		<div class="text-primary cursor-pointer">
			<span v-if="isUndefined(row.diskInfo)">计算</span>
			<span v-else>
				<el-popover placement="right" popper-class="myPopover" trigger="hover" width="304">
					<template #reference>
						<span>
							{{ dirSize }}
						</span>
					</template>
					<div class="p-12px w-[28rem]">
						<div class="bg-light text-tertiary !mb-12px !py-[.5rem] !pr-0 !pl-[1rem] rounded-base" v-if="!diskPlugin.isSetup">
							<span class="text-small"> {{ diskPlugin.isBuy || authType === 'ltd' ? '安装' : '购买' }}硬盘分析工具畅享更多信息， </span>
							<a class="text-small btlink" @click="buyPlugin">立即{{ diskPlugin.isBuy || authType === 'ltd' ? '安装' : '购买' }}</a>
						</div>
						<div class="item">
							<div class="title !text-default">目录详情</div>
							<div class="con"></div>
						</div>
						<div class="item">
							<div class="title">目录路径:</div>
							<el-tooltip effect="light" :content="row.diskInfo.full_path || row.diskInfo.path" placement="top">
								<div class="truncate w-[16rem] inline-block ml-1rem">
									{{ row.diskInfo.full_path || row.diskInfo.path }}
								</div>
							</el-tooltip>
						</div>
						<div class="item">
							<div class="title">目录大小:</div>
							<div class="con">
								{{ row.diskInfo.size || dirSize }}
							</div>
						</div>
						<div class="item">
							<span class="ltd-icon"></span>
							<div class="title">文件夹数量:</div>
							<div class="con">
								{{ row.diskInfo.full_path ? row.diskInfo.dir_num : '----------' }}
							</div>
						</div>
						<div class="item">
							<span class="ltd-icon"></span>
							<div class="title">文件数量:</div>
							<div class="con">
								{{ row.diskInfo.full_path ? row.diskInfo.file_num : '----------' }}
							</div>
						</div>
						<div class="item">
							<div class="title">权限:</div>
							<div class="con">
								{{ row.diskInfo.accept || row.diskInfo.rootLevel }}
								<a class="ml-[2rem] bt-link" @click="openDetail(row, 'auth')">修改权限</a>
							</div>
						</div>
						<div class="item">
							<div class="title">所属用户:</div>
							<div class="con">{{ row.diskInfo.user }}</div>
						</div>
						<el-divider class="!my-[1rem]" />
						<div class="item">
							<div class="title">最后修改时间:</div>
							<div class="con">
								{{ row.time }}
							</div>
						</div>
						<div class="item">
							<span class="ltd-icon"></span>
							<div class="title">权限变更时间:</div>
							<div class="con">
								{{ row.diskInfo.full_path ? formatTime(row.diskInfo.ctime) : '-----------' }}
							</div>
						</div>
					</div>
				</el-popover>
			</span>
		</div>
	</a>
</template>

<script setup lang="ts">
import { getByteUnit, formatTime, isUndefined, isBoolean } from '@utils/index'
import { getDirSize, computedDir, CheckTaskStatus } from '@api/files'
import { openDetail } from '@files/useMethods'
import { useDataHandle, useMessage } from '@hooks/tools'
import { storeToRefs } from 'pinia'
import FILES_LIST_VIEW_STORE from '../store'

const Message = useMessage()

interface SizeProps {
	row: any
	status: boolean
}

const props = withDefaults(defineProps<SizeProps>(), {
	status: false, // 加载效果【默认】
})

const store = FILES_LIST_VIEW_STORE()
const { authType, diskAnalysis: diskPlugin } = storeToRefs(store)
const { buyPlugin } = store

const load = ref(false) // 加载效果
const type = ref<string>('defalut') // 默认类型

const row = toRef(props, 'row')
const status = toRef(props, 'status')
// 目录大小
const dirSize = ref('计算')

// 监听一键计算大小
watch(
	() => status.value,
	val => {
		load.value = val
		type.value = ''
		if (isBoolean(val) && !val && row.value?.diskInfo) {
			dirSize.value = getByteUnit(row.value.diskInfo.total_asize)
		}
	},
	{
		immediate: true,
	}
)

const onClickCalc = async (rows: any) => {
	if (diskPlugin.value.reqEnd && diskPlugin.value.isSetup && authType.value === 'ltd') {
		// 插件计算
		const res: any = await useDataHandle({
			loading: load,
			request: computedDir({
				path_list: JSON.stringify([rows.path]),
				is_refresh: false,
			}),
		})
		if (res.status) {
			row.value.diskInfo = Object.values(res.data)[0] ? Object.values(res.data)[0] : rows
			dirSize.value = getByteUnit(row.value.diskInfo.total_asize)
		} else {
			Message.error(res.msg)
		}
	} else {
		load.value = true
		// 普通计算
		const res: any = await getDirSize({ path: rows.path })
		load.value = false
		row.value.diskInfo = { ...rows, size: res.data }
		dirSize.value = res.data
	}
	type.value = ''
}
</script>

<style lang="css" scoped>
/* .size-link */
:deep(.el-popover__reference-wrapper) {
	@apply items-center;
}

/* .item */
.item {
	@apply px-[2rem] text-secondary h-[3rem] flex items-center relative;
}

/* .ltd-icon */
.ltd-icon {
	background-image: url('/static/icons/icon-ltd.svg');
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;
	@apply w-[2rem] h-[2rem] absolute left-[-.5rem];
}

/* .title */
.title {
	@apply whitespace-nowrap;
}

/* .con */
.con {
	@apply flex items-center ml-[1rem] truncate;
}
</style>
