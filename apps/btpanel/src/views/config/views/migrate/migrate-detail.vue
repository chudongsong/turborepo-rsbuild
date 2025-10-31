<template>
	<div class="p-[2rem]">
		<p class="mb-[2rem] ml-[3.2rem] flex items-center">
			迁移数据大小：{{ otherSize }} ，当前服务器剩余空间：{{ sizeTotal }}
			<el-tooltip class="item" effect="dark" placement="top-start">
				<template #content>
					推断所需迁移空间:{{ getByteUnit(sizeData.use * 1.5) }} <br />
					说明:因数据备份需要复制后压缩，会比实际占用更多的空间，因此推断大小为迁移数据大小的1.5倍
				</template>
				<i class="svgtofont-el-warning-filled text-warning text-base ml-[0.4rem]"></i>
			</el-tooltip>
		</p>
		<div :class="`flex flex-row`">
			<span class="text-small text-secondary min-w-[8rem] text-right mr-[2rem]">备份数据</span>
			<el-collapse v-model="activeNames" class="flex-1" accordion>
				<!-- 网站 -->
				<el-collapse-item name="site">
					<template #title>
						<div class="flex items-center">
							<i class="svgtofont-left-home desc-i"></i>
							<span class="font-bold text-tertiary">网站</span>
							<el-popover trigger="hover" placement="top-start" width="400" content="备份网站是会自动备份Nginx配置，SSL证书，PHP配置，重定向和反向代理等除插件外与该网站相关的配置">
								<template #reference>
									<i class="svgtofont-el-question-filled text-warning text-base mx-[0.4rem]"></i>
								</template>
							</el-popover>
							<span v-if="!typeLoading.site" class="text-secondary text-small">（共{{ webList?.length || 0 }}个，共{{ webCount }}）</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>

					<bt-table v-bt-loading="typeLoading.site" v-bt-loading:title="'正在获取网站中，请稍后...'" :column="siteTableColumn" :data="webList" :max-height="200"></bt-table>
				</el-collapse-item>

				<!-- 数据库 -->
				<el-collapse-item name="database">
					<template #title>
						<div class="flex items-center">
							<i class="svgtofont-left-database desc-i"></i>
							<span class="font-bold text-tertiary">数据库</span>
							<span v-if="!typeLoading.database" class="text-secondary text-small">（共{{ dbList?.length || 0 }}个，共{{ dbCount }}）</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>
					<bt-table v-bt-loading="typeLoading.database" v-bt-loading:title="'正在获取数据库中，请稍后...'" :column="databaseColumn" :data="dbList" :max-height="200"></bt-table>
				</el-collapse-item>

				<!-- wptools -->
				<el-collapse-item name="wptools">
					<template #title>
						<div class="flex items-center">
							<i class="svgtofont-left-wp desc-i"></i>
							<span class="font-bold text-tertiary">Wp Tools</span>
							<span v-if="!typeLoading.wptools" class="text-secondary text-small ml-[0.4rem]">（共{{ wpList?.length || 0 }}个，共{{ wpCount }}）</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>

					<bt-table v-bt-loading="typeLoading.wptools" v-bt-loading:title="'正在获取网站中，请稍后...'" :column="wpToolsColumn" :data="wpList" :max-height="150"></bt-table>
				</el-collapse-item>

				<!-- 动态渲染其他项目 -->
				<template v-for="(config, key) in otherItemsConfig" :key="key">
					<el-collapse-item :name="key.toLowerCase()">
						<template #title>
							<div class="flex items-center">
								<i :class="`svgtofont-left-${config.icon} desc-i`"></i>
								<span class="font-bold text-tertiary">{{ config.title }}</span>
								<el-popover v-if="config.tooltip" trigger="hover" placement="top-start" width="400" :content="config.tooltip">
									<template #reference>
										<i class="svgtofont-el-question-filled text-warning text-base mx-[0.4rem]"></i>
									</template>
								</el-popover>
								<span v-if="!typeLoading[config.loadingKey.toLowerCase()]" class="text-secondary text-small">（共{{ otherData[config.dataKey]?.length || 0 }}个{{ config.count ? '，共' + countData(config.dataKey) : '' }}）</span>
								<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
								<template v-if="config.extraComponent">
									<component :is="config.extraComponent"></component>
								</template>
							</div>
						</template>

						<div v-bt-loading="typeLoading[config.loadingKey.toLowerCase()]" :v-bt-loading:title="`正在获取${config.title}中，请稍后...`">
							<div class="w-full max-h-[96px] overflow-y-auto border-css" v-if="otherData[config.dataKey].length">
								<template v-for="(item, index) in otherData[config.dataKey]" :key="index">
									<span class="w-[33.33%] inline-flex items-center px-[0.8rem] border-darker">
										<span class="check-name"> {{ item.name }}{{ item.size ? `(${getByteUnit(Number(item.size))})` : '' }} {{ item.total ? `(${item.total}条)` : '' }} </span>
									</span>
									<hr v-if="index + 1 !== 0 && (index + 1) % 3 === 0 && index + 1 !== otherData[config.dataKey].length" />
								</template>
							</div>
							<div class="empty-box" v-else>暂无数据</div>
						</div>
					</el-collapse-item>
				</template>

				<!-- 插件 -->
				<el-collapse-item name="plugin">
					<template #title>
						<div class="flex items-center">
							<i class="svgtofont-left-soft desc-i"></i>
							<span class="font-bold text-tertiary">插件</span>
							<span v-if="!typeLoading.plugin" class="text-secondary text-small ml-[0.4rem]">（共{{ pluginList?.length || 0 }}个）</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>
					<bt-table v-bt-loading="typeLoading.plugin" v-bt-loading:title="'正在获取插件中，请稍后...'" :column="pluginColumn" :data="pluginList" :max-height="150"></bt-table>
				</el-collapse-item>

				<!-- 运行环境 -->
				<el-collapse-item name="runtime">
					<template #title>
						<div class="flex items-center">
							<i class="svgtofont-el-monitor desc-i"></i>
							<span class="font-bold text-tertiary">运行环境</span>
							<span v-if="!typeLoading.runtime" class="text-secondary text-small ml-[0.4rem]">（共{{ runtimeList?.length || 0 }}个，共{{ runtimeCount }}）</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>
					<bt-table v-bt-loading="typeLoading.runtime" v-bt-loading:title="'正在获取运行环境中，请稍后...'" :column="runtimeColumn" :data="runtimeList" :max-height="150"></bt-table>
				</el-collapse-item>
			</el-collapse>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { getByteUnit } from '@/utils'
