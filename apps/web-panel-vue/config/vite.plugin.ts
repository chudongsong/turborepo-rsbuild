export default function replacePlugin(options) {
	return {
		name: 'vite-plugin-replace', // 插件名称
		enforce: 'post', // 插件执行顺序，post 为最后执行
		transform(code, id) {
			// 处理文件内容
			if (options.include.some(pattern => id.includes(pattern))) {
				let transformedCode = code
				for (const [searchValue, replaceValue] of Object.entries(options.replace)) {
					transformedCode = transformedCode.replace(new RegExp(searchValue, 'g'), replaceValue)
				}
				return {
					code: transformedCode,
					map: null,
				}
			}
			return null
		},
	}
}
