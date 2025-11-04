<template>
	<div>
		<overview-header></overview-header>
		<overview-stat></overview-stat>
		<el-row :gutter="16">
			<!-- <el-col :span="12">
				<div class="overview-card">
					<overview-provider></overview-provider>
				</div>
			</el-col> -->
			<el-col :span="12">
				<div class="overview-card">
					<overview-today></overview-today>
				</div>
			</el-col>
			<el-col :span="12">
				<div class="overview-card">
					<overview-bounce></overview-bounce>
				</div>
			</el-col>
			<!-- <el-col :span="12">
				<div class="overview-card">
					<overview-unique></overview-unique>
				</div>
			</el-col>
			<el-col :span="12">
				<div class="overview-card">
					<overview-click></overview-click>
				</div>
			</el-col> -->
		</el-row>
	</div>
</template>

<script lang="ts" setup>
import { useOverview } from './useMethod'

import OverviewHeader from './header/index.vue'
import OverviewStat from './stat/index.vue'
import OverviewProvider from './provider/index.vue'
import OverviewToday from './today/index.vue'
import OverviewUnique from './rate/unique.vue'
import OverviewClick from './rate/click.vue'
import OverviewBounce from './rate/bounce.vue'

const { getOverview } = useOverview()

getOverview()
</script>

<style lang="scss" scoped>
.overview-card {
	padding: 14px 16px;
	border: 1px solid var(--el-color-border-extra-light);
	border-radius: var(--el-border-radius-base);
	margin-top: 16px;
}
</style>
