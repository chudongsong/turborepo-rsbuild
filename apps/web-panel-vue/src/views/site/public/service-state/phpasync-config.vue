<template>
	<div class="relative -left-[3rem]">
		<el-divider></el-divider>
		<BtForm label-width="80px" />
		<ul class="text-[#777] mt-[2px] leading-[2rem] text-small list-disc" style="padding-left: 4rem">
			<li v-if="rowData?.Listen?.length">
				可以通过
				<template v-for="(item, index) in rowData?.Listen" :key="index">
					<bt-link :href="`http://${item?.join(':')}}`">{{ item?.join(':') }}</bt-link>
					<span v-if="index !== rowData?.Listen.length - 1">、</span>
				</template>
				访问此服务（需放行使用到的端口，<bt-link @click="releasePort">一键放行</bt-link>）
			</li>
			<li>可以通过设置 <bt-link @click="jumpTabEvent('proxy')">反向代理</bt-link> 后通过域名访问</li>
		</ul>
		<bt-dialog title="一键放行端口" v-model="releasePortPopup" :area="42" @confirm="releasePort" showFooter>
			<div class="p-[20px]">
				<div class="leading-[2rem] mb-1rem">请选中需要放行的端口进行放行：</div>
				<el-table ref="releasePortRef" class="param-table" :data="rowData?.Listen" tooltip-effect="dark" style="width: 100%" :max-height="280">
					<el-table-column type="selection" width="36"> </el-table-column>
					<el-table-column label="端口">
						<template #default="scope">{{ scope.row[1] }}</template>
					</el-table-column>
					<el-table-column label="监听地址">
						<template #default="scope">{{ scope.row[0] }}</template>
					</el-table-column>
				</el-table>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import BtFormItem from '@/components/form/bt-form-item'
import { FormInputPath } from '@/hooks/tools/form/form-item'
import BtSelect from '@/components/form/bt-select'
import { rowData, fileOptions, versionOptions, systemUserOptions, releasePortPopup, openPathDialog, releasePort, submitAsyncConfig, initAsyncService } from './useController'
import { SITE_STORE } from '@site/useStore'
import { ElButton, ElCheckbox } from 'element-plus'
import { defaultVerify } from '@/utils'

const { jumpTabEvent } = SITE_STORE()

const { BtForm, submit } = useForm({
	data: async () => {
		await initAsyncService()
		return rowData.value || {}
	},
	options: (formData: any) => {
		return computed(() => [
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="pid">
						<div class="flex items-center">
							<span>{formData.value.pid}</span>
							<template v-show={formData.value?.Listen?.length}>
								<el-form-item label="端口">
									<span class="truncate block max-w-[30rem]" title={formData.value.allPort}>
										{formData.value.allPort}
									</span>
								</el-form-item>
								<span class="bt-link ml-1rem" onClick={releasePort}>
									一键放行
								</span>
							</template>
						</div>
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="开机启动">
						<ElCheckbox v-model={formData.value.is_power_on}></ElCheckbox>
					</BtFormItem>
				),
			},
			{
				type: 'input',
				label: '启动命令',
				key: 'project_cmd',
				attrs: {
					placeholder: '请输入启动命令，例：php server.php',
					width: '34rem',
				},
				rules: [defaultVerify({ message: '请输入项目执行命令' })],
			},
			FormInputPath(
				'根目录',
				'project_path',
				{
					attrs: {
						width: '34rem',
						placeholder: '请输入项目目录',
					},
				},
				() => {
					openPathDialog(formData.value.project_path, 'project_path')
				}
			),
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="运行目录">
						<BtSelect v-model={formData.value.site_run_path} options={fileOptions.value} class="mr-[12px]" style="width: 34rem;" />
						<span class="text-tertiary text-small ml-[.4rem]"> * 前端文件的运行目录 </span>
					</BtFormItem>
				),
			},
			{
				type: 'select',
				label: 'PHP版本',
				key: 'php_version',
				options: versionOptions.value,
				attrs: {
					class: '!w-[16rem]',
				},
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label="运行用户">
						<BtSelect v-model={formData.value.run_user} options={systemUserOptions.value} class="mr-[12px]" style="width: 16rem;" />
						<span class="text-tertiary text-small ml-[.4rem]"> * 无特殊需求请选择www用户 </span>
					</BtFormItem>
				),
			},
			{
				type: 'custom',
				render: () => (
					<BtFormItem label=" ">
						<ElButton type="primary" onClick={submit}>
							保存
						</ElButton>
					</BtFormItem>
				),
			},
		])
	},
	submit: submitAsyncConfig,
})
</script>
