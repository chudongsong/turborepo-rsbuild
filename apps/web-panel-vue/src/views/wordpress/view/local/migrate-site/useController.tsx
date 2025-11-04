import { getSiteMigrateList, migrateSite } from '@/api/wp'
import { useConfirm, useDataHandle } from '@/hooks/tools'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'

const { isRefreshMigrateSiteList } = storeToRefs(useWPLocalStore())

export const changeMigrateSite = () => {
	useConfirm({
		title: '迁移站点',
		content: '即将迁移站点，您确定要继续吗？',
		onConfirm: async () => {
			useDataHandle({
				request: migrateSite(),
				loading: '站点迁移中...',
				message: true,
				success(data) {
					isRefreshMigrateSiteList.value = true
				},
			})
		},
	})
}

export const getMigrateSiteList = async (params: any) => {
	try {
		const {
			data: { msg },
		} = await getSiteMigrateList()
		return {
			data: msg,
			total: 0,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}
