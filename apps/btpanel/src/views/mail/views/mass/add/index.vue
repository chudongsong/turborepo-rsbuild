<template>
	<div class="p-20px">
		<el-form ref="formRef" :model="form" :rules="rules">
			<el-form-item label="任务名" prop="task_name">
				<div class="w-320px">
					<el-input v-model="form.task_name" placeholder="请输入任务名称"> </el-input>
				</div>
			</el-form-item>
			<el-form-item label="发件人" prop="addresser">
				<div class="w-320px">
					<sender-select v-model:value="form.addresser" :is-init="true"> </sender-select>
				</div>
			</el-form-item>
			<el-form-item label="发送到" prop="file_recipient">
				<task-import v-model:value="form.file_recipient" path="/www/server/panel/data/mail/in_bulk/recipient" :accept="['txt', 'json']" @change="onUpdateTo">
					<div>
						<span class="!text-dangerDark">*</span>
						导入格式: txt文件每行一个邮箱，json文件格式["xxx@qq.com","xxx@gmail.com"]，<br />文件大小不超过5M
					</div>
				</task-import>
			</el-form-item>
			<el-form-item label="邮件主题" prop="subject">
				<div class="w-320px">
					<el-input v-model="form.subject" placeholder="请输入邮件主题"> </el-input>
				</div>
			</el-form-item>
			<el-form-item class="mb-12px" label="发送内容" :show-feedback="false">
				<el-radio-group v-model="form.up_content">
					<el-radio :value="1">上传文件</el-radio>
					<el-radio :value="0">手动填写</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item v-show="form.up_content === 1" label=" " prop="file_content">
				<task-import v-model:value="form.file_content" path="/www/server/panel/data/mail/in_bulk/content" :accept="['txt', 'html']">
					<div>
						<span class="!text-dangerDark">*</span>
						导入格式：文件类型txt/html，文件大小不超过5M
					</div>
				</task-import>
			</el-form-item>
			<el-form-item v-show="form.up_content === 0" label=" " prop="content">
				<div>
					<bt-input class="!w-320px" v-model="form.content" type="textarea" :rows="4" placeholder="请输入发送内容"> </bt-input>
				</div>
			</el-form-item>
			<el-form-item label="保存到发件箱">
				<el-switch v-model="form.is_record" :active-value="1" :inactive-value="0"></el-switch>
			</el-form-item>
			<el-form-item label="退订链接">
				<el-switch v-model="form.unsubscribe" :active-value="1" :inactive-value="0"> </el-switch>
				<!-- <bt-link class="ml-16px" @click="onShowCase">查看示例</bt-link> -->
			</el-form-item>
			<el-form-item label="线程数量" prop="threads">
				<el-radio-group v-model="form.threadsType">
					<el-radio :value="0">自动</el-radio>
					<el-radio :value="1">自定义</el-radio>
				</el-radio-group>
				<div v-show="form.threadsType === 1" class="ml-24px">
					<el-input-number class="!w-60px" v-model="form.threads" :min="1" :max="maxThreads" :controls="false" placeholder="输入线程数"> </el-input-number>
				</div>
			</el-form-item>
			<!-- <el-form-item label="发送限制" :show-feedback="false">
				<div class="w-530px">
					<bt-table :max-height="240" :data="limitList" :column="columns"></bt-table>
				</div>
			</el-form-item> -->
		</el-form>
	</div>
</template>

<script lang="tsx" setup>
import SenderSelect from '@mail/public/sender-select.vue'
import TaskImport from './import.vue'
import { init, onConfirm, onUpdateTo, onShowCase } from '@mail/views/mass/add/useMethod'
import MAIL_MASS_ADD from '@mail/views/mass/add/store'
import { storeToRefs } from 'pinia'

const { formRef, form, limitList, maxThreads } = storeToRefs(MAIL_MASS_ADD())
const { rules, columns } = MAIL_MASS_ADD()

type PropsData = {
	data: any
}

interface Props {
	compData: PropsData
}
const props = defineProps<Props>()

nextTick(() => {
	init(props.compData)
})

defineExpose({
	onConfirm,
})
</script>
