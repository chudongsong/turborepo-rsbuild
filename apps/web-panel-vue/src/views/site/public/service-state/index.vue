<template>
	<div v-bt-loading="isLoading">
		<div class="flex flex-col text-secondary">
			<span class="mb-[12px] flex items-center"
				>当前状态：
				<template v-if="siteType !== 'java'">
					<BtTableStatus v-model="status" :data="['停止', '开启']"></BtTableStatus>
					<span v-if="siteType === 'python'" class="ml-[5rem]">
						<span v-if="siteInfo.listen && siteInfo.listen.length > 0">监听端口：{{ siteInfo.listen.join(',') }}</span>
						<span v-if="siteInfo.pids && siteInfo.pids.length > 0" class="ml-[2rem]">PID：{{ siteInfo.pids.join(',') }}</span>
					</span>
				</template>
				<template v-else>
					<div
						class="flex items-center"
						:class="{
							'cursor-pointer': starting,
						}"
						@click="goLogTab">
						<span :class="`${status ? 'bt-link' : 'bt-danger'}`">{{ statusData(status) }}</span>
						<span :class="statusIcon(status) + ' iconfont'"></span>
					</div>
					<span class="ml-[3rem]" v-if="siteInfo.pid">pid：{{ siteInfo.pid }}</span>
					<span class="ml-[3rem]" v-if="siteInfo.project_config.port">端口：{{ siteInfo.project_config.port }}</span>
				</template>
			</span>
			<div class="flex items-center">
				<el-button v-if="!status" type="default" @click="setService('start')">启动</el-button>
				<el-button v-if="status" type="default" @click="setService('stop')">停止</el-button>
				<el-button type="default" @click="setService('restart')">重启</el-button>
				<el-button v-if="siteType === 'java'" type="default" @click="getProjectInfo(true)">刷新</el-button>
			</div>
		</div>
		<template v-if="siteType !== 'phpasync'">
			<template v-if="siteType !== 'net'">
				<el-divider></el-divider>
				<span class="flex items-center"
					>项目异常停止时提醒我:
					<el-switch v-model="msgForm.status" class="mx-[4px]" @change="changeUnusualStatus"></el-switch>
					<bt-link @click="openAlarmPopup">告警设置</bt-link>
				</span>
			</template>
			<!-- 以下为测试版功能 -->
			<el-divider> </el-divider>
			<span v-if="siteType !== 'java'" class="flex items-center"
				>项目定时重启:
				<el-switch v-model="restartForm.status" class="mx-[4px]" @change="setRestartStatus"></el-switch>
				<bt-link @click="restartPopup = true">定时重启设置</bt-link>
			</span>
			<div v-else class="pb-2rem leading-[2.6rem]">
				<div>命令行操作:</div>
				<div>
					命令行可使用
					<code class="text-supplement bg-darker inline-block rounded-sm px-[0.4rem] leading-2rem"> java-service [项目名称] [start|stop|restart] </code>
					进行启动，停止和重启操作
				</div>
				<div class="items-center flex">
					示例：
					<code class="text-supplement bg-darker inline-block rounded-sm px-[0.4rem] leading-2rem"> java-service {{ siteInfo.name }} start </code>
					<span class="ml-[1rem] svgtofont-el-document-copy cursor-pointer" @click="copyText({ value: `java-service ${siteInfo.name} start` })"></span>
				</div>
				<div>如果提示没有该命令，可以尝试关闭系统加固，并重启面板，再次加载 java-service指令</div>
			</div>
		</template>
		<PhpasyncConfig v-else></PhpasyncConfig>

		<bt-dialog title="项目重启设置" v-model="restartPopup" :area="48" @confirm="setRestartStatus(true)" @cancel="onCancelRestart" showFooter>
			<div class="p-2rem">
				<el-form ref="restartFormRef" label-position="right" :model="restartForm" :rules="restartRules">
					<el-form-item label="项目名称">
						<bt-input v-model="siteInfo.name" disabled width="24rem"></bt-input>
					</el-form-item>
					<el-form-item label="执行周期">
						<div class="flex items-center">
							<el-form-item prop="where_hour">
								<bt-input type="number" width="18.6rem" v-model="restartForm.where_hour">
									<template #prepend>每天</template>
									<template #append>时</template>
								</bt-input>
							</el-form-item>
							<el-form-item prop="where_minute">
								<bt-input type="number" width="14rem" v-model="restartForm.where_minute">
									<template #append>分</template>
								</bt-input>
							</el-form-item>
						</div>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import BtTableStatus from '@/components/extension/bt-table-status'
import PhpasyncConfig from './phpasync-config.vue'
import { copyText } from '@/utils'
import { useSiteStore } from '@site/useStore'
import BtInput from '@/components/form/bt-input'
import { status, isLoading, starting, goLogTab, statusData, onCancelRestart, statusIcon, setService, getProjectInfo, msgForm, changeUnusualStatus, openAlarmPopup, restartForm, restartPopup, restartFormRef, setRestartStatus, restartRules, initService } from './useController'

const { siteType, siteInfo } = useSiteStore()

onMounted(initService)

defineExpose({ init: initService })
</script>
