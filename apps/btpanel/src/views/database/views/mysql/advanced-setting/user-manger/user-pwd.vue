import { changeUserPass } from "@/api/database" import { changeUserPass } from "@/api/database"

<template>
	<div class="p-16px">
		<el-form>
			<el-form-item label="用户名">
				<bt-input disabled v-model="username"></bt-input>
			</el-form-item>
			<el-form-item label="访问权限">
				<bt-input disabled v-model="host"> </bt-input>
			</el-form-item>
			<el-form-item label="新密码">
				<bt-input iconType="refresh" v-model="pwdValue"></bt-input>
			</el-form-item>
		</el-form>
		<bt-help :list="helpList" list-style="disc" class="ml-20px mt-12px"></bt-help>
	</div>
</template>

<script lang="ts" setup>
import { Message } from '@hooks/tools';
import { changeUserPass } from '@/api/database';

interface Props {
	compData?: any;
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
});

const { username, host } = props.compData; // 用户名 密码 id
const pwdValue = ref(); //root密码

const helpList = [{ content: '此处改密不会同步至 数据库-密码展示界面 请注意更改' }];

/**
 * @description 密码框数据变更
 */
const onConfirm = async (close: AnyFunction) => {
	try {
		const res = await changeUserPass({ ...props.compData, password: pwdValue.value });
		await Message.request(res);
		close(); // 关闭弹窗
	} catch (error) {
		console.log(error);
	}
};

defineExpose({ onConfirm });
</script>
