<template>
	<el-form-item label="Links">
		<div class="flex-1">
			<ul class="link-group">
				<menu-link-item v-for="(item, index) of links" v-model:label="item.label" v-model:href="item.href"
					:id="item.id" :index="index" :key="item.id" :item="item" :find-link="findLink" :move-link="moveLink"
					@del="onDelLink(index)">
				</menu-link-item>
			</ul>
			<el-button class="mt-3 w-full" @click="onAddLink">添加</el-button>
		</div>
	</el-form-item>
</template>

<script lang="ts" setup>
import { getRandom } from '../../controller';
import { comp_style_map, currentEditCompKey } from '../../store';

import MenuLinkItem from './MenuLinkItem.vue';

const links = computed({
	get() {
		return comp_style_map.value[currentEditCompKey.value].links
	},
	set(val) {
		comp_style_map.value[currentEditCompKey.value].links = val
	},
})

const onDelLink = (index: number) => {
	links.value.splice(index, 1)
}

const onAddLink = () => {
	links.value.push({ id: getRandom(6), label: '', href: '' })
}

const findLink = (id: string) => {
	const link = links.value.filter((c: { id: string }) => `${c.id}` === id)[0]
	return {
		link,
		index: links.value.indexOf(link),
	}
}

const moveLink = (id: string, atIndex: number) => {
	const { link, index } = findLink(id)
	links.value.splice(index, 1)
	links.value.splice(atIndex, 0, link)
}

</script>

<style lang="scss" scoped>
.link-group {
	display: flex;
	flex-direction: column;
}
</style>