import { sizeData, sizeTotal, otherSize, getMigrateData, otherItemsConfig, wpList, webList, dbList, otherData, typeLoading, pluginList, runtimeList, webCount, dbCount, wpCount, runtimeCount, countData } from './useController'
import { siteTableColumn, databaseColumn, wpToolsColumn, pluginColumn, runtimeColumn } from '@/views/config/views/new-sync/add-back/useMethod'
const activeNames = ref('site') // 当前激活的面板

// 网站表格列配置
// const siteTableColumn = [
// 	{ label: '网站名称', prop: 'site_name' },
// 	{ label: '网站大小', render: (row: any) => getByteUnit(Number(row.site_size)) },
// 	{ label: '网站类型', prop: 'project_type' },
// ]

// // 数据库表格列配置
// const databaseColumn = [
// 	{ label: '数据库名称', prop: 'name' },
// 	{ label: '数据库大小', render: (row: any) => getByteUnit(Number(row.size)) },
// 	{ label: '数据库类型', prop: 'type', render: (row: any) => <span>MYSQL</span> },
// ]

// // wp工具表格列配置
// const wpToolsColumn = [
// 	{ label: '网站名称', prop: 'name', width: 120 },
// 	{ label: '网站大小', render: (row: any) => getByteUnit(Number(row.size)) },
// 	{ label: '状态', render: (row: any) => (row.type === 'local' ? '本地' : '远程') },
// ]

// // 插件表格列配置
// const pluginColumn = [
// 	{ label: '插件名称', prop: 'title' },
// 	{ label: '插件版本', prop: 'version' },
// 	{ label: '类型', prop: 'type' },
// ]

// // 运行环境表格列配置
// const runtimeColumn = [
// 	{ label: '运行环境', prop: 'name' },
// 	{ label: '版本', prop: 'version' },
// 	{ label: '大小', render: (row: any) => getByteUnit(Number(row.size)) },
// ]

onMounted(getMigrateData)
</script>

<style lang="css" scoped>
:deep(.el-checkbox__label) {
	font-size: var(--el-font-size-small);
}

.check-name {
	@apply h-[3.6rem] leading-[3.6rem] text-center text-secondary text-small truncate;
}

.empty-box {
	@apply w-full flex items-center justify-center h-[4rem] text-tertiary border-1 border-lighter border-t-0;
}

.border-css {
	@apply border-1 border-lighter border-t-0;
}

:deep(.el-table th.el-table__cell) {
	background: rgba(var(--el-color-white-rgb), 1);
}

:deep(.el-descriptions__label) {
	min-width: 90px !important;
}

:deep(.el-collapse-item__header) {
	font-size: var(--el-font-size-small);
	border-top: 1px solid var(--el-color-border-dark-tertiaryer);
	border-left: 1px solid var(--el-color-border-dark-tertiaryer);
	border-right: 1px solid var(--el-color-border-dark-tertiaryer);
	height: 36px;
	background: rgba(var(--el-file-color-light-rgb), 0.8);
	padding: 0 8px;
}

:deep(.el-collapse-item) {
	margin-bottom: 10px;
}

:deep(.el-collapse) {
	@apply border-none;
}

:deep(.el-collapse-item__wrap) {
	@apply border-none;
}

.desc-i {
	@apply !text-medium mr-[0.4rem] text-primary;
}

hr {
	@apply text-disabled;
}
</style>
