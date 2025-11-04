<!--  -->
<template>
	<div class="p-2rem">
		<!-- 添加时展示表单 -->
		<!-- 非添加时展示详细信息 -->
		<div v-if="!isDetail && !props.compData.saveConfig">
			<BtForm v-if="isAdd" />
			<div v-else-if="isRestore" class="w-[80rem] mb-[1.2rem]">
				<el-descriptions class="margin-top table-descriptions" :title="`还原详情`" :column="2" size="small" border>
					<el-descriptions-item> <template #label> 名称 </template>{{ detailData.backup_name }} </el-descriptions-item>
					<el-descriptions-item> <template #label> 创建时间 </template>{{ detailData.create_time }} </el-descriptions-item>
					<el-descriptions-item> <template #label> 备份大小 </template>{{ getByteUnit(Number(detailData.backup_file_size)) }} </el-descriptions-item>
					<el-descriptions-item> <template #label>存储位置 </template>{{ detailData.backup_path }} </el-descriptions-item>
					<el-descriptions-item>
						<template #label>SHA-256 </template>
						<span :title="detailData.backup_file_sha256">{{ detailData.backup_file_sha256 }}</span>
					</el-descriptions-item>
				</el-descriptions>
			</div>
		</div>

		<div :class="`flex flex-row w-[${isRestore ? 80 : 70}rem]`">
			<span v-if="!isRestore && !isDetail" class="text-small text-secondary min-w-[8rem] text-right mr-[2rem]">备份数据</span>
			<el-collapse v-model="activeNames" class="flex-1" accordion>
				<!-- 网站 -->
				<el-collapse-item name="site" v-if="webList?.length || isAdd">
					<template #title>
						<div class="flex items-center">
							<el-checkbox v-if="isAdd" v-model="checkStatus.site" class="!mr-[0.4rem]" :indeterminate="indeterminateStatus.site" :disabled="typeLoading.site" @change="handleCheckAllChange($event, 'site')" @click.stop />
							<i class="svgtofont-left-home desc-i"></i>
							<span class="font-bold">网站</span>
							<el-popover trigger="hover" placement="top-start" width="400" content="备份网站是会自动备份Nginx配置，SSL证书，PHP配置，重定向和反向代理等除插件外与该网站相关的配置">
								<template #reference>
									<i class="svgtofont-el-question-filled text-warning text-base mx-[0.4rem]"></i>
								</template>
							</el-popover>
							<span v-if="!typeLoading.site" class="text-secondary text-small">(共{{ webList?.length || 0 }}个，共{{ webCount }})</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>
					<bt-table ref="siteTableRef" v-bt-loading="typeLoading.site" v-bt-loading:title="'正在获取网站中，请稍后...'" :column="siteTableColumn" :data="webList" :max-height="200" @selection-change="getCheckStatus('site')"></bt-table>
				</el-collapse-item>

				<!-- 数据库 -->
				<el-collapse-item name="database" v-if="dbList?.length || !isRestore">
					<template #title>
						<div class="flex items-center">
							<el-checkbox v-if="isAdd" v-model="checkStatus.database" class="!mr-[0.4rem]" :disabled="typeLoading.database" :indeterminate="indeterminateStatus.database" @change="handleCheckAllChange($event, 'database')" @click.stop />
							<i class="svgtofont-left-database desc-i"></i>
							<span class="font-bold">数据库</span>
							<!-- <el-popover trigger="hover" placement="top-start" width="400">
								<template #default>冷备份： 需要停机，影响业务连续性；避免备份过程中数据损坏。 <br />热备份：在数据库运行时进行备份；减少停机时间，适合生产环境。</template>
								<template #reference>
									<i class="svgtofont-el-question-filled text-warning text-base mx-[0.4rem]"></i>
								</template>
							</el-popover> -->

							<span v-if="!typeLoading.database" class="text-secondary text-small">(共{{ dbList?.length || 0 }}个，共{{ dbCount }})</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>
					<bt-table ref="dbTableRef" v-bt-loading="typeLoading.database" v-bt-loading:title="'正在获取数据库中，请稍后...'" :column="databaseColumn" :data="dbList" :max-height="200" @selection-change="getCheckStatus('database')"></bt-table>
				</el-collapse-item>

				<!-- wptools -->
				<el-collapse-item name="wptools" v-if="(wpList?.length || !isRestore) && !isDetail">
					<template #title>
						<div class="flex items-center">
							<el-checkbox v-if="isAdd" v-model="checkStatus.wptools" class="!mr-[0.4rem]" :disabled="typeLoading.wptools" @click.stop />
							<i class="svgtofont-left-wp desc-i"></i>
							<span class="font-bold">Wp Tools</span>
							<span v-if="!typeLoading.wptools" class="text-secondary text-small ml-[0.4rem]">(共{{ wpList?.length || 0 }}个，共{{ wpCount }})</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>

					<bt-table v-bt-loading="typeLoading.wptools" v-bt-loading:title="'正在获取网站中，请稍后...'" :column="wpToolsColumn" :data="wpList" :max-height="150"></bt-table>
				</el-collapse-item>

				<!-- 多机节点 -->
				<el-collapse-item name="node" v-if="nodeList?.length || !isRestore">
					<template #title>
						<div class="flex items-center">
							<el-checkbox v-if="isAdd" v-model="checkStatus.node" class="!mr-[0.4rem]" :disabled="typeLoading.node" @click.stop />
							<i class="svgtofont-left-node desc-i"></i>
							<span class="font-bold">多机节点</span>
							<span v-if="!typeLoading.node" class="text-secondary text-small ml-[0.4rem]">(共{{ nodeList?.length || 0 }}个)</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>

					<bt-table v-bt-loading="typeLoading.node" v-bt-loading:title="'正在获取多机节点中，请稍后...'" :column="nodeColumn" :data="nodeList" :max-height="150"></bt-table>
				</el-collapse-item>

				<!-- 动态渲染其他项目 -->
				<template v-for="(config, key) in otherItemsConfig" :key="key">
					<el-collapse-item :name="key.toLowerCase()" v-if="otherData[config.dataKey]?.length || !isRestore">
						<template #title>
							<div class="flex items-center">
								<el-checkbox v-if="isAdd" v-model="checkStatus[key]" class="!mr-[0.4rem]" :disabled="typeLoading[config.loadingKey.toLowerCase()]" @click.stop />
								<i :class="`svgtofont-left-${config.icon} desc-i`"></i>
								<span class="font-bold">{{ config.title }}</span>
								<el-popover v-if="config.tooltip" trigger="hover" placement="top-start" width="400" :content="config.tooltip">
									<template #reference>
										<i class="svgtofont-el-question-filled text-warning text-base ml-[0.4rem]"></i>
									</template>
								</el-popover>
								<span v-if="!typeLoading[config.loadingKey.toLowerCase()]" class="text-secondary text-small ml-[0.4rem]">(共{{ otherData[config.dataKey]?.length || 0 }}个{{ config.count ? '，共' + countData(config.dataKey) : '' }})</span>
								<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
								<template v-if="config.extraComponent">
									<component :is="config.extraComponent"></component>
								</template>
							</div>
						</template>

						<div v-bt-loading="typeLoading[config.loadingKey.toLowerCase()]" v-bt-loading:title="`正在获取${config.title}中，请稍后...`">
							<div class="w-full max-h-[96px] overflow-y-auto border-css" v-if="otherData[config.dataKey]?.length || isAdd">
								<template v-for="(item, index) in otherData[config.dataKey]" :key="index">
									<span class="w-[33.33%] inline-flex items-center px-[0.8rem] border-darker">
										<span class="check-name"> {{ item.name }}{{ item.size ? `(${getByteUnit(Number(item.size))})` : '' }} {{ item.total ? `(${item.total}条)` : '' }} </span>
									</span>
									<hr v-if="index + 1 !== 0 && (index + 1) % 3 === 0 && index + 1 !== otherData[config.dataKey].length" />
								</template>
							</div>
							<div class="empty-box" v-else>暂无数据</div>
						</div>
					</el-collapse-item>
				</template>

				<!-- 插件 -->
				<el-collapse-item name="plugin" v-if="pluginList?.length || !isRestore">
					<template #title>
						<div class="flex items-center">
							<el-checkbox v-if="isAdd" v-model="checkStatus.plugin" class="!mr-[0.4rem]" :disabled="typeLoading.plugin" @click.stop />
							<i class="svgtofont-left-soft desc-i"></i>
							<span class="font-bold">插件</span>
							<span v-if="!typeLoading.plugin" class="text-secondary text-small ml-[0.4rem]">(共{{ pluginList?.length || 0 }}个,共{{ pluginCount }})</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>
					<bt-table v-bt-loading="typeLoading.plugin" v-bt-loading:title="'正在获取插件中，请稍后...'" :column="pluginColumn" :data="pluginList" :max-height="160"></bt-table>
				</el-collapse-item>

				<!-- 运行环境 -->
				<el-collapse-item name="runtime" v-if="runtimeList?.length || !isRestore">
					<template #title>
						<div class="flex items-center">
							<el-checkbox v-if="isAdd" v-model="checkStatus.runtime" class="!mr-[0.4rem]" :disabled="typeLoading.runtime" @click.stop />
							<i class="svgtofont-el-monitor desc-i"></i>
							<span class="font-bold">运行环境</span>
							<span v-if="!typeLoading.runtime" class="text-secondary text-small ml-[0.4rem]">(共{{ runtimeList?.length || 0 }}个，共{{ runtimeCount }})</span>
							<i v-else class="svgtofont-el-loading text-secondary text-small animate-spin ml-[0.4rem]"></i>
						</div>
					</template>
					<bt-table v-bt-loading="typeLoading.runtime" v-bt-loading:title="'正在获取运行环境中，请稍后...'" :column="runtimeColumn" :data="runtimeList" :max-height="160"></bt-table>
				</el-collapse-item>
			</el-collapse>
		</div>

		<!-- 不在还原时进行显示 -->
		<div class="w-[80rem] mt-12px flex justify-end flex-col items-end" v-if="!isDetail">
			<el-checkbox v-model="auto_exit" class="!mr-0">出现失败后自动停止操作</el-checkbox>
			<el-checkbox v-if="isRestore" v-model="forceRestore">存在同名时是否覆盖还原</el-checkbox>
		</div>

		<div
			class="flex items-center"
			:class="{
				'mt-[2rem]': isRestore,
				'ml-[3rem]': true,
			}">
			<ul class="list-disc text-secondary">
				<li v-if="!isDetail" :class="{ 'text-dangerDark': backSizeData.size >= backSizeData.current }">
					<div class="flex items-center">
						<el-tooltip class="item" effect="dark" placement="top-start">
							<template #content>
								推断所需迁移空间:{{ getByteUnit(Number(isAdd ? backSize : backSizeData.size)) }} <br />
								说明:因数据备份需要复制后压缩，会比实际占用更多的空间，因此推断大小为迁移数据大小的1.5倍
							</template>
							<i class="svgtofont-el-warning-filled text-warning text-base mr-[0.4rem]"></i>
						</el-tooltip>
						预计需要空间：{{ getByteUnit(Number(isAdd ? backSize : backSizeData.size)) }} 当前磁盘剩余空间:{{ getByteUnit(Number(backSizeData.current)) }}
					</div>
				</li>
				<li v-if="isDetail">wp tools站点将在网站中显示</li>
			</ul>
			<i
				v-if="!isDetail"
				class="mt-2px ml-4px cursor-pointer"
				:class="{
					'animate-spin cursor-not-allowed svgtofont-el-loading text-secondary': refreshLoading,
					'svgtofont-el-refresh text-primary': !refreshLoading,
				}"
				@click="refreshBackSize(confirmBtn)"></i>
		</div>

		<p v-if="isRestore" class="text-dangerDark inline-block !mb-[2rem] !ml-[3rem]">提示：若遇到还原失败会自动恢复到还原前</p>
		<bt-help v-if="isAdd && !props.compData.saveConfig" :options="[{ content: '出现备份失败后自动停止备份,节点管理仅备份面板节点配置信息，备份wp_tools请在网站勾选wp站点' }]" class="ml-[3rem]"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useConfirm, useForm } from '@/hooks/tools'
