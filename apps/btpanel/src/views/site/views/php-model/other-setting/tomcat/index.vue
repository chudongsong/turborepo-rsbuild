<template>
	<div v-bt-loading="viewLoading">
		<bt-install-mask v-if="maskLayer" width="28rem">
			<template #content>
				请先安装tomcat，
				<bt-link @click="openPluginEvent" class="!text-small"> 立即安装 </bt-link>
			</template>
		</bt-install-mask>
		<div class="p-1rem relative">
			<el-checkbox v-model="formData.tomcat" @change="setTomcatEvent"> 启用Tomcat </el-checkbox>
			<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
				<li v-if="tomcatVersion">当前版本为Tomcat{{ tomcatVersion }} ,若您需要其它版本,请到软件商店- 所有软件 中切换；</li>
				<li>部署顺序: 安装Tomcat >> 创建站点 >> 上传并配置项目 >> 启用Tomcat</li>
				<li>若您的tomcat应用中有php脚本,访问时请添加.php扩展名</li>
				<li>开启成功后,大概需要1-5分钟时间生效!</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getSitePhpVersion, setTomcatSettings } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'
import { pluginInstallDialog } from '@/public'
import { useSiteStore } from '@site/useStore'

const { siteInfo } = useSiteStore()

const viewLoading = ref(false) // 页面加载loading
const maskLayer = ref(false) // 遮罩层
const formData = reactive({
	tomcat: false,
}) // 表单数据
const tomcatVersion = ref('') // tomcat版本

/**
 * @description 设置Tomcat事件
 */
const setTomcatEvent = () => {
	useDataHandle({
		loading: '正在设置，请稍后...',
		request: setTomcatSettings({ siteName: siteInfo.value.name }),
		message: true,
		success: (res: any) => {
			if (res.status) getTomcatData()
		},
	})
}

/**
 * @description 获取Tomcat数据
 */
const getTomcatData = async () => {
	useDataHandle({
		loading: viewLoading,
		request: getSitePhpVersion({ siteName: siteInfo.value.name }),
		success: (res: any) => {
			formData.tomcat = res.data.tomcat > 0 ? true : false
			maskLayer.value = !res.data.tomcatversion
			tomcatVersion.value = res.data.tomcatversion
		},
	})
}

const openPluginEvent = () => {
	pluginInstallDialog({
		name: 'tomcat',
		type: 'i',
	})
}

onMounted(getTomcatData)

defineExpose({
	init: getTomcatData,
})
</script>

<style scoped></style>
