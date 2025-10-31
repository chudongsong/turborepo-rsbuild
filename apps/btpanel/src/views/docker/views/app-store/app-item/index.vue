<template>
	<div class="AppItem relative" :class="{ '!h-[12.8rem]': !data.installed }">
		<!-- 图标 -->
		<img :src="imgSrcRef" v-if="imgSrcRef" :key="data.appname" class="AppImg" />
		<img src="/static/img/soft_ico/icon_plug.svg" alt="icon_plug" key="icon_plug" v-else class="AppImg" />

		<!-- 主体 -->
		<div class="AppContent">
			<div class="w-full flex items-start justify-between">
				<div class="flex-col flex flex-grow-0">
					<!-- 标题 -->
					<div class="AppRow">
						<span
							class="text-medium font-600"
							:class="{
								'truncate leading-[22px] !font-normal flex-1 max-w-[20rem]': data.installed,
								'flex items-center': !data.installed,
							}"
							:title="data.installed ? data.service_name : data.apptitle">
							<span>{{ data.installed ? data.service_name : data.apptitle }}</span>
							<span class="mx-8px bt-link text-small font-normal" v-if="data.installedCount" @click="deployMenuData.app_type = 'installed'">已安装 ({{ data.installedCount }})</span>
							<bt-link :href="data.help" target="_blank" v-if="data.help" class="ml-8px bt-link text-small font-normal"> >>帮助</bt-link>
						</span>

						<div v-if="data.installed" class="flex items-center">
							<!-- 状态 -->
							<el-tag :type="statusType[1]" class="mx-[0.8rem]" :class="{ 'cursor-pointer': data.status === 'initializing' }" @click="openOperateView(data, 'log', true)">
								<span v-if="data.status === 'initializing'" class="flex items-center">正在安装 <i class="svgtofont-el-loading !text-small animation-spin"></i></span>
								<span v-else>{{ statusType[0] }} </span>
							</el-tag>
							<!-- 图标跳转 -->
							<el-tooltip class="item" effect="dark" content="进入安装目录" placement="top">
								<i class="svgtofont-folder-open mr-[0.4rem]" @click="onClickIcon('path', data)"></i>
							</el-tooltip>
							<el-tooltip class="item" effect="dark" content="打开日志" placement="top">
								<i class="svgtofont-left-logs" @click="openOperateView(data, 'log')"></i>
							</el-tooltip>

							<span class="mx-8px">已安装:{{ data.createat }}</span>
						</div>
					</div>
					<!-- 描述 -->
					<div>
						<span v-if="!data.installed" v-html="data.appdesc" :title="data.appdesc" class="AppNoSetDes"></span>

						<div class="AppDescribe" v-if="data.installed">
							<div class="AppRow">
								<!-- 版本 -->
								<el-tag type="info" class="mr-[0.8rem]" effect="plain">版本:{{ data.m_version + (data.s_version ? '.' : '') + data.s_version }}</el-tag>

								<!-- 端口 -->
								<el-popover v-for="(port, index) in data.port" :key="port" trigger="hover" placement="bottom" width="12.5rem" popper-class="!min-w-[12.5rem]">
									<template #reference>
										<el-tag v-show="index < 2" type="info" class="mr-[0.8rem]" :class="getJumpAuth(data) ? 'cursor-pointer' : ''" effect="plain" @click="openPortJump(data, port, 'http')">端口:{{ port }}</el-tag>
									</template>
									<div class="-m-[12px]">
										<div class="px-[16px] py-[8px] cursor-pointer text-center hover:bg-light" @click="openPortJump(data, port, 'http')">HTTP协议访问</div>
										<div class="px-[16px] py-[8px] cursor-pointer text-center hover:bg-light" @click="openPortJump(data, port, 'https')">HTTPS协议访问</div>
									</div>
								</el-popover>
								<el-tooltip placement="top">
									<template #content>
										<div>
											<span v-for="(port, index) in data.port" :key="index" v-show="index > 1" :class="getJumpAuth(data) ? 'cursor-pointer' : ''" :title="getJumpAuth(data) ? '点击访问应用' : ''" @click="openPortJump(data, port)"
												>{{ port }}
												<span v-show="index !== data.port?.length - 1">,</span>
											</span>
										</div>
									</template>
									<el-tag type="info" v-if="data.port?.length >= 3"> +{{ data.port?.length - 2 }} </el-tag>
								</el-tooltip>
							</div>

							<!-- 域名 -->
							<div class="flex items-center flex-1">
								<el-tag type="info" class="mr-[0.8rem] cursor-pointer" effect="plain" @click="openDomain(data.domain)" v-if="data.domain">
									<div class="flex items-center">
										<i class="svgtofont-icon-max-black mr-[0.4rem] !text-base"></i>
										<el-tooltip effect="dark" :content="'点击跳转域名:' + data.domain" placement="top-start">
											<span class="truncate max-w-[24rem]">域名:{{ data.domain }}</span>
										</el-tooltip>
									</div>
								</el-tag>
								<span class="bt-link" v-if="data.domain" @click="openNginxView(data)"> >管理网站</span>
							</div>
						</div>
					</div>
				</div>
				<!-- 右侧操作 -->
				<div class="flex" v-if="data.installed">
					<!-- 应用设置 -->
					<el-button v-if="data.appname === 'ollama' || data.appname === 'ollama_and_openwebui' || data.appname === 'deepseek_r1'" size="small" @click="openAppConfigView(data.appname, data)">模型管理</el-button>
					<el-button v-if="data.appname === 'mysql' || data.appname === 'redis' || data.appname === 'postgresql' || data.appname === 'tdengine'" size="small" @click="openAppConfigView(data.appname, data)">终端</el-button>
					<!-- <el-button v-if="data.appname === 'mysql'" size="small" @click="openOperateView(data,'password')">改密</el-button> -->
				</div>
				<el-button :type="'primary'" v-if="!data.installed" @click="installEvent(data)">安装</el-button>
			</div>

			<!-- 底部按钮 -->
			<div v-if="data.installed" class="absolute bottom-14px w-[80%]">
				<el-divider class="!my-[0.8rem] w-full"></el-divider>
				<el-button size="small" @click="openDetail(data)">详情 </el-button>
				<el-button size="small" @click="openOperateView(data, 'back')">备份</el-button>
				<el-button v-if="data.status === 'exited'" size="small" @click="handleOpearateStatus(emits, 'start', { service_name: data.service_name, appname: data.appname })">启动 </el-button>
				<el-button v-if="data.status !== 'exited'" size="small" @click="handleOpearateStatus(emits, 'stop', { service_name: data.service_name, appname: data.appname })">停止 </el-button>
				<el-button size="small" @click="handleOpearateStatus(emits, 'restart', { service_name: data.service_name, appname: data.appname })">重启 </el-button>
				<el-button type="default" plain size="small" class="danger-button" @click="handleOpearateStatus(emits, 'rebuild', { service_name: data.service_name, appname: data.appname })">重建 </el-button>
				<el-button type="default" plain size="small" class="danger-button" @click="handleRemoverApp(emits, { appname: data.appname, id: data.id })">卸载</el-button>
				<el-button size="small" @click="updateAppEvent(data)" v-if="isShowUpdate(data)">更新</el-button>
			</div>
			<div v-if="!data.installed" class="tag-container absolute bottom-6">
				<el-tag type="info">{{ data.appTypeCN }}</el-tag>
				<el-tag v-if="data.appid == -1" type="success" class="ml-4">外部应用</el-tag>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getDockerAppStore } from '@docker/views/app-store/useStore'
