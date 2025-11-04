import { router } from '@/router'
import { setPs } from '@/api/global' // 设置备注
import { closeAllDialog, useMessage } from '@/hooks/tools' // 消息提示
import { setCookie } from '@/utils' // 设置cookie

const meesaage = useMessage()

/**
 * @description 设置备注
 * @param {number} data.id id
 * @param {string} data.ps 备注
 * @param {string} table 表名
 * @returns {Promise<void>}
 */
export const setPsEvent = async ({ id, ps }: { id: number; ps: string }, table: string): Promise<void> => {
	const loading = meesaage.load('正在修改备注信息，请稍后...')
	try {
		const res = await setPs({
			id,
			table,
			ps,
		})
		meesaage.request(res)
	} catch (err) {
		console.log(err)
	} finally {
		loading.close()
	}
}

/**
 * @description 打开路径事件
 * @param {string} row.path 路径
 * @returns {void}
 */
export const openPathEvent = (row: any, prop: string = 'path') => {
	closeAllDialog() // 关闭所有弹窗
	setCookie('Path', row[prop]) // 设置文件路径
	router.push({ path: '/files' })
	// router.push({ path: '/files', query: { path: row[prop] } })
	// setCookie('Path', row.path) // 设置文件路径
	// router.push({ path: '/files', query: { path: row.path } })
}
