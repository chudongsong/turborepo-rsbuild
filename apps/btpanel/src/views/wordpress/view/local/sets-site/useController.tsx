import { addPluginOrThemeToSets, delSets, delSetsPluginOrTheme, getInstallPluginList, getInstallThemesList, getPluginOrThemeToSets, getSetsList, getWPList, installPluginOrThemeToSets, setSetsActive } from '@/api/wp'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { FormInput } from '@/hooks/tools/form/form-item'
import { FormItemProps } from '@/hooks/tools/form/types'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import useWPSetsStore from './useStore'
import BtDivider from '@/components/other/bt-divider'
import { ElSwitch } from 'element-plus'
import { RequestProps } from '@/hooks/tools/message/types'
import BtRate from '@/components/form/bt-rate'

const { wpSetsPluginOrTheme, pluginOrThemePamra, isRefreshInstallList, isRefreshPluginOrThemeList, isRefreshSetsList } = storeToRefs(useWPSetsStore())

/**
 * @description WP套件列表
 **/
export const getWpSetsData = async (params: any) => {
	try {
		const {
			data: { list, total },
		} = await getSetsList({ keyword: params.search, p_size: params.limit, p: params.p })
		return {
			data: list,
			total,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

/**
 * @description WP套件列表配置
 */
export const getWpSetsListConfig = () => {
	return [
		{
			label: '名称',
			isCustom: true,
			prop: 'name',
			render: (row: any) => {
				return <span>{row.name}</span>
			},
		},
		{
			label: '插件',
			isCustom: true,
			prop: 'plugins',
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							openPluginOrThemeList(row, 1)
						}}>
						{`${row.plugins.length} 条(添加插件)`}
					</span>
				)
			},
		},
		{
			label: '主题',
			isCustom: true,
			prop: 'themes',
			render: (row: any) => {
				return (
					<span
						class="bt-link"
						onClick={() => {
							openPluginOrThemeList(row, 2)
						}}>
						{`${row.themes.length} 条(添加主题)`}
					</span>
				)
			},
		},
		useOperate((row: any) => {
			return [
				{
					render: (row: any) => {
						return (
							<div class={'inline-block'}>
								{row.plugins.length === 0 && row.themes.length === 0 ? (
									<span class={'text-tertiary'} style={'cursor:not-allowed'}>
										安装
									</span>
								) : (
									<span
										class={'bt-link'}
										onClick={() => {
											wpSetsPluginOrTheme.value.id = row.id
											useDialog({
												title: '选择网站',
												area: 45,
												btn: true,
												confirmText: '安装',
												component: () => import('@/views/wordpress/view/local/sets-site/install-set.vue'),
											})
										}}>
										安装
									</span>
								)}
								<BtDivider />
							</div>
						)
					},
				},
				{
					render: (row: any) => {
						return (
							<span
								class={'bt-link'}
								onClick={() => {
									useConfirm({
										title: `删除【${row.name}】`,
										content: '您确定要删除此组吗？',
										onConfirm: async () => {
											await useDataHandle({
												request: delSets({ set_id: row.id }),
												loading: '正在删除中...',
												message: true,
												success: () => {
													isRefreshSetsList.value = true
												},
											})
										},
									})
								}}>
								删除
							</span>
						)
					},
				},
			]
		}),
	]
}

export const createSets = () => {
	useDialog({
		title: '创建集合包',
		area: 48,
		btn: true,
		component: () => import('@/views/wordpress/view/local/sets-site/created-set.vue'),
	})
}

/**
 * @description 创建集合包
 * @param formData
 * @returns
 */
export const getAddWPSetsFormOption = (formData: AnyObject | undefined): ComputedRef<FormItemProps[]> => {
	const defalut = { class: '!w-[280px]', clearable: true }
	return computed(() => {
		return [FormInput('名称', 'name', { attrs: { ...defalut, placeholder: '请输入集合名称' }, rules: [{ required: true, message: '集合名称不能为空', trigger: 'blur' }] })]
	})
}

/**
 * @description 打开插件或主题列表
 */
export const openPluginOrThemeList = (row: any, type: number) => {
	wpSetsPluginOrTheme.value = { id: row.id, type: type }
	useDialog({
		title: `${type === 1 ? '添加插件' : '添加主题'}-【请先搜索后勾选需要的${type === 1 ? '插件' : '主题'}】`,
		area: 60,
		component: () => import('@/views/wordpress/view/local/sets-site/edit-set.vue'),
	})
}

/**
 * @description WP套件列表
 **/
