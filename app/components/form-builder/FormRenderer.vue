<template>
  <div class="space-y-4">
    <div v-if="schema.title || schema.description" class="space-y-1">
      <h2 v-if="schema.title" class="text-2xl font-semibold">{{ schema.title }}</h2>
      <p v-if="schema.description" class="text-(--ui-text-muted)">{{ schema.description }}</p>
    </div>
    <FieldRenderer
      v-for="f in schema.fields"
      :key="f.id"
      :field="f"
      :model-value="data[f.name]"
      :error="errors[f.name]"
      @update:model-value="data[f.name] = $event"
    />
    <div class="flex gap-2 justify-end pt-4">
      <slot name="actions" :submit="submit" :data="data" :errors="errors" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormSchema } from '~/types'
import FieldRenderer from './FieldRenderer.vue'
import { validateSchema } from '~/composables/useFormValidation'

const props = defineProps<{
  schema: FormSchema
  modelValue?: Record<string, any>
}>()
const emit = defineEmits<{
  'update:modelValue': [v: Record<string, any>]
  'submit': [v: Record<string, any>]
  'invalid': [errors: Record<string, string>]
}>()

const data = ref<Record<string, any>>(props.modelValue ?? {})
const errors = ref<Record<string, string>>({})

watch(data, (v) => emit('update:modelValue', v), { deep: true })

function submit() {
  const e = validateSchema(props.schema, data.value)
  errors.value = e
  if (Object.keys(e).length === 0) {
    emit('submit', data.value)
  } else {
    emit('invalid', e)
  }
}

defineExpose({ submit, data, errors })
</script>
