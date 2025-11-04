import { defineStore } from 'pinia'
import { MailDomain } from '@mail/types'
import { copyText } from '@/utils'
import { autoCreateDNSRecord, delMxTxtCache } from '@/api/mail'
import type { TableColumnProps } from '@/components/data/bt-table/types'
import { Message, useDataHandle } from '@/hooks/tools'
import { onParseAll } from '../method'
import { openResultView } from '@/public'
interface PropsData {
	row: MailDomain
	onRefresh: () => void
}

export const MAIL_DOMAIN_DNS = defineStore('MAIL_DOMAIN_DNS', () => {
	const statusData = ref<MailDomain[]>()

	const propsData = ref({} as PropsData)

	const addTxtRecordData = ref([
		{
			type: 'TXT',
			host: '@',
			value: 'v=spf1 a mx -all',
		},
		{ type: 'TXT', host: 'default._domainkey', value: '' },
		{ type: 'TXT', host: '_dmarc', value: '' },
	])

	const StatusCol = ({ status }: { status: boolean }) => {
		return (
			<div class={['inline-flex items-center', status ? 'text-primary' : 'text-dangerDark']}>
				<span class={['glyphicon', `glyphicon-${status ? 'ok' : 'remove'}`]}></span>
				<span class="ml-4px">{status ? 'OK' : '未设置'}</span>
			</div>
		)
	}

	const statusColumns = ref<TableColumnProps[]>([
		{
			prop: 'domain',
			label: '域名',
			width: 120,
			showOverflowTooltip: true,
		},
		{
			prop: 'mx_status',
			label: 'MX记录',
			render: row => {
				return <StatusCol status={row.mx_status === 1}></StatusCol>
			},
		},
		{
			prop: 'a_status',
			label: 'A记录',
			render: row => {
				return <StatusCol status={row.a_status === 1}></StatusCol>
			},
		},
		{
			prop: 'spf_status',
			label: 'SPF记录',
			render: row => {
				return <StatusCol status={row.spf_status === 1}></StatusCol>
			},
		},
		{
			prop: 'dkim_status',
			label: 'DKIM记录',
			render: row => {
				return <StatusCol status={row.dkim_status === 1}></StatusCol>
			},
		},
		{
			prop: 'dmarc_status',
			label: 'DMARC记录',
			render: row => {
				return <StatusCol status={row.dmarc_status === 1}></StatusCol>
			},
		},
		// {
		// 	prop: 'ptr_status',
		// 	label: 'PTR ',
		// 	render: row => {
		// 		return <StatusCol status={row.ptr_status === 1}></StatusCol>
		// 	},
		// },
	])

	const onCopy = (val: string) => {
		copyText({ value: val, success: '复制成功', error: '复制失败' })
	}

	const onVerify = async (close: any) => {
		const { data } = await delMxTxtCache({ domain: propsData.value.row.domain })
		Message.request(data)
		if (data.status) {
			close()
			propsData.value.onRefresh && propsData.value.onRefresh()
		}
	}

	const init = (data: PropsData) => {
		propsData.value = data
		statusData.value = [propsData.value.row]
		addTxtRecordData.value[1].value = propsData.value.row.dkim_value
		addTxtRecordData.value[2].value = propsData.value.row.dmarc_value
	}

	const onParseAllEnvent = async (close?: any) => {
		onParseAll(propsData.value.row.domain, propsData.value.row.mx_record, (data: any, resultData: any[]) => {
			if (data.status) {
				close && close()
				propsData.value.onRefresh && propsData.value.onRefresh()
				openResultView(resultData, { title: '一键解析' })
			}
		})
	}

	return {
		statusData,
		propsData,
		addTxtRecordData,
		statusColumns,
		onCopy,
		onVerify,
		init,
		onParseAllEnvent,
	}
})

export default MAIL_DOMAIN_DNS
