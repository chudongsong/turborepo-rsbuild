<template>
	<div class="install-plugin">
		<!-- 插件头部展示 -->
		<div class="header">
			<div class="header-left">
				<bt-image :src="pluginImgSrc" class="h-[35px] w-[40px] mr-[10px]" type="img">
					<template #error>
						<img src="/static/images/soft_ico/icon_plug.svg" class="w-[4rem] h-[4rem]" alt="" />
					</template>
				</bt-image>
				<div class="header-title">
					<span class="text-medium font-bold flex items-center truncate h-[20px]">
						{{ pluginTitle }}
						<span class="ml-[4px]">{{ pluginModuleInfo.currentVersion || pluginActiveInfo.fullVersion }}</span>
						<span v-if="!pluginModuleInfo.isSystem && pluginModuleInfo.type !== 13 && pluginLabel.length > 0" :class="pluginLabel[2] + ' border-[1px] p-[4px] font-500 text-base ml-[5px]'">{{ pluginLabel[1] }}</span>
					</span>
					<span class="mt-[8px]">
						<span class="mr-[10px] text-tertiary text-base flex items-center">
							<template v-if="pluginModuleInfo.isUpdate">
								<el-badge is-dot class="item"> 最新版本：{{ `${pluginActiveInfo.fullVersion}` }} </el-badge>
							</template>
							<template v-if="!pluginModuleInfo.isSystem && (pluginModuleInfo.isInstall || pluginModuleInfo.isUpdate)">
								<bt-divider v-if="!pluginModuleInfo.isInstall" />
								<span>更新时间：{{ pluginActiveInfo.updateTime }}</span>
								<bt-divider />
								<bt-link class="font-normal" @click="historyVersionDialog(pluginModuleInfo)">
									<span class="text-base">更新日志</span>
								</bt-link>
							</template>
						</span>
					</span>
				</div>
			</div>
			<div class="header-right">
				<template v-if="versionModel.version.length > 1 && pluginModuleInfo.isInstall">
					<el-select v-model="versionModel.value" class="!w-[140px]" @change="cutPluginActiveInfo">
						<el-option v-for="item in versionModel.version" :key="item.key" :value="item.key" :disabled="item.disabled" :label="item.title"></el-option>
					</el-select>
					<bt-divider class="mx-[1rem]" />
				</template>
				<template v-if="pluginModuleInfo.isSystem && pluginModuleInfo.isInstall">
					<el-tooltip v-if="pluginModuleInfo.compile" placement="top" :enterable="true">
						<template #content>
							<span>安装时间较长，性能最大化，适合生产环境</span>
						</template>
						<el-button class="mr-[4px]" @click="install(0)">编译安装</el-button>
					</el-tooltip>
					<el-tooltip placement="top" :enterable="false">
						<template #content>
							<span>安装时间极快，版本与稳定性略低于编译安装，适合快速部署测试</span>
						</template>
						<el-button type="primary" @click="install(1)">{{ pluginModuleInfo.compile ? '极速安装' : '立即安装' }}</el-button>
					</el-tooltip>
				</template>
				<el-button v-else-if="pluginModuleInfo.isInstall" type="primary" @click="install()"> 立即安装 </el-button>
				<el-button v-if="pluginModuleInfo.isRepair" type="primary" @click="repair()"> 立即修复 </el-button>
				<el-button v-if="pluginModuleInfo.isUpdate" type="primary" @click="update()"> 立即更新 </el-button>
			</div>
		</div>
		<!-- 插件介绍图片 -->
		<el-tabs v-if="pluginModuleInfo.introduction.length" tab-position="left" class="carousel">
			<el-tab-pane v-for="(item, index) in pluginModuleInfo.introduction" :label="item[0]" lazy :key="index">
				<el-image :src="pluginPictureSrc(index)" class="max-h-[100%] object-scale-down" :preview-src-list="[pluginPictureSrc(index)]" />
			</el-tab-pane>
		</el-tabs>
		<!-- 插件说明和介绍 -->
		<div class="illustrate">
			<template v-if="!pluginModuleInfo.isUpdate">
				<div class="title">插件说明：</div>
				<div class="content" v-html="pluginModuleInfo.ps"></div>
			</template>
			<template v-else>
				<div class="title">更新日志：</div>
				<div class="content" v-html="pluginActiveInfo.updateMsg"></div>
			</template>
		</div>
		<!-- 插件提示 -->
		<ul class="tips-list">
			<li>如果已存在此插件，文件将被替换！</li>
			<li v-if="!pluginModuleInfo.isSystem" class="!text-danger">请手动安装插件扩展和依赖环境，如果未安装，将无法正常使用该插件</li>
			<li v-if="pluginModuleInfo.isMysqlUpdate" class="!text-danger">更新数据库有风险,建议在更新前,先备份您的数据库！</li>
			<template v-if="pluginModuleInfo.isUpdate">
				<li class="!text-danger">更新过程可能会导致服务中断,请须知</li>
				<li class="!text-danger">建议您在服务器负载闲时进行软件更新</li>
			</template>
			<li v-else>安装过程可能需要几分钟时间，请耐心等候!</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { PluginInstallOptions } from '@/public/types'
import { historyVersionDialog } from './popup'
import { INSTALL_STORE, useIntstallStore } from './store'

const installStore = INSTALL_STORE()
const { init, cutPluginActiveInfo, install, repair, update, pluginPictureSrc, $reset } = installStore

const { pluginModuleInfo, pluginActiveInfo, versionModel, pluginImgSrc, pluginTitle, pluginLabel, compData } = useIntstallStore()

const props = withDefaults(
	defineProps<{
		compData: PluginInstallOptions
	}>(),
	{
		compData: () => ({
			type: 'i',
			name: '',
			pluginInfo: undefined,
		}),
	}
)

const emits = defineEmits(['close', 'refresh'])

onMounted(async () => {
	compData.value = props.compData
	await init()
})

onUnmounted(() => {
	$reset()
})
</script>

<style lang="css" scoped>
.install-plugin {
	@apply px-[30px] pt-[30px] pb-[10px];
}

.header {
	@apply flex justify-between items-center pb-[20px];
}

.header-left,
.header-right {
	@apply flex items-center;
}

.header-title {
	@apply flex flex-col ml-[8px];
}

.carousel {
	@apply flex h-[368px] px-[10px] pt-[20px] pb-[20px] border-t border-light border-lighter;
}

.plugin-carousel-tab {
	@apply max-w-[100px] mt-[16px] mr-[18px] min-w-[90px] border-r-[1px] border-light text-secondary flex-1 overflow-x-hidden;
}

.plugin-carousel-tab li {
	@apply leading-[36px] cursor-pointer text-base relative pr-[10px] text-right;
}

.plugin-carousel-tab li.on {
	@apply border-r-[3px] border-primary text-primary font-bold;
}

.plugin-carousel-image {
	@apply w-[400px] max-h-[100%];
}

.illustrate {
	@apply pl-[25px];
}

.illustrate .title {
	@apply text-secondary font-bold text-base mt-[5px];
}

.illustrate .content {
	@apply text-secondary mt-[10px] text-small leading-[24px];
}

.tips-list {
	@apply relative px-[38px] pb-[20px] mt-[16px] text-secondary list-none;
}

.tips-list li {
	@apply text-secondary list-disc mt-[4px];
}

:deep(.el-image-viewer__wrapper) {
	z-index: 99999999999 !important;
}
</style>
