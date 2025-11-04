<template>
	<div class="relative container-table-tab !bg-transparent" :style="{ height: `${mainHeight - 170}px` }">
		<div class="relative h-full">
			<el-row :gutter="20" class="!mx-0">
				<el-col :xs="24" :sm="8" :md="8" :lg="5" :xl="4" class="!pl-0">
					<OrchestrationList />
				</el-col>
				<el-col
					v-show="!isEmpty || orchestrationData.loading"
					v-bt-loading="orchestrationData.loading"
					v-bt-loading:title="`正在获取数据`"
					:xs="24"
					:sm="16"
					:md="16"
					:lg="19"
					:xl="20"
					class="!pl-0 !pr-0"
					:style="{
						height: `${mainHeight - 80}px`,
						overflowY: mainWidth < 984 ? 'auto' : 'hidden',
						overflowX: 'hidden',
						borderRadius: '1.6rem',
					}">
					<div class="p-[1.6rem] compose-menu !mt-[0rem] rounded-medium bg-[rgba(var(--el-color-white-rgb),var(--bt-main-content-opacity))]">
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<span class="text-large whitespace-nowrap"
									><span>{{ compose?.name }}</span>
									<span class="flex justify-center mt-[1.6rem] gap-[1rem] items-center text-small text-tertiary">
										<span class="whitespace-nowrap">创建时间：{{ compose?.time ? formatTime(compose?.time) : '--' }}</span>
										<span class="whitespace-nowrap">容量数量：{{ compose?.container_count }}</span>
									</span>
								</span>
								<div class="flex items-center ml-[5rem]">
									<el-button-group>
										<el-button v-if="composeStatusObject(compose.run_status).type === 'danger'" type="default" @click="commandEvent('start')">启动</el-button>
										<el-button v-if="composeStatusObject(compose.run_status).type !== 'danger'" type="default" @click="commandEvent('stop')">停止</el-button>
										<el-button v-if="composeStatusObject(compose.run_status).type !== 'danger'" type="default" @click="commandEvent('restart')">重启</el-button>
										<el-button type="default" @click="commandEvent('update')">更新镜像</el-button>
										<el-button type="default" @click="commandEvent('rebuild')">重建</el-button>
										<el-button class="!hover:(bg-danger text-white border-danger)" type="default" @click="commandEvent('delete')">删除</el-button>
									</el-button-group>
									<bt-link class="ml-[1.6rem]" @click="NPSDialog">需求反馈</bt-link>
								</div>
							</div>
						</div>
					</div>
					<el-row
						:gutter="20"
						:style="{
							height: `${mainHeight - 178}px`,
						}">
						<el-col :xs="24" :sm="24" :md="24" :lg="14" :xl="16" style="height: 100%">
							<OrchestrationMenu />
						</el-col>
						<el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="8" style="height: 100%" class="lt-xl:pt-[1.6rem] !pl-0">
							<OrchestrationEditor />
						</el-col>
					</el-row>
				</el-col>
				<el-col v-show="isEmpty && !orchestrationData.loading" class="bg-[rgba(var(--el-color-white-rgb),var(--bt-main-content-opacity))] overflow-hidden rounded-extraLarge" :xs="24" :sm="16" :md="16" :lg="19" :xl="20">
					<el-empty :style="{ height: `${mainHeight - 120}px`, borderRadius: '1.6rem' }" description="当前暂无容器编排">
						<span class="cursor-pointer text-primary hover:text-primaryDark" @click="createComposeDialog(addCompose)">点击添加容器编排</span>
					</el-empty>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getDockerStore } from '@docker/useStore'
import { useGlobalStore } from '@/store/global'
import { formatTime } from '@utils/index'
import { NPSDialog } from '@docker/useMethods'
import { commandEvent } from './orchestration-menu/useController'
import { composeStatusObject, init, unmountHandle, isEmpty, createComposeDialog, addCompose } from './useController'

import OrchestrationList from './orchestration-list/index.vue'
import OrchestrationMenu from './orchestration-menu/index.vue'
import OrchestrationEditor from './orchestration-editor/index.vue'

const { mainHeight, mainWidth } = useGlobalStore()

const {
	refs: { orchestrationData },
} = getDockerStore()

// 当前容器编排
const compose = computed(() => orchestrationData.value.currentCompose)

init()

onUnmounted(() => {
	unmountHandle()
})
</script>

<style scoped>
.container-table-tab :deep(.el-tooltip .el-dropdown) {
	@apply text-small;
}
.container-table-tab :deep(.el-tooltip .el-dropdown .el-dropdown-selfdefine) {
	@apply flex items-center;
}
</style>
