<!-- 创建应用环境包中使用 -->
<template>
	<div class="p-[20px]">
		<el-descriptions :column="3" border class="table-descriptions">
			<el-descriptions-item v-for="des in descriptionsList" :key="des.key" :label="des.label">
				{{ packageData.app_name ? getMsg(des.key) : '正在获取中...' }}
				<span v-if="tipsShow[des.key]">
					<el-tooltip effect="dark" :content="des.text" placement="top">
						<span class="svgtofont-el-warning text-warningDark text-medium"></span>
					</el-tooltip>
				</span>
			</el-descriptions-item>
			<el-descriptions-item label="更新日志">
				<el-tooltip effect="dark" :content="packageData.update_log || '无'" placement="top">
					<div class="truncate w-[25rem]">
						{{ packageData.update_log || '无' }}
					</div>
				</el-tooltip>
			</el-descriptions-item>
		</el-descriptions>
		<!-- <pre
			class="text-secondary max-h-[20rem] overflow-y-auto border-lighter border rounded-base p-[1.6rem]"
			>{}</pre
		> -->
		<el-form ref="packFormRef" class="mt-[1.6rem]" :model="packForm" :disabled="formDisabled" :rules="rules" label-width="50px">
			<el-form-item label="域名" prop="domain">
				<el-popover ref="popover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="400" v-model:visible="popoverFocus" :trigger-keys="[]" trigger="focus">
					<div class="!p-[12px] bg-primary text-white">
						如需填写多个域名，请换行填写，每行一个域名，默认为80端口
						<br />
						IP地址格式：192.168.1.199
						<br />
						泛解析添加方法 *.domain.com
						<br />
						如另加端口格式为 www.domain.com:88
					</div>
					<template #reference>
						<bt-input
							@input="handleInputName"
							v-model="packForm.domain"
							type="textarea"
							width="52rem"
							v-popover:popover
							:rows="7"
							resize="none"
							@focus="popoverFocus = true"
							:placeholder="'如需填写多个域名，请换行填写，每行一个域名，默认为80端口\nIP地址格式：192.168.1.199\n泛解析添加方法 *.domain.com\n如另加端口格式为 www.domain.com:88'" />
					</template>
				</el-popover>
			</el-form-item>
			<el-form-item label="备注">
				<bt-input v-model="packForm.ps" width="52rem"></bt-input>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { useHandleError } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import { createPhpAppSite, getPhpAppUpload } from '@api/site'
import { useSiteStore } from '@site/useStore'
interface Props {
	compData?: any
	isConfig?: boolean
	formData?: any
}
const emit = defineEmits(['update:formData'])
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const Message = useMessage() // 消息提示

const { isRefreshList } = useSiteStore()

const popoverFocus = ref<boolean>(false) // 域名popover显示
const packForm = reactive({
	domain: '',
	ps: '',
})
const packFormRef = ref<any>() // 表单ref
const formDisabled = ref(false) // 表单是否禁用
const packageData = ref<any>({}) // 应用环境包数据
const tipsShow = reactive<any>({
	php_versions: false,
	mysql_versions: false,
}) // 提示显示

const descriptionsList = [
	{ key: 'app_name', label: '名称' },
	{ key: 'app_version', label: '版本' },
	{
		key: 'php_versions',
		label: '支持的PHP',
		text: '您服务器没有安装环境包支持的PHP版本，请先安装后再部署',
	},
	{
		key: 'mysql_versions',
		label: '支持的Mysql',
		text: '您服务器没有安装环境包支持的Mysql版本，���先安装后再部署',
	},
	{ key: 'php_functions', label: '解禁的函数' },
	{ key: 'db_character', label: 'Mysql字符集' },
	{ key: 'php_libs', label: '安装的扩展' },
]
const rules = {
	domain: [
		{
			required: true,
			message: '请输入域名',
			trigger: 'blur',
		},
	],
}

/**
 * @description 获取描述信息
 * @param key 描述的key值
 */
const getMsg = (key: string) => {
	switch (key) {
		case 'php_versions':
			// 判断是否安装支持的php版本，没有则显示提示
			const installed = packageData.value.installed_phps || []
			const surport = new Set(packageData.value.php_versions?.split(',') || [])
			if (!installed.some((version: string) => surport.has(version))) {
				tipsShow.php_versions = true
			}
			return packageData.value.php_versions || '--'
		case 'mysql_versions':
			if (packageData.value.mysql_versions === '00') return '无'
			// 判断是否安装支持的mysql版本，没有则显示提示
			const installedMysql = packageData.value.installed_mysql || []
			const surportMysql = packageData.value.mysql_versions?.split(',')
			if (!surportMysql.some((version: string) => installedMysql === version)) {
				tipsShow.mysql_versions = true
			}
			return packageData.value.mysql_versions || '无'
		case 'php_libs':
			return packageData.value.php_libs?.map((lib: { name: string }) => lib.name).join(',') || '--'
		default:
			return packageData.value[key] || '--'
	}
}
const handleInputName = (val: any) => {
	packForm.ps = val.split('\n')[0]
}

const onConfirm = async (close: any) => {
	try {
		if (tipsShow.php_versions || tipsShow.mysql_versions) {
			Message.error('您服务器没有安装环境包支持的PHP或Mysql版本，请先安装后再部署')
			return
		}
		// load = Message.load('正在设置部署，请稍后...')
		await packFormRef.value.validate()
		formDisabled.value = true
		// 获取domain除开第一行外的所有域名
		const name_list = packForm.domain.split('\n')
		const firstName = name_list[0]
		name_list.shift()
		const params = {
			site_name: firstName,
			app_name: packageData.value.app_name,
			app_version: packageData.value.app_version,
			ps: packForm.ps,
			webname: JSON.stringify({
				domain: firstName,
				domainlist: name_list,
				count: name_list.length,
			}),
		}
		const res = await createPhpAppSite(params)
		if (res.status) {
			close()
			props.compData.close()
			isRefreshList.value = true
			// 显示添加结果,非空对象才显示
			if (res.data && Object.keys(res.data).length) {
				useDialog({
					isAsync: true,
					title: '网站添加结果',
					area: 46,
					component: () => import('@site/views/php-model/add-site/add-default/add-result.vue'),
					compData: {
						siteStatus: res.status, // 网站添加状态
						sql: res.data.databaseStatus, // 是否显示数据库
						databaseStatus: res.data.databaseStatus, // 数据库状态
						sqlData: {
							username: res.data.databaseUser, // 数据库用户名
							password: res.data.databasePass, // 数据库密码
						},
						site: {
							name: '', // 网站名称
						},
						accessSite: res.data.success_url || '', // 访问地址
					},
				})
				return
			}
		}
		Message.request(res)
	} catch (error) {
		useHandleError(error)
	} finally {
		formDisabled.value = false
	}
}

/**
 * @description 获取上传的应用环境包
 */
const getUpload = async () => {
	try {
		const res = await getPhpAppUpload({
			app_name: props.compData.app_name,
			app_version: props.compData.app_version,
		})
		if (res.status) {
			packageData.value = res.data
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
		useHandleError(error)
	}
}

onMounted(() => {
	getUpload()
})

defineExpose({ onConfirm })
</script>

<style lang="css" scoped>
:deep(.el-form-item__label) {
	min-width: 5rem !important;
}
</style>
