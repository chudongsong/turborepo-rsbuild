import { useAxios } from '@/hooks/tools'
import { isString } from '@/utils'

export type UrlProps = {
	[key: string]: string
}

/**
 * @description 获取项目列表
 * @param { AnyObject } data 传参
 * @param { string } type 项目类型
 * @returns { Promise }
 */
export const getProjectList = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		java: 'mod/java/project/project_list',
		proxy: '/mod/proxy/com/get_list',
		python: 'project/python/GetProjectList',
		default: `project/${type}/get_project_list`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, { data, customType: 'model' })
}

/**
 * @description nodejs+go项目-开启项目 关闭项目 重启项目
 * @param { AnyObject } data 传参
 * python: { data: string = JSON.stringify({ name: string }) }
 * nodejs: { project_name: string, status: string, project_type: string }
 * java: { project_name: string }
 * default: { data: string = JSON.stringify({ project_name: string }) }
 * @param { string } type 项目类型 other | go | nodejs
 * @param { string } module 模块 start|stop|restart
 */
export const setProject = (data: AnyObject, type: string, module: string): Promise<any> => {
	// 其他项目开启项目返回msg 其他项目关闭项目返回object
	const check = type === 'other' && module === 'start' ? 'msg' : 'object'

	const autoSuffix: AnyObject = {
		start: `StartProject`,
		stop: `StopProject`,
		restart: `RestartProject`,
	}

	const suffix = type === 'python' ? autoSuffix[module] : `${module}_project`

	const urlMap: UrlProps = {
		nodejs: '/mod/nodejs/com/set_project_status',
		java: `/mod/java/project/${module}_project`,
		phpasync: `/mod/php/php_async/modify_project_run_state`,
		default: `project/${type}/${suffix}`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, { data, customType: 'model', check })
}

/**
 * @description 设置 php 模块到期时间
 */
export const setEdate = (data: AnyObject) => useAxios.post('site/SetEdate', { data, check: 'msg' })

/**
 * @description 设置站点过期时间-其他项目
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setModulesEtimeMultiple = (data: { sites_id: string; edate: string }) =>
	useAxios.post('project/go/set_site_etime_multiple', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 批量设置站点到期时间
 */
export const setSiteEtimeMultiple = (data: AnyObject) => useAxios.post('site/set_site_etime_multiple', { data, check: 'msg' })

/**
 * @description 检测node端口占用
 * @param { AnyObject } data 传参
 * @param { string } type 项目类型
 */
export const advanceCheckPort = (data: { port: number | string }, type: string): Promise<any> =>
	useAxios.post(`project/${type}/advance_check_port`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取项目信息
 * @param { AnyObject } data 传参
 * python { name: string }
 * default { project_name: string }
 * @param { string } type 项目类型
 */
export const getProjectInfo = (data: AnyObject, type: string): Promise<any> => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		java: '/mod/java/project/get_project_info',
		python: 'project/python/GetProjectInfo',
		default: `project/${type}/get_project_info`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		customType: 'model',
		check: type === 'java' ? 'msg' : 'object',
	})
}

/**
 * @description 获取用户列表
 */
export const getSystemUserList = (data: AnyObject): Promise<any> =>
	useAxios.post('project/java/get_system_user_list', {
		customType: 'model',
		check: 'array',
		data,
	})

/**
 * @description 修改项目配置
 */
export const modifyProject = (data: AnyObject, type: string): Promise<any> =>
	useAxios.post(`project/${type}/modify_project`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 创建项目
 */
export const createProject = (data: AnyObject, type: string): Promise<any> =>
	useAxios.post(`project/${type}/create_project`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除项目
 * @param { AnyObject } data 传参
 * { data: string = JSON.stringify({project_name: string}) }
 * @param { string } type 项目类型
 */
export const removeProject = (data: AnyObject, type: string): Promise<any> => {
	const suffix = type === 'python' ? 'RemoveProject' : 'remove_project'
	return useAxios.post(`project/${type}/${suffix}`, {
		data,
		customType: 'model',
		check: 'object',
	})
}
/**
 * @description 删除反向代理项目
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const delProxyProject = (data: { id: string; site_name: string; remove_path: number }) =>
	useAxios.post('/mod/proxy/com/delete', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 批量删除反向代理网站项目
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const batchDelNginx = (data: { site_list: string; remove_path: number }) =>
	useAxios.post('/mod/proxy/com/batch_delete', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取域名列表
 * @param { AnyObject } data 传参
 * phpasync { sitename: string }
 * proxy { site_name: string, id: number }
 * python { data: string = JSON.stringify({name: string}) }
 * default { data: string = JSON.stringify({project_name: string}) }
 * @param { string } type 项目类型
 */
export const getOtherDomainList = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		phpasync: `/mod/php/php_async/project_get_domain`,
		proxy: `/mod/proxy/com/get_domain_list`,
		python: `project/python/GetProjectDomain`,
		java: `/mod/java/project/project_domain_list`,
		default: `project/${type}/project_get_domain`,
	}
	const url = urlMap[type] || urlMap.default

	// 验证python default 的data.data 为string
	if (type === 'python' || !urlMap[type]) {
		if (!isString(data.data)) data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(url, {
		data,
		customType: 'model',
		check: ['php', 'proxy'].includes(type) ? 'object' : ['phpasync', 'java'].includes(type) ? 'default' : 'array',
	})
}

/**
 * @description 添加PHP域名
 * @param { AnyObject } data 传参
 * @param { string } data.domain 域名
 * @param { string } data.webname 站点名称
 * @param { string } data.id 站点ID
 */
export const addDomain = (data: { domain: string; webname: string; id: number }) => useAxios.post('site/AddDomain', { data })

/**
 * @description 添加除PHP外其他项目域名
 * @param { AnyObject } data 传参
 * phpasync { sitename: string, domains: string }
 * proxy { id: number, site_name: string, domain: string }
 * python { data: string = JSON.stringify({name: string, domains: Array}) }
 * default { data: string = JSON.stringify({project_name: string, domains: Array})
 * @param { string } type 项目类型
 */
export const addProjectDomain = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		phpasync: `/mod/php/php_async/project_add_domain`,
		proxy: `/mod/proxy/com/add_domain`,
		python: `project/python/AddProjectDomain`,
		java: `/mod/java/project/add_domains`,
		default: `project/${type}/project_add_domain`,
	}

	const url = urlMap[type] || urlMap.default

	// 验证python default 的data.data 为string
	if (type === 'python' || !urlMap[type]) {
		if (!isString(data.data)) data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(url, { data, customType: 'model', check: type === 'phpasync' ? 'default' : 'object' })
}

/**
 * @description 删除PHP域名
 * @param { AnyObject } data 传参
 * @param { number } data.id 站点ID
 * @param { string } data.domain 域名
 * @param { number } data.port 端口
 * @param { string } data.webname 站点名称
 */
export const removeDomain = (data: { id: number; domain: string; port: number; webname: string }) => useAxios.post('site/DelDomain', { data, check: 'msg' })

/**
 * @description 删除除PHP外其他项目域名
 * @param { AnyObject } data 传参
 * phpasync { sitename: string, domain: JSON.stringify([name: string]) }
 * python { data: string = JSON.stringify({name: string, domain: string}) }
 * proxy { id: number, site_name: string, domain: string, port: number }
 * default { data: string = JSON.stringify({project_name: string, domain: string}) }
 * @param { string } type 项目类型
 */
export const removeProjectDomain = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		phpasync: `/mod/php/php_async/project_remove_domain`,
		proxy: `/mod/proxy/com/del_domain`,
		python: `project/python/RemoveProjectDomain`,
		java: `/mod/java/project/remove_domains`,
		default: `project/${type}/project_remove_domain`,
	}

	const url = urlMap[type] || urlMap.default

	// 验证python default 的data.data 为string
	if (type === 'python' || !urlMap[type]) {
		if (data.data && !isString(data.data)) data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(url, { data, customType: 'model', check: 'object' })
}

/**
 * @description 获取HTTPS端口
 */
export const getHttpsPort = (data: { siteName: string }) => useAxios.post('data/get_https_port', { data, check: 'number' })

/**
 * @description 反向代理更换https端口
 * @param {} data.site_name 站点名称
 * @param {} data.https_port https端口
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setProxyHttpsPort = (data: { site_name: string; https_port: number }) =>
	useAxios.post('/mod/proxy/com/set_https_port', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置HTTPS端口
 * @param {} data.siteName 站点名称
 * @param {} data.port https端口
 */
export const setHttpsPort = (data: { siteName: string; port: number }) => useAxios.post('data/set_https_port', { data, check: 'msg' })

/**
 * @description 绑定外网
 * @param { AnyObject } data 传参
 * python { data: string = JSON.stringify({ name: string }) }
 * java { data: string = JSON.stringify({ project_name: string }) }
 * default { data: string = JSON.stringify({ project_name: string, domains: Array }) }
 * @param { string } type 项目类型
 */
export const bindExtranet = (data: AnyObject, type: string): Promise<any> => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		python: `project/python/BindExtranet`,
		java: `/mod/java/project/bind_extranet`,
		default: `project/${type}/bind_extranet`,
	}

	const url = urlMap[type] || urlMap.default

	// 验证数据
	if (data.data && !isString(data.data)) {
		data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(url, {
		data,
		customType: 'model',
		loading: '正在设置外网，请稍后...',
		check: 'object',
	})
}

/**
 * @description 解绑外网
 * @param { AnyObject } data 传参
 * python { data: string = JSON.stringify({ name: string }) }
 * java { data: string = JSON.stringify({ project_name: string }) }
 * default { data: string = JSON.stringify({ project_name: string, domains: Array }) }
 * @param { string } type 项目类型
 */
export const unbindExtranet = (data: AnyObject, type: string): Promise<any> => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		python: `project/python/unBindExtranet`,
		java: `/mod/java/project/unbind_extranet`,
		default: `project/${type}/unbind_extranet`,
	}

	const url = urlMap[type] || urlMap.default

	// 验证数据
	if (data.data && !isString(data.data)) {
		data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(url, {
		data,
		customType: 'model',
		check: 'object',
		loading: '正在解绑外网，请稍后...',
	})
}

/**
 * @description 设置java项目静态文件
 * @param { AnyObject } data 传参
 * @param { number } data.status 状态
 * @param { string } data.index 文件名
 * @param { string } data.path 路径
 * @param { string } data.project_name 项目名称
 */
export const setJavaStaticFile = (data: {
	status: number
	index: string
	path: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	project_name: string
}) =>
	useAxios.post('/mod/java/project/set_static_path', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除反向代理映射
 */
export const removeServerProxy = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	proxy_id: number
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
}) =>
	useAxios.post('/mod/java/project/remove_server_proxy', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改反向代理映射
 */
export const modifyServerProxy = (data: AnyObject) =>
	useAxios.post('/mod/java/project/modify_server_proxy', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加反向代理映射
 */
export const addServerProxy = (data: AnyObject) =>
	useAxios.post('/mod/java/project/add_server_proxy', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加python反向代理映射
 */
export const addPythonServerProxy = (data: AnyObject) =>
	useAxios.post('/project/python/add_server_proxy', {
		data,
		customType: 'model',
		check: 'msg',
	})
/**
 * @description 获取java项目外网访问信息
 */
export const getPortStatus = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	project_name: string
}) =>
	useAxios.post('/mod/java/project/get_port_status', {
		data,
		customType: 'model',
		check: 'object',
	})
/**
 * @description 获取python项目外网访问信息
 */
export const getPythonPortStatus = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	project_name: string
}) =>
	useAxios.post('/project/python/get_port_status', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取伪静态列表
 */
export const getRewriteList = (data: { siteName: string }) => useAxios.post('site/GetRewriteList', { data, check: 'object' })

/**
 * @description 设置伪静态
 */
export const setRewriteTel = (data: AnyObject) => useAxios.post('site/SetRewriteTel', { data, check: 'msg' })

/**
 * @description 获取文件内容
 * @returns { Promise }
 */
export const getFileBody = (data: { path: string }): Promise<any> => useAxios.post('files/GetFileBody', { data, check: 'object' })

/**
 * @description 保存文件内容
 * @param { AnyObject } data
 * @returns { string } 文件内容
 */
export const saveFileBody = (data: AnyObject): Promise<any> =>
	useAxios.post('/files?action=SaveFileBody', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除伪静态模板
 */
export const delRewriteTel = (data: AnyObject) => useAxios.post('site/DelRewriteTel', { data, check: 'msg' })

/**
 * @description 获取伪静态模板
 */
export const getRewriteTel = (data: AnyObject) => useAxios.post('files/read_history', { data })

/**
 * @description 获取项目重定向列表 -php | phpasync ...
 * @param { AnyObject } data.sitename  站点名称
 * @param { string } type 项目类型
 */
export const getRedirectList = (data: { sitename: string }, type: string) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/GetRedirectList`,
		phpasync: `/mod/php/php_async/get_project_redirect_list`,
		default: `project/${type}/get_project_redirect_list`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: type === 'phpasync' ? 'default' : 'array',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 获取项目重定向列表 -php
 * @param { AnyObject } data  传参
 * proxy { path: string }
 * default {webserver: string, sitename: string, redirectname: string}
 */
export const getRedirectFile = (data: AnyObject, type: string): Promise<any> => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/GetRedirectFile`,
		default: `site/GetRedirectFile`,
	}
	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		check: type === 'proxy' ? 'object' : 'array',
		customType: type === 'proxy' ? 'model' : 'default',
	})
}

/**
 * @description 反向代理获取重定向配置文件
 * @param {} data
 * @returns
 */
