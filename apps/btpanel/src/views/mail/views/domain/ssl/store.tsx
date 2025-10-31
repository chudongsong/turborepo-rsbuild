import { defineStore } from 'pinia'
import OtherCert from '@mail/views/domain/ssl/other.vue'
import ApplyCert from '@mail/views/domain/ssl/apply.vue'
import Folder from '@mail/views/domain/ssl/folder.vue'
import { MailDomain } from '@mail/types'
import { delDomainCert, setDomainCert } from '@/api/mail'
import { useConfirm } from '@/hooks/tools/confirm'
import { Message } from '@/hooks/tools'
interface PropsData {
	row: MailDomain
	onRefresh: () => void
}

export const MAIL_DOMAIN_SSL = defineStore('MAIL_DOMAIN_SSL', () => {
	const menu = ref('other')

	const menus = [
		{
			type: 'other',
			title: '当前证书',
			component: OtherCert,
		},
		{
			type: 'apply',
			title: '申请证书',
			component: ApplyCert,
		},
		{
			type: 'folder',
			title: '证书夹',
			component: Folder,
		},
	]

	// 私钥信息
	const keys = ref('')

	// 证书信息
	const crt = ref('')

	// 组件数据
	const menuData = ref<PropsData>()

	const initMenu = (data: PropsData) => {
		menuData.value = {
			row: data.row,
			onRefresh: () => {
				data.onRefresh && data.onRefresh()
			},
		}
		if (data.row.ssl_status) {
			keys.value = data.row.ssl_info.key
			crt.value = data.row.ssl_info.src
		}
	}

	const domains = computed(() => {
		const dns = menuData.value?.row?.ssl_info.dns || []
		return dns.join(', ')
	})

	const onSave = async (close: any) => {
		if (!keys.value || keys.value === '' || !crt.value || crt.value === '') {
			Message.error('证书不能为空')
			return
		}
		const { data } = await setDomainCert({
			domain: menuData.value?.row.domain as string,
			key: keys.value,
			csr: crt.value,
		})
		Message.request(data)
		if (data.status) {
			menuData.value?.onRefresh()
			close()
		} else {
			return false
		}
	}

	const onDel = async (close: any) => {
		try {
			await useConfirm({
				title: '确认删除',
				content: '是否删除SSL证书?',
			})
			const { data } = await delDomainCert({
				domain: menuData.value?.row.domain as string,
				key: keys.value,
				csr: crt.value,
			})
			Message.request(data)
			if (data.status) {
				menuData.value?.onRefresh()
				close()
			} else {
				return false
			}
		} catch (error) {
			console.log(error)
		}
	}

	return {
		menu,
		menus,
		menuData,
		initMenu,
		keys,
		crt,
		domains,
		onSave,
		onDel,
	}
})

export default MAIL_DOMAIN_SSL
