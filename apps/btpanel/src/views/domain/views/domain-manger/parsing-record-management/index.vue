<template>
	<div class="px-1.6rem py-1rem">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addSubDomain" :disabled="isDisabledAdd">添加</el-button>
				<el-alert v-if="compData.row.dns.dns_name === 'WestDns'" type="warning" class="h-[100%] !ml-[1rem]" :closable="false" show-icon>
					<template #title>
						<span class="text-base">
							<span> 提示：WestDns 西部数码不支持修改解析记录的主机记录和记录类型</span>
						</span>
					</template>
				</el-alert>
			</template>
			<template #header-right>
				<bt-input-search v-model="requestData.search" placeholder="请输入主机记录" @search="getSubDomainListData" class="!mr-[.8rem] !w-[23rem]"></bt-input-search>
				<bt-table-refresh @refresh="getSubDomainListData" class="!mr-[.8rem]"></bt-table-refresh>
			</template>
			<template #content>
				<el-table class="w-full sub-domain-table" :data="subDomainTableList" v-bt-loading="isSubDomainLoading" v-bt-loading:title="'正在加载子域名列表，请稍后...'" row-key="RecordId" :expand-row-keys="expandRowKeys" :max-height="550">
					<template #empty>
						{{ isDisabledAdd ? '此域名配置的dns账号不正确' : '列表为空' }}
					</template>
					<el-table-column type="expand" width="1" min-width="1">
						<!-- <template> -->
						<template v-if="isUpdate">
							<div class="p-1rem">
								<template v-if="currentHint === 'name'">
									<div class="text-secondary pl-[.8rem]">要解析www.bt.cn，请填写www。主机记录就是域名前缀，<span class="text-warning font-bold">点击下列选项可自行填充</span>：</div>
									<table class="w-full hint-table">
										<tbody>
											<tr @click="changeRowEvent('www', 'name')">
												<th>www</th>
												<td class="text-secondary">解析后的域名为www.bt.cn</td>
											</tr>
											<tr @click="changeRowEvent('@', 'name')">
												<th>@</th>
												<td class="text-secondary">直接解析主域名bt.cn</td>
											</tr>
											<tr @click="changeRowEvent('*', 'name')">
												<th>*</th>
												<td class="text-secondary">泛解析，匹配其他所有域名*.bt.cn</td>
											</tr>
											<tr @click="changeRowEvent('mail', 'name')">
												<th>mail</th>
												<td class="text-secondary">将域名解析为mail.bt.cn，通常用于解析邮箱服务器</td>
											</tr>
											<tr @click="changeRowEvent('2', 'name')">
												<th>二级域名</th>
												<td class="text-secondary">如：abc.bt.cn，填写abc</td>
											</tr>
										</tbody>
									</table>
								</template>
								<template v-else-if="currentHint === 'type'">
									<div class="pl-[.8rem] text-secondary leading-[2.4rem]">
										<div>将域名指向云服务器，请选择「A」</div>
										<div>将域名指向另一个域名，请选择「CNAME」</div>
										<div>建立邮箱请选择「MX」，根据邮箱服务商提供的MX记录</div>
										<table class="w-full hint-table">
											<tbody>
												<tr @click="changeRowEvent('A', 'type')">
													<th>A</th>
													<td class="text-secondary">将域名指向IPv4地址</td>
												</tr>
												<tr @click="changeRowEvent('CNAME', 'type')">
													<th>CNAME</th>
													<td class="text-secondary">将域名指向另外一个域名</td>
												</tr>
												<tr @click="changeRowEvent('MX', 'type')">
													<th>MX</th>
													<td class="text-secondary">如果需要设置邮箱，让邮箱能收到邮件，就需要添加MX记录。</td>
												</tr>
												<tr @click="changeRowEvent('TXT', 'type')">
													<th>TXT</th>
													<td class="text-secondary">设置文本记录</td>
												</tr>
												<tr @click="changeRowEvent('CAA', 'type')">
													<th>CAA</th>
													<td class="text-secondary">CA证书颁发机构授权校验</td>
												</tr>
												<tr @click="changeRowEvent('AAAA', 'type')">
													<th>AAAA</th>
													<td class="text-secondary">用来指定主机名（或域名）对应的IPv6地址（例如：ff06:0:0:0:0:0:0:c3）记录。</td>
												</tr>
											</tbody>
										</table>
									</div>
								</template>
							</div>
						</template>
						<!-- </template> -->
					</el-table-column>
					<el-table-column label="主机记录" prop="name">
						<template #default="{ row, $index }">
							<bt-input
								class="record-name-input"
								v-if="isUpdate && $index == 0"
								:disabled="compData.row.dns.dns_name === 'WestDns' && !isAdd"
								v-model="row.name"
								type="text"
								size="small"
								placeholder="根据下方提示填写"
								:title="`${row.name}.${props.compData.row.domain}`"
								@focus="changeCurrentNameEvent('name')">
								<template #append>{{ `.${compData.row.domain}` }}</template>
							</bt-input>
							<span v-else>{{ row.name }}</span>
						</template>
					</el-table-column>
					<el-table-column label="记录类型" prop="type" width="100">
						<template #default="{ row, $index }">
							<el-select @focus="changeCurrentNameEvent('type')" size="small" v-if="isUpdate && $index == 0" :disabled="compData.row.dns.dns_name === 'WestDns' && !isAdd" v-model="row.type" class="!w-[8rem]" placeholder="请选择" @change="onTypeChange($event, row)">
								<el-option v-for="item in typeOptions" :key="item.key" :label="item.title" :value="item.key"> </el-option>
							</el-select>
							<span v-else>{{ row.type }}</span>
						</template>
					</el-table-column>
					<el-table-column label="解析请求来源" prop="line" width="100">
						<template #default="{ row }">
							<span>{{ row.line === 'default' ? '默认' : row.line }}</span>
						</template>
					</el-table-column>
					<el-table-column label="记录值" prop="value">
						<template #default="{ row, $index }">
							<bt-input v-if="isUpdate && $index == 0" v-model="row.value" type="text" placeholder="必填" size="small"></bt-input>
							<span v-else>{{ row.value }}</span>
						</template>
					</el-table-column>
					<el-table-column label="TTL" prop="ttl" width="100">
						<template #default="{ row }">
							<span>{{ convertSeconds(row.ttl) }}</span>
						</template>
					</el-table-column>
					<el-table-column label="状态" prop="status" width="80">
						<template #default="{ row, $index }">
							<btTableStatus v-if="!(isUpdate && $index == 0)" :data="['暂停', '启用']" :modelValue="row.status === '启用' ? true : false" @click="onStatusChange(row)" />
							<span v-else>-</span>
						</template>
					</el-table-column>
					<el-table-column label="备注" prop="remark" width="120">
						<template #default="{ row, $index }">
							<bt-input v-if="isUpdate && $index == 0" :disabled="compData.row.dns.dns_name === 'WestDns'" v-model="row.remark" type="text" size="small" placeholder="请输入备注" />
							<span v-else>{{ row.remark }}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="140" align="right">
						<template #default="{ row, $index }">
							<template v-if="isUpdate && $index == 0">
								<div class="flex">
									<el-button type="primary" @click="onSaveEvent(row)">保存</el-button>
									<el-button type="default" @click="onCancelEvent(row, $index)">取消</el-button>
								</div>
							</template>
							<template v-else>
								<span class="bt-link cursor-pointer" @click="onUpdateEvent(row, $index)">修改</span>
								<BtDivider />
								<span class="bt-link cursor-pointer" @click="onDel(row)">删除</span>
							</template>
						</template>
					</el-table-column>
				</el-table>
			</template>
			<template #footer-right>
				<bt-table-page :layout="layout" v-model:page="requestData.p" v-model:row="requestData.limit" :total="requestData.total" :use-storage="false" @change="getSubDomainListData" />
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import { useOperate } from '@hooks/tools/table/column'
import { domainFun } from '@api/ssl'
import { useMessage } from '@/hooks/tools'
import { useConfirm } from '@hooks/tools'
import { checkObjKey, deepClone, isArray } from '@utils/index'
import { getSslStore } from '@ssl/useStore'
import btTableStatus from '@/components/extension/bt-table-status'
import BtPagination from '@/components/data/bt-pagination'

