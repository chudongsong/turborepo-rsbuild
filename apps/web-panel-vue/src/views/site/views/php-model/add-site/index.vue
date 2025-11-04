<template>
	<div class="p-[20px]">
		<el-alert v-if="!ignoreAdStatus" class="!mb-[1rem]" type="info" :closable="closeable" close-text="不再显示" show-icon @mouseenter="closeable = true" @mouseleave="closeable = false" @close="ignoreAd">
			<div class="flex text-small" v-html="adMsg"></div>
		</el-alert>
		<BtTabs />
	</div>
</template>

<script setup lang="tsx">
import { useHandleError, useMessage, useTabs } from '@/hooks/tools'
import { getIgnoreAd, ignoreAd as ignoreAdApi } from '@api/site'
// import AddSiteDefault from '@site/views/php-model/add-site/add-default/index.vue'
import { useMountExtension } from '@/plugin/hooks'
import { useGlobalStore } from '@/store/global'
import { getFtpMysqlStatus } from '@api/site'
import AddSiteDefault from '@site/views/php-model/add-site/add-default/index.vue'
import AddSwoole from '@site/views/php-model/add-site/add-swoole/index.vue'
import AddThinkphp from '@site/views/php-model/add-site/add-thinkphp/index.vue'
import AddUniversal from '@site/views/php-model/add-site/add-universal/index.vue'
import AddDeployment from '@site/views/php-model/add-site/add-deployment/index.vue'
import BatchAddSite from '@site/views/php-model/add-site/batch-add-site/index.vue'
// import AppEnvPack from '@site/views/php-model/add-site/app-env-pack/index.vue'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const { plugin } = useGlobalStore()
const ignoreAdStatus = ref(true)
const closeable = ref(false)
const adMsg = ref('')

const Message = useMessage() // 消息提示
const tabActive = ref('addSiteDefault')
const addRefs = ref<any>(null)

const popupSetFooter = inject('popupSetFooter', (val: boolean) => {}) // 弹窗切换底部按钮展示

const getStatus = async () => {
	try {
		const { data } = await getFtpMysqlStatus()
		return { ftp: data.ftp, mysql: data.mysql }
	} catch (error) {
		useHandleError(error)
	}
}
const { typeList, refresh } = props.compData

const { BtTabs, tabsRefs } = useTabs({
	type: 'card',
	value: tabActive,
	options: [
		{
			label: '传统项目',
			name: 'addSiteDefault',
			lazy: true,
			render: <AddSiteDefault compData={{ getStatus, typeList, refresh }} />,
		},
		{
			label: 'swoole异步项目',
			name: 'addSwoole',
			lazy: true,
			render: <AddSwoole compData={{ getStatus }} />,
		},
		{
			label: 'thinkphp异步项目',
			name: 'addThinkphp',
			lazy: true,
			render: <AddThinkphp compData={{ getStatus }} />,
		},
		{
			label: '异步项目',
			name: 'addUniversal',
			lazy: true,
			render: <AddUniversal compData={{ getStatus }} />,
		},
		{
			label: '一键部署',
			name: 'addDeployment',
			lazy: true,
			render: <AddDeployment compData={{ getStatus }} />,
		},
		{
			label: '批量创建',
			name: 'batchAddSite',
			lazy: true,
			render: <BatchAddSite />,
		},
		// {
		// 	label: '应用环境包',
		// 	name: 'addPack',
		// 	lazy: true,
		// 	render: <AppEnvPack />,
		// },
	],
})

watch(
	() => tabActive.value,
	val => {
		popupSetFooter(val !== 'addPack')
	}
)

const onConfirm = async (close: any) => {
	if ((tabActive.value === 'addSwoole' || tabActive.value === 'addThinkphp' || tabActive.value === 'addUniversal') && plugin.value.webserver !== 'nginx') return Message.error(`当前仅支持nginx服务器使用`)
	tabsRefs()[tabActive.value].onConfirm(close)
}

const ignoreAd = async () => {
	ignoreAdApi()
	ignoreAdStatus.value = true
}

onMounted(async () => {
	// 应用环境包隐藏底部按钮
	if (tabActive.value === 'addPack') {
		popupSetFooter(false)
	}
	// 是否展示广告
	const { data } = await getIgnoreAd()
	const showAd = !data?.status
	adMsg.value = data?.msg || ''
	const extension = await useMountExtension({})
	ignoreAdStatus.value = !showAd && !extension
})

defineExpose({ onConfirm, getStatus })
</script>
