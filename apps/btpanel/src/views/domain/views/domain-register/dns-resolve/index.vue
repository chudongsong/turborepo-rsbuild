<template>
	<div class="p-2rem">
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="() => addSubDomain(state)" :disabled="isDisabledAdd">添加</el-button>
				<el-alert v-if="compData.row?.dns?.dns_name === 'WestDns'" type="warning" class="h-[100%] !ml-[1rem]" :closable="false" show-icon>
					<template #title>
						<span class="text-base">
							<span> 提示：WestDns 西部数码不支持修改解析记录的主机记录和记录类型</span>
						</span>
					</template>
				</el-alert>
			</template>
			<template #header-right>
				<bt-input-search v-model="requestData.searchValue" placeholder="请输入主机记录" @search="() => getSubDomainListData(state, props)" class="!mr-[.8rem] !w-[23rem]"></bt-input-search>
				<bt-table-refresh @refresh="() => getSubDomainListData(state, props)" class="!mr-[.8rem]"></bt-table-refresh>
			</template>
			<template #content>
				<el-table class="w-full sub-domain-table" :data="subDomainTableList" v-bt-loading="isSubDomainLoading" v-bt-loading:title="'正在加载DNS记录列表，请稍后...'" row-key="RecordId" :expand-row-keys="expandRowKeys" :max-height="550">
					<template #empty>
						<span class="text-secondary">您的DNS记录列表为空</span>
					</template>
					<el-table-column type="expand" width="1" min-width="1">
						<template v-if="isUpdate">
							<div class="p-1rem pt-0">
								<div class="pl-[.8rem] text-secondary leading-[2.4rem]">
									<div class="font-bold">{{ getValueHintDescription()?.title || '' }}</div>
									<div v-if="getValueHintDescription()?.description">
										{{ getValueHintDescription()?.description }}
									</div>
								</div>
								
								<!-- 通用提示表格 -->
								<table v-if="getHintItems().length > 0" class="w-full hint-table">
									<tbody>
										<tr 
											v-for="item in getHintItems()" 
											:key="item.key"
											:class="{ 'cursor-pointer': item.clickable }"
											@click="item.clickable ? changeRowEvent(item.value, currentHint) : null"
										>
											<th>{{ item.label }}</th>
											<td class="text-secondary">{{ item.description }}</td>
										</tr>
									</tbody>
								</table>
								
								<div v-else class="text-gray-500 pl-[.8rem]"></div>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="主机记录" prop="name">
						<template #default="{ row, $index }">
							<bt-input
								class="record-name-input !w-full"
								v-if="isUpdate && $index == 0"
								:disabled="compData.row?.dns?.dns_name === 'WestDns' && !isAdd"
								v-model="row.name"
								type="text"
								size="small"
								placeholder="@ / www / mail / *"
								@focus="() => changeCurrentNameEvent('name', state)">
							</bt-input>
							<span v-else>{{ row.name }}</span>
						</template>
					</el-table-column>
					<el-table-column label="记录类型" prop="type" width="100">
						<template #default="{ row, $index }">
							<el-select @click="() => changeCurrentNameEvent('type', state)" size="small" v-if="isUpdate && $index == 0" :disabled="compData.row?.dns?.dns_name === 'WestDns' && !isAdd" v-model="row.type" class="!w-full" placeholder="请选择" @change="onTypeChange($event, row)">
								<el-option v-for="item in typeOptions" :key="item.key" :label="item.title" :value="item.key"> </el-option>
							</el-select>
							<span v-else>{{ row.type }}</span>
						</template>
					</el-table-column>
					<el-table-column label="线路类型" prop="line_type" width="120">
						<template #default="{ row, $index }">
							<!-- <el-select
								v-if="isUpdate && $index == 0"
								v-model="row.line_type"
								placeholder="选择线路"
								size="small"
								class="!w-full"
								@focus="() => changeCurrentNameEvent('line_type', state)"
								@change="onLineTypeChange($event, row)"
							>
								<el-option
									v-for="option in lineTypeOptions"
									:key="option.value"
									:label="option.label"
									:value="option.value"
								>
									<div>
										<div>{{ option.label }}</div>
										<div style="font-size: 12px; color: #999;">{{ option.description }}</div>
									</div>
								</el-option>
							</el-select> -->
							<span v-if="isUpdate && $index == 0">默认</span>
							<span v-else>{{ getLineTypeLabel(row.line_type) }}</span>
						</template>
					</el-table-column>
					<el-table-column label="记录值" prop="value">
						<template #default="{ row, $index }">
							<bt-input v-if="isUpdate && $index == 0" v-model="row.value" type="text" placeholder="必填" size="small" @focus="() => changeCurrentNameEvent('value', state)"></bt-input>
							<span v-else>{{ row.value }}</span>
						</template>
					</el-table-column>
					<el-table-column label="MX/权重" prop="priority" width="100">
						<template #default="{ row, $index }">
							<bt-input v-if="isUpdate && $index == 0" v-model="row.priority" type="text" placeholder="1" size="small" @focus="() => changeCurrentNameEvent('priority', state)"></bt-input>
							<span v-else>{{ row.priority || 1 }}</span>
						</template>
					</el-table-column>
					<el-table-column label="TTL" prop="ttl" width="100">
						<template #default="{ row, $index }">
                            <bt-input v-if="isUpdate && $index == 0" v-model="row.ttl" type="text" size="small" @focus="() => changeCurrentNameEvent('ttl', state)"></bt-input>
							<span v-else>{{ row.ttl }}</span>
						</template>
					</el-table-column>
					<el-table-column label="状态" prop="status" width="80">
						<template #default="{ row, $index }">
                            <div v-if="isUpdate && $index == 0"> - </div>
							<btTableStatus 
								v-else
								:data="['暂停', '启用']" 
								:modelValue="row.status === '启用' ? true : false" 
								@click="() => onStatusChange(row, state, props)" 
							/>
						</template>
					</el-table-column>
					<el-table-column label="备注" prop="remark" width="120">
						<template #default="{ row, $index }">
							<bt-input v-if="isUpdate && $index == 0" :disabled="compData.row?.dns?.dns_name === 'WestDns'" v-model="row.remark" type="text" size="small" placeholder="请输入备注" @focus="() => changeCurrentNameEvent('remark', state)" />
							<span v-else>{{ row.remark }}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="140" align="right">
						<template #default="{ row, $index }">
							<template v-if="isUpdate && $index == 0">
								<div class="flex">
									<el-button type="primary" @click="() => onSaveEvent(row, state, props)">保存</el-button>
									<el-button type="default" @click="() => onCancelEvent(row, $index, state)">取消</el-button>
								</div>
							</template>
							<template v-else>
								<span class="bt-link cursor-pointer" @click="() => onUpdateEvent(row, $index, state, props)">修改</span>
								<BtDivider />
								<span class="bt-link cursor-pointer" @click="() => onDel(row, state, props)">删除</span>
							</template>
						</template>
					</el-table-column>
				</el-table>
			</template>
			<template #footer-right>
				<el-pagination
					v-model:current-page="requestData.p"
					v-model:page-size="requestData.limit"
					:total="requestData.total"
					:page-sizes="[10, 20, 50, 100]"
					layout="total, sizes, prev, pager, next, jumper"
					@size-change="() => getSubDomainListData(state, props)"
					@current-change="() => getSubDomainListData(state, props)"
				/>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import btTableStatus from '@/components/extension/bt-table-status'
