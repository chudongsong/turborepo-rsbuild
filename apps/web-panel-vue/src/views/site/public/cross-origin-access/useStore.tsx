const CROSS_ORIGIN_ACCESS_STORE = defineStore('CROSS-ORIGIN-ACCESS-STORE', () => {
	const formData = ref<any>({
		status: false,
        siteName: null,
        project_type: null,
        allowed_origin: null,
        allowed_methods: null,
        allowed_headers: null,
        exposed_headers: null,
        allow_credentials: false
	})

    const reset = () => {
        formData.value.status = false
        formData.value.siteName = null
        formData.value.project_type = null
        formData.value.allowed_origin = null
        formData.value.allowed_methods = null
        formData.value.allowed_headers = null
        formData.value.exposed_headers = null
        formData.value.allow_credentials = false
    }

	return {
		formData,
        reset
	}
})

const useCrossOriginAccessStore = () => {
	return storeToRefs(CROSS_ORIGIN_ACCESS_STORE())
}

export { useCrossOriginAccessStore, CROSS_ORIGIN_ACCESS_STORE }
