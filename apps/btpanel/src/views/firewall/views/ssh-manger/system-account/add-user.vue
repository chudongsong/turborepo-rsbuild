<template>
  <div class="p-2rem">
    <el-form :model="addForm" ref="sshAddUserRef" :rules="rules">
      <el-form-item label="用户名" prop="username">
        <bt-input
          v-model="addForm.username"
          placeholder="请输入用户名"
        ></bt-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <bt-input
          v-model="addForm.password"
          placeholder="请输入密码"
          iconType="refresh"
        ></bt-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { addSshUser } from '@/api/firewall';
import { useDataHandle } from '@hooks/tools';

interface Props {
  compData: { refreshFn: () => void };
}
const props = withDefaults(defineProps<Props>(), {
  compData: () => ({}),
});

const sshAddUserRef = ref<any>(); // 创建用户表单ref
const addForm = reactive<any>({
  username: '',
  password: '',
}); // 创建用户表单

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能小于8位' },
  ],
};

/**
 * @description 创建用户
 */
const onConfirm = async (close: any) => {
  await sshAddUserRef.value.validate();
  await useDataHandle({
    loading: '正在创建用户，请稍后...',
    request: addSshUser(addForm),
    message: true,
  });
  props.compData.refreshFn();
  close();
};

defineExpose({ onConfirm });
</script>

<style scoped></style>
