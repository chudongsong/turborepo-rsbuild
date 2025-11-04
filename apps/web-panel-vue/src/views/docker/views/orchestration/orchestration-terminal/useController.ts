



export const content = ref('') // 内容

/**
 * @description 终端写入内容方法
 * @param {MessageEvent} e 对象
 */
const setValue = (msg: string) => {
	try {
		content.value += msg
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 创建终端视图
 */
const createTerminal = (props:any) => {
	// 初始化内容
	if (props.compData?.init) {
		props.compData.init(setValue)
	}
}


/**
 * @description 项目初始化
 */
export const init = (props:any) => {
	try {
		createTerminal(props) // 创建终端
	} catch (error) {
		console.log(error)
	}
}


export const unmountHandler = () => {
	content.value = ''
	// 找到并移除用于计算字符宽度的元素
	const charMeasureElement = document.querySelector('div[style*="position: absolute; top: -50000px;"]')
	if (charMeasureElement) {
		charMeasureElement.parentNode?.removeChild(charMeasureElement)
	}
}