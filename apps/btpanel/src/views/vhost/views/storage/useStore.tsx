import { enableDiskQuotaApi, getDiskListApi, setDefaultDiskApi } from '@/api/vhost'
import { getByteUnit, isArray, isObject } from '@/utils'
import { useOperate } from '@/hooks/tools/table/column'
import { restartSeverDialog } from '@/public'
import { TableResponseProps } from '@/hooks/tools/table/types'
import { useMessage } from '@/hooks/tools'
import BtProgress from '@/components/data/bt-progress'

import type { DiskList, Response } from './types'

const { request: $request } = useMessage()

export const STORAGE_STORE = defineStore('VHOST-STORAGE-STORE', () => {
	// 默认信息
	const defaultDiskInfo = ref<DiskList>({
		device: '',
		mountpoint: '',
		fstype: '',
		total: 0,
		used: 0,
		free: 0,
		used_percent: 0,
		inodes_total: 0,
		inodes_used: 0,
		inodes_free: 0,
		inodes_used_percent: 0,
		is_group_quota: false,
		is_user_quota: false,
		is_default: false,
		account_allocate: 0,
		account_percent: 0,
	})

	// 刷新信息
	const refreshInfo = ref(0)

	// 重启标识
	const restartFlag = ref(false)

	// 列表项
	const columns = ref([
		{ label: '挂载点', prop: 'mountpoint', minWidth: 120 },
		{ label: '装置', prop: 'device', minWidth: 120 },
		{
			label: '磁盘配额',
			prop: 'is_group_quota',
			minWidth: 140,
			render: row => {
				if (row.is_user_quota) return <span>是</span>
				return (
					<div>
						<span class={'text-warning'}>否</span> |{' '}
						<span class={'text-primary cursor-pointer'} onClick={() => setDiskQuotaEvent(row)}>
							设置磁盘配额
						</span>
					</div>
				)
			},
		},
		{
			label: '总大小',
			prop: 'total',
			minWidth: 60,
			render: (row: DiskList) => {
				return getByteUnit(row.total)
			},
		},
		{
			label: '已使用',
			prop: 'used',
			minWidth: 180,
			render: (row: DiskList) => {
				const used = Math.round(row.used_percent)
				return (
					<>
						<div class="mr-[10px]">
							{used}% / {getByteUnit(row.used)}
						</div>
						<BtProgress class="w-[100px]" percentage={Number(used.toFixed(2))} text-inside={true} stroke-width={14} status={diskColor(used)} />
					</>
				)
			},
		},
		useOperate([
			{
				width: 100,
				disabled: true,
				isHide: (row: DiskList) => row.is_default && !restartFlag.value,
				render: () => <span>默认磁盘</span>,
			},
			{ title: '重启服务', width: 100, onClick: () => restartSeverDialog(), isHide: (row: DiskList) => row.is_default && !restartFlag.value },
			{ title: '设置默认磁盘', width: 100, onClick: (row: DiskList) => setDefaultDiskEvent(row), isHide: (row: DiskList) => row.is_default && !restartFlag.value },
		]),
	])

	// 磁盘颜色
	const diskColor = (value: number) => {
		const num = Math.round(value)
		if (num > 80) return 'exception'
		if (num > 60) return 'warning'
		return 'success'
	}

	/**
	 * @description 获取磁盘列表
	 */
	const getDiskList = async (): Promise<TableResponseProps> => {
		const { data } = await getDiskListApi()
		if (isArray<Response<DiskList>>(data)) {
			// 拷贝默认磁盘
			const defaultDisk = data.find((item: { is_default: boolean }) => item.is_default)
			if (defaultDisk) {
				const currentDisk = { ...defaultDisk }
				// 计算使用百分比[account_allocate占user的多少] 返回整数
				currentDisk['account_percent'] = Math.round((currentDisk.account_allocate / currentDisk.total) * 100)
				defaultDiskInfo.value = currentDisk
			}
			return { data, total: data.length }
		}
		return { data: [], total: 0 }
	}

	/**
	 * @description 刷新列表
	 */
	const refreshList = () => {
		refreshInfo.value = new Date().getTime()
	}

	/**
	 * @description 设置磁盘配额事件
	 * @param {DiskList} row 行数据
	 */
	const setDiskQuotaEvent = async (row: DiskList) => {
		const rdata = await enableDiskQuotaApi(row.mountpoint)
		await $request(rdata)
		refreshList()
	}

	/**
	 * @description 设置默认磁盘事件
	 * @param {DiskList} row 行数据
	 */
	const setDefaultDiskEvent = async (row: DiskList) => {
		const rdata = await setDefaultDiskApi({ mountpoint: row.mountpoint })
		await $request(rdata)
		refreshList()
		restartFlag.value = true
	}

	return {
		defaultDiskInfo,
		columns,
		diskColor,
		refreshInfo,
		refreshList,
		getDiskList,
	}
})

/**
 * @description 获取资源包store
 * @returns
 */
export const useStorageStore = () => {
	const store = STORAGE_STORE()
	const storageStore = storeToRefs(store)
	return { ...store, ...storageStore }
}
