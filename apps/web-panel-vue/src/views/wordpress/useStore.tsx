import { useRouter, useRoute } from 'vue-router';

export const useWPStore = defineStore('WP-STORE', () => {
	const tabActive = ref('local');
	const router = useRouter();
	const route = useRoute();

	return {
		tabActive,
		router,
		route,
	};
});

export default useWPStore;