const MessageMethod = useMessage()

const {
	refs: { isRefreshDomainList },
} = getSslStore()

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})

const isDisabledAdd = ref(true) // 是否禁用添加按钮
const isUpdate = ref(false) // 修改状态
const isAdd = ref(false) // 添加状态
const tableList = ref([]) // 表格数据
const expandRowKeys = ref([]) // 展开行
const currentHint = ref<string>('name') // 当前提示
const layout = ref('prev, pager, next, sizes, total, jumper') // 分页布局

const typeOptions = [
	{
		title: 'A',
		key: 'A',
	},
	{
		title: 'TXT',
		key: 'TXT',
	},
	{
		title: 'CNAME',
		key: 'CNAME',
	},
	{
		title: 'MX',
		key: 'MX',
	},
	{
		title: 'CAA',
		key: 'CAA',
	},
	{
		title: 'AAAA',
		key: 'AAAA',
	},
]

const requestData = reactive({
	dns_id: '',
	domain_name: '',
	record_type: 'A',
	fun_name: 'get_dns_record',
	search: '',
	p: 1,
	limit: 10,
	total: 0,
}) // 列表请求参数
const editRow = reactive({
	dns_id: '',
	domain_name: '',
	record_type: '',
	fun_name: 'delete_dns_record',
	RecordId: '',
})
const requestStatusData = reactive({
	dns_id: '',
	domain_name: '',
	fun_name: 'set_dns_record_status',
	status: 1,
	RecordId: '',
})
const isSubDomainLoading = ref(false) // 表格加载中
const subDomainTableList = ref([]) // 子域名列表
const tableColumn = [
	{
		label: '主机记录',
		prop: 'name',
	},
	{
		label: '记录类型',
		prop: 'type',
		width: 80,
	},
	{
		label: '解析请求来源',
		prop: 'line',
		width: 100,
	},
	{
		label: '记录值',
		prop: 'value',
	},
	{
		label: 'TTL',
		width: 100,
		render(row: any) {
			return convertSeconds(row.ttl)
		},
	},
	{
		label: '状态',
		prop: 'status',
		width: 80,
	},
	{
		label: '备注',
		prop: 'remark',
	},
	useOperate([
		{
			onClick: (row: any) => {
				onDel(row)
			},
			title: '删除',
		},
	]),
] // 表格列