export const ProxyGetRedirect = (data: { path: string }) =>
	useAxios.post('/mod/proxy/com/GetRedirectFile', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 创建项目重定向
 * @param { AnyObject } data 传参
 * proxy { redirecttype: string, site_name: string, domainorpath: string, redirectpath: string, tourl: string, redirectdomain: string, redirectname: string }
 * default { redirecttype: string, sitename: string, domainorpath: string, redirectpath: string, tourl: string, redirectdomain: string, redirectname: string }
 * @param { string } type 项目类型 php | phpasync ...
 */
export const createRedirect = (
	data: {
		redirecttype: string
		sitename?: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		site_name?: string
		domainorpath: string
		redirectpath: string
		tourl: string
		redirectdomain: string
		redirectname: string
	},
	type: string
) => {
	const urlMap: UrlProps = {
		php: `site/CreateRedirect`,
		proxy: `/mod/proxy/com/CreateRedirect`,
		phpasync: `/mod/php/php_async/create_project_redirect`,
		default: `project/${type}/create_project_redirect`,
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		check: 'msg',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 修改项目重定向
 * @param { AnyObject } data 传参
 * proxy { redirecttype: string, site_name: string, domainorpath: string, redirectpath: string, tourl: string, redirectdomain: string, redirectname: string }
 * default { redirecttype: string, sitename: string, domainorpath: string, redirectpath: string, tourl: string, redirectdomain: string, redirectname: string }
 * @param { string } type 项目类型 php | phpasync ...
 */
export const modifyRedirect = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		php: `site/ModifyRedirect`,
		proxy: `/mod/proxy/com/ModifyRedirect`,
		phpasync: `/mod/php/php_async/modify_project_redirect`,
		default: `project/${type}/modify_project_redirect`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'array',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 设置项目404重定向
 */
export const setErrorRedirect = (data: AnyObject): Promise<any> => useAxios.post('site/set_error_redirect', { data, check: 'msg' })

/**
 * @description 删除项目重定向
 * @param { AnyObject } data 传参
 * @param { string } type 项目类型 php | phpasync ...
 */
export const removeRedirect = (data: AnyObject, type: string) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/DeleteRedirect`,
		phpasync: `/mod/php/php_async/remove_project_redirect`,
		default: `project/${type}/remove_project_redirect`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'array',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 批量删除项目重定向
 */
export const MulDelRedirect = (
	data: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		site_id: string
		redirectnames: string
	},
	type: string
): Promise<any> => {
	const urlMap: UrlProps = {
		// phpasync: `site/mutil_remove_project_redirect`,
		default: `site/del_redirect_multiple`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'msg',
		customType: 'default',
		// customType: type === 'phpasync' ? 'model' : 'default',
	})
}

/**
 * @description 获取项目域名
 * @param { AnyObject } data 传参
 * python { data: string = JSON.stringify({ name: string }) }
 * phpasync { sitename: string }
 * proxy { id: number, site_name: string }
 * default { data: string = JSON.stringify({ project_name: string }) }
 * @param { string } type 项目类型
 */
export const getProjectDomain = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		python: `project/python/GetProjectDomain`,
		phpasync: `/mod/php/php_async/project_get_domain`,
		proxy: `/mod/proxy/com/get_domain_list`,
		default: `project/${type}/project_get_domain`,
	}

	const url = urlMap[type] || urlMap.default

	// 验证数据
	if (data?.data && !isString(data.data)) {
		data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(url, { data, customType: 'model', check: type === 'proxy' || type === 'phpasync' ? 'object' : 'array' })
}

/**
 * @description 获取java所有负载信息
 */
export const getLoadInfo = (data: AnyObject, type: string): Promise<any> => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		java: `/mod/java/project/get_load_info`,
		python: `project/python/GetProjectInfo`,
		default: `project/${type}/get_project_info`,
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 设置重启项目配置
 */
export const setRestartProjectConfig = (data: AnyObject): Promise<any> => useAxios.post('crontab/set_restart_project', { data, check: 'msg' })

/**
 * @description 获取项目日志路径
 * @param { AnyObject } data 传参
 * python { data: string = JSON.stringify({ name: string, data: { logpath: string, loglevel: string } }) }
 * default { data: string = JSON.stringify({ project_name: string, path: string }) }
 * @param { string } type 项目类型
 */
export const changeProjectPath = (data: AnyObject, type: string): Promise<any> => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		python: `project/python/ChangeProjectConf`,
		java: `mod/java/project/change_log_path`,
		default: `project/${type}/change_log_path`,
	}

	if (data.data && !isString(data.data)) {
		data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取项目日志
 * @param { AnyObject } data 传参
 * python { data: string = JSON.stringify({ name: string }) }
 * default { data: string = JSON.stringify({ project_name: string }) }
 * @param { string } type 项目类型
 */
export const getProjectLogs = (data: AnyObject, type: string): Promise<any> => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		python: `project/python/GetProjectLog`,
		default: `project/${type}/get_project_log`,
	}

	if (data.data && !isString(data.data)) {
		data = { data: JSON.stringify(data.data) }
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取项目日志切割
 */
export const getLogSplit = (data: AnyObject, type: string): Promise<any> =>
	useAxios.post(`project/${type}/get_log_split`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置项目日志切割
 */
export const setLogSplit = (data: AnyObject, type: string): Promise<any> =>
	useAxios.post(`project/${type}/set_log_split`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 新建项目日志切割
 */
export const mamgerLogSplit = (data: AnyObject, type: string): Promise<any> =>
	useAxios.post(`project/${type}/mamger_log_split`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置日志推送
 */
export const setPushTask = (data: AnyObject): Promise<any> =>
	useAxios.post('monitor/sitelogpush/set_push_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取日志推送状态
 */
export const getSiteLogPushStatus = (data: { sitename: string }): Promise<any> =>
	useAxios.post('monitor/sitelogpush/get_site_log_push_status', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取IP地址
 */
export const getIpArea = (): Promise<any> =>
	useAxios.post('logs/site/get_ip_area', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 修改日志路径
 */
export const changeSiteLogPath = (data: AnyObject): Promise<any> =>
	useAxios.post('logs/site/change_site_log_path', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取站点日志
 * @param { AnyObject } data 传参
 * proxy { site_name: string, type: string }
 * default { siteName: string, ip_area: number }
 * @param { string } type 项目类型
 */
export const getSiteLogs = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/GetSiteLogs`,
		default: `logs/site/GetSiteLogs`,
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		customType: 'model',
		check: type === 'proxy' ? 'msg' : 'object',
	})
}

/**
 * @description 获取日志分析-网站日志路径
 * @param { string } data.siteName - 网站名称
 * */
export const getSiteLogFile = (data: { siteName: string }): Promise<any> => {
	return useAxios.post('logs/site/get_site_log_file', {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取网站错误日志信息
 * @param { AnyObject } data 传参
 * @param { string } type 项目类型
 */
export const getSiteErrorLogs = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/GetSiteLogs`,
		default: `logs/site/get_site_error_logs`,
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取网站证书信息
 * @param { AnyObject } data 网站信息
 * @returns { Promise }
 */
export const getSslInfo = (data: { siteName: string }): Promise<any> => useAxios.post('site/GetSSL', { data, check: 'object' })

/**
 * @description 续签证书
 * @param {string} pdata  包含oid，JSON字符串
 */
export const reissueCertOrder = (data: { pdata: string }) => useAxios.post('ssl/renew_cert_order', { data, check: 'object' })

/**
 * @description 获取商业证书支付状态
 * @param {AnyObject} data 订单信息
 * @returns
 */
export const getPayStatus = (data: { oid: number; pid: number }) => useAxios.post('ssl/get_pay_status', { data })

/**
 * @description 支付商业证书订单
 * @param {AnyObject} data 订单信息
 * @returns
 */
export const applyCertOrderRenw = (data: { oid: number }) => useAxios.post('ssl/apply_order', { data, check: 'object' })

interface SetSslInfoProps {
	siteName?: string // 网站名称
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name?: string // 网站名称
	type?: number // 证书类型
	key: string // 私钥
	csr: string // CSR
}

/**
 * @description 设置证书信息
 * @param {SetSslInfoProps} data
 * proxy { site_name: string, key: string, csr: string }
 * default { siteName: string, key: string, csr: string, type: number }
 * @param {string} type
 * @returns
 */
export const setSslInfo = (data: SetSslInfoProps, type: string) => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/set_ssl`,
		docker: `/mod/docker/com/set_ssl`,
		default: `site/SetSSL`,
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		check: 'object',
		customType: type === 'proxy' || type === 'docker' ? 'model' : 'default',
	})
}

/**
 * @description Let's Encrypt续签
 * @param { AnyObject } data 参数
 */
export const letRenewCert = (data: AnyObject) => useAxios.post('acme/renew_cert', { data, check: 'object' })

/**
 * @description Let's Encrypt基础信息
 * @param { AnyObject } data 参数
 */
export const letCertInitApi = (data: AnyObject) => useAxios.post('acme/get_cert_init_api', { data, check: 'object' })

/**
 * @description 申请反向代理https
 * @param {} data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setProxyHttps = (data: { site_name: string; force_https: number }) =>
	useAxios.post('/mod/proxy/com/set_force_https', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 申请反向代理https
 * @param {} data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setDockerHttps = (data: { site_name: string; force_https: number }) =>
	useAxios.post('/mod/docker/com/set_force_https', {
		data,
		check: 'msg',
		customType: 'model',
	})
/**
 * @description 设置强制https
 * @param {any} data 网站信息
 * @returns
 */
export const setSiteHttps = (data: { siteName: string }) => useAxios.post('site/HttpToHttps', { data, check: 'object' })

/**
 * @description 关闭强制https
 * @param {any} data 网站信息
 * @returns
 */
export const closeSiteHttps = (data: { siteName: string }) => useAxios.post('site/CloseToHttps', { data, check: 'object' })

interface DownloadCertProps {
	siteName: string // 网站名称
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ssl_type?: string // 证书类型
	pem: string // 证书
	key: string // 私钥
	pwd?: string // 密码
}

/**
 * @description 下载证书
 * @param {DownloadCertProps} data 下载证书配置参数
 * @returns { Promise }
 */
export const downloadCert = (data: DownloadCertProps): Promise<any> => useAxios.post('site/download_cert', { data, check: 'object' })

/**
 * @description 关闭证书部署
 * @param {AnyObject} data
 * proxy { site_name: string }
 * default { siteName: string, updateOf: number }
 * @param {string} type 项目类型
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const closeCertArrange = (data: { updateOf?: number; siteName?: string; site_name: string }, type: string) => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/close_ssl`,
		docker: `/mod/docker/com/close_ssl`,
		default: `site/CloseSSLConf`,
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		check: 'object',
		customType: type === 'proxy' || type === 'docker' ? 'model' : 'default',
	})
}

/**
 * @description 获取商业证书订单列表
 * @param {AnyObject} data.siteName 站点名称
 * @returns { Promise }
 */
export const getBusSslOrderList = (data: { siteName: string }): Promise<any> => useAxios.post('ssl/get_order_list', { data })

/**
 * @description 获取证书详情
 * @param {AnyObject} data 证书信息
 * @param {string|number} data.cert_id 证书ID
 * @param {string|number} data.order_id 订单ID
 * @returns { Promise }
 */
export const getCertDetail = (data: { certId?: string | number; orderId?: string | number }): Promise<any> => useAxios.post('ssl/get_order_details', { data, check: 'object' })

/**
 * @description 设置证书部署
 * @param {number} data.oid 证书ID
 * @param {string} data.siteName 站点名称
 * proxy { oid: number, site_name: string }
 * default { oid: number, siteName: string }
 * @returns
 */
export const setCertOrder = (
	data: {
		oid: number
		siteName?: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		site_name?: string
	},
	type: string
) => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/set_cert`,
		docker: `/mod/docker/com/set_cert`,
		default: `ssl/set_cert`,
	}

	return useAxios.post(urlMap[type] || urlMap.default, {
		data,
		check: 'object',
		customType: type === 'proxy' || type === 'docker' ? 'model' : 'default',
	})
}

/**
 * @description 验证域名证书
 * @param {AnyObject} data.oid 证书ID
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getVerifyResult = (data: { oid: number; cert_ssl_type: number; pid: number }) => useAxios.post('ssl/get_verify_result', { data, check: 'object' })

/**
 * @description 文件验证-重新验证
 * @param {AnyObject} data 证书信息
 */
export const checkUrlTxt = (data: { url: string; content: string }) => useAxios.post('ssl/check_url_txt', { data, check: 'number' })

/**
 * @description 更改验证域名方式
 * @param {AnyObject} data 证书信息
 */
export const editAgainVerify = (data: { oid: number; dcvMethod: string }) => useAxios.post('ssl/again_verify', { data, check: 'object' })

/**
 * @description 申请商业证书
 * @param pdata json字符串
 * @returns
 */
export const applyBusSsl = (pdata: string) => useAxios.post('ssl/apply_order_ca', { data: { pdata }, check: 'object' })

/**
 * @description 验证域名状态
 */
export const checkSslMethod = (domain: string) => useAxios.post('ssl/check_ssl_method', { data: { domain } })

/**
 * @description 获取域名列表
 * @returns
 */
export const getDomainList = (): Promise<any> =>
	useAxios.post('datalist/data/get_data_list', {
		data: { table: 'domain', limit: 10000, p: 1, order: 'id desc' },
		customType: 'model',
	})

/**
 * @description 获取证书验证信息，用于快速通过证书验证。
 * @returns { Promise }
 */
export const getDnsApiList = (): Promise<any> => useAxios.post('site/GetDnsApi')

/**
 * @description 获取证书验证信息，用于快速通过证书验证。
 * @returns { Promise }
 */
export const getCertAdminInfo = (): Promise<any> => useAxios.post('ssl/get_cert_admin')

/**
 * @description 设置DNS API
 * @param {AnyObject} data DNS API信息
 * @returns  { Promise }
 */
export const setDnsApiInfo = (data: { pdata: string }): Promise<any> => useAxios.post('site/SetDnsApi', { data, check: 'msg' })

/**
 * @description 购买人工客服协助
 * @param {AnyObject} data.oid 产品ID
 */
export const buyService = (data: { pdata: string }) => useAxios.post('ssl/apply_cert_install_pay', { data, check: 'object' })

/**
 * @description 支付商业证书订单
 * @param {AnyObject} data 订单信息
 * @returns
 */
export const applyCertOrderPay = (data: { pdata: string }) => useAxios.post('ssl/apply_cert_order_pay', { data, check: 'object' })

/**
 * @description 获取商业证书产品列表
 * @returns { Promise }
 */
export const getBusSslProductList = (): Promise<any> => useAxios.post('ssl/get_product_list_v2')

/**
 * @description 获取亚洲诚信证书订单列表
 * @returns { Promise }
 */
export const getTrustAsiaList = (data: { siteName: string }): Promise<any> => useAxios.post('ssl/GetOrderList', { data, check: 'object' })

/**
 * @description 部署洲诚信测试证书
 * @param {AnyObject} data 证书信息
 * @param {string} data.partnerOrderId 证书订单ID
 * proxy { site_name: string, partnerOrderId: string }
 * default { siteName: string, partnerOrderId: string }
 * @param {string} type 项目类型
 */
export const deployTrustAsiaCert = (
	data: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		site_name?: string
		siteName?: string
		partnerOrderId: string
	},
	type: string
) => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/set_test_cert`,
		default: `ssl/GetSSLInfo`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'msg',
		customType: type === 'proxy' ? 'model' : 'default',
	})
}

/**
 * @description 验证洲诚信证书
 * @param {string} data.siteName 站点名称
 * @param {string} data.partnerOrderId 证书订单ID
 */
export const verifyTrustAsiaCert = (data: { siteName: string; partnerOrderId: string }) => useAxios.post('ssl/Completed', { data, check: 'msg' })

/**
 * @description 支付堡塔证书
 * @param {AnyObject} data 订单信息
 * @returns
 */
export const applyCertByca = (data: AnyObject) => useAxios.post('ssl/apply_order_byca', { data, check: 'msg' })

/**
 * @description 申请亚洲诚信免费证书
 * @param data 证书信息
 * @returns
 */
