<template>
	<div class="p-[20px]">
		<!-- <BtForm label-width="11rem" /> -->
		<el-form :model="accessForm" ref="accessFormFef" class="demo-form-inline" :rules="rules" label-width="11rem">
			<el-row>
				<el-col :span="12">
					<el-form-item label="下载带宽限制">
						<el-input type="number" :min="0" placeholder="请输入下载带宽限制" v-model="accessForm.download_bandwidth" class="input-with-select">
							<template #append>
								<el-select v-model="unitForm.download_bandwidth" placeholder="请选择">
									<el-option v-for="(item, index) in unitData" :key="index" :label="item" :value="item"></el-option>
								</el-select>
							</template>
						</el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="上传带宽限制">
						<el-input type="number" :min="0" placeholder="请输入上传带宽限制" v-model="accessForm.upload_bandwidth" class="input-with-select">
							<template #append>
								<el-select v-model="unitForm.upload_bandwidth" placeholder="请选择">
									<el-option v-for="(item, index) in unitData" :key="index" :label="item" :value="item"></el-option>
								</el-select>
							</template>
						</el-input>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<el-form :inline="true" :model="accessForm" class="demo-form-inline" label-width="11rem">
			<el-row>
				<el-col :span="12">
					<el-form-item label="最大文件数量限制">
						<bt-input type="number" width="18rem" :min="0" v-model="accessForm.max_files" placeholder="请输入最大文件数量限制"></bt-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="最大文件大小限制">
						<el-input style="min-width: 180px" placeholder="请输入内容" type="number" :min="0" v-model="accessForm.max_size" class="input-with-select">
							<template #append>
								<el-select v-model="unitForm.max_size" placeholder="请选择">
									<el-option label="MB" value="MB"></el-option>
								</el-select>
							</template>
						</el-input>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
		<el-form :inline="true" :model="accessForm" class="demo-form-inline" label-width="11rem">
			<el-row>
				<el-col :span="12">
					<el-form-item label="时间限制">
						<el-time-picker format="HH:mm" style="width: 18rem" is-range v-model="accessForm.time_restrictions" range-separator="-" start-placeholder="开始" end-placeholder="结束" placeholder="选择时间范围"></el-time-picker>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="最大并发会话数">
						<bt-input width="18rem" type="number" :min="0" v-model="accessForm.max_sim_sessions" placeholder="请输入最大并发会话数"></bt-input>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>

		<el-divider>
			<span class="bt-link" @click="showConfig"> {{ icon === 'svgtofont-el-arrow-down' ? '展开' : '收起' }}更多配置 </span>
			<i :class="icon"></i>
		</el-divider>

		<div v-show="advancedConfiguration">
			<el-form :inline="true" :model="accessForm" class="demo-form-inline" label-width="11rem">
				<el-row>
					<el-col :span="12">
						<el-form-item prop="allowed_local_ips" label="允许的本地IP地址">
							<bt-input width="18rem" v-model="accessForm.allowed_local_ips" placeholder="请输入允许的本地IP地址"></bt-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="拒绝的本地IP地址" prop="denied_local_ips">
							<bt-input width="18rem" v-model="accessForm.denied_local_ips" placeholder="请输入拒绝的本地IP地址"></bt-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<el-form :inline="true" :model="accessForm" class="demo-form-inline" label-width="11rem">
				<el-row>
					<el-col :span="12">
						<el-form-item label="允许的客户端IP地址" prop="allowed_client_ips">
							<bt-input width="18rem" v-model="accessForm.allowed_client_ips" placeholder="请输入允许的客户端IP地址"></bt-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="拒绝的客户端IP地址" prop="denied_client_ips">
							<bt-input width="18rem" v-model="accessForm.denied_client_ips" placeholder="请输入拒绝的客户端IP地址"></bt-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<el-form :inline="true" :model="accessForm" class="demo-form-inline" label-width="11rem">
				<el-row>
					<el-col :span="24">
						<el-form-item label="上传和下载比率">
							<div class="flex">
								<el-input-number v-model="uNum" controls-position="right" :min="0"></el-input-number>
								<span class="mx-12px">:</span>
								<el-input-number v-model="dNum" controls-position="right" :min="0"></el-input-number>
							</div>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</div>

		<ul class="mt-8px leading-8 text-small list-disc ml-20px">
			<li class="text-danger">注意：填写为0或为空时都表示不做限制，将按照上一次设定值延续。</li>
			<li>允许的 IP 地址和被拒绝的 IP 地址若配置相同，将会拒绝该ip，因为“被拒绝”的设置优先级高于“被允许”的设置。</li>
			<li>上传和下载比率限制：以上传文件数量和下载文件数量的形式表示。例如，设置为 “1:5”，那么用户每上传1个文件，就可以下载5个文件。设定其中某一个值为0将设置失败。</li>
			<li>时间限制：指定用户可以访问FTP的时间范围。如：09:00到18:00，表示用户只能在这个时间范围内访问FTP。</li>
			<li>最大并发会话数：即允许与FTP服务器同时建立的最大连接数。</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import { $reset, onOpen, rules, setAccessEvent, showConfig } from './useMethod'
import { useFtpAccessStore } from './useStore'

const { accessFormFef, accessForm, uNum, dNum, icon, unitForm, advancedConfiguration, unitData } = useFtpAccessStore()

onMounted(onOpen)
onUnmounted($reset)

defineExpose({
	onConfirm: setAccessEvent,
})
</script>

<style lang="css" scoped>
:deep(.el-input) {
	width: 18rem;
}

:deep(.el-select) {
	width: 6.4rem !important;
}
:deep(.el-select__placeholder) {
	font-size: var(--el-font-size-small);
}

:deep(.el-date-editor) {
	width: 18rem !important;
}

:deep(.el-input-number) {
	width: 10rem !important;
}
</style>
