<template>
	<div>
		<bt-input type="textarea" v-model="batchContent" :rows="12" resize="none" width="72rem"></bt-input>
		<ul class="mt-[8px] text-tertiary leading-10">
			<li>批量格式：域名|根目录|FTP|数据库|PHP版本</li>
			<li>域名参数：多个域名用 , 分割</li>
			<li>根目录参数：填写 1 为自动创建，或输入具体目录</li>
			<li>FTP参数：填写 1 为自动创建，填写 0 为不创建</li>
			<li>数据库参数：填写 1 为自动创建，填写 0 为不创建</li>
			<li>PHP版本参数：填写 0 为静态，或输入PHP具体版本号列如：56、71、74</li>
			<li>如需添加多个站点，请换行填写</li>
			<li>
				案例：
				<span>bt.cn,test.cn:8081|/www/wwwroot/bt.cn|1|1|56</span>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { useMessage } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import { openResultDialog } from '@/views/site/useController'
import { createWebsiteMultiple } from '@api/site'
import { useSiteStore } from '@site/useStore'

const { isRefreshList } = useSiteStore()
const Message = useMessage() // 消息提示
const batchContent = ref<string>('域名|1|0|0|0\n域名|1|0|0|0\n域名|1|0|0|0')

const popupClose = inject<any>('popupClose') //     弹窗关闭
/**
 * @description 去除字符串中的空格
 * @param str
 */
const strim = (str: string) => {
	return str.replace(/\s+/g, '')
}

/**
 * @description 检查域名格式
 * @param domain
 */
const check_domain = (domain: any) => {
	const reg = /^([\w\u4e00-\u9fa5\-\*]{1,100}\.){1,10}([\w\u4e00-\u9fa5\-]{1,24}|[\w\u4e00-\u9fa5\-]{1,24}\.[\w\u4e00-\u9fa5\-]{1,24})$/
	return reg.test(strim(domain))
}

/**
 * @description 检查端口格式
 * @param domain
 */
const check_port = (port: any) => {
	const reg = /^([1-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
	return reg.test(port)
}

const resultColumn = [
	{
		label: '名称',
		prop: 'name',
	},
	{
		label: 'FTP',
		prop: 'db_status',
		render: (row: any) => {
			if (typeof row.db_status === 'boolean') {
				return h('span', { class: row.db_status ? 'text-primary' : '' }, row.db_status ? '已配置' : '未配置')
			} else {
				return h('span', row.db_status)
			}
		},
	},
	{
		label: '数据库',
		prop: 'ftp_status',
		render: (row: any) => {
			if (typeof row.ftp_status === 'boolean') {
				return h('span', { class: row.ftp_status ? 'text-primary' : '' }, row.ftp_status ? '已配置' : '未配置')
			} else {
				return h('span', row.ftp_status)
			}
		},
	},
	{
		label: '结果',
		render: (row: any) => {
			return h('span', { class: row.status ? 'text-primary' : 'text-danger truncate !w-[9.6rem] inline-block' }, row.status ? '操作成功' : row.msg)
		},
	},
]

const onConfirm = async (close: any) => {
	let arry = batchContent.value.split('\n')
	let _list = []

	for (let i = 0; i < arry.length; i++) {
		let item = arry[i]
		let params = item.split('|')
		let _arry = []

		if (item === '') continue

		for (let j = 0; j < params.length; j++) {
			let line = i + 1
			let items = strim(params[j])
			_arry.push(items)

			switch (j) {
				case 0: //参数一:域名
					let domainList = items.split(',')
					for (let z = 0; z < domainList.length; z++) {
						let domain_info = domainList[z].trim()
						let _domain = domain_info.split(':')

						if (!check_domain(_domain[0])) {
							Message.error('第' + line + '行,域名格式错误【' + _domain[0] + '】')
							return false
						}

						if (typeof _domain[1] !== 'undefined') {
							if (!check_port(_domain[1])) {
								Message.error('第' + line + '行,端口格式错误【' + _domain[1] + '】')
								return false
							}
						}
					}
					break
				case 1: //参数二:站点目录
					if (items !== '1') {
						if (items.indexOf('/') < -1) {
							Message.error('第' + line + '行,站点目录格式错误【' + items + '】')
							//       bt_tools.msg('第' + line + '行,站点目录格式错误【' + items + '】', 2)
							return false
						}
					}
					break
			}
		}
		_list.push(_arry.join('|').replace(/\r|\n/, ''))
	}
	let loading = Message.load('正在批量添加站点,请稍后...')
	try {
		const { data: res } = await createWebsiteMultiple({
			create_type: 'txt',
			websites_content: JSON.stringify(_list),
		})
		let result: any = []
		Object.keys(res.success).forEach(key => {
			result.push({
				name: key,
				status: true,
				ftp_status: res.success[key].ftp_status,
				db_status: res.success[key].db_status,
			})
		})
		Object.keys(res.error).forEach(key => {
			result.push({
				name: key,
				status: false,
				ftp_status: '--',
				db_status: '--',
				msg: res.error[key],
			})
		})
		isRefreshList.value = true
		popupClose()
		openResultDialog(
			{
				resultColumn,
				resultData: result,
				resultTitle: '添加站点',
			},
			46
		)
		batchContent.value = '域名|1|0|0|0\n域名|1|0|0|0\n域名|1|0|0|0'
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

defineExpose({
	onConfirm,
})
</script>
