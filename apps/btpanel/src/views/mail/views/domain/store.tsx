import { defineStore } from 'pinia'

import { useModalData, useTableData } from '@mail/useMethod'
import { getByteUnit, getSimplifyTime } from '@/utils'
import { useOperate } from '@/hooks/tools/table/column'

import BtLink from '@components/base/bt-link'
import BtSwicth from '@components/form/bt-switch'
import BtIcon from '@/components/base/bt-icon'
import { ElPopover, ElSpace } from 'element-plus'
import { openResultView } from '@/public'

interface DomainSearch {
	p: number
	size: number
}

export const MAIL_DOMAIN = defineStore('MAIL_DOMAIN', () => {
	const search = reactive<DomainSearch>({
		p: 1,
		size: 10,
	})

	const formModal = useModalData('添加域名', {
		isEdit: false,
		onRefresh: async () => {
			const { getList } = await import('@mail/views/domain/method')
			getList()
		},
	})

	const dnsModal = useModalData('DNS 记录', {
		onRefresh: async () => {
			const { getList } = await import('@mail/views/domain/method')
			getList()
		},
	})

	const sslModal = useModalData('添加SSL', {
		onRefresh: async () => {
			const { getList } = await import('@mail/views/domain/method')
			getList()
		},
	})

	const catchModal = useModalData('捕捉电子邮件', {
		onRefresh: async () => {
			const { getList } = await import('@mail/views/domain/method')
			getList()
		},
	})

	const handleShowCheck = async (row: any) => {
		if (!row || Object.keys(row).length === 0) return
		const { onShowCheck } = await import('@mail/views/domain/method')
		onShowCheck(row)
	}

	const handleCheck = async (a_record: any) => {
		const { onCheck } = await import('@mail/views/domain/method')
		onCheck(a_record)
	}

	const handleLog = async (domain_check_log: any) => {
		const { onShowCheckLog } = await import('@mail/views/domain/method')
		onShowCheckLog(domain_check_log)
	}

	const handleIpRotate = async (row: any) => {
		const { onShowIpRotate } = await import('@mail/views/domain/method')
		onShowIpRotate(row)
	}

	const { table, columns } = useTableData([
		{
			prop: 'domain',
			label: '域名',
			showOverflowTooltip: true,
		},
		{
			prop: 'domain',
			width: 160,
			label: '封锁名单检查',
			render: (row: any) => {
				const { blacklisted } = row.domain_black_count
				const iconName = blacklisted ? 'el-circle-close-filled' : 'el-circle-check-filled'
				const iconColor = blacklisted ? '#E85445' : 'var(--el-color-primary)'
				return (
					<ElSpace class="flex items-center cursor-pointer" size={5}>
						<span class="flex items-center" title="查看" onClick={() => handleShowCheck(row.domain_black_count)}>
							<BtIcon class="mr-[2px]" icon={iconName} size={18} color={iconColor} />
							{row.domain_black_count && row.domain_black_count.time && <span>{getSimplifyTime(row.domain_black_count.time)}</span>}
						</span>

						<ElPopover
							trigger="hover"
							content="立即检查"
							popper-class="!min-w-0 !w-[80px] text-center"
							v-slots={{
								reference: () => <BtIcon aria-hidden={false} class="mr-[2px]" icon="el-search" size={18} color="var(--el-color-primary)" {...{ onClick: () => handleCheck(row.a_record) }} />,
							}}
						/>

						<ElPopover
							trigger="hover"
							content="日志"
							popper-class="!min-w-0 !w-[55px] text-center"
							v-slots={{
								reference: () => <BtIcon aria-hidden={false} icon="icon-ftp-log" size={18} {...{ onClick: () => handleLog(row.domain_check_log) }} />,
							}}
						/>
					</ElSpace>
				)
			},
		},
		{
			prop: 'quota',
			label: '域名配额',
			render: (row: any) => getByteUnit(row.quota),
		},
		{
			prop: 'mailboxes',
			label: '最大邮箱数量',
		},
		// {
		// 	prop: 'mailbox_quota',
		// 	label: '邮箱最大配额',
		// 	render: (row: any) => getByteUnit(row.mailbox_quota),
		// },
		{
			prop: 'domain',
			label: '邮件捕获',
			render: (row: any) => (
				<BtSwicth
					size="small"
					v-model={row.catch_all}
					onChange={async val => {
						if (val) {
							const { onOpenCatch } = await import('@mail/views/domain/method')
							onOpenCatch(row)
						} else {
							const { onCloseCatch } = await import('@mail/views/domain/method')
							onCloseCatch(row)
						}
					}}
				/>
			),
		},
		{
			prop: 'dns_id',
			label: 'DNS',
			render: (row: any) => {
				return <div class={'flex items-center'}>{row?.dns_name ? <span>{row.dns_name}</span> : <span class={''}>--</span>}</div>
			},
		},
		{
			prop: 'ip_tag',
			label: '多IP设置',
			width: 240,
			render: (row: any) => {
				const find = row.ip_tag.find((item: any) => item.status === true)
				return (
					<div>
						{find ? (
							<div class="flex items-center">
								<ElPopover
									placement="top"
									trigger="hover"
									content={find.tag}
									popper-class="!min-w-0 !w-[200px] text-center"
									v-slots={{
										reference: () => <span class="text-secondary">{find.tag}</span>,
										default: () => (
											<div>
												<span>IP: {find.ip}</span>
											</div>
										),
									}}
								/>
								{row.ip_rotate && (
									<span
										onClick={() => {
											handleIpRotate(row)
										}}
										class={`
											ml-3 px-2 py-0.5 
											rounded-full text-small
											transition-all duration-300 ease-in-out
											cursor-pointer
											flex items-center gap-1
											hover:opacity-80
											${row.ip_rotate.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
										<BtIcon icon={row.ip_rotate.status ? 'el-refresh' : 'el-close'} class={row.ip_rotate.status ? 'animate-spin ![animation-iteration-count:2] !text-primary' : ''} />
										{row.ip_rotate.status ? '定时轮换' : '未开启轮换'}
									</span>
								)}
							</div>
						) : (
							<span class={''}>--</span>
						)}
					</div>
				)
			},
		},
		{
			prop: 'domain',
			label: 'SSL',
			render: row => (
				<BtLink
					type={row.ssl_status ? 'primary' : 'warning'}
					onClick={async () => {
						const { onShowSSL } = await import('@mail/views/domain/method')
						onShowSSL(row)
					}}>
					{row.ssl_status ? `到期时间: ${row.ssl_info.notAfter}` : '未设置'}
				</BtLink>
			),
		},
		useOperate(
			[
				{
					title: '一键解析',
					isHide: (row: any) => {
						const isAllSuccess = row.mx_status && row.a_status && row.spf_status && row.dkim_status && row.dmarc_status
						return isAllSuccess || !row.dns_id
					},
					onClick: async (row: any) => {
						const { onParseAll, getList } = await import('@mail/views/domain/method')
						onParseAll(row.domain, row.mx_record, (data: any, resultData: any[]) => {
							if (data.status) {
								getList()
								openResultView(resultData, { title: '一键解析' })
							}
						})
					},
				},
				{
					title: 'DNS记录',
					onClick: async (row: any) => {
						const { onShowDNS } = await import('@mail/views/domain/method')
						onShowDNS(row)
					},
				},
				{
					title: '编辑',
					onClick: async (row: any) => {
						const { onShowEdit } = await import('@mail/views/domain/method')
						onShowEdit(row)
					},
				},
				{
					title: '删除',
					onClick: async (row: any) => {
						const { onDel } = await import('@mail/views/domain/method')
						onDel(row)
					},
				},
			],
			{
				width: 250,
				fixed: 'right',
				label: '操作',
			}
		),
	])

	return {
		search,
		table,
		columns,
		formModal,
		dnsModal,
		sslModal,
		catchModal,
	}
})

export default MAIL_DOMAIN
