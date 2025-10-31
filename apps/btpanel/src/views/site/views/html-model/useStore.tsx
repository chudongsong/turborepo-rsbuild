import { Message } from '@/hooks/tools'

const SITE_HTML_STORE = defineStore('SITE-HTML-STORE', () => {
	const pluginInfo = ref<any>({})
	return {
		pluginInfo,
	}
})

const useSiteHtmlStore = () => {
	return storeToRefs(SITE_HTML_STORE())
}

export { SITE_HTML_STORE, useSiteHtmlStore }