import { FormInput, FormItemCustom, FormSelect } from '@/hooks/tools/form/form-item'
import {
	currentTime,
	onSubmitBack,
	orderOpt,
	refreshBackSize,
	webList,
	nodeList,
	backSizeData,
	dbList,
	forceRestore,
	getBackupInfo,
	refreshLoading,
	siteTableColumn,
	databaseColumn,
	pluginColumn,
	nodeColumn,
	runtimeColumn,
	wpToolsColumn,
	wpList,
	pluginList,
	runtimeList,
	isRestore,
	isAdd,
	isDetail,
	$reset,
	activeNames,
	typeLoading,
	otherItemsConfig,
	otherData,
	auto_exit,
	webCount,
	dbCount,
	wpCount,
	runtimeCount,
	countData,
	pluginCount,
} from './useMethod'
import { getByteUnit } from '@/utils'
import { detailData } from '../useMethod'

const confirmBtn = inject<any>('confirmBtn') //     弹窗切换底部按钮
const buttonText = inject<any>('buttonText') //     弹窗切换底部按钮
const popupClose = inject<any>('popupClose') //     弹窗关闭

interface Prop {
	data?: any
	compData?: any
}

const props = withDefaults(defineProps<Prop>(), {
	data: () => ({}),
	compData: () => ({}),
})

