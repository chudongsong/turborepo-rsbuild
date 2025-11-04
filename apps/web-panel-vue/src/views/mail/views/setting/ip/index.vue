<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addIpTag">添加IP标签</el-button>
			</template>
			<template #header-right>
				<el-button @click="goDomain">去使用</el-button>
			</template>
			<template #content>
				<bt-table />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
		</bt-table-group>
		<bt-help class="mt-[1rem]" :options="helpOptions"> </bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useAllTable, useRefreshList } from '@/hooks/tools'
import { getIpListData, addIpTag, useTableBatch, isRefresh, delIpTag, editIpTag } from './useMethod'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { renderIconTip } from '@firewall/useMethod'
import { isArray } from '@/utils'
import BtIcon from '@/components/base/bt-icon'
import { router } from '@/router'

const helpOptions = [
	{
		content: '<span class="text-dangerDark">IP池中的IP标签可作为某个域名发送邮件的出口IP，在域名列表里配置</span>',
		isHtml: true,
	},
	{
		content: '<span class="text-dangerDark">每个IP可以有多个标签但是标签名不能重复</span>',
		isHtml: true,
	},
	{
		content: '<span class="text-dangerDark">调整完发送IP注意修改SPF记录，避免收件方退信或认定为垃圾邮件</span>',
		isHtml: true,
	},
]

const goDomain = () => {
	router.push('/mail/maildomain')
}

const { BtTable, BtRefresh, BtBatch } = useAllTable({
	request: getIpListData,
	columns: [
		useCheckbox({
			key: 'tag',
		}),
		{
			label: '标签名',
			prop: 'tag',
		},
		{
			renderHeader: () => (
				<div>
					<span>IP</span>
					<ElTooltip
						placement="top"
						effect="light"
					>
						{{
							default: () => <span class="ml-4px bt-ico-ask">?</span>,
							content: () => (
								<div>
									<div class="text-dangerDark">• 只能选择由系统从网卡扫描出的IP，此处展示IP地址是通过网络请求获取的公网IP</div>
									<div class="text-dangerDark">• 不支持虚拟网卡，如docker、lo、veth、br-、tun、tap、virb等</div>
									<div class="text-dangerDark">• 若没有找到想要的IP请检查：</div>
									<div class="text-dangerDark" style="margin-left: 20px;">1.IP绑定的网卡（ipa）</div>
									<div class="text-dangerDark" style="margin-left: 20px;">2.是否能正常访问宝塔官网获取公网IP</div>
									<div class="text-dangerDark" style="margin-left: 20px;">（curl --interface【网卡上的IP】https://www.bt.cn/api/getIpAddress）</div>
								</div>
							)
						}}
					</ElTooltip>
				</div>
			),
			prop: 'ip',
		},
		// {
		//     label: '日志标识',
		//     prop: 'syslog',
		// },
		{
			renderHeader: () => renderIconTip('HELO/EHLO', '用于HELO/EHLO的域名，绑定之后也可用于其它域名，不影响发送邮件'),
			prop: 'helo',
		},
		// {
		//     label: '优先IPv6',
		//     render: (row: any) => {
		//         const isIpv6 = row.preference === 'ipv6'
		//         const iconName = isIpv6 ? 'el-circle-check-filled' : 'el-circle-close-filled'
		//         const iconColor = isIpv6 ? 'var(--el-color-primary)' : '#E85445'
		//         return <BtIcon icon={iconName} size={18} color={iconColor} />
		//     }
		// },
		// {
		//     label: '绑定',
		//     render: (row: any) => {
		//         return (
		//             <span>
		//                 {isArray(row.binds) ? row.binds.join(',') : ''}
		//             </span>
		//         )
		//     }
		// },
		useOperate([
			{ title: '编辑', onClick: (row: any) => editIpTag(row) },
			{ title: '删除', onClick: (row: any) => delIpTag(row) },
		]),
	],
	extension: [useTableBatch, useRefreshList(isRefresh)],
})
</script>
