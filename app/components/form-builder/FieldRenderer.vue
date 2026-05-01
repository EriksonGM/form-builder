<template>
  <UFormField :label="field.displayName || field.name" :required="field.required" :error="errorMessage">
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

    <div v-else-if="field.type === 'file'" class="w-full space-y-2">
      <input
        ref="fileInputRef"
        type="file"
        style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;"
        :multiple="field.max == null || field.max > 1"
        :accept="fileAccept"
        @change="onFilesPicked"
      >
      <UButton size="sm" variant="soft" icon="i-lucide-upload" @click="openFilePicker">
        {{ t('common.chooseFile') }}
      </UButton>
      <ul v-if="fileValue.length" class="divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
        <li v-for="(f, i) in fileValue" :key="i" class="flex items-center justify-between px-3 py-2 text-sm">
          <div class="truncate">
            <span class="font-medium">{{ f.name }}</span>
            <span class="ml-2 text-(--ui-text-muted)">{{ formatBytes(f.size) }}</span>
          </div>
          <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeFile(i)" />
        </li>
      </ul>
    </div>

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
import type { FormField, StoredFile } from '~/types'

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

const fileInputRef = ref<HTMLInputElement | null>(null)
const fileValue = computed<StoredFile[]>(() => Array.isArray(props.modelValue) ? props.modelValue : [])
const fileAccept = computed(() => {
  const p = props.field.pattern
  if (!p) return undefined
  const exts = p.match(/[a-zA-Z0-9]+/g) ?? []
  if (!exts.length) return undefined
  return exts.map(e => '.' + e.toLowerCase()).join(',')
})

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
function openFilePicker() {
  fileInputRef.value?.click()
}
async function onFilesPicked(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  const stored: StoredFile[] = []
  for (const f of picked) {
    stored.push({ name: f.name, type: f.type, size: f.size, dataUrl: await readAsDataUrl(f) })
  }
  const next = [...fileValue.value, ...stored]
  const max = props.field.max
  const trimmed = max != null ? next.slice(0, max) : next
  emit('update:modelValue', trimmed)
  input.value = ''
}
function removeFile(i: number) {
  const next = fileValue.value.slice()
  next.splice(i, 1)
  emit('update:modelValue', next)
}
const errorMessage = computed(() => translateError(props.error, props.field))

function translateError(err: string | undefined, f: FormField): string | undefined {
  if (!err) return undefined
  if (err.startsWith('child:')) {
    const rest = err.slice('child:'.length)
    const sep = rest.indexOf(':')
    if (sep === -1) return err
    const childName = rest.slice(0, sep)
    const childErr = rest.slice(sep + 1)
    const child = (f.fields ?? []).find(c => c.name === childName)
    const label = child?.displayName || child?.name || childName
    const inner = translateError(childErr, child ?? ({ ...f, fields: [] } as FormField))
    return `${label}: ${inner ?? ''}`
  }
  if (err === 'required') return t('errors.required')
  if (err === 'pattern') return t('errors.pattern')
  if (err === 'invalid') return t('errors.invalid')
  if (err.startsWith('min:')) {
    const n = err.slice(4)
    if (f.type === 'text' || f.type === 'textarea') return t('errors.minLength', { n })
    if (f.type === 'number') return t('errors.minValue', { n })
    if (f.type === 'array' || f.type === 'file') return t('errors.minCount', { n })
    return t('errors.min', { n })
  }
  if (err.startsWith('max:')) {
    const n = err.slice(4)
    if (f.type === 'text' || f.type === 'textarea') return t('errors.maxLength', { n })
    if (f.type === 'number') return t('errors.maxValue', { n })
    if (f.type === 'array' || f.type === 'file') return t('errors.maxCount', { n })
    return t('errors.max', { n })
  }
  return err
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
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
