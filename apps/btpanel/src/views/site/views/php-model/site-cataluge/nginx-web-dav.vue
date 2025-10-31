<template>
	<div class="p-[12px]">
		<div v-if="webDavCreated">
			<div class="formItem">
				<span class="formLabel">WebDav状态</span>
				<el-switch class="mr-[12px]" v-model="nginxForm.status" @change="handleChangeStatusEvent"></el-switch>
				<el-button type="default" @click="delWebDev">删除WebDav</el-button>
			</div>
			<el-divider></el-divider>
			<div class="formItem">
				<span class="formLabel">域名</span>
				<bt-input class="mr-[12px]" disabled v-model="nginxForm.domain" width="20rem"></bt-input>
			</div>
			<div class="formItem">
				<span class="formLabel">auth状态</span>
				<el-switch class="mr-[12px]" v-model="nginxForm.auth" @change="handleChangeAuth"></el-switch>
			</div>
			<div v-if="nginxForm.auth">
				<div class="formItem">
					<span class="formLabel">用户名</span>
					<bt-input class="mr-[12px] !w-[20rem]" v-model="nginxForm.user"></bt-input>
				</div>
				<div class="formItem">
					<span class="formLabel">密码</span>
					<bt-input class="mr-[12px] !w-[20rem]" v-model="nginxForm.pass"></bt-input>
				</div>
				<el-button type="primary" @click="saveNginxAuthEvent">保存</el-button>
			</div>
			<el-divider></el-divider>
			<div class="formItem">
				<span class="formLabel">最大上传文件大小</span>
				<bt-input class="mr-12px" v-model="nginxForm.client_max_body_size" width="20rem">
					<template #append> MB </template>
				</bt-input>
			</div>
			<el-button type="primary" @click="saveSize">保存</el-button>
			<bt-help class="mt-2rem" list-style="disc" :options="[{ content: '设置用户名和密码时，请注意特殊符号的中文和英文版本是不同的。特殊符号包括: !, @, #, $, %, ^, &, *, -, _ 等' }]"></bt-help>
		</div>
		<div v-else>
			<el-button type="primary" @click="addPopup = true">创建WebDav</el-button>
			<br />
			<p class="mt-[20px]">WebDAV是一种用于在Web服务器上进行文件管理和协作的扩展协议。</p>
			<p>WebDAV允许用户通过HTTP协议对远程服务器上的文件和目录进行读写操作。它提供了类似于本地文件系统的操作方式，使用户能够通过WebDAV客户端访问远程服务器上的文件</p>
			<bt-dialog title="创建WebDav" v-model="addPopup" :area="42" showFooter @cancel="handleCancelAdd" @confirm="onConfirmAdd">
				<div class="p-[20px]">
					<el-form :model="addForm">
						<el-form-item label="域名">
							<bt-input v-model="addForm.domain" placeholder="请输入域名" width="22rem"></bt-input>
						</el-form-item>
					</el-form>
					<ul class="mt-[12px] leading-8 text-small list-disc ml-[20px]">
						<li>域名格式为 www.domain.com:88,如未传端口信息,默认为80</li>
					</ul>
				</div>
			</bt-dialog>
		</div>
	</div>
</template>

<script setup lang="ts">
import { addForm, addPopup, delWebDev, getNginxWebData, handleCancelAdd, handleChangeAuth, handleChangeStatusEvent, nginxForm, onConfirmAdd, saveNginxAuthEvent, saveSize, webDavCreated } from './useOtherController'

onMounted(getNginxWebData)

defineExpose({
	init: getNginxWebData,
})
</script>

<style lang="css" scoped>
.formItem {
	@apply flex items-center my-[12px];
}
.formItem .formLabel {
	@apply text-default mr-[12px] min-w-[8rem];
}
</style>
