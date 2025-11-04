
import { dokcerUnInstall } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { Message } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'

const { getDockerState } = getDockerStore() // 表格刷新

/**
 * @description 卸载文字标红
 * @param {string} msg 输入的字符串
 * @returns {string} 返回带有红色标记的字符串
 */
const redText = (msg: string): string => {
	return msg.replace(/卸载/g, '<span style="color:red;white-space:nowrap;">卸载</span>')
}
// 表单
export const cmdForm = reactive({
	force: false, // 强制卸载状态
	msg: redText('即将卸载Docker，是否继续？'),
	needForce: false, // 是否需要强制卸载
})

// 提交
export const onConfirm = async (popupClose:AnyFunction) => {
	if (cmdForm.needForce && !cmdForm.force) {
		Message.error('请勾选强制卸载后再操作')
		return
	}
	useDataHandle({
		request: dokcerUnInstall({
			type: cmdForm.force ? 1 : 0,
		}),
		message: true,
		success: ({ status }: { status: boolean }) => {
			getDockerState()
			if (status) window.location.reload()
		},
	})
}


export const init = (props:any) => {
	try {
		cmdForm.needForce = !!props.compData.needForce
		cmdForm.msg = cmdForm.needForce ? redText(props.compData.msg) : redText('即将卸载Docker，是否继续？')
	} catch (error) {}
}

export const unmountHandler = () => {
	cmdForm.force = false
	cmdForm.msg = redText('即将卸载Docker，是否继续？')
	cmdForm.needForce = false
}









