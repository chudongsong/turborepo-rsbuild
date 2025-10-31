import { editFtpPassword } from '@/api/ftp'
import { Message, useConfirm, useDataHandle } from '@/hooks/tools'
import { copyText, getRandomPwd, inputFocus } from '@/utils'
import { useFtpStore } from '@ftp/useStore'
import { useFtpBatchPwdStore } from './useStore'
import { assembBatchParams, assembBatchResults, openResultView } from '@/public'

interface RowProps {
	id: number
	name: string
	password: string
}

const { rowData, isRefreshFtpList } = useFtpStore()
const { ftpForm, updateFtpInfoRef } = useFtpBatchPwdStore()

// 校验
export const rules = reactive({
	password: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length >= 6 || ftpForm.value.type !== '0') {
					callback()
				} else {
					callback(new Error('FTP密码长度不能少于6位！'))
				}
			},
			trigger: ['blur'],
		},
	],
})

/**
 * @description 刷新密码
 */
export const refresh = () => {
	ftpForm.value.password = getRandomPwd(12)
}

/**
 * @description 复制密码
 */
export const copyPwd = () => {
	copyText({ value: ftpForm.value.password })
}

/**
 * @description 复制所有
 */
export const copyAll = () => {
	if (rowData.value.selectedList.length > 0) {
		copyText({
			value: rowData.value.selectedList
				.map((item: any) => {
					return `${item.name}--${item.password}`
				})
				?.join('\n'),
		})
	}
}

/**
 * @description 刷新所有
 */
export const refreshAll = () => {
	rowData.value.selectedList.forEach((item: RowProps) => {
		item.password = getRandomPwd(12)
	})
	const el = document.querySelector('.refreshAllBtn') as HTMLElement
	el?.blur()
}

/**
 * @description 获取修改密码参数
 */
export const getEditParams = () => {
	const editorData = rowData.value.selectedList.map((item: RowProps) => ({
		id: item.id,
		ftp_username: item.name,
		new_password: ftpForm.value.type == '0' ? ftpForm.value.password : item.password,
	}))
	return { ftp_list: JSON.stringify(editorData) }
}

/**
 * @description 修改FTP用户密码
 * @param {Function} close 关闭弹窗
 * @returns {Promise<void>}
 */
export const onConfirm = async (close?: AnyFunction): Promise<void> => {
	try {
		await updateFtpInfoRef.value.validate()
		await useConfirm({
			title: '提示',
			width: '35rem',
			content: '修改FTP密码后，旧密码将无法登录FTP账号，是否继续操作？',
		})
		const { config } = rowData.value
		const { enable, exclude } = config
		const params = assembBatchParams(false, exclude, enable, { params: getEditParams() })
		const res: AnyObject[] = await useDataHandle({
			loading: '正在修改FTP密码，请稍候...',
			request: editFtpPassword(params),
			data: Array,
		})

		let { data: result } = assembBatchResults(res)
		result = result.map((item: any) => ({ ...item, name: item.ftp_username }))
		openResultView(result, { title: '修改FTP密码' })
		rowData.value.clearSelection()
		isRefreshFtpList.value = true
		close && close()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 打开弹窗
 */
export const onOpen = async () => {
	inputFocus(updateFtpInfoRef.value.$el, 'password')
}

export const tableColumn = shallowRef([
	{ label: '用户名', prop: 'name', fixed: true, minWidth: 100, width: 120, },
	{
		label: '密码',
		fixed: true,
		width: 190,
		isCustom: true,
		render: (row: any) => {
			const arrEntities: any = {
				lt: '<',
				gt: '>',
				nbsp: ' ',
				amp: '&',
				quot: '"',
			}
			row.password = row.password.replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all: any, t: string | number) {
				return arrEntities[t]
			})
			return (
				<input
					type="text"
					value={row.password}
					class="bt-table-input !w-[18rem]"
					placeholder="点击编辑密码"
					title="点击编辑密码"
					// eslint-disable-next-line consistent-return
					onBlur={(e: any) => {
						if (e.target.value.length < 6) {
							Message.error('FTP密码长度不能少于6位！')
							e.target.value = row.password
						}
						if (row.password === e.target.value) return false
						row.password = e.target.value
					}}
				/>
			)
		},
	},
])
