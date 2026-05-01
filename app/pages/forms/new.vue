<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ t('forms.newForm') }}</h1>
      <div class="flex gap-2">
        <UButton variant="ghost" to="/forms">{{ t('common.cancel') }}</UButton>
        <UButton icon="i-lucide-save" :loading="saving" @click="save">{{ t('common.save') }}</UButton>
      </div>
    </div>

    <SchemaEditor v-model="schema" />

    <UCard>
      <template #header>
        <h3 class="font-semibold">{{ t('common.preview') }}</h3>
      </template>
      <FormRenderer :schema="schema" />
    </UCard>
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

const schema = ref<FormSchema>({
  title: '',
  description: '',
  fields: []
})

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
