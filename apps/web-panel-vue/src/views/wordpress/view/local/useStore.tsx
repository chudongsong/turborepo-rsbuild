import { getWpSetInfo } from '@/api/wp'
import { useDataHandle } from '@/hooks/tools'
import { RequestProps } from '@/hooks/tools/message/types'
import { getRandomChart } from '@/utils'
import { useLoading } from '../../useMethod'

export const useWPLocalStore = defineStore('WP-LOCAL-STORE', () => {
	const isRefreshLocalList = ref(false)
	const isRefreshBackupList = ref(false)
	const isRefreshMigrateSiteList = ref(false)

	const localRow = ref<any>({})
	const loginUrl = ref('')
	const isLoginMask = reactive({
		value: false,
		message: '',
	})

	const cloneLocalForm = reactive({
		method: 1,
		subDomain: getRandomChart(8, 'letter'),
		subPath: '',
		newDomain: '',
		newPath: '',
		cache_status: false,
	})

	const verifyingData = reactive({
		status: true,
		text: '',
	})

	const { loading: verifyingLoading, setLoading: setVerifyingLoading } = useLoading(false)
	const { loading: reinstallLoading, setLoading: setReinstallLoading } = useLoading(false)

	const loginInit = async (id: number) => {
		isLoginMask.value = false
		await useDataHandle({
			loading: '正在加载，请稍后...',
			request: getWpSetInfo({ s_id: id }),
			success: (rdata: RequestProps) => {
				if (rdata.status) {
					loginUrl.value = rdata.data.msg.login_url
				} else {
					isLoginMask.value = true
					isLoginMask.message = rdata.msg
				}
			},
		})
	}

	const resetVerifyingData = () => {
		verifyingData.status = true
		verifyingData.text = ''
	}

	const resetCloneLocalForm = () => {
		cloneLocalForm.method = 1
		cloneLocalForm.subDomain = getRandomChart(8, 'letter')
		cloneLocalForm.subPath = ''
		cloneLocalForm.newDomain = ''
		cloneLocalForm.newPath = ''
	}

	return {
		localRow,
		loginUrl,
		isLoginMask,
		loginInit,
		isRefreshLocalList,
		isRefreshBackupList,
		isRefreshMigrateSiteList,
		cloneLocalForm,
		verifyingData,
		verifyingLoading,
		setVerifyingLoading,
		reinstallLoading,
		setReinstallLoading,
		resetVerifyingData,
		resetCloneLocalForm,
	}
})

export default useWPLocalStore
