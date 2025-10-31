<template>
	<div>
		<div class="p-[2rem] w-[480px]">
			<div class="flex items-center">
				<span class="!text-warning !text-titleLarge svgtofont-el-warning-filled"></span>
				<span class="text-base ml-[.8rem] leading-10">{{ `${propMulti ? '批量删除' : '删除该'}证书，是否继续操作？` }}</span>
			</div>
			<div v-if="delType === 'other'" class="flex items-center ml-[4.8rem] mt-[1.2rem]">
				<el-checkbox v-model="delData.cloud">{{ `${propMulti ? '批量' : ''}同步删除云端证书` }}</el-checkbox>
			</div>
			<!-- <div class="!mt-[1.2rem] text-danger ml-[4.8rem]" v-if="siteList.length">
				<span>{{
					`${propMulti ? '' : '当前'}证书已部署网站【${siteList.join('、')}】,
					强制删除证书会关闭这些网站的SSL并删除证书文件，是否继续操作？`
				}}</span>
			</div> -->
			<!-- <div class="p-[2rem] bg-base mt-[1.2rem]" v-if="siteList.length">
				<span>计算结果：</span>
				<span class="mx-[1rem]">{{ delData.addend1 }} + {{ delData.addend2 }}</span>
				<span class="mr-[1rem]">=</span>
				<el-input-number v-model="delData.sum" v-focus autofocus="true" controls-position="right" size="small" />
			</div> -->
		</div>
		<div class="bg-light footer-btn flex items-center justify-end p-[1.2rem] w-full">
			<el-button type="default" @click="handleCancel">取消</el-button>
			<!-- <el-button type="danger" @click="handleConfirm">{{ `${siteList.length ? '强制' : ''}删除` }}</el-button> -->
			<el-button type="danger" @click="handleConfirm">删除</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDataHandle, useMessage } from '@/hooks/tools'
import { removeCloudCert, batchRemoveCloudCert, delCommercialCert } from '@api/ssl'
import { resultDialog } from '@ssl/useMethod'
import { isArray } from '@utils/index'
import { useCertificateStore } from '@ssl/views/certificate-manger/useStore'

const { activeTabs, sslIsRefresh, testIsRefresh, encryptIsRefresh, otherIsRefresh } = storeToRefs(useCertificateStore())

const MessageMethod = useMessage()

const props = defineProps<{
	compData: any
	isMulti: boolean
	delType: string
}>()
const emit = defineEmits(['cancel'])

const delData = reactive({
	addend1: Math.round(Math.random() * 9 + 1),
	addend2: Math.round(Math.random() * 9 + 1),
	sum: undefined as any,
	cloud: false,
	local: true, // 本地删除
}) // 删除数据

const propData = ref<any>(null)
const propMulti = ref<boolean>(false)

// 部署网站列表
const siteList = computed(() => {
	if (propMulti.value) {
		return propData.value
			.filter((item: any) => item.use_site.length > 0) // 过滤掉 use_site 为空数组的项
			.map((item: any) => item.use_site) // 提取 use_site 属性
			.flat()
	} else {
		return propData.value?.use_site
	}
})

const handleConfirm = async () => {
	// if (delData.sum !== delData.addend1 + delData.addend2 && siteList.value.length) return MessageMethod.error('计算错误，请重新计算')
	let load = MessageMethod.load(`正在${propMulti.value ? '批量' : ''}删除证书，请稍候...`)
	try {
		const refreshMap = {
			ssl: () => (sslIsRefresh.value = true),
			test: () => (testIsRefresh.value = true),
			encrypt: () => (encryptIsRefresh.value = true),
			other: () => (otherIsRefresh.value = true),
		} as const
		// 批量删除
		if (propMulti.value) {
			let resultArray: any = []
			if (props.delType === 'ssl') {
				for (const item of propData.value) {
					try {
						if (item.endDay >= 0) {
							resultArray.push({
								name: item.title || item.domainName?.join(',') || '未知证书',
								status: false,
								msg: '证书未过期，无法删除',
							})
							continue
						}
						const { data } = await delCommercialCert(item.oid)
						resultArray.push({
							name: item.title || item.domainName?.join(',') || '未知证书',
							status: data.status,
							msg: data.msg,
						})
					} catch (err: any) {
						resultArray.push({
							name: item.title || item.domainName?.join(',') || '未知证书',
							status: false,
							msg: err?.message || '删除失败',
						})
					}
				}
			} else {
				let sslIndexList: any = [],
					sslHashList: any = []
				propData.value.forEach((item: any) => {
					if (item.hash !== undefined && item.hash !== null) {
						sslHashList.push(item.hash)
					} else if (item.index !== undefined && item.index !== null) {
						sslIndexList.push(item.index)
					} else {
						resultArray.push({
							name: item.title,
							status: false,
							msg: '不支持删除',
						})
					}
				})
				if (sslIndexList.length || sslHashList.length) {
					let params: any = {
						ssl_hash: sslHashList.join(','),
						index: sslIndexList.join(','),
						local: 1,
						cloud: delData.cloud ? 1 : 0,
					}
					if (siteList.value.length) {
						params.force = true
					}
					const { data } = await batchRemoveCloudCert(params)
					if (isArray(data.finish_list)) {
						data.finish_list.forEach((item: any) => {
							resultArray.push({
								name: item.name,
								status: item.status,
								msg: item.status ? '删除成功' : item.msg,
							})
						})
					}
				}
			}
			emit('cancel')
			await resultDialog({
				resultData: resultArray,
				resultTitle: '删除',
			})
			refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
		} else {
			// 单个删除
			if (props.delType === 'ssl') {
				let oid = propData.value.oid
				useDataHandle({
					request: delCommercialCert(oid),
					loading: '正在删除证书，请稍候...',
					message: true,
					success: () => {
						emit('cancel')
						refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
					},
				})
			} else {
				let param: any = {
					ssl_id: propData.value.id,
					ssl_hash: propData.value.hash,
					index: propData.value.index,
				}
				if (!propData.value.order_status) {
					delete param.index
				} else {
					delete param.ssl_id
					delete param.ssl_hash
				}
				if (siteList.value.length) {
					param.force = 1
				}
				const ress = await removeCloudCert({
					...param,
					local: 1,
					cloud: delData.cloud ? 1 : 0,
				})
				if (isArray(ress.data.finish_list)) {
					MessageMethod.request(ress.data.finish_list[0])
				}
				if (ress.status) {
					emit('cancel')
					refreshMap[activeTabs.value as keyof typeof refreshMap]?.()
				}
			}
		}
	} catch (error) {
		console.log(error)
	} finally {
		load && load.close()
		delData.addend1 = Math.round(Math.random() * 9 + 1)
		delData.addend2 = Math.round(Math.random() * 9 + 1)
		delData.sum = undefined
	}
}

const handleCancel = () => {
	emit('cancel')
	delData.addend1 = Math.round(Math.random() * 9 + 1)
	delData.addend2 = Math.round(Math.random() * 9 + 1)
	delData.sum = undefined
}

watch(
	() => props.compData,
	val => {
		propData.value = val
	},
	{ deep: true, immediate: true }
)

watch(
	() => props.isMulti,
	val => {
		propMulti.value = val
	},
	{ deep: true, immediate: true }
)

defineExpose({
	handleCancel,
})
</script>

<style scoped></style>
