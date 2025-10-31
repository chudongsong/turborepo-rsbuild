<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="ts">
	import { useForm } from '@/hooks/tools';
	import useWPRemoteStore from '@/views/wordpress/view/remote/useStore';
	import { getSelectCofigFormOption, setSelectCofigFormData } from '@/views/wordpress/view/remote/form-controller';

	interface Pros {
		compData: any;
	}

	const props = defineProps<Pros>();

	const { selectCofigFormData } = storeToRefs(useWPRemoteStore());

	const { BtForm } = useForm({
		data: () => selectCofigFormData.value,
		options: getSelectCofigFormOption(),
	});

	onMounted(() => {
		setSelectCofigFormData(props.compData);
	});
</script>

<style scoped></style>
