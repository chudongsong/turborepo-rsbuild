const loadResource = sessionStorage.getItem('load') ? JSON.parse(sessionStorage.getItem('load') || '[]') : []
const xhr = new XMLHttpRequest() // 创建XMLHttpRequest对象

// 设置session存储
function setLoadContent(str) {
	loadResource.push(str)
	sessionStorage.setItem('load', JSON.stringify(loadResource))
}

// 获取session中是否存储
function checkLoadContent(str) {
	let isLoad = false
	for (let i = 0; i < loadResource.length; i++) {
		if (loadResource[i] === str) {
			isLoad = true
			break
		}
	}
	return isLoad
}

function checkLogin() {
	// 获取token，检查是否开始请求登录
	const token = sessionStorage.getItem('sendXhr')
	// 将token 初始化
	sessionStorage.setItem('sendXhr', '0')
	return token === '1'
}

// 递归请求
function apiSend(index, urls) {
	if (index >= urls.length - 1) {
	} else {
		const isLoad = checkLoadContent(urls[index]) // 检查是否已经加载
		const isSend = checkLogin() // 检查是否开始其他请求
		if (isSend) return // 如果开始其他请求，终止当前请求
		if (!isLoad) {
			// 设置请求方法和URL，true表示异步
			xhr.open('GET', urls[index], true)
			// 发送请求
			xhr.send()
			// 监听onreadystatechange事件，当请求的状态发生变化时触发
			xhr.onreadystatechange = function () {
				// 当请求完成且成功时（readyState为4，status为200）
				if (xhr.readyState === 4 && xhr.status === 200) {
					// 存入SessionStorage
					setLoadContent(urls[index])
					// 继续下一条数据
					apiSend(index + 1, urls)
				}
			}
		} else {
			// 继续下一条数据
			apiSend(index + 1, urls)
		}
	}
}

// // 初始化预加载
function preloadInit() {
	const list = window.vite_public_preloaded_list || []
	const loadedScripts = JSON.parse(sessionStorage.getItem('loadedScripts') || '[]')
	const urls = list.filter(url => !loadedScripts.includes(url))
	apiSend(0, urls)
}

// 预加载初始化
window.onload = preloadInit
