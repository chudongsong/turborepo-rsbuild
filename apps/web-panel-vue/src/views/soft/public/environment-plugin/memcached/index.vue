<template>
	<bt-tabs v-model="activeName" type="left-bg-card" @tab-click="handleTabClick">
		<el-tab-pane label="服务" name="service">
			<Status></Status>
		</el-tab-pane>

		<el-tab-pane label="配置文件" name="config">
			<span class="my-[4px] text-secondary">提示：Ctrl+F 搜索关键字，Ctrl+S 保存，Ctrl+H 查找替换</span>
			<div class="my-[12px]">
				<bt-editor v-bt-loading="textLoading" class="!h-[36rem] !w-[full]" v-model="staticContent" id="configContent" :filePath="`/etc/init.d/memcached`" />
			</div>
			<el-button @click="saveFileEvent" type="primary">保存</el-button>
			<ul class="leading-8 mt-20px text-small list-disc ml-[20px]">
				<li>此处为memcached主配置文件,若您不了解配置规则,请勿随意修改</li>
			</ul>
		</el-tab-pane>

		<!-- 只有一个版本,暂时移除 -->
		<!-- <el-tab-pane label="版本切换" name="version">
			<div class="flex text-secondary items-center">
				<span>选择版本</span>
				<el-select class="mx-[12px] !w-[18rem]" v-model="version">
					<el-option v-for="(item, index) in versionList" :key="index" :label="'memcached ' + item.m_version" :value="item.m_version"></el-option>
				</el-select>
				<el-button type="primary" @click="switchVersion(compData)">切换</el-button>
			</div>
		</el-tab-pane> -->

		<el-tab-pane label="负载状态" name="load">
			<el-table max-height="500" :data="tableData" border style="width: 100%" v-bt-loading="textLoading">
				<el-table-column prop="name" label="字段"> </el-table-column>
				<el-table-column prop="value" label="当前值"> </el-table-column>
				<el-table-column prop="ps" label="说明"> </el-table-column>
			</el-table>
		</el-tab-pane>

		<el-tab-pane label="性能调整" name="performance" v-bt-loading="viewLoading">
			<div class="flex flex-col text-secondary performance">
				<el-form :model="performanceForm">
					<el-form-item label="BindIp">
						<div class="flex items-center">
							<bt-input v-model="performanceForm.ip"></bt-input>
							<span class="unit">监听IP,请勿随意修改</span>
						</div>
					</el-form-item>
					<el-form-item label="PORT">
						<div class="flex items-center">
							<bt-input v-model="performanceForm.port" type="number"></bt-input>
							<span class="unit"> 监听端口,一般无需修改</span>
						</div>
					</el-form-item>
					<el-form-item label="CACHESIZE">
						<div class="flex items-center">
							<bt-input v-model="performanceForm.cachesize" type="number"></bt-input>
							<span class="unit"> MB,缓存大小,建议不要大于512M</span>
						</div>
					</el-form-item>
					<el-form-item label="MAXCONN">
						<div class="flex items-center">
							<bt-input v-model="performanceForm.maxconn" type="number"></bt-input>
							<span class="unit">最大连接数,建议不要大于40960</span>
						</div>
					</el-form-item>
					<el-form-item label=" ">
						<el-button @click="saveMemcachedData" type="primary">保存</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-tab-pane>
	</bt-tabs>
</template>

<script setup lang="ts">
import Status from '@soft/public/environment-plugin/public/service-status/index.vue'
import { activeName, staticContent, textLoading, viewLoading, tableData, version, versionList, performanceForm, handleTabClick, saveFileEvent, switchVersion, saveMemcachedData, init } from './useController'

interface Props {
	compData: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

onMounted(() => {
	init(props.compData)
})
</script>

<style lang="css" scoped>
.performance .el-input {
	width: 12rem !important;
	margin: 0 0.8rem;
}
.performance span {
	font-size: 1.2rem;
}
.el-table.el-table--border .el-table__cell {
	border-right: 1px solid var(--el-fill-color-dark) !important;
}
.el-divider {
	margin: 1rem 0 2rem 0;
}

.unit {
	color: var(--el-color-text-tertiary);
	margin-left: 4px;
}
</style>
