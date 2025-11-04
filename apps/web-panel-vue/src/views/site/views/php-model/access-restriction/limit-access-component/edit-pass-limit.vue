<!--  -->
<template>
	<div class="p-[20px]">
		<el-form ref="passwordSiteForm" :rules="passRules" :model="passForm" :disabled="formDisabled">
			<div class="flex items-center">
				<el-form-item label="加密路径" prop="site_dir">
					<bt-input :disabled="!!compData.name" v-model="passForm.site_dir" placeholder="输入需要加密访问的目录，如：/text/" width="13rem"></bt-input>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<bt-input v-model="passForm.name" :disabled="!!compData.name" width="13rem"></bt-input>
				</el-form-item>
			</div>

			<el-divider border-style="dashed" class="!mt-0"></el-divider>

			<el-form-item label="新用户" prop="username">
				<bt-input v-model="passForm.username" placeholder="请输入大于三位的用户名" width="26rem"></bt-input>
				<el-button type="primary" @click="setUser('add')" class="ml-[8px]"> 添加 </el-button>
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<bt-input v-model="passForm.password" type="password" placeholder="请输入大于三位的密码" width="26rem"></bt-input>
			</el-form-item>

			<el-divider border-style="dashed"></el-divider>

			<el-form-item label="已有用户" prop="password">
				<BtTable class="!w-[85%]"></BtTable>
			</el-form-item>

			<ul class="ml-6 mt-8 list-disc leading-10">
				<li class="text-secondary">目录设置加密访问后，会导致目录及子目录下的“反向代理”失效</li>
				<li class="text-secondary">目录设置加密访问后，访问时需要输入账号密码才能访问</li>
				<li class="text-secondary">例如我设置了加密访问 /test/ ,那我访问 http://aaa.com/test/ 时就要输入账号密码才能访问</li>
			</ul>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useAllTable, useConfirm } from '@/hooks/tools'
import { useDataHandle } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { setPassUserApi } from '@api/site'
interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const emits = defineEmits(['close'])

const passForm = reactive({
	site_dir: props.compData.site_dir || '',
	name: props.compData.name || '',
	username: props.compData.username || '',
	password: props.compData.password || '',
})
const formDisabled = ref<boolean>(false) // 表单是否禁用
const passwordSiteForm = ref<any>() // 表单实例

const passRules = reactive({
	username: [
		// 用户名必填，且大于三位
		{ required: true, message: '请输入用户名', trigger: 'blur' },
		{ min: 3, message: '用户名必须大于三位', trigger: 'blur' },
	],
	password: [
		{ required: true, message: '请输入密码', trigger: 'blur' },
		{ min: 3, message: '密码必须大于三位', trigger: 'blur' },
	],
})

const { BtTable, config } = useAllTable({
	request: () => {
		const list = props.compData.user_list.map((item: any) => ({ user: item })) || []
		return { data: list, total: list.length }
	},
	columns: [{ prop: 'user', label: '用户' }, useOperate([{ title: '删除', onClick: (row: any) => setUser('remove', row) }])],
})

/**
 * @description 设置用户
 * @param {string} option 操作类型
 * @param {any} row 行数据
 **/
const setUser = async (option: string, row?: any) => {
	const options: any = { add: '添加', remove: '删除' } // 操作类型
	const isExist = config.data.some((item: any) => item.user === passForm.username) // 是否存在同名用户

	// 当为添加时，切列表中有同名用户时，提示
	if (isExist && option === 'add') {
		await useConfirm({
			title: '提示',
			content: '用户已存在，继续添加会覆盖同名用户配置，是否继续？',
		})
	}

	// 当为删除时，且列表中只有一条数据时，提示
	if (config.data.length === 1 && option === 'remove') {
		await useConfirm({
			title: '提示',
			content: `确认删除用户【${config.data[0].user}】？此为当前唯一用户，删除后该加密规则将一起被删除，是否继续？`,
		})
	}

	let params = {
		id: props.compData.id,
		...passForm,
		username: row ? row.user : passForm.username,
		option,
	}
	delete params.site_dir

	useDataHandle({
		loading: `正在${options[option]}，请稍后...`,
		request: setPassUserApi(params),
		message: true,
		success: (res: any) => {
			if (res.status) {
				if (option === 'add') {
					!isExist && config.data.push({ user: passForm.username })
					passForm.username = ''
					passForm.password = ''
				} else {
					config.data = config.data.filter((item: any) => item.user !== row.user)
					//若无数据 关闭弹窗
					if (config.data.length === 0) emits('close')
				}
				props.compData.refresh()
			}
		},
	})
}
</script>

<style scoped lang="css">
:deep(.el-table .el-table__header th) {
	height: 3.2rem !important;
	padding: 0 !important;
}

:deep(.el-table .el-table__body td) {
	height: 3.2rem !important;
	padding: 0 !important;
}
</style>
