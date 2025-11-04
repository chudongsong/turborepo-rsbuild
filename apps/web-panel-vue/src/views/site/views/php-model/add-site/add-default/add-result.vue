<template>
	<div class="p-28px">
		<div class="flex items-center">
			<i class="svgtofont-el-success-filled text-primary" :class="`${!compData.title ? `!text-large100` : `!text-titleLarge`}`"></i>
			<div v-if="compData.ftp || compData.sql" class="flex flex-col flex-shrink w-full ml-32px" style="gap: 12px">
				<div v-if="compData.ftp && compData.ftpStatus" class="flex flex-col">
					FTP账号资料
					<el-divider class="!my-8px"></el-divider>
					<span class="flex items-center">
						用户：
						<strong>{{ compData.ftpData.username }}</strong>
					</span>
					<span class="flex items-center">
						密码：
						<strong>{{ compData.ftpData.password }}</strong>
					</span>
				</div>
				<div class="text-danger my-8px" v-if="compData.ftp && !compData.ftpStatus">FTP账号添加失败！</div>
				<div class="text-danger my-8px" v-if="compData.sql && !compData.databaseStatus">数据库添加失败！</div>

				<div v-if="compData.sql && compData.databaseStatus" class="flex flex-col">
					数据库账号资料
					<el-divider class="!my-8px"></el-divider>
					<span class="flex items-center" v-if="compData.siteStatus">
						数据库名：
						<strong>{{ compData.sqlData.username }}</strong>
					</span>
					<span class="flex items-center">
						用户：
						<strong>{{ compData.sqlData.username }}</strong>
					</span>
					<span class="flex items-center">
						密码：
						<strong>{{ compData.sqlData.password }}</strong>
					</span>
					<span class="flex items-center" v-if="compData.siteStatus && compData.site.name">
						访问站点：
						<bt-link :href="'http://' + compData.site.name">{{ 'http://' + compData.site.name }}</bt-link>
					</span>
				</div>
				<span class="flex items-center" v-if="compData.accessSite">
					<div class="whitespace-nowrap">初次启动url：</div>
					<bt-link v-if="compData.accessSite" :href="compData.accessSite">{{ compData.accessSite }}</bt-link>
				</span>
				<div class="text-danger my-8px" v-if="!compData.siteStatus">网站添加失败！</div>
				<div class="my-8px" v-if="compData.siteStatus">网站添加成功！</div>
			</div>
			<div v-else class="ml-1rem">
				{{ compData.title }}
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { useDataHandle } from '@/hooks/tools'
import { setSiteDns } from '@api/site'

interface Props {
	compData: {
		ftp: boolean
		ftpStatus: boolean
		sql: boolean
		databaseStatus: boolean
		ftpData: {
			username: string
			password: string
		}
		sqlData: {
			username: string
			password: string
		}
		siteStatus: boolean
		site: {
			name: string | boolean
		}
		accessSite?: string
		dns?: any[]
		title?: string
	}
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => {
		return {
			ftp: true,
			sql: true,
			ftpStatus: true,
			databaseStatus: true,
			ftpData: {
				username: '',
				password: '',
			},
			sqlData: {
				username: '',
				password: '',
			},
			siteStatus: true,
			site: {
				name: '',
			},
			accessSite: '',
		}
	},
})

const dnsData = ref<any>([])

const tableColumn = ref<any>([
	{
		label: '域名',
		prop: 'domain',
		width: 120,
	},
	{
		label: '结果',
		prop: 'msg',
		align: 'right',
		showOverflowTooltip: true,
		render: (row: any) => {
			if (!row.msg) return <div class="svgtofont-el-loading text-base"></div>
			return <div class={`truncate ${row.status ? 'text-primary' : 'text-danger'}`}>{row.msg}</div>
		},
	},
])

/**
 * @description 设置站点DNS
 */
const setSiteDnsEvent = async () => {
	if (props.compData.dns) {
		dnsData.value = props.compData.dns
		useDataHandle({
			request: setSiteDns({
				domains: dnsData.value.map((item: any) => item.domain)?.join(','),
			}),
			data: [Array, dnsData],
		})
	}
}

onMounted(() => {
	setSiteDnsEvent()
})
</script>
