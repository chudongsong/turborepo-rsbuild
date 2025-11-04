<template>
	<bt-tabs v-model="defaultActive" type="left-bg-card" @change="handleOpen">
		<el-tab-pane label="服务" name="phpService">
			<div class="php-bottom mb-[12px]">
				<el-checkbox v-model="onPhpService" @change="changePHPStatus">启用公共访问权限</el-checkbox>
			</div>
			<PhpMyAdmin></PhpMyAdmin>
		</el-tab-pane>

		<el-tab-pane label="php版本" name="phpVersion">
			<div class="p-[20px]">
				<span>php版本</span>
				<el-select class="mx-[12px] !w-[15.6rem]" v-model="phpVersionSelect" placeholder="请选择">
					<el-option v-for="item in options" :key="item.version" :label="item.name" :value="item.version"> </el-option>
				</el-select>
				<el-button type="primary" @click="savePhpVersion({ phpversion: phpVersionSelect })">保存</el-button>
			</div>
			<!-- <bt-help :options="[{content: 'phpmyadmin-5.2最高仅支持php-8.2版本'}]" /> -->
		</el-tab-pane>

		<el-tab-pane label="安全设置" name="phpSafety">
			<div class="php-bottom flex items-center">
				<span class="mr-[12px]">访问端口</span><bt-input class="!mb-0 mr-[12px] !w-[14rem]" v-model="phpForm.phpPort" width="14rem" type="number"></bt-input>
				<el-button type="primary" @click="savePhpVersion({ port: phpForm.phpPort })">保存</el-button>
			</div>
			<div class="php-bottom flex flex-col">
				<div class="flex items-center">
					<span class="mr-[12px]">开启SSL</span>
					<el-switch v-model="phpForm.onSSL" @change="setPhpSSL" active-color="var(--el-color-primary)" inactive-color="#cdcdcd" class="!m-0"> </el-switch>
				</div>
				<div>
					<span class="mr-[12px]">SSL端口</span><bt-input class="!mb-0 mr-[12px] !w-[14rem]" v-model="phpForm.phpSSL" width="14rem" type="number"></bt-input>
					<el-button type="primary" @click="setSSLPort">保存</el-button>
				</div>
			</div>
			<div class="php-bottom flex-col">
				<div>
					<span class="mr-[12px]">密码访问</span>
					<el-switch v-model="phpForm.phpPass" active-color="var(--el-color-primary)" inactive-color="#cdcdcd" @change="changePassword" class="!m-0"> </el-switch>
				</div>
				<div>
					<el-form v-if="phpForm.phpPass" label-position="right" label-width="80px" class="-ml-3.2rem" :model="passForm">
						<el-form-item label="授权账号">
							<el-input v-model="passForm.username" placeholder="不修改请留空"></el-input>
						</el-form-item>
						<el-form-item label="访问密码">
							<el-input type="password" v-model="passForm.password" placeholder="不修改请留空"></el-input>
						</el-form-item>
						<el-form-item label="重复密码">
							<el-input type="password" v-model="passForm.repass" placeholder="不修改请留空"></el-input>
						</el-form-item>
						<el-form-item label=" ">
							<el-button type="primary" @click="savePHPPass">保存</el-button>
						</el-form-item>
					</el-form>
				</div>
			</div>
		</el-tab-pane>
	</bt-tabs>
</template>

<script lang="ts" setup>
import PhpMyAdmin from './service.vue'
import { onPhpService, options, phpVersionSelect, defaultActive, phpForm, passForm, onOpen, changePHPStatus, savePhpVersion, setPhpSSL, setSSLPort, changePassword, savePHPPass, handleOpen } from './useController'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

watchEffect(() => {
	// 监听菜单展示项
	if (typeof props.compData === 'string') {
		defaultActive.value = props.compData
	}
})

onMounted(onOpen)
</script>

<style lang="css" scoped>
.php-bottom {
	@apply border border-base border-bottom border-dashed border-t-0 border-l-0 border-r-0;
	@apply p-[20px];
}
.php-bottom div {
	@apply flex items-center mb-[8px];
}
.el-form .el-form-item--small.el-form-item + .el-form-item {
	margin-top: 1rem !important;
}
.el-input {
	margin-bottom: 0 !important;
}
:deep(.el-form .el-form-item--small .el-form-item__label) {
	min-width: 6rem !important;
}
</style>
