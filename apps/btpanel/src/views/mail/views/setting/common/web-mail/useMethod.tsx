import { ElCheckbox } from 'element-plus'
import { isObject, isArray } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { getRoundcubeStatus, uninstallRoundcube, installRoundcube, getDomain, addRoundcubeConfig } from '@/api/mail'
import { useDialog, useMessage } from '@/hooks/tools'
import MAIL_SETTING_WEB from '@mail/views/setting/common/web-mail/store'
import { storeToRefs } from 'pinia'
import { getCliVersion } from '@/api/site'

const { info, installModal, configModal, phpOptions, installForm, installFormRef, configForm, configFormRef, domainOptions } = storeToRefs(MAIL_SETTING_WEB())

const { installSetLoading, configSetLoading } = MAIL_SETTING_WEB()

const Message = useMessage()

export const goSite = () => {
	location.href = '/site/php'
}

export const getInfo = async () => {
	const { data } = await getRoundcubeStatus()
	if (isObject(data)) {
		info.value.id = data.id
		info.value.status = data.status
		info.value.site_name = data.site_name
		info.value.ssl_status = data.ssl_status
	}
}

export const onInstall = () => {
	installModal.value.data.onRefresh = getInfo
	useDialog({
		title: installModal.value.title,
		area: 48,
		showFooter: true,
		compData: installModal.value.data,
		confirmText: '安装',
		component: () => import('./install.vue'),
	})
}

export const onUninstall = () => {
	const checked = ref(false)

	useConfirm({
		title: '卸载 WebMail',
		width: 70,
		content: () => (
			<div>
				<div class="mb-16px">卸载WebMail后，【{info.value.site_name}】已从网站列表中删除，网站无法访问，是否继续?</div>
				<ElCheckbox
					checked={checked.value}
					onChange={(val: any) => {
						checked.value = val
					}}>
					<div class="text-desc leading-[1.4]">FTP、数据库、文档根目录在选择后将被完全删除，请谨慎！</div>
				</ElCheckbox>
			</div>
		),
		onConfirm: async () => {
			const { data } = await uninstallRoundcube({
				id: info.value.id,
				site_name: info.value.site_name,
				force: checked.value ? 1 : 0,
			})
			Message.request(data)
			getInfo()
		},
	})
}

export const onShowConfig = () => {
	useDialog({
		title: configModal.value.title,
		area: 48,
		showFooter: true,
		compData: configModal.value.data,
		component: () => import('./config.vue'),
	})
}

export const getPhpOptions = async () => {
	const { data } = await getCliVersion()
	if (isObject(data)) {
		phpOptions.value = data.versions.reverse().map((item: any) => ({
			label: item.name,
			value: item.version,
		}))
		installForm.value.php_version = data.versions[0].version
	}
}

export const installInit = async () => {
	try {
		installSetLoading(true)
		await Promise.all([getPhpOptions()])
	} finally {
		installSetLoading(false)
	}
}

export const installOnConfirm = async (close: any) => {
	await installFormRef.value?.validate()
	const { data } = await installRoundcube({
		site_name: installForm.value.domain || '',
		php_version: installForm.value.php_version || '',
	})

	Message.request(data)

	if (data.status) {
		if (installModal.value.data.onRefresh && typeof installModal.value.data.onRefresh === 'function') {
			installModal.value.data.onRefresh()
		}
		close()
	}
}

export const getDomainOptions = async () => {
	const { data } = await getDomain()
	if (isArray(data.data)) {
		domainOptions.value = data.data.map((item: any) => ({
			label: item.name,
			value: item.name,
			data: item,
		}))
		if (data.data?.length) {
			configForm.value.domain = data.data[0].name
			configForm.value.path = data.data[0].path
			configForm.value.id = data.data[0].id
		}
	}
}

export const onUpdateDomain = (val: string) => {
	const option = domainOptions.value.find((item: any) => item.value === val)
	const { data } = option
	if (isObject(data)) {
		configForm.value.id = data.id
		configForm.value.path = data.path
	}
}

export const configInit = async () => {
	try {
		configSetLoading(true)
		await Promise.all([getDomainOptions()])
	} finally {
		configSetLoading(false)
	}
}

export const configOnConfirm = async (close: any) => {
	await configFormRef.value?.validate()
	const { data } = await addRoundcubeConfig({
		id: configForm.value.id,
		site_name: configForm.value.domain || '',
		path: configForm.value.path,
	})
	Message.request(data)
	if (data.status) {
		close()
		if (configModal.value.data.onRefresh && typeof configModal.value.data.onRefresh === 'function') {
			configModal.value.data.onRefresh()
		}
	}
}
