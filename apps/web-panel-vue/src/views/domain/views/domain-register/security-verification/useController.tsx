import { useDialog } from '@/hooks/tools'
import { ElMessage } from 'element-plus'
import { getDomaiNuniversalModule } from '@/api/domain'

// 安全验证响应接口
export interface SecurityVerificationResponse {
	code: number
	status: boolean
	msg: string
	data: {
		operation_type: string
		questions: Array<{
			question_id: number
			question_text: string
		}>
	}
	security_required: boolean
}

// 验证密保答案的API参数
export interface VerifySecurityAnswerParams {
	question_id: number
	answer: string
	operation_type?: string
}


/**
 * 验证密保答案
 * @param params 验证参数
 * @returns Promise<boolean> 验证结果
 */
export const verifySecurityAnswer = async (params: {
	operation_type: string
	question_id: number
	answer: string
}): Promise<boolean> => {
	try {
		console.log('验证密保答案参数:', params)
		
		const requestParams = {
			url: '/api/v1/user/security/verify_security_questions',
			operation_type: params.operation_type,
			answers: [
				{
					question_id: params.question_id,
					answer: params.answer
				}
			]
		}
		
		console.log('API请求参数:', requestParams)
		
		const res = await getDomaiNuniversalModule(requestParams)
		
		console.log('验证密保答案API响应:', res)
		
		if (res.data.status) {
			console.log('密保答案验证成功')
			return true
		} else {
			console.error('密保答案验证失败:', res.data.msg)
			return false
		}
	} catch (error) {
		console.error('验证密保答案失败:', error)
		return false
	}
}

