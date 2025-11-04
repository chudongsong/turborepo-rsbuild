import { setDockerApphubGit } from '@/api/docker'
import { useDataHandle, Message } from '@/hooks/tools'
import { useDockerAppStoreLocal } from './useStore'

const { isSaveGitConfig } = useDockerAppStoreLocal()

export const saveGitConfig = async (param: any) => {
	const { git_url, git_branch, password, name } = param.value
	useDataHandle({
		request: setDockerApphubGit({
			git_url,
			git_branch,
			password,
			name,
		}),
		loading: '正在保存git配置...',
		message: true,
		success: (res: any) => {
			if (!res.status) return Message.error(res.msg || '保存git配置失败')
			isSaveGitConfig.value = true
			Message.success('保存git配置成功')
		},
	})
}
