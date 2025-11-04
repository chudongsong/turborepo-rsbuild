<template>
  <div>
    <el-upload
      class="upload-demo"
      ref="uploadRef"
      :name="'blob'"
      :data="fileData"
      :action="uploadUrl"
      :headers="header"
      :accept="accept"
      :on-error="uploadError"
      :multiple="false"
      :show-file-list="false"
      :auto-upload="true"
      :on-success="uploadSuccess"
      :on-progress="uploadProgress"
      :file-list="uploadFilesList"
      :on-change="uploadChange"
      :before-upload="uploadBefore"
    >
      <el-button
        ref="uploadButtonRef"
        v-show="false"
        size="small"
        type="primary"
      ></el-button>
    </el-upload>
  </div>
</template>
<script setup lang="ts">
import { Message } from '@/hooks/tools';

const emits = defineEmits(['upload-success']);

const header = { 'x-http-token': window.vite_public_request_token };
const uploadUrl =
  window.location.protocol +
  '//' +
  window.location.host +
  '/files?action=upload';
const uploadFilesList = ref<any>([]);
const uploadRef = ref<any>(null);
const uploadButtonRef = ref<any>(null);
const accept = ['.json'].join(',');

const fileData = reactive({
  f_size: 0,
  f_path: '/www/server/panel/data/firewall',
  f_name: '',
  f_start: 0,
});

/**
 * @description 上传成功
 */
const uploadSuccess = () => {
  emits('upload-success');
};

/**
 * @description 上传失败
 */
const uploadError = () => {
  Message.error('导入失败');
};

/*
 * @description 上传前
 */
const uploadBefore = (file: any) => {
  file.value = file;
  fileData.f_size = file.size;
  fileData.f_name = file.name;
  fileData.f_start = 0;
};

/**
 * @description 上传文件改变
 */
const uploadChange = (file: any, fileList: any) => {
  uploadFilesList.value = fileList;
};

/**
 * @description 上传进度
 */
const uploadProgress = (event: any, file: any, fileList: any) => {
  fileData.f_start = event.percent;
  uploadFilesList.value = fileList.map((item: any) => {
    if (item.uid === file.uid) {
      item.percentage = event.percent;
    }
    return item;
  });
};

/**
 * @description 移除文件
 */
const removeFile = (row: any) => {
  uploadFilesList.value = uploadFilesList.value.filter(
    (item: any) => item.name !== row.name
  );
};

/**
 * @description 上传文件
 */
const onConfirm = () => uploadRef.value.submit();

/**
 * @description 打开上传文件
 */
const open = () => uploadButtonRef.value.$el.click();

defineExpose({
  onConfirm,
  open,
  fileData,
});
</script>

<style scoped lang="sass"></style>
