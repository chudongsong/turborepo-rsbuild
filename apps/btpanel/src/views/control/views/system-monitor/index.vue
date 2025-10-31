<template>
	<section>
		<!-- 设置监控 -->
		<el-row :span="24" class="module-ui !rounded-medium !px-[1.6rem] !py-[1.2rem]">
			<el-col :span="24" class="flex">
				<div class="w-full flex justify-start items-center top_all text-small">
					<!-- 开启监控 -->
					<div class="monitor">
						<span class="mr-8px align-middle">开启监控</span>
						<el-switch v-model="controlValue" checked @change="SetControl(true)"></el-switch>
					</div>
					<!-- 保存天数： -->
					<div class="flex items-center flex-row ml-8px">
						<span class="whitespace-nowrap">保存天数：</span><bt-input width="8.4rem" type="number" v-model="dayAll"></bt-input>
						<el-button class="ml-8px" @click="SetControl()" type="">更改</el-button>
					</div>

					<bt-divider style="margin: 0 2rem; height: 2rem" />

					<!-- 日志大小 -->
					<span class="mr-[3.125rem]">监控日志大小：{{ getByteUnit(logsSize) }}</span>
					<el-button @click="CloseControl()">清空记录</el-button>
				</div>
			</el-col>
		</el-row>

		<el-row class="mt-[1.2rem]">
			<el-col :span="24">
				<control-card ref="loadRef" v-model:controlValue="controlValue" :title="load.title" :active="load.active" :compData="load.echartsOption" :unitVisible="load.unitVisible" type="load" @reset="reset"></control-card>
			</el-col>
		</el-row>

		<!-- cpu\内存 -->
		<el-row class="mt-[1.2rem]" :gutter="24" :span="24">
			<el-col :md="12" :sm="24" :span="12" :xs="24">
				<!-- cpu -->
				<control-card ref="cpuRef" v-model:controlValue="controlValue" :title="cpu.title" :active="cpu.active" :compData="cpu.echartsOption" :unitVisible="cpu.unitVisible" type="cpu" @reset="reset" />
			</el-col>
			<el-col :md="12" :sm="24" :span="12" :xs="24">
				<!-- 内存 -->
				<control-card ref="memRef" v-model:controlValue="controlValue" :title="mem.title" :active="mem.active" :compData="mem.echartsOption" :unitVisible="mem.unitVisible" type="mem" @reset="reset" />
			</el-col>
		</el-row>
		<!-- 磁盘、网络 -->
		<el-row class="mt-[1.2rem]" :gutter="24" :span="24">
			<el-col :md="24" :sm="24" :lg="12" :span="12" :xs="24">
				<!--磁盘IO-->
				<control-card ref="diskRef" v-model:controlValue="controlValue" :title="disk.title" :active="disk.active" :compData="disk.echartsOption" :unitVisible="disk.unitVisible" type="disk" @reset="reset"></control-card>
			</el-col>
			<el-col :md="24" :lg="12" :sm="24" :span="12" :xs="24">
				<!-- 网络IO -->
				<control-card ref="networkRef" v-model:controlValue="controlValue" :title="network.title" :active="network.active" :compData="network.echartsOption" :unitVisible="network.unitVisible" :selectList="network.selectList" type="network" @reset="reset"></control-card>
			</el-col>
		</el-row>
		<!-- 平均负载 -->
	</section>
</template>

<script lang="ts" setup>
import { getByteUnit } from '@utils/index'
import ControlCard from '@control/views/system-monitor/control-card/index.vue'
import { SetControl, CloseControl, controlValue, dayAll, logsSize, load, cpu, mem, disk, network, GetStatus, initAllData } from './useController'

const loadRef = useTemplateRef('loadRef')
const cpuRef = useTemplateRef('cpuRef')
const memRef = useTemplateRef('memRef')
const diskRef = useTemplateRef('diskRef')
const networkRef = useTemplateRef('networkRef')

const reset = (chartId: string) => {
	loadRef.value?.closeTooltip(chartId)
	cpuRef.value?.closeTooltip(chartId)
	memRef.value?.closeTooltip(chartId)
	diskRef.value?.closeTooltip(chartId)
	networkRef.value?.closeTooltip(chartId)
}

onMounted(async () => {
	await GetStatus()
	initAllData()
})
</script>

<style lang="css">
em {
	@apply leading-[2rem];
}
.is-always-shadow {
	box-shadow: 0 1px 2px 1px rgba(var(--el-color-black-rgb), 0.05);
}
.echarts-tooltip {
	@apply w-[25rem] flex flex-col text-default text-small rounded-base transition-all duration-500 bg-[rgba(var(--el-color-white-rgb),1)];
}
.echarts-tooltip .formatter-header {
	@apply py-0 px-[15px]  h-[40px] leading-[40px] text-base rounded-t-base flex items-center;
}
.echarts-tooltip .formatter-header img {
	@apply mr-[5px] w-[20px] h-[20px];
}
.echarts-tooltip .formatter-body {
	@apply p-[2rem];
}
.select-data {
	@apply flex items-center text-base mb-[.5rem] py-0 px-[.125rem];
}
.select-data .flex {
	@apply flex items-center mr-[.9375rem];
}
.select-data .flex:last-child {
	@apply mr-0;
}
.select-data .status {
	@apply inline-block w-[1.2rem] h-[1.2rem] rounded-round mr-[.5rem] bg-warning;
}
.process-top5.hide {
	@apply hidden;
}
.process-top5 table {
	@apply border-collapse table-fixed w-[100%];
}
.process-top5 table thead tr {
	@apply bg-[rgba(var(--el-color-white-rgb),1)] text-secondary;
}
.process-top5 table thead th {
	@apply h-[24px] leading-[24px] text-left font-semibold;
}
.process-top5 table tbody tr {
	@apply border-b-[0.5px] border-light border-solid h-[22px] leading-[22px] text-left;
}
.process-top5 table tbody tr:last-child {
	@apply border-b-[0];
}
.process-top5 table tbody td {
	@apply truncate;
}
.process-header {
	@apply pl-[.5rem] ml-[.125rem] mb-[.9375rem] border-b-[0.0625rem] border-[var(--el-color-border-extra-light)] border-solid;
}
.process-top5 table thead th,
.process-top5 table tbody td {
	@apply pl-[.5rem] pr-[.5rem] text-small border-0;
}
.process-top5 table thead tr {
	@apply border-0;
}
.top_all .monitor {
	@apply w-[10rem] h-[2rem] mr-[3.125rem] flex items-center;
}
</style>