import { openDomain, getJumpAuth, openPortJump, imgError, handleRemoverApp, handleOpearateStatus, openOperateView, openNginxView, onClickIcon, installEvent, updateAppEvent, openDetail, renderSoftImages, isShowUpdate, openAppConfigView } from './useController'

interface AppItemProps {
	data: any
}

const props = withDefaults(defineProps<AppItemProps>(), {
	data: () => ({}),
})

const {
	refs: { deployMenuData },
} = getDockerAppStore()

const imgSrcRef = ref<any>('') // 图片src

watch(props, async () => {
	imgSrcRef.value = ''
	await renderSoftImages(props.data, imgSrcRef)
})

onMounted(async () => {
	await renderSoftImages(props.data, imgSrcRef)
})

// // const { proxy: vm }: any = getCurrentInstance()
// const Message = useMessage() // 消息提示
const emits = defineEmits(['refresh'])

// const appData = inject('appData', {
// 	loading: false,
// 	list: [],
// 	total: 0,
// })
// const getAppList = inject('getAppList', (params?: any) => {})
// const appParams = inject('appParams', {
// 	p: 1,
// 	row: 200,
// 	query: '',
// 	force: 0,
// })

const statusType = computed(() => {
	switch (props.data.status) {
		case 'running':
			return ['运行中', 'success']
		case 'exited':
			return ['已停止', 'danger']
		case 'initializing':
			return ['安装中', 'info']
		default:
			return ['异常', 'warning']
	}
})
</script>

<style scoped lang="css">
.AppItem {
	@apply p-[1.6rem] flex-1 flex items-start border-1 border-dark rounded-medium relative h-[16rem] min-w-[50rem];
	transition: all 0.3s;
	box-shadow: 0 0 6px 0 rgba(var(--el-color-white-rgb), 0.15);
}
.AppItem:hover {
	@apply border border-solid border-primary;
}
.AppContent {
	@apply flex flex-col items-start text-secondary flex-1;
}
.AppContent i:hover {
	@apply text-primary;
}
.AppContent i {
	@apply text-large cursor-pointer;
}
.AppDescribe {
	@apply flex flex-col justify-start;
}
.AppRow {
	@apply flex items-center mb-[0.8rem] flex-nowrap flex-1 w-[auto];
}
.AppNoSetDes {
	@apply inline-block flex-1 pr-2rem;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	/* //多行在这里修改数字即可 */
	-webkit-box-orient: vertical;
}
.AppImg {
	@apply w-[4.6rem] h-[4.6rem] mr-[1.4rem] inline-block;
	@apply p-4px border-1 border-light border-solid rounded-circle;
	box-shadow: 0 0 6px 0 rgba(var(--el-color-black-rgb), 0.15);
}

:deep(.el-button--default):hover {
	background-color: var(--el-color-danger-light-9);
	border-color: var(--el-color-danger-light-8);
	color: var(--el-color-danger-light-5) !important;
}
:deep(.el-descriptions-item__label) {
	@apply w-[30%];
}

:deep(.el-button--small) {
	@apply py-[0rem] px-[0.8rem] text-small h-[2.4rem];
}
</style>
