<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="ts">
	import { useForm } from '@/hooks/tools';
	import { getAddWordpressFormOption, addWordpress } from '@/views/wordpress/view/remote/form-controller';
	import useWPRemoteStore from '@/views/wordpress/view/remote/useStore';

	const { addWordpressData, resetAddWordpressData } = useWPRemoteStore();
	const { addWordpressFormData } = storeToRefs(useWPRemoteStore());

	const { BtForm, submit } = useForm({
		data: () => addWordpressFormData.value,
		options: getAddWordpressFormOption,
		submit: async (param: Ref<AnyObject>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
			await validate(); // 校验表单
		},
	});

	const onConfirm = async (close: any) => {
		try {
			await submit();
			await addWordpressData(close);
		} catch (error) {
			console.log(error);
		}
	};

	onMounted(() => {
		resetAddWordpressData();
	});

	defineExpose({
		onConfirm,
	});
</script>

<style scoped></style>
