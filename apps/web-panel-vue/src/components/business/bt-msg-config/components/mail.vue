<template>
	<MsgBase @save="save" @close="$emit('close')">
		<template #from>
			<el-form ref="emailRef" :model="email" :rules="rules">
				<el-form-item label="发送人邮箱" prop="emailName">
					<el-input v-model="email.emailName" v-focus />
				</el-form-item>
				<el-form-item label="SMTP密码" prop="emailPass">
					<el-input v-model="email.emailPass" type="password" />
				</el-form-item>
				<el-form-item label="SMTP服务器" prop="emailHost">
					<el-input v-model="email.emailHost" />
				</el-form-item>
				<el-form-item label="端口" prop="emailPort">
					<el-input v-model="email.emailPort" />
				</el-form-item>
			</el-form>
		</template>
		<template #tip>
			<ul style="list-style: disc">
				<li>推荐使用465端口，协议为SSL/TLS</li>
				<li>25端口为SMTP协议，587端口为STARTTLS协议</li>
				<li>
					<bt-link href="https://www.bt.cn/bbs/thread-108097-1-1.html">配置教程</bt-link>
				</li>
			</ul>
		</template>
	</MsgBase>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { setMsgConfig } from '@api/global'
import MsgBase from '@components/business/bt-msg-config/components/msg-base.vue'

const { proxy: vm }: any = getCurrentInstance()

const email = reactive({
	emailName: '',
	emailPass: '',
	emailHost: '',
	emailPort: '465',
})
const { load: $load, request: $request } = useMessage()

const rules = {
	emailName: [
		{ required: true, message: '请输入发送人邮箱', trigger: 'blur' },
		{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
	],
	emailPass: [{ required: true, message: '请输入SMTP密码', trigger: 'blur' }],
	emailHost: [{ required: true, message: '请输入SMTP服务器', trigger: 'blur' }],
	emailPort: [{ required: true, message: '请输入端口', trigger: 'blur' }],
}

const save = () => {
	vm.$refs['emailRef'].validate(async (valid: boolean) => {
		if (valid) {
			let load: any
			try {
				load = $load(`正在设置邮件信息配置，请稍后...`)
				let res = await setMsgConfig('mail', {
					send: '1',
					qq_mail: email.emailName,
					qq_stmp_pwd: email.emailPass,
					hosts: email.emailHost,
					port: email.emailPort,
				})
				$request(res)
				vm.$emit('callback')
				vm.$emit('close')
			} catch (e) {
				console.log(e)
			} finally {
				load && load.close()
			}
		}
	})
}
</script>
