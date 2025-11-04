<template>
	<div class="p-[2rem] node-master-mysql-add-form">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools/form'
import { FormInput, FormSelect, FormCheckbox, FormRadio, FormItemCustom, FormHelp } from '@/hooks/tools/form/form-item'
import { useCheckbox } from '@/hooks/tools/table/column'
import { useAllTable } from '@/hooks/tools/table/index'
import { useMasterMysqlStore } from './useStore'
import { getDatabaseList, addMysqlSlave } from '@/api/node'
import { getByteUnit } from '@/utils'
import { ElRadioGroup, ElRadio, ElCheckboxGroup, ElCheckbox } from 'element-plus'
import { openStepHandler } from './useController'
import { Message } from '@/hooks/tools'
import { useDialog, useConfirm } from '@/hooks/tools'
import BtTableGroup from '@/components/extension/bt-table-group'

const { mysqlRowData, isRefreshList } = useMasterMysqlStore()

// 表单数据类型定义
interface MysqlFormData {
	node_id: string // 从库节点
	master_ip: string // 主库IP地址
	slave_ip: string // 从库IP地址
	err_code: string[] // 跳过1062错误
	sync_type: string // 首次同步方式
	db_name: string // 数据库名称
}

interface Props {
	compData: { panel_address: string }
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => ({ panel_address: '' }),
})

// 首次同步方式选项
const syncTypeOptions = [
	{
		label: '面板自动同步',
		value: 'auto',
		desc: '通过主库面板连接从库面板进行导入导出数据，简单快捷，建议内网机器使用',
	},
	{
		label: '手动同步到从库',
		value: 'manual',
		desc: '通过主库面板备份，手动将备份文件上传至从库导入后进行数据还原后同步，大于1G数据建议使用此方法同步',
	},
]

const initData = ref<MysqlFormData>({
	node_id: '',
	master_ip: props?.compData?.panel_address || '',
	slave_ip: '',
	err_code: ['1062'],
	sync_type: 'auto',
	db_name: '',
})

/**
 * @description 端口表格
 * @returns {App}
 */
