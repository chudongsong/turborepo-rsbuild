<template>
	<div>
		<bt-install-mask v-if="maskLayer">
			<template #content> 没有找到可用的composer版本 </template>
		</bt-install-mask>
		<div class="p-1rem">
			<el-form :model="composerForm">
				<el-form-item label="Composer版本">
					<div class="flex items-center">
						<el-select v-model="composerForm.version" class="!w-[24rem]">
							<el-option label="2.7.3" value="2.7.3"></el-option>
							<el-option label="1.10.27" value="1.10.27"></el-option>
						</el-select>
					</div>
				</el-form-item>
				<el-form-item label="PHP版本">
					<el-select v-if="siteType !== 'phpasync'" class="!w-[24rem]" v-model="composerForm.php">
						<el-option v-for="(item, index) in composerForm.phpVersion" :key="index" :label="item.name" :value="item.version"></el-option>
					</el-select>
					<bt-input v-else v-model="composerForm.php" disabled width="24rem" />
				</el-form-item>
				<el-form-item label="执行参数">
					<el-select class="!w-[24rem]" :empty-values="[null, undefined]" v-model="composerForm.command">
						<el-option v-for="(item, index) in composerForm.commandOptions" :key="index" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="补充命令">
					<bt-input v-model="composerForm.otherCommand" placeholder="请输入补充命令" width="24rem" />
				</el-form-item>
				<el-form-item label="镜像源">
					<el-select v-model="composerForm.mirror" filterable allow-create default-first-option class="!w-[24rem]">
						<el-option label="阿里云(mirrors.aliyun.com)" value="https://mirrors.aliyun.com/composer/"></el-option>
						<el-option label="官方源(packagist.org)" value="repos.packagist"></el-option>
						<el-option label="中国全量镜像(packagist.phpcomposer.com)" value="https://packagist.phpcomposer.com"></el-option>
						<el-option label="Packagist Mirror(packagist.mirrors.sjtug.sjtu.edu.cn)" value="https://packagist.mirrors.sjtug.sjtu.edu.cn"></el-option>
						<el-option label="腾讯源(mirrors.tencent.com)" value="https://mirrors.tencent.com/composer/"></el-option>
						<el-option label="华为云(mirrors.huaweicloud.com)" value="https://mirrors.huaweicloud.com/repository/php/"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="siteType !== 'phpasync'" label="执行用户" prop="command">
					<el-select v-model="composerForm.user" class="!w-24rem">
						<el-option label="www(推荐)" value="www"></el-option>
						<el-option label="root(不推荐)" value="root"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="执行目录" prop="composerVersion">
					<bt-input-icon v-model="composerForm.path" icon="el-folder-opened" @icon-click="onPathChange" width="32rem" />
				</el-form-item>
				<el-form-item label=" " prop="composerVersion">
					<div>
						<span v-if="composerForm.comp_lock" class="text-danger">{{ composerForm.comp_lock }} <bt-link @click="deleteComposer">[点击删除]</bt-link></span>
						<span class="text-danger text-small" v-if="composerForm.comp_json">{{ composerForm.comp_json }}</span>
					</div>
				</el-form-item>

				<el-form-item label=" ">
					<el-button type="primary" :disabled="(typeof composerForm.comp_json !== 'boolean' && composerForm.comp_json) || (typeof composerForm.comp_lock !== 'boolean' && composerForm.comp_lock) ? true : false" @click="execComposerEvent">执行</el-button>
					<el-divider direction="vertical" class="!h-1rem !mx-2rem"></el-divider>
					<el-button @click="openLogsEvent">查看日志</el-button>
				</el-form-item>
			</el-form>
			<ul class="mt-[8px] leading-8 text-small list-disc ml-[20px]">
				<li>Composer是PHP主流依赖包管理器，若您的项目使用Composer管理依赖包，可在此处对依赖进行升级或安装</li>
				<li>Composer版本：当前安装的Composer版本，可点击右侧的【升级Composer】将Composer升级到最新稳定版</li>
				<li>PHP版本：用于执行composer的PHP版本，无特殊要求，默认即可，如安装出错，可尝试选择其它PHP版本</li>
				<li>执行参数：按需选择执行参数,可配合补充命令使用</li>
				<li>补充命令：若此处为空，则按composer.json中的配置执行，此处支持填写完整composer命令</li>
				<li>镜像源：提供【阿里源】和【官方源】，建议国内服务器使用【阿里源】，海外服务器使用【官方源】</li>
				<li v-if="siteType !== 'phpasync'">执行用户：默认为www用户，除非您的网站以root权限运行，否则不建议使用root用户执行composer</li>
				<li>执行目录：默认为当前网站根目录</li>
			</ul>
		</div>
		<bt-dialog title="请执行完毕确认结果无误后关闭此窗口" @cancel="cancelCmdPopup" v-model="cmdPopup" :area="[50, 42]">
			<bt-log class="h-full" :title="`全屏查看composer执行日志`" :content="cmdMsg" :isHtml="true" :isRefreshBtn="false" :isAuto="true"></bt-log>
		</bt-dialog>
		<bt-dialog title="composer执行日志" @cancel="cancelCmdPopup" v-model="cmdLogPopup" :area="60">
			<div class="p-2rem h-50rem flex flex-col">
				<div class="mb-1rem">
					<el-button type="primary" @click="getComposerLineLog(true)">刷新日志</el-button>
				</div>
				<div class="flex-1 overflow-auto">
					<bt-log class="h-full" :title="`全屏查看composer执行日志`" :content="cmdMsg" :isHtml="true" :isRefreshBtn="false"></bt-log>
				</div>
			</div>
		</bt-dialog>
	</div>
