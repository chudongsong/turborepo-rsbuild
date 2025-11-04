<!-- 防盗链 批量+设置中使用 -->
<template>
	<div class="p-[20px]" v-bt-loading="viewLoading">
		<el-form ref="hotFormRef" :model="hotLinkProtectForm" :rules="rules">
			<el-form-item label="URL后缀" prop="fix"><bt-input v-model="hotLinkProtectForm.fix" width="30rem"></bt-input></el-form-item>
			<el-form-item label="许可域名">
				<bt-input width="30rem" v-model="hotLinkProtectForm.domains" type="textarea" resize="none" :rows="8" placeholder="默认添加主域名，可追加其他的允许域名，一行一个，可为空"></bt-input>
			</el-form-item>
			<el-form-item label="响应资源" prop="return_rule"><bt-input width="30rem" v-model="hotLinkProtectForm.return_rule"></bt-input></el-form-item>
			<el-form-item label=" ">
				<el-checkbox v-model="hotLinkProtectForm.status" @change="handleChangeStatus">启用防盗链</el-checkbox>
				<el-checkbox :disabled="!hotLinkProtectForm.status" :title="`${!hotLinkProtectForm.status ? '需开启防盗链' : ''}`" v-model="hotLinkProtectForm.http_status" @change="handleChangeHttp"> 允许空HTTP_REFERER请求 </el-checkbox>
			</el-form-item>
			<el-form-item label=" " v-if="!isMult"><el-button type="primary" @click="onConfirm()">保存</el-button></el-form-item>
		</el-form>
		<bt-help v-if="!isMult" :options="helpList" class="ml-[20px] mt-[20px]"></bt-help>
	</div>
</template>

<script setup lang="ts">
import { getData, handleChangeHttp, handleChangeStatus, helpList, hotFormRef, hotLinkProtectForm, isMult, onConfirm, rules, viewLoading } from './useController'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const emits = defineEmits(['close'])
const init = () => {
	getData(props.compData)
}

onMounted(init)

defineExpose({ onConfirm, init })
</script>
