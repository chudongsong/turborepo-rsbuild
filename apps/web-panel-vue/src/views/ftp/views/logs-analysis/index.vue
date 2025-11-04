<template>
	<div class="ftp-log-scan">
		<div class="scan-header">
			<div class="scan-header-left">
				<i class="svgtofont-icon-ftp-log !text-large54 text-tertiary mr-16px"></i>
				<div class="scan-header-title">
					<div v-if="!ftpAnalysisList.scanStatus">FTP日志扫描，快速扫描当前FTP的安全详情</div>
					<div v-else>扫描完成，{{ ftpAnalysisList.data.length ? '共扫描出' + ftpAnalysisList.data.length + '条风险记录' : '未扫描出风险记录' }}</div>
					<p>
						推荐定期自动扫描功能，定期扫描生成分析结果并发送通知【
						<span class="bt-link" @click="openLogsAnalysis(0)">
							{{ ftpAnalysisList.autoScanText }}
						</span>
						】
					</p>
				</div>
			</div>
			<el-button class="scan-header-btn" type="primary" :title="ftpAnalysisList.btn" @click="openLogsAnalysis(1)">
				{{ ftpAnalysisList.btn }}
			</el-button>
		</div>
		<div class="scan-content">
			<div class="scan-content-preview" v-if="!ftpAnalysisList.scanStatus">
				<div>支持以下FTP日志安全风险扫描：</div>
				<div class="scan-content-preview-list">
					<div class="preview-list-item" v-for="(item, index) in scanList" :key="index">
						<i :class="`svgtofont-icon-${item.icon} text-extraLarge mr-4px text-tertiary`"></i>
						<span class="text-small">{{ item.title }}</span>
					</div>
				</div>
			</div>
			<div v-else>
				<el-button class="!mb-[1rem]" @click="openFtpLogsWhiteListEvent"> 白名单 </el-button>
				<bt-table ref="ftpScanTable" max-height="310" :column="useLogsScanTableColumn" :data="ftpAnalysisList.data" :description="'扫描列表为空'" />
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { $reset, openFtpLogsWhiteListEvent, openLogsAnalysis, scanList, useLogsScanTableColumn } from './useMethod'
import { useFtpAnalysisStore } from './useStore'

const { ftpAnalysisList, ftpScanTable } = useFtpAnalysisStore()

defineExpose($reset)
</script>

<style lang="css" scoped>
.ftp-log-scan {
	display: flex;
	flex-direction: column;
	padding: 3rem;
	height: 100%;
}

.scan-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.scan-header-left {
	display: flex;
	align-items: center;
}

.scan-header-title {
	display: flex;
	flex-direction: column;
}

.scan-header-title div {
	font-size: var(--el-font-size-medium);
	color: var(--el-color-text-primary);
}

.scan-header-title p {
	font-size: var(--el-font-size-small);
	color: var(--el-color-text-secondary);
	margin-top: 10px;
}

.scan-header-btn {
	width: 10rem;
	height: 3.8rem;
}

.scan-content {
	margin-top: 3rem;
	flex: 1;
}

.scan-content-preview {
	font-size: var(--el-font-size-small);
	color: var(--el-color-text-secondary);
	height: 100%;
	padding: 20px;
	border: 0.1rem solid var(--el-color-border-dark);
	border-radius: var(--el-border-radius-base);
}

.scan-content-preview-list {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 4px;
	margin-top: 2rem;
}

.preview-list-item {
	display: flex;
	align-items: center;
	font-size: var(--el-font-size-base);
	margin-bottom: 6px;
}

.preview-list-item-icon {
	display: inline-block;
	width: 2rem;
	height: 2rem;
	margin-right: 0.6rem;
}
</style>
