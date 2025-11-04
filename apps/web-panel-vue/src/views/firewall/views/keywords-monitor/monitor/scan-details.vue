<template>
  <div class="flex-wrap h-full">
    <bt-log class="h-full" :title="`全屏查看`" :content="logContent"></bt-log>
  </div>
</template>
<script lang="tsx" setup>
import { killScan } from '@/api/firewall';
import { getLines } from '@api/global';
import { Message } from '@hooks/tools';
import { useConfirm } from '@hooks/tools';
import { useDataHandle } from '@hooks/tools';

interface Props {
  compData?: any;
}

const popupSetFooter = inject<any>('popupSetFooter'); //     弹窗切换底部按钮展示
const props = withDefaults(defineProps<Props>(), {
  compData: () => ({}),
});

const logContent = ref('获取中...');
const isScan = ref(true);
const timer = ref(); //定时

const { path_info } = props.compData;
/**
 * @description 获取日志
 */
const getLog = async () => {
  try {
    logContent.value = '获取中...';
    const rdata = await getLines({ num: 20, filename: path_info });
    logContent.value = rdata.msg || '扫描中...';
    // 扫描已结束
    if (rdata.msg?.indexOf('扫描结束') !== -1) {
      isScan.value = false;
      Message.success('扫描已结束');
      popupSetFooter(false); // 隐藏底部按钮
      clearTimer();
      return;
    }
    // 扫描未结束
    if (rdata.msg?.indexOf('扫描结束') === -1 && isScan.value) {
      timer.value = setTimeout(function () {
        getLog();
      }, 1500);
    }
    if (!rdata.status) {
      Message.request(rdata);
      isScan.value = false;
    }
  } catch (err) {
    console.log(err);
    clearTimer();
  }
};

const clearTimer = () => {
  if (timer.value) clearTimeout(timer.value);
};

/**
 * @description: 停止检测
 */
const submitFrom = async (close: Function) => {
  await useConfirm({
    icon: 'warning-filled',
    title: '停止检测网站',
    width: '40rem',
    content: '当前正在进行检测网站，确定停止检测网站吗？',
  });
  await useDataHandle({
    loading: '正在停止检测，请稍后...',
    request: killScan({ id: props.compData.id }),
    message: true,
  });
  isScan.value = false;
  clearTimer();
  close();
};

watch(
  () => props.compData,
  val => {
    isScan.value = true;
    getLog();
  }
);

// 页面加载完成
onMounted(() => getLog());

onBeforeUnmount(() => clearTimer());

defineExpose({ onConfirm: submitFrom, onCancel: clearTimer });
</script>
