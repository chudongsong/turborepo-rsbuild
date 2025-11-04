<template>
  <div class="flex flex-col">
    <bt-tabs
      v-if="payment.authType === 'ltd'"
      type="card"
      v-model="safeDetectActive"
      :options="tabComponent"
    />
    <bt-product-introduce
      v-else
      :data="productData"
      class="px-[20%] py-[2rem]"
    />
  </div>
</template>

<script lang="tsx" setup>
import { getFirewallStore } from '@firewall/useStore';
import { useGlobalStore } from '@store/global';
import SafeDetect from './detect/index.vue';

const { payment } = useGlobalStore();

const {
  refs: { safeDetectActive },
} = getFirewallStore();

interface tabProps {
  title: string;
  type: string;
  active?: true;
  component: any;
}

const tabComponent = [
  {
    label: '安全检测',
    name: 'safeDetectTab',
    render: () => import('./detect/index.vue'),
  },
  {
    label: '木马查杀',
    name: 'spywareDetection',
    render: () => import('./spyware-detection/index.vue'),
  },
  {
    label: '漏洞扫描',
    name: 'vulnerabilityScanning',
    render: () => import('@firewall/public/vulnerability-scanning/index.vue'),
  },
  {
    label: '文件完整性检测',
    name: 'fileIntegrityDetection',
    render: () => import('./file-integrity-detection/index.vue'),
  },
];

const productData = {
  title: '安全检测-功能介绍',
  ps: '扫描服务器系统目录下的风险漏洞，开启主动防御后，能多查杀目录中的文件进行动态保护，自动进行木马查杀并隔离。',
  source: 101,
  desc: ['实时检测木马', '安全扫描加固', '漏洞扫描', '完整性检测'],
  tabImgs: [
    {
      title: '动态查杀',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/safe_detect_1.png',
    },
    {
      title: '安全检测',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/safe_detect_2.png',
    },
    {
      title: '漏洞扫描',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/safe_detect_3.png',
    },
    {
      title: '文件完整性检测',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/safe_detect_4.png',
    },
  ],
};

onMounted(() => {});
</script>
