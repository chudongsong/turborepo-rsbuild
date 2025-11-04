<template>
	<div class="module-ui flex flex-col">
		<div class="module-ui-header">
			<div class="w-full flex justify-between items-center">
				<span @click="store.goSoft" class="cursor-pointer hover:text-primary font-alibaba-semibold">软件</span>
				<!-- 首页软件添加和移除设置 -->
				<el-popover popper-class="myPopover" placement="right-start" :visible="popShow" width="400" @show="store.showPopoverHandle('')">
					<div ref="containerRef" class="plugin-box p-[.8rem]" @mouseleave="store.leave">
						<!-- 搜索框 -->
						<div class="plugin-search">
							<!-- <el-autocomplete -->
							<el-input
								placeholder="请输入要搜索的应用"
								v-model="pluginKeyword"
								:fetch-suggestions="store.querySearch"
								:trigger-on-focus="false"
								class="search-input w-full"
								:popper-class="'soft-search-popover'"
								@keyup.enter.native="store.searchPluginHandle('select')"
								@select="store.searchPluginHandle()">
								<template #append>
									<el-button @click="store.searchPluginHandle('select')">
										<i class="svgtofont-el-search"></i>
									</el-button>
								</template>
							</el-input>
						</div>
						<!-- 已安装软件显示列表 -->
						<el-table :data="mySoftList" v-table-scroll-load="store.load" height="400" v-bt-loading="tableLoading">
							<el-table-column width="260" property="date" label="软件名称">
								<template #default="scope">
									<div class="pluginInfo">
										<img class="plugin-img" :src="store.renderSoftImages(scope.row.name)" />
										<span class="plugin-desc">{{ scope.row.title }} {{ scope.row.version }}</span>
									</div>
								</template>
							</el-table-column>
							<el-table-column property="setup" sortable label="首页显示" prop="index_display">
								<template #default="scope">
									<el-switch v-model="scope.row.index_display" active-color="var(--el-color-primary)" inactive-color="var(--el-color-text-disabled)" :width="32" size="small" @change="store.changeSwitchHandle(scope.row, scope.$index)"></el-switch>
								</template>
							</el-table-column>
						</el-table>
					</div>
					<template #reference>
						<el-button ref="softButton" class="soft-button-no-padding" type="default" title="软件自定义编辑" link @click="popShow = !popShow">
							<i class="svgtofont-el-more-filled text-default !text-large hover:text-primary inline-block" style="transform: rotate(90deg)" />
						</el-button>
					</template>
				</el-popover>
			</div>
		</div>
		<div v-bt-loading="isGetSoft" v-bt-loading:title="'正在获取软件列表，请稍后...'" class="wrapper module-ui-body soft-wrapper">
			<transition-group>
				<div v-for="(item, index) in softShowList" :key="item.name + '_id'" :class="item.title ? 'box-wrapper cursor-pointer relative' : ''">
					<template v-if="index < 12">
						<template v-if="item.id && item.setup">
							<div @click="store.openSoftView(item)">
								<i class="svgtofont-icon-drag !text-base text-secondary !hidden absolute right-6 top-6 cursor-move mover soft-move" @click.stop></i>
								<span v-if="item.tag" id="freeTagCon"></span>
								<div class="h-38 pt-5 w-full text-center flex justify-center items-center">
									<div class="w-[6rem] h-[6rem] rounded-large bg-dark flex items-center justify-center">
										<img :src="store.renderSoftImages(item.name)" class="w-[4rem]" :custom="!isDev" />
									</div>
								</div>
								<div class="text-tertiary h-9 leading-9 flex items-center justify-center pb-[8px]">
									<span class="w-full truncate text-center">
										{{ item.title.replace(/PHP-[{0-9},\.]+/, 'PHP-') + ' ' + item.version }}
										<i v-show="item.type === 5" :style="`color:${store.softStatusColor(item)}`" :class="`ml-[5px] svgtofont-icon-${store.softStatus(item)}`" />
									</span>
								</div>
							</div>
						</template>
						<template v-else-if="!isEmpty(item)">
							<div @click="store.openRecommendSoftView(item)" class="absolute rounded- left-2 top-2 py-.5 px-3 transform scale-75 bg-lighter text-tertiary opacity-80">推荐</div>
							<div class="h-38 pt-5 w-full text-center flex justify-center items-center">
								<div class="w-[6rem] h-[6rem] rounded-large bg-dark flex items-center justify-center">
									<img :src="`${isDev ? '/static/images' : '/static/img'}/soft_ico/ico-${item.name}.png`" class="w-[4rem]" />
								</div>
							</div>
							<div class="flex justify-center items-center h-9 leading-9 pb-[8px]">
								<div class="text-tertiary h-9 leading-9 w-full truncate text-center">{{ item.title }} {{ item.version }}<span class="text-btColor"></span></div>
							</div>
							<div class="flex justify-center align-middle mt-2 mb-4 opacity-70">
								<el-button type="default" size="small" @click="store.openSoftPreLink(item)" plain v-if="item.preview">预览</el-button>
								<el-button type="primary" size="small" plain v-if="!item.isBuy" @click="store.openLtdPayView(item)">购买</el-button>
								<el-button type="primary" size="small" plain v-if="item.isBuy && !item.install" @click="store.openInstall(item)">安装</el-button>
							</div>
						</template>
					</template>
				</div>
			</transition-group>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { isEmpty, isDev, isBoolean } from '@utils/index'
