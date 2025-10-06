<template>
  <div>
    <UModal title="Modal with title">
      <UButton label="Open" color="neutral" variant="subtle" />

      <template #body>
        <UStepper ref="stepper" :items="items" class="mb-3"/>

        <template v-for="section in form.sections">
            <FormControlRender :control="control"  v-for="control in section.controls"/>
        </template>
        
      </template>
      <template #footer class="flex justify-between">
        <UButton leading-icon="i-lucide-arrow-left" :disabled="!stepper?.hasPrev" @click="stepper?.prev()">
          Prev
        </UButton>

        <UButton trailing-icon="i-lucide-arrow-right" :disabled="!stepper?.hasNext" @click="stepper?.next()">
          Next
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script lang="ts" setup>
import type { ServiceForm } from '@/types';
import type { StepperItem } from '@nuxt/ui'
import FormInput from '@/components/form-builder/FormInput.vue'
import FormControlRender from '@/components/form-builder/FormControlRender.vue'

const items = computed<StepperItem[]>(() => {
  return props.form.sections.map((section) => ({
    title: section.title,
    icon: 'i-lucide-house',
  }))
})
const stepper = useTemplateRef('stepper')

const props = defineProps({
  form: {
    type: Object as () => ServiceForm,
    default: () => []
  }
})
</script>

<style></style>