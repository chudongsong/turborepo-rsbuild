<template>
	<div v-bt-loading="loading">
		<el-button type="primary" @click="openService">添加服务</el-button>
		<div class="overflow-auto mt-1rem max-h-[61rem]">
			<div class="border rounded-small border-lighter mb-[16px]" v-for="(item, index) in servicesList" :key="index">
				<div class="flex flex-col p-[16px]">
					<div class="service-info">
						<div class="item-info">
							<div>服务：{{ item.name }}</div>
							<div class="flex items-center">状态：<BtTableStatus :modelValue="item.pid ? true : false"></BtTableStatus></div>
						</div>
						<div class="item-info">
							<div v-if="item.pid">pid：{{ item.pid }}</div>
							<div v-if="item.ports.length">端口：{{ item.ports.join(', ') }}</div>
						</div>
						<div class="item-info" v-if="item.sid && item.sid !== 'main'">
							<div class="!w-[100%]">
								启动命令：{{ item.command }}
								<i class="svgtofont-el-document-copy cursor-pointer text-default text-base copy ml-[4px]" title="复制启动命令" @click="() => copyText({ value: item.command })"></i>
							</div>
						</div>
					</div>
					<div class="flex items-center mt-[16px]">
						<el-button v-if="!item.pid" type="default" @click="handleServiceEvent('start', item)">启动</el-button>
						<el-button v-else type="default" @click="handleServiceEvent('stop', item)">停止</el-button>
						<el-button type="default" @click="handleServiceEvent('restart', item)">重启</el-button>
						<template v-if="item.sid !== 'main'">
							<el-button type="default" @click="editServices(item)">编辑</el-button>
							<el-button type="default" @click="openLog(item)">日志</el-button>
							<el-button type="default" @click="deleteService(item)">删除</el-button>
						</template>
					</div>
				</div>
			</div>
		</div>
		<bt-help :options="helpList"></bt-help>
		<bt-dialog :title="`${servicesForm.isEdit ? '编辑' : '添加'}服务`" v-model="addServicesPopup" :area="50" :show-footer="true" @confirm="onConfirm" @cancel="onCancel">
			<div class="p-2rem">
				<el-form :rules="servicesRules" label-width="90px" :model="servicesForm" ref="servicesFormRef" :disabled="servicesDisable" size="small" @submit.native.prevent>
					<el-form-item label="名称" prop="name">
						<bt-input v-model="servicesForm.name" name="name" width="32rem" />
					</el-form-item>
					<el-form-item label="启动命令" prop="command">
						<bt-input v-model="servicesForm.command" name="command" width="32rem" />
					</el-form-item>
					<div class="more flex items-center cursor-pointer pl-[10rem] my-[2rem] px-[2rem]" @click="isAdv = !isAdv">
						<i :class="isAdv ? 'svgtofont-el-arrow-down' : 'svgtofont-el-arrow-right'"></i>
						<div class="ml-[1rem] text-primary w-[16rem] select-none">
							{{ `更多设置，${isAdv ? '点击收回' : '点击查看'}` }}
						</div>
					</div>
					<div v-show="isAdv" class="py-[2rem] pt-[0]">
						<el-form-item label="优先级" prop="level">
							<bt-input v-model="servicesForm.level" type="number" name="level" width="32rem" />
						</el-form-item>
						<el-form-item label="日志管理" prop="log_type">
							<bt-select v-model="servicesForm.log_type" :options="typeOptions" @change="handleType" class="!w-32rem"></bt-select>
						</el-form-item>
					</div>
				</el-form>
				<bt-help
					v-show="isAdv"
					class="pl-4rem"
					:options="[
						{
							content: '【优先级】执行项目启动时，会按照优先级从高到低一次启动服务，主服务的优先级为10',
						},
					]"></bt-help>
			</div>
		</bt-dialog>
		<bt-dialog :title="`【${logInfo.title}】服务日志`" v-model="showLogPopup" :area="70">
			<div class="p-2rem flex flex-col" v-bt-loading="logInfo.logLoading">
				<div>
					<el-button @click="refreshLog(true)" type="default" class="!mb-1rem">刷新日志</el-button>
				</div>
				<bt-log
					:content="logInfo.logContent"
					:isHtml="true"
					class="h-41rem"
					:full-screen="{
						title: `全屏查看【${logInfo.title}】服务日志`,
						onRefresh: () => refreshLog,
					}"></bt-log>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import BtTableStatus from '@/components/extension/bt-table-status'
import { copyText } from '@/utils'
import {
	isAdv,
	servicesForm,
	servicesList,
	servicesFormRef,
	servicesDisable,
	servicesRules,
	handleServiceEvent,
	editServices,
	openLog,
	deleteService,
	loading,
	typeOptions,
	getServices,
	handleType,
	logInfo,
	refreshLog,
	openService,
	onCancel,
	onConfirm,
	showLogPopup,
	addServicesPopup,
	helpList,
} from './useController'

onMounted(() => {
	getServices(true)
})
</script>

<style lang="css" scoped>
.item-info {
	@apply flex leading-[2.2rem];
}
.item-info div {
	@apply w-[50%];
}
</style>
