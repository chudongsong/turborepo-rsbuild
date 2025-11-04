<template>
	<div class="security-verification-modal">
		<el-form 
			ref="securityFormRef" 
			:model="securityForm" 
			:rules="securityRules" 
			label-width="90px"
			class="security-form"
		>
			<el-form-item label="密保问题" prop="question">
				<el-input 
					v-model="securityForm.question" 
					disabled 
					placeholder="密保问题"
					class="question-input"
				/>
			</el-form-item>
			
			<el-form-item label="密保答案" prop="answer">
				<el-input 
					v-model="securityForm.answer" 
					type="password"
					placeholder="请输入密保答案"
					show-password
					autofocus
					class="answer-input"
					@keyup.enter="onConfirm"
				/>
			</el-form-item>
		</el-form>
		
		<div class="forgot-password">
			<span>忘记密保答案？请联系客服或</span>
			<a href="https://www.bt.cn/domain/domain-security" class="bt-link pl-2" target="_blank">前往密保重置页面</a>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElForm } from 'element-plus'
import { useMessage } from '@/hooks/tools'
import { getDomaiNuniversalModule } from '@/api/domain'
import { useDnsResolveStore } from '../dns-resolve/useStore'
const { securityToken } = useDnsResolveStore()
interface Props {
	compData?: {
		questionId?: number
		questionText?: string
		operationType?: string
		onSuccess?: (token: string) => Promise<void>
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({})
})

const message = useMessage()
const securityFormRef = ref<InstanceType<typeof ElForm>>()

// 表单数据
const securityForm = reactive({
	question: props.compData?.questionText || '',
	answer: ''
})

// 表单验证规则
const securityRules = {
	answer: [
		{ required: true, message: '请输入密保答案', trigger: ['blur', 'change'] },
		{ min: 1, max: 100, message: '密保答案长度在 1 到 100 个字符', trigger: ['blur', 'change'] }
	]
}

// 确认验证
const onConfirm = async () => {
	const load = message.load('正在验证密保答案，请稍候...')
	try {
		const requestParams = {
			url: '/api/v1/user/security/verify_security_questions',
			operation_type: props.compData.operationType,
			answers: [
				{
					question_id: props.compData.questionId,
					answer: securityForm.answer
				}
			]
		}
		const res = await getDomaiNuniversalModule(requestParams)
		if (res.data.status) {
			const token = res.data.data?.security_token
			if (token) {
				securityToken.value = token
				if (props.compData?.onSuccess) {
					await props.compData.onSuccess(token)
				}
				return true
			}
		}
		message.error(res.data.msg)
		return res.data.status
	} catch (error) {
		console.error('验证密保答案失败:', error)
		return false
	} finally {
		load && load.close()
	}
}

// 暴露方法给父组件
defineExpose({
	onConfirm
})

onMounted(() => {
	
})
</script>

<style lang="scss" scoped>
.security-verification-modal {
	padding: 20px;
	
	.security-form {
		margin-bottom: 20px;
		
		.question-input {
			width: 100%;
		}
		
		.answer-input {
			width: 100%;
		}
	}
	
	.forgot-password {
		text-align: center;
		color: #666;
	}
}
</style>