const siteTableRef = useTemplateRef('siteTableRef')
const dbTableRef = useTemplateRef('dbTableRef')

// 全选状态
const checkStatus = ref<any>({
	site: false,
	database: false,
	wptools: true,
	plugin: true,
	runtime: true,
	Ftp: true,
	Crontab: true,
	Vmail: true,
	Terminal: true,
	Firewall: true,
	node: true,
})

// 半选状态
const indeterminateStatus = reactive({
	site: false,
	database: false,
})

const backSize = computed<number>(() => {
	try {
		return (
			((checkStatus.value.plugin ? pluginList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0) : 0) +
				(checkStatus.value.database ? dbTableRef.value?.tableSelectList?.reduce((acc: number, item: any) => acc + Number(item.size), 0) : 0) +
				(checkStatus.value.site ? siteTableRef.value?.tableSelectList?.reduce((acc: number, item: any) => acc + Number(item.size), 0) : 0)) *
			1.5
		)
	} catch (error) {
		return 0
	}
})

// 表单实体
const { BtForm, submit } = useForm({
	data: () => {
		return {
			name: currentTime(),
			path: 'local',
			// select: false,
			exec_time: '',
		}
	},
	options: (formData: any) => {
		return computed(() => [
			FormInput('备份名称', 'name', {
				attrs: {
					class: '!w-[600px]',
					clearable: true,
					placeholder: '请输入用户名',
					rules: [{ required: true, message: '请输入备份名称', trigger: 'blur' }],
				},
			}),
			FormSelect('存储位置', 'path', orderOpt.value, {
				attrs: {
					class: '!w-[600px]',
					placeholder: '请选择存储位置',
					rules: [{ required: true, message: '请选择存储位置', trigger: 'change' }],
				},
			}),
			FormItemCustom(
				'执行时间',
				() => {
					return <el-date-picker disabled-date={(time: any) => time.getTime() < Date.now() - 8.64e7} class="!w-[600px]" v-model={formData.value.exec_time} type="datetime" placeholder="为空则立即执行" format="YYYY/MM/DD hh:mm:ss" value-format="x" />
				},
				'exec_time'
			),
		])
	},
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		const siteList = toRaw(siteTableRef.value?.tableSelectList || [])
		const dbList = toRaw(dbTableRef.value?.tableSelectList || [])
		if (!isRestore.value && !props.compData.saveConfig) await validate() // 校验表单
		if (props.compData && props.compData.saveConfig) {
			props.compData.saveConfig(param.value, checkStatus.value, siteList, dbList)
			popupClose()
			return
		}

		const restore_html = '<span class="text-secondary">还原将覆盖现有数据，是否继续操作？</span><br /><span class="text-dangerDark">在还原数据库备份时，网站将不可访问</span>'
		const backup_html = '<span class="text-dangerDark text-base">在备份时，对应网站将不可访问，是否继续操作？</span>'
		await useConfirm({
			title: '确认' + (isRestore.value ? '还原' : '备份'),
			content: isRestore.value ? restore_html : backup_html,
			type: 'calc',
			isHtml: true,
		})
		popupClose()
		return await onSubmitBack(param.value, checkStatus.value, siteList, dbList)
	},
})

