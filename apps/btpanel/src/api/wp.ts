/* eslint-disable @typescript-eslint/naming-convention */
import { useAxios as request } from '@/hooks/tools'

type PhpSiteWordpressForm = {
	webname: {
		domain: string
		domainlist: string[]
		count: number
	}
	type: string
	port: number
	type_id: number
	ftp: boolean
	sql: string
	codeing: string
	set_ssl: number
	force_ssl: number
	project_type: string
	path: string
	ps: string
	version: string
	datauser: string
	datapassword: string
	password: string
	pw_weak: string
	email: string
}

type WPInstall = {
	s_id?: number
	keyword: string
	p: number
	p_size: number
}

type ADDRemote = {
	login_url: string
	username?: string
	password?: string
	security_key?: string
	security_token?: string
}
/**
 * @description 创建远程WP站点--Credential
 */
export const createWpRemote = (data: ADDRemote) =>
	request.post(`wptoolkit/toolkit/api?action=wp_remote_add`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建远程WP站点--key
 */
export const createWpRemoteKey = (data: ADDRemote) =>
	request.post(`wptoolkit/toolkit/api?action=wp_remote_add_manually`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取wp远程列表
 */
export const getWpRemoteList = (data: { keyword: string; p: number; p_size: number }) =>
	request.post('wptoolkit/toolkit/api?action=wp_remote_sites', {
		data,
		customType: 'model',
	})

/**
 * @description 删除wp远程列表
 */
export const delWpRemote = (data: { remote_id: number }) =>
	request.post('wptoolkit/toolkit/api?action=wp_remote_remove', {
		data,
		customType: 'model',
	})

export const getTamperPathList = () => {
	return request.post('/tamper_core/get_tamper_paths.json', {})
}

export const modifyPathConfig = (data: { path_id: number; key: string; value: number }) => {
	return request.post('/tamper_core/modify_path_config.json', {
		data,
		customType: 'model',
	})
}

export const addBlackExts = (data: { path_id: number; path: string; exts: string }) => {
	return request.post('/tamper_core/add_black_exts.json', {
		data,
		customType: 'model',
	})
}

export const removeBlackExts = (data: { path_id: number; path: string; exts: string }) => {
	return request.post('/tamper_core/remove_black_exts.json', {
		data,
		customType: 'model',
	})
}

export const addWhiteDirs = (data: { path_id: number; path: string; dirnames: string }) => {
	return request.post('/tamper_core/add_white_dirs.json', {
		data,
		customType: 'model',
	})
}

export const setWhiteDirsPs = (data: { path_id: number; dir_name: string; ps: string }) => {
	return request.post('/tamper_core/set_white_dir_with_ps.json', {
		data,
		customType: 'model',
	})
}

export const removeWhiteDirs = (data: { path_id: number; path: string; dirname: string }) => {
	return request.post('/tamper_core/remove_white_dirs.json', {
		data,
		customType: 'model',
	})
}

export const addWhiteFiles = (data: { path_id: number; path: string; filename: string }) => {
	return request.post('/tamper_core/add_white_files.json', {
		data,
		customType: 'model',
	})
}

export const removeWhiteFiles = (data: { path_id: number; path: string; filename: string }) => {
	return request.post('/tamper_core/remove_white_files.json', {
		data,
		customType: 'model',
	})
}

/**
 * @description 获取wp站点列表
 */
export const getWpList = (data: any) =>
	request.post('/datalist/data/get_data_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 添加 wordpress 站点
 */
export const addWordpressSite = (data: PhpSiteWordpressForm) =>
	request.post('/wptoolkit/toolkit/api?action=AddWPSite', {
		data: {
			...data,
			webname: JSON.stringify(data.webname),
			project_type: 'WP2',
		},
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取wp版本列表
 */
export const getWpVersionList = (data: { php_version_short: string }) =>
	request.post('/wptoolkit/toolkit/api?action=get_wp_versions', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取wp设置信息
 */
export const getWpSetInfo = (data: { s_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=get_wp_configurations', {
		data,
		customType: 'model',
		check: 'object',
	})

type WpSetConfinfo = {
	s_id: number
	language: string
	admin_password: string | null
	admin_email: string
	whl_enabled: number
	whl_page: string
	whl_redirect_admin: string
}

/**
 * @description 设置站点状态
 */
export const setWpConfInfo = (data: WpSetConfinfo) =>
	request.post(`/wptoolkit/toolkit/api?action=save_wp_configurations`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取安全插件安装状态
 */
export const getWpSecurity = (data: { sName: string }) =>
	request.post('/plugin?action=get_soft_find', {
		data,
		customType: 'model',
	})

/**
 * @description 获取当天文件防护统计
 */
export const getWpTamperInfo = (data: { path_id: number }) =>
	request.post('/tamper_core/get_tamper_paths.json', {
		data,
		customType: 'model',
	})

/**
 * @description 获取总入侵次数
 */
export const getWpBtwafInfo = (data: { siteName: string }) =>
	request.post('/plugin?action=a&name=btwaf&s=get_site_config_byname', {
		data,
		customType: 'model',
	})

/**
 * @description 获取站点备份列表
 */
export const getSiteBackupList = (data: { s_id: number; p: number; limit: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_backup_list', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 备份站点
 */
export const backupSite = (data: { s_id: number; bak_type: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_backup', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 还原站点
 */
export const restoreSiteBackup = (data: { bak_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_restore', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除站点备份
 */
export const delSiteBackup = (data: { bak_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_remove_backup', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取网站迁移列表
 */
export const getSiteMigrateList = () =>
	request.post('/wptoolkit/toolkit/api?action=wp_can_migrate_from_website_to_wptoolkit', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 网站迁移
 */
export const migrateSite = () =>
	request.post('/wptoolkit/toolkit/api?action=wp_migrate_from_website_to_wptoolkit', {
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取安全模块配置
 */
export const getSecurityInfo = (data: { id: number; path: string; site_name: string }) =>
	request.post('/wptoolkit/toolkit/api?action=get_wp_security_info', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 开启文件保护
 */
export const openFileProtection = (data: { paths: { path: string; ps: string }[] }) =>
	request.post(`/wptoolkit/toolkit/api?action=open_wp_file_protection`, {
		data: {
			paths: JSON.stringify(data.paths),
		},
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 关闭文件保护
 */
export const closeFileProtection = (data: { path_id: number }) =>
	request.post(`/wptoolkit/toolkit/api?action=close_wp_file_protection`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置文件保护状态
 */
export const getFileProtectionInfo = (data: { path: string }) =>
	request.post(`/wptoolkit/toolkit/api?action=get_wp_file_info`, {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 开启防火墙保护
 */
export const openFirewallProtection = (data: { site_name: string }) =>
	request.post(`/wptoolkit/toolkit/api?action=open_wp_firewall_protection`, {
		data: {
			obj: 'open',
			...data,
		},
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 关闭防火墙保护
 */
export const closeFirewallProtection = (data: { site_name: string }) =>
	request.post(`/wptoolkit/toolkit/api?action=close_wp_firewall_protection`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 克隆WP站点
 */
export const cloneWpSite = (data: { s_id: number; domain: string; sub_path: string; enable_cache: number }) =>
	request.post(`/wptoolkit/toolkit/api?action=wp_clone`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 通过Aapanel备份创建WP站点
 */
export const createWpSiteLocalBak = (data: { bak_file: string; domain: string; sub_path: string; php_ver_short: string; enable_cache: number }) =>
	request.post(`/wptoolkit/toolkit/api?action=wp_create_with_aap_bak`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 通过Plesk/cPanel Wordpress备份创建WP站点
 */
export const createWpSiteOtherbak = (data: { bak_file: string; domain: string; sub_path: string; php_ver_short: string; enable_cache: number }) =>
	request.post(`/wptoolkit/toolkit/api?action=wp_create_with_plesk_or_cpanel_bak`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description Wordpress完整性校验
 */
export const wpIntegrityCheck = (data: { s_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_integrity_check', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 重新安装Wordpress（仅限框架文件，不会删除新文件)
 */
export const wpReinstallFiles = (data: { s_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_reinstall_files', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取已安装的插件列表
 */
export const getInstalledPlugins = (data: { s_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_installed_plugins', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 卸载插件
 */
export const wpUninstallPlugin = (data: { s_id: number; plugin_file: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_uninstall_plugin', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 更新插件
 */
export const wpUpdatePlugin = (data: { s_id: number; plugin_file: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_update_plugin', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 激活/禁用插件
 */
export const wpSetPluginStatus = (data: { s_id: number; plugin_file: string; activate: number }) =>
	request.post(`/wptoolkit/toolkit/api?action=wp_set_plugin_status`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置插件自动更新
 */
export const wpSetPluginUpdate = (data: { s_id: number; plugin_file: string; enable: number }) =>
	request.post(`/wptoolkit/toolkit/api?action=wp_set_plugin_auto_update`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取已安装的主题列表
 */
export const getInstalledThemes = (data: { s_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_installed_themes', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 卸载主题
 */
export const wpUninstallTheme = (data: { s_id: number; stylesheet: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_uninstall_theme', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 更新主题
 */
export const wpUpdateTheme = (data: { s_id: number; stylesheet: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_update_theme', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 激活/禁用主题
 */
export const wpSetThemeStatus = (data: { s_id: number; stylesheet: string }) =>
	request.post(`/wptoolkit/toolkit/api?action=wp_switch_theme`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置主题自动更新
 */
export const wpSetThemeUpdate = (data: { s_id: number; stylesheet: string; enable: number }) =>
	request.post(`/wptoolkit/toolkit/api?action=wp_set_theme_auto_update`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取安装主题列表
 */
export const getInstallThemesList = (data: WPInstall) =>
	request.post('/wptoolkit/toolkit/api?action=wp_theme_list', {
		data,
		customType: 'model',
		check: 'object',
	})
/**
 * @description 安装主题
 */
export const setInstallThemes = (data: { s_id: number; slug: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_install_theme', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取安装插件列表
 */
export const getInstallPluginList = (data: WPInstall) =>
	request.post('/wptoolkit/toolkit/api?action=wp_plugin_list', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 安装插件
 */
export const setInstallPlugin = (data: { s_id: number; slug: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_install_plugin', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取整合包列表
 */
export const getSetsList = (data: { p: number; p_size: number; keyword: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_set_list', {
		data,
		customType: 'model',
	})

/**
 * @description 删除整合包
 */
export const delSets = (data: { set_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_remove_set', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 创建整合包
 */
export const addSets = (data: { name: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_create_set', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 设置插件or主题激活状态
 */
export const setSetsActive = (data: { item_ids: number; state: number; type: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_update_item_state_with_set', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 删除整合包中的插件or主题
 */
export const delSetsPluginOrTheme = (data: { item_ids: number; type: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_remove_items_from_set', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 添加插件或主题到整合包
 */
export const addPluginOrThemeToSets = (data: { set_id: number; items: string; type: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_add_items_to_set', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 从整合包中安装插件or主题
 */
export const installPluginOrThemeToSets = (data: { set_id: number; site_ids: string }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_install_with_set', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 从整合包中获取插件or主题
 */
export const getPluginOrThemeToSets = (data: { set_id: number; type: number }) =>
	request.post('/wptoolkit/toolkit/api?action=wp_get_items_from_set', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 获取WP所有站点
 */
export const getWPList = () =>
	request.post('/wptoolkit/toolkit/api?action=wp_all_sites', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 扫描WP漏洞
 */
export const scanVulnerability = (data: { path: string }) =>
	request.post('/site?action=wordpress_vulnerabilities_scan', {
		data,
		customType: 'model',
	})

/**
 * @description 扫描WP漏洞扫描忽略列表
 */
export const getScanIgnore = (data: { path: string }) =>
	request.post('/site?action=get_ignore_vuln', {
		data,
		customType: 'model',
	})

/**
 * @description WP漏洞扫描忽略、删除忽略
 */
export const WpScanIgnore = (data: any) =>
	request.post('/site?action=ignore_vuln', {
		data,
		customType: 'model',
	})

/**
 * @description WP设置自动扫描状态
 */
export const setScanSattus = (data: { path: string }) =>
	request.post('/site?action=set_auth_scan', {
		data,
		customType: 'model',
	})

/**
 * @description 获取WP自动扫描状态
 */
export const getScanStatus = (data: { path: string }) =>
	request.post('/site?action=get_auth_scan_status', {
		data,
		customType: 'model',
	})

/**
 * @description 获取语言列表
 */
export const getLanguageList = () =>
	request.post('/wptoolkit/toolkit/api?action=get_language', {
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置站点状态
 */
export const setPhpSiteStatus = (status: boolean, data: { id: number; name: string }) =>
	request.post(`/site?action=${status ? 'SiteStart' : 'SiteStop'}`, {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 开启/关闭当前wordpress站点缓存
 */
export const setWpSiteCache = (data: { version: string; sitename: string; act: boolean | string }) =>
	request.post('/wptoolkit/toolkit/api?action=set_fastcgi_cache', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取防盗链
 */
export const getPhpSiteSecurity = (data: { id: number; name: string }) =>
	request.post('/site?action=GetSecurity', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 设置防盗链
 */
export const setPhpSiteSecurity = (data: any) =>
	request.post('/site?action=SetSecurity', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 清空当前wordpress站点缓存
 */
export const clearWpSiteCache = (data: { s_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=purge_all_cache', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 更新当前wordpress站点版本
 */
export const updateWpSiteVersion = (data: { s_id: number; version: string }) =>
	request.post('/wptoolkit/toolkit/api?action=update_wp', {
		data,
		customType: 'model',
		check: 'msg',
	})

/**
 * @description 获取wordpress自动登录路径
 * @param {string} site_type - 站点类型，local或remote
 */
export const getWpAutoLogin = (data: { site_id: number; site_type: string }) =>
	request.post('/wptoolkit/toolkit/api?action=auto_login', {
		data,
		customType: 'model',
		check: 'object',
	})

/**
 * @description 迁移站点到wptoolkit
 */
export const migrateSiteToWptoolkit = (data: { site_id: number }) =>
	request.post('/wptoolkit/toolkit/api?action=migrate_site_to_wptoolkit', {
		data,
		customType: 'model',
		check: 'msg',
	})
