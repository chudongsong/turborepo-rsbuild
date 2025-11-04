<template>
    <div>
        <web-mail />
        <mail-time />
        <mail-monitor />
        <mail-auto-renew-ssl />
        <mail-service />
    </div>
</template>

<script lang="ts" setup>
import MailTime from './time/index.vue'
import WebMail from './web-mail/index.vue'
import MailMonitor from './monitor/index.vue'
import MailService from './service/index.vue'
import MailAutoRenewSsl from './auto-renew-ssl/index.vue'

</script>

<style lang="scss" scoped>
.setting-title {
    font-size: var(--el-font-size-large);
    margin-bottom: 12px;
}
</style>