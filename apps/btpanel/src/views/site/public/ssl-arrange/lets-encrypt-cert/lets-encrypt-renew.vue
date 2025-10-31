<template>
  <BtForm class="p-2rem">
    <template #dnsVerify>
      <el-form-item label="请选择验证方式">
        <el-select
          class="mr-[16px] !w-[16rem]"
          v-model="dnsVerify"
          placeholder="请选择"
          @change="setSslDnsApi(true)"
        >
          <el-option
            v-for="item in dnsArray"
            :key="item.name"
            :label="item.title"
            :value="item.name"
          >
            <span class="flex justify-between">
              <span>{{ item.title }}</span>
              <span
                v-show="item.config"
                :class="!item.data ? 'text-orange' : 'text-primary'"
              >
                {{ !item.data ? '[未配置]' : '[已配置]' }}
              </span>
            </span>
          </el-option>
        </el-select>
        <el-button
          v-show="dnsVerify !== 'dns' && dnsVerify !== 'http'"
          class="ml-[8px]"
          @click="setSslDnsApi(false)"
        >
          配置
        </el-button>
        <el-button
          type="primary"
          class="ml-[8px]"
          @click="oneClickRenew(compData)"
        >
          一键续签
        </el-button>
      </el-form-item>
    </template>
  </BtForm>
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools';
import {
  compData,
  dnsArray,
  dnsVerify,
  initRenew,
  oneClickRenew,
  setSslDnsApi,
} from './useController';

const { BtForm } = useForm({
  options: (formData: any) =>
    computed(() => [
      {
        type: 'slots',
        key: 'dnsVerify',
      },
      {
        type: 'help',
        options: [
          { content: '通配符证书不能使用【文件验证】，请选择DNS验证' },
          {
            content:
              '使用【文件验证】，请确保没有开[启强制HTTPS/301重定向/反向代理]等功能',
          },
          {
            content: '使用【阿里云DNS】【DnsPod】等验证方式需要设置正确的密钥',
          },
          { content: '续签成功后，证书将在下次到期前30天尝试自动续签' },
          {
            content:
              '使用【DNS验证 - 手动解析】续签的证书无法实现下次到期前30天自动续签',
          },
        ],
      },
    ]),
});

onMounted(initRenew);
</script>