const convertSeconds = (seconds: number) => {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60
	return `${hours > 0 ? hours + '小时' : ''}${minutes > 0 ? minutes + '分钟' : ''}${secs > 0 ? secs + '秒' : ''}`
}

const getSubDomainListData = async (p: number = 1, limit: number = 10) => {
	requestData.p = p || 1
	requestData.limit = limit || 10
	try {
		console.log('getSubDomainListData')
		if (isUpdate.value) return MessageMethod.error('请先保存当前修改的数据，再进行其他操作！')
		isSubDomainLoading.value = true
		
		const isSearch = requestData.search && requestData.search.trim()
		if (isSearch) {
			requestData.p = 1
			requestData.limit = 100
		}
		const { data } = await domainFun(requestData)
		const { list } = data
		subDomainTableList.value = list as any
		tableList.value = deepClone(list) as any
		isDisabledAdd.value = isArray(list) ? false : true
		if (isSearch) {
			requestData.total = list?.length || 0
			layout.value = 'prev, pager, next, total'
		} else {
			requestData.total = data.info.record_total || 0
			layout.value = 'prev, pager, next, sizes, total, jumper'
		}
	} catch (error) {
		console.log('error', error)
	} finally {
		isSubDomainLoading.value = false
	}
}

/**
 * @description 修改主机记录提示
 * @param {String} val
 */
const changeCurrentNameEvent = (val: string) => {
	currentHint.value = val
	subDomainTableList.value = deepClone(subDomainTableList.value) as any
}

/**
 * @description 修改主机记录
 * @param {String} val
 * @param {String} key
 */
const changeRowEvent = (val: string, key: string) => {
	let list: any = deepClone(tableList.value)
	const nameArr = list?.find((item: any) => item.RecordId === subDomainTableList.value[0]['RecordId'])?.[key]?.split('.')
	subDomainTableList.value[0][key] = (val == '2' ? (nameArr ? nameArr[0] : 'abc') : val) as never
}

/**
 * @description 修改记录类型
 * @param {String} val
 * @param {Object} row
 */
const onTypeChange = (val: any, row: any) => {
	row.type = val
}

/**
 * @description 点击取消按钮
 * @param {Object} row
 * @param {Number} index
 */
const onCancelEvent = (row: any, index: number) => {
	isUpdate.value = false // 关闭修改状态
	isAdd.value = false // 关闭新增状态
	currentHint.value = 'name'
	expandRowKeys.value = [] // 关闭展开行
	subDomainTableList.value = deepClone(tableList.value) as any // 还原数据
}

/**
 * @description 点击保存按钮 修改子域名
 * @param {Object} row
 */
const onSaveEvent = async (row: any) => {
	if (!row.name) {
		MessageMethod.error('主机记录不能为空')
		return
	}
	if (!row.value) {
		MessageMethod.error('记录值不能为空')
		return
	}
	const load = MessageMethod.load('正在修改子域名，请稍候...')
	let params = {
		fun_name: 'update_dns_record',
		dns_id: props.compData.row.dns_id,
		domain_name: row.name.indexOf(props.compData.row.domain) > -1 ? row.name : `${row.name}.${props.compData.row.domain}`,
		domain_dns_value: row.value,
		record_type: row.type,
		RecordId: row.RecordId,
		mx: row.mx,
		RecordLine: row.line,
		remark: row.remark,
	}
	if (params.RecordId === 0) {
		// 添加子域名
		delete params.RecordId
		params.fun_name = 'create_dns_record'
	}
	try {
		const ress = await domainFun(params)
		load && load.close()
		MessageMethod.request(ress)
		if (ress.status) {
			isUpdate.value = false
			isAdd.value = false
			currentHint.value = 'name'
			expandRowKeys.value = []
			await getSubDomainListData(requestData.p, requestData.limit)
			isRefreshDomainList.value = true
		}
	} catch (error) {}
}

