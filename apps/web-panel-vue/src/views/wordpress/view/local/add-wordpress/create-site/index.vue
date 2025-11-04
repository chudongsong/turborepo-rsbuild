<template>
	<div>
		<BtForm />
		<div class="software-mask" v-if="!php.setup || !mysql.setup"></div>
		<div class="software-install" v-if="!php.setup || !mysql.setup">
			<div class="software-view">
				<bt-icon icon="el-warning" :size="30" class="mr-[8px]" color="orange" />
				<span class="text-base font-black">服务器未安装，</span>
				<span class="bt-link text-base" v-if="!php.setup" @click="getSoftwareInstall('php-7.4')">安装PHP</span>
				<bt-divider v-if="!php.setup && !mysql.setup" />
				<span class="text-base bt-link" v-if="!mysql.setup" @click="getSoftwareInstall('mysql')">安装MySQL</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import useWPLocalAddStore from '@/views/wordpress/view/local/add-wordpress/useStore'
import { getAddWordpressFormOption, getSoftwareInstall, onCreateConfirm } from '@/views/wordpress/view/local/add-wordpress/useController'

const { addWordpressFormData, mysql, php, createSiteSubmit } = storeToRefs(useWPLocalAddStore())
const { getInitData, resetCreateForm } = useWPLocalAddStore()

const { BtForm, submit } = useForm({
	data: () => addWordpressFormData.value,
	options: () => getAddWordpressFormOption(),
	submit: onCreateConfirm,
})

onMounted(() => {
	getInitData()
	createSiteSubmit.value = submit
	resetCreateForm()
})
</script>

<style scoped>
.software-mask {
	position: absolute;
	left: 0;
	top: 0;
	background-color: rgba(var(--el-color-white-rgb), 1);
	opacity: 0.7;
	height: 100%;
	width: 100%;
	z-index: 3000;
	border-radius: var(--el-border-radius-medium);
	/* // Assuming 'rounded-base' maps to 0.5rem */
}

.software-install {
	display: flex;
	justify-content: center;
}

.software-view {
	box-shadow: 0 0 10px 1px var(--el-fill-color);
	border: 1px solid var(--el-color-border-extra-light);
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;
	padding-left: 24px;
	padding-right: 24px;
	border-radius: var(--el-border-radius-small);
	position: absolute;
	z-index: 3008;
	background-color: rgba(var(--el-color-white-rgb), 1);
	margin: auto;
	width: fit-content;
	height: fit-content;
	right: 0;
	left: 0;
	top: 0;
	bottom: 0;
}
</style>
