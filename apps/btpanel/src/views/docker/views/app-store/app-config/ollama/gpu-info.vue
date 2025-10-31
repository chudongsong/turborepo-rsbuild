<template>
	<div>
		<div v-if="compData.value.list && compData.value.list.length > 0">
			<div class="flex items-center mb-[2rem]">
				<span class="text-base leading-[2.1rem]">驱动版本：{{ gpuInfoData?.system?.version.driver }}</span>
				<span class="text-base leading-[2.1rem] ml-[2rem]">Cuda版本：{{ gpuInfoData?.system?.version.cuda }}</span>
			</div>
			<bt-tabs v-model="driverTab" @change="getGpuSystemInfo">
				<ElTabPane v-for="item in compData.value.list" :key="item.key" :name="item.key" :label="`gpu${item.key}`">
					<component :is="GpuComponent" :data="item.value" :cpuIndex="item.key" />
				</ElTabPane>
			</bt-tabs>
		</div>
		<div v-else>
			<el-empty description="未找到GPU设备或未安装GPU驱动" />
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { getGpuSystemInfo, gpuInfoData } from './useController'

import { ElProgress, ElTabPane } from 'element-plus'
import BtHelp from '@/components/form/bt-help'

const GpuComponent = defineComponent({
	props: {
		data: {
			type: Object,
			required: true,
		},
		cpuIndex: {
			type: Number,
			required: true,
		},
	},
	setup(props) {
		// 获取指定路径的值
		const getValueByPath = (path: string) => {
			if (path === 'cpuIndex') {
				return props.cpuIndex
			}
			return path.split('.').reduce((acc: any, key: string) => acc && acc[key], props.data) ?? 'null'
		}

		const gpuList = [
			{
				name: 'GPU',
				key: 'cpuIndex',
			},
			{
				name: '型号',
				key: 'name',
			},
			{
				name: '核心频率',
				key: 'clock.graphics',
				unit: 'MHz',
			},
			{
				name: '内存频率',
				key: 'clock.memory',
				unit: 'MHz',
			},
			{
				name: '显存大小',
				key: 'memory.size',
				// unit: 'MB',
			},
			{
				name: '已使用显存',
				key: 'memory.used',
				// unit: 'MB',
			},
			{
				name: '剩余显存',
				key: 'memory.free',
				// unit: 'MB',
			},
			{
				name: '当前功耗',
				key: 'power.current',
				unit: 'W',
			},
			{
				name: '最大功耗',
				key: 'power.max',
				unit: 'W',
			},
			{
				name: '风扇转速',
				key: 'fan',
				unit: '%',
			},
		]

		const helpList = [
			{
				content: '显示null说明可能因驱动版本过低或显卡版本过低无法获取对应数据',
			},
		]

		const proList = [
			{
				name: 'GPU使用率',
				key: 'utilization.gpu',
				unit: '%',
			},
			{
				name: 'GPU温度',
				key: 'temperature',
				unit: '°C',
			},
		]
		return () => (
			<div class="flex h-[41.5rem]">
				<div class="flex flex-1 justify-evenly">
					{proList.map(item => (
						<div>
							<div class="flex justify-center mb-[2rem]">{item.name}</div>
							<div class="p-[12px] flex flex-col items-start">
								<ElProgress width={170} type="circle" percentage={getValueByPath(item.key)} stroke-width={12} color="var(--el-color-primary)">
									{{
										default: () => (
											<div>
												<div class="font-bold text-medium">{getValueByPath(item.key) + (item.unit || '')}</div>
												<div class="mt-[1rem] text-base">{item.name}</div>
											</div>
										),
									}}
								</ElProgress>
							</div>
						</div>
					))}
				</div>
				<div class="flex flex-col items-center justify-start max-w-[20rem]">
					{gpuList.map(item => (
						<div class="flex items-center justify-start w-full text-base leading-[2.6rem]">
							<span>{item.name}：</span>
							<span>{getValueByPath(item.key)}</span>
							<span>{item.unit || ''}</span>
						</div>
					))}
					<BtHelp class="mt-[2.2rem]" options={helpList} />
				</div>
			</div>
		)
	},
})

const props = defineProps<{
	compData: Ref<{
		list: {
			key: number
			value: any
		}[]
	}>
}>()

const driverTab = ref(`${props.compData.value.list[0]?.key}` || '') // 驱动版本
</script>
