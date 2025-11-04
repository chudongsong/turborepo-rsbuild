export const useWPLocalConfigStore = defineStore('WP-LOCAL-Config-STORE', () => {
	const tabActive = ref('domain');

	// 域名管理
	const isRefreshDomain = ref(false);
	const domain = ref('');

	// ssl证书
	const showSSLTips = ref(false);
	const sslTabActive = ref('current');

	return {
		tabActive,
		isRefreshDomain,
		domain,
		showSSLTips,
		sslTabActive,
	};
});

export default useWPLocalConfigStore;
