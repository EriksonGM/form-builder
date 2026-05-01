<template>
  <UCard variant="subtle" class="mb-3">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <UFormField :label="t('common.name')" required>
        <UInput v-model="model.name" class="w-full" placeholder="field_name" />
      </UFormField>
      <UFormField :label="t('common.displayName')" required>
        <UInput v-model="model.displayName" class="w-full" />
      </UFormField>
      <UFormField :label="t('common.type')">
        <USelect v-model="model.type" :items="types" class="w-full" @update:model-value="onTypeChange" />
      </UFormField>
      <UFormField :label="t('common.required')">
        <USwitch v-model="model.required" />
      </UFormField>

      <template v-if="fieldHasMinMax(model.type)">
        <UFormField :label="t('common.min')">
          <UInput v-model.number="model.min" type="number" class="w-full" />
        </UFormField>
        <UFormField :label="t('common.max')">
          <UInput v-model.number="model.max" type="number" class="w-full" />
        </UFormField>
      </template>

      <UFormField v-if="fieldHasPattern(model.type)" :label="t('common.pattern')" class="md:col-span-2">
        <UInput v-model="model.pattern" class="w-full" placeholder="^[a-zA-Z]+$" />
      </UFormField>
    </div>

    <div v-if="fieldHasOptions(model.type)" class="mt-4">
      <div class="flex justify-between items-center mb-2">
        <span class="font-medium text-sm">{{ t('common.options') }}</span>
        <UButton size="xs" icon="i-lucide-plus" variant="soft" @click="addOption">
          {{ t('common.add') }}
        </UButton>
      </div>
      <div v-for="(opt, i) in model.options" :key="i" class="flex gap-2 mb-2">
        <UInput v-model="opt.label" :placeholder="t('common.label')" class="flex-1" />
        <UInput v-model="opt.value" :placeholder="t('common.value')" class="flex-1" />
        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeOption(i)" />
      </div>
    </div>

    <div v-if="fieldHasChildren(model.type)" class="mt-4 border-l-2 border-(--ui-primary) pl-4">
      <div class="flex justify-between items-center mb-2">
        <span class="font-medium text-sm">{{ t('forms.fields') }}</span>
        <UButton size="xs" icon="i-lucide-plus" variant="soft" @click="addChild">
          {{ t('forms.addField') }}
        </UButton>
      </div>
      <FieldEditor
        v-for="(child, i) in model.fields"
        :key="child.id"
        :model-value="child"
        @update:model-value="updateChild(i, $event)"
        @remove="removeChild(i)"
      />
      <p v-if="!model.fields?.length" class="text-sm text-(--ui-text-muted)">
        {{ t('forms.noFields') }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <UButton color="error" variant="soft" icon="i-lucide-trash-2" @click="$emit('remove')">
          {{ t('common.remove') }}
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import type { FormField } from '~/types'
import { fieldHasOptions, fieldHasChildren, fieldHasMinMax, fieldHasPattern, useFieldTypes, newField } from '~/composables/useFieldTypes'

const props = defineProps<{ modelValue: FormField }>()
const emit = defineEmits<{ 'update:modelValue': [v: FormField], remove: [] }>()
const { t } = useI18n()
const { types } = useFieldTypes()

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function onTypeChange() {
  if (fieldHasOptions(model.value.type) && !model.value.options) {
    model.value.options = [{ label: 'Option 1', value: 'option1' }]
  }
  if (fieldHasChildren(model.value.type) && !model.value.fields) {
    model.value.fields = []
  }
}

function addOption() {
  if (!model.value.options) model.value.options = []
  model.value.options.push({ label: '', value: '' })
}
function removeOption(i: number) {
  model.value.options?.splice(i, 1)
}
function addChild() {
  if (!model.value.fields) model.value.fields = []
  model.value.fields.push(newField())
}
function updateChild(i: number, v: FormField) {
  if (!model.value.fields) return
  model.value.fields[i] = v
}
function removeChild(i: number) {
  model.value.fields?.splice(i, 1)
}
</script>
