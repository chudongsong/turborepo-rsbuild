import { getDockerStore } from '@docker/useStore'
import { checkVariable, setCookie } from '@utils/index'
import { Message, useConfirm } from '@/hooks/tools'
import { socketInstance, restartCompose } from '@docker/views/orchestration/useController'
import { isDark } from '@/utils/theme-config'

const {
	refs: { orchestrationData },
} = getDockerStore()

export const yamlContent = ref(``) // yaml内容
export const envContent = ref(``)
const oldFile = {
	config: '',
	env: '',
}
const pathWidth = ref(0) // 路径宽度
// 编辑器配置
export const config = {
	mode: 'ace/mode/yaml',
	theme: !isDark.value ? 'ace/theme/chrome' : 'ace/theme/clouds_midnight', // chrome  monokai
	// readOnly: !isEdit.value,
}

export const openPathEvent = (item: any) => {
	setCookie('Path', item.path)
	window.location.href = window.location.origin + '/files'
}

// 获取文件
export const getFile = async (editorRef: Ref<HTMLElement>) => {
	try {
		const params = {
			mod_name: 'docker',
			sub_mod_name: 'com',
			def_name: 'get_config',
			path: orchestrationData.value.currentCompose.path,
			ws_callback: 'get_config',
		}
		const res = await socketInstance.value.socketRequest({ params })
		if (res.status) {
			oldFile.config = checkVariable(res.data.config, 'string', '')
			oldFile.env = checkVariable(res.data.env, 'string', '')
			yamlContent.value = oldFile.config
			envContent.value = oldFile.env
		} else {
			Message.error(res.msg)
		}
		setTimeout(() => {
			// 设置路径宽度

			pathWidth.value = editorRef.value.offsetWidth - 20
		}, 100)
	} catch (error) {
		console.log(error, 'error')
	}
}

// 保存文件
export const saveFile = async () => {
	try {
		await useConfirm({
			title: `保存文件`,
			width: '35rem',
			icon: 'warning-filled',
			content: `即将保存文件，保存后将重启容器编排，是否继续？`,
		})
		const params = {
			mod_name: 'docker',
			sub_mod_name: 'com',
			def_name: 'save_config',
			config: yamlContent.value,
			env: envContent.value,
			path: orchestrationData.value.currentCompose.path,
			ws_callback: 'save_config',
		}
		const res = await socketInstance.value.socketRequest({ params })
		if (res.status) {
			restartCompose.value = true // 重启编排
			oldFile.config = yamlContent.value
			oldFile.env = envContent.value
		} else {
			Message.request(res)
		}
	} catch (error) {
		cancelEdit()
		console.log(error, 'error')
	}
}

// 退出编辑状态
const cancelEdit = () => {
	yamlContent.value = oldFile.config
	envContent.value = oldFile.env
}

export const unmountHandler = () => {
	yamlContent.value = ''
	envContent.value = ''
	oldFile.config = ''
	oldFile.env = ''
}
