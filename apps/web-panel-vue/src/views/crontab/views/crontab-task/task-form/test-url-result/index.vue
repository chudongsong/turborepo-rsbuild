<template>
	<div class="p-20x">
		<el-form :model="form">
			<el-form-item label="响应时间">
				<bt-link>{{ form.responseTime }}</bt-link>
			</el-form-item>
			<el-form-item label="响应状态">
				<bt-link>{{ form.responseStatus }} - {{ form.responseCode }}</bt-link>
			</el-form-item>
			<el-form-item label="响应内容">
				<bt-editor v-model="form.responseContent" :editor-option="{ readOnly: true }" class="!h-[24rem] w-[44rem]"></bt-editor>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
interface Prop {
	compData: any
}

const props = withDefaults(defineProps<Prop>(), {
	compData: {},
})

const { status_code: responseCode, time: responseTime, txt: responseContent, status: responseStatus } = props.compData.result

const form = reactive<any>({
	responseTime: responseTime,
	responseStatus: responseStatus ? '成功' : '失败',
	responseContent: responseContent,
	responseCode: responseCode,
})
</script>
