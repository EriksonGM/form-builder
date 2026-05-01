<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('forms.newForm') }}</h1>
      <div class="flex gap-2">
        <UButton variant="ghost" to="/forms">{{ t('common.cancel') }}</UButton>
        <UButton icon="i-lucide-save" :loading="saving" @click="save">{{ t('common.save') }}</UButton>
      </div>
    </div>

    <UTabs v-model="activeTab" :items="tabs" class="w-full">
      <template #details>
        <SchemaEditor v-model="schema" section="details" />
      </template>
      <template #templates>
        <SchemaEditor v-model="schema" section="templates" />
      </template>
      <template #fields>
        <SchemaEditor v-model="schema" section="fields" />
      </template>
      <template #preview>
        <UCard>
          <FormRenderer :schema="schema" />
        </UCard>
      </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import type { FormSchema } from '~/types'
import SchemaEditor from '~/components/form-builder/SchemaEditor.vue'
import FormRenderer from '~/components/form-builder/FormRenderer.vue'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const saving = ref(false)
const activeTab = ref('details')

const schema = ref<FormSchema>({
  title: '',
  description: '',
  fields: []
})

const tabs = computed(() => [
  { label: t('forms.sections.details'), icon: 'i-lucide-info', slot: 'details', value: 'details' },
  { label: t('forms.sections.templates'), icon: 'i-lucide-file-text', slot: 'templates', value: 'templates' },
  { label: t('forms.sections.fields'), icon: 'i-lucide-list', slot: 'fields', value: 'fields' },
  { label: t('forms.sections.preview'), icon: 'i-lucide-eye', slot: 'preview', value: 'preview' }
])

async function save() {
  if (!schema.value.title) {
    toast.add({ title: t('forms.validationError'), color: 'error' })
    return
  }
  saving.value = true
  try {
    const created = await $fetch('/api/forms', {
      method: 'POST',
      body: {
        title: schema.value.title,
        description: schema.value.description,
        schema: schema.value
      }
    })
    toast.add({ title: t('forms.saved'), color: 'success' })
    router.push(`/forms/${(created as any).id}`)
  } finally {
    saving.value = false
  }
}
</script>
