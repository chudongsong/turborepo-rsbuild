<template>
    <div class="firewall-server-safe">
        <div class="info-section max-[1370px]:flex-col">
            <div class="item flex-col">
                <div class="wrapper">
                    <SshLoginStats />
                </div>
                <div class="wrapper flex flex-col justify-center">
                    <ProtRecord />
                </div>
            </div>
            <div class="item flex-col">
                <div class="wrapper">
                    <LastLogin />
                </div>
            </div>
        </div>
        <div class="info-section mt-[16px]">
            <div class="item flex-col">
                <div class="wrapper">
                    <SecDetect />
                </div>
            </div>
        </div>
        <div class="info-section mt-[16px] max-[1370px]:flex-col">
            <div class="item flex-col">
                <div class="wrapper">
                    <RecentRecordsPanel recordType="ssh" />
                </div>
            </div>
            <div class="item flex-col">
                <div class="wrapper">
                    <RecentRecordsPanel recordType="panel" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="tsx">
    import SshLoginStats from '@/views/firewall/public/ssh-login-stats/index.vue'
    import ProtRecord from '@/views/firewall/views/server-safe/prot-record/index.vue'
    import LastLogin from '@/views/firewall/views/server-safe/last-login/index.vue'
    import SecDetect from '@/views/firewall/views/server-safe/sec-detect/index.vue'
    import RecentRecordsPanel from '@/views/firewall/public/recent-records-panel/index.vue'
</script>

<style scoped lang="scss">
.firewall-server-safe{
    width: 1370px;
    @media (max-width: 1630px) {
        width: 100%;
    }
}

.info-section {
    display: flex;
    gap: 16px;
    .item {
        flex: 1;
        min-width: 0;
        display: flex;
        gap: 16px;
        .wrapper {
            border: 1px solid var(--el-border-color-light);
            padding: 2rem;
            border-radius: var(--el-border-radius-base);
            flex: 1;
        }
    }
}
</style>