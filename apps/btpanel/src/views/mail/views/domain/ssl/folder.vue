<template>
    <div>
        <BtTable :max-height="500" />
    </div>
</template>

<script setup lang="tsx">
import { useDynamicTable } from '@/hooks/tools';
import { folderDeployCertEvent, getListData } from './useController';
import { useOperate } from '@/hooks/tools/table/column';

const { BtTable, BtSearch, BtTableSelect, refresh } = useDynamicTable({
    request: getListData,
    columns: [
        {
            label: '域名', // 路径
            prop: 'subject',
            render: (row: any) => {
                return h('div', { class: 'whitespace-pre-wrap' }, row.dns?.join('\n') || row.subject)
            },
        },
        { label: '到期时间', prop: 'not_after' },
        { label: '品牌', prop: 'info.issuer', showOverflowTooltip: true },
        {
            label: '位置',
            render: (row: any) => (row.cloud_id > 0 ? '云端' : '本地'),
        },
        useOperate([
            {
                onClick: folderDeployCertEvent,
                title: '部署',
            }
        ])
    ],
})
</script>