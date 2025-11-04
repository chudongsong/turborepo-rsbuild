import { useMessage, useDialog, useConfirm } from '@/hooks/tools'
import { createTypeApi, getAccountListApi, getAccountTempLoginTokenApi, getTypeListApi, modifyAccountApi, modifyTypeApi, removeAccountApi, removeTypeApi } from '@/api/vhost'

import { useTableCategory } from '@/hooks/business'
import { SelectOptionProps } from '@/components/form/bt-select/types'
import { copyText, isArray, isObject } from '@/utils'

import editAccount from './editAccount/index.vue'
import type { AccountListParams, AccountRow } from '@/api/vhost'
import type { loginType } from './types'
import { useAccountStore } from './useStore'

const { request: $request } = useMessage()

const { refreshList, accountAuth, isEdit, formData } = useAccountStore()

export const openNpsEvent = () => {
	console.log('需求反馈')
}

/**
 * @description 打开编辑用户时间
 * @returns {void}
 */
export const editUserEvent = (row: AccountRow | false = false) => {
	if (isObject<AccountRow>(row)) {
		isEdit.value = true
		formData.value = {
			account_id: row.account_id,
			username: row.username,
			password: '',
			email: row.email,
			package_id: row.package_id,
			expireType: row.expire_date !== '0000-00-00' ? 1 : 0,
			expire_date: row.expire_date !== '0000-00-00' ? row.expire_date : '',
			mountpoint: row.mountpoint,
			remark: row.remark,
		}
	} else if (accountAuth.value.number >= accountAuth.value.limit) {
		$request({ type: 'warning', content: '当前用户数量已达上限，如需更多用户管理，请联系客服。' })
		return
	}
	useDialog({
		title: `${row ? '编辑' : '添加'}用户`,
		area: '500px',
		component: editAccount,
		showFooter: true,
	})
}

/**
 * @description 获取子用户列表
 */
export const getAccountList = async (data: AccountListParams) => {
	const rdata = await getAccountListApi(data)
	if (rdata.data.list) {
		accountAuth.value.number = rdata.data.page.count
		return { data: rdata.data.list, total: rdata.data.page.count }
	} else {
		return { data: [], total: 0 }
	}
}

/**
 * @description 编辑账号状态
 * @param {AccountRow} row 用户信息
 * @returns {void}
 */
export const editorStatusEvent = async (row: AccountRow) => {
	useConfirm({
		title: `${row.status === 1 ? '停用' : '启用'}用户${row.username}`,
		content: `是否${row.status === 1 ? '停用' : '启用'}该用户${row.username}，是否继续？`,
		onConfirm: async () => {
			const rdata = await modifyAccountApi({ account_id: row.account_id, status: row.status === 1 ? 0 : 1 })
			$request(rdata)
			refreshList()
		},
	})
}

/**
 * @description 删除用户
 * @param {AccountRow} row 用户信息
 * @returns {void}
 */
export const deleteUserEvent = (row: AccountRow) => {
	useConfirm({
		title: `删除用户${row.username}`,
		content: `是否删除该用户${row.username}，是否继续？`,
		onConfirm: async () => {
			const rdata = await removeAccountApi({ account_id: row.account_id, is_del_resources: true })
			$request(rdata)
			refreshList()
		},
	})
}

/**
 * @description 登录虚拟主机
 * @param {AccountRow} row 用户信息
 * @returns {void}
 */
export const loginPanelEvent = async (row: AccountRow) => {
	const { data } = await getAccountTempLoginTokenApi({ account_id: row.account_id })
	if (isObject<loginType>(data)) {
		window.open(data.login_url + '?token=' + data.token, '_blank', 'noopener,noreferrer')
	}
}

/**
 * @description 复制登录信息
 * @param {AccountRow} row 用户信息
 * @returns {void}
 */
export const copyLoginInfoEvent = (row: AccountRow) => {
	const { login_url, username, init_password } = row
	copyText({ value: `账号: ${login_url}\n用户: ${username}\n初始密码: ${init_password}` })
}

/**
 * @description 获取分类列表
 * @returns
 */
const getTypeList = async (): Promise<Array<any>> => {
	try {
		let typeList: SelectOptionProps[] = []
		const { data } = await getTypeListApi()
		if (isArray(data)) {
			typeList = [
				{ label: '全部分类', value: 'all' },
				...data.map((item: any) => ({
					label: item.name,
					value: Number(item.type_id),
				})),
			]
		}
		return typeList || []
	} catch (error) {
		console.log(error)
		return []
	}
}

/**
 * @description 设置分类视图
 * @returns
 */
export const useCategory = () =>
	useTableCategory({
		key: 'type_id',
		name: '',
		options: () => [{ label: '全部分类', value: 'all' }],
		event: {
			get: getTypeList,
			add: createTypeApi,
			update: modifyTypeApi,
			delete: removeTypeApi,
		},
	})