import { 
	fetchOptionsData, 
	getSubDomainListData,
	changeCurrentNameEvent,
	onTypeChange,
	onLineTypeChange,
	getLineTypeLabel,
	onCancelEvent,
	onSaveEvent,
	onUpdateEvent,
	addSubDomain,
	onDel,
	onStatusChange,
	changeRowEvent,
	getHintItems,
	getValueHintDescription
} from './useController'
import { useDnsResolveStore } from './useStore'

// 从store获取状态
const {
	isSubDomainLoading,
	subDomainTableList,
	tableList,
	expandRowKeys,
	isUpdate,
	isAdd,
	isDisabledAdd,
	currentHint,
	requestData,
	securityToken,
	typeOptions,
	lineTypeOptions,
} = useDnsResolveStore()

const state = {
	isUpdate,
	isAdd,
	expandRowKeys,
	isSubDomainLoading,
	subDomainTableList,
	tableList,
	isDisabledAdd,
	requestData,
	currentHint
}

const props = defineProps({
	compData: {
		type: Object,
		default: () => {},
	},
})

onMounted(async () => {
	isSubDomainLoading.value = true
	await fetchOptionsData()
	if (props.compData?.domainId) {
		requestData.value.domain_id = props.compData.domainId
		await getSubDomainListData({ isUpdate, isAdd, expandRowKeys, isSubDomainLoading, subDomainTableList, tableList, isDisabledAdd, requestData }, props)
	}
})

onUnmounted(() => {
	securityToken.value = ''
	isUpdate.value = false
	subDomainTableList.value = []
	currentHint.value = 'name'
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
	@apply bg-light;
}
.hint-table tr th {
	@apply minw-[12rem] px-2rem font-bold;
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
.sub-domain-table :deep(.el-input--small input.el-input__inner) {
	height: 3rem;
	line-height: 3rem;
}
</style>

<style>
.sub-domain-table .el-table__body-wrapper tbody tr td:first-child .cell {
	display: none !important;
}
</style>