export const getPluginOrThemeListData = async (params: any) => {
	try {
		const {
			data: { msg },
		} = await getPluginOrThemeToSets({
			set_id: wpSetsPluginOrTheme.value.id,
			type: wpSetsPluginOrTheme.value.type,
		})
		return {
			data: msg,
			total: 0,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: { search_history: [] } }
	}
}

/**
 * @description 插件或主题列表配置
 */
export const getPluginOrThemeListConfig = () => {
	return [
		{
			label: '名称',
			isCustom: true,
			prop: 'title',
		},
		{
			label: '状态',
			prop: 'state',
			width: 80,
			render: (row: any) => {
				return (
					<ElSwitch
						v-model={row.state}
						size="small"
						active-value={1}
						inactive-value={0}
						onChange={e => {
							useDataHandle({
								request: setSetsActive({ item_ids: row.id, state: e ? 1 : 0, type: wpSetsPluginOrTheme.value.type }),
								loading: '正在设置中...',
								message: true,
								success: () => {
									isRefreshPluginOrThemeList.value = true
								},
							})
						}}></ElSwitch>
				)
			},
		},
		useOperate([
			{
				title: '删除',
				onClick: async (row: any) => {
					useDataHandle({
						request: delSetsPluginOrTheme({ item_ids: row.id, type: wpSetsPluginOrTheme.value.type }),
						loading: '正在删除中...',
						message: true,
						success: () => {
							isRefreshPluginOrThemeList.value = true
							isRefreshSetsList.value = true
						},
					})
				},
			},
		]),
	]
}

/**
 * @description 添加插件或主题列表配置
 */
export const getAddPluginOrThemeListConfig = () => {
	return [
		useCheckbox({ key: 'name' }),
		// {
		// 	type: 'selection',
		// 	width: 36,
		// 	selectable: (row: any) => {
		// 		return !row.is_in_set
		// 	},
		// },
		{
			label: '名称',
			isCustom: true,
			prop: 'name',
		},
		{
			label: '等级',
			isCustom: true,
			prop: 'title',
			render: (row: any) => {
				return <BtRate modelValue={Number((row.rating / 20).toFixed(0))} disabled={true} allow-half={true} class="!text-extraLarge" />
			},
		},
	]
}

export const getInstallPluginOrThemesListData = async (params: any) => {
	let load
	try {
		if (!params.search) {
			return
		}
		load = Message.load('正在加载...')
		pluginOrThemePamra.value.keyword = params.search
		pluginOrThemePamra.value.set_id = wpSetsPluginOrTheme.value.id
		const {
			data: {
				msg: { list },
			},
		} = wpSetsPluginOrTheme.value.type === 1 ? await getInstallPluginList(toRaw(pluginOrThemePamra.value)) : await getInstallThemesList(toRaw(pluginOrThemePamra.value))
		return { data: list, total: 0 }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	} finally {
		load && load.close()
	}
}

export const onInstallSeach = () => {
	if (!pluginOrThemePamra.value.keyword) {
		Message.error('请输入关键字')
		return
	}
	isRefreshInstallList.value = true
}

export const onAddList = async (data: any) => {
	console.log(data, '322222222222')
	if (!pluginOrThemePamra.value.keyword || !data?.length) {
		Message.error('请选一个主题或插件以添加')
		return
	}
	const list = data.map((item: any) => ({
		slug: item.slug,
		title: item.name,
		description: wpSetsPluginOrTheme.value.type === 1 ? item.short_description : item.description,
	}))
	await addPluginOrThemeToSets({ set_id: wpSetsPluginOrTheme.value.id, items: JSON.stringify(list), type: wpSetsPluginOrTheme.value.type })
	isRefreshPluginOrThemeList.value = true
	isRefreshSetsList.value = true
}

export const getWpInstallListData = async (params: any) => {
	try {
		const {
			data: { msg },
		} = await getWPList()

		return {
			data: msg,
			total: 0,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

export const getWpInstallListConfig = () => {
	return [
		useCheckbox(),
		{
			label: '名称',
			isCustom: true,
			prop: 'name',
		},
	]
}

export const confirmInstall = async (list: any, close: () => void) => {
	try {
		const site_ids = list.map((item: any) => item.id).join(',')
		await useDataHandle({
			loading: '正在安装，请稍后...',
			message: true,
			request: installPluginOrThemeToSets({ set_id: wpSetsPluginOrTheme.value.id, site_ids }),
			success: (rdata: RequestProps) => {
				if (rdata.status) {
					close && close()
				}
			},
		})
	} catch (error) {
		console.log(error)
		return false
	}
}
