<template>
  <div>
    <bt-tabs
      type="card"
      v-model="tabActive"
      :options="tabComponent"
      v-if="payment.authType === 'ltd'"
    />
    <bt-product-introduce
      v-else
      :data="productData"
      class="px-[20%] py-[2rem]"
    ></bt-product-introduce>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@store/global';
import Overview from './overview/index.vue';

const { payment } = useGlobalStore();

const { authType } = payment.value;

const tabActive = shallowRef('overview'); // 当前激活的tab

const tabComponent = [
  {
    label: '概览',
    name: 'overview',
    render: () => import('./overview/index.vue'),
  },
  {
    label: '监控列表',
    name: 'monitor',
    render: () => import('./monitor/index.vue'),
  },
  {
    label: '检测历史',
    name: 'history',
    render: () => import('./history/index.vue'),
  },
  {
    label: '风险列表',
    name: 'risk',
    render: () => import('./risk-list/index.vue'),
  },
];

const productData = {
  title: '违规词检测-功能介绍',
  ps: '违规词检测能帮助检测网站内容中的合法及非法字段，并输出对应的检测结果，利用图表充分展示各个域名的风险历史、检测情况、敏感词排行等，并实时输出风险动态。',
  source: 111,
  desc: ['违规词内容检测', '网页内容修改检测', '输出检测报告'],
  tabImgs: [
    {
      title: '概览',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_1.png',
    },
    {
      title: '监控列表',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_2.png',
    },
    {
      title: '检测历史',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_3.png',
    },
    {
      title: '风险列表',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_4.png',
    },
    {
      title: '检测报告',
      imgSrc:
        'https://www.bt.cn/Public/new/plugin/introduce/firewall/content_detect_detail_5.png',
    },
  ],
};
</script>

<style scoped></style>
