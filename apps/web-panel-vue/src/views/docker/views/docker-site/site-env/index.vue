<template>
	<div class="p-[20px]">
		<BtTabs @change="handleTabClick" />
	</div>
</template>

<script setup lang="tsx">
import { useHandleError, useMessage, useTabs } from '@/hooks/tools'

import PhpEnv from '@docker/views/docker-site/site-env/php-env/index.vue'
import JavaEnv from '@docker/views/docker-site/site-env/java-env/index.vue'
import PythonEnv from '@docker/views/docker-site/site-env/python-env/index.vue'
import GoEnv from '@docker/views/docker-site/site-env/go-env/index.vue'

import { useDockerSiteEnvStore } from '@docker/views/docker-site/site-env/useStore'

const { tabActive } = useDockerSiteEnvStore()

// const PhpEnv = defineAsyncComponent(() => import('@docker/views/docker-site/site-env/php-env/index.vue'));
// const JavaEnv = defineAsyncComponent(() => import('@docker/views/docker-site/site-env/java-env/index.vue'));
// const PythonEnv = defineAsyncComponent(() => import('@docker/views/docker-site/site-env/python-env/index.vue'));
// const GoEnv = defineAsyncComponent(() => import('@docker/views/docker-site/site-env/go-env/index.vue'));

const { BtTabs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: 'PHP',
			name: 'php',
			render: () => <PhpEnv />,
		},
		{
			label: 'JAVA',
			name: 'java',
			lazy: true,
			render: () => <JavaEnv />,
		},
		{
			label: 'Python',
			name: 'python',
			lazy: true,
			render: () => <PythonEnv />,
		},
		{
			label: 'GO',
			name: 'go',
			lazy: true,
			render: () => <GoEnv />,
		},
	],
})

const handleTabClick = (tab: string) => {
	console.log(tab, tabActive.value)
}

onMounted(() => {
	// 应用环境包隐藏底部按钮
	// if (tabActive.value === 'addPack') {
	// 	popupSetFooter(false);
	// }
})
</script>
