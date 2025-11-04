<template>
	<div class="p-[20px]">
		<bt-tabs v-model="tabActive" @change="tabClick">
    	<el-tab-pane label="环境日志" name="run">
				<BtLog :content="logContent" class="max-h-[45rem] h-[45rem]" :fullScreen="{ title: '全屏查看-环境日志', onRefresh: ()=>tabClick('run') }" />
			</el-tab-pane>
    	<el-tab-pane label="构建日志" name="build" lazy>
				<BtLog :content="logContent" class="max-h-[45rem] h-[45rem]" :fullScreen="{ title: '全屏查看-构建日志', onRefresh: ()=>tabClick('build') }" />
			</el-tab-pane>
		</bt-tabs>
	</div>
</template>

<script setup lang="tsx">
import { tabClick } from './useController';
import {useDockerSiteLogStore} from './useStore'

import BtLog from '@components/extension/bt-log/index.vue';
interface Props {
	compData: 'build' | 'run'
}

const props = withDefaults(defineProps<Props>(), {
	compData: 'run',
})

const {tabActive,logContent} = useDockerSiteLogStore()


onMounted(() => {
	tabClick(props.compData || 'run')
});

</script>