</template>
<script setup lang="ts">
import { deleteComposerFile, getComposerVersion, execComposer, getComposerLine } from '@api/site'
import { useSiteStore } from '@site/useStore'
import { useConfirm, useDataHandle, useHandleError, useMessage } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'

const { siteInfo } = useSiteStore()
const siteType = siteInfo.value?.project_type

const Message = useMessage() // 消息提示

const viewLoading = ref(false) // 视图加载状态
const maskLayer = ref(false) // 遮罩层
const composerForm = reactive<any>({
	path: siteInfo.value.path,
	user: siteType !== 'phpasync' ? 'www' : 'root',
	php: ['静态', '其它'].includes(siteInfo.value.php_version) ? 'auto' : 'PHP-' + siteInfo.value.php_version.replace('.', ''),
	otherCommand: '',
	mirror: 'https://mirrors.aliyun.com/composer/',
	command: 'install',
	composerVersion: 'install',
	version: '2.7.3',
	help_tips: '',
	comp_json: false || '',
	comp_lock: false || '',
	phpVersion: [] as any,
	commandOptions: [
		{ label: 'install', value: 'install' },
		{ label: 'update', value: 'update' },
		{ label: 'require', value: 'require' },
		{ label: 'create-project', value: 'create-project' },
		{ label: '自定义', value: '' },
	],
})

const cmdMsg = ref('正在执行...') // 执行composer命令返回的信息
const cmdPopup = ref(false) // 执行composer命令弹窗
const cmdTimer = ref() // 执行composer命令弹窗定时器

const cmdLogPopup = ref(false) // 执行composer命令弹窗

watch(
	() => siteInfo.value,
	val => {
		composerForm.php = ['静态', '其它'].includes(val.php_version) ? 'auto' : 'PHP-' + val.php_version.replace('.', '')
	},
	{ immediate: true }
)

/**
 * 获取composer版本
 */
const getComposer = async (path?: string) => {
	viewLoading.value = true
	try {
		const res = await getComposerVersion({
			path: path ? path : siteInfo.value.path,
		})
		if (!res.data.status) {
			maskLayer.value = true
			Message.request(res)
		} else {
			maskLayer.value = false
			// composerForm.version = res.data.msg
			composerForm.phpVersion = res.data.php_versions.filter((item: any) => item.version !== '00') // 排除伪静态
			composerForm.phpVersion.unshift({ name: '自动选择', version: 'auto' })
			composerForm.comp_json = false
			composerForm.comp_lock = false
			if (typeof res.data.comp_json === 'string') composerForm.comp_json = res.data.comp_json
			if (typeof res.data.comp_lock === 'string') composerForm.comp_lock = res.data.comp_lock
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}

/**
 * @description: 触发目录选择
 */
const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: composerForm.path,
		change: (path: string) => {
			composerForm.path = path
			getComposer(composerForm.path)
		},
	})
}

/**
 * @description 删除composer
 */
const deleteComposer = async () => {
	useDataHandle({
		loading: '正在删除，请稍后...',
		request: deleteComposerFile({ path: composerForm.path + '/composer.lock' }),
		message: true,
		success: (res: any) => {
			if (res.status) getComposer(composerForm.path)
		},
	})
}

/**
 * @description 获取composer执行结果
 */
const getLine = async () => {
	cmdTimer.value = setInterval(async () => {
		try {
			getComposerLineLog()
		} catch (error) {
			console.log(error)
			clearInterval(cmdTimer.value)
		}
	}, 2000)
}

/**
 * @description 执行composer命令
 */
const execComposerEvent = async () => {
	let params = {
		php_version: composerForm.php?.replace('PHP-', ''),
		composer_args: composerForm.command,
		composer_cmd: composerForm.otherCommand,
		repo: composerForm.mirror,
		path: composerForm.path,
		user: composerForm.user,
		composer_version: composerForm.version,
		siteName: siteInfo.value.name,
	}
	await useConfirm({
		title: '执行composer命令',
		content: '即将执行设定的composer命令，继续吗？',
		icon: 'warning-filled',
	})
	useDataHandle({
		loading: '正在执行，请稍后...',
		request: execComposer(params),
		message: true,
		success: (res: any) => {
			if (res.status) {
				cmdPopup.value = true
				getLine()
			}
		},
	})
}

/**
 * @description 获取composer执行结果
 */
const getComposerLineLog = async (isRefresh: boolean = false) => {
	try {
		const res = await getComposerLine({ filename: `/tmp/composer_${siteInfo.value.name}.log`, num: 100 })
		cmdMsg.value = res.data.msg
		if (isRefresh) Message.success('刷新成功')
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 打开composer执行日志
 */
const openLogsEvent = () => {
	cmdLogPopup.value = true
	getComposerLineLog()
}

const cancelCmdPopup = () => {
	clearInterval(cmdTimer.value)
	cmdPopup.value = false
	cmdLogPopup.value = false
	cmdMsg.value = ''
}

onMounted(() => {
	getComposer()
})

onBeforeUnmount(() => {
	clearInterval(cmdTimer.value)
})
</script>
