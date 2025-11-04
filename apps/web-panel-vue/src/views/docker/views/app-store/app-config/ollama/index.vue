<template>
	<BtTabs />
</template>
<script lang="tsx" setup>
import { useTabs } from '@/hooks/tools';
import { useRequestCanceler } from '@hooks/tools/axios/model/axios-cancel' // 取消请求
import { gpuInfoData,getGpuSystemInfo } from './useController'

import ModelManager from './model-manager.vue';
import GpuInfo from './gpu-info.vue';
import ProcessInfo from './process-info.vue';

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
});

const gpuOpenStatus = ref(false) // gpu是否开启

const defaultActive = ref(props.compData.tabActive || 'manager'); // 菜单默认展开项

provide('gpuOpenStatus', gpuOpenStatus)

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	value: defaultActive,
	options: [
		{
			label: '模型管理',
			name: 'manager',
			lazy: true,
			render: () => <ModelManager compData={props.compData} />,
		},
		{
			label: '显卡信息',
			name: 'gpu',
			lazy: true,
			render: () => <GpuInfo compData={gpuInfoData} />,
		},
		{
			label: '进程信息',
			name: 'process',
			lazy: true,
			render: () => <ProcessInfo compData={gpuInfoData} />,
		},
	],
});

let timer: NodeJS.Timeout | null = null;
onMounted(() => {
	if(props.compData.appinfo && props.compData.appinfo.length > 0){
		const gpuObj = props.compData.appinfo.find((item:any) => item.fieldKey === 'gpu')
		if(gpuObj && gpuObj.fieldValue){
			// 开启了gpu
			gpuOpenStatus.value = true
		}
	}
	// 如果未开启gpu，则不进行轮询
	if(!gpuOpenStatus.value) {
		gpuInfoData.value = { system: false, list: [], tableList: [] }
		return
	}
	getGpuSystemInfo()
	// 轮询
	timer = setInterval(() => {
		// 取消初始化请求
		useRequestCanceler(['/mod/docker/gpu/get_all_device_info'])
		getGpuSystemInfo()
	}, 3000)
})

onUnmounted(() => {
	if(timer){
		clearInterval(timer)
	}
})

</script>