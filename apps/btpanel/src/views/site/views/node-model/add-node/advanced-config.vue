<template>
	<BtForm class="mt-2rem" v-bind="$attrs">
		<template #custom>
			<el-form-item label="运行用户" prop="run_user">
				<div class="flex items-center">
					<el-select v-model="formData.run_user" class="mr-8px !w-[16rem]">
						<el-option v-for="(item, index) in nodeData.user_list" :key="index" :label="item" :value="item"></el-option>
					</el-select>
					<span class="text-small text-secondary">* 无特殊需求请选择www用户</span>
				</div>
			</el-form-item>

			<el-form-item label="项目端口">
				<div class="flex items-center">
					<bt-input width="20rem" type="number" class="mr-12px !w-[20rem]" :min="1" :max="65535" v-model="formData.port" placeholder="请输入项目的真实端口"></bt-input>
					<template v-if="!isEdit">
						<span v-if="formData.port === ''" class="text-small ml-[0.8rem] text-tertiary">* 若不清楚端口可不填写</span>
						<el-checkbox v-else v-model="formData.release_firewall">
							放行端口
							<el-tooltip class="item" effect="dark" content="选中将在防火墙安全组放行监听端口，放行后该项目可在外网访问" placement="right">
								<i class="svgtofont-el-question text-warning"></i>
							</el-tooltip>
						</el-checkbox>
					</template>
				</div>
				<span class="text-danger text-small" v-if="isEdit && props.rowData?.listen?.length && !props.rowData?.listen?.includes(formData.port)">
					项目端口可能有误，检测到当前项目监听了以下端口[
					{{ props.rowData?.listen?.join(',') }} ]</span
				>
			</el-form-item>

			<!-- 备注 -->
			<el-form-item label="项目备注">
				<bt-input v-model="formData.project_ps" placeholder="请输入项目备注" width="24rem"></bt-input>
			</el-form-item>

			<!-- 绑定域名 -->
			<el-form-item label="绑定域名" v-if="!isEdit">
				<el-popover ref="popover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="400" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
					<div class="!p-[12px] bg-primary text-white">
						如需填写多个域名，请换行填写，每行一个域名，默认为80端口<br />
						IP地址格式：192.168.1.199<br />
						泛解析添加方法 *.domain.com<br />
						如另加端口格式为 www.domain.com:88
					</div>
					<template #reference>
						<bt-input :rows="6" resize="none" width="40rem" v-model="formData.domains" @focus="popoverFocus = true" type="textarea" :placeholder="'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'" />
					</template>
				</el-popover>
			</el-form-item>
		</template>
	</BtForm>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'

interface Props {
	ps?: string
	rowData?: any
}

const props = defineProps<Props>()
const popover = ref() // 弹窗ref
const isEdit = ref(props.rowData?.project_name || false) // 是否编辑
const popoverFocus = ref(false) // 域名提示框显示状态
const nodeData = inject<any>('nodeData', {
	user_list: [], // 运行用户
}) // 配置信息

const { BtForm, param: formData } = useForm({
	data: () => {
		const isUser = nodeData.value?.user_list?.length && nodeData.value.user_list?.findIndex((item: string) => item === 'www') === -1
		return {
			run_user: !isEdit.value ? (isUser ? nodeData.value.user_list[0] : 'www') : props.rowData?.run_user || '', // 运行用户

			port: props.rowData?.port || '', // 项目端口
			release_firewall: false, // 放行端口

			project_ps: props?.ps || '', // 备注
			domains: '', // 绑定域名
		}
	},
	options: () =>
		computed(() => [
			{
				type: 'slots',
				key: 'custom',
				rules: {
					run_user: [{ required: true, message: '请选择运行用户', trigger: 'change' }],
				},
			},
		]),
})

watch(
	() => props.ps,
	val => {
		formData.value.project_ps = val || ''
	},
	{ immediate: true }
)

defineExpose({
	formData,
	popover,
})
</script>
