<template>
  <div class="space-y-4">
    <UCard v-if="!section || section === 'details'">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <UFormField :label="t('forms.formTitle')" required>
          <UInput v-model="model.title" class="w-full" />
        </UFormField>
        <UFormField :label="t('forms.formDescription')">
          <UInput v-model="model.description" class="w-full" />
        </UFormField>
      </div>
    </UCard>

    <UCard v-if="!section || section === 'templates'">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold">{{ t('forms.templates') }}</h3>
        <UButton size="sm" variant="soft" icon="i-lucide-upload" @click="openTemplatePicker">
          {{ t('forms.uploadTemplate') }}
        </UButton>
      </div>
      <input
        ref="templateInputRef"
        type="file"
        multiple
        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;"
        @change="onTemplatesPicked"
      >
      <ul v-if="templates.length" class="divide-y divide-(--ui-border) rounded-(--ui-radius) border border-(--ui-border)">
        <li v-for="(f, i) in templates" :key="i" class="flex items-center justify-between px-3 py-2 text-sm">
          <div class="truncate">
            <UIcon name="i-lucide-file-text" class="mr-2 align-middle" />
            <span class="font-medium">{{ f.name }}</span>
            <span class="ml-2 text-(--ui-text-muted)">{{ formatBytes(f.size) }}</span>
          </div>
          <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" @click="removeTemplate(i)" />
        </li>
      </ul>
      <p v-else class="text-(--ui-text-muted) text-sm">{{ t('forms.noTemplates') }}</p>
    </UCard>

    <template v-if="!section || section === 'fields'">
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
        :can-move-up="i > 0"
        :can-move-down="i < model.fields.length - 1"
        @update:model-value="model.fields[i] = $event"
        @remove="model.fields.splice(i, 1)"
        @move-up="moveField(i, -1)"
        @move-down="moveField(i, 1)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import type { FormSchema, StoredFile } from '~/types'
import { newField } from '~/composables/useFieldTypes'
import FieldEditor from './FieldEditor.vue'

const props = defineProps<{
  modelValue: FormSchema
  section?: 'details' | 'templates' | 'fields'
}>()
const emit = defineEmits<{ 'update:modelValue': [v: FormSchema] }>()
const { t } = useI18n()

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function addField() {
  model.value.fields.push(newField())
}
function moveField(i: number, delta: number) {
  const arr = model.value.fields
  const j = i + delta
  if (j < 0 || j >= arr.length) return
  const [item] = arr.splice(i, 1)
  arr.splice(j, 0, item!)
}

const templateInputRef = ref<HTMLInputElement | null>(null)
const templates = computed<StoredFile[]>(() => model.value.templates ?? [])

function openTemplatePicker() {
  templateInputRef.value?.click()
}
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
async function onTemplatesPicked(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  const stored: StoredFile[] = []
  for (const f of picked) {
    stored.push({ name: f.name, type: f.type, size: f.size, dataUrl: await readAsDataUrl(f) })
  }
  model.value.templates = [...(model.value.templates ?? []), ...stored]
  input.value = ''
}
function removeTemplate(i: number) {
  if (!model.value.templates) return
  model.value.templates.splice(i, 1)
}
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
</script>
