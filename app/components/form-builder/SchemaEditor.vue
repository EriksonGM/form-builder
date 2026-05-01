<template>
  <div class="space-y-4">
    <UCard>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <UFormField :label="t('forms.formTitle')" required>
          <UInput v-model="model.title" class="w-full" />
        </UFormField>
        <UFormField :label="t('forms.formDescription')">
          <UInput v-model="model.description" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">{{ t('forms.fields') }}</h3>
      <UButton icon="i-lucide-plus" @click="addField">
        {{ t('forms.addField') }}
      </UButton>
    </div>

    <p v-if="!model.fields.length" class="text-(--ui-text-muted) text-sm">
      {{ t('forms.noFields') }}
    </p>

    <FieldEditor
      v-for="(f, i) in model.fields"
      :key="f.id"
      :model-value="f"
      @update:model-value="model.fields[i] = $event"
      @remove="model.fields.splice(i, 1)"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FormSchema } from '~/types'
import { newField } from '~/composables/useFieldTypes'
import FieldEditor from './FieldEditor.vue'

const props = defineProps<{ modelValue: FormSchema }>()
const emit = defineEmits<{ 'update:modelValue': [v: FormSchema] }>()
const { t } = useI18n()

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function addField() {
  model.value.fields.push(newField())
}
</script>
