<template>
	<div class="p-[20px]">
		<BtTabs />
	</div>
</template>

<script setup lang="tsx">
import { useTabs } from '@/hooks/tools';

import AddByEnv from '@docker/views/docker-site/create-site/create-env/index.vue';
import AddByProxy from '@docker/views/docker-site/create-site/create-proxy/index.vue';
import AddByApp from '@docker/views/docker-site/create-site/create-app/index.vue';

interface Props {
	compData: any;
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
});

const tabActive = ref(props.compData.type || 'runEnv');

const { BtTabs,tabsRefs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '运行环境',
			name: 'runEnv',
			render: () => <AddByEnv compData={props.compData.type === 'runEnv' ? props.compData.formData:false} />,
		},
		{
			label: '反代容器',
			name: 'proxyContainer',
			lazy: true,
			render: () => <AddByProxy/>,
		},
		{
			label: '从应用创建',
			name: 'addPack',
			lazy: true,
			render: () => <AddByApp />,
		},
	],
});

const onConfirm = async (close: any) => {
	// if ( plugin.value.webserver !== 'nginx')
	// 	return Message.error(`当前仅支持nginx服务器使用`);

	const tebRef = tabsRefs()
	tebRef[tabActive.value].onConfirm(close)
};

defineExpose({ onConfirm });
</script>
