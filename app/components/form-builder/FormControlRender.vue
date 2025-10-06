<template>
  <div>
    <template v-if="control.type === 'text'">
      <FormInput :control="control" />
    </template>
    <template v-else-if="control.type === 'textarea'">
      <FormTextarea :control="control" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import FormInput from './FormInput.vue'
import FormTextarea from './FormTextarea.vue'

import type { FormControl } from '@/types'

defineProps({
  control: {
    type: Object as () => FormControl,
    default: () => ({})
  }
})
</script>

<style>

</style>