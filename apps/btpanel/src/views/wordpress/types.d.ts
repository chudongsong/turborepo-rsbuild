export type SecurityInfo = {
	hotlink_status: number;
	file_status: number;
	firewall_status: number;
	file_count: number;
	firewall_count: number;
};

export type TamperPath = {
	pid: number;
	path: string;
	status: number;
	mode: number;
	is_create: number;
	is_modify: number;
	is_unlink: number;
	is_mkdir: number;
	is_rmdir: number;
	is_rename: number;
	is_chmod: number;
	is_chown: number;
	is_link: number;
	black_exts: string[];
	white_files: string[];
	white_dirs: TamperPathDirWhite[];
	ps: string;
	total: TamperPathTotal;
	rule_ps?: string;
};

export type TamperPathDirWhite = {
	dir: string;
	ps?: string;
	tip_msg?: string;
};

export type TamperPathTotal = {
	all: {
		create: number;
		modify: number;
		unlink: number;
		rename: number;
		mkdir: number;
		rmdir: number;
		chmod: number;
		chown: number;
		link: number;
	};
	today: {
		create: number;
		modify: number;
		unlink: number;
		rename: number;
		mkdir: number;
		rmdir: number;
		chmod: number;
		chown: number;
		link: number;
	};
};

export type PluginInfo = {
	name: string;
	version: string;
	latest_version: string;
	can_update: boolean;
	update_info: {
		theme: string;
		new_version: string;
		url: string;
		package: string;
		requires: string;
		requires_php: string;
	};
	title: string;
	description: string;
	stylesheet: string;
	author: string;
	author_uri: string;
	plugin_uri: string;
	is_plugin_activate: boolean;
	is_theme_activate: boolean;
	plugin_file: string;
	auto_update: boolean;
};

export type WPThemeInfo = {
	page: number;
	pages: number;
	total: number;
	list: WPThemeInfoList[] | WPPluginInfoList[];
};

export type WPThemeInfoList = {
	name: string;
	slug: string;
	version: string;
	preview_url: string;
	author: {
		user_nicename: string;
		profile: string;
		avatar: string;
		display_name: string;
		author: string;
		author_url: string;
	};
	screenshot_url: string;
	short_description?: string;
	rating: number;
	num_ratings: number;
	homepage: string;
	description: string;
	requires: string;
	requires_php: string;
	is_commercial: boolean;
	installed: boolean;
	is_in_set: boolean;
	external_support_url: string;
	is_community: boolean;
	external_repository_url: string;
};

export type WPPluginInfoList = {
	name: string;
	slug: string;
	version: string;
	author: string;
	author_profile: string;
	installed: boolean;
	is_in_set: boolean;
	requires: string;
	tested: string;
	requires_php: string;
	rating: number;
	num_ratings: number;
	support_threads: number;
	support_threads_resolved: number;
	active_installs: number;
	downloaded: number;
	last_updated: string;
	added: string;
	homepage: string;
	short_description: string;
	description: string;
	download_link: string;
	donate_link: string;
	icons: {
		'1x': string;
		'2x': string;
		default: string;
	};
};

export type WPSets<T> = {
	total: number;
	list: T[];
};

export type WPSetsList = {
	id: number;
	name: string;
	plugins: SetsPluginOrTheme[];
	themes: SetsPluginOrTheme[];
};

export type SetsPluginOrTheme = {
	slug: string;
	id: number;
	title: string;
	state: number;
	type: number;
	description: string;
};

export type WPRemoteList = {
	id: number;
	username: string;
	env_info: {
		wordpress_version: string;
		php_version: string;
		mysql_version: string;
		plugin_version: string;
		locale: string;
	};
	create_time: number;
	site_url: string;
	login_url: string;
};

export type WPScanList = {
	name: string;
	vlun_info: string;
	css: number;
	type: string;
	load_version: string;
	cve: string;
	time: number;
	slug: string;
	status?: number;
	ignore_type?: string;
	path?: string;
};
