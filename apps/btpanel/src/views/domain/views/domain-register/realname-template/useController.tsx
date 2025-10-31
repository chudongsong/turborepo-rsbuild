import { getDomaiNuniversalModule } from '@/api/domain'
import { useMessage } from '@/hooks/tools'
const message = useMessage()
// 实名模板接口
export interface RealnameTemplate {
	id: number
	template_name: string
	owner_name: string
	id_number: string
	phone: string
	address: string
	template_status: string
	status: number
	type: number
	registrant_id: string
}

// 实名认证参数接口
export interface RealnameAuthParams {
	domainId: number
	registrantId: string
}

/**
 * 提交实名认证
 * @param params 实名认证参数
 * @returns Promise<boolean> 提交结果
 */
export const submitRealnameAuth = async (params: RealnameAuthParams): Promise<boolean> => {
    const load = message.load('正在提交...')
	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/domain/manage/update_real_name_tpl',
			domain_id: params.domainId,
			new_registrant_id: params.registrantId
		} as any)
        message[res.data.status ? 'success' : 'error'](res.data.msg)
		return res.data.status
	} catch (error) {
		console.error('实名认证提交失败:', error)
		return false
	} finally {
        load.close()
    }
}

/**
 * 获取实名模板列表
 * @returns Promise<RealnameTemplate[]> 模板列表
 */
export const getRealnameTemplateList = async (): Promise<RealnameTemplate[]> => {
	try {
		const res = await getDomaiNuniversalModule({
			url: '/api/v1/contact/get_user_detail',
			p: 1,
			rows: 50,
			status: 2
		})
		if (res.data.status) {
			return res.data.data.data
		}
		return []
	} catch (error) {
		console.error('获取实名模板列表失败:', error)
		return []
	}
}
