<template>
	<div class="p-20px">
		<el-form ref="sendFormRef" :disabled="formDisabled" :rules="rulesSend" :model="sendForm">
			<el-form-item label="服务器IP" prop="ip">
				<bt-input v-model="sendForm.ip" placeholder="请输入接收服务器IP" width="34.8rem"></bt-input>
			</el-form-item>
			<el-form-item label="同步目录" prop="path">
				<bt-input v-model="sendForm.path" disabled width="34.8rem"></bt-input>
			</el-form-item>
			<el-form-item label="同步方式" class="form-row">
				<el-row>
					<el-select v-model="sendForm.delete" class="!w-[12rem]" @change="handleChangeDelete">
						<el-option label="增量" :value="false"></el-option>
						<el-option label="完全" :value="true"></el-option>
					</el-select>
					<el-form-item label="同步周期">
						<el-select v-model="sendForm.realtime" class="!w-[12rem]">
							<el-option label="实时同步" :value="true"></el-option>
							<el-option label="定时同步" :value="false"></el-option>
						</el-select>
					</el-form-item>
				</el-row>
			</el-form-item>
			<el-form-item label="定时周期" prop="cron" v-if="!sendForm.realtime">
				<el-row>
					<el-select v-model="sendForm.cron.type" class="!w-[10rem] mr-8px">
						<el-option label="每天" value="day"></el-option>
						<el-option label="N分钟" value="minute-n"></el-option>
					</el-select>
					<div class="flex items-center time-unit">
						<bt-input v-if="sendForm.cron.type !== 'minute-n'" v-model="sendForm.cron.hour" type="number" class="!w-[11.6rem] mr-8px">
							<template #append> 小时 </template>
						</bt-input>
						<bt-input v-model="sendForm.cron.minute" type="number" class="w-[12rem]">
							<template #append> 分钟 </template>
						</bt-input>
					</div>
				</el-row>
			</el-form-item>
			<el-form-item label="限速" class="form-row">
				<el-row>
					<el-col :span="8">
						<bt-input v-model="sendForm.bwlimit" type="number" class="!w-[12rem]">
							<template #append>KB</template>
						</bt-input>
					</el-col>
					<el-col :span="14">
						<el-form-item label="延迟">
							<bt-input v-model="sendForm.delay" type="number" class="!w-[12rem]">
								<template #append>秒</template>
							</bt-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form-item>

			<el-form-item label="链接方式" class="form-row">
				<el-row>
					<el-select v-model="sendForm.rsync" class="!w-[12rem]">
						<el-option label="密钥" value="key"></el-option>
						<el-option label="账号" value="user"></el-option>
					</el-select>
					<el-form-item label="压缩传输">
						<el-select v-model="sendForm.compress" class="!w-[12rem]">
							<el-option label="开启" :value="true"></el-option>
							<el-option label="关闭" :value="false"></el-option>
						</el-select>
					</el-form-item>
				</el-row>
			</el-form-item>

			<div class="mt-20px" v-if="sendForm.rsync === 'user'">
				<el-form-item label="用户名" prop="sname">
					<bt-input v-model="sendForm.sname" width="34.8rem" placeholder="请输入用户名"></bt-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<bt-input v-model="sendForm.password" width="34.8rem" placeholder="请输入密码"></bt-input>
				</el-form-item>
				<el-form-item label="端口" prop="port">
					<bt-input v-model="sendForm.port" width="34.8rem" type="number"></bt-input>
				</el-form-item>
			</div>

			<el-form-item label="密钥" prop="secret_key" v-if="sendForm.rsync === 'key'">
				<bt-input v-model="sendForm.secret_key" width="34.8rem" type="textarea" placeholder="请输入密钥"></bt-input>
			</el-form-item>
		</el-form>
		<bt-help class="pl-2rem" :options="helpList" list-style="disc"></bt-help>

		<bt-dialog title="数据安全风险警告" :area="[40, 'auto']" v-model="alertRsync" @close="handleConfirm(false)" @cancel="handleConfirm(false)">
			<div class="pt-2rem flex flex-col">
				<div class="flex items-center px-2rem">
					<i class="el-icon-warning text-[#e6a23c] text-[3rem] pr-4"></i>
					<span class="text-base leading-10 text-danger">警告：您选择了完全同步，将会使本机同步与目标机器指定目录的文件保持一致， 请确认目录设置是否有误，一但设置错误，可能导致目标机器的目录文件被删除!</span>
				</div>
				<span class="text-danger p-2rem text-base leading-10 ml-36px">注意： 同步程序将本机目录：【{{ sendForm.path }}】的所有数据同步到目标服务器，若目标服务器的同步目录存在其它文件将被删除!</span>

				<div class="flex items-center mt-12px ml-4px px-2rem">
					<el-checkbox v-model="checkOffRsync" class="!mr-4px"></el-checkbox>
					我已了解风险，确认关闭
				</div>

				<div class="bg-[#f6f8f8] footer-btn flex items-center justify-end mt-2rem p-12px w-full">
					<el-button type="warning" @click="handleConfirm(false)">取消</el-button>
					<el-button type="danger" @click="handleConfirm(true)" :disabled="!checkOffRsync ? true : false">确认选择</el-button>
				</div>
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import FILES_RSYNC_STORE from './store'

const store = FILES_RSYNC_STORE()
const { formDisabled, sendFormRef, rulesSend, sendForm, alertRsync, checkOffRsync } = storeToRefs(store)
const { helpList, handleChangeDelete, handleConfirm } = store
</script>

<style lang="css" scoped>
:deep(.time-unit .el-input-group__append) {
	padding: 0 10px !important;
}

:deep(.el-form-item__label) {
	min-width: 9rem;
	width: 90px;
}
</style>
