<template>
	<div class="" v-bt-loading="viewLoading">
		<div class="formItem">
			<span class="formLabel">网站目录</span>
			<bt-input-icon class="mr-[12px]" v-model="siteMessage.path" icon="el-folder-opened" @icon-click="onPathChange" width="32rem" />

			<el-button type="primary" @click="saveSitePath">保存</el-button>
		</div>
		<span class="formTips">当前网站的部署目录，可以选择其他目录</span>
		<div class="formItem">
			<span class="formLabel">运行目录</span>
			<el-select class="mr-[12px] !w-[32rem]" v-model="siteMessage.runPath">
				<el-option v-for="item in siteMessage.dirs" :key="item" :label="item" :value="item"></el-option>
			</el-select>
			<el-button type="primary" @click="setRunPath">保存</el-button>
		</div>
		<span class="formTips">部分程序需要指定二级目录作为运行目录，如ThinkPHP5,Laravel</span>

		<div class="formItem">
			<span class="formLabel">添加FTP</span>
			<el-switch class="mr-[12px]" v-model="ftpForm.ftp_status" @change="changeFtpStatus"></el-switch>
			<span class="text-tertiary">为当前目录添加一个FTP账号，以支持访问</span>
			<bt-link @click="ftpPopup = true">点击配置>></bt-link>
		</div>

		<div class="formItem">
			<span class="formLabel">文件同步</span>
			<el-switch class="mr-[12px]" v-model="rsyncStatus" @change="changeRsync"></el-switch>
			<i class="svgtofont-icon-ltd text-extraLarge text-ltd mr-4px"></i>
			<span class="text-tertiary">可以同步网站文件至其他服务节点</span>
			<bt-link @click="openRsync">点击配置>></bt-link>
		</div>

		<div class="formItem" v-show="enterpriseRec">
			<span class="formLabel">git同步</span>
			<el-switch class="mr-[12px]" v-model="siteMessage.sync_git" @change="changeGit"></el-switch>
			<i class="svgtofont-icon-ltd text-extraLarge text-ltd mr-4px"></i>
			<span class="text-tertiary">可以从git中下载文件到网站目录中</span>
			<bt-link @click="openGitPopup">点击配置>></bt-link>
			<el-divider direction="vertical"></el-divider>
			<bt-link @click="openGitLog">查看日志</bt-link>
			<el-divider direction="vertical"></el-divider>
			<bt-link @click="runGit">立即同步</bt-link>
		</div>

		<el-divider></el-divider>

		<div class="formItem">
			<span class="formLabel">防跨站攻击</span>
			<el-switch class="mr-[12px]" v-model="siteMessage.userini" @change="setDirUser"></el-switch>
			<span class="text-tertiary">防跨站攻击(open_basedir)，防止黑客通过其他网站目录进行入侵攻击</span>
		</div>

		<div class="formItem">
			<span class="formLabel">写访问日志</span>
			<el-switch class="mr-[12px]" v-model="siteMessage.logs" @change="setLogs"></el-switch>
			<span class="text-tertiary">允许当前日志增加访问日志</span>
		</div>

		<el-divider></el-divider>

		<div class="flex items-center">
			<span class="mr-[20px] w-[7rem] text-right">密码访问</span>
			<el-switch v-model="passVisitForm.status" @change="onChangePassStatus"></el-switch>
		</div>
		<el-form :model="passVisitForm" v-if="passVisitForm.status" ref="passVisitFormRef" :rules="passVisitRules" class="mt-[20px]" label-width="70px" label-position="right">
			<el-form-item label="账号" prop="username">
				<bt-input width="20rem" v-model="passVisitForm.username" placeholder="不修改请留空"></bt-input>
			</el-form-item>
			<el-form-item label="访问密码" prop="password">
				<bt-input width="20rem" v-model="passVisitForm.password" type="password" placeholder="不修改请留空"></bt-input>
			</el-form-item>
			<el-form-item label="重复密码" prop="rePass">
				<bt-input width="20rem" v-model="passVisitForm.rePass" type="password" placeholder="不修改请留空"></bt-input>
			</el-form-item>
			<el-form-item label=" ">
				<el-button type="primary" @click="onPassVisitConfirm">保存</el-button>
			</el-form-item>
		</el-form>

		<!-- popup -->

		<!-- ftp -->
		<bt-dialog title="FTP配置" v-model="ftpPopup" :area="42" showFooter @confirm="changeFtpStatus(false, true)" @close="getSitesFtpEvent()">
			<div class="p-[20px]">
				<el-form label-position="right" :model="ftpForm">
					<el-form-item label="用户名">
						<bt-input v-model="ftpForm.ftp_name" placeholder="请输入ftp用户名" style="width: 100%"></bt-input>
					</el-form-item>
					<el-form-item label="密码">
						<bt-input-icon v-model="ftpForm.ftp_pwd" icon="el-refresh" @icon-click="() => (ftpForm.ftp_pwd = getRandomPwd(16))" width="32rem" />
						<!-- <bt-input v-model="ftpForm.ftp_pwd" placeholder="请输入ftp密码" icon-type="refresh" :isNull="!!ftpForm.ftp_pwd"></bt-input> -->
					</el-form-item>
					<el-form-item label="根目录">
						<bt-input v-model="siteMessage.path" disabled style="width: 100%"></bt-input>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>

		<bt-dialog title="配置GIT同步" v-model="gitPopup" :area="42" showFooter @confirm="addGitConfig">
			<div class="p-[20px]">
				<el-form label-position="right" ref="gitFormRef" :model="gitForm" :rules="gitRules">
					<el-form-item label="git地址" prop="git_addr">
						<bt-input v-model="gitForm.git_addr" placeholder="请输入git地址" width="24rem"></bt-input>
					</el-form-item>
					<el-form-item label="分支">
						<bt-input v-model="gitForm.branch" placeholder="请输入git分支,为空默认主分支" width="24rem"></bt-input>
					</el-form-item>
					<el-form-item label="同步周期">
						<bt-input v-model="gitForm.cycle" text-type="天" type="number" :min="1" width="24rem"></bt-input>
					</el-form-item>
				</el-form>
			</div>
		</bt-dialog>

		<bt-dialog title="Git日志" v-model="gitLogPopup" :area="70">
			<div class="p-[20px]">
				<div class="flex items-center justify-between">
					<el-button type="primary" @click="getGitLogs">刷新</el-button>
					<span class="text-tertiary mt-[8px]">提示：支持Ctrl + F，快捷搜索日志内容</span>
				</div>
				<bt-editor v-bt-loading="gitLogsLoading" class="!h-[54rem] !w-full my-[12px]" v-model="logsText" :config="config" />
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="ts">
import { getRandomPwd } from '@/utils'
import {
	addGitConfig,
	changeFtpStatus,
	changeGit,
	changeRsync,
	ftpForm,
	ftpPopup,
	getGitLogs,
	getSitesFtpEvent,
	gitForm,
	gitFormRef,
	gitLogPopup,
	gitLogsLoading,
	gitPopup,
	gitRules,
	init,
	logsText,
	onChangePassStatus,
	onPassVisitConfirm,
	onPathChange,
	openGitLog,
	openGitPopup,
	openRsync,
	passVisitForm,
	passVisitFormRef,
	passVisitRules,
	rsyncStatus,
	runGit,
	saveSitePath,
	setDirUser,
	setLogs,
	setRunPath,
	siteMessage,
	viewLoading,
} from './useCatalugeController'
import { useGlobalStore } from '@/store/global'
const { enterpriseRec } = useGlobalStore()
onMounted(init)

defineExpose({
	init,
})
</script>

<style lang="css" scoped>
.formItem {
	@apply flex items-center my-[10px];
}
.formLabel {
	@apply text-default mr-2rem text-right w-[7rem];
}
.formItem .formLabel {
	@apply text-default mr-2rem text-right w-[7rem];
}

.formTips {
	@apply text-tertiary ml-[9rem];
}
:deep(.el-form .el-form-item--small .el-form-item__label) {
	min-width: 7rem;
}
.el-divider {
	margin: 10px !important;
}
</style>