/**
 * @description 点击修改按钮
 * @param {Object} row
 * @param {Number} index
 */
const onUpdateEvent = (row: any, index: number) => {
	// 如果正在修改中，不允许修改其他数据
	if (isUpdate.value) return MessageMethod.error('请先保存当前修改的数据，再进行其他操作！')

	isUpdate.value = true // 全局修改状态
	expandRowKeys.value = [row.RecordId as never] // 展开行
	// index 不为0时，将当前行数据移动到第一行
	if (index !== 0) {
		let name = row.name.replace(`.${props.compData.row.domain}`, '')
		const temp = subDomainTableList.value[0]
		if (row.name.replace(`.${props.compData.row.domain}`, '') === row.name) {
			name = '@'
		}
		subDomainTableList.value[0] = {
			...row,
			name,
		} as never
		subDomainTableList.value[index] = temp
	} else {
		subDomainTableList.value[0] = {
			...row,
			name: row.name.replace(`.${props.compData.row.domain}`, ''),
		} as never
	}
}

/**
 * @description 添加子域名
 */
const addSubDomain = () => {
	if (isDisabledAdd.value) return MessageMethod.error('此域名配置的dns账号不正确')
	if (isUpdate.value) return MessageMethod.error('请先保存当前修改的数据，再进行其他操作！')
	isUpdate.value = true
	isAdd.value = true
	expandRowKeys.value = [0] as any
	subDomainTableList.value.unshift({
		RecordId: 0,
		name: '',
		type: 'A',
		line: 'default',
		value: '',
		ttl: 600,
		status: '启用',
		remark: '',
		mx: 0,
	} as never)
}

/**
 * @description 点击删除按钮
 * @param {Object} row
 */
const onDel = async (row: any) => {
	if (isUpdate.value) return MessageMethod.error('请先保存当前修改的数据，再进行其他操作！')
	editRow.record_type = row.type
	editRow.domain_name = row.name
	editRow.RecordId = row.RecordId
	await useConfirm({
		title: `删除【${row.name}】`,
		content: '删除该子域名，是否继续操作？',
		icon: 'warning',
	})
	try {
		const load = MessageMethod.load('正在删除子域名，请稍候...')
		const ress = await domainFun(editRow)
		load && load.close()
		MessageMethod.request(ress)
		if (ress.status) {
			await getSubDomainListData(requestData.p, requestData.limit)
			isRefreshDomainList.value = true
		}
	} catch (error) {
		console.log('error', error)
	}
}

/**
 * @description 修改状态
 * @param {Object} row
 **/
const onStatusChange = async (row: any) => {
	let load
	try {
		requestStatusData.RecordId = row.RecordId
		requestStatusData.status = row.status === '启用' ? 1 : 0
		requestStatusData.domain_name = row.name.indexOf(props.compData.row.domain) > -1 ? row.name : `${row.name}.${props.compData.row.domain}`
		load = MessageMethod.load('正在修改状态，请稍候...')
		const ress = await domainFun(requestStatusData)
		MessageMethod.request(ress)
		if (ress.status) {
			onCancelEvent(row, 0)
			await getSubDomainListData(requestData.p, requestData.limit)
		}
	} catch (error) {
		console.log('error', error)
	} finally {
		load && load.close()
	}
}

onMounted(() => {
	if (props.compData.row?.dns_id) {
		requestData.dns_id = props.compData.row.dns_id
		requestData.domain_name = props.compData.row.domain
		editRow.dns_id = props.compData.row.dns_id
		requestStatusData.dns_id = props.compData.row.dns_id
		getSubDomainListData()
	}
})
onUnmounted(() => {
	sessionStorage.removeItem('undefined_row')// 修复分页存储
})
</script>

<style lang="css" scoped>
.sub-domain-table :deep(.el-table__expanded-cell) {
	@apply bg-light;
}
.hint-table {
	@apply leading-[3.2rem] mt-1rem;
	border: 1px solid var(--el-color-border-dark-tertiaryer);
}
.hint-table tr:hover {
	@apply bg-light cursor-pointer;
}
.hint-table tr th {
	@apply w-[12rem] px-2rem font-bold;
}
.hint-table tr td {
	@apply px-[.8rem];
}
.hint-table tr td,
.hint-table tr th {
	border-bottom: 1px solid var(--el-color-border-dark-tertiaryer);
}
:deep(.record-name-input .el-input-group__append) {
	@apply px-1rem;
}
:deep(.el-input-group__append) span {
	@apply truncate max-w-[9rem] block;
}
</style>

<style>
.sub-domain-table .el-table__body-wrapper tbody tr td:first-child .cell {
	display: none !important;
}
</style>
