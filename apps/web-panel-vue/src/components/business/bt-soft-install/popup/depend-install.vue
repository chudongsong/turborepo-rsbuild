<template>
	<div class="p-20x">
		<div>
			<!-- 必要依赖 -->
			<div v-if="compData.need.length">
				<div class="flex items-center">
					<i class="svgtofont-el-warning-filled mr-8x text-titleLarge text-warning"></i><span class="text-base leading-10">检测到当前插件缺失安装必要环境{{ compData.need.join('、') }},是否安装？</span>
				</div>
			</div>
			<!-- 选装依赖 -->
			<div class="flex flex-col !mb-12x" v-if="compData.selected.length">
				<div class="flex items-center"><i class="svgtofont-el-warning-filled mr-8x text-titleLarge text-warning"></i><span class="text-base leading-10">检测到当前插件缺失选装依赖环境，请选择其一进行安装</span></div>
				<!-- 循环每组需要选择的依赖 --目前插件中需要选择的依赖插件只有phpmyadmin 暂时不做更深层次的处理 -->
				<div v-for="(group, index) in compData.selected" class="flex flex-col">
					<el-radio v-model="dependData" v-for="(item, index) in group" :key="index" :label="item" border class="!m-0 !mt-8x" size="small">{{ item }}</el-radio>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getPluginInfo } from '@api/global'
import { pluginInstallDialog } from '@/public/index'

interface compData {
	need: string[]
	select: Array<string[]>
}
interface Props {
	compData?: compData | any
}

// const { softData } = storeToRefs(softStore()) // 当前插件安装信息
// const { openPlugin } = softStore() // 打开插件安装界面
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})
const emit = defineEmits(['close'])

const dependData = ref('nginx') // 选中的依赖插件

/**
 * @description 提交依赖安装
 */
const submitDependent = async () => {
	try {
		let params_name: string = dependData.value
		if (props.compData.need.length) params_name = props.compData.need[0]
		// 查询对应选中依赖插件 打开新的依赖安装界面
		const data = await getPluginInfo({ sName: params_name })
		emit('close')
		pluginInstallDialog({
			name: params_name,
			type: 'i',
			// softData: data.data,
			pluginInfo: data.data,
		})
	} catch (error) {
		console.log(error)
	}
}

defineExpose({ onConfirm: submitDependent })
</script>