// 监听备份大小, 如果备份大小小于当前磁盘剩余空间, 则禁用按钮
watchEffect(() => {
	if (isAdd.value) {
		if (backSize.value < backSizeData.current) {
			confirmBtn.disabled = false
			buttonText.value = props.compData?.saveConfig ? '保存' : '备份'
		} else if (backSize.value >= backSizeData.current) {
			confirmBtn.disabled = true
			if (backSize.value !== 0 || backSizeData.current !== 0) buttonText.value = '磁盘空间不足'
		}
		return
	}
	if (backSizeData.size < backSizeData.current) {
		confirmBtn.disabled = false
		buttonText.value = isRestore.value ? '还原' : props.compData?.saveConfig ? '保存' : '备份'
	} else if (backSizeData.size >= backSizeData.current) {
		confirmBtn.disabled = true
		if (backSizeData.size !== 0 || backSizeData.current !== 0) buttonText.value = '磁盘空间不足'
	}
})

/**
 * @description 全选/半选
 * @param key
 */
const handleCheckAllChange = (value: boolean, key: string) => {
	checkStatus.value[key] = value
	// 全选
	if (value) {
		switch (key) {
			case 'site':
				siteTableRef.value?.handleAllChange(value)
				indeterminateStatus.site = false
				break
			case 'database':
				dbTableRef.value?.handleAllChange(value)
				indeterminateStatus.database = false
		}
	} else {
		// 半选
		switch (key) {
			case 'site':
				siteTableRef.value?.clearAllSelect()
				indeterminateStatus.site = false
				break
			case 'database':
				dbTableRef.value?.clearAllSelect()
				indeterminateStatus.database = false
		}
	}
}

