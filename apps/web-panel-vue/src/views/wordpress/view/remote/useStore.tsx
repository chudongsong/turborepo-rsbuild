import { createWpRemote, createWpRemoteKey } from '@/api/wp';

export const useWPRemoteStore = defineStore('WP-REMOTE-STORE', () => {
	const isRefreshRemoteList = ref(false); // 刷新远程列表

	const addWordpressFormData = reactive({
		url: '',
		type: 1,
		username: '',
		password: '',
		key: '',
		token: '',
	});

	const selectCofigFormData = reactive({
		Login_url: '',
		wp: '',
		php: '',
		sql: '',
		worker: '',
		username: '',
		language: 'en',
	});

	const addWordpressData = async (close: any) => {
		try {
			const { useDataHandle } = await import('@/hooks/tools');
			const { getParams, getParamsKey } = await import('@/views/wordpress/view/remote/form-controller');
			useDataHandle({
				loading: '正在添加 Wordpress，请稍后...',
				request: addWordpressFormData.type === 1 ? createWpRemote(getParams()) : createWpRemoteKey(getParamsKey()),
				data: { status: Boolean },
				message: true,
				success: () => {
					isRefreshRemoteList.value = true;
					close && close();
				},
			});
		} catch (error) {
			console.log(error);
		}
	};

	const resetAddWordpressData = () => {
		addWordpressFormData.url = '';
		addWordpressFormData.type = 1;
		addWordpressFormData.username = '';
		addWordpressFormData.password = '';
		addWordpressFormData.key = '';
		addWordpressFormData.token = '';
	};

	const resetSelectCofigData = () => {
		selectCofigFormData.Login_url = '';
		selectCofigFormData.wp = '';
		selectCofigFormData.php = '';
		selectCofigFormData.sql = '';
		selectCofigFormData.worker = '';
		selectCofigFormData.username = '';
		selectCofigFormData.language = 'en';
	};

	return {
		addWordpressFormData,
		selectCofigFormData,
		addWordpressData,
		isRefreshRemoteList,
		resetAddWordpressData,
		resetSelectCofigData,
	};
});

export default useWPRemoteStore;
