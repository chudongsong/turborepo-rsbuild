<template>
	<div class="nps_survey_box">
		<div class="nps_survey_banner">
			<span> <i></i> <span style="vertical-align: 4px">企业版用户专属调研</span> </span>
		</div>
		<div data-v-30672cd2="" class="text-extraLarge font-bold text-center text-black mt-[2rem]">
			{{ questionsList[0]?.hint }}
		</div>
		<div class="p-[2rem] flex flex-col items-center">
			<div class="w-[100%]">
				<el-form ref="formLabelAlignFrom" label-position="top" label-width="80px" :model="formLabelAlign" :rules="questionsRules">
					<el-form-item :label="questionsList[0]?.question" prop="mustData">
						<el-input v-model="formLabelAlign.mustData" type="textarea" :rows="3" :maxlength="500" resize="none" placeholder="请留下您的建议"> </el-input>
					</el-form-item>
					<el-form-item v-for="(item, index) in questionsListNoFirst" :key="index" :label="item.question">
						<el-input v-model="formLabelAlign.data[index + 1]" type="textarea" :rows="3" :maxlength="500" resize="none" placeholder="请留下您的建议"> </el-input>
					</el-form-item>
				</el-form>
			</div>
			<el-button class="w-[12.5rem] !mt-[2rem]" type="primary" size="large" @click="submit">提交</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getNpsQuestion, writeNpsQuestion } from '@api/global'
import { npsThanksDialog } from '@/public/index'
import { useMessage } from '@/hooks/tools'

const formLabelAlign = reactive<any>({
	mustData: '',
	data: [],
})
const formLabelAlignFrom = ref()
const questionsList = ref([]) // 问题列表
const questionsListNoFirst = ref([]) // 问题列表
const questionsRules = {
	mustData: [
		{
			required: true,
			message: '请输入内容',
			trigger: 'blur',
		},
	],
}
const { load: $load } = useMessage()
const emits = defineEmits(['close'])

/**
 * @description: 提交问卷
 */
const submit = async () => {
	if (await formLabelAlignFrom.value.validate()) {
		const load = $load('正在提交问卷，请稍后...')
		const param: any = {}
		for (let i = 0; i < questionsList.value.length; i++) {
			if (i === 0) {
				param[questionsList.value[i].id] = formLabelAlign.mustData
			} else {
				param[questionsList.value[i].id] = formLabelAlign.data[i]
			}
		}
		try {
			await writeNpsQuestion({
				questions: JSON.stringify(param), // 问题与回答
				product_type: 19, // 产品类型 0:面板 1:waf 2:监控报表 3：防篡改  7：需求分析
				software_name: 'Enterprise-Edition-Survey', // 面板类型 panel、total、btwaf
				rate: 0, // 评分
				// 以下内容暂不传
				// reason_tags: '', // 标签
				// phone_back: '0', // 是否接收电话回访 暂时默认为0
				// feedback: '', // 反馈内容
				// is_paid: '0', // 是否付费用户
			})
			load.close()
			localStorage.setItem('ltd_nps', '1')
			npsThanksDialog()
			emits('close')
		} catch (e) {
			console.log(e)
		} finally {
			load.close()
		}
	}
}

onMounted(async () => {
	const { data } = await getNpsQuestion({
		product_type: 19,
		version: -1,
	})
	questionsList.value = data.msg
	for (let i = 0; i < data.msg.length; i++) {
		formLabelAlign['data'].push('')
	}
	questionsListNoFirst.value = data.msg.slice(1)
})
</script>

<style scoped lang="css">
:deep(.el-form .el-form-item__label) {
	margin-right: 0 !important;
}

.nps_survey_banner {
	position: relative;
	background-image: url('/static/images/feedback/qa_banner.png');
	background-repeat: no-repeat;
	width: 100%;
	height: 92px;
	margin-top: -1px;
	background-size: 100%;
}

.nps_survey_banner > span {
	@apply absolute left-[3.2rem] top-[1.6rem] text-large text-white;
}

.nps_survey_banner i {
	background-image: url('/static/icons/logo-white.svg');
	background-size: 100%;
	background-repeat: no-repeat;
	background-size: 18px;
	@apply inline-block w-[20px] h-[20px];
}

.el-form .el-form-item {
	@apply flex flex-col;
}

:deep(.el-form.el-form--default .el-form-item__label) {
	@apply text-base font-bold leading-[3.6rem];
}

.nps_surver_tips {
	@apply text-small text-tertiary ml-[1rem];
}
</style>
