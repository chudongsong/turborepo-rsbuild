<template>
  <div class="px-[1.6rem] py-[1.6rem]">
    <div
      class="flex flex-row justify-between border-b border-darker pb-[1.6rem]"
    >
      <span class="flex flex-row items-center reinforce_ssh">
        在(检测周期)
        <bt-input
          class="!w-[8rem] mr-[.8rem] ml-[.4rem]"
          v-model="getData.cycle"
        ></bt-input>
        秒内, 登录错误(检测阈值)
        <bt-input
          class="!w-[8rem] mr-[.8rem] ml-[.4rem]"
          v-model="getData.limit_count"
        ></bt-input>
        次, 封锁(封锁时间)
        <bt-input
          class="!w-[8rem] mr-[.8rem] ml-[.4rem]"
          v-model="getData.limit"
        ></bt-input>
        秒
      </span>
      <el-button type="primary" @click="save()">保存</el-button>
    </div>
    <bt-help :options="help_list" class="mx-[1.6rem] mt-[1.6rem]"></bt-help>
  </div>
</template>

<script lang="tsx" setup>
import { getSshConfig, saveSshConfig } from "@api/firewall";
import { useDataHandle } from "@hooks/tools";

// 页面数据
const getData = ref<any>({
  cycle: 0,
  limit: 0,
  limit_count: 0,
  name: "",
  open: false,
  ps: "",
});

const help_list = ref<any>([
  { content: "触发以上策略后，客户端IP将被封锁一段时间" },
  { content: "请在面板日志或操作日志中查看封锁记录" },
  {
    content:
      "在面板日志或操作日志中查看SSH成功登录的记录(非继承),关闭保护后权限自动还原",
  },
]); // 帮助列表

/**
 * @description 切换列表页面
 */
const currentListPage = async () => {
  const res: any = await useDataHandle({
    loading: "正在获取配置列表，请稍后...",
    request: getSshConfig(),
  });
  getData.value = res.data;
};

/**
 * @description 保存配置
 */
const save = async () => {
  const { cycle, limit, limit_count } = getData.value;
  useDataHandle({
    loading: "正在保存配置，请稍后...",
    request: saveSshConfig({
      cycle,
      limit,
      limit_count,
    }),
    message: true,
    success: (res: any) => {
      if (res.status) currentListPage();
    },
  });
};

// 页面加载完成
onMounted(() => currentListPage());
</script>
<style lang="sass">
.reinforce_ssh
	.el-input__inner
		width: 8rem
		padding: 0 .8rem
</style>
