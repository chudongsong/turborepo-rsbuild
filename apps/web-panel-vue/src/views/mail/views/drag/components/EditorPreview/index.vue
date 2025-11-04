<template>
	<div v-html="emailTemplate"></div>
</template>

<script lang="ts" setup>
import { emailTemplate } from '../../store'
</script>
