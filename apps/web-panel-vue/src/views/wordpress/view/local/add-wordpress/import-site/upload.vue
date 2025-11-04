<template>
  <el-upload
    ref="upload"
    class="custom-upload w-auto"
    action=""
    :name="'blob'"
    :file-list="fileList"
    :show-file-list="false"
    :multiple="false"
    :http-request="customRequest"
  >
    <template #trigger>
      <el-button type="primary">
        <slot></slot>
      </el-button>
    </template>
    <el-progress
      v-if="uploadProgress > 0 && uploadProgress < 100"
      :percentage="uploadProgress"
      :format="percentageFormat"
    />
  </el-upload>
</template>

<script lang="ts" setup>
import { ElUpload } from "element-plus";
import type { UploadRequestOptions, UploadFile } from "element-plus";
import axios, { AxiosProgressEvent } from "axios";
import { getToken } from "@/utils";

interface Props {
  path: string;
}

const props = withDefaults(defineProps<Props>(), {
  path: "/", // 上传位置
});

const emit = defineEmits<{
  (event: "finish", value: string): void;
}>();

const fileList = ref<UploadFile[]>([]);
const token = getToken();

// 添加上传进度状态
const uploadProgress = ref(0);

// 添加进度格式化函数
const percentageFormat = (percentage: number) => `${percentage}%`;
const uploadUrl = process.env.NODE_ENV === 'development' ? '/api/files?action=upload' : '/files?action=upload';

// 自定义上传逻辑 - 切片上传
const customRequest = async (options: UploadRequestOptions) => {
  const { file, onProgress, onSuccess, onError } = options;
  const chunkSize = 1024 * 1024; // 每片1MB
  const totalChunks = Math.ceil((file as File).size / chunkSize);
  const tokenData = getToken();

  for (let currentChunk = 0; currentChunk < totalChunks; currentChunk++) {
    const start = currentChunk * chunkSize;
    const end = Math.min(start + chunkSize, (file as File).size);
    const blob = (file as File).slice(start, end);

    const form = new FormData();
    form.append("f_path", props.path);
    form.append("f_name", file.name);
    form.append("f_start", start.toString());
    form.append("blob", blob);
    form.append("f_size", (file as File).size.toString());
    form.append("request_time", tokenData.request_time.toString());
    form.append("request_token", tokenData.request_token);

    try {
      await axios.post(uploadUrl, form, {
        headers: {
          "Content-Range": `bytes ${start}-${end - 1}/${(file as File).size}`,
          "x-http-token": window.vite_public_request_token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (event.lengthComputable) {
            const chunkProgress = Math.round((event.loaded * 100) / event.total);
            const overallProgress = Math.round(((currentChunk * chunkSize + event.loaded) * 100) / (file as File).size);
            uploadProgress.value = overallProgress;
            onProgress({ percent: overallProgress });
          }
        },
      });
    } catch (error) {
      onError && onError(error);
      return;
    }
  }

  emit("finish", `${props.path}/${file.name}`);
  onSuccess && onSuccess(null);
  fileList.value = [];
  setTimeout(() => {
    uploadProgress.value = 0; // 重置进度条
  }, 1000);
};
</script>

<style scoped>
.custom-upload :deep(.el-upload__input) {
  display: none;
}
</style>