/**
 * @description 获取全选状态
 */
const getCheckStatus = (key: string) => {
	switch (key) {
		case 'site':
			if (webList.value.length === 0) {
				checkStatus.value.site = false
				indeterminateStatus.site = false
				return
			}
			const webCount = siteTableRef.value?.tableSelectNumber
			if (webCount === webList.value.length) {
				checkStatus.value.site = true
				indeterminateStatus.site = false
			} else if (webCount === 0) {
				checkStatus.value.site = false
				indeterminateStatus.site = false
			} else {
				checkStatus.value.site = false
				indeterminateStatus.site = true
			}
			break
		case 'database':
			if (dbList.value.length === 0) {
				checkStatus.value.database = false
				indeterminateStatus.database = false
				return
			}
			const dbCount = dbTableRef.value?.tableSelectNumber
			if (dbCount === dbList.value.length) {
				checkStatus.value.database = true
				indeterminateStatus.database = false
			} else if (dbCount === 0) {
				checkStatus.value.database = false
				indeterminateStatus.database = false
			} else {
				checkStatus.value.database = false
				indeterminateStatus.database = true
			}
			break
	}
}

onMounted(async () => {
	buttonText.value = '正在获取数据中...'
	confirmBtn.disabled = true
	backSizeData.size = 0
	backSizeData.current = 0
	// 获取存储位置
	await getBackupInfo(props.data || {})
	if (backSizeData.size < backSizeData.current) {
		confirmBtn.disabled = false
		buttonText.value = isRestore.value ? '还原' : props.compData?.saveConfig ? '保存' : '备份'
	} else {
		confirmBtn.disabled = true
		buttonText.value = isRestore.value ? '还原' : props.compData?.saveConfig ? '保存' : '备份'
	}
	if (isAdd.value) {
		if (webList.value.length > 0) {
			checkStatus.value.site = true
			siteTableRef.value?.handleAllChange(true)
		}
		if (dbList.value.length > 0) {
			checkStatus.value.database = true
			dbTableRef.value?.handleAllChange(true)
		}
	}
})

onUnmounted($reset)

defineExpose({
	onConfirm: submit,
	init: async () => {
		await getBackupInfo()
	},
})
</script>

<style lang="css" scoped>
:deep(.el-checkbox__label) {
	font-size: var(--el-font-size-small);
}

.check-name {
	@apply h-[3.6rem] leading-[3.6rem] text-center text-secondary text-small truncate;
}

.empty-box {
	@apply w-full flex items-center justify-center h-[4rem] text-tertiary border-1 border-lighter border-t-0;
}

.border-css {
	@apply border-1 border-lighter border-t-0;
}

:deep(.el-table th.el-table__cell) {
	background: rgba(var(--el-color-white-rgb), 1);
}

:deep(.el-descriptions__label) {
	min-width: 90px !important;
}

:deep(.el-collapse-item__header) {
	font-size: var(--el-font-size-small);
	border-top: 1px solid var(--el-color-border-dark-tertiaryer);
	border-left: 1px solid var(--el-color-border-dark-tertiaryer);
	border-right: 1px solid var(--el-color-border-dark-tertiaryer);
	height: 36px;
	background: rgba(var(--el-file-color-light-rgb), 0.8);
	padding: 0 8px;
}

:deep(.el-collapse-item) {
	margin-bottom: 10px;
}

:deep(.el-collapse) {
	@apply border-none;
}

:deep(.el-collapse-item__wrap) {
	@apply border-none;
}

.desc-i {
	@apply !text-medium mr-[0.4rem] text-primary;
}

hr {
	border-color: var(--el-color-border-dark);
}
</style>
