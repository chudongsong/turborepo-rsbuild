type JSONString<T> = string & { __jsonType?: T };

// Docker 网站表格数据类型
export interface DockerSiteTableRowProps {
	id: number;
	name: string;
	status: '1' | '0';
	path: string;
	remark: string;
	addtime: string;
	edate: string;
	type: string;
	service_info: string;
	// old_info: string;
	run_path: string;
	conf_path: string;
	proxy_pass: string;
}

export interface DockerSiteListProps {
	p: number;
	row: number;
	query: string;
	type?: string;
	classify?: string;
}

export interface DockerSiteStatusProps {
	id: number;
	status: 0 | 1;
	site_name: string;
	edate: string;
}

export interface DockerSiteRemarkProps {
	id: number;
	remark: string;
	site_name: string;
}

export interface DockerSiteDelProps {
	id: number;
	site_name: string;
	remove_path: 1 | 0;
}

export interface DockerSiteDelBatchProps {
	site_list: JSONString<number[]>;
	remove_path: 1 | 0;
}
export interface DockerSiteCreateProps {
	domains: string;
	type: 'php' | 'java' | 'go' | 'python' | 'app' | 'proxy';
	name: string;
	port?: number;
	remark?: string;
}
export interface DockerSiteCreateByProxyProps extends DockerSiteCreateProps {
	container_id: string;
}
export interface DockerSiteCreateByEnvProps extends DockerSiteCreateProps {
	site_path: string;
}
export interface DockerSiteEnvListProps {
	runtime_type: 'php' | 'java' | 'go' | 'python';
	p: number;
	row: number;
}
export interface DockerSiteGetLogProps {
	log_type: 'run' | 'build';
}
export interface DockerSiteGetBuildLogProps extends DockerSiteGetLogProps {
	log_file: string;
}
export interface DockerSiteGetRunLogProps extends DockerSiteGetLogProps {
	compose_file: string;
}

export interface DockerSiteEnvVersionProps {
	runtime_type: 'all' | 'php' | 'java' | 'go' | 'python';
}

export interface DockerSiteCreateEnvProps {
	runtime_name: string;
	runtime_type: 'php' | 'java' | 'go' | 'python';
	runtime_version: string;
	repo_url?: string;
	exts?: string;
	site_path?: string;
	command?: string;
	ports?: string;
	remark?: string;
	id?: number;
}

export interface DockerSiteDeleteDomainProps {
	id: string;
	site_name: string;
	domain: string;
	port: string;
}

export interface DockerSiteBatchDeleteDomainProps {
	del_domain_list: JSONString<DockerSiteDeleteDomainProps[]>;
}