const useDatabaseTable = (): any => {
	const { BtTable, BtPage, BtSearch } = useAllTable({
		request: async (params: any) => {
			params.limit = 50
			const { data } = await getDatabaseList(params)
			data.data[0].keys_scopes_status = true
			console.log('request', data.data[0])
			return { data: data.data, total: data.page.total_count }
		},
		columns: [
			useCheckbox({ key: 'id' }),
			{
				label: '数据库名称',
				prop: 'name',
			},
			{
				label: '数据库大小',
				prop: 'size',
				render: (row: any) => {
					return <span>{getByteUnit(row.size)}</span>
				},
			},
			{
				label: '数据库引擎',
				prop: 'type',
			},
		],
	})

	return FormItemCustom(
		'同步数据库',
		() => {
			return (
				<div class="w-[94.2%]">
					<BtTableGroup>
						{{
							'header-right': () => {
								return <BtSearch placeholder="请输入数据库名称" class="!w-[20rem]" />
							},
							content: () => {
								return (
									<BtTable
										height="200px"
										onSelectionChange={async (selection: any[]) => {
											try {
												param.value.db_name = selection.map((item: any) => item.name).join(',')
												param.value.db_type = selection.map((item: any) => item.type).join(',')
												await validate()
											} catch (error) {
												console.log(error)
											}
										}}
									/>
								)
							},
							'footer-right': () => {
								return <BtPage layout="prev, pager, next, total, jumper" page-size={50} />
							},
						}}
					</BtTableGroup>
				</div>
			)
		},
		'db_name',
		{
			class: 'node-master-mysql-db-table',
			rules: [{ required: true, message: '请选择要同步的数据库', trigger: 'change' }],
		}
	)
}
// 表单配置
const { BtForm, validate, param, submit } = useForm({
	// 初始数据
	data: initData.value,
	// 表单项配置
	options: [
		FormSelect('选择从库节点', 'node_id', mysqlRowData.value, {
			attrs: {
				placeholder: '请选择从库节点',
				class: '!w-[45rem]',
				onChange: (val: any) => {
					param.value.slave_ip = mysqlRowData.value.find((item: any) => item.value === val)?.remarks || ''
				},
			},
			rules: [{ required: true, message: '请选择从库节点', trigger: 'change' }],
		}),

		FormInput('主库IP地址', 'master_ip', {
			attrs: {
				placeholder: '请输入主库IP地址，如：192.168.1.100',
				class: '!w-[45rem]',
			},
			rules: [
				{ required: true, message: '请输入主库IP地址', trigger: ['blur', 'change'] },
				{
					pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
					message: '请输入正确的IP地址格式',
					trigger: ['blur', 'change'],
				},
			],
		}),

		FormInput('从库IP地址', 'slave_ip', {
			attrs: {
				placeholder: '请输入从库IP地址，如：192.168.1.101',
				class: '!w-[45rem]',
			},
			rules: [
				{ required: true, message: '请输入从库IP地址', trigger: ['blur', 'change'] },
				{
					pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
					message: '请输入正确的IP地址格式',
					trigger: ['blur', 'change'],
				},
			],
		}),
		FormItemCustom(
			' ',
			() => (
				<ElCheckboxGroup v-model={param.value.err_code} class="mb-[1.2rem]">
					<ElCheckbox value="1062" key="1062">
						<span>跳过1062错误</span>
						<div class="err_code_desc">跳过主键或唯一键冲突错误</div>
					</ElCheckbox>
				</ElCheckboxGroup>
			),
			'err_code'
		),
		useDatabaseTable(),
		FormHelp(' ', [
			{
				content: '添加后仅同步选中的数据库数据，如需新增数据库需删除主从重新配置',
			},
		]),
    FormItemCustom('首次同步方式', () => (
      <ElRadioGroup v-model={param.value.sync_type}>
        {syncTypeOptions.map(opt => (
          <ElRadio class={`mt-[1rem]`} value={opt.value} key={opt.value} style={{height: 'auto', lineHeight: '1', alignItems: 'flex-start'}}>
            <span class="radio-label">{opt.label}</span>
            <div class="radio-desc mt-[1rem] mb-[1rem] w-[43rem]" style={{whiteSpace: 'normal', lineHeight: '1.5'}}>{opt.desc}</div>
          </ElRadio>
        ))}
      </ElRadioGroup>
		), 'sync_type'),
	FormHelp('', [
		{
			content: '仅支持mysql-5.7+版本（不支持mariadb）',
		},
		{
			content: '只支持通过app/或api添加的节点',
		}
	])
  ],
  
  // 提交处理
	submit: async (param: any, validate: any, ref: Ref<any>) => {
		try {
			await validate()
			await useConfirm({
				icon: 'warning-filled',
				title: `提示`,
				content: `首次配置将会重启数据库，如从库有同名数据库将会进行数据覆盖，建议空闲时间配置，是否继续？`,
			})
		} catch (error) {
			console.log(error)
			return false
		}
		if (param.value.db_type.includes('MyISAM')) {
			try {
				await new Promise((resolve, reject) => {
					useDialog({
						title: 'MyISAM 引擎警告',
						area: 50,
						showFooter: true,
						component: () => (
							<div class="p-[2rem] text-base">
								<div style="color:var(--el-color-danger-dark-2);margin-bottom:8px;font-size: var(--el-font-size-base);">检测到选中的数据库包含 MyISAM 存储引擎的表，可能存在以下风险：</div>
								<ul style="margin-bottom:16px;list-style: disc;padding-left: 2rem;">
									<li>数据不一致：MyISAM 不支持事务，同步过程中可能出现数据不完整</li>
									<li>主从中断：表级锁定机制在高并发时内容易导致同步失败</li>
									<li>错误频发：需要设置错误跳过机制才能正常运行</li>
								</ul>
								<div style="margin-bottom:2rem">
									<div style="margin-bottom:1rem">建议方案：</div>
									<div style="color:var(--el-color-primary); font-size: var(--el-font-size-base);margin-bottom:1rem">【推荐】转换为 InnoDB: ALTER TABLE table_name ENGINE=InnoDB</div>
									<div style="color:var(--el-base-supplement); font-size: var(--el-font-size-base);">【备选】继续使用并设置错误跳过码（如: 1062）</div>
								</div>
								<div>确定要继续选择这些数据库吗？</div>
							</div>
						),
						confirmText: '继续添加',
						cancelText: '取消',
						onConfirm: () => {
							resolve(true)
							return true
						},
						onCancel: () => {
							reject()
							return false
						},
					})
				})
			} catch {
				return false
			}
		}
		const loading = Message.load('正在添加主从，请稍后...')
		try {
			const result = await addMysqlSlave(param.value)
			if (result.status) {
				Message.success('创建成功')
				openStepHandler(param.value.slave_ip)
				return true
			} else {
				Message.error(result.msg)
				return false
			}
		} catch (error) {
			console.error('提交失败:', error)
			Message.error('创建失败，请重试')
			return false
		} finally {
			isRefreshList.value = true
			loading.close()
		}
	},
})
// 暴露方法给父组件
defineExpose({
	validate,
	onConfirm: submit,
	formData: param,
})
</script>

<style scoped lang="scss">
.node-master-mysql-add-form {
	:deep(.err_code_desc) {
		font-size: var(--el-font-size-small);
		color: var(--el-base-tertiary);
		position: absolute;
		left: 0;
		bottom: -8px;
	}
	:deep(.el-form-item.is-error .el-input__wrapper) {
		box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
	}
	:deep(.el-pagination) {
		font-size: var(--el-font-size-small);
		.el-pager .number,
		.btn-prev,
		.btn-next {
			font-weight: normal;
			min-width: 2.6rem;
			height: 2.6rem;
		}
	}
	:deep(.el-table td.el-table__cell div),
	:deep(.el-table__header .cell) {
		display: flex;
	}
}
:deep(.node-master-mysql-db-table) {
	.el-table__inner-wrapper {
		border-bottom: 1px solid var(--el-color-border-dark);
	}
}
:deep(.node-master-mysql-db-table .el-form-item__content .el-form-item__error) {
	left: 19px !important;
}
</style>