export const applyTrustAsiaCert = (data: {
	domain: string
	orgName: string
	orgRegion: string
	orgCity: string
	orgAddress: string
	orgPhone: string
	orgPostalCode: string
	orgDivision: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ssl_id?: number
}) => useAxios.post('ssl/ApplyDVSSL', { data, check: 'msg' })

/**
 * @description 获取let's Encrypt订单列表
 * @returns { Promise }
 */
export const getLetsEncryptList = (data: { siteName: string }): Promise<any> => useAxios.post('acme/get_order_list', { data, check: 'array' })

/**
 * @description 部署let's Encrypt证书
 * @param {AnyObject} data 证书信息
 * @param {string} data.siteName 站点名称
 * @param {string} data.index 证书index
 * @returns { Promise }
 */
export const setCertToSite = (data: { index: string; siteName: string }): Promise<any> => useAxios.post('acme/SetCertToSite', { data, check: 'msg' })

/**
 * @description 部署let's Encrypt证书 -docker
 * @param {AnyObject} data 证书信息
 * @param {string} data.siteName 站点名称
 * @param {string} data.index 证书index
 * @returns { Promise }
 */
export const setDockerCertToSite = (data: { index: string; siteName: string }) => useAxios.post('mod/docker/com/set_cert_to_site', { data, check: 'msg', customType: 'model' })

/**
 * @description 下载let's Encrypt证书
 * @param {AnyObject} data 证书信息
 * @param {string} data.index 证书index
 * @returns { Promise }
 */
export const downloadCertToLocal = (data: { index: string }): Promise<any> => useAxios.post('acme/download_cert_to_local', { data, check: 'msg' })

/**
 * @description 网站 -- 续签let's Encrypt证书
 * @returns { Promise }
 */
export const renewalCert = (data: AnyObject): Promise<any> =>
	useAxios.post('/ssl/cert/renewal_cert', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 执行composer
 */
export const execComposer = (data: AnyObject) => useAxios.post('files/exec_composer', { data, check: 'msg' })
/**
 * @description 更新composer
 */
export const updateComposer = () => useAxios.post('files/update_composer', { check: 'msg' })

/**
 * @description 删除文件
 */
export const deleteComposerFile = (data: AnyObject) => useAxios.post('files/DeleteFile', { data, check: 'msg' })

/**
 * @description 获取日志信息
 */
export const getComposerLine = (data: AnyObject) => useAxios.post('ajax/get_lines', { data, check: 'msg' })

/**
 * @description 验证let's Encrypt
 * @returns { Promise }
 */
export const getOrderDetail = (data: AnyObject): Promise<any> => useAxios.post('acme/get_order_detail', { data, check: 'object' })

/**
 * @description 验证let's Encrypt
 * @returns { Promise }
 */
export const validateDomain = (data: { index: string }): Promise<any> => useAxios.post('acme/validate_domain', { data, check: 'msg' })

/**
 * @description Let's Encrypt验证单个域名dns解析
 * @param { AnyObject } data 参数
 */
export const authDomainApi = (data: AnyObject) => useAxios.post('acme/auth_domain_api', { data, check: 'object' })

/**
 * @description 删除let's Encrypt
 * @returns { Promise }
 */
export const delLetsEncrypt = (data: { index: string }): Promise<any> => useAxios.post('acme/delete_order', { data, check: 'msg' })

/**
 * @description Let's Encrypt证书申请
 * @param { AnyObject } data 参数
 */
export const applyCertApi = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/apply_cert_api`,
		docker: `/mod/docker/com/apply_cert_api`,
		default: `acme/apply_cert_api`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'object',
		customType: type === 'proxy' || type === 'docker' ? 'model' : 'default',
	})
}

/**
 * @description 获取Let's Encrypt页面域名列表
 * @param { number } data.id 站点ID
 */
export const getLetsEncryptSite = (data: AnyObject) => useAxios.post('site/GetSiteDomains', { data, check: 'object' })
export const getDockerLetsEncryptSite = (data: AnyObject) => useAxios.post('mod/docker/com/GetSiteDomains', { data, check: 'object', customType: 'model' }) // docker

/**
 * @description 获取证书夹列表
 */
export const getCertList = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	search_limit: number
	// eslint-disable-next-line @typescript-eslint/naming-convention
	search_name: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	force_refresh: number
}) =>
	useAxios.post('ssl/get_cert_list', {
		data,
		check: 'array',
	})

/**
 * @description 上传云端
 */
export const uploadCertToCloud = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ssl_hash: string
}) => useAxios.post('ssl/upload_cert_to_cloud', { data, check: 'msg' })

/**
 * @description 删除证书夹证书
 */
export const removeCloudCert = (data: {
	local: number
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ssl_hash: string
}) => useAxios.post('ssl/remove_cloud_cert', { data, check: 'msg' })

/**
 * @description 获取dns列表数据
 * @returns { Promise }
 */
export const getDnsData = (): Promise<any> =>
	useAxios.post('ssl/dnsapi/get_dns_data', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置dns
 * @returns { Promise }
 */
export const setDomainDNS = (data: AnyObject): Promise<any> =>
	useAxios.post('ssl/data/set_domain_dns', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取批量部署的站点列表
 */
export const getDeploySiteDomain = (data?: AnyObject): Promise<any> => useAxios.post(`ssl/GetSiteDomain`, { data, check: 'object' })

/**
 * @description 申请反向代理let' encrypt证书
 * @param {} data
 * @returns
 */
export const applyProxyCertArrange = (
	data: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		site_name: string
		domains: string
		auth_type: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		auth_to: string
		auto_wildcard: string
		id: string
	},
	type: 'docker' | 'proxy'
) =>
	useAxios.post(`/mod/${type}/com/apply_cert_api`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 验证洲诚信证书
 */
export const verifyTrustAsiaCret = (data: AnyObject) => useAxios.post('ssl/Completed', { data, check: 'msg' })

/**
 * @description 设置证书夹证书 部署证书
 */
export const setBatchCertToSite = (
	data: {
		BatchInfo: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		site_name?: string
	},
	type: string
) => {
	const urlMap: UrlProps = {
		proxy: `/mod/proxy/com/SetBatchCertToSite`,
		docker: `/mod/docker/com/SetBatchCertToSite`,
		default: `ssl/SetBatchCertToSite`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'object',
		customType: type === 'proxy' || type === 'docker' ? 'model' : 'default',
	})
}

/**
 * @description 获取分类列表
 * @param { AnyObject } type
 */
export const getSiteTypes = (type: string) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/get_site_types`,
		default: `project/${type}/project_site_types`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		customType: type === 'php' ? 'default' : 'model',
		check: 'array',
	})
}

/**
 * @description 删除站点类型
 */
export const removeSiteType = (
	data: {
		id?: number
		// eslint-disable-next-line @typescript-eslint/naming-convention
		type_id?: number
	},
	type: string
) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/remove_site_type`,
		default: `project/${type}/remove_project_site_type`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'msg',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 添加站点类型
 * php { name: string }
 * default { type_name: string, ps: string }
 */
export const addSiteTypes = (
	data: {
		name?: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		type_name?: string
		ps?: string
	},
	type: string
) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/add_site_type`,
		default: `project/${type}/add_project_site_type`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'msg',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 修改站点类型名称
 * php { name: string, id: number }
 * default { type_name: string, id: number, ps: string }
 */
export const modifySiteTypes = (
	data: {
		id?: number
		name?: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		type_id?: number
		// eslint-disable-next-line @typescript-eslint/naming-convention
		type_name?: string
		ps?: string
	},
	type: string
) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/modify_site_type_name`,
		default: `project/${type}/modify_project_site_type`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'msg',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 获取Nps问题集
 */
export const getNpsQuestion = (data: AnyObject) => useAxios.post('config/get_nps_new', { data, check: 'array' })

/**
 * @description 批量设置分类
 * php { site_ids: string, id: number}
 * default { site_ids: string, type_id: number }
 */
export const setSiteTypes = (
	data: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		site_ids: string
		id?: number
		// eslint-disable-next-line @typescript-eslint/naming-convention
		type_id?: number
	},
	type: string
) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/set_site_type`,
		default: `project/${type}/set_project_site_type`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'msg',
		customType: type === 'php' ? 'default' : 'model',
	})
}

/**
 * @description 关闭站点的流量限制配置
 */
export const closeLimitNet = (data: AnyObject, type: string) => {
	type = type === 'nginx' ? 'proxy' : type

	const urlMap: UrlProps = {
		php: `site/CloseLimitNet`,
		phpasync: `site/CloseLimitNet`,
		default: `project/${type}/close_limit_net`,
	}

	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		check: 'msg',
		customType: type === 'php' || type === 'phpasync' ? 'default' : 'model',
	})
}

/**
 * @description 设置项目流量限制
 */
