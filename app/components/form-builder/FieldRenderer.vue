<template>
  <UFormField :label="field.displayName || field.name" :required="field.required" :error="error">
    <UInput
      v-if="field.type === 'text'"
      :model-value="modelValue ?? ''"
      class="w-full"
      :minlength="field.min"
      :maxlength="field.max"
      :pattern="field.pattern"
      :required="field.required"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <UTextarea
      v-else-if="field.type === 'textarea'"
      :model-value="modelValue ?? ''"
      class="w-full"
      :minlength="field.min"
      :maxlength="field.max"
      :required="field.required"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <UInput
      v-else-if="field.type === 'number'"
      type="number"
      :model-value="modelValue ?? null"
      class="w-full"
      :min="field.min"
      :max="field.max"
      :required="field.required"
      @update:model-value="$emit('update:modelValue', $event === '' ? null : Number($event))"
    />
    <UInput
      v-else-if="field.type === 'date'"
      type="date"
      :model-value="modelValue ?? ''"
      class="w-full"
      :required="field.required"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <USelect
      v-else-if="field.type === 'select'"
      :model-value="modelValue ?? ''"
      :items="field.options ?? []"
      class="w-full"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <URadioGroup
      v-else-if="field.type === 'radio'"
      :model-value="modelValue ?? ''"
      :items="field.options ?? []"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <UCheckboxGroup
      v-else-if="field.type === 'checkbox'"
      :model-value="modelValue ?? []"
      :items="field.options ?? []"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <USwitch
      v-else-if="field.type === 'boolean'"
      :model-value="!!modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <div v-else-if="field.type === 'object'" class="w-full">
      <div class="flex items-center justify-between gap-3 rounded-(--ui-radius) border border-(--ui-border) px-3 py-2">
        <div class="text-sm">
          <span v-if="hasObjectValue" class="text-(--ui-text)">
            {{ summarizeObject(field, objectValue) || t('common.configured') }}
          </span>
          <span v-else class="text-(--ui-text-muted)">{{ t('common.notConfigured') }}</span>
        </div>
        <UButton
          size="xs"
          variant="soft"
          :icon="hasObjectValue ? 'i-lucide-pencil' : 'i-lucide-plus'"
          @click="openObjectModal"
        >
          {{ hasObjectValue ? t('common.edit') : t('common.configure') }}
        </UButton>
      </div>

      <UModal v-model:open="objectModalOpen" :title="field.displayName || field.name" :ui="{ content: 'max-w-2xl' }">
        <template #body>
          <div class="space-y-3">
            <FieldRenderer
              v-for="child in field.fields ?? []"
              :key="child.id"
              :field="child"
              :model-value="objectDraft[child.name]"
              @update:model-value="objectDraft[child.name] = $event"
            />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2 w-full">
            <UButton variant="ghost" @click="objectModalOpen = false">{{ t('common.cancel') }}</UButton>
            <UButton icon="i-lucide-check" @click="saveObject">{{ t('common.save') }}</UButton>
          </div>
        </template>
      </UModal>
    </div>

    <div v-else-if="field.type === 'array'" class="w-full space-y-2">
      <ul v-if="arrayValue.length" class="divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
        <li v-for="(item, i) in arrayValue" :key="i" class="flex items-center justify-between px-3 py-2">
          <div class="text-sm">
            <span class="font-medium text-(--ui-text-muted) mr-2">#{{ i + 1 }}</span>
            <span>{{ summarizeObject(field, item) || t('common.item') }}</span>
          </div>
          <div class="flex gap-1">
            <UButton size="xs" variant="ghost" icon="i-lucide-pencil" @click="openEditItem(i)" />
            <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeArrayItem(i)" />
          </div>
        </li>
      </ul>
      <UButton size="sm" variant="soft" icon="i-lucide-plus" @click="openAddItem">
        {{ t('common.addItem') }}
      </UButton>

      <UModal v-model:open="arrayModalOpen" :title="arrayModalTitle" :ui="{ content: 'max-w-2xl' }">
        <template #body>
          <div class="space-y-3">
            <FieldRenderer
              v-for="child in field.fields ?? []"
              :key="child.id"
              :field="child"
              :model-value="arrayDraft[child.name]"
              @update:model-value="arrayDraft[child.name] = $event"
            />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2 w-full">
            <UButton variant="ghost" @click="arrayModalOpen = false">{{ t('common.cancel') }}</UButton>
            <UButton icon="i-lucide-check" @click="saveArrayItem">{{ t('common.save') }}</UButton>
          </div>
        </template>
      </UModal>
    </div>
  </UFormField>
</template>

<script lang="ts" setup>
import type { FormField } from '~/types'

const props = defineProps<{
  field: FormField
  modelValue: any
  error?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: any] }>()
const { t } = useI18n()

const objectValue = computed<Record<string, any>>(() => {
  return (props.modelValue && typeof props.modelValue === 'object' && !Array.isArray(props.modelValue))
    ? props.modelValue
    : {}
})
const arrayValue = computed<any[]>(() => Array.isArray(props.modelValue) ? props.modelValue : [])

const hasObjectValue = computed(() =>
  Object.values(objectValue.value).some(v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length))
)

const objectModalOpen = ref(false)
const objectDraft = reactive<Record<string, any>>({})

function openObjectModal() {
  for (const k of Object.keys(objectDraft)) delete objectDraft[k]
  Object.assign(objectDraft, JSON.parse(JSON.stringify(objectValue.value)))
  objectModalOpen.value = true
}
function saveObject() {
  emit('update:modelValue', JSON.parse(JSON.stringify(objectDraft)))
  objectModalOpen.value = false
}

const arrayModalOpen = ref(false)
const arrayDraft = reactive<Record<string, any>>({})
const arrayEditIndex = ref<number | null>(null)
const arrayModalTitle = computed(() =>
  arrayEditIndex.value === null ? t('common.newItem') : `${t('common.editItem')} #${arrayEditIndex.value + 1}`
)

function openAddItem() {
  for (const k of Object.keys(arrayDraft)) delete arrayDraft[k]
  arrayEditIndex.value = null
  arrayModalOpen.value = true
}
function openEditItem(i: number) {
  for (const k of Object.keys(arrayDraft)) delete arrayDraft[k]
  Object.assign(arrayDraft, JSON.parse(JSON.stringify(arrayValue.value[i] ?? {})))
  arrayEditIndex.value = i
  arrayModalOpen.value = true
}
function saveArrayItem() {
  const next = arrayValue.value.slice()
  const item = JSON.parse(JSON.stringify(arrayDraft))
  if (arrayEditIndex.value === null) next.push(item)
  else next[arrayEditIndex.value] = item
  emit('update:modelValue', next)
  arrayModalOpen.value = false
}
function removeArrayItem(i: number) {
  const next = arrayValue.value.slice()
  next.splice(i, 1)
  emit('update:modelValue', next)
}

function summarizeObject(f: FormField, v: any): string {
  if (!v || typeof v !== 'object') return ''
  const parts: string[] = []
  for (const child of f.fields ?? []) {
    const val = v[child.name]
    if (val === undefined || val === null || val === '') continue
    if (Array.isArray(val)) {
      if (val.length) parts.push(`${child.displayName || child.name}: ${val.length}`)
    } else if (typeof val === 'object') {
      parts.push(`${child.displayName || child.name}: …`)
    } else {
      parts.push(`${child.displayName || child.name}: ${val}`)
    }
    if (parts.length >= 3) break
  }
  return parts.join(' · ')
}
</script>