import { delayExecAsync } from '@/public/index'
import HOME_SOFTWARE_STORE from './store'
import { storeToRefs } from 'pinia'
import { checkExtensionType } from '@/plugin/hooks'

const store = HOME_SOFTWARE_STORE()
const { popShow, pluginKeyword, recommendList, containerRef, mySoftList, tableLoading, isGetSoft, softShowList } = storeToRefs(store)

watch(
	recommendList,
	val => {
		if (val.length > 0) {
			store.createSoftList()
		}
	},
	{ immediate: true }
)

onMounted(async () => {
	await delayExecAsync({
		promises: [store.getHomeInstallSoftData, store.getRecommendInfo],
		delay: 100,
	})
	// 专版挂载方法
	nextTick(() => {
		const { type } = checkExtensionType()
		if (type.includes('aliyun')) {
			const time = setInterval(async () => {
				if (window.$extension) {
					const plugin = await window.$extension()
					if (isBoolean(plugin.extensionElement) && !plugin.extensionElement) clearTimeout(time)
					if (plugin.extensionElement) {
						plugin.extensionElement()
						clearTimeout(time)
					}
				}
			}, 1000)
		}
	})
})
</script>

<style lang="css" scoped>
.wrapper {
	@apply grid-cols-4 grid-rows-3 w-full h-full flex-1;
	display: grid !important;
}
.wrapper-item {
	@apply flex items-center justify-center text-center h-full;
}

.wrapper-item:nth-child(-n + 4) {
	border-top: none;
}
.wrapper-item:nth-child(4n) {
	border-right: none;
}
.box-wrapper:hover {
	border-radius: var(--el-border-radius-extra-large);
	box-shadow: 0 0 38px rgb(100 100 100 / 8%) inset;
	-webkit-transition: all 0.25s ease;
	transition: all 0.25s ease;
}
.box-wrapper:hover .mover {
	display: block !important;
}
.ghost {
	border: 2px dashed var(--el-color-primary) !important;
	border-radius: var(--el-border-radius-extra-large);
}

.plugin-box .plugin-search {
	@apply flex items-center mb-[20px];
}
.plugin-box .plugin-search .search-title {
	@apply w-[80px] inline-block text-default leading-[30px] letter-spacing-[2px];
}
.plugin-box .plugin-search .search-input {
	/* width: 200px; */
}
.plugin-box .el-table {
	border: 0.5px solid var(--el-color-border-dark);
	box-sizing: border-box;
}
.plugin-box .pluginInfo {
	display: flex;
	align-items: center;
}
.plugin-box .plugin-img {
	@apply max-h-[20px] h-[20px]  mr-[5px] -mt-[1px] -mb-[1px] image-rendering-[webkit-optimize-contrast];
	image-rendering: -webkit-optimize-contrast;
}
.plugin-box .pageContainer {
	@apply mt-[20px] flex justify-end;
}
.remove {
	@apply absolute top-[1.5rem] left-[1.5rem] font-[14px] display-[none] color-danger font-weight-[600];
}
.wrapper-item:hover .remove {
	display: block;
}

.plugin-box .plugin-search {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}
.plugin-search .search-title {
	width: 86px;
	display: inline-block;
	color: var(--el-color-text-primary);
	letter-spacing: 2px;
	line-height: 30px;
}
.plugin-search .search-input {
	width: 100%;
}

.plugin-box .el-table {
	border: 0.5px solid var(--el-color-border-dark);
	box-sizing: border-box;
}
.plugin-box .pluginInfo {
	display: flex;
	align-items: center;
}
.plugin-img {
	width: 20px;
	height: 20px;
	margin-right: 5px;
	margin-top: -1px;
	margin-bottom: -1px;
	image-rendering: -webkit-optimize-contrast;
}
.pageContainer {
	margin-top: 20px;
	display: flex;
	justify-content: flex-end;
}

.iconfont {
	font-family: 'iconfont' !important;
	font-size: var(--el-font-size-medium);
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.icon-yichu:before {
	content: '\e66a';
}
.remove {
	position: absolute;
	top: 1.5rem;
	left: 1.5rem;
	font-size: var(--el-font-size-base);
	display: none;
	color: var(--el-color-danger);
	font-weight: 600;
}

.wrapper-item :hover .remove {
	display: block;
}

:deep(.el-switch__core) {
	width: 30px !important;
	height: 16px;
}

.el-switch__core::after {
	width: 20px;
	height: 20px;
	margin-top: -1px;
}

.el-switch.is-checked .el-switch__core::after {
	margin-left: -15px;
}
.soft-button-no-padding {
	padding: 0 !important;
}
</style>
