<template>
  <div>
    <BtTabs />
  </div>
</template>

<script lang="ts" setup>
import LimitAccess from "./limit.vue";
import DenyAccess from "./deny.vue";
import { useTabs } from "@/hooks/tools";

const menu = ref("access");

const menuList: any = [
  { name: "access", label: "访问限制", render: () => LimitAccess },
  { name: "deny", label: "拒绝访问", render: () => DenyAccess },
  { name: "hotlink", label: "防盗链", render: () =>	import('@site/public/hotlink-protection/index.vue') },
];

const { BtTabs } = useTabs({
  type: "card",
  options: menuList,
  value: menu,
});
</script>
