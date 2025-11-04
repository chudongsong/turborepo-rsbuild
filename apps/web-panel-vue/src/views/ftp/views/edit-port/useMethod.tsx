import { editFtpPort } from '@/api/ftp'
import { useDataHandle } from '@/hooks/tools'
import { ResponseResult } from '@/types'
import { useFtpStore } from '@ftp/useStore'
import { useFtpPortStore } from './useStore'
import { useGlobalStore } from '@/store/global'

const { ftpPortForm, ruleForm } = useFtpPortStore()
const { getGlobalInfo } = useGlobalStore()

/**
 * @description 修改端口
 */
export const editPortEvent = async (close: any) => {
	await ftpPortForm.value.validate() // 校验表单
	const data: ResponseResult = await useDataHandle({
		loading: '正在修改FTP端口，请稍后...',
		request: editFtpPort({ port: ruleForm.port }),
		data: { status: Boolean },
		message: true,
	})
	if (data.status) {
		getGlobalInfo()
		close && close()
	}
}
