<template>
  <div class="flex flex-col items-start">
    <label  :for="formControl.id">{{ formControl.label }}</label>
    <UInput :id="formControl.id" class="w-100" :type="formControl.type" :value="formControl.value" />
    <span v-if="formControl.required" class="text-red-500">*</span>
  </div>
</template>

<script lang="ts" setup>
import type { FormControl } from '@/types';

const props = defineProps({
  formControl: {
    type: Object as PropType<FormControl>,
    default: () => ({})
  }
})
</script>

<style>

</style>