export const setModulesLimitNet = (data: AnyObject, type?: string): Promise<any> =>
	useAxios.post(`${`project/${type}/set_limit_net`}`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置项目流量限制
 */
export const setLimitNet = (data: AnyObject) => useAxios.post('site/SetLimitNet', { data, check: 'msg' })

/**
 * @description 获取流量限制 -php
 */
export const getLimitNet = (data: AnyObject) => useAxios.post('site/GetLimitNet', { data })

/**
 * @description 获取项目流量限制
 */
export const getModulesLimitNet = (data: AnyObject, type: string): Promise<any> =>
	useAxios.post(`project/${type}/get_limit_net`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 网站设置中的流量限制
 */
export const setMultipleLimitNet = (data: AnyObject) => useAxios.post('site/multiple_limit_net', { data })

/**
 * @description 创建反向代理网站项目
 * @param { string } data.domains 域名
 * @param { string } data.proxy_pass 反向代理地址
 * @param { string } data.proxy_host 反向代理主机
 * @param { string } data.proxy_type 反向代理类型 //'http' | 'unix'
 * @param { string } data.remark 备注
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const addProxyProject = (data: { domains: string; proxy_pass: string; proxy_host: string; proxy_type: string; remark: string }) =>
	useAxios.post('/mod/proxy/com/create', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目url代理
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const addProxyUrlData = (data: { site_name: string; proxy_path: string }) =>
	useAxios.post('/mod/proxy/com/add_proxy', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取反向代理网站项目url信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProxyUrlData = (data: { site_name: string; proxy_path?: string }) =>
	useAxios.post('/mod/proxy/com/get_proxy_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目url代理
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const delProxyUrlData = (data: { site_name: string; proxy_path: string }) =>
	useAxios.post('/mod/proxy/com/del_url_proxy', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目url代理
 */
export const editProxyUrlDataRemark = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	proxy_path: string
	remark: string
}) =>
	useAxios.post('/mod/proxy/com/set_url_remark', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目url代理缓存
 */
export const proxyUrlCache = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	proxy_path: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	cache_status: number
	expires?: string
}) =>
	useAxios.post('/mod/proxy/com/set_url_cache', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目url代理内容压缩
 */
export const proxyUrlCompress = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	gzip_status: number
	gzip_min_length: string
	gzip_comp_level: string
	gzip_types: string
}) =>
	useAxios.post('/mod/proxy/com/set_url_gzip', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目url代理自定义配置
 */
export const setProxyUrlCustom = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	custom_conf: string
	proxy_path: string
}) =>
	useAxios.post('/mod/proxy/com/set_url_custom_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目url代理ip黑白
 */
export const proxyUrlAddLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	ip_type: string
	ips: string
}) =>
	useAxios.post('/mod/proxy/com/add_url_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 批量删除反向代理网站项目url代理ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.proxy_path 反向代理路径
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ips ip列表 // 多个ip换行
 */
export const proxyUrlBatchDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	ip_type: string
	ips: string
}) =>
	useAxios.post('/mod/proxy/com/batch_del_url_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目url代理ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.proxy_path 反向代理路径
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ip ip地址
 */
export const proxyUrlDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	ip_type: string
	ip: string
}) =>
	useAxios.post('/mod/proxy/com/del_url_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 编辑反向代理网站项目url代理
 */
export const editProxyUrlInfo = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	proxy_path: string
	proxy_host: string
	proxy_pass: string
	proxy_type: string
	websocket: number
	remark?: string
}) =>
	useAxios.post('/mod/proxy/com/set_url_proxy', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目url代理内容替换
 */
export const delProxyUrlReplace = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	oldstr: string
	newstr: string
	proxy_path: string
}) =>
	useAxios.post('/mod/proxy/com/del_sub_filter', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目url代理内容替换
 */
export const addProxyUrlReplace = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	oldstr: string
	newstr: string
	proxy_path: string
	sub_type: string
}) =>
	useAxios.post('/mod/proxy/com/add_sub_filter', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取反向代理网站项目全局配置信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGetGlobal = (data: { site_name: string }) =>
	useAxios.post('/mod/proxy/com/get_global_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局websocket
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGlobalSetWebsocket = (data: { site_name: string; websocket_status: number }) =>
	useAxios.post('/mod/proxy/com/set_global_websocket', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局日志配置
 * @param { string } data.site_name 站点名称
 * @param { string } data.log_type 日志类型 // default/file/rsyslog/off
 * @param { string } data.log_path 日志路径 // 如果log_type是file，只能传目录，/www/wwwlogs这样；如果log_type是rsyslog，则log_path传ip
 */
export const proxyGlobalSetLogs = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	log_type: string
	log_path: string
}) =>
	useAxios.post('/mod/proxy/com/set_global_log', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目全局ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ips ip列表 // 多个ip换行
 */
export const proxyGlobalDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	ip_type: string
	ip: string
}) =>
	useAxios.post('/mod/proxy/com/del_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 批量删除反向代理网站项目全局ip黑白
 * @param { string } data.site_name 站点名称
 * @param { string } data.ip_type ip类型 // black/white;
 * @param { string } data.ips ip列表 // 多个ip换行
 */
export const proxyGlobalBatchDelLimit = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	ip_type: string
	ips: string
}) =>
	useAxios.post('/mod/proxy/com/batch_del_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目全局代理basicauth
 */
export const proxyGlobalAddBasic = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	auth_path: string
	username: string
	password: string
	name: string
}) =>
	useAxios.post('/mod/proxy/com/add_dir_auth', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 编辑反向代理网站项目全局代理basicauth
 */
export const proxyGlobalEditBasic = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	auth_path: string
	username: string
	password: string
	name: string
}) =>
	useAxios.post('/mod/proxy/com/set_dir_auth', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局代理内容压缩
 */
export const proxyGlobalCompress = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	gzip_status: number
	gzip_min_length: string
	gzip_comp_level: string
	gzip_types: string
}) =>
	useAxios.post('/mod/proxy/com/set_global_gzip', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置反向代理网站项目全局代理缓存
 */
export const proxyGlobalCache = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	cache_status: number
	expires: string
}) =>
	useAxios.post('/mod/proxy/com/set_global_cache', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 清理反向代理缓存
 * @param {} data
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const clearProxyCache = (data: { site_name: string }) =>
	useAxios.post('/mod/proxy/com/clear_cache', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加反向代理网站项目全局ip黑白
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGlobalAddLimit = (data: { site_name: string; ip_type: string; ips: string }) =>
	useAxios.post('/mod/proxy/com/add_ip_limit', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除反向代理网站项目全局代理basicauth
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const proxyGlobalDelBasic = (data: { site_name: string; auth_path: string; name: string }) =>
	useAxios.post('/mod/proxy/com/del_dir_auth', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 防盗链
 */
export const getMultipleReferer = (data: AnyObject) => useAxios.post('site/multiple_referer', { data })

/**
 * @description
 */
// export const setSecurity = (data: AnyObject) => useAxios.post('site/SetSecurity', { data, check: 'msg' })
export const setSecurity = (data: AnyObject) => useAxios.post('/mod/php/serviceconf/set_referer_security', { data, check: 'msg', customType: 'model' })

/**
 * @description 设置php动态 伪静态
 */
export const setRefererSecurity = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/set_referer_security', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置反向代理网站项目防盗链
 */
export const proxySetSecurity = (data: any) =>
	useAxios.post('/mod/proxy/com/SetSecurity', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取防盗链
 */
// export const getSecurity = (data: AnyObject) => useAxios.post('site/GetSecurity', { data })
export const getSecurity = (data: AnyObject) =>
	useAxios.post('/mod/php/serviceconf/get_referer_security', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取反向代理网站项目配置文件
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getProxyConfigFile = (data: { site_name: string }) =>
	useAxios.post('/mod/proxy/com/get_config', {
		data,
		check: 'object',
		customType: 'model',
	})
/**
 * @description 保存反向代理网站项目配置文件
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const saveProxyConfigFile = (data: { site_name: string; conf_type: string; body: string }) =>
	useAxios.post('/mod/proxy/com/save_config', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加项目
 */
export const getNetVersion = (): Promise<any> =>
	useAxios.post(`project/net/GetNetVersion`, {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加项目
 */
export const getDaemonTime = (type: string): Promise<any> =>
	useAxios.post(`project/${type}/get_daemon_time`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加项目
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setDaemonTime = (data: { daemon_time: string | number }, type: string): Promise<any> =>
	useAxios.post(`project/${type}/set_daemon_time`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改项目配置
 */
export const changeProjectConf = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/python/ChangeProjectConf`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加项目
 */
export const createPythonProject = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/python/CreateProject`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 根据运行路径获取添加时的python站点信息
 */
export const getPythonProjectInfo = (data: { path: string }) =>
	useAxios.post('/project/python/get_info', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 根据路径获取添加时的pythonApp信息
 */
export const getPythonAppInfo = (data: { runfile: string }) =>
	useAxios.post('/project/python/get_info_by_runfile', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 添加项目
 */
export const getPyVersion = (data?: any): Promise<any> =>
	useAxios.post(`project/python/list_py_version`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取sdk版本列表
 */
export const getVersionList = (type: string, force?: string) => {
	const typeName = type === 'go' ? type : 'python'
	const suffix = type === 'go' ? 'sdk' : 'version'
	return useAxios.post(`project/${typeName}/list_${type}_${suffix}`, {
		customType: 'model',
		data: {
			force,
		},
	})
}

/**
 * @description 安装包 -python -一键安装项目模块InstallPythonV
 */
export const installPyVersion = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/python/install_py_version`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 安装go版本
 * @param { AnyObject } data
 */
export const installVersion = (data: AnyObject) => {
	return useAxios.post(`project/go/install_go_sdk_async`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 安装包 -python -一键安装项目模块InstallPythonV 新版
 */
export const installPyVersionNew = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/python/async_install_py_version`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置默认
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const setGoEnvironment = (data: { name: string }): Promise<any> =>
	useAxios.post('project/go/set_go_environment ', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 卸载版本
 * @param { AnyObject } data
 */
export const uninstallVersion = (data: AnyObject, type: string) => {
	const typeName = type === 'go' ? type : 'python'
	let url = `project/${typeName}/uninstall_${type}_sdk`
	if (type === 'py') url = `project/python/RemovePythonV`
	return useAxios.post(url, {
		data,
		customType: 'model',
		check: type === 'py' ? 'array' : 'msg',
	})
}

/**
 * @description 设置命令行
 * @param { AnyObject } data
 * @returns { Promise }
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setPythonVersion = (data: { env_type: string; env_key: string }): Promise<any> =>
	useAxios.post('project/python/set_python_version', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取项目配置文件 -py
 */
export const getConfFile = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/python/GetConfFile`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 保存项目配置文件 -py
 */
export const saveConfFile = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/python/SaveConfFile`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加服务
 */
export const addService = (data: AnyObject) =>
	useAxios.post('/mod/python/service/add_service', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 修改服务
 */
export const modifyService = (data: AnyObject) =>
	useAxios.post('/mod/python/service/modify_service', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除服务
 */
export const delService = (data: AnyObject) =>
	useAxios.post('/mod/python/service/remove_service', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 操作服务
 */
export const handleService = (data: AnyObject) =>
	useAxios.post('/mod/python/service/handle_service', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取服务日志
 */
export const getServiceLog = (data: AnyObject) =>
	useAxios.post('/mod/python/service/get_service_log', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取所有服务信息
 */
export const getServicesInfo = (data: AnyObject) =>
	useAxios.post('/mod/python/service/get_services_info', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取重启项目配置
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getRestartProjectConfig = (data: { model_name: string; project_name: string }): Promise<any> =>
	useAxios.post(`crontab/get_restart_project_config`, {
		data,
		check: 'msg',
	})

/**
 * @description python第三方库文件安装、批量安装、卸载
 * @param {Object} data 参数 批量安装：requirement_path pip_source
 * 普通安装： package_name package_version pip_source active
 * 卸载：active package_name
 */
export const PythonRequirementSetting = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	project_name: string
	requirement_path?: string
	package_name?: string
	package_version?: string
	pip_source?: string
	active?: 'install' | 'uninstall'
}) =>
	useAxios.post('/project/python/manage_package', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description python获取环境信息
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getPythonEnvInfo = (data: { project_name: string; force: number; search: string }) =>
	useAxios.post('/project/python/get_env_info', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description python修改requirement文件
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const editPythonRequirement = (data: { project_name: string; requirement_path: string }) =>
	useAxios.post('/project/python/modify_requirement', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 检测监控
 */
export const getLines = (data: { num?: number; filename: string }) => {
	return useAxios.post(`ajax/get_lines`, {
		data,
		check: 'msg',
	})
}

/**
 * @description 获取py模块管理
 */
export const getPyModules = (data: AnyObject) =>
	useAxios.post('/project/python/GetPackages', {
		data,
		check: 'array',
		customType: 'model',
	})

/**
 * @description py模块管理安装、卸载模块
 */
export const setPyModules = (data: AnyObject) =>
	useAxios.post('/project/python/MamgerPackage', {
		data,
		check: 'msg',
		customType: 'model',
		loading: `正在${data.act === 'install' ? '安装' : '卸载'}模块，请稍候`,
	})

/**
 * @description 删除项目域名
 */
export const multiRemoveProjectDomain = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		php: `site/delete_domain_multiple`,
		python: `/project/python/MultiRemoveProjectDomain`,
		java: `/mod/java/project/remove_domains`,
		phpasync: `/mod/php/php_async/project_remove_domain`,
		proxy: `/mod/proxy/com/batch_del_domain`,
		default: `/project/${type}/project_remove_domain`, // 循环递归删除
	}
	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		customType: type === 'php' ? 'default' : 'model',
		check: 'msg',
	})
}

/**
 * @description 获取网站列表
 * @param { AnyObject } data
 */
export const getNodeVersionList = () =>
	useAxios.post('/plugin?action=a&name=nodejs&s=get_online_version_list', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 获取环境配置
 * @returns
 */
export const getNodeJsEnvironment = () =>
	useAxios.post('/mod/nodejs/com/pre_env', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description node-项目删除
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const delNodeProject = (data: { project_name: string; project_type: string; pm2_name?: string }) =>
	useAxios.post('/mod/nodejs/com/delete', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取项目模块列表 -node
 */
export const getNodeModules = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/nodejs/get_project_modules`, {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 安装模块 -node
 */
export const installModule = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/nodejs/install_module`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 安装包 -node -一键安装项目模块
 */
export const installPackages = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/nodejs/install_packages`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 卸载模块 -node
 */
export const uninstallModule = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/nodejs/uninstall_module`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 升级模块 -node
 */
export const upgradeModule = (data: AnyObject): Promise<any> =>
	useAxios.post(`project/nodejs/upgrade_module`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取nodejs运行列表
 */
export const getRunList = (data: AnyObject): Promise<any> =>
	useAxios.post('project/nodejs/get_run_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 检查路径状态
 * @param {string} data.path 路径
 */
export const checkPathStatus = (data: { path: string }) =>
	useAxios.post('/mod/nodejs/com/check_path_status', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取包管理器
 * @param {string} data.version 版本
 */
export const getPackageManagers = (data: { version: string }) =>
	useAxios.post('/mod/nodejs/com/get_package_managers', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description node-项目修改
 */
export const modifyNodeProject = (data: any) =>
	useAxios.post('/mod/nodejs/com/modify_project', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取pm2监控
 */
export const getPM2Monit = () =>
	useAxios.post('/mod/nodejs/com/get_pm2_monit', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置pm2状态
 */
export const setPM2Status = (data: AnyObject) =>
	useAxios.post('/mod/nodejs/com/set_pm2_status', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取pm2日志
 * @returns
 * @param {string} data.site_name 站点名称
 */
export const getPM2Logs = (data: AnyObject) =>
	useAxios.post('/mod/nodejs/com/get_pm2_logs', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置node命令行
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const setDefaultEnv = (data: AnyObject): Promise<any> =>
	useAxios.post('/plugin?action=a&s=set_default_env&name=nodejs', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 部署 java添加springboot项目
 */
export const addJavaProject = (data: AnyObject) =>
	useAxios.post('/mod/java/project/create_project', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description java修改springboot项目
 */
export const modifyJavaProject = (data: AnyObject) =>
	useAxios.post('/mod/java/project/modify_project', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取命令
 */
export const getCommand = (data: AnyObject) =>
	useAxios.post('/mod/java/project/get_command', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加本地jdk
 */
export const addLocalJdk = (data: AnyObject) =>
	useAxios.post('project/java/add_local_jdk', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 检查java项目参数
 */
export const checkJavaParams = (data: AnyObject) =>
	useAxios.post('/mod/java/project/check_env_for_project', {
		data,
		customType: 'model',
		check: 'default',
	})

/**
 * @description 查询进程信息
 */
export const processForCreate = (data: AnyObject) =>
	useAxios.post('/mod/java/project/process_for_create', {
		data,
		customType: 'model',
		check: 'array',
	})

/**
 * @description 查询进程信息
 */
export const processInfoForCreate = (data: AnyObject) =>
	useAxios.post('/mod/java/project/process_info_for_create', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取java项目信息
 */
export const getJavaInfo = () =>
	useAxios.post('/mod/java/project/get_system_info', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取java项目详情
 */
export const getJavaProjectInfo = (data: any): Promise<any> =>
	useAxios.post(`/mod/java/project/get_project_info`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取java项目配置文件列表
 */
export const getJavaProjectConfigList = (data: any): Promise<any> =>
	useAxios.post(`/mod/java/project/config_file_list`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取jmx信息
 */
export const getJmxStatus = (data: any): Promise<any> =>
	useAxios.post(`/mod/java/project/get_jmx_status`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description java项目springboot日志获取列表
 * @param {string} data.project_name  项目名
 */
export const getSpringBootLogList = (data: { project_name: string }) =>
	useAxios.post('/mod/java/project/get_spring_log_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description java项目springboot日志获取日志
 * @param {string} data.log_file  日志文件路径
 */
export const getSpringBootLog = (data: { log_file: string }) =>
	useAxios.post('/mod/java/project/get_spring_log_data', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取动态/Java项目版本
 */
export const getVersionProject = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		java: '/mod/java/project/get_version_list',
		default: '/mod/php/php_async/get_version_list',
	}
	const url = urlMap[type] || urlMap.default

	return useAxios.post(url, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取动态/Java项目备份列表
 */
export const nowFileBack = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		java: '/mod/java/project/now_file_backup',
		default: '/mod/php/php_async/now_file_backup',
	}
	const url = urlMap[type] || urlMap.default
	return useAxios.post(url, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 恢复动态/Java项目版本
 */
export const recoverVersionProject = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		java: '/mod/java/project/recover_version',
		default: '/mod/php/php_async/recover_version',
	}
	const url = urlMap[type] || urlMap.default
	return useAxios.post(url, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 删除动态/Java项目版本
 */
export const removeVersionProject = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		java: '/mod/java/project/remove_version',
		default: '/mod/php/php_async/remove_version',
	}
	const url = urlMap[type] || urlMap.default
	return useAxios.post(url, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 设置动态/Java项目版本备注
 */
export const setVersionPs = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		java: '/mod/java/project/set_version_ps',
		default: '/mod/php/php_async/set_version_ps',
	}
	const url = urlMap[type] || urlMap.default
	return useAxios.post(url, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description java切换jar包重启项目
 */
export const jarRestartJavaProject = (data: AnyObject) =>
	useAxios.post('/mod/java/project/update_project_by_restart', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 修改动态项目状态
 */
export const modifyProjectRunState = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/modify_project_run_state', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置停止站点 启动站点
 * @param { number } data.id 站点ID
 * @param { string } data.name 站点名称
 * @returns { Promise }
 */
export const setSiteStatus = (data: { id: number; name: string }, modules: string): Promise<any> => {
	const urlMap: UrlProps = {
		start: 'site/SiteStart',
		stop: 'site/SiteStop',
	}
	return useAxios.post(urlMap[modules], { data, check: 'msg' })
}

/**
 * @description 获取站点列表
 * @param { AnyObject } data
 * @returns { Promise }
 */
export const getDataInfoNew = (data: AnyObject): Promise<any> => useAxios.post('datalist/data/get_data_list', { data, customType: 'model' })

/**
 * @description 设置默认站点（监控报表插件）
 */
export const setDefaultMonitorSite = (data: AnyObject) =>
	useAxios.post(`/monitor/set_default_site.json`, {
		data: { SiteName: data.name },
		customType: 'model',
	})

/**
 * @description 获取ftp和mysql状态
 */
export const getFtpMysqlStatus = () =>
	useAxios.post('/panel/public/get_ftp_mysql_status', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 删除php动态项目
 */
export const deleteAsync = (data: AnyObject) =>
	useAxios.post('mod/php/php_async/DeleteSite', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除站点
 */
export const deleteSite = (data: AnyObject) => useAxios.post('site/DeleteSite', { data, check: 'msg' })

/**
 * @description 获取备份列表
 */
export const checkDelData = (data: AnyObject) => useAxios.post('site/check_del_data', { data, check: 'object' })

/**
 * @description 添加传统项目
 */
export const addPhpSite = (data: AnyObject) => useAxios.post('site/AddSite', { data, check: 'object' })

/**
 * @description 查找php版本
 */
export const GetPHPVersion = () => useAxios.post(`site/GetPHPVersion`)

/**
 * @description 添加传统项目一键解析
 */
export const setSiteDns = (data: { domains: string }) =>
	useAxios.post('site/set_site_dns', {
		data,
		check: 'array',
	})

/**
 * @description 创建php动态项目
 */
export const createAsync = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/create_project', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取用户列表
 */
export const getSystemUserListAsync = () =>
	useAxios.post('mod/php/php_async/get_system_user_list', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description php动态项目 检测安装
 */
export const checkInstallAsync = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/check_install', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 异步项目 检测依赖安装
 */
export const checkAutoInstall = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/check_auto_install', {
		data,
		check: 'boolean',
		customType: 'model',
	})

/**
 * @description 异步项目 获取swoole对应的php版本列表
 */
export const getSwooleCorrespondencePhp = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/get_swoole_correspondence_php', {
		data,
		customType: 'model',
	})

/**
 * @description 获取部署列表
 */
export const getDeploymentList = () => useAxios.post('deployment/GetSiteList', { check: 'object' })

/**
 * @description 设置部署信息
 */
export const setDeploymentInfo = (data: AnyObject) => useAxios.post('deployment/SetupPackage', { data, check: 'object' })

/**
 * @description
 */
export const createWebsiteMultiple = (data: AnyObject) => useAxios.post('site/create_website_multiple', { data, check: 'msg' })

/**
 * @description php项目 获取上传列表的所有包数据
 */
export const getPhpAppUploadList = () =>
	useAxios.post('/mod/php/aepg/get_upload_list', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php项目 删除指定上传应用包
 * @param {Object} data.app_name 应用包名称
 * @param {Object} data.app_version 应用包版本
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const delPhpUploadApp = (data: { app_name: string; app_version: string }) =>
	useAxios.post('/mod/php/aepg/delete_upload', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description python项目 重新创建项目
 */
export const pythonRecreateProject = (data: AnyObject) =>
	useAxios.post('project/python/re_prep_env', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php项目 获取上传列表中某一个包的数据
 * @param {Object} data.app_name 应用包名称
 * @param {Object} data.app_version 应用包版本
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getPhpAppUpload = (data: { app_name: string; app_version: string }) =>
	useAxios.post('/mod/php/aepg/get_upload_result', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php项目 创建网站并应用应用包
 * @param {Object} data.site_name 站点名称
 * @param {Object} data.webname 域名列表
 * @param {Object} data.app_name 应用包名称
 * @param {Object} data.app_version 应用包版本
 * @param {Object} data.ps 备注
 */
export const createPhpAppSite = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	app_name: string
	app_version: string
	webname: string
	ps: string
}) =>
	useAxios.post('/mod/php/aepg/create_site', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取404配置
 */
export const getErrorConfig = () => useAxios.post('site/get_404_config', { check: 'object' })

/**
 * @description 设置404配置
 */
export const setErrorConfig = (data: AnyObject) => useAxios.post('site/set_404_config', { data, check: 'msg' })

/**
 * @description 获取默认站点
 */
export const getDefaultSite = () => useAxios.post('site/GetDefaultSite', { check: 'object' })

/**
 * @description 设置默认站点
 */
export const setDefaultSite = (data: { name: string }) => useAxios.post('site/SetDefaultSite', { data, check: 'msg' })

/**
 * @description 获取PHP命令版本行
 */
export const getCliVersion = () => useAxios.post('config/get_cli_php_version', { check: 'object' })

/**
 * @description 设置PHP命令版本行
 */
export const setCliVersion = (data: AnyObject) => useAxios.post('config/set_cli_php_version', { data, check: 'msg' })

/**
 * @description 获取HTTPS防窜站
 */
export const getHttpsMode = () => useAxios.post('site/get_https_mode', { check: 'boolean' })
/**
 * @description 获取HTTPS管理信息
 */
export const getHttpsInfo = () => useAxios.post('site/get_https_settings', { check: 'object' })
/**
 * @description 设置全局HTTP2HTTPS
 */
export const setGlobalHttp2https = (data: { status: 1 | 0 }) => useAxios.post('site/set_global_http2https', { data, check: 'msg' })

/**
 * @description 设置HTTPS防窜站
 */
export const setHttpsMode = () => useAxios.post('site/set_https_mode', { check: 'msg' })

/**
 * @description 获取TLS数据
 */
export const getSslProtocol = () => useAxios.post('site/get_ssl_protocol', { check: 'object' })

/**
 * @description 设置TLS数据
 */
export const setSslProtocol = (data: AnyObject) => useAxios.post('site/set_ssl_protocol', { data, check: 'msg' })

/**
 * @description 获取全局设置
 */
export const getGloalSetting = () => useAxios.post('site/create_default_conf', { check: 'object' })

/**
 * @description 开启cdn解析IP
 */
export const openCdnIp = (data: AnyObject) => useAxios.post('site/open_cdn_ip', { data, check: 'msg' })

/**
 * @description 修改日志路径
 */
export const setSitesLogPath = (data: AnyObject) =>
	useAxios.post('site/set_sites_log_path', {
		data,
		check: 'array',
		loading: '正在设置，请稍候...',
	})

/**
 * @description 设置全局设置 状态
 */
export const setSitesLogStatus = (data: AnyObject) => useAxios.post('site/set_create_default_conf', { data, check: 'msg' })

/**
 * @description 获取FTP信息
 */
export const getFtpInfo = () => useAxios.post('panel/sitelink/get_ftp_info', { customType: 'model' })

/**
 * @description 修改FTP信息
 */
export const modifyFtpLink = (data: AnyObject) =>
	useAxios.post('panel/sitelink/modify_ftp_link', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取MYSQL信息
 */
export const modifyMysqlLink = (data: AnyObject) =>
	useAxios.post('panel/sitelink/modify_mysql_link', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取数据库信息-关联服务
 */
export const getMysqlInfo = () =>
	useAxios.post('panel/sitelink/get_mysql_info', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取网站信息
 */
export const getSiteInfo = () => useAxios.post('panel/sitelink/get_site_info', { customType: 'model' })

/**
 * @description 已备份的站点
 */
export const getBackupListBySite = (data: AnyObject) =>
	useAxios.post('panel/sitebackup/backup_list_by_site', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 配置文件列表
 */
export const getSiteBackupList = () =>
	useAxios.post('panel/sitebackup/backup_list', {
		check: 'array',
		customType: 'model',
	})

/**
 * @description 网站备份列表
 */
export const getSiteList = () =>
	useAxios.post('panel/sitebackup/site_list', {
		check: 'array',
		customType: 'model',
	})

/**
 * @description 恢复配置文件
 */
export const recoverSites = (data: AnyObject) =>
	useAxios.post('panel/sitebackup/recover_sites', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除备份数据库
 */
export const DelBackup = (data: AnyObject) => useAxios.post('site/DelBackup', { data, check: 'msg' })

/**
 * @description 备份站点
 */
export const BackupSite = (data: AnyObject) => useAxios.post('site/ToBackup', { data, check: 'msg' })

/**
 * @description 获取备份日志
 */
export const getBackupLogs = (data: AnyObject) =>
	useAxios.post('logs/site/get_backup_logs', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 取消备份
 */
export const stopBackup = (data: AnyObject) =>
	useAxios.post('logs/site/stop_backup', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取备份列表
 */
export const deleteBackup = (data: AnyObject) => useAxios.post('files/delete_backup', { data, check: 'msg' })

/**
 * @description 获取备份列表
 */
export const downloadBackup = (data: AnyObject) => useAxios.post('files/download_backup', { data, check: 'object' })

/**
 * @description 获取备份列表
 */
export const editBackupConfig = (data: AnyObject) => useAxios.post('files/edit_backup_config', { data, check: 'msg' })

/**
 * @description 获取备份列表
 */
export const getBackupConfig = (data: AnyObject) => useAxios.post('files/get_backup_config', { data, check: 'object' })

/**
 * @description 获取备份列表
 */
export const getBackupList = (data: AnyObject) => useAxios.post('files/list_backups', { data, check: 'object' })

/**
 * @description 获取备份列表
 */
export const restoreBackup = (data: AnyObject) => useAxios.post('files/restore_backup', { data, check: 'msg' })

/**
 * @description 获取网站php版本-php
 */
export const getSitePhpVersion = (data: { siteName: string }): Promise<any> => useAxios.post(`site/GetSitePHPVersion`, { data, check: 'object' })

/**
 * @description 获取已安装php版本-php
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getPhpVersion = (data?: { s_type?: number; all?: number }): Promise<any> => useAxios.post(`site/GetPHPVersion`, { data, check: 'object' })

/**
 * @description 获取当前网站是否开启session隔离-php
 */
export const getSessionStatus = (data: { id: number }): Promise<any> => useAxios.post(`config/get_php_session_path`, { data })

/**
 * @description 设置网站php版本-php
 */
export const setSitePhpVersion = (data: { siteName: string; version: string; other: string }): Promise<any> => useAxios.post(`site/SetPHPVersion`, { data, check: 'msg' })

/**
 * @description 设置php网站session隔离-php
 */
export const setSessionStatus = (data: { id: string; act: number }): Promise<any> => useAxios.post(`config/set_php_session_path`, { data, check: 'msg' })

/**
 * @description 获取网站站点防护状态-php
 */
export const getProtectStatus = (): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_status`, {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置网站php版本防护-php
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setPhpVersionSafe = (data: { php_version: string; enable: number }): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=set_php_status`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取php版本防护状态-php
 */
export const getPhpVersionSafe = (): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_index`, {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取当前网站php版本防护状态-php
 */
export const getPhpSiteSafe = (): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_sites`, {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置php网站防护状态-php
 * @param {any} data 网站信息
 * @param {boolean} staus 状态  true开启 false关闭
 */
export const setProtectStatus = (data: any, staus: boolean): Promise<any> => {
	return useAxios.post(`/plugin?action=a&name=security_notice&s=${!staus ? 'stop_site' : 'start_site'}`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取网站php版本防护触发日志-php
 */
export const getPhpSiteSafeLog = (data: any): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=get_domain_logs`, {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 修改动态项目配置
 */
export const modifyProjectAsync = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/modify_project', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取动态项目状态
 */
export const getProjectRunState = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/get_project_run_state', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除当前网站php版本防护监视器-php
 */
export const delPhpSiteSafe = (data: any): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=del_site_config`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加网站php版本防护触发日志url白名单-php
 */
export const addPhpSiteSafeWhite = (data: any): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=add_url_white`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加网站php版本防护触发日志ip白名单-php
 */
export const addPhpSiteIpWhite = (data: any): Promise<any> =>
	useAxios.post(`/plugin?action=a&name=security_notice&s=add_ip_white`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加绑定目录
 */
export const addDirBinding = (data: AnyObject) => useAxios.post('site/AddDirBinding', { data, check: 'msg' })

/**
 * @description 删除绑定目录
 */
export const delDirBinding = (data: AnyObject) => useAxios.post('site/DelDirBinding', { data, check: 'msg' })

/**
 * @description 批量删除子目录
 */
export const deleteDirBindMultiple = (data: AnyObject) => useAxios.post('site/delete_dir_bind_multiple', { data, check: 'object' })

/**
 * @description 获取子目录绑定
 */
export const getDirBinding = (data: AnyObject) => useAxios.post('site/GetDirBinding', { data })

/**
 * @description 获取目录是否存在伪静态规则
 */
export const getDirRewrite = (data: AnyObject) => useAxios.post('site/GetDirRewrite', { data, check: 'object' })

/**
 * @description 获取网站目录
 */
export const getCatalogueKey = (data: AnyObject) => useAxios.post('data/getKey', { data, check: 'string' })

/**
 * @description 获取网站运行目录等
 */
export const getDirUserINI = (data: AnyObject) => useAxios.post('site/GetDirUserINI', { data })

/**
 * @description 设置站点路径
 */
export const setPath = (data: AnyObject) => useAxios.post('site/SetPath', { data, check: 'msg' })

/**
 * @description 设置站点运行目录
 */
export const setSiteRunPath = (data: { runPath: string; id: string }) => useAxios.post('site/SetSiteRunPath', { data, check: 'msg' })

/**
 * @description 获取站点FTP
 */
export const getSitesFtp = (data: AnyObject) => useAxios.post('site/get_sites_ftp', { data, check: 'object' })

/**
 * @description 设置站点FTP
 */
export const setSitesFtp = (data: AnyObject) => useAxios.post('site/set_sites_ftp', { data, check: 'msg' })

/**
 * @description 获取网站文件同步配置
 */
export const getBtSyncStatus = (data: { path: string }) => useAxios.post('files/get_bt_sync_status', { data, check: 'object' })

/**
 * @description 获取站点同步任务
 */
export const getGitTask = (data: AnyObject) =>
	useAxios.post('panel/syncsite/get_task', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 添加站点同步任务
 */
export const addGitTask = (data: AnyObject) =>
	useAxios.post('panel/syncsite/add_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除站点同步任务
 */
export const delGitTask = (data: AnyObject) =>
	useAxios.post('panel/syncsite/del_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 执行站点同步任务
 */
export const runSiteTask = (data: AnyObject) =>
	useAxios.post('panel/syncsite/run_site_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置站点用户配置
 */
export const setDirUserINI = (data: AnyObject) => useAxios.post('site/SetDirUserINI', { data, check: 'msg' })

/**
 * @description 写访问日志
 */
export const writeAccessLog = (data: AnyObject) => useAxios.post('site/logsOpen', { data, check: 'msg' })

/**
 * @description 关闭加密访问
 */

export const closeHasPwd = (data: AnyObject) => useAxios.post('site/CloseHasPwd', { data, check: 'msg' })

/**
 * @description 设置加密访问
 */
export const setHasPwd = (data: AnyObject) => useAxios.post('site/SetHasPwd', { data, check: 'msg' })

/**
 * @description php模块关闭文件同步任务 接手任务
 */
export const delSiteRsync = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&name=rsync&s=remove_module', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php模块关闭文件同步任务
 */
export const removeSendTask = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&name=rsync&s=remove_send_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取配额容量
 */
export const getPathQuota = (data: AnyObject) =>
	useAxios.post('project/quota/get_path_quota', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取网站配额信息
 */
export const getXfsDisk = (data: AnyObject) =>
	useAxios.post('/panel/public/get_xfs_disk', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 设置FTP配额容量
 * @param { AnyObject } data
 */
export const setSiteQuota = (data: AnyObject) =>
	useAxios.post('project/quota/modify_path_quota', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加站点的Webdav
 */
export const addWebdav = (data: AnyObject) =>
	useAxios.post('sitetool/webdav/add_webdav', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description
 */
export const getWebdavConf = (data: AnyObject) =>
	useAxios.post('sitetool/webdav/get_webdav_conf', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 站点的Webdav auth配置开关
 */
export const removeAuth = (data: AnyObject) =>
	useAxios.post('sitetool/webdav/remove_auth', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 站点的Webdav auth配置账号密码
 */
export const setNginxAuth = (data: AnyObject) =>
	useAxios.post('sitetool/webdav/set_auth', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 站点的Webdav配置开关
 */
export const setWebdav = (data: AnyObject) =>
	useAxios.post('sitetool/webdav/set_webdav', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除站点的Webdav
 */
export const removeWebdav = (data: AnyObject) =>
	useAxios.post('sitetool/webdav/remove_webdav', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除禁止访问
 */
export const delFileDeny = (data: AnyObject) => useAxios.post('config/del_file_deny', { data, check: 'msg' })

/**
 * @description 批量删除加密访问规则
 */
export const deleteDirAuthMultiple = (data: AnyObject) => useAxios.post('site/delete_dir_auth_multiple', { data, check: 'object' })

/**
 * @description 获取加密访问列表
 */
export const getDirAuth = (data: { id: string | number }) => useAxios.post('site/get_dir_auth', { data })

/**
 * @description 获取禁止访问列表
 */
export const getFileDeny = (data: AnyObject) => useAxios.post('config/get_file_deny', { data })

/**
 * @description 删除加密访问
 */
export const deleteDirAuth = (data: AnyObject) => useAxios.post('site/delete_dir_auth', { data, check: 'msg' })

/**
 * @description 修改加密访问
 */
export const modifyDirAuthPass = (data: AnyObject) => useAxios.post('site/modify_dir_auth_pass', { data, check: 'msg' })

/**
 * @description 修改禁止访问
 */
export const setFileDeny = (data: AnyObject) => useAxios.post('config/set_file_deny', { data, check: 'msg' })

/**
 * @description
 */
export const setDirAuth = (data: AnyObject) => useAxios.post('site/set_dir_auth', { data, check: 'object' })

/**
 * @description
 */
export const downClientPfx = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&name=ssl_verify&s=down_client_pfx', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取双向绑定是否配置
 */
export const getSslConfig = () =>
	useAxios.post(`/plugin?action=a&name=ssl_verify&s=get_config`, {
		customType: 'model',
		check: 'array',
	})

/**
 * @description
 */
export const getSslList = (data: AnyObject) =>
	useAxios.post(`/plugin?action=a&name=ssl_verify&s=get_ssl_list`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description
 */
export const getSslSiteList = () =>
	useAxios.post(`/plugin?action=a&name=ssl_verify&s=get_site_list`, {
		customType: 'model',
	})

/**
 * @description
 */
export const getUserCert = (data: AnyObject) =>
	useAxios.post(`/plugin?action=a&name=ssl_verify&s=get_user_cert`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 撤销证书
 */
export const revokeClientCert = (data: AnyObject) => {
	return useAxios.post('/plugin?action=a&name=ssl_verify&s=revoke_client_cert', {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description
 */
export const setSslConfig = (data: AnyObject) =>
	useAxios.post(`/plugin?action=a&name=ssl_verify&s=set_config`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 双向认证迁至查询
 */
export const setSslVerify = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&name=ssl_verify&s=set_ssl_verify', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description
 */
export const setLimitConfig = (data: AnyObject) => useAxios.post('site/check_total_install_info', { data })

/**
 * @description
 */
export const getGeneratedFlowInfo = (data: AnyObject) => useAxios.post('site/get_generated_flow_info', { data, check: 'object' })

/**
 * @description
 */
export const getLimitConfig = (data: AnyObject) => useAxios.post('site/get_limit_config', { data })

/**
 * @description
 */
export const setLimitStatus = (data: AnyObject) => useAxios.post('site/set_limit_status', { data, check: 'msg' })

/**
 * @description 删除流量限额
 */
export const removeFlowRule = (data: AnyObject) => useAxios.post('site/remove_flow_rule', { data, check: 'msg' })

/**
 * @description 创建流量限制配置
 */
export const createFlowRule = (data: AnyObject) => useAxios.post('site/create_flow_rule', { data, check: 'msg' })

/**
 * @description 获取默认文档
 */
export const getContentIndex = (data: { id: string | number }) => useAxios.post('site/GetIndex', { data, check: 'string' })

/**
 * @description 设置默认文档
 */
export const setContentIndex = (data: AnyObject) => useAxios.post('site/SetIndex', { data, check: 'msg' })

/**
 * @description 获取composer版本
 * @param { AnyObject } data
 */
export const getComposerVersion = (data: AnyObject) => useAxios.post('files/get_composer_version', { data, check: 'msg' })

/**
 * @description 获取指定站点的反向代理列表
 */
export const getProxyList = (data: AnyObject) => useAxios.post('site/GetProxyList', { data, check: 'array' })

/**
 * @description 修改反向代理
 */
export const createProxy = (data: AnyObject) => useAxios.post('site/CreateProxy', { data, check: 'msg' })

/**
 * @description 添加项目
 */
export const createProxySite = (data: AnyObject, type: string): Promise<any> => {
	const urlMap: UrlProps = {
		proxy: 'project/proxy/CreateProxy',
		phpasync: '/mod/php/php_async/create_proxy',
	}

	return useAxios.post(urlMap[type], {
		data,
		customType: 'model',
		check: 'msg',
	})
}
/**
 * @description 修改反向代理
 */
export const modifyProxy = (data: AnyObject) => useAxios.post('site/ModifyProxy', { data, check: 'msg' })

/**
 * @description 删除反向代理
 */
export const removeProxy = (data: AnyObject) => useAxios.post('site/RemoveProxy', { data, check: 'msg' })

/**
 * @description 获取对应站点的反向代理配置文件
 */
export const getProxyFile = (data: AnyObject) => useAxios.post('site/GetProxyFile', { data, check: 'array' })

/**
 * @description 获取对应站点的反向代理配置文件
 */
export const saveRedirectFile = (data: AnyObject) => useAxios.post('site/SaveRedirectFile', { data, check: 'msg' })

/**
 * @description 获取指定站点的反向代理列表 -反向代理 异步项目
 */
export const getModulesProxyList = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		proxy: 'project/proxy/GetProxyList',
		phpasync: '/mod/php/php_async/get_proxy_list',
	}

	return useAxios.post(urlMap[type], {
		data,
		check: type === 'phpasync' ? 'default' : 'array',
		customType: 'model',
	})
}

/**
 * @description 修改反向代理
 */
export const modifyModulesProxy = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		proxy: 'project/proxy/ModifyProxy',
		phpasync: '/mod/php/php_async/modify_proxy',
	}

	return useAxios.post(urlMap[type], {
		data,
		check: 'msg',
		customType: 'model',
	})
}
/**
 * @description 删除反向代理
 * @param { AnyObject } data
 * @param { string } type  反代、异步
 */
export const removeModulesProxy = (data: AnyObject, type: string) => {
	const urlMap: UrlProps = {
		proxy: 'project/proxy/RemoveProxy',
		phpasync: '/mod/php/php_async/remove_proxy',
	}

	return useAxios.post(urlMap[type], {
		data,
		check: 'msg',
		customType: 'model',
	})
}

/**
 * @description 创建php动态项目反向代理
 */
export const createAsyncProxy = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/create_proxy', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 保存php动态项目反向代理配置文件
 * @param data
 */
export const asyncSaveProxyFile = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/save_proxy_file', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置增量备份状态
 */
export const setBackupStatus = (data: AnyObject) =>
	useAxios.post('/files?action=set_backup_status', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 查找指定插件信息
 * @param { string } data.name 插件名称
 * @returns { Promise } 返回值
 */
export const getPluginInfo = (data: { sName: string }): Promise<any> => useAxios.post('plugin/get_soft_find', { data, check: 'string' })

// 网站-设置-网站防篡改请求接口
/**
 * @descripttion  请求防篡改数据
 * @param data time 查询的时间
 */
export const getProofIndex = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=get_index&name=tamper_proof_refactored', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 请求防篡改数据
 * @param data time 查询的时间
 */
export const getProofLog = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=get_safe_logs&name=tamper_proof_refactored', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 获取配置
 * @param data
 */
export const getProofFind = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=get_site_find&name=tamper_proof_refactored', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 删除 排除目录
 * @param data
 */
export const removeExcloud = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=remove_excloud&name=tamper_proof_refactored', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 添加 排除目录
 * @param data
 */
export const addExcloud = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=add_excloud&name=tamper_proof_refactored', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 添加 保护目录
 * @param data
 */
export const addProtectExt = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=add_protect_ext&name=tamper_proof_refactored', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 删除 保护目录
 * @param data
 */
export const removeProtectExt = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=remove_protect_ext&name=tamper_proof_refactored', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 删除 保护目录
 * @param data
 */
export const setConfigSite = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=set_config_site&name=tamper_proof_refactored', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 网站 防篡改状态
 * @param data
 */
export const setSiteStatusProof = (data: AnyObject) =>
	useAxios.post('/plugin?action=a&s=set_site_status&name=tamper_proof_refactored', {
		data,
		check: 'array',
		customType: 'model',
	})
// 网站-设置-网站防篡改请求接口 end

// 网站-设置-企业防篡改请求接口
/**
 * @descripttion 防篡改全局配置
 * @param data
 */
export const getGlabalTotal = () =>
	useAxios.post('/tamper_core/get_glabal_total.json', {
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 防篡改列表
 * @param data
 */
export const getTamperPaths = (data?: AnyObject) =>
	useAxios.post('/tamper_core/get_tamper_paths.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 立即恢复防护
 * @param data
 */
export const delTempClose = () =>
	useAxios.post('/tamper_core/del_temp_close.json', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 临时关闭防篡改
 * @param data
 */
export const setTempClose = (data: AnyObject) =>
	useAxios.post('/tamper_core/set_temp_close.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 修改全局状态
 * @param data
 */
export const modifyGlobalConfig = (data: AnyObject) =>
	useAxios.post('/tamper_core/modify_global_config.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 获取防篡改规则
 * @param data
 */
export const getTamperRuleByPath = (data: AnyObject) =>
	useAxios.post('/tamper_core/get_tamper_rule_by_path.json', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 开启/关闭受保护的文件类型
 * @param data
 */
export const releaseFileExt = (data: AnyObject) =>
	useAxios.post('/tamper_core/release_file_ext.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 开启/关闭白名单文件
 * @param data
 */
export const releaseWhiteFileExt = (data: AnyObject) =>
	useAxios.post('/tamper_core/release_white_files.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 开启/关闭白名单目录
 * @param data
 */
export const releaseWhiteDirname = (data: AnyObject) =>
	useAxios.post('/tamper_core/release_white_dirname.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 开启/关闭受保护的文件类型
 * @param data
 */
export const removeBlackExts = (data: AnyObject) =>
	useAxios.post('/tamper_core/remove_black_exts.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 修改备注
 * @param data
 */
export const setWhiteDirWithPs = (data: AnyObject) =>
	useAxios.post('/tamper_core/set_white_dir_with_ps.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 删除 白名单文件
 * @param data
 */
export const removeWhiteFiles = (data: AnyObject) =>
	useAxios.post('/tamper_core/remove_white_files.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 删除 白名单目录
 * @param data
 */
export const removeWhiteDirs = (data: AnyObject) =>
	useAxios.post('/tamper_core/remove_white_dirs.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 同步到其他站点
 * @param data
 */
export const syncBlackExts = (data: AnyObject) =>
	useAxios.post('/tamper_core/sync_black_exts.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 受保护文件类型 日志
 * @param data
 */
export const getActionLogsForExts = (data: AnyObject) =>
	useAxios.post('/tamper_core/get_action_logs_for_exts.json', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 白名单文件 日志
 * @param data
 */
export const getActionLogsForFilename = (data: AnyObject) =>
	useAxios.post('/tamper_core/get_action_logs_for_filename.json', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 白名单目录 日志
 * @param data
 */
export const getActionLogsForDirname = (data: AnyObject) =>
	useAxios.post('/tamper_core/get_action_logs_for_dirname.json', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 添加受保护文件类型
 * @param data
 */
export const addBlackExts = (data: AnyObject) =>
	useAxios.post('/tamper_core/add_black_exts.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 添加文件白名单
 * @param data
 */
export const addWhiteFiles = (data: AnyObject) =>
	useAxios.post('/tamper_core/add_white_files.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 添加目录白名单
 * @param data
 */
export const addWhiteDirs = (data: AnyObject) =>
	useAxios.post('/tamper_core/add_white_dirs.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 获取企业防篡改日志
 * @param data
 */
export const getTamperCoreLogs = (data: AnyObject) =>
	useAxios.post('/tamper_core/get_logs.json', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @descripttion 修改站点 企业防篡改配置
 * @param data
 */
export const modifyPathConfig = (data: AnyObject) =>
	useAxios.post('/tamper_core/modify_path_config.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 修改站点 企业防篡改配置
 * @param data
 */
export const modifyPathConfigBatch = (data: AnyObject) =>
	useAxios.post('/tamper_core/modify_path_config_batch.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 创建站点 企业防篡改配置
 * @param data
 */
export const multiCreate = (data: AnyObject) =>
	useAxios.post('/tamper_core/multi_create.json', {
		data,
		check: 'array',
		customType: 'model',
	})

/**
 * @descripttion 修改 企业防篡改配置 告警
 * @param data
 */
export const setPushStatus = (data: AnyObject) =>
	useAxios.post('push/set_push_status', {
		data,
		check: 'msg',
	})

/**
 * @descripttion 清除日志
 * @param data
 */
export const delLogs = (data: AnyObject) =>
	useAxios.post('/tamper_core/del_logs.json', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @descripttion 设置 企业防篡改服务状态
 * @param data
 */
export const serviceAdmin = (data: AnyObject) =>
	useAxios.post('/tamper_core/service_admin.json', {
		data,
		check: 'msg',
		customType: 'model',
	})
// 网站-设置-企业防篡改请求接口 end

/**
 * @description 获取推送列表
 */
export const getPushList = (): Promise<any> =>
	useAxios.post('push/get_push_list', {
		check: 'object',
	})

/**
 * @description 设置推送配置
 */
export const setPushConfig = (data: AnyObject): Promise<any> => useAxios.post('push/set_push_config', { data, check: 'msg' })

/**
 * @description 开关告警任务
 * @param { number } data.task_id 任务id
 * @returns { Promise }
 */
export const updateSslTask = (data: any): Promise<any> =>
	useAxios.post('/mod/push/task/update_ssl_task', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 网站扫描-修复方案前置请求
 */
export const scanSiteRepairReq = () =>
	useAxios.post('project/webscanning/repair', {
		customType: 'model',
		check: 'ignore',
	})

/**
 * @description 网站-获取扫描列表
 */
export const getScanList = () =>
	useAxios.post('project/scanning/list', {
		customType: 'model',
		check: 'ignore',
	})

/**
 * @description 获取动态查杀
 */
export const checkMonitorDir = (data: { path: string }) =>
	useAxios.post('project/safe_detect/check_monitor_dir', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除隔离文件
 * @param { Object } data 参数
 */

export const setHandleFile = (data: AnyObject) => {
	return useAxios.post(`/project/safe_detect/set_handle_file`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取动态查杀 - 单个网站
 */
export const webshellFileSingle = (data: { path: string }) =>
	useAxios.post('project/safe_detect/webshell_file_single', {
		data,
		check: 'array',
		customType: 'model',
	})

/**
 * @description 停止监控/启动监控
 */
export const setMonitorDir = (status: boolean, data: AnyObject) => {
	const url = status ? 'stop_monitor_dir' : 'start_monitor_dir'
	return useAxios.post(`/project/safe_detect/${url}`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 扫描单个站点 / 获取扫描时间
 */
export const scanSingleSite = (data: AnyObject) =>
	useAxios.post('project/webscanning/ScanSingleSite', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取扫描结果
 */
export const getRiskCount = () =>
	useAxios.post('project/webscanning/get_risk_count', {
		customType: 'model',
	})

/**
 * @description 获取备份到列表数据
 */
export const getBackupType = (data: AnyObject) =>
	useAxios.post('crontab/GetDataList', {
		data,
		check: 'object',
	})

/**
 * @description 删除违规词检测
 */
export const delContentMonitorInfo = (data: AnyObject) =>
	useAxios.post('project/content/del_content_monitor_info', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 违规词检测
 */
export const getSingleSiteContentMonitorList = (data: AnyObject) =>
	useAxios.post('project/content/get_single_site_content_monitor_list', {
		data,
		check: 'array',
		customType: 'model',
	})

/**
 * @description 获取文件列表
 */
export const searchFiles = (data: AnyObject) => useAxios.post('files/SearchFilesData', { data, check: 'object' })

/**
 * @description 立即检测
 */
export const scanning = (data: AnyObject) => {
	return useAxios.post(`/project/content/scanning`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 创建报警 -拨测告警
 */
export const createBoce = (data: AnyObject) =>
	useAxios.post('monitor/boce/create', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取报警列表 -拨测告警选项
 */
export const getAlarmList = () =>
	useAxios.post('monitor/boce/get_alam_list', {
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取报警列表 -拨测告警
 */
export const getBoceList = (data: AnyObject) =>
	useAxios.post('monitor/boce/get_list', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取报警日志 -拨测告警
 */
export const getBoceLog = (data: AnyObject) =>
	useAxios.post('monitor/boce/get_task_log', {
		data,
		check: 'object',
		customType: 'model',
	})
/**
 * @description 删除报警 -拨测告警
 */
export const removeBoce = (data: AnyObject) =>
	useAxios.post('monitor/boce/remove', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 执行报警 -拨测告警
 */
export const startBoce = (data: AnyObject) =>
	useAxios.post('monitor/boce/start', {
		data,
		check: 'array',
		customType: 'model',
	})

/**
 * @description 修改报警 -拨测告警
 */
export const modifyBoce = (data: AnyObject) =>
	useAxios.post('monitor/boce/modify', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除告警日志 -拨测告警
 */
export const removeTaskLog = (data: AnyObject) =>
	useAxios.post('monitor/boce/remove_task_log', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置网站tomcat状态
 */
export const setTomcatSettings = (data: { siteName: string }) => useAxios.post('site/SetTomcat', { data, check: 'msg' })

/**
 * @description 设置安全头部
 */
export const setSecurityHeaders = (data: AnyObject) => useAxios.post('site/set_security_headers', { data, check: 'object' })

/**
 * @description 获取安全头部
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getSecurityHeaders = (data: { site_name: string }) => useAxios.post('site/get_security_headers', { data, check: 'object' })

/**
 * @description 获取网站配置 -cors
 */
export const deleteCorsConfig = (data: { path: string; encoding: string }) => useAxios.post('files/delete_cors_config', { data, check: 'msg' })

/**
 * @description 获取网站配置 -cors
 */
export const getCorsConfig = (data: { path: string }) => useAxios.post('files/view_cors_config', { data, check: 'object' })

/**
 * @description 获取网站配置 -cors
 */
export const updateCorsConfig = (data: AnyObject) => useAxios.post('files/update_cors_config', { data, check: 'object' })

/**
 * @description php项目 删除指定包环境
 * @param {Object} data.site_name 站点名称
 * @param {Object} data.app_name 应用包名称
 * @param {Object} data.app_version 应用包版本
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const delPhpApp = (data: { site_name: string; app_name: string; app_version: string }) =>
	useAxios.post('/mod/php/aepg/delete', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php项目 获取应用包列表
 * @param {Object} data.site_name 站点名称
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getPhpAppList = (data: { site_name: string }) =>
	useAxios.post('/mod/php/aepg/get_list', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php项目 应用指定包环境
 * @param {Object} data.site_name 站点名称
 * @param {Object} data.app_name 应用包名称
 * @param {Object} data.app_version 应用包版本
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const setPhpApp = (data: { site_name: string; app_name: string; app_version: string }) =>
	useAxios.post('/mod/php/aepg/apply_site', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php项目 获取应用包环境信息
 * @param {string} data.site_name 站点名称
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getPhpEnvInfo = (data: { site_name: string }) =>
	useAxios.post('/mod/php/aepg/get_env_info', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description php项目 创建应用包
 * @param {string} data.site_name 站点名称
 * @param {string} data.app_name 应用包名称
 * @param {string} data.app_version 应用包版本
 * @param {string} data.php_versions PHP版本
 * @param {string} data.php_functions PHP函数
 * @param {string} data.mysql_versions MySQL版本
 * @param {number} data.init_sql 是否初始化数据库
 * @param {string} data.db_name 数据库名称
 * @param {string} data.db_id 数据库ID
 * @param {string} data.exclude_dir 排除目录
 * @param {string} data.db_config_files 数据库配置文件
 * @param {string} data.update_log 更新日志
 */
export const createPhpApp = (data: {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	site_name: string
	app_name: string
	app_version: string
	php_versions: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	php_functions?: string
	mysql_versions: string
	init_sql: number
	// eslint-disable-next-line @typescript-eslint/naming-convention
	db_name?: string
	db_id?: string
	exclude_dir?: string
	// eslint-disable-next-line @typescript-eslint/naming-convention
	db_config_files?: string
	update_log?: string
}) =>
	useAxios.post('/mod/php/aepg/create', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加告警任务
@param { number | undefined } data.task_id? 任务id   编辑时传
@param { string } data.template_id 任务模板id
@param { string } data.task_data 任务数据（JSON数据）， task_data部分按模板来填写， sender为发送通道列表，number_rule为次数控制， time_rule为时间控制
@returns { Promise }
 */
export const setNewAlarmTask = (data: AnyObject) =>
	useAxios.post('/mod/push/task/set_task_conf', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取新告警列表
 * @param { number } data.page 页码
 * @param { number } data.limit 条数
 * @param { string } data.status 状态
 * @param { string } data.keyword 关键词
 * @returns { Promise }
 */
export const getAlarmTaskList = (data?: AnyObject) =>
	useAxios.post('/mod/push/task/get_task_list', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 添加端口规则
 * @returns { Promise }
 */
export const createRules = (data: AnyObject) =>
	useAxios.post('safe/firewall/create_rules', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取php动态项目 配置文件
 */
export const getConfigFile = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/get_config_file', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取网站访问日志信息
 */
export const getSiteAccessLogs = (data: AnyObject) =>
	useAxios.post('logs/site/get_site_access_logs', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取网站错误日志信息
 */
export const getSiteErrorLog = (data: AnyObject) => {
	return useAxios.post('logs/site/get_site_error_logs', {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取动态项目日志
 */
export const getProjectLog = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/get_project_log', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取依赖安装日志
 */
export const getSetupLog = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/get_setup_log', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取动态项目计划任务
 */
export const getCrontabList = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/get_crontab_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 删除动态项目计划任务
 */
export const removeCrontab = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/remove_crontab', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 运行动态项目计划任务
 */
export const startTaskCrontab = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/start_task', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 清除动态项目计划任务日志
 */
export const clearCrontabLog = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/clearn_logs', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取动态项目计划任务日志
 */
export const getCrontabLog = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/get_crontab_log', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加动态项目计划任务
 */
export const addCrontab = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/add_crontab', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改动态项目计划任务
 */
export const modifyCrontab = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/modify_crontab', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 修改动态项目计划任务状态
 */
export const modifyCrontabStatus = (data: AnyObject) =>
	useAxios.post('/mod/php/php_async/modify_crontab_status', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取网站列表
 * @param { Object } data 参数
 */
export const getDataList = (data: { type: string }) => {
	return useAxios.post(`crontab/GetDataList`, {
		data,
		check: 'object',
	})
}

/**
 * @description 添加/编辑监控
 * @param { Object } status/data 参数
 */
export const addMonitor = (status: boolean, data: AnyObject) => {
	const url = !status ? 'add_content_monitor_info' : 'set_content_monitor_info'
	return useAxios.post(`/project/content/${url}`, {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 获取站点违规词检测历史
 * @param { string } data.site_name 站点名称
 * @param { number } data.p 页码
 * @param { number } data.limit 每页数量
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const getSingleSiteRisk = (data: { site_name: string; p: number; limit: number }) =>
	useAxios.post('project/content/get_single_site_risk', {
		data,
		check: 'object',
		customType: 'model',
	})

/**
 * @description 获取检测历史
 * @param { Object } data 参数 limit p
 */
export const getRisk = (data: { limit: number; p: number }) => {
	return useAxios.post(`/project/content/get_risk`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 获取风险列表
 * @param { Object } data 参数 limit p
 */
export const getRiskList = (data: { limit: number; p: number }) => {
	return useAxios.post(`/project/content/get_risk_list`, {
		data,
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 自定义词库
 */
export const getThesaurus = () => {
	return useAxios.post(`/project/content/get_thesaurus`, {
		customType: 'model',
		check: 'array',
	})
}

/**
 * @description 清空自定义词库
 */
export const clearThesaurus = () => {
	return useAxios.post(`/project/content/clear_thesaurus`, {
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 删除自定义词库
 * @param { string } data.key 关键词
 */
export const delThesaurus = (data: { key: string }) => {
	return useAxios.post(`/project/content/del_thesaurus`, {
		data,
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 导出自定义词库
 */
export const outThesaurus = () => {
	return useAxios.post(`/project/content/out_thesaurus`, {
		customType: 'model',
		check: 'object',
	})
}

/**
 * @description 添加自定义词库
 * @param { Object } data 参数
 */
export const addThesaurus = (data: { key: string }) => {
	return useAxios.post(`/project/content/add_thesaurus`, {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 备份站点
 * @param { number } data.id 站点ID
 * @returns { Promise }
 */
export const setSiteBackup = (data: { id: number }): Promise<any> => useAxios.post('site/ToBackup', { data, check: 'msg' })

/**
 * @description 设置站点PHP版本
 */
export const setSitePhpVersionMultiple = (data: AnyObject) => useAxios.post('site/set_site_php_version_multiple', { data, check: 'msg' })

/**
 * @description 设置站点防跨站状态
 */
export const setSiteStatusMultiple = (data: AnyObject) => useAxios.post('site/multiple_basedir', { data })

/**
 * @description 伪静态规则列表
 */
export const getRewriteLists = (data: AnyObject) => useAxios.post('site/GetRewriteLists', { data })

/**
 * @description 设置伪静态规则
 */
export const setRewriteLists = (data: AnyObject) => useAxios.post('site/SetRewriteLists', { data })

/**
 * @description 获取网站域名列表
 */
export const getDomains = (data: AnyObject) => useAxios.post('site/get_domains', { data, check: 'array' })

/**
 * @description 获取tomcat状态
 */
export const changeTomcatJdk = (data: AnyObject): Promise<any> =>
	useAxios.post('project/java/change_tomcat_jdk', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 删除本地jdk
 */
export const delLocalJdk = (data: AnyObject) =>
	useAxios.post('project/java/del_local_jdk', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取本地jdk版本
 */
export const getLocalJdkVersion = (): Promise<any> =>
	useAxios.post('project/java/get_local_jdk_version', {
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取系统信息
 */
export const getSystemInfo = () =>
	useAxios.post('project/java/get_system_info', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 安装jdk
 */
export const installNewJdk = (data: { version: string }) =>
	useAxios.post('/mod/java/project/install_jdk_new', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 安装jdk
 */
export const installTomcat = (data: AnyObject) =>
	useAxios.post(`${`project/java/install_tomcat_new`}`, {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 设置jdk环境
 */
export const setJdkEnvironment = (data: AnyObject) =>
	useAxios.post('project/java/set_jdk_environment', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取tomcat状态
 */
export const setTomcatPort = (data: AnyObject): Promise<any> =>
	useAxios.post('project/java/replce_tomcat_port', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取tomcat状态
 */
export const setTomcatStatus = (data: AnyObject): Promise<any> =>
	useAxios.post('mod/java/project/start_tomcat', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 安装tomcat
 */
export const installNewTomcat = (data: { version: string; java_path: string }) =>
	useAxios.post('/mod/java/project/install_tomcat_new', {
		data,
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 站点的Webdav auth配置账号密码
 */
export const setClientMaxBodySize = (data: AnyObject) =>
	useAxios.post('sitetool/webdav/set_client_max_body_size', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取java项目组列表
 */
export const getJavaGroupList = () =>
	useAxios.post('/mod/java/group/group_list', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 删除java项目组
 * @param {string} data.group_id  组名
 */
export const delJavaGroup = (data: { group_id: string }) =>
	useAxios.post('/mod/java/group/remove_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加java项目组
 * @param {string} data.group_name  组名
 */
export const addJavaGroup = (data: { group_name: string }) =>
	useAxios.post('/mod/java/group/add_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取java项目组信息
 * @param {string} data.group_id  组id
 */
export const getJavaGroupDetail = (data: { group_id: string }) =>
	useAxios.post('/mod/java/group/group_info', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description java项目组移除项目
 * @param {string} data.group_id  组id
 * @param {string} data.project_name  项目id
 */
export const delGroupProject = (data: { group_id: string; project_id: string }) =>
	useAxios.post('/mod/java/group/remove_project_from_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description java项目组编辑项目启动方式
 * @param {string} data.group_id  组id
 * @param {string} data.sort_type  项目启动顺序   同时启动simultaneous 或者 依次启动sequence
 */
export const groupProjectType = (data: { group_id: string; sort_type: 'simultaneous' | 'sequence' }) =>
	useAxios.post('/mod/java/group/change_sort_type', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description java项目组编辑项目
 * @param {string} data.group_id  组id
 * @param {string} data.project_datas  json  修改后的项目数组
 */
export const editGroupProject = (data: { group_id: string; project_datas: string }) =>
	useAxios.post('/mod/java/group/modify_group_projects', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description java项目组项目操作
 * @param {string} data.group_id  组id
 * @param {string} type  操作类型  start 启动  stop 停止  terminate 终止
 */
export const groupProjectOperation = (data: { group_id: string }, type: 'start' | 'stop' | 'termination') => {
	let url = 'start_group'
	let load = '启动'
	switch (type) {
		case 'start':
			url = 'start_group'
			load = '启动'
			break
		case 'stop':
			url = 'stop_group'
			load = '停止'
			break
		case 'termination':
			url = 'termination_operation'
			load = '终止'
			break
	}
	return useAxios.post(`/mod/java/group/${url}`, {
		data,
		customType: 'model',
		check: 'msg',
		loading: `${load}中，请稍候...`,
	})
}

/**
 * @description java项目组获取日志
 * @param {string} data.group_id  组id
 * @param {number} data.last_write_time  上次获取日志时间，第一次为0
 */
export const getGroupLog = (data: { group_id: string; last_write_time: number }) =>
	useAxios.post('/mod/java/group/get_run_status', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description java项目组项目修改配置
 * @param {string} data.group_id  组id
 * @param {string} data.project_name  项目id
 * @param {string} data.check_info  检查信息
 * @param {string} data.level  启动优先级
 */
export const groupProjectConfig = (data: { group_id: string; project_id: string; check_info?: string; level?: string }) =>
	useAxios.post('/mod/java/group/modify_group_project', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description java项目组添加多个项目
 * @param {string} data.group_id  组id
 * @param {string} data.project_ids  项目id数组
 */
export const groupAddProjects = (data: { group_id: string; project_ids: string }) =>
	useAxios.post('/mod/java/group/add_projects_to_group', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取java可用项目
 */
export const getJavaSpringProject = () =>
	useAxios.post('/mod/java/group/spring_projects', {
		customType: 'model',
		check: 'array',
	})

/**
 * @description 添加ip规则
 * @returns { Promise }
 */
export const createIpRules = (data: AnyObject) =>
	useAxios.post('safe/firewall/create_ip_rules', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除ip规则
 * @returns { Promise }
 */
export const removeIpRules = (data: AnyObject) =>
	useAxios.post('safe/firewall/remove_ip_rules', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description
 */
export const getIpFlowTrend = (data: AnyObject) => useAxios.post('panel/siteflow/get_ip_flow_trend', { data, check: 'ignore', customType: 'model' })

/**
 * @description
 */
export const getIpFlowsAreasInfo = (data: AnyObject) =>
	useAxios.post('panel/siteflow/get_ip_flows_areas_info', {
		data,
		check: 'ignore',
		customType: 'model',
	})

/**
 * @description docker网站获取批量部署的站点列表
 */
export const getDockerDeploySiteDomain = (data?: AnyObject): Promise<any> => useAxios.post(`/mod/docker/com/GetSiteDomain`, { data, check: 'object', customType: 'model' })

/**
 * @description 网站 重命名
 */
export const siteRname = (data: AnyObject) =>
	useAxios.post('site/site_rname', {
		data,
		check: 'msg',
	})

/**
 * @description 删除排序
 */
export const delSorted = () => useAxios.post('data/del_sorted', { check: 'object' })

/**
 * @description 设置控制台日志
 */
export const setProjectLogStatus = (data: AnyObject) =>
	useAxios.post('/mod/java/project/set_project_log_status', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 批量操作项目状态
 * @param data
 * @param type
 * @returns
 */
export const batchStatus = (data: AnyObject, type: string) => useAxios.post(`/datalist/batch/batch_set_${type}_project_status`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目状态
 * @param data
 * @returns
 */
export const batchPhpStatus = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_set_site_status`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目备份
 * @param data
 * @returns
 */
export const batchPhpBack = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_site_backup`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目到期时间
 * @param data
 * @returns
 */
export const batchPhpEdate = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_set_site_edate`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目php版本
 * @param data
 * @returns
 */
export const batchPhpVersion = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_set_php_version`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目php放跨站
 * @param data
 * @returns
 */
export const batchPhpBasedir = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_set_site_basedir`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目php防盗链
 * @param data
 * @returns
 */
export const batchPhpReferer = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_site_referer`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目php流量限制
 * @param data
 * @returns
 */
export const batchPhpLimit = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_site_limit_net`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目php伪静态
 * @param data
 * @returns
 */
export const batchPhpRewrite = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_set_site_rewrite`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目php分类
 * @param data
 * @returns
 */
export const batchPhpType = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_set_site_type`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目获取网站域名
 * @param data
 * @returns
 */
export const batchPhpDomain = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_get_site_domains`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目 删除
 * @param data
 * @returns
 */
export const batchDelSite = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_delete_sites`, { data, check: 'object', customType: 'model' })

/**
 * @description 批量操作项目 设置ssl
 * @param data
 * @returns
 */
export const batchSetSsl = (data: AnyObject) => useAxios.post(`/datalist/batch/batch_set_site_ssl`, { data, check: 'object', customType: 'model' })

/**
 * @description 获取Tomcat版本列表
 * @param data
 * @returns
 */
export const getTomcat = () => useAxios.post(`/mod/java/project/get_tomcat_list`, { check: 'object', customType: 'model' })

/**
 * @description 获取Tomcat版本列表
 * @param data
 * @returns
 */
export const installTomcatNew = (data: AnyObject) => useAxios.post(`/mod/java/project/install_tomcat`, { data, check: 'object', customType: 'model' })

/**
 * @description 设置tomcat
 * @param data
 * @returns
 */
export const settingsTomcat = (data: AnyObject) => useAxios.post(`/mod/java/project/modify_tomcat`, { data, check: 'object', customType: 'model' })

/**
 * @description 卸载tomcat
 * @param data
 * @returns
 */
export const uninstallTomcat = (data: AnyObject) => useAxios.post(`/mod/java/project/uninstall_tomcat`, { data, check: 'object', customType: 'model' })

/**
 * @description 获取指定Tomcat版本
 * @param data
 * @returns
 */
export const getTomcatVersion = (tomcatName: string) => useAxios.post(`/mod/java/project/get_tomcat_info?tomcat_name=${tomcatName}`, { check: 'object', customType: 'model' })

/**
 * @description 获取端口 springboot
 * @param data
 * @returns
 */
export const getSpringbootPort = (data: AnyObject) => useAxios.post(`/mod/java/project/get_jar_port`, { data, check: 'object', customType: 'model' })

/**
 * @description 获取流量限额配置
 */
export const getFlowQuotaConfigData = (data: AnyObject) => useAxios.post(`/mod/push/task/monitor_push_list`, { data, check: 'object', customType: 'model' })

/**
 * @description 获取流量/请求数
 */
export const getFlowNumData = (data: AnyObject) => useAxios.post(`/monitor/get_site_total_list_custom.json`, { data, check: 'object', customType: 'model' })

/**
 * @description 判断监控报表是否安装
 */
export const checkMonitorReport = () => useAxios.post(`/plugin?action=a&name=monitor`, { check: 'msg', customType: 'model' })

/**
 * @description 检测监控
 */
export const killScan = (data: { id: number }) => {
	return useAxios.post(`/project/content/kill_scanning`, {
		data: { data: JSON.stringify(data) },
		customType: 'model',
		check: 'msg',
	})
}

/**
 * @description 企业防篡改--新告警，获取告警任务和通道
 */
export const getTamperAlarm = () => useAxios.post(`/tamper_core/push_task_list.json`, { check: 'object', customType: 'model' })

/**
 * @description 企业防篡改--新告警，添加、修改、删除告警任务
 */
export const setTamperAlarm = (data: AnyObject, type: 'add' | 'modify' | 'delete') => {
	let url = 'set_push_task'
	switch (type) {
		case 'add':
			url = 'set_push_task'
			break
		case 'modify':
			url = 'change_push_task_status'
			break
		case 'delete':
			url = 'remove_push_task'
			break
	}
	return useAxios.post(`/tamper_core/${url}.json`, { data, check: 'msg', customType: 'model' })
}

/**
 * @description Python--获取可用环境
 */
export const getPythonEnvironment = (data?: { sort_not_use: 1 | 0 }) => useAxios.post(`/mod/python/environment/list_environment`, { ...(data ? { data } : {}), check: 'msg', customType: 'model' })

/**
 * @description Python--创建虚拟环境
 */
export const createPythonEnvironment = (data: { venv_name: string; python_bin: string; ps: string }) => useAxios.post(`/mod/python/environment/create_python_env`, { data, check: 'msg', customType: 'model' })

/**
 * @description Python--添加环境
 */
export const addPythonEnvironment = (data: { add_type: string; path: string }) => useAxios.post(`/mod/python/environment/add_environment`, { data, check: 'msg', customType: 'model' })
/**
 * @description Python--删除虚拟环境
 */
export const deletePythonEnvironment = (data: { path_data: string }) => useAxios.post(`/mod/python/environment/remove_environment`, { data, check: 'msg', customType: 'model' })
/**
 * @description Python--设置命令行环境
 */
export const setPythonEnvironment = (data: { path: string }) => useAxios.post(`/mod/python/environment/set_environment_default`, { data, check: 'msg', customType: 'model' })
/**
 * @description TCP代理接口
 * @returns Promise<any>
 */
export const proxyTcpAction = (data?: any) =>
	useAxios.post('/mod/proxy/stream/get', {
		...(data ? { data } : {}),
		check: 'msg',
		customType: 'model',
	})

/**
 * @description 获取跨域访问配置
 * @param siteName 站点名称
 * @param project_type 网站类型  ("php", "java", "node", "wp2", "go", "python", "net", "html", "other") 大小写均可
 */
export const getCrossOriginAccess = (data: { siteName: string; project_type: string }) => useAxios.post(`/mod/corsmanager/cors/get_cors_config`, { data, check: 'msg', customType: 'model' })

/**
 * @description 设置跨域访问配置
 * @param data
 * @returns
 */
export const setCrossOriginAccess = (data: AnyObject) => useAxios.post(`/mod/corsmanager/cors/set_cors_config`, { data, check: 'msg', customType: 'model' })

/**
 * @description 移除跨域访问配置
 * @param data
 * @returns
 */
export const deleteCrossOriginAccess = (data: { siteName: string; project_type: string }) => useAxios.post(`/mod/corsmanager/cors/remove_cors`, { data, check: 'msg', customType: 'model' })

/**
 * @description java漏洞扫描列表
 */
export const scanSitesVluList = () => useAxios.post(`/project/java_scanning/scan_sites_vlu_list`, { check: 'msg', customType: 'model' })

/**
 * @description 修复项目
 */
export const fixProject = (data: AnyObject) => useAxios.post('project/java/fix_project', { data, check: 'msg', customType: 'model' })

/**
 * @description  增加加密用户
 * @param data.id 网站iid
 * @param data.username 用户名
 * @param data.password 密码
 * @param data.name 名称
 * @param data.option 操作
 */
export const setPassUserApi = (data: { id: number; username: string; password: string; name: string; option: string }) => useAxios.post('site/modify_dir_auth_pass', { data, check: 'object' })

/**
 * @description 删除加密用户
 */
export const getPassUserApi = (data: { id: number }) => useAxios.post('project/java/fix_project', { data, check: 'msg', customType: 'model' })

/**
 * @description 还原php网站数据
 */
export const restorePhpSiteData = (data: { id: number; reconf: 'True' | 'False' }) => useAxios.post('/site?action=RestoreSiteData', { data, check: 'msg', customType: 'model' })

/**
 * @description 还原php网站数据日志
 */
export const restorePhpSiteDataLog = (data: { pid: number }) => useAxios.post('/site?action=RestoreSiteLog', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取php网站gzip配置
 */
export const getPhpSiteGzip = (data: { site_name: string }) => useAxios.post('/mod/php/serviceconf/get_nginx_gzip', { data, check: 'msg', customType: 'model' })

/**
 * @description 设置php网站gzip配置
 */
export const setPhpSiteGzip = (data: { site_name: string; min_length: string; comp_level: string; gzip_types: string }) => useAxios.post('/mod/php/serviceconf/set_nginx_gzip', { data, check: 'msg', customType: 'model' })

/**
 * @description 关闭php网站gzip配置
 */
export const removePhpSiteGzip = (data: { site_name: string }) => useAxios.post('/mod/php/serviceconf/remove_nginx_gzip', { data, check: 'msg', customType: 'model' })

/**
 * @description 生成tomcat随机安装接口
 */
export const getTomcatRandomInstall = () => useAxios.post('/project/java/generate_port', { check: 'msg', customType: 'model' })

/**
 * @description 读取 CDN中获取实际ip的设置信息
 */
export const getCdnIp = () => useAxios.post('/site?action=get_cdn_ip_settings', { check: 'object', customType: 'model' })

/**
 * @description 设置反向代理项目配置文件
 */
export const setProxyConfig = (data: { site_name: string; conf_data: string }) => useAxios.post('/mod/proxy/com/save_nginx_config', { data, check: 'msg', customType: 'model' })

/**
 * @description 恢复反向代理项目配置文件
 */
export const recoverProxyConfig = (data: { history: string; filename: string; site_name: string }) => useAxios.post('/mod/proxy/com/re_history', { data, check: 'msg', customType: 'model' })

/**
 * @description 忽略https防窜站提醒
 */
export const ignoreHttpsMode = (data: { siteName: string }) => useAxios.post('/site?action=set_site_ignore_https_mode', { data, check: 'msg', customType: 'model' })

/**
 * @description 设置反代项目防盗链
 */
export const setProxyAntiLeech = (data: AnyObject) => useAxios.post('/mod/proxy/com/set_referer_conf', { data, check: 'msg', customType: 'model' })

/**
 * @description 设置go镜像源
 */
export const setGoProxy = (data: AnyObject) => useAxios.post('/project/go/set_goproxy', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取忽略广告状态
 */
export const getIgnoreAd = () => useAxios.post('/site?action=get_view_title_content', { check: 'ignore', customType: 'model' })
// export const getIgnoreAd = () => useAxios.post('/site?action=get_ad_show', { check: 'object', customType: 'model' })
/**
 * @description 忽略广告
 */
export const ignoreAd = () => useAxios.post('/site?action=set_ignore_view_domain_title', { check: 'msg', customType: 'model' })
// export const ignoreAd = (data: { show_add_ad: boolean }) => useAxios.post('/site?action=set_ad_show', { data, check: 'msg', customType: 'model' })

/**
 * @description 获取日流量配置情况
 */
export const getFreeTotalStatus = (data: { site_id: string }) => useAxios.post('site/get_free_total_status', { data, check: 'ignore' })
/**
 * @description 设置日流量配置情况
 */
export const setFreeTotalStatus = (data: { site_id: string; status: number }) => useAxios.post('site/set_free_total_status', { data, check: 'msg' })
