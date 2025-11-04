<template>
	<div>
		<BtForm />
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import useWPLocalAddStore from '@/views/wordpress/view/local/add-wordpress/useStore'
import { getAddWordpressFormOptionImport, onImportConfirm } from '@/views/wordpress/view/local/add-wordpress/useController'

const { addBackupFormData, createImportSubmit } = storeToRefs(useWPLocalAddStore())
const { getInitData, resetImportForm } = useWPLocalAddStore()

const { BtForm, submit } = useForm({
	data: () => addBackupFormData.value,
	options: getAddWordpressFormOptionImport,
	submit: onImportConfirm,
})

onMounted(() => {
	getInitData()
	createImportSubmit.value = submit
	resetImportForm()
})
</script>

<style scoped></style>
