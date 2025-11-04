<template>
	<div class="flex-wrap p-[2rem]">
		<div class="">
			<div class="bg-light p-[2rem] rounded-base">
				<strong class="text-medium">{{ props.compData.name }}</strong>
				<ul class="mt-[1rem] text-secondary">
					<li>
						<span>最近一次更新时间：</span>
						<span>{{ imageInfo.detail.last_updated }}</span>
					</li>
					<li>
						<span>是否为官方镜像：</span>
						<span>{{ official }}</span>
					</li>
					<li>
						<span>来源：</span>
						<span>Docker Hub</span>
					</li>
					<li>
						<span>Pulls量：</span>
						<span>{{ pullsTotal }}</span>
					</li>
				</ul>
			</div>
		</div>
		<div class="flex mt8px">
			<el-autocomplete popper-class="my-autocomplete" v-model="imageInfo.selectValue" class="!w-[40rem]" :popper-append-to-body="false" :fetch-suggestions="querySearch" @select="setValue" placeholder="请选择或搜索镜像">
				<template #default="{ item }">
					<div class="flex items-center justify-between py-[1rem]" :title="`${item.tag_name}`" :class="item.tag_name === imageInfo.selectValue ? ' text-primary hover:text-primaryDark' : ''">
						<div class="max-w-[25rem]">
							<div class="text-base leading-[1.4] max-w-[25rem] truncate">
								{{ `${item.tag_name}` }}
							</div>
							<div class="text-small leading-[1.2] text-disabled mt-[1rem]">
								{{ `${item.digest?.slice(0, 30) || ''}` }}
							</div>
						</div>
						<span class="name">{{ item.last_updated }}更新</span>
					</div>
				</template>
			</el-autocomplete>
			<el-button type="primary" class="ml-8px" @click="registryPullImage">拉取</el-button>
		</div>
	</div>
</template>

<script lang="tsx" setup>
import { Message } from '@hooks/tools'
import { getImageDetail, getImageTag } from '@/api/docker'
import { pullDetails, pullImages } from './useController'

interface Props {
	compData: any
}
type detailProps = {
	last_updated: string
	name: string
	is_official: boolean
	pull_count: number
	namespace: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({
		name: '',
	}),
})

const popupClose = inject('popupClose', () => {})
let timer: any = null
let imageLoad = false // 镜像加载
// 镜像基础信息
const imageInfo = ref({
	id: 0,
	selectValue: '',
	detail: {
		name: '',
		last_updated: '',
		is_official: false,
		pull_count: 0,
	} as detailProps,
})
const pullsTotal = computed(() => {
	let count = imageInfo.value.detail.pull_count
	return count ? count.toLocaleString() : ''
})
const official = computed(() => (imageInfo.value.detail.namespace === 'library' ? '是' : '否'))

const tagList = ref([])
// 设置选中的值
const setValue = (val: any) => {
	imageInfo.value.selectValue = val.tag_name
}
// 搜索镜像
const querySearch = (queryString: string, cb: any) => {
	// 返回结果
	const performSearch = async () => {
		await getTagList()
		const showList = tagList.value
		const selectValue = imageInfo.value.selectValue
		const results =
			queryString === selectValue
				? showList.sort((a: any, b: any) => {
						if (a.tag_name === selectValue && b.tag_name !== selectValue) {
							return -1 // a排在前面
						} else if (a.tag_name !== selectValue && b.tag_name === selectValue) {
							return 1 // b排在前面
						} else {
							return 0 // 保持原顺序
						}
				  })
				: showList.filter((image: any) => image.tag_name.includes(queryString))
		cb(results)
	}
	// 如果正在加载镜像就等待
	if (imageLoad) {
		timer = setInterval(() => {
			if (!imageLoad) {
				clearInterval(timer)
				performSearch()
			}
		}, 1000)
	} else {
		// 如果没有加载就直接搜索
		performSearch()
	}
}

// 获取动态tag列表
const getTagList = async () => {
	const { id } = imageInfo.value
	const { data } = await getImageTag({ image: props.compData.name, id, search: imageInfo.value.selectValue })
	const _data = data.data
	tagList.value = _data
}

// 拉取镜像
const registryPullImage = async () => {
	const selectValue = imageInfo.value.selectValue
	if (!selectValue) {
		Message.error('未获取到镜像ID,请选择一个镜像')
		return false
	}
	await pullImages({ name: props.compData.name, tag: selectValue }, props.compData.refresh)
}

// 页面加载完成
onMounted(async () => {
	try {
		const { data } = await getImageDetail({ image: props.compData.name })
		const _data = data.data
		imageInfo.value.detail = _data
		imageInfo.value.id = _data.id
		await getTagList()
	} catch (err) {
		console.log(err)
	}
})
</script>
<style lang="css" scoped>
ul li {
	@apply flex justify-between leading-[2rem] text-base mb-8px;
}
</style